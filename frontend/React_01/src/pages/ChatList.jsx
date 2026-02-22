import { MessageCircleMore } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const SWAP_EVENT_PREFIX = '__SWAP_EVENT__'

const formatTime = (timestamp) => {
  if (!timestamp) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

const getInitials = (name = 'U') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatPreviewMessage = (content) => {
  if (typeof content !== 'string') {
    return 'Start the conversation'
  }

  if (!content.startsWith(SWAP_EVENT_PREFIX)) {
    return content
  }

  try {
    const payload = JSON.parse(content.slice(SWAP_EVENT_PREFIX.length))
    if (payload?.kind === 'accepted') return 'Swap accepted'
    if (payload?.kind === 'rejected') return 'Swap rejected'
    return 'Swap proposed'
  } catch {
    return 'Swap update'
  }
}

function ChatList({ session, onOpenChat }) {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  const loadThreads = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId || !supabase) {
      setThreads([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data: chatRows, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (chatError) {
      console.error('Failed to fetch chats:', chatError)
      setThreads([])
      setLoading(false)
      return
    }

    if (!chatRows?.length) {
      setThreads([])
      setLoading(false)
      return
    }

    const counterpartIds = [
      ...new Set(chatRows.map((chat) => (chat.seller_id === userId ? chat.buyer_id : chat.seller_id)).filter(Boolean)),
    ]
    const listingIds = [...new Set(chatRows.map((chat) => chat.listing_id).filter(Boolean))]

    const [usersRes, listingsRes, messagesRes] = await Promise.all([
      counterpartIds.length
        ? supabase.from('users').select('id, username, avatar_url').in('id', counterpartIds)
        : Promise.resolve({ data: [] }),
      listingIds.length
        ? supabase.from('listings').select('id, title, price, image_url, ai_metadata').in('id', listingIds)
        : Promise.resolve({ data: [] }),
      supabase.from('messages').select('id, chat_id, content, created_at').in('chat_id', chatRows.map((chat) => chat.id)),
    ])

    if (usersRes.error) {
      console.error('Failed to fetch chat users:', usersRes.error)
    }
    if (listingsRes.error) {
      console.error('Failed to fetch chat listings:', listingsRes.error)
    }
    if (messagesRes.error) {
      console.error('Failed to fetch chat messages:', messagesRes.error)
    }

    const userMap = new Map((usersRes.data || []).map((row) => [row.id, row]))
    const listingMap = new Map((listingsRes.data || []).map((row) => [row.id, row]))

    const latestMessageByChat = new Map()
    ;(messagesRes.data || []).forEach((message) => {
      const existing = latestMessageByChat.get(message.chat_id)
      if (!existing || new Date(message.created_at) > new Date(existing.created_at)) {
        latestMessageByChat.set(message.chat_id, message)
      }
    })

    const threadRows = chatRows
      .map((chat) => {
        const counterpartId = chat.seller_id === userId ? chat.buyer_id : chat.seller_id
        const counterpart = userMap.get(counterpartId)
        const listing = listingMap.get(chat.listing_id) || null
        const latestMessage = latestMessageByChat.get(chat.id)
        const fallbackTime = chat.updated_at || chat.created_at

        return {
          chatId: chat.id,
          listingId: chat.listing_id,
          sellerId: chat.seller_id,
          buyerId: chat.buyer_id,
          source: 'list',
          counterpartName: counterpart?.username || 'Local User',
          counterpartInitials: getInitials(counterpart?.username || 'Local User'),
          listing,
          lastMessage: formatPreviewMessage(latestMessage?.content),
          lastMessageAt: latestMessage?.created_at || fallbackTime,
        }
      })
      .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))

    setThreads(threadRows)
    setLoading(false)
  }, [session])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadThreads()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadThreads])

  useEffect(() => {
    if (!session?.user?.id || !supabase) {
      return undefined
    }

    const chatsChannel = supabase
      .channel(`chat-list-chats-${session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, (payload) => {
        const newChat = payload.new
        if (newChat?.buyer_id === session.user.id || newChat?.seller_id === session.user.id) {
          loadThreads()
        }
      })
      .subscribe()

    const messagesChannel = supabase
      .channel(`chat-list-messages-${session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        loadThreads()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(chatsChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [loadThreads, session])

  const emptyState = useMemo(
    () => (
      <div className="mx-4 mt-4 rounded-2xl border border-[#dce7d8] bg-white px-4 py-6 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-700">No chats yet</p>
        <p className="mt-1 text-xs text-gray-500">Open an item and send a message to start chatting.</p>
      </div>
    ),
    []
  )

  if (loading) {
    return (
      <section className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-gray-500">Loading conversations...</p>
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col bg-[#f4f7f4]">
      <header className="border-b border-gray-200 bg-white/95 px-4 pb-3 pt-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e7f0e4] text-[var(--deep-olive)]">
            <MessageCircleMore size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Chats</p>
            <p className="text-xs text-gray-500">Your active conversations</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-4 pt-2">
        {!threads.length
          ? emptyState
          : threads.map((thread) => (
              <button
                key={thread.chatId}
                type="button"
                onClick={() => onOpenChat?.(thread)}
                className="mx-4 mt-2 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-[#dce7d8] bg-white px-3 py-3 text-left shadow-sm transition duration-150 hover:bg-[#f7faf7] active:scale-[0.99]"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#d9e5d6] text-sm font-semibold text-[var(--deep-olive)]">
                  {thread.counterpartInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-gray-800">{thread.counterpartName}</p>
                    <span className="shrink-0 text-[10px] text-gray-400">{formatTime(thread.lastMessageAt)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{thread.listing?.title || 'Listing unavailable'}</p>
                  <p className="mt-1 truncate text-xs text-gray-600">{thread.lastMessage}</p>
                </div>
              </button>
            ))}
      </div>
    </section>
  )
}

export default ChatList

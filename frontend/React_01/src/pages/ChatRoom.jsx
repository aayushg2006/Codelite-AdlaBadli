import { ArrowLeftRight, Check, MoreHorizontal, SendHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import FlatHeader from '../components/layout/FlatHeader'
import ChatBubble from '../components/ui/ChatBubble'
import { formatPriceINR } from '../lib/helpers'
import { supabase } from '../lib/supabaseClient'

const formatMessageTime = (timestamp) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))

const getInitials = (name = 'U') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

function ChatRoom({ session, chatSelection, onBack }) {
  const [chatRecord, setChatRecord] = useState(null)
  const [contextItem, setContextItem] = useState(chatSelection?.listing || null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [counterparty, setCounterparty] = useState({
    name: 'Loading...',
    initials: '--',
    status: 'Connecting...',
    id: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [myAvailableListings, setMyAvailableListings] = useState([])
  const [selectedOfferId, setSelectedOfferId] = useState('')
  const [incomingSwapRequests, setIncomingSwapRequests] = useState([])
  const [respondingRequestId, setRespondingRequestId] = useState(null)

  const scrollRef = useRef(null)
  const contactMenuRef = useRef(null)

  const userId = session?.user?.id
  const isSeller = useMemo(() => chatRecord?.seller_id === userId, [chatRecord, userId])

  useEffect(() => {
    if (!isContactMenuOpen) {
      return undefined
    }

    const handleOutsideClick = (event) => {
      if (contactMenuRef.current && !contactMenuRef.current.contains(event.target)) {
        setIsContactMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isContactMenuOpen])

  useEffect(() => {
    if (!chatRecord?.id || !userId || !supabase) {
      return undefined
    }

    const channel = supabase
      .channel(`chat-room-${chatRecord.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatRecord.id}`,
        },
        (payload) => {
          const row = payload.new
          setMessages((current) => {
            if (current.some((message) => message.id === row.id)) {
              return current
            }

            return [
              ...current,
              {
                id: row.id,
                sender: row.sender_id === userId ? 'me' : 'other',
                text: row.content,
                time: formatMessageTime(row.created_at),
              },
            ]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatRecord?.id, userId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  useEffect(() => {
    if (!userId || !chatSelection || !supabase) {
      return
    }

    let isMounted = true

    const initializeChat = async () => {
      if (isMounted) {
        setIsLoading(true)
      }

      let resolvedChat = null
      let resolvedListing = chatSelection.listing || null
      let sellerId = chatSelection.sellerId || chatSelection.user_id || null

      if (chatSelection.chatId) {
        const { data, error } = await supabase.from('chats').select('*').eq('id', chatSelection.chatId).maybeSingle()
        if (error || !data) {
          if (isMounted) {
            setIsLoading(false)
          }
          return
        }
        resolvedChat = data
        sellerId = data.seller_id
      } else {
        const listingId = chatSelection.listingId || chatSelection.id
        if (!listingId || !sellerId) {
          if (isMounted) {
            setIsLoading(false)
          }
          return
        }

        const { data: existingChat } = await supabase
          .from('chats')
          .select('*')
          .eq('listing_id', listingId)
          .eq('buyer_id', userId)
          .eq('seller_id', sellerId)
          .maybeSingle()

        if (existingChat) {
          resolvedChat = existingChat
        } else if (sellerId !== userId) {
          const { data: newChat, error: insertError } = await supabase
            .from('chats')
            .insert({
              listing_id: listingId,
              buyer_id: userId,
              seller_id: sellerId,
            })
            .select('*')
            .single()

          if (insertError) {
            console.error('Failed to create chat:', insertError)
            if (isMounted) {
              setIsLoading(false)
            }
            return
          }
          resolvedChat = newChat
        }
      }

      if (!resolvedChat) {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      if (!resolvedListing) {
        const { data: listingData } = await supabase
          .from('listings')
          .select('*')
          .eq('id', resolvedChat.listing_id)
          .maybeSingle()
        resolvedListing = listingData || null
      }

      const otherUserId = resolvedChat.seller_id === userId ? resolvedChat.buyer_id : resolvedChat.seller_id
      let otherUserName = 'Local User'
      if (otherUserId) {
        const { data: userRow } = await supabase
          .from('users')
          .select('id, username')
          .eq('id', otherUserId)
          .maybeSingle()
        if (userRow?.username) {
          otherUserName = userRow.username
        }
      }

      const { data: historyRows } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', resolvedChat.id)
        .order('created_at', { ascending: true })

      if (!isMounted) {
        return
      }

      setChatRecord(resolvedChat)
      setContextItem(resolvedListing)
      setCounterparty({
        id: otherUserId,
        name: otherUserName,
        initials: getInitials(otherUserName),
        status: 'Online',
      })
      setMessages(
        (historyRows || []).map((row) => ({
          id: row.id,
          sender: row.sender_id === userId ? 'me' : 'other',
          text: row.content,
          time: formatMessageTime(row.created_at),
        }))
      )
      setIsLoading(false)
    }

    initializeChat()

    return () => {
      isMounted = false
    }
  }, [chatSelection, userId])

  useEffect(() => {
    if (!isSwapModalOpen || !userId || !supabase) {
      return
    }

    supabase
      .from('listings')
      .select('id, title')
      .eq('user_id', userId)
      .neq('id', contextItem?.id || '')
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load listings for swap:', error)
          return
        }

        setMyAvailableListings(data || [])
        setSelectedOfferId((data || [])[0]?.id || '')
      })
  }, [isSwapModalOpen, userId, contextItem?.id])

  useEffect(() => {
    if (!isSeller || !userId || !contextItem?.id || !supabase) {
      setIncomingSwapRequests([])
      return
    }

    let isMounted = true

    const loadIncomingSwapRequests = async () => {
      const { data: requestRows, error: requestError } = await supabase
        .from('matches')
        .select('id, user_1_id, listing_1_id, listing_2_id, status, created_at')
        .eq('user_2_id', userId)
        .eq('listing_2_id', contextItem.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (requestError) {
        console.error('Failed to load incoming swap requests:', requestError)
        return
      }

      const requesterIds = [...new Set((requestRows || []).map((row) => row.user_1_id).filter(Boolean))]
      const offeredListingIds = [...new Set((requestRows || []).map((row) => row.listing_1_id).filter(Boolean))]

      const [usersRes, listingsRes] = await Promise.all([
        requesterIds.length
          ? supabase.from('users').select('id, username').in('id', requesterIds)
          : Promise.resolve({ data: [], error: null }),
        offeredListingIds.length
          ? supabase.from('listings').select('id, title, price, image_url, ai_metadata').in('id', offeredListingIds)
          : Promise.resolve({ data: [], error: null }),
      ])

      if (usersRes.error) {
        console.error('Failed to load requesters:', usersRes.error)
      }

      if (listingsRes.error) {
        console.error('Failed to load offered listings:', listingsRes.error)
      }

      const usersById = new Map((usersRes.data || []).map((row) => [row.id, row]))
      const listingsById = new Map((listingsRes.data || []).map((row) => [row.id, row]))

      const hydratedRequests = (requestRows || []).map((row) => ({
        id: row.id,
        requesterId: row.user_1_id,
        requesterName: usersById.get(row.user_1_id)?.username || 'Local User',
        offeredItem: listingsById.get(row.listing_1_id) || null,
      }))

      if (isMounted) {
        setIncomingSwapRequests(hydratedRequests)
      }
    }

    loadIncomingSwapRequests()

    return () => {
      isMounted = false
    }
  }, [isSeller, userId, contextItem?.id])

  const sendMessage = async () => {
    const text = draft.trim()
    if (!text || !chatRecord?.id || !userId || !supabase) {
      return
    }

    setDraft('')

    const { error } = await supabase.from('messages').insert({
      chat_id: chatRecord.id,
      sender_id: userId,
      content: text,
    })

    if (error) {
      alert(`Failed to send message: ${error.message}`)
      setDraft(text)
    }
  }

  const handleProposeSwapSubmit = async () => {
    if (!selectedOfferId || !session?.access_token || !contextItem?.id) {
      return
    }

    try {
      const res = await fetch('http://localhost:3000/api/swaps/propose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          desired_listing_id: contextItem.id,
          offered_listing_id: selectedOfferId,
        }),
      })

      const result = await res.json()

      if (res.ok) {
        alert('Swap request sent successfully.')
        setIsSwapModalOpen(false)
      } else {
        alert(result?.error || 'Failed to propose swap.')
      }
    } catch {
      alert('Network error occurred while proposing swap.')
    }
  }

  const handleRespondToSwapRequest = async (requestId, response) => {
    if (!requestId || !session?.access_token) {
      return
    }

    setRespondingRequestId(requestId)

    try {
      const res = await fetch(`http://localhost:3000/api/swaps/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ response }),
      })

      const result = await res.json()

      if (!res.ok) {
        alert(result?.error || 'Failed to respond to swap request.')
        return
      }

      setIncomingSwapRequests((current) => current.filter((item) => item.id !== requestId))
      alert(response === 'accept' ? 'Swap request accepted.' : 'Swap request rejected.')
    } catch {
      alert('Network error occurred while responding to swap request.')
    } finally {
      setRespondingRequestId(null)
    }
  }

  if (!chatSelection) {
    return (
      <section className="flex h-full items-center justify-center px-6 text-center">
        <p className="text-sm text-gray-500">Open a conversation from Home or Chat list.</p>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="flex h-full items-center justify-center px-6 text-center">
        <p className="text-sm text-gray-500">Opening chat...</p>
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col bg-white">
      <FlatHeader
        onBack={onBack}
        name={counterparty.name}
        status={counterparty.status}
        initials={counterparty.initials}
        rightSlot={
          <div ref={contactMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsContactMenuOpen((current) => !current)}
              className="rounded-full p-2 text-gray-500 transition duration-150 hover:bg-gray-100 active:scale-95"
              aria-label="Conversation options"
            >
              <MoreHorizontal size={17} />
            </button>
            {isContactMenuOpen ? (
              <div className="absolute right-0 top-10 z-30 w-52 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Conversation</p>
                <p className="mt-1.5 text-xs text-gray-700">User: {counterparty.name}</p>
                <p className="mt-1 text-xs text-gray-500">Chat ID: {chatRecord?.id}</p>
              </div>
            ) : null}
          </div>
        }
      />

      <div className="mx-4 mt-3 rounded-2xl border border-[#d7e4d3] bg-white p-3 shadow-sm">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">Context</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-100">
            {contextItem?.ai_metadata?.imageUrl || contextItem?.image_url ? (
              <img
                src={contextItem.ai_metadata?.imageUrl || contextItem.image_url}
                alt={contextItem?.title || 'Listing'}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-800">{contextItem?.title || 'Listing'}</p>
            <p className="text-xs text-gray-500">{formatPriceINR(contextItem?.price || 0)}</p>
          </div>
        </div>

        {!isSeller ? (
          <button
            type="button"
            onClick={() => setIsSwapModalOpen(true)}
            className="mt-3 w-full rounded-xl bg-[var(--earth-olive)] py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition duration-150 hover:bg-[var(--deep-olive)] active:scale-95"
          >
            Propose
          </button>
        ) : incomingSwapRequests.length ? (
          <div className="mt-3 space-y-2">
            {incomingSwapRequests.map((request) => (
              <article key={request.id} className="rounded-2xl border border-[#d8e5d4] bg-white p-3 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Incoming Swap Request</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">{request.requesterName}</p>

                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl bg-[#f5f8f4] p-2">
                  <div className="rounded-lg border border-[#dfe9dc] bg-white p-2 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Offer</p>
                    <p className="mt-1 truncate text-xs font-semibold text-gray-700">
                      {request.offeredItem?.title || 'Item'}
                    </p>
                  </div>

                  <ArrowLeftRight size={16} className="text-gray-500" />

                  <div className="rounded-lg border border-[#dfe9dc] bg-white p-2 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Your Item</p>
                    <p className="mt-1 truncate text-xs font-semibold text-gray-700">{contextItem?.title || 'Item'}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRespondToSwapRequest(request.id, 'accept')}
                    disabled={respondingRequestId === request.id}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#6b925f] px-3 py-2 text-xs font-semibold text-white shadow-sm transition duration-150 hover:bg-[var(--deep-olive)] disabled:opacity-60"
                  >
                    <Check size={14} />
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondToSwapRequest(request.id, 'reject')}
                    disabled={respondingRequestId === request.id}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#e1d2d2] bg-white px-3 py-2 text-xs font-semibold text-[#9b4d4d] shadow-sm transition duration-150 hover:bg-[#fff5f5] disabled:opacity-60"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-xl bg-[#f3f6f3] px-3 py-2 text-xs text-gray-600">
            No pending swap requests for this item yet.
          </p>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 pb-3 pt-3">
        {messages.length === 0 ? <p className="text-center text-xs text-gray-400">Start the conversation!</p> : null}
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </div>

      <div className="border-t border-gray-200 bg-[#f4f7f4]/95 px-3 pb-3 pt-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                sendMessage()
              }
            }}
            className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--earth-olive)] focus:ring-2 focus:ring-[#dce8d8]"
            placeholder="Write a message..."
          />
          <button
            type="button"
            onClick={sendMessage}
            className="grid h-11 w-11 place-items-center rounded-full bg-[var(--earth-olive)] text-white shadow-sm transition duration-150 hover:bg-[var(--deep-olive)] active:scale-95"
            aria-label="Send message"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      </div>

      {isSwapModalOpen ? (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-black/35 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsSwapModalOpen(false)
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Propose Swap</h3>
            <p className="mt-1 text-sm text-gray-600">Choose an item from your listings and send a direct request.</p>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-gray-500">Listed Items</label>

            <select
              value={selectedOfferId}
              onChange={(event) => setSelectedOfferId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm"
            >
              {!myAvailableListings.length ? <option value="">You have no active listings</option> : null}
              {myAvailableListings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl bg-[#f5f8f4] p-2">
              <div className="rounded-lg border border-[#dfe9dc] bg-white p-2 text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Sell</p>
                <p className="mt-1 truncate text-xs font-semibold text-gray-700">{contextItem?.title || 'Selected item'}</p>
              </div>

              <ArrowLeftRight size={16} className="text-gray-500" />

              <div className="rounded-lg border border-[#dfe9dc] bg-white p-2 text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Give</p>
                <p className="mt-1 truncate text-xs font-semibold text-gray-700">
                  {myAvailableListings.find((item) => item.id === selectedOfferId)?.title || 'Pick your item'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                className="rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-600 transition duration-150 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProposeSwapSubmit}
                disabled={!selectedOfferId}
                className="rounded-lg bg-[var(--earth-olive)] py-2 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--deep-olive)] disabled:opacity-50"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default ChatRoom

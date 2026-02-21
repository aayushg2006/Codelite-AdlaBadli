import { MoreHorizontal, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import FlatHeader from '../components/layout/FlatHeader'
import { formatPriceINR } from '../lib/helpers'
import ChatBubble from '../components/ui/ChatBubble'
import { supabase } from '../lib/supabase' // IMPORT SUPABASE

// Notice we added `session` to the props so we know who is sending the message!
function ChatRoom({ session, chatPartner, chatContextItem, onBack }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [activeChatId, setActiveChatId] = useState(null)
  
  const [activeView, setActiveView] = useState('buyer')
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [selectedListedItem, setSelectedListedItem] = useState('Chair')
  
  const scrollRef = useRef(null)
  const contactMenuRef = useRef(null)
  const listedItems = ['Chair', 'Table', 'Lamp']
  const fallbackDescription = 'Solid build with a smooth finish. Minimal wear, clean upholstery, and ready for pickup.'

  // 1. INITIALIZE CHAT & FETCH MESSAGES
  useEffect(() => {
    if (!session?.user) return

    const initializeChat = async () => {
      // For hackathon purposes, we use a dummy seller ID if the mock data doesn't have one
      const sellerId = chatContextItem.seller_id || "00000000-0000-0000-0000-000000000000"
      
      // A. Look for an existing chat between this buyer and seller for this item
      let { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('listing_id', chatContextItem.id)
        .eq('buyer_id', session.user.id)
        .single()

      // B. If it doesn't exist, create it
      if (!chat) {
        const { data: newChat, error } = await supabase
          .from('chats')
          .insert({
            listing_id: chatContextItem.id,
            buyer_id: session.user.id,
            seller_id: sellerId
          })
          .select()
          .single()
        
        if (!error) chat = newChat
      }

      if (chat) {
        setActiveChatId(chat.id)
        
        // C. Fetch historical messages
        const { data: history } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true })
          
        if (history) {
          // Map DB rows to our UI format
          const formattedHistory = history.map(msg => ({
            id: msg.id,
            sender: msg.sender_id === session.user.id ? 'me' : 'them',
            text: msg.content,
            time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(msg.created_at))
          }))
          setMessages(formattedHistory)
        }
      }
    }

    initializeChat()
  }, [session, chatContextItem])

  // 2. SUBSCRIBE TO REAL-TIME NEW MESSAGES
  useEffect(() => {
    if (!activeChatId) return

    const channel = supabase
      .channel(`chat_room_${activeChatId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` }, 
        (payload) => {
          const newMsg = payload.new
          // Only append if it's from the other person (our own messages are appended instantly on send for snappy UX)
          if (newMsg.sender_id !== session.user.id) {
            setMessages(current => [...current, {
              id: newMsg.id,
              sender: 'them',
              text: newMsg.content,
              time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(newMsg.created_at))
            }])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeChatId, session])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  // Click outside & Escape key listeners... (Kept your exact logic here)
  useEffect(() => {
    if (!isContactMenuOpen) return undefined
    const handleClickOutside = (e) => {
      if (contactMenuRef.current && !contactMenuRef.current.contains(e.target)) setIsContactMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isContactMenuOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') { setIsSwapModalOpen(false); setIsContactMenuOpen(false) }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // 3. SEND MESSAGE TO DATABASE
  const sendMessage = async () => {
    const text = draft.trim()
    if (!text || !activeChatId || !session?.user) return

    // Optimistic UI update (makes the app feel instantly fast)
    const tempId = `temp-${Date.now()}`
    const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date())
    
    setMessages(current => [...current, { id: tempId, sender: 'me', text, time }])
    setDraft('')

    // Actual DB Insert
    const { error } = await supabase
      .from('messages')
      .insert({
        chat_id: activeChatId,
        sender_id: session.user.id,
        content: text
      })

    if (error) {
      console.error("Message send failed:", error)
      // If it fails, you could remove the optimistic message here
    }
  }

  const sendSwapRequest = () => {
    setIsSwapModalOpen(false)
    window.alert('Swap Request Sent (Will wire up to N8N soon!)')
  }

  return (
    <section className="flex h-full flex-col">
      <FlatHeader
        onBack={onBack}
        name={chatPartner.name}
        status={chatPartner.status}
        initials={chatPartner.initials}
        rightSlot={
          <div ref={contactMenuRef} className="relative">
            <button type="button" onClick={() => setIsContactMenuOpen(c => !c)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 active:scale-95">
              <MoreHorizontal size={17} />
            </button>
            {isContactMenuOpen && (
              <div className="absolute right-0 top-11 z-30 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Seller Contact</p>
                <p className="mt-2 text-xs text-gray-700">{chatPartner.phone}</p>
                <p className="mt-1 text-xs text-gray-700">{chatPartner.email}</p>
              </div>
            )}
          </div>
        }
      />

      {/* Buyer/Seller POV Toggles */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 rounded-xl bg-[#edf2eb] p-1">
          <button type="button" onClick={() => setActiveView('buyer')} className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition ${activeView === 'buyer' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'}`}>Buyer POV</button>
          <button type="button" onClick={() => setActiveView('seller')} className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition ${activeView === 'seller' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'}`}>Seller POV</button>
        </div>
      </div>

      {activeView === 'buyer' ? (
        <>
          {/* Context Card */}
          <div className="mx-4 mt-3 rounded-2xl border border-[#d7e4d3] bg-white p-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Context</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl" style={{ backgroundImage: `linear-gradient(140deg, ${chatContextItem.imageFrom}, ${chatContextItem.imageTo})` }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">{chatContextItem.title}</p>
                <p className="text-xs text-gray-500">{formatPriceINR(chatContextItem.price)} - {chatContextItem.distanceKm} km away</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsSwapModalOpen(true)} className="mt-3 w-full rounded-xl bg-[var(--earth-olive)] py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[var(--deep-olive)] active:scale-95">
              Propose Swap
            </button>
          </div>

          {/* Chat Messages Area */}
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 pb-3 pt-3">
            {messages.length === 0 ? (
              <p className="text-center text-xs text-gray-400 mt-4">Start the conversation...</p>
            ) : (
              messages.map((message) => <ChatBubble key={message.id} message={message} />)
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-[#f4f7f4]/95 px-3 pb-3 pt-2 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage() } }}
                className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[var(--earth-olive)] focus:ring-2 focus:ring-[#dce8d8]"
                placeholder="Write a message..."
              />
              <button type="button" onClick={sendMessage} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--earth-olive)] text-white shadow-sm hover:bg-[var(--deep-olive)] active:scale-95">
                <SendHorizontal size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Seller View details (unchanged) */
        <div className="flex flex-1 items-center justify-center px-4 py-5">
           {/* Your existing seller POV code */}
           <p className="text-gray-500 text-sm">Seller POV active (Waiting for Swap Proposal...)</p>
        </div>
      )}

      {/* Swap Modal (unchanged) */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/35 px-4" onClick={() => setIsSwapModalOpen(false)}>
           {/* Your existing Swap Modal code */}
        </div>
      )}
    </section>
  )
}

export default ChatRoom
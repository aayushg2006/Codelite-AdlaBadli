import { MoreHorizontal, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import FlatHeader from '../components/layout/FlatHeader'
import { formatPriceINR } from '../lib/helpers'
import ChatBubble from '../components/ui/ChatBubble'
import { supabase } from '../lib/supabaseClient' 

function ChatRoom({ session, chatPartner, chatContextItem, onBack }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [activeChatId, setActiveChatId] = useState(null)
  
  const [activeView, setActiveView] = useState('buyer')
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  
  // Real Swap States
  const [myAvailableListings, setMyAvailableListings] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState('');

  const scrollRef = useRef(null)
  const contactMenuRef = useRef(null)

  // 1. INITIALIZE CHAT
  useEffect(() => {
    if (!session?.user) return;

    const initializeChat = async () => {
      const safeListingId = chatContextItem?.id || "00000000-0000-0000-0000-000000000001";
      const sellerId = chatContextItem?.seller_id || session.user.id;
      
      let { data: chat, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('listing_id', safeListingId)
        .eq('buyer_id', session.user.id)
        .single()

      if (!chat) {
        const { data: newChat } = await supabase
          .from('chats')
          .insert({ listing_id: safeListingId, buyer_id: session.user.id, seller_id: sellerId })
          .select()
          .single()
        chat = newChat;
      }

      if (chat) {
        setActiveChatId(chat.id)
        const { data: history } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true })
          
        if (history) {
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

  // 2. FETCH USER LISTINGS FOR SWAP
  useEffect(() => {
    if (isSwapModalOpen && session?.user) {
      supabase.from('listings')
        .select('id, title')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .then(({ data }) => {
          if (data) {
            setMyAvailableListings(data);
            if (data.length > 0) setSelectedOfferId(data[0].id);
          }
        });
    }
  }, [isSwapModalOpen, session]);

  // 3. SUBSCRIBE TO REAL-TIME MESSAGES
  useEffect(() => {
    if (!activeChatId) return

    const channel = supabase
      .channel(`chat_room_${activeChatId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` }, 
        (payload) => {
          const newMsg = payload.new
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

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // 4. SEND MESSAGE
  const sendMessage = async () => {
    const text = draft.trim()
    if (!text || !session?.user || !activeChatId) return;

    const tempId = `temp-${Date.now()}`
    const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date())
    
    setMessages(current => [...current, { id: tempId, sender: 'me', text, time }])
    setDraft('')

    await supabase.from('messages').insert({
        chat_id: activeChatId,
        sender_id: session.user.id,
        content: text
    })
  }

  // 5. PROPOSE SWAP ACTION
  const handleProposeSwapSubmit = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/swaps/propose', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          desired_listing_id: chatContextItem.id || '00000000-0000-0000-0000-000000000001',
          offered_listing_id: selectedOfferId
        })
      });
      
      if (res.ok) {
        alert("Swap proposed successfully! Waiting for seller to accept.");
        setIsSwapModalOpen(false);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to propose swap.");
      }
    } catch (err) {
      alert("Network error occurred.");
    }
  };

  return (
    <section className="flex h-full flex-col bg-white">
      <FlatHeader
        onBack={onBack}
        name={chatPartner?.name || 'Local User'}
        status={chatPartner?.status || 'Online'}
        initials={chatPartner?.initials || 'U'}
        rightSlot={
          <div ref={contactMenuRef} className="relative">
            <button type="button" onClick={() => setIsContactMenuOpen(c => !c)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
              <MoreHorizontal size={17} />
            </button>
          </div>
        }
      />

      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 rounded-xl bg-[#edf2eb] p-1">
          <button type="button" onClick={() => setActiveView('buyer')} className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition ${activeView === 'buyer' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'}`}>Buyer POV</button>
          <button type="button" onClick={() => setActiveView('seller')} className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition ${activeView === 'seller' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'}`}>Seller POV</button>
        </div>
      </div>

      {activeView === 'buyer' ? (
        <>
          <div className="mx-4 mt-3 rounded-2xl border border-[#d7e4d3] bg-white p-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Context</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gray-200" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">{chatContextItem?.title || 'Unknown Item'}</p>
                <p className="text-xs text-gray-500">{formatPriceINR(chatContextItem?.price || 0)}</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsSwapModalOpen(true)} className="mt-3 w-full rounded-xl bg-[var(--earth-olive)] py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[var(--deep-olive)]">
              Propose Swap
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 pb-3 pt-3">
            {messages.map((message) => <ChatBubble key={message.id} message={message} />)}
          </div>

          <div className="border-t border-gray-200 bg-[#f4f7f4] px-3 pb-3 pt-2">
            <div className="flex items-center gap-2">
              <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }} className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm" placeholder="Write a message..." />
              <button type="button" onClick={sendMessage} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--earth-olive)] text-white">
                <SendHorizontal size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center"><p className="text-sm text-gray-500">Seller POV Active</p></div>
      )}

      {isSwapModalOpen && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/35 px-4" onClick={(e) => { if(e.target === e.currentTarget) setIsSwapModalOpen(false) }}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Propose a Swap</h3>
            <p className="text-sm text-gray-600 mb-2">Select one of your active items to trade.</p>
            
            <select value={selectedOfferId} onChange={(e) => setSelectedOfferId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mb-4 text-sm bg-white">
              {myAvailableListings.length === 0 && <option value="">You have no active listings</option>}
              {myAvailableListings.map(item => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button onClick={() => setIsSwapModalOpen(false)} className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleProposeSwapSubmit} disabled={!selectedOfferId} className="flex-1 py-2 text-sm font-semibold text-white bg-[var(--earth-olive)] rounded-lg disabled:opacity-50">
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ChatRoom
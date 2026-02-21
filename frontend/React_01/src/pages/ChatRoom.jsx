import { MoreHorizontal, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import FlatHeader from '../components/layout/FlatHeader'
import { formatPriceINR } from '../lib/helpers'
import ChatBubble from '../components/ui/ChatBubble'

function ChatRoom({ initialMessages, chatPartner, chatContextItem, onBack }) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [activeView, setActiveView] = useState('buyer')
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [selectedListedItem, setSelectedListedItem] = useState('Chair')
  const scrollRef = useRef(null)
  const contactMenuRef = useRef(null)
  const listedItems = ['Chair', 'Table', 'Lamp']
  const fallbackDescription =
    'Solid build with a smooth finish. Minimal wear, clean upholstery, and ready for immediate pickup.'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  useEffect(() => {
    if (!isContactMenuOpen) {
      return undefined
    }

    const handleClickOutside = (event) => {
      if (contactMenuRef.current && !contactMenuRef.current.contains(event.target)) {
        setIsContactMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isContactMenuOpen])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSwapModalOpen(false)
        setIsContactMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const sendMessage = () => {
    const text = draft.trim()
    if (!text) {
      return
    }

    const time = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date())

    setMessages((current) => [
      ...current,
      {
        id: `msg-${Date.now()}`,
        sender: 'me',
        text,
        time,
      },
    ])
    setDraft('')
  }

  const sendSwapRequest = () => {
    setIsSwapModalOpen(false)
    window.alert('Swap Request Sent')
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
            <button
              type="button"
              onClick={() => setIsContactMenuOpen((current) => !current)}
              className="rounded-full p-2 text-gray-500 transition duration-150 hover:bg-gray-100 active:scale-95"
              aria-label="More options"
            >
              <MoreHorizontal size={17} />
            </button>
            {isContactMenuOpen ? (
              <div className="absolute right-0 top-11 z-30 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Seller Contact</p>
                <p className="mt-2 text-xs text-gray-700">{chatPartner.phone}</p>
                <p className="mt-1 text-xs text-gray-700">{chatPartner.email}</p>
              </div>
            ) : null}
          </div>
        }
      />

      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 rounded-xl bg-[#edf2eb] p-1">
          <button
            type="button"
            onClick={() => setActiveView('buyer')}
            className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeView === 'buyer' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'
            }`}
          >
            Buyer POV
          </button>
          <button
            type="button"
            onClick={() => setActiveView('seller')}
            className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeView === 'seller' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'
            }`}
          >
            Seller POV
          </button>
        </div>
      </div>

      {activeView === 'buyer' ? (
        <>
          <div className="mx-4 mt-3 rounded-2xl border border-[#d7e4d3] bg-white p-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Context</p>
            <div className="mt-2 flex items-center gap-3">
              <div
                className="h-14 w-14 rounded-xl"
                style={{
                  backgroundImage: `linear-gradient(140deg, ${chatContextItem.imageFrom}, ${chatContextItem.imageTo})`,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">{chatContextItem.title}</p>
                <p className="text-xs text-gray-500">
                  {formatPriceINR(chatContextItem.price)} - {chatContextItem.distanceKm} km away
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-[#f3f6f3] p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Product Description</p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                {chatContextItem.description || fallbackDescription}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSwapModalOpen(true)}
              className="mt-3 w-full rounded-xl bg-[var(--earth-olive)] py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition duration-150 hover:bg-[var(--deep-olive)] active:scale-95"
            >
              Propose
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 pb-3 pt-3">
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
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-4 py-5">
          <article className="w-full max-w-sm rounded-2xl border border-[#d7e4d3] bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Incoming Swap Request</p>
            <h2 className="mt-2 text-lg font-semibold text-gray-800">Neha Kapoor</h2>

            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-xl border border-gray-200 bg-[#f6f8f6] p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Buyer Offers</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">Indoor Herb Rack</p>
              </div>

              <span className="self-center text-lg text-gray-500">{'\u2192'}</span>

              <div className="flex-1 rounded-xl border border-gray-200 bg-[#f6f8f6] p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Seller Item</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">{chatContextItem.title}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => window.alert('Swap Accepted')}
                className="rounded-xl border border-[#bfd0b8] bg-[#edf4ea] px-3 py-2 text-sm font-semibold text-[var(--deep-olive)] transition duration-150 hover:bg-[#e3efdf] active:scale-95"
              >
                {'\u2714'} Accept
              </button>
              <button
                type="button"
                onClick={() => window.alert('Swap Rejected')}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition duration-150 hover:bg-gray-50 active:scale-95"
              >
                {'\u2716'} Reject
              </button>
            </div>
          </article>
        </div>
      )}

      {isSwapModalOpen ? (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-black/35 px-4"
          onClick={() => setIsSwapModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Propose Swap"
            className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900">Propose Swap</h2>

            <label className="mt-3 block">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Listed Items</p>
              <select
                value={selectedListedItem}
                onChange={(event) => setSelectedListedItem(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--earth-olive)] focus:ring-2 focus:ring-[#dce8d8]"
              >
                {listedItems.map((itemName) => (
                  <option key={itemName} value={itemName}>
                    {itemName}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-xl border border-gray-200 bg-[#f7faf7] p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Sell</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">{chatContextItem.title}</p>
              </div>

              <span className="self-center text-lg text-gray-500">{'\u21C4'}</span>

              <div className="flex-1 rounded-xl border border-gray-200 bg-[#f7faf7] p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Give</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">{selectedListedItem}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={sendSwapRequest}
              className="mt-4 w-full rounded-xl bg-[#6d8f65] py-2.5 text-sm font-semibold text-white transition duration-150 hover:bg-[#5e8056] active:scale-95"
            >
              Send Request
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default ChatRoom

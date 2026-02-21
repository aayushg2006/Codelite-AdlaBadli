import { MoreHorizontal, Phone, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import FlatHeader from '../components/layout/FlatHeader'
import { formatPriceINR } from '../lib/helpers'
import ChatBubble from '../components/ui/ChatBubble'

function ChatRoom({ initialMessages, chatPartner, chatContextItem, onBack }) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

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

  return (
    <section className="flex h-full flex-col">
      <FlatHeader
        onBack={onBack}
        name={chatPartner.name}
        status={chatPartner.status}
        initials={chatPartner.initials}
        rightSlot={
          <>
            <button
              type="button"
              className="rounded-full p-2 text-gray-500 transition duration-150 hover:bg-gray-100 active:scale-95"
              aria-label="Voice call"
            >
              <Phone size={17} />
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-gray-500 transition duration-150 hover:bg-gray-100 active:scale-95"
              aria-label="More options"
            >
              <MoreHorizontal size={17} />
            </button>
          </>
        }
      />

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
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-xl border border-[#bfd0b8] py-2 text-xs font-semibold uppercase tracking-wider text-[var(--deep-olive)] transition duration-150 hover:bg-[#edf4ea] active:scale-95"
          >
            Mark Sold
          </button>
          <button
            type="button"
            className="rounded-xl bg-[var(--earth-olive)] py-2 text-xs font-semibold uppercase tracking-wider text-white transition duration-150 hover:bg-[var(--deep-olive)] active:scale-95"
          >
            Propose Swap
          </button>
        </div>
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
            placeholder="Write a thoughtful message..."
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
    </section>
  )
}

export default ChatRoom

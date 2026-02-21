import { MoreHorizontal, Phone, SendHorizontal, X, Check, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import FlatHeader from '../components/layout/FlatHeader'
import ChatBubble from '../components/ui/ChatBubble'

// Mock data – replace with props/API later
const currentUser = { id: 'u1', name: 'Arjun' }
const item = {
  id: 'item1',
  title: 'Ceramic Planter Set',
  ownerId: 'u2',
  price: 1850,
  description: 'Solid build.',
}

const MY_OFFERABLE_ITEMS = [
  { id: 'o1', title: 'Indoor Herb Rack', price: 1200 },
  { id: 'o2', title: 'Wooden Bookshelf', price: 2400 },
  { id: 'o3', title: 'Desk Lamp', price: 650 },
]

function ChatRoom({ initialMessages, chatPartner, chatContextItem, onBack }) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  const [swapRequest, setSwapRequest] = useState({
    id: 'swap1',
    itemId: 'item1',
    buyerId: 'u1',
    sellerId: 'u2',
    offeredItem: 'Indoor Herb Rack',
    offeredItemId: 'o1',
    status: 'PENDING',
  }) // PENDING | ACCEPTED | REJECTED | null – set to null to test "no request" seller view

  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [selectedOfferedItem, setSelectedOfferedItem] = useState(MY_OFFERABLE_ITEMS[0] || null)

  const isBuyer = currentUser.id !== item.ownerId
  const isSeller = currentUser.id === item.ownerId
  const hasPendingSwap = swapRequest?.status === 'PENDING'

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
    if (!text) return
    const time = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date())
    setMessages((current) => [
      ...current,
      { id: `msg-${Date.now()}`, sender: 'me', text, time },
    ])
    setDraft('')
  }

  const handleSendSwapRequest = async () => {
    if (!selectedOfferedItem) return
    setSwapRequest({
      id: `swap-${Date.now()}`,
      itemId: item.id,
      buyerId: currentUser.id,
      sellerId: item.ownerId,
      offeredItem: selectedOfferedItem.title,
      offeredItemId: selectedOfferedItem.id,
      status: 'PENDING',
    })
    setSwapModalOpen(false)
    // TODO: wire to backend POST /api/swaps/propose
  }

  const handleAcceptSwap = async () => {
    setSwapRequest((prev) => (prev ? { ...prev, status: 'ACCEPTED' } : prev))
    // TODO: wire to backend PUT /api/swaps/:id/respond { response: 'accept' }
  }

  const handleRejectSwap = async () => {
    setSwapRequest((prev) => (prev ? { ...prev, status: 'REJECTED' } : prev))
    // TODO: wire to backend PUT /api/swaps/:id/respond { response: 'reject' }
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

      {/* Context card: item being discussed */}
      <div className="mx-4 mt-3 rounded-2xl border border-[#d7e4d3] bg-white p-3 shadow-sm">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">Context</p>
        <div className="mt-2 flex items-center gap-3">
          <div
            className="h-14 w-14 shrink-0 rounded-xl bg-gray-100"
            style={
              chatContextItem?.imageFrom
                ? {
                    backgroundImage: `linear-gradient(140deg, ${chatContextItem.imageFrom}, ${chatContextItem.imageTo})`,
                  }
                : undefined
            }
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-800">{item.title}</p>
            <p className="text-xs text-gray-500">
              ₹{item.price} • {item.description}
            </p>
          </div>
        </div>

        {/* Role-based swap UI */}
        <div className="mt-3 space-y-3">
          {/* Buyer: show Propose Swap only */}
          {isBuyer && (
            <>
              {!swapRequest || swapRequest.status !== 'PENDING' ? (
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(true)}
                  className="w-full rounded-xl bg-[var(--earth-olive)] py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition duration-150 hover:bg-[var(--deep-olive)] active:scale-[0.98]"
                >
                  Propose Swap
                </button>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
                  Swap request sent • Waiting for response
                </div>
              )}
            </>
          )}

          {/* Seller: show comparison + Accept/Reject when PENDING */}
          {isSeller && (
            <>
              {hasPendingSwap && (
                <div className="rounded-xl border border-[#d7e4d3] bg-[#f8faf8] p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Swap request
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 rounded-lg border border-[#bfd0b8] bg-white p-2 text-center">
                      <p className="truncate text-xs font-medium text-gray-800">
                        {swapRequest.offeredItem}
                      </p>
                      <p className="text-[10px] text-gray-500">Their item</p>
                    </div>
                    <span className="shrink-0 text-gray-400">→</span>
                    <div className="min-w-0 flex-1 rounded-lg border border-[#bfd0b8] bg-white p-2 text-center">
                      <p className="truncate text-xs font-medium text-gray-800">{item.title}</p>
                      <p className="text-[10px] text-gray-500">Your item</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleRejectSwap}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 active:scale-[0.98]"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={handleAcceptSwap}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--earth-olive)] py-2 text-xs font-semibold text-white transition hover:bg-[var(--deep-olive)] active:scale-[0.98]"
                    >
                      <Check size={14} /> Accept
                    </button>
                  </div>
                </div>
              )}
              {isSeller && !hasPendingSwap && (
                <button
                  type="button"
                  className="rounded-xl border border-[#bfd0b8] py-2 text-xs font-semibold uppercase tracking-wider text-[var(--deep-olive)] transition duration-150 hover:bg-[#edf4ea] active:scale-95"
                >
                  Mark Sold
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Propose Swap Modal (Buyer only) */}
      {swapModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setSwapModalOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSwapModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="swap-modal-title"
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 id="swap-modal-title" className="text-sm font-semibold text-gray-800">
                Propose Swap
              </h2>
              <button
                type="button"
                onClick={() => setSwapModalOpen(false)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Your item to offer
                </span>
                <select
                  value={selectedOfferedItem?.id ?? ''}
                  onChange={(e) => {
                    const chosen = MY_OFFERABLE_ITEMS.find((i) => i.id === e.target.value)
                    setSelectedOfferedItem(chosen ?? null)
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[var(--earth-olive)] focus:ring-2 focus:ring-[#dce8d8]"
                >
                  {MY_OFFERABLE_ITEMS.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title} (₹{i.price})
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Comparison
              </p>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1 rounded-xl border-2 border-[var(--earth-olive)] bg-[#f0f7ee] p-3 text-center">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {selectedOfferedItem?.title ?? '—'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    ₹{selectedOfferedItem?.price ?? '—'} • Your item
                  </p>
                </div>
                <span className="shrink-0 text-lg text-gray-400">→</span>
                <div className="min-w-0 flex-1 rounded-xl border border-[#bfd0b8] bg-white p-3 text-center">
                  <p className="truncate text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">₹{item.price} • Requested</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={handleSendSwapRequest}
                disabled={!selectedOfferedItem}
                className="w-full rounded-xl bg-[var(--earth-olive)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--deep-olive)] disabled:opacity-50 active:scale-[0.98]"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

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
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
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

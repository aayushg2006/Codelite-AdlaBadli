function ChatBubble({ message }) {
  const isSender = message.sender === 'me'
  const swapEvent = message.swapEvent || null

  if (swapEvent) {
    const statusTone =
      swapEvent.kind === 'accepted'
        ? 'text-green-700 bg-green-50 border-green-200'
        : swapEvent.kind === 'rejected'
        ? 'text-red-700 bg-red-50 border-red-200'
        : 'text-[var(--deep-olive)] bg-[#edf4ea] border-[#d8e5d4]'

    const statusLabel =
      swapEvent.kind === 'accepted' ? 'Accepted' : swapEvent.kind === 'rejected' ? 'Rejected' : 'Proposed'

    return (
      <div className="animate-message-in flex justify-center">
        <article className={`w-full max-w-[92%] rounded-2xl border px-3.5 py-3 shadow-sm ${statusTone}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wider">Swap {statusLabel}</p>
          <p className="mt-1 text-xs leading-relaxed">
            {swapEvent.actorName || 'User'} offered <span className="font-semibold">{swapEvent.offeredItemTitle || 'an item'}</span>{' '}
            for <span className="font-semibold">{swapEvent.desiredItemTitle || 'this listing'}</span>.
          </p>
          <p className="mt-2 text-[10px] opacity-70">{message.time}</p>
        </article>
      </div>
    )
  }

  return (
    <div className={`animate-message-in flex ${isSender ? 'justify-end' : 'justify-start'}`}>
      <article
        className={`max-w-[82%] px-3.5 py-2.5 shadow-sm ${
          isSender
            ? 'rounded-2xl rounded-br-sm bg-[var(--earth-olive)] text-white'
            : 'rounded-2xl rounded-bl-sm border border-gray-200 bg-white text-gray-700'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={`mt-1 text-[10px] ${isSender ? 'text-white/80' : 'text-gray-400'}`}>{message.time}</p>
      </article>
    </div>
  )
}

export default ChatBubble

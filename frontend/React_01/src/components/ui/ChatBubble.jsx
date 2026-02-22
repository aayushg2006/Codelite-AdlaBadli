function ChatBubble({ message }) {
  const isSender = message.sender === 'me'
  const swapEvent = message.swapEvent || null
  const rateEvent = message.rateEvent || null
  const dealEvent = message.dealEvent || null

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

  if (rateEvent) {
    return (
      <div className="animate-message-in flex justify-center">
        <article className="w-full max-w-[92%] rounded-2xl border border-[#d8e5d4] bg-[#f5faf3] px-3.5 py-3 shadow-sm text-[var(--deep-olive)]">
          <p className="text-[10px] font-semibold uppercase tracking-wider">Final Rate Confirmed</p>
          <p className="mt-1 text-xs leading-relaxed">
            {rateEvent.actorName || 'User'} confirmed <span className="font-semibold">₹{Number(rateEvent.amount || 0).toLocaleString('en-IN')}</span>.
          </p>
          <p className="mt-2 text-[10px] opacity-70">{message.time}</p>
        </article>
      </div>
    )
  }

  if (dealEvent) {
    return (
      <div className="animate-message-in flex justify-center">
        <article className="w-full max-w-[92%] rounded-2xl border border-blue-200 bg-blue-50 px-3.5 py-3 shadow-sm text-blue-800">
          <p className="text-[10px] font-semibold uppercase tracking-wider">Deal Closed</p>
          <p className="mt-1 text-xs leading-relaxed">
            {dealEvent.actorName || 'User'} marked <span className="font-semibold">{dealEvent.listingTitle || 'item'}</span> as sold for{' '}
            <span className="font-semibold">₹{Number(dealEvent.amount || 0).toLocaleString('en-IN')}</span>.
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

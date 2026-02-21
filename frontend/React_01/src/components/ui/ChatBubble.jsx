function ChatBubble({ message }) {
  const isSender = message.sender === 'me'

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

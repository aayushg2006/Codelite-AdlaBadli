import { ArrowRightLeft, MapPin, Sparkles } from 'lucide-react'

function SmartSwapNotificationCard({ notification, onViewSwap, onProposeSwap }) {
  return (
    <article className="rounded-xl border border-[#d8e5d4] bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#edf4ea] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--deep-olive)]">
          <Sparkles size={11} />
          AI Match
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
          <MapPin size={11} />
          {notification.distance}
        </span>
      </div>

      <h3 className="mt-2 text-sm font-semibold text-gray-800">{notification.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">{notification.message}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onViewSwap?.(notification)}
          className="rounded-lg border border-[#bfd0b8] px-3 py-2 text-xs font-semibold text-[var(--deep-olive)] transition duration-150 hover:bg-[#edf4ea] active:scale-95"
        >
          View Swap
        </button>
        {notification.type === 'SMART_SWAP_MATCH' ? (
          <button
            type="button"
            onClick={() => onProposeSwap?.(notification)}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-[var(--earth-olive)] px-3 py-2 text-xs font-semibold text-white transition duration-150 hover:bg-[var(--deep-olive)] active:scale-95"
          >
            <ArrowRightLeft size={13} />
            Propose Swap
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default SmartSwapNotificationCard

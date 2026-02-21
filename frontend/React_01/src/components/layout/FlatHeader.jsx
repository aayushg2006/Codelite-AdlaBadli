import { ChevronLeft } from 'lucide-react'

function FlatHeader({ onBack, name, status, initials, rightSlot }) {
  return (
    <header className="border-b border-gray-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full p-1.5 text-gray-500 transition duration-150 hover:bg-gray-100 active:scale-95"
            aria-label="Back to feed"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#d9e5d6] text-sm font-semibold text-[var(--deep-olive)]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">{name}</p>
            <p className="truncate text-xs text-gray-500">{status}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">{rightSlot}</div>
      </div>
    </header>
  )
}

export default FlatHeader

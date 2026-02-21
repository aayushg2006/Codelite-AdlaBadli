import { Compass, Sparkles } from 'lucide-react'
import { useState } from 'react'
import CurvedHeader from '../components/layout/CurvedHeader'
import ItemCard from '../components/ui/ItemCard'

function Home({ listings }) {
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)

  const handleFeedScroll = (event) => {
    const shouldCompact = event.currentTarget.scrollTop > 28
    setIsHeaderCompact((current) => (current === shouldCompact ? current : shouldCompact))
  }

  return (
    <section className="flex h-full flex-col">
      <CurvedHeader
        title="Local Feed"
        subtitle="Fresh swaps from your neighborhood"
        compact={isHeaderCompact}
        rightSlot={
          <div className="rounded-full border border-white/25 bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
            5 km
          </div>
        }
      >
        <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
          <span className="flex items-center gap-1.5 text-xs text-white/90">
            <Sparkles size={14} />
            34 new swaps nearby today
          </span>
          <button
            type="button"
            className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/90 transition duration-150 active:scale-95"
          >
            Smart Sort
          </button>
        </div>
      </CurvedHeader>

      <div onScroll={handleFeedScroll} className="flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <article className="mb-4 rounded-2xl border border-[#dce7d8] bg-white p-3 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Neighborhood Pulse</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="max-w-[70%] text-sm text-gray-700">
              Your circle diverted <span className="font-semibold text-[var(--deep-olive)]">132kg waste</span> this week.
            </p>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#ebf3e8] text-[var(--deep-olive)]">
              <Compass size={16} />
            </div>
          </div>
        </article>

        <div className="grid grid-cols-2 gap-3">
          {listings.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Home

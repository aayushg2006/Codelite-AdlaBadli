import { Compass, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import CurvedHeader from '../components/layout/CurvedHeader'
import ItemCard from '../components/ui/ItemCard'

function Home({ listings, onItemSelect, wishlistIds = [], onToggleWishlist }) {
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return listings
    }

    return listings.filter((item) => {
      const searchable = `${item.title} ${item.category} ${item.condition}`.toLowerCase()
      return searchable.includes(query)
    })
  }, [listings, searchQuery])

  const handleFeedScroll = (event) => {
    const shouldCompact = event.currentTarget.scrollTop > 28
    setIsHeaderCompact((current) => (current === shouldCompact ? current : shouldCompact))
  }

  return (
    <section className="flex h-full flex-col">
      <CurvedHeader
        title="Local Feed"
        
        compact={isHeaderCompact}
        rightSlot={
          <div className="rounded-full border border-white/25 bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
            5 km
          </div>
        }
      >
        <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
          <span className="flex items-center gap-1.5 text-xs text-white/90">
            <Sparkles size={14} />
            34 new swaps nearby today
          </span>
          <label className="mt-2 flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5">
            <Search size={13} className="text-white/75" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full border-none bg-transparent text-xs text-white outline-none placeholder:text-white/65"
              placeholder="Search local items"
              aria-label="Search local items"
            />
          </label>
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

        {filteredListings.length ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredListings.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isFavorite={wishlistIds.includes(item.id)}
                onFavoriteToggle={() => onToggleWishlist?.(item.id)}
                onSelect={() => onItemSelect?.(item)}
              />
            ))}
          </div>
        ) : (
          <article className="rounded-2xl border border-[#dce7d8] bg-white p-4 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-700">No items found</p>
            <p className="mt-1 text-xs text-gray-500">Try searching with a different keyword.</p>
          </article>
        )}
      </div>
    </section>
  )
}

export default Home

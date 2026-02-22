import { Compass, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import Header from '../layout/Header'
import NotificationBell from '../notifications/NotificationBell'
import ItemCard from '../ui/ItemCard'

function LocalFeed({
  listings,
  wishlistIds = [],
  onToggleWishlist,
  onItemSelect,
  notifications = [],
  onOpenNotifications,
  onViewSwapNotification,
  onProposeSwapNotification,
}) {
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
      <Header
        title="Local Feed"
        compact={isHeaderCompact}
        allowOverflow
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/25 bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
              5 km
            </div>
            <NotificationBell
              notifications={notifications}
              onOpenDropdown={onOpenNotifications}
              onViewSwap={onViewSwapNotification}
              onProposeSwap={onProposeSwapNotification}
            />
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
      </Header>

      <div onScroll={handleFeedScroll} className="flex-1 overflow-y-auto px-4 pb-5 pt-4">
        
            
          
      

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

export default LocalFeed

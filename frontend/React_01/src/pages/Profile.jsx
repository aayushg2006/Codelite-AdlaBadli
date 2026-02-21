import { Leaf, Recycle, Star, Trees } from 'lucide-react'
import { useMemo, useState } from 'react'
import OrderHistoryPage from '../components/profile/OrderHistoryPage'
import ProfileHeader from '../components/profile/ProfileHeader'
import ItemCard from '../components/ui/ItemCard'
import StatCard from '../components/ui/StatCard'

const iconMap = {
  saved: Recycle,
  waste: Leaf,
  carbon: Trees,
}

function Profile({ profile, impactStats, listings, wishlistIds = [], onToggleWishlist }) {
  const [activeCollection, setActiveCollection] = useState('listings')
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)

  const visibleItems = useMemo(() => {
    if (activeCollection === 'wishlist') {
      return listings.filter((item) => wishlistIds.includes(item.id))
    }
    return listings.filter((item) => profile.listingIds.includes(item.id))
  }, [activeCollection, listings, profile.listingIds, wishlistIds])

  const handleProfileScroll = (event) => {
    const shouldCompact = event.currentTarget.scrollTop > 28
    setIsHeaderCompact((current) => (current === shouldCompact ? current : shouldCompact))
  }

  return (
    <section className="flex h-full flex-col">
      <ProfileHeader
        profile={profile}
        isHeaderCompact={isHeaderCompact}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
      />

      <div
        onScroll={handleProfileScroll}
        className={`flex-1 overflow-y-auto px-4 pb-5 transition-all duration-300 ${
          isHeaderCompact ? 'pt-10' : 'pt-14'
        }`}
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">{profile.name}</h2>
          <p className="mt-1 text-sm text-gray-500">{profile.handle}</p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#edf4ea] px-3 py-1 text-xs font-medium text-[var(--deep-olive)]">
            <Star size={13} className="fill-current" />
            {profile.rating} rating • {profile.completedSwaps} completed swaps
          </div>
        </div>

        <section className="mt-4 rounded-2xl bg-gradient-to-br from-[var(--earth-olive)] to-[var(--deep-olive)] p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/75">Your Eco Impact</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {impactStats.map((stat) => (
              <StatCard
                key={stat.id}
                icon={iconMap[stat.id]}
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
              />
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="grid grid-cols-2 rounded-xl bg-[#e9f0e6] p-1">
            <button
              type="button"
              onClick={() => setActiveCollection('listings')}
              className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition duration-150 active:scale-95 ${
                activeCollection === 'listings'
                  ? 'bg-white text-[var(--deep-olive)] shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              My Listings
            </button>
            <button
              type="button"
              onClick={() => setActiveCollection('wishlist')}
              className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition duration-150 active:scale-95 ${
                activeCollection === 'wishlist'
                  ? 'bg-white text-[var(--deep-olive)] shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              My Wishlist
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {visibleItems.map((item) => (
              <ItemCard
                key={`${activeCollection}-${item.id}`}
                item={item}
                isFavorite={wishlistIds.includes(item.id)}
                onFavoriteToggle={() => onToggleWishlist?.(item.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <OrderHistoryPage isOpen={isOrderHistoryOpen} onClose={() => setIsOrderHistoryOpen(false)} />
    </section>
  )
}

export default Profile

import { Leaf, Recycle, Star, Trees } from 'lucide-react'
import { useMemo, useState } from 'react'
import CurvedHeader from '../components/layout/CurvedHeader'
import ItemCard from '../components/ui/ItemCard'
import StatCard from '../components/ui/StatCard'

const iconMap = {
  saved: Recycle,
  waste: Leaf,
  carbon: Trees,
}

function Profile({ profile, impactStats, listings }) {
  const [activeCollection, setActiveCollection] = useState('listings')
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)

  const visibleItems = useMemo(() => {
    if (activeCollection === 'wishlist') {
      return listings.filter((item) => profile.wishlistIds.includes(item.id))
    }
    return listings.filter((item) => profile.listingIds.includes(item.id))
  }, [activeCollection, listings, profile.listingIds, profile.wishlistIds])

  const handleProfileScroll = (event) => {
    const shouldCompact = event.currentTarget.scrollTop > 28
    setIsHeaderCompact((current) => (current === shouldCompact ? current : shouldCompact))
  }

  return (
    <section className="flex h-full flex-col">
      <div className="relative">
        <CurvedHeader
          title="Impact Dashboard"
          subtitle={profile.neighborhood}
          compact={isHeaderCompact}
          rightSlot={
            <div className="rounded-full border border-white/30 bg-white/20 px-2.5 py-1.5 text-xs backdrop-blur-md">
              Level {profile.level}
            </div>
          }
        />
        <div
          className={`absolute left-1/2 top-full grid -translate-x-1/2 place-items-center rounded-full border-4 border-[#f4f7f4] bg-[#d8e6d4] font-semibold text-[var(--deep-olive)] shadow-sm transition-all duration-300 ${
            isHeaderCompact ? 'h-16 w-16 -translate-y-[38%] text-lg' : 'h-24 w-24 -translate-y-1/2 text-2xl'
          }`}
        >
          {profile.initials}
        </div>
      </div>

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
              <ItemCard key={`${activeCollection}-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default Profile

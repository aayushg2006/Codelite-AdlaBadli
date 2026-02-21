import { Leaf, Recycle, Star, Trees } from 'lucide-react'
import { useMemo, useState } from 'react'
import OrderHistoryPage from '../components/profile/OrderHistoryPage'
import ProfileHeader from '../components/profile/ProfileHeader'
import ItemCard from '../components/ui/ItemCard'
import StatCard from '../components/ui/StatCard'
import { transactionHistory } from '../data/mockData'
import { supabase } from '../lib/supabase'

const DEFAULT_BIO = 'AI & Data Science @ TCET'
const CO2_KG_PER_KG_SWAPPED = 2.5

/** Determines the eco-tier based on carbon savings. */
function getEcoTier(carbonSavedKg) {
  if (carbonSavedKg >= 50) return { label: 'Forest', icon: Trees, color: 'text-emerald-700 bg-emerald-100 border-emerald-300' }
  if (carbonSavedKg >= 10) return { label: 'Tree', icon: TreePine, color: 'text-green-700 bg-green-100 border-green-300' }
  return { label: 'Seedling', icon: Sprout, color: 'text-lime-700 bg-lime-100 border-lime-300' }
}

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

  if (loading) return <div className="p-10 text-center">Loading Impact Dashboard...</div>

  const EcoIcon = ecoTier.icon

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
          <h2 className="text-xl font-semibold text-gray-800">{displayName}</h2>
          <p className="mt-1 text-sm text-gray-500">{displayEmail}</p>
          <p className="mt-1 text-xs text-[var(--earth-olive)] font-medium">{displayBio}</p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#edf4ea] px-3 py-1 text-xs font-medium text-[var(--deep-olive)]">
            {profile?.rating || '5.0'} rating • {profile?.completedSwaps || 0} completed swaps
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
          <p className="mt-2 text-[10px] text-white/60">
            Carbon saved: ~{CO2_KG_PER_KG_SWAPPED} kg CO₂ per kg swapped
          </p>
        </section>

        <section className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">Transaction History</h3>
          <ul className="space-y-2">
            {transactionHistory.map((t) => (
              <li
                key={t.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                  t.type === 'swapped' ? 'border-[#c4d5bf] bg-[#f0f7ee]' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-500">
                    {t.date}
                    {t.type === 'swapped' && t.partner && ` • with ${t.partner}`}
                  </p>
                </div>
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    t.type === 'swapped' ? 'bg-[var(--earth-olive)]/15 text-[var(--deep-olive)]' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {t.type === 'swapped' ? 'Swapped' : 'Bought'}
                </span>
                {t.type === 'swapped' && t.weightKg != null && (
                  <span className="ml-2 shrink-0 text-xs text-gray-500">{t.weightKg} kg</span>
                )}
                {t.type === 'bought' && t.amount != null && (
                  <span className="ml-2 shrink-0 text-xs font-medium text-gray-700">₹{t.amount}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5">
          <div className="grid grid-cols-2 rounded-xl bg-[#e9f0e6] p-1">
            <button
              type="button"
              onClick={() => setActiveCollection('listings')}
              className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition duration-150 active:scale-95 ${
                activeCollection === 'listings' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'
              }`}
            >
              My Listings
            </button>
            <button
              type="button"
              onClick={() => setActiveCollection('wishlist')}
              className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition duration-150 active:scale-95 ${
                activeCollection === 'wishlist' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'
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
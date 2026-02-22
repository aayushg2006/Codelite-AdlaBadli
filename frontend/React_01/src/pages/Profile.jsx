import { Leaf, Recycle, Trees } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProfileHeader from '../components/profile/ProfileHeader'
import ItemCard from '../components/ui/ItemCard'
import StatCard from '../components/ui/StatCard'

function Profile() {
  const [activeCollection, setActiveCollection] = useState('listings')
  const [myListings, setMyListings] = useState([])
  const [myWishlist, setMyWishlist] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return;
      
      setUser(session.user)

      // Fetch user's listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', session.user.id)
      
      if (listingsData) setMyListings(listingsData)

      // Fetch user's wishlist items
      const { data: wishlistData } = await supabase
        .from('wishlists')
        .select('desired_item') // Note: Depending on how you joined wishlist and listings
        .eq('user_id', session.user.id)
      
      if (wishlistData) setMyWishlist(wishlistData)
      
      setLoading(false)
    }

    fetchProfileData()
  }, [])

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Profile...</div>

  const visibleItems = activeCollection === 'listings' ? myListings : myWishlist

  return (
    <section className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-5 pt-14">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">{user?.user_metadata?.username || 'GeoSwap User'}</h2>
          <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
        </div>

        <section className="mt-4 rounded-2xl bg-gradient-to-br from-[var(--earth-olive)] to-[var(--deep-olive)] p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/75">Your Eco Impact</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <StatCard icon={Recycle} label="Items Listed" value={myListings.length} unit="" />
            <StatCard icon={Leaf} label="Active Swaps" value={0} unit="" />
            <StatCard icon={Trees} label="CO2 Saved" value={myListings.length * 2.5} unit="kg" />
          </div>
        </section>

        <section className="mt-5">
          <div className="grid grid-cols-2 rounded-xl bg-[#e9f0e6] p-1">
            <button onClick={() => setActiveCollection('listings')} className={`rounded-lg py-2 text-xs font-semibold uppercase ${activeCollection === 'listings' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'}`}>
              My Listings
            </button>
            <button onClick={() => setActiveCollection('wishlist')} className={`rounded-lg py-2 text-xs font-semibold uppercase ${activeCollection === 'wishlist' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'}`}>
              My Wishlist
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {visibleItems.length === 0 ? (
              <p className="col-span-2 text-center text-xs text-gray-400 py-6">No items here yet.</p>
            ) : (
              visibleItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

export default Profile
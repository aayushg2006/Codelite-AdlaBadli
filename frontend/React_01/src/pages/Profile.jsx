import { Leaf, LogOut, Recycle, Trees } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ItemCard from '../components/ui/ItemCard'
import StatCard from '../components/ui/StatCard'
import { formatPriceINR } from '../lib/helpers'

const RATE_EVENT_PREFIX = '__RATE_EVENT__'
const DEAL_EVENT_PREFIX = '__DEAL_EVENT__'

const parseRateEventContent = (content) => {
  if (typeof content !== 'string' || !content.startsWith(RATE_EVENT_PREFIX)) {
    return null
  }

  try {
    return JSON.parse(content.slice(RATE_EVENT_PREFIX.length))
  } catch {
    return null
  }
}

const parseDealEventContent = (content) => {
  if (typeof content !== 'string' || !content.startsWith(DEAL_EVENT_PREFIX)) {
    return null
  }

  try {
    return JSON.parse(content.slice(DEAL_EVENT_PREFIX.length))
  } catch {
    return null
  }
}

function Profile({ wishlistIds = [], onToggleWishlist, session }) {
  const [activeCollection, setActiveCollection] = useState('listings')
  const [myListings, setMyListings] = useState([])
  const [myWishlist, setMyWishlist] = useState([])
  const [historyRows, setHistoryRows] = useState([])
  const [user, setUser] = useState(session?.user ?? null)
  const [loading, setLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      const activeUser = session?.user
      if (!activeUser) {
        setLoading(false)
        return
      }

      setUser(activeUser)

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', activeUser.id)

      const ownListings = listingsData || []
      const activeListings = ownListings.filter((item) => {
        const status = String(item.status || '').toLowerCase()
        return status !== 'sold' && status !== 'swapped'
      })
      setMyListings(activeListings)

      // Resolve wishlisted listing IDs into full listing records for ItemCard.
      if (wishlistIds.length > 0) {
        const { data: wishlistListings } = await supabase
          .from('listings')
          .select('*')
          .in('id', wishlistIds)

        if (wishlistListings) setMyWishlist(wishlistListings)
      } else {
        setMyWishlist([])
      }

      const { data: matchRows } = await supabase
        .from('matches')
        .select('*')
        .or(`user_1_id.eq.${activeUser.id},user_2_id.eq.${activeUser.id}`)
        .order('created_at', { ascending: false })

      const matches = matchRows || []
      const listingIds = [
        ...new Set(matches.flatMap((row) => [row.listing_1_id, row.listing_2_id]).filter(Boolean)),
      ]
      const counterpartIds = [
        ...new Set(
          matches
            .map((row) => (row.user_1_id === activeUser.id ? row.user_2_id : row.user_1_id))
            .filter(Boolean)
        ),
      ]

      const [matchListingsRes, counterpartRes, chatsRes] = await Promise.all([
        listingIds.length
          ? supabase.from('listings').select('id, title').in('id', listingIds)
          : Promise.resolve({ data: [], error: null }),
        counterpartIds.length
          ? supabase.from('users').select('id, username').in('id', counterpartIds)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('chats')
          .select('id, buyer_id, seller_id, listing_id')
          .or(`buyer_id.eq.${activeUser.id},seller_id.eq.${activeUser.id}`),
      ])

      const listingMap = new Map((matchListingsRes.data || []).map((row) => [row.id, row]))
      const counterpartMap = new Map((counterpartRes.data || []).map((row) => [row.id, row.username || 'Local User']))
      const chats = chatsRes.data || []
      const chatById = new Map(chats.map((chat) => [chat.id, chat]))
      const chatByCompositeKey = new Map(
        chats.map((chat) => [`${chat.buyer_id}:${chat.seller_id}:${chat.listing_id}`, chat])
      )

      const chatIds = chats.map((chat) => chat.id).filter(Boolean)
      const { data: chatMessages } = chatIds.length
        ? await supabase
            .from('messages')
            .select('chat_id, content, created_at')
            .in('chat_id', chatIds)
        : { data: [] }

      const messagesByChat = new Map()
      ;(chatMessages || []).forEach((message) => {
        if (!messagesByChat.has(message.chat_id)) {
          messagesByChat.set(message.chat_id, [])
        }
        messagesByChat.get(message.chat_id).push(message)
      })

      const finalRateByChat = new Map()
      chats.forEach((chat) => {
        const rows = messagesByChat.get(chat.id) || []
        const confirmationsByAmount = new Map()
        let latestAcceptedRate = null
        let latestAcceptedAt = null

        rows
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .forEach((message) => {
            const event = parseRateEventContent(message.content)
            const amount = Number(event?.amount)
            if (!event) {
              return
            }

            if (event.kind === 'rate_accepted' && Number.isFinite(amount) && amount > 0) {
              latestAcceptedRate = Math.round(amount)
              latestAcceptedAt = message.created_at
              return
            }

            if (event.kind !== 'rate_confirmed' || !Number.isFinite(amount) || amount <= 0 || !event.actorId) {
              return
            }

            const key = String(Math.round(amount))
            if (!confirmationsByAmount.has(key)) {
              confirmationsByAmount.set(key, { amount: Math.round(amount), actors: new Set(), lastAt: message.created_at })
            }
            const entry = confirmationsByAmount.get(key)
            entry.actors.add(event.actorId)
            entry.lastAt = message.created_at
          })

        const agreed = [...confirmationsByAmount.values()]
          .filter((entry) => entry.actors.has(chat.buyer_id) && entry.actors.has(chat.seller_id))
          .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())[0]

        if (latestAcceptedRate && latestAcceptedAt) {
          finalRateByChat.set(chat.id, latestAcceptedRate)
        } else if (agreed) {
          finalRateByChat.set(chat.id, agreed.amount)
        }
      })

      const swapHistory = matches.map((row) => {
        const isRequester = row.user_1_id === activeUser.id
        const counterpartId = isRequester ? row.user_2_id : row.user_1_id
        const youGaveId = isRequester ? row.listing_1_id : row.listing_2_id
        const youReceivedId = isRequester ? row.listing_2_id : row.listing_1_id
        const compositeKey = `${row.user_1_id}:${row.user_2_id}:${row.listing_2_id}`
        const chat = chatByCompositeKey.get(compositeKey)
        const finalRate = chat ? finalRateByChat.get(chat.id) || null : null
        const status = row.status === 'accepted' ? 'COMPLETED' : row.status === 'rejected' ? 'REJECTED' : 'PENDING'

        return {
          id: `swap-${row.id}`,
          type: 'SWAP',
          status,
          title: listingMap.get(youReceivedId)?.title || 'Swap item',
          counterpart: counterpartMap.get(counterpartId) || 'Local User',
          youGave: listingMap.get(youGaveId)?.title || 'Item',
          youReceived: listingMap.get(youReceivedId)?.title || 'Item',
          finalRate,
          createdAt: row.created_at,
        }
      })

      const dealHistory = (chatMessages || [])
        .map((message) => {
          const deal = parseDealEventContent(message.content)
          if (!deal || deal.kind !== 'sold') {
            return null
          }

          const chat = chatById.get(message.chat_id)
          if (!chat) {
            return null
          }

          const sellerId = deal.sellerId || chat.seller_id
          const buyerId = deal.buyerId || chat.buyer_id
          const amount = Number(deal.amount)
          const normalizedAmount = Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null
          const listingTitle = deal.listingTitle || listingMap.get(chat.listing_id)?.title || 'Item'

          if (sellerId === activeUser.id) {
            return {
              id: `deal-sell-${message.chat_id}-${message.created_at}`,
              type: 'SELL',
              status: 'COMPLETED',
              title: listingTitle,
              counterpart: deal.buyerName || counterpartMap.get(buyerId) || 'Buyer',
              youGave: listingTitle,
              youReceived: 'Cash',
              finalRate: normalizedAmount,
              createdAt: message.created_at,
            }
          }

          if (buyerId === activeUser.id) {
            return {
              id: `deal-buy-${message.chat_id}-${message.created_at}`,
              type: 'BUY',
              status: 'COMPLETED',
              title: listingTitle,
              counterpart: deal.sellerName || counterpartMap.get(sellerId) || 'Seller',
              youGave: 'Cash',
              youReceived: listingTitle,
              finalRate: normalizedAmount,
              createdAt: message.created_at,
            }
          }

          return null
        })
        .filter(Boolean)

      const completedDealKeys = new Set(
        dealHistory
          .filter((row) => row.type === 'SELL')
          .map((row) => `${row.title}|${row.finalRate || ''}`)
      )

      const soldHistory = ownListings
        .filter((item) => String(item.status || '').toLowerCase() === 'sold')
        .map((item) => ({
          id: `sold-${item.id}`,
          type: 'SELL',
          status: 'COMPLETED',
          title: item.title || 'Sold item',
          counterpart: 'Buyer',
          youGave: item.title || 'Item',
          youReceived: 'Cash',
          finalRate: Number(item.ai_metadata?.finalRate || item.price || 0),
          createdAt: item.updated_at || item.created_at,
        }))
        .filter((row) => !completedDealKeys.has(`${row.title}|${row.finalRate || ''}`))

      setHistoryRows(
        [...swapHistory, ...dealHistory, ...soldHistory].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
      )
      
      setLoading(false)
    }

    fetchProfileData()
  }, [session, wishlistIds])

  const handleLogout = async () => {
    if (!supabase) {
      alert('Supabase client not initialized')
      return
    }

    setIsSigningOut(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(`Logout failed: ${error.message}`)
    }
    setIsSigningOut(false)
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Profile...</div>

  const visibleItems = activeCollection === 'listings' ? myListings : myWishlist
  const activeSwapCount = historyRows.filter((row) => row.type === 'SWAP' && row.status === 'PENDING').length

  return (
    <section className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-5 pt-14">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">{user?.user_metadata?.username || 'GeoSwap User'}</h2>
          <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#bfd0b8] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--deep-olive)] shadow-sm transition duration-150 hover:bg-[#edf4ea] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={13} />
            {isSigningOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <section className="mt-4 rounded-2xl bg-gradient-to-br from-[var(--earth-olive)] to-[var(--deep-olive)] p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/75">Your Eco Impact</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <StatCard icon={Recycle} label="Items Listed" value={myListings.length} unit="" />
            <StatCard icon={Leaf} label="Active Swaps" value={activeSwapCount} unit="" />
            <StatCard icon={Trees} label="CO2 Saved" value={myListings.length * 2.5} unit="kg" />
          </div>
        </section>

        <section className="mt-5">
          <div className="grid grid-cols-3 rounded-xl bg-[#e9f0e6] p-1">
            <button onClick={() => setActiveCollection('listings')} className={`rounded-lg py-2 text-xs font-semibold uppercase ${activeCollection === 'listings' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'}`}>
              My Listings
            </button>
            <button onClick={() => setActiveCollection('wishlist')} className={`rounded-lg py-2 text-xs font-semibold uppercase ${activeCollection === 'wishlist' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'}`}>
              My Wishlist
            </button>
            <button onClick={() => setActiveCollection('history')} className={`rounded-lg py-2 text-xs font-semibold uppercase ${activeCollection === 'history' ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'}`}>
              History
            </button>
          </div>

          {activeCollection === 'history' ? (
            <div className="mt-3 space-y-2">
              {historyRows.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-6">No history yet.</p>
              ) : (
                historyRows.map((row) => (
                  <article key={row.id} className="rounded-2xl border border-[#dce7d8] bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800">{row.type}: {row.title}</p>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${row.status === 'COMPLETED' ? 'bg-[#edf4ea] text-[var(--deep-olive)]' : row.status === 'PENDING' ? 'bg-[#fff6e9] text-[#9a6a28]' : 'bg-[#fdeeee] text-[#9b4d4d]'}`}>
                        {row.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">With: {row.counterpart}</p>
                    <p className="mt-1 text-xs text-gray-600">You gave: {row.youGave} | You received: {row.youReceived}</p>
                    {row.finalRate ? (
                      <p className="mt-1 text-xs font-semibold text-[var(--deep-olive)]">Final Rate: {formatPriceINR(row.finalRate)}</p>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {visibleItems.length === 0 ? (
                <p className="col-span-2 text-center text-xs text-gray-400 py-6">No items here yet.</p>
              ) : (
                visibleItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isFavorite={wishlistIds.includes(item.id)}
                    onFavoriteToggle={onToggleWishlist}
                  />
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default Profile

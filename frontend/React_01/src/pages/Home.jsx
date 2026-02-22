import { useEffect, useMemo, useState } from 'react'
import LocalFeed from '../components/feed/LocalFeed'
import { supabase } from '../lib/supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const SMART_MATCH_REFRESH_MS = 30000

function Home({ session, onItemSelect, wishlistIds, onToggleWishlist }) {
  const [listings, setListings] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(null)

  const userId = session?.user?.id
  const wishlistSignature = useMemo(() => wishlistIds.slice().sort().join('|'), [wishlistIds])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lon: longitude })
      },
      () => {
        console.warn('Location not provided. Loading empty feed.')
        setLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    if (!location) {
      return undefined
    }

    let isMounted = true

    const mergeNotificationReadState = (incoming) => {
      setNotifications((current) => {
        const currentById = new Map(current.map((item) => [item.id, item]))
        return incoming.map((item) => {
          const existing = currentById.get(item.id)
          if (existing?.status === 'READ') {
            return { ...item, status: 'READ' }
          }
          return item
        })
      })
    }

    const fetchFeedAndMatches = async () => {
      try {
        const feedPromise = fetch(`${API_BASE_URL}/api/items/nearby?lat=${location.lat}&lon=${location.lon}`)
        const smartMatchPromise = userId
          ? fetch(`${API_BASE_URL}/api/swaps/smart-matches?user_id=${userId}&lat=${location.lat}&lon=${location.lon}`)
          : Promise.resolve(null)

        const [feedRes, smartMatchRes] = await Promise.all([feedPromise, smartMatchPromise])

        if (feedRes.ok) {
          const nearbyListings = await feedRes.json()
          if (isMounted) {
            setListings(
              Array.isArray(nearbyListings)
                ? nearbyListings.filter((item) => {
                    const status = typeof item?.status === 'string' ? item.status.toLowerCase() : 'active'
                    return status !== 'sold' && status !== 'swapped'
                  })
                : []
            )
          }
        }

        if (smartMatchRes?.ok) {
          const smartMatches = await smartMatchRes.json()
          if (isMounted) {
            mergeNotificationReadState(Array.isArray(smartMatches) ? smartMatches : [])
          }
        } else if (smartMatchRes && isMounted) {
          setNotifications([])
        }
      } catch (err) {
        console.error('Failed to fetch feed/matches', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFeedAndMatches()
    const intervalId = setInterval(fetchFeedAndMatches, SMART_MATCH_REFRESH_MS)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [location, userId, wishlistSignature])

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    const channel = supabase
      .channel('home-listing-status-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'listings' }, (payload) => {
        const nextStatus = String(payload?.new?.status || '').toLowerCase()
        if (nextStatus !== 'sold' && nextStatus !== 'swapped') {
          return
        }

        const listingId = payload?.new?.id
        if (!listingId) {
          return
        }

        setListings((current) => current.filter((item) => item.id !== listingId))
        setNotifications((current) => current.filter((item) => item.matchedListingId !== listingId))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const openChatFromNotification = (notification) => {
    if (!notification) {
      return
    }

    const matchedItem =
      notification.matchedListing ||
      listings.find((listing) => listing.id === notification.matchedListingId)

    if (matchedItem) {
      onItemSelect?.(matchedItem)
    }
  }

  const handleOpenNotifications = () => {
    setNotifications((current) => current.map((item) => ({ ...item, status: 'READ' })))
  }

  if (loading) {
    return <div className="p-10 text-center flex h-full items-center justify-center">Locating nearby items...</div>
  }

  return (
    <LocalFeed
      listings={listings}
      onItemSelect={onItemSelect}
      wishlistIds={wishlistIds}
      onToggleWishlist={onToggleWishlist}
      notifications={notifications}
      onOpenNotifications={handleOpenNotifications}
      onViewSwapNotification={openChatFromNotification}
      onProposeSwapNotification={openChatFromNotification}
    />
  )
}

export default Home

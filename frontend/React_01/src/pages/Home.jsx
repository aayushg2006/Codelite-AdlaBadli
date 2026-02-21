import { useCallback, useEffect, useState } from 'react'
import LocalFeed from '../components/feed/LocalFeed'
import { fetchNotifications, markNotificationAsRead } from '../services/notificationService'

function Home({ listings, onItemSelect, wishlistIds = [], onToggleWishlist }) {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    let isMounted = true

    const loadNotifications = async () => {
      const data = await fetchNotifications()
      if (isMounted) {
        setNotifications(data)
      }
    }

    loadNotifications()

    return () => {
      isMounted = false
    }
  }, [])

  const markAllNotificationsAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter((notification) => notification.status === 'UNREAD')
      .map((notification) => notification.id)

    if (!unreadIds.length) {
      return
    }

    setNotifications((current) =>
      current.map((notification) =>
        unreadIds.includes(notification.id) ? { ...notification, status: 'READ' } : notification
      )
    )

    await Promise.all(unreadIds.map((id) => markNotificationAsRead(id)))
  }, [notifications])

  const findNotificationTargetItem = useCallback(
    (notification) => {
      const possibleTitles = [notification.yourItem, notification.matchedItem]
      return listings.find((item) => possibleTitles.includes(item.title)) || listings[0]
    },
    [listings]
  )

  const handleViewSwapNotification = useCallback(
    (notification) => {
      const targetItem = findNotificationTargetItem(notification)
      if (targetItem) {
        onItemSelect?.(targetItem)
      }
    },
    [findNotificationTargetItem, onItemSelect]
  )

  const handleProposeSwapNotification = useCallback(
    (notification) => {
      handleViewSwapNotification(notification)
    },
    [handleViewSwapNotification]
  )

  return (
    <LocalFeed
      listings={listings}
      wishlistIds={wishlistIds}
      onToggleWishlist={onToggleWishlist}
      onItemSelect={onItemSelect}
      notifications={notifications}
      onOpenNotifications={markAllNotificationsAsRead}
      onViewSwapNotification={handleViewSwapNotification}
      onProposeSwapNotification={handleProposeSwapNotification}
    />
  )
}

export default Home

import { Bell } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import NotificationDropdown from './NotificationDropdown'

function NotificationBell({ notifications, onOpenDropdown, onViewSwap, onProposeSwap }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status === 'UNREAD').length,
    [notifications]
  )

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  const handleToggle = () => {
    const nextState = !isOpen
    setIsOpen(nextState)

    if (nextState) {
      onOpenDropdown?.()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/15 text-white transition duration-150 hover:bg-white/20 active:scale-95"
        aria-label="Open notifications"
      >
        <Bell size={16} />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        notifications={notifications}
        onViewSwap={onViewSwap}
        onProposeSwap={onProposeSwap}
      />
    </div>
  )
}

export default NotificationBell

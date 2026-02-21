import SmartSwapNotificationCard from './SmartSwapNotificationCard'

function NotificationDropdown({ isOpen, notifications, onViewSwap, onProposeSwap }) {
  return (
    <div
      className={`absolute right-0 top-full z-40 mt-2 w-[20rem] max-w-[85vw] origin-top-right rounded-2xl border border-gray-200 bg-[#f7faf7] p-2 shadow-xl transition duration-200 ${
        isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
      }`}
    >
      <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Smart Notifications
      </p>

      {notifications.length ? (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {notifications.map((notification) => (
            <SmartSwapNotificationCard
              key={notification.id}
              notification={notification}
              onViewSwap={onViewSwap}
              onProposeSwap={onProposeSwap}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#d8e5d4] bg-white px-3 py-5 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-700">No new matches yet</p>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown

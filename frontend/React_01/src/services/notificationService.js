const mockNotifications = [
  {
    id: 'n1',
    type: 'SMART_SWAP_MATCH',
    title: 'Smart Swap Match Found!',
    message:
      "Rohit (0.8km away) is selling 'Indoor Herb Rack' from your wishlist and wants a Cane Accent Chair.",
    distance: '0.8 km',
    matchedItem: 'Indoor Herb Rack',
    yourItem: 'Cane Accent Chair',
    status: 'UNREAD',
    createdAt: '2026-02-21T10:30:00Z',
  },
  {
    id: 'n2',
    type: 'SMART_SWAP_MATCH',
    title: 'Nearby Match Available',
    message:
      "Ananya (1.4km away) listed 'Ceramic Planter Set' and is looking for a Desk Lamp Oak.",
    distance: '1.4 km',
    matchedItem: 'Ceramic Planter Set',
    yourItem: 'Desk Lamp Oak',
    status: 'UNREAD',
    createdAt: '2026-02-21T09:05:00Z',
  },
]

function cloneNotifications() {
  return mockNotifications.map((notification) => ({ ...notification }))
}

export async function fetchNotifications() {
  await new Promise((resolve) => setTimeout(resolve, 120))
  return cloneNotifications()
}

export async function markNotificationAsRead(id) {
  await new Promise((resolve) => setTimeout(resolve, 60))
  return { id, status: 'READ' }
}

const mockOrderHistory = [
  {
    id: 't1',
    type: 'SWAP',
    status: 'COMPLETED',
    itemTitle: 'Cane Accent Chair',
    counterpartyName: 'Rohit Mehta',
    date: '2026-01-14',
    location: '0.8 km away',
    swapDetails: {
      youGave: 'Indoor Herb Rack',
      youReceived: 'Cane Accent Chair',
    },
  },
  {
    id: 't2',
    type: 'BUY',
    status: 'COMPLETED',
    itemTitle: 'Ceramic Planter Set',
    price: 1850,
    counterpartyName: 'Anita Sharma',
    date: '2026-01-02',
  },
  {
    id: 't3',
    type: 'SWAP',
    status: 'CANCELLED',
    itemTitle: 'Desk Lamp Oak',
    counterpartyName: 'Vikram Rao',
    date: '2025-12-22',
    location: '1.7 km away',
    swapDetails: {
      youGave: 'Glass Water Carafe',
      youReceived: 'Desk Lamp Oak',
    },
  },
  {
    id: 't4',
    type: 'BUY',
    status: 'COMPLETED',
    itemTitle: 'Bamboo Laundry Basket',
    price: 1180,
    counterpartyName: 'Neha Kapoor',
    date: '2025-12-10',
  },
]

function cloneOrderHistory() {
  return mockOrderHistory.map((transaction) => ({
    ...transaction,
    swapDetails: transaction.swapDetails ? { ...transaction.swapDetails } : undefined,
  }))
}

export async function fetchOrderHistory() {
  await new Promise((resolve) => setTimeout(resolve, 140))
  return cloneOrderHistory()
}

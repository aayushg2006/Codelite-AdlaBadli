import { Clock3, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fetchOrderHistory } from '../../services/orderHistoryService'
import TransactionCard from './TransactionCard'

const filterTabs = [
  { id: 'ALL', label: 'All' },
  { id: 'SWAP', label: 'Swaps' },
  { id: 'BUY', label: 'Purchases' },
]

function formatDateLabel(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function OrderHistoryPage({ isOpen, onClose }) {
  const [transactions, setTransactions] = useState([])
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadTransactions = async () => {
      setIsLoading(true)
      const data = await fetchOrderHistory()
      if (isMounted) {
        setTransactions(data)
        setIsLoading(false)
      }
    }

    loadTransactions()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const groupedTransactions = useMemo(() => {
    const filtered =
      activeFilter === 'ALL'
        ? transactions
        : transactions.filter((transaction) => transaction.type === activeFilter)

    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))

    return sorted.reduce((groups, transaction) => {
      const key = transaction.date

      if (!groups[key]) {
        groups[key] = []
      }

      groups[key].push(transaction)
      return groups
    }, {})
  }, [activeFilter, transactions])

  const groupedDates = useMemo(
    () => Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a)),
    [groupedTransactions]
  )

  return (
    <div className={`fixed inset-0 z-50 transition ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <button
        type="button"
        aria-label="Close order history"
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      <section
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-3xl bg-[#f4f7f4] shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-300/90" />

        <header className="flex items-center justify-between px-4 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e7f0e4] text-[var(--deep-olive)]">
              <Clock3 size={15} />
            </span>
            <h2 className="text-lg font-semibold text-gray-800">Order History</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition duration-150 hover:bg-gray-100 active:scale-95"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 rounded-xl bg-[#e9f0e6] p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-lg px-2 py-2 text-[11px] font-semibold uppercase tracking-wider transition duration-150 ${
                  activeFilter === tab.id ? 'bg-white text-[var(--deep-olive)] shadow-sm' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[74dvh] space-y-4 overflow-y-auto px-4 pb-6">
          {isLoading ? (
            <div className="rounded-xl border border-[#d8e5d4] bg-white px-4 py-5 text-center text-sm text-gray-600 shadow-sm">
              Loading history...
            </div>
          ) : groupedDates.length ? (
            groupedDates.map((dateKey) => (
              <section key={dateKey}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {formatDateLabel(dateKey)}
                </p>
                <div className="space-y-2.5">
                  {groupedTransactions[dateKey].map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-xl border border-[#d8e5d4] bg-white px-4 py-5 text-center text-sm text-gray-600 shadow-sm">
              No transactions found.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default OrderHistoryPage

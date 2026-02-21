import BuyTransactionDetails from './BuyTransactionDetails'
import SwapTransactionDetails from './SwapTransactionDetails'

function TransactionCard({ transaction }) {
  const isSwap = transaction.type === 'SWAP'
  const isCompleted = transaction.status === 'COMPLETED'

  return (
    <article className="rounded-xl border border-[#d8e5d4] bg-white p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
            isSwap ? 'bg-[#edf4ea] text-[var(--deep-olive)]' : 'bg-[#eef2f4] text-gray-700'
          }`}
        >
          {isSwap ? 'Swap' : 'Buy'}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
            isCompleted ? 'bg-[#edf4ea] text-[var(--deep-olive)]' : 'bg-[#fff3f2] text-[#c45e50]'
          }`}
        >
          {transaction.status}
        </span>
      </div>

      <h3 className="mt-2 text-sm font-semibold text-gray-800">{transaction.itemTitle}</h3>
      <p className="mt-1 text-xs text-gray-600">{transaction.counterpartyName}</p>

      {isSwap ? (
        <SwapTransactionDetails swapDetails={transaction.swapDetails} />
      ) : (
        <BuyTransactionDetails price={transaction.price} counterpartyName={transaction.counterpartyName} />
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
        <span>{transaction.date}</span>
        {transaction.location ? <span>{transaction.location}</span> : null}
      </div>
    </article>
  )
}

export default TransactionCard

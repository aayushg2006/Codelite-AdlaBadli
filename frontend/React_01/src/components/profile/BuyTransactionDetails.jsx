import { formatPriceINR } from '../../lib/helpers'

function BuyTransactionDetails({ price, counterpartyName }) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-[#f7faf7] px-3 py-2">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500">Seller</p>
        <p className="mt-1 text-xs font-medium text-gray-700">{counterpartyName}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">Amount</p>
        <p className="mt-1 text-sm font-semibold text-[var(--deep-olive)]">{formatPriceINR(price)}</p>
      </div>
    </div>
  )
}

export default BuyTransactionDetails

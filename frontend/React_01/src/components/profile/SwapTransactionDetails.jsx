function SwapTransactionDetails({ swapDetails }) {
  return (
    <div className="mt-3 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <div className="flex-1 rounded-lg border border-gray-200 bg-[#f7faf7] px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">You Gave</p>
        <p className="mt-1 text-xs font-medium text-gray-700">{swapDetails?.youGave || '-'}</p>
      </div>

      <span className="self-center text-sm text-gray-500">{'\u2192'}</span>

      <div className="flex-1 rounded-lg border border-gray-200 bg-[#f7faf7] px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">You Received</p>
        <p className="mt-1 text-xs font-medium text-gray-700">{swapDetails?.youReceived || '-'}</p>
      </div>
    </div>
  )
}

export default SwapTransactionDetails

const inrFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
})

const RUPEE_SYMBOL = '\u20B9'

export function formatPriceINR(price) {
  const value = Number(price)

  if (!Number.isFinite(value)) {
    return `${RUPEE_SYMBOL}0`
  }

  return `${RUPEE_SYMBOL}${inrFormatter.format(value)}`
}

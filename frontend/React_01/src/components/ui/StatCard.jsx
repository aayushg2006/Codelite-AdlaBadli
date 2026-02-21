import { createElement } from 'react'

function StatCard({ icon, label, value, unit }) {
  return (
    <article className="rounded-2xl border border-white/25 bg-white/15 p-3 text-white shadow-sm backdrop-blur">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
        {createElement(icon, { size: 16, strokeWidth: 2 })}
      </div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/75">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">
        {value}
        <span className="ml-1 text-xs font-medium tracking-normal text-white/80">{unit}</span>
      </p>
    </article>
  )
}

export default StatCard

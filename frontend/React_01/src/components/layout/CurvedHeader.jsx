function CurvedHeader({
  title,
  subtitle,
  rightSlot,
  children,
  compact = false,
  collapseChildren = true,
  allowOverflow = false,
}) {
  const hasSubtitle = Boolean(subtitle)

  return (
    <header
      className={`relative ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'} bg-gradient-to-br from-[var(--deep-olive)] to-[var(--earth-olive)] text-white shadow-sm transition-all duration-300 ${
        compact ? 'rounded-b-2xl px-4 pb-3 pt-3' : 'rounded-b-[2.25rem] px-5 pb-6 pt-5'
      }`}
    >
      <div className="pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-14 top-2 h-36 w-36 rounded-full bg-[#9db894]/25 blur-3xl" />
      <div className={`relative flex justify-between gap-3 transition-all duration-300 ${compact ? 'items-center' : 'items-start'}`}>
        <div>
          <p
            className={`uppercase transition-all duration-300 ${
              compact ? 'text-[10px] tracking-[0.18em] text-white/65' : 'text-xs tracking-[0.24em] text-white/70'
            }`}
          >
            GeoSwap
          </p>
          <h1 className={`font-semibold transition-all duration-300 ${compact ? 'mt-0.5 text-lg' : 'mt-1 text-xl'}`}>
            {title}
          </h1>
          {hasSubtitle ? (
            <p
              className={`overflow-hidden text-white/80 transition-all duration-300 ${
                compact ? 'mt-0 max-h-0 -translate-y-1 opacity-0' : 'mt-1 max-h-10 translate-y-0 text-sm opacity-100'
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className={`transition-all duration-300 ${compact ? 'scale-95' : ''}`}>{rightSlot}</div>
      </div>
      {children ? (
        <div
          className={`relative overflow-hidden transition-all duration-300 ${
            compact && collapseChildren ? 'mt-0 max-h-0 opacity-0' : 'mt-4 max-h-40 opacity-100'
          }`}
        >
          {children}
        </div>
      ) : null}
    </header>
  )
}

export default CurvedHeader

import { ArrowRight, Repeat2, ShoppingBag, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const launchModes = [
  {
    id: 'swap',
    label: 'Swap',
    description: 'Exchange useful items with neighbors nearby.',
    cta: 'Start Swapping',
  },
  {
    id: 'buy',
    label: 'Buy',
    description: 'Find budget-friendly local deals in minutes.',
    cta: 'Start Exploring',
  },
  {
    id: 'reuse',
    label: 'Reuse',
    description: 'Keep products in use and reduce daily waste.',
    cta: 'Start Reusing',
  },
]

function Entry({ onGetStarted }) {
  const [activeMode, setActiveMode] = useState('swap')
  const [jumpSeed, setJumpSeed] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const selectedMode = useMemo(
    () => launchModes.find((mode) => mode.id === activeMode) ?? launchModes[0],
    [activeMode]
  )

  const activeModeIndex = useMemo(() => launchModes.findIndex((mode) => mode.id === activeMode), [activeMode])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = () => setPrefersReducedMotion(mediaQuery.matches)

    handleMotionChange()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange)
      return () => mediaQuery.removeEventListener('change', handleMotionChange)
    }

    mediaQuery.addListener(handleMotionChange)
    return () => mediaQuery.removeListener(handleMotionChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined
    }

    const cycleTimer = window.setInterval(() => {
      setActiveMode((currentMode) => {
        const currentIndex = launchModes.findIndex((mode) => mode.id === currentMode)
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % launchModes.length
        return launchModes[nextIndex].id
      })
    }, 1450)

    return () => window.clearInterval(cycleTimer)
  }, [prefersReducedMotion])

  useEffect(() => {
    setJumpSeed((current) => current + 1)
  }, [activeMode])

  return (
    <section className="relative flex h-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(130,181,153,0.24),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(126,161,218,0.22),transparent_36%),linear-gradient(160deg,#172d3e_0%,#1f4b57_48%,#2b7358_100%)] px-5 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.04),transparent)] opacity-60" />
      <div className="animate-orb-float pointer-events-none absolute -left-12 top-14 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="animate-orb-float pointer-events-none absolute -right-20 bottom-6 h-52 w-52 rounded-full bg-cyan-200/20 blur-3xl [animation-delay:800ms]" />
      <div className="animate-orb-float pointer-events-none absolute bottom-20 left-8 h-28 w-28 rounded-full bg-lime-200/15 blur-2xl [animation-delay:1400ms]" />

      <div className="animate-card-rise relative mx-auto w-full max-w-sm rounded-3xl border border-white/20 bg-white/12 p-7 text-center shadow-2xl backdrop-blur-xl">
        <p className="mx-auto inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
          <Sparkles size={11} />
          Local circular community
        </p>
        <h1 className="mt-4 text-[2.25rem] font-semibold tracking-tight sm:text-5xl">Adla Badli</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/80">{selectedMode.description}</p>

        <div className="mt-5 relative grid grid-cols-3 rounded-2xl border border-white/20 bg-white/10 p-1">
          <div
            className={`pointer-events-none absolute bottom-1 left-1 top-1 z-0 w-[calc((100%-0.5rem)/3)] transition-transform duration-500 ${
              prefersReducedMotion ? 'ease-linear' : 'ease-[cubic-bezier(0.25,1.34,0.45,1)]'
            }`}
            style={{ transform: `translateX(${Math.max(activeModeIndex, 0) * 100}%)` }}
          >
            <div
              key={`pill-${jumpSeed}`}
              className={`h-full w-full rounded-xl bg-white shadow-[0_6px_18px_rgba(255,255,255,0.34)] ${
                prefersReducedMotion ? '' : 'animate-pill-hop'
              }`}
            />
          </div>

          {launchModes.map((mode) => {
            const isActive = mode.id === activeMode
            const icon =
              mode.id === 'swap' ? <Repeat2 size={13} /> : mode.id === 'buy' ? <ShoppingBag size={13} /> : <Sparkles size={13} />

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className={`relative z-10 inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition duration-150 ${
                  isActive ? 'text-[#214a55]' : 'text-white/75 hover:text-white'
                }`}
              >
                {icon}
                {mode.label}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onGetStarted}
          className="animate-pulse-glow mx-auto mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition duration-150 hover:bg-emerald-400 active:scale-95"
        >
          {selectedMode.cta}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

export default Entry

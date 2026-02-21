import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Clock3,
  Globe2,
  Recycle,
  ShieldCheck,
} from 'lucide-react'

const features = [
  {
    id: 'timed',
    title: 'Timed Pickups',
    description: 'Auto-confirmed pickup windows keep every local swap predictable.',
    icon: Clock3,
  },
  {
    id: 'trusted',
    title: 'Secure & Auditable',
    description: 'Verified neighbors, trusted profiles, and transparent exchange history.',
    icon: ShieldCheck,
  },
  {
    id: 'smart',
    title: 'AI Smart Pricing',
    description: 'Local signals suggest fair prices based on condition and demand.',
    icon: BadgeCheck,
  },
  {
    id: 'impact',
    title: 'Impact Insights',
    description: 'Track items saved, waste diverted, and carbon avoided in your zone.',
    icon: BarChart3,
  },
]

function Entry({ onGetStarted }) {
  return (
    <section className="flex h-full flex-col overflow-hidden bg-[#f4f7f4]">
      <div className="flex-1 overflow-y-auto">
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_25%_20%,rgba(91,130,110,0.35),transparent_35%),linear-gradient(145deg,#1f3241_0%,#25485b_52%,#2a6e52_100%)] px-5 pb-10 pt-5 text-white">
          <div className="pointer-events-none absolute -left-12 top-16 h-40 w-40 rounded-full bg-[#83a37d]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -top-3 h-44 w-44 rounded-full bg-white/8 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/85">
                <Globe2 size={18} />
              </span>
              <span className="text-lg font-semibold tracking-tight">GeoSwap</span>
            </span>
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-xl bg-white/90 px-3.5 py-2 text-xs font-semibold text-gray-800 transition duration-150 active:scale-95"
            >
              Sign In
            </button>
          </div>

          <div className="relative mt-14 text-center">
            <p className="mx-auto w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
              Industry-Grade Local Circular Economy
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
              Swap Local.
              <br />
              <span className="text-[#2fd297]">Live Circular.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xs text-base leading-relaxed text-white/70">
              A premium neighborhood marketplace for buying, swapping, and reducing everyday waste.
            </p>

            <div className="mt-8 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={onGetStarted}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 hover:bg-emerald-400 active:scale-95"
              >
                Get Started
                <ArrowRight size={16} />
              </button>
              <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white/90 backdrop-blur-sm">
                5km Radius
              </span>
            </div>
          </div>
        </div>

        <div className="-mt-5 rounded-t-[2rem] bg-[#f4f7f4] px-4 pb-8 pt-6">
          <p className="text-center text-[11px] uppercase tracking-[0.2em] text-gray-500">
            Every feature built for trusted local swaps
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.id}
                  className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition duration-200 hover:shadow-md"
                >
                  <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white">
                    <Icon size={17} />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">{feature.title}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{feature.description}</p>
                </article>
              )
            })}
          </div>

          <section className="mt-6 rounded-2xl border border-[#dce7d8] bg-white px-4 py-5 text-center shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Neighborhood Ready</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
              Ready to transform your local economy?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Join mindful neighbors using GeoSwap for meaningful, low-waste exchange.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--earth-olive)] px-5 py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--deep-olive)] active:scale-95"
            >
              Start Free Today
              <ArrowRight size={15} />
            </button>
          </section>

          <footer className="mt-6 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Recycle size={13} className="text-[var(--deep-olive)]" />
              GeoSwap
            </span>
            <span>2026 Community Circular Platform</span>
          </footer>
        </div>
      </div>
    </section>
  )
}

export default Entry

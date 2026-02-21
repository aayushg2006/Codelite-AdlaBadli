import { ArrowRight } from 'lucide-react'

function Entry({ onGetStarted }) {
  return (
    <section className="relative flex h-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(130,181,153,0.22),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(126,161,218,0.2),transparent_36%),linear-gradient(160deg,#193043_0%,#1f4c57_55%,#2c7455_100%)] px-6 text-white">
      <div className="pointer-events-none absolute -left-14 top-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-4 h-56 w-56 rounded-full bg-cyan-200/15 blur-3xl" />

      <div className="relative mx-auto w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md">
        <h1 className="text-[2.1rem] font-semibold tracking-tight sm:text-5xl">Adla Badli</h1>
        <button
          type="button"
          onClick={onGetStarted}
          className="mx-auto mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition duration-150 hover:bg-emerald-400 active:scale-95"
        >
          Get Started
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

export default Entry

import { Globe2, Leaf, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

function Auth({ onAuthenticate }) {
  const [credentials, setCredentials] = useState({
    email: 'riya.local@geoswap.app',
    password: 'securepass123',
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    onAuthenticate()
  }

  return (
    <section className="h-full overflow-y-auto bg-[#f4f7f4] px-4 pb-6 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--deep-olive)] to-[var(--earth-olive)] px-5 pb-6 pt-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-2 h-32 w-32 rounded-full bg-[#a5b99d]/25 blur-3xl" />
        <div className="relative text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/25 bg-white/12 backdrop-blur-sm">
            <Globe2 size={26} />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">GeoSwap</h1>
          <p className="mt-1 text-sm text-white/85">Swap Smart. Live Local.</p>
        </div>
        <div className="relative mx-auto mt-5 grid max-w-xs grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-[0.18em] text-white/75">
          <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1">Trusted</span>
          <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1">5km Local</span>
          <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1">Eco First</span>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-[#dce7d8] bg-white px-5 pb-6 pt-5 shadow-sm">
        <div className="mb-5 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Leaf size={14} className="text-[var(--deep-olive)]" />
            Low Waste
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[var(--deep-olive)]" />
            Verified Users
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <label className="group block rounded-xl border border-gray-200 px-4 py-3 transition focus-within:border-[var(--earth-olive)] focus-within:shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Email</p>
            <input
              type="email"
              value={credentials.email}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="w-full border-none bg-transparent pt-1 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              placeholder="name@local.app"
              required
            />
            <span className="block h-0.5 origin-left scale-x-0 bg-[var(--earth-olive)] transition-transform duration-200 group-focus-within:scale-x-100" />
          </label>

          <label className="group block rounded-xl border border-gray-200 px-4 py-3 transition focus-within:border-[var(--earth-olive)] focus-within:shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Password</p>
            <input
              type="password"
              value={credentials.password}
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="w-full border-none bg-transparent pt-1 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              placeholder="Enter password"
              required
            />
            <span className="block h-0.5 origin-left scale-x-0 bg-[var(--earth-olive)] transition-transform duration-200 group-focus-within:scale-x-100" />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--earth-olive)] py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-[var(--deep-olive)] active:scale-95"
          >
            Sign In
          </button>
        </form>

        <button
          type="button"
          onClick={onAuthenticate}
          className="mt-3 w-full rounded-xl border border-[var(--earth-olive)]/20 py-3 text-sm font-medium text-[var(--deep-olive)] transition duration-150 hover:bg-[#eff5ed] active:scale-95"
        >
          Continue as Guest
        </button>
      </div>
    </section>
  )
}

export default Auth

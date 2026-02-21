import { Globe2, Leaf, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase' // Import Supabase

function Auth() {
  const [authMode, setAuthMode] = useState('signin')
  const [isLoading, setIsLoading] = useState(false)
  
  const [credentials, setCredentials] = useState({
    email: 'riya.local@geoswap.app',
    password: 'securepass123',
  })
  
  const [signupData, setSignupData] = useState({
    username: '',
    password: '',
    mobileNumber: '',
    email: '',
  })

  // 1. Standard Email Sign In
  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })
    if (error) alert(`Login failed: ${error.message}`)
    setIsLoading(false)
  }

  // 2. Standard Email Sign Up
  const handleSignupSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          username: signupData.username,
          phone: signupData.mobileNumber,
        }
      }
    })
    
    if (error) {
      alert(`Signup failed: ${error.message}`)
    } else {
      alert("Success! Check your email to verify your account, or log in directly if email verification is disabled.")
      setAuthMode('signin')
    }
    setIsLoading(false)
  }

  // 3. Google OAuth Login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) alert(`Google login failed: ${error.message}`)
  }

  return (
    <section className="h-full overflow-y-auto bg-[#f4f7f4] px-4 pb-6 pt-4">
      {/* Header UI (Unchanged) */}
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
      </div>

      <div className="mt-4 rounded-3xl border border-[#dce7d8] bg-white px-5 pb-6 pt-5 shadow-sm">
        <div className="mb-5 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><Leaf size={14} className="text-[var(--deep-olive)]" /> Low Waste</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[var(--deep-olive)]" /> Verified Users</span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[#f2f4f1] p-1">
          <button type="button" onClick={() => setAuthMode('signin')} className={`rounded-lg py-2.5 text-sm font-semibold transition ${authMode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Sign In</button>
          <button type="button" onClick={() => setAuthMode('signup')} className={`rounded-lg py-2.5 text-sm font-semibold transition ${authMode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Sign Up</button>
        </div>

        {authMode === 'signin' ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <label className="group block rounded-xl border border-gray-200 px-4 py-3 transition focus-within:border-[var(--earth-olive)] focus-within:shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Email</p>
              <input type="email" value={credentials.email} onChange={(e) => setCredentials(c => ({...c, email: e.target.value}))} className="w-full border-none bg-transparent pt-1 text-sm text-gray-700 outline-none placeholder:text-gray-400" required />
            </label>
            <label className="group block rounded-xl border border-gray-200 px-4 py-3 transition focus-within:border-[var(--earth-olive)] focus-within:shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Password</p>
              <input type="password" value={credentials.password} onChange={(e) => setCredentials(c => ({...c, password: e.target.value}))} className="w-full border-none bg-transparent pt-1 text-sm text-gray-700 outline-none placeholder:text-gray-400" required />
            </label>
            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[var(--earth-olive)] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--deep-olive)] disabled:opacity-50">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
             <label className="group block rounded-xl border border-gray-200 px-4 py-3 transition focus-within:border-[var(--earth-olive)] focus-within:shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Username</p>
              <input type="text" value={signupData.username} onChange={(e) => setSignupData(c => ({...c, username: e.target.value}))} className="w-full border-none bg-transparent pt-1 text-sm text-gray-700 outline-none placeholder:text-gray-400" required />
            </label>
            <label className="group block rounded-xl border border-gray-200 px-4 py-3 transition focus-within:border-[var(--earth-olive)] focus-within:shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Email ID</p>
              <input type="email" value={signupData.email} onChange={(e) => setSignupData(c => ({...c, email: e.target.value}))} className="w-full border-none bg-transparent pt-1 text-sm text-gray-700 outline-none placeholder:text-gray-400" required />
            </label>
            <label className="group block rounded-xl border border-gray-200 px-4 py-3 transition focus-within:border-[var(--earth-olive)] focus-within:shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Mobile Number</p>
              <input type="tel" value={signupData.mobileNumber} onChange={(e) => setSignupData(c => ({...c, mobileNumber: e.target.value}))} className="w-full border-none bg-transparent pt-1 text-sm text-gray-700 outline-none placeholder:text-gray-400" required />
            </label>
            <label className="group block rounded-xl border border-gray-200 px-4 py-3 transition focus-within:border-[var(--earth-olive)] focus-within:shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Password</p>
              <input type="password" value={signupData.password} onChange={(e) => setSignupData(c => ({...c, password: e.target.value}))} className="w-full border-none bg-transparent pt-1 text-sm text-gray-700 outline-none placeholder:text-gray-400" required />
            </label>
            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[var(--deep-olive)] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--earth-olive)] disabled:opacity-50">
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        {/* Google Login Button */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Or continue with</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button type="button" onClick={handleGoogleLogin} className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>

      </div>
    </section>
  )
}

export default Auth
import { useEffect, useState } from 'react'
import BottomNav from './components/layout/BottomNav'
import AddItem from './pages/AddItem'
import Auth from './pages/Auth'
import ChatRoom from './pages/ChatRoom'
import Entry from './pages/Entry'
import Home from './pages/Home'
import Profile from './pages/Profile'
import { supabase } from './lib/supabase'

// FIX: Added missing mockData imports that were causing the white screen
import {
  chatContextItem,
  chatPartner,
  initialMessages,
  profile,
  listings,
  impactStats
} from './data/mockData'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [session, setSession] = useState(null)
  const [authStage, setAuthStage] = useState('entry')
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [selectedChatItem, setSelectedChatItem] = useState(chatContextItem)
  const [wishlistIds, setWishlistIds] = useState(() => profile?.wishlistIds ? [...profile.wishlistIds] : [])

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      if (!supabase) {
        if (isMounted) {
          setIsAuthenticated(false)
          setAuthStage('login')
          setIsAuthReady(true)
        }
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      setSession(session)
      if (session) {
        setIsAuthenticated(true)
        setActiveTab('home')
      } else {
        setIsAuthenticated(false)
      }
      setIsAuthReady(true)
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)

      if (nextSession) {
        setIsAuthenticated(true)
        setActiveTab('home')
        return
      }

      setIsAuthenticated(false)

      // Keep users on login after logout/OAuth callback misses instead of forcing Entry loop.
      if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        setAuthStage('login')
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const openLogin = () => {
    setAuthStage('login')
  }

  const openChatFromItem = (item) => {
    setSelectedChatItem(item)
    setActiveTab('chat')
  }

  const handleToggleWishlist = (itemId) => {
    setWishlistIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]
    )
  }

  let tabContent = null

  if (!isAuthenticated) {
    tabContent = authStage === 'entry' ? <Entry onGetStarted={openLogin} /> : <Auth />
  } else if (activeTab === 'home') {
    tabContent = (
      <Home
        listings={listings}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        onItemSelect={openChatFromItem}
      />
    )
  } else if (activeTab === 'add') {
    tabContent = <AddItem session={session} />
  } else if (activeTab === 'chat') {
    tabContent = (
      <ChatRoom
        initialMessages={initialMessages}
        chatPartner={chatPartner}
        chatContextItem={selectedChatItem}
        onBack={() => handleTabChange('home')}
        session={session}
      />
    )
  } else if (activeTab === 'profile') {
    tabContent = (
      <Profile
        profile={profile}
        impactStats={impactStats}
        listings={listings}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        session={session}
      />
    )
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#edf2ed]">
        <div className="max-w-md mx-auto h-[100dvh] bg-[#f4f7f4] flex items-center justify-center text-sm text-gray-500">
          Checking session...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#edf2ed]">
      <div className="max-w-md mx-auto h-[100dvh] bg-[#f4f7f4] relative overflow-hidden flex flex-col shadow-2xl border-x border-gray-200">
        <main className="relative flex-1 overflow-hidden">
          <div key={`${isAuthenticated}-${activeTab}`} className="h-full animate-screen-fade">
            {tabContent}
          </div>
        </main>
        {isAuthenticated && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
      </div>
    </div>
  )
}

export default App

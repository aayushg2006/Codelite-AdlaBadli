import { useEffect, useState } from 'react'
import BottomNav from './components/layout/BottomNav'
import AddItem from './pages/AddItem'
import Auth from './pages/Auth'
import ChatRoom from './pages/ChatRoom'
import Entry from './pages/Entry'
import Home from './pages/Home'
import Profile from './pages/Profile'
import { supabase } from './lib/supabase' // Import Supabase!

import {
  chatContextItem,
  chatPartner,
  impactStats,
  initialMessages,
  listings,
  profile,
} from './data/mockData'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [session, setSession] = useState(null) // Track the actual user data
  const [authStage, setAuthStage] = useState('entry')
  const [selectedChatItem, setSelectedChatItem] = useState(chatContextItem)
  const [wishlistIds, setWishlistIds] = useState(() => [...profile.wishlistIds])
  const [screenKey, setScreenKey] = useState(0)

  // NEW: Listen for Authentication Changes (Email or Google)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        setIsAuthenticated(true)
        setActiveTab('home')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setIsAuthenticated(true)
        setActiveTab('home')
        setScreenKey((current) => current + 1)
      } else {
        setIsAuthenticated(false)
        setAuthStage('entry')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setScreenKey((current) => current + 1)
  }

  const openLogin = () => {
    setAuthStage('login')
    setScreenKey((current) => current + 1)
  }

  const openChatFromItem = (item) => {
    setSelectedChatItem(item)
    setActiveTab('chat')
    setScreenKey((current) => current + 1)
  }

  const handleToggleWishlist = (itemId) => {
    setWishlistIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]
    )
  }

  // Pass the session to components that need it (like Profile or AddItem)
  let tabContent = (
    <Home
      listings={listings}
      wishlistIds={wishlistIds}
      onToggleWishlist={handleToggleWishlist}
      onItemSelect={openChatFromItem}
    />
  )

  if (!isAuthenticated) {
    // Notice we don't need onAuthenticate anymore, the useEffect handles it!
    tabContent =
      authStage === 'entry' ? <Entry onGetStarted={openLogin} /> : <Auth />
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
        profile={profile} // Later we will replace this with real user data
        impactStats={impactStats}
        listings={listings}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(139,168,131,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(107,142,98,0.16),transparent_35%),#edf2ed]">
      <div className="max-w-md mx-auto h-[100dvh] bg-[#f4f7f4] relative overflow-hidden flex flex-col shadow-2xl sm:border-x border-gray-200 font-sans">
        <main className="relative flex-1 overflow-hidden">
          <div key={`${isAuthenticated}-${activeTab}-${screenKey}`} className="h-full animate-screen-fade">
            {tabContent}
          </div>
        </main>
        {isAuthenticated ? <BottomNav activeTab={activeTab} onTabChange={handleTabChange} /> : null}
      </div>
    </div>
  )
}

export default App
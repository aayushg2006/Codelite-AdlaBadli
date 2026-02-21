import { useState, useEffect } from 'react'
import BottomNav from './components/layout/BottomNav'
import AddItem from './pages/AddItem'
import Auth from './pages/Auth'
import ChatRoom from './pages/ChatRoom'
import Entry from './pages/Entry'
import Home from './pages/Home'
import Profile from './pages/Profile'
import { supabase } from './lib/supabase' 
import {
  chatContextItem,
  chatPartner,
  initialMessages,
} from './data/mockData'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authStage, setAuthStage] = useState('entry')
  const [selectedChatItem, setSelectedChatItem] = useState(chatContextItem)
  const [screenKey, setScreenKey] = useState(0)

  // Sync session with Supabase to clear the "Invalid Credentials" error
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      if (session) setAuthStage('login')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      if (session) setAuthStage('login')
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setScreenKey((prev) => prev + 1)
  }

  const openChatFromItem = (item) => {
    setSelectedChatItem(item)
    setActiveTab('chat')
  }

  // Choose content: notice we are NOT passing "profile={profile}" anymore.
  // This forces the components to use the dynamic Supabase logic.
  let tabContent = null

  if (!isAuthenticated) {
    tabContent = authStage === 'entry' 
      ? <Entry onGetStarted={() => setAuthStage('login')} /> 
      : <Auth onAuthenticate={() => setIsAuthenticated(true)} />
  } else {
    switch (activeTab) {
      case 'add':
        tabContent = <AddItem />
        break
      case 'chat':
        tabContent = (
          <ChatRoom
            initialMessages={initialMessages}
            chatPartner={chatPartner}
            chatContextItem={selectedChatItem}
            onBack={() => setActiveTab('home')}
          />
        )
        break
      case 'profile':
        tabContent = <Profile /> 
        break
      case 'home':
      default:
        tabContent = <Home onItemSelect={openChatFromItem} />
        break
    }
  }

  return (
    <div className="min-h-screen bg-[#edf2ed]">
      <div className="max-w-md mx-auto h-[100dvh] bg-[#f4f7f4] relative overflow-hidden flex flex-col shadow-2xl border-x border-gray-200">
        <main className="relative flex-1 overflow-hidden">
          <div key={`${isAuthenticated}-${activeTab}-${screenKey}`} className="h-full animate-screen-fade">
            {tabContent}
          </div>
        </main>
        {isAuthenticated && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
      </div>
    </div>
  )
}

export default App
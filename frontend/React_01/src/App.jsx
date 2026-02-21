import { useState } from 'react'
import BottomNav from './components/layout/BottomNav'
import AddItem from './pages/AddItem'
import Auth from './pages/Auth'
import ChatRoom from './pages/ChatRoom'
import Entry from './pages/Entry'
import Home from './pages/Home'
import Profile from './pages/Profile'
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
  const [authStage, setAuthStage] = useState('entry')
  const [screenKey, setScreenKey] = useState(0)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setScreenKey((current) => current + 1)
  }

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
    setActiveTab('home')
    setScreenKey((current) => current + 1)
  }

  const openLogin = () => {
    setAuthStage('login')
    setScreenKey((current) => current + 1)
  }

  let tabContent = <Home listings={listings} />

  if (!isAuthenticated) {
    tabContent =
      authStage === 'entry' ? <Entry onGetStarted={openLogin} /> : <Auth onAuthenticate={handleAuthenticated} />
  } else if (activeTab === 'add') {
    tabContent = <AddItem />
  } else if (activeTab === 'chat') {
    tabContent = (
      <ChatRoom
        initialMessages={initialMessages}
        chatPartner={chatPartner}
        chatContextItem={chatContextItem}
        onBack={() => handleTabChange('home')}
      />
    )
  } else if (activeTab === 'profile') {
    tabContent = <Profile profile={profile} impactStats={impactStats} listings={listings} />
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

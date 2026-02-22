import { useEffect, useState } from 'react'
import BottomNav from './components/layout/BottomNav'
import AddItem from './pages/AddItem'
import Auth from './pages/Auth'
import ChatList from './pages/ChatList'
import ChatRoom from './pages/ChatRoom'
import Entry from './pages/Entry'
import Home from './pages/Home'
import Profile from './pages/Profile'
import { supabase } from './lib/supabaseClient'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [session, setSession] = useState(null)
  const [authStage, setAuthStage] = useState('entry')
  const [selectedChatSelection, setSelectedChatSelection] = useState(null)
  const [wishlistIds, setWishlistIds] = useState([])

  // Ensure the user exists in public.users to prevent database foreign-key crashes!
  const syncUserToDatabase = async (user) => {
    if (!user) return;
    await supabase.from('users').upsert({
      id: user.id,
      username: user.user_metadata?.username || user.email.split('@')[0] || 'Local User',
      avatar_url: user.user_metadata?.avatar_url || ''
    }, { onConflict: 'id' });
  };

  const fetchWishlist = async (userId) => {
    const { data } = await supabase.from('wishlists').select('desired_item').eq('user_id', userId);
    if (data) setWishlistIds(data.map(item => item.desired_item));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        setIsAuthenticated(true)
        setActiveTab('home')
        syncUserToDatabase(session.user)
        fetchWishlist(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setIsAuthenticated(true)
        setActiveTab('home')
        syncUserToDatabase(session.user)
        fetchWishlist(session.user.id)
      } else {
        setIsAuthenticated(false)
        setAuthStage('entry')
        setWishlistIds([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleTabChange = (tab) => setActiveTab(tab)
  const openLogin = () => setAuthStage('login')

  const openChatFromItem = (item) => {
    setSelectedChatSelection({
      source: 'listing',
      listingId: item.id,
      sellerId: item.user_id,
      listing: item,
    })
    setActiveTab('chat')
  }

  // SAVE HEART CLICKS TO SUPABASE
  const handleToggleWishlist = async (itemId) => {
    if (!session) return;
    
    const isWished = wishlistIds.includes(itemId);
    
    // Optimistic UI update
    setWishlistIds((current) =>
      isWished ? current.filter((id) => id !== itemId) : [...current, itemId]
    );

    if (isWished) {
      const { error } = await supabase.from('wishlists').delete()
        .eq('user_id', session.user.id)
        .eq('desired_item', itemId);
      if (error) console.error("Remove wishlist error:", error);
    } else {
      const { error } = await supabase.from('wishlists').insert({ 
        user_id: session.user.id, 
        desired_item: itemId 
      });
      if (error) console.error("Add wishlist error:", error);
    }
  }

  let tabContent = null
  if (!isAuthenticated) {
    tabContent = authStage === 'entry' ? <Entry onGetStarted={openLogin} /> : <Auth />
  } else if (activeTab === 'home') {
    tabContent = <Home wishlistIds={wishlistIds} onToggleWishlist={handleToggleWishlist} onItemSelect={openChatFromItem} />
  } else if (activeTab === 'add') {
    tabContent = <AddItem />
  } else if (activeTab === 'chat') {
    if (selectedChatSelection) {
      tabContent = (
        <ChatRoom
          chatSelection={selectedChatSelection}
          onBack={() => {
            if (selectedChatSelection.source === 'listing') {
              setSelectedChatSelection(null)
              handleTabChange('home')
            } else {
              setSelectedChatSelection(null)
            }
          }}
          session={session}
        />
      )
    } else {
      tabContent = (
        <ChatList
          session={session}
          onOpenChat={(thread) => {
            setSelectedChatSelection({
              ...thread,
              source: 'list',
            })
          }}
        />
      )
    }
  } else if (activeTab === 'profile') {
    tabContent = <Profile wishlistIds={wishlistIds} onToggleWishlist={handleToggleWishlist} session={session} />
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

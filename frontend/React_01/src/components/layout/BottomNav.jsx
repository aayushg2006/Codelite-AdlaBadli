import { House, MessageCircleMore, ScanLine, UserRound } from 'lucide-react'

const navItems = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'add', label: 'Add', icon: ScanLine },
  { id: 'chat', label: 'Chat', icon: MessageCircleMore },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="border-t border-gray-200/80 bg-white/95 px-3 pb-3 pt-2 backdrop-blur-md">
      <ul className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full rounded-xl px-2 py-2.5 transition duration-150 active:scale-95 ${
                  isActive ? 'bg-[#edf4ea] text-[#5a7a52]' : 'text-gray-500 hover:bg-gray-100/80'
                }`}
              >
                <div className="mx-auto flex w-fit items-center gap-1.5">
                  <Icon size={16} strokeWidth={2.2} />
                  <span className="text-[11px] font-semibold tracking-wide">{item.label}</span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav

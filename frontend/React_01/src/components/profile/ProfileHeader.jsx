import { Clock3 } from 'lucide-react'
import CurvedHeader from '../layout/CurvedHeader'

function ProfileHeader({ profile, isHeaderCompact, onOpenOrderHistory }) {
  return (
    <div className="relative">
      <CurvedHeader
        title="Impact Dashboard"
        subtitle={profile.neighborhood}
        compact={isHeaderCompact}
        rightSlot={
          <button
            type="button"
            onClick={onOpenOrderHistory}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition duration-150 hover:bg-white/25 active:scale-95"
          >
            <Clock3 size={13} />
            Order History
          </button>
        }
      />
      <div
        className={`absolute left-1/2 top-full grid -translate-x-1/2 place-items-center rounded-full border-4 border-[#f4f7f4] bg-[#d8e6d4] font-semibold text-[var(--deep-olive)] shadow-sm transition-all duration-300 ${
          isHeaderCompact ? 'h-16 w-16 -translate-y-[38%] text-lg' : 'h-24 w-24 -translate-y-1/2 text-2xl'
        }`}
      >
        {profile.initials}
      </div>
    </div>
  )
}

export default ProfileHeader

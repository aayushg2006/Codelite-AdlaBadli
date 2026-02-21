import { Heart } from 'lucide-react'
import { useState } from 'react'
import { formatPriceINR } from '../../lib/helpers'

function ItemCard({ item, onSelect, isFavorite, onFavoriteToggle }) {
  const [localFavorite, setLocalFavorite] = useState(item.isFavorite)
  const favorite = typeof isFavorite === 'boolean' ? isFavorite : localFavorite

  const toggleFavorite = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(item.id)
      return
    }

    setLocalFavorite((current) => !current)
  }

  return (
    <article
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (!onSelect) {
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className={`group rounded-2xl bg-white p-2.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        onSelect ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d5e3d1]' : ''
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        <div
          className="h-full w-full transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: `linear-gradient(140deg, ${item.imageFrom}, ${item.imageTo})` }}
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            toggleFavorite()
          }}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-white/35 text-white shadow-sm backdrop-blur-md transition duration-150 active:scale-95"
          aria-label="Favorite"
          aria-pressed={favorite}
        >
          <Heart size={14} className={favorite ? 'fill-white text-white' : 'text-white'} />
        </button>
      </div>
      <div className="px-0.5 pb-1 pt-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">{item.category}</p>
        <h3 className="mt-1 truncate text-sm font-semibold text-gray-800">{item.title}</h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xl font-bold tracking-tight text-[var(--deep-olive)]">{formatPriceINR(item.price)}</p>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600">
            {item.distanceKm} km
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-gray-500">{item.condition}</p>
      </div>
    </article>
  )
}

export default ItemCard

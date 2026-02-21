import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const API_BASE = 'http://localhost:3000'

function App() {
  const [count, setCount] = useState(0)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locationStatus, setLocationStatus] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    setLocationStatus('Getting location…')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        setLocationStatus(`Found: ${lat.toFixed(4)}, ${lon.toFixed(4)}`)

        try {
          const res = await fetch(
            `${API_BASE}/api/items/nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
          )
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || `Request failed: ${res.status}`)
          }
          const data = await res.json()
          setListings(Array.isArray(data) ? data : [])
        } catch (err) {
          setError(err.message || 'Failed to load nearby items')
          setListings([])
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message || 'Could not get your location')
        setLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <section className="listings-section">
        <h2>Nearby items (5km)</h2>
        {locationStatus && <p className="location-status">{locationStatus}</p>}
        {loading && <p>Loading nearby listings…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && listings.length === 0 && (
          <p>No listings found nearby.</p>
        )}
        {!loading && listings.length > 0 && (
          <ul className="listings-list">
            {listings.map((item) => (
              <li key={item.id || item.listing_id || JSON.stringify(item)}>
                {item.title ?? item.name ?? 'Untitled'} — {item.category ?? 'Uncategorized'}
                {item.price != null && ` · ₹${item.price}`}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

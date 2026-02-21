import { Check, ScanSearch, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import CurvedHeader from '../components/layout/CurvedHeader'

function AddItem() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [estimatedWeight, setEstimatedWeight] = useState('')
  const [description, setDescription] = useState('Excellent condition, recently cleaned and ready for pickup.')
  const [scanState, setScanState] = useState('idle')
  const [showToast, setShowToast] = useState(false)
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const scanTimerRef = useRef(null)
  const toastTimerRef = useRef(null)

  useEffect(
    () => () => {
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current)
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
    },
    []
  )

  const startScan = () => {
    if (scanState === 'scanning') {
      return
    }

    setScanState('scanning')
    setCategory('')
    setPrice('')
    setEstimatedWeight('')

    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current)
    }

    scanTimerRef.current = setTimeout(() => {
      setScanState('done')
      setCategory('Home Decor')
      setPrice('42')
      setEstimatedWeight('2.4')
      if (!title) {
        setTitle('Handwoven Storage Basket')
      }
    }, 2000)
  }

  const listItem = () => {
    if (!title || !category || !price || !estimatedWeight) {
      return
    }

    setShowToast(true)
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2200)
  }

  const handlePageScroll = (event) => {
    const shouldCompact = event.currentTarget.scrollTop > 28
    setIsHeaderCompact((current) => (current === shouldCompact ? current : shouldCompact))
  }

  return (
    <section className="relative flex h-full flex-col">
      <CurvedHeader
        title="List an Item"
        compact={isHeaderCompact}
      />

      <div onScroll={handlePageScroll} className="flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <div className="rounded-2xl border border-[#dce7d8] bg-white p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">AI Scan</p>
          <div className="relative mt-3 overflow-hidden rounded-2xl border border-dashed border-[#c4d5bf] bg-[#eef4eb] p-4">
            <div className="relative mx-auto h-44 max-w-[15rem] rounded-xl border border-[#c9d8c4] bg-gradient-to-br from-[#e8f1e4] to-[#d7e7d0]">
              <div
                className={`pointer-events-none absolute inset-x-4 h-0.5 rounded-full bg-[var(--eco-accent)]/80 ${
                  scanState === 'scanning' ? 'animate-scan-line' : 'opacity-0'
                }`}
              />
              <div className="absolute inset-0 grid place-items-center text-[var(--deep-olive)]/75">
                <ScanSearch size={38} />
              </div>
            </div>
            {scanState === 'scanning' ? (
              <p className="mt-3 text-center text-sm text-[var(--deep-olive)] animate-shimmer">
                ✨ AI analyzing locally...
              </p>
            ) : (
              <p className="mt-3 text-center text-sm text-gray-600">Scan an item to auto-fill category and price.</p>
            )}
          </div>
          <button
            type="button"
            onClick={startScan}
            className="mt-4 w-full rounded-xl bg-[var(--earth-olive)] py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-[var(--deep-olive)] active:scale-95"
          >
            {scanState === 'scanning' ? 'Scanning...' : 'Scan with AI'}
          </button>
        </div>

        <form className="mt-4 space-y-3 rounded-2xl border border-[#dce7d8] bg-white p-4 shadow-sm">
          <label className="block">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Item Title</p>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--earth-olive)] focus:ring-2 focus:ring-[#dce8d8]"
              placeholder="e.g. Handwoven Storage Basket"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Category</p>
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                  scanState === 'done'
                    ? 'border-green-200 bg-green-50 text-green-800 focus:border-green-300'
                    : 'border-gray-200 text-gray-700 focus:border-[var(--earth-olive)] focus:ring-2 focus:ring-[#dce8d8]'
                }`}
                placeholder="Home Decor"
              />
            </label>
            <label className="block">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Suggested Price</p>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                  scanState === 'done'
                    ? 'border-green-200 bg-green-50 text-green-800 focus:border-green-300'
                    : 'border-gray-200 text-gray-700 focus:border-[var(--earth-olive)] focus:ring-2 focus:ring-[#dce8d8]'
                }`}
                placeholder="42"
              />
            </label>
          </div>

          <label className="block">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Estimated Weight (kg)</p>
            <input
              type="number"
              min="0"
              step="0.1"
              value={estimatedWeight}
              onChange={(event) => setEstimatedWeight(event.target.value)}
              className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
                scanState === 'done'
                  ? 'border-green-200 bg-green-50 text-green-800 focus:border-green-300'
                  : 'border-gray-200 text-gray-700 focus:border-[var(--earth-olive)] focus:ring-2 focus:ring-[#dce8d8]'
              }`}
              placeholder="2.4"
            />
          </label>

          <label className="block">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Description</p>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--earth-olive)] focus:ring-2 focus:ring-[#dce8d8]"
            />
          </label>

          <button
            type="button"
            onClick={listItem}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--earth-olive)] py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-[var(--deep-olive)] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#a7bca1]"
            disabled={!title || !category || !price || !estimatedWeight}
          >
            <Sparkles size={15} />
            List within 5km
          </button>
        </form>
      </div>

      {showToast ? (
        <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 animate-screen-fade rounded-full bg-[var(--deep-olive)] px-4 py-2 text-sm text-white shadow-sm">
          <span className="flex items-center gap-1.5">
            <Check size={14} />
            Your listing is live in local feed
          </span>
        </div>
      ) : null}
    </section>
  )
}

export default AddItem

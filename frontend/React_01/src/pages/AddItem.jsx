import { Camera, Check, Loader2, Sparkles, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import CurvedHeader from '../components/layout/CurvedHeader'
import { supabase, uploadImageToBucket } from '../lib/supabase'

/** Convert a Base64 data URL into a File for Supabase Storage. */
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new File([u8arr], filename, { type: mime })
}

const AI_MOCK_RESPONSE = {
  title: 'Vintage Chair',
  category: 'Furniture',
  price: '1200',
  weight: '8',
  description: 'Solid wood, slight wear.',
}

function AddItem() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [estimatedWeight, setEstimatedWeight] = useState('')
  const [description, setDescription] = useState('Excellent condition, recently cleaned and ready for pickup.')
  const [scanState, setScanState] = useState('idle')
  const [showToast, setShowToast] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
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
      resetForm()
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setTitle(''); setCategory(''); setPrice(''); setWeight(''); setDescription('')
    setCapturedImage(null); setUploadError(null)
    startCamera()
  }

  return (
    <section className="relative flex h-full flex-col">
      <CurvedHeader
        title="List an Item"
        compact={isHeaderCompact}
      />

      <div onScroll={handlePageScroll} className="flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <div className="rounded-2xl border border-[#dce7d8] bg-white p-4 shadow-sm">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          
          {!capturedImage ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl bg-black aspect-[4/3] flex items-center justify-center">
                {cameraError ? (
                  <div className="text-white text-xs px-6 text-center">Camera blocked. Use "Upload from Gallery" below.</div>
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={capturePhoto} disabled={!!cameraError} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--earth-olive)] py-3 text-sm font-bold text-white shadow-sm disabled:opacity-50">
                  <Camera size={18} /> Capture
                </button>
                <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 border border-gray-200">
                  <Upload size={18} /> Gallery
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={capturedImage} className="w-full h-full object-cover" alt="Preview" />
                <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full"><X size={16}/></button>
              </div>
              <button type="button" onClick={analyzeWithAI} disabled={analyzing} className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-70">
                {analyzing ? <Loader2 className="animate-spin" size={18}/> : <><Sparkles size={18}/> Analyze with AI</>}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleListingSubmit} className="mt-4 space-y-4 rounded-2xl border border-[#dce7d8] bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Item Details</span>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-[#dce7d8] transition-all outline-none" required />
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none" required />
            <div className="flex gap-2">
              <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (₹)" className="flex-1 p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none" required />
              <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg)" className="flex-1 p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none" />
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none" />
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

      {showToast && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-[var(--earth-olive)] text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-2"><Check size={18}/> Listing Live!</div>}
    </section>
  )
}

export default AddItem
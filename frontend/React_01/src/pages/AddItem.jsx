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
  const [weight, setWeight] = useState('')
  const [description, setDescription] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const toastTimerRef = useRef(null)
  const fileInputRef = useRef(null)

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (err) {
      setCameraError(err.message || 'Could not access camera')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !streamRef.current) return
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.85))
    stopCamera()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedImage(reader.result)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeWithAI = async () => {
    setAnalyzing(true)
    await new Promise((r) => setTimeout(r, 1500)) // Simulation
    setTitle(AI_MOCK_RESPONSE.title)
    setCategory(AI_MOCK_RESPONSE.category)
    setPrice(AI_MOCK_RESPONSE.price)
    setWeight(AI_MOCK_RESPONSE.weight)
    setDescription(AI_MOCK_RESPONSE.description)
    setAnalyzing(false)
  }

  const handleListingSubmit = async (e) => {
    e.preventDefault()
    if (!title || !category || !price) return
    setUploadError(null)
    setUploading(true)

    try {
      let imageUrl = null
      if (capturedImage) {
        const fileName = `item_${Date.now()}.jpg`
        const file = dataURLtoFile(capturedImage, fileName)
        imageUrl = await uploadImageToBucket(file, 'listings', fileName)
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      const { error } = await supabase.from('listings').insert([{
        title, category, price: parseFloat(price),
        description, weight: weight ? parseFloat(weight) : null,
        image_url: imageUrl, user_id: user.id
      }])

      if (error) throw error

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
    <section className="relative flex h-full flex-col bg-[#f4f7f4]">
      <CurvedHeader title="List an Item" compact={isHeaderCompact} />
      
      <div onScroll={(e) => setIsHeaderCompact(e.currentTarget.scrollTop > 20)} className="flex-1 overflow-y-auto px-4 pb-10 pt-4">
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
          
          {uploadError && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{uploadError}</div>}
          
          <button type="submit" disabled={uploading || !title} className="w-full py-4 rounded-xl bg-[var(--deep-olive)] text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-transform active:scale-95">
            {uploading ? <Loader2 className="animate-spin mx-auto" size={20}/> : 'List Item for Swap'}
          </button>
        </form>
      </div>

      {showToast && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-[var(--earth-olive)] text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-2"><Check size={18}/> Listing Live!</div>}
    </section>
  )
}

export default AddItem
import { Check, Loader2, Sparkles, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import CurvedHeader from '../components/layout/CurvedHeader'

function AddItem({ session }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [weight, setWeight] = useState('')
  const [description, setDescription] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCapturedImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const analyzeWithAI = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setTitle('Vintage Classic Clock')
      setCategory('Home Decor')
      setPrice('850')
      setWeight('1.2')
      setDescription('Beautiful vintage clock in excellent working condition. Ready to swap!')
      setAnalyzing(false)
    }, 1500)
  }

  const handleListingSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    // Demo ke liye safe delay
    setTimeout(() => {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      setTitle('')
      setCategory('')
      setPrice('')
      setWeight('')
      setDescription('')
      setCapturedImage(null)
      setUploading(false)
    }, 1500)
  }

  return (
    <section className="relative flex h-full flex-col">
      <CurvedHeader title="List an Item" compact={false} />

      <div className="flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <div className="rounded-2xl border border-[#dce7d8] bg-white p-4 shadow-sm">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          
          {!capturedImage ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 aspect-[4/3] flex flex-col items-center justify-center text-gray-400">
                 <Upload size={32} className="mb-2 text-[var(--earth-olive)]" />
                 <p className="text-sm font-medium text-gray-500">Upload Item Photo</p>
              </div>
              <button type="button" onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--earth-olive)] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--deep-olive)]">
                <Upload size={18} /> Choose from Gallery
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={capturedImage} className="w-full h-full object-cover" alt="Preview" />
                <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full"><X size={16}/></button>
              </div>
              <button type="button" onClick={analyzeWithAI} disabled={analyzing} className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-70 transition-all hover:bg-indigo-700">
                {analyzing ? <Loader2 className="animate-spin" size={18}/> : <><Sparkles size={18}/> Analyze with AI</>}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleListingSubmit} className="mt-4 space-y-4 rounded-2xl border border-[#dce7d8] bg-white p-5 shadow-sm">
          <div className="space-y-2">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[var(--earth-olive)] focus:bg-white transition-colors" required />
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[var(--earth-olive)] focus:bg-white transition-colors" required />
            <div className="flex gap-2">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (₹)" className="flex-1 p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[var(--earth-olive)] focus:bg-white transition-colors" required />
              <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg)" className="flex-1 p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[var(--earth-olive)] focus:bg-white transition-colors" required />
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[var(--earth-olive)] focus:bg-white transition-colors resize-none" />
          </div>

          <button type="submit" disabled={!title || !category || !price || uploading || !capturedImage} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--earth-olive)] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--deep-olive)] disabled:opacity-50">
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={15} /> List Item</>}
          </button>
        </form>
      </div>

      {showToast && <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[var(--earth-olive)] text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-2"><Check size={18}/> Listing Live!</div>}
    </section>
  )
}

export default AddItem
import { Camera, Leaf, MapPin, Sparkles, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { supabase, uploadImageToBucket } from '../lib/supabaseClient';

function AddItem() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  // IMPORTANT: Replace this with your actual n8n webhook URL
  const N8N_WEBHOOK_URL = 'https://your-n8n-url.com/webhook/740e6f0a-bce8-426e-9a78-0d1dd0c7e3d1';

  const handleImageSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
  };

  const handleScanWithAI = async () => {
    if (!file) return alert("Please select an image first!");
    
    setIsLoading(true);
    setStatus('Getting location...');

    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("You must be logged in.");

        setStatus('Uploading image securely...');
        
        const fileName = `${session.user.id}/${Date.now()}-${file.name}`;
        const imageUrl = await uploadImageToBucket(file, 'listings', fileName);

        setStatus('AI is analyzing your item...');

        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: imageUrl,
            lat: latitude,
            lon: longitude,
            user_id: session.user.id,
            token: session.access_token
          })
        });

        if (response.ok) {
          setStatus('Item listed successfully!');
          alert("✨ AI successfully categorized and listed your item!");
          clearSelection(); // Reset the form after success
        } else {
          throw new Error("AI Scan failed. Please check the webhook.");
        }
      }, (err) => {
        alert("Location access is required for GeoSwap to work!");
        setIsLoading(false);
      });
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      if (!status.includes('Error')) {
        setTimeout(() => setIsLoading(false), 1500);
      } else {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="h-full overflow-y-auto bg-[#f4f7f4] px-4 pb-24 pt-4">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--deep-olive)] to-[var(--earth-olive)] px-5 pb-6 pt-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-2 h-32 w-32 rounded-full bg-[#a5b99d]/25 blur-3xl" />
        <div className="relative">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/12 backdrop-blur-sm">
            <Camera size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Snap & Sell</h1>
          <p className="mt-1 text-sm text-white/85 flex items-center gap-1.5">
            <Sparkles size={14} /> Let AI do the heavy lifting
          </p>
        </div>
      </div>

      {/* Main Upload Section */}
      <div className="mt-4 rounded-3xl border border-[#dce7d8] bg-white px-5 pb-6 pt-5 shadow-sm">
        <div className="mb-5 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[var(--deep-olive)]" /> Auto-Geofenced</span>
          <span className="flex items-center gap-1.5"><Leaf size={14} className="text-[var(--deep-olive)]" /> Carbon Tracked</span>
        </div>

        {!preview ? (
          <label className="group relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#f2f4f1] transition hover:border-[var(--earth-olive)] hover:bg-[#ebf3e8]">
            <UploadCloud size={40} className="mb-3 text-gray-400 transition group-hover:text-[var(--deep-olive)]" />
            <p className="text-sm font-medium text-gray-700">Tap to upload a photo</p>
            <p className="mt-1 text-xs text-gray-500">Only 1 photo needed for the AI</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageSelect}
            />
          </label>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200">
            <img src={preview} alt="Item preview" className="h-64 w-full object-cover" />
            <button 
              onClick={clearSelection}
              className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/70"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={handleScanWithAI}
          disabled={!file || isLoading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--earth-olive)] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--deep-olive)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-pulse">{status}</span>
          ) : (
            <>
              <Sparkles size={18} />
              Scan with AI & List Item
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export default AddItem;
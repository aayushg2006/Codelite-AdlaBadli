import { Camera, Leaf, MapPin, Sparkles, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { supabase, uploadImageToBucket } from '../lib/supabaseClient';

function AddItem() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [aiData, setAiData] = useState(null);

  // Directly call your local Express backend
  const API_BASE_URL = 'http://localhost:3000/api';

  const handleImageSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setAiData(null); 
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setAiData(null);
  };

  const handleScanWithAI = async () => {
    if (!file) return alert("Please select an image first!");
    setIsLoading(true);
    setStatus('Uploading image securely...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fileName = `${session?.user?.id || 'guest'}/${Date.now()}-${file.name}`;
      
      const imageUrl = await uploadImageToBucket(file, 'listings', fileName);

      setStatus('AI is analyzing your item...');

      const response = await fetch(`${API_BASE_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        const textResponse = await response.text();
        try {
          const errData = JSON.parse(textResponse);
          throw new Error(errData.error || "AI Scan failed.");
        } catch (e) {
          throw new Error(`Server Error (${response.status}): The backend endpoint crashed or doesn't exist.`);
        }
      }
      
      const parsedData = await response.json();

      setAiData({ ...parsedData, imageUrl });
      setStatus('');
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmListing = async () => {
    setIsLoading(true);
    setStatus('Getting Location & Publishing...');
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });

      const { latitude, longitude } = position.coords;
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${API_BASE_URL}/listings/ai-webhook`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          itemName: aiData.itemName,
          category: aiData.category,
          suggestedPriceINR: aiData.suggestedPriceINR,
          estimatedWeightKg: aiData.estimatedWeightKg,
          description: aiData.description, 
          imageUrl: aiData.imageUrl, // FIXED: Sent the image URL back to the server
          lat: latitude,
          lon: longitude,
          user_id: session.user.id
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to list item");
      }

      alert("✨ Item officially listed in your 5km radius!");
      clearSelection();

    } catch (error) {
      console.error(error);
      alert(error.message === "User denied Geolocation" ? "Location access is required!" : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="h-full overflow-y-auto bg-[#f4f7f4] px-4 pb-24 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--deep-olive)] to-[var(--earth-olive)] px-5 pb-6 pt-6 text-white shadow-sm">
        <div className="relative">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/12 backdrop-blur-sm">
            <Camera size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Snap & Sell</h1>
          <p className="mt-1 text-sm text-white/85 flex items-center gap-1.5"><Sparkles size={14} /> Let AI do the heavy lifting</p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-[#dce7d8] bg-white px-5 pb-6 pt-5 shadow-sm">
        {!preview ? (
          <label className="group relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--earth-olive)] bg-[#f2f4f1]">
            <UploadCloud size={40} className="mb-3 text-[var(--earth-olive)]" />
            <p className="text-sm font-medium text-gray-700">Tap to upload a photo</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200">
            <img src={preview} alt="Preview" className="h-64 w-full object-cover" />
            <button onClick={clearSelection} className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {!aiData ? (
          <button onClick={handleScanWithAI} disabled={!file || isLoading} className="mt-5 w-full flex justify-center items-center gap-2 rounded-xl bg-[var(--earth-olive)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--deep-olive)] disabled:opacity-50">
            {isLoading ? status : <><Sparkles size={18} /> Scan with AI</>}
          </button>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="p-3 bg-green-50 text-green-800 rounded-lg text-xs font-medium mb-4 flex items-center gap-2">
              <Sparkles size={14}/> AI Extraction Complete
            </div>
            
            <label className="block text-xs font-semibold text-gray-600">Item Name
              <input type="text" value={aiData.itemName || ''} onChange={e => setAiData({...aiData, itemName: e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm" />
            </label>

            <label className="block text-xs font-semibold text-gray-600">AI Description
              <textarea 
                rows="3" 
                value={aiData.description || ''} 
                onChange={e => setAiData({...aiData, description: e.target.value})} 
                className="mt-1 w-full rounded-lg border p-2 text-sm resize-none" 
              />
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-gray-600">Category
                <input type="text" value={aiData.category || ''} onChange={e => setAiData({...aiData, category: e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm" />
              </label>
              <label className="block text-xs font-semibold text-gray-600">Price (₹)
                <input type="number" value={aiData.suggestedPriceINR || 0} onChange={e => setAiData({...aiData, suggestedPriceINR: Number(e.target.value)})} className="mt-1 w-full rounded-lg border p-2 text-sm" />
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              <Leaf size={14} className="text-green-600" />
              <span>Estimated Weight: <b>{aiData.estimatedWeightKg} kg</b> (For Carbon Offset Tracking)</span>
            </div>

            <button onClick={handleConfirmListing} disabled={isLoading} className="mt-4 w-full rounded-xl bg-[var(--deep-olive)] py-3 text-sm font-semibold text-white">
              {isLoading ? status : 'Confirm & List Item'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default AddItem;
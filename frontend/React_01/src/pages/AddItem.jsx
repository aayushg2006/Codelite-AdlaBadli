import { Camera, Leaf, MapPin, Sparkles, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { supabase, uploadImageToBucket } from '../lib/supabaseClient';

function AddItem() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [aiData, setAiData] = useState(null);

  // PUT YOUR N8N WEBHOOK URL HERE
  const N8N_WEBHOOK_URL = '/n8n-webhook/webhook/740e6f0a-bce8-426e-9a78-0d1dd0c7e3d1';

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
    setStatus('AI is analyzing your item...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fileName = `${session?.user?.id || 'guest'}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase Storage
      const imageUrl = await uploadImageToBucket(file, 'listings', fileName);

      // Send public URL to n8n to be analyzed
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) throw new Error("AI Scan failed.");
      
      const result = await response.json();
      
      // Parse Gemini response
      let parsedData = result;
      if (result[0]?.content?.parts?.[0]?.text) {
         parsedData = JSON.parse(result[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim());
      }

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
    setStatus('Publishing to neighborhood...');
    
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const { data: { session } } = await supabase.auth.getSession();
        
        // Post the confirmed data to Express
        const res = await fetch('http://localhost:3000/api/listings/ai-webhook', {
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
            description: aiData.itemName, // Fallback
            lat: latitude,
            lon: longitude,
            user_id: session.user.id
          })
        });

        if (res.ok) {
          alert("✨ Item officially listed in your 5km radius!");
          clearSelection();
        } else {
          throw new Error("Failed to list item");
        }
      }, (err) => {
        alert("Location access is required!");
        setIsLoading(false);
      });
    } catch (error) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  return (
    <section className="h-full overflow-y-auto bg-[#f4f7f4] px-4 pb-24 pt-4">
      {/* Header */}
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
            
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-gray-600">Category
                <input type="text" value={aiData.category || ''} onChange={e => setAiData({...aiData, category: e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm" />
              </label>
              <label className="block text-xs font-semibold text-gray-600">Price (₹)
                <input type="number" value={aiData.suggestedPriceINR || 0} onChange={e => setAiData({...aiData, suggestedPriceINR: Number(e.target.value)})} className="mt-1 w-full rounded-lg border p-2 text-sm" />
              </label>
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
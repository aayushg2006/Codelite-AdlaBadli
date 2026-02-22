import { Camera, ImagePlus, Leaf, Sparkles, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase, uploadImageToBucket } from '../lib/supabaseClient';

function AddItem() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [aiData, setAiData] = useState(null);
  const [banner, setBanner] = useState({ type: '', message: '' });
  const [allowManualForm, setAllowManualForm] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Directly call your local Express backend
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleImageSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setAiData(null);
      setBanner({ type: '', message: '' });
      setAllowManualForm(false);
    }
    e.target.value = '';
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (error) {
      console.error(error);
      setBanner({
        type: 'error',
        message: 'Could not access camera. Please allow camera permission.',
      });
      cameraInputRef.current?.click();
    }
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    stopCameraStream();
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const capturedFile = new File([blob], `camera-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setFile(capturedFile);
      setPreview(URL.createObjectURL(capturedFile));
      setAiData(null);
      setBanner({ type: '', message: '' });
      setAllowManualForm(false);
      closeCamera();
    }, 'image/jpeg', 0.9);
  };

  const clearSelection = ({ keepBanner = false } = {}) => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setAiData(null);
    setAllowManualForm(false);
    if (!keepBanner) {
      setBanner({ type: '', message: '' });
    }
  };

  const buildManualAiData = (imageUrl) => ({
    itemName: '',
    description: '',
    category: '',
    suggestedPriceINR: 0,
    estimatedWeightKg: 0.5,
    confidence: 0,
    captureGuidance: '',
    foregroundObject: '',
    imageUrl,
  });

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  useEffect(() => () => stopCameraStream(), []);

  const handleScanWithAI = async () => {
    if (!file) {
      setBanner({ type: 'error', message: 'Please select an image first.' });
      return;
    }
    setIsLoading(true);
    setStatus('Checking AI service...');
    setBanner({ type: '', message: '' });

    try {
      const healthResponse = await fetch(`${API_BASE_URL}/scan/health`);
      const healthData = await healthResponse.json().catch(() => ({}));
      if (healthResponse.ok && healthData?.aiConfigured === false) {
        throw new Error('AI scanner is not configured on server yet. Set GEMINI_API_KEY (or GOOGLE_API_KEY / GENAI_API_KEY) and restart backend.');
      }
    } catch (healthError) {
      // Non-blocking: continue scan if health endpoint is unavailable or older backend doesn't expose it.
      console.warn('AI health check skipped:', healthError?.message || healthError);
    }

    let uploadedImageUrl = '';
    try {
      setStatus('Uploading image securely...');
      const { data: { session } } = await supabase.auth.getSession();
      const fileName = `${session?.user?.id || 'guest'}/${Date.now()}-${file.name}`;
      
      uploadedImageUrl = await uploadImageToBucket(file, 'listings', fileName);

      setStatus('AI is analyzing your item...');

      const response = await fetch(`${API_BASE_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadedImageUrl })
      });

      if (!response.ok) {
        const textResponse = await response.text();
        let errorMessage = `Scan failed (HTTP ${response.status}).`;

        try {
          const errData = JSON.parse(textResponse);
          if (errData?.error) {
            errorMessage = errData.error;
          }
        } catch {
          if (textResponse?.trim()) {
            errorMessage = textResponse.trim();
          }
        }

        throw new Error(errorMessage);
      }
      
      const parsedData = await response.json();

      setAiData({ ...parsedData, imageUrl: uploadedImageUrl });
      setAllowManualForm(false);
      setStatus('');
    } catch (error) {
      console.error(error);
      if (!aiData && uploadedImageUrl) {
        setAiData(buildManualAiData(uploadedImageUrl));
        setAllowManualForm(true);
        setBanner({ type: '', message: '' });
      } else {
        setBanner({ type: 'error', message: error.message || 'AI scan failed. Please retry.' });
      }
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
      
      const res = await fetch(`${API_BASE_URL}/api/listings/ai-webhook`, {
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

      setBanner({
        type: 'success',
        message: 'Item listed successfully in your 5km radius.',
      });
      clearSelection({ keepBanner: true });

    } catch (error) {
      console.error(error);
      setBanner({
        type: 'error',
        message: error.message === "User denied Geolocation"
          ? "Location access is required."
          : (error.message || 'Failed to publish listing.'),
      });
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
        {banner.message && (
          <div
            className={`mb-4 rounded-lg border p-3 text-xs ${
              banner.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {banner.message}
          </div>
        )}

        {!preview ? (
          <div className="group relative flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--earth-olive)] bg-[#f2f4f1]">
            <UploadCloud size={40} className="mb-3 text-[var(--earth-olive)]" />
            <p className="text-sm font-medium text-gray-700">Tap to upload a photo</p>
            <div className="mt-5 flex w-full max-w-xs gap-3 px-4">
              <button
                type="button"
                onClick={openCamera}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--earth-olive)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--deep-olive)]"
              >
                <Camera size={14} />
                Camera
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--earth-olive)] bg-white px-3 py-2 text-xs font-semibold text-[var(--deep-olive)]"
              >
                <ImagePlus size={14} />
                Gallery
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200">
            <img src={preview} alt="Preview" className="h-64 w-full object-cover" />
            <button onClick={clearSelection} className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {!aiData ? (
          <>
            <button onClick={handleScanWithAI} disabled={!file || isLoading} className="mt-5 w-full flex justify-center items-center gap-2 rounded-xl bg-[var(--earth-olive)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--deep-olive)] disabled:opacity-50">
              {isLoading ? status : <><Sparkles size={18} /> Scan with AI</>}
            </button>
          </>
        ) : (
          <div className="mt-5 space-y-4">
            <div className={`p-3 rounded-lg text-xs font-medium mb-4 flex items-center gap-2 ${allowManualForm ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>
              <Sparkles size={14}/>
              {allowManualForm ? 'AI unavailable. Fill details manually to continue.' : 'AI Extraction Complete'}
            </div>

            {!allowManualForm && typeof aiData.confidence === 'number' && aiData.confidence < 0.65 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="font-semibold">Low confidence image detection</p>
                <p className="mt-1">{aiData.captureGuidance || 'Retake with product centered and background cleaner for better pricing accuracy.'}</p>
              </div>
            )}
            
            <label className="block text-xs font-semibold text-gray-600">Item Name
              <input type="text" value={aiData.itemName || ''} onChange={e => setAiData({...aiData, itemName: e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm" />
            </label>

            <label className="block text-xs font-semibold text-gray-600">{allowManualForm ? 'Description' : 'AI Description'}
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

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-800">Take Live Photo</h3>
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-full p-1 text-gray-600 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-72 w-full object-cover"
              />
            </div>
            <p className="px-4 pt-3 text-xs text-gray-500">
              Keep only the product in center. Avoid faces/background clutter for better AI pricing.
            </p>
            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureFromCamera}
                className="rounded-lg bg-[var(--earth-olive)] px-4 py-2 text-sm font-semibold text-white"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AddItem;

import { useState, useRef, useCallback } from 'react';

export default function DocumentUpload({ docType, onUploadComplete, onClose }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a PDF or image file (JPG, PNG, WebP).');
      return;
    }

    setError(null);

    // Create preview — PDFs show an icon, images show a thumbnail
    if (file.type === 'application/pdf') {
      setPreview({ type: 'pdf', name: file.name });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setPreview({ type: 'image', src: e.target.result });
      reader.readAsDataURL(file);
    }

    // Upload and extract
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('docType', docType);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadComplete?.(data);
    } catch (err) {
      setError(err.message || 'Failed to process document. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [docType]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const docLabel = docType === 'W2' ? 'W-2 Form' : 'Form 1042-S';
  const docDesc = docType === 'W2'
    ? 'Your W-2 is issued by your employer and shows your wages and tax withholding'
    : 'Form 1042-S shows scholarship/fellowship income and any tax withholding';

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-100 shadow-sm p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📄</span>
            Upload Your {docLabel}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{docDesc}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Drop zone */}
      {!preview && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-blue-400 bg-blue-50 scale-[1.02]'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <div className="text-4xl mb-3">📎</div>
          <p className="font-semibold text-gray-700 mb-1">
            {dragOver ? 'Drop it here!' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-sm text-gray-500">PDF, JPG, PNG, WebP supported · Max 10 MB</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded">PDF</span>
            <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded">JPG</span>
            <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded">PNG</span>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && !uploading && (
        <div className="relative">
          {preview.type === 'pdf' ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-sm">PDF</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{preview.name}</p>
                <p className="text-xs text-gray-500">Ready to process</p>
              </div>
            </div>
          ) : (
            <img
              src={preview.src}
              alt="Document preview"
              className="w-full max-h-48 object-contain rounded-xl border border-gray-200"
            />
          )}
          <button
            onClick={() => { setPreview(null); setError(null); }}
            className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80 transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {/* Loading state */}
      {uploading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-semibold text-gray-700">Processing your {docLabel}...</p>
            <p className="text-sm text-gray-500">Maya is reading your form with AI</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* Privacy note */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        🔒 Your document is processed securely and never stored on our servers
      </p>
    </div>
  );
}

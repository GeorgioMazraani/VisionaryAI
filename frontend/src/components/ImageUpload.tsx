import React, { useRef } from 'react';
import { ImagePlus } from 'lucide-react';

/* ─────────────────────────────────────────────
   Props
   ──────────────────────────────────────────── */
interface ImageUploadProps {
  /** Returns the raw File that should be uploaded with Multer */
  onImageSelect: (file: File) => void;

  /** The file picked by the user (or null if none) */
  selectedImage: File | null;

  /** Clear the selection */
  onClear: () => void;

  /** Disable interaction (e.g. while AI is thinking) */
  disabled?: boolean;
}

/* ─────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  selectedImage,
  onClear,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Handle <input type=file> changes */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    /* 5 MB guard */
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image under 5 MB');
      return;
    }

    onImageSelect(file); // hand raw file up
  };

  /* Quick preview URL (revoked automatically by browser GC) */
  const preview = selectedImage ? URL.createObjectURL(selectedImage) : null;

  return (
    <div className="relative inline-block">
      {selectedImage && preview ? (
        <>
          <img
            src={preview}
            alt="Selected"
            className="max-h-20 rounded-lg"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white
                       rounded-full w-6 h-6 flex items-center justify-center
                       hover:bg-red-600 disabled:opacity-40"
          >
            ×
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className={`inline-flex items-center gap-2 text-gray-400
                      hover:text-gray-300 transition-colors
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className="w-6 h-6 flex items-center justify-center">
            <ImagePlus className="w-5 h-5" />
          </span>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

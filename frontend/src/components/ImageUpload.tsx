import React, { useRef } from 'react';
import { ImagePlus } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (dataUrl: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  selectedImage,
  onClear
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Please select an image under 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImageSelect(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      {selectedImage ? (
        <div className="relative inline-block">
          <img
            src={selectedImage}
            alt="Selected"
            className="max-h-20 rounded-lg"
          />
          <button
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            type="button"
          >
            ×
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 cursor-pointer transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <ImagePlus className="w-5 h-5" />
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
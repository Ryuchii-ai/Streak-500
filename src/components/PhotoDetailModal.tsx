import React, { useRef } from 'react';
import { PhotoFrameData } from '../types';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { sounds } from '../utils/audio';

interface Props {
  selectedIndex: number | null;
  onClose: () => void;
  photos: PhotoFrameData[];
  onUpdatePhoto: (index: number, updated: Partial<PhotoFrameData>) => void;
}

export const PhotoDetailModal: React.FC<Props> = ({
  selectedIndex,
  onClose,
  photos,
  onUpdatePhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (selectedIndex === null) return null;

  const currentPhoto = photos[selectedIndex];
  if (!currentPhoto) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onUpdatePhoto(selectedIndex, { url: base64 });
        sounds.playChime();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="photo-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="photo-modal-content"
        className="relative w-full max-w-md bg-stone-900 text-stone-100 rounded-2xl shadow-2xl p-6 border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-photo-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-orange-400" />
          <h3 className="font-bold text-lg text-white">
            Bingkai Foto #{selectedIndex + 1}
          </h3>
        </div>

        {/* Photo Preview Container */}
        <div className="relative aspect-[3/4] w-full max-h-72 mx-auto bg-stone-950 rounded-xl overflow-hidden border-2 border-stone-700 shadow-inner flex items-center justify-center mb-4">
          {currentPhoto.url ? (
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-stone-400">
              <span className="text-5xl mb-3">
                {['🔥', '🏆', '⚡', '👑'][selectedIndex % 4]}
              </span>
              <p className="text-sm font-semibold text-stone-300">
                {currentPhoto.title}
              </p>
              <p className="text-xs text-orange-400 mt-1">
                Milestone Hari ke-{125 * (selectedIndex + 1)} Streak
              </p>
            </div>
          )}
        </div>

        {/* Caption & Title Edit */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">
              Judul Foto / Momen:
            </label>
            <input
              type="text"
              value={currentPhoto.title}
              onChange={(e) =>
                onUpdatePhoto(selectedIndex, { title: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Contoh: Awal Perjalanan Streak"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">
              Keterangan:
            </label>
            <input
              type="text"
              value={currentPhoto.caption}
              onChange={(e) =>
                onUpdatePhoto(selectedIndex, { caption: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Catatan kecil momen..."
            />
          </div>
        </div>

        {/* Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="flex gap-2">
          <button
            type="button"
            id="btn-upload-photo"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm rounded-xl transition-colors shadow"
          >
            <Upload className="w-4 h-4" />
            Upload Foto Sendiri
          </button>
          {currentPhoto.url && (
            <button
              type="button"
              id="btn-remove-custom-photo"
              onClick={() => onUpdatePhoto(selectedIndex, { url: '' })}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-sm rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

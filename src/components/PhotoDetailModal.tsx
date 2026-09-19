import React, { useRef, useState } from 'react';
import { PhotoFrameData } from '../types';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Flame, Award, Zap, Crown, Upload, RotateCcw } from 'lucide-react';

interface Props {
  selectedIndex: number | null;
  onClose: () => void;
  photos: PhotoFrameData[];
  onSelectPhoto?: (index: number) => void;
  onUpdatePhoto?: (index: number, updated: Partial<PhotoFrameData>) => void;
}

export const PhotoDetailModal: React.FC<Props> = ({
  selectedIndex,
  onClose,
  photos,
  onSelectPhoto,
  onUpdatePhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (selectedIndex === null) return null;

  const currentPhoto = photos[selectedIndex];
  if (!currentPhoto) return null;

  const totalPhotos = photos.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectPhoto) {
      onSelectPhoto((selectedIndex - 1 + totalPhotos) % totalPhotos);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectPhoto) {
      onSelectPhoto((selectedIndex + 1) % totalPhotos);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdatePhoto) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUpdatePhoto(selectedIndex, { url: dataUrl });
      };
      reader.readAsDataURL(file);
    }
    // reset input value so re-uploading same file triggers change
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onUpdatePhoto) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUpdatePhoto(selectedIndex, { url: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const defaultAssetUrls = [
    '/assets/api-100.svg',
    '/assets/api-300.svg',
    '/assets/api-400.svg',
    '/assets/api-500.svg',
  ];

  const isCustomPhoto = currentPhoto.url && !defaultAssetUrls.includes(currentPhoto.url);

  const handleResetPhoto = () => {
    if (onUpdatePhoto) {
      onUpdatePhoto(selectedIndex, { url: defaultAssetUrls[selectedIndex] || '' });
    }
  };

  const milestoneInfo = [
    {
      days: 100,
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      color: 'from-orange-500 to-amber-600',
      badge: 'Day 100 (awal)',
      quote: 'Langkah awal 100 hari menyalakan api konsistensi yang tulus.',
    },
    {
      days: 300,
      icon: <Award className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500 to-fuchsia-600',
      badge: 'Day 300 (running)',
      quote: '300 hari obrolan & 10,8 RB pesan, terus berlari tanpa ragu.',
    },
    {
      days: 400,
      icon: <Zap className="w-5 h-5 text-pink-400" />,
      color: 'from-fuchsia-500 to-pink-600',
      badge: 'Day 400 (always)',
      quote: 'Always... karena sejak dulu hingga kini, itu selalu tentang kamu.',
    },
    {
      days: 500,
      icon: <Crown className="w-5 h-5 text-amber-300" />,
      color: 'from-purple-600 to-pink-600',
      badge: 'Day 500 (still...)',
      quote: '500 Hari: "deep down, im still the same. I haven\'t changed"',
    },
  ][selectedIndex % 4];

  return (
    <div
      id="photo-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        id="photo-modal-content"
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-stone-900/95 text-stone-100 rounded-3xl shadow-2xl p-5 sm:p-6 border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-photo-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors z-10"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-4 pr-8">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">
              Bingkai Kenangan #{selectedIndex + 1}
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {selectedIndex + 1} / {totalPhotos}
          </span>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Photo Display Card with Golden Wood Bevel and Drag & Drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative aspect-[9/16] w-full max-h-[380px] mx-auto bg-stone-950 rounded-2xl overflow-hidden border-4 shadow-2xl flex items-center justify-center mb-3 group transition-all ${
            isDragging
              ? 'border-amber-400 ring-4 ring-amber-400/40 scale-[1.01]'
              : 'border-amber-900/40'
          }`}
        >
          {currentPhoto.url ? (
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              className="w-full h-full object-contain bg-[#eed5fc]"
            />
          ) : (
            <div
              className={`w-full h-full flex flex-col items-center justify-between p-6 text-center bg-gradient-to-b ${milestoneInfo.color} relative overflow-hidden`}
            >
              {/* Background ambient lighting */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

              {/* Top milestone tag */}
              <div className="relative z-10 w-full flex justify-between items-center text-xs text-white/90">
                <span className="font-mono font-bold tracking-widest uppercase text-[10px] bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
                  Day {milestoneInfo.days}
                </span>
                <span className="text-sm">⭐</span>
              </div>

              {/* Center icon artwork */}
              <div className="relative z-10 my-auto flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/40 border-2 border-amber-300/80 flex items-center justify-center shadow-2xl mb-3">
                  <span className="text-4xl sm:text-5xl">
                    {['🔥', '🏆', '⚡', '👑'][selectedIndex % 4]}
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-white drop-shadow-md tracking-tight">
                  {currentPhoto.title}
                </h4>
                <p className="text-xs text-amber-200/90 font-medium max-w-[240px] mt-1 drop-shadow">
                  {milestoneInfo.badge}
                </p>
              </div>

              {/* Bottom streak quote */}
              <div className="relative z-10 w-full bg-black/50 p-2.5 rounded-xl border border-white/15 text-[11px] text-stone-200 leading-snug">
                "{milestoneInfo.quote}"
              </div>
            </div>
          )}

          {/* Drag Overlay indicator */}
          {isDragging && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-amber-300 font-bold text-sm z-20 pointer-events-none animate-pulse">
              <Upload className="w-8 h-8 mb-2 text-amber-400" />
              Lepaskan file foto di sini!
            </div>
          )}

          {/* Prev / Next Navigation Arrows */}
          {onSelectPhoto && totalPhotos > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 backdrop-blur-sm border border-white/20 active:scale-95"
                title="Foto Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 backdrop-blur-sm border border-white/20 active:scale-95"
                title="Foto Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Action Bar: Upload Real Photo / Reset */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-all active:scale-98"
            title="Pilih file gambar asli dari perangkat"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ganti Foto Ini (Pilih File)</span>
          </button>

          {isCustomPhoto && (
            <button
              type="button"
              onClick={handleResetPhoto}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 active:scale-98"
              title="Kembalikan ke ilustrasi bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Thumbnail Dots Indicator */}
        {onSelectPhoto && totalPhotos > 1 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => onSelectPhoto(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === selectedIndex
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-stone-700 hover:bg-stone-500'
                }`}
                title={`Lihat Foto #${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Title & Caption Card (Permanent view) */}
        <div className="space-y-2.5 bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80 mb-4">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
            {milestoneInfo.icon}
            <span>{currentPhoto.title}</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {currentPhoto.caption}
          </p>
        </div>

        {/* Close / Return Button */}
        <button
          type="button"
          id="btn-close-photo-view"
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl transition-colors border border-stone-700 active:scale-98"
        >
          Tutup Tampilan Foto
        </button>
      </div>
    </div>
  );
};

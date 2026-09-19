import React from 'react';
import { PhotoFrameData } from '../types';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Flame, Award, Zap, Crown } from 'lucide-react';

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
}) => {
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

  const milestoneInfo = [
    {
      days: 125,
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      color: 'from-orange-500 to-amber-600',
      badge: 'Fase 1: Komitmen Awal',
      quote: 'Langkah awal 125 hari membakar keraguan dan menyalakan konsistensi sejati.',
    },
    {
      days: 250,
      icon: <Award className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500 to-yellow-600',
      badge: 'Fase 2: Konsistensi Kuat',
      quote: 'Setengah jalan menuju 500 hari, tekad telah tertempa menjadi kebiasaan tak tergoyahkan.',
    },
    {
      days: 375,
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      color: 'from-yellow-500 to-orange-600',
      badge: 'Fase 3: Api Membara',
      quote: 'Disiplin mengakar kuat dalam setiap tantangan, membakar semangat setiap fajar.',
    },
    {
      days: 500,
      icon: <Crown className="w-5 h-5 text-amber-300" />,
      color: 'from-amber-400 to-red-600',
      badge: 'Puncak Legenda: 500 Hari!',
      quote: 'Pencapaian emas 500 hari streak tanpa putus. Bukti nyata dedikasi dan tekad baja!',
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

        {/* Photo Display Card with Golden Wood Bevel */}
        <div className="relative aspect-[3/4] w-full max-h-80 mx-auto bg-stone-950 rounded-2xl overflow-hidden border-4 border-amber-900/40 shadow-2xl flex items-center justify-center mb-4 group">
          {currentPhoto.url ? (
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              className="w-full h-full object-cover"
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

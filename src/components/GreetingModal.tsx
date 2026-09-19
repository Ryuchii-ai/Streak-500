import React from 'react';
import { GreetingData } from '../types';
import { X, Sparkles, Heart } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  greeting: GreetingData;
  onSaveGreeting?: (updated: GreetingData) => void;
}

export const GreetingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  greeting,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="greeting-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        id="greeting-modal-content"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#faf6ed] to-[#f4ebe0] text-[#2c221e] rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-[#e6d7bf] transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="btn-close-greeting"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/80 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative Envelope Header & Wax Seal */}
        <div className="flex items-center gap-3.5 border-b-2 border-[#e6d7bf] pb-5 mb-5">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
            🔥
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border border-white">
              500
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-orange-950 font-serif">
                CONGRATS 500 DAYS!
              </h2>
              <span className="bg-red-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                {greeting.streakDays} Hari Streak
              </span>
            </div>
            <p className="text-xs text-orange-900/75 font-medium mt-0.5">
              Kartu Ucapan Resmi Perayaan Konsistensi 500 Hari
            </p>
          </div>
        </div>

        {/* Card Body (Read-only permanent presentation) */}
        <div className="space-y-4">
          {/* Recipient Ribbon */}
          <div className="bg-[#f0e7d8] px-4 py-3 rounded-2xl border border-[#ded1be] flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-orange-900/60 font-bold block">
                Penerima:
              </span>
              <span className="text-lg sm:text-xl font-black text-stone-900">
                {greeting.recipient}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-orange-700 font-semibold bg-orange-100/80 px-2.5 py-1 rounded-xl border border-orange-200">
              <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              <span>Special Milestone</span>
            </div>
          </div>

          {/* Letter Parchment Message */}
          <div className="relative p-5 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#ded1be] shadow-inner text-stone-800 leading-relaxed font-sans">
            {/* Subtle quotation watermark */}
            <span className="absolute top-2 right-4 text-5xl font-serif text-orange-200/50 pointer-events-none select-none">
              “
            </span>

            <p className="whitespace-pre-line text-sm sm:text-base font-normal text-stone-800 leading-relaxed">
              {greeting.message}
            </p>
          </div>

          {/* Signature & Date Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3 text-xs text-stone-600 border-t border-[#e6d7bf]">
            <div>
              <span className="font-bold text-stone-800">Dari:</span>{' '}
              <span className="font-semibold text-orange-950">{greeting.sender}</span>
            </div>
            <div className="font-mono text-stone-500 text-[11px] bg-[#ede3d1] px-2.5 py-1 rounded-lg">
              📅 {greeting.dateStr}
            </div>
          </div>

          {/* Action Button: Simple Close & Enjoy 3D scene */}
          <div className="pt-2">
            <button
              id="btn-close-card-view"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-sm py-3 px-5 rounded-2xl shadow-lg transition-transform active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>Kembali ke Pesta 3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Mail,
  RotateCcw,
  Info,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface Props {
  isFlameLit: boolean;
  onToggleFlame: () => void;
  onTriggerCelebrate: () => void;
  onOpenCard: () => void;
  onOpenPhotoList: () => void;
  streakDays: number;
}

export const OverlayControls: React.FC<Props> = ({
  isFlameLit,
  onToggleFlame,
  onTriggerCelebrate,
  onOpenCard,
  onOpenPhotoList,
  streakDays,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleConfettiBlast = () => {
    onTriggerCelebrate();

    // Trigger realistic canvas-confetti blast from bottom left and right
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.15, y: 0.8 },
      colors: ['#ff9a3c', '#ff6f3c', '#ffeedb', '#ffd700', '#ff0055'],
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.85, y: 0.8 },
      colors: ['#ff9a3c', '#ff6f3c', '#ffeedb', '#ffd700', '#ff0055'],
    });
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playChime();
    }
  };

  return (
    <div
      id="overlay-controls-root"
      className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6"
    >
      {/* Top Header Bar */}
      <header className="flex items-start justify-between gap-4">
        {/* Left: Streak Title Badge */}
        <div className="pointer-events-auto bg-black/60 backdrop-blur-md border border-orange-500/30 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl animate-pulse">🔥</span>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-red-500 text-base sm:text-lg tracking-wide uppercase font-['Cinzel']">
                Congrats Streak!
              </span>
              <span className="bg-gradient-to-r from-amber-500 to-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">
                {streakDays} DAYS
              </span>
            </div>
            <p className="text-[11px] text-stone-300 font-medium tracking-wide">
              {isFlameLit ? '✨ Api Streak Membara' : '💨 Api Padam (Tekan untuk nyalakan)'}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={handleToggleSound}
            className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-stone-700 text-stone-200 hover:text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Help Tooltip */}
          <button
            id="btn-help-toggle"
            onClick={() => setShowHelp(!showHelp)}
            className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-stone-700 text-stone-200 hover:text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
            title="Bantuan Interaksi"
            aria-label="Info"
          >
            <Info className="w-4 h-4 text-blue-400" />
          </button>

          {/* Greeting Card Button */}
          <button
            id="btn-open-card-top"
            onClick={onOpenCard}
            className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-orange-600/90 to-red-600/90 hover:from-orange-500 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg backdrop-blur-md border border-orange-400/40 transition-all active:scale-95"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buka Kartu Ucapan</span>
            <span className="sm:hidden">Kartu</span>
          </button>
        </div>
      </header>

      {/* Help Overlay Box */}
      {showHelp && (
        <div className="pointer-events-auto self-end max-w-sm mt-2 bg-stone-900/95 backdrop-blur-md border border-stone-700 text-stone-200 text-xs p-4 rounded-2xl shadow-2xl space-y-2 animate-fadeIn">
          <div className="font-bold text-orange-400 flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4" /> Cara Berinteraksi di Scene 3D:
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-stone-300">
            <li><strong>Putar Kamera:</strong> Klik & geser (drag) layar ke kiri/kanan.</li>
            <li><strong>Api Streak / Lilin:</strong> Klik kue atau tekan tombol <strong>[SPASI]</strong> untuk meniup/menyalakan api streak 500 hari.</li>
            <li><strong>Bingkai Foto:</strong> Klik bingkai di atas meja untuk melihat atau mengunggah foto kamu sendiri.</li>
            <li><strong>Kartu Ucapan:</strong> Klik surat di sudut kanan meja untuk membaca dan mengedit teks ucapan.</li>
            <li><strong>Konfeti:</strong> Tekan tombol 'Ledakkan Konfeti' untuk pesta hujan konfeti yang meriah.</li>
          </ul>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <footer className="flex flex-col items-center gap-3">
        {/* Main Central Prompt (Matching reference: "PRESS SPACE TO BLOW OUT THE CANDLE") */}
        <div className="pointer-events-auto bg-black/70 backdrop-blur-md border border-stone-700/80 px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-center">
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-bold text-stone-300 bg-stone-800 border border-stone-600 rounded">
            SPACE
          </kbd>
          <span className="text-xs sm:text-sm font-medium tracking-wider text-stone-200 uppercase font-mono">
            {isFlameLit
              ? 'TEKAN [SPASI] ATAU KLIK API UNTUK MENIUP LILIN STREAK'
              : 'TEKAN [SPASI] ATAU KLIK KUE UNTUK MENYALAKAN API STREAK 🔥'}
          </span>
        </div>

        {/* Quick Action Floating Pill */}
        <div className="pointer-events-auto flex items-center flex-wrap justify-center gap-2 bg-black/60 backdrop-blur-md border border-stone-800 p-1.5 rounded-2xl shadow-xl">
          {/* Confetti blast button */}
          <button
            id="btn-trigger-confetti"
            onClick={handleConfettiBlast}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs transition-transform active:scale-95 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Ledakkan Konfeti 🎊</span>
          </button>

          {/* Flame toggle button */}
          <button
            id="btn-toggle-flame"
            onClick={onToggleFlame}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-colors shadow-md ${
              isFlameLit
                ? 'bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-200'
                : 'bg-orange-600 hover:bg-orange-500 text-white animate-pulse'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>{isFlameLit ? 'Tiup Api' : 'Nyalakan Api 🔥'}</span>
          </button>

          {/* Photo Frame Manager button */}
          <button
            id="btn-open-frames"
            onClick={onOpenPhotoList}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Foto Kenangan</span>
          </button>

          {/* Open Card button */}
          <button
            id="btn-open-card-bottom"
            onClick={onOpenCard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            <Mail className="w-4 h-4 text-orange-400" />
            <span>Kartu Ucapan</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

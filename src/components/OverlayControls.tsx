import React, { useState, useEffect } from 'react';
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
  Music,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { musicManager } from '../utils/musicManager';

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
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const unsubscribe = musicManager.subscribe((state) => {
      setIsMusicPlaying(state.isPlaying);
    });
    musicManager.loadDefaultTrack();
    return () => unsubscribe();
  }, []);

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

  const handleToggleMusic = () => {
    musicManager.togglePlay();
  };

  return (
    <div
      id="overlay-controls-root"
      className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-6"
    >
      {/* Top Header Bar: Clean top right controls (No title, minimal button like mute audio) */}
      <header className="flex items-start justify-end gap-2 sm:gap-3 w-full">
        {/* Right: Quick Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Music Play / Pause Toggle (Styled identical to mute audio button) */}
          <button
            id="btn-music-toggle"
            onClick={handleToggleMusic}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border text-stone-200 hover:text-white flex items-center justify-center transition-all shadow-lg active:scale-95 ${
              isMusicPlaying
                ? 'border-amber-500/60 text-amber-400 shadow-amber-500/10'
                : 'border-stone-700 text-stone-400'
            }`}
            title={isMusicPlaying ? 'Berhentikan Lagu (Jeda)' : 'Lanjutkan Lagu (Putar)'}
            aria-label="Toggle Music"
          >
            {isMusicPlaying ? (
              <div className="relative flex items-center justify-center">
                <Music className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <Music className="w-4 h-4 text-stone-500" />
                <span className="absolute w-4 h-0.5 bg-red-400/90 rotate-45 rounded-full" />
              </div>
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={handleToggleSound}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-stone-700 text-stone-200 hover:text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
            title={isMuted ? 'Nyalakan Efek Suara' : 'Matikan Efek Suara'}
            aria-label="Toggle Sound Effects"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Help Tooltip */}
          <button
            id="btn-help-toggle"
            onClick={() => setShowHelp(!showHelp)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-stone-700 text-stone-200 hover:text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
            title="Bantuan Interaksi"
            aria-label="Info"
          >
            <Info className="w-4 h-4 text-blue-400" />
          </button>

          {/* Greeting Card Button */}
          <button
            id="btn-open-card-top"
            onClick={onOpenCard}
            className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-orange-600/90 to-red-600/90 hover:from-orange-500 hover:to-red-500 text-white font-semibold text-xs flex items-center gap-1.5 sm:gap-2 shadow-lg backdrop-blur-md border border-orange-400/40 transition-all active:scale-95"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buka Kartu</span>
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
            <li><strong>Lagu Musik:</strong> Tekan ikon musik di kanan atas (atau tombol <strong>[M]</strong>) untuk memutar, menghentikan, dan melanjutkan lagu perayaan.</li>
            <li><strong>Putar Kamera:</strong> Geser (swipe/drag) layar ke kiri atau kanan.</li>
            <li><strong>Api Streak / Lilin:</strong> Ketuk kue atau tekan <strong>[SPASI]</strong> untuk meniup/menyalakan api streak 500 hari.</li>
            <li><strong>Bingkai Foto:</strong> Ketuk bingkai foto di atas meja untuk melihat atau mengunggah foto.</li>
            <li><strong>Kartu Ucapan:</strong> Ketuk surat di atas meja untuk membuka kartu ucapan.</li>
            <li><strong>Konfeti:</strong> Tekan tombol 'Ledakkan Konfeti' untuk pesta konfeti.</li>
          </ul>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <footer className="flex flex-col items-center gap-2.5 sm:gap-3 w-full pb-1 sm:pb-0">
        {/* Main Central Prompt (Matching reference: "PRESS SPACE TO BLOW OUT THE CANDLE") */}
        <div className="pointer-events-auto bg-black/75 backdrop-blur-md border border-stone-700/80 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-2xl flex items-center justify-center gap-2 sm:gap-3 text-center max-w-[92vw]">
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-bold text-stone-300 bg-stone-800 border border-stone-600 rounded">
            SPACE
          </kbd>
          <span className="text-[11px] sm:text-xs md:text-sm font-medium tracking-wider text-stone-200 uppercase font-mono truncate">
            {isFlameLit ? (
              <>
                <span className="hidden sm:inline">TEKAN [SPASI] ATAU </span>
                KETUK API UNTUK TIUP LILIN STREAK
              </>
            ) : (
              <>
                <span className="hidden sm:inline">TEKAN [SPASI] ATAU </span>
                KETUK KUE UNTUK NYALAKAN API 🔥
              </>
            )}
          </span>
        </div>

        {/* Quick Action Floating Pill */}
        <div className="pointer-events-auto flex items-center flex-wrap justify-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md border border-stone-800 p-1.5 rounded-2xl shadow-xl max-w-full">
          {/* Confetti blast button */}
          <button
            id="btn-trigger-confetti"
            onClick={handleConfettiBlast}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-[11px] sm:text-xs transition-transform active:scale-95 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Ledakkan Konfeti 🎊</span>
          </button>

          {/* Flame toggle button */}
          <button
            id="btn-toggle-flame"
            onClick={onToggleFlame}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs transition-colors shadow-md ${
              isFlameLit
                ? 'bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-200'
                : 'bg-orange-600 hover:bg-orange-500 text-white animate-pulse'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{isFlameLit ? 'Tiup Api' : 'Nyalakan Api 🔥'}</span>
          </button>

          {/* Photo Frame Manager button */}
          <button
            id="btn-open-frames"
            onClick={onOpenPhotoList}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 text-[11px] sm:text-xs font-semibold transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Foto Kenangan</span>
          </button>

          {/* Open Card button */}
          <button
            id="btn-open-card-bottom"
            onClick={onOpenCard}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 text-[11px] sm:text-xs font-semibold transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-orange-400" />
            <span>Kartu Ucapan</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

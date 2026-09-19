import React, { useState, useEffect, useCallback } from 'react';
import { Celebration3DScene } from './components/Celebration3DScene';
import { GreetingModal } from './components/GreetingModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { OverlayControls } from './components/OverlayControls';
import { GreetingData, PhotoFrameData } from './types';
import { sounds } from './utils/audio';
import { musicManager } from './utils/musicManager';

export default function App() {
  const [greeting, setGreeting] = useState<GreetingData>({
    recipient: 'Hani',
    sender: 'Bestie & Teman Seperjuangan',
    title: 'CONGRATS 500 DAYS STREAK!',
    message:
      'Selamat atas pencapaian luar biasa 500 hari streak tanpa putus! 🔥\nSetiap hari dedikasi, kerja keras, dan komitmenmu membuktikan konsistensi tanpa batas.\nTerus jaga api semangatmu agar tetap menyala membara ke hari-hari berikutnya!',
    streakDays: 500,
    dateStr: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  });

  const [photos, setPhotos] = useState<PhotoFrameData[]>([
    {
      id: 1,
      title: 'Awal Langkah (Day 125)',
      caption: 'Komitmen awal yang penuh tekad dan semangat.',
      url: '',
    },
    {
      id: 2,
      title: 'Konsisten (Day 250)',
      caption: 'Melewati berbagai tantangan tanpa memadamkan api.',
      url: '',
    },
    {
      id: 3,
      title: 'Membara (Day 375)',
      caption: 'Disiplin mengakar kuat menjadi kebiasaan emas.',
      url: '',
    },
    {
      id: 4,
      title: 'Legenda 500 Hari!',
      caption: '500 hari api menyala tanpa henti. Selamat!',
      url: '',
    },
  ]);

  const [isFlameLit, setIsFlameLit] = useState<boolean>(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const [celebrateTrigger, setCelebrateTrigger] = useState<number>(1);

  // Toggle Flame with sound
  const handleToggleFlame = useCallback(() => {
    setIsFlameLit((prev) => {
      const nextState = !prev;
      if (nextState) {
        sounds.playFlameWoosh();
        // Trigger celebratory confetti when re-igniting flame
        setCelebrateTrigger((c) => c + 1);
      } else {
        sounds.playBlowOut();
      }
      return nextState;
    });
  }, []);

  // Trigger celebration explosion
  const handleTriggerCelebrate = useCallback(() => {
    setCelebrateTrigger((c) => c + 1);
    if (!isFlameLit) {
      setIsFlameLit(true);
    }
  }, [isFlameLit]);

  // Spacebar hotkey listener (matching "PRESS SPACE TO BLOW OUT CANDLE / CELEBRATE")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleFlame();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        musicManager.togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleFlame]);

  // Update specific photo frame
  const handleUpdatePhoto = (index: number, updated: Partial<PhotoFrameData>) => {
    setPhotos((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  return (
    <main
      id="celebration-app-root"
      className="relative w-screen h-screen overflow-hidden bg-black select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* 3D WebGL Canvas Scene */}
      <Celebration3DScene
        greeting={greeting}
        photos={photos}
        isFlameLit={isFlameLit}
        onToggleFlame={handleToggleFlame}
        onSelectPhoto={(idx) => setSelectedPhotoIndex(idx)}
        onOpenCard={() => setIsCardOpen(true)}
        celebrateTrigger={celebrateTrigger}
      />

      {/* Interactive HUD & Floating Controls */}
      <OverlayControls
        isFlameLit={isFlameLit}
        onToggleFlame={handleToggleFlame}
        onTriggerCelebrate={handleTriggerCelebrate}
        onOpenCard={() => setIsCardOpen(true)}
        onOpenPhotoList={() => setSelectedPhotoIndex(0)}
        streakDays={greeting.streakDays}
      />

      {/* Greeting Card Modal */}
      <GreetingModal
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
        greeting={greeting}
        onSaveGreeting={(updated) => setGreeting(updated)}
      />

      {/* Photo Frame Detail & Upload Modal */}
      <PhotoDetailModal
        selectedIndex={selectedPhotoIndex}
        onClose={() => setSelectedPhotoIndex(null)}
        photos={photos}
        onUpdatePhoto={handleUpdatePhoto}
      />
    </main>
  );
}

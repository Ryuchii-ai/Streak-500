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
    recipient: 'Hani (@lauu)',
    sender: 'Rahulll',
    title: 'CONGRATS 500 DAYS STREAK!',
    message: `What I’ve been trying to hold onto all this time wasn’t the streak.

It was never really about the streak…

Because all this time… it was always about u.

Thank you for your time, for every moment, and for everything that happened between us.

And I’m sorry if I’ve confused you all this time. BUT please believe me… deep down, I’m still the same.

I haven’t changed.`,
    streakDays: 500,
    dateStr: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  });

  const DEFAULT_PHOTOS: PhotoFrameData[] = [
    {
      id: 1,
      title: 'Day 100 (awal)',
      caption: 'Lencana Runtunan telah ditingkatkan @lauu • 100 Hari obrolan yang sedang berlangsung',
      url: '/assets/api-100.jpg',
    },
    {
      id: 2,
      title: 'Day 300 (running)',
      caption: 'Lencana Runtunan telah ditingkatkan @lauu • 300 Hari obrolan • Pesan terkirim 10,8 RB • Hari pertemanan 303',
      url: '/assets/api-300.jpg',
    },
    {
      id: 3,
      title: 'Day 400 (always)',
      caption: 'Lencana Runtunan telah ditingkatkan @lauu • 400 Hari obrolan • Pesan terkirim 11,4 RB • Hari pertemanan 413',
      url: '/assets/api-400.jpg',
    },
    {
      id: 4,
      title: 'Day 500 (still...)',
      caption: 'Lencana Runtunan telah ditingkatkan @lauu • 500 Hari obrolan • Pesan terkirim 12,1 rb • Hari pertemanan 540',
      url: '/assets/api-500.jpg',
    },
  ];

  const [photos, setPhotos] = useState<PhotoFrameData[]>(() => {
    try {
      const saved = localStorage.getItem('streak_photos_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PHOTOS;
  });

  // Auto-play music as soon as website opens
  useEffect(() => {
    // 1. Immediately attempt autoplay
    const attemptPlay = async () => {
      try {
        await musicManager.loadDefaultTrack();
        await musicManager.play();
      } catch (err) {
        console.log('Autoplay waiting for user gesture:', err);
      }
    };
    attemptPlay();

    // 2. Fallback: if browser blocks unprompted audio autoplay,
    // trigger playback on the very first user interaction anywhere on the window
    const handleFirstGesture = () => {
      musicManager.play().catch(() => {});
      removeGestureListeners();
    };

    const gestureEvents = ['click', 'touchstart', 'pointerdown', 'keydown', 'mousedown'];
    const removeGestureListeners = () => {
      gestureEvents.forEach((evt) => window.removeEventListener(evt, handleFirstGesture));
    };

    gestureEvents.forEach((evt) =>
      window.addEventListener(evt, handleFirstGesture, { passive: true })
    );

    return () => {
      removeGestureListeners();
    };
  }, []);

  const handleUpdatePhoto = (index: number, updated: Partial<PhotoFrameData>) => {
    setPhotos((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      try {
        localStorage.setItem('streak_photos_custom', JSON.stringify(copy));
      } catch (err) {
        console.warn('Could not save to localStorage', err);
      }
      return copy;
    });
  };

  // Auto-detect if user uploaded api-*.jpg files directly into public assets
  useEffect(() => {
    const checkFile = async (path: string) => {
      try {
        const res = await fetch(path, { method: 'HEAD' });
        return res.ok;
      } catch {
        return false;
      }
    };
    const detectJpgs = async () => {
      const candidates = [
        { index: 0, paths: ['/assets/api-100.jpg', '/api-100.jpg'] },
        { index: 1, paths: ['/assets/api-300.jpg', '/api-300.jpg'] },
        { index: 2, paths: ['/assets/api-400.jpg', '/api-400.jpg'] },
        { index: 3, paths: ['/assets/api-500.jpg', '/api-500.jpg'] },
      ];
      for (const item of candidates) {
        for (const p of item.paths) {
          const exists = await checkFile(p);
          if (exists) {
            setPhotos((prev) => {
              if (prev[item.index].url === p) return prev;
              const next = [...prev];
              next[item.index] = { ...next[item.index], url: p };
              return next;
            });
            break;
          }
        }
      }
    };
    detectJpgs();
  }, []);

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
      // Don't trigger if modal is open
      if (isCardOpen || selectedPhotoIndex !== null) {
        return;
      }

      // Don't trigger if user is typing in an input field or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault();
        // If a button is focused, blur it so it doesn't fire a second synthetic click
        if (target && typeof target.blur === 'function') {
          target.blur();
        }
        handleToggleFlame();
      } else if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        musicManager.togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleFlame, isCardOpen, selectedPhotoIndex]);

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

      {/* Photo Frame Detail & Showcase Modal */}
      <PhotoDetailModal
        selectedIndex={selectedPhotoIndex}
        onClose={() => setSelectedPhotoIndex(null)}
        photos={photos}
        onSelectPhoto={(idx) => setSelectedPhotoIndex(idx)}
        onUpdatePhoto={handleUpdatePhoto}
      />
    </main>
  );
}

// Realistic Grand Piano Synthesizer and Sequencer for "Memories" by Maroon 5
// (Piano Instrumental - matching the celebration video uploaded by user)

interface NoteEvent {
  time: number;       // in seconds
  note: string;       // e.g. "C4", "E5"
  duration: number;   // in seconds
  velocity: number;   // 0.0 to 1.0
  isBass?: boolean;
}

// Note frequencies map
const NOTE_FREQS: Record<string, number> = {
  // Octave 2
  E2: 82.41,
  F2: 87.31,
  G2: 98.00,
  A2: 110.00,
  B2: 123.47,
  // Octave 3
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  B3: 246.94,
  // Octave 4
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  // Octave 5
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.00,
  B5: 987.77,
  // Octave 6
  C6: 1046.50,
  D6: 1174.66,
  E6: 1318.51,
  G6: 1567.98,
};

// Generates the musical score for "Memories" (Maroon 5 - Piano Instrumental)
// Tempo: 90 BPM => 1 beat = 0.667s, 1 measure (4 beats) = 2.667s
function generateMemoriesScore(): { score: NoteEvent[]; totalDuration: number } {
  const bpm = 90;
  const beat = 60 / bpm; // ~0.667s
  const score: NoteEvent[] = [];

  let t = 0;

  // Helper for adding arpeggiated piano chords in left hand
  const addChord = (startTime: number, bass: string, triad: [string, string, string], duration: number) => {
    // Root bass note
    score.push({ time: startTime, note: bass, duration: duration * 1.2, velocity: 0.58, isBass: true });
    // Soft arpeggiated pattern: Root -> 5th -> 3rd -> 5th
    score.push({ time: startTime, note: triad[0], duration: beat * 0.9, velocity: 0.38 });
    score.push({ time: startTime + beat * 0.5, note: triad[1], duration: beat * 0.9, velocity: 0.34 });
    score.push({ time: startTime + beat * 1.0, note: triad[2], duration: beat * 0.9, velocity: 0.36 });
    score.push({ time: startTime + beat * 1.5, note: triad[1], duration: beat * 0.9, velocity: 0.32 });
    score.push({ time: startTime + beat * 2.0, note: triad[0], duration: beat * 0.9, velocity: 0.36 });
    score.push({ time: startTime + beat * 2.5, note: triad[2], duration: beat * 0.9, velocity: 0.34 });
    score.push({ time: startTime + beat * 3.0, note: triad[1], duration: beat * 0.9, velocity: 0.32 });
    score.push({ time: startTime + beat * 3.5, note: triad[2], duration: beat * 0.9, velocity: 0.30 });
  };

  // Helper for melody notes
  const addMelody = (startTime: number, note: string, duration: number, velocity: number = 0.72) => {
    score.push({ time: startTime, note, duration, velocity });
  };

  // --- INTRO (2 Measures / 5.33s) Gentle chords opening ---
  addChord(t, 'C3', ['C4', 'E4', 'G4'], beat * 4);
  // Add gentle high intro sparkle
  addMelody(t + beat * 1.0, 'G5', beat * 1.2, 0.45);
  addMelody(t + beat * 2.5, 'E5', beat * 1.5, 0.48);
  t += beat * 4;

  addChord(t, 'G2', ['B3', 'D4', 'G4'], beat * 4);
  addMelody(t + beat * 1.0, 'D5', beat * 1.2, 0.46);
  addMelody(t + beat * 2.5, 'C5', beat * 1.5, 0.50);
  t += beat * 4;

  // --- SECTION 1 (Iconic Theme of "Memories") ---
  // Measure 1: C Major ("Here's to the ones that we got")
  addChord(t, 'C3', ['C4', 'E4', 'G4'], beat * 4);
  addMelody(t + beat * 0.0, 'E5', beat * 0.6, 0.76);
  addMelody(t + beat * 0.75, 'E5', beat * 0.4, 0.72);
  addMelody(t + beat * 1.25, 'E5', beat * 0.4, 0.74);
  addMelody(t + beat * 1.75, 'E5', beat * 0.4, 0.75);
  addMelody(t + beat * 2.25, 'D5', beat * 0.45, 0.72);
  addMelody(t + beat * 2.75, 'C5', beat * 0.45, 0.70);
  addMelody(t + beat * 3.25, 'C5', beat * 0.8, 0.75);
  t += beat * 4;

  // Measure 2: G Major ("Cheers to the wish you were here, but you're not")
  addChord(t, 'B2', ['B3', 'D4', 'G4'], beat * 4);
  addMelody(t + beat * 0.0, 'E5', beat * 0.6, 0.75);
  addMelody(t + beat * 0.75, 'E5', beat * 0.4, 0.72);
  addMelody(t + beat * 1.25, 'E5', beat * 0.4, 0.74);
  addMelody(t + beat * 1.75, 'E5', beat * 0.4, 0.75);
  addMelody(t + beat * 2.25, 'D5', beat * 0.45, 0.72);
  addMelody(t + beat * 2.75, 'C5', beat * 0.45, 0.70);
  addMelody(t + beat * 3.25, 'D5', beat * 1.2, 0.78);
  t += beat * 4;

  // Measure 3: A Minor ("Cause the drinks bring back all the memories")
  addChord(t, 'A2', ['A3', 'C4', 'E4'], beat * 4);
  addMelody(t + beat * 0.0, 'E5', beat * 0.6, 0.76);
  addMelody(t + beat * 0.75, 'E5', beat * 0.4, 0.73);
  addMelody(t + beat * 1.25, 'E5', beat * 0.4, 0.75);
  addMelody(t + beat * 1.75, 'E5', beat * 0.4, 0.76);
  addMelody(t + beat * 2.25, 'D5', beat * 0.45, 0.72);
  addMelody(t + beat * 2.75, 'C5', beat * 0.45, 0.72);
  addMelody(t + beat * 3.25, 'C5', beat * 0.4, 0.74);
  addMelody(t + beat * 3.75, 'A4', beat * 0.6, 0.68);
  t += beat * 4;

  // Measure 4: E Minor ("Of everything we've been through")
  addChord(t, 'E2', ['G3', 'B3', 'E4'], beat * 4);
  addMelody(t + beat * 0.25, 'A4', beat * 0.35, 0.68);
  addMelody(t + beat * 0.75, 'C5', beat * 0.4, 0.72);
  addMelody(t + beat * 1.25, 'D5', beat * 0.45, 0.74);
  addMelody(t + beat * 1.75, 'C5', beat * 0.45, 0.72);
  addMelody(t + beat * 2.25, 'D5', beat * 0.45, 0.75);
  addMelody(t + beat * 2.75, 'E5', beat * 0.45, 0.78);
  addMelody(t + beat * 3.25, 'D5', beat * 0.45, 0.72);
  addMelody(t + beat * 3.75, 'C5', beat * 0.8, 0.70);
  t += beat * 4;

  // Measure 5: F Major ("Toast to the ones here today")
  addChord(t, 'F2', ['A3', 'C4', 'F4'], beat * 4);
  addMelody(t + beat * 0.0, 'E5', beat * 0.6, 0.76);
  addMelody(t + beat * 0.75, 'E5', beat * 0.4, 0.72);
  addMelody(t + beat * 1.25, 'E5', beat * 0.4, 0.74);
  addMelody(t + beat * 1.75, 'E5', beat * 0.4, 0.75);
  addMelody(t + beat * 2.25, 'D5', beat * 0.45, 0.72);
  addMelody(t + beat * 2.75, 'C5', beat * 0.45, 0.70);
  addMelody(t + beat * 3.25, 'C5', beat * 0.8, 0.75);
  t += beat * 4;

  // Measure 6: C Major ("Toast to the ones that we lost on the way")
  addChord(t, 'E2', ['G3', 'C4', 'E4'], beat * 4);
  addMelody(t + beat * 0.0, 'E5', beat * 0.6, 0.75);
  addMelody(t + beat * 0.75, 'E5', beat * 0.4, 0.72);
  addMelody(t + beat * 1.25, 'E5', beat * 0.4, 0.74);
  addMelody(t + beat * 1.75, 'E5', beat * 0.4, 0.75);
  addMelody(t + beat * 2.25, 'D5', beat * 0.45, 0.72);
  addMelody(t + beat * 2.75, 'C5', beat * 0.45, 0.70);
  addMelody(t + beat * 3.25, 'D5', beat * 1.2, 0.78);
  t += beat * 4;

  // Measure 7: F Major ("Cause the drinks bring back all the memories")
  addChord(t, 'F2', ['A3', 'C4', 'F4'], beat * 4);
  addMelody(t + beat * 0.0, 'E5', beat * 0.6, 0.76);
  addMelody(t + beat * 0.75, 'E5', beat * 0.4, 0.72);
  addMelody(t + beat * 1.25, 'E5', beat * 0.4, 0.74);
  addMelody(t + beat * 1.75, 'E5', beat * 0.4, 0.75);
  addMelody(t + beat * 2.25, 'D5', beat * 0.45, 0.72);
  addMelody(t + beat * 2.75, 'C5', beat * 0.45, 0.72);
  addMelody(t + beat * 3.25, 'C5', beat * 0.4, 0.74);
  addMelody(t + beat * 3.75, 'A4', beat * 0.6, 0.68);
  t += beat * 4;

  // Measure 8: G Major ("And the memories bring back, memories bring back you")
  addChord(t, 'G2', ['B3', 'D4', 'G4'], beat * 4);
  addMelody(t + beat * 0.0, 'C5', beat * 0.35, 0.72);
  addMelody(t + beat * 0.5, 'D5', beat * 0.35, 0.74);
  addMelody(t + beat * 1.0, 'E5', beat * 0.5, 0.80);
  addMelody(t + beat * 1.75, 'G5', beat * 0.6, 0.84);
  addMelody(t + beat * 2.5, 'E5', beat * 0.45, 0.76);
  addMelody(t + beat * 3.0, 'D5', beat * 0.45, 0.72);
  addMelody(t + beat * 3.5, 'C5', beat * 1.8, 0.82);
  t += beat * 4;

  // --- OUTRO / REFRAIN PIANO ARPEGGIO (Gentle emotional flourish, matching video) ---
  addChord(t, 'C3', ['C4', 'E4', 'G4'], beat * 4);
  addMelody(t + beat * 0.5, 'G5', beat * 0.8, 0.60);
  addMelody(t + beat * 1.5, 'C6', beat * 1.0, 0.65);
  addMelody(t + beat * 2.75, 'E6', beat * 1.4, 0.62);
  t += beat * 4;

  // Final measure fade chord
  addChord(t, 'C3', ['C4', 'E4', 'G4'], beat * 4);
  addMelody(t + beat * 1.0, 'G5', beat * 2.0, 0.50);
  addMelody(t + beat * 2.5, 'C5', beat * 2.5, 0.55);
  t += beat * 4;

  const totalDuration = t + 1.5; // Total length ~34 seconds (matches video length)
  return { score, totalDuration };
}

// Synthesize the entire musical score into a studio-quality stereo AudioBuffer
export async function renderMemoriesAudioBuffer(audioCtx: AudioContext): Promise<AudioBuffer> {
  const { score, totalDuration } = generateMemoriesScore();
  const sampleRate = audioCtx.sampleRate;
  const offlineCtx = new OfflineAudioContext(2, Math.ceil(totalDuration * sampleRate), sampleRate);

  // Reverb Impulse Response generation (concert hall acoustics)
  const revDur = 2.4;
  const revLen = Math.floor(sampleRate * revDur);
  const revBuf = offlineCtx.createBuffer(2, revLen, sampleRate);
  const revL = revBuf.getChannelData(0);
  const revR = revBuf.getChannelData(1);
  for (let i = 0; i < revLen; i++) {
    const decay = Math.exp(-i / (sampleRate * 0.65));
    revL[i] = (Math.random() * 2 - 1) * decay;
    revR[i] = (Math.random() * 2 - 1) * decay;
  }

  const convolver = offlineCtx.createConvolver();
  convolver.buffer = revBuf;

  const wetGain = offlineCtx.createGain();
  wetGain.gain.value = 0.22; // 22% reverb wetness
  convolver.connect(wetGain);
  wetGain.connect(offlineCtx.destination);

  const dryGain = offlineCtx.createGain();
  dryGain.gain.value = 0.85;
  dryGain.connect(offlineCtx.destination);

  const masterBus = offlineCtx.createGain();
  masterBus.gain.value = 0.75;
  masterBus.connect(dryGain);
  masterBus.connect(convolver);

  // Render each note with realistic acoustic piano harmonics & hammer strike
  score.forEach((ev) => {
    const freq = NOTE_FREQS[ev.note];
    if (!freq) return;

    const startTime = ev.time;
    const dur = ev.duration;
    const vel = Math.max(0.1, Math.min(1.0, ev.velocity));

    // Note Gain Envelope
    const noteGain = offlineCtx.createGain();
    noteGain.gain.setValueAtTime(0.0001, startTime);
    // Instant attack hammer hit
    noteGain.gain.exponentialRampToValueAtTime(vel * (ev.isBass ? 0.35 : 0.28), startTime + 0.004);
    // Initial sharp decay to sustain
    noteGain.gain.exponentialRampToValueAtTime(vel * 0.12, startTime + 0.18);
    // Long natural decay
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur + 0.6);

    // Warm Lowpass Filter (simulating wooden soundboard)
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = ev.isBass ? 700 + vel * 600 : 1800 + vel * 1400;
    filter.frequency.setValueAtTime(cutoff, startTime);
    filter.frequency.exponentialRampToValueAtTime(cutoff * 0.4, startTime + dur);

    // Stereo Panner (Lower notes slightly on left, higher notes on right)
    const panner = offlineCtx.createStereoPanner();
    const panVal = Math.max(-0.4, Math.min(0.4, (freq - 440) / 700));
    panner.pan.setValueAtTime(panVal, startTime);

    // 1. Fundamental Oscillator (Warm blended Sine)
    const osc1 = offlineCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    // 2. Second Harmonic (f * 2) - subtle overtone
    const osc2 = offlineCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    const gain2 = offlineCtx.createGain();
    gain2.gain.setValueAtTime(0.3, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, startTime + dur * 0.5);

    // 3. Third Harmonic (f * 3) - piano string shine
    const osc3 = offlineCtx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, startTime);
    const gain3 = offlineCtx.createGain();
    gain3.gain.setValueAtTime(0.12, startTime);
    gain3.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

    // Connect node graph
    osc1.connect(noteGain);
    osc2.connect(gain2);
    gain2.connect(noteGain);
    osc3.connect(gain3);
    gain3.connect(noteGain);

    noteGain.connect(filter);
    filter.connect(panner);
    panner.connect(masterBus);

    // Start & Stop oscillators
    const stopTime = startTime + dur + 0.7;
    osc1.start(startTime);
    osc1.stop(stopTime);
    osc2.start(startTime);
    osc2.stop(stopTime);
    osc3.start(startTime);
    osc3.stop(stopTime);
  });

  return await offlineCtx.startRendering();
}

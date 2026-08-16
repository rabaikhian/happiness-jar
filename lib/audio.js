/**
 * Web Audio API synthesizer for cozy sound effects and background ambience.
 * Zero asset dependencies. Safe to run in any browser after user interaction.
 */

let audioCtx = null;
let ambientInterval = null;
let currentOscillators = [];

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Play sparkling bell chime when drawing a note or opening the jar
export function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Arpeggio)

  frequencies.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);

    // Highpass filter for bell-like brightness
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300, now);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Cozy bell envelope (fast attack, long release)
    gainNode.gain.setValueAtTime(0, now + index * 0.08);
    gainNode.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2);

    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 1.5);
  });
}

// 2. Play soft success bubble sound on note submission
export function playSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(392.00, now); // G4
  osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.15); // Slide to C5

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(523.25, now + 0.1); // C5
  osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.25); // Slide to E5

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  osc1.start(now);
  osc1.stop(now + 0.4);
  osc2.start(now + 0.1);
  osc2.stop(now + 0.4);
}

// 3. Play warm pop sound for UI micro-interactions
export function playPop() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now); // Low note
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.08); // Quick pop pitch bend

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.12, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  osc.start(now);
  osc.stop(now + 0.12);
}

// 4. Start a soft, quiet, relaxing background ambient loop (Pentatonic scale)
export function startAmbient() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Stop any existing loop first
  stopAmbient();

  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5 (Pentatonic)
  
  const playAmbientNote = () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Select random pentatonic note
    const randomFreq = notes[Math.floor(Math.random() * notes.length)];
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(randomFreq, now);

    // Soft lowpass filter to make it sound warm, mellow, and distant
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Very quiet (ambient background) and slow envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.015, now + 1.5); // Slow fade-in
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 5.0); // Very long decay

    osc.start(now);
    osc.stop(now + 6.0);

    // Keep track of oscillator to stop it if muted
    const oscObj = { osc, gainNode };
    currentOscillators.push(oscObj);
    
    // Clean up finished oscillators
    setTimeout(() => {
      currentOscillators = currentOscillators.filter(item => item !== oscObj);
    }, 6000);
  };

  // Play immediately, then every 3-4 seconds randomly
  playAmbientNote();
  ambientInterval = setInterval(() => {
    // Randomize slightly to make it feel organic and non-repetitive
    if (Math.random() > 0.3) {
      playAmbientNote();
    }
  }, 3500);
}

// 5. Stop the background ambience
export function stopAmbient() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
  
  // Fade out any active oscillators quickly
  currentOscillators.forEach(({ osc, gainNode }) => {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        setTimeout(() => {
          try { osc.stop(); } catch (e) {}
        }, 600);
      }
    } catch (err) {
      console.error('Error stopping oscillator:', err);
    }
  });
  
  currentOscillators = [];
}

/**
 * Web Audio API synthesizer for cozy sound effects and background ambience.
 * Zero asset dependencies. Safe to run in any browser after user interaction.
 */

let audioCtx = null;
let ambientInterval = null;
let currentOscillators = [];
let windSource = null;
let windLfo = null;
let windGain = null;
let birdInterval = null;
let dogInterval = null;

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

// 4. Start a soft, quiet, relaxing background ambient loop (Pentatonic scale, Wind, Birds, Distant Dog barks)
export function startAmbient() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Stop any existing loop first
  stopAmbient();

  const now = ctx.currentTime;

  // --- SYNTHESIZE SOFT WIND BLOWING ---
  // Create a 2-second white noise buffer
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  windSource = ctx.createBufferSource();
  windSource.buffer = noiseBuffer;
  windSource.loop = true;

  const windFilter = ctx.createBiquadFilter();
  windFilter.type = 'lowpass';
  windFilter.Q.setValueAtTime(1.0, now);
  windFilter.frequency.setValueAtTime(300, now); // Base frequency

  // Modulate filter frequency slowly with LFO to simulate gentle gusts of wind
  windLfo = ctx.createOscillator();
  windLfo.type = 'sine';
  windLfo.frequency.setValueAtTime(0.06, now); // Very slow (16 seconds cycle)

  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(120, now); // Modulate by +/- 120Hz

  windLfo.connect(lfoGain);
  lfoGain.connect(windFilter.frequency);

  windGain = ctx.createGain();
  windSource.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(ctx.destination);

  // Very quiet, gentle breeze level
  windGain.gain.setValueAtTime(0, now);
  windGain.gain.linearRampToValueAtTime(0.005, now + 2.0); // Smooth fade-in

  windSource.start(now);
  windLfo.start(now);

  // --- HELPER FOR BIRD CHIRPING ---
  const playBirdChirp = () => {
    const t = ctx.currentTime;
    const chirps = 2 + Math.floor(Math.random() * 2); // 2 or 3 chirps
    let startTime = t;
    for (let i = 0; i < chirps; i++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      // Bird sweep frequency: 3200Hz to 4200Hz
      osc.frequency.setValueAtTime(3200 + Math.random() * 200, startTime);
      osc.frequency.exponentialRampToValueAtTime(4200 + Math.random() * 200, startTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(3400, startTime + 0.12);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.002, startTime + 0.02); // Very quiet/soothing
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.15);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.16);
      startTime += 0.18 + Math.random() * 0.04;
    }
  };

  // --- HELPER FOR DISTANT DOG BARK ---
  const playDogBark = () => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    // Muffled low frequency sweep
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(160, t);
    filter.Q.setValueAtTime(4.0, t);

    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.0012, t + 0.02); // Muffled in the distance
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);

    // Double woof?
    if (Math.random() > 0.4) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const filter2 = ctx.createBiquadFilter();
      const t2 = t + 0.18;

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(170, t2);
      osc2.frequency.linearRampToValueAtTime(80, t2 + 0.1);

      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(130, t2);
      filter2.Q.setValueAtTime(4.0, t2);

      gain2.gain.setValueAtTime(0, t2);
      gain2.gain.linearRampToValueAtTime(0.0008, t2 + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.12);

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(t2);
      osc2.stop(t2 + 0.14);
    }
  };

  // --- HARMONIOUS CHIMES LOOP ---
  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // Pentatonic notes
  const playAmbientNote = () => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const randomFreq = notes[Math.floor(Math.random() * notes.length)];
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(randomFreq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Mellow, soft background chimes
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.012, t + 1.5);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 5.0);

    osc.start(t);
    osc.stop(t + 6.0);

    const oscObj = { osc, gainNode };
    currentOscillators.push(oscObj);
    setTimeout(() => {
      currentOscillators = currentOscillators.filter(item => item !== oscObj);
    }, 6000);
  };

  // Play immediately and start intervals
  playAmbientNote();
  
  // Soft chimes loop
  ambientInterval = setInterval(() => {
    if (Math.random() > 0.4) {
      playAmbientNote();
    }
  }, 4500);

  // Soft bird chirps loop (every 12 seconds)
  birdInterval = setInterval(() => {
    if (Math.random() > 0.3) {
      playBirdChirp();
    }
  }, 12000);

  // Muffled distant dog bark loop (every 22 seconds)
  dogInterval = setInterval(() => {
    if (Math.random() > 0.5) {
      playDogBark();
    }
  }, 22000);
}

// 5. Stop the background ambience
export function stopAmbient() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
  if (birdInterval) {
    clearInterval(birdInterval);
    birdInterval = null;
  }
  if (dogInterval) {
    clearInterval(dogInterval);
    dogInterval = null;
  }

  // Fade out and stop the wind soundscape
  if (windGain) {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        windGain.gain.cancelScheduledValues(now);
        windGain.gain.setValueAtTime(windGain.gain.value, now);
        windGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      }
    } catch (e) {}

    const sourceToStop = windSource;
    const lfoToStop = windLfo;
    setTimeout(() => {
      try { sourceToStop.stop(); } catch (e) {}
      try { lfoToStop.stop(); } catch (e) {}
    }, 1500);

    windSource = null;
    windLfo = null;
    windGain = null;
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

import os
import re

print("Starting Phase 2 Implementation...")

tarot_view_path = r"c:\Books\Neta Light\modules\tarot_view.js"
with open(tarot_view_path, "r", encoding="utf-8") as f:
    tarot_code = f.read()

# 1. Add Audio Synthesizer & Ribbon state
audio_and_state = """  // State
  let currentSubTab = 'spread'; // 'spread' | 'encyclopedia' | 'journal'
  let currentSpreadType = 'past_present_future';
  let currentDomain = 'general';
  let allowReversed = true;
  let activeDrawnCards = []; // [{cardId, isUpright, isFlipped}]
  let currentReadingReport = null;
  let encyFilter = 'all'; // 'all' | 'Major' | 'Cups' | 'Pentacles' | 'Swords' | 'Wands'
  let encySearchQuery = '';

  // Phase 2: Interactive Fanned Ribbon Deck & Audio State
  let ribbonDeckPool = []; // [{index, cardId, isUpright, isPicked}]
  let isShufflingRibbon = false;
  let audioCtx = null;

  function getAudioContext() {
    try {
      if (typeof window !== 'undefined' && window.soundEnabled === false) return null;
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  function playCardSlideSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {}
  }

  function playCardFlipSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  function playMysticChime() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      [528, 1056].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const vol = i === 0 ? 0.22 : 0.1;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.85);
      });
    } catch (e) {}
  }

  function playShuffleSound() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        playCardSlideSound();
      }, i * 45);
    }
  }

  function triggerHaptic(duration = 15) {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    } catch (e) {}
  }

  function initRibbonDeckPool(forceShuffle = false) {
    const engine = global.NetaTarotEngine;
    if (!engine) return;
    const all = engine.getAllCardsList();
    if (ribbonDeckPool.length === 0 || forceShuffle) {
      const copy = [...all];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      ribbonDeckPool = copy.map((card, idx) => ({
        index: idx,
        cardId: card.id,
        isUpright: allowReversed ? (Math.random() > 0.25) : true,
        isPicked: false
      }));
    }
  }
"""

# Replace state definition
old_state_pattern = r"  // State\s+let currentSubTab = 'spread';[\s\S]*?let encySearchQuery = '';"
if not re.search(old_state_pattern, tarot_code):
    print("ERROR: Could not find old_state_pattern")
    exit(1)

tarot_code = re.sub(old_state_pattern, audio_and_state, tarot_code, count=1)
print("1. Replaced State & Audio Synthesizer.")

# Write updated file to test so far
with open(tarot_view_path, "w", encoding="utf-8") as f:
    f.write(tarot_code)

print("Saved test step 1.")

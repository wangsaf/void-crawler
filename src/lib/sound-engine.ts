// Sound Engine using Tone.js for generative audio
// Zero external sound files needed for base experience

import * as Tone from "tone";

class SoundEngine {
  private initialized = false;
  private clickSynth: Tone.Synth | null = null;
  private successSynth: Tone.Synth | null = null;
  private errorSynth: Tone.NoiseSynth | null = null;
  private ambientOscs: Tone.Oscillator[] | [];
  private masterGain: Tone.Gain | null = null;

  constructor() {
    this.ambientOscs = [];
  }

  async init() {
    if (this.initialized) return;
    await Tone.start();

    this.masterGain = new Tone.Gain(0.7).toDestination();

    this.clickSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 },
    }).connect(this.masterGain);
    this.clickSynth.volume.value = -12;

    this.successSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 },
    }).connect(this.masterGain);
    this.successSynth.volume.value = -10;

    this.errorSynth = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.2 },
    }).connect(this.masterGain);
    this.errorSynth.volume.value = -15;

    this.initialized = true;
  }

  playClick() {
    if (!this.initialized || !this.clickSynth) return;
    const notes = ["C5", "D5", "E5", "G5"];
    const note = notes[Math.floor(Math.random() * notes.length)];
    this.clickSynth.triggerAttackRelease(note, "32n");
  }

  playHover() {
    if (!this.initialized || !this.clickSynth) return;
    this.clickSynth.triggerAttackRelease("E6", "64n");
  }

  playSuccess() {
    if (!this.initialized || !this.successSynth) return;
    const now = Tone.now();
    this.successSynth.triggerAttackRelease("C5", "16n", now);
    this.successSynth.triggerAttackRelease("E5", "16n", now + 0.1);
    this.successSynth.triggerAttackRelease("G5", "16n", now + 0.2);
    this.successSynth.triggerAttackRelease("C6", "8n", now + 0.3);
  }

  playError() {
    if (!this.initialized || !this.errorSynth) return;
    this.errorSynth.triggerAttackRelease("16n");
  }

  playLevelUp() {
    if (!this.initialized || !this.successSynth) return;
    const now = Tone.now();
    const scale = ["C4", "E4", "G4", "B4", "C5", "E5", "G5", "C6"];
    scale.forEach((note, i) => {
      this.successSynth!.triggerAttackRelease(note, "16n", now + i * 0.08);
    });
  }

  playAchievement() {
    if (!this.initialized || !this.successSynth) return;
    const now = Tone.now();
    this.successSynth.triggerAttackRelease("G5", "16n", now);
    this.successSynth.triggerAttackRelease("B5", "16n", now + 0.12);
    this.successSynth.triggerAttackRelease("D6", "8n", now + 0.24);
  }

  startAmbient(zone: string) {
    this.stopAmbient();
    if (!this.initialized) return;

    const zoneFreqs: Record<string, number[]> = {
      void: [55, 82.5, 110],
      hub: [110, 165, 220],
      market: [130.81, 196, 261.63],
      dashboard: [98, 147, 196],
      cyber: [73.42, 110, 146.83],
      playground: [82.41, 123.47, 164.81],
    };

    const freqs = zoneFreqs[zone] || zoneFreqs.void;

    this.ambientOscs = freqs.map((freq, i) => {
      const osc = new Tone.Oscillator(freq, "sine");
      osc.volume.value = -25 + i * 3;
      osc.detune.value = Math.random() * 6 - 3;

      const filter = new Tone.Filter(800, "lowpass");
      const gain = new Tone.Gain(0.15);
      osc.connect(filter).connect(gain).connect(this.masterGain!);

      osc.start();
      return osc;
    });
  }

  stopAmbient() {
    if (this.ambientOscs.length > 0) {
      this.ambientOscs.forEach((osc) => {
        try {
          osc.stop();
          osc.dispose();
        } catch {}
      });
      this.ambientOscs = [];
    }
  }

  setVolume(v: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = v;
    }
  }

  destroy() {
    this.stopAmbient();
    this.clickSynth?.dispose();
    this.successSynth?.dispose();
    this.errorSynth?.dispose();
    this.masterGain?.dispose();
    this.initialized = false;
  }
}

export const soundEngine = new SoundEngine();

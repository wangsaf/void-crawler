"use client";

import { useEffect, useRef } from "react";
import { useChaosStore } from "@/stores/chaos-store";
import { useGameStore } from "@/stores/game-store";
import * as Tone from "tone";

// Ambient void hum — always present, intensifies with chaos
class AmbientVoid {
  private osc1: Tone.Oscillator | null = null;
  private osc2: Tone.Oscillator | null = null;
  private osc3: Tone.Oscillator | null = null;
  private lfo: Tone.LFO | null = null;
  private filter: Tone.Filter | null = null;
  private gain: Tone.Gain | null = null;
  private initialized = false;
  private noise: Tone.Noise | null = null;
  private noiseGain: Tone.Gain | null = null;

  async init() {
    if (this.initialized) return;
    await Tone.start();

    this.gain = new Tone.Gain(0).toDestination();
    this.filter = new Tone.Filter(200, "lowpass").connect(this.gain);

    // Sub bass drone — felt more than heard
    this.osc1 = new Tone.Oscillator(40, "sine").connect(this.filter);
    this.osc1.volume.value = -15;

    // Slightly detuned for unease
    this.osc2 = new Tone.Oscillator(41.5, "sine").connect(this.filter);
    this.osc2.volume.value = -20;

    // High harmonic — adds eeriness
    this.osc3 = new Tone.Oscillator(120, "triangle").connect(this.filter);
    this.osc3.volume.value = -30;

    // LFO for breathing effect
    this.lfo = new Tone.LFO(0.1, 150, 400).connect(this.filter.frequency);
    this.lfo.type = "sine";

    // Static noise — very subtle
    this.noiseGain = new Tone.Gain(0).toDestination();
    this.noise = new Tone.Noise("brown").connect(this.noiseGain);
    this.noise.volume.value = -35;

    this.osc1.start();
    this.osc2.start();
    this.osc3.start();
    this.lfo.start();
    this.noise.start();
    this.initialized = true;
  }

  setIntensity(level: number) {
    if (!this.initialized || !this.gain || !this.noiseGain || !this.filter) return;
    // level: 0-100
    const t = level / 100;
    this.gain.gain.value = t * 0.4; // max 40% volume
    this.noiseGain.gain.value = t * 0.15; // static rises with chaos
    this.filter.frequency.value = 200 + t * 800; // filter opens with chaos
  }

  destroy() {
    this.osc1?.stop(); this.osc1?.dispose();
    this.osc2?.stop(); this.osc2?.dispose();
    this.osc3?.stop(); this.osc3?.dispose();
    this.lfo?.stop(); this.lfo?.dispose();
    this.filter?.dispose();
    this.noise?.stop(); this.noise?.dispose();
    this.noiseGain?.dispose();
    this.gain?.dispose();
    this.initialized = false;
  }
}

export const ambientVoid = new AmbientVoid();

// Hook to connect ambient void to chaos level
export function useAmbientVoid() {
  const chaosLevel = useChaosStore((s) => s.chaosLevel);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const initRef = useRef(false);

  // Init on first user interaction
  useEffect(() => {
    if (!soundEnabled || initRef.current) return;
    const init = async () => {
      await ambientVoid.init();
      initRef.current = true;
    };
    const handleClick = () => { init(); window.removeEventListener("click", handleClick); };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [soundEnabled]);

  // Update intensity
  useEffect(() => {
    if (initRef.current) {
      ambientVoid.setIntensity(chaosLevel);
    }
  }, [chaosLevel]);

  // Cleanup
  useEffect(() => {
    return () => { ambientVoid.destroy(); };
  }, []);
}

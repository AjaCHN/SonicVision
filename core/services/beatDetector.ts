/**
 * File: core/services/beatDetector.ts
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

export class BeatDetector {
  private prevSpectrum: Uint8Array = new Uint8Array(0);
  private fluxHistory: number[] = [];
  private historySize = 30; // ~0.5s at 60fps
  private minThreshold = 1500; // Minimum flux to register a beat (noise floor)
  private thresholdMult = 1.35; // Sensitivity multiplier above average
  private lastBeatTime = 0;
  private debounceMs = 250; // Max ~240 BPM

  /**
   * Detects if a beat occurred in the current frame using Spectral Flux.
   * @param spectrum Frequency data from AnalyserNode
   */
  public detect(spectrum: Uint8Array): boolean {
    if (this.prevSpectrum.length !== spectrum.length) {
      this.prevSpectrum = new Uint8Array(spectrum.length);
      this.prevSpectrum.set(spectrum);
      return false;
    }

    // 1. Calculate Spectral Flux
    // Sum of positive differences between current and previous frame.
    // We focus on the lower end of the spectrum (Bass/Low-Mids) for beat detection.
    let flux = 0;
    const scanLimit = Math.min(spectrum.length, 60); // Scan first 60 bins
    
    for (let i = 0; i < scanLimit; i++) {
      const diff = spectrum[i] - this.prevSpectrum[i];
      // Only count positive increases in energy (onsets)
      if (diff > 0) {
        flux += diff;
      }
    }
    
    // Save current spectrum for next frame comparison
    this.prevSpectrum.set(spectrum);

    // 2. Update Flux History (Moving Average)
    this.fluxHistory.push(flux);
    if (this.fluxHistory.length > this.historySize) {
      this.fluxHistory.shift();
    }

    // 3. Calculate Adaptive Threshold
    const avgFlux = this.fluxHistory.reduce((a, b) => a + b, 0) / this.fluxHistory.length;
    
    // 4. Beat Detection Logic
    const now = performance.now();
    
    // Condition: Flux must be significantly higher than recent average AND above noise floor
    if (flux > this.minThreshold && flux > avgFlux * this.thresholdMult) {
      if (now - this.lastBeatTime > this.debounceMs) {
        this.lastBeatTime = now;
        return true;
      }
    }

    return false;
  }
}
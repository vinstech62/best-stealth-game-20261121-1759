// Shadow Gallery — all sound is synthesized with WebAudio (no audio files,
// no network). Short oscillator blips: guard footsteps, the alert alarm,
// the pickup chime and the caught sting. Audio starts on the first user
// gesture, as browsers require.
export class SoundEngine {
  constructor() {
    this.audioContext = null;
    this.muted = false;
  }

  // Lazily create the context on first gesture; safe to call repeatedly.
  ensureAudio() {
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') void this.audioContext.resume();
      return;
    }
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.audioContext = new AudioContextClass();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(frequency, durationSeconds, type, volume, whenSeconds = 0) {
    if (this.muted || !this.audioContext) return;
    const startAt = this.audioContext.currentTime + whenSeconds;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSeconds);
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + durationSeconds + 0.02);
  }

  // Soft low tick; the caller passes a volume based on guard distance.
  playFootstep(volume = 0.05) {
    if (!this.audioContext || this.muted) return;
    this.playTone(90, 0.07, 'sine', volume);
  }

  // Two-note rising blip when a guard becomes alerted.
  playAlarm() {
    this.playTone(520, 0.12, 'square', 0.06);
    this.playTone(780, 0.16, 'square', 0.06, 0.13);
  }

  // Bright two-note chime when an artifact is picked up.
  playChime() {
    this.playTone(880, 0.12, 'sine', 0.08);
    this.playTone(1318, 0.2, 'sine', 0.08, 0.09);
  }

  // Low descending sting when the player is caught.
  playSting() {
    this.playTone(220, 0.25, 'sawtooth', 0.09);
    this.playTone(147, 0.4, 'sawtooth', 0.09, 0.18);
  }

  // Short confirmation blip for level complete.
  playFanfare() {
    this.playTone(523, 0.12, 'sine', 0.08);
    this.playTone(659, 0.12, 'sine', 0.08, 0.11);
    this.playTone(784, 0.25, 'sine', 0.08, 0.22);
  }
}

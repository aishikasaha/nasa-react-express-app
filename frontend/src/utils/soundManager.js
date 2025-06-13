import { Howl } from 'howler';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.volume = 0.3;
    this.enabled = true;
    
    // Initialize sounds
    this.loadSounds();
  }

  loadSounds() {
    // Create sound effects using Web Audio API
    this.sounds = {
      click: this.createTone(800, 0.1),
      hover: this.createTone(600, 0.05),
      success: this.createTone([523, 659, 784], 0.3),
      error: this.createTone([400, 300], 0.2),
      whoosh: this.createWhiteNoise(0.1),
      space: this.createSpaceAmbient()
    };
  }

  createTone(frequencies, duration) {
    return () => {
      if (!this.enabled) return;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const freqArray = Array.isArray(frequencies) ? frequencies : [frequencies];
      
      freqArray.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + duration + index * 0.1);
      });
    };
  }

  createWhiteNoise(duration) {
    return () => {
      if (!this.enabled) return;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = audioContext.sampleRate * duration;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      whiteNoise.buffer = buffer;
      whiteNoise.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.setValueAtTime(this.volume * 0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      whiteNoise.start();
    };
  }

  createSpaceAmbient() {
    return () => {
      if (!this.enabled) return;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.frequency.setValueAtTime(110, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(165, audioContext.currentTime);
      oscillator1.type = 'sine';
      oscillator2.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.02, audioContext.currentTime + 1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 3);
      
      oscillator1.start();
      oscillator2.start();
      oscillator1.stop(audioContext.currentTime + 3);
      oscillator2.stop(audioContext.currentTime + 3);
    };
  }

  play(soundName) {
    if (this.sounds[soundName] && this.enabled) {
      this.sounds[soundName]();
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export default new SoundManager();

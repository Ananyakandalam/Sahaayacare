/**
 * Accessible Spoken Audio Player for Sahaaya Care
 * Uses Gemini 3.8 Flash-Lite TTS with seamless browser Web Speech API fallback.
 * Includes pleasant Web Audio sound chimes for tactile feedback.
 */

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>();
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play pleasant acoustic chime using Web Audio API
  public playChime(type: 'start' | 'success' | 'tap' | 'undo' | 'urgent' = 'start') {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (type === 'start') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'success') {
        // Cheerful major chord: C5 - E5 - G5 - C6
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.12, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.45);
        });
      } else if (type === 'tap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'urgent') {
        // High attention alert chime (two-tone)
        [587.33, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.15, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.35);
        });
      }
    } catch (e) {
      // Audio context might be blocked prior to gesture
    }
  }

  // Stop any active audio
  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.activeUtterance = null;
  }

  // Play spoken text with Gemini TTS or Web Speech fallback
  public async speakText({
    text,
    voice = 'Kore',
    speed = 0.9, // Default slightly slower for clarity
    language = 'English',
    style,
    onStart,
    onEnd,
    onError,
  }: {
    text: string;
    voice?: string;
    speed?: number;
    language?: string;
    style?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }): Promise<void> {
    this.stop();
    this.playChime('start');

    const isTelugu = language === 'Telugu' || language === 'te';
    const isHindi = language === 'Hindi' || language === 'hi';

    const cacheKey = `${language}_${voice}_${text.trim().slice(0, 100)}`;
    let audioUrl: string | null = null;

    if (this.audioCache.has(cacheKey)) {
      audioUrl = this.audioCache.get(cacheKey)!;
    } else {
      try {
        let defaultStyle = 'Speak in a very warm, polite, caring, cheerful, and unhurried tone with crystal clear enunciation for an elderly patient who cannot read.';
        if (isTelugu) {
          defaultStyle = 'Speak in very friendly, affectionate, respectful, gentle, and unhurried Telugu (తెలుగు) with crystal clear enunciation, like a loving family caregiver or kind home nurse speaking to an elderly loved one.';
        } else if (isHindi) {
          defaultStyle = 'Speak in very friendly, affectionate, respectful, gentle, and unhurried Hindi (हिन्दी) with crystal clear enunciation, like a loving family caregiver or kind home nurse speaking to an elderly loved one.';
        }

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice,
            language,
            style: style || defaultStyle,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audio) {
            audioUrl = `data:audio/wav;base64,${data.audio}`;
            this.audioCache.set(cacheKey, audioUrl);
          }
        }
      } catch (err) {
        console.warn('Backend TTS unavailable, falling back to Web Speech API', err);
      }
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      audio.playbackRate = speed;

      audio.onplay = () => onStart?.();
      audio.onended = () => {
        this.currentAudio = null;
        onEnd?.();
      };
      audio.onerror = (e) => {
        console.warn('Audio tag failed, falling back to Web Speech API', e);
        this.speakWithWebSpeech(text, speed, language, onStart, onEnd, onError);
      };

      try {
        await audio.play();
      } catch (playErr) {
        console.warn('Audio.play() error, trying speech synthesis', playErr);
        this.speakWithWebSpeech(text, speed, language, onStart, onEnd, onError);
      }
    } else {
      // Direct Web Speech API fallback
      this.speakWithWebSpeech(text, speed, language, onStart, onEnd, onError);
    }
  }

  // Browser speech synthesis fallback
  private speakWithWebSpeech(
    text: string,
    speed: number,
    language: string = 'English',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!('speechSynthesis' in window)) {
      onError?.(new Error('Speech synthesis not supported on this browser.'));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.6, Math.min(1.4, speed));
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();

    // Check if Telugu or Hindi requested
    if (language === 'Telugu' || language === 'te') {
      utterance.lang = 'te-IN';
      const teluguVoice = voices.find(
        (v) => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')
      );
      if (teluguVoice) {
        utterance.voice = teluguVoice;
      }
    } else if (language === 'Hindi' || language === 'hi') {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      utterance.lang = 'en-US';
      const naturalVoice = voices.find(
        (v) =>
          (v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Karen'))) ||
          v.lang.startsWith('en')
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => {
      this.activeUtterance = null;
      onEnd?.();
    };
    utterance.onerror = (e) => {
      this.activeUtterance = null;
      onError?.(e);
    };

    this.activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public isSpeaking(): boolean {
    return Boolean(
      (this.currentAudio && !this.currentAudio.paused) ||
        (window.speechSynthesis && window.speechSynthesis.speaking)
    );
  }
}

export const audioPlayer = new AudioService();


export class SoundService {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;
    private noiseBuffer: AudioBuffer | null = null;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        return this.ctx;
    }

    private initNoiseBuffer() {
        if (!this.ctx || this.noiseBuffer) return;
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
    }

    private async resume() {
        const ctx = this.getContext();
        if (ctx) {
            if (ctx.state === 'suspended') {
                try {
                    await ctx.resume();
                } catch (e) {
                    console.error("Audio resume failed", e);
                }
            }
            this.initNoiseBuffer();
        }
        return ctx;
    }

    private vibrate(pattern: number | number[]) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Ignore errors if vibration is not supported or allowed
            }
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
    }

    // Generic UI interaction
    playClick() {
        this.vibrate(5); // Light tap
        if (this.isMuted) return;
        this.resume().then(ctx => {
            if (!ctx) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.setValueAtTime(1000, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
            
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(t + 0.05);
        });
    }

    // For selecting options/toggles
    playSelect() {
        this.vibrate(5); // Light tap
        if (this.isMuted) return;
        this.resume().then(ctx => {
            if (!ctx) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, t);
            
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(t + 0.15);
        });
    }

    // For expanding cards/details
    playExpand() {
        this.vibrate(10); // Slightly more noticeable
        if (this.isMuted) return;
        this.resume().then(ctx => {
            if (!ctx || !this.noiseBuffer) return;
            const t = ctx.currentTime;
            const source = ctx.createBufferSource();
            source.buffer = this.noiseBuffer;
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, t);
            filter.frequency.linearRampToValueAtTime(1500, t + 0.2);

            gain.gain.setValueAtTime(0.05, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.2);

            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            source.start();
            source.stop(t + 0.2);
        });
    }

    // For starting calculations/processing
    playProcessing() {
        this.vibrate(15); // Confirmation of action start
        if (this.isMuted) return;
        this.resume().then(ctx => {
            if (!ctx) return;
            const t = ctx.currentTime;
            // Play a few rapid random bleeps
            for(let i=0; i<3; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const startTime = t + i * 0.06;
                
                osc.type = 'square';
                osc.frequency.setValueAtTime(800 + Math.random() * 800, startTime);
                
                gain.gain.setValueAtTime(0.03, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.05);
            }
        });
    }

    // View transitions
    playTransition() {
        this.vibrate(5); // Light tap for nav
        if (this.isMuted) return;
        this.resume().then(ctx => {
            if (!ctx || !this.noiseBuffer) return;
            const t = ctx.currentTime;
            
            // Swoosh effect
            const source = ctx.createBufferSource();
            source.buffer = this.noiseBuffer;
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            filter.type = 'bandpass';
            filter.Q.value = 1;
            filter.frequency.setValueAtTime(400, t);
            filter.frequency.exponentialRampToValueAtTime(2000, t + 0.25);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.04, t + 0.1);
            gain.gain.linearRampToValueAtTime(0, t + 0.3);

            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            source.start();
            source.stop(t + 0.3);
        });
    }

    // Major success event
    playSuccess() {
        this.vibrate([30, 50, 30]); // Distinct success pattern
        if (this.isMuted) return;
        this.resume().then(ctx => {
            if (!ctx) return;
            const t = ctx.currentTime;
            
            // Ethereal chord (C Major 7: C, E, G, B)
            const freqs = [523.25, 659.25, 783.99, 987.77]; 
            freqs.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                // Slight detune for richness
                if (i % 2 !== 0) osc.detune.value = 5;

                const attack = 0.05 + i * 0.02;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.03, t + attack);
                gain.gain.exponentialRampToValueAtTime(0.001, t + attack + 1.5); // Long tail
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(t);
                osc.stop(t + 2.0);
            });
        });
    }

    playSend() {
        this.vibrate(10);
        if (this.isMuted) return;
        this.resume().then(ctx => {
            if (!ctx) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.linearRampToValueAtTime(1200, t + 0.15);

            // Filter to smooth the sawtooth
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            gain.gain.setValueAtTime(0.03, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.15);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(t + 0.15);
        });
    }

    playReceive() {
        this.vibrate([10, 50, 10]); // Attention grabber
        if (this.isMuted) return;
        this.resume().then(ctx => {
            if (!ctx) return;
            const t = ctx.currentTime;
            
            // Double chime
            [800, 600].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const start = t + i * 0.1;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);
                
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.04, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(start);
                osc.stop(start + 0.35);
            });
        });
    }
}

export const soundService = new SoundService();

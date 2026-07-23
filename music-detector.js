// Music Detection Service
// Detects instrumental sections and labels them as "[Music]"

class MusicDetector {
    constructor(audioBuffer) {
        this.audioBuffer = audioBuffer;
        this.sampleRate = audioBuffer.sampleRate;
    }

    /**
     * Analyze audio and detect music sections
     * Returns segments with music detection
     */
    async detectMusicSections(segments) {
        const audioData = this.audioBuffer.getChannelData(0);
        const enhancedSegments = [];

        for (const segment of segments) {
            const startSample = Math.floor(segment.startTime * this.sampleRate);
            const endSample = Math.floor(segment.endTime * this.sampleRate);

            // Extract segment audio
            const segmentData = audioData.slice(startSample, endSample);

            // Analyze if this is music or vocals
            const isMusic = this.isMusicSection(segmentData);

            // If music detected and no lyrics, label it
            if (isMusic && (!segment.lyrics || segment.lyrics.trim().length < 5)) {
                enhancedSegments.push({
                    ...segment,
                    lyrics: '🎵 [Music] 🎵',
                    isMusic: true
                });
            } else {
                enhancedSegments.push({
                    ...segment,
                    isMusic: false
                });
            }
        }

        return enhancedSegments;
    }

    /**
     * Determine if audio segment is music (instrumental) or vocals
     */
    isMusicSection(audioData) {
        // Calculate energy and spectral characteristics
        const energy = this.calculateEnergy(audioData);
        const zeroCrossingRate = this.calculateZeroCrossingRate(audioData);

        // Music typically has:
        // - Lower zero-crossing rate (more harmonic)
        // - Consistent energy
        // - Less variation

        const energyVariation = this.calculateVariation(audioData);

        // Thresholds (tuned for music detection)
        const isLowZCR = zeroCrossingRate < 0.1;
        const isConsistentEnergy = energyVariation < 0.3;

        return isLowZCR && isConsistentEnergy;
    }

    /**
     * Calculate audio energy (RMS)
     */
    calculateEnergy(audioData) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        return Math.sqrt(sum / audioData.length);
    }

    /**
     * Calculate zero-crossing rate
     */
    calculateZeroCrossingRate(audioData) {
        let crossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0 && audioData[i - 1] < 0) ||
                (audioData[i] < 0 && audioData[i - 1] >= 0)) {
                crossings++;
            }
        }
        return crossings / audioData.length;
    }

    /**
     * Calculate energy variation over time
     */
    calculateVariation(audioData) {
        const windowSize = Math.floor(this.sampleRate * 0.1); // 100ms windows
        const energies = [];

        for (let i = 0; i < audioData.length; i += windowSize) {
            const window = audioData.slice(i, i + windowSize);
            energies.push(this.calculateEnergy(window));
        }

        // Calculate standard deviation
        const mean = energies.reduce((a, b) => a + b, 0) / energies.length;
        const variance = energies.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / energies.length;
        const stdDev = Math.sqrt(variance);

        return stdDev / (mean + 0.0001); // Coefficient of variation
    }

    /**
     * Detect silence sections
     */
    detectSilence(threshold = 0.01, minDuration = 0.5) {
        const audioData = this.audioBuffer.getChannelData(0);
        const windowSize = Math.floor(this.sampleRate * 0.1); // 100ms
        const silenceSections = [];

        let silenceStart = null;

        for (let i = 0; i < audioData.length; i += windowSize) {
            const window = audioData.slice(i, i + windowSize);
            const energy = this.calculateEnergy(window);
            const time = i / this.sampleRate;

            if (energy < threshold) {
                if (silenceStart === null) {
                    silenceStart = time;
                }
            } else {
                if (silenceStart !== null) {
                    const duration = time - silenceStart;
                    if (duration >= minDuration) {
                        silenceSections.push({
                            start: silenceStart,
                            end: time,
                            duration: duration
                        });
                    }
                    silenceStart = null;
                }
            }
        }

        return silenceSections;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicDetector;
}

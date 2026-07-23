// Lyrics Analyzer Module
// Handles lyrics parsing and automatic timing detection

class LyricsAnalyzer {
    constructor(audioBuffer, audioContext) {
        this.audioBuffer = audioBuffer;
        this.audioContext = audioContext;
        this.sampleRate = audioBuffer.sampleRate;
        this.duration = audioBuffer.duration;
    }

    parseLines(lyricsText) {
        if (!lyricsText) return [];
        return lyricsText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }

    async detectSilencePoints(threshold = 0.01, minSilenceDuration = 0.3) {
        const channelData = this.audioBuffer.getChannelData(0);
        const silencePoints = [];

        let silenceStart = null;
        const samplesPerCheck = Math.floor(this.sampleRate * 0.01);

        for (let i = 0; i < channelData.length; i += samplesPerCheck) {
            const slice = channelData.slice(i, i + samplesPerCheck);
            const rms = this.calculateRMS(slice);

            if (rms < threshold) {
                if (silenceStart === null) {
                    silenceStart = i / this.sampleRate;
                }
            } else {
                if (silenceStart !== null) {
                    const silenceEnd = i / this.sampleRate;
                    const silenceDuration = silenceEnd - silenceStart;

                    if (silenceDuration >= minSilenceDuration) {
                        silencePoints.push(silenceStart + silenceDuration / 2);
                    }
                    silenceStart = null;
                }
            }
        }

        return silencePoints;
    }

    calculateRMS(audioData) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        return Math.sqrt(sum / audioData.length);
    }

    async generateTimestamps(lyricLines, onProgress) {
        const segments = [];
        const silencePoints = await this.detectSilencePoints();

        if (lyricLines.length === 0) return segments;

        const timePerLine = this.duration / lyricLines.length;

        for (let i = 0; i < lyricLines.length; i++) {
            if (onProgress) {
                const percent = Math.round(((i + 1) / lyricLines.length) * 100);
                onProgress(percent, `Generating timestamp ${i + 1}/${lyricLines.length}...`);
            }

            let startTime = i * timePerLine;
            let endTime = (i + 1) * timePerLine;

            const nearestSilenceStart = silencePoints.find(p => Math.abs(p - startTime) < 1.0);
            if (nearestSilenceStart) startTime = nearestSilenceStart;

            const nearestSilenceEnd = silencePoints.find(p => Math.abs(p - endTime) < 1.0);
            if (nearestSilenceEnd) endTime = nearestSilenceEnd;

            segments.push({
                id: i + 1,
                lyrics: lyricLines[i],
                startTime: Math.max(0, Math.round(startTime * 100) / 100),
                endTime: Math.min(this.duration, Math.round(endTime * 100) / 100)
            });
        }

        return segments;
    }

    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
    }
}

window.LyricsAnalyzer = LyricsAnalyzer;

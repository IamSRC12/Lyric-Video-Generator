// Audio Merger - Properly merges audio segments with correct timing
// Creates a single AudioBuffer from multiple audio files

class AudioMerger {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }

    /**
     * Merge multiple audio files into a single AudioBuffer
     * Returns: { audioBuffer, segments with correct timing }
     */
    async mergeAudioFiles(audioFiles, onProgress) {
        const audioBuffers = [];
        let totalDuration = 0;

        // Step 1: Decode all audio files
        for (let i = 0; i < audioFiles.length; i++) {
            if (onProgress) {
                onProgress((i / audioFiles.length) * 50, `Loading audio ${i + 1}/${audioFiles.length}...`);
            }

            const arrayBuffer = await audioFiles[i].arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            audioBuffers.push({
                buffer: audioBuffer,
                startTime: 0, // Will settle later
                endTime: 0,
                duration: audioBuffer.duration
            });
        }

        if (onProgress) {
            onProgress(60, 'Merging audio...');
        }

        // Step 2: Create merged buffer
        const numberOfChannels = audioBuffers[0].buffer.numberOfChannels;
        const sampleRate = audioBuffers[0].buffer.sampleRate;

        let totalSamples = 0;
        audioBuffers.forEach(ab => {
            totalSamples += ab.buffer.length;
        });

        const mergedBuffer = this.audioContext.createBuffer(
            numberOfChannels,
            totalSamples,
            sampleRate
        );

        totalDuration = totalSamples / sampleRate;

        // Step 3: Copy all audio data
        let currentSample = 0;
        for (let i = 0; i < audioBuffers.length; i++) {
            const source = audioBuffers[i].buffer;

            // Set precise segment times
            audioBuffers[i].startTime = currentSample / sampleRate;
            audioBuffers[i].endTime = (currentSample + source.length) / sampleRate;
            audioBuffers[i].duration = source.length / sampleRate;

            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sourceData = source.getChannelData(channel);
                const destData = mergedBuffer.getChannelData(channel);

                destData.set(sourceData, currentSample);
            }

            currentSample += source.length;

            if (onProgress) {
                onProgress(60 + (i / audioBuffers.length) * 30, `Merging segment ${i + 1}/${audioBuffers.length}...`);
            }
        }

        if (onProgress) {
            onProgress(100, 'Audio merged!');
        }

        return {
            audioBuffer: mergedBuffer,
            segments: audioBuffers,
            totalDuration: totalDuration
        };
    }

    /**
     * Convert AudioBuffer to WAV Blob
     */
    audioBufferToWav(audioBuffer) {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numberOfChannels * bytesPerSample;

        const data = [];
        for (let channel = 0; channel < numberOfChannels; channel++) {
            data.push(audioBuffer.getChannelData(channel));
        }

        const dataLength = audioBuffer.length * blockAlign;
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);

        // Write audio data
        const volume = 0.8;
        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, data[channel][i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioMerger;
}

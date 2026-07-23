// Audio Processor Module
// Handles audio splitting using native Web Audio API (No FFmpeg required)
// Exports as WAV for maximum compatibility

class AudioProcessor {
    constructor() {
        this.audioContext = null;
    }

    async initialize(onProgress) {
        if (onProgress) onProgress(100);
        return true;
    }

    /**
     * Split audio file into segments based on timestamps
     * Uses the already decoded AudioBuffer for speed and reliability
     */
    async splitAudio(audioBuffer, segments, onProgress) {
        const processedSegments = [];
        const totalSegments = segments.length;

        try {
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];

                if (onProgress) {
                    const progress = Math.round((i / totalSegments) * 100);
                    onProgress(progress, `Processing segment ${i + 1} of ${totalSegments}...`);
                }

                const startSample = Math.floor(segment.startTime * audioBuffer.sampleRate);
                const endSample = Math.floor(segment.endTime * audioBuffer.sampleRate);
                const length = endSample - startSample;

                if (length <= 0) continue;

                const segmentBuffer = new AudioBuffer({
                    length: length,
                    numberOfChannels: audioBuffer.numberOfChannels,
                    sampleRate: audioBuffer.sampleRate
                });

                for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                    const channelData = audioBuffer.getChannelData(channel);
                    const segmentData = segmentBuffer.getChannelData(channel);

                    for (let j = 0; j < length; j++) {
                        segmentData[j] = channelData[startSample + j];
                    }
                }

                const blob = this.bufferToWav(segmentBuffer);
                const url = URL.createObjectURL(blob);

                processedSegments.push({
                    ...segment,
                    blob,
                    url,
                    fileName: this.generateFileName(segment.lyrics, i + 1)
                });

                await new Promise(r => setTimeout(r, 10));
            }

            if (onProgress) {
                onProgress(100, 'All segments processed!');
            }

            return processedSegments;

        } catch (error) {
            console.error('Error splitting audio:', error);
            throw new Error('Failed to split audio: ' + error.message);
        }
    }

    generateFileName(lyrics, segmentNumber) {
        const cleanLyrics = (lyrics || '')
            .substring(0, 30)
            .replace(/[^a-z0-9]/gi, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');

        return `segment_${segmentNumber}_${cleanLyrics}.wav`;
    }

    bufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const out = new DataView(new ArrayBuffer(length));
        let channels = [];
        let sampleRate = buffer.sampleRate;
        let offset = 0;
        let pos = 0;

        function writeString(str) {
            for (let i = 0; i < str.length; i++) {
                out.setUint8(pos++, str.charCodeAt(i));
            }
        }

        function setUint16(data) {
            out.setUint16(pos, data, true);
            pos += 2;
        }

        function setUint32(data) {
            out.setUint32(pos, data, true);
            pos += 4;
        }

        writeString('RIFF');
        setUint32(length - 8);
        writeString('WAVE');

        writeString('fmt ');
        setUint32(16); // SubChunk1Size (16 for PCM)
        setUint16(1);  // AudioFormat (1 for PCM)
        setUint16(numOfChan);
        setUint32(sampleRate);
        setUint32(sampleRate * 2 * numOfChan); // ByteRate
        setUint16(numOfChan * 2); // BlockAlign
        setUint16(16); // BitsPerSample

        writeString('data');
        setUint32(length - pos - 4);

        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        while (offset < buffer.length) {
            for (let i = 0; i < numOfChan; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                out.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        return new Blob([out], { type: 'audio/wav' });
    }
}

window.AudioProcessor = AudioProcessor;

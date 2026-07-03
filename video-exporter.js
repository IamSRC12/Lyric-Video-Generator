// VideoExporter.js - TURBO MODE (Maximum Speed)

class VideoExporter {
    constructor() {
        this.muxer = null;
        this.videoEncoder = null;
        this.audioEncoder = null;
    }

    async exportVideo(renderer, audioBlob, onProgress) {
        const segments = renderer.segments;
        if (!segments || segments.length === 0) throw new Error("Timeline is empty!");

        // 1. Force Dimensions to be Even
        let width = renderer.canvas.width;
        let height = renderer.canvas.height;
        if (width % 2 !== 0) width -= 1;
        if (height % 2 !== 0) height -= 1;

        const fps = 30;
        const duration = segments[segments.length - 1].endTime;
        const totalFrames = Math.ceil(duration * fps);

        console.log(`✨ Starting HIGH QUALITY Export: ${width}x${height} @ ${fps}fps`);

        try {
            // 2. Initialize MP4 Muxer
            this.muxer = new Mp4Muxer.Muxer({
                target: new Mp4Muxer.ArrayBufferTarget(),
                video: { codec: 'avc', width, height },
                audio: { codec: 'aac', numberOfChannels: 1, sampleRate: 44100 },
                fastStart: 'in-memory',
            });

            // 3. Configure Video Encoder (Quality Focused)
            this.videoEncoder = new VideoEncoder({
                output: (chunk, meta) => this.muxer.addVideoChunk(chunk, meta),
                error: (e) => console.error('Encoder Error:', e)
            });

            this.videoEncoder.configure({
                // CODEC: Changed to Baseline Profile (Much faster on CPU)
                codec: 'avc1.42001f',

                width: width,
                height: height,

                // BITRATE: Lowered to 5Mbps (Safe for i5, still HD quality)
                bitrate: 5_000_000,

                framerate: fps,

                // LATENCY: Removed 'quality' mode. 
                // This allows the encoder to prioritize speed to prevent freezing.
                latencyMode: 'realtime'
            });

            // 4. Configure Audio Encoder
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());

            this.audioEncoder = new AudioEncoder({
                output: (chunk, meta) => this.muxer.addAudioChunk(chunk, meta),
                error: (e) => console.error('Audio Error:', e)
            });

            this.audioEncoder.configure({
                codec: 'mp4a.40.2',
                numberOfChannels: 1,
                sampleRate: 44100,
                bitrate: 256_000 // 256 kbps (Better Audio)
            });

            this.encodeAudio(this.audioEncoder, audioBuffer);

            // 5. Render Video (Aggressive Loop)
            const frameInterval = 1 / fps;
            const canvas = renderer.canvas;

            for (let i = 0; i < totalFrames; i++) {
                // TRAFFIC CONTROL: Looser limit (Wait only if > 15 frames pending)
                while (this.videoEncoder.encodeQueueSize > 15) {
                    await new Promise(r => setTimeout(r, 5)); // Short wait
                }

                renderer.drawFrame(i * frameInterval);

                const frame = new VideoFrame(canvas, { timestamp: i * 1000000 / fps });

                // Keyframe every 4 seconds (less processing)
                this.videoEncoder.encode(frame, { keyFrame: i % 120 === 0 });
                frame.close();

                // Update Progress less frequently (saves CPU)
                if (i % 30 === 0 && onProgress) {
                    const percent = (i / totalFrames) * 100;
                    onProgress(percent, `Rendering: ${Math.round(percent)}%`);
                    // Tiny breather to keep browser alive
                    await new Promise(r => setTimeout(r, 0));
                }
            }

            // 6. Finish
            await this.videoEncoder.flush();
            await this.audioEncoder.flush();
            this.muxer.finalize();

            const { buffer } = this.muxer.target;
            return new Blob([buffer], { type: 'video/mp4' });

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    encodeAudio(encoder, audioBuffer) {
        const data = audioBuffer.getChannelData(0);
        const chunkSize = 44100;
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const audioData = new AudioData({
                format: 'f32',
                sampleRate: 44100,
                numberOfFrames: chunk.length,
                numberOfChannels: 1,
                timestamp: i * 1000000 / 44100,
                data: chunk
            });
            encoder.encode(audioData);
            audioData.close();
        }
    }

    downloadVideo(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Turbo_Render_${Date.now()}.mp4`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
}

if (typeof module !== 'undefined') module.exports = VideoExporter;

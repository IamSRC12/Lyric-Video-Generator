// Video Exporter Module - WebCodecs MP4 Muxing & MediaRecorder Fallback

class VideoExporter {
    constructor() {
        this.muxer = null;
        this.videoEncoder = null;
        this.audioEncoder = null;
    }

    async exportVideo(renderer, audioBuffer, audioBlob, resolution = '1080', onProgress = null) {
        const segments = renderer.segments;
        if (!segments || segments.length === 0) throw new Error("Timeline is empty! Add lyrics or audio segments first.");

        renderer.setResolution(resolution);

        let width = renderer.width;
        let height = renderer.height;
        if (width % 2 !== 0) width -= 1;
        if (height % 2 !== 0) height -= 1;

        const fps = 30;
        const duration = audioBuffer ? audioBuffer.duration : segments[segments.length - 1].endTime + 1;
        const totalFrames = Math.ceil(duration * fps);

        console.log(`🎬 Exporting MP4 Video: ${width}x${height} @ ${fps}fps (${totalFrames} frames)`);

        try {
            // Attempt WebCodecs + Mp4Muxer Export
            if (typeof Mp4Muxer !== 'undefined' && typeof VideoEncoder !== 'undefined') {
                return await this.exportWebCodecs(renderer, audioBuffer, audioBlob, width, height, fps, duration, totalFrames, onProgress);
            } else {
                return await this.exportMediaRecorder(renderer, audioBlob, duration, fps, onProgress);
            }
        } catch (e) {
            console.warn('WebCodecs MP4 Muxer failed, using MediaRecorder fallback:', e);
            return await this.exportMediaRecorder(renderer, audioBlob, duration, fps, onProgress);
        }
    }

    async exportWebCodecs(renderer, audioBuffer, audioBlob, width, height, fps, duration, totalFrames, onProgress) {
        this.muxer = new Mp4Muxer.Muxer({
            target: new Mp4Muxer.ArrayBufferTarget(),
            video: { codec: 'avc', width, height },
            audio: { codec: 'aac', numberOfChannels: 1, sampleRate: 44100 },
            fastStart: 'in-memory',
        });

        this.videoEncoder = new VideoEncoder({
            output: (chunk, meta) => this.muxer.addVideoChunk(chunk, meta),
            error: (e) => console.error('VideoEncoder error:', e)
        });

        this.videoEncoder.configure({
            codec: 'avc1.42001f',
            width: width,
            height: height,
            bitrate: 6_000_000,
            framerate: fps,
            latencyMode: 'realtime'
        });

        if (audioBuffer) {
            try {
                this.audioEncoder = new AudioEncoder({
                    output: (chunk, meta) => this.muxer.addAudioChunk(chunk, meta),
                    error: (e) => console.error('AudioEncoder error:', e)
                });
                this.audioEncoder.configure({
                    codec: 'mp4a.40.2',
                    numberOfChannels: 1,
                    sampleRate: 44100,
                    bitrate: 256_000
                });
                this.encodeAudio(this.audioEncoder, audioBuffer);
            } catch (ae) {
                console.warn('Audio encoder setup error:', ae);
            }
        }

        const frameInterval = 1 / fps;
        const canvas = renderer.canvas;

        for (let i = 0; i < totalFrames; i++) {
            while (this.videoEncoder.encodeQueueSize > 15) {
                await new Promise(r => setTimeout(r, 5));
            }

            const frameTime = i * frameInterval;
            renderer.drawFrame(frameTime);

            const frame = new VideoFrame(canvas, { timestamp: Math.round(i * 1_000_000 / fps) });
            this.videoEncoder.encode(frame, { keyFrame: i % 60 === 0 });
            frame.close();

            if (onProgress) {
                const percent = Math.round((i / totalFrames) * 100);
                onProgress(percent, `Rendering Frame ${i + 1} / ${totalFrames} (${percent}%)`);
                if (i % 15 === 0) await new Promise(r => setTimeout(r, 0));
            }
        }

        await this.videoEncoder.flush();
        if (this.audioEncoder) await this.audioEncoder.flush();
        this.muxer.finalize();

        const { buffer } = this.muxer.target;
        return new Blob([buffer], { type: 'video/mp4' });
    }

    async exportMediaRecorder(renderer, audioBlob, duration, fps, onProgress) {
        return new Promise((resolve, reject) => {
            const canvas = renderer.canvas;
            const stream = canvas.captureStream(fps);

            const options = { mimeType: 'video/webm;codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm';
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/mp4' });
                resolve(blob);
            };

            mediaRecorder.start(100);

            const totalFrames = Math.ceil(duration * fps);
            let currentFrame = 0;
            const interval = setInterval(() => {
                if (currentFrame >= totalFrames) {
                    clearInterval(interval);
                    mediaRecorder.stop();
                } else {
                    const currentTime = currentFrame / fps;
                    renderer.drawFrame(currentTime);
                    if (onProgress) {
                        const pct = Math.round((currentFrame / totalFrames) * 100);
                        onProgress(pct, `Recording Video Stream: ${pct}%`);
                    }
                    currentFrame++;
                }
            }, 1000 / fps);
        });
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
                timestamp: Math.round(i * 1_000_000 / 44100),
                data: chunk
            });
            encoder.encode(audioData);
            audioData.close();
        }
    }

    downloadVideo(blob, filename = `Lyric_Video_${Date.now()}.mp4`) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
}

window.VideoExporter = VideoExporter;

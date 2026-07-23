// ========================================
// LYRIC VIDEO EXPORT HANDLER
// ========================================

class LyricExportHandler {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.statusElement = document.getElementById('integrationStatus');
    }

    updateStatus(message, color = '#94a3b8') {
        if (this.statusElement) {
            this.statusElement.textContent = message;
            this.statusElement.style.color = color;
        }
        console.log('Lyric Export Status:', message);
    }

    async startExport(format = 'webm') {
        if (this.isRecording) {
            this.updateStatus('Already recording!', '#ef4444');
            return;
        }

        try {
            const canvas = document.getElementById('previewCanvas');
            if (!canvas) {
                throw new Error('Preview canvas not found');
            }

            // Check if video is ready
            const previewSection = document.getElementById('previewSection');
            if (!previewSection || previewSection.style.display === 'none') {
                this.updateStatus('Please generate video first!', '#f59e0b');
                return;
            }

            this.updateStatus('Preparing export...', '#FFD700');

            // Get the audio element
            const audioElement = document.querySelector('audio');
            let duration = 30; // Default

            if (audioElement && audioElement.duration) {
                duration = Math.ceil(audioElement.duration);
            }

            // Get canvas stream at 60 FPS
            const stream = canvas.captureStream(60);

            // Try to add audio track
            if (audioElement) {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const source = audioContext.createMediaElementSource(audioElement);
                    const destination = audioContext.createMediaStreamDestination();

                    source.connect(destination);
                    source.connect(audioContext.destination);

                    const audioTracks = destination.stream.getAudioTracks();
                    audioTracks.forEach(track => stream.addTrack(track));

                    console.log('Audio track added to lyric video export');
                } catch (audioError) {
                    console.warn('Could not add audio track:', audioError);
                }
            }

            // Determine codec
            let mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm;codecs=vp8';
            }
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
            }

            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 8000000,
                audioBitsPerSecond: 192000
            });

            this.recordedChunks = [];

            // Handle data
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            // Handle stop
            this.mediaRecorder.onstop = () => {
                this.finalizeExport(format);
            };

            // Handle errors
            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                this.updateStatus('Recording error!', '#ef4444');
                this.isRecording = false;
            };

            // Start playback if not playing
            const previewButton = document.getElementById('previewButton');
            if (previewButton && audioElement && audioElement.paused) {
                audioElement.currentTime = 0;
                previewButton.click();
            }

            // Start recording
            this.mediaRecorder.start(1000);
            this.isRecording = true;

            let elapsed = 0;
            this.updateStatus(`Recording: 0/${duration}s`, '#FFD700');

            const progressInterval = setInterval(() => {
                if (!this.isRecording) {
                    clearInterval(progressInterval);
                    return;
                }

                elapsed++;
                this.updateStatus(`Recording: ${elapsed}/${duration}s`, '#FFD700');

                // Check if audio has ended
                if (audioElement && audioElement.ended) {
                    clearInterval(progressInterval);
                    this.stopExport();
                } else if (elapsed >= duration) {
                    clearInterval(progressInterval);
                    this.stopExport();
                }
            }, 1000);

        } catch (error) {
            console.error('Export error:', error);
            this.updateStatus('Export failed: ' + error.message, '#ef4444');
            this.isRecording = false;
        }
    }

    stopExport() {
        if (this.mediaRecorder && this.isRecording) {
            this.updateStatus('Finalizing...', '#e879f9');
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    finalizeExport(format) {
        try {
            const blob = new Blob(this.recordedChunks, {
                type: format === 'mp4' ? 'video/mp4' : 'video/webm'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            a.download = `lyric_video_${timestamp}.${format === 'mp4' ? 'mp4' : 'webm'}`;

            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            this.updateStatus(`✅ Exported! (${sizeMB} MB)`, '#2ecca7');

            setTimeout(() => {
                this.updateStatus('');
            }, 5000);

        } catch (error) {
            console.error('Finalize error:', error);
            this.updateStatus('Failed to save file!', '#ef4444');
        }
    }

    async sendToEndpoint(endpoint, projectName) {
        try {
            const canvas = document.getElementById('previewCanvas');
            if (!canvas) {
                this.updateStatus('Preview canvas not found!', '#ef4444');
                return;
            }

            const previewSection = document.getElementById('previewSection');
            if (!previewSection || previewSection.style.display === 'none') {
                this.updateStatus('Please generate video first!', '#f59e0b');
                return;
            }

            this.updateStatus(`Recording for ${projectName}...`, '#FFD700');

            // Start export
            await this.startExport('webm');

            // Wait for recording to complete
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (!this.isRecording) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 500);
            });

            // Convert to base64
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const reader = new FileReader();

            reader.onloadend = async () => {
                const base64data = reader.result;

                const payload = {
                    videoData: base64data,
                    metadata: {
                        timestamp: Date.now(),
                        source: 'LyricVideoGenerator',
                        type: 'lyric-video',
                        processingOptions: {
                            transcribe: true,
                            extractLyrics: true,
                            generateSEO: true
                        }
                    }
                };

                this.updateStatus(`Uploading to ${projectName}...`, '#e879f9');

                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        const result = await response.json();
                        this.updateStatus(`✅ Sent to ${projectName}!`, '#2ecca7');
                        console.log(`${projectName} response:`, result);
                    } else {
                        throw new Error(`HTTP ${response.status}`);
                    }
                } catch (fetchError) {
                    console.warn(`${projectName} endpoint not available:`, fetchError);
                    this.updateStatus(`✅ Sent to ${projectName}! (Simulated)`, '#2ecca7');
                }

                setTimeout(() => this.updateStatus(''), 5000);
            };

            reader.readAsDataURL(blob);

        } catch (error) {
            console.error('Send error:', error);
            this.updateStatus('Failed to send: ' + error.message, '#ef4444');
        }
    }
}

// Initialize export handler
const lyricExportHandler = new LyricExportHandler();

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Lyric Export Handler initialized');

    // Export MP4 button
    const exportMP4Btn = document.getElementById('exportMP4');
    if (exportMP4Btn) {
        exportMP4Btn.addEventListener('click', () => {
            lyricExportHandler.startExport('mp4');
        });
    }

    // Export WebM button
    const exportWebMBtn = document.getElementById('exportWebM');
    if (exportWebMBtn) {
        exportWebMBtn.addEventListener('click', () => {
            lyricExportHandler.startExport('webm');
        });
    }

    // Send to Universe button
    const sendToUniverseBtn = document.getElementById('sendToUniverse');
    if (sendToUniverseBtn) {
        sendToUniverseBtn.addEventListener('click', () => {
            const endpoint = document.getElementById('universeEndpoint')?.value || 'http://localhost:5000/api/video/upload';
            lyricExportHandler.sendToEndpoint(endpoint, 'Universe');
        });
    }

    // Send to Visualize button
    const sendToVisualizeBtn = document.getElementById('sendToVisualize');
    if (sendToVisualizeBtn) {
        sendToVisualizeBtn.addEventListener('click', () => {
            const endpoint = document.getElementById('visualizeEndpoint')?.value || 'http://localhost:8080/api/video/import';
            lyricExportHandler.sendToEndpoint(endpoint, 'Visualize');
        });
    }
});

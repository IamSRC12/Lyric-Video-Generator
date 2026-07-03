// Video Renderer - Canvas-based video generation

class VideoRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 1920;
        this.height = 1080;
        this.fps = 30;
        this.template = null;
        this.segments = [];
        this.background = null;
        this.isRendering = false;
    }

    setResolution(resolution) {
        const resolutions = {
            '720': { width: 1280, height: 720 },
            '1080': { width: 1920, height: 1080 },
            '1440': { width: 2560, height: 1440 }
        };

        const res = resolutions[resolution];
        this.width = res.width;
        this.height = res.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    setTemplate(templateName) {
        this.template = TEMPLATES[templateName];
    }

    setBackground(imageOrVideo) {
        this.background = imageOrVideo;
    }

    setSegments(segments) {
        this.segments = segments;
    }

    /**
     * Draw a single frame
     */
    drawFrame(currentTime) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        if (this.background) {
            this.drawBackground();
        } else {
            // Default gradient background
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#1e3c72');
            gradient.addColorStop(1, '#2a5298');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Find active segment
        const activeSegment = this.segments.find(seg =>
            currentTime >= seg.startTime && currentTime < seg.endTime
        );

        if (activeSegment && (this.template || this.customSettings)) {
            this.drawText(activeSegment, currentTime);
        }
    }

    drawBackground() {
        if (this.background instanceof HTMLImageElement) {
            // Draw image, cover the canvas
            const scale = Math.max(
                this.width / this.background.width,
                this.height / this.background.height
            );
            const x = (this.width - this.background.width * scale) / 2;
            const y = (this.height - this.background.height * scale) / 2;

            this.ctx.drawImage(
                this.background,
                x, y,
                this.background.width * scale,
                this.background.height * scale
            );
        } else if (this.background instanceof HTMLVideoElement) {
            // Draw video frame
            const scale = Math.max(
                this.width / this.background.videoWidth,
                this.height / this.background.videoHeight
            );
            const x = (this.width - this.background.videoWidth * scale) / 2;
            const y = (this.height - this.background.videoHeight * scale) / 2;

            this.ctx.drawImage(
                this.background,
                x, y,
                this.background.videoWidth * scale,
                this.background.videoHeight * scale
            );
        }
    }

    updateSettings(settings) {
        this.customSettings = settings;
    }

    drawText(segment, currentTime) {
        if (!segment || !segment.lyrics) return;

        // Use custom settings if available, otherwise fallback to template
        let settings = this.template;

        if (this.customSettings) {
            // Map custom settings to renderer format
            settings = {
                fontFamily: this.customSettings.fontFamily,
                fontSize: this.customSettings.fontSize,
                fontWeight: this.customSettings.fontWeight,
                textColor: this.customSettings.textColor,
                textAlign: this.customSettings.textAlign,
                position: {
                    x: this.customSettings.posX / 100,
                    y: this.customSettings.posY / 100
                },
                animation: {
                    in: this.customSettings.animationIn,
                    out: this.customSettings.animationOut,
                    duration: this.customSettings.animationSpeed
                },
                effects: {
                    outline: this.customSettings.outlineWidth > 0,
                    outlineColor: this.customSettings.outlineColor,
                    outlineWidth: this.customSettings.outlineWidth,
                    background: this.customSettings.enableBackground,
                    backgroundColor: `rgba(0,0,0,${this.customSettings.bgOpacity})`,
                    padding: 20
                },
                textShadow: this.customSettings.enableShadow,
                shadowBlur: this.customSettings.shadowBlur,
                letterSpacing: this.customSettings.letterSpacing,
                glow: this.customSettings.glowIntensity > 0,
                glowColor: this.customSettings.glowColor,
                glowSize: this.customSettings.glowIntensity
            };
        }

        if (!settings) return;

        const segmentDuration = segment.endTime - segment.startTime;
        const elapsed = currentTime - segment.startTime;

        // Calculate animation progress
        let inProgress = 1;
        let outProgress = 0;

        // Entry Animation Logic
        if (elapsed < settings.animation.duration) {
            inProgress = elapsed / settings.animation.duration;
        }

        // Exit Animation Logic
        if (elapsed > segmentDuration - settings.animation.duration) {
            outProgress = (elapsed - (segmentDuration - settings.animation.duration)) / settings.animation.duration;
        }

        // Default Animation State
        let animState = { opacity: 1, offsetX: 0, offsetY: 0, scale: 1, rotation: 0 };

        // Handle Standard Animations (if not Typewriter/WordReveal)
        const isSpecialAnimation = settings.animation.in === 'typewriter' || settings.animation.in === 'wordReveal';

        if (!isSpecialAnimation) {
            if (elapsed < settings.animation.duration) {
                if (ANIMATIONS[settings.animation.in]) {
                    animState = ANIMATIONS[settings.animation.in](this.ctx, inProgress, this.canvas);
                } else {
                    // Fallback to fade
                    animState.opacity = inProgress;
                }
            } else if (outProgress > 0) {
                if (ANIMATIONS[settings.animation.out]) {
                    animState = ANIMATIONS[settings.animation.out](this.ctx, outProgress, this.canvas);
                } else {
                    animState.opacity = 1 - outProgress;
                }
            }
        } else {
            // For special animations, we handle opacity per character/word, but handle exit globally
            if (outProgress > 0) {
                if (ANIMATIONS[settings.animation.out]) {
                    animState = ANIMATIONS[settings.animation.out](this.ctx, outProgress, this.canvas);
                } else {
                    animState.opacity = 1 - outProgress;
                }
            }
        }

        // Apply global context state
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, Math.min(1, animState.opacity !== undefined ? animState.opacity : 1));

        // Calculate Base Position
        const x = this.width * settings.position.x + (animState.offsetX || 0);
        const y = this.height * settings.position.y + (animState.offsetY || 0);

        // Font Setup
        const scaleFactor = this.height / 1080;
        const fontSize = settings.fontSize * scaleFactor;

        this.ctx.font = `${settings.fontWeight} ${fontSize}px "${settings.fontFamily}", sans-serif`;
        this.ctx.textAlign = 'center'; // We always draw centered relative to position, then adjust x/y
        this.ctx.textBaseline = 'middle';

        if (settings.letterSpacing) {
            this.ctx.letterSpacing = `${settings.letterSpacing}px`;
        }

        // Apply transformations
        this.ctx.translate(x, y);
        if (animState.scale && animState.scale !== 1) this.ctx.scale(animState.scale, animState.scale);
        if (animState.rotation) this.ctx.rotate(animState.rotation);

        // Word Wrap Logic
        const maxTextWidth = this.width * 0.85;
        const words = segment.lyrics.split(/\s+/);
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = this.ctx.measureText(testLine);
            if (metrics.width > maxTextWidth) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        // Draw Lines
        const lineHeight = fontSize * 1.3;
        const totalHeight = lines.length * lineHeight;
        const startY = 0 - (totalHeight / 2) + (lineHeight / 2);

        // Check alignment to offset lines if needed (though translate handled global X)
        let lineXOffset = 0;
        if (settings.textAlign === 'left') lineXOffset = -this.width * 0.4; // Rough offset for left
        if (settings.textAlign === 'right') lineXOffset = this.width * 0.4;

        lines.forEach((line, lineIndex) => {
            const lineY = startY + (lineIndex * lineHeight);

            // Special Animation Handling (Typewriter / Word Reveal)
            if (isSpecialAnimation && elapsed < (segmentDuration + 1)) { // Allow animation to "hold"
                let visibleTextLine = "";

                if (segment.words && segment.words.length > 0) {
                    // PRECISE MODE: Use actual word timestamps
                    // Filter words that belong to this line (approximate since we wrapped text manually)
                    // Re-matching wrapped lines to original words is hard. 
                    // SIMPLER APPROACH: We map the 'progress' of the current time relative to the text lines.

                    // Actually, for Typewriter/Reveal we should rely on the timestamps if available.
                    // But our 'lines' are constructed from wrapping.

                    // Let's iterate through the words in this specific 'line' and see which are active.
                    const lineWords = line.split(/\s+/).filter(w => w);

                    // Find the global index of the first word in this line
                    let globalWordIndex = 0;
                    for (let k = 0; k < lineIndex; k++) globalWordIndex += lines[k].split(/\s+/).filter(w => w).length;

                    let activeWords = [];

                    lineWords.forEach((w, wIdx) => {
                        const realWord = segment.words[globalWordIndex + wIdx];
                        if (realWord) {
                            // Reveal logic
                            if (settings.animation.in === 'typewriter') {
                                if (currentTime >= realWord.start) {
                                    // If fully passed end, show whole word
                                    if (currentTime >= realWord.end) {
                                        activeWords.push(w);
                                    } else {
                                        // In the middle of the word: reveal chars
                                        const duration = realWord.end - realWord.start;
                                        const progress = (currentTime - realWord.start) / duration;
                                        const charCount = Math.floor(progress * w.length);
                                        activeWords.push(w.substring(0, charCount));
                                    }
                                }
                            } else { // wordReveal
                                if (currentTime >= realWord.start) {
                                    activeWords.push(w);
                                }
                            }
                        } else {
                            // Fallback if mapping fails (e.g. extra words from punctuation split)
                            if (inProgress > (globalWordIndex + wIdx) / words.length) {
                                activeWords.push(w);
                            }
                        }
                    });

                    visibleTextLine = activeWords.join(' ');

                } else {
                    // FALLBACK MODE: Use segment duration for more cinematic reveal
                    const revealProgress = Math.min(1, elapsed / (segmentDuration * 0.8)); // Finish 80% into segment

                    if (settings.animation.in === 'typewriter') {
                        const totalChars = lines.join('').length;
                        const lineStartChar = lines.slice(0, lineIndex).join('').length;
                        const visibleCharsGlobal = Math.floor(revealProgress * totalChars);

                        const charsToShow = Math.max(0, visibleCharsGlobal - lineStartChar);
                        if (charsToShow > 0) visibleTextLine = line.substring(0, charsToShow);

                    } else if (settings.animation.in === 'wordReveal') {
                        const totalWords = words.length;
                        let wordOffsetGlobal = 0;
                        for (let k = 0; k < lineIndex; k++) wordOffsetGlobal += lines[k].split(/\s+/).filter(w => w).length;

                        const visibleWordsGlobal = Math.floor(revealProgress * totalWords);
                        const wordsToShowInLine = Math.max(0, visibleWordsGlobal - wordOffsetGlobal);

                        if (wordsToShowInLine > 0) visibleTextLine = line.split(/\s+/).filter(w => w).slice(0, wordsToShowInLine).join(' ');
                    }
                }

                if (visibleTextLine) {
                    this.drawSingleLine(visibleTextLine, lineXOffset, lineY, settings, fontSize);
                }

            } else {
                // Normal Drawing (Everything visible)
                this.drawSingleLine(line, lineXOffset, lineY, settings, fontSize);
            }
        });

        this.ctx.restore();
    }

    /**
     * Draws text with a "CSS-like" glow effect directly on Canvas
     * Use this instead of ctx.fillText for glowing text
     */
    drawGlowingText(ctx, text, x, y, color, glowColor, fontSize) {
        ctx.save();

        // 1. Set the Glow (Shadow)
        ctx.shadowColor = glowColor; // e.g., "cyan" or "#00FFFF"
        ctx.shadowBlur = 15;         // The "spread" of the glow
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = color;
        ctx.textAlign = "center";

        // 2. Draw multiple times to intensify the glow (Optional hack for strong glow)
        ctx.fillText(text, x, y);
        ctx.fillText(text, x, y);

        ctx.restore(); // Important: Cleans up so other items don't glow
    }

    drawSingleLine(text, x, y, settings, fontSize) {
        if (!text) return;

        // Background
        if (settings.effects.background) {
            const metrics = this.ctx.measureText(text);
            const padding = settings.effects.padding || 20;
            this.ctx.fillStyle = settings.effects.backgroundColor;
            this.ctx.fillRect(x - metrics.width / 2 - padding, y - fontSize / 2 - padding, metrics.width + padding * 2, fontSize + padding * 2);
        }

        // Glow
        if (settings.glow) {
            this.drawGlowingText(this.ctx, text, x, y, settings.textColor, settings.glowColor, fontSize);
        } else if (settings.textShadow) {
            // Shadow
            this.ctx.save();
            this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
            this.ctx.shadowBlur = settings.shadowBlur;
            this.ctx.shadowOffsetY = 4;
            this.ctx.fillStyle = settings.textColor;
            this.ctx.fillText(text, x, y);
            this.ctx.restore();
        } else {
            // Main Text (Plain)
            this.ctx.fillStyle = settings.textColor;
            this.ctx.fillText(text, x, y);
        }

        // Outline
        if (settings.effects.outline) {
            this.ctx.strokeStyle = settings.effects.outlineColor;
            this.ctx.lineWidth = settings.effects.outlineWidth;
            this.ctx.strokeText(text, x, y);
        }
    }

    /**
     * Preview animation
     */
    async preview(audioElement) {
        this.isRendering = true;

        const animate = () => {
            if (!this.isRendering) return;

            const currentTime = audioElement.currentTime;
            this.drawFrame(currentTime);

            requestAnimationFrame(animate);
        };

        animate();
    }

    stopPreview() {
        this.isRendering = false;
    }

    /**
     * Export video
     */
    async exportVideo(audioBlobs, onProgress) {
        // This is a simplified version - full implementation would use MediaRecorder
        // For now, we'll create a basic implementation

        console.log('Export video with', audioBlobs.length, 'segments');

        // Combine audio blobs
        const combinedAudio = new Blob(audioBlobs, { type: 'audio/wav' });

        // Create audio element
        const audio = new Audio(URL.createObjectURL(combinedAudio));
        await new Promise(resolve => {
            audio.addEventListener('loadedmetadata', resolve);
        });

        const duration = audio.duration;
        const totalFrames = Math.ceil(duration * this.fps);

        console.log(`Rendering ${totalFrames} frames at ${this.fps}fps`);

        // For now, just show progress
        for (let i = 0; i < totalFrames; i++) {
            const currentTime = i / this.fps;
            this.drawFrame(currentTime);

            if (onProgress && i % 10 === 0) {
                onProgress((i / totalFrames) * 100);
            }

            // Small delay to keep UI responsive
            if (i % 30 === 0) {
                await new Promise(r => setTimeout(r, 1));
            }
        }

        onProgress(100);

        // Note: Full video export would require MediaRecorder or server-side processing
        alert('Video rendering complete! Note: Full video export requires additional setup. For now, you can screen-record the preview.');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoRenderer;
}

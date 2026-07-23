// Video Renderer - Canvas-based video generation with Full Customization, 16 Presets & Advanced Animations

class VideoRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 1920;
        this.height = 1080;
        this.fps = 30;
        this.preset = '7clouds';
        this.segments = [];
        this.background = null;
        this.bgType = 'none'; // 'image', 'video'
        this.bgSettings = {
            opacity: 1.0,
            blur: 0,
            scaleMode: 'cover',
            overlayColor: 'rgba(0,0,0,0)'
        };

        // Customization Settings
        this.customSettings = {
            fontFamily: 'Poppins',
            fontSize: 80,
            fontWeight: '700',
            textColor: '#3D2314',
            glowColor: '#F58F70',
            glowSize: 30,
            outlineColor: '#000000',
            outlineWidth: 0,
            posX: 50, // %
            posY: 50, // %
            textAlign: 'center',
            entryAnimation: 'slideUp',
            exitAnimation: 'fadeOut',
            animationSpeed: 0.5
        };

        this.beatSyncEnabled = true;
        this.beatSensitivity = 1.0;
        this.shakeIntensity = 0;
        this.bassPulse = 1.0;

        this.particles = [];
        this.initParticles();
    }

    setResolution(resolution) {
        const resolutions = {
            '720': { width: 1280, height: 720 },
            '1080': { width: 1920, height: 1080 },
            '1440': { width: 2560, height: 1440 }
        };

        const res = resolutions[resolution] || resolutions['1080'];
        this.width = res.width;
        this.height = res.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    setPreset(presetKey) {
        this.preset = presetKey;
        if (window.TEMPLATES && window.TEMPLATES[presetKey]) {
            const tmpl = window.TEMPLATES[presetKey];
            if (tmpl.fontFamily) this.customSettings.fontFamily = tmpl.fontFamily;
            if (tmpl.fontSize) this.customSettings.fontSize = tmpl.fontSize;
            if (tmpl.fontWeight) this.customSettings.fontWeight = tmpl.fontWeight;
            if (tmpl.textColor) this.customSettings.textColor = tmpl.textColor;
            if (tmpl.position) {
                this.customSettings.posX = Math.round(tmpl.position.x * 100);
                this.customSettings.posY = Math.round(tmpl.position.y * 100);
            }
            if (tmpl.animation) {
                this.customSettings.entryAnimation = tmpl.animation.in || 'fadeIn';
                this.customSettings.exitAnimation = tmpl.animation.out || 'fadeOut';
            }
        }
    }

    updateSettings(newSettings) {
        this.customSettings = { ...this.customSettings, ...newSettings };
    }

    updateBgSettings(bgSettings) {
        this.bgSettings = { ...this.bgSettings, ...bgSettings };
    }

    setBackground(imageOrVideo, type = 'image') {
        this.background = imageOrVideo;
        this.bgType = type;
    }

    setSegments(segments) {
        this.segments = segments;
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 4 + 1.5,
                speedY: -(Math.random() * 1.2 + 0.3),
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    updateBeatData(audioEnergy = 0) {
        if (this.beatSyncEnabled) {
            this.bassPulse = 1.0 + (audioEnergy * 0.3 * this.beatSensitivity);
            this.shakeIntensity = audioEnergy > 0.75 ? (audioEnergy - 0.75) * 20 * this.beatSensitivity : 0;
        } else {
            this.bassPulse = 1.0;
            this.shakeIntensity = 0;
        }
    }

    drawFrame(currentTime, audioEnergy = 0) {
        this.updateBeatData(audioEnergy);

        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();
        if (this.shakeIntensity > 0) {
            const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(offsetX, offsetY);
        }

        // 1. Draw Background Layer
        this.drawBackground();

        // 2. Ambient Particles
        if (this.preset === 'particle-explosion' || this.preset === 'fire-rise' || this.preset === 'neon-pulse') {
            this.drawParticles();
        }

        // 3. Active Segment Text Rendering
        const activeSegment = this.segments.find(seg =>
            currentTime >= seg.startTime && currentTime < seg.endTime
        );

        if (activeSegment) {
            this.drawText(activeSegment, currentTime);
        }

        this.ctx.restore();
    }

    drawBackground() {
        if (this.background) {
            this.ctx.save();

            if (this.bgSettings.blur > 0) {
                this.ctx.filter = `blur(${this.bgSettings.blur}px)`;
            }

            this.ctx.globalAlpha = this.bgSettings.opacity;

            let bw = this.background.width || this.background.videoWidth || this.width;
            let bh = this.background.height || this.background.videoHeight || this.height;

            if (bw > 0 && bh > 0) {
                let scale = 1;
                if (this.bgSettings.scaleMode === 'cover') {
                    scale = Math.max(this.width / bw, this.height / bh);
                } else if (this.bgSettings.scaleMode === 'contain') {
                    scale = Math.min(this.width / bw, this.height / bh);
                }

                const x = (this.width - bw * scale) / 2;
                const y = (this.height - bh * scale) / 2;
                this.ctx.drawImage(this.background, x, y, bw * scale, bh * scale);
            }

            this.ctx.restore();
        } else {
            // Default Cream / Dark Espresso Theme background
            if (this.preset === '7clouds') {
                this.ctx.fillStyle = '#FFFDD0';
                this.ctx.fillRect(0, 0, this.width, this.height);
                const grad = this.ctx.createRadialGradient(
                    this.width / 2, this.height / 2, 200,
                    this.width / 2, this.height / 2, Math.max(this.width, this.height) / 1.2
                );
                grad.addColorStop(0, 'rgba(255, 253, 208, 0.95)');
                grad.addColorStop(1, 'rgba(210, 180, 140, 0.45)');
                this.ctx.fillStyle = grad;
                this.ctx.fillRect(0, 0, this.width, this.height);
            } else {
                const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
                gradient.addColorStop(0, '#1E120B');
                gradient.addColorStop(1, '#0C0704');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        }

        // Overlay Tint
        if (this.bgSettings.overlayColor && this.bgSettings.overlayColor !== 'rgba(0,0,0,0)') {
            this.ctx.save();
            this.ctx.fillStyle = this.bgSettings.overlayColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }
    }

    drawParticles() {
        this.ctx.save();
        this.ctx.fillStyle = this.customSettings.glowColor || '#F58F70';
        this.particles.forEach(p => {
            p.y += p.speedY;
            if (p.y < 0) p.y = this.height;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    drawText(segment, currentTime) {
        if (!segment || !segment.lyrics) return;

        const lyrics = segment.lyrics;
        const duration = Math.max(0.2, segment.endTime - segment.startTime);
        const elapsed = currentTime - segment.startTime;
        const progress = Math.max(0, Math.min(1, elapsed / duration));

        // Use segment specific settings if mapped by AI or customization
        const fontFamily = segment.fontFamily || this.customSettings.fontFamily;
        const baseFontSize = segment.fontSize || this.customSettings.fontSize;
        const fontWeight = segment.fontWeight || this.customSettings.fontWeight;
        const textColor = segment.textColor || this.customSettings.textColor;
        const glowColor = segment.glowColor || this.customSettings.glowColor;
        const glowSize = segment.glowSize !== undefined ? segment.glowSize : this.customSettings.glowSize;
        const outlineColor = segment.outlineColor || this.customSettings.outlineColor;
        const outlineWidth = segment.outlineWidth !== undefined ? segment.outlineWidth : this.customSettings.outlineWidth;
        const entryAnim = segment.entryAnimation || this.customSettings.entryAnimation || 'slideUp';
        const exitAnim = segment.exitAnimation || this.customSettings.exitAnimation || 'fadeOut';

        // Calculate Position X and Y
        const posXPercent = segment.posX !== undefined ? segment.posX : this.customSettings.posX;
        const posYPercent = segment.posY !== undefined ? segment.posY : this.customSettings.posY;
        const posX = (posXPercent / 100) * this.width;
        const posY = (posYPercent / 100) * this.height;

        const fontSize = Math.round(baseFontSize * this.bassPulse);

        this.ctx.save();

        // Calculate Entry & Exit Keyframe Progress
        const animSpeed = this.customSettings.animationSpeed || 0.5;
        const entryDuration = Math.min(0.4, duration * animSpeed);
        const exitDuration = Math.min(0.4, duration * animSpeed);

        let alpha = 1;
        let scale = 1;
        let offsetY = 0;
        let offsetX = 0;
        let skewX = 0;

        if (elapsed < entryDuration) {
            const inProgress = elapsed / entryDuration;
            if (entryAnim === 'fadeIn') alpha = inProgress;
            else if (entryAnim === 'slideUp') { alpha = inProgress; offsetY = (1 - inProgress) * 60; }
            else if (entryAnim === 'zoomIn') { alpha = inProgress; scale = 0.5 + (inProgress * 0.5); }
            else if (entryAnim === 'typewriter') { alpha = 1; }
            else if (entryAnim === 'glitchIntense') { alpha = inProgress; offsetX = (Math.random() - 0.5) * 30; }
            else if (entryAnim === 'rotate3D') { alpha = inProgress; skewX = (1 - inProgress) * 0.5; }
            else if (entryAnim === 'bounceIn') {
                alpha = inProgress;
                scale = 1 + Math.sin(inProgress * Math.PI) * 0.3;
            }
        } else if (elapsed > (duration - exitDuration)) {
            const outProgress = (duration - elapsed) / exitDuration;
            if (exitAnim === 'fadeOut') alpha = outProgress;
            else if (exitAnim === 'slideDown') { alpha = outProgress; offsetY = (1 - outProgress) * 60; }
            else if (exitAnim === 'zoomOut') { alpha = outProgress; scale = outProgress; }
        }

        this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        this.ctx.translate(posX + offsetX, posY + offsetY);
        if (scale !== 1) this.ctx.scale(scale, scale);
        if (skewX !== 0) this.ctx.transform(1, 0, skewX, 1, 0, 0);

        this.ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
        this.ctx.textAlign = this.customSettings.textAlign || 'center';
        this.ctx.textBaseline = 'middle';

        // Glow / Shadow
        if (glowSize > 0) {
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = glowSize;
        } else {
            this.ctx.shadowBlur = 0;
        }

        // Outline / Stroke
        if (outlineWidth > 0) {
            this.ctx.strokeStyle = outlineColor;
            this.ctx.lineWidth = outlineWidth;
            this.ctx.strokeText(lyrics, 0, 0);
        }

        // Main Text Fill
        this.ctx.fillStyle = textColor;

        if (entryAnim === 'typewriter' && elapsed < entryDuration) {
            const visibleChars = Math.floor(lyrics.length * (elapsed / entryDuration));
            this.ctx.fillText(lyrics.substring(0, visibleChars), 0, 0);
        } else {
            this.ctx.fillText(lyrics, 0, 0);
        }

        this.ctx.restore();
    }
}

window.VideoRenderer = VideoRenderer;

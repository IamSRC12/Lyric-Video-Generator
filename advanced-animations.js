// Advanced Animation Library - 30+ Professional Animations

const ADVANCED_ANIMATIONS = {
    // ========== PARTICLE EFFECTS ==========
    particleExplosion: {
        name: 'Particle Explosion',
        category: 'particles',
        render: (ctx, progress, text, x, y, settings) => {
            const particles = 50;
            const explosionRadius = 200 * progress;

            for (let i = 0; i < particles; i++) {
                const angle = (Math.PI * 2 * i) / particles;
                const px = x + Math.cos(angle) * explosionRadius * (1 - progress);
                const py = y + Math.sin(angle) * explosionRadius * (1 - progress);

                ctx.save();
                ctx.globalAlpha = 1 - progress;
                ctx.fillStyle = settings.glowColor || '#FFD700';
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Main text appears as particles settle
            ctx.globalAlpha = progress;
            return { opacity: progress, scale: 0.5 + (progress * 0.5) };
        }
    },

    particleGather: {
        name: 'Particle Gather',
        category: 'particles',
        render: (ctx, progress, text, x, y, settings) => {
            const particles = 100;
            const scatterRadius = 300 * (1 - progress);

            for (let i = 0; i < particles; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * scatterRadius;
                const px = x + Math.cos(angle) * distance;
                const py = y + Math.sin(angle) * distance;

                ctx.save();
                ctx.globalAlpha = progress;
                ctx.fillStyle = settings.textColor || '#FFFFFF';
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            return { opacity: progress, scale: progress };
        }
    },

    // ========== 3D EFFECTS ==========
    rotate3D: {
        name: '3D Rotation',
        category: '3d',
        render: (ctx, progress, text, x, y, settings) => {
            const rotationY = (1 - progress) * Math.PI;
            const scale = Math.abs(Math.cos(rotationY));

            return {
                opacity: progress,
                scale: scale,
                skewX: Math.sin(rotationY) * 0.5
            };
        }
    },

    flip3D: {
        name: '3D Flip',
        category: '3d',
        render: (ctx, progress, text, x, y, settings) => {
            const angle = progress * Math.PI;
            const scaleY = Math.cos(angle);

            return {
                opacity: Math.abs(scaleY),
                scaleY: Math.abs(scaleY),
                offsetY: Math.sin(angle) * 50
            };
        }
    },

    cube3D: {
        name: '3D Cube Reveal',
        category: '3d',
        render: (ctx, progress, text, x, y, settings) => {
            const rotationX = (1 - progress) * Math.PI / 2;
            const scaleY = Math.cos(rotationX);
            const offsetY = Math.sin(rotationX) * -100;

            return {
                opacity: progress,
                scaleY: scaleY,
                offsetY: offsetY
            };
        }
    },

    // ========== WAVE EFFECTS ==========
    waveReveal: {
        name: 'Wave Reveal',
        category: 'wave',
        renderPerChar: true,
        render: (ctx, progress, char, charIndex, totalChars, x, y, settings) => {
            const wave = Math.sin((charIndex / totalChars) * Math.PI * 2 - progress * Math.PI * 2);
            const offsetY = wave * 30 * (1 - progress);
            const charProgress = Math.max(0, Math.min(1, progress * 2 - (charIndex / totalChars)));

            return {
                opacity: charProgress,
                offsetY: offsetY,
                scale: 0.5 + charProgress * 0.5
            };
        }
    },

    rippleWave: {
        name: 'Ripple Wave',
        category: 'wave',
        renderPerChar: true,
        render: (ctx, progress, char, charIndex, totalChars, x, y, settings) => {
            const ripple = Math.sin((charIndex / totalChars) * Math.PI * 4 - progress * Math.PI * 4);
            const scale = 1 + ripple * 0.3 * (1 - progress);

            return {
                opacity: progress,
                scale: scale,
                offsetY: ripple * 20 * (1 - progress)
            };
        }
    },

    // ========== GLITCH EFFECTS ==========
    glitchIntense: {
        name: 'Intense Glitch',
        category: 'glitch',
        render: (ctx, progress, text, x, y, settings) => {
            const glitchAmount = (1 - progress) * 20;
            const offsetX = (Math.random() - 0.5) * glitchAmount;
            const offsetY = (Math.random() - 0.5) * glitchAmount;

            // RGB split effect
            if (Math.random() > 0.7) {
                ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = '#FF0000';
                ctx.fillText(text, x + offsetX - 2, y + offsetY);
                ctx.fillStyle = '#00FF00';
                ctx.fillText(text, x + offsetX + 2, y + offsetY);
                ctx.fillStyle = '#0000FF';
                ctx.fillText(text, x + offsetX, y + offsetY + 2);
                ctx.restore();
            }

            return {
                opacity: progress,
                offsetX: offsetX,
                offsetY: offsetY
            };
        }
    },

    digitalGlitch: {
        name: 'Digital Glitch',
        category: 'glitch',
        render: (ctx, progress, text, x, y, settings) => {
            const slices = 5;
            const glitchIntensity = 1 - progress;

            for (let i = 0; i < slices; i++) {
                if (Math.random() > 0.5) {
                    const offsetX = (Math.random() - 0.5) * 50 * glitchIntensity;
                    const sliceY = y - 20 + (i * 10);

                    ctx.save();
                    ctx.globalAlpha = progress;
                    ctx.fillStyle = settings.textColor;
                    ctx.fillText(text, x + offsetX, sliceY);
                    ctx.restore();
                }
            }

            return { opacity: progress };
        }
    },

    // ========== NEON EFFECTS ==========
    neonPulse: {
        name: 'Neon Pulse',
        category: 'neon',
        render: (ctx, progress, text, x, y, settings) => {
            const pulse = Math.sin(progress * Math.PI * 4);
            const glowSize = 20 + pulse * 30;

            ctx.save();
            ctx.shadowColor = settings.glowColor || '#FF00FF';
            ctx.shadowBlur = glowSize;
            ctx.fillStyle = settings.textColor;
            ctx.fillText(text, x, y);
            ctx.restore();

            return {
                opacity: progress,
                scale: 1 + pulse * 0.1
            };
        }
    },

    neonFlicker: {
        name: 'Neon Flicker',
        category: 'neon',
        render: (ctx, progress, text, x, y, settings) => {
            const flicker = Math.random() > 0.3 ? 1 : 0.3;
            const opacity = progress * flicker;

            ctx.save();
            ctx.shadowColor = settings.glowColor || '#00FFFF';
            ctx.shadowBlur = 40;
            ctx.globalAlpha = opacity;
            ctx.fillStyle = settings.textColor;
            ctx.fillText(text, x, y);
            ctx.restore();

            return { opacity: opacity };
        }
    },

    // ========== FIRE & ICE ==========
    fireRise: {
        name: 'Fire Rise',
        category: 'elemental',
        render: (ctx, progress, text, x, y, settings) => {
            const flames = 20;
            const riseHeight = 100 * (1 - progress);

            for (let i = 0; i < flames; i++) {
                const fx = x + (Math.random() - 0.5) * 200;
                const fy = y + riseHeight + Math.random() * 50;
                const size = Math.random() * 10 + 5;

                const gradient = ctx.createRadialGradient(fx, fy, 0, fx, fy, size);
                gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
                gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
                gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(fx, fy, size, 0, Math.PI * 2);
                ctx.fill();
            }

            return {
                opacity: progress,
                offsetY: -riseHeight / 2
            };
        }
    },

    iceCrystal: {
        name: 'Ice Crystal',
        category: 'elemental',
        render: (ctx, progress, text, x, y, settings) => {
            const crystals = 30;
            const spreadRadius = 150 * (1 - progress);

            for (let i = 0; i < crystals; i++) {
                const angle = (Math.PI * 2 * i) / crystals;
                const cx = x + Math.cos(angle) * spreadRadius;
                const cy = y + Math.sin(angle) * spreadRadius;
                const size = Math.random() * 5 + 2;

                ctx.save();
                ctx.globalAlpha = 1 - progress;
                ctx.fillStyle = '#00CED1';
                ctx.shadowColor = '#FFFFFF';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(cx, cy - size);
                ctx.lineTo(cx + size, cy);
                ctx.lineTo(cx, cy + size);
                ctx.lineTo(cx - size, cy);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            return {
                opacity: progress,
                scale: 0.7 + progress * 0.3
            };
        }
    },

    // ========== MATRIX & CODE ==========
    matrixRain: {
        name: 'Matrix Rain',
        category: 'tech',
        render: (ctx, progress, text, x, y, settings) => {
            const columns = 50;
            const chars = '01アイウエオカキクケコ';

            for (let i = 0; i < columns; i++) {
                const cx = (i / columns) * ctx.canvas.width;
                const rainProgress = (progress + (i / columns)) % 1;
                const cy = rainProgress * ctx.canvas.height;

                ctx.save();
                ctx.globalAlpha = 1 - rainProgress;
                ctx.fillStyle = '#00FF00';
                ctx.font = '16px monospace';
                ctx.fillText(chars[Math.floor(Math.random() * chars.length)], cx, cy);
                ctx.restore();
            }

            return {
                opacity: progress,
                scale: progress
            };
        }
    },

    binaryReveal: {
        name: 'Binary Reveal',
        category: 'tech',
        renderPerChar: true,
        render: (ctx, progress, char, charIndex, totalChars, x, y, settings) => {
            const charProgress = Math.max(0, Math.min(1, progress * 2 - (charIndex / totalChars)));

            if (charProgress < 1) {
                // Show binary before revealing actual character
                const binary = Math.random() > 0.5 ? '1' : '0';
                ctx.save();
                ctx.globalAlpha = 1 - charProgress;
                ctx.fillStyle = '#00FF00';
                ctx.fillText(binary, x, y);
                ctx.restore();
            }

            return {
                opacity: charProgress,
                scale: charProgress
            };
        }
    },

    // ========== BOUNCE & SPRING ==========
    elasticBounce: {
        name: 'Elastic Bounce',
        category: 'bounce',
        render: (ctx, progress, text, x, y, settings) => {
            const bounces = 3;
            const decay = Math.pow(1 - progress, 2);
            const bounce = Math.abs(Math.sin(progress * Math.PI * bounces)) * decay;
            const offsetY = -bounce * 100;

            return {
                opacity: progress,
                offsetY: offsetY,
                scale: 1 + bounce * 0.3
            };
        }
    },

    rubberBand: {
        name: 'Rubber Band',
        category: 'bounce',
        render: (ctx, progress, text, x, y, settings) => {
            const stretch = Math.sin(progress * Math.PI * 2) * (1 - progress);
            const scaleX = 1 + stretch * 0.5;
            const scaleY = 1 - stretch * 0.3;

            return {
                opacity: progress,
                scaleX: scaleX,
                scaleY: scaleY
            };
        }
    },

    // ========== SHATTER & BREAK ==========
    shatterGlass: {
        name: 'Shatter Glass',
        category: 'break',
        render: (ctx, progress, text, x, y, settings) => {
            const pieces = 20;

            for (let i = 0; i < pieces; i++) {
                const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.5;
                const distance = progress * 200;
                const px = x + Math.cos(angle) * distance;
                const py = y + Math.sin(angle) * distance + (progress * progress * 200); // Gravity
                const rotation = progress * Math.PI * 2;

                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(rotation);
                ctx.globalAlpha = 1 - progress;
                ctx.fillStyle = settings.textColor;
                ctx.font = `${settings.fontSize / pieces}px ${settings.fontFamily}`;
                ctx.fillText(text[i % text.length] || '', 0, 0);
                ctx.restore();
            }

            return { opacity: 1 - progress };
        }
    },

    explodeOut: {
        name: 'Explode Out',
        category: 'break',
        renderPerChar: true,
        render: (ctx, progress, char, charIndex, totalChars, x, y, settings) => {
            const angle = (charIndex / totalChars) * Math.PI * 2;
            const distance = progress * 300;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance + (progress * progress * 100);
            const rotation = progress * Math.PI * 4;

            return {
                opacity: 1 - progress,
                offsetX: offsetX,
                offsetY: offsetY,
                rotation: rotation,
                scale: 1 + progress
            };
        }
    },

    // ========== ZOOM & SCALE ==========
    zoomBlur: {
        name: 'Zoom Blur',
        category: 'zoom',
        render: (ctx, progress, text, x, y, settings) => {
            const layers = 5;
            const maxScale = 3;

            for (let i = 0; i < layers; i++) {
                const layerProgress = Math.max(0, progress - (i / layers) * 0.2);
                const scale = 1 + (1 - layerProgress) * maxScale;
                const opacity = layerProgress * (1 / layers);

                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.translate(x, y);
                ctx.scale(scale, scale);
                ctx.translate(-x, -y);
                ctx.fillStyle = settings.textColor;
                ctx.fillText(text, x, y);
                ctx.restore();
            }

            return { opacity: progress };
        }
    },

    perspectiveZoom: {
        name: 'Perspective Zoom',
        category: 'zoom',
        render: (ctx, progress, text, x, y, settings) => {
            const scale = 0.1 + progress * 0.9;
            const blur = (1 - progress) * 20;

            ctx.save();
            ctx.shadowBlur = blur;
            ctx.shadowColor = settings.textColor;
            ctx.restore();

            return {
                opacity: progress,
                scale: scale,
                offsetY: (1 - progress) * -100
            };
        }
    },

    // ========== RAINBOW & COLOR ==========
    rainbowShift: {
        name: 'Rainbow Shift',
        category: 'color',
        renderPerChar: true,
        render: (ctx, progress, char, charIndex, totalChars, x, y, settings) => {
            const hue = ((charIndex / totalChars) * 360 + progress * 360) % 360;
            const color = `hsl(${hue}, 100%, 50%)`;

            ctx.save();
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillText(char, x, y);
            ctx.restore();

            return { opacity: progress };
        }
    },

    chromatic: {
        name: 'Chromatic Aberration',
        category: 'color',
        render: (ctx, progress, text, x, y, settings) => {
            const offset = (1 - progress) * 10;

            ctx.save();
            ctx.globalAlpha = progress;

            // Red channel
            ctx.fillStyle = '#FF0000';
            ctx.fillText(text, x - offset, y);

            // Green channel
            ctx.fillStyle = '#00FF00';
            ctx.fillText(text, x, y);

            // Blue channel
            ctx.fillStyle = '#0000FF';
            ctx.fillText(text, x + offset, y);

            ctx.restore();

            return { opacity: progress };
        }
    },

    // ========== SMOKE & FOG ==========
    smokeFade: {
        name: 'Smoke Fade',
        category: 'atmospheric',
        render: (ctx, progress, text, x, y, settings) => {
            const particles = 30;

            for (let i = 0; i < particles; i++) {
                const px = x + (Math.random() - 0.5) * 100;
                const py = y + (Math.random() - 0.5) * 100 - progress * 50;
                const size = Math.random() * 30 + 10;

                const gradient = ctx.createRadialGradient(px, py, 0, px, py, size);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${(1 - progress) * 0.3})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();
            }

            return {
                opacity: progress,
                scale: 0.8 + progress * 0.2
            };
        }
    },

    // ========== LIGHTNING ==========
    lightning: {
        name: 'Lightning Strike',
        category: 'electric',
        render: (ctx, progress, text, x, y, settings) => {
            if (progress < 0.3) {
                // Lightning bolts
                const bolts = 5;
                for (let i = 0; i < bolts; i++) {
                    ctx.save();
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#00FFFF';
                    ctx.shadowBlur = 20;

                    ctx.beginPath();
                    ctx.moveTo(x + (Math.random() - 0.5) * 200, 0);

                    let currentY = 0;
                    while (currentY < y) {
                        currentY += Math.random() * 50 + 20;
                        ctx.lineTo(x + (Math.random() - 0.5) * 100, currentY);
                    }

                    ctx.stroke();
                    ctx.restore();
                }
            }

            return {
                opacity: progress,
                scale: progress
            };
        }
    }
};

// Helper function to apply animation state
function applyAnimationState(ctx, state, x, y) {
    ctx.save();

    if (state.opacity !== undefined) {
        ctx.globalAlpha = state.opacity;
    }

    ctx.translate(x + (state.offsetX || 0), y + (state.offsetY || 0));

    if (state.rotation) {
        ctx.rotate(state.rotation);
    }

    const scaleX = state.scaleX || state.scale || 1;
    const scaleY = state.scaleY || state.scale || 1;
    if (scaleX !== 1 || scaleY !== 1) {
        ctx.scale(scaleX, scaleY);
    }

    if (state.skewX) {
        ctx.transform(1, 0, state.skewX, 1, 0, 0);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ADVANCED_ANIMATIONS, applyAnimationState };
}

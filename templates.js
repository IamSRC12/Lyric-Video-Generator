// ULTIMATE Animation Templates for Lyric Video Generator
// 16 AMAZING Templates with BIGGER, More Dynamic Effects!

const TEMPLATES = {
    '7clouds': {
        name: '7Clouds Style',
        description: 'Centered text with smooth fade in/out',
        textAlign: 'center',
        fontSize: 72,  // BIGGER!
        fontFamily: 'Poppins',
        fontWeight: '700',
        textColor: '#ffffff',
        textShadow: '0 8px 40px rgba(0,0,0,0.9)',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'fadeIn',
            out: 'fadeOut',
            duration: 0.6
        },
        effects: {
            glow: true,
            glowColor: 'rgba(255,255,255,0.6)',
            glowSize: 50,
            letterSpacing: 3
        }
    },

    'karaoke': {
        name: 'Karaoke Style',
        description: 'Word-by-word highlight effect',
        textAlign: 'center',
        fontSize: 68,  // BIGGER!
        fontFamily: 'Montserrat',
        fontWeight: '700',
        textColor: '#ffffff',
        highlightColor: '#FFD700',
        textShadow: '0 6px 30px rgba(0,0,0,0.9)',
        position: { x: 0.5, y: 0.85 },
        animation: {
            in: 'slideUp',
            out: 'fadeOut',
            duration: 0.4,
            wordByWord: true
        },
        effects: {
            outline: true,
            outlineColor: '#000000',
            outlineWidth: 6,
            letterSpacing: 2
        }
    },

    // NEW: PARTICLE EXPLOSION
    'particle-explosion': {
        name: 'Particle Explosion 💥',
        description: 'Explosive particle effects with text',
        textAlign: 'center',
        fontSize: 80,  // HUGE!
        fontFamily: 'Bebas Neue',
        fontWeight: '700',
        textColor: '#FFD700',
        textShadow: '0 0 60px #FFD700, 0 0 120px #FFD700',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'particleExplode',
            out: 'particleImplode',
            duration: 0.8
        },
        effects: {
            glow: true,
            glowColor: '#FFD700',
            glowSize: 80,
            particles: true,
            particleCount: 100,
            letterSpacing: 4
        }
    },

    // NEW: 3D ROTATION
    '3d-rotation': {
        name: '3D Rotation 🔄',
        description: '3D rotating text effect',
        textAlign: 'center',
        fontSize: 90,  // MASSIVE!
        fontFamily: 'Anton',
        fontWeight: '700',
        textColor: '#00FFFF',
        textShadow: '0 0 80px #00FFFF',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'rotate3D',
            out: 'rotate3DOut',
            duration: 1.0
        },
        effects: {
            glow: true,
            glowColor: '#00FFFF',
            glowSize: 100,
            perspective: true,
            letterSpacing: 5
        }
    },

    // NEW: WAVE ANIMATION
    'wave': {
        name: 'Wave Animation 🌊',
        description: 'Flowing wave text effect',
        textAlign: 'center',
        fontSize: 76,
        fontFamily: 'Fredoka One',
        fontWeight: '700',
        textColor: '#FF1493',
        textShadow: '0 0 50px #FF1493',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'waveIn',
            out: 'waveOut',
            duration: 0.9
        },
        effects: {
            rainbow: true,
            glow: true,
            glowSize: 60,
            letterSpacing: 3
        }
    },

    // NEW: GLITCH EFFECT
    'glitch': {
        name: 'Glitch Effect ⚡',
        description: 'Digital glitch distortion',
        textAlign: 'center',
        fontSize: 84,
        fontFamily: 'Righteous',
        fontWeight: '700',
        textColor: '#00FF00',
        textShadow: '0 0 40px #00FF00',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'glitchIn',
            out: 'glitchOut',
            duration: 0.7
        },
        effects: {
            glitch: true,
            rgbSplit: true,
            scanlines: true,
            letterSpacing: 4
        }
    },

    // NEW: NEON PULSE
    'neon-pulse': {
        name: 'Neon Pulse 💫',
        description: 'Pulsing neon glow effect',
        textAlign: 'center',
        fontSize: 88,
        fontFamily: 'Permanent Marker',
        fontWeight: '700',
        textColor: '#FF00FF',
        textShadow: '0 0 100px #FF00FF, 0 0 200px #FF00FF',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'neonPulseIn',
            out: 'neonPulseOut',
            duration: 0.8
        },
        effects: {
            glow: true,
            glowColor: '#FF00FF',
            glowSize: 120,
            pulse: true,
            letterSpacing: 5
        }
    },

    // NEW: RAINBOW GRADIENT
    'rainbow': {
        name: 'Rainbow Gradient 🌈',
        description: 'Animated rainbow colors',
        textAlign: 'center',
        fontSize: 82,
        fontFamily: 'Pacifico',
        fontWeight: '700',
        textColor: '#FFFFFF',
        textShadow: '0 0 60px rgba(255,255,255,0.8)',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'rainbowIn',
            out: 'rainbowOut',
            duration: 0.9
        },
        effects: {
            rainbow: true,
            rainbowSpeed: 2,
            glow: true,
            glowSize: 70,
            letterSpacing: 4
        }
    },

    // NEW: TYPEWRITER
    'typewriter': {
        name: 'Typewriter ⌨️',
        description: 'Classic typing effect',
        textAlign: 'center',
        fontSize: 70,
        fontFamily: 'Roboto Mono',
        fontWeight: '700',
        textColor: '#00FF00',
        textShadow: '0 0 40px #00FF00',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'typewriter',
            out: 'fadeOut',
            duration: 1.2
        },
        effects: {
            glow: true,
            glowColor: '#00FF00',
            glowSize: 50,
            cursor: true,
            letterSpacing: 2
        }
    },

    // NEW: FIRE EFFECT
    'fire': {
        name: 'Fire Effect 🔥',
        description: 'Burning text with flames',
        textAlign: 'center',
        fontSize: 86,
        fontFamily: 'Anton',
        fontWeight: '700',
        textColor: '#FF4500',
        textShadow: '0 0 80px #FF4500, 0 0 160px #FF4500',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'fireIn',
            out: 'fireOut',
            duration: 0.8
        },
        effects: {
            fire: true,
            glow: true,
            glowColor: '#FF4500',
            glowSize: 100,
            flicker: true,
            letterSpacing: 4
        }
    },

    // NEW: ICE CRYSTAL
    'ice': {
        name: 'Ice Crystal ❄️',
        description: 'Frozen crystal effect',
        textAlign: 'center',
        fontSize: 78,
        fontFamily: 'Raleway',
        fontWeight: '700',
        textColor: '#00CED1',
        textShadow: '0 0 60px #00CED1, 0 0 120px #00CED1',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'iceIn',
            out: 'iceOut',
            duration: 0.9
        },
        effects: {
            glow: true,
            glowColor: '#00CED1',
            glowSize: 80,
            sparkles: true,
            letterSpacing: 4
        }
    },

    // NEW: MATRIX RAIN
    'matrix': {
        name: 'Matrix Rain 💚',
        description: 'Matrix code rain effect',
        textAlign: 'center',
        fontSize: 74,
        fontFamily: 'Roboto Mono',
        fontWeight: '700',
        textColor: '#00FF00',
        textShadow: '0 0 50px #00FF00',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'matrixIn',
            out: 'matrixOut',
            duration: 1.0
        },
        effects: {
            matrix: true,
            glow: true,
            glowColor: '#00FF00',
            glowSize: 60,
            letterSpacing: 3
        }
    },

    // NEW: BOUNCE MEGA
    'bounce-mega': {
        name: 'Mega Bounce 🎾',
        description: 'Extreme bouncing animation',
        textAlign: 'center',
        fontSize: 92,  // SUPER HUGE!
        fontFamily: 'Fredoka One',
        fontWeight: '700',
        textColor: '#FF69B4',
        textShadow: '0 0 70px #FF69B4',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'megaBounceIn',
            out: 'megaBounceOut',
            duration: 1.0
        },
        effects: {
            glow: true,
            glowColor: '#FF69B4',
            glowSize: 90,
            bounce: true,
            letterSpacing: 5
        }
    },

    // NEW: SHATTER
    'shatter': {
        name: 'Shatter 💎',
        description: 'Glass shatter effect',
        textAlign: 'center',
        fontSize: 80,
        fontFamily: 'Oswald',
        fontWeight: '700',
        textColor: '#FFFFFF',
        textShadow: '0 0 60px rgba(255,255,255,0.8)',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'shatterIn',
            out: 'shatterOut',
            duration: 0.9
        },
        effects: {
            shatter: true,
            glow: true,
            glowSize: 70,
            letterSpacing: 4
        }
    },

    // NEW: ZOOM EXPLOSION
    'zoom-explosion': {
        name: 'Zoom Explosion 💥',
        description: 'Explosive zoom effect',
        textAlign: 'center',
        fontSize: 96,  // ULTRA HUGE!
        fontFamily: 'Anton',
        fontWeight: '700',
        textColor: '#FFD700',
        textShadow: '0 0 100px #FFD700, 0 0 200px #FFD700',
        position: { x: 0.5, y: 0.5 },
        animation: {
            in: 'zoomExplosion',
            out: 'zoomImplode',
            duration: 0.7
        },
        effects: {
            glow: true,
            glowColor: '#FFD700',
            glowSize: 150,
            explosion: true,
            letterSpacing: 6
        }
    },

    // IMPROVED EXISTING ONES
    'minimal': {
        name: 'Minimal Modern',
        description: 'Clean and simple typography',
        textAlign: 'left',
        fontSize: 64,  // BIGGER!
        fontFamily: 'Inter',
        fontWeight: '600',
        textColor: '#ffffff',
        textShadow: '0 4px 20px rgba(0,0,0,0.7)',
        position: { x: 0.1, y: 0.5 },
        animation: {
            in: 'slideRight',
            out: 'slideLeft',
            duration: 0.5
        },
        effects: {
            background: true,
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 30,
            letterSpacing: 1
        }
    },

    'cinematic': {
        name: 'Cinematic',
        description: 'Movie-style subtitles',
        textAlign: 'center',
        fontSize: 56,  // BIGGER!
        fontFamily: 'Roboto',
        fontWeight: '600',
        textColor: '#ffffff',
        textShadow: 'none',
        position: { x: 0.5, y: 0.88 },
        animation: {
            in: 'fadeIn',
            out: 'fadeOut',
            duration: 0.3
        },
        effects: {
            background: true,
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: 25,
            outline: true,
            outlineColor: '#000000',
            outlineWidth: 3,
            letterSpacing: 1
        }
    }
};

// Animation functions (BIGGER, MORE DYNAMIC!)
const ANIMATIONS = {
    fadeIn: (ctx, progress) => {
        return { opacity: progress };
    },

    fadeOut: (ctx, progress) => {
        return { opacity: 1 - progress };
    },

    slideUp: (ctx, progress, canvas) => {
        return {
            opacity: progress,
            offsetY: (1 - progress) * 150  // BIGGER movement!
        };
    },

    slideDown: (ctx, progress, canvas) => {
        return {
            opacity: progress,
            offsetY: -(1 - progress) * 150
        };
    },

    slideLeft: (ctx, progress, canvas) => {
        return {
            opacity: 1 - progress,
            offsetX: -progress * 300  // BIGGER movement!
        };
    },

    slideRight: (ctx, progress, canvas) => {
        return {
            opacity: progress,
            offsetX: (1 - progress) * -300
        };
    },

    zoomIn: (ctx, progress) => {
        return {
            opacity: progress,
            scale: 0.3 + (progress * 0.7)  // Start smaller for bigger effect!
        };
    },

    zoomOut: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            scale: 1 + (progress * 1.0)  // Zoom out more!
        };
    },

    bounceIn: (ctx, progress) => {
        const bounce = Math.sin(progress * Math.PI * 3) * (1 - progress) * 0.5;  // More bounce!
        return {
            opacity: progress,
            scale: 0.2 + (progress * 0.8) + bounce
        };
    },

    bounceOut: (ctx, progress) => {
        const bounce = Math.sin(progress * Math.PI * 3) * progress * 0.5;
        return {
            opacity: 1 - progress,
            scale: 1 - (progress * 0.8) + bounce
        };
    },

    // NEW ANIMATIONS
    particleExplode: (ctx, progress) => {
        return {
            opacity: progress,
            scale: 0.5 + (progress * 0.5),
            rotation: progress * Math.PI * 2
        };
    },

    particleImplode: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            scale: 1 + (progress * 0.5),
            rotation: -progress * Math.PI * 2
        };
    },

    rotate3D: (ctx, progress) => {
        return {
            opacity: progress,
            rotationY: (1 - progress) * Math.PI,
            scale: 0.5 + (progress * 0.5)
        };
    },

    rotate3DOut: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            rotationY: progress * Math.PI,
            scale: 1 - (progress * 0.5)
        };
    },

    waveIn: (ctx, progress) => {
        return {
            opacity: progress,
            wave: true,
            waveProgress: progress
        };
    },

    waveOut: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            wave: true,
            waveProgress: 1 - progress
        };
    },

    glitchIn: (ctx, progress) => {
        return {
            opacity: progress,
            glitch: true,
            glitchIntensity: 1 - progress
        };
    },

    glitchOut: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            glitch: true,
            glitchIntensity: progress
        };
    },

    neonPulseIn: (ctx, progress) => {
        const pulse = Math.sin(progress * Math.PI * 4);
        return {
            opacity: progress,
            scale: 0.8 + (progress * 0.2) + (pulse * 0.1)
        };
    },

    neonPulseOut: (ctx, progress) => {
        const pulse = Math.sin(progress * Math.PI * 4);
        return {
            opacity: 1 - progress,
            scale: 1 + (pulse * 0.1)
        };
    },

    rainbowIn: (ctx, progress) => {
        return {
            opacity: progress,
            rainbow: true,
            rainbowOffset: progress * 360
        };
    },

    rainbowOut: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            rainbow: true,
            rainbowOffset: (1 - progress) * 360
        };
    },

    typewriter: (ctx, progress) => {
        return {
            opacity: 1,
            typewriter: true,
            typeProgress: progress
        };
    },

    fireIn: (ctx, progress) => {
        const flicker = Math.sin(progress * 30) * 0.1;
        return {
            opacity: progress,
            scale: 0.8 + (progress * 0.2) + flicker
        };
    },

    fireOut: (ctx, progress) => {
        const flicker = Math.sin(progress * 30) * 0.1;
        return {
            opacity: 1 - progress,
            scale: 1 + (progress * 0.3) + flicker,
            offsetY: -progress * 100
        };
    },

    iceIn: (ctx, progress) => {
        return {
            opacity: progress,
            scale: 1.2 - (progress * 0.2),
            sparkle: true
        };
    },

    iceOut: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            scale: 1 - (progress * 0.2),
            shatter: true,
            shatterProgress: progress
        };
    },

    matrixIn: (ctx, progress) => {
        return {
            opacity: progress,
            matrix: true,
            matrixProgress: progress
        };
    },

    matrixOut: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            matrix: true,
            matrixProgress: 1 - progress
        };
    },

    megaBounceIn: (ctx, progress) => {
        const bounce = Math.sin(progress * Math.PI * 4) * (1 - progress) * 0.8;
        return {
            opacity: progress,
            scale: 0.1 + (progress * 0.9) + bounce,
            offsetY: bounce * 200
        };
    },

    megaBounceOut: (ctx, progress) => {
        const bounce = Math.sin(progress * Math.PI * 4) * progress * 0.8;
        return {
            opacity: 1 - progress,
            scale: 1 - (progress * 0.9) + bounce,
            offsetY: -bounce * 200
        };
    },

    shatterIn: (ctx, progress) => {
        return {
            opacity: progress,
            scale: 1.5 - (progress * 0.5)
        };
    },

    shatterOut: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            shatter: true,
            shatterProgress: progress,
            scale: 1 + (progress * 0.5)
        };
    },

    zoomExplosion: (ctx, progress) => {
        return {
            opacity: progress,
            scale: 0.1 + (progress * 0.9),
            rotation: progress * Math.PI * 4
        };
    },

    zoomImplode: (ctx, progress) => {
        return {
            opacity: 1 - progress,
            scale: 1 + (progress * 2),
            rotation: -progress * Math.PI * 4
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TEMPLATES, ANIMATIONS };
}

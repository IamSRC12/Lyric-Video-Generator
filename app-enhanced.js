// Enhanced App Integration - Connects all new features

// Global instances
let timelineEditor = null;
let aiFeatures = null;
let currentSegments = [];

// Initialize enhanced features after sync
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Enhanced Lyric Video Generator Loaded!');

    // Initialize AI Features
    aiFeatures = new AIEnhancedFeatures();

    // Hook into existing sync button
    const originalSyncButton = document.getElementById('syncButton');
    if (originalSyncButton) {
        originalSyncButton.addEventListener('click', handleEnhancedSync);
    }

    // Auto-populate additional advanced animations
    populateAdvancedAnimations();
});

async function handleEnhancedSync() {
    console.log('🤖 Starting AI-Enhanced Sync...');

    // Show AI panel
    const aiPanel = document.getElementById('aiPanel');
    if (aiPanel) {
        aiPanel.style.display = 'block';
    }

    // Wait for original sync to complete
    // This would hook into the existing app.js sync process
    setTimeout(async () => {
        await runAIAnalysis();
    }, 2000);
}

async function runAIAnalysis(mode = 'features') {
    if (!currentSegments || currentSegments.length === 0) {
        console.log('No segments to analyze');
        return;
    }

    // MODE: FORCE SYNC (Aligns current text to audio)
    if (mode === 'force-sync') {
        const audioBlob = window.state.mergedAudioBlob || window.state.fullAudioBlob;
        const apiKey = localStorage.getItem('groqApiKey');

        if (!audioBlob || !apiKey) {
            alert('Audio or API Key missing for Re-Sync');
            return;
        }

        try {
            console.log('🔄 Running Force Sync...');

            // Show Overlay
            const overlay = document.getElementById('reSyncOverlay');
            if (overlay) overlay.style.display = 'flex';

            const alignedSegments = await aiFeatures.forceAlignText(currentSegments, audioBlob, apiKey);

            // Update Global State
            window.currentSegments = alignedSegments;
            if (window.state) window.state.segments = alignedSegments;

            // Update Timeline
            if (timelineEditor) {
                timelineEditor.loadSegments(alignedSegments);
            }

            // Update Video Renderer
            if (typeof updateLivePreview === 'function') {
                updateLivePreview(alignedSegments);
            }

            showNotification('✅ Text re-synced to audio!', 'success');

        } catch (error) {
            console.error('Re-Sync failed:', error);
            showNotification('❌ Re-Sync failed: ' + error.message, 'error');
        } finally {
            // Hide Overlay
            const overlay = document.getElementById('reSyncOverlay');
            if (overlay) overlay.style.display = 'none';
        }
        return;
    }

    // DEFAULT MODE: Features only (Animation, Mood, etc.)
    // Combine all lyrics
    const allLyrics = currentSegments.map(s => s.lyrics).join('\n');

    // Run AI analysis
    const suggestions = await aiFeatures.suggestAnimations(allLyrics);

    // Update UI with suggestions
    updateAISuggestions(suggestions);

    // Analyze each segment
    for (let i = 0; i < currentSegments.length; i++) {
        const segment = currentSegments[i];
        const previousSegment = i > 0 ? currentSegments[i - 1] : null;

        const effects = await aiFeatures.generateTextEffects(segment, previousSegment);
        segment.aiEffects = effects;
    }

    console.log('✅ AI Analysis Complete!');
}

function updateAISuggestions(suggestions) {
    // Animation suggestion
    const animationEl = document.getElementById('aiAnimationSuggestion');
    if (animationEl) {
        animationEl.textContent = `Recommended: ${suggestions.entryAnimation} (Entry) → ${suggestions.exitAnimation} (Exit)`;
    }

    // Emotion suggestion
    const emotionEl = document.getElementById('aiEmotionSuggestion');
    if (emotionEl) {
        emotionEl.textContent = `Detected mood: ${suggestions.mood} - Perfect for ${suggestions.fontStyle} fonts`;
    }

    // Rhythm suggestion
    const rhythmEl = document.getElementById('aiRhythmSuggestion');
    if (rhythmEl) {
        rhythmEl.textContent = `Tempo detected - Optimizing animation speed for best sync`;
    }

    // Color suggestion
    const colorEl = document.getElementById('aiColorSuggestion');
    if (colorEl) {
        const colors = suggestions.colorScheme.join(', ');
        colorEl.innerHTML = `Suggested colors: <span style="display: inline-flex; gap: 5px; margin-left: 5px;">
            ${suggestions.colorScheme.map(c => `<span style="width: 20px; height: 20px; background: ${c}; border-radius: 4px; display: inline-block;"></span>`).join('')}
        </span>`;
    }

    // Store suggestions for apply button
    window.currentAISuggestions = suggestions;
}

// Apply AI suggestions
document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.getElementById('aiApplyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyAISuggestions);
    }
});

function applyAISuggestions() {
    if (!window.currentAISuggestions) {
        alert('No AI suggestions available. Please run sync first.');
        return;
    }

    const suggestions = window.currentAISuggestions;

    // Apply to customization settings
    const animationIn = document.getElementById('animationIn');
    const animationOut = document.getElementById('animationOut');
    const textColor = document.getElementById('textColor');
    const glowColor = document.getElementById('glowColor');

    if (animationIn) animationIn.value = suggestions.entryAnimation;
    if (animationOut) animationOut.value = suggestions.exitAnimation;
    if (glowColor && suggestions.colorScheme[0]) glowColor.value = suggestions.colorScheme[0];

    // Show success message
    showNotification('✨ AI suggestions applied successfully!', 'success');

    // Update preview if available
    if (typeof updateLivePreview === 'function') {
        updateLivePreview();
    }
}

// Initialize Timeline Editor
function initializeTimelineEditor(segments) {
    currentSegments = segments;

    const container = document.getElementById('timelineEditorContainer');
    const section = document.getElementById('timelineSection');

    if (!container || !section) {
        console.error('Timeline editor container not found');
        return;
    }

    // Show timeline section
    section.style.display = 'block';

    // Create timeline editor
    if (!timelineEditor) {
        timelineEditor = new TimelineEditor(container, window.renderer);
    }

    // Load segments
    timelineEditor.loadSegments(segments);

    console.log('⏱️ Timeline Editor Initialized!');
}

// Export segments from timeline
function getTimelineSegments() {
    if (timelineEditor) {
        return timelineEditor.getSegments();
    }
    return currentSegments;
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00C851, #007E33)' :
            type === 'error' ? 'linear-gradient(135deg, #ff4444, #CC0000)' :
                'linear-gradient(135deg, #33b5e5, #0099CC)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Enhanced animation selector with advanced animations
function populateAdvancedAnimations() {
    const animationInSelect = document.getElementById('animationIn');
    const animationOutSelect = document.getElementById('animationOut');

    if (!animationInSelect || !animationOutSelect) return;

    // Add advanced animations to dropdowns
    const advancedAnimations = [
        { value: 'particleExplosion', label: '💥 Particle Explosion' },
        { value: 'particleGather', label: '✨ Particle Gather' },
        { value: 'rotate3D', label: '🔄 3D Rotation' },
        { value: 'flip3D', label: '🔃 3D Flip' },
        { value: 'cube3D', label: '📦 3D Cube' },
        { value: 'waveReveal', label: '🌊 Wave Reveal' },
        { value: 'rippleWave', label: '〰️ Ripple Wave' },
        { value: 'glitchIntense', label: '⚡ Intense Glitch' },
        { value: 'digitalGlitch', label: '💻 Digital Glitch' },
        { value: 'neonPulse', label: '💫 Neon Pulse' },
        { value: 'neonFlicker', label: '✨ Neon Flicker' },
        { value: 'fireRise', label: '🔥 Fire Rise' },
        { value: 'iceCrystal', label: '❄️ Ice Crystal' },
        { value: 'matrixRain', label: '💚 Matrix Rain' },
        { value: 'binaryReveal', label: '01 Binary Reveal' },
        { value: 'elasticBounce', label: '🎾 Elastic Bounce' },
        { value: 'rubberBand', label: '🎸 Rubber Band' },
        { value: 'shatterGlass', label: '💎 Shatter Glass' },
        { value: 'explodeOut', label: '💥 Explode Out' },
        { value: 'zoomBlur', label: '🔍 Zoom Blur' },
        { value: 'perspectiveZoom', label: '👁️ Perspective Zoom' },
        { value: 'rainbowShift', label: '🌈 Rainbow Shift' },
        { value: 'chromatic', label: '🎨 Chromatic' },
        { value: 'smokeFade', label: '💨 Smoke Fade' },
        { value: 'lightning', label: '⚡ Lightning' }
    ];

    // Add to entry animations
    advancedAnimations.forEach(anim => {
        const option = document.createElement('option');
        option.value = anim.value;
        option.textContent = anim.label;
        animationInSelect.appendChild(option);
    });

    // Add to exit animations (some are better for exits)
    const exitAnimations = [
        { value: 'explodeOut', label: '💥 Explode Out' },
        { value: 'smokeFade', label: '💨 Smoke Fade' },
        { value: 'shatterGlass', label: '💎 Shatter Glass' },
        { value: 'particleExplosion', label: '💥 Particle Explosion' }
    ];
}

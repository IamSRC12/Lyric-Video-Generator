// Main Application Logic for Lyric Video Generator

// Global state
const state = {
    audioFiles: [],
    audioBlobs: [],
    fullAudioBlob: null,  // NEW: Original full audio (no glitches!)
    mergedAudioBlob: null,  // Merged segments (for fallback)
    background: null,
    lyrics: [],
    segments: [],
    selectedTemplate: '7clouds',
    apiKey: '',
    language: 'auto',
    resolution: '1080'
};

// Initialize
let renderer = null;
let groqService = null;
let videoExporter = null;
let previewAudio = null;

// ✅ EXPOSE GLOBAL STATE (Fixes sync issue!)
window.state = state;

// Load fonts on startup
loadAllFonts().then(() => {
    console.log('All Google Fonts loaded!');
});

// DOM Elements
const audioUploadArea = document.getElementById('audioUploadArea');
const audioFilesInput = document.getElementById('audioFiles');
const audioList = document.getElementById('audioList');

// Full audio elements
const fullAudioUploadArea = document.getElementById('fullAudioUploadArea');
const fullAudioInput = document.getElementById('fullAudioFile');
const fullAudioInfo = document.getElementById('fullAudioInfo');

const bgUploadArea = document.getElementById('bgUploadArea');
const backgroundFileInput = document.getElementById('backgroundFile');
const bgPreview = document.getElementById('bgPreview');

const apiProvider = document.getElementById('apiProvider');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeySection = document.getElementById('apiKeySection');
const apiKeyHint = document.getElementById('apiKeyHint');
const languageSelect = document.getElementById('languageSelect');
const resolutionSelect = document.getElementById('resolutionSelect');

const lyricsInput = document.getElementById('lyricsInput');
const syncButton = document.getElementById('syncButton');
const syncProgress = document.getElementById('syncProgress');
const syncStatus = document.getElementById('syncStatus');
const syncPercent = document.getElementById('syncPercent');
const syncProgressFill = document.getElementById('syncProgressFill');

const customizationSection = document.getElementById('customizationSection');
const templateCards = document.querySelectorAll('.template-card');

const previewSection = document.getElementById('previewSection');
const previewCanvas = document.getElementById('previewCanvas');
const previewButton = document.getElementById('previewButton');
const exportButton = document.getElementById('exportButton');
const exportProgress = document.getElementById('exportProgress');
const exportStatus = document.getElementById('exportStatus');
const exportPercent = document.getElementById('exportPercent');
const exportProgressFill = document.getElementById('exportProgressFill');

// Initialize renderer and exporter
renderer = new VideoRenderer(previewCanvas);
renderer.setResolution('1080');
videoExporter = new VideoExporter();

// ✅ EXPOSE RENDERER GLOBALLY
window.renderer = renderer;

// ✅ EXPOSE UPDATE FUNCTION FOR TIMELINE EDITOR
window.updateLivePreview = function (newSegments) {
    if (!renderer) return;

    // Use passed segments or fallback to state
    const segmentsToUse = newSegments || state.segments;

    // Update state if new segments provided
    if (newSegments) {
        state.segments = newSegments;
        window.currentSegments = newSegments;
    }

    // Update renderer
    if (segmentsToUse) {
        console.log('🔄 Syncing timeline changes to video renderer...');
        renderer.setSegments(segmentsToUse);

        // If actively previewing, redraw the current frame
        if (previewAudio && !previewAudio.paused) {
            // It's playing, loop will catch it
        } else if (previewAudio) {
            // Paused, force redraw
            renderer.drawFrame(previewAudio.currentTime);
        } else {
            // Stopped, redraw first frame
            renderer.drawFrame(0);
        }
    }
};

// AUTO-LOAD SAVED SETTINGS (language, resolution)
function loadSavedSettings() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) languageSelect.value = savedLanguage;

    const savedResolution = localStorage.getItem('resolution');
    if (savedResolution) {
        resolutionSelect.value = savedResolution;
        renderer.setResolution(savedResolution);
    }

    // ✅ FORCE GROQ API - NO MORE LOCAL DOCKER!
    apiProvider.value = 'groq';
    apiKeySection.style.display = 'block';

    // Load saved API key or use the provided one
    const savedApiKey = localStorage.getItem('groqApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        console.log('✅ Loaded saved Groq API key');
    } else {
        // Use the provided API key
        apiKeyInput.value = '';
        localStorage.setItem('groqApiKey', apiKeyInput.value);
        console.log('⚠️ Please configure your Groq API key in the settings');
    }
}

// AUTO-SAVE SETTINGS
function saveSettings() {
    localStorage.setItem('apiProvider', 'groq');
    localStorage.setItem('language', languageSelect.value);
    localStorage.setItem('resolution', resolutionSelect.value);
    if (apiKeyInput.value) {
        localStorage.setItem('groqApiKey', apiKeyInput.value);
    }
}

// Load settings on startup
loadSavedSettings();

// ✅ NO LONGER NEEDED - USING GROQ API!
console.log('🚀 Using Groq API - No local server needed!');
console.log('🔑 API Key configured and ready!');

// Event Listeners
audioUploadArea.addEventListener('click', () => audioFilesInput.click());
audioFilesInput.addEventListener('change', handleAudioFiles);

// Full audio upload click handler
fullAudioUploadArea.addEventListener('click', () => fullAudioInput.click());

bgUploadArea.addEventListener('click', () => backgroundFileInput.click());
backgroundFileInput.addEventListener('change', handleBackgroundFile);

syncButton.addEventListener('click', handleSync);

// Provider change handler (Forced to Groq)
apiProvider.addEventListener('change', (e) => {
    // Always stay on Groq
    if (e.target.value !== 'groq') {
        e.target.value = 'groq';
        console.log('✅ Keeping Groq API selected');
    }
    apiKeySection.style.display = 'block';
    saveSettings();
});

// Auto-save when API key changes
apiKeyInput.addEventListener('input', () => {
    saveSettings();
});

// Auto-save when language changes
languageSelect.addEventListener('change', () => {
    saveSettings();
});

// Auto-save when resolution changes
resolutionSelect.addEventListener('change', () => {
    saveSettings();
});

// Full audio upload handler
fullAudioInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    state.fullAudioBlob = file;

    fullAudioInfo.innerHTML = `
        <div style="padding: 1rem; background: rgba(255,215,0,0.2); border-radius: 8px; border: 2px solid var(--gold);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="font-size: 1.5rem;">✅</span>
                <strong style="color: var(--gold);">Full Audio Loaded!</strong>
            </div>
            <div style="color: var(--text-secondary);">
                <div>📁 ${file.name}</div>
                <div>💾 ${formatFileSize(file.size)}</div>
                <div style="color: var(--success); margin-top: 0.5rem;">
                    🎉 This audio will be used for smooth, glitch-free playback!
                </div>
            </div>
        </div>
    `;
});

// Template card logic REMOVED - Using CustomizationManager

previewButton.addEventListener('click', handlePreview);
exportButton.addEventListener('click', handleExport);

// Handlers
async function handleAudioFiles(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    state.audioFiles = files;
    state.audioBlobs = [];

    // Display file list
    audioList.innerHTML = '<h3 style="font-size: 1rem; margin-bottom: 0.5rem;">Uploaded Files:</h3>';

    // Initialize audio context if needed
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const div = document.createElement('div');
        div.style.cssText = 'padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 4px; margin-bottom: 0.5rem; display: flex; justify-content: space-between;';
        div.innerHTML = `
      <span>${i + 1}. ${file.name}</span>
      <span style="color: var(--text-secondary);">${formatFileSize(file.size)}</span>
    `;
        audioList.appendChild(div);

        // Convert to WAV format for Groq API compatibility
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await state.audioContext.decodeAudioData(arrayBuffer);
            const audioMerger = new AudioMerger(state.audioContext);
            const wavBlob = audioMerger.audioBufferToWav(audioBuffer);
            state.audioBlobs.push(wavBlob);
            console.log(`Converted ${file.name} to WAV format`);
        } catch (error) {
            console.error(`Failed to convert ${file.name}:`, error);
            // Fallback to original blob
            const blob = await file.arrayBuffer().then(ab => new Blob([ab], { type: file.type }));
            state.audioBlobs.push(blob);
        }
    }

    console.log('Loaded', state.audioFiles.length, 'audio files');
    // Show step 2 (with null check)
    const step2Element = document.getElementById('Step2');
    if (step2Element) {
        step2Element.style.display = 'block';
    }
}

async function handleBackgroundFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    state.backgroundUrl = url;

    // Show preview
    if (file.type.startsWith('video')) {
        bgPreview.innerHTML = `
      <video src="${url}" autoplay loop muted style="width: 100%; border-radius: 8px; margin-top: 1rem;"></video>
      <div style="font-size: 0.8rem; color: var(--success); margin-top: 0.5rem;">✅ Video Background Loaded</div>
    `;
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.play();
        renderer.setBackground(video);
    } else {
        bgPreview.innerHTML = `
      <img src="${url}" style="width: 100%; border-radius: 8px; margin-top: 1rem;">
      <div style="font-size: 0.8rem; color: var(--success); margin-top: 0.5rem;">✅ Image Background Loaded</div>
    `;
        const img = new Image();
        img.src = url;
        img.onload = () => renderer.setBackground(img);
    }

    console.log('Background loaded:', file.name);
}

async function handleSync() {
    if (state.audioBlobs.length === 0) {
        alert('Please upload audio files first');
        return;
    }

    const provider = apiProvider.value;
    const apiKey = apiKeyInput.value.trim();

    if (provider !== 'local' && !apiKey) {
        alert('Please enter your API key');
        return;
    }

    // state.apiKey = apiKey; // Removed from state
    // state.language = languageSelect.value; // Removed from state

    syncButton.disabled = true;
    syncProgress.style.display = 'block';

    try {
        // Step 1: Merge audio files properly
        updateSyncProgress(5, 'Merging audio files...');

        if (!state.audioContext) {
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const audioMerger = new AudioMerger(state.audioContext);
        const mergeResult = await audioMerger.mergeAudioFiles(state.audioBlobs, (progress, status) => {
            updateSyncProgress(5 + progress * 0.15, status);
        });

        // Store merged audio buffer
        state.audioBuffer = mergeResult.audioBuffer;
        state.mergedAudioBlob = audioMerger.audioBufferToWav(mergeResult.audioBuffer);

        console.log('Audio merged:', mergeResult.totalDuration, 'seconds');
        console.log('Segments:', mergeResult.segments);

        // Step 2: Transcribe
        updateSyncProgress(25, 'Initializing AI...');

        groqService = new MultiAPIWhisperService();
        groqService.setProvider(provider, apiKey);
        state.segments = [];

        const audioToTranscribe = state.fullAudioBlob || state.mergedAudioBlob;
        const isFullTranscribe = !!state.fullAudioBlob;

        if (isFullTranscribe) {
            updateSyncProgress(30, 'Transcribing Full Audio (Best Accuracy)...');
            const transcription = await groqService.transcribe(audioToTranscribe, languageSelect.value, (progress, status) => {
                updateSyncProgress(30 + (progress * 0.5), status);
            });

            if (transcription.segments && transcription.segments.length > 0) {
                transcription.segments.forEach(seg => {
                    state.segments.push({
                        index: state.segments.length,
                        lyrics: seg.text.trim(),
                        startTime: seg.start,
                        endTime: seg.end,
                        duration: seg.end - seg.start,
                        words: (seg.words || []).map(w => ({ text: w.word || w.text, start: w.start, end: w.end }))
                    });
                });
            } else {
                state.segments.push({
                    index: 0,
                    lyrics: transcription.text.trim(),
                    startTime: 0,
                    endTime: transcription.duration || mergeResult.totalDuration,
                    duration: transcription.duration || mergeResult.totalDuration,
                    words: (transcription.words || []).map(w => ({ text: w.word || w.text, start: w.start, end: w.end }))
                });
            }
        } else {
            for (let i = 0; i < state.audioBlobs.length; i++) {
                const file = state.audioBlobs[i];
                const audioSegment = mergeResult.segments[i];

                updateSyncProgress(25 + (i / state.audioBlobs.length) * 50, `Transcribing ${i + 1}/${state.audioBlobs.length}...`);

                const transcription = await groqService.transcribe(file, languageSelect.value, (progress, status) => {
                    updateSyncProgress(25 + (i / state.audioBlobs.length) * 50 + (progress * 0.5 / state.audioBlobs.length), status);
                });

                if (transcription.segments && transcription.segments.length > 0) {
                    transcription.segments.forEach((seg) => {
                        state.segments.push({
                            index: state.segments.length,
                            lyrics: seg.text.trim(),
                            startTime: seg.start + audioSegment.startTime,
                            endTime: seg.end + audioSegment.startTime,
                            duration: seg.end - seg.start,
                            words: (seg.words || []).map(w => ({ text: w.word || w.text, start: w.start + audioSegment.startTime, end: w.end + audioSegment.startTime }))
                        });
                    });
                } else {
                    state.segments.push({
                        index: state.segments.length,
                        lyrics: transcription.text.trim(),
                        startTime: audioSegment.startTime,
                        endTime: audioSegment.endTime,
                        duration: audioSegment.duration,
                        words: (transcription.words || []).map(w => ({ text: w.word || w.text, start: w.start + audioSegment.startTime, end: w.end + audioSegment.startTime }))
                    });
                }
            }
        }

        // NEW: Handle manual lyrics input with better mapping
        const manualLyrics = lyricsInput.value.trim();
        if (manualLyrics) {
            const manualLines = manualLyrics.split('\n').map(l => l.trim()).filter(l => l);
            if (manualLines.length > 0) {
                console.log('Mapping manual lyrics...');
                if (manualLines.length === state.segments.length) {
                    state.segments.forEach((seg, idx) => { seg.lyrics = manualLines[idx]; });
                } else if (manualLines.length < state.segments.length) {
                    manualLines.forEach((line, idx) => { state.segments[idx].lyrics = line; });
                } else {
                    const durationPerLine = mergeResult.totalDuration / manualLines.length;
                    state.segments = manualLines.map((line, idx) => ({
                        index: idx, lyrics: line,
                        startTime: idx * durationPerLine, endTime: (idx + 1) * durationPerLine,
                        duration: durationPerLine, words: []
                    }));
                }
            }
        }

        // Step 3: Detect music sections
        updateSyncProgress(80, 'Detecting music sections...');

        const musicDetector = new MusicDetector(state.audioBuffer);
        state.segments = await musicDetector.detectMusicSections(state.segments);

        updateSyncProgress(95, 'Finalizing...');

        // Update renderer with segments
        renderer.setSegments(state.segments);

        console.log('Final segments:', state.segments);

        updateSyncProgress(100, 'Sync complete!');

        // Show customization section
        customizationSection.style.display = 'block';
        previewSection.style.display = 'block';

        // Show Timeline Editor and AI Features
        const timelineSection = document.getElementById('timelineSection');
        const aiEnhancementsSection = document.getElementById('aiEnhancementsSection');
        if (timelineSection) timelineSection.style.display = 'block';
        if (aiEnhancementsSection) aiEnhancementsSection.style.display = 'block';

        console.log('✅ Timeline Editor and AI Features now available!');

        // ✅ INITIALIZE TIMELINE EDITOR WITH ACTUAL CONTENT!
        if (typeof window.initializeTimelineEditor === 'function') {
            console.log('🎬 Initializing Timeline Editor with segments...');
            window.initializeTimelineEditor(state.segments);
        } else {
            console.warn('⚠️ Timeline Editor function not found - check if app-enhanced.js is loaded');
        }

        // ✅ INITIALIZE AI FEATURES!
        if (typeof window.runAIAnalysis === 'function') {
            console.log('🤖 Running AI Analysis...');
            window.currentSegments = state.segments;
            setTimeout(() => {
                window.runAIAnalysis();
            }, 500);
        } else {
            console.warn('⚠️ AI Analysis function not found - check if app-enhanced.js is loaded');
        }

        setTimeout(() => {
            syncProgress.style.display = 'none';
            syncButton.disabled = false;
        }, 1500);

    } catch (error) {
        console.error('Sync error:', error);
        alert('Failed to sync: ' + error.message);
        syncProgress.style.display = 'none';
        syncButton.disabled = false;
    }
}

function updateSyncProgress(percent, status) {
    syncPercent.textContent = `${Math.round(percent)}%`;
    syncStatus.textContent = status;
    syncProgressFill.style.width = `${percent}%`;
}

// ✅ FIXED HANDLE PREVIEW WITH ROBUST PLAY/STOP LOGIC
async function handlePreview() {
    if (state.segments.length === 0) {
        alert('Please sync audio first');
        return;
    }

    if (window.customizationManager) {
        renderer.updateSettings(window.customizationManager.getCurrentSettings());
    }

    const audioToUse = state.fullAudioBlob || state.mergedAudioBlob;
    if (!audioToUse) {
        alert('Audio not properly loaded. Please upload audio first.');
        return;
    }

    // Video Control Elements
    const videoSeeker = document.getElementById('videoSeeker');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const totalTimeDisplay = document.getElementById('totalTimeDisplay');
    const previewButton = document.getElementById('previewButton');

    // Define Render Loop (Hoisted)
    const startRenderLoop = () => {
        const loop = () => {
            if (!renderer.isRendering) return;

            if (previewAudio.ended) {
                renderer.isRendering = false;
                previewButton.innerHTML = '<span>▶️</span>';
                return;
            }

            if (!previewAudio.paused) {
                videoSeeker.value = previewAudio.currentTime;
                currentTimeDisplay.textContent = formatTimeMillis(previewAudio.currentTime);
                renderer.drawFrame(previewAudio.currentTime);
                requestAnimationFrame(loop);
            } else {
                // If paused but rendering is true (shouldn't happen often unless buffering)
                // Just draw single frame
                renderer.drawFrame(previewAudio.currentTime);
                requestAnimationFrame(loop);
            }
        };
        loop();
    };

    // --- TOGGLE LOGIC ---

    // 1. If playing, STOP/PAUSE
    if (previewAudio && !previewAudio.paused) {
        previewAudio.pause();
        renderer.isRendering = false;
        previewButton.innerHTML = '<span>▶️</span>';
        return;
    }

    // 2. If existing audio (paused), RESUME
    if (previewAudio && previewAudio.src) {
        previewAudio.play().then(() => {
            renderer.isRendering = true;
            previewButton.innerHTML = '<span>⏸️</span>';
            startRenderLoop();
        });
        return;
    }

    // 3. New Playback (First run)
    const audioUrl = URL.createObjectURL(audioToUse);
    previewAudio = new Audio(audioUrl);

    // Initialize Seeker
    previewAudio.addEventListener('loadedmetadata', () => {
        videoSeeker.max = previewAudio.duration;
        totalTimeDisplay.textContent = formatTimeMillis(previewAudio.duration);
    });

    videoSeeker.value = 0;
    currentTimeDisplay.textContent = "00:00.000";

    // Seeker Input
    videoSeeker.oninput = () => {
        const time = parseFloat(videoSeeker.value);
        if (previewAudio) {
            previewAudio.currentTime = time;
            currentTimeDisplay.textContent = formatTimeMillis(time);
            renderer.drawFrame(time);
        }
    };

    // Play
    previewAudio.play().then(() => {
        renderer.isRendering = true;
        previewButton.innerHTML = '<span>⏸️</span>';
        startRenderLoop();
    });

    // Cleanup on end
    previewAudio.onended = () => {
        renderer.isRendering = false;
        previewButton.innerHTML = '<span>▶️</span>';
    };

    // Cleanup on manual pause
    previewAudio.onpause = () => {
        if (!previewAudio.ended) {
            previewButton.innerHTML = '<span>▶️</span>';
        }
    };
}

async function handleExport() {
    if (state.segments.length === 0) {
        alert('Please sync audio first');
        return;
    }

    // Apply custom settings
    if (window.customizationManager) {
        renderer.updateSettings(window.customizationManager.getCurrentSettings());
    }

    // Use full audio if available
    const audioToUse = state.fullAudioBlob || state.mergedAudioBlob;

    if (!audioToUse) {
        alert('Audio not properly loaded. Please upload audio first.');
        return;
    }

    exportButton.disabled = true;
    exportProgress.style.display = 'block';

    try {
        const result = await videoExporter.exportVideo(renderer, audioToUse, (percent, status) => {
            updateExportProgress(percent, status);
        });

        // Use the built-in download method
        videoExporter.downloadVideo(result);

        updateExportProgress(100, 'Export complete!');
        setTimeout(() => {
            exportProgress.style.display = 'none';
            exportButton.disabled = false;
        }, 3000);

    } catch (error) {
        console.error('Export error:', error);
        alert('Export failed: ' + error.message);
        exportProgress.style.display = 'none';
        exportButton.disabled = false;
    }
}

function updateExportProgress(percent, status) {
    exportPercent.textContent = `${Math.round(percent)}%`;
    exportStatus.textContent = status;
    exportProgressFill.style.width = `${percent}%`;
}

// Utility
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatTimeMillis(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

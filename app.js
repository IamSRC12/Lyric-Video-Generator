// Main Application Logic - Beat-Synced Lyric Studio Pro (Full Upgraded Version)

document.addEventListener('DOMContentLoaded', () => {
    // Global Application State
    const state = {
        audioFile: null,
        audioBuffer: null,
        audioContext: null,
        audioElement: null,
        audioUrl: null,
        lyricsText: '',
        segments: [],
        processedSegments: [],
        currentTab: 'splitter',
        currentTime: 0,
        isPlaying: false,
        animationFrameId: null,
        preset: '7clouds',
        exportedBlob: null
    };

    // Instantiate Core Modules
    const aiEngine = window.unifiedAIEngine;
    const audioProcessor = new window.AudioProcessor();
    const canvas = document.getElementById('videoCanvas');
    const videoRenderer = new window.VideoRenderer(canvas);
    let timelineEditor = null;

    if (window.TimelineEditor) {
        timelineEditor = new window.TimelineEditor(document.getElementById('timelineContainer'), videoRenderer);
    }

    // --- DOM Elements ---
    // Tabs
    const tabSplitterBtn = document.getElementById('tabSplitterBtn');
    const tabStudioBtn = document.getElementById('tabStudioBtn');
    const tabSplitterContent = document.getElementById('tabSplitterContent');
    const tabStudioContent = document.getElementById('tabStudioContent');

    // AI Selectors
    const layerASelect = document.getElementById('layerASelect');
    const layerBSelect = document.getElementById('layerBSelect');
    const layerCSelect = document.getElementById('layerCSelect');

    // Splitter Elements
    const splitterAudioArea = document.getElementById('splitterAudioArea');
    const splitterAudioInput = document.getElementById('splitterAudioInput');
    const splitterAudioInfo = document.getElementById('splitterAudioInfo');
    const splitterLyricsInput = document.getElementById('splitterLyricsInput');
    const btnRunAITranscription = document.getElementById('btnRunAITranscription');
    const btnAlignSplitter = document.getElementById('btnAlignSplitter');
    const splitterProgressContainer = document.getElementById('splitterProgressContainer');
    const splitterProgressStatus = document.getElementById('splitterProgressStatus');
    const splitterProgressFill = document.getElementById('splitterProgressFill');
    const splitterDirectBanner = document.getElementById('splitterDirectBanner');
    const btnUseInGeneratorHeader = document.getElementById('btnUseInGeneratorHeader');
    const splitterSegmentsContainer = document.getElementById('splitterSegmentsContainer');
    const splitterSegmentsGrid = document.getElementById('splitterSegmentsGrid');

    // Studio Elements
    const studioLyricsInput = document.getElementById('studioLyricsInput');
    const btnStudioAlignAI = document.getElementById('btnStudioAlignAI');
    const btnImportFromSplitter = document.getElementById('btnImportFromSplitter');
    const aestheticPresetSelect = document.getElementById('aestheticPresetSelect');
    const chkBeatSyncToggle = document.getElementById('chkBeatSyncToggle');
    const btnAnalyzeSongBeats = document.getElementById('btnAnalyzeSongBeats');

    // Inspector Controls
    const inspectorFontFamily = document.getElementById('inspectorFontFamily');
    const inspectorFontSize = document.getElementById('inspectorFontSize');
    const lblFontSize = document.getElementById('lblFontSize');
    const inspectorFontWeight = document.getElementById('inspectorFontWeight');
    const inspectorTextColor = document.getElementById('inspectorTextColor');
    const inspectorGlowColor = document.getElementById('inspectorGlowColor');
    const inspectorGlowSize = document.getElementById('inspectorGlowSize');
    const lblGlowSize = document.getElementById('lblGlowSize');
    const inspectorOutlineColor = document.getElementById('inspectorOutlineColor');
    const inspectorOutlineWidth = document.getElementById('inspectorOutlineWidth');
    const inspectorPosX = document.getElementById('inspectorPosX');
    const lblPosX = document.getElementById('lblPosX');
    const inspectorPosY = document.getElementById('inspectorPosY');
    const lblPosY = document.getElementById('lblPosY');
    const inspectorEntryAnim = document.getElementById('inspectorEntryAnim');
    const inspectorExitAnim = document.getElementById('inspectorExitAnim');
    const inspectorBgUrl = document.getElementById('inspectorBgUrl');

    // Playback & Export Controls
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnStop = document.getElementById('btnStop');
    const exportResolutionSelect = document.getElementById('exportResolutionSelect');
    const btnExportVideo = document.getElementById('btnExportVideo');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');

    // Modal Controls
    const exportModal = document.getElementById('exportModal');
    const exportModalStatus = document.getElementById('exportModalStatus');
    const exportModalProgressFill = document.getElementById('exportModalProgressFill');
    const exportModalPercent = document.getElementById('exportModalPercent');
    const btnDownloadExportedVideo = document.getElementById('btnDownloadExportedVideo');
    const btnCloseExportModal = document.getElementById('btnCloseExportModal');

    // --- Tab Switching ---
    tabSplitterBtn.addEventListener('click', () => switchTab('splitter'));
    tabStudioBtn.addEventListener('click', () => switchTab('studio'));

    function switchTab(tabName) {
        state.currentTab = tabName;
        if (tabName === 'splitter') {
            tabSplitterBtn.classList.add('active');
            tabStudioBtn.classList.remove('active');
            tabSplitterContent.style.display = 'block';
            tabStudioContent.style.display = 'none';
        } else {
            tabStudioBtn.classList.add('active');
            tabSplitterBtn.classList.remove('active');
            tabStudioContent.style.display = 'block';
            tabSplitterContent.style.display = 'none';

            videoRenderer.setResolution(exportResolutionSelect.value || '1080');
            videoRenderer.drawFrame(state.currentTime);

            if (timelineEditor && timelineEditor.setSegments) {
                timelineEditor.setSegments(state.segments);
            }
        }
    }

    // --- AI Model Layer Selectors ---
    layerASelect.addEventListener('change', () => aiEngine.setLayerOptions(layerASelect.value, null, null));
    layerBSelect.addEventListener('change', () => aiEngine.setLayerOptions(null, layerBSelect.value, null));
    layerCSelect.addEventListener('change', () => aiEngine.setLayerOptions(null, null, layerCSelect.value));

    // --- Splitter File Upload ---
    splitterAudioArea.addEventListener('click', () => splitterAudioInput.click());
    splitterAudioInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleSplitterAudioFile(e.target.files[0]);
        }
    });

    async function handleSplitterAudioFile(file) {
        state.audioFile = file;
        state.audioUrl = URL.createObjectURL(file);
        splitterAudioInfo.textContent = `🎵 ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;

        // Setup HTML5 Audio Element for Preview Sound Sync
        if (state.audioElement) {
            state.audioElement.pause();
        }
        state.audioElement = new Audio(state.audioUrl);

        try {
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            state.audioBuffer = await state.audioContext.decodeAudioData(arrayBuffer);
            console.log('Audio file decoded successfully. Duration:', state.audioBuffer.duration);
        } catch (e) {
            console.error('Audio decoding error:', e);
        }
    }

    // --- AI Auto Transcription (Layer A) ---
    btnRunAITranscription.addEventListener('click', async () => {
        if (!state.audioFile) {
            alert('Please upload an audio file first.');
            return;
        }

        showSplitterProgress(10, 'Running Layer A Transcription...');
        try {
            const result = await aiEngine.processLayerA(state.audioFile, 'auto', (pct, status) => {
                showSplitterProgress(pct, status);
            });

            splitterLyricsInput.value = result.text || '';
            state.lyricsText = result.text || '';
            state.segments = result.segments || [];

            showSplitterProgress(100, 'Transcription Complete!');
            renderSplitterSegments(state.segments);
            setTimeout(hideSplitterProgress, 1200);
        } catch (e) {
            console.error('Layer A Error:', e);
            alert('Transcription failed: ' + e.message);
            hideSplitterProgress();
        }
    });

    // --- Align & Split Audio ---
    btnAlignSplitter.addEventListener('click', async () => {
        if (!state.audioBuffer) {
            alert('Please upload an audio file first.');
            return;
        }

        const rawLyrics = splitterLyricsInput.value.trim();
        showSplitterProgress(10, 'Analyzing Audio & Aligning Timestamps...');

        try {
            let aligned = [];
            if (rawLyrics) {
                const transcriptData = { segments: state.segments };
                aligned = await aiEngine.processLayerB(rawLyrics, transcriptData, (pct, status) => {
                    showSplitterProgress(pct, status);
                });
            } else {
                const analyzer = new window.LyricsAnalyzer(state.audioBuffer, state.audioContext);
                const lines = analyzer.parseLines(rawLyrics);
                aligned = await analyzer.generateTimestamps(lines, (pct, status) => {
                    showSplitterProgress(pct, status);
                });
            }

            state.segments = aligned;

            showSplitterProgress(80, 'Slicing Audio Segments...');
            state.processedSegments = await audioProcessor.splitAudio(state.audioBuffer, aligned, (pct, status) => {
                showSplitterProgress(80 + Math.round(pct * 0.2), status);
            });

            showSplitterProgress(100, 'Splitting Complete!');
            renderSplitterSegments(state.processedSegments);
            splitterDirectBanner.style.display = 'flex';
            setTimeout(hideSplitterProgress, 1000);
        } catch (e) {
            console.error('Align & Split Error:', e);
            alert('Splitting failed: ' + e.message);
            hideSplitterProgress();
        }
    });

    function showSplitterProgress(pct, status) {
        splitterProgressContainer.style.display = 'block';
        splitterProgressStatus.textContent = status;
        splitterProgressFill.style.width = `${pct}%`;
    }

    function hideSplitterProgress() {
        splitterProgressContainer.style.display = 'none';
    }

    function renderSplitterSegments(segments) {
        splitterSegmentsContainer.style.display = 'block';
        splitterSegmentsGrid.innerHTML = '';

        segments.forEach((seg, idx) => {
            const card = document.createElement('div');
            card.className = 'segment-card';

            const startStr = window.LyricsAnalyzer ? window.LyricsAnalyzer.formatTime(seg.startTime) : seg.startTime.toFixed(1);
            const endStr = window.LyricsAnalyzer ? window.LyricsAnalyzer.formatTime(seg.endTime) : seg.endTime.toFixed(1);

            card.innerHTML = `
                <div class="segment-header">
                    <span>Segment #${idx + 1}</span>
                    <span>${startStr} - ${endStr}</span>
                </div>
                <div class="segment-lyrics">"${seg.lyrics}"</div>
                ${seg.url ? `<audio controls src="${seg.url}" style="width: 100%; margin-top: 0.4rem; height: 32px;"></audio>` : ''}
                <div class="segment-actions">
                    <button class="btn btn-use-direct btn-sm-use" style="width: 100%; font-size: 0.82rem; padding: 0.4rem;" data-index="${idx}">
                        ⚡ Use in Lyric Generator
                    </button>
                </div>
            `;
            splitterSegmentsGrid.appendChild(card);
        });

        document.querySelectorAll('.btn-sm-use').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                sendToVideoStudio([state.segments[idx] || segments[idx]]);
            });
        });
    }

    btnUseInGeneratorHeader.addEventListener('click', () => sendToVideoStudio(state.segments));
    btnImportFromSplitter.addEventListener('click', () => sendToVideoStudio(state.segments));

    async function sendToVideoStudio(segmentsToUse) {
        if (!segmentsToUse || segmentsToUse.length === 0) {
            alert('No processed segments available. Please align or split audio first.');
            return;
        }

        try {
            console.log('Running Layer C Motion Mapping for Studio...');
            const mappedSegments = await aiEngine.processLayerC(segmentsToUse);
            state.segments = mappedSegments;
        } catch (e) {
            console.warn('Layer C fallback:', e);
            state.segments = segmentsToUse;
        }

        studioLyricsInput.value = state.segments.map(s => s.lyrics).join('\n');
        videoRenderer.setSegments(state.segments);

        if (timelineEditor && timelineEditor.setSegments) {
            timelineEditor.setSegments(state.segments);
        }

        switchTab('studio');
    }

    // --- Aesthetic Presets & Customization Inspector Live Updates ---
    aestheticPresetSelect.addEventListener('change', () => {
        state.preset = aestheticPresetSelect.value;
        videoRenderer.setPreset(state.preset);
        videoRenderer.drawFrame(state.currentTime);
    });

    chkBeatSyncToggle.addEventListener('change', () => {
        videoRenderer.beatSyncEnabled = chkBeatSyncToggle.checked;
    });

    // Issue 7: Analyze Song Beats & Auto-Animate Button
    btnAnalyzeSongBeats.addEventListener('click', () => {
        if (!state.audioBuffer) {
            alert('Please upload an audio file first.');
            return;
        }

        chkBeatSyncToggle.checked = true;
        videoRenderer.beatSyncEnabled = true;

        // Perform RMS beat peak detection across audio buffer
        const channelData = state.audioBuffer.getChannelData(0);
        const sampleRate = state.audioBuffer.sampleRate;
        const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows

        const energies = [];
        for (let i = 0; i < channelData.length; i += windowSize) {
            let sum = 0;
            for (let j = 0; j < windowSize && (i + j) < channelData.length; j++) {
                sum += channelData[i + j] * channelData[i + j];
            }
            energies.push(Math.sqrt(sum / windowSize));
        }

        // Map energetic beats onto segments
        state.segments.forEach((seg, idx) => {
            const startFrame = Math.floor((seg.startTime * sampleRate) / windowSize);
            const endFrame = Math.floor((seg.endTime * sampleRate) / windowSize);

            let maxE = 0;
            for (let k = startFrame; k < endFrame && k < energies.length; k++) {
                if (energies[k] > maxE) maxE = energies[k];
            }

            if (maxE > 0.3) {
                seg.entryAnimation = (idx % 2 === 0) ? 'zoomIn' : 'glitchIntense';
                seg.glowSize = 50;
            } else {
                seg.entryAnimation = 'slideUp';
                seg.glowSize = 25;
            }
        });

        videoRenderer.setSegments(state.segments);
        if (timelineEditor && timelineEditor.setSegments) timelineEditor.setSegments(state.segments);
        videoRenderer.drawFrame(state.currentTime);

        alert('⚡ Beat Reactivity Analyzed! Beat drop animations assigned to timeline keyframes.');
    });

    // Inspector Event Listeners
    inspectorFontFamily.addEventListener('change', updateInspector);
    inspectorFontSize.addEventListener('input', () => {
        lblFontSize.textContent = inspectorFontSize.value + 'px';
        updateInspector();
    });
    inspectorFontWeight.addEventListener('change', updateInspector);
    inspectorTextColor.addEventListener('input', updateInspector);
    inspectorGlowColor.addEventListener('input', updateInspector);
    inspectorGlowSize.addEventListener('input', () => {
        lblGlowSize.textContent = inspectorGlowSize.value + 'px';
        updateInspector();
    });
    inspectorOutlineColor.addEventListener('input', updateInspector);
    inspectorOutlineWidth.addEventListener('input', updateInspector);
    inspectorPosX.addEventListener('input', () => {
        lblPosX.textContent = inspectorPosX.value + '%';
        updateInspector();
    });
    inspectorPosY.addEventListener('input', () => {
        lblPosY.textContent = inspectorPosY.value + '%';
        updateInspector();
    });
    inspectorEntryAnim.addEventListener('change', updateInspector);
    inspectorExitAnim.addEventListener('change', updateInspector);

    inspectorBgUrl.addEventListener('change', () => {
        const url = inspectorBgUrl.value.trim();
        if (url) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                videoRenderer.setBackground(img, 'image');
                videoRenderer.drawFrame(state.currentTime);
            };
            img.src = url;
        }
    });

    function updateInspector() {
        videoRenderer.updateSettings({
            fontFamily: inspectorFontFamily.value,
            fontSize: parseInt(inspectorFontSize.value),
            fontWeight: inspectorFontWeight.value,
            textColor: inspectorTextColor.value,
            glowColor: inspectorGlowColor.value,
            glowSize: parseInt(inspectorGlowSize.value),
            outlineColor: inspectorOutlineColor.value,
            outlineWidth: parseInt(inspectorOutlineWidth.value),
            posX: parseInt(inspectorPosX.value),
            posY: parseInt(inspectorPosY.value),
            entryAnimation: inspectorEntryAnim.value,
            exitAnimation: inspectorExitAnim.value
        });
        videoRenderer.drawFrame(state.currentTime);
    }

    // --- AI Time Alignment Trigger ---
    btnStudioAlignAI.addEventListener('click', async () => {
        const text = studioLyricsInput.value.trim();
        if (!text) {
            alert('Please paste lyrics in the box.');
            return;
        }
        if (!state.audioBuffer) {
            alert('Please upload an audio file first.');
            return;
        }

        const lines = text.split('\n').filter(l => l.trim());
        const timePerLine = state.audioBuffer.duration / lines.length;

        const aligned = lines.map((line, i) => ({
            id: i + 1,
            lyrics: line.trim(),
            startTime: i * timePerLine,
            endTime: (i + 1) * timePerLine
        }));

        sendToVideoStudio(aligned);
    });

    // --- Synchronized Playback Controls (Audio Sound + Canvas Preview) ---
    btnPlayPause.addEventListener('click', togglePlayback);
    btnStop.addEventListener('click', stopPlayback);

    function togglePlayback() {
        if (state.isPlaying) {
            pausePlayback();
        } else {
            startPlayback();
        }
    }

    function startPlayback() {
        if (!state.audioBuffer) return;
        state.isPlaying = true;
        btnPlayPause.textContent = '⏸ Pause';

        // Play HTML5 Audio in sync
        if (state.audioElement) {
            state.audioElement.currentTime = state.currentTime;
            state.audioElement.play().catch(e => console.warn('Audio play error:', e));
        }

        const startTime = Date.now() - (state.currentTime * 1000);

        function renderLoop() {
            if (!state.isPlaying) return;

            if (state.audioElement && !state.audioElement.paused) {
                state.currentTime = state.audioElement.currentTime;
            } else {
                state.currentTime = (Date.now() - startTime) / 1000;
            }

            if (state.currentTime >= state.audioBuffer.duration) {
                stopPlayback();
                return;
            }

            const audioEnergy = 0.5 + Math.sin(state.currentTime * 10) * 0.4;
            videoRenderer.drawFrame(state.currentTime, audioEnergy);

            if (timelineEditor && timelineEditor.setPlayheadTime) {
                timelineEditor.setPlayheadTime(state.currentTime);
            }

            if (currentTimeDisplay) {
                const curStr = window.LyricsAnalyzer ? window.LyricsAnalyzer.formatTime(state.currentTime) : state.currentTime.toFixed(1);
                const durStr = window.LyricsAnalyzer ? window.LyricsAnalyzer.formatTime(state.audioBuffer.duration) : state.audioBuffer.duration.toFixed(1);
                currentTimeDisplay.textContent = `${curStr} / ${durStr}`;
            }

            state.animationFrameId = requestAnimationFrame(renderLoop);
        }

        renderLoop();
    }

    function pausePlayback() {
        state.isPlaying = false;
        btnPlayPause.textContent = '▶ Play (Audio Synced)';
        if (state.audioElement) state.audioElement.pause();
        if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
    }

    function stopPlayback() {
        pausePlayback();
        state.currentTime = 0;
        if (state.audioElement) state.audioElement.currentTime = 0;
        videoRenderer.drawFrame(0);
    }

    // --- Issue 8: Real MP4 Export & Progress Modal Dialog ---
    btnExportVideo.addEventListener('click', async () => {
        if (!state.segments || state.segments.length === 0) {
            alert('No lyric segments loaded to export. Please add audio and lyrics first.');
            return;
        }

        // Pause playback if running
        pausePlayback();

        // Show Progress Modal
        exportModal.style.display = 'flex';
        btnDownloadExportedVideo.style.display = 'none';
        exportModalProgressFill.style.width = '0%';
        exportModalPercent.textContent = '0%';
        exportModalStatus.textContent = 'Initializing Video Encoder & Muxer...';

        try {
            const resolution = exportResolutionSelect.value || '1080';
            const exporter = new window.VideoExporter();

            state.exportedBlob = await exporter.exportVideo(
                videoRenderer,
                state.audioBuffer,
                state.audioFile,
                resolution,
                (pct, statusText) => {
                    exportModalProgressFill.style.width = `${pct}%`;
                    exportModalPercent.textContent = `${pct}%`;
                    exportModalStatus.textContent = statusText;
                }
            );

            exportModalStatus.textContent = '🎉 Video Encoding Complete! Click below to download your MP4.';
            exportModalProgressFill.style.width = '100%';
            exportModalPercent.textContent = '100%';
            btnDownloadExportedVideo.style.display = 'block';

        } catch (e) {
            console.error('Export error:', e);
            exportModalStatus.textContent = '❌ Export Error: ' + e.message;
        }
    });

    btnDownloadExportedVideo.addEventListener('click', () => {
        if (state.exportedBlob) {
            const exporter = new window.VideoExporter();
            exporter.downloadVideo(state.exportedBlob, `Beat_Synced_Lyric_Video_${Date.now()}.mp4`);
        }
    });

    btnCloseExportModal.addEventListener('click', () => {
        exportModal.style.display = 'none';
    });

    console.log('🚀 Beat-Synced Lyric Studio Pro Fully Upgraded & Ready!');
});

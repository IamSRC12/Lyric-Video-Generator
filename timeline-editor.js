// Professional Timeline Editor with Text Editing
class TimelineEditor {
    constructor(container, renderer) {
        this.container = container;
        this.renderer = renderer;
        this.segments = [];
        this.selectedSegment = null;
        this.zoom = 1;
        this.scrollOffset = 0;
        this.isDragging = false;
        this.dragType = null; // 'move', 'resize-start', 'resize-end'
        this.playheadPosition = 0;
        this.isPlaying = false;

        this.init();
    }

    init() {
        this.createTimelineUI();
        this.setupEventListeners();
    }

    createTimelineUI() {
        this.container.innerHTML = `
            <div class="timeline-editor">
                <div class="timeline-toolbar">
                    <button id="timeline-play" class="timeline-btn">
                        <span>▶️</span> Play
                    </button>
                    <button id="timeline-pause" class="timeline-btn">
                        <span>⏸️</span> Pause
                    </button>
                    <button id="timeline-stop" class="timeline-btn">
                        <span>⏹️</span> Stop
                    </button>
                    <div class="timeline-divider"></div>
                    <button id="timeline-zoom-in" class="timeline-btn">🔍+</button>
                    <button id="timeline-zoom-out" class="timeline-btn">🔍-</button>
                    <button id="timeline-fit" class="timeline-btn">📏 Fit</button>
                    <div class="timeline-divider"></div>
                    <button id="timeline-add-segment" class="timeline-btn">➕ Add Text</button>
                    <button id="timeline-add-music" class="timeline-btn" style="border-color: #00fa9a; background: rgba(0, 250, 154, 0.1);">🎵 Add Music</button>
                    <button id="timeline-extend" class="timeline-btn" title="Extend to next segment">➡️ Extend</button>
                    <button id="timeline-split" class="timeline-btn">✂️ Split</button>
                    <button id="timeline-delete" class="timeline-btn">🗑️ Delete</button>
                    <button id="timeline-remove-gaps" class="timeline-btn" title="Remove all blank spaces">🧲 No Gaps</button>
                    <div class="timeline-divider"></div>
                    <button id="timeline-ai-sync" class="timeline-btn">🤖 AI Re-Sync</button>
                </div>

                <div class="timeline-ruler" id="timeline-ruler"></div>
                
                <div class="timeline-tracks-container">
                    <div class="timeline-track-labels">
                        <div class="timeline-track-label">Lyrics</div>
                        <div class="timeline-track-label">App/Music</div>
                    </div>
                    <div class="timeline-tracks" id="timeline-tracks" style="overflow: hidden; position: relative;">
                        <canvas id="timeline-canvas"></canvas>
                        <div id="timeline-playhead" class="timeline-playhead"></div>
                    </div>
                </div>
                
                <!-- Horizontal Scroll Slider -->
                <div class="timeline-scroll-container" style="margin-top: 5px; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 4px;">
                    <input type="range" id="timeline-slider" min="0" value="0" step="1" style="width: 100%; cursor: pointer;">
                </div>

                <div class="timeline-properties" id="timeline-properties">
                    <h3>Segment Properties</h3>
                    <div id="timeline-properties-content">
                        <p style="color: var(--text-secondary);">Select a segment to edit</p>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const canvas = document.getElementById('timeline-canvas');
        const playBtn = document.getElementById('timeline-play');
        const pauseBtn = document.getElementById('timeline-pause');
        const stopBtn = document.getElementById('timeline-stop');
        const zoomInBtn = document.getElementById('timeline-zoom-in');
        const zoomOutBtn = document.getElementById('timeline-zoom-out');
        const fitBtn = document.getElementById('timeline-fit');
        const addBtn = document.getElementById('timeline-add-segment');
        const addMusicBtn = document.getElementById('timeline-add-music');
        const extendBtn = document.getElementById('timeline-extend');
        const splitBtn = document.getElementById('timeline-split');
        const deleteBtn = document.getElementById('timeline-delete');
        const removeGapsBtn = document.getElementById('timeline-remove-gaps');
        const aiSyncBtn = document.getElementById('timeline-ai-sync');
        const slider = document.getElementById('timeline-slider');

        // Playback controls
        playBtn.addEventListener('click', () => this.play());
        pauseBtn.addEventListener('click', () => this.pause());
        stopBtn.addEventListener('click', () => this.stop());

        // Zoom controls
        zoomInBtn.addEventListener('click', () => this.setZoom(this.zoom * 1.5));
        zoomOutBtn.addEventListener('click', () => this.setZoom(this.zoom / 1.5));
        fitBtn.addEventListener('click', () => this.fitToView());

        // Edit controls
        addBtn.addEventListener('click', () => this.addSegment());
        if (addMusicBtn) addMusicBtn.addEventListener('click', () => this.addMusicSegment());
        if (extendBtn) extendBtn.addEventListener('click', () => this.extendSegment());
        splitBtn.addEventListener('click', () => this.splitSegment());
        deleteBtn.addEventListener('click', () => this.deleteSegment());
        if (removeGapsBtn) removeGapsBtn.addEventListener('click', () => this.removeGaps());
        aiSyncBtn.addEventListener('click', () => this.aiReSync());

        // Slider control
        if (slider) {
            slider.addEventListener('input', (e) => {
                this.scrollOffset = parseFloat(e.target.value);
                this.render();
            });
        }

        // Canvas interactions
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
    }

    loadSegments(segments) {
        this.segments = segments.map((seg, idx) => ({
            ...seg,
            id: idx,
            track: 0
        }));
        this.render();
    }

    render() {
        const canvas = document.getElementById('timeline-canvas');
        const container = document.getElementById('timeline-tracks');

        canvas.width = container.clientWidth;
        canvas.height = 100;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw time grid
        this.drawTimeGrid(ctx, canvas.width, canvas.height);

        // Draw segments
        this.segments.forEach(segment => {
            this.drawSegment(ctx, segment, canvas.height);
        });

        // Update ruler
        this.updateRuler();

        // Update Slider
        const slider = document.getElementById('timeline-slider');
        if (slider) {
            const pixelsPerSecond = 100 * this.zoom;
            const totalWidth = this.getTotalDuration() * pixelsPerSecond;
            const visibleWidth = canvas.width;
            const maxScroll = Math.max(0, totalWidth - visibleWidth);

            slider.max = maxScroll;
            slider.value = this.scrollOffset;

            // Adjust scrollOffset if out of bounds (e.g. after zoom out)
            if (this.scrollOffset > maxScroll) {
                this.scrollOffset = maxScroll;
            }
        }

        // ✅ SYNC GLOBAL STATE FOR VIDEO RENDERER - ALWAYS!
        // Map segments back to format the renderer expects
        const updatedSegments = this.segments.map(s => ({
            text: s.lyrics,
            lyrics: s.lyrics,
            startTime: s.startTime,
            endTime: s.endTime,
            duration: s.endTime - s.startTime,
            aiEffects: s.aiEffects || {},
            type: s.type || 'text' // Preserve type
        }));

        // Update ALL global references
        window.currentSegments = updatedSegments;

        if (window.state) {
            window.state.segments = updatedSegments;
            console.log('✅ Updated state.segments with', updatedSegments.length, 'segments');
        }

        // Force preview update
        if (typeof window.updateLivePreview === 'function') {
            window.updateLivePreview();
        } else {
            console.warn('⚠️ window.updateLivePreview not found');
        }
    }

    drawTimeGrid(ctx, width, height) {
        const pixelsPerSecond = 100 * this.zoom;
        const totalDuration = this.getTotalDuration();

        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;

        for (let t = 0; t <= totalDuration; t++) {
            const x = (t * pixelsPerSecond) - this.scrollOffset;
            if (x >= 0 && x <= width) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }
    }

    drawSegment(ctx, segment, canvasHeight) {
        const pixelsPerSecond = 100 * this.zoom;
        const x = (segment.startTime * pixelsPerSecond) - this.scrollOffset;
        const width = (segment.endTime - segment.startTime) * pixelsPerSecond;
        const y = segment.track * 50 + 10;
        const height = 40;

        // Segment background
        const isSelected = this.selectedSegment === segment;
        const isMusic = segment.type === 'music';

        if (isMusic) {
            ctx.fillStyle = isSelected ?
                'rgba(0, 250, 154, 0.4)' : // Medium Spring Green
                'rgba(0, 250, 154, 0.2)';
        } else {
            ctx.fillStyle = isSelected ?
                'rgba(255, 215, 0, 0.3)' :
                'rgba(100, 150, 255, 0.3)';
        }
        ctx.fillRect(x, y, width, height);

        // Segment border
        if (isMusic) {
            ctx.strokeStyle = isSelected ? '#FFFFFF' : '#00FA9A';
        } else {
            ctx.strokeStyle = isSelected ? '#FFD700' : '#6496FF';
        }
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Segment text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const text = segment.lyrics || 'Empty';
        const maxWidth = width - 10;
        const truncated = this.truncateText(ctx, text, maxWidth);
        ctx.fillText(truncated, x + 5, y + height / 2);

        // Resize handles
        if (isSelected) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x - 3, y, 6, height); // Left handle
            ctx.fillRect(x + width - 3, y, 6, height); // Right handle
        }
    }

    truncateText(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) return text;

        let truncated = text;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        return truncated + '...';
    }

    updateRuler() {
        const ruler = document.getElementById('timeline-ruler');
        const pixelsPerSecond = 100 * this.zoom;
        const totalDuration = this.getTotalDuration();

        ruler.innerHTML = '';

        for (let t = 0; t <= totalDuration; t++) {
            const x = (t * pixelsPerSecond) - this.scrollOffset;
            const marker = document.createElement('div');
            marker.className = 'timeline-ruler-marker';
            marker.style.left = x + 'px';
            marker.textContent = this.formatTime(t);
            ruler.appendChild(marker);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
    }

    getTotalDuration() {
        if (this.segments.length === 0) return 10;
        return Math.max(...this.segments.map(s => s.endTime)) + 2;
    }

    onMouseDown(e) {
        const canvas = document.getElementById('timeline-canvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedSegment = this.getSegmentAtPosition(x, y);

        if (clickedSegment) {
            this.selectedSegment = clickedSegment;

            // Check if clicking on resize handles
            const pixelsPerSecond = 100 * this.zoom;
            const segX = (clickedSegment.startTime * pixelsPerSecond) - this.scrollOffset;
            const segWidth = (clickedSegment.endTime - clickedSegment.startTime) * pixelsPerSecond;

            if (Math.abs(x - segX) < 6) {
                this.dragType = 'resize-start';
            } else if (Math.abs(x - (segX + segWidth)) < 6) {
                this.dragType = 'resize-end';
            } else {
                this.dragType = 'move';
            }

            this.isDragging = true;
            this.dragStartX = x;
            this.showProperties(clickedSegment);
        } else {
            this.selectedSegment = null;
            this.hideProperties();
        }

        this.render();
    }

    onMouseMove(e) {
        if (!this.isDragging || !this.selectedSegment) return;

        const canvas = document.getElementById('timeline-canvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;

        const pixelsPerSecond = 100 * this.zoom;
        const deltaTime = (x - this.dragStartX) / pixelsPerSecond;

        // Store original values in case we need to revert
        const originalStart = this.selectedSegment.startTime;
        const originalEnd = this.selectedSegment.endTime;

        if (this.dragType === 'move') {
            this.selectedSegment.startTime += deltaTime;
            this.selectedSegment.endTime += deltaTime;
            // For move, we just check overlaps broadly or push
            this.resolveOverlaps(this.selectedSegment);
        } else if (this.dragType === 'resize-start') {
            this.selectedSegment.startTime += deltaTime;
            if (this.selectedSegment.startTime >= this.selectedSegment.endTime) {
                this.selectedSegment.startTime = this.selectedSegment.endTime - 0.1;
            }
            this.resolveOverlaps(this.selectedSegment);
        } else if (this.dragType === 'resize-end') {
            this.selectedSegment.endTime += deltaTime; // Apply delta
            if (this.selectedSegment.endTime <= this.selectedSegment.startTime) {
                this.selectedSegment.endTime = this.selectedSegment.startTime + 0.1;
            }

            // ✅ TRUE RIPPLE: Move all subsequent segments by same delta
            const idx = this.segments.indexOf(this.selectedSegment);
            if (idx > -1) {
                this.rippleTime(idx + 1, deltaTime);
            }
        }

        this.dragStartX = x;
        this.render();
        this.updateProperties();
    }

    onMouseUp(e) {
        this.isDragging = false;
        this.dragType = null;
    }

    onDoubleClick(e) {
        const canvas = document.getElementById('timeline-canvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedSegment = this.getSegmentAtPosition(x, y);

        if (clickedSegment) {
            this.editSegmentText(clickedSegment);
        }
    }

    getSegmentAtPosition(x, y) {
        const pixelsPerSecond = 100 * this.zoom;

        for (let segment of this.segments) {
            const segX = (segment.startTime * pixelsPerSecond) - this.scrollOffset;
            const segWidth = (segment.endTime - segment.startTime) * pixelsPerSecond;
            const segY = segment.track * 50 + 10;
            const segHeight = 40;

            if (x >= segX && x <= segX + segWidth && y >= segY && y <= segY + segHeight) {
                return segment;
            }
        }

        return null;
    }

    editSegmentText(segment) {
        const newText = prompt('Edit lyrics:', segment.lyrics);
        if (newText !== null) {
            segment.lyrics = newText;
            this.render();
            this.updateProperties();
        }
    }

    showProperties(segment) {
        const content = document.getElementById('timeline-properties-content');
        const duration = (segment.endTime - segment.startTime).toFixed(2);
        content.innerHTML = `
            <div class="property-group">
                <label>Text:</label>
                <textarea id="prop-text" rows="3">${segment.lyrics || ''}</textarea>
            </div>
            <div class="property-group">
                <label>Start Time:</label>
                <input type="number" id="prop-start" value="${segment.startTime.toFixed(2)}" step="0.01">
            </div>
            <div class="property-group">
                <label>End Time:</label>
                <input type="number" id="prop-end" value="${segment.endTime.toFixed(2)}" step="0.01">
            </div>
            <div class="property-group">
                <label>Duration:</label>
                <input type="number" id="prop-duration" value="${duration}" step="0.01">
            </div>
            <button id="prop-apply" class="timeline-btn" style="width: 100%; margin-top: 10px;">
                ✅ Apply Changes
            </button>
        `;

        // Add live duration calculation
        const startInput = document.getElementById('prop-start');
        const endInput = document.getElementById('prop-end');
        const durationInput = document.getElementById('prop-duration');

        // Helper function for instant updates (with Ripple)
        const applyImmediate = () => {
            const newStart = parseFloat(startInput.value);
            const newEnd = parseFloat(endInput.value);

            if (isNaN(newStart) || isNaN(newEnd)) return;
            if (newEnd <= newStart) return;

            const oldDuration = segment.endTime - segment.startTime;
            const newDuration = newEnd - newStart;
            const durationDelta = newDuration - oldDuration;

            // Update current segment
            segment.lyrics = document.getElementById('prop-text').value;
            segment.startTime = newStart;
            segment.endTime = newEnd;

            try {
                // ✅ RIPPLE UPDATE: Shift all subsequent segments
                // Find current index
                this.segments.sort((a, b) => a.startTime - b.startTime);
                const currentIndex = this.segments.indexOf(segment);

                if (currentIndex > -1 && Math.abs(durationDelta) > 0.001) {
                    // Only ripple if duration changed (or explicitly requested for moves, but user asked for duration)
                    this.rippleTime(currentIndex + 1, durationDelta);
                }

                this.render();

                // Update inputs
                if (Math.abs(durationDelta) > 0.001) {
                    durationInput.value = (newEnd - newStart).toFixed(2);
                }
            } catch (error) {
                console.error('❌ Error updating segment:', error);
            }
        };

        const updateDuration = () => {
            const start = parseFloat(startInput.value);
            const end = parseFloat(endInput.value);
            if (!isNaN(start) && !isNaN(end)) {
                durationInput.value = (end - start).toFixed(2);
                applyImmediate(); // ✅ Apply instantly!
            }
        };

        const updateEndFromDuration = () => {
            const start = parseFloat(startInput.value);
            const dur = parseFloat(durationInput.value);
            if (!isNaN(start) && !isNaN(dur)) {
                endInput.value = (start + dur).toFixed(2);
                applyImmediate(); // ✅ Apply instantly!
            }
        };

        // Use 'input' for INSTANT preview as requested
        startInput.addEventListener('input', updateDuration);
        endInput.addEventListener('input', updateDuration);
        durationInput.addEventListener('input', updateEndFromDuration);

        // Text changes also apply instantly
        document.getElementById('prop-text').addEventListener('input', () => {
            segment.lyrics = document.getElementById('prop-text').value;
            this.render();
        });

        // Keep button just in case, but it's redundant now
        document.getElementById('prop-apply').addEventListener('click', () => {
            applyImmediate();
            // Show success message only on manual click
            if (typeof window.showNotification === 'function') {
                window.showNotification('✅ Changes applied successfully!', 'success');
            }
        });
    }

    updateProperties() {
        if (this.selectedSegment) {
            this.showProperties(this.selectedSegment);
        }
    }

    hideProperties() {
        const content = document.getElementById('timeline-properties-content');
        content.innerHTML = '<p style="color: var(--text-secondary);">Select a segment to edit</p>';
    }

    setZoom(newZoom) {
        this.zoom = Math.max(0.1, Math.min(10, newZoom));
        this.render();
    }

    fitToView() {
        const canvas = document.getElementById('timeline-canvas');
        const totalDuration = this.getTotalDuration();
        this.zoom = (canvas.width - 100) / (totalDuration * 100);
        this.scrollOffset = 0;
        this.render();
    }

    addSegment() {
        let startTime = this.playheadPosition;
        const defaultDuration = 3.0;

        // Check if we have a selection to insert BEFORE
        if (this.selectedSegment) {
            // Sort to ensure valid indices for ripple
            this.segments.sort((a, b) => a.startTime - b.startTime);

            const insertIndex = this.segments.indexOf(this.selectedSegment);
            if (insertIndex !== -1) {
                // Use selected segment's start time for the new segment
                startTime = this.selectedSegment.startTime;

                // Shift the selected segment and EVERYTHING after it by the duration of the new segment
                // This creates a "hole" for our new segment
                this.rippleTime(insertIndex, defaultDuration);
            }
        }

        const newSegment = {
            id: 'seg_' + Date.now(),
            startTime: startTime,
            endTime: startTime + defaultDuration,
            lyrics: 'New text segment',
            track: 0,
            type: 'text'
        };

        this.segments.push(newSegment);

        // Sort again to ensure order
        this.segments.sort((a, b) => a.startTime - b.startTime);

        this.selectedSegment = newSegment;
        this.render();
        this.showProperties(newSegment);

        if (typeof window.showNotification === 'function') {
            window.showNotification('➕ Segment inserted!', 'success');
        }
    }

    addMusicSegment() {
        // Find a free spot or use playhead
        const startTime = this.playheadPosition;
        const endTime = startTime + 5; // Default 5s for music

        const newSegment = {
            id: 'music_' + Date.now(),
            startTime: startTime,
            endTime: endTime,
            lyrics: '[INSTRUMENTAL]',
            track: 1, // Put on second track or logic
            type: 'music'
        };
        // Ensure track is correct (visual only) - line 192 uses segment.track
        // Let's put music on track 1 (Effects) if we want visual separation
        newSegment.track = 1;

        this.segments.push(newSegment);
        this.selectedSegment = newSegment;
        this.render();
        this.showProperties(newSegment);

        if (typeof window.showNotification === 'function') {
            window.showNotification('🎵 Music/Instrumental block added. AI will respect this area.', 'success');
        }
    }

    extendSegment() {
        if (!this.selectedSegment) {
            alert('Please select a segment to extend');
            return;
        }

        // Sort to ensure we find the correct next segment
        this.segments.sort((a, b) => a.startTime - b.startTime);

        const currentIndex = this.segments.indexOf(this.selectedSegment);

        // Check if there is a next segment
        if (currentIndex < this.segments.length - 1) {
            const nextSegment = this.segments[currentIndex + 1];

            // Check if next segment is actually after (sanity check)
            if (nextSegment.startTime > this.selectedSegment.startTime) {
                // Extend current segment end to next segment start
                const oldEnd = this.selectedSegment.endTime;
                this.selectedSegment.endTime = nextSegment.startTime;

                const diff = this.selectedSegment.endTime - oldEnd;

                this.render();
                this.showProperties(this.selectedSegment);

                if (typeof window.showNotification === 'function') {
                    window.showNotification(`➡️ Extended by ${diff.toFixed(2)}s to meet next segment`, 'success');
                }
            } else {
                alert('Next segment overlaps or starts before this one.');
            }
        } else {
            alert('This is the last segment. Nothing to extend to.');
        }
    }

    splitSegment() {
        if (!this.selectedSegment) {
            alert('Please select a segment to split');
            return;
        }

        const midTime = (this.selectedSegment.startTime + this.selectedSegment.endTime) / 2;
        const newSegment = {
            ...this.selectedSegment,
            id: this.segments.length,
            startTime: midTime,
            endTime: this.selectedSegment.endTime
        };

        this.selectedSegment.endTime = midTime;
        this.segments.push(newSegment);
        this.render();
    }

    deleteSegment() {
        if (!this.selectedSegment) {
            alert('Please select a segment to delete');
            return;
        }

        const index = this.segments.indexOf(this.selectedSegment);
        if (index > -1) {
            this.segments.splice(index, 1);
            this.selectedSegment = null;
            this.hideProperties();
            this.render();
        }
    }

    async aiReSync() {
        if (typeof window.runAIAnalysis === 'function') {
            console.log('🤖 Triggering AI Re-Sync (Force Align)...');
            if (typeof window.showNotification === 'function') {
                window.showNotification('🤖 Aligning text to audio... Please wait', 'info');
            }
            await window.runAIAnalysis('force-sync');
        } else {
            alert('AI Analysis function not found');
        }
    }

    play() {
        this.isPlaying = true;
        // Integrate with audio playback
    }

    pause() {
        this.isPlaying = false;
    }

    stop() {
        this.isPlaying = false;
        this.playheadPosition = 0;
    }

    getSegments() {
        return this.segments;
    }

    // ✅ NEW: Auto-adjust segments to prevent overlaps
    // ✅ NEW: Auto-adjust segments with CASCADING PUSH
    // ✅ TRUE RIPPLE EDITING: Shift all segments from startIndex by delta
    rippleTime(startIndex, delta) {
        if (startIndex >= this.segments.length) return;

        // Ensure segments are sorted (should be, but safety first)
        // this.segments.sort((a, b) => a.startTime - b.startTime); // Can skip if performance issue

        for (let i = startIndex; i < this.segments.length; i++) {
            this.segments[i].startTime += delta;
            this.segments[i].endTime += delta;
        }
    }

    // Cleanup overlaps if needed (mostly for move operations)
    resolveOverlaps(movedSegment) {
        // Sort
        this.segments.sort((a, b) => a.startTime - b.startTime);

        // Ensure no negative times
        this.segments.forEach(s => {
            if (s.startTime < 0) {
                const dur = s.endTime - s.startTime;
                s.startTime = 0;
                s.endTime = dur;
            }
        });

        // Basic collision push (only if absolutely needed to prevent overlap confusion)
        // But for Ripple Editing, we trust the ripple.
    }

    // ✅ Gap Removal Feature
    removeGaps() {
        if (this.segments.length === 0) return;

        // Sort segments by time
        this.segments.sort((a, b) => a.startTime - b.startTime);

        // Start from 0
        let currentTime = 0;

        this.segments.forEach(segment => {
            const duration = segment.endTime - segment.startTime;
            segment.startTime = currentTime;
            segment.endTime = currentTime + duration;
            currentTime = segment.endTime;
        });

        this.render();

        if (typeof window.showNotification === 'function') {
            window.showNotification('🧲 All gaps removed!', 'success');
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimelineEditor;
}

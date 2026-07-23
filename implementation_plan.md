# Implementation Plan - Fix Video Preview Sync

## Goal
Ensure revisions made in the Timeline Editor are immediately reflected in the Video Preview and Export. Currently, the update logic in `timeline-editor.js` attempts to call `window.updateLivePreview`, but this function does not exist in `app.js`.

## Proposed Changes

### 1. `app.js`
- **Expose Renderer**: make `renderer` accessible globally via `window.renderer`.
- **Implement `window.updateLivePreview`**:
  - Update `renderer.setSegments(state.segments)` to ensure it has the latest data.
  - If preview is active, force a redraw frame.

## Verification Plan

### Manual Verification
1. Hard refresh the application.
2. Load audio and perform sync.
3. Open Timeline Editor and modify a segment (e.g., extend duration to cause overlap push).
4. Observe the Timeline visual updating.
5. Scroll to Video Preview and play.
6. **Verify**: The text in the video matches the new timeline timing (no overlaps if they were resolved).

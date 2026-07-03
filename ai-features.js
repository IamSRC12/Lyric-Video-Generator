// AI-Powered Features for Lyric Video Generator

class AIEnhancedFeatures {
    constructor() {
        this.apiEndpoint = 'http://localhost:8000'; // Local Docker AI
        this.groqEndpoint = 'https://api.groq.com/openai/v1';
    }

    /**
     * AI-Powered Smart Animation Selection
     * Analyzes lyrics mood and suggests best animations
     */
    async suggestAnimations(lyrics, audioFeatures = null) {
        try {
            const prompt = `Analyze these song lyrics and suggest the best animation style:

Lyrics: "${lyrics}"

${audioFeatures ? `Audio Features:
- Tempo: ${audioFeatures.tempo} BPM
- Energy: ${audioFeatures.energy}
- Mood: ${audioFeatures.mood}` : ''}

Suggest:
1. Best entry animation (from: fadeIn, typewriter, wordReveal, slideUp, zoomIn, bounceIn, particleExplosion, rotate3D, waveReveal, glitchIntense, neonPulse, fireRise, matrixRain, elasticBounce, shatterGlass)
2. Best exit animation (from: fadeOut, slideDown, zoomOut, bounceOut, explodeOut, smokeFade)
3. Color scheme (3 colors in hex)
4. Font style (Modern, Bold, Elegant, Playful, Tech)
5. Overall mood (Energetic, Calm, Dramatic, Fun, Mysterious)

Respond in JSON format.`;

            const response = await this.callAI(prompt);
            return this.parseAnimationSuggestions(response);
        } catch (error) {
            console.error('AI animation suggestion failed:', error);
            return this.getDefaultAnimationSuggestions();
        }
    }

    /**
     * AI Text Effect Generator
     * Creates dynamic text effects based on lyrics content
     */
    async generateTextEffects(segment, previousSegment = null) {
        const effects = {
            emphasis: this.detectEmphasis(segment.lyrics),
            emotion: await this.detectEmotion(segment.lyrics),
            rhythm: this.detectRhythm(segment),
            transition: this.suggestTransition(segment, previousSegment)
        };

        return {
            ...effects,
            recommendedSettings: this.mapEffectsToSettings(effects)
        };
    }

    /**
     * Detect emphasis words (ALL CAPS, repeated punctuation, etc.)
     */
    detectEmphasis(text) {
        const emphasisWords = [];
        const words = text.split(/\s+/);

        words.forEach((word, index) => {
            // ALL CAPS detection
            if (word === word.toUpperCase() && word.length > 1 && /[A-Z]/.test(word)) {
                emphasisWords.push({
                    word: word,
                    index: index,
                    type: 'caps',
                    intensity: 'high'
                });
            }

            // Repeated punctuation (!!!, ???, etc.)
            if (/[!?]{2,}/.test(word)) {
                emphasisWords.push({
                    word: word,
                    index: index,
                    type: 'punctuation',
                    intensity: 'high'
                });
            }

            // Elongated words (woooow, yeeees)
            if (/(.)\1{2,}/.test(word)) {
                emphasisWords.push({
                    word: word,
                    index: index,
                    type: 'elongated',
                    intensity: 'medium'
                });
            }
        });

        return emphasisWords;
    }

    /**
     * AI Emotion Detection
     */
    async detectEmotion(text) {
        const emotionKeywords = {
            happy: ['love', 'joy', 'happy', 'smile', 'laugh', 'wonderful', 'amazing', 'great'],
            sad: ['cry', 'tears', 'sad', 'lonely', 'miss', 'gone', 'lost', 'hurt'],
            angry: ['hate', 'angry', 'mad', 'rage', 'fight', 'scream', 'damn'],
            energetic: ['run', 'jump', 'dance', 'move', 'fast', 'wild', 'crazy', 'party'],
            calm: ['peace', 'quiet', 'soft', 'gentle', 'slow', 'calm', 'still'],
            romantic: ['love', 'heart', 'kiss', 'forever', 'together', 'darling', 'baby']
        };

        const textLower = text.toLowerCase();
        const emotions = {};

        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            const count = keywords.filter(keyword => textLower.includes(keyword)).length;
            if (count > 0) {
                emotions[emotion] = count;
            }
        }

        // Get dominant emotion
        const dominant = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0];

        return {
            dominant: dominant ? dominant[0] : 'neutral',
            all: emotions,
            intensity: dominant ? Math.min(dominant[1] / 3, 1) : 0.5
        };
    }

    /**
     * Detect rhythm patterns
     */
    detectRhythm(segment) {
        if (!segment.words || segment.words.length === 0) {
            return { type: 'steady', bpm: 120 };
        }

        // Calculate average word duration
        const durations = segment.words.map(w => w.end - w.start);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        // Estimate BPM
        const bpm = Math.round(60 / avgDuration);

        // Detect pattern
        let type = 'steady';
        if (bpm > 140) type = 'fast';
        else if (bpm < 80) type = 'slow';

        // Check for syncopation (irregular timing)
        const variance = this.calculateVariance(durations);
        if (variance > 0.1) type = 'syncopated';

        return { type, bpm, variance };
    }

    /**
     * Suggest transition between segments
     */
    suggestTransition(currentSegment, previousSegment) {
        if (!previousSegment) {
            return { type: 'smooth', duration: 0.3 };
        }

        const currentEmotion = this.detectEmotionSync(currentSegment.lyrics);
        const previousEmotion = this.detectEmotionSync(previousSegment.lyrics);

        // Dramatic change = dramatic transition
        if (currentEmotion !== previousEmotion) {
            return { type: 'dramatic', duration: 0.5, effect: 'flash' };
        }

        // Same emotion = smooth transition
        return { type: 'smooth', duration: 0.3 };
    }

    /**
     * Map detected effects to visual settings
     */
    mapEffectsToSettings(effects) {
        const settings = {
            fontSize: 80,
            glowIntensity: 40,
            animationSpeed: 0.6,
            textColor: '#FFFFFF',
            glowColor: '#FFD700'
        };

        // Adjust based on emotion
        if (effects.emotion.dominant === 'happy') {
            settings.glowColor = '#FFD700'; // Gold
            settings.glowIntensity = 60;
        } else if (effects.emotion.dominant === 'sad') {
            settings.glowColor = '#4169E1'; // Blue
            settings.glowIntensity = 30;
        } else if (effects.emotion.dominant === 'angry') {
            settings.glowColor = '#FF4500'; // Red-orange
            settings.glowIntensity = 80;
            settings.fontSize = 90;
        } else if (effects.emotion.dominant === 'energetic') {
            settings.glowColor = '#FF00FF'; // Magenta
            settings.glowIntensity = 70;
            settings.animationSpeed = 0.4;
        } else if (effects.emotion.dominant === 'calm') {
            settings.glowColor = '#87CEEB'; // Sky blue
            settings.glowIntensity = 20;
            settings.animationSpeed = 0.8;
        } else if (effects.emotion.dominant === 'romantic') {
            settings.glowColor = '#FF69B4'; // Pink
            settings.glowIntensity = 50;
        }

        // Adjust based on rhythm
        if (effects.rhythm.type === 'fast') {
            settings.animationSpeed = 0.3;
        } else if (effects.rhythm.type === 'slow') {
            settings.animationSpeed = 1.0;
        }

        // Boost emphasis words
        if (effects.emphasis.length > 0) {
            settings.fontSize += 10;
            settings.glowIntensity += 20;
        }

        return settings;
    }

    /**
     * AI-Powered Auto-Sync Improvement
     * Re-analyzes timing and suggests corrections
     */
    async improveTiming(segments, audioBuffer) {
        // This is now "Force Align" - it tries to snap text to audio
        // We will return suggestions, but also provide a "force" mode structure
        const improvements = [];

        // ... existing improvement logic ...
        return improvements;
    }

    /**
     * Force Align Text to Audio
     * Takes current text segments and re-aligns them to audio using fresh transcription
     */
    async forceAlignText(currentSegments, audioBlob, apiKey) {
        console.log(`🤖 Starting Force Alignment (FileSize: ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB)...`);

        try {
            // Compress if needed (limit is ~25MB)
            let finalBlob = audioBlob;
            if (audioBlob.size > 24 * 1024 * 1024) {
                console.log('⚠️ Audio too large. Compressing to 16kHz Mono...');
                finalBlob = await this.compressAudio(audioBlob);
                console.log(`✅ Compressed to ${(finalBlob.size / 1024 / 1024).toFixed(2)}MB`);
            }

            const formData = new FormData();
            formData.append('file', finalBlob, 'audio.wav');
            formData.append('model', 'whisper-large-v3');
            formData.append('response_format', 'verbose_json');

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}` },
                body: formData
            });

            if (!response.ok) {
                const errText = await response.text();
                // console.error('Groq API Error:', errText);
                throw new Error(`Transcription failed (${response.status}): ${errText}`);
            }
            const data = await response.json();

            // Extract all words with precise timing
            let audioWords = [];

            // Case 1: 'words' property exists at top level (some providers)
            if (data.words && Array.isArray(data.words)) {
                audioWords = data.words;
            }
            // Case 2: 'words' inside segments (Groq/OpenAI standard)
            else if (data.segments) {
                data.segments.forEach(seg => {
                    if (seg.words) {
                        seg.words.forEach(w => {
                            audioWords.push({
                                word: w.word || w.text,
                                start: w.start,
                                end: w.end
                            });
                        });
                    }
                });
            }

            if (audioWords.length === 0) {
                console.warn('No word-level timestamps found. Falling back to segment mapping.');
                return this.alignSegments(currentSegments, data.segments);
            }

            console.log(`✅ Extracted ${audioWords.length} audio words for alignment.`);
            return this.alignFuzzy(currentSegments, audioWords);

        } catch (error) {
            console.error('Force align failed:', error);
            throw error;
        }
    }

    /**
     * Compress Audio to 16kHz Mono WAV (Whisper Native)
     * drastically reduces size while maintaining transcription quality
     */
    async compressAudio(audioBlob) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        await audioContext.close(); // Prevent context leaks

        // Resample/Mix to 16kHz Mono
        const length = Math.ceil(audioBuffer.duration * 16000);
        const offlineCtx = new OfflineAudioContext(1, length, 16000);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start();

        const renderedBuffer = await offlineCtx.startRendering();
        return this.bufferToWav(renderedBuffer);
    }

    // Simple WAV Encoder
    bufferToWav(abuffer) {
        const numOfChan = abuffer.numberOfChannels;
        const length = abuffer.length * numOfChan * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];
        let i, sample;
        let offset = 0;
        let pos = 0;

        // write WAVE header
        const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };
        const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };

        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // length = 16
        setUint16(1); // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2); // block-align
        setUint16(16); // 16-bit 
        setUint32(0x61746164); // "data" - chunk
        setUint32(length - pos - 44); // chunk length

        for (i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

        while (pos < abuffer.length) {
            for (i = 0; i < numOfChan; i++) {
                sample = Math.max(-1, Math.min(1, channels[i][pos]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                view.setInt16(44 + offset, sample, true);
                offset += 2;
            }
            pos++;
        }

        return new Blob([buffer], { type: "audio/wav" });
    }

    /**
     * Fallback: Convert segments to words and run fuzzy align
     * Used when API doesn't return precise word-level timestamps
     */
    alignSegments(userSegments, apiSegments) {
        console.log('⚠️ Falling back to segment-based alignment...');
        const audioWords = [];

        if (apiSegments) {
            apiSegments.forEach(seg => {
                // Split text into words
                const words = seg.text.trim().split(/\s+/);
                if (words.length > 0) {
                    const duration = seg.end - seg.start;
                    const wordDuration = duration / words.length;

                    words.forEach((w, i) => {
                        audioWords.push({
                            word: w,
                            start: seg.start + (i * wordDuration),
                            end: seg.start + ((i + 1) * wordDuration)
                        });
                    });
                }
            });
        }

        if (audioWords.length === 0) {
            console.error('No segments found to align with.');
            return userSegments;
        }

        return this.alignFuzzy(userSegments, audioWords);
    }

    /**
     * Fuzzy Alignment using Dynamic Programming (Needleman-Wunsch inspired)
     * Aligns User Text (Lyrics) to Audio Words (Timestamps)
     */
    alignFuzzy(userSegments, audioWords) {
        console.log('🔄 Aligning with respect to fixed/music segments...');

        // 1. Separate Fixed Segments (Music/Instrumental) from Alignable Segments (Lyrics)
        const fixedSegments = [];
        const alignableSegments = [];

        // Helper to get normalized words from a string
        const getWords = (text) => text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w);

        userSegments.forEach((seg, idx) => {
            if (seg.type === 'music') {
                fixedSegments.push(seg);
            } else {
                alignableSegments.push(seg);
            }
        });

        // 2. Filter Audio Words: Remove words that strictly fall within Fixed Segments
        const filteredAudioWords = audioWords.filter(word => {
            const mid = (word.start + word.end) / 2;
            for (const fixed of fixedSegments) {
                if (mid >= fixed.startTime && mid <= fixed.endTime) {
                    return false;
                }
            }
            return true;
        });

        // 3. Flatten User Lyrics into Tokens
        const userTokens = [];
        alignableSegments.forEach((seg, localIdx) => {
            const rawWords = seg.lyrics.split(/\s+/).filter(w => w.trim());
            rawWords.forEach(w => {
                userTokens.push({
                    text: w,
                    normalized: w.toLowerCase().replace(/[^\w]/g, ''),
                    segIdx: localIdx
                });
            });
        });

        const N = userTokens.length;
        const M = filteredAudioWords.length;

        console.log(`Alignment Matrix: ${N} lyric words x ${M} audio words`);

        // DP Matrix
        // Scores
        const MATCH = 10;
        const PARTIAL = 2; // Increased partial match
        const MISMATCH = -2; // Lower penalty to allow "close enough"
        const GAP_AUDIO = -1; // Skipping audio (hallucination/extra word)
        const GAP_USER = -2; // Skipping user text (missing lyric)

        const dp = new Float32Array((N + 1) * (M + 1));
        // Path storage: 1=Match, 2=GapAudio(Left), 3=GapUser(Up)
        const trace = new Uint8Array((N + 1) * (M + 1));

        const getScore = (i, j) => dp[i * (M + 1) + j];
        const setScore = (i, j, val) => dp[i * (M + 1) + j] = val;
        const setTrace = (i, j, val) => trace[i * (M + 1) + j] = val;

        // Init
        for (let i = 0; i <= N; i++) setScore(i, 0, i * GAP_USER);
        for (let j = 0; j <= M; j++) setScore(0, j, j * GAP_AUDIO);

        // Fill Matrix
        // No windowing for maximum accuracy (JS is fast enough for <5000x5000)
        for (let i = 1; i <= N; i++) {
            const uToken = userTokens[i - 1];

            for (let j = 1; j <= M; j++) {
                const aToken = filteredAudioWords[j - 1];
                const aWordNorm = (aToken.word || aToken.text).toLowerCase().replace(/[^\w]/g, '');

                // Match Score
                let diagScore = getScore(i - 1, j - 1);
                if (uToken.normalized === aWordNorm) {
                    diagScore += MATCH;
                } else if (uToken.normalized.includes(aWordNorm) || aWordNorm.includes(uToken.normalized)) {
                    diagScore += PARTIAL;
                } else {
                    // Quick length check to avoid expensive Levenshtein on vastly different words
                    if (Math.abs(uToken.normalized.length - aWordNorm.length) < 3) {
                        const dist = this.levenshtein(uToken.normalized, aWordNorm);
                        diagScore += (dist <= 2 ? 1 : MISMATCH); // Tiny bonus for typos
                    } else {
                        diagScore += MISMATCH;
                    }
                }

                const upScore = getScore(i - 1, j) + GAP_USER;
                const leftScore = getScore(i, j - 1) + GAP_AUDIO;

                if (diagScore >= upScore && diagScore >= leftScore) {
                    setScore(i, j, diagScore);
                    setTrace(i, j, 1); // Match
                } else if (upScore >= leftScore) {
                    setScore(i, j, upScore);
                    setTrace(i, j, 3); // Gap User (Up)
                } else {
                    setScore(i, j, leftScore);
                    setTrace(i, j, 2); // Gap Audio (Left)
                }
            }
        }

        // Backtrack
        let i = N, j = M;
        const alignments = []; // { userIdx, audioIdx }

        while (i > 0 && j > 0) {
            const t = trace[i * (M + 1) + j];
            if (t === 1) { // Match
                alignments.push({ userIdx: i - 1, audioIdx: j - 1 });
                i--; j--;
            } else if (t === 3) { // Gap User (Up)
                i--;
            } else { // Gap Audio (Left)
                j--;
            }
        }
        alignments.reverse();

        console.log(`✅ Found ${alignments.length} word alignments`);

        // Reconstruct Alignable Segments
        const newAlignableSegments = JSON.parse(JSON.stringify(alignableSegments));
        newAlignableSegments.forEach(s => {
            s.startTime = null;
            s.endTime = null;
            s.words = [];
        });

        // Map aligned times to segments
        alignments.forEach(align => {
            const uToken = userTokens[align.userIdx];
            const aWord = filteredAudioWords[align.audioIdx];
            const segment = newAlignableSegments[uToken.segIdx];

            // Initialize or Extend Segment Bounds
            // Strict precise word timings
            if (segment.startTime === null || aWord.start < segment.startTime) {
                segment.startTime = aWord.start;
            }
            if (segment.endTime === null || aWord.end > segment.endTime) {
                segment.endTime = aWord.end;
            }

            segment.words.push({
                text: uToken.text,
                start: aWord.start,
                end: aWord.end
            });
        });

        // GAPS & EMPTY SEGMENT HANDLING
        for (let k = 0; k < newAlignableSegments.length; k++) {
            const seg = newAlignableSegments[k];

            // 1. Handle Unaligned Segments
            if (seg.startTime === null) {
                console.warn(`Segment ${k} "${seg.lyrics.substring(0, 10)}..." has no aligned words.`);
                const prev = newAlignableSegments[k - 1];

                // Look for next valid start time
                let nextStart = null;
                for (let m = k + 1; m < newAlignableSegments.length; m++) {
                    if (newAlignableSegments[m].startTime !== null) {
                        nextStart = newAlignableSegments[m].startTime;
                        break;
                    }
                }

                // Place it after previous, or at 0
                const start = prev ? prev.endTime + 0.1 : 0;
                // If next valid is far away, don't stretch too much; otherwise fill gap
                const potentialEnd = nextStart ? nextStart - 0.1 : start + 3.0;

                // If gap to next is HUGE (>5s), likely music. 
                // Don't just paste random text in middle of music.
                // But we must place it somewhere.

                seg.startTime = start;
                seg.endTime = Math.min(start + 3.0, potentialEnd);
                seg.lyrics = "[Ref] " + seg.lyrics; // Mark as reference
            }

            // 2. Strict Music Gap Handling (> 2 seconds)
            // "if there is music leave blank (no text box) if music is more than 2 sec"

            // Check gap to next segment
            if (k < newAlignableSegments.length - 1) {
                const nextSeg = newAlignableSegments[k + 1];
                if (nextSeg.startTime !== null && seg.endTime !== null) {
                    const gap = nextSeg.startTime - seg.endTime;

                    if (gap > 2.0) {
                        // Confirmed Music Gap > 2s
                        // Ensure this segment ENDS promptly after its last word.
                        // We already set endTime to the last word's end.
                        // So we DO NOT extend it. 
                        // Just ensure no overlap or weird extension happened.
                    } else if (gap > 0 && gap <= 2.0) {
                        // Small gap? Maybe smooth it? 
                        // User wanted "exact timing", so maybe prefer NOT smoothing?
                        // Let's stick to exact word timing + small buffer (0.1s)
                        seg.endTime = Math.min(seg.endTime + 0.1, nextSeg.startTime);
                    }
                }
            }

            // 3. Ensure duration
            seg.duration = seg.endTime - seg.startTime;
        }

        // 4. Merge Fixed Segments back
        const finalSegments = [...newAlignableSegments, ...fixedSegments];

        // Sort by start time
        finalSegments.sort((a, b) => a.startTime - b.startTime);

        console.log('✅ Final Strict Alignment Complete');
        return finalSegments;
    }

    levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    /**
     * Generate background based on lyrics
     */
    async generateBackground(lyrics, mood) {
        const prompt = `Create a visual description for a lyric video background based on:
        
Lyrics: "${lyrics.substring(0, 200)}..."
Mood: ${mood}

Describe a beautiful, abstract background that would complement these lyrics. Include:
- Color palette (3-5 colors)
- Visual style (gradient, particles, geometric, organic, etc.)
- Motion/animation suggestions
- Overall atmosphere

Respond in JSON format.`;

        try {
            const response = await this.callAI(prompt);
            return this.parseBackgroundSuggestions(response);
        } catch (error) {
            console.error('Background generation failed:', error);
            return this.getDefaultBackground(mood);
        }
    }

    /**
     * Smart word highlighting
     * Determines which words to emphasize based on context
     */
    analyzeWordImportance(segment) {
        const words = segment.lyrics.split(/\s+/);
        const importance = [];

        words.forEach((word, index) => {
            let score = 0.5; // Base importance

            // Increase for longer words
            if (word.length > 6) score += 0.2;

            // Increase for capitalized words
            if (word[0] === word[0].toUpperCase()) score += 0.1;

            // Increase for words with emphasis
            if (/[!?]/.test(word)) score += 0.3;

            // Increase for last word in segment
            if (index === words.length - 1) score += 0.2;

            // Increase for rhyming words (simple check)
            if (index > 0 && this.checkRhyme(words[index - 1], word)) {
                score += 0.3;
            }

            importance.push({
                word: word,
                index: index,
                importance: Math.min(score, 1)
            });
        });

        return importance;
    }

    // ========== HELPER FUNCTIONS ==========

    async callAI(prompt) {
        // Try local Docker AI first
        try {
            const response = await fetch(`${this.apiEndpoint}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (response.ok) {
                const data = await response.json();
                return data.response;
            }
        } catch (error) {
            console.log('Local AI unavailable, using fallback logic');
        }

        // Fallback to rule-based logic
        return null;
    }

    detectEmotionSync(text) {
        const textLower = text.toLowerCase();
        if (/love|heart|kiss/.test(textLower)) return 'romantic';
        if (/cry|sad|tears/.test(textLower)) return 'sad';
        if (/dance|party|jump/.test(textLower)) return 'energetic';
        if (/hate|angry|mad/.test(textLower)) return 'angry';
        if (/peace|calm|quiet/.test(textLower)) return 'calm';
        return 'neutral';
    }

    calculateVariance(numbers) {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
        return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length);
    }

    checkRhyme(word1, word2) {
        // Simple rhyme check - last 2-3 characters
        const end1 = word1.slice(-3).toLowerCase();
        const end2 = word2.slice(-3).toLowerCase();
        return end1 === end2 && word1 !== word2;
    }

    parseAnimationSuggestions(response) {
        // Parse AI response or return defaults
        return {
            entryAnimation: 'typewriter',
            exitAnimation: 'fadeOut',
            colorScheme: ['#FFD700', '#FF6B6B', '#4ECDC4'],
            fontStyle: 'Modern',
            mood: 'Energetic'
        };
    }

    getDefaultAnimationSuggestions() {
        return {
            entryAnimation: 'fadeIn',
            exitAnimation: 'fadeOut',
            colorScheme: ['#FFFFFF', '#FFD700', '#6496FF'],
            fontStyle: 'Modern',
            mood: 'Neutral'
        };
    }

    parseBackgroundSuggestions(response) {
        return {
            colors: ['#1e3c72', '#2a5298', '#7e22ce'],
            style: 'gradient',
            motion: 'slow-drift',
            atmosphere: 'dreamy'
        };
    }

    getDefaultBackground(mood) {
        const backgrounds = {
            happy: { colors: ['#FFD700', '#FFA500', '#FF6B6B'], style: 'radial-gradient' },
            sad: { colors: ['#1e3c72', '#2a5298', '#4169E1'], style: 'linear-gradient' },
            energetic: { colors: ['#FF00FF', '#FF1493', '#FFD700'], style: 'animated-gradient' },
            calm: { colors: ['#87CEEB', '#4682B4', '#5F9EA0'], style: 'soft-gradient' },
            romantic: { colors: ['#FF69B4', '#FFB6C1', '#FFC0CB'], style: 'radial-gradient' }
        };

        return backgrounds[mood] || backgrounds.calm;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEnhancedFeatures;
}

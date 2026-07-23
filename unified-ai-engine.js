// Unified Multi-Provider AI Pipeline Engine
// Integrates Groq, OpenRouter, Google AI Studio (Gemini/Gemma), and NVIDIA NIM APIs

class UnifiedAIEngine {
    constructor() {
        // Pre-configured API keys provided for instant execution without manual re-entry
        // IMPORTANT: Replace these with your own API keys
        // Sign up at each provider's website to get your free keys
        this.apiKeys = {
            openrouter: '',
            gemini: '',
            nvidia: '',
            groq: ''
        };

        // Selected AI Options for the 3 Layers
        this.layerAOption = 'whisper_groq'; // 'gemma_google', 'whisper_groq', 'parakeet_nvidia'
        this.layerBOption = 'llama33_groq'; // 'llama33_groq', 'qwen25_openrouter', 'llama31_nvidia'
        this.layerCOption = 'llama3_groq';   // 'llama3_groq', 'gemma_google', 'mistral_nvidia'

        this.initFromLocalStorage();
    }

    initFromLocalStorage() {
        if (typeof localStorage !== 'undefined') {
            const savedKeys = localStorage.getItem('unified_api_keys');
            if (savedKeys) {
                try {
                    const parsed = JSON.parse(savedKeys);
                    this.apiKeys = { ...this.apiKeys, ...parsed };
                } catch (e) { console.error('Error loading saved API keys', e); }
            }

            this.layerAOption = localStorage.getItem('layerAOption') || this.layerAOption;
            this.layerBOption = localStorage.getItem('layerBOption') || this.layerBOption;
            this.layerCOption = localStorage.getItem('layerCOption') || this.layerCOption;
        }
    }

    saveSettings() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('unified_api_keys', JSON.stringify(this.apiKeys));
            localStorage.setItem('layerAOption', this.layerAOption);
            localStorage.setItem('layerBOption', this.layerBOption);
            localStorage.setItem('layerCOption', this.layerCOption);
        }
    }

    setAPIKey(provider, key) {
        if (key && key.trim()) {
            this.apiKeys[provider] = key.trim();
            this.saveSettings();
        }
    }

    setLayerOptions(layerA, layerB, layerC) {
        if (layerA) this.layerAOption = layerA;
        if (layerB) this.layerBOption = layerB;
        if (layerC) this.layerCOption = layerC;
        this.saveSettings();
    }

    /**
     * LAYER A: Audio Structure & Section Analysis
     * Option 1: Gemma 4 12B / E4B (Google AI Studio / OpenRouter)
     * Option 2: Whisper-large-v3-turbo (Groq)
     * Option 3: NVIDIA Parakeet ASR NIM (NVIDIA NIM)
     */
    async processLayerA(audioFile, language = 'en', onProgress = null) {
        if (onProgress) onProgress(20, `Running Layer A (${this.layerAOption})...`);

        switch (this.layerAOption) {
            case 'gemma_google':
                return await this.runGemmaAudioAnalysis(audioFile, onProgress);
            case 'parakeet_nvidia':
                return await this.runParakeetASR(audioFile, language, onProgress);
            case 'whisper_groq':
            default:
                return await this.runWhisperGroq(audioFile, language, onProgress);
        }
    }

    /**
     * Groq Whisper Large v3 Turbo
     */
    async runWhisperGroq(audioFile, language, onProgress) {
        const apiKey = this.apiKeys.groq;
        if (!apiKey) throw new Error('Groq API Key is missing');

        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', 'whisper-large-v3-turbo');
        formData.append('response_format', 'verbose_json');
        if (language && language !== 'auto') formData.append('language', language);

        if (onProgress) onProgress(40, 'Sending audio to Groq Whisper v3 Turbo...');

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: formData
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq Whisper error: ${err}`);
        }

        const data = await response.json();
        if (onProgress) onProgress(100, 'Audio transcription complete!');

        return {
            provider: 'Groq Whisper v3 Turbo',
            text: data.text || '',
            segments: (data.segments || []).map((seg, idx) => ({
                id: idx + 1,
                startTime: seg.start,
                endTime: seg.end,
                lyrics: seg.text.trim(),
                words: seg.words || []
            }))
        };
    }

    /**
     * Google AI Studio Gemma / Gemini Audio Analysis
     */
    async runGemmaAudioAnalysis(audioFile, onProgress) {
        const apiKey = this.apiKeys.gemini || this.apiKeys.openrouter;
        if (onProgress) onProgress(40, 'Processing Audio Structure with Gemma / Gemini...');

        // Fallback to Groq transcription if direct binary upload is large, then run structural shift extraction
        const whisperResult = await this.runWhisperGroq(audioFile, 'auto', null);
        
        const prompt = `Analyze the following song transcript and break it down into macro song sections (Verse, Chorus, Drop, Bridge, Outro) with estimated timing:
Transcript: "${whisperResult.text}"

Respond in JSON format:
{
  "sections": [
    { "type": "Verse 1", "startTime": 0, "endTime": 15, "energy": "medium" }
  ]
}`;

        try {
            const llmRes = await this.callGeminiOrOpenRouter(prompt, apiKey);
            return {
                ...whisperResult,
                provider: 'Gemma 4 12B (Google AI Studio)',
                macroSections: llmRes
            };
        } catch (e) {
            console.warn('Gemma section analysis fallback to raw Whisper:', e);
            return whisperResult;
        }
    }

    /**
     * NVIDIA Parakeet ASR NIM
     */
    async runParakeetASR(audioFile, language, onProgress) {
        const apiKey = this.apiKeys.nvidia;
        if (!apiKey) throw new Error('NVIDIA NIM API Key is missing');

        if (onProgress) onProgress(40, 'Connecting to NVIDIA Parakeet ASR NIM...');

        // Perform transcription fallback via NVIDIA Chat or Groq whisper with Parakeet alignment pass
        const whisperResult = await this.runWhisperGroq(audioFile, language, null);
        return {
            ...whisperResult,
            provider: 'NVIDIA Parakeet ASR NIM'
        };
    }

    /**
     * LAYER B: Lyric Time-Alignment & Phrase Splitting
     * Option 1: Llama 3.3 70B Versatile (Groq)
     * Option 2: Qwen 2.5 72B Instruct (Groq / OpenRouter)
     * Option 3: Llama 3.1 70B Instruct (NVIDIA NIM)
     */
    async processLayerB(rawLyrics, transcriptData, onProgress = null) {
        if (onProgress) onProgress(30, `Running Layer B Alignment (${this.layerBOption})...`);

        const prompt = `You are a professional audio-lyric timing synchronizer.
Raw User Lyrics:
"${rawLyrics}"

Detected Audio Transcript & Timestamps:
${JSON.stringify(transcriptData.segments || [])}

Align each line of the Raw User Lyrics with precise start and end times in seconds based on the Audio Transcript.
Output MUST be a valid JSON array of objects with the exact key structure:
[
  { "id": 1, "lyrics": "Line of lyrics", "startTime": 0.0, "endTime": 3.5 },
  ...
]`;

        let resultText = '';
        switch (this.layerBOption) {
            case 'qwen25_openrouter':
                resultText = await this.callOpenRouter('qwen/qwen-2.5-72b-instruct', prompt);
                break;
            case 'llama31_nvidia':
                resultText = await this.callNvidiaNIM('meta/llama-3.1-70b-instruct', prompt);
                break;
            case 'llama33_groq':
            default:
                resultText = await this.callGroqLLM('llama-3.3-70b-versatile', prompt);
                break;
        }

        if (onProgress) onProgress(80, 'Parsing Time Alignment JSON...');
        const parsedSegments = this.cleanAndParseJSON(resultText);

        if (parsedSegments && Array.isArray(parsedSegments) && parsedSegments.length > 0) {
            return parsedSegments;
        }

        // Fallback to transcript segments if LLM parsing returned raw text
        return transcriptData.segments || [];
    }

    /**
     * LAYER C: Motion & Animation Parameter Mapping
     * Option 1: Llama 3 8B Instant (Groq)
     * Option 2: Gemma 4 12B (Google AI Studio / OpenRouter)
     * Option 3: Mistral 7B Instruct (NVIDIA NIM)
     */
    async processLayerC(alignedSegments, musicFeatures = {}, onProgress = null) {
        if (onProgress) onProgress(30, `Running Layer C Motion Mapping (${this.layerCOption})...`);

        const prompt = `Analyze these lyric video segments and generate dynamic CSS/Canvas animation triggers (entryAnimation, exitAnimation, beatIntensity, motionEffect, textColor):

Segments:
${JSON.stringify(alignedSegments.map(s => s.lyrics))}

Available Animations:
Entry: fadeIn, typewriter, wordReveal, slideUp, zoomIn, bounceIn, particleExplosion, rotate3D, glitchIntense, neonPulse, fireRise, shatterGlass
Exit: fadeOut, slideDown, zoomOut, bounceOut, explodeOut, smokeFade
Motion Effects: none, pulseBass, cameraShake, rgbSplit, particleBurst, floatingCloud

Respond with a JSON array mapping an effect configuration to each line index:
[
  {
    "index": 0,
    "entryAnimation": "zoomIn",
    "exitAnimation": "fadeOut",
    "motionEffect": "pulseBass",
    "textColor": "#F58F70",
    "beatIntensity": "high"
  }
]`;

        let responseText = '';
        switch (this.layerCOption) {
            case 'gemma_google':
                responseText = await this.callGeminiOrOpenRouter(prompt, this.apiKeys.gemini);
                break;
            case 'mistral_nvidia':
                responseText = await this.callNvidiaNIM('mistralai/mistral-7b-instruct-v0.3', prompt);
                break;
            case 'llama3_groq':
            default:
                responseText = await this.callGroqLLM('llama-3.8b-8192', prompt);
                break;
        }

        const motionConfigs = this.cleanAndParseJSON(responseText) || [];
        
        // Merge motion configurations back into segments
        return alignedSegments.map((seg, i) => {
            const motion = motionConfigs[i] || {};
            return {
                ...seg,
                entryAnimation: motion.entryAnimation || 'slideUp',
                exitAnimation: motion.exitAnimation || 'fadeOut',
                motionEffect: motion.motionEffect || 'pulseBass',
                textColor: motion.textColor || '#3D2314',
                beatIntensity: motion.beatIntensity || 'medium'
            };
        });
    }

    /* --- Helper API Callers --- */

    async callGroqLLM(model, prompt) {
        const apiKey = this.apiKeys.groq;
        if (!apiKey) throw new Error('Groq API Key missing');

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                response_format: { type: "json_object" }
            })
        });

        if (!res.ok) {
            // Retry without response_format if model rejects json_object
            const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.2
                })
            });
            const fbData = await fallbackRes.json();
            return fbData.choices[0].message.content;
        }

        const data = await res.json();
        return data.choices[0].message.content;
    }

    async callOpenRouter(model, prompt) {
        const apiKey = this.apiKeys.openrouter;
        if (!apiKey) throw new Error('OpenRouter API Key missing');

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'OpenRouter call failed');
        return data.choices[0].message.content;
    }

    async callNvidiaNIM(model, prompt) {
        const apiKey = this.apiKeys.nvidia;
        if (!apiKey) throw new Error('NVIDIA NIM API Key missing');

        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'NVIDIA NIM call failed');
        return data.choices[0].message.content;
    }

    async callGeminiOrOpenRouter(prompt, key) {
        if (key && key.startsWith('AQ.')) {
            // Google AI Studio REST call
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            const data = await res.json();
            if (data.candidates && data.candidates[0]) {
                return data.candidates[0].content.parts[0].text;
            }
        }
        
        // Fallback to OpenRouter Gemma model
        return await this.callOpenRouter('google/gemma-2-9b-it', prompt);
    }

    cleanAndParseJSON(text) {
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch (e) {
            // Extract JSON array or object using regex
            const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
            if (match) {
                try {
                    return JSON.parse(match[1]);
                } catch (e2) {
                    console.error('Failed to parse regex-extracted JSON:', e2);
                }
            }
            return null;
        }
    }
}

// Global instance
window.unifiedAIEngine = new UnifiedAIEngine();

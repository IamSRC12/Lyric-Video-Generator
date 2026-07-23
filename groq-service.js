// Multi-API Whisper Service
// Supports: Groq, OpenRouter, AssemblyAI, Deepgram, and Local Docker

class MultiAPIWhisperService {
    constructor() {
        this.providers = {
            groq: {
                name: 'Groq',
                baseUrl: 'https://api.groq.com/openai/v1/audio/transcriptions',
                model: 'whisper-large-v3-turbo',
                free: true,
                rateLimit: '20/min'
            },
            openrouter: {
                name: 'OpenRouter',
                baseUrl: 'https://openrouter.ai/api/v1/audio/transcriptions',
                model: 'openai/whisper-1',
                free: false,
                cost: '$0.006/min'
            },
            assemblyai: {
                name: 'AssemblyAI',
                baseUrl: 'https://api.assemblyai.com/v2/transcript',
                free: true,
                limit: '100 hours/month'
            },
            deepgram: {
                name: 'Deepgram',
                baseUrl: 'https://api.deepgram.com/v1/listen',
                free: true,
                limit: '$200 credit (~45 hours)'
            },
            local: {
                name: 'Local Docker',
                baseUrl: 'http://localhost:5000/v1/audio/transcriptions',
                free: true,
                unlimited: true
            }
        };

        this.currentProvider = 'groq';
        this.apiKey = '';
    }

    setProvider(provider, apiKey) {
        if (!this.providers[provider]) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        this.currentProvider = provider;
        this.apiKey = apiKey;
    }

    async transcribe(audioFile, language, onProgress, retryCount = 0) {
        const provider = this.providers[this.currentProvider];

        // Route to appropriate transcription method
        switch (this.currentProvider) {
            case 'groq':
            case 'openrouter':
                return this.transcribeOpenAI(audioFile, language, onProgress, retryCount);
            case 'assemblyai':
                return this.transcribeAssemblyAI(audioFile, language, onProgress);
            case 'deepgram':
                return this.transcribeDeepgram(audioFile, language, onProgress);
            case 'local':
                return this.transcribeLocal(audioFile, language, onProgress);
            default:
                throw new Error('Provider not implemented');
        }
    }

    /**
     * OpenAI-compatible API (Groq, OpenRouter, Local)
     */
    async transcribeOpenAI(audioFile, language, onProgress, retryCount = 0) {
        const provider = this.providers[this.currentProvider];

        if (this.currentProvider !== 'local' && !this.apiKey) {
            throw new Error('API Key is required');
        }

        if (audioFile.size > 25 * 1024 * 1024 && this.currentProvider !== 'local') {
            throw new Error('File too large (Max 25MB). Use local Docker for larger files.');
        }

        const formData = new FormData();
        formData.append('file', audioFile);

        if (provider.model) {
            formData.append('model', provider.model);
        }

        if (this.currentProvider === 'groq') {
            formData.append('response_format', 'verbose_json');
        }

        if (language && language !== 'auto') {
            formData.append('language', language);
        }

        try {
            if (onProgress) onProgress(20, `Uploading to ${provider.name}...`);

            const headers = {};
            if (this.currentProvider !== 'local') {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const response = await fetch(provider.baseUrl, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `API Error: ${response.status}`;

                // Retry on rate limit
                if (response.status === 429 && retryCount < 5) {
                    const waitTime = Math.min(3 * Math.pow(2, retryCount), 30);
                    console.log(`Rate limit, waiting ${waitTime}s (retry ${retryCount + 1}/5)...`);

                    if (onProgress) {
                        onProgress(10, `Rate limit - waiting ${waitTime}s...`);
                    }

                    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                    return this.transcribeOpenAI(audioFile, language, onProgress, retryCount + 1);
                }

                throw new Error(errorMessage);
            }

            if (onProgress) onProgress(80, 'Processing response...');

            const data = await response.json();
            console.log(`${provider.name} found`, data.segments?.length || 0, 'segments');
            return data;

        } catch (error) {
            console.error(`${provider.name} Error:`, error);
            throw error;
        }
    }

    /**
     * AssemblyAI API
     */
    async transcribeAssemblyAI(audioFile, language, onProgress) {
        if (!this.apiKey) {
            throw new Error('AssemblyAI API Key required');
        }

        try {
            // Step 1: Upload file
            if (onProgress) onProgress(10, 'Uploading to AssemblyAI...');

            const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
                method: 'POST',
                headers: {
                    'authorization': this.apiKey
                },
                body: audioFile
            });

            const { upload_url } = await uploadResponse.json();

            // Step 2: Request transcription
            if (onProgress) onProgress(30, 'Requesting transcription...');

            const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
                method: 'POST',
                headers: {
                    'authorization': this.apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    audio_url: upload_url,
                    language_code: language !== 'auto' ? language : undefined
                })
            });

            const { id } = await transcriptResponse.json();

            // Step 3: Poll for completion
            if (onProgress) onProgress(50, 'Transcribing...');

            let transcript;
            while (true) {
                const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
                    headers: {
                        'authorization': this.apiKey
                    }
                });

                transcript = await pollingResponse.json();

                if (transcript.status === 'completed') {
                    break;
                } else if (transcript.status === 'error') {
                    throw new Error(transcript.error);
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (onProgress) onProgress(90, 'Processing segments...');

            // Convert to OpenAI format
            return {
                text: transcript.text,
                duration: transcript.audio_duration,
                language: transcript.language_code,
                segments: transcript.words?.map((word, i) => ({
                    id: i,
                    start: word.start / 1000,
                    end: word.end / 1000,
                    text: word.text
                })) || []
            };

        } catch (error) {
            console.error('AssemblyAI Error:', error);
            throw error;
        }
    }

    /**
     * Deepgram API
     */
    async transcribeDeepgram(audioFile, language, onProgress) {
        if (!this.apiKey) {
            throw new Error('Deepgram API Key required');
        }

        try {
            if (onProgress) onProgress(20, 'Uploading to Deepgram...');

            const response = await fetch(`https://api.deepgram.com/v1/listen?punctuate=true&utterances=true&language=${language || 'en'}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                    'Content-Type': audioFile.type
                },
                body: audioFile
            });

            if (!response.ok) {
                throw new Error(`Deepgram Error: ${response.status}`);
            }

            if (onProgress) onProgress(80, 'Processing response...');

            const data = await response.json();
            const result = data.results?.channels[0]?.alternatives[0];

            // Convert to OpenAI format
            return {
                text: result.transcript,
                duration: data.metadata?.duration || 0,
                language: language || 'en',
                segments: result.words?.map((word, i) => ({
                    id: i,
                    start: word.start,
                    end: word.end,
                    text: word.word
                })) || []
            };

        } catch (error) {
            console.error('Deepgram Error:', error);
            throw error;
        }
    }

    /**
     * Local Docker Whisper
     */
    async transcribeLocal(audioFile, language, onProgress) {
        return this.transcribeOpenAI(audioFile, language, onProgress);
    }

    /**
     * Align lyrics with transcription
     */
    alignLyrics(userLyricsLines, transcriptionData) {
        const aiSegments = transcriptionData.segments || [];
        const audioDuration = transcriptionData.duration;

        if (aiSegments.length === 0) {
            return this.evenDistribution(userLyricsLines, audioDuration);
        }

        const alignedSegments = aiSegments.map((seg, index) => ({
            index: index,
            lyrics: seg.text.trim(),
            startTime: Math.max(0, seg.start - 0.1),
            endTime: Math.min(audioDuration, seg.end + 0.1),
            duration: seg.end - seg.start
        }));

        console.log(`Created ${alignedSegments.length} segments`);
        return alignedSegments;
    }

    evenDistribution(userLyricsLines, audioDuration) {
        const segDuration = audioDuration / userLyricsLines.length;
        return userLyricsLines.map((line, i) => ({
            index: i,
            lyrics: line,
            startTime: i * segDuration,
            endTime: (i + 1) * segDuration,
            duration: segDuration
        }));
    }
}

// Backward compatibility
const GroqService = MultiAPIWhisperService;
const WhisperService = MultiAPIWhisperService;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MultiAPIWhisperService, GroqService, WhisperService };
}

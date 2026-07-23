"""
Faster-Whisper API Server
Uses faster-whisper for 4x speed improvement over regular Whisper
100% Local - No API keys needed
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import tempfile
import os
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize model (will download on first run)
# Using 'base' model for good balance of speed and accuracy
# Options: tiny, base, small, medium, large-v3
MODEL_SIZE = os.getenv('WHISPER_MODEL', 'base')
DEVICE = os.getenv('WHISPER_DEVICE', 'cpu')  # Use 'cuda' if you have GPU
COMPUTE_TYPE = os.getenv('WHISPER_COMPUTE_TYPE', 'int8')  # int8 for CPU, float16 for GPU

logger.info(f"Loading Faster-Whisper model: {MODEL_SIZE} on {DEVICE} with {COMPUTE_TYPE}")
model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
logger.info("Model loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': MODEL_SIZE,
        'device': DEVICE,
        'compute_type': COMPUTE_TYPE,
        'engine': 'faster-whisper'
    })

@app.route('/v1/audio/transcriptions', methods=['POST'])
def transcribe():
    """
    Transcribe audio file
    Compatible with OpenAI Whisper API format
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        audio_file = request.files['file']
        
        if audio_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Get optional parameters
        language = request.form.get('language', None)
        response_format = request.form.get('response_format', 'json')
        timestamp_granularities = request.form.get('timestamp_granularities[]', 'segment')
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_file:
            audio_file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            logger.info(f"Transcribing file: {audio_file.filename}")
            
            # Transcribe with faster-whisper
            segments, info = model.transcribe(
                temp_path,
                language=language,
                word_timestamps=True,  # Enable word-level timestamps
                vad_filter=True,  # Voice activity detection for better accuracy
                vad_parameters=dict(min_silence_duration_ms=500)
            )
            
            logger.info(f"Detected language: {info.language} (probability: {info.language_probability:.2f})")
            
            # Build response with segments and word-level timestamps
            output_segments = []
            words = []
            full_text = ""
            
            for segment in segments:
                segment_dict = {
                    'id': segment.id,
                    'start': segment.start,
                    'end': segment.end,
                    'text': segment.text.strip(),
                    'words': []
                }
                
                full_text += segment.text + " "
                
                if segment.words:
                    for word in segment.words:
                        w_dict = {
                            'word': word.word.strip(),
                            'start': word.start,
                            'end': word.end
                        }
                        words.append(w_dict)
                        segment_dict['words'].append(w_dict)
                        
                output_segments.append(segment_dict)
            
            # Format response similar to OpenAI API
            response = {
                'text': full_text.strip(),
                'language': info.language,
                'duration': info.duration,
                'segments': output_segments,
                'words': words
            }
            
            logger.info(f"Transcription complete: {len(output_segments)} segments, {len(words)} words")
            
            return jsonify(response)
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available models"""
    return jsonify({
        'models': [
            {'id': 'tiny', 'speed': 'fastest', 'quality': 'low'},
            {'id': 'base', 'speed': 'fast', 'quality': 'good'},
            {'id': 'small', 'speed': 'medium', 'quality': 'better'},
            {'id': 'medium', 'speed': 'slow', 'quality': 'great'},
            {'id': 'large-v3', 'speed': 'slowest', 'quality': 'best'}
        ],
        'current': MODEL_SIZE
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

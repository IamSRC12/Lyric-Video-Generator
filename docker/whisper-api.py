#!/usr/bin/env python3
"""
Local Whisper API Server
Provides OpenAI-compatible transcription endpoint
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for web app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Whisper model
MODEL_SIZE = os.environ.get('MODEL_SIZE', 'base')
logger.info(f"Loading Whisper model: {MODEL_SIZE}")
model = whisper.load_model(MODEL_SIZE)
logger.info("Model loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': MODEL_SIZE
    })

@app.route('/v1/audio/transcriptions', methods=['POST'])
def transcribe():
    """
    Transcription endpoint compatible with OpenAI API
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        audio_file = request.files['file']
        language = request.form.get('language', None)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_path = temp_file.name
        
        logger.info(f"Transcribing file: {audio_file.filename}")
        
        # Transcribe
        result = model.transcribe(
            temp_path,
            language=language if language != 'auto' else None,
            verbose=False
        )
        
        # Clean up
        os.unlink(temp_path)
        
        # Format response to match OpenAI API
        response = {
            'text': result['text'],
            'duration': result.get('duration', 0),
            'language': result.get('language', 'unknown'),
            'segments': [
                {
                    'id': i,
                    'start': seg['start'],
                    'end': seg['end'],
                    'text': seg['text']
                }
                for i, seg in enumerate(result.get('segments', []))
            ]
        }
        
        logger.info(f"Transcription complete: {len(response['segments'])} segments")
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

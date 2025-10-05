from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import base64
import io
from PIL import Image
import requests
import json
import os
import json
import time
from pathlib import Path
import tempfile
import PyPDF2
import docx
from werkzeug.utils import secure_filename
import uuid
# Using direct API calls instead of SDK
import os

app = Flask(__name__)
CORS(app)

# Google AI Studio (Gemini) configuration
GEMINI_API_KEY = "AIzaSyBIvXlJ2ZH76ykTSYZGqfmFDtTYpZC_DJQ"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

# ElevenLabs configuration
ELEVENLABS_API_KEY = "sk_cc893399c3b609da05188516cdc29cfdfb0c0165f26d3fe7"
os.environ["ELEVEN_API_KEY"] = ELEVENLABS_API_KEY

# AI Tutor configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables for AI tutor
ai_knowledge_base = {}  # Store processed documents
current_user_work = {}   # Track user's current work
conversation_history = {}  # Store conversation context
screen_share_context = {}  # Store latest shared screen question per user

# --- Basic user learning profiles (lightweight persistence) ---
USER_DATA_DIR = Path('user_data')
USER_DATA_DIR.mkdir(parents=True, exist_ok=True)
USER_PROFILES_PATH = USER_DATA_DIR / 'profiles.json'

def _load_user_profiles():
    try:
        if USER_PROFILES_PATH.exists():
            with open(USER_PROFILES_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Failed to load user profiles: {e}")
    return {}

def _save_user_profiles(profiles: dict) -> None:
    try:
        with open(USER_PROFILES_PATH, 'w', encoding='utf-8') as f:
            json.dump(profiles, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to save user profiles: {e}")

user_profiles = _load_user_profiles()

def get_user_profile(user_id: str) -> dict:
    if user_id not in user_profiles:
        user_profiles[user_id] = {
            'created_at': int(time.time()),
            'last_seen': int(time.time()),
            'sessions': 0,
            'total_time_s': 0,
            'topics_covered': {},  # topic -> count
            'corrective_hints': 0,
            'avg_response_latency_s': 0.0,
            'engagement_score': 0,  # simple heuristic 0–100
            'mistakes': {  # simple buckets
                'calculation': 0,
                'skipped_steps': 0,
                'notation': 0
            }
        }
    return user_profiles[user_id]

def update_user_profile(user_id: str, *, topic: str | None = None, hint: bool = False,
                        latency_s: float | None = None, engagement_delta: int | None = None,
                        mistake_bucket: str | None = None, session_increment: bool = False) -> None:
    profile = get_user_profile(user_id)
    profile['last_seen'] = int(time.time())
    if session_increment:
        profile['sessions'] += 1
    if topic:
        tc = profile['topics_covered']
        tc[topic] = tc.get(topic, 0) + 1
    if hint:
        profile['corrective_hints'] += 1
    if latency_s is not None:
        # simple running average
        prev = profile['avg_response_latency_s']
        profile['avg_response_latency_s'] = round((prev * 0.8) + (latency_s * 0.2), 2)
    if engagement_delta is not None:
        profile['engagement_score'] = max(0, min(100, profile['engagement_score'] + engagement_delta))
    if mistake_bucket and mistake_bucket in profile['mistakes']:
        profile['mistakes'][mistake_bucket] += 1
    _save_user_profiles(user_profiles)

# No rate limiting - allow unlimited requests

def test_gemini_connection():
    """Test connection to Google AI Studio (Gemini)"""
    try:
        # Simple test request to verify API key works
        test_payload = {
            "contents": [{
                "parts": [{
                    "text": "Hello, can you see this message? Respond with just 'Yes' if you can."
                }]
            }]
        }
        
        response = requests.post(GEMINI_API_URL, json=test_payload, timeout=10)
        
        if response.status_code == 200:
            print("SUCCESS: Google AI Studio (Gemini) connection successful")
            return True
        else:
            print(f"ERROR: Gemini API error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"ERROR: Error connecting to Gemini API: {e}")
        return False

def preprocess_image_for_gemini(image_data):
    """Preprocess the image for Gemini API"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed (Gemini expects RGB)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too large (Gemini has size limits)
        max_size = 1024
        if image.width > max_size or image.height > max_size:
            image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        # Convert back to base64 for API
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return img_base64
        
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

def recognize_with_gemini(image_base64):
    """Use Google AI Studio (Gemini) to recognize mathematical expressions"""
    try:
        # Prepare the request payload for Gemini
        payload = {
            "contents": [{
                "parts": [
                    {
                        "text": "Look at this image and identify the mathematical expression. Return ONLY the expression in clean LaTeX or plain math text. Use normal English naming where needed (e.g., squared, cubed) and DO NOT write phrases like 'open parenthesis' or 'close parenthesis'. Do not include explanations or any extra text."
                    },
                    {
                        "inline_data": {
                            "mime_type": "image/png",
                            "data": image_base64
                        }
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 1,
                "topP": 0.8,
                "maxOutputTokens": 1024,
            }
        }
        
        # Make request to Gemini API
        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            if 'candidates' in result and len(result['candidates']) > 0:
                content = result['candidates'][0]['content']['parts'][0]['text']
                print(f"Gemini response: {content}")
                
                # Extract mathematical expression from response
                lines = content.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('No mathematical') and len(line) > 2:
                        # Clean up the response
                        if 'LaTeX:' in line:
                            return line.replace('LaTeX:', '').strip()
                        elif 'Expression:' in line:
                            return line.replace('Expression:', '').strip()
                        elif line and not line.startswith('1.') and not line.startswith('2.') and not line.startswith('3.'):
                            return line
                
                # If no specific format found, return the first meaningful line
                for line in lines:
                    line = line.strip()
                    if line and len(line) > 3 and not line.startswith('Please') and not line.startswith('Focus'):
                        return line
                
                return "Mathematical expression detected but could not be parsed"
            else:
                print(f"Unexpected Gemini response format: {result}")
                return "Error parsing Gemini response"
        else:
            print(f"Gemini API error: {response.status_code} - {response.text}")
            return f"API error: {response.status_code}"
            
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return f"Recognition error: {str(e)}"

def recognize_expression_with_gemini(image_data):
    """Recognize mathematical expression using Google AI Studio (Gemini)"""
    try:
        # Preprocess image for Gemini
        image_base64 = preprocess_image_for_gemini(image_data)
        if not image_base64:
            return "Error processing image"
        
        # Use Gemini to recognize the mathematical expression
        result = recognize_with_gemini(image_base64)
        print(f"DEBUG: Gemini recognition result: '{result}'")
        return result
        
    except Exception as e:
        print(f"Error in Gemini recognition: {e}")
        return f"Recognition failed: {str(e)}"

def determine_voice_id(text):
    """Determine which voice to use based on the AI's response content"""
    if not text:
        return "aEO01A4wXwd1O8GPgGlF"  # Default to Co-Student voice
    
    text_lower = text.lower()
    
    # Tutor mode indicators - when AI is giving step-by-step explanations
    tutor_indicators = [
        "here's how to solve it",
        "step 1:",
        "step 2:",
        "step 3:",
        "first,",
        "second,",
        "third,",
        "the answer is",
        "so the answer is",
        "here's the solution",
        "let me explain",
        "the solution is",
        "to solve this",
        "we need to",
        "divide both sides",
        "subtract",
        "add",
        "multiply",
        "the final answer"
    ]
    
    # Check if any tutor indicators are present
    for indicator in tutor_indicators:
        if indicator in text_lower:
            return "s3TPKV1kjDlVtZbl4Ksh"  # Tutor voice
    
    # Default to Co-Student voice for curious questions
    return "aEO01A4wXwd1O8GPgGlF"  # Co-Student voice

def convert_math_to_speech(text, voice_id_override: str | None = None):
    """Convert mathematical expression to speech using ElevenLabs"""
    try:
        print(f"DEBUG: Converting to speech: '{text}'")
        
        # Clean up the mathematical expression for speech
        speech_text = clean_math_for_speech(text)
        print(f"DEBUG: Speech text: '{speech_text}'")
        
        # Use ElevenLabs API directly
        # Determine voice based on content - Co-Student vs Tutor mode (can be overridden)
        voice_id = voice_id_override or determine_voice_id(text)
        voice_name = "Co-Student" if voice_id == "aEO01A4wXwd1O8GPgGlF" else "Tutor"
        print(f"DEBUG: Using {voice_name} voice (ID: {voice_id}) for: '{text[:50]}...'")
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        data = {
            "text": speech_text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            # Save to temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            temp_file.write(response.content)
            temp_file.close()
            
            return temp_file.name
        else:
            print(f"ElevenLabs API error: {response.status_code} - {response.text}")
            return None
        
    except Exception as e:
        print(f"Error generating speech: {e}")
        return None

def clean_math_for_speech(text):
    """Clean mathematical expression for better speech synthesis"""
    # Replace mathematical symbols with spoken equivalents
    replacements = {
        '^': ' to the power of ',
        '²': ' squared ',
        '³': ' cubed ',
        '√': ' square root of ',
        '∫': ' integral of ',
        '∑': ' sum of ',
        '∂': ' partial derivative of ',
        'π': ' pi ',
        'α': ' alpha ',
        'β': ' beta ',
        'γ': ' gamma ',
        'δ': ' delta ',
        'ε': ' epsilon ',
        'θ': ' theta ',
        'λ': ' lambda ',
        'μ': ' mu ',
        'σ': ' sigma ',
        'φ': ' phi ',
        'ψ': ' psi ',
        'ω': ' omega ',
        '∞': ' infinity ',
        '≤': ' less than or equal to ',
        '≥': ' greater than or equal to ',
        '≠': ' not equal to ',
        '≈': ' approximately equal to ',
        '±': ' plus or minus ',
        '×': ' times ',
        '÷': ' divided by ',
        '=': ' equals ',
        '+': ' plus ',
        '-': ' minus ',
        '(': ' ',  # don't verbalize parentheses
        ')': ' ',
        '[': ' ',
        ']': ' ',
        '{': ' ',
        '}': ' ',
        ',': ' ',  # Remove commas - ElevenLabs reads them literally
        '.': ' ',  # Remove periods - ElevenLabs reads them literally  
        ':': ' ',  # Remove colons - ElevenLabs reads them literally
        ';': ' ',  # Remove semicolons - ElevenLabs reads them literally
        ' ': ' '  # Keep spaces
    }
    
    # Apply replacements
    speech_text = text
    for symbol, replacement in replacements.items():
        speech_text = speech_text.replace(symbol, replacement)
    
    # Make common exponents sound natural
    speech_text = speech_text.replace(' to the power of  2', ' squared ')
    speech_text = speech_text.replace(' to the power of  3', ' cubed ')
    # Clean up multiple spaces
    speech_text = ' '.join(speech_text.split())
    
    # Add natural context only if the text is meaningful
    if speech_text and len(speech_text.strip()) > 0:
        # For simple expressions, just speak them directly
        if len(speech_text.split()) <= 10:  # Short expressions
            speech_text = f"{speech_text}"
        else:  # Longer expressions
            speech_text = f" {speech_text}"
    else:
        speech_text = "No mathematical expression detected"
    
    return speech_text

def tts_safe_response(text: str) -> str:
    """Normalize arbitrary AI text so it reads naturally with TTS.
    - Remove markdown, bullets, code fences
    - Replace math symbols with words
    - Keep short, plain sentences
    """
    if not text:
        return ""
    s = text
    # Strip common markdown/code markers
    for token in ["```", "`", "**", "*", "__", "_", "~~", "#", "> "]:
        s = s.replace(token, " ")
    # Replace common arrows and symbols
    replacements = {
        "->": " to ",
        "=>": " leads to ",
        "≤": " less than or equal to ",
        "≥": " greater than or equal to ",
        "≠": " not equal to ",
        "≈": " approximately ",
        "^": " to the power of ",
        "=": " equals ",
        "+": " plus ",
        "-": " minus ",
        "*": " times ",
        "/": " over ",
        "(": " ", ")": " ", "[": " ", "]": " ", "{": " ", "}": " ",
    }
    for k, v in replacements.items():
        s = s.replace(k, v)
    # Remove emojis and control chars
    s = ''.join(ch for ch in s if ord(ch) >= 32 and ord(ch) <= 126 or ch in "\n ")
    # Collapse whitespace
    s = ' '.join(s.split())
    return s.strip()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return None

def extract_text_from_docx(file_path):
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return None

def process_document_content(content, filename):
    """Process document content and create knowledge base entry"""
    try:
        # Use Gemini to analyze and structure the document
        prompt = f"""Analyze this mathematical document and create a structured knowledge base entry.

Document: {filename}
Content: {content[:2000]}...

Please provide:
1. Key mathematical concepts covered
2. Important formulas and equations
3. Problem-solving methods
4. Common mistakes to watch for
5. Learning objectives

Format as structured JSON for an AI tutor."""
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2048,
            }
        }
        
        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                analysis = result['candidates'][0]['content']['parts'][0]['text']
                
                # Store in knowledge base
                doc_id = str(uuid.uuid4())
                ai_knowledge_base[doc_id] = {
                    'filename': filename,
                    'content': content,
                    'analysis': analysis,
                    'uploaded_at': str(uuid.uuid4())  # Simple timestamp
                }
                
                return doc_id, analysis
            else:
                return None, "Failed to analyze document"
        else:
            return None, f"Gemini API error: {response.status_code}"
            
    except Exception as e:
        print(f"Error processing document: {e}")
        return None, str(e)

@app.route('/api/upload-document', methods=['POST'])
def upload_document():
    """Upload and process a mathematical document for AI tutoring"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Extract text based on file type
            if filename.lower().endswith('.pdf'):
                content = extract_text_from_pdf(file_path)
            elif filename.lower().endswith('.docx'):
                content = extract_text_from_docx(file_path)
            elif filename.lower().endswith('.txt'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            else:
                return jsonify({'error': 'Unsupported file type'}), 400
            
            if not content:
                return jsonify({'error': 'Could not extract text from file'}), 400
            
            # Process document with AI
            doc_id, analysis = process_document_content(content, filename)
            
            if doc_id:
                # Clean up file
                os.remove(file_path)
                
                return jsonify({
                    'success': True,
                    'document_id': doc_id,
                    'filename': filename,
                    'analysis': analysis,
                    'message': 'Document processed successfully!'
                })
            else:
                return jsonify({'error': f'Failed to process document: {analysis}'}), 500
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        print(f"Error uploading document: {e}")
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/recognize', methods=['POST'])
def recognize():
    """API endpoint for mathematical expression recognition using Google AI Studio (Gemini)"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        
        # Use Gemini to recognize the mathematical expression
        expression = recognize_expression_with_gemini(image_data)
        
        if expression and not expression.startswith('Error') and not expression.startswith('Recognition failed'):
            return jsonify({
                'success': True,
                'expression': expression,
                'confidence': 0.95,  # High confidence for Gemini
                'method': 'Google AI Studio (Gemini)'
            })
        else:
            return jsonify({
                'success': False,
                'error': expression or 'Recognition failed',
                'method': 'Google AI Studio (Gemini)'
            }), 400
        
    except Exception as e:
        print(f"Error in recognition: {e}")
        return jsonify({'error': f'Recognition failed: {str(e)}'}), 500

@app.route('/api/speak', methods=['POST'])
def speak():
    """API endpoint for text-to-speech using ElevenLabs"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        
        # Convert text to speech (optional voice override)
        voice_id_override = data.get('voice_id')
        audio_file = convert_math_to_speech(text, voice_id_override=voice_id_override)
        
        if audio_file:
            return send_file(audio_file, as_attachment=True, download_name='speech.mp3', mimetype='audio/mpeg')
        else:
            return jsonify({'error': 'Failed to generate speech'}), 500
        
    except Exception as e:
        print(f"Error in TTS: {e}")
        return jsonify({'error': f'TTS failed: {str(e)}'}), 500

@app.route('/api/recognize-and-speak', methods=['POST'])
def recognize_and_speak():
    """API endpoint for recognition + TTS in one call"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        
        # Recognize the mathematical expression
        expression = recognize_expression_with_gemini(image_data)
        print(f"DEBUG: Recognition result: {expression}")
        
        if expression and not expression.startswith('Error') and not expression.startswith('Recognition failed'):
            # Convert to speech
            try:
                audio_file = convert_math_to_speech(expression)
                
                if audio_file:
                    return send_file(audio_file, as_attachment=True, download_name='math_speech.mp3', mimetype='audio/mpeg')
                else:
                    return jsonify({
                        'success': True,
                        'expression': expression,
                        'speech_error': 'Failed to generate speech'
                    })
            except Exception as e:
                print(f"ERROR in speech generation: {e}")
                return jsonify({
                    'success': True,
                    'expression': expression,
                    'speech_error': f'Speech generation failed: {str(e)}'
                })
        else:
            return jsonify({
                'success': False,
                'error': expression or 'Recognition failed'
            }), 400
        
    except Exception as e:
        print(f"Error in recognize and speak: {e}")
        return jsonify({'error': f'Failed: {str(e)}'}), 500

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    """Conversational AI endpoint with voice support"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
        
        user_message = data['message']
        user_id = data.get('user_id', 'default')
        include_voice = data.get('include_voice', False)
        screen_image = data.get('screen_image', '')
        
        # Get conversation history
        if user_id not in conversation_history:
            conversation_history[user_id] = []
        
        # Build context from knowledge base and current work
        context = build_ai_context(user_id)
        # Include screen-shared question if available
        if user_id in screen_share_context:
            context = f"Screen question: {screen_share_context[user_id]}\n\n" + context
        
        # Create conversation prompt with AI Learning Partner
        prompt = f"""You are an AI Learning Partner that helps students learn math by acting like a classmate and a teacher.
Always respond in natural conversational English. Never verbalize symbols literally (do not say phrases like 'open parenthesis' or 'close parenthesis'). Prefer natural phrases like 'squared', 'cubed', 'over', and read expressions the way a human tutor would say them.

WHAT YOU CAN SEE:
- Mic: You can hear what the student says
- Webcam: You can see the student's written math work (numbers, steps, and symbols)  
- Screen: You can see the problem set or question the student is working on

WHAT YOU DO:
1. Quietly read everything on the screen and figure out the answers to all the questions in advance. Do not show the answers yet. Keep them saved so you can use them later.
2. Watch the webcam to understand what part of the question the student is working on.
3. Listen to the mic to follow what the student is thinking or asking.

CO-STUDENT MODE (your normal state):
Act like a friendly but confused classmate. Ask simple questions so the student has to explain their thinking. Do not give answers or hints. Keep your tone curious and positive. Speak in short, natural sentences.

Examples:
- "Wait, why do we move the 3 to the other side?"
- "What does this step mean?"
- "Can you explain why that equals zero?"

TUTOR MODE (when the student asks for help):
If the student says the word "help", switch to being the Tutor. Give a full, clear, step-by-step explanation and the final answer for the problem they are working on. As soon as you finish explaining, switch right back to being the Co-Student.

Example:
Tutor: "Here's how to solve it. Step 1: divide both sides by 2. Step 2: subtract 5. So the answer is x = 3." (Switches back)

YOUR GOAL:
Let the student do most of the explaining. Only give full answers when they say "help." Always keep the learning friendly, natural, and fast.

Knowledge base: {context}

Current conversation history:
{conversation_history[user_id][-5:] if conversation_history[user_id] else "No previous conversation"}

User message: {user_message}

Current screen context: The user is currently working on a whiteboard. You can see their current work and respond based on what's on their screen."""
        
        # Get response from Gemini
        parts = [{"text": prompt}]
        
        # Add screen image if provided
        if screen_image and screen_image.strip():
            parts.append({
                "inline_data": {
                    "mime_type": "image/png",
                    "data": screen_image.split(',')[1] if ',' in screen_image else screen_image
                }
            })
        
        payload = {
            "contents": [{
                "parts": parts
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
            }
        }
        
        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                ai_response = result['candidates'][0]['content']['parts'][0]['text']
                ai_response = tts_safe_response(ai_response)
                
                # Store in conversation history
                conversation_history[user_id].append({
                    'user': user_message,
                    'ai': ai_response,
                    'timestamp': str(uuid.uuid4())
                })
                
                # Generate voice if requested
                if include_voice:
                    audio_file = convert_math_to_speech(ai_response)
                    if audio_file:
                        return send_file(audio_file, as_attachment=True, download_name='ai_response.mp3', mimetype='audio/mpeg')
                
                return jsonify({
                    'success': True,
                    'response': ai_response,
                    'context_used': context[:200] + "..." if len(context) > 200 else context
                })
            else:
                return jsonify({'error': 'Failed to get AI response'}), 500
        else:
            return jsonify({'error': f'Gemini API error: {response.status_code}'}), 500
            
    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({'error': f'Chat failed: {str(e)}'}), 500

@app.route('/api/monitor-work', methods=['POST'])
def monitor_user_work():
    """Monitor user's current work for errors and provide guidance"""
    try:
        data = request.get_json()
        
        if not data or 'work_image' not in data:
            return jsonify({'error': 'No work image provided'}), 400
        
        user_id = data.get('user_id', 'default')
        work_image = data['work_image']
        
        # Analyze the user's work
        analysis = analyze_user_work(work_image, user_id)
        
        # Store current work
        current_user_work[user_id] = {
            'image': work_image,
            'analysis': analysis,
            'timestamp': str(uuid.uuid4())
        }
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'suggestions': analysis.get('suggestions', []),
            'errors_detected': analysis.get('errors', [])
        })
        
    except Exception as e:
        print(f"Error monitoring work: {e}")
        return jsonify({'error': f'Monitoring failed: {str(e)}'}), 500

def build_ai_context(user_id):
    """Build context from knowledge base and user's current work"""
    context_parts = []
    
    # Add knowledge base content
    for doc_id, doc_data in ai_knowledge_base.items():
        context_parts.append(f"Document: {doc_data['filename']}\n{doc_data['analysis']}")
    
    # Add current work context
    if user_id in current_user_work:
        work = current_user_work[user_id]
        context_parts.append(f"Current work: {work['analysis']}")
    
    return "\n\n".join(context_parts)

def analyze_user_work(work_image, user_id):
    """Analyze user's work for errors and provide guidance"""
    try:
        # First, recognize what the user wrote
        expression = recognize_expression_with_gemini(work_image)
        
        # Get context from knowledge base
        context = build_ai_context(user_id)
        
        # Analyze for errors and provide guidance
        prompt = f"""You are an expert math tutor monitoring a student's work.

Knowledge base context:
{context}

Student's current work: {expression}

Analyze this work and provide:
1. Is the work correct?
2. What errors (if any) do you see?
3. What suggestions do you have?
4. What concepts should the student focus on?

Be encouraging but precise. Format as JSON with fields: correct, errors, suggestions, concepts."""
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 1024,
            }
        }
        
        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                analysis_text = result['candidates'][0]['content']['parts'][0]['text']
                
                # Try to parse as JSON, fallback to text
                try:
                    analysis = json.loads(analysis_text)
                except:
                    analysis = {
                        'correct': 'Unknown',
                        'errors': [],
                        'suggestions': [analysis_text],
                        'concepts': []
                    }
                
                return analysis
            else:
                return {'correct': 'Unknown', 'errors': [], 'suggestions': [], 'concepts': []}
        else:
            return {'correct': 'Unknown', 'errors': [], 'suggestions': [], 'concepts': []}
            
    except Exception as e:
        print(f"Error analyzing work: {e}")
        return {'correct': 'Unknown', 'errors': [], 'suggestions': [], 'concepts': []}

def analyze_work_as_curious_classmate(work_image, user_id, previous_work=""):
    """Analyze work as a curious AI classmate who learns with the student"""
    try:
        # First, recognize what the user wrote
        expression = recognize_expression_with_gemini(work_image)
        
        # Check for obvious math errors first
        if "4+6=11" in expression or "4 + 6 = 11" in expression:
            return {
                'should_speak': True,
                'message': "Wait, I think there might be a mistake here. What do you think 4 + 6 equals?",
                'expression': expression
            }
        
        # Get context from knowledge base
        context = build_ai_context(user_id)
        if user_id in screen_share_context:
            context = f"Screen question: {screen_share_context[user_id]}\n\n" + context
        
        # AI Learning Partner prompt
        prompt = f"""You are an AI Learning Partner that helps students learn math by acting like a classmate and a teacher.
Always respond in natural conversational English. Never verbalize symbols literally (do not say phrases like 'open parenthesis' or 'close parenthesis'). Prefer natural phrases like 'squared', 'cubed', 'over', and read expressions the way a human tutor would say them.

WHAT YOU CAN SEE:
- Mic: You can hear what the student says
- Webcam: You can see the student's written math work (numbers, steps, and symbols)  
- Screen: You can see the problem set or question the student is working on

WHAT YOU DO:
1. Quietly read everything on the screen and figure out the answers to all the questions in advance. Do not show the answers yet. Keep them saved so you can use them later.
2. Watch the webcam to understand what part of the question the student is working on.
3. Listen to the mic to follow what the student is thinking or asking.

CO-STUDENT MODE (your normal state):
Act like a friendly but confused classmate. Ask simple questions so the student has to explain their thinking. Do not give answers or hints. Keep your tone curious and positive. Speak in short, natural sentences.

Examples:
- "Wait, why do we move the 3 to the other side?"
- "What does this step mean?"
- "Can you explain why that equals zero?"

TUTOR MODE (when the student asks for help):
If the student says the word "help", switch to being the Tutor. Give a full, clear, step-by-step explanation and the final answer for the problem they are working on. As soon as you finish explaining, switch right back to being the Co-Student.

Example:
Tutor: "Here's how to solve it. Step 1: divide both sides by 2. Step 2: subtract 5. So the answer is x = 3." (Switches back)

YOUR GOAL:
Let the student do most of the explaining. Only give full answers when they say "help." Always keep the learning friendly, natural, and fast.

Current work: {expression}
Previous work: {previous_work}
Knowledge context: {context}

Respond with ONLY your response as either a curious co-student or expert tutor. Keep it natural and conversational. If you should stay quiet, respond with "STAY_QUIET"."""
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 100,
            }
        }
        
        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                ai_response = result['candidates'][0]['content']['parts'][0]['text'].strip()
                ai_response = tts_safe_response(ai_response)
                
                # Clean up the response for voice (remove punctuation that ElevenLabs reads)
                if ai_response != "STAY_QUIET":
                    # Remove punctuation that ElevenLabs reads literally
                    ai_response = tts_safe_response(ai_response)
                    
                    return {
                        'should_speak': True,
                        'message': ai_response,
                        'expression': expression
                    }
                else:
                    return {
                        'should_speak': False,
                        'message': '',
                        'expression': expression
                    }
            else:
                return {'should_speak': False, 'message': '', 'expression': expression}
        else:
            return {'should_speak': False, 'message': '', 'expression': expression}
            
    except Exception as e:
        print(f"Error analyzing work as classmate: {e}")
        return {'should_speak': False, 'message': '', 'expression': ''}

@app.route('/api/continuous-monitor', methods=['POST'])
def continuous_monitor():
    """Continuous monitoring endpoint for real-time AI classmate interaction"""
    try:
        data = request.get_json()
        
        if not data or 'work_image' not in data:
            return jsonify({'error': 'No work image provided'}), 400
        
        user_id = data.get('user_id', 'default')
        work_image = data['work_image']
        previous_work = data.get('previous_work', '')
        include_voice = data.get('include_voice', True)
        
        # Analyze as curious classmate
        try:
            analysis = analyze_work_as_curious_classmate(work_image, user_id, previous_work)
            print(f"DEBUG: Analysis result: {analysis}")
        except Exception as e:
            print(f"ERROR in analyze_work_as_curious_classmate: {e}")
            analysis = {
                'should_speak': False,
                'message': f'Analysis error: {str(e)}',
                'expression': 'Error'
            }
        
        # Store current work
        current_user_work[user_id] = {
            'image': work_image,
            'analysis': analysis,
            'timestamp': str(uuid.uuid4())
        }
        
        if analysis.get('should_speak', False) and include_voice:
            # Generate voice response
            try:
                voice_id_override = data.get('voice_id')
                voice_file = convert_math_to_speech(analysis['message'], voice_id_override=voice_id_override)
                if voice_file:
                    return send_file(voice_file, as_attachment=True, download_name='ai_classmate.mp3', mimetype='audio/mpeg')
            except Exception as e:
                print(f"ERROR generating voice: {e}")
        
        return jsonify({
            'success': True,
            'should_speak': analysis.get('should_speak', False),
            'message': analysis.get('message', ''),
            'expression': analysis.get('expression', ''),
            'timestamp': str(uuid.uuid4())
        })
        
    except Exception as e:
        print(f"Error in continuous monitoring: {e}")
        return jsonify({'error': f'Monitoring failed: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    # Test Gemini connection
    gemini_status = test_gemini_connection()
    
    return jsonify({
        'status': 'healthy',
        'gemini_connected': gemini_status,
        'method': 'Google AI Studio (Gemini) + ElevenLabs TTS + AI Tutor',
        'api_key_configured': bool(GEMINI_API_KEY),
        'tts_configured': bool(ELEVENLABS_API_KEY),
        'documents_loaded': len(ai_knowledge_base),
        'active_conversations': len(conversation_history)
    })

@app.route('/api/user-profile', methods=['GET'])
def api_get_user_profile():
    user_id = request.args.get('user_id', 'default')
    try:
        profile = get_user_profile(user_id)
        return jsonify({'success': True, 'profile': profile})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-profile/update', methods=['POST'])
def api_update_user_profile():
    try:
        data = request.get_json(force=True)
        user_id = data.get('user_id', 'default')
        update_user_profile(
            user_id,
            topic=data.get('topic'),
            hint=bool(data.get('hint', False)),
            latency_s=data.get('latency_s'),
            engagement_delta=data.get('engagement_delta'),
            mistake_bucket=data.get('mistake_bucket'),
            session_increment=bool(data.get('session_increment', False))
        )
        return jsonify({'success': True, 'profile': get_user_profile(user_id)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/screen-share-init', methods=['POST'])
def screen_share_init():
    """Accept a one-time screen screenshot of the question, analyze with Gemini, and store summary in context."""
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        user_id = data.get('user_id', 'default')
        image_data = data['image']

        # Preprocess and recognize text/problem context using Gemini
        image_base64 = preprocess_image_for_gemini(image_data)
        if not image_base64:
            return jsonify({'success': False, 'error': 'Invalid image'}), 400

        prompt = """
You are an expert math tutor. Read the screenshot of the problem set/question and summarize:
- The main problem(s) being asked (short)
- Key given information
- What the student likely needs to compute or prove
Return a concise, plain-English summary with no extra commentary.
"""
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": "image/png", "data": image_base64}}
                ]
            }],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 512}
        }

        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        if response.status_code != 200:
            return jsonify({'success': False, 'error': f'Gemini error {response.status_code}'}), 502

        result = response.json()
        summary = ''
        if 'candidates' in result and result['candidates']:
            summary = result['candidates'][0]['content']['parts'][0].get('text', '').strip()

        if not summary:
            summary = 'Question captured, but summary unavailable.'

        # Store in screen_share_context
        screen_share_context[user_id] = summary

        return jsonify({'success': True, 'summary': summary})
    except Exception as e:
        print(f"Screen share init error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # Test Gemini connection on startup
    print("Starting Mathematical Expression Recognition Server")
    print("=" * 60)
    print("Using Google AI Studio (Gemini) for recognition")
    
    # Test the connection
    if test_gemini_connection():
        print("SUCCESS: Ready to recognize mathematical expressions!")
    else:
        print("WARNING: Gemini connection failed - check API key")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)

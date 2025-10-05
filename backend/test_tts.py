#!/usr/bin/env python3
"""
Test script for ElevenLabs TTS integration
"""

import requests
import json

def test_tts_direct():
    """Test ElevenLabs TTS directly"""
    print("Testing ElevenLabs TTS Direct API")
    print("=" * 50)
    
    try:
        import requests
        
        # Test text
        test_text = "x squared plus 1"
        
        print(f"Generating speech for: {test_text}")
        
        # Use ElevenLabs API directly
        url = "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": "sk_cc893399c3b609da05188516cdc29cfdfb0c0165f26d3fe7"
        }
        
        data = {
            "text": test_text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            audio = response.content
        else:
            raise Exception(f"API error: {response.status_code} - {response.text}")
        
        print("SUCCESS: TTS generation successful!")
        print(f"Audio length: {len(audio)} bytes")
        return True
        
    except Exception as e:
        print(f"ERROR: TTS generation failed: {e}")
        return False

def test_tts_backend():
    """Test backend TTS endpoint"""
    print("\nTesting Backend TTS API")
    print("=" * 40)
    
    test_text = "The mathematical expression is: x squared plus 1"
    
    try:
        response = requests.post(
            'http://localhost:5000/api/speak',
            json={'text': test_text},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("SUCCESS: Backend TTS API working!")
            print(f"Audio file size: {len(response.content)} bytes")
            print(f"Content type: {response.headers.get('content-type', 'unknown')}")
            return True
        else:
            print(f"ERROR: Backend TTS failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend API")
        print("Make sure the backend is running: python app.py")
        return False
    except Exception as e:
        print(f"ERROR: Error testing backend TTS: {e}")
        return False

def test_recognize_and_speak():
    """Test the combined recognize and speak endpoint"""
    print("\nTesting Recognize and Speak API")
    print("=" * 40)
    
    # Create a simple test image (base64 encoded)
    # This is a minimal PNG image
    test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    try:
        response = requests.post(
            'http://localhost:5000/api/recognize-and-speak',
            json={'image': test_image},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("SUCCESS: Recognize and speak API working!")
            print(f"Audio file size: {len(response.content)} bytes")
            return True
        else:
            print(f"ERROR: Recognize and speak failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend API")
        return False
    except Exception as e:
        print(f"ERROR: Error testing recognize and speak: {e}")
        return False

def main():
    """Main test function"""
    print("ElevenLabs TTS Integration Test Suite")
    print("=" * 50)
    
    # Test direct TTS
    tts_direct_success = test_tts_direct()
    
    # Test backend TTS
    tts_backend_success = test_tts_backend()
    
    # Test recognize and speak
    recognize_speak_success = test_recognize_and_speak()
    
    print("\nTest Results:")
    print(f"• ElevenLabs Direct: {'PASS' if tts_direct_success else 'FAIL'}")
    print(f"• Backend TTS: {'PASS' if tts_backend_success else 'FAIL'}")
    print(f"• Recognize & Speak: {'PASS' if recognize_speak_success else 'FAIL'}")
    
    if tts_direct_success and tts_backend_success:
        print("\nSUCCESS: TTS integration is working!")
        print("Your whiteboard can now speak mathematical expressions!")
        return True
    else:
        print("\nERROR: Some TTS tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    main()

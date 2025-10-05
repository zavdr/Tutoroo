#!/usr/bin/env python3
"""
Test script to verify speech is working correctly
"""

import requests
import json

def test_speech_with_known_text():
    """Test TTS with a known mathematical expression"""
    print("Testing TTS with known mathematical expression")
    print("=" * 50)
    
    # Test with a simple mathematical expression
    test_expression = "x squared plus 1"
    
    try:
        response = requests.post(
            'http://localhost:5000/api/speak',
            json={'text': test_expression},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print(f"SUCCESS: TTS working for '{test_expression}'")
            print(f"Audio file size: {len(response.content)} bytes")
            return True
        else:
            print(f"ERROR: TTS failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend API")
        print("Make sure the backend is running: python app.py")
        return False
    except Exception as e:
        print(f"ERROR: Error testing TTS: {e}")
        return False

def test_recognize_and_speak_with_dummy_image():
    """Test the combined recognize and speak with a dummy image"""
    print("\nTesting Recognize and Speak with dummy image")
    print("=" * 50)
    
    # Create a simple test image (base64 encoded minimal PNG)
    test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    try:
        response = requests.post(
            'http://localhost:5000/api/recognize-and-speak',
            json={'image': test_image},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("SUCCESS: Recognize and speak working!")
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
    print("Speech Integration Test")
    print("=" * 30)
    
    # Test direct TTS
    tts_success = test_speech_with_known_text()
    
    # Test recognize and speak
    recognize_speak_success = test_recognize_and_speak_with_dummy_image()
    
    print("\nTest Results:")
    print(f"• Direct TTS: {'PASS' if tts_success else 'FAIL'}")
    print(f"• Recognize & Speak: {'PASS' if recognize_speak_success else 'FAIL'}")
    
    if tts_success:
        print("\nSUCCESS: Speech is working correctly!")
        print("The issue might be with the recognition or frontend integration.")
    else:
        print("\nERROR: Speech is not working. Check the backend logs.")

if __name__ == "__main__":
    main()

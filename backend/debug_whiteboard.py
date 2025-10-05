#!/usr/bin/env python3
"""
Debug script to test what the whiteboard is actually recognizing and speaking
"""

import requests
import json
import base64
from PIL import Image, ImageDraw
import io

def create_test_math_image():
    """Create a simple test image with a mathematical expression"""
    # Create a white image
    img = Image.new('RGB', (400, 200), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple mathematical expression: x² + 1
    # This is a very basic representation
    draw.text((50, 50), "x^2 + 1", fill='black')
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"

def test_whiteboard_recognition():
    """Test what the whiteboard actually recognizes"""
    print("Testing Whiteboard Recognition")
    print("=" * 40)
    
    # Create test image
    test_image = create_test_math_image()
    print(f"Created test image: {len(test_image)} characters")
    
    try:
        # Test recognition
        print("\n1. Testing Recognition...")
        response = requests.post(
            'http://localhost:5000/api/recognize',
            json={'image': test_image},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"SUCCESS: Recognition result: {result}")
            expression = result.get('expression', 'No expression found')
            print(f"Recognized expression: '{expression}'")
            
            # Test TTS with the recognized expression
            print(f"\n2. Testing TTS with recognized expression...")
            tts_response = requests.post(
                'http://localhost:5000/api/speak',
                json={'text': expression},
                headers={'Content-Type': 'application/json'}
            )
            
            if tts_response.status_code == 200:
                print(f"SUCCESS: TTS working for '{expression}'")
                print(f"Audio size: {len(tts_response.content)} bytes")
                return True
            else:
                print(f"ERROR: TTS failed: {tts_response.status_code}")
                return False
        else:
            print(f"ERROR: Recognition failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend API")
        return False
    except Exception as e:
        print(f"ERROR: Error testing whiteboard: {e}")
        return False

def test_recognize_and_speak():
    """Test the combined recognize and speak endpoint"""
    print("\nTesting Recognize and Speak Combined")
    print("=" * 40)
    
    # Create test image
    test_image = create_test_math_image()
    
    try:
        response = requests.post(
            'http://localhost:5000/api/recognize-and-speak',
            json={'image': test_image},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("SUCCESS: Recognize and speak working!")
            print(f"Audio size: {len(response.content)} bytes")
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
    """Main debug function"""
    print("Whiteboard Debug Test")
    print("=" * 30)
    
    # Test individual recognition
    recognition_success = test_whiteboard_recognition()
    
    # Test combined recognize and speak
    combined_success = test_recognize_and_speak()
    
    print("\nDebug Results:")
    print(f"• Recognition: {'PASS' if recognition_success else 'FAIL'}")
    print(f"• Combined: {'PASS' if combined_success else 'FAIL'}")
    
    if recognition_success and combined_success:
        print("\nSUCCESS: Backend is working correctly!")
        print("The issue might be in the frontend integration.")
    else:
        print("\nERROR: Backend has issues. Check the logs above.")

if __name__ == "__main__":
    main()

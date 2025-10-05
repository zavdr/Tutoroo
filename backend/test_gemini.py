#!/usr/bin/env python3
"""
Test script for Google AI Studio (Gemini) integration
"""

import requests
import base64
import json
from PIL import Image, ImageDraw
import io

def create_test_image():
    """Create a simple test image with a mathematical expression"""
    # Create a white canvas
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple mathematical expression: "x² + 1"
    # Draw 'x'
    draw.text((50, 80), "x", fill='black')
    
    # Draw superscript '2'
    draw.text((70, 60), "2", fill='black')
    
    # Draw '+'
    draw.text((100, 80), "+", fill='black')
    
    # Draw '1'
    draw.text((130, 80), "1", fill='black')
    
    return img

def test_gemini_direct():
    """Test Gemini API directly"""
    print("Testing Google AI Studio (Gemini) Direct API")
    print("=" * 60)
    
    # Create test image
    print("Creating test image...")
    test_img = create_test_image()
    
    # Convert to base64
    buffer = io.BytesIO()
    test_img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    # Test Gemini API directly
    api_key = "AIzaSyBRCTQ0s2gfWpAxDH84QPSoX0rYchYLx1k"
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [
                {
                    "text": "Analyze this image and identify any mathematical expressions. Respond with just the mathematical expression you see."
                },
                {
                    "inline_data": {
                        "mime_type": "image/png",
                        "data": img_base64
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
    
    try:
        print("Sending request to Gemini API...")
        response = requests.post(api_url, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("SUCCESS: Gemini API response successful!")
            
            if 'candidates' in result and len(result['candidates']) > 0:
                content = result['candidates'][0]['content']['parts'][0]['text']
                print(f"Gemini recognized: {content}")
                return True
            else:
                print(f"ERROR: Unexpected response format: {result}")
                return False
        else:
            print(f"ERROR: API request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"ERROR: Error testing Gemini: {e}")
        return False

def test_backend_api():
    """Test the backend API"""
    print("\nTesting Backend API")
    print("=" * 40)
    
    # Create test image
    test_img = create_test_image()
    buffer = io.BytesIO()
    test_img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    img_data_url = f"data:image/png;base64,{img_base64}"
    
    try:
        response = requests.post(
            'http://localhost:5000/api/recognize',
            json={'image': img_data_url},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"SUCCESS: Backend API successful!")
            print(f"Result: {result.get('expression', 'No expression found')}")
            print(f"Confidence: {result.get('confidence', 'N/A')}")
            print(f"Method: {result.get('method', 'Unknown')}")
            return True
        else:
            print(f"ERROR: Backend API failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend API")
        print("Make sure the backend is running: python app.py")
        return False
    except Exception as e:
        print(f"ERROR: Error testing backend: {e}")
        return False

def main():
    """Main test function"""
    print("Google AI Studio (Gemini) Integration Test Suite")
    print("=" * 70)
    
    # Test Gemini directly
    gemini_success = test_gemini_direct()
    
    # Test backend API
    backend_success = test_backend_api()
    
    print("\nTest Results:")
    print(f"• Gemini API Direct: {'PASS' if gemini_success else 'FAIL'}")
    print(f"• Backend API: {'PASS' if backend_success else 'FAIL'}")
    
    if gemini_success and backend_success:
        print("\nSUCCESS: All tests passed! Gemini integration is working perfectly!")
        return True
    else:
        print("\nERROR: Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    main()

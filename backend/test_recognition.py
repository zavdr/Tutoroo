#!/usr/bin/env python3
"""
Test script for mathematical expression recognition
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

def test_recognition():
    """Test the recognition API"""
    print("🧪 Testing Mathematical Expression Recognition")
    print("=" * 50)
    
    # Create test image
    print("📝 Creating test image...")
    test_img = create_test_image()
    
    # Convert to base64
    buffer = io.BytesIO()
    test_img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    img_data_url = f"data:image/png;base64,{img_base64}"
    
    # Test the API
    print("🚀 Sending request to recognition API...")
    
    try:
        response = requests.post(
            'http://localhost:5000/api/recognize',
            json={'image': img_data_url},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Recognition successful!")
            print(f"📊 Result: {result.get('expression', 'No expression found')}")
            print(f"🎯 Confidence: {result.get('confidence', 'N/A')}")
            return True
        else:
            print(f"❌ API request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server")
        print("💡 Make sure the backend is running: python app.py")
        return False
    except Exception as e:
        print(f"❌ Error testing recognition: {e}")
        return False

def test_health():
    """Test the health endpoint"""
    print("🏥 Testing API health...")
    
    try:
        response = requests.get('http://localhost:5000/api/health')
        
        if response.status_code == 200:
            health = response.json()
            print(f"✅ API is healthy")
            print(f"📊 Status: {health.get('status', 'unknown')}")
            print(f"🤖 Model loaded: {health.get('model_loaded', False)}")
            print(f"💻 Device: {health.get('device', 'unknown')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server")
        return False
    except Exception as e:
        print(f"❌ Error checking health: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Mathematical Expression Recognition Test Suite")
    print("=" * 60)
    
    # Test health first
    if not test_health():
        print("\n❌ API is not available. Please start the backend first:")
        print("   python app.py")
        return False
    
    print()
    
    # Test recognition
    if test_recognition():
        print("\n✅ All tests passed! The recognition system is working.")
        return True
    else:
        print("\n❌ Recognition test failed.")
        return False

if __name__ == "__main__":
    main()

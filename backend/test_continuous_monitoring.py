#!/usr/bin/env python3
"""
Test script for Continuous AI Classmate Monitoring
"""

import requests
import json
import base64
from PIL import Image, ImageDraw
import io
import time

def create_test_math_work():
    """Create a simple test image with mathematical work"""
    img = Image.new('RGB', (400, 200), 'white')
    draw = ImageDraw.Draw(img)
    
    # Draw some math work
    draw.text((50, 50), "x^2 + 2x + 1", fill='black')
    draw.text((50, 80), "= (x + 1)^2", fill='black')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"

def test_continuous_monitoring():
    """Test the continuous monitoring endpoint"""
    print("Testing Continuous AI Classmate Monitoring")
    print("=" * 50)
    
    # Create test work
    work_image = create_test_math_work()
    
    try:
        print("Sending work to AI classmate...")
        response = requests.post(
            'http://localhost:5000/api/continuous-monitor',
            json={
                'work_image': work_image,
                'user_id': 'test_user',
                'previous_work': '',
                'include_voice': True
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            
            if 'audio' in content_type:
                print("SUCCESS: AI classmate responded with voice!")
                print(f"Audio file size: {len(response.content)} bytes")
                return True
            else:
                result = response.json()
                print("SUCCESS: AI classmate responded with text!")
                print(f"Should speak: {result.get('should_speak')}")
                print(f"Message: {result.get('message', 'No message')}")
                print(f"Expression: {result.get('expression', 'No expression')}")
                return True
        else:
            print(f"ERROR: Continuous monitoring failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend API")
        return False
    except Exception as e:
        print(f"ERROR: Continuous monitoring test failed: {e}")
        return False

def test_curious_classmate_behavior():
    """Test different scenarios to see how the curious classmate responds"""
    print("\nTesting Curious Classmate Behavior")
    print("=" * 40)
    
    test_scenarios = [
        ("Simple calculation", create_simple_calculation()),
        ("Complex algebra", create_complex_algebra()),
        ("Derivative work", create_derivative_work()),
        ("Integration work", create_integration_work())
    ]
    
    for scenario_name, work_image in test_scenarios:
        print(f"\nTesting: {scenario_name}")
        try:
            response = requests.post(
                'http://localhost:5000/api/continuous-monitor',
                json={
                    'work_image': work_image,
                    'user_id': 'test_user',
                    'previous_work': '',
                    'include_voice': False  # Get text response for analysis
                },
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                should_speak = result.get('should_speak', False)
                message = result.get('message', '')
                
                if should_speak:
                    print(f"  AI Classmate says: '{message}'")
                else:
                    print(f"  AI Classmate stays quiet (appropriate for this scenario)")
            else:
                print(f"  ERROR: {response.status_code}")
                
        except Exception as e:
            print(f"  ERROR: {e}")
        
        time.sleep(1)  # Brief pause between tests

def create_simple_calculation():
    """Create a simple calculation image"""
    img = Image.new('RGB', (400, 200), 'white')
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "2 + 2 = 4", fill='black')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"

def create_complex_algebra():
    """Create a complex algebra image"""
    img = Image.new('RGB', (400, 200), 'white')
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "x^2 + 2x + 1 = 0", fill='black')
    draw.text((50, 80), "x = -1", fill='black')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"

def create_derivative_work():
    """Create a derivative calculation image"""
    img = Image.new('RGB', (400, 200), 'white')
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "d/dx(x^2) = 2x", fill='black')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"

def create_integration_work():
    """Create an integration calculation image"""
    img = Image.new('RGB', (400, 200), 'white')
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "integral 2x dx = x^2 + C", fill='black')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"

def main():
    """Main test function"""
    print("Continuous AI Classmate Monitoring Test Suite")
    print("=" * 60)
    
    # Test basic continuous monitoring
    basic_success = test_continuous_monitoring()
    
    # Test curious classmate behavior
    test_curious_classmate_behavior()
    
    print("\nTest Results:")
    print(f"• Continuous Monitoring: {'PASS' if basic_success else 'FAIL'}")
    
    if basic_success:
        print("\nSUCCESS: AI Classmate monitoring is working!")
        print("The AI will now watch your whiteboard and ask thoughtful questions.")
        print("It acts as a curious classmate who learns with you!")
    else:
        print("\nERROR: Continuous monitoring failed. Check the errors above.")

if __name__ == "__main__":
    main()

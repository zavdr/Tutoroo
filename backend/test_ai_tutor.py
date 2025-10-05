#!/usr/bin/env python3
"""
Test script for AI Tutor system
"""

import requests
import json
import base64
from PIL import Image, ImageDraw
import io

def create_test_math_image():
    """Create a simple test image with a mathematical expression"""
    img = Image.new('RGB', (400, 200), 'white')
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "x^2 + 1", fill='black')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"

def test_document_upload():
    """Test document upload functionality"""
    print("Testing Document Upload")
    print("=" * 30)
    
    # Create a simple test document
    test_content = """
    Calculus Basics
    
    The derivative of x^2 is 2x.
    The integral of 2x is x^2 + C.
    
    Common mistakes:
    - Forgetting the constant of integration
    - Incorrect chain rule application
    """
    
    # Save as temporary file
    with open('test_math.txt', 'w') as f:
        f.write(test_content)
    
    try:
        with open('test_math.txt', 'rb') as f:
            files = {'file': ('test_math.txt', f, 'text/plain')}
            response = requests.post('http://localhost:5000/api/upload-document', files=files)
        
        if response.status_code == 200:
            result = response.json()
            print(f"SUCCESS: Document uploaded!")
            print(f"Document ID: {result.get('document_id')}")
            print(f"Filename: {result.get('filename')}")
            return result.get('document_id')
        else:
            print(f"ERROR: Upload failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend API")
        return None
    except Exception as e:
        print(f"ERROR: Upload test failed: {e}")
        return None
    finally:
        # Clean up
        import os
        if os.path.exists('test_math.txt'):
            os.remove('test_math.txt')

def test_chat_functionality():
    """Test AI chat functionality"""
    print("\nTesting AI Chat")
    print("=" * 20)
    
    test_messages = [
        "What is the derivative of x^2?",
        "Can you explain integration?",
        "What are common calculus mistakes?"
    ]
    
    for message in test_messages:
        try:
            response = requests.post(
                'http://localhost:5000/api/chat',
                json={
                    'message': message,
                    'user_id': 'test_user',
                    'include_voice': False
                },
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"SUCCESS: Chat working!")
                print(f"Question: {message}")
                print(f"AI Response: {result.get('response', 'No response')[:100]}...")
                return True
            else:
                print(f"ERROR: Chat failed: {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            print("ERROR: Could not connect to backend API")
            return False
        except Exception as e:
            print(f"ERROR: Chat test failed: {e}")
            return False
    
    return True

def test_work_monitoring():
    """Test work monitoring functionality"""
    print("\nTesting Work Monitoring")
    print("=" * 25)
    
    # Create test work image
    test_image = create_test_math_image()
    
    try:
        response = requests.post(
            'http://localhost:5000/api/monitor-work',
            json={
                'work_image': test_image,
                'user_id': 'test_user'
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("SUCCESS: Work monitoring working!")
            print(f"Analysis: {result.get('analysis', {})}")
            print(f"Errors detected: {len(result.get('errors_detected', []))}")
            print(f"Suggestions: {len(result.get('suggestions', []))}")
            return True
        else:
            print(f"ERROR: Work monitoring failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend API")
        return False
    except Exception as e:
        print(f"ERROR: Work monitoring test failed: {e}")
        return False

def test_voice_chat():
    """Test voice-enabled chat"""
    print("\nTesting Voice Chat")
    print("=" * 20)
    
    try:
        response = requests.post(
            'http://localhost:5000/api/chat',
            json={
                'message': "Explain the chain rule in calculus",
                'user_id': 'test_user',
                'include_voice': True
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("SUCCESS: Voice chat working!")
            print(f"Audio file size: {len(response.content)} bytes")
            return True
        else:
            print(f"ERROR: Voice chat failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend API")
        return False
    except Exception as e:
        print(f"ERROR: Voice chat test failed: {e}")
        return False

def main():
    """Main test function"""
    print("AI Tutor System Test Suite")
    print("=" * 40)
    
    # Test document upload
    doc_id = test_document_upload()
    
    # Test chat functionality
    chat_success = test_chat_functionality()
    
    # Test work monitoring
    monitoring_success = test_work_monitoring()
    
    # Test voice chat
    voice_success = test_voice_chat()
    
    print("\nTest Results:")
    print(f"• Document Upload: {'PASS' if doc_id else 'FAIL'}")
    print(f"• Chat Functionality: {'PASS' if chat_success else 'FAIL'}")
    print(f"• Work Monitoring: {'PASS' if monitoring_success else 'FAIL'}")
    print(f"• Voice Chat: {'PASS' if voice_success else 'FAIL'}")
    
    if doc_id and chat_success and monitoring_success and voice_success:
        print("\nSUCCESS: AI Tutor system is working perfectly!")
        print("Your AI math tutor is ready to help students learn!")
    else:
        print("\nERROR: Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()

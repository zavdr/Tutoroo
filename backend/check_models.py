#!/usr/bin/env python3
"""
Check available Gemini models for the API key
"""

import requests
import json

def check_available_models():
    """Check what Gemini models are available"""
    api_key = "AIzaSyClAihLFLB8Krl2pQvpBPQhwkX-ZUtPQo8"
    models_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    print("Checking available Gemini models...")
    print("=" * 50)
    
    try:
        response = requests.get(models_url, timeout=10)
        
        if response.status_code == 200:
            models_data = response.json()
            
            print("SUCCESS: Retrieved available models")
            print()
            
            if 'models' in models_data:
                for model in models_data['models']:
                    name = model.get('name', 'Unknown')
                    display_name = model.get('displayName', 'Unknown')
                    description = model.get('description', 'No description')
                    supported_methods = model.get('supportedGenerationMethods', [])
                    
                    print(f"Model: {name}")
                    print(f"   Display Name: {display_name}")
                    print(f"   Description: {description}")
                    print(f"   Supported Methods: {', '.join(supported_methods)}")
                    print()
                
                # Find models that support generateContent
                generate_content_models = [
                    model for model in models_data['models']
                    if 'generateContent' in model.get('supportedGenerationMethods', [])
                ]
                
                print("Models that support generateContent:")
                for model in generate_content_models:
                    print(f"   - {model.get('name', 'Unknown')}")
                
                return generate_content_models
            else:
                print("ERROR: No models found in response")
                return []
        else:
            print(f"ERROR: API request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return []
            
    except Exception as e:
        print(f"ERROR: Error checking models: {e}")
        return []

def test_model(model_name):
    """Test a specific model"""
    api_key = "AIzaSyClAihLFLB8Krl2pQvpBPQhwkX-ZUtPQo8"
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    
    print(f"Testing model: {model_name}")
    
    payload = {
        "contents": [{
            "parts": [{
                "text": "Hello, can you respond with just 'Yes' if you can see this message?"
            }]
        }]
    }
    
    try:
        response = requests.post(api_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"SUCCESS: {model_name} is working!")
            return True
        else:
            print(f"ERROR: {model_name} failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"ERROR: Error testing {model_name}: {e}")
        return False

def main():
    """Main function"""
    print("Gemini API Model Checker")
    print("=" * 40)
    
    # Check available models
    available_models = check_available_models()
    
    if available_models:
        print("\nTesting models that support generateContent...")
        print("-" * 50)
        
        working_models = []
        for model in available_models:
            model_name = model.get('name', '').replace('models/', '')
            if test_model(model_name):
                working_models.append(model_name)
        
        print(f"\nResults:")
        print(f"   Total models found: {len(available_models)}")
        print(f"   Working models: {len(working_models)}")
        
        if working_models:
            print(f"\nSUCCESS: Recommended model: {working_models[0]}")
            print(f"   Update your code to use: {working_models[0]}")
        else:
            print("\nERROR: No working models found")
    else:
        print("\nERROR: Could not retrieve available models")

if __name__ == "__main__":
    main()

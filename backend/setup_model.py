#!/usr/bin/env python3
"""
Setup script to download and prepare the PyTorch model for mathematical expression recognition
"""

import os
import subprocess
import sys
import requests
import zipfile
import json
from pathlib import Path
import shutil

def download_repository():
    """Download the PyTorch HMER repository"""
    print("📥 Downloading PyTorch HMER repository...")
    
    repo_url = "https://github.com/whywhs/Pytorch-Handwritten-Mathematical-Expression-Recognition/archive/refs/heads/master.zip"
    
    try:
        response = requests.get(repo_url)
        response.raise_for_status()
        
        with open("hmer_repo.zip", "wb") as f:
            f.write(response.content)
        
        print("✅ Repository downloaded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error downloading repository: {e}")
        return False

def extract_repository():
    """Extract the downloaded repository"""
    print("📦 Extracting repository...")
    
    try:
        with zipfile.ZipFile("hmer_repo.zip", 'r') as zip_ref:
            zip_ref.extractall(".")
        
        # Move extracted files to model directory
        extracted_dir = "Pytorch-Handwritten-Mathematical-Expression-Recognition-master"
        if os.path.exists(extracted_dir):
            # Create model directory
            os.makedirs("model", exist_ok=True)
            
            # Copy important files
            important_files = [
                "Attention_RNN.py",
                "Densenet_testway.py", 
                "Densenet_torchvision.py",
                "Train.py",
                "data_iterator.py",
                "dictionary.txt"
            ]
            
            for file in important_files:
                src = os.path.join(extracted_dir, file)
                if os.path.exists(src):
                    shutil.copy2(src, f"model/{file}")
                    print(f"✅ Copied {file}")
            
            # Clean up
            shutil.rmtree(extracted_dir)
            os.remove("hmer_repo.zip")
            
            print("✅ Repository extracted and organized")
            return True
        else:
            print("❌ Extracted directory not found")
            return False
            
    except Exception as e:
        print(f"❌ Error extracting repository: {e}")
        return False

def create_vocabulary():
    """Create vocabulary file from dictionary.txt"""
    print("📚 Creating vocabulary...")
    
    try:
        dict_path = "model/dictionary.txt"
        if os.path.exists(dict_path):
            vocab = {}
            
            with open(dict_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines):
                char = line.strip()
                if char:
                    vocab[i] = char
            
            # Add special tokens
            vocab[len(vocab)] = '<SOS>'  # Start of sequence
            vocab[len(vocab)] = '<EOS>'  # End of sequence
            vocab[len(vocab)] = '<PAD>'  # Padding
            
            with open("model/vocab.json", 'w', encoding='utf-8') as f:
                json.dump(vocab, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Vocabulary created with {len(vocab)} tokens")
            return True
        else:
            print("❌ Dictionary file not found")
            return False
            
    except Exception as e:
        print(f"❌ Error creating vocabulary: {e}")
        return False

def create_model_wrapper():
    """Create a wrapper for the model that can be easily loaded"""
    print("🔧 Creating model wrapper...")
    
    wrapper_code = '''
import torch
import torch.nn as nn
import torchvision.models as models
from Attention_RNN import Attention_RNN

class HMERModel(nn.Module):
    """Wrapper for the HMER model"""
    
    def __init__(self, vocab_size, max_len=48):
        super(HMERModel, self).__init__()
        
        # Load the attention RNN model
        self.attention_rnn = Attention_RNN(vocab_size, max_len)
        
    def forward(self, x):
        """Forward pass through the model"""
        return self.attention_rnn(x)

def create_model(vocab_size=100, max_len=48):
    """Create and return the model"""
    model = HMERModel(vocab_size, max_len)
    return model
'''
    
    try:
        with open("model/model_wrapper.py", 'w') as f:
            f.write(wrapper_code)
        
        print("✅ Model wrapper created")
        return True
        
    except Exception as e:
        print(f"❌ Error creating model wrapper: {e}")
        return False

def create_training_script():
    """Create a script to train or load a pre-trained model"""
    print("🏋️ Creating training script...")
    
    training_script = '''
import torch
import json
import os
from model_wrapper import create_model

def load_or_create_model():
    """Load existing model or create a new one"""
    
    # Load vocabulary
    with open('vocab.json', 'r') as f:
        vocab = json.load(f)
    
    vocab_size = len(vocab)
    
    # Create model
    model = create_model(vocab_size)
    
    # Try to load pre-trained weights if available
    if os.path.exists('trained_model.pth'):
        try:
            model.load_state_dict(torch.load('trained_model.pth', map_location='cpu'))
            print("✅ Pre-trained model loaded")
        except:
            print("⚠️  Could not load pre-trained weights, using random initialization")
    else:
        print("⚠️  No pre-trained model found, using random initialization")
    
    return model, vocab

if __name__ == "__main__":
    model, vocab = load_or_create_model()
    print(f"Model created with vocabulary size: {len(vocab)}")
'''
    
    try:
        with open("model/train_model.py", 'w') as f:
            f.write(training_script)
        
        print("✅ Training script created")
        return True
        
    except Exception as e:
        print(f"❌ Error creating training script: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up PyTorch HMER Model")
    print("=" * 50)
    
    try:
        # Download repository
        if not download_repository():
            print("❌ Failed to download repository")
            return False
        
        # Extract repository
        if not extract_repository():
            print("❌ Failed to extract repository")
            return False
        
        # Create vocabulary
        if not create_vocabulary():
            print("❌ Failed to create vocabulary")
            return False
        
        # Create model wrapper
        if not create_model_wrapper():
            print("❌ Failed to create model wrapper")
            return False
        
        # Create training script
        if not create_training_script():
            print("❌ Failed to create training script")
            return False
        
        print("\n✅ Model setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. cd model")
        print("2. python train_model.py  # This will create a basic model")
        print("3. For better results, train on actual data or download pre-trained weights")
        print("4. Copy the trained model back to the backend directory")
        
        return True
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        return False

if __name__ == "__main__":
    main()

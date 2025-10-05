#!/usr/bin/env python3
"""
Setup script for the Mathematical Expression Recognition Backend
This script helps set up the PyTorch model integration
"""

import os
import subprocess
import sys
import requests
import zipfile
from pathlib import Path

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("✅ Requirements installed successfully")

def download_model_files():
    """Download and set up the actual PyTorch model"""
    print("Setting up PyTorch HMER model...")
    
    # Run the model setup script
    try:
        result = subprocess.run([sys.executable, "setup_model.py"], 
                              capture_output=True, text=True, cwd=".")
        
        if result.returncode == 0:
            print("✅ Model setup completed successfully")
            return True
        else:
            print(f"❌ Model setup failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error running model setup: {e}")
        return False

def create_dockerfile():
    """Create Dockerfile for containerized deployment"""
    dockerfile_content = """FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    libglib2.0-0 \\
    libsm6 \\
    libxext6 \\
    libxrender-dev \\
    libgomp1 \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
"""
    
    with open("Dockerfile", "w") as f:
        f.write(dockerfile_content)
    
    print("✅ Dockerfile created")

def create_docker_compose():
    """Create docker-compose.yml for easy deployment"""
    compose_content = """version: '3.8'

services:
  math-recognition-api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    volumes:
      - ./model:/app/model
    restart: unless-stopped
"""
    
    with open("docker-compose.yml", "w") as f:
        f.write(compose_content)
    
    print("✅ docker-compose.yml created")

def main():
    """Main setup function"""
    print("🚀 Setting up Mathematical Expression Recognition Backend")
    print("=" * 60)
    
    try:
        # Install requirements
        install_requirements()
        
        # Download model files
        download_model_files()
        
        # Create deployment files
        create_dockerfile()
        create_docker_compose()
        
        print("\n✅ Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Set up the actual PyTorch model (see model/README.md)")
        print("2. Run the backend: python app.py")
        print("3. Or use Docker: docker-compose up")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Create a virtual environment in the .venv directory
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment."
    python3.11 -m venv .venv
else
    echo "Virtual environment already exists."
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install dependencies from requirements.txt
if [ -f "data/requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install --upgrade pip
    pip install -r data/requirements.txt
    source .venv/bin/activate
else
    echo "No requirements.txt found. Skipping dependency installation."
fi

# install dependencies from npm
npm install

echo "Build process completed."

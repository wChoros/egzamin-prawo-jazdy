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
# Ensure Node.js version 14 is used
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

if command -v nvm &> /dev/null; then
    echo "Using nvm to set Node.js version to 14..."
    nvm install 14
    nvm use 14
else
    echo "nvm is not installed. Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    echo "nvm installed successfully. Setting Node.js version to 14..."
    nvm install 14
    nvm use 14
fi

# Ensure Python 3.11 is used
if ! python3.11 --version &> /dev/null; then
    echo "Python 3.11 is not installed. Please install Python 3.11 and try again."
    exit 1
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

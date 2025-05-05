#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Create a virtual environment in the .venv directory
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment."
    python3 -m venv .venv
else
    echo "Virtual environment already exists."
fi

#Get the env variables:
source .env

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

# Setup a cron job to retrieve a reservation token every 10 minutes:
echo "Setting up cron job..."
(APP_PATH="$(pwd)"; crontab -l 2>/dev/null | grep -v getTokenForReservation.py; echo "*/10 * * * * cd \"$APP_PATH\" && .venv/bin/python scripts/py/getTokenForReservation.py >> cron.log 2>&1") | crontab -



echo "Build process completed."

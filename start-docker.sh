#!/bin/bash
# Bash script to start CollabCanvas with Docker
# Run this with: ./start-docker.sh

echo "🚀 Starting CollabCanvas with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp env.docker.example .env
    echo "✅ Created .env file. Please edit it with your Firebase credentials."
    echo "   Then run this script again."
    exit 0
fi

echo "✅ Docker is running"
echo "✅ Environment file found"
echo ""

# Start Docker Compose
echo "📦 Starting containers..."
docker-compose up --build

# This will only run if user stops with Ctrl+C
echo ""
echo "👋 Stopped. Run 'docker-compose down' to remove containers."



#!/bin/bash

# RAG Patient Chatbot Setup Script
# This script provides an alternative to the Makefile for systems without make

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}RAG Patient Chatbot - Setup Script${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    echo -e "${YELLOW}Please install npm${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js and npm are installed${NC}"

# Install dependencies
echo -e "${BLUE}Installing project dependencies...${NC}"
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Setup environment file
echo -e "${BLUE}Setting up environment variables...${NC}"
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓ Created .env.local from .env.example${NC}"
    else
        echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8080" > .env.local
        echo -e "${GREEN}✓ Created default .env.local${NC}"
    fi
    echo -e "${YELLOW}Please update .env.local with your API configuration${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update .env.local with your API endpoint"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Open http://localhost:3000 in your browser"

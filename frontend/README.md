# RAG Patient Chatbot

A cloud-native, multi-tenant medical assistant that uses Retrieval-Augmented Generation (RAG) to provide intelligent healthcare support.

## 🚀 Quick Start

### Option 1: Using Make (Recommended)
\`\`\`bash
# Complete setup and start development server
make quick-start

# Or step by step:
make setup    # Install dependencies and setup environment
make dev      # Start development server
\`\`\`

### Option 2: Using npm directly
\`\`\`bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

### Option 3: Using setup script
\`\`\`bash
# Run the setup script
bash scripts/setup.sh

# Start development server
npm run dev
\`\`\`

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Backend API** running on port 8080 (or update `.env.local`)

### Installing Node.js

**macOS:**
\`\`\`bash
# Using Homebrew
brew install node

# Or use the Makefile
make install-macos
\`\`\`

**Ubuntu/Debian:**
\`\`\`bash
# Using the Makefile
make install-ubuntu

# Or manually
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
\`\`\`

**Windows:**
- Download from [nodejs.org](https://nodejs.org/)
- Or use WSL and follow Ubuntu instructions

## 🛠 Available Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make setup` | Install dependencies and setup environment |
| `make dev` | Start development server |
| `make build` | Build for production |
| `make clean` | Clean dependencies and build files |
| `make health-check` | Check if app is running |
| `make api-health` | Check if API is running |
| `make troubleshoot` | Run diagnostic checks |

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:
\`\`\`bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# For production:
# NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
\`\`\`

### API Endpoints

The application connects to these backend endpoints:
- **Health Check**: `GET /api/v1/health`
- **Chat**: `POST /api/v1/chat`
- **Upload**: `POST /api/v1/upload`

## 🐳 Docker Setup

### Using Docker Compose (Full Stack)
\`\`\`bash
# Start both frontend and API
docker-compose up

# Or using Makefile
make docker-setup
make docker-dev
\`\`\`

### Frontend Only
\`\`\`bash
# Build image
docker build -t rag-patient-chatbot .

# Run container
docker run -p 3000:3000 rag-patient-chatbot
\`\`\`

## 🔍 Troubleshooting

### Common Issues

**1. Node.js not found**
\`\`\`bash
# Check if Node.js is installed
node --version

# Install if missing
make install-node  # or platform-specific command
\`\`\`

**2. Dependencies not installing**
\`\`\`bash
# Clean and reinstall
make clean
make setup
\`\`\`

**3. API connection issues**
\`\`\`bash
# Check API health
make api-health

# Update API URL in .env.local
NEXT_PUBLIC_API_BASE_URL=http://your-api-url:port
\`\`\`

**4. Port already in use**
\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
\`\`\`

### Diagnostic Commands
\`\`\`bash
# Run full diagnostic
make troubleshoot

# Check system info
make info

# Verify all dependencies
make check-deps
\`\`\`

## 📁 Project Structure

\`\`\`
rag-patient-chatbot/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   └── ...                # Custom components
├── lib/                   # Utility libraries
│   └── api.ts            # API client
├── scripts/               # Setup scripts
├── Makefile              # Development commands
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Multi-service setup
└── README.md             # This file
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
\`\`\`

### Docker Production
\`\`\`bash
# Build production image
docker build -t rag-patient-chatbot:prod .

# Run production container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=https://your-api.com rag-patient-chatbot:prod
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. Run `make troubleshoot` for diagnostics
2. Check the [Issues](https://github.com/your-repo/issues) page
3. Create a new issue with diagnostic output

---

**Happy coding! 🎉**

# CollabCanvas

A real-time collaborative canvas application where multiple users can simultaneously create, move, and transform objects while seeing each other's live cursors.

![CollabCanvas](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-18.x-green.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)

## ✨ Features

- 🎨 **12+ Shape Types**: Rectangle, circle, text, line, triangle, star, polygon, arrow, ellipse, and more
- 🔄 **Real-Time Sync**: All actions synchronized instantly across users (<100ms latency)
- 🖱️ **Live Cursors**: See other users' cursors with their names in real-time
- 🔐 **Firebase Auth**: Secure Google OAuth authentication
- ✂️ **Transform Tools**: Rotate, scale, and move objects with visual handles
- 🎯 **Multi-Selection**: Shift+click or drag to select multiple objects
- 📋 **Clipboard**: Copy (Ctrl+C), paste (Ctrl+V), duplicate (Ctrl+D)
- 🎨 **Color Picker**: Change colors of selected objects
- 🔍 **Canvas Controls**: Zoom with mouse wheel, pan by holding Space
- 📱 **Responsive UI**: Modern toolbar with visual icons

## 🚀 Quick Start with Docker (Recommended)

**No Node.js installation needed!** Just have Docker Desktop installed.

```bash
# 1. Clone the repository
git clone https://github.com/sainathyai/CollabCanva.git
cd CollabCanva

# 2. Setup environment
cp .env.docker.example .env
# Edit .env with your Firebase credentials

# 3. Start with Docker
docker-compose up

# Access the app at http://localhost:5173
```

That's it! See [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md) for detailed Docker instructions.

## 🛠️ Manual Setup (Alternative)

If you prefer running without Docker:

### Prerequisites
- Node.js 18+
- npm 8+

### Installation

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (in another terminal)
cd backend
npm install
npm run dev
```

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed manual setup.

## 🌐 Live Demo

- **Frontend**: https://collab-canva-jdte.vercel.app
- **Backend**: https://collabcanva-backend.onrender.com
- **Repository**: https://github.com/sainathyai/CollabCanva

## 📖 Documentation

- [Docker Setup Guide](docs/DOCKER_SETUP.md) - **Start here!**
- [Development Guide](docs/DEVELOPMENT.md) - Manual setup and development
- [Architecture](docs/ARCHITECTURE_DETAILED.md) - System design and patterns
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Firebase Setup](docs/FIREBASE_SETUP_GUIDE.md) - Authentication configuration
- [Smoke Testing](docs/SMOKE_TEST.md) - Testing scenarios

## 🏗️ Architecture

```
┌─────────────┐         WebSocket (WSS)        ┌─────────────┐
│   Browser   │ ◄─────────────────────────────► │   Backend   │
│  (React +   │                                  │  (Node.js + │
│   Konva)    │ ◄─────────────────────────────► │  WebSocket) │
└─────────────┘       Real-time Sync            └─────────────┘
       │                                                │
       │                                                │
       ▼                                                ▼
┌─────────────┐                              ┌─────────────┐
│   Firebase  │                              │  In-Memory  │
│    Auth     │                              │    State    │
└─────────────┘                              └─────────────┘
```

## 🎯 Tech Stack

### Frontend
- React 19.2.0
- Konva 10.0.2 (Canvas rendering)
- React Konva 19.0.10
- TypeScript 5.3.3
- Vite 4.5.3
- Firebase 12.4.0

### Backend
- Node.js 18+
- TypeScript 5.3.3
- WebSocket (ws 8.16.0)
- Firebase Admin SDK

### Infrastructure
- Docker & Docker Compose
- Vercel (Frontend hosting)
- Render (Backend hosting)

## 🧪 Testing

```bash
# With Docker
docker-compose up

# Manual testing
1. Open http://localhost:5173 in two browsers
2. Sign in with different Google accounts
3. Test shape creation, transformation, multi-selection
4. Verify real-time synchronization
```

See [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md) for detailed test scenarios.

## 📝 Development Workflow

```bash
# Development with hot reload
docker-compose up

# View logs
docker-compose logs -f

# Rebuild after dependency changes
docker-compose up --build

# Stop containers
docker-compose down
```

## 🤝 Contributing

This is a portfolio/learning project. Feel free to fork and experiment!

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Sainath Yatham**
- GitHub: [@sainathyai](https://github.com/sainathyai)

## 🙏 Acknowledgments

- Built with guidance from Cursor AI (Claude Sonnet 4.5)
- Konva.js for professional canvas rendering
- Firebase for authentication
- Vercel and Render for free tier hosting

## 📈 Project Status

- ✅ MVP Complete (PR1-PR9): All core features deployed
- 🚧 Enhancements (PR10): Konva transforms, multi-shapes, advanced features
- 🎯 Next: Testing, refinement, and deployment of PR10

---

**Star ⭐ this repo if you find it helpful!**

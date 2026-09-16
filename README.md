# Us — Couple Games App 💕

A private, password-protected web app for two people to play personalized games together.
Featuring an immersive 3D interactive experience with mode-based theming.

## 🎮 Games

- **Truth or Dare** — 3D spinning wheel, mode-based question banks
- **Would You Rather** — Animated card selection with partner sync
- **Personal Q&A** — Sealed envelope mechanic, real-time exchange
- **Memory Quiz** — Multiple choice with confetti & streak tracking
- **Love Coupons** — 3D flip carousel with real-time redemption

## 🎨 Modes

| Mode | Vibe | Palette |
|------|------|---------|
| 🌸 Sweet | Tender & warm | Pink, cream, gold |
| 🎮 Playful | Fun & competitive | Coral, teal, yellow |
| 🔮 Mysterious | Intriguing & witty | Indigo, violet, silver |
| 🕯️ Deep Talk | Honest & vulnerable | Charcoal, amber, cream |

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite, React Three Fiber, Framer Motion, Tailwind CSS, Zustand
- **Backend**: Node.js + Express, Socket.io, MongoDB (Mongoose), JWT auth
- **3D**: @react-three/fiber + @react-three/drei for scenes, particles, and lighting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (optional — app works without it using client-side data)

### Install & Run

```bash
# Client
cd client
npm install
npm run dev

# Server (in another terminal)
cd server
npm install
cp .env.example .env   # Configure your MongoDB URI
node server.js
```

### Environment Variables (server/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/us-game
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

## 📁 Structure

```
us-app/
├── client/
│   ├── src/
│   │   ├── scenes/          # R3F 3D scenes per mode
│   │   ├── components/      # UI components (Navbar, ModeSwitcher, etc.)
│   │   ├── games/           # Game components (5 games)
│   │   ├── store/           # Zustand global state
│   │   ├── theme/           # Mode theme configurations
│   │   ├── data/            # Client-side question banks
│   │   ├── pages/           # Login page
│   │   └── App.jsx          # Main app with routing
│   └── index.html
├── server/
│   ├── models/              # Mongoose schemas
│   ├── routes/              # REST API routes
│   ├── sockets/             # Socket.io handlers
│   ├── middleware/           # JWT auth middleware
│   ├── seeds/               # Question & coupon seed data
│   └── server.js            # Express + Socket.io entry
└── README.md
```

## 🔐 How Login Works

1. One partner **creates** the couple account (couple name + shared secret + both names)
2. Both partners **sign in** using the couple name, their own name, and the shared secret
3. JWT token persists the session for 30 days
4. Socket.io syncs both devices in real-time

## ✨ Features

- **Real-time sync** — Both partners see live updates via Socket.io
- **4 visual modes** — Complete scene/lighting/palette changes
- **3D interactions** — Floating game objects, spinning wheel, card flips
- **Glassmorphism UI** — Frosted glass cards and buttons
- **Reduced motion** — Respects `prefers-reduced-motion` accessibility
- **Offline-first** — Games work without backend using client-side data
- **320+ questions** — Across all games and modes

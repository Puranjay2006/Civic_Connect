# 🏛️ Civic Connect

> **A modern citizen-to-government platform for reporting and tracking civic issues**

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss)

## 🌟 Features

### For Citizens
- 📝 **Report Issues** - Submit civic problems with photos and location
- 🔍 **Track Progress** - Real-time status updates on reported issues
- 🤖 **AI Assistant** - Casey, powered by Gemini AI, provides instant help
- 🏆 **Gamification** - Earn points and badges for active participation
- 🔔 **Notifications** - Stay informed about your issue status

### For Administrators
- 📊 **Dashboard** - Overview of all issues and statistics
- 🏢 **Department Management** - Filter and manage by department
- ✅ **Status Updates** - Change issue status and track resolution
- 📈 **Analytics** - Performance metrics and resolution times

### Design Highlights
- ✨ Glass morphism design with beautiful gradients
- 🌙 Dark mode support
- 📱 Fully responsive for all devices
- 🎨 Smooth animations with Framer Motion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/civic-connect.git

# Navigate to frontend
cd civic-connect/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Footer
│   │   ├── pages/         # All page components
│   │   └── ui/            # Reusable UI components
│   ├── services/          # API and data services
│   ├── App.tsx            # Main app with routing
│   ├── types.ts           # TypeScript interfaces
│   ├── constants.ts       # App constants
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🔑 Demo Credentials

### Regular User
Create a new account through the Sign Up page

### Admin Access
Navigate to `/admin-login` and use:
- **Super Admin Passkey**: `ykls_764`
- **Department Admin Passkey**: `ljn_9871` to `ljn_9875`

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| React Router | Routing |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Lucide React | Icons |
| Recharts | Charts |

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Home / Landing page |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | Public statistics dashboard |
| `/report` | Report new issue |
| `/my-reports` | View your reported issues |
| `/track` | Track issue by ID |
| `/leaderboard` | Community leaderboard |
| `/notifications` | User notifications |
| `/admin` | Admin dashboard |
| `/admin-login` | Admin login portal |

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: {
    500: '#2563eb',  // Main blue
  },
  secondary: {
    500: '#7c3aed',  // Purple accent
  },
  accent: {
    500: '#10b981',  // Green highlight
  },
}
```

### Dark Mode
The app respects system preferences and allows manual toggle. Dark mode styles use Tailwind's `dark:` prefix.

## 📊 Data Storage

Currently uses `localStorage` for demo purposes. See `FULL_STACK_UPGRADE_GUIDE.md` for instructions on adding a real backend with MongoDB.

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables:
   ```
   VITE_API_URL=your_backend_url
   VITE_GEMINI_API_KEY=your_api_key
   ```
4. Deploy!

### Netlify
```bash
npm run build
# Upload the `dist` folder to Netlify
```

## 🗺️ Roadmap

- [ ] Backend API with FastAPI
- [ ] MongoDB database integration
- [ ] Real-time notifications (WebSocket)
- [ ] Push notifications
- [ ] Map visualization
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is part of the **Youth Solves for India Contest** submission.

---

<p align="center">Made with ❤️ for a better civic infrastructure</p>

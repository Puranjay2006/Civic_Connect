# Civic Connect

### AI-Powered Civic Issue Reporting Platform

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google AI](https://img.shields.io/badge/Google%20Gemini-AI%20Powered-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

**🏆 Youth Solves for India 2026 - Hackathon Project**

**⚡ Built in 48 Hours at the NoBroker.com x Masai Hackathon**

> **🌐 Live Web App:** [https://civic-connect-8y5i.onrender.com](https://civic-connect-8y5i.onrender.com)

[🎬 Watch Live Demo](https://drive.google.com/file/d/12lENjr06F25Grao6IUu95HM4YCz_1BLo/view?usp=sharing)

> 📝 *Note: The demo video showcases an earlier version of the UI design. The current version features an updated frontend with improved aesthetics, but all core functionality remains the same. Additionally, Google Maps API integration has been added for real-time visualization of reported and resolved issue locations.*

### 👥 Team

**[Puranjay Gambhir](https://www.linkedin.com/in/puranjay-gambhir-a342221bb/)** · **Himanshu Gautre** · **MD Azaroddin**

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [The Problem We're Solving](#-the-problem-were-solving)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Admin Access & Credentials](#-admin-access--credentials)
- [Intended Users](#-intended-users)
- [Current Limitations](#-current-limitations)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 About the Project

**Civic Connect** is an AI-powered web application designed to bridge the gap between citizens and local government departments. It provides a streamlined, intuitive platform for reporting civic issues such as potholes, garbage accumulation, streetlight outages, and more.

Originally built in just **48 hours** at the **NoBroker.com x Masai Hackathon**, Civic Connect was created for the **Youth Solves for India 2026** initiative. Our mission is to transform civic engagement from a passive complaint into a proactive, transparent, and collaborative process—solving the problem of citizens not having a defined system to report local issues to the necessary government departments.

Civic Connect leverages modern web technologies and artificial intelligence to make civic engagement accessible, efficient, and transparent.

> ⚠️ **Note:** This is currently a **frontend-only application**. All data is stored in the browser's localStorage. Backend integration with a persistent database is planned for future development.

---

## 🎯 The Problem We're Solving

### The Challenge

In many cities across India and worldwide, citizens face significant barriers when trying to report civic issues:

- **Lack of Transparency:** Citizens have no visibility into the status of their complaints
- **Inefficient Communication:** Traditional methods (phone calls, physical visits) are time-consuming
- **No Accountability:** Issues often go unresolved with no tracking mechanism
- **Fragmented Systems:** Different departments operate in silos, causing confusion
- **Digital Divide:** Complex government portals discourage citizen participation

### Our Solution

Civic Connect addresses these challenges by providing:

- ✅ **One-stop platform** for reporting all civic issues
- ✅ **Real-time status tracking** with transparent updates
- ✅ **AI-powered assistance** for issue categorization and description
- ✅ **Department-specific routing** ensuring issues reach the right authorities
- ✅ **User-friendly interface** accessible to all demographics
- ✅ **Gamification elements** (leaderboards) to encourage civic participation

---

## ✨ Key Features

### For Citizens

| Feature | Description |
|---------|-------------|
| 📝 **Issue Reporting** | Submit civic issues with photos, location, and detailed descriptions |
| 🤖 **AI-Powered Descriptions** | Google Gemini AI helps generate clear, comprehensive issue descriptions |
| 📍 **Location Services** | Integrated Google Maps for precise issue location marking |
| 📊 **Issue Tracking** | Real-time status updates (Pending → In Progress → Resolved) |
| 🔔 **Notifications** | In-app and simulated email notifications for status changes |
| 🏆 **Leaderboard** | Community engagement through gamification |
| ⭐ **Feedback System** | Rate and provide feedback on resolved issues |

### For Administrators

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Admin Access** | Passkey-protected admin panels |
| 📈 **Analytics Dashboard** | Comprehensive statistics with charts (Bar, Line, Pie) |
| 🗂️ **Department Management** | Department-specific views and issue management |
| 📋 **Issue Management** | Update status, view details, and manage all reported issues |
| 📊 **Report Generation** | Visual reports for decision-making |

### General Features

- 🌙 **Dark Mode** - Modern dark-themed UI for comfortable viewing
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔒 **Secure Authentication** - User registration and login system
- 🔑 **Password Recovery** - Forgot password functionality with simulated email

---

## 🛠️ Technology Stack

### Frontend Framework & Libraries

| Technology | Purpose |
|------------|---------|
| **React 19.2** | UI component library |
| **TypeScript 5.8** | Type-safe JavaScript |
| **Vite 6.2** | Build tool and dev server |

### AI & APIs

| Technology | Purpose |
|------------|---------|
| **Google Gemini AI** | AI-powered issue description generation |
| **Google Maps API** | Location services and mapping |

### Styling

| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **Font Awesome** | Icon library |

### Data Storage (Current)

| Technology | Purpose |
|------------|---------|
| **localStorage** | Browser-based data persistence |

---

## 📁 Project Structure

```
Civic_Connect/
├── 📄 App.tsx                 # Main application component with routing
├── 📄 index.tsx               # Application entry point
├── 📄 index.html              # HTML template
├── 📄 types.ts                # TypeScript type definitions
├── 📄 constants.ts            # Application constants
├── 📄 vite.config.ts          # Vite configuration
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 package.json            # Dependencies and scripts
│
├── 📁 components/             # React components
│   ├── 📄 Home.tsx            # Landing page
│   ├── 📄 Login.tsx           # User login
│   ├── 📄 SignUp.tsx          # User registration
│   ├── 📄 IssueForm.tsx       # Issue submission form
│   ├── 📄 MyReports.tsx       # User's submitted issues
│   ├── 📄 Tracker.tsx         # Issue status tracker
│   ├── 📄 AdminDashboard.tsx  # Super admin dashboard
│   ├── 📄 AdminLogin.tsx      # Admin authentication
│   ├── 📄 AdminPasskey.tsx    # Passkey verification
│   ├── 📄 DepartmentLogin.tsx # Department admin login
│   ├── 📄 DepartmentReportView.tsx # Department-specific view
│   ├── 📄 PublicDashboard.tsx # Public statistics
│   ├── 📄 Leaderboard.tsx     # User engagement rankings
│   ├── 📄 MapVisualization.tsx # Issue map view
│   ├── 📄 NotificationsPage.tsx # User notifications
│   ├── 📄 FeedbackPage.tsx    # Issue feedback
│   ├── 📄 ForgotPassword.tsx  # Password recovery
│   ├── 📄 ResetPassword.tsx   # Password reset
│   ├── 📄 BarChart.tsx        # Bar chart component
│   ├── 📄 LineChart.tsx       # Line chart component
│   ├── 📄 PieChart.tsx        # Pie chart component
│   └── ... (other components)
│
├── 📁 services/               # Business logic services
│   ├── 📄 authService.ts      # Authentication logic
│   ├── 📄 issueService.ts     # Issue management
│   ├── 📄 reportService.ts    # Report generation
│   └── 📄 geminiService.ts    # Google Gemini AI integration
│
└── 📁 dist/                   # Production build output
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- **Google Gemini API Key** (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Puranjay2006/Civic_Connect.git
   cd Civic_Connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 📖 Usage Guide

### For Citizens

1. **Create an Account**
   - Click "Create an account" on the login page
   - Enter your username, email, and password
   - You'll be automatically logged in

2. **Report an Issue**
   - Click "Report Issue" from the home page
   - Fill in the issue title and description (or use AI to generate)
   - Select the category and department
   - Upload a photo (optional but recommended)
   - Mark the location on the map
   - Submit the issue

3. **Track Your Issues**
   - Navigate to "My Reports" to see all your submitted issues
   - Use the "Tracker" to check real-time status updates

4. **Provide Feedback**
   - Once an issue is resolved, you can rate and provide feedback

### For Administrators

1. **Access Admin Panel**
   - Click "Admin" in the navigation
   - Select your role (Super Admin or Department Admin)
   - Enter the appropriate passkey

2. **Manage Issues**
   - View all reported issues
   - Update issue status
   - Access analytics and reports

---

## 🔐 Admin Access & Credentials

### ⚠️ Security Notice

The following credentials are for **demonstration and development purposes only**. In a production environment, these should be stored securely and never exposed in documentation.

### Super Admin Access

| Credential | Value |
|------------|-------|
| **Passkey** | `ykls_764` |
| **Access Level** | Full access to all departments and system-wide analytics |

### Department Admin Access

Each department has its own unique passkey:

| Department | Passkey |
|------------|---------|
| Electrical | `ljn_9871` |
| Water | `ljn_9872` |
| Medical | `ljn_9873` |
| Sanitation | `ljn_9874` |
| Roads | `ljn_9875` |

### Admin Email Domain

Users with email addresses containing `@city.gov` are automatically granted admin privileges upon registration.

### How Passkeys Are Used

1. Navigate to the Admin section
2. Select your admin role (Super Admin or Department)
3. For Super Admin: Enter the super admin passkey
4. For Department Admin: Select your department and enter the corresponding passkey
5. Upon successful verification, you'll gain access to the respective dashboard

---

## 👥 Intended Users

| User Type | Description | Access Level |
|-----------|-------------|--------------|
| **Citizens** | General public who want to report civic issues | Submit issues, track status, provide feedback |
| **Super Admins** | Municipal officers with system-wide access | Full access to all features and analytics |
| **Department Admins** | Officials from specific departments | Access to department-specific issues and reports |
| **Community Leaders** | NGO workers, ward members | View public dashboards and analytics |

---

## ⚠️ Current Limitations

As this is a **frontend-only application**, please be aware of the following limitations:

1. **Data Persistence**
   - All data is stored in browser's localStorage
   - Data is lost if browser cache is cleared
   - Data is not shared across devices

2. **Authentication**
   - Simplified authentication (not production-ready)
   - Passwords are pseudo-hashed for demonstration
   - No actual email delivery (simulated notifications)

3. **Real-time Features**
   - No real-time updates across users
   - No push notifications

4. **Scalability**
   - localStorage has a 5-10MB limit
   - Not suitable for large-scale deployment without backend

---

## 🗺️ Future Roadmap

### Phase 1: Backend Integration
- [ ] Implement Node.js/Express or Python/Flask backend
- [ ] Set up PostgreSQL/MongoDB database
- [ ] Implement proper authentication with JWT
- [ ] Add real email notifications

### Phase 2: Enhanced Features
- [ ] Real-time updates with WebSockets
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Multi-language support (Hindi, regional languages)

### Phase 3: Advanced Capabilities
- [ ] Machine learning for issue prioritization
- [ ] Automated department routing
- [ ] Integration with government APIs
- [ ] Advanced analytics and reporting

### Phase 4: Scale & Deploy
- [ ] Cloud deployment (AWS/GCP/Azure)
- [ ] CDN integration
- [ ] Performance optimization
- [ ] Security audits

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📬 Contact

**Puranjay Gambhir**

- GitHub: [@Puranjay2006](https://github.com/Puranjay2006)
- Email: puranjay.gambhir@gmail.com
- Project Link: [https://github.com/Puranjay2006/Civic_Connect](https://github.com/Puranjay2006/Civic_Connect)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for Youth Solves for India 2026

</div>

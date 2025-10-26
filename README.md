<div align="center">
<img width="1200" height="475" alt="Civic Connect Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Civic Connect: Bridging Citizens and City Services with AI

**Civic Connect** is an innovative, serverless web application designed to empower citizens by providing a direct line to their local government. Users can report, track, and view resolutions for civic issues in their neighborhood, fostering transparency and community engagement. The platform features a public dashboard, a comprehensive admin panel for city officials, and is supercharged with the Google Gemini API for intelligent features like department suggestions, issue summaries, and a helpful chatbot.

View the web app in AI Studio: [https://ai.studio/apps/drive/1xgRTmexuUUBg38e9HHEpHiupx_lvUmV3](https://ai.studio/apps/drive/1xgRTmexuUUBg38e9HHEpHiupx_lvUmV3)

Deployment Link: [https://ai.studio/apps/drive/1xgRTmexuUUBg38e9HHEpHiupx_lvUmV3](https://civic-connect-862542138631.us-west1.run.app/#)

Find the Passkeys for the Department Admin and Super Admin here: [https://drive.google.com/file/d/1aNsTMCX-U0iK4aD-V8p2aB2XHDcJXGT4/view?usp=sharing](https://drive.google.com/file/d/1aNsTMCX-U0iK4aD-V8p2aB2XHDcJXGT4/view?usp=sharing)

---

## ✨ Key Features

- **📝 Effortless Issue Reporting:** Citizens can quickly report issues with a title, description, category, photo upload, and precise geolocation.
- **🤖 AI-Powered Department Routing:** Gemini automatically analyzes the issue's content to suggest the most appropriate city department, reducing administrative overhead.
- **💬 AI Chatbot for Status Updates:** A friendly Gemini-powered chatbot ("Casey") provides real-time, empathetic status updates for any reported issue using its unique ID.
- **📊 Public Transparency Dashboard:** A real-time dashboard displaying key metrics, department performance, locations of resolved issues, and a leaderboard of top contributing citizens.
- **👑 Comprehensive Admin Portal:**
    - **Multi-level Access:** Secure login portals for both "Super Admins" (city-wide view) and "Department Admins" (department-specific view).
    - **Issue Management:** Admins can view, filter, search, and update the status of issues.
    - **💡 AI-Generated Insights:** Gemini provides concise summaries of lengthy issue descriptions and generates actionable performance insights for departmental reports.
- **🔔 Simulated Notification System:** A sophisticated notification system that simulates both in-app alerts and email notifications for events like status changes, new issue assignments, and password resets.
- **🔐 Secure User Authentication:** A complete authentication flow including user sign-up, login, and a secure password reset process.

---

## 🛠️ Tech Stack & Architecture

This project is a modern, **serverless, client-side application** built with React, demonstrating the power of browser-based technologies for rapid, feature-rich prototyping.

-   **Frontend:** **React** & **TypeScript**
-   **Styling:** **Tailwind CSS**
-   **AI Integration:** **Google Gemini API** for all intelligent features.
-   **Data Persistence:** The application cleverly utilizes the browser's **`localStorage`** to simulate a backend and database. This approach enables full data persistence (users, issues, notifications) within the user's browser, making the application self-contained, easy to deploy, and perfect for a hackathon environment where speed and innovation are key.

---

## 🚀 Run Locally

This contains everything you need to run your app locally.

**Prerequisites:** Node.js

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set your Gemini API Key:**
    Create a file named `.env.local` in the root of the project and add your API key:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Run the app:**
    ```bash
    npm run dev
    ```
The application will be running on `http://localhost:5173`.

---

## 🔮 Future Scope

While `localStorage` is excellent for this prototype, a production-scale version would be architected with a dedicated backend and database.

-   **Backend:** Migrate to a robust backend framework like **Node.js + Express** or a Backend-as-a-Service (BaaS) like **Firebase/Supabase**.
-   **Database:** Implement a scalable database like **PostgreSQL** or a real-time NoSQL database like **Firebase Firestore**.
-   **Real-time Updates:** Use WebSockets or services like Firestore to push live data updates to all connected clients simultaneously.
-   **Cloud Storage:** Move image uploads from base64 strings in `localStorage` to a dedicated service like **Google Cloud Storage** or **AWS S3**.

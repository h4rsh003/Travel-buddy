<div align="center">

# ✈️ Travel Buddy
### Full-Stack Social Travel Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://travel-buddy-dusky-mu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Connect with like-minded companions and explore the world together.**

</div>

---

### 📖 Overview
**Travel Buddy** is a comprehensive full-stack platform designed for the modern traveler. It allows users to architect adventures, search for upcoming trips, and request to join journeys organized by others. The platform bridges the gap between solo traveling and social exploration through a secure, real-time ecosystem.

---

### ✨ Key Features

#### 🔐 Advanced Authentication
- **Secure Access:** Signup and Login powered by **NextAuth.js** and secure **JWT** implementation.
- **Stateless Verification:** Email-based **OTP Verification** for account creation via **Brevo**.
- **Security Logic:** Forgot Password workflow featuring time-limited, secure reset links.

#### 🌍 Trip Management
- **Creative Control:** Post detailed travel plans including budget, descriptions, and dates.
- **Smart Validation:** Integrated logic ensures trip dates are chronologically valid (no past-dated trips).
- **Discovery:** Advanced search and filtering by destination, status (Upcoming/Completed), or keywords.

#### 🤝 Interaction System
- **Join Requests:** Users can seamlessly request to join specific adventures.
- **Organizer Dashboard:** A real-time interface for trip creators to **Accept or Reject** join requests.
- **Live Status:** Real-time tracking for applicants to monitor their request status.

#### 🎨 Modern UI/UX
- **Responsive Design:** Mobile-first approach using **Tailwind CSS**.
- **Aesthetics:** Glassmorphism effects, dark/light mode support, and custom icons via **Lucide React**.

---

### 🛠️ Tech Stack

| **Frontend** | **Backend** | **Database & Cloud** |
| :--- | :--- | :--- |
| **Next.js 14** (App Router) | **Node.js** & **Express.js** | **PostgreSQL** (Neon Tech) |
| **TypeScript** | **TypeORM** (Relational Modeling) | **Render** (Backend Hosting) |
| **Zustand** (State Management) | **JWT** & **Bcrypt.js** | **Vercel** (Frontend Hosting) |
| **React Hook Form** + **Zod** | **Brevo** (Email Service) | **Postman** (API Testing) |

---

### 📂 Project Structure

[Image of a professional full-stack project directory structure showing separated frontend and backend folders]

```text
travel-buddy/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Auth, Trips, and Requests logic
│   │   ├── entities/      # TypeORM Database Models (User, Trip)
│   │   ├── routes/        # API Endpoints
│   │   ├── utils/         # Email sender (Brevo), error handling
│   │   └── index.ts       # Server entry point
│
├── frontend/
│   ├── app/               # Next.js App Router (Auth, Trips, Dashboard)
│   ├── components/        # Reusable UI (Navbar, Modals, Cards)
│   ├── hooks/             # Custom Hooks (useAxiosAuth)
│   └── store/             # Zustand Global State Management

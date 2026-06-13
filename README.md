# 📝 Academic MCQ Examination Portal

A secure, modern, full-stack online examination portal designed for schools and academic institutions. This platform divides users into **Teachers (Admins)** and **Students**, offering complete management and taking of multiple-choice question (MCQ) assessments. It enforces strict **one-attempt bounds** and features an **automatic grading and diagnostics engine** with real-time feedback.

---

## 🚀 Core Features

### 👤 User Authentication & Role Management
*   **Dual-Portal Design**: Separated administrative dashboard (teachers) and study portal (students).
*   **Secure Session Validation**: JWT-based session security with route protection.
*   **Role Guard**: Automatic middleware filtering on both client-side routes and server-side endpoints.

### 👩‍🏫 Teacher (Admin) Workspace
*   **Exam Builder**: Create exams with custom descriptions, titles, and timed limit durations.
*   **Dynamic Question Stack**: Add, modify, and delete multiple-choice questions (A, B, C, D) and nominate correct choices.
*   **Dashboard Insights**: Rich analytics panels tracking completed submissions, class average scores, and pass rates.
*   **Detailed Grading Reports**: Access student submission profiles and view an inline comparison sheet mapping their chosen answer against correct keys.

### 👨‍🎓 Student Portal
*   **Active Assessment Catalog**: View published exams with real-time indicators of completed versus available assessments.
*   **Secure Examination client**: Immersive test module equipped with a persistent countdown timer.
*   **Anti-Double Attempt Guards**: Strict locking boundaries; once started, refreshing or exiting the exam auto-calculates current work or enforces single-session integrity.
*   **Detailed Correction Sheets**: Instant post-submission grading displaying question-by-question reviews with highlighted incorrect and correct markers.
*   **Academic Profile Page**: Tracks personal metrics, historical assessments list, and running average percentages.

---

## 🛠 Tech Stack

### Frontend (User Interface)
*   **React 18** & **Vite**: Ultra-fast hot-rebuild SPA structure.
*   **CSS Style Utility**: Styled entirely with Tailwind CSS utility classes.
*   **Icons**: Lucide Icons library mapping standard, visually polished micro-graphics.
*   **Client Routes**: React Router (v6) mapping layouts and protected layouts.

### Backend (Server Logic & Persistent Storage)
*   **Node.js** & **Express**: Lightweight full-stack server architecture.
*   **MongoDB & Mongoose**: Durable document-oriented storage mapping schema validations for `User`, `Exam`, and `Submission` documents.
*   **JWT Security & Encrypted Handshakes**: Token validation checking credential matches.

---

## 📂 Codebase Architecture

```text
├── backend/
│   ├── src/
│   │   ├── config/            # Database initialization controls
│   │   ├── controllers/       # Route request handlers (Auth, Student, Admin controllers)
│   │   ├── middlewares/       # JWT auth & admin-role gatekeeper handlers
│   │   ├── models/            # Mongoose Schema declarations (User, Exam, Submission)
│   │   ├── routes/            # API endpoints mapping admin, student, and auth operations
│   │   └── app.ts             # Express main application setup and CORS injection
│   └── tsconfig.json          # Node TypeScript configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Layout shells (DashboardLayout, ProtectedRoute, etc.)
│   │   ├── context/           # React Auth Authentication context providers
│   │   ├── pages/             # Dynamic core application pages:
│   │   │   ├── admin/         # Exam builder, question stack builder, class performance records
│   │   │   ├── student/       # Assessment center, timed examination engine, student profile
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── services/          # Axios API communication services
│   │   ├── App.tsx            # Client Route index declarations
│   │   ├── index.html         # Main entry index
│   │   └── index.css          # Global CSS importing tailwind and font configurations
│   └── tsconfig.json          # Browser TypeScript configuration
│
├── server.ts                  # Production custom server and static host index
├── package.json               # Full-stack monorepo dependency configs
└── tsconfig.json              # Main workspace build targets
```

---

## 🛡 Academic Integrity Controls

1.  **Strict Anti-Duplication Rule**: Pre-generated unique compound indexes (`studentId` and `examId`) on MongoDB level ensure duplicate submission attempts are impossible.
2.  **Countdown Integrity Engine**: The browser testing client calculates a descending timer in seconds. Leaving the exam page does not reset or halt the timer countdown on the server.
3.  **Humble Visual Labels**: Avoids over-dramatic names or low-quality telemetry clutter. The portal uses clear, logical human labels prioritizing high-contrast legible UI grids.

---

## 📦 Local Installation & Setup

### Prerequisites
*   **Node.js** (v18 or higher recommended)
*   **MongoDB Instance** (Installed locally or a hosted Mongo Atlas URI)

### Step 1: Clone and Configure Environment
Copy `.env.example` into a new `.env` file at the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/exam-portal
JWT_SECRET=your_super_secret_jwt_string_key
```

### Step 2: Install Package Dependencies
From the repository root folder, install monorepo and server packages:
```bash
npm install
```

### Step 3: Launch in Development Mode
Execute local dev script which starts concurrent builds for the Express environment and Vite pipeline proxies:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`** to inspect the landing module.

---

## ⚡ Production Compilation

To bundle and compile files for high-performance hosting containers:
```bash
npm run build
```
Start the standalone production build by running:
```bash
npm run start
```

---

## 📊 Database Document Schema Layout

### **User Document**
*   `name`: Student or teacher's full display handle.
*   `email`: Credentials login.
*   `password`: Hashed credentials representation.
*   `role`: Level classification (`'admin'` | `'student'`).

### **Exam Document**
*   `title`: Assessed exam title.
*   `description`: Instructions block details.
*   `duration`: Clock limit bounds configuration (Minutes).
*   `questions`: Static array representing nested MCQ items containing:
    *   `questionText`, `options` (Choice A, B, C, D structures), and `correctAnswer`.

### **Submission Document**
*   `studentId`: Student mapping target.
*   `examId`: Reference exam.
*   `score`: Number of successfully resolved answers.
*   `totalQuestions`: Size of the question stack.
*   `percentage`: Computed grade percentage (Pass >= 50%).
*   `answers`: Active student inputs for each mapped question.

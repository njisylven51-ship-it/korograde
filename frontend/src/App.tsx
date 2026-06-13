import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CreateExam } from './pages/admin/CreateExam';
import { ManageExams } from './pages/admin/ManageExams';
import { ManageQuestions } from './pages/admin/ManageQuestions';
import { ResultsList } from './pages/admin/ResultsList';
import { StudentPerformance } from './pages/admin/StudentPerformance';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AvailableExams } from './pages/student/AvailableExams';
import { ExamInstructions } from './pages/student/ExamInstructions';
import { TakeExam } from './pages/student/TakeExam';
import { ResultPage } from './pages/student/ResultPage';
import { StudentProfile } from './pages/student/StudentProfile';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create-exam" element={<CreateExam />} />
            <Route path="/admin/manage-exams" element={<ManageExams />} />
            <Route path="/admin/exams/:examId/questions" element={<ManageQuestions />} />
            <Route path="/admin/results" element={<ResultsList />} />
            <Route path="/admin/results/details/:submissionId" element={<StudentPerformance />} />
          </Route>

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/exams" element={<AvailableExams />} />
            <Route path="/student/exams/:examId/instructions" element={<ExamInstructions />} />
            <Route path="/student/exams/:examId/take" element={<TakeExam />} />
            <Route path="/student/results/details/:resultId" element={<ResultPage />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default App;

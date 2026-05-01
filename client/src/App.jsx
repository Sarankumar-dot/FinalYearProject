import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AccessibilityInitializer } from "./components/AccessibilityInitializer";

// Pages
import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

// Student
import StudentLayout from "./pages/Student/StudentLayout";
import StudentDashboard from "./pages/Student/StudentDashboard";
import CourseBrowser from "./pages/Student/CourseBrowser";
import LessonViewer from "./pages/Student/LessonViewer";
import QuizPlayer from "./pages/Student/QuizPlayer";
import StudentProgress from "./pages/Student/StudentProgress";
import DocumentViewer from "./pages/Student/DocumentViewer";

// Teacher
import TeacherLayout from "./pages/Teacher/TeacherLayout";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import UploadLesson from "./pages/Teacher/UploadLesson";
import LessonManager from "./pages/Teacher/LessonManager";
import DocumentManager from "./pages/Teacher/DocumentManager";
import QuizBuilder from "./pages/Teacher/QuizBuilder";
import TeacherAnalytics from "./pages/Teacher/TeacherAnalytics";

// Admin
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import SignLangLibrary from "./pages/Admin/SignLangLibrary";

// Shared
import AccessibilitySettings from "./pages/Shared/AccessibilitySettings";

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to correct dashboard
    if (user.role === "student") return <Navigate to="/student" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
  }
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  if (user.role === "student") return <Navigate to="/student" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <AccessibilityInitializer>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<CourseBrowser />} />
            <Route path="lesson/:id" element={<LessonViewer />} />
            <Route path="quiz/:id" element={<QuizPlayer />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="settings" element={<AccessibilitySettings />} />
            <Route path="documents" element={<DocumentViewer />} />
          </Route>

          {/* Teacher */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="upload" element={<UploadLesson />} />
            <Route path="lessons" element={<LessonManager />} />
            <Route path="quiz/:lessonId" element={<QuizBuilder />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
            <Route path="settings" element={<AccessibilitySettings />} />
            <Route path="documents" element={<DocumentManager />} />
          </Route>

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="signlang" element={<SignLangLibrary />} />
            <Route path="settings" element={<AccessibilitySettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AccessibilityInitializer>
  );
}

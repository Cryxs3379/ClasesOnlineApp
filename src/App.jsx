import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LandingLayout from './layouts/LandingLayout';
import MainLayout from './layouts/MainLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRedirect from './pages/DashboardRedirect';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherCreateStudent from './pages/teacher/TeacherCreateStudent';
import TeacherStudentDetail from './pages/teacher/TeacherStudentDetail';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherCreateClass from './pages/teacher/TeacherCreateClass';
import TeacherCalendar from './pages/teacher/TeacherCalendar';
import TeacherMessages from './pages/teacher/TeacherMessages';
import TeacherDocuments from './pages/teacher/TeacherDocuments';
import TeacherAssignments from './pages/teacher/TeacherAssignments';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentClasses from './pages/student/StudentClasses';
import StudentCalendar from './pages/student/StudentCalendar';
import StudentMessages from './pages/student/StudentMessages';
import StudentDocuments from './pages/student/StudentDocuments';
import StudentAssignments from './pages/student/StudentAssignments';

import Classroom from './pages/Classroom';
import ClassroomRedirect from './pages/ClassroomRedirect';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<LandingLayout />}>
            <Route index element={<Home />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            <Route
              path="teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/students"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/students/new"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherCreateStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/students/:id"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherStudentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/classes"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/classes/new"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherCreateClass />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/calendar"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/messages"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/documents"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/assignments"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher/classroom/:id"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <Classroom />
                </ProtectedRoute>
              }
            />

            <Route
              path="student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/classes"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/calendar"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/messages"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/documents"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/assignments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/classroom/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Classroom />
                </ProtectedRoute>
              }
            />

            <Route path="my-classes" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="classroom/:id"
              element={
                <ProtectedRoute>
                  <ClassroomRedirect />
                </ProtectedRoute>
              }
            />
            <Route path="teachers" element={<Navigate to="/" replace />} />
            <Route path="teachers/:id" element={<Navigate to="/" replace />} />
            <Route path="teacher-profile" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

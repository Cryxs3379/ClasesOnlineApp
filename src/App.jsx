import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TeacherProfile from './pages/TeacherProfile';
import TeachersList from './pages/TeachersList';
import TeacherDetail from './pages/TeacherDetail';
import MyClasses from './pages/MyClasses';
import Classroom from './pages/Classroom';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="teachers" element={<TeachersList />} />
            <Route path="teachers/:id" element={<TeacherDetail />} />

            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher-profile"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-classes"
              element={
                <ProtectedRoute>
                  <MyClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="classroom/:id"
              element={
                <ProtectedRoute>
                  <Classroom />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

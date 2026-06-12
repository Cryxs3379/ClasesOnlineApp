import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Loading from '../components/Loading';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'teacher' || user.role === 'admin') {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  if (user.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

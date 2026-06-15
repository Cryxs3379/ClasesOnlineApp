import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Loading from '../components/Loading';

export default function ClassroomRedirect() {
  const { id } = useParams();
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'teacher' || user.role === 'admin') {
    return <Navigate to={`/teacher/classroom/${id}`} replace />;
  }

  if (user.role === 'student') {
    return <Navigate to={`/student/classroom/${id}`} replace />;
  }

  return <Navigate to="/login" replace />;
}

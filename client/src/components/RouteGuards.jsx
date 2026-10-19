import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from './Async.jsx';

export const homeFor = (user) => (user.role === 'teacher' ? '/teacher' : '/dashboard');

/** Only logged-in users (optionally only certain roles) can open the routes inside. */
export function RequireAuth({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

/** Login/register pages: logged-in users are sent to their home page instead. */
export function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? <Navigate to={homeFor(user)} replace /> : <Outlet />;
}

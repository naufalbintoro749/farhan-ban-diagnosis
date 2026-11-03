import { Navigate, Outlet } from 'react-router-dom';

/**
 * AuthGuard — protects all admin routes.
 * Reads `admin_token` from localStorage; if absent, redirects to /admin/login.
 * Otherwise renders the nested <Outlet />.
 */
export default function AuthGuard() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}

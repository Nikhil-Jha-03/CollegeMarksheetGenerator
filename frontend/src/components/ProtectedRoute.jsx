import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // make a loader which in center of screen

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-10 h-10 text-gray-600" />
    </div>
  }
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
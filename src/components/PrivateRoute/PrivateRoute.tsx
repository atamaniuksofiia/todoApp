import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { JSX } from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Завантаження...</p>;

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

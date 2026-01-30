import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";

export default function AdminRoute({ children }) {
  const user = getUserFromToken();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

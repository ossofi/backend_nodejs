import { Link, useLocation } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";

export default function AdminButton() {
  const user = getUserFromToken();
  const location = useLocation();

  if (!user || user.role !== "admin") return null;

  const isUserManagement = location.pathname === "/admin/users";

  return isUserManagement ? (
    <Link to="/" className="btn btn-admin">
      Back to main
    </Link>
  ) : (
    <Link to="/admin/users" className="btn btn-admin">
      User Management
    </Link>
  );
}

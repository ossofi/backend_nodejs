import React from "react";
import { useNavigate } from "react-router-dom";

  export default function LogoutButton({ onLogout }) {
    const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem("token");
      if (onLogout) onLogout(); // update App state
      navigate("/login", { replace: true });
    };
  
    return (
      <button className="btn btn-logout" onClick={handleLogout}>
        Logout
      </button>
    );    
  }
  
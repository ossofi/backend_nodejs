import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ArticleList from "./components/ArticleList";
import ArticleView from "./components/ArticleView";
import ArticleForm from "./components/ArticleForm";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import LogoutButton from "./components/LogoutButton";
import { initNotifications, onNotification } from "./notifications";
import "./App.css";
import AdminRoute from "./components/AdminRoute";
import UserManagement from "./pages/UserManagement";
import { Link } from "react-router-dom";
import { getUserFromToken } from "./utils/auth";
import AdminButton from "./components/AdminButton";

export default function App() {
  const [notifications, setNotifications] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const user = getUserFromToken();

  // Notifications
  useEffect(() => {
    initNotifications();
    const unsubscribe = onNotification((msg) => {
      setNotifications((prev) => [msg, ...prev]);
      setTimeout(
        () => setNotifications((prev) => prev.filter((n) => n !== msg)),
        4000
      );
    });
    return () => unsubscribe();
  }, []);

  // Update token if changed (login/logout)
  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <Router>
      {/* Header */}
      {token && (
        <div className="header">
          <AdminButton />
          <LogoutButton onLogout={() => setToken(null)} />
        </div>
      )}



      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map((n, i) => (
          <div key={i} className="notification">
            {n.type === "attachment"
              ? `New attachment on "${n.title}"`
              : n.type === "edited"
                ? `"${n.title}" edited`
                : `"${n.title}" created`}
          </div>
        ))}
      </div>

      <Routes>
        {/* Root */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ArticleList />
            </ProtectedRoute>
          }
        />

        {/* Public */}
        <Route
          path="/login"
          element={
            <Login onLogin={() => setToken(localStorage.getItem("token"))} />
          }
        />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/article/:id"
          element={
            <ProtectedRoute>
              <ArticleView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new"
          element={
            <ProtectedRoute>
              <ArticleForm mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <ArticleForm mode="edit" />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to={token ? "/" : "/login"} replace />}
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

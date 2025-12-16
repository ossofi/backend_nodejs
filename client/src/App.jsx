import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ArticleList from "./components/ArticleList";
import ArticleView from "./components/ArticleView";
import ArticleForm from "./components/ArticleForm";
import { initNotifications, onNotification } from "./notifications";
import "./App.css";

export default function App() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    initNotifications();
    const unsubscribe = onNotification((msg) => {
      setNotifications(prev => [msg, ...prev]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n !== msg)), 4000);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
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
        <Route path="/" element={<ArticleList />} />
        <Route path="/article/:id" element={<ArticleView />} />
        <Route path="/new" element={<ArticleForm mode="create" />} />
        <Route path="/edit/:id" element={<ArticleForm mode="edit" />} />
      </Routes>
    </Router>
  );
}

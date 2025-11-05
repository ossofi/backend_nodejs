import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ArticleList from "./components/ArticleList.jsx";
import ArticleView from "./components/ArticleView.jsx";
import ArticleForm from "./components/ArticleForm.jsx";

import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ArticleList />} />
        <Route path="/article/:id" element={<ArticleView />} />
        <Route path="/new" element={<ArticleForm mode="create" />} />
        <Route path="/edit/:id" element={<ArticleForm mode="edit" />} />
      </Routes>
    </Router>
  );
}

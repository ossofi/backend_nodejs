import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createArticle } from "../api.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function ArticleForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    createArticle({ title, content })
      .then(res => navigate(`/article/${res.data.data.id}`))
      .catch(err => console.error(err));
  };

  return (
    <div className="container">
      <h2>New Article</h2>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
        <label>Content:</label>
        <ReactQuill ref={quillRef} value={content} onChange={setContent} />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

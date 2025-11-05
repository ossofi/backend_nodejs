import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createArticle, getArticle, updateArticle } from "../api.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../App.css";

export default function ArticleForm({ mode = "create" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const quillRef = useRef(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      getArticle(id).then(res => {
        const art = res.data.data;
        setTitle(art.title);
        setContent(art.content);
      }).catch(err => console.error(err));
    }
  }, [mode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Both title and content are required.");
      return;
    }

    try {
      if (mode === "create") {
        const res = await createArticle({ title, content });
        navigate(`/article/${res.data.data.id}`);
      } else {
        const res = await updateArticle(id, { title, content });
        navigate(`/article/${res.data.data.id}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="form-container">
      <h2>{mode === "edit" ? "Edit Article" : "New Article"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="article-form">
        <label>Title:</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />

        <label>Content:</label>
        <ReactQuill ref={quillRef} value={content} onChange={setContent} className="editor" />

        <div className="button-group">
          <button type="submit" className="btn-primary">
            {mode === "edit" ? "Save" : "Create"}
          </button>
          <button type="button" onClick={() => navigate("/")} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

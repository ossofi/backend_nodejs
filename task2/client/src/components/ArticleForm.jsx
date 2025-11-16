// src/components/ArticleForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createArticle, getArticle, updateArticle, uploadAttachments } from "../api.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../App.css";

export default function ArticleForm({ mode = "create" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const quillRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && id) {
      getArticle(id)
        .then((res) => {
          const art = res.data.data;
          setTitle(art.title || "");
          setContent(art.content || "");
        })
        .catch((err) => console.error(err));
    }
  }, [mode, id]);

  const onFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleAttachUpload = async (articleId) => {
    if (!files || files.length === 0) return [];

    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"];
    for (const f of files) {
      const ext = f.name.slice(((f.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
      if (!allowed.includes("." + ext)) {
        throw new Error("Invalid file type. Allowed: JPG, PNG, GIF, WEBP, PDF.");
      }
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("attachments", f));

    const res = await uploadAttachments(articleId, formData);
    return res.data.data || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!title.trim() || !content.trim()) {
        setError("Both title and content are required.");
        setIsSubmitting(false);
        return;
      }

      let articleRes;
      if (mode === "create") {
        articleRes = await createArticle({ title, content });
      } else {
        articleRes = await updateArticle(id, { title, content });
      }

      const articleId = articleRes.data.data.id;
      try {
        await handleAttachUpload(articleId);
      } catch (uploadErr) {
        console.error("Upload error:", uploadErr);
        setError(uploadErr.response?.data?.error || uploadErr.message || "Failed to upload attachments.");
        setIsSubmitting(false);
        navigate(`/article/${articleId}`);
        return;
      }

      navigate(`/article/${articleId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{mode === "edit" ? "Edit Article" : "New Article"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="article-form">
        <label>Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Content:</label>
        <ReactQuill ref={quillRef} value={content} onChange={setContent} className="editor" />

        <label>Attachments (images or PDF):</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          multiple
          onChange={onFilesChange}
        />
        {files && files.length > 0 && (
          <div className="selected-files">
            <strong>Selected files:</strong>
            <ul>
              {files.map((f, i) => (
                <li key={i}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
              ))}
            </ul>
          </div>
        )}

        <div className="button-group">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (mode === "edit" ? "Saving..." : "Creating...") : mode === "edit" ? "Save" : "Create"}
          </button>
          <button type="button" onClick={() => navigate("/")} className="btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

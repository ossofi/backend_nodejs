import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createArticle, getArticle, updateArticle, uploadAttachments } from "../api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import WorkspaceSelector from "./WorkspaceSelector";

const SERVER_URL = "http://localhost:5050";

export default function ArticleForm({ mode = "create" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [files, setFiles] = useState([]);
  const [attachmentsPreview, setAttachmentsPreview] = useState([]); // for immediate preview
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch article for edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      getArticle(id)
        .then((art) => {
          setTitle(art.title || "");
          setContent(art.content || "");
          setWorkspaceId(art.workspaceId || "");
          // show existing attachments
          setAttachmentsPreview(
            (art.attachments || []).map((a) => ({
              ...a,
              previewUrl: `${SERVER_URL}${a.url}`,
            }))
          );
        })
        .catch(console.error);
    }
  }, [mode, id]);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Add preview URLs for image files
    const newPreviews = selectedFiles.map((f) => ({
      id: `new-${f.name}-${Date.now()}`,
      originalName: f.name,
      mimeType: f.type,
      previewUrl: URL.createObjectURL(f),
      isNew: true,
    }));
    setAttachmentsPreview((prev) => [...prev, ...newPreviews]);
  };

  const handleAttachments = async (articleId) => {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((f) => formData.append("attachments", f));
    return uploadAttachments(articleId, formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      setIsSubmitting(false);
      return;
    }
    if (!workspaceId) {
      setError("Workspace is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      let articleRes;
      if (mode === "create") {
        articleRes = await createArticle({ title, content, workspaceId });
      } else {
        articleRes = await updateArticle(id, { title, content, workspaceId });
      }

      const uploadedAttachments = await handleAttachments(articleRes.id);

      // Refresh article view with all attachments
      const refreshedArticle = await getArticle(articleRes.id);

      // Update preview list to show uploaded attachments
      setAttachmentsPreview(
        (refreshedArticle.attachments || []).map((a) => ({
          ...a,
          previewUrl: `${SERVER_URL}${a.url}`,
        }))
      );

      navigate(`/article/${articleRes.id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{mode === "edit" ? "Edit Article" : "New Article"}</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Content:</label>
        <ReactQuill ref={quillRef} value={content} onChange={setContent} />

        <label>Attachments:</label>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          onChange={handleFilesChange}
        />

        {attachmentsPreview.length > 0 && (
          <div className="attachments-preview">
            <ul>
              {attachmentsPreview.map((a) => {
                const isImage = a.mimeType.startsWith("image/");
                return (
                  <li key={a.id}>
                    {isImage ? (
                      <img
                        src={a.previewUrl}
                        alt={a.originalName}
                        style={{
                          maxWidth: "200px",
                          display: "block",
                          marginBottom: 10,
                        }}
                      />
                    ) : (
                      <a href={a.previewUrl} target="_blank" rel="noopener noreferrer">
                        {a.originalName}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <label>Workspace:</label>
        <WorkspaceSelector value={workspaceId} onChange={setWorkspaceId} />

        <button className="btn" type="submit" disabled={isSubmitting}>
          {mode === "edit" ? "Save" : "Create"}
        </button>
      </form>
    </div>
  );
}

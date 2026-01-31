import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getArticle,
  updateArticle,
  deleteArticle,
  uploadAttachments,
  postComment,
  updateComment,
  deleteComment,
  getWorkspaces,
  getArticleVersions
} from "../api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import WorkspaceSelector from "./WorkspaceSelector";
import { getUserFromToken, getToken } from "../utils/auth";

const SERVER_URL = "http://localhost:3000";

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [article, setArticle] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentContent, setCommentContent] = useState("");

  const [versions, setVersions] = useState([]);
  const [viewingVersion, setViewingVersion] = useState(null);

  const user = getUserFromToken(); // logged-in user

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getArticle(id);
        setArticle(data);
        setTitle(data.title);
        setContent(data.content);
        setWorkspaceId(data.workspaceId);

        const wsList = await getWorkspaces();
        setWorkspaces(wsList);

        const versionsList = await getArticleVersions(id);
        setVersions(versionsList);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const canEditOrDelete = user && (user.role === "admin" || user.id === article?.createdBy);

  const handleFilesChange = (e) => setFiles(Array.from(e.target.files));

  const handleAttachments = async (articleId) => {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((f) => formData.append("attachments", f));
    return uploadAttachments(articleId, formData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateArticle(id, { title, content, workspaceId });
      await handleAttachments(id);
      const refreshed = await getArticle(id);
      setArticle(refreshed);
      setEditMode(false);
      setFiles([]);
      // Refresh versions after save
      const versionsList = await getArticleVersions(id);
      setVersions(versionsList);
      setViewingVersion(null);
    } catch (err) {
      alert(err.message || "Failed to save changes");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await deleteArticle(id);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete article");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const data = await addComment(id, newComment);
      setArticle((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), data],
      }));
      setNewComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!commentContent.trim()) return;
    try {
      await updateComment(commentId, commentContent);
      const refreshed = await getArticle(id);
      setArticle(refreshed);
      setEditingCommentId(null);
      setCommentContent("");
    } catch (err) {
      console.error(err);
      alert("Failed to edit comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete comment?")) return;
    try {
      await deleteComment(commentId);
      const refreshed = await getArticle(id);
      setArticle(refreshed);
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
    }
  };

  const handleExportPDF = async () => {
    const token = getToken();
    if (!token) {
      alert("You must be logged in to export PDF");
      return;
    }

    try {
      console.log("Export token:", token); // Debug
      const response = await fetch(`${SERVER_URL}/api/articles/${id}/export`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to export PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${article.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!article) return <p>Article not found</p>;

  const displayTitle = viewingVersion ? viewingVersion.title : title;
  const displayContent = viewingVersion ? viewingVersion.content : content;
  const workspaceName = workspaces.find((w) => w.id === article.workspaceId)?.name || "Unknown";

  return (
    <div className="article-view">
      <button className="btn" onClick={() => navigate("/")} style={{ marginBottom: 20 }}>
        ← Back to Articles
      </button>

      <div style={{ marginBottom: 20 }}>
        {editMode && !viewingVersion ? (
          <>
            <label>Workspace:</label>
            <WorkspaceSelector value={workspaceId} onChange={setWorkspaceId} />
          </>
        ) : (
          <p>
            <strong>Workspace:</strong> {workspaceName}
          </p>
        )}
      </div>

      {/* Versions Panel */}
      {versions.length > 0 && (
        <div>
          <h3>Previous Versions</h3>
          <ul className="versions-list">
            {versions.map((v) => (
              <li key={v.id}>
                <button
                  className={`version-btn ${viewingVersion?.id === v.id ? "active" : ""}`}
                  onClick={() => setViewingVersion(v)}
                  disabled={viewingVersion?.id === v.id}
                >
                  Version {v.versionNumber} - {new Date(v.createdAt).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
          {viewingVersion && (
            <button onClick={() => setViewingVersion(null)} className="back-current-btn">
              Back to current version
            </button>
          )}
        </div>
      )}

      {editMode && !viewingVersion && canEditOrDelete ? (
        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            style={{ width: "100%", marginBottom: 10 }}
          />
          <ReactQuill ref={quillRef} value={content} onChange={setContent} />

          <label>Attachments:</label>
          <input
            type="file"
            name="attachments"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
          {files.length > 0 && (
            <ul>
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}

          <button onClick={handleSave} disabled={saving}>Save</button>
          <button onClick={() => setEditMode(false)} disabled={saving}>Cancel</button>
        </div>
      ) : (
        <div>
          <h2>{displayTitle}</h2>
          <div dangerouslySetInnerHTML={{ __html: displayContent }} />

          {article.attachments?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>Attachments</h3>
              <ul>
                {article.attachments.map((a) => {
                  const isImage = a.mimeType.startsWith("image/");
                  const fileUrl = `${SERVER_URL}${a.url}`;
                  return (
                    <li key={a.id}>
                      {isImage ? (
                        <img
                          src={fileUrl}
                          alt={a.originalName}
                          style={{ maxWidth: 300, display: "block", marginBottom: 10 }}
                        />
                      ) : (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                          {a.originalName}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            {/* Only show Edit/Delete to admin or creator */}
            {!viewingVersion && canEditOrDelete && (
              <>
                <button className="btn" onClick={() => setEditMode(true)}>Edit</button>
                <button className="btn" onClick={handleDelete} style={{ marginLeft: 10 }}>Delete</button>
              </>
            )}

            {/* Show Export button to any logged-in user */}
            {user && (
              <button className="btn" onClick={handleExportPDF} style={{ marginLeft: canEditOrDelete ? 10 : 0 }}>
                Export as PDF
              </button>
            )}
          </div>

          {/* Comments Section */}
          {!viewingVersion && (
            <div className="comments-section">
              <h3>Comments</h3>

              <div className="comment-input">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                />
                <button onClick={handleAddComment}>Add Comment</button>
              </div>

              <ul className="comments-list">
                {article.comments?.map((c) => (
                  <li key={c.id} className="comment-card">
                    <div className="comment-content">
                      {editingCommentId === c.id ? (
                        <div className="comment-edit-input">
                          <input
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                          />
                          <button onClick={() => handleUpdateComment(c.id)}>Save</button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setCommentContent("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="comment-text">{c.content}</div>
                      )}
                      <div className="comment-header">
                        {new Date(c.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {editingCommentId !== c.id && (
                      <div className="comment-actions">
                        <button
                          className="edit"
                          onClick={() => {
                            setEditingCommentId(c.id);
                            setCommentContent(c.content);
                          }}
                        >
                          Edit
                        </button>
                        <button className="delete" onClick={() => handleDeleteComment(c.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      )}
    </div>
  )
}

import axios from "axios";

const API_BASE = "http://localhost:5050/api";
const ARTICLES_URL = `${API_BASE}/articles`;
const WORKSPACES_URL = `${API_BASE}/workspaces`;

const handleRequest = async (request) => {
  try {
    const response = await request();
    return response.data?.data ?? response.data;
  } catch (err) {
    if (err.response) {
      throw new Error(err.response.data?.error || `Request failed with status ${err.response.status}`);
    } else if (err.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(err.message);
    }
  }
};

/* WORKSPACES */
export const getWorkspaces = () => handleRequest(() => axios.get(WORKSPACES_URL));
export const createWorkspace = (name) => handleRequest(() => axios.post(WORKSPACES_URL, { name }));

/* ARTICLES */
export const getArticles = (workspaceId) => {
  if (!workspaceId) throw new Error("workspaceId is required");
  return handleRequest(() => axios.get(`${ARTICLES_URL}?workspaceId=${workspaceId}`));
};

export const getArticle = (id) => {
  if (!id) throw new Error("Article ID is required");
  return handleRequest(() => axios.get(`${ARTICLES_URL}/${id}`));
};

export const createArticle = (data) => {
  if (!data.workspaceId) throw new Error("workspaceId is required");
  return handleRequest(() => axios.post(ARTICLES_URL, data));
};

export const updateArticle = (id, data) => {
  if (!id) throw new Error("Article ID is required");
  if (!data.workspaceId) throw new Error("workspaceId is required");
  return handleRequest(() => axios.put(`${ARTICLES_URL}/${id}`, data));
};

export const deleteArticle = async (id) => {
  const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Server error");
  return res.json();
};


/* COMMENTS */
export const postComment = (articleId, content) => {
  if (!articleId) throw new Error("Article ID is required");
  if (!content || !content.trim()) throw new Error("Comment cannot be empty");
  return handleRequest(() =>
    axios.post(`${ARTICLES_URL}/${articleId}/comments`, { content })
  );
};

export const updateComment = (commentId, content) => {
  if (!commentId) throw new Error("Comment ID is required");
  if (!content || !content.trim()) throw new Error("Comment cannot be empty");
  return handleRequest(() =>
    axios.put(`${ARTICLES_URL}/comments/${commentId}`, { content })
  );
};

export const deleteComment = (commentId) => {
  if (!commentId) throw new Error("Comment ID is required");
  return handleRequest(() =>
    axios.delete(`${ARTICLES_URL}/comments/${commentId}`)
  );
};

/* ATTACHMENTS */
export const uploadAttachments = (articleId, formData) => {
  if (!articleId) throw new Error("Article ID is required");
  return handleRequest(() =>
    axios.post(`${ARTICLES_URL}/${articleId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export default {
  getWorkspaces,
  createWorkspace,
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  postComment,
  updateComment,
  deleteComment,
  uploadAttachments,
};

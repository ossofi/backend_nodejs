import axios from "axios";

const API_BASE = "/api";

// Axios instance with JWT interceptor

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Shared request handler

const handleRequest = async (request) => {
  try {
    const response = await request();
    return response.data?.data ?? response.data;
  } catch (err) {
    if (err.response) {
      throw new Error(
        err.response.data?.error ||
          `Request failed with status ${err.response.status}`
      );
    } else if (err.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(err.message);
    }
  }
};

// Workspaces

export const getWorkspaces = () =>
  handleRequest(() => api.get("/workspaces"));

export const createWorkspace = (name) => {
  if (!name?.trim()) throw new Error("Workspace name is required");
  return handleRequest(() =>
    api.post("/workspaces", { name: name.trim() })
  );
};

// Articles

export const getArticles = (workspaceId) => {
  if (!workspaceId) throw new Error("workspaceId is required");
  return handleRequest(() =>
    api.get("/articles", { params: { workspaceId } })
  );
};

export const getArticle = (id) => {
  if (!id) throw new Error("Article ID is required");
  return handleRequest(() => api.get(`/articles/${id}`));
};

export const createArticle = (data) => {
  if (!data?.workspaceId) throw new Error("workspaceId is required");
  return handleRequest(() => api.post("/articles", data));
};

export const updateArticle = (id, data) => {
  if (!id) throw new Error("Article ID is required");
  if (!data?.workspaceId) throw new Error("workspaceId is required");
  return handleRequest(() =>
    api.put(`/articles/${id}`, data)
  );
};

export const deleteArticle = (id) => {
  if (!id) throw new Error("Article ID is required");
  return handleRequest(() =>
    api.delete(`/articles/${id}`)
  );
};

// Article Versions

export const getArticleVersions = (articleId) => {
  if (!articleId) throw new Error("Article ID is required");
  return handleRequest(() =>
    api.get(`/articles/${articleId}/versions`)
  );
};

// Comments

export const postComment = (articleId, content) => {
  if (!content?.trim()) throw new Error("Comment content is required");
  return handleRequest(() =>
    api.post(`/articles/${articleId}/comments`, { content })
  );
};

export const updateComment = (commentId, content) => {
  if (!content?.trim()) throw new Error("Comment content is required");
  return handleRequest(() =>
    api.put(`/articles/comments/${commentId}`, { content })
  );
};

export const deleteComment = (commentId) => {
  if (!commentId) throw new Error("Comment ID is required");
  return handleRequest(() =>
    api.delete(`/articles/comments/${commentId}`)
  );
};


// Attachments

export const uploadAttachments = (articleId, formData) => {
  if (!articleId) throw new Error("Article ID is required");
  return handleRequest(() =>
    api.post(`/articles/${articleId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};


// Authentication


export const loginUser = (email, password) => {
  if (!email || !password) throw new Error("Email and password are required");
  return handleRequest(() =>
    api.post("/auth/login", { email, password })
  );
};

export const registerUser = (email, password) => {
  if (!email || !password) throw new Error("Email and password are required");
  return handleRequest(() =>
    api.post("/auth/register", { email, password })
  );
};

// Users (Admin only)

export const getUsers = () =>
  handleRequest(() => api.get("/users"));

export const updateUserRole = (id, role) => {
  if (!id) throw new Error("User ID is required");
  if (!["admin", "user"].includes(role)) {
    throw new Error("Invalid role");
  }

  return handleRequest(() =>
    api.put(`/users/${id}/role`, { role })
  );
};

// Search articles by title or content within a workspace

export const searchArticles = (workspaceId, query) => {
  if (!workspaceId) throw new Error("workspaceId is required");
  if (!query?.trim()) return getArticles(workspaceId); // fallback to all articles

  return handleRequest(() =>
    api.get("/articles/search", {
      params: { workspaceId, q: query.trim() },
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
  getArticleVersions,
  postComment,
  updateComment,
  deleteComment,
  uploadAttachments,
  loginUser,
  registerUser,
  getUsers,
  updateUserRole,
  searchArticles,
};

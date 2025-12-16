import axios from "axios";

const API_BASE = "http://localhost:3000/api";

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

/* workspaces */
export const getWorkspaces = () =>
  handleRequest(() => axios.get(`${API_BASE}/workspaces`));

export const createWorkspace = (name) =>
  handleRequest(() =>
    axios.post(`${API_BASE}/workspaces`, { name: name.trim() })
  );

/* articles */
export const getArticles = (workspaceId) => {
  if (!workspaceId) throw new Error("workspaceId is required");
  return handleRequest(() =>
    axios.get(`${API_BASE}/articles`, { params: { workspaceId } })
  );
};

export const getArticle = (id) => {
  if (!id) throw new Error("Article ID is required");
  return handleRequest(() => axios.get(`${API_BASE}/articles/${id}`));
};

export const createArticle = (data) => {
  if (!data.workspaceId) throw new Error("workspaceId is required");
  return handleRequest(() => axios.post(`${API_BASE}/articles`, data));
};

export const updateArticle = (id, data) => {
  if (!id) throw new Error("Article ID is required");
  if (!data.workspaceId) throw new Error("workspaceId is required");
  return handleRequest(() =>
    axios.put(`${API_BASE}/articles/${id}`, data)
  );
};

export const deleteArticle = (id) => {
  if (!id) throw new Error("Article ID is required");
  return handleRequest(() =>
    axios.delete(`${API_BASE}/articles/${id}`)
  );
};

/* comments */
export const postComment = (articleId, content) =>
  handleRequest(() =>
    axios.post(`${API_BASE}/articles/${articleId}/comments`, { content })
  );

export const updateComment = (commentId, content) =>
  handleRequest(() =>
    axios.put(`${API_BASE}/articles/comments/${commentId}`, { content })
  );

export const deleteComment = (commentId) =>
  handleRequest(() =>
    axios.delete(`${API_BASE}/articles/comments/${commentId}`)
  );

/* attachments */
export const uploadAttachments = (articleId, formData) =>
  handleRequest(() =>
    axios.post(`${API_BASE}/articles/${articleId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );


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

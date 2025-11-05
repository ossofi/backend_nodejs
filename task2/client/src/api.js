import axios from "axios";

const API_URL = "http://localhost:5050/api/articles";

export const getArticles = () => axios.get(API_URL);
export const getArticle = (id) => axios.get(`${API_URL}/${id}`);
export const createArticle = (data) => axios.post(API_URL, data);
export const updateArticle = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteArticle = (id) => axios.delete(`${API_URL}/${id}`);

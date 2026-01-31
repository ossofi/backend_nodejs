import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles, searchArticles, getWorkspaces } from "../api.js";
import WorkspaceSelector from "./WorkspaceSelector";
import { getUserFromToken } from "../utils/auth";
import SearchBar from "./SearchBar";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = getUserFromToken(); // { id, email, role }

  // Load workspaces & auto-select first
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const res = await getWorkspaces();
        setWorkspaces(res.data || []);
        if (res.data && res.data.length > 0 && !workspaceId) {
          setWorkspaceId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadWorkspaces();
  }, []);

  // Unified function for fetching articles
  const loadArticles = async (query = "") => {
    if (!workspaceId) return;

    setLoading(true);
    setError(null);

    try {
      const res = query.trim()
        ? await searchArticles(workspaceId, query)
        : await getArticles(workspaceId);

      const articlesArray = Array.isArray(res) ? res : res?.data || [];

      setArticles(
        articlesArray.map(a => ({
          id: a.id,
          title: a.title,
          createdBy: a.createdBy,
          workspaceId: a.workspaceId,
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  // Fetch articles when workspace changes
  useEffect(() => {
    if (workspaceId) loadArticles();
  }, [workspaceId]);

  return (
    <div className="container">
      <h2>Articles</h2>

      <WorkspaceSelector value={workspaceId} onChange={setWorkspaceId} />

      <SearchBar onSearch={(q) => loadArticles(q)} />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && articles.length === 0 && <p>No articles found.</p>}

      <ul>
        {articles.map(a => {
          if (!a.id) return null;
          const canEditOrDelete = user && (user.role === "admin" || user.id === a.createdBy);
          return (
            <li key={a.id} className="article-item">
              <Link to={`/article/${a.id}`} className="article-link">{a.title}</Link>
              {canEditOrDelete && (
                <div className="article-actions">
                  <Link to={`/edit/${a.id}`} className="btn btn-secondary">Edit</Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Link to="/new" style={{ display: "inline-block", marginTop: 20 }}>
        Create New Article
      </Link>
    </div>
  );
}

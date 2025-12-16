import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles } from "../api.js";
import WorkspaceSelector from "./WorkspaceSelector";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!workspaceId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getArticles(workspaceId);
        setArticles(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [workspaceId]);

  return (
    <div className="container">
      <h2>Articles</h2>

      {/* workspace dropdown */}
      <WorkspaceSelector value={workspaceId} onChange={setWorkspaceId} />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && articles.length === 0 && <p>No articles found.</p>}

      <ul>
        {articles.map((a) => (
          <li key={a.id} className="article-item">
            <Link to={`/article/${a.id}`} className="article-link">{a.title}</Link>
            <div className="article-actions">
              <Link to={`/edit/${a.id}`} className="btn btn-secondary">Edit</Link>
            </div>
          </li>
        ))}
      </ul>

      <Link to="/new" style={{ display: "inline-block", marginTop: 20 }}>
        Create New Article
      </Link>
    </div>
  );
}

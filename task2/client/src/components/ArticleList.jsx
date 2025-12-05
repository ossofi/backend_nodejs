import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles, deleteArticle } from "../api.js";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [workspaceId, setWorkspaceId] = useState(1); // default workspace
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
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

  useEffect(() => {
    fetchArticles();
  }, [workspaceId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete article");
    }
  };

  return (
    <div className="container">
      <div style={{ marginTop: 20 }}>
        <button onClick={() => setWorkspaceId(1)}>Workspace 1</button>
        <button onClick={() => setWorkspaceId(2)}>Workspace 2</button>
        <button onClick={() => setWorkspaceId(3)}>Workspace 3</button>
      </div>

      <h2>Articles in Workspace {workspaceId}</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && articles.length === 0 && <p>No articles found.</p>}

      <ul>
  {articles.map((a) => (
    <li key={a.id} className="article-item">
      <Link to={`/article/${a.id}`} className="article-link">
        {a.title}
      </Link>
      <div className="article-actions">
        <Link to={`/edit/${a.id}`} className="btn btn-secondary">Edit</Link>
        <button onClick={() => handleDelete(a.id)} className="btn btn-primary">Delete</button>
      </div>
    </li>
  ))}
</ul>


      <Link to="/new" style={{ display: "inline-block", marginTop: 20 }}>Create New Article</Link>
    </div>
  );
}

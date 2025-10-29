import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles } from "../api.js";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    getArticles()
      .then(res => setArticles(res.data.data || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div className="container">
  <h2>All Articles</h2>
  <ul>
    {articles.map(a => (
      <li key={a.id}>
        <Link to={`/article/${a.id}`} className="article-button">{a.title}</Link>
      </li>
    ))}
  </ul>
  <Link to="/new" className="button">Create New Article</Link>
</div>

    </div>
  );
}

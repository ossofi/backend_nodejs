import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getArticle, deleteArticle } from "../api.js";

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    getArticle(id)
      .then(res => setArticle(res.data.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Удалить эту статью?")) {
      try {
        await deleteArticle(id);
        navigate("/");
      } catch (err) {
        console.error(err);
        alert("Не удалось удалить статью");
      }
    }
  };

  const handleEdit = () => navigate(`/edit/${id}`);

  if (!article) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>{article.title}</h2>
      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
      <div className="button-group">
        <button onClick={handleEdit} className="btn-primary">Edit</button>
        <button onClick={handleDelete} className="btn-danger">Delete</button>
        <Link to="/" className="btn-secondary">Back</Link>
      </div>
    </div>
  );
}

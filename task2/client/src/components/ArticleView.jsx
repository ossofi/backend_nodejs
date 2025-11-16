import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getArticle, deleteArticle } from "../api.js";

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    getArticle(id)
      .then((res) => setArticle(res.data.data))
      .catch((err) => console.error(err));
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

  const openUrl = (url) => {
    const full = url.startsWith("http") ? url : `http://localhost:5050${url}`;
    window.open(full, "_blank", "noopener,noreferrer");
  };  

  return (
    <div className="container">
      <h2>{article.title}</h2>

      {article.attachments && article.attachments.length > 0 && (
  <div className="attachments">
    <h4>Attachments</h4>
    <div className="attachment-list">
      {article.attachments.map((a) => {
        const isImage = a.mimeType.startsWith("image/");
        const fileUrl = encodeURI(a.url.startsWith("http") ? a.url : `http://localhost:5050${a.url}`);

        return (
          <div key={a.id} className="attachment-item">
            {isImage ? (
              <div className="thumb-wrapper" onClick={() => openUrl(a.url)} role="button" tabIndex={0}>
                <img src={fileUrl} alt="" className="attachment-thumb" />
              </div>
            ) : (
              <div className="file-wrapper">
                <button className="attachment-link" onClick={() => openUrl(a.url)}>
                  {a.mimeType.split("/")[1].toUpperCase()} File
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}

      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

      <div className="button-group">
        <button onClick={handleEdit} className="btn-primary">Edit</button>
        <button onClick={handleDelete} className="btn-danger">Delete</button>
        <Link to="/" className="btn-secondary">Back</Link>
      </div>
    </div>
  );
}

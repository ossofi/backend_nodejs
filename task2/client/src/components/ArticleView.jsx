import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getArticle } from "../api.js";

export default function ArticleView() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    getArticle(id)
      .then(res => setArticle(res.data.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!article) return <p>Loading...</p>;

  return (
    <div>
       <div className="container">
  <h2>{article.title}</h2>
  <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
  <Link to="/" className="button">Back to Articles</Link>
</div>

    </div>
  );
}

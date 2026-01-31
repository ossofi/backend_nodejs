import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles..."
        className="search-input"
      />
      <button type="submit" className="btn btn-submit" style={{ marginLeft: 8, padding: "8px 12px" }}>
        Search
      </button>
    </form>
  );
}

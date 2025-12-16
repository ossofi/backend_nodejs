import React, { useEffect, useState } from "react";
import { getWorkspaces, createWorkspace } from "../api";

const ADD_VALUE = "__add__";

export default function WorkspaceSelector({ value, onChange }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      console.error("Failed to load workspaces", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e) => {
    const selected = e.target.value;

    if (selected === ADD_VALUE) {
      const name = prompt("New workspace name:");
      if (!name?.trim()) return;

      if (workspaces.some((w) => w.name === name.trim())) {
        alert("Workspace with this name already exists");
        return;
      }

      try {
        const ws = await createWorkspace(name.trim());
        await load();
        onChange(ws.id);
      } catch (err) {
        console.error(err);
        alert("Failed to create workspace");
      }
      return;
    }

    onChange(selected);
  };

  return (
    <select value={value} onChange={handleChange} disabled={loading}>
      <option value="">Select workspace</option>
      {workspaces.map((ws) => (
        <option key={ws.id} value={ws.id}>{ws.name}</option>
      ))}
      <option disabled>──────────</option>
      <option value={ADD_VALUE}>➕ Add workspace…</option>
    </select>
  );
}

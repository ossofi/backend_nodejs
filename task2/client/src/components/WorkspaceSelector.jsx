import React, { useEffect, useState } from "react";
import { getWorkspaces } from "../api";

export default function WorkspaceSelector({ value, onChange }) {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    getWorkspaces().then(setWorkspaces).catch(console.error);
  }, []);

  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select a workspace</option>
      {workspaces.map(ws => (
        <option key={ws.id} value={ws.id}>{ws.name}</option>
      ))}
    </select>
  );
}

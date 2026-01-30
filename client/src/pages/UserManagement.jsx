import { useEffect, useState } from "react";
import api from "../api";
import "../App.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getUsers().then(setUsers);
  }, []);

  const changeRole = async (id, role) => {
    await api.updateUserRole(id, role);
    setUsers((u) =>
      u.map((x) => (x.id === id ? { ...x, role } : x))
    );
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>

      <table className="user-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Current Role</th>
            <th>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="user-email">{u.email}</td>
              <td>
                <span
                  className={`role-badge ${
                    u.role === "admin" ? "role-admin" : "role-user"
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td>
                <select
                  className="role-select"
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from "react";

import api, { getApiError } from "../lib/api";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (err) {
      setError(getApiError(err));
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function deactivateUser(userId) {
    try {
      await api.patch(`/admin/users/${userId}/deactivate`);
      await loadUsers();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Admin moderation</h1>
      <p className="mt-2 text-sm text-[#64748b]">View users and deactivate accounts.</p>

      {error && <p className="mt-4 rounded-md bg-[#eff6ff] px-3 py-2 text-sm text-[#1e40af]">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-md border border-[#dbeafe] bg-[#ffffff]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#eff6ff] text-[#475569]">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#dbeafe]">
                <td className="px-4 py-3 font-medium">{user.username}</td>
                <td className="px-4 py-3 text-[#64748b]">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.is_active ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3">
                  <button
                    disabled={!user.is_active}
                    onClick={() => deactivateUser(user.id)}
                    className="rounded-md border border-[#bfdbfe] px-3 py-2 text-sm text-[#1e40af] hover:bg-[#eff6ff] disabled:opacity-50"
                    type="button"
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

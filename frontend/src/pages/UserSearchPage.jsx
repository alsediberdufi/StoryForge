import { Search, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import api, { getApiError } from "../lib/api";

export default function UserSearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  async function searchUsers(event) {
    event.preventDefault();
    setError("");
    setHasSearched(true);

    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      const response = await api.get("/users/search", { params: { query: query.trim() } });
      setUsers(response.data);
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-bold text-[#111827]">Find users</h1>
      <p className="mt-2 text-sm font-medium leading-6 text-[#64748b]">
        Search by username or email and open public profiles.
      </p>

      <form
        onSubmit={searchUsers}
        className="sf-panel mt-6 grid gap-3 rounded-md p-4 sm:grid-cols-[1fr_auto]"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users"
          className="sf-focus rounded-md border border-[#bfdbfe] bg-white px-3 py-2 outline-none"
        />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1d4ed8] px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#2563eb]"
          type="submit"
        >
          <Search size={16} /> Search
        </button>
      </form>

      {error && <p className="mt-4 rounded-md bg-[#eff6ff] px-3 py-2 text-sm font-medium text-[#1e40af]">{error}</p>}

      <div className="mt-6 grid gap-3">
        {users.length ? (
          users.map((user) => (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
              className="sf-panel sf-pop flex items-center gap-4 rounded-md p-4"
            >
              <span className="grid h-12 w-12 place-items-center rounded-md bg-[#dbeafe] text-[#1d4ed8]">
                <UserRound size={22} />
              </span>
              <span>
                <span className="block font-semibold">{user.username}</span>
                <span className="block text-sm font-medium text-[#64748b]">{user.bio || "No bio yet."}</span>
              </span>
            </Link>
          ))
        ) : hasSearched ? (
          <EmptyState title="No users found" body="Try another username or email." />
        ) : (
          <EmptyState title="Search for people" body="Profiles that match your search will appear here." />
        )}
      </div>
    </section>
  );
}

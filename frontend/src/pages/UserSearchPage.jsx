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
      <h1 className="text-3xl font-semibold">Find users</h1>
      <p className="mt-2 text-sm leading-6 text-[#69756d]">
        Search by username or email and open public profiles.
      </p>

      <form
        onSubmit={searchUsers}
        className="mt-6 grid gap-3 rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-4 sm:grid-cols-[1fr_auto]"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users"
          className="rounded-md border border-[#cfd8cf] bg-white px-3 py-2 outline-none focus:border-[#246344]"
        />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#183d2b] px-4 py-2 font-medium text-white hover:bg-[#246344]"
          type="submit"
        >
          <Search size={16} /> Search
        </button>
      </form>

      {error && <p className="mt-4 rounded-md bg-[#f7e8e2] px-3 py-2 text-sm text-[#9b2f20]">{error}</p>}

      <div className="mt-6 grid gap-3">
        {users.length ? (
          users.map((user) => (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
              className="flex items-center gap-4 rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-4 hover:bg-[#f0f3ed]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-md bg-[#dce9df] text-[#183d2b]">
                <UserRound size={22} />
              </span>
              <span>
                <span className="block font-semibold">{user.username}</span>
                <span className="block text-sm text-[#69756d]">{user.bio || "No bio yet."}</span>
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

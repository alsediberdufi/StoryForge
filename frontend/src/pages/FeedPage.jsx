import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import StoryCard from "../components/StoryCard";
import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../lib/api";

export default function FeedPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", page: 1 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadStories() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/stories", {
        params: {
          search: filters.search || undefined,
          category: filters.category || undefined,
          page: filters.page,
          limit: 10,
        },
      });
      setStories(response.data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, [filters.page]);

  async function handleSearch(event) {
    event.preventDefault();
    setFilters((current) => ({ ...current, page: 1 }));
    await loadStories();
  }

  async function likeStory(storyId) {
    if (!user) return;
    try {
      await api.post(`/stories/${storyId}/like-toggle`);
      await loadStories();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function saveStory(storyId) {
    if (!user) return;
    try {
      await api.post(`/stories/${storyId}/save-toggle`);
      await loadStories();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function deleteStory(storyId) {
    try {
      await api.delete(`/stories/${storyId}`);
      await loadStories();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Published stories</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-[#64748b]">Search, read, save, and react to public stories.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="sf-panel mt-6 grid gap-3 rounded-md p-4 sm:grid-cols-[1fr_220px_auto]">
        <input
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          placeholder="Search stories"
          className="sf-focus rounded-md border border-[#bfdbfe] bg-white px-3 py-2 outline-none"
        />
        <input
          value={filters.category}
          onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
          placeholder="Category"
          className="sf-focus rounded-md border border-[#bfdbfe] bg-white px-3 py-2 outline-none"
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1d4ed8] px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#2563eb]" type="submit">
          <Search size={16} /> Search
        </button>
      </form>

      {error && <p className="mt-4 rounded-md bg-[#eff6ff] px-3 py-2 text-sm font-medium text-[#1e40af]">{error}</p>}

      <div className="mt-6 grid gap-4">
        {loading ? (
          <p className="text-sm font-medium text-[#64748b]">Loading stories...</p>
        ) : stories.length ? (
          stories.map((story) => (
            <StoryCard key={story.id} story={story} onLike={likeStory} onSave={saveStory} onDelete={deleteStory} />
          ))
        ) : (
          <EmptyState title="No stories found" body="Try a different search or publish the first story in this category." />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          disabled={filters.page === 1}
          onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
          className="rounded-md border border-[#bfdbfe] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#dbeafe] disabled:opacity-50"
          type="button"
        >
          Previous
        </button>
        <span className="rounded-md bg-[#dbeafe] px-3 py-2 text-sm font-semibold text-[#1d4ed8]">Page {filters.page}</span>
        <button
          onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
          className="rounded-md border border-[#bfdbfe] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#dbeafe]"
          type="button"
        >
          Next
        </button>
      </div>
    </section>
  );
}

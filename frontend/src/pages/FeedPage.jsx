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
          <h1 className="text-3xl font-semibold">Published stories</h1>
          <p className="mt-2 text-sm leading-6 text-[#69756d]">Search, read, save, and react to public stories.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mt-6 grid gap-3 rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-4 sm:grid-cols-[1fr_220px_auto]">
        <input
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          placeholder="Search stories"
          className="rounded-md border border-[#cfd8cf] bg-white px-3 py-2 outline-none focus:border-[#246344]"
        />
        <input
          value={filters.category}
          onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
          placeholder="Category"
          className="rounded-md border border-[#cfd8cf] bg-white px-3 py-2 outline-none focus:border-[#246344]"
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#183d2b] px-4 py-2 font-medium text-white hover:bg-[#246344]" type="submit">
          <Search size={16} /> Search
        </button>
      </form>

      {error && <p className="mt-4 rounded-md bg-[#f7e8e2] px-3 py-2 text-sm text-[#9b2f20]">{error}</p>}

      <div className="mt-6 grid gap-4">
        {loading ? (
          <p className="text-sm text-[#69756d]">Loading stories...</p>
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
          className="rounded-md border border-[#cfd8cf] px-4 py-2 text-sm disabled:opacity-50"
          type="button"
        >
          Previous
        </button>
        <span className="text-sm text-[#69756d]">Page {filters.page}</span>
        <button
          onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
          className="rounded-md border border-[#cfd8cf] px-4 py-2 text-sm"
          type="button"
        >
          Next
        </button>
      </div>
    </section>
  );
}

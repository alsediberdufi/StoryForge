import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import api, { getApiError } from "../lib/api";

export default function SavedPage() {
  const [savedStories, setSavedStories] = useState([]);
  const [error, setError] = useState("");

  async function loadSavedStories() {
    try {
      const response = await api.get("/me/saved-stories");
      setSavedStories(response.data);
    } catch (err) {
      setError(getApiError(err));
    }
  }

  useEffect(() => {
    loadSavedStories();
  }, []);

  async function unsaveStory(storyId) {
    try {
      await api.delete(`/stories/${storyId}/save`);
      await loadSavedStories();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Saved stories</h1>
      <p className="mt-2 text-sm text-[#69756d]">Stories you saved for later.</p>

      {error && <p className="mt-4 rounded-md bg-[#f7e8e2] px-3 py-2 text-sm text-[#9b2f20]">{error}</p>}

      <div className="mt-6 grid gap-4">
        {savedStories.length ? (
          savedStories.map((item) => (
            <article key={item.id} className="rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-5">
              <Link to={`/stories/${item.story_id}`} className="text-xl font-semibold hover:text-[#246344]">
                {item.story.title}
              </Link>
              <p className="story-prose mt-3 line-clamp-3 text-sm leading-6 text-[#344039]">{item.story.content}</p>
              <button
                onClick={() => unsaveStory(item.story_id)}
                className="mt-4 rounded-md border border-[#cfd8cf] px-3 py-2 text-sm hover:bg-[#e7eee8]"
                type="button"
              >
                Remove from saved
              </button>
            </article>
          ))
        ) : (
          <EmptyState title="Nothing saved yet" body="Save stories from the feed and they will appear here." />
        )}
      </div>
    </section>
  );
}

import { Bookmark, Heart, MessageCircle, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../lib/api";

export default function StoryDetailPage() {
  const { storyId } = useParams();
  const { user, isAdmin } = useAuth();
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  async function loadStory() {
    try {
      const storyResponse = await api.get(`/stories/${storyId}`);
      setStory(storyResponse.data);
      if (storyResponse.data.is_published) {
        const [commentsResponse, likesResponse] = await Promise.all([
          api.get(`/stories/${storyId}/comments`),
          api.get(`/stories/${storyId}/likes`),
        ]);
        setComments(commentsResponse.data);
        setLikes(likesResponse.data.likes || []);
      } else {
        setComments([]);
        setLikes([]);
      }
    } catch (err) {
      setError(getApiError(err));
    }
  }

  useEffect(() => {
    loadStory();
  }, [storyId]);

  async function likeStory() {
    try {
      await api.post(`/stories/${storyId}/like-toggle`);
      await loadStory();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function saveStory() {
    try {
      await api.post(`/stories/${storyId}/save-toggle`);
      await loadStory();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function addComment(event) {
    event.preventDefault();
    try {
      await api.post(`/stories/${storyId}/comments`, { content });
      setContent("");
      await loadStory();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function deleteComment(commentId) {
    try {
      await api.delete(`/comments/${commentId}`);
      await loadStory();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  if (error && !story) {
    return <p className="rounded-md bg-[#eff6ff] px-3 py-2 text-sm text-[#1e40af]">{error}</p>;
  }

  if (!story) {
    return <p className="text-sm text-[#64748b]">Loading story...</p>;
  }

  return (
    <section className="mx-auto max-w-4xl">
      {story.image_url && <img src={story.image_url} alt="" className="h-80 w-full rounded-md object-cover" />}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748b]">
          <Link to={`/users/${story.author_id}`} className="hover:text-[#2563eb]">
            Author #{story.author_id}
          </Link>
          {story.category && <span>{story.category}</span>}
          {!story.is_published && <span className="text-[#9b4b26]">Draft</span>}
        </div>
        <h1 className="mt-3 text-4xl font-semibold">{story.title}</h1>
        <p className="story-prose mt-5 leading-7 text-[#334155]">{story.content}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {user && (
          <>
            <button onClick={likeStory} className="inline-flex items-center gap-2 rounded-md border border-[#bfdbfe] px-3 py-2 text-sm hover:bg-[#e0f2fe]" type="button">
              <Heart size={16} /> {story.likes_count ?? 0}
            </button>
            <button
              onClick={saveStory}
              className={
                story.is_saved
                  ? "inline-flex items-center gap-2 rounded-md border border-[#1d4ed8] bg-[#1d4ed8] px-3 py-2 text-sm text-white hover:bg-[#2563eb]"
                  : "inline-flex items-center gap-2 rounded-md border border-[#bfdbfe] bg-white px-3 py-2 text-sm hover:bg-[#e0f2fe]"
              }
              type="button"
            >
              <Bookmark size={16} fill={story.is_saved ? "currentColor" : "none"} />
              {story.is_saved ? "Saved" : "Save"}
            </button>
          </>
        )}
      </div>

      <section className="mt-8 rounded-md border border-[#dbeafe] bg-[#ffffff] p-5">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
          <Heart size={18} /> Likes
        </h2>
        {likes.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {likes.map((like) => (
              <Link
                key={like.id}
                to={`/users/${like.user_id}`}
                className="inline-flex items-center gap-2 rounded-md border border-[#bfdbfe] px-3 py-2 text-sm hover:bg-[#e0f2fe]"
              >
                <UserRound size={15} /> {like.user?.username || `User #${like.user_id}`}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#64748b]">No likes yet.</p>
        )}
      </section>

      {error && <p className="mt-4 rounded-md bg-[#eff6ff] px-3 py-2 text-sm text-[#1e40af]">{error}</p>}

      <section className="mt-10">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
          <MessageCircle size={20} /> Comments ({comments.length})
        </h2>

        {user && (
          <form onSubmit={addComment} className="mt-4 grid gap-3">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={3}
              className="rounded-md border border-[#bfdbfe] bg-white px-3 py-2 outline-none focus:border-[#2563eb]"
              placeholder="Add a comment"
              required
            />
            <button className="w-fit rounded-md bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb]" type="submit">
              Comment
            </button>
          </form>
        )}

        <div className="mt-5 grid gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md border border-[#dbeafe] bg-[#ffffff] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="story-prose text-sm leading-6">{comment.content}</p>
                {(user?.id === comment.user_id || isAdmin) && (
                  <button onClick={() => deleteComment(comment.id)} className="text-[#1e40af]" title="Delete comment" type="button">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-[#64748b]">
                By{" "}
                <Link to={`/users/${comment.user_id}`} className="hover:text-[#2563eb]">
                  {comment.user?.username || `User #${comment.user_id}`}
                </Link>
              </p>
            </div>
          ))}
          {!comments.length && <p className="text-sm text-[#64748b]">No comments yet.</p>}
        </div>
      </section>
    </section>
  );
}

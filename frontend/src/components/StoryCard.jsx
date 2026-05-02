import { Bookmark, Heart, MessageCircle, Pencil, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function StoryCard({ story, onLike, onSave, onDelete }) {
  const { user, isAdmin } = useAuth();
  const canDelete = user && (user.id === story.author_id || isAdmin);
  const saveButtonClass = story.is_saved
    ? "inline-flex items-center gap-2 rounded-md border border-[#1d4ed8] bg-[#1d4ed8] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2563eb]"
    : "inline-flex items-center gap-2 rounded-md border border-[#bfdbfe] bg-white px-3 py-2 text-sm font-semibold text-[#475569] hover:border-[#60a5fa] hover:bg-[#dbeafe]";

  return (
    <article className="sf-panel sf-pop overflow-hidden rounded-md border-l-4 border-l-[#3b82f6] p-5">
      {story.image_url && (
        <img
          src={story.image_url}
          alt=""
          className="mb-4 h-56 w-full rounded-md object-cover shadow-sm"
        />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={`/stories/${story.id}`} className="text-xl font-bold text-[#111827] hover:text-[#1d4ed8]">
            {story.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-[#64748b]">
            <Link to={`/users/${story.author_id}`} className="inline-flex items-center gap-1 hover:text-[#2563eb]">
              <UserRound size={14} /> Author #{story.author_id}
            </Link>
            {story.category && <span className="rounded-md bg-[#dbeafe] px-2 py-1 text-[#1d4ed8]">{story.category}</span>}
            {!story.is_published && <span className="rounded-md bg-[#eff6ff] px-2 py-1 text-[#1e40af]">Draft</span>}
          </div>
        </div>
        {user?.id === story.author_id && (
          <Link
            to={`/stories/${story.id}/edit`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#bfdbfe] text-[#475569] hover:bg-[#dbeafe]"
            title="Edit story"
          >
            <Pencil size={16} />
          </Link>
        )}
      </div>

      <p className="story-prose mt-4 line-clamp-4 text-sm leading-6 text-[#334155]">{story.content}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => onLike?.(story.id)}
          className="inline-flex items-center gap-2 rounded-md border border-[#bfdbfe] bg-white px-3 py-2 text-sm font-semibold text-[#475569] hover:border-[#3b82f6] hover:bg-[#eff6ff] hover:text-[#1e40af]"
          type="button"
        >
          <Heart size={16} /> {story.likes_count ?? 0} likes
        </button>
        <Link
          to={`/stories/${story.id}`}
          className="inline-flex items-center gap-2 rounded-md border border-[#bfdbfe] bg-white px-3 py-2 text-sm font-semibold text-[#475569] hover:border-[#60a5fa] hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
        >
          <MessageCircle size={16} /> {story.comments_count ?? 0} comments
        </Link>
        <button
          onClick={() => onSave?.(story.id)}
          className={saveButtonClass}
          type="button"
          title={story.is_saved ? "Remove from saved" : "Save story"}
        >
          <Bookmark size={16} fill={story.is_saved ? "currentColor" : "none"} />{" "}
          {story.is_saved ? "Saved" : "Save"}
        </button>
        {canDelete && (
          <button
            onClick={() => onDelete?.(story.id)}
            className="ml-auto inline-flex items-center gap-2 rounded-md border border-[#bfdbfe] bg-white px-3 py-2 text-sm font-semibold text-[#1e40af] hover:bg-[#eff6ff]"
            type="button"
          >
            <Trash2 size={16} /> Delete
          </button>
        )}
      </div>
    </article>
  );
}

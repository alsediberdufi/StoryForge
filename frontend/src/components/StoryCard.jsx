import { Bookmark, Heart, MessageCircle, Pencil, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function StoryCard({ story, onLike, onSave, onDelete }) {
  const { user, isAdmin } = useAuth();
  const canDelete = user && (user.id === story.author_id || isAdmin);
  const saveButtonClass = story.is_saved
    ? "inline-flex items-center gap-2 rounded-md border border-[#183d2b] bg-[#183d2b] px-3 py-2 text-sm text-white hover:bg-[#246344]"
    : "inline-flex items-center gap-2 rounded-md border border-[#cfd8cf] bg-white px-3 py-2 text-sm hover:bg-[#e7eee8]";

  return (
    <article className="rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-5 shadow-sm">
      {story.image_url && (
        <img
          src={story.image_url}
          alt=""
          className="mb-4 h-56 w-full rounded-md object-cover"
        />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={`/stories/${story.id}`} className="text-xl font-semibold hover:text-[#246344]">
            {story.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#69756d]">
            <Link to={`/users/${story.author_id}`} className="inline-flex items-center gap-1 hover:text-[#246344]">
              <UserRound size={14} /> Author #{story.author_id}
            </Link>
            {story.category && <span>{story.category}</span>}
            {!story.is_published && <span className="text-[#9b4b26]">Draft</span>}
          </div>
        </div>
        {user?.id === story.author_id && (
          <Link
            to={`/stories/${story.id}/edit`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#cfd8cf] text-[#4b5b51] hover:bg-[#e7eee8]"
            title="Edit story"
          >
            <Pencil size={16} />
          </Link>
        )}
      </div>

      <p className="story-prose mt-4 line-clamp-4 text-sm leading-6 text-[#344039]">{story.content}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => onLike?.(story.id)}
          className="inline-flex items-center gap-2 rounded-md border border-[#cfd8cf] px-3 py-2 text-sm hover:bg-[#e7eee8]"
          type="button"
        >
          <Heart size={16} /> {story.likes_count ?? 0} likes
        </button>
        <Link
          to={`/stories/${story.id}`}
          className="inline-flex items-center gap-2 rounded-md border border-[#cfd8cf] px-3 py-2 text-sm hover:bg-[#e7eee8]"
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
            className="ml-auto inline-flex items-center gap-2 rounded-md border border-[#e1c6bd] px-3 py-2 text-sm text-[#9b2f20] hover:bg-[#f7e8e2]"
            type="button"
          >
            <Trash2 size={16} /> Delete
          </button>
        )}
      </div>
    </article>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import StoryCard from "../components/StoryCard";
import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../lib/api";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [saved, setSaved] = useState([]);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: "",
    profile_image_url: "",
    saved_stories_public: false,
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isOwnProfile = Number(userId) === user?.id;

  async function loadProfile() {
    setError("");
    try {
      const [profileResponse, storiesResponse] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/users/${userId}/stories`),
      ]);
      setProfile(profileResponse.data);
      setProfileForm({
        bio: profileResponse.data.bio || "",
        profile_image_url: profileResponse.data.profile_image_url || "",
        saved_stories_public: profileResponse.data.saved_stories_public,
      });
      setProfileImagePreview(profileResponse.data.profile_image_url || "");
      setStories(storiesResponse.data);

      try {
        const savedResponse = await api.get(`/users/${userId}/saved-stories`);
        setSaved(savedResponse.data);
      } catch {
        setSaved([]);
      }
    } catch (err) {
      setError(getApiError(err));
    }
  }

  useEffect(() => {
    loadProfile();
  }, [userId]);

  function updateProfileField(event) {
    const { name, value, type, checked } = event.target;
    setProfileForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function updateProfileImage(event) {
    const file = event.target.files?.[0];
    setProfileImageFile(file || null);
    setProfileImagePreview(file ? URL.createObjectURL(file) : profileForm.profile_image_url);
  }

  async function uploadProfileImageIfNeeded() {
    if (!profileImageFile) {
      return profileForm.profile_image_url || null;
    }

    const body = new FormData();
    body.append("file", profileImageFile);
    const response = await api.post("/uploads/image", body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url;
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const profileImageUrl = await uploadProfileImageIfNeeded();
      const response = await api.patch("/users/me", {
        ...profileForm,
        profile_image_url: profileImageUrl,
      });
      setProfile(response.data);
      setProfileImageFile(null);
      setProfileImagePreview(response.data.profile_image_url || "");
      setUser((current) => (current ? { ...current, ...response.data } : current));
      setEditing(false);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function likeStory(storyId) {
    if (!user) return;
    try {
      await api.post(`/stories/${storyId}/like-toggle`);
      await loadProfile();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function saveStory(storyId) {
    if (!user) return;
    try {
      await api.post(`/stories/${storyId}/save-toggle`);
      await loadProfile();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function deleteStory(storyId) {
    try {
      await api.delete(`/stories/${storyId}`);
      await loadProfile();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  if (error && !profile) {
    return <p className="rounded-md bg-[#eff6ff] px-3 py-2 text-sm font-medium text-[#1e40af]">{error}</p>;
  }

  if (!profile) {
    return <p className="text-sm font-medium text-[#64748b]">Loading profile...</p>;
  }

  return (
    <section>
      <div className="sf-panel overflow-hidden rounded-md border-t-4 border-t-[#60a5fa] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 place-items-center rounded-md bg-[#dbeafe] text-2xl font-bold text-[#1d4ed8] shadow-sm">
            {profile.profile_image_url ? (
              <img src={profile.profile_image_url} alt="" className="h-full w-full rounded-md object-cover" />
            ) : (
              profile.username.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#64748b]">{profile.bio || "No bio yet."}</p>
            <p className="mt-2 text-xs font-semibold text-[#1d4ed8]">
              Saved stories are {profile.saved_stories_public ? "public" : "private"}
            </p>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setEditing((current) => !current)}
              className="w-fit rounded-md border border-[#bfdbfe] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#dbeafe] sm:ml-auto"
              type="button"
            >
              {editing ? "Cancel" : "Edit profile"}
            </button>
          )}
        </div>

        {editing && (
          <form onSubmit={saveProfile} className="mt-6 grid gap-4 border-t border-[#dbeafe] pt-5">
            <label className="text-sm font-medium">
              Bio
              <textarea
                name="bio"
                value={profileForm.bio}
                onChange={updateProfileField}
                rows={4}
                className="sf-focus mt-2 w-full rounded-md border border-[#bfdbfe] bg-white px-3 py-2 outline-none"
                placeholder="Tell readers about yourself"
              />
            </label>
            <label className="text-sm font-medium">
              Profile picture
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={updateProfileImage}
                className="sf-focus mt-2 w-full rounded-md border border-[#bfdbfe] bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
            {profileImagePreview && (
              <img
                src={profileImagePreview}
                alt=""
                className="h-32 w-32 rounded-md border border-[#bfdbfe] object-cover shadow-sm"
              />
            )}
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                name="saved_stories_public"
                type="checkbox"
                checked={profileForm.saved_stories_public}
                onChange={updateProfileField}
                className="h-4 w-4 accent-[#2563eb]"
              />
              Make saved stories public
            </label>
            <button
              className="w-fit rounded-md bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2563eb]"
              type="submit"
            >
              Save profile
            </button>
          </form>
        )}
      </div>

      {success && <p className="mt-4 rounded-md bg-[#dbeafe] px-3 py-2 text-sm font-medium text-[#2563eb]">{success}</p>}
      {error && <p className="mt-4 rounded-md bg-[#eff6ff] px-3 py-2 text-sm font-medium text-[#1e40af]">{error}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="text-xl font-semibold">Published stories</h2>
          <div className="mt-4 grid gap-4">
            {stories.length ? (
              stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onLike={likeStory}
                  onSave={saveStory}
                  onDelete={deleteStory}
                />
              ))
            ) : (
              <EmptyState title="No public stories" body="Published stories from this user will show up here." />
            )}
          </div>
        </section>

        <aside>
          <h2 className="text-xl font-semibold">{isOwnProfile ? "Your saved stories" : "Saved stories"}</h2>
          <div className="mt-4 grid gap-3">
            {saved.length ? (
              saved.map((item) => (
                <Link key={item.id} to={`/stories/${item.story_id}`} className="sf-panel sf-pop rounded-md p-4">
                  <span className="block font-medium">{item.story.title}</span>
                  <span className="mt-1 block text-xs font-semibold text-[#1d4ed8]">{item.story.category || "Uncategorized"}</span>
                </Link>
              ))
            ) : (
              <p className="sf-panel rounded-md p-4 text-sm font-medium text-[#64748b]">
                No visible saved stories.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

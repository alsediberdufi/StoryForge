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
    return <p className="rounded-md bg-[#f7e8e2] px-3 py-2 text-sm text-[#9b2f20]">{error}</p>;
  }

  if (!profile) {
    return <p className="text-sm text-[#69756d]">Loading profile...</p>;
  }

  return (
    <section>
      <div className="rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 place-items-center rounded-md bg-[#dce9df] text-2xl font-semibold text-[#183d2b]">
            {profile.profile_image_url ? (
              <img src={profile.profile_image_url} alt="" className="h-full w-full rounded-md object-cover" />
            ) : (
              profile.username.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-3xl font-semibold">{profile.username}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#69756d]">{profile.bio || "No bio yet."}</p>
            <p className="mt-2 text-xs text-[#69756d]">
              Saved stories are {profile.saved_stories_public ? "public" : "private"}
            </p>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setEditing((current) => !current)}
              className="w-fit rounded-md border border-[#cfd8cf] px-4 py-2 text-sm font-medium hover:bg-[#e7eee8] sm:ml-auto"
              type="button"
            >
              {editing ? "Cancel" : "Edit profile"}
            </button>
          )}
        </div>

        {editing && (
          <form onSubmit={saveProfile} className="mt-6 grid gap-4 border-t border-[#dde1d8] pt-5">
            <label className="text-sm font-medium">
              Bio
              <textarea
                name="bio"
                value={profileForm.bio}
                onChange={updateProfileField}
                rows={4}
                className="mt-2 w-full rounded-md border border-[#cfd8cf] bg-white px-3 py-2 outline-none focus:border-[#246344]"
                placeholder="Tell readers about yourself"
              />
            </label>
            <label className="text-sm font-medium">
              Profile picture
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={updateProfileImage}
                className="mt-2 w-full rounded-md border border-[#cfd8cf] bg-white px-3 py-2 text-sm outline-none focus:border-[#246344]"
              />
            </label>
            {profileImagePreview && (
              <img
                src={profileImagePreview}
                alt=""
                className="h-32 w-32 rounded-md border border-[#dde1d8] object-cover"
              />
            )}
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                name="saved_stories_public"
                type="checkbox"
                checked={profileForm.saved_stories_public}
                onChange={updateProfileField}
                className="h-4 w-4 accent-[#246344]"
              />
              Make saved stories public
            </label>
            <button
              className="w-fit rounded-md bg-[#183d2b] px-4 py-2 text-sm font-medium text-white hover:bg-[#246344]"
              type="submit"
            >
              Save profile
            </button>
          </form>
        )}
      </div>

      {success && <p className="mt-4 rounded-md bg-[#e7eee8] px-3 py-2 text-sm text-[#246344]">{success}</p>}
      {error && <p className="mt-4 rounded-md bg-[#f7e8e2] px-3 py-2 text-sm text-[#9b2f20]">{error}</p>}

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
                <Link key={item.id} to={`/stories/${item.story_id}`} className="rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-4 hover:bg-[#f0f3ed]">
                  <span className="block font-medium">{item.story.title}</span>
                  <span className="mt-1 block text-xs text-[#69756d]">{item.story.category || "Uncategorized"}</span>
                </Link>
              ))
            ) : (
              <p className="rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-4 text-sm text-[#69756d]">
                No visible saved stories.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

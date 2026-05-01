import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api, { getApiError } from "../lib/api";

const initialForm = {
  title: "",
  content: "",
  image_url: "",
  category: "",
  is_published: true,
};

export default function StoryFormPage({ editMode = false }) {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadStory() {
      if (!editMode) return;
      try {
        const response = await api.get(`/stories/${storyId}`);
        setForm({
          title: response.data.title || "",
          content: response.data.content || "",
          image_url: response.data.image_url || "",
          category: response.data.category || "",
          is_published: response.data.is_published,
        });
        setImagePreview(response.data.image_url || "");
      } catch (err) {
        setError(getApiError(err));
      }
    }

    loadStory();
  }, [editMode, storyId]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function updateImage(event) {
    const file = event.target.files?.[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : form.image_url);
  }

  async function uploadImageIfNeeded() {
    if (!imageFile) {
      return form.image_url || null;
    }

    const body = new FormData();
    body.append("file", imageFile);
    const response = await api.post("/uploads/image", body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const imageUrl = await uploadImageIfNeeded();
      const payload = {
        ...form,
        image_url: imageUrl,
        category: form.category || null,
      };
      const response = editMode
        ? await api.put(`/stories/${storyId}`, payload)
        : await api.post("/stories", payload);
      navigate(`/stories/${response.data.id}`);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">{editMode ? "Edit story" : "Write a story"}</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-5">
        <label className="text-sm font-medium">
          Title
          <input
            name="title"
            value={form.title}
            onChange={updateField}
            className="mt-2 w-full rounded-md border border-[#cfd8cf] bg-white px-3 py-2 outline-none focus:border-[#246344]"
            required
          />
        </label>

        <label className="text-sm font-medium">
          Content
          <textarea
            name="content"
            value={form.content}
            onChange={updateField}
            rows={12}
            className="mt-2 w-full resize-y rounded-md border border-[#cfd8cf] bg-white px-3 py-2 leading-6 outline-none focus:border-[#246344]"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Story image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={updateImage}
              className="mt-2 w-full rounded-md border border-[#cfd8cf] bg-white px-3 py-2 text-sm outline-none focus:border-[#246344]"
            />
          </label>
          <label className="text-sm font-medium">
            Category
            <input
              name="category"
              value={form.category}
              onChange={updateField}
              className="mt-2 w-full rounded-md border border-[#cfd8cf] bg-white px-3 py-2 outline-none focus:border-[#246344]"
            />
          </label>
        </div>

        {imagePreview && (
          <img
            src={imagePreview}
            alt=""
            className="h-64 w-full rounded-md border border-[#dde1d8] object-cover"
          />
        )}

        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            name="is_published"
            type="checkbox"
            checked={form.is_published}
            onChange={updateField}
            className="h-4 w-4 accent-[#246344]"
          />
          Publish now
        </label>

        {error && <p className="rounded-md bg-[#f7e8e2] px-3 py-2 text-sm text-[#9b2f20]">{error}</p>}

        <button
          disabled={submitting}
          className="rounded-md bg-[#183d2b] px-4 py-2 font-medium text-white hover:bg-[#246344] disabled:opacity-60"
          type="submit"
        >
          {submitting ? "Saving..." : "Save story"}
        </button>
      </form>
    </section>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../lib/api";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { saveToken } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await api.post("/auth/register", form);
      }

      const body = new URLSearchParams();
      body.set("username", form.email);
      body.set("password", form.password);
      const response = await api.post("/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      saveToken(response.data.access_token);
      navigate("/");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold text-[#111827]">{isRegister ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-sm font-medium leading-6 text-[#64748b]">
        {isRegister ? "Join StoryForge and publish your first story." : "Log in with your email and password."}
      </p>

      <form onSubmit={handleSubmit} className="sf-panel mt-6 rounded-md p-5">
        {isRegister && (
          <label className="mb-4 block text-sm font-medium">
            Username
            <input
              name="username"
              value={form.username}
              onChange={updateField}
              minLength={3}
              className="sf-focus mt-2 w-full rounded-md border border-[#bfdbfe] bg-white px-3 py-2 outline-none"
              required
            />
          </label>
        )}
        <label className="mb-4 block text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            className="sf-focus mt-2 w-full rounded-md border border-[#bfdbfe] bg-white px-3 py-2 outline-none"
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            minLength={8}
            className="sf-focus mt-2 w-full rounded-md border border-[#bfdbfe] bg-white px-3 py-2 outline-none"
            required
          />
        </label>

        {error && <p className="mt-4 rounded-md bg-[#eff6ff] px-3 py-2 text-sm font-medium text-[#1e40af]">{error}</p>}

        <button
          disabled={submitting}
          className="mt-5 w-full rounded-md bg-[#1d4ed8] px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#2563eb] disabled:opacity-60"
          type="submit"
        >
          {submitting ? "Working..." : isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm font-medium text-[#64748b]">
        {isRegister ? "Already have an account?" : "New to StoryForge?"}{" "}
        <Link className="font-bold text-[#1d4ed8]" to={isRegister ? "/login" : "/register"}>
          {isRegister ? "Log in" : "Create one"}
        </Link>
      </p>
    </section>
  );
}

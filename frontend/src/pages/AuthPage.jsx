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
      <h1 className="text-3xl font-semibold">{isRegister ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-sm leading-6 text-[#69756d]">
        {isRegister ? "Join StoryForge and publish your first story." : "Log in with your email and password."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-md border border-[#dde1d8] bg-[#fbfaf6] p-5">
        {isRegister && (
          <label className="mb-4 block text-sm font-medium">
            Username
            <input
              name="username"
              value={form.username}
              onChange={updateField}
              minLength={3}
              className="mt-2 w-full rounded-md border border-[#cfd8cf] bg-white px-3 py-2 outline-none focus:border-[#246344]"
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
            className="mt-2 w-full rounded-md border border-[#cfd8cf] bg-white px-3 py-2 outline-none focus:border-[#246344]"
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
            className="mt-2 w-full rounded-md border border-[#cfd8cf] bg-white px-3 py-2 outline-none focus:border-[#246344]"
            required
          />
        </label>

        {error && <p className="mt-4 rounded-md bg-[#f7e8e2] px-3 py-2 text-sm text-[#9b2f20]">{error}</p>}

        <button
          disabled={submitting}
          className="mt-5 w-full rounded-md bg-[#183d2b] px-4 py-2 font-medium text-white hover:bg-[#246344] disabled:opacity-60"
          type="submit"
        >
          {submitting ? "Working..." : isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-[#69756d]">
        {isRegister ? "Already have an account?" : "New to StoryForge?"}{" "}
        <Link className="font-medium text-[#246344]" to={isRegister ? "/login" : "/register"}>
          {isRegister ? "Log in" : "Create one"}
        </Link>
      </p>
    </section>
  );
}

import { BookOpen, Bookmark, LogOut, PenSquare, Search, Shield, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const linkBase =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-[#e7eee8]";
const activeClass = "bg-[#dce9df] text-[#113a23]";
const idleClass = "text-[#4b5b51]";

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#17211c]">
      <header className="border-b border-[#dde1d8] bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-[#183d2b] text-white">
              <BookOpen size={22} />
            </span>
            <span>
              <span className="block text-xl font-semibold">StoryForge</span>
              <span className="block text-xs text-[#69756d]">Social Story Platform</span>
            </span>
          </NavLink>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" className={({ isActive }) => `${linkBase} ${isActive ? activeClass : idleClass}`}>
              <Search size={16} /> Feed
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => `${linkBase} ${isActive ? activeClass : idleClass}`}>
              <UserRound size={16} /> Users
            </NavLink>
            {user && (
              <>
                <NavLink
                  to="/write"
                  className={({ isActive }) => `${linkBase} ${isActive ? activeClass : idleClass}`}
                >
                  <PenSquare size={16} /> Write
                </NavLink>
                <NavLink
                  to="/saved"
                  className={({ isActive }) => `${linkBase} ${isActive ? activeClass : idleClass}`}
                >
                  <Bookmark size={16} /> Saved
                </NavLink>
                <NavLink
                  to={`/users/${user.id}`}
                  className={({ isActive }) => `${linkBase} ${isActive ? activeClass : idleClass}`}
                >
                  <UserRound size={16} /> Profile
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `${linkBase} ${isActive ? activeClass : idleClass}`}
              >
                <Shield size={16} /> Admin
              </NavLink>
            )}
            {user ? (
              <button onClick={logout} className={`${linkBase} ${idleClass}`} type="button">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) => `${linkBase} ${isActive ? activeClass : idleClass}`}
              >
                Login
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

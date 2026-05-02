import { BookOpen, Bookmark, LogOut, PenSquare, Search, Shield, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const linkBase =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition duration-200";
const activeClass = "bg-[#1d4ed8] text-white shadow-sm";
const idleClass = "text-[#475569] hover:bg-[#dbeafe] hover:text-[#1d4ed8]";

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="sf-surface min-h-screen text-[#111827]">
      <header className="sticky top-0 z-20 border-b border-[#dbeafe] bg-[#f8fbff]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-[#1d4ed8] text-white shadow-[0_8px_18px_rgba(29,78,216,0.28)]">
              <BookOpen size={22} />
            </span>
            <span>
              <span className="block text-xl font-semibold">StoryForge</span>
              <span className="block text-xs font-medium text-[#2563eb]">Social Story Platform</span>
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

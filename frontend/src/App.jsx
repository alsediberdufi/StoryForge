import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import SavedPage from "./pages/SavedPage";
import StoryDetailPage from "./pages/StoryDetailPage";
import StoryFormPage from "./pages/StoryFormPage";
import UserSearchPage from "./pages/UserSearchPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/users" element={<UserSearchPage />} />
        <Route path="/stories/:storyId" element={<StoryDetailPage />} />
        <Route path="/users/:userId" element={<ProfilePage />} />
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <StoryFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories/:storyId/edit"
          element={
            <ProtectedRoute>
              <StoryFormPage editMode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

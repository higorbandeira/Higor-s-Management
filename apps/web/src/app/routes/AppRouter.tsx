import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/app/providers/AuthProvider";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ChatPage } from "@/features/chat/pages/ChatPage";
import { PdvPage } from "@/features/pdv/pages/PdvPage";
import { UsersListPage } from "@/features/admin/pages/UsersListPage";
import { UserEditPage } from "@/features/admin/pages/UserEditPage";

function moduleToRoute(module?: "CHAT" | "DASHBOARD" | "PDV") {
  if (module === "DASHBOARD") return "/dashboard";
  if (module === "PDV") return "/pdv";
  return "/chat";
}

function RootRedirect() {
  const { me, loading } = useAuth();
  if (loading) return null;
  if (!me) return <Navigate to="/login" replace />;
  return me.role === "ADMIN" ? (
    <Navigate to="/admin/users" replace />
  ) : (
    <Navigate to={moduleToRoute(me.module)} replace />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allow={["USER"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute allow={["USER"]}>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pdv"
        element={
          <ProtectedRoute allow={["USER"]}>
            <PdvPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allow={["ADMIN"]}>
            <UsersListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute allow={["ADMIN"]}>
            <UserEditPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

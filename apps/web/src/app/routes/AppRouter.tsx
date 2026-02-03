import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/app/providers/AuthProvider";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { FinanceiroDashboardPage } from "@/features/financeiro/pages/FinanceiroDashboardPage";
import { FinanceiroRegistrosPage } from "@/features/financeiro/pages/FinanceiroRegistrosPage";
import { ChatPage } from "@/features/chat/pages/ChatPage";
import { AiChatPage } from "@/features/ai-chat/pages/AiChatPage";
import { PdvPage } from "@/features/pdv/pages/PdvPage";
import { UsersListPage } from "@/features/admin/pages/UsersListPage";
import { UserEditPage } from "@/features/admin/pages/UserEditPage";
import { DoomPage } from "@/features/doom/pages/DoomPage";
import { moduleToRoute } from "@/shared/constants/modules";

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
          <ProtectedRoute allow={["USER"]} module="DASHBOARD">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute allow={["USER"]} module="CHAT">
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <ProtectedRoute allow={["USER"]} module="AI_CHAT">
            <AiChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pdv"
        element={
          <ProtectedRoute allow={["USER"]} module="PDV">
            <PdvPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/financeiro"
        element={
          <ProtectedRoute allow={["USER"]} module="FINANCEIRO">
            <FinanceiroDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financeiro/registros"
        element={
          <ProtectedRoute allow={["USER"]} module="FINANCEIRO">
            <FinanceiroRegistrosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doom"
        element={
          <ProtectedRoute allow={["USER"]} module="DOOM">
            <DoomPage />
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

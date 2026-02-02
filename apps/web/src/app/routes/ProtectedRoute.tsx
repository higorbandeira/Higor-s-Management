import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

function moduleToRoute(module?: "CHAT" | "DASHBOARD" | "PDV" | "FINANCEIRO") {
  if (module === "DASHBOARD") return "/dashboard";
  if (module === "PDV") return "/pdv";
  if (module === "FINANCEIRO") return "/financeiro";
  return "/chat";
}

export function ProtectedRoute({
  allow,
  children,
}: {
  allow: Array<"USER" | "ADMIN">;
  children: React.ReactNode;
}) {
  const { me, loading } = useAuth();

  if (loading) return null;
  if (!me) return <Navigate to="/login" replace />;

  if (!allow.includes(me.role)) {
    return me.role === "ADMIN" ? (
      <Navigate to="/admin/users" replace />
    ) : (
      <Navigate to={moduleToRoute(me.module)} replace />
    );
  }

  return <>{children}</>;
}

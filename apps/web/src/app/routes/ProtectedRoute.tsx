import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { moduleToRoute, type ModuleKey } from "@/shared/constants/modules";

export function ProtectedRoute({
  allow,
  module,
  children,
}: {
  allow: Array<"USER" | "ADMIN">;
  module?: ModuleKey;
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

  if (module && me.role === "USER" && me.module !== module) {
    return <Navigate to={moduleToRoute(me.module)} replace />;
  }

  return <>{children}</>;
}

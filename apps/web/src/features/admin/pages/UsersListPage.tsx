import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { http } from "@/shared/api/http";
import { useTheme } from "@/shared/ui/useTheme";
import { useAiSignature } from "@/shared/ui/useAiSignature";

type User = {
  id: string;
  nickname: string;
  role: "USER" | "ADMIN";
  module: "CHAT" | "DASHBOARD";
  isActive: boolean;
};

export function UsersListPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  useAiSignature("Admin / Lista de Usuários");
  const [users, setUsers] = useState<User[]>([]);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [module, setModule] = useState<"CHAT" | "DASHBOARD">("CHAT");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await http.get("/admin/users");
    setUsers(res.data.items as User[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nickname.trim() || !password) {
      setError("Nickname e senha são obrigatórios");
      return;
    }

    setBusy(true);
    try {
      await http.post("/admin/users", { nickname, password, module });
      setNickname("");
      setPassword("");
      setModule("CHAT");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Falha ao criar usuário");
    } finally {
      setBusy(false);
    }
  }

  const isDark = theme === "dark";
  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#0b0b0b" : "#f5f5f5",
    padding: "32px 24px 64px",
    fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
  };
  const containerStyle = { maxWidth: 980, margin: "0 auto", display: "grid", gap: 24 };
  const cardStyle = {
    background: isDark ? "#111111" : "#ffffff",
    borderRadius: 20,
    padding: 20,
    border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
    boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.4)" : "0 16px 40px rgba(0,0,0,0.08)",
  };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: isDark ? "#d0d0d0" : "#424242" };
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: isDark ? "1px solid #333333" : "1px solid #d0d0d0",
    background: isDark ? "#0f0f0f" : "#ffffff",
    color: isDark ? "#f5f5f5" : "#111111",
    fontSize: 14,
  };
  const primaryButtonStyle = {
    padding: "10px 18px",
    borderRadius: 999,
    border: "none",
    background: isDark ? "#ffffff" : "#111111",
    color: isDark ? "#111111" : "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    opacity: 0.9,
    transition: "opacity 0.2s ease",
  };
  const ghostButtonStyle = {
    padding: "10px 18px",
    borderRadius: 999,
    border: isDark ? "1px solid #ffffff" : "1px solid #111111",
    background: "transparent",
    color: isDark ? "#ffffff" : "#111111",
    fontWeight: 600,
    cursor: "pointer",
    opacity: 0.9,
    transition: "opacity 0.2s ease",
  };

  return (
    <div style={pageStyle}>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
        aria-label="Alternar tema"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          width: 46,
          height: 46,
          borderRadius: 16,
          border: "none",
          background: isDark ? "#1f1f1f" : "#ffffff",
          color: isDark ? "#90caf9" : "#ff8f00",
          fontSize: 20,
          cursor: "pointer",
          boxShadow: isDark ? "0 10px 22px rgba(0,0,0,0.45)" : "0 10px 22px rgba(0,0,0,0.2)",
          zIndex: 12,
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </button>
      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, color: isDark ? "#ffffff" : "#111111" }}>Painel Admin</h1>
            <p style={{ marginTop: 8, color: isDark ? "#bdbdbd" : "#616161" }}>
              Gerencie usuários e permissões com segurança.
            </p>
          </div>
          <button
            onClick={logout}
            style={ghostButtonStyle}
            title="Sair"
            onMouseEnter={(event) => {
              event.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.opacity = "0.9";
            }}
          >
            Sair
          </button>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: isDark ? "#ffffff" : "#111111" }}>Criar USER</h2>
          <form onSubmit={createUser}>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "center" }}>
              <label style={labelStyle}>Nickname</label>
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} style={inputStyle} />

              <label style={labelStyle}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />

              <label style={labelStyle}>Módulo</label>
              <select value={module} onChange={(e) => setModule(e.target.value as "CHAT" | "DASHBOARD")} style={inputStyle}>
                <option value="CHAT">Chat geral</option>
                <option value="DASHBOARD">Campo RPG</option>
              </select>
            </div>

            {error && <div style={{ marginTop: 12, color: isDark ? "#ff6b6b" : "#b00020" }}>{error}</div>}

            <button
              type="submit"
              disabled={busy}
              title="Criar usuário"
              onMouseEnter={(event) => {
                event.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.opacity = "0.9";
              }}
              style={{ ...primaryButtonStyle, marginTop: 12, opacity: busy ? 0.7 : primaryButtonStyle.opacity }}
            >
              {busy ? "Criando..." : "Criar"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: isDark ? "#ffffff" : "#111111" }}>Usuários</h2>
          <div
            style={{
              border: isDark ? "1px solid #2b2b2b" : "1px solid #efefef",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 120px 140px",
                padding: 12,
                fontWeight: 600,
                background: isDark ? "#151515" : "#fafafa",
                borderBottom: isDark ? "1px solid #2b2b2b" : "1px solid #eee",
                color: isDark ? "#f5f5f5" : "#111111",
              }}
            >
              <div>Nickname</div>
              <div>Módulo</div>
              <div>Status</div>
              <div></div>
            </div>
            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 120px 140px",
                  padding: 12,
                  borderBottom: isDark ? "1px solid #2b2b2b" : "1px solid #f2f2f2",
                  alignItems: "center",
                  color: isDark ? "#f5f5f5" : "#111111",
                }}
              >
                <div>{u.nickname}</div>
                <div>{u.module === "DASHBOARD" ? "Campo RPG" : "Chat geral"}</div>
                <div
                  style={{
                    color: u.isActive ? "#0a7d2c" : isDark ? "#ff6b6b" : "#b00020",
                    fontWeight: 600,
                  }}
                >
                  {u.isActive ? "Ativo" : "Inativo"}
                </div>
                <div>
                  {u.role === "USER" ? (
                    <Link
                      to={`/admin/users/${u.id}`}
                      style={{ color: isDark ? "#ffffff" : "#111111", fontWeight: 600 }}
                      title="Editar usuário"
                    >
                      Editar
                    </Link>
                  ) : (
                    <span style={{ opacity: 0.6 }}>ADMIN</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

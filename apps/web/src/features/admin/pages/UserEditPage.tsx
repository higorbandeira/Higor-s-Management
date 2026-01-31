import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "@/shared/api/http";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/shared/ui/useTheme";
import { useAiSignature } from "@/shared/ui/useAiSignature";

type User = {
  id: string;
  nickname: string;
  role: "USER" | "ADMIN";
  module: "CHAT" | "DASHBOARD";
  isActive: boolean;
};

export function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  useAiSignature("Admin / Editar Usuário");

  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [module, setModule] = useState<"CHAT" | "DASHBOARD">("CHAT");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await http.get(`/admin/users/${id}`);
      const u = res.data as User;
      setUser(u);
      setNickname(u.nickname);
      setIsActive(u.isActive);
      setModule(u.module ?? "CHAT");
    }
    load().catch(() => setError("Usuário não encontrado"));
  }, [id]);

  async function save() {
    if (!id) return;
    setError(null);
    setBusy(true);
    try {
      await http.patch(`/admin/users/${id}`, {
        nickname,
        module,
        isActive,
        password: password ? password : undefined,
      });
      navigate("/admin/users");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Falha ao salvar");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: theme === "dark" ? "#0b0b0b" : "#f5f5f5",
          fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
          color: theme === "dark" ? "#f5f5f5" : "#111111",
        }}
      >
        <div style={{ color: theme === "dark" ? "#bdbdbd" : "#616161" }}>{error ?? "Carregando..."}</div>
      </div>
    );
  }

  const isDark = theme === "dark";
  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#0b0b0b" : "#f5f5f5",
    padding: "32px 24px 64px",
    fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
  };
  const containerStyle = { maxWidth: 760, margin: "0 auto", display: "grid", gap: 24 };
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
  const buttonStyle = {
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
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          display: "grid",
          gap: 8,
          fontSize: 10,
          color: isDark ? "#f5f5f5" : "#111111",
          background: isDark ? "#111111" : "#ffffff",
          border: isDark ? "1px solid #2b2b2b" : "1px solid #e0e0e0",
          borderRadius: 16,
          padding: "8px",
          boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
        }}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-pressed={theme === "light"}
          title="Tema claro"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: theme === "light" ? "2px solid #ffb300" : isDark ? "1px solid #2b2b2b" : "1px solid #d0d0d0",
            background: theme === "light" ? "#fff3cd" : isDark ? "#1a1a1a" : "#ffffff",
            color: "#ff8f00",
            fontSize: 18,
            cursor: "pointer",
            boxShadow: theme === "light" ? "0 6px 12px rgba(255,179,0,0.25)" : "none",
          }}
        >
          ☀️
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-pressed={theme === "dark"}
          title="Tema escuro"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: theme === "dark" ? "2px solid #90caf9" : isDark ? "1px solid #2b2b2b" : "1px solid #d0d0d0",
            background: theme === "dark" ? "#1e1e2f" : isDark ? "#1a1a1a" : "#ffffff",
            color: "#90caf9",
            fontSize: 18,
            cursor: "pointer",
            boxShadow: theme === "dark" ? "0 6px 12px rgba(144,202,249,0.2)" : "none",
          }}
        >
          🌙
        </button>
      </div>
      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, color: isDark ? "#ffffff" : "#111111" }}>Editar USER</h1>
            <p style={{ marginTop: 8, color: isDark ? "#bdbdbd" : "#616161" }}>
              Atualize dados, status e senha do usuário.
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
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12, alignItems: "center" }}>
            <label style={labelStyle}>Nickname</label>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>Status</label>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600, color: isDark ? "#f5f5f5" : "#111111" }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              {isActive ? "Ativo" : "Inativo"}
            </label>

            <label style={labelStyle}>Módulo</label>
            <select value={module} onChange={(e) => setModule(e.target.value as "CHAT" | "DASHBOARD")} style={inputStyle}>
              <option value="CHAT">Chat geral</option>
              <option value="DASHBOARD">Campo RPG</option>
            </select>

            <label style={labelStyle}>Nova senha (reset)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe vazio para não alterar"
              style={inputStyle}
            />
          </div>

          {error && <div style={{ marginTop: 12, color: isDark ? "#ff6b6b" : "#b00020" }}>{error}</div>}

          <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate("/admin/users")}
              style={ghostButtonStyle}
              title="Voltar"
              onMouseEnter={(event) => {
                event.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.opacity = "0.9";
              }}
            >
              Voltar
            </button>
            <button
              onClick={save}
              disabled={busy}
              style={{ ...buttonStyle, opacity: busy ? 0.7 : buttonStyle.opacity }}
              title="Salvar alterações"
              onMouseEnter={(event) => {
                event.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.opacity = "0.9";
              }}
            >
              {busy ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

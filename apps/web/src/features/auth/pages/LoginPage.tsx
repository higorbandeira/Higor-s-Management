import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/shared/ui/useTheme";
import { useAiSignature } from "@/shared/ui/useAiSignature";

export function LoginPage() {
  const { login, me } = useAuth();
  const navigate = useNavigate();

  const { theme, setTheme } = useTheme();
  useAiSignature("Login");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    if (me) navigate("/", { replace: true });
  }, [me, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(nickname, password);
      navigate("/", { replace: true });
    } catch {
      setError("Nickname ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme === "light" ? "#f5f5f5" : "#0b0b0b",
        padding: 24,
        fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
      }}
    >
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
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 32,
          borderRadius: 32,
          background: theme === "light" ? "#ffffff" : "#111111",
          color: theme === "light" ? "#111111" : "#f5f5f5",
          boxShadow:
            theme === "light"
              ? "0 24px 60px rgba(0,0,0,0.15)"
              : "0 24px 60px rgba(0,0,0,0.6)",
          border: theme === "light" ? "1px solid #e0e0e0" : "1px solid #2b2b2b",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Entrar</h1>
            <p style={{ marginTop: 8, marginBottom: 0, color: theme === "light" ? "#424242" : "#bdbdbd" }}>
              Use seu nickname e senha para continuar.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
              Nickname
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Seu nickname"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 16,
                border: theme === "light" ? "1px solid #d0d0d0" : "1px solid #333333",
                background: theme === "light" ? "#ffffff" : "#0f0f0f",
                color: theme === "light" ? "#111111" : "#f5f5f5",
                outline: "none",
                fontSize: 14,
                transition: "border 0.2s ease, box-shadow 0.2s ease",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 16,
                border: theme === "light" ? "1px solid #d0d0d0" : "1px solid #333333",
                background: theme === "light" ? "#ffffff" : "#0f0f0f",
                color: theme === "light" ? "#111111" : "#f5f5f5",
                outline: "none",
                fontSize: 14,
                transition: "border 0.2s ease, box-shadow 0.2s ease",
              }}
            />
          </div>

          {error && <div style={{ marginBottom: 16, color: theme === "light" ? "#b00020" : "#ff6b6b" }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            title="Enviar credenciais"
            onMouseEnter={(event) => {
              event.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.opacity = "0.9";
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 999,
              border: "none",
              background: theme === "light" ? "#111111" : "#ffffff",
              color: theme === "light" ? "#ffffff" : "#111111",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
              opacity: 0.9,
              transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
              boxShadow: theme === "light" ? "0 8px 16px rgba(0,0,0,0.15)" : "0 8px 16px rgba(0,0,0,0.4)",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 12, color: theme === "light" ? "#616161" : "#9e9e9e" }}>
          * Usuários são criados apenas pelo ADMIN.
        </p>
      </div>
    </div>
  );
}

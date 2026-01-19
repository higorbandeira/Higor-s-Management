import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

export function LoginPage() {
  const { login, me } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 32,
          borderRadius: 28,
          background: theme === "light" ? "#ffffff" : "#111111",
          color: theme === "light" ? "#111111" : "#f5f5f5",
          boxShadow:
            theme === "light"
              ? "0 24px 60px rgba(0,0,0,0.15)"
              : "0 24px 60px rgba(0,0,0,0.6)",
          border: theme === "light" ? "1px solid #e0e0e0" : "1px solid #2b2b2b",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Entrar</h1>
          <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="theme"
                checked={theme === "light"}
                onChange={() => setTheme("light")}
              />
              Claro
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="theme"
                checked={theme === "dark"}
                onChange={() => setTheme("dark")}
              />
              Escuro
            </label>
          </div>
        </div>

        <p style={{ marginTop: 8, marginBottom: 24, color: theme === "light" ? "#424242" : "#bdbdbd" }}>
          Use seu nickname e senha para continuar.
        </p>

        <form onSubmit={handleSubmit}>
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
              }}
            />
          </div>

          {error && <div style={{ marginBottom: 16, color: theme === "light" ? "#b00020" : "#ff6b6b" }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
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

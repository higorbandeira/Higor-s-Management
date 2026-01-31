import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { getAccessToken } from "@/shared/api/http";
import { useTheme } from "@/shared/ui/useTheme";
import { useAiSignature } from "@/shared/ui/useAiSignature";

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  createdAt: string;
};

export function ChatPage() {
  const { me, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  useAiSignature("Chat / Geral");
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || wsRef.current) return;
    const wsUrl = `${window.location.origin.replace("http", "ws")}/api/ws/chat?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "state") {
          setMessages(payload.messages ?? []);
        }
      } catch {
        // ignore invalid payloads
      }
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  function sendMessage(content: string) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (!me) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    ws.send(
      JSON.stringify({
        type: "message",
        payload: {
          sender: me.nickname,
          text: trimmed,
        },
      })
    );
  }

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  }

  function handleQuickMessage(value: string) {
    sendMessage(value);
  }

  function handleDiceRoll() {
    const roll = Math.floor(Math.random() * 20) + 1;
    handleQuickMessage(`🎲 rolou 1d20 e tirou ${roll}`);
  }

  const isDark = theme === "dark";
  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#0b0b0b" : "#f5f5f5",
    fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
    padding: "24px",
  };
  const cardStyle = {
    background: isDark ? "#111111" : "#ffffff",
    borderRadius: 24,
    padding: 20,
    border: isDark ? "1px solid #2a2a2a" : "1px solid #eeeeee",
    boxShadow: isDark ? "0 18px 40px rgba(0,0,0,0.45)" : "0 18px 40px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };
  const buttonStyle = {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    background: isDark ? "#f5f5f5" : "#1f1f1f",
    color: isDark ? "#1f1f1f" : "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    opacity: 0.92,
    transition: "opacity 0.2s ease, transform 0.2s ease",
    boxShadow: isDark ? "0 6px 12px rgba(0,0,0,0.35)" : "0 6px 12px rgba(0,0,0,0.15)",
  };
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 16,
    border: isDark ? "1px solid #303030" : "1px solid #d8d8d8",
    background: isDark ? "#0f0f0f" : "#ffffff",
    color: isDark ? "#f5f5f5" : "#111111",
    fontSize: 14,
    boxShadow: isDark ? "inset 0 1px 2px rgba(0,0,0,0.4)" : "inset 0 1px 2px rgba(0,0,0,0.08)",
  };
  const surfacePanelStyle = {
    borderRadius: 18,
    border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
    padding: 16,
    background: isDark ? "#0f0f0f" : "#fafafa",
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  };

  const groupedMessages = useMemo(() => messages.slice(-80), [messages]);

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

      <div style={{ maxWidth: 960, margin: "60px auto 0", display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, color: isDark ? "#ffffff" : "#111111" }}>Chat geral</h1>
            <p style={{ marginTop: 6, color: isDark ? "#bdbdbd" : "#616161" }}>
              Todos os usuários ficam juntos aqui para conversas rápidas e rolagens.
            </p>
          </div>
          <button
            onClick={logout}
            style={{ ...buttonStyle, background: "transparent", border: `1px solid ${isDark ? "#ffffff" : "#111111"}`, color: isDark ? "#ffffff" : "#111111", boxShadow: "none" }}
            title="Sair"
          >
            Sair
          </button>
        </div>

        <div style={{ ...cardStyle, minHeight: 360, height: "calc(100vh - 200px)" }}>
          <div style={surfacePanelStyle}>
            {groupedMessages.length === 0 ? (
              <div style={{ color: isDark ? "#bdbdbd" : "#616161" }}>
                Nenhuma mensagem ainda. Seja o primeiro a falar!
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10, overflowY: "auto", paddingRight: 6, flex: 1 }}>
                {groupedMessages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      background: isDark ? "#151515" : "#ffffff",
                      borderRadius: 14,
                      padding: "10px 12px",
                      border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
                      boxShadow: isDark ? "0 4px 10px rgba(0,0,0,0.35)" : "0 4px 10px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontSize: 12, color: isDark ? "#bdbdbd" : "#616161" }}>
                      {message.sender} · {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                    <div style={{ fontSize: 14, color: isDark ? "#f5f5f5" : "#111111" }}>{message.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isActionsOpen && (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => handleQuickMessage("👋 Olá pessoal!")}
                style={buttonStyle}
              >
                Cumprimentar
              </button>
              <button type="button" onClick={handleDiceRoll} style={buttonStyle}>
                Rolar d20
              </button>
              <button
                type="button"
                onClick={() => handleQuickMessage("✨ Fazendo uma ação incrível no campo!")}
                style={buttonStyle}
              >
                Ação rápida
              </button>
            </div>
          )}

          <div style={{ display: "grid", gap: 12 }}>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Digite sua mensagem..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                onClick={() => setIsActionsOpen((prev) => !prev)}
                style={{
                  ...buttonStyle,
                  background: "transparent",
                  border: `1px solid ${isDark ? "#ffffff" : "#111111"}`,
                  color: isDark ? "#ffffff" : "#111111",
                  boxShadow: "none",
                }}
                title="Abrir interações"
              >
                Interações
              </button>
              <button
                type="button"
                onClick={() => setText("")}
                style={{ ...buttonStyle, background: "transparent", border: `1px solid ${isDark ? "#ffffff" : "#111111"}`, color: isDark ? "#ffffff" : "#111111", boxShadow: "none" }}
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={handleSend}
                style={{ ...buttonStyle, width: 48, height: 48, padding: 0, borderRadius: 16, fontSize: 18 }}
                title="Enviar mensagem"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

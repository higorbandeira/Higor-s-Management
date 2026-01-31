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
    borderRadius: 20,
    padding: 20,
    border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
    boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.4)" : "0 16px 40px rgba(0,0,0,0.08)",
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
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: isDark ? "1px solid #333333" : "1px solid #d0d0d0",
    background: isDark ? "#0f0f0f" : "#ffffff",
    color: isDark ? "#f5f5f5" : "#111111",
    fontSize: 14,
  };

  const groupedMessages = useMemo(() => messages.slice(-80), [messages]);

  return (
    <div style={pageStyle}>
      <div
        style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
          fontSize: 10,
          color: isDark ? "#f5f5f5" : "#111111",
          background: isDark ? "#111111" : "#ffffff",
          border: isDark ? "1px solid #2b2b2b" : "1px solid #e0e0e0",
          borderRadius: 999,
          padding: "6px 12px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="radio"
            name="theme"
            checked={theme === "light"}
            onChange={() => setTheme("light")}
          />
          white
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="radio"
            name="theme"
            checked={theme === "dark"}
            onChange={() => setTheme("dark")}
          />
          black
        </label>
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
            style={{ ...buttonStyle, background: "transparent", border: `1px solid ${isDark ? "#ffffff" : "#111111"}`, color: isDark ? "#ffffff" : "#111111" }}
            title="Sair"
          >
            Sair
          </button>
        </div>

        <div style={{ ...cardStyle, minHeight: 360, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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

          <div
            style={{
              borderRadius: 16,
              border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
              padding: 16,
              minHeight: 240,
              background: isDark ? "#0f0f0f" : "#fafafa",
              display: "grid",
              gap: 10,
              alignContent: "start",
            }}
          >
            {groupedMessages.length === 0 ? (
              <div style={{ color: isDark ? "#bdbdbd" : "#616161" }}>
                Nenhuma mensagem ainda. Seja o primeiro a falar!
              </div>
            ) : (
              groupedMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    background: isDark ? "#151515" : "#ffffff",
                    borderRadius: 12,
                    padding: "8px 12px",
                    border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
                  }}
                >
                  <div style={{ fontSize: 12, color: isDark ? "#bdbdbd" : "#616161" }}>
                    {message.sender} · {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: 14, color: isDark ? "#f5f5f5" : "#111111" }}>{message.text}</div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Digite sua mensagem..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                type="button"
                onClick={() => setText("")}
                style={{ ...buttonStyle, background: "transparent", border: `1px solid ${isDark ? "#ffffff" : "#111111"}`, color: isDark ? "#ffffff" : "#111111" }}
              >
                Limpar
              </button>
              <button type="button" onClick={handleSend} style={buttonStyle}>
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

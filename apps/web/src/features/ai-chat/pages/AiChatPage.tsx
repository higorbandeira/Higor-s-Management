import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { getAccessToken, getWsBaseUrl } from "@/shared/api/http";
import { useTheme } from "@/shared/ui/useTheme";
import { useAiSignature } from "@/shared/ui/useAiSignature";

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  createdAt: string;
  tag?: "USER" | "AI";
};

type StatusState = "running" | "idle";

export function AiChatPage() {
  const { me, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  useAiSignature("Chat / AI CHAT");
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<StatusState>("idle");
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || wsRef.current) return;
    const wsUrl = `${getWsBaseUrl()}/ws/ai-chat?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "state") {
          setMessages(payload.messages ?? []);
        }
        if (payload?.type === "status") {
          setStatus(payload.state === "running" ? "running" : "idle");
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
          tag: "AI_CHAT",
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

  const isDark = theme === "dark";
  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#0b0b0b" : "#f5f5f5",
    fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
    padding: "clamp(16px, 4vw, 32px)",
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
  const statusLabel = status === "running" ? "Processo rodando" : "Processo parado";
  const statusColor = status === "running" ? "#00c853" : isDark ? "#bdbdbd" : "#616161";

  return (
    <div style={pageStyle}>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
        aria-label="Alternar tema"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 52,
          height: 52,
          borderRadius: 999,
          border: "none",
          background: isDark ? "#1f1f1f" : "#ffffff",
          color: isDark ? "#90caf9" : "#ff8f00",
          fontSize: 20,
          cursor: "pointer",
          boxShadow: isDark ? "0 16px 30px rgba(0,0,0,0.45)" : "0 16px 30px rgba(0,0,0,0.2)",
          zIndex: 20,
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </button>

      <div style={{ maxWidth: 960, margin: "60px auto 0", width: "100%", display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, color: isDark ? "#ffffff" : "#111111", fontSize: "clamp(24px, 3vw, 32px)" }}>
              AI CHAT
            </h1>
            <p style={{ marginTop: 6, color: isDark ? "#bdbdbd" : "#616161", fontSize: "clamp(13px, 2vw, 15px)" }}>
              Converse com a LLM integrada usando o módulo dedicado.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                background: isDark ? "#1b1b1b" : "#f1f1f1",
                color: statusColor,
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {statusLabel}
            </div>
            <button
              onClick={logout}
              style={{ ...buttonStyle, background: "transparent", border: `1px solid ${isDark ? "#ffffff" : "#111111"}`, color: isDark ? "#ffffff" : "#111111", boxShadow: "none" }}
              title="Sair"
            >
              Sair
            </button>
          </div>
        </div>

        <div style={{ ...cardStyle, minHeight: 360, height: "calc(100vh - 220px)" }}>
          <div style={surfacePanelStyle}>
            {groupedMessages.length === 0 ? (
              <div style={{ color: isDark ? "#bdbdbd" : "#616161" }}>
                Nenhuma mensagem ainda. Inicie a conversa com a AI.
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
                      {message.sender}
                      {message.tag === "AI" && " · AI"}
                      {message.tag === "USER" && " · Você"} · {new Date(message.createdAt).toLocaleTimeString()}
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
                onClick={() => handleQuickMessage("Olá! Preciso de ajuda com o sistema.")}
                style={buttonStyle}
              >
                Pedir ajuda
              </button>
              <button type="button" onClick={() => handleQuickMessage("Como faço login no sistema?")} style={buttonStyle}>
                Dúvida de login
              </button>
              <button
                type="button"
                onClick={() => handleQuickMessage("Quais módulos estão disponíveis?")}
                style={buttonStyle}
              >
                Ver módulos
              </button>
            </div>
          )}

          <div style={{ position: "relative" }}>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Digite sua mensagem..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical", paddingBottom: 58 }}
            />
            <div
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                display: "flex",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setIsActionsOpen((prev) => !prev)}
                style={{
                  ...buttonStyle,
                  padding: "6px 10px",
                  borderRadius: 12,
                  background: isDark ? "#1a1a1a" : "#f1f1f1",
                  color: isDark ? "#f5f5f5" : "#111111",
                  boxShadow: "none",
                }}
                title="Abrir interações"
              >
                ✨
              </button>
              <button
                type="button"
                onClick={() => setText("")}
                style={{
                  ...buttonStyle,
                  padding: "6px 10px",
                  borderRadius: 12,
                  background: isDark ? "#1a1a1a" : "#f1f1f1",
                  color: isDark ? "#f5f5f5" : "#111111",
                  boxShadow: "none",
                }}
                title="Limpar mensagem"
              >
                ⎚
              </button>
            </div>
            <button
              type="button"
              onClick={handleSend}
              title="Enviar mensagem"
              style={{
                ...buttonStyle,
                position: "absolute",
                right: 12,
                bottom: 12,
                width: 40,
                height: 40,
                padding: 0,
                borderRadius: 14,
                fontSize: 18,
                boxShadow: "none",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

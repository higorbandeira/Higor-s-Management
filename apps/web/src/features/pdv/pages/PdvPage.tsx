import { useMemo } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/shared/ui/useTheme";
import { useAiSignature } from "@/shared/ui/useAiSignature";

type ActionCard = {
  title: string;
  description: string;
  steps: string[];
  tone: "primary" | "secondary" | "accent";
};

type QuickAction = {
  label: string;
  detail: string;
};

export function PdvPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  useAiSignature("PDV / Frente de Caixa");

  const isDark = theme === "dark";
  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#0b0b0b" : "#f5f5f5",
    padding: "clamp(20px, 4vw, 32px)",
    fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
  };
  const containerStyle = {
    maxWidth: 1080,
    margin: "0 auto",
    display: "grid",
    gap: 20,
  };
  const cardStyle = {
    background: isDark ? "#111111" : "#ffffff",
    borderRadius: 22,
    padding: 20,
    border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
    boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.4)" : "0 16px 40px rgba(0,0,0,0.08)",
  };
  const pillStyle = {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    border: isDark ? "1px solid #2a2a2a" : "1px solid #dcdcdc",
    color: isDark ? "#f5f5f5" : "#111111",
    background: isDark ? "#141414" : "#fafafa",
  };
  const buttonStyle = {
    padding: "10px 18px",
    borderRadius: 999,
    border: "none",
    background: isDark ? "#ffffff" : "#111111",
    color: isDark ? "#111111" : "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
    opacity: 0.92,
    transition: "opacity 0.2s ease",
  };

  const actionCards: ActionCard[] = useMemo(
    () => [
      {
        title: "Abertura de caixa",
        description: "Prepare o turno e deixe tudo pronto para vender com segurança.",
        steps: ["Conferir fundo de troco", "Identificar operador", "Registrar horário de abertura"],
        tone: "primary",
      },
      {
        title: "Fluxo de venda",
        description: "Registre cada item, aplique regras comerciais e finalize rapidamente.",
        steps: ["Adicionar produtos", "Aplicar descontos", "Selecionar cliente"],
        tone: "accent",
      },
      {
        title: "Pagamentos",
        description: "Finalize com múltiplas formas e controle os recebimentos.",
        steps: ["Pix, cartão ou dinheiro", "Separar parcelas", "Emitir comprovante"],
        tone: "secondary",
      },
      {
        title: "Pós-venda",
        description: "Lide com trocas, devoluções e cancelamentos do dia a dia.",
        steps: ["Cancelar venda", "Registrar devolução", "Emitir estorno"],
        tone: "primary",
      },
      {
        title: "Movimentação de caixa",
        description: "Registre sangrias, reforços e eventos do turno.",
        steps: ["Sangria", "Reforço de caixa", "Justificativas e responsável"],
        tone: "secondary",
      },
      {
        title: "Fechamento",
        description: "Finalize o expediente com conferência e relatórios.",
        steps: ["Conferir vendas", "Comparar recebimentos", "Fechar caixa"],
        tone: "accent",
      },
    ],
    []
  );

  const quickActions: QuickAction[] = useMemo(
    () => [
      { label: "Nova venda", detail: "Iniciar atendimento com carrinho vazio" },
      { label: "Consultar preço", detail: "Buscar produto por código ou nome" },
      { label: "Aplicar desconto", detail: "Cupom ou percentual autorizado" },
      { label: "Adicionar cliente", detail: "CPF, telefone ou cadastro rápido" },
      { label: "Emitir NF", detail: "Gerar nota e enviar por e-mail" },
      { label: "Relatório do dia", detail: "Resumo de vendas e movimentações" },
    ],
    []
  );

  const toneStyles: Record<ActionCard["tone"], { border: string; background: string }> = {
    primary: {
      border: isDark ? "1px solid #3a3a3a" : "1px solid #e2e8f0",
      background: isDark ? "rgba(32,32,32,0.7)" : "#f8fafc",
    },
    secondary: {
      border: isDark ? "1px solid #2f3a3b" : "1px solid #d7e3e4",
      background: isDark ? "rgba(24,32,34,0.75)" : "#f2f7f8",
    },
    accent: {
      border: isDark ? "1px solid #3b2f3a" : "1px solid #ebd9ef",
      background: isDark ? "rgba(36,26,38,0.8)" : "#fbf5fd",
    },
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

      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, color: isDark ? "#ffffff" : "#111111", fontSize: "clamp(26px, 3vw, 32px)" }}>
              Módulo PDV
            </h1>
            <p style={{ marginTop: 6, color: isDark ? "#bdbdbd" : "#616161", fontSize: "clamp(13px, 2vw, 15px)" }}>
              Rotinas essenciais para vendas rápidas, controle de caixa e pós-venda.
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

        <div style={{ ...cardStyle, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <span style={{ ...pillStyle, borderColor: isDark ? "#3a3a3a" : "#dcdcdc" }}>Caixa aberto</span>
            <span style={{ ...pillStyle, color: isDark ? "#90caf9" : "#1565c0" }}>Operador: turno A</span>
            <span style={{ ...pillStyle, color: isDark ? "#a5d6a7" : "#1b5e20" }}>Meta do dia: R$ 12.000</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {quickActions.map((action) => (
              <div
                key={action.label}
                style={{
                  borderRadius: 16,
                  padding: "14px 16px",
                  background: isDark ? "#141414" : "#fafafa",
                  border: isDark ? "1px solid #2b2b2b" : "1px solid #ededed",
                  display: "grid",
                  gap: 6,
                }}
              >
                <strong style={{ color: isDark ? "#ffffff" : "#111111" }}>{action.label}</strong>
                <span style={{ fontSize: 13, color: isDark ? "#bdbdbd" : "#616161" }}>{action.detail}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {actionCards.map((card) => (
            <div key={card.title} style={{ ...cardStyle, ...toneStyles[card.tone], display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <h2 style={{ margin: 0, color: isDark ? "#ffffff" : "#111111", fontSize: 18 }}>{card.title}</h2>
                <p style={{ margin: 0, color: isDark ? "#bdbdbd" : "#616161", fontSize: 14 }}>{card.description}</p>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: isDark ? "#d7d7d7" : "#424242", fontSize: 13, display: "grid", gap: 6 }}>
                {card.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

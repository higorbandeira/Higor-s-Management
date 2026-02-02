import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/shared/ui/useTheme";
import { useAiSignature } from "@/shared/ui/useAiSignature";
import {
  createFinanceId,
  FinanceCategory,
  FinanceRecord,
  loadFinanceState,
  saveFinanceState,
} from "@/features/financeiro/data/financeStorage";

const periods = [
  { id: "day", label: "Dia", days: 1 },
  { id: "week", label: "Semana", days: 7 },
  { id: "month", label: "Mensal", days: 30 },
] as const;

type PeriodFilter = (typeof periods)[number]["id"];

export function FinanceiroDashboardPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  useAiSignature("Financeiro / Dashboard");

  const initialState = useMemo(() => loadFinanceState(), []);
  const [categories, setCategories] = useState<FinanceCategory[]>(initialState.categories);
  const [records, setRecords] = useState<FinanceRecord[]>(initialState.records);

  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(initialState.categories[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const isDark = theme === "dark";
  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#0b0b0b" : "#f5f5f5",
    padding: "clamp(20px, 4vw, 32px)",
    fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
  };
  const containerStyle = {
    maxWidth: 1120,
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

  const filteredRecords = useMemo(() => {
    const now = new Date();
    const selectedPeriod = periods.find((item) => item.id === period) ?? periods[2];
    const cutoff = new Date(now.getTime() - selectedPeriod.days * 24 * 60 * 60 * 1000);
    return records.filter((record) => {
      const recordDate = new Date(record.date);
      const matchesPeriod = recordDate >= cutoff;
      const matchesCategory = categoryFilter === "all" || record.categoryId === categoryFilter;
      return matchesPeriod && matchesCategory;
    });
  }, [records, period, categoryFilter]);

  const totalsByCategory = useMemo(() => {
    const grouped = filteredRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.categoryId] = (acc[record.categoryId] ?? 0) + record.amount;
      return acc;
    }, {});
    return categories
      .filter((category) => grouped[category.id])
      .map((category) => ({
        ...category,
        total: grouped[category.id],
      }));
  }, [filteredRecords, categories]);

  const totalSpend = useMemo(
    () => filteredRecords.reduce((acc, record) => acc + record.amount, 0),
    [filteredRecords]
  );

  function persistState(nextCategories: FinanceCategory[], nextRecords: FinanceRecord[]) {
    saveFinanceState({ categories: nextCategories, records: nextRecords });
  }

  function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount || !categoryId) return;
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) return;
    const nextRecord: FinanceRecord = {
      id: createFinanceId("rec"),
      description: description.trim(),
      amount: numericAmount,
      date: new Date(date).toISOString(),
      categoryId,
    };
    const nextRecords = [nextRecord, ...records];
    setRecords(nextRecords);
    persistState(categories, nextRecords);
    setDescription("");
    setAmount("");
    setIsFormOpen(false);
  }

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
              Módulo Financeiro
            </h1>
            <p style={{ marginTop: 6, color: isDark ? "#bdbdbd" : "#616161", fontSize: "clamp(13px, 2vw, 15px)" }}>
              Acompanhe seus gastos com categorias claras, filtros rápidos e indicadores essenciais.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => navigate("/financeiro/registros")}
              style={{
                ...buttonStyle,
                background: "transparent",
                border: `1px solid ${isDark ? "#ffffff" : "#111111"}`,
                color: isDark ? "#ffffff" : "#111111",
              }}
            >
              Ver registros
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen((open) => !open)}
              style={buttonStyle}
            >
              {isFormOpen ? "Fechar" : "Adicionar registro"}
            </button>
            <button
              onClick={logout}
              style={{ ...buttonStyle, background: "transparent", border: `1px solid ${isDark ? "#ffffff" : "#111111"}`, color: isDark ? "#ffffff" : "#111111" }}
              title="Sair"
            >
              Sair
            </button>
          </div>
        </div>

        <div style={{ ...cardStyle, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {periods.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriod(item.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: period === item.id ? "none" : `1px solid ${isDark ? "#2b2b2b" : "#dddddd"}`,
                  background: period === item.id ? (isDark ? "#ffffff" : "#111111") : "transparent",
                  color: period === item.id ? (isDark ? "#111111" : "#ffffff") : isDark ? "#ffffff" : "#111111",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: `1px solid ${isDark ? "#2b2b2b" : "#dddddd"}`,
                background: isDark ? "#121212" : "#ffffff",
                color: isDark ? "#ffffff" : "#111111",
                fontWeight: 600,
              }}
            >
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <div
              style={{
                borderRadius: 16,
                padding: "14px 16px",
                background: isDark ? "#141414" : "#fafafa",
                border: isDark ? "1px solid #2b2b2b" : "1px solid #ededed",
                display: "grid",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 12, color: isDark ? "#bdbdbd" : "#757575" }}>Total filtrado</span>
              <strong style={{ fontSize: 22, color: isDark ? "#ffffff" : "#111111" }}>
                {totalSpend.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </strong>
            </div>
            <div
              style={{
                borderRadius: 16,
                padding: "14px 16px",
                background: isDark ? "#141414" : "#fafafa",
                border: isDark ? "1px solid #2b2b2b" : "1px solid #ededed",
                display: "grid",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 12, color: isDark ? "#bdbdbd" : "#757575" }}>Registros no período</span>
              <strong style={{ fontSize: 22, color: isDark ? "#ffffff" : "#111111" }}>{filteredRecords.length}</strong>
            </div>
            <div
              style={{
                borderRadius: 16,
                padding: "14px 16px",
                background: isDark ? "#141414" : "#fafafa",
                border: isDark ? "1px solid #2b2b2b" : "1px solid #ededed",
                display: "grid",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 12, color: isDark ? "#bdbdbd" : "#757575" }}>Categoria mais ativa</span>
              <strong style={{ fontSize: 18, color: isDark ? "#ffffff" : "#111111" }}>
                {totalsByCategory[0]?.name ?? "Sem dados"}
              </strong>
            </div>
          </div>
        </div>

        {isFormOpen && (
          <form
            onSubmit={handleAddRecord}
            style={{
              ...cardStyle,
              display: "grid",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 220 }}>
                <span style={{ fontWeight: 600, color: isDark ? "#ffffff" : "#111111" }}>Descrição</span>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ex.: Conta de energia"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${isDark ? "#2b2b2b" : "#dcdcdc"}`,
                    background: isDark ? "#121212" : "#ffffff",
                    color: isDark ? "#ffffff" : "#111111",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 6, width: 160 }}>
                <span style={{ fontWeight: 600, color: isDark ? "#ffffff" : "#111111" }}>Valor</span>
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0,00"
                  type="number"
                  step="0.01"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${isDark ? "#2b2b2b" : "#dcdcdc"}`,
                    background: isDark ? "#121212" : "#ffffff",
                    color: isDark ? "#ffffff" : "#111111",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 6, width: 200 }}>
                <span style={{ fontWeight: 600, color: isDark ? "#ffffff" : "#111111" }}>Categoria</span>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${isDark ? "#2b2b2b" : "#dcdcdc"}`,
                    background: isDark ? "#121212" : "#ffffff",
                    color: isDark ? "#ffffff" : "#111111",
                  }}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 6, width: 180 }}>
                <span style={{ fontWeight: 600, color: isDark ? "#ffffff" : "#111111" }}>Data</span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${isDark ? "#2b2b2b" : "#dcdcdc"}`,
                    background: isDark ? "#121212" : "#ffffff",
                    color: isDark ? "#ffffff" : "#111111",
                  }}
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                style={{
                  ...buttonStyle,
                  background: "transparent",
                  border: `1px solid ${isDark ? "#ffffff" : "#111111"}`,
                  color: isDark ? "#ffffff" : "#111111",
                }}
              >
                Cancelar
              </button>
              <button type="submit" style={buttonStyle}>
                Salvar registro
              </button>
            </div>
          </form>
        )}

        <div style={{ ...cardStyle, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, color: isDark ? "#ffffff" : "#111111" }}>Resumo por categoria</h2>
              <p style={{ marginTop: 4, color: isDark ? "#bdbdbd" : "#757575" }}>
                Compare rapidamente os maiores centros de custo no período selecionado.
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {totalsByCategory.map((category) => (
              <div
                key={category.id}
                style={{
                  borderRadius: 16,
                  padding: "14px 16px",
                  background: isDark ? "#141414" : "#fafafa",
                  border: isDark ? "1px solid #2b2b2b" : "1px solid #ededed",
                  display: "grid",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 12, color: category.color }}>{category.name}</span>
                <strong style={{ fontSize: 20, color: isDark ? "#ffffff" : "#111111" }}>
                  {category.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </strong>
              </div>
            ))}
            {totalsByCategory.length === 0 && (
              <p style={{ margin: 0, color: isDark ? "#bdbdbd" : "#757575" }}>
                Nenhum gasto encontrado para este filtro.
              </p>
            )}
          </div>
        </div>

        <div style={{ ...cardStyle, display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, color: isDark ? "#ffffff" : "#111111" }}>Sequência de evoluções sugeridas</h2>
          <ol style={{ margin: 0, paddingLeft: 18, color: isDark ? "#d0d0d0" : "#4f4f4f", lineHeight: 1.6 }}>
            <li>Alertas inteligentes para metas de gastos e limites por categoria.</li>
            <li>Importação automática de extratos bancários e cartões.</li>
            <li>Relatórios comparativos mês a mês com metas e tendências.</li>
            <li>Integração com notificações push para lembrar vencimentos.</li>
            <li>Compartilhamento de categorias com múltiplos usuários da conta.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

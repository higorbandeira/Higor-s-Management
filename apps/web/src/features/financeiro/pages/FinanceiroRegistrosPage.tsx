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

const colorOptions = ["#4caf50", "#2196f3", "#ff9800", "#9c27b0", "#f44336", "#00bcd4", "#795548"];

export function FinanceiroRegistrosPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  useAiSignature("Financeiro / Registros");

  const initialState = useMemo(() => loadFinanceState(), []);
  const [categories, setCategories] = useState<FinanceCategory[]>(initialState.categories);
  const [records, setRecords] = useState<FinanceRecord[]>(initialState.records);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<FinanceRecord>>({});

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(initialState.categories[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(colorOptions[0]);

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
    setIsAddOpen(false);
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName.trim()) return;
    const nextCategory: FinanceCategory = {
      id: createFinanceId("cat"),
      name: categoryName.trim(),
      color: categoryColor,
    };
    const nextCategories = [...categories, nextCategory];
    setCategories(nextCategories);
    persistState(nextCategories, records);
    setCategoryName("");
    setCategoryColor(colorOptions[0]);
    setIsCategoryOpen(false);
  }

  function startEdit(record: FinanceRecord) {
    if (editId && editId !== record.id) return;
    setEditId(record.id);
    setDraft({ ...record, date: record.date.slice(0, 10) });
  }

  function cancelEdit() {
    setEditId(null);
    setDraft({});
  }

  function saveEdit(recordId: string) {
    if (!draft.description?.trim() || !draft.amount || !draft.categoryId || !draft.date) return;
    const nextRecords = records.map((record) =>
      record.id === recordId
        ? {
            ...record,
            description: String(draft.description).trim(),
            amount: Number(draft.amount),
            categoryId: String(draft.categoryId),
            date: new Date(String(draft.date)).toISOString(),
          }
        : record
    );
    setRecords(nextRecords);
    persistState(categories, nextRecords);
    cancelEdit();
  }

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [records]
  );

  const categoryMap = useMemo(() => new Map(categories.map((cat) => [cat.id, cat])), [categories]);

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
              Registros financeiros
            </h1>
            <p style={{ marginTop: 6, color: isDark ? "#bdbdbd" : "#616161", fontSize: "clamp(13px, 2vw, 15px)" }}>
              Gerencie gastos, categorias e edite apenas uma linha por vez para manter o controle.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => navigate("/financeiro")}
              style={{
                ...buttonStyle,
                background: "transparent",
                border: `1px solid ${isDark ? "#ffffff" : "#111111"}`,
                color: isDark ? "#ffffff" : "#111111",
              }}
            >
              Voltar ao dashboard
            </button>
            <button type="button" onClick={() => setIsAddOpen((open) => !open)} style={buttonStyle}>
              {isAddOpen ? "Fechar" : "Adicionar registro"}
            </button>
            <button
              type="button"
              onClick={() => setIsCategoryOpen((open) => !open)}
              style={{
                ...buttonStyle,
                background: "transparent",
                border: `1px solid ${isDark ? "#ffffff" : "#111111"}`,
                color: isDark ? "#ffffff" : "#111111",
              }}
            >
              Cadastrar categoria
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

        {isAddOpen && (
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
                  placeholder="Ex.: Academia"
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
                onClick={() => setIsAddOpen(false)}
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

        {isCategoryOpen && (
          <form
            onSubmit={handleAddCategory}
            style={{
              ...cardStyle,
              display: "grid",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <label style={{ display: "grid", gap: 6, flex: 1, minWidth: 220 }}>
                <span style={{ fontWeight: 600, color: isDark ? "#ffffff" : "#111111" }}>Nome da categoria</span>
                <input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Ex.: Saúde"
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
                <span style={{ fontWeight: 600, color: isDark ? "#ffffff" : "#111111" }}>Cor</span>
                <select
                  value={categoryColor}
                  onChange={(event) => setCategoryColor(event.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${isDark ? "#2b2b2b" : "#dcdcdc"}`,
                    background: isDark ? "#121212" : "#ffffff",
                    color: isDark ? "#ffffff" : "#111111",
                  }}
                >
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(false)}
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
                Salvar categoria
              </button>
            </div>
          </form>
        )}

        <div style={{ ...cardStyle, display: "grid", gap: 16 }}>
          <h2 style={{ margin: 0, color: isDark ? "#ffffff" : "#111111" }}>Lista de registros</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {sortedRecords.map((record) => {
              const category = categoryMap.get(record.categoryId);
              const isEditing = editId === record.id;
              return (
                <div
                  key={record.id}
                  style={{
                    borderRadius: 16,
                    padding: "14px 16px",
                    background: isDark ? "#141414" : "#fafafa",
                    border: isDark ? "1px solid #2b2b2b" : "1px solid #ededed",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", alignItems: "center" }}>
                    {isEditing ? (
                      <input
                        value={draft.description ?? ""}
                        onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: `1px solid ${isDark ? "#2b2b2b" : "#dcdcdc"}`,
                          background: isDark ? "#121212" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111111",
                        }}
                      />
                    ) : (
                      <strong style={{ color: isDark ? "#ffffff" : "#111111" }}>{record.description}</strong>
                    )}
                    {isEditing ? (
                      <input
                        type="number"
                        value={draft.amount ?? ""}
                        onChange={(event) => setDraft((prev) => ({ ...prev, amount: event.target.value }))}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: `1px solid ${isDark ? "#2b2b2b" : "#dcdcdc"}`,
                          background: isDark ? "#121212" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111111",
                        }}
                      />
                    ) : (
                      <span style={{ color: isDark ? "#d0d0d0" : "#424242" }}>
                        {record.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    )}
                    {isEditing ? (
                      <select
                        value={draft.categoryId ?? ""}
                        onChange={(event) => setDraft((prev) => ({ ...prev, categoryId: event.target.value }))}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: `1px solid ${isDark ? "#2b2b2b" : "#dcdcdc"}`,
                          background: isDark ? "#121212" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111111",
                        }}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: category?.color ?? (isDark ? "#ffffff" : "#111111") }}>
                        {category?.name ?? "Sem categoria"}
                      </span>
                    )}
                    {isEditing ? (
                      <input
                        type="date"
                        value={draft.date ?? ""}
                        onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: `1px solid ${isDark ? "#2b2b2b" : "#dcdcdc"}`,
                          background: isDark ? "#121212" : "#ffffff",
                          color: isDark ? "#ffffff" : "#111111",
                        }}
                      />
                    ) : (
                      <span style={{ color: isDark ? "#bdbdbd" : "#616161" }}>
                        {new Date(record.date).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(record.id)}
                          style={buttonStyle}
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            ...buttonStyle,
                            background: "transparent",
                            border: `1px solid ${isDark ? "#ffffff" : "#111111"}`,
                            color: isDark ? "#ffffff" : "#111111",
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(record)}
                        style={{
                          ...buttonStyle,
                          background: editId ? "#9e9e9e" : isDark ? "#ffffff" : "#111111",
                          color: editId ? "#f5f5f5" : isDark ? "#111111" : "#ffffff",
                          cursor: editId ? "not-allowed" : "pointer",
                        }}
                        disabled={Boolean(editId)}
                      >
                        Liberar edição
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {sortedRecords.length === 0 && (
              <p style={{ margin: 0, color: isDark ? "#bdbdbd" : "#757575" }}>
                Nenhum registro encontrado. Adicione seu primeiro gasto.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

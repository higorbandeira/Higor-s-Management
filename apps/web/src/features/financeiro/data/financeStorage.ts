export type FinanceCategory = {
  id: string;
  name: string;
  color: string;
};

export type FinanceRecord = {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
};

export type FinanceState = {
  categories: FinanceCategory[];
  records: FinanceRecord[];
};

const STORAGE_KEY = "financeiro.state";

const defaultState: FinanceState = {
  categories: [
    { id: "cat-supermercado", name: "Supermercado", color: "#4caf50" },
    { id: "cat-transporte", name: "Transporte", color: "#2196f3" },
    { id: "cat-lazer", name: "Lazer", color: "#ff9800" },
    { id: "cat-casa", name: "Casa", color: "#9c27b0" },
  ],
  records: [
    {
      id: "rec-1",
      description: "Feira do mês",
      amount: 420.5,
      date: new Date().toISOString(),
      categoryId: "cat-supermercado",
    },
    {
      id: "rec-2",
      description: "Uber semana",
      amount: 96.7,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      categoryId: "cat-transporte",
    },
    {
      id: "rec-3",
      description: "Streaming",
      amount: 39.9,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      categoryId: "cat-lazer",
    },
  ],
};

export function loadFinanceState(): FinanceState {
  if (typeof window === "undefined") return defaultState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState;
  try {
    const parsed = JSON.parse(raw) as FinanceState;
    if (!parsed.categories?.length) return defaultState;
    return parsed;
  } catch {
    return defaultState;
  }
}

export function saveFinanceState(state: FinanceState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createFinanceId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const MODULE_OPTIONS = [
  { value: "CHAT", label: "Chat geral", route: "/chat" },
  { value: "AI_CHAT", label: "AI CHAT", route: "/ai-chat" },
  { value: "DASHBOARD", label: "Campo RPG", route: "/dashboard" },
  { value: "PDV", label: "PDV", route: "/pdv" },
  { value: "FINANCEIRO", label: "Financeiro", route: "/financeiro" },
  { value: "DOOM", label: "Doom", route: "/doom" },
] as const;

export type ModuleKey = (typeof MODULE_OPTIONS)[number]["value"];

export function moduleToRoute(module?: ModuleKey) {
  const match = MODULE_OPTIONS.find((option) => option.value === module);
  return match?.route ?? "/chat";
}

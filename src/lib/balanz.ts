import {
  Zap,
  CreditCard,
  ShoppingCart,
  HeartPulse,
  Users,
  PartyPopper,
  Car,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "servicios"
  | "financiero"
  | "alimentacion"
  | "salud"
  | "personales"
  | "transporte"
  | "varios";

export type Category = {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  barClass: string;
  subcategories: string[];
};

export const MEMBERS = ["Ale", "Sebas", "Lisa", "Marco"] as const;
export type Member = (typeof MEMBERS)[number] | "Hogar";

export const CATEGORIES: Category[] = [
  {
    id: "servicios",
    label: "Servicios Básicos",
    icon: Zap,
    colorClass: "text-cat-services",
    bgClass: "bg-cat-services/12",
    barClass: "bg-cat-services",
    subcategories: ["ANDE", "Tigo", "Claro", "Alquiler", "Estacionamiento"],
  },
  {
    id: "financiero",
    label: "Financiero",
    icon: CreditCard,
    colorClass: "text-cat-transport",
    bgClass: "bg-cat-transport/12",
    barClass: "bg-cat-transport",
    subcategories: ["Coomecipar", "Ueno", "Préstamo", "SPS"],
  },
  {
    id: "alimentacion",
    label: "Alimentación y Súper",
    icon: ShoppingCart,
    colorClass: "text-cat-market",
    bgClass: "bg-cat-market/12",
    barClass: "bg-cat-market",
    subcategories: ["Super", "Comidas fuera", "Despensa"],
  },
  {
    id: "salud",
    label: "Salud y Bienestar",
    icon: HeartPulse,
    colorClass: "text-cat-pharmacy",
    bgClass: "bg-cat-pharmacy/12",
    barClass: "bg-cat-pharmacy",
    subcategories: ["Medicamentos", "Veterinaria Kira", "Consultas"],
  },
  {
    id: "personales",
    label: "Gastos Personales",
    icon: Users,
    colorClass: "text-cat-other",
    bgClass: "bg-cat-other/12",
    barClass: "bg-cat-other",
    subcategories: [...MEMBERS],
  },
  {
    id: "transporte",
    label: "Transporte",
    icon: Car,
    colorClass: "text-cat-travel",
    bgClass: "bg-cat-travel/12",
    barClass: "bg-cat-travel",
    subcategories: ["Gasolina", "Tarjeta Jaha", "Pasajes", "Mantenimiento"],
  },
  {
    id: "varios",
    label: "Varios y Diversión",
    icon: PartyPopper,
    colorClass: "text-cat-leisure",
    bgClass: "bg-cat-leisure/12",
    barClass: "bg-cat-leisure",
    subcategories: ["Feria", "Imprevistos", "Reparaciones", "Entretenimiento"],
  },
];

export const getCategory = (id: CategoryId): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]!;

export type Expense = {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: CategoryId;
  subcategory: string;
  member: Member;
  description: string;
};

type Seed = [day: number, CategoryId, string, Member, string, number];

// Base monthly pattern; amounts vary slightly per month.
const SEED: Seed[] = [
  [2, "servicios", "Alquiler", "Hogar", "Alquiler departamento Villa Morra", 3200000],
  [3, "servicios", "Estacionamiento", "Marco", "Estacionamiento mensual edificio", 350000],
  [5, "servicios", "ANDE", "Hogar", "Factura ANDE consumo luz", 486500],
  [6, "servicios", "Tigo", "Hogar", "Tigo Hogar cable + internet 300 Mb", 329000],
  [7, "servicios", "Claro", "Lisa", "Plan Claro línea móvil", 145000],
  [8, "financiero", "Coomecipar", "Marco", "Pago mínimo tarjeta Coomecipar", 1250000],
  [9, "financiero", "Ueno", "Lisa", "Pago tarjeta Ueno", 870000],
  [10, "financiero", "Préstamo", "Hogar", "Cuota préstamo personal 14/36", 1480000],
  [10, "financiero", "SPS", "Hogar", "Seguro médico SPS", 690000],
  [4, "alimentacion", "Super", "Hogar", "Compra quincenal Superseis", 1185000],
  [18, "alimentacion", "Super", "Hogar", "Compra quincenal Stock", 942300],
  [12, "alimentacion", "Comidas fuera", "Sebas", "Pizza viernes familiar", 185000],
  [22, "alimentacion", "Despensa", "Hogar", "Despensa del barrio: pan y lácteos", 96500],
  [11, "salud", "Medicamentos", "Marco", "Losartán + Metformina (Marco)", 238000],
  [15, "salud", "Medicamentos", "Lisa", "Antibiótico y analgésico (Lisa)", 124500],
  [16, "salud", "Veterinaria Kira", "Hogar", "Veterinaria Kira: vacuna y control", 210000],
  [20, "salud", "Consultas", "Ale", "Consulta pediatra Ale", 250000],
  [13, "personales", "Sebas", "Sebas", "Cuota colegio Sebas", 780000],
  [14, "personales", "Ale", "Ale", "Útiles y uniforme Ale", 165000],
  [19, "personales", "Marco", "Marco", "Peluquería Marco", 80000],
  [21, "personales", "Lisa", "Lisa", "Gimnasio Lisa", 220000],
  [25, "transporte", "Gasolina", "Marco", "Carga de gasolina", 300000],
  [27, "transporte", "Tarjeta Jaha", "Sebas", "Recarga tarjeta Jaha", 60000],
  [23, "varios", "Feria", "Hogar", "Feria Agroshopping: frutas y verduras", 165000],
  [24, "varios", "Reparaciones", "Hogar", "Plomero: arreglo de canilla", 150000],
  [26, "varios", "Entretenimiento", "Marco", "Cine Paseo La Galería", 120000],
];

const MONTHS = ["2026-07", "2026-08", "2026-09"];
const VARIATION = [0.94, 1.03, 1];

export const MOCK_EXPENSES: Expense[] = MONTHS.flatMap((month, mi) =>
  SEED.map(([day, category, subcategory, member, description, amount], i) => ({
    id: `${month}-${i}`,
    amount: Math.round((amount * (VARIATION[mi]! + ((i % 4) - 1.5) * 0.02 * (mi === 2 ? 0 : 1))) / 500) * 500,
    date: `${month}-${String(day).padStart(2, "0")}`,
    category,
    subcategory,
    member,
    description,
  })),
);

export const AVAILABLE_MONTHS = MONTHS;

export const formatGs = (value: number) =>
  `₲ ${new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(value)}`;

export const formatDate = (iso: string, short = false) => {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1);
  return new Intl.DateTimeFormat("es-PY", short
    ? { day: "2-digit", month: "short" }
    : { day: "2-digit", month: "long", year: "numeric" }).format(date);
};

export const monthLabel = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  const date = new Date(y ?? 2026, (m ?? 1) - 1, 1);
  const label = new Intl.DateTimeFormat("es-PY", { month: "long", year: "numeric" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const prevMonth = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y ?? 2026, (m ?? 1) - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export function exportExpensesCsv(list: Expense[], filename: string) {
  const header = ["Fecha", "Descripción", "Categoría", "Subcategoría", "Integrante", "Monto (Gs)"];
  const rows = list.map((e) => [e.date, e.description, getCategory(e.category).label, e.subcategory, e.member, e.amount]);
  const csv = "sep=;\r\n" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Home,
  LogOut,
  Plus,
  Receipt,
  Search,
  Trash2,
  Download,
  Users,
  Car,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExpenseDialog } from "@/components/ExpenseDialog";
import {
  AVAILABLE_MONTHS,
  CATEGORIES,
  MEMBERS,
  MOCK_EXPENSES,
  formatDate,
  formatGs,
  getCategory,
  monthLabel,
  prevMonth,
  exportExpensesCsv,
  type Expense,
  type Member,
} from "@/lib/balanz";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Balanz — Contabilidad familiar en guaraníes" },
      {
        name: "description",
        content: "Panel de finanzas familiares: gastos por categoría, integrante y mes, en guaraníes.",
      },
      { property: "og:title", content: "Balanz — Contabilidad familiar en guaraníes" },
      {
        property: "og:description",
        content: "Panel de finanzas familiares: gastos por categoría, integrante y mes, en guaraníes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const sum = (list: Expense[]) => list.reduce((s, e) => s + e.amount, 0);

function Delta({ now, before }: { now: number; before: number }) {
  if (!before) return null;
  const pct = ((now - before) / before) * 100;
  const up = pct > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-destructive" : "text-primary"}`}>
      <Icon className="size-3.5" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ready, setReady] = useState(false);
  const [userInitials, setUserInitials] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false });
    if (error) { toast.error("No se pudieron cargar los gastos"); return; }
    const valid = new Set<string>(["Hogar", ...MEMBERS]);
    setExpenses(
      (data ?? []).filter((r) => valid.has(r.member)).map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        date: r.date,
        category: r.category as Expense["category"],
        subcategory: r.subcategory,
        member: r.member as Member,
        description: r.description,
      })),
    );
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate({ to: "/login" }); return; }
      setUserInitials((data.session.user.email ?? "").slice(0, 2).toUpperCase());
      await load();
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toRow = ({ id: _id, ...e }: Expense) => e;

  const saveExpense = async (expense: Expense) => {
    const { error } = await supabase.from("expenses").insert(toRow(expense));
    if (error) { toast.error("No se pudo guardar el gasto"); return; }
    toast.success("Gasto guardado");
    await load();
    setMonth(expense.date.slice(0, 7));
  };

  const deleteExpense = async (id: string) => {
    const snapshot = expenses;
    setExpenses((list) => list.filter((e) => e.id !== id));
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) { setExpenses(snapshot); toast.error("No se pudo eliminar el gasto"); return; }
    toast.success("Gasto eliminado");
  };

  const loadSample = async () => {
    const { error } = await supabase.from("expenses").insert(MOCK_EXPENSES.map(toRow));
    if (error) { toast.error("No se pudieron cargar los ejemplos"); return; }
    await load();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };
  const [month, setMonth] = useState(AVAILABLE_MONTHS[AVAILABLE_MONTHS.length - 1]!);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("resumen");
  const [expanded, setExpanded] = useState<string | null>("servicios");

  // Filters
  const [q, setQ] = useState("");
  const [fCat, setFCat] = useState("all");
  const [fMember, setFMember] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const months = useMemo(
    () => Array.from(new Set([...AVAILABLE_MONTHS, ...expenses.map((e) => e.date.slice(0, 7))])).sort(),
    [expenses],
  );

  const monthExp = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, month],
  );
  const prevExp = useMemo(() => expenses.filter((e) => e.date.startsWith(prevMonth(month))), [expenses, month]);

  const total = sum(monthExp);
  const prevTotal = sum(prevExp);
  const byMember = (m: Member, list: Expense[]) => sum(list.filter((e) => e.member === m));

  const catTotals = CATEGORIES.map((c) => ({
    cat: c,
    total: sum(monthExp.filter((e) => e.category === c.id)),
    prev: sum(prevExp.filter((e) => e.category === c.id)),
  })).sort((a, b) => b.total - a.total);

  const filtered = monthExp.filter(
    (e) =>
      (fCat === "all" || e.category === fCat) &&
      (fMember === "all" || e.member === fMember) &&
      (!from || e.date >= from) &&
      (!to || e.date <= to) &&
      (!q || `${e.description} ${e.subcategory}`.toLowerCase().includes(q.toLowerCase())),
  );

  const trend = months.slice(-6).map((m) => ({ m, v: sum(expenses.filter((e) => e.date.startsWith(m))) }));
  const trendMax = Math.max(...trend.map((t) => t.v), 1);

  const metrics = [
    { label: "Gastos del Hogar", value: byMember("Hogar", monthExp), prev: byMember("Hogar", prevExp), icon: Home },
    { label: "Gastos de integrantes", value: sum(monthExp.filter((e) => e.member !== "Hogar")), prev: sum(prevExp.filter((e) => e.member !== "Hogar")), icon: Users },
    { label: "Transporte", value: sum(monthExp.filter((e) => e.category === "transporte")), prev: sum(prevExp.filter((e) => e.category === "transporte")), icon: Car },
    { label: "Movimientos", count: monthExp.length, icon: Receipt },
  ];

  const openMember = (m: string) => {
    setFMember(m);
    setTab("movimientos");
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <header className="sticky top-0 z-30 border-b border-border/70 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-hero-gradient">
              <Wallet className="size-[18px] text-primary-foreground" />
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-bold tracking-tight">Balanz</p>
              <p className="text-[11px] text-muted-foreground">Contabilidad familiar</p>
            </div>
          </div>

          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-10 w-auto min-w-40 rounded-full bg-card/70 font-medium">
              <span>{monthLabel(month)}</span>
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Avatar className="hidden size-9 border border-border sm:flex">
              <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{userInitials}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" aria-label="Cerrar sesión" className="rounded-full" onClick={logout}>
              <LogOut className="size-[18px]" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        {ready && expenses.length === 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 glass p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Todavía no cargaste gastos. Agregá el primero o probá con datos de ejemplo.</p>
            <Button variant="outline" className="rounded-full" onClick={loadSample}>Cargar datos de ejemplo</Button>
          </div>
        )}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="mb-6 flex items-center justify-between gap-3">
            <TabsList className="h-11 rounded-full bg-card/70 p-1 glass">
              <TabsTrigger value="resumen" className="rounded-full px-4">Dashboard</TabsTrigger>
              <TabsTrigger value="categorias" className="rounded-full px-4">Categorías</TabsTrigger>
              <TabsTrigger value="integrantes" className="rounded-full px-4">Integrantes</TabsTrigger>
              <TabsTrigger value="movimientos" className="rounded-full px-4">Movimientos</TabsTrigger>
            </TabsList>
            <Button onClick={() => setOpen(true)} className="hidden h-11 rounded-full px-5 md:inline-flex">
              <Plus className="size-4" /> Nuevo gasto
            </Button>
          </div>

          {/* DASHBOARD */}
          <TabsContent value="resumen" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <section className="relative overflow-hidden rounded-3xl bg-hero-gradient p-6 shadow-elegant sm:p-8 lg:col-span-2">
                <div className="absolute -right-16 -top-20 size-56 rounded-full bg-primary-foreground/10" aria-hidden />
                <div className="relative">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/70">Total del mes</p>
                  <p className="mt-1 text-sm text-primary-foreground/80">{monthLabel(month)}</p>
                  <p className="mt-4 numeric text-4xl font-bold text-primary-foreground sm:text-5xl">{formatGs(total)}</p>
                  {prevTotal > 0 && (
                    <p className="mt-2 text-sm text-primary-foreground/80">
                      {total >= prevTotal ? "+" : "−"}{formatGs(Math.abs(total - prevTotal))} vs {monthLabel(prevMonth(month))}
                    </p>
                  )}
                  <div className="mt-6 flex h-20 items-end gap-2">
                    {trend.map((t) => (
                      <button
                        key={t.m}
                        onClick={() => setMonth(t.m)}
                        className="flex flex-1 flex-col items-center gap-1.5"
                        aria-label={monthLabel(t.m)}
                      >
                        <div
                          className={`w-full rounded-md transition-all ${t.m === month ? "bg-primary-foreground" : "bg-primary-foreground/30 hover:bg-primary-foreground/50"}`}
                          style={{ height: `${Math.max(8, (t.v / trendMax) * 64)}px` }}
                        />
                        <span className="text-[10px] uppercase text-primary-foreground/70">{monthLabel(t.m).slice(0, 3)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4">
                {metrics.map((m) => (
                  <div key={m.label} className="rounded-2xl border border-border/70 glass p-4 shadow-card">
                    <div className="flex items-center justify-between">
                      <m.icon className="size-4 text-primary" />
                      {m.prev !== undefined && <Delta now={m.value!} before={m.prev} />}
                    </div>
                    <p className="mt-3 text-[11px] text-muted-foreground">{m.label}</p>
                    <p className="numeric mt-0.5 text-base font-bold sm:text-lg">
                      {m.count !== undefined ? m.count : formatGs(m.value!)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
              <section className="rounded-3xl border border-border/70 glass p-5 shadow-card lg:col-span-3">
                <h2 className="mb-4 font-semibold tracking-tight">Distribución por categoría</h2>
                <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-muted">
                  {catTotals.map(({ cat, total: t }) => (
                    <div key={cat.id} className={cat.barClass} style={{ width: `${total ? (t / total) * 100 : 0}%` }} />
                  ))}
                </div>
                <ul className="space-y-3">
                  {catTotals.map(({ cat, total: t, prev }) => {
                    const Icon = cat.icon;
                    return (
                      <li key={cat.id} className="flex items-center gap-3">
                        <span className={`flex size-9 items-center justify-center rounded-full ${cat.bgClass}`}>
                          <Icon className={`size-4 ${cat.colorClass}`} />
                        </span>
                        <span className="flex-1 text-sm font-medium">{cat.label}</span>
                        <Delta now={t} before={prev} />
                        <span className="numeric w-32 text-right text-sm font-semibold">{formatGs(t)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="rounded-3xl border border-border/70 glass p-5 shadow-card lg:col-span-2">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="font-semibold tracking-tight">Últimos movimientos</h2>
                  <button className="text-xs font-medium text-primary" onClick={() => setTab("movimientos")}>Ver todos</button>
                </div>
                <ul className="space-y-3">
                  {monthExp.slice(0, 6).map((e) => {
                    const c = getCategory(e.category);
                    const Icon = c.icon;
                    return (
                      <li key={e.id} className="flex items-center gap-3">
                        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${c.bgClass}`}>
                          <Icon className={`size-4 ${c.colorClass}`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{e.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(e.date, true)} · {e.member}</p>
                        </div>
                        <span className="numeric text-sm font-semibold">{formatGs(e.amount)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </TabsContent>

          {/* CATEGORIAS */}
          <TabsContent value="categorias" className="space-y-3">
            {catTotals.map(({ cat, total: t }) => {
              const Icon = cat.icon;
              const isOpen = expanded === cat.id;
              const subs = cat.subcategories
                .map((s) => ({ s, items: monthExp.filter((e) => e.category === cat.id && e.subcategory === s) }))
                .filter((x) => x.items.length);
              return (
                <section key={cat.id} className="overflow-hidden rounded-3xl border border-border/70 glass shadow-card">
                  <button onClick={() => setExpanded(isOpen ? null : cat.id)} className="flex w-full items-center gap-4 p-5 text-left">
                    <span className={`flex size-11 items-center justify-center rounded-2xl ${cat.bgClass}`}>
                      <Icon className={`size-5 ${cat.colorClass}`} />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">{cat.label}</p>
                      <p className="text-xs text-muted-foreground">{cat.subcategories.join(" · ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="numeric font-bold">{formatGs(t)}</p>
                      <p className="text-xs text-muted-foreground">{total ? ((t / total) * 100).toFixed(1) : 0}% del mes</p>
                    </div>
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="space-y-4 border-t border-border/70 p-5">
                      {subs.length === 0 && <p className="text-sm text-muted-foreground">Sin gastos este mes.</p>}
                      {subs.map(({ s, items }) => {
                        const st = sum(items);
                        return (
                          <div key={s}>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                              <span className="font-medium">{s}</span>
                              <span className="numeric font-semibold">{formatGs(st)}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div className={`h-full rounded-full ${cat.barClass}`} style={{ width: `${t ? (st / t) * 100 : 0}%` }} />
                            </div>
                            <ul className="mt-2 space-y-1">
                              {items.map((e) => (
                                <li key={e.id} className="flex justify-between gap-3 text-xs text-muted-foreground">
                                  <span className="truncate">{formatDate(e.date, true)} · {e.description}{e.member !== "Hogar" && s !== e.member ? ` (${e.member})` : ""}</span>
                                  <span className="numeric shrink-0">{formatGs(e.amount)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </TabsContent>

          {/* INTEGRANTES */}
          <TabsContent value="integrantes">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(["Hogar", ...MEMBERS] as Member[]).map((m) => {
                const list = monthExp.filter((e) => e.member === m);
                const t = sum(list);
                const top = CATEGORIES.map((c) => ({ c, v: sum(list.filter((e) => e.category === c.id)) }))
                  .filter((x) => x.v)
                  .sort((a, b) => b.v - a.v);
                return (
                  <button key={m} onClick={() => openMember(m)} className="rounded-3xl border border-border/70 glass p-5 text-left shadow-card transition-transform hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11">
                        <AvatarFallback className="bg-accent font-semibold text-accent-foreground">{m.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{m}</p>
                        <p className="text-xs text-muted-foreground">{list.length} movimientos</p>
                      </div>
                      <Delta now={t} before={byMember(m, prevExp)} />
                    </div>
                    <p className="numeric mt-4 text-2xl font-bold">{formatGs(t)}</p>
                    <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                      {top.map(({ c, v }) => (
                        <div key={c.id} className={c.barClass} style={{ width: `${(v / (t || 1)) * 100}%` }} />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{top.slice(0, 2).map((x) => x.c.label).join(" · ") || "Sin gastos"}</p>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* MOVIMIENTOS */}
          <TabsContent value="movimientos" className="space-y-4">
            <div className="grid gap-2 rounded-3xl border border-border/70 glass p-3 shadow-card sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar concepto" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 pl-9" />
              </div>
              <Select value={fCat} onValueChange={setFCat}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={fMember} onValueChange={setFMember}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los integrantes</SelectItem>
                  {(["Hogar", ...MEMBERS] as string[]).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" aria-label="Desde" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10" />
              <Input type="date" aria-label="Hasta" value={to} onChange={(e) => setTo(e.target.value)} className="h-10" />
            </div>

            <div className="flex items-center justify-between px-1 text-sm">
              <span className="text-muted-foreground">{filtered.length} movimientos</span>
              <div className="flex items-center gap-3">
                <span className="numeric font-semibold">Total filtrado: {formatGs(sum(filtered))}</span>
                <Button variant="outline" size="sm" className="rounded-full" disabled={!filtered.length} onClick={() => exportExpensesCsv(filtered, `balanz-movimientos-${month}.csv`)}>
                  <Download className="size-4" /> Descargar Excel
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border/70 glass shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="border-b border-border/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Fecha</th>
                      <th className="px-4 py-3 font-medium">Concepto</th>
                      <th className="px-4 py-3 font-medium">Categoría</th>
                      <th className="px-4 py-3 font-medium">Sub. / Persona</th>
                      <th className="px-4 py-3 text-right font-medium">Importe</th>
                      <th className="w-12 px-2 py-3"><span className="sr-only">Acciones</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => {
                      const c = getCategory(e.category);
                      const Icon = c.icon;
                      return (
                        <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40">
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(e.date, true)}</td>
                          <td className="px-4 py-3 font-medium">{e.description}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.bgClass} ${c.colorClass}`}>
                              <Icon className="size-3.5" />{c.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{e.subcategory}{e.member !== e.subcategory ? ` · ${e.member}` : ""}</td>
                          <td className="numeric whitespace-nowrap px-4 py-3 text-right font-semibold">Gs. {new Intl.NumberFormat("es-PY").format(e.amount)}</td>
                          <td className="px-2 py-3 text-right">
                            <Button variant="ghost" size="icon" aria-label="Eliminar gasto" className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteExpense(e.id)}>
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No hay movimientos con estos filtros.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Button onClick={() => setOpen(true)} size="icon" aria-label="Nuevo gasto" className="fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-elegant md:hidden">
        <Plus className="size-6" />
      </Button>

      <ExpenseDialog
        open={open}
        onOpenChange={setOpen}
        defaultDate={`${month}-15`}
        onSave={saveExpense}
      />
    </div>
  );
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  MEMBERS,
  getCategory,
  type CategoryId,
  type Expense,
  type Member,
} from "@/lib/balanz";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: Expense) => void;
  defaultDate: string;
};

const fmt = (raw: string) => {
  const n = Number(raw.replace(/\D/g, ""));
  return n ? new Intl.NumberFormat("es-PY").format(n) : "";
};

export function ExpenseDialog({ open, onOpenChange, onSave, defaultDate }: Props) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [category, setCategory] = useState<CategoryId>("alimentacion");
  const [subcategory, setSubcategory] = useState("Super");
  const [member, setMember] = useState<Member>("Hogar");
  const [description, setDescription] = useState("");

  const cat = getCategory(category);

  const changeCategory = (v: CategoryId) => {
    setCategory(v);
    const first = getCategory(v).subcategories[0]!;
    setSubcategory(first);
    if (v === "personales") setMember(first as Member);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(/\D/g, ""));
    if (!value || value > 1_000_000_000) return;
    onSave({
      id: crypto.randomUUID(),
      amount: value,
      date,
      category,
      subcategory,
      member: category === "personales" ? (subcategory as Member) : member,
      description: description.trim().slice(0, 200) || `${cat.label} · ${subcategory}`,
    });
    setAmount("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl border-border/70 glass shadow-elegant">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo gasto</DialogTitle>
          <DialogDescription>
            Registrá un movimiento con su categoría y responsable.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground numeric">
                ₲
              </span>
              <Input
                id="amount"
                inputMode="numeric"
                placeholder="150.000"
                value={amount}
                onChange={(e) => setAmount(fmt(e.target.value))}
                className="h-14 pl-10 numeric text-2xl font-semibold"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = c.id === category;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => changeCategory(c.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-[11px] font-medium leading-tight transition-colors ${
                      active ? "border-primary bg-accent" : "border-border hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`flex size-8 items-center justify-center rounded-full ${c.bgClass}`}
                    >
                      <Icon className={`size-4 ${c.colorClass}`} />
                    </span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{category === "personales" ? "Integrante" : "Subcategoría"}</Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cat.subcategories.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {category !== "personales" ? (
              <div className="space-y-2">
                <Label>Persona asociada</Label>
                <Select value={member} onValueChange={(v) => setMember(v as Member)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Hogar", ...MEMBERS] as Member[]).map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
            )}
          </div>

          {category !== "personales" && (
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Concepto</Label>
            <Textarea
              id="description"
              placeholder="Ej. Compra quincenal Superseis"
              value={description}
              maxLength={200}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="h-11 px-6 rounded-xl">
              Guardar gasto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

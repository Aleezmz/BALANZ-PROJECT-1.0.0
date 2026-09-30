import { useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Copy, Loader2, Printer, Scissors } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Phase = "idle" | "printing" | "printed" | "cutting";

const DATA = {
  fecha: "30 Sep 2026",
  concepto: "Compra quincenal Superseis",
  categoria: "Alimentación y Súper",
  integrante: "Hogar",
  total: "₲ 150.000",
};

const BARS = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 1, 3, 1, 2];

const zigzag =
  "polygon(0 0,100% 0,100% calc(100% - 10px)," +
  Array.from({ length: 21 }, (_, i) => {
    const x = 100 - i * 5;
    return `${x}% ${i % 2 === 0 ? "calc(100% - 10px)" : "100%"}`;
  }).join(",") +
  ")";

export function ReceiptDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const controls = useAnimationControls();

  const print = async () => {
    setPhase("printing");
    controls.set({ y: "-100%", x: 0, rotate: 0, opacity: 1 });
    await controls.start({ y: "0%", transition: { duration: 3, ease: "linear" } });
    setPhase("printed");
  };

  const cut = async () => {
    setPhase("cutting");
    await controls.start({ y: "-4%", transition: { duration: 0.15, ease: "easeOut" } });
    await controls.start({ y: "130%", x: 160, rotate: 12, opacity: 0, transition: { duration: 0.45, ease: "easeIn" } });
    controls.set({ y: "-100%", x: 0, rotate: 0, opacity: 1 });
    setPhase("idle");
  };

  const copy = async () => {
    const text = `BALANZ - Comprobante\nFecha: ${DATA.fecha}\nConcepto: ${DATA.concepto}\nCategoría: ${DATA.categoria}\nIntegrante: ${DATA.integrante}\nTotal: ${DATA.total}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Información copiada");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const change = (o: boolean) => {
    if (!o) {
      setPhase("idle");
      controls.set({ y: "-100%", x: 0, rotate: 0, opacity: 1 });
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Generar recibo</DialogTitle>
          <DialogDescription>Imprimí un comprobante del movimiento.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center">
          <div className="h-4 w-full rounded-full bg-gray-900 shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
          <div className="relative -mt-1 w-[88%] overflow-hidden" style={{ minHeight: phase === "idle" ? 0 : undefined }}>
            <motion.div
              initial={{ y: "-100%" }}
              animate={controls}
              className={`relative bg-slate-50 px-5 pb-8 pt-6 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-100 ${phase === "idle" ? "hidden" : ""}`}
              style={{ clipPath: zigzag }}
            >
              <div className="text-center">
                <p className="text-lg font-bold tracking-[0.3em]">BALANZ</p>
                <p className="text-[10px] tracking-widest opacity-70">COMPROBANTE DE MOVIMIENTO</p>
              </div>
              <div className="my-3 border-t border-dashed border-current opacity-40" />
              <dl className="space-y-1.5">
                {[["Fecha", DATA.fecha], ["Concepto", DATA.concepto], ["Categoría", DATA.categoria], ["Integrante", DATA.integrante]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="opacity-60">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="my-3 border-t border-dashed border-current opacity-40" />
              <div className="flex items-end justify-between">
                <span className="opacity-60">TOTAL</span>
                <span className="text-2xl font-bold">{DATA.total}</span>
              </div>
              <div className="pointer-events-none absolute right-5 top-24 -rotate-[15deg] rounded border-2 border-green-500 px-2 py-0.5 text-sm font-bold tracking-widest text-green-500">
                REGISTRADO
              </div>
              <div className="mt-5 flex h-10 items-stretch justify-center gap-[2px]">
                {BARS.map((w, i) => (
                  <div key={i} className="bg-current" style={{ width: w * 1.5 }} />
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] opacity-70">¡Gracias por usar Balanz!</p>
            </motion.div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {phase === "idle" || phase === "printing" ? (
              <Button onClick={print} disabled={phase === "printing"} className="rounded-xl">
                {phase === "printing" ? <Loader2 className="size-4 animate-spin" /> : <Printer className="size-4" />}
                {phase === "printing" ? "Imprimiendo..." : "Imprimir comprobante"}
              </Button>
            ) : (
              <>
                <Button variant="outline" className="rounded-xl" onClick={print} disabled={phase === "cutting"}>
                  <Printer className="size-4" /> Reimprimir
                </Button>
                <Button className="rounded-xl" onClick={cut} disabled={phase === "cutting"}>
                  <Scissors className="size-4" /> Cortar recibo
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={copy}>
                  <Copy className="size-4" /> Copiar info
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

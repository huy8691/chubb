"use client";
/** Nút mở popup E02 (mặc định nhãn "Xem danh thiếp" — theo nut-dich: trên A01 · C01 · C02 · C04 nút này mở E02, không sang E03). */
import { useState } from "react";
import { Button } from "@/components/ui";
import { QuickView } from "./QuickView";

export function XemNhanhButton({ ma, size = "sm", kind = "secondary", label = "Xem danh thiếp" }: { ma: string; size?: "sm" | "md"; kind?: "ghost" | "secondary" | "primary"; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size={size} kind={kind} onClick={() => setOpen(true)}>{label}</Button>
      {open && <QuickView ma={ma} onClose={() => setOpen(false)} />}
    </>
  );
}

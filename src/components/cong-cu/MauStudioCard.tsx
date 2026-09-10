"use client";
/** Thẻ Mẫu Studio dùng chung: D08 (danh sách) và D01 (khối "Mẫu Studio mới"). Chip MẪU · tên · tỉ lệ·phiên bản · cập nhật · Dùng mẫu này (login-aware). */
import { R } from "@/lib/routes";
import { fmtDate } from "@/lib/seed";
import type { StudioTemplate } from "@/lib/types";
import { useStore } from "@/lib/store";
import { tiLeLabel, tiLeToRatio } from "./StudioPreview";
import { Button, Card, ImageBox } from "@/components/ui";

/** `onDung`: khi đang ở D02, chọn mẫu tại chỗ (cuộn lên xem trước) thay vì điều hướng — giữ cùng một kiểu thẻ ở mọi màn. */
export function MauStudioCard({ m, onDung }: { m: StudioTemplate; onDung?: (id: string) => void }) {
  const { session } = useStore();
  const href = session.role === "tvv" ? `${R.D02}?mau=${m.id}` : `${R.G01}?next=${encodeURIComponent(`${R.D02}?mau=${m.id}`)}`;
  return (
    <Card className="p-3 flex flex-col h-full">
      <div className="relative"><ImageBox src={m.anh} ratio={tiLeToRatio(m.tiLe)} /><span className="absolute top-2 left-2 bg-blue text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-sm">Mẫu</span></div>
      <div className="mt-3 text-[13px] font-bold text-den truncate">{m.ten}</div>
      <div className="text-[12px] text-ink2 mt-0.5 truncate">{tiLeLabel(m.tiLe)} · phiên bản v{m.phienBan ?? 1}</div>
      <div className="text-[12px] text-mut">Cập nhật {fmtDate(m.capNhat)}</div>
      {onDung
        ? <Button size="sm" kind="secondary" className="mt-auto w-full" onClick={() => onDung(m.id)}>Dùng mẫu này</Button>
        : <Button size="sm" kind="secondary" className="mt-auto w-full" href={href}>Dùng mẫu này</Button>}
    </Card>
  );
}

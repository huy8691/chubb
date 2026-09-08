"use client";
/**
 * Dùng chung cho H07 (danh sách) và H07a (chi tiết) — Ảnh Studio Tư vấn viên gửi vào Bộ sưu tập Studio.
 * Khối "Từ chối ảnh" (lý do bắt buộc, TVV sẽ thấy) + các hành động Duyệt / Từ chối / Gỡ khỏi bộ sưu tập ghi store và gửi thông báo cho TVV.
 */
import { useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import type { StudioImage } from "@/lib/types";
import { Button, Field, Textarea, cx } from "@/components/ui";

export const LY_DO_TU_CHOI = ["Ảnh mờ / vỡ", "Lệch vùng khoá thương hiệu", "Nội dung không phù hợp", "Sai thông tin TVV", "Khác"] as const;

/** Hành động duyệt trên một ảnh — ghi studioImages + thông báo tới TVV (G02 "Ảnh Studio của tôi") */
export function useDuyetAnh() {
  const { data, actions } = useStore();
  const tenMau = (a: StudioImage) => data.studioTemplates.find((t) => t.id === a.templateId)?.ten ?? "Mẫu Studio";
  const capNhat = (id: string, patch: Partial<StudioImage>) => actions.update("studioImages", (l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  return {
    tenMau,
    duyet: (a: StudioImage) => {
      capNhat(a.id, { trangThai: "da-duyet", ngayDuyet: new Date().toISOString(), lyDoTuChoi: undefined });
      actions.notify(a.advisorMa, `Ảnh "${tenMau(a)}" đã được duyệt vào Bộ sưu tập Studio.`, R.G02);
    },
    tuChoi: (a: StudioImage, lyDo: string) => {
      capNhat(a.id, { trangThai: "bi-tu-choi", lyDoTuChoi: lyDo, ngayDuyet: undefined });
      actions.notify(a.advisorMa, `Ảnh "${tenMau(a)}" bị từ chối · ${lyDo}`, R.G02);
    },
    go: (a: StudioImage) => {
      capNhat(a.id, { trangThai: "rieng-tu", ngayDuyet: undefined });
      actions.notify(a.advisorMa, `Ảnh "${tenMau(a)}" đã được gỡ khỏi Bộ sưu tập Studio, ảnh vẫn giữ trong Ảnh Studio của bạn.`, R.G02);
    },
  };
}

/** Khối TỪ CHỐI ẢNH — chọn lý do (bắt buộc) + ghi chú tuỳ chọn → "Gửi từ chối" · "Huỷ" */
export function TuChoiForm({ onGui, onHuy, className }: { onGui: (lyDo: string) => void; onHuy: () => void; className?: string }) {
  const [lyDo, setLyDo] = useState<string>("");
  const [ghiChu, setGhiChu] = useState("");
  const [err, setErr] = useState("");
  const gui = () => {
    if (!lyDo) { setErr("Chọn một lý do — Tư vấn viên sẽ thấy lý do này."); return; }
    onGui(ghiChu.trim() ? `${lyDo} — ${ghiChu.trim()}` : lyDo);
  };
  return (
    <div className={className}>
      <div className="text-[12px] font-bold text-den tracking-wider">TỪ CHỐI ẢNH</div>
      <Field label="Lý do (bắt buộc, TVV sẽ thấy)" className="mt-3" error={err}>
        <div className="flex flex-wrap gap-2">
          {LY_DO_TU_CHOI.map((l) => (
            <button key={l} type="button" onClick={() => { setLyDo(l); setErr(""); }} className={cx("h-9 px-3 rounded-sm text-[13px] font-bold border", lyDo === l ? "bg-blue text-white border-blue" : "bg-white text-ink2 border-vien hover:border-blue hover:text-blue")}>{l}</button>
          ))}
        </div>
      </Field>
      <Textarea value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} className="mt-3 min-h-[72px]" placeholder="Ghi chú thêm cho TVV (tuỳ chọn)…" />
      <div className="flex gap-3 mt-4">
        <Button onClick={gui}>Gửi từ chối</Button>
        <Button kind="secondary" onClick={onHuy}>Huỷ</Button>
      </div>
    </div>
  );
}

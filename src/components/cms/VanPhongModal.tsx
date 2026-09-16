"use client";
/** H11c · Popup Văn phòng (mở từ nút "Văn phòng (N)" trên H11): danh sách 5 văn phòng (bấm để sửa) + form tên · địa chỉ (toạ độ bỏ 15/09 cùng bản đồ). Văn phòng là ô chọn trên H11b và bộ lọc Danh bạ E01. */
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Office } from "@/lib/types";
import { Button, Field, Input, Modal, useFlash } from "@/components/ui";

export function VanPhongModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [id, setId] = useState<string | null>(null);
  const [ten, setTen] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [err, setErr] = useState("");
  const chon = (o?: Office) => { setId(o?.id ?? null); setTen(o?.ten ?? ""); setDiaChi(o?.diaChi ?? ""); setErr(""); };
  const luu = () => {
    const t = ten.trim(); if (!t) { setErr("Nhập tên văn phòng."); return; }
    if (data.offices.some((o) => o.ten === t && o.id !== id)) { setErr("Tên văn phòng không được trùng."); return; }
    if (id) {
      const cu = data.offices.find((o) => o.id === id)!;
      actions.update("offices", (l) => l.map((o) => (o.id === id ? { ...o, ten: t, diaChi: diaChi.trim() } : o)));
      if (cu.ten !== t) actions.update("advisors", (l) => l.map((a) => (a.vanPhong === cu.ten ? { ...a, vanPhong: t } : a)));
      flash("Đã lưu văn phòng");
    } else { actions.update("offices", (l) => [...l, { id: `vp-${Date.now()}`, ten: t, diaChi: diaChi.trim() }]); flash("Đã thêm văn phòng"); }
    chon(undefined);
  };
  return (
    <Modal open={open} onClose={onClose} title={`Văn phòng (${data.offices.length})`} width={720}
      footer={<><Button onClick={luu}>{id ? "Lưu văn phòng" : "Thêm văn phòng"}</Button><Button kind="secondary" onClick={() => (id ? chon(undefined) : onClose())}>{id ? "Bỏ sửa" : "Đóng"}</Button></>}>
      <div className="text-[13px] text-ink2">Đang có: {data.offices.map((o, i) => <span key={o.id}>{i > 0 && " · "}<button type="button" className={`font-bold hover:underline ${o.id === id ? "text-blue" : "text-den"}`} onClick={() => chon(o)}>{o.ten}</button></span>)} · bấm một tên để sửa</div>
      <div className="mt-5 space-y-4">
        <Field label="Tên văn phòng (≤ 40 ký tự)" error={err && /tên/i.test(err) ? err : undefined}><Input value={ten} maxLength={40} onChange={(e) => setTen(e.target.value)} placeholder="TP. Hồ Chí Minh — Q.1" /></Field>
        <Field label="Địa chỉ"><Input value={diaChi} onChange={(e) => setDiaChi(e.target.value)} placeholder="115 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" /></Field>
        <p className="text-[12.5px] text-mut">Văn phòng là ô chọn khi thêm / sửa Tư vấn viên (H11b) và bộ lọc trong Danh bạ Tư vấn viên (E01). Tên không được trùng.</p>
      </div>
      {node}
    </Modal>
  );
}

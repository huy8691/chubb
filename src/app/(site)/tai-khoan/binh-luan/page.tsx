"use client";
/**
 * G12 · Trang cá nhân › Bình luận (10/09): TVV quản lý bình luận khách để lại trên danh thiếp của mình.
 * Chờ duyệt → Duyệt (hiện công khai trên E03) / Ẩn / Xoá. SĐT khách KHÔNG hiện cho TVV — chỉ Quản trị (CMS) thấy (PII do Chubb giữ).
 */
import { useState } from "react";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/seed";
import type { BinhLuan } from "@/lib/types";
import { Button, Chip, EmptyState, FilterChips, Modal, Muted, useFlash } from "@/components/ui";

type Loc = "tat-ca" | BinhLuan["trangThai"];
const TT: Record<BinhLuan["trangThai"], [string, "green" | "amber" | "grey"]> = { "cho-duyet": ["Chờ duyệt", "amber"], "dang-hien": ["Đang hiện", "green"], "da-an": ["Đã ẩn", "grey"] };

export default function Page() {
  const tvv = useCurrentAdvisor();
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [loc, setLoc] = useState<Loc>("tat-ca");
  const [xoaXn, setXoaXn] = useState<BinhLuan | null>(null);
  if (!tvv) return null;

  const all = data.binhLuan.filter((b) => b.advisorMa === tvv.ma);
  const dem = (s: BinhLuan["trangThai"]) => all.filter((b) => b.trangThai === s).length;
  const ds = all.filter((b) => loc === "tat-ca" || b.trangThai === loc).sort((a, b) => b.ngay.localeCompare(a.ngay));

  const doi = (id: string, patch: Partial<BinhLuan>, msg: string) => {
    actions.update("binhLuan", (arr) => arr.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    flash(msg);
  };
  const xoa = (id: string) => { actions.update("binhLuan", (arr) => arr.filter((b) => b.id !== id)); flash("Đã xoá bình luận"); };

  return (
    <div className="max-w-[1100px]">
      {node}
      <h2 className="font-serif font-semibold text-[24px] text-den">Bình luận khách hàng</h2>
      <Muted className="mt-1">Bình luận khách để lại trên danh thiếp của bạn. Duyệt để hiển thị công khai.</Muted>

      <div className="mt-6 mb-5">
        <FilterChips value={loc} onChange={setLoc} options={[
          { value: "tat-ca", label: "Tất cả", count: all.length },
          { value: "cho-duyet", label: "Chờ duyệt", count: dem("cho-duyet") },
          { value: "dang-hien", label: "Đang hiện", count: dem("dang-hien") },
          { value: "da-an", label: "Đã ẩn", count: dem("da-an") },
        ]} />
      </div>

      {ds.length === 0 ? <EmptyState title="Chưa có bình luận nào" desc="Khách để lại bình luận trên danh thiếp công khai của bạn sẽ hiện ở đây." /> : (
        <div className="space-y-3">
          {ds.map((b) => (
            <div key={b.id} className="bg-white border border-vien rounded-sm p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-[14px] text-den">{b.tenKhach}</span>
                  <span className="text-[12.5px] text-mut">SĐT do Chubb quản lý</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {b.ganCo && <Chip tone="amber">Gắn cờ</Chip>}
                  <Chip tone={TT[b.trangThai][1]}>{TT[b.trangThai][0]}</Chip>
                </div>
              </div>
              <p className="mt-2.5 text-[14px] text-den leading-relaxed">“{b.noiDung}”</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-[12px] text-mut">{fmtDateTime(b.ngay)}</span>
                <div className="flex items-center gap-2">
                  {b.trangThai === "cho-duyet" && <Button size="sm" onClick={() => doi(b.id, { trangThai: "dang-hien" }, "Đã duyệt — bình luận hiển thị công khai trên danh thiếp")}>Duyệt</Button>}
                  {b.trangThai === "dang-hien" && <Button size="sm" kind="secondary" onClick={() => doi(b.id, { trangThai: "da-an" }, "Đã ẩn bình luận khỏi danh thiếp")}>Ẩn</Button>}
                  {b.trangThai === "cho-duyet" && <Button size="sm" kind="secondary" onClick={() => doi(b.id, { trangThai: "da-an" }, "Đã ẩn bình luận")}>Ẩn</Button>}
                  {b.trangThai === "da-an" && <Button size="sm" kind="secondary" onClick={() => doi(b.id, { trangThai: "dang-hien" }, "Bình luận hiện lại công khai")}>Hiện lại</Button>}
                  <Button size="sm" kind="ghost" onClick={() => setXoaXn(b)} className="text-red-fg">Xoá</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!xoaXn} onClose={() => setXoaXn(null)} title="Xoá bình luận này?" width={520}
        footer={<><Button kind="secondary" onClick={() => setXoaXn(null)}>Huỷ</Button><Button kind="danger" onClick={() => { if (xoaXn) xoa(xoaXn.id); setXoaXn(null); }}>Xoá</Button></>}>
        <p className="text-[14px] text-ink2">Bình luận của <b className="text-den">{xoaXn?.tenKhach}</b> sẽ bị xoá vĩnh viễn khỏi danh thiếp của bạn và không khôi phục được.</p>
      </Modal>
    </div>
  );
}

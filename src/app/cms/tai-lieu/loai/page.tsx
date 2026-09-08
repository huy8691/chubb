"use client";
/**
 * H09b · CMS — Loại tài liệu (danh sách: thứ tự · tên · mô tả · số tệp · Sửa · Xoá) + popup H09c Thêm/sửa loại.
 * Loại chỉ dùng làm bộ lọc trên trang Tài liệu (G04 · G10) và ô chọn trong H09a; công khai/TVV đặt trên từng tệp.
 * Thứ tự: nút ▲▼ (thay kéo ⋮⋮). Xoá được khi loại không còn tệp.
 */
import { useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import type { DocType } from "@/lib/types";
import { Button, Field, Input, Modal, Select, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { slugify as slug } from "@/components/thu-vien/helpers";

const MAX_TEN = 40, MAX_MOTA = 120;
type Form = { id?: string; ten: string; moTa: string; thuTu: number };

export default function Page() {
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [form, setForm] = useState<Form | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});

  const loai = [...data.docTypes].sort((a, b) => a.thuTu - b.thuTu);
  const soTep = (id: string) => data.documents.filter((d) => d.loaiId === id).length;

  const openNew = () => { setErr({}); setForm({ ten: "", moTa: "", thuTu: loai.length + 1 }); };
  const openEdit = (t: DocType) => { setErr({}); setForm({ id: t.id, ten: t.ten, moTa: t.moTa, thuTu: t.thuTu }); };

  const move = (id: string, dir: -1 | 1) => {
    const i = loai.findIndex((t) => t.id === id); const j = i + dir;
    if (j < 0 || j >= loai.length) return;
    const order = loai.map((t) => t.id); [order[i], order[j]] = [order[j], order[i]];
    actions.update("docTypes", (list) => list.map((t) => ({ ...t, thuTu: order.indexOf(t.id) + 1 })));
  };

  const xoa = (t: DocType) => {
    const n = soTep(t.id);
    if (n > 0) { flash(`Không xoá được: loại “${t.ten}” còn ${n} tệp. Chuyển tệp sang loại khác trước.`); return; }
    actions.update("docTypes", (list) => list.filter((x) => x.id !== t.id).sort((a, b) => a.thuTu - b.thuTu).map((x, i) => ({ ...x, thuTu: i + 1 })));
    flash(`Đã xoá loại “${t.ten}”`);
  };

  const save = () => {
    if (!form) return;
    const e: Record<string, string> = {};
    const ten = form.ten.trim();
    if (!ten) e.ten = "Nhập tên loại.";
    else if (ten.length > MAX_TEN) e.ten = `Tên loại tối đa ${MAX_TEN} ký tự.`;
    else if (data.docTypes.some((t) => t.ten.toLowerCase() === ten.toLowerCase() && t.id !== form.id)) e.ten = "Tên loại không được trùng.";
    if (form.moTa.length > MAX_MOTA) e.moTa = `Mô tả tối đa ${MAX_MOTA} ký tự.`;
    setErr(e);
    if (Object.keys(e).length) return;
    const isNew = !form.id;
    const id = form.id ?? (data.docTypes.some((t) => t.id === slug(ten)) ? `${slug(ten)}-${Date.now()}` : slug(ten));
    actions.update("docTypes", (list) => {
      const others = list.filter((t) => t.id !== id).sort((a, b) => a.thuTu - b.thuTu);
      const pos = Math.min(Math.max(1, form.thuTu), others.length + 1) - 1;
      others.splice(pos, 0, { id, ten, moTa: form.moTa.trim(), thuTu: 0 });
      return others.map((t, i) => ({ ...t, thuTu: i + 1 }));
    });
    setForm(null);
    flash(isNew ? `Đã thêm loại “${ten}” — hiện trong bộ lọc Loại trên trang Tài liệu` : `Đã lưu loại “${ten}”`);
  };

  return (
    <>
      <CmsHeader crumbs={[{ label: "Tài liệu", href: R.H09 }, { label: "Loại tài liệu" }]} title="Loại tài liệu" desc="Loại dùng làm bộ lọc trên trang Tài liệu." right={<Button onClick={openNew}>+ Thêm loại</Button>} />
      <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
        <CmsCard>
          <Table head={["Thứ tự", "Tên loại", "Mô tả (hiện dưới tên)", "Số tệp", ""]}>
            {loai.map((t, i) => {
              const n = soTep(t.id);
              return (
                <tr key={t.id}>
                  <td className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-mut select-none" aria-hidden>⋮⋮</span>
                      <span className="w-5 text-center tabular-nums">{t.thuTu}</span>
                      <button type="button" onClick={() => move(t.id, -1)} disabled={i === 0} aria-label="Chuyển lên" className="size-6 rounded-sm border border-vien text-[11px] hover:border-blue disabled:opacity-30">▲</button>
                      <button type="button" onClick={() => move(t.id, 1)} disabled={i === loai.length - 1} aria-label="Chuyển xuống" className="size-6 rounded-sm border border-vien text-[11px] hover:border-blue disabled:opacity-30">▼</button>
                    </span>
                  </td>
                  <td className="font-bold text-den whitespace-nowrap">{t.ten}</td>
                  <td className="text-ink2">{t.moTa}</td>
                  <td className="tabular-nums">{n}</td>
                  <td className="text-right whitespace-nowrap">
                    <button type="button" onClick={() => openEdit(t)} className="text-blue font-bold">Sửa</button>
                    <button type="button" onClick={() => xoa(t)} title={n > 0 ? "Loại còn tệp — không xoá được" : "Xoá loại"} className={n > 0 ? "ml-4 text-mut cursor-not-allowed" : "ml-4 text-ink2 hover:text-red-fg"}>Xoá</button>
                  </td>
                </tr>
              );
            })}
          </Table>
          {loai.length === 0 && <div className="text-[13px] text-mut py-6 text-center">Chưa có loại nào. Bấm “+ Thêm loại”.</div>}
          <p className="mt-4 text-[13px] text-mut">Dùng ▲▼ để đổi thứ tự trong bộ lọc Loại. Xoá được khi loại không còn tệp.</p>
        </CmsCard>
        <CmsCard title="Cần thêm tệp?" desc="Thêm hoặc sửa tệp ở danh sách Tài liệu.">
          <div className="flex flex-wrap gap-3">
            <Button kind="secondary" size="sm" href={R.H09}>Về danh sách tệp</Button>
            <Button size="sm" href={R.H09new}>Thêm tài liệu</Button>
          </div>
        </CmsCard>
      </div>

      {/* H09c · Popup Thêm / sửa loại */}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Sửa loại tài liệu" : "Thêm loại tài liệu"} width={760}
        footer={<><Button onClick={save}>Lưu loại</Button><Button kind="secondary" onClick={() => setForm(null)}>Huỷ</Button></>}>
        {form && (
          <div className="space-y-5">
            <Field label={`Tên loại (≤ ${MAX_TEN} ký tự)`} count={`${form.ten.length}/${MAX_TEN}`} error={err.ten}>
              <Input value={form.ten} maxLength={MAX_TEN + 10} placeholder="Tài liệu đào tạo" onChange={(e) => setForm({ ...form, ten: e.target.value })} />
            </Field>
            <Field label={`Mô tả (≤ ${MAX_MOTA} ký tự, hiện dưới tên loại)`} count={`${form.moTa.length}/${MAX_MOTA}`} error={err.moTa}>
              <Input value={form.moTa} maxLength={MAX_MOTA + 20} placeholder="Slide và bài giảng cho Tư vấn viên mới" onChange={(e) => setForm({ ...form, moTa: e.target.value })} />
            </Field>
            <Field label="Thứ tự trong bộ lọc">
              <Select value={form.thuTu} onChange={(e) => setForm({ ...form, thuTu: Number(e.target.value) })} className="w-[200px]">
                {Array.from({ length: form.id ? loai.length : loai.length + 1 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
          </div>
        )}
      </Modal>
      {node}
    </>
  );
}

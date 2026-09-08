"use client";
/**
 * H04b · CMS — Chuyên đề (danh sách) + popup H04c Thêm/Sửa chuyên đề.
 * Mỗi chuyên đề = một khối trên F01 + một chip lọc / trang F03 + một ô chọn trong H06.
 * Thứ tự: nút lên/xuống (thay kéo ⋮⋮). Hiện/Ẩn đổi ngay trên hàng.
 */
import { useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import type { ChuyenDe } from "@/lib/types";
import { Button, Checkbox, Chip, Field, Input, Modal, Select, Table, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { slugify } from "@/components/thu-vien/helpers";

type Form = { id?: string; ten: string; moTa: string; slug: string; slugTuSua: boolean; thuTu: number; hien: boolean };
const EMPTY = (thuTu: number): Form => ({ ten: "", moTa: "", slug: "", slugTuSua: false, thuTu, hien: true });

export default function Page() {
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [form, setForm] = useState<Form | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});

  const cds = [...data.chuyenDe].sort((a, b) => a.thuTu - b.thuTu);
  const soBai = (id: string) => data.articles.filter((a) => a.chuyenDeId === id && a.trangThai === "da-xuat-ban").length;

  const openNew = () => { setErr({}); setForm(EMPTY(cds.length + 1)); };
  const openEdit = (c: ChuyenDe) => { setErr({}); setForm({ id: c.id, ten: c.ten, moTa: c.moTa, slug: c.slug, slugTuSua: true, thuTu: c.thuTu, hien: c.hien }); };

  const move = (id: string, dir: -1 | 1) => {
    const i = cds.findIndex((c) => c.id === id); const j = i + dir;
    if (j < 0 || j >= cds.length) return;
    const order = cds.map((c) => c.id); [order[i], order[j]] = [order[j], order[i]];
    actions.update("chuyenDe", (list) => list.map((c) => ({ ...c, thuTu: order.indexOf(c.id) + 1 })));
  };
  const toggleHien = (c: ChuyenDe) => {
    actions.update("chuyenDe", (list) => list.map((x) => x.id === c.id ? { ...x, hien: !x.hien } : x));
    flash(c.hien ? `Đã ẩn chuyên đề “${c.ten}” khỏi Thư viện` : `Đã hiện chuyên đề “${c.ten}” trên Thư viện`);
  };

  const save = () => {
    if (!form) return;
    const e: Record<string, string> = {};
    if (!form.ten.trim()) e.ten = "Nhập tên chuyên đề.";
    else if (form.ten.length > 40) e.ten = "Tên tối đa 40 ký tự.";
    if (form.moTa.length > 120) e.moTa = "Mô tả tối đa 120 ký tự.";
    const slug = slugify(form.slug || form.ten);
    if (!slug) e.slug = "Đường dẫn không hợp lệ.";
    else if (data.chuyenDe.some((c) => c.slug === slug && c.id !== form.id)) e.slug = "Đường dẫn đã có chuyên đề khác dùng.";
    setErr(e);
    if (Object.keys(e).length) return;
    const isNew = !form.id;
    const id = form.id ?? slug;
    actions.update("chuyenDe", (list) => {
      const others = list.filter((c) => c.id !== id).sort((a, b) => a.thuTu - b.thuTu);
      const pos = Math.min(Math.max(1, form.thuTu), others.length + 1) - 1;
      const me: ChuyenDe = { id, ten: form.ten.trim(), moTa: form.moTa.trim(), slug, thuTu: 0, hien: form.hien };
      others.splice(pos, 0, me);
      return others.map((c, i) => ({ ...c, thuTu: i + 1 }));
    });
    setForm(null);
    flash(isNew ? `Đã thêm chuyên đề “${form.ten.trim()}”` : `Đã lưu chuyên đề “${form.ten.trim()}”`);
  };

  return (
    <>
      <CmsHeader crumbs={[{ label: "Bài viết", href: R.H04 }, { label: "Chuyên đề" }]} title="Chuyên đề" desc="Mỗi chuyên đề là một khối trên trang Thư viện và một chip lọc bài viết." right={<Button onClick={openNew}>+ Thêm chuyên đề</Button>} />
      <CmsCard>
        <Table head={["Thứ tự", "Tên chuyên đề", "Mô tả (hiện dưới tên)", "Đường dẫn", "Số bài", "Hiện", ""]}>
          {cds.map((c, i) => (
            <tr key={c.id} className={!c.hien ? "opacity-60" : undefined}>
              <td className="whitespace-nowrap">
                <span className="inline-flex items-center gap-1">
                  <span className="text-mut select-none" aria-hidden>⋮⋮</span>
                  <span className="w-5 text-center tabular-nums">{c.thuTu}</span>
                  <button type="button" onClick={() => move(c.id, -1)} disabled={i === 0} aria-label="Chuyển lên" className="size-6 rounded-sm border border-vien text-[11px] hover:border-blue disabled:opacity-30">▲</button>
                  <button type="button" onClick={() => move(c.id, 1)} disabled={i === cds.length - 1} aria-label="Chuyển xuống" className="size-6 rounded-sm border border-vien text-[11px] hover:border-blue disabled:opacity-30">▼</button>
                </span>
              </td>
              <td className="font-bold text-den whitespace-nowrap">{c.ten}</td>
              <td className="text-ink2">{c.moTa}</td>
              <td className="text-ink2 whitespace-nowrap">{R.F03(c.slug)}</td>
              <td className="tabular-nums">{soBai(c.id)}</td>
              <td>{c.hien ? <Chip tone="green">Hiện</Chip> : <Chip tone="grey">Ẩn</Chip>}</td>
              <td className="text-right whitespace-nowrap">
                <button type="button" onClick={() => openEdit(c)} className="text-blue font-bold">Sửa</button>
                <button type="button" onClick={() => toggleHien(c)} className="ml-4 text-ink2 hover:text-blue">{c.hien ? "Ẩn" : "Hiện"}</button>
              </td>
            </tr>
          ))}
        </Table>
        <p className="mt-4 text-[13px] text-mut">Dùng ▲▼ để đổi thứ tự khối trên trang Thư viện. Ẩn chuyên đề thì khối và bài trong đó tạm không hiện.</p>
      </CmsCard>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Sửa chuyên đề" : "Thêm chuyên đề"} width={760}
        footer={<><Button onClick={save}>Lưu chuyên đề</Button><Button kind="secondary" onClick={() => setForm(null)}>Huỷ</Button></>}>
        {form && (
          <div className="space-y-5">
            <Field label="Tên chuyên đề (≤ 40 ký tự)" count={`${form.ten.length}/40`} error={err.ten}>
              <Input value={form.ten} maxLength={60} placeholder="Toàn Tâm Vững Bước" onChange={(e) => setForm({ ...form, ten: e.target.value, slug: form.slugTuSua ? form.slug : slugify(e.target.value) })} />
            </Field>
            <Field label="Mô tả (≤ 120 ký tự, hiện dưới tên trên trang Thư viện)" count={`${form.moTa.length}/120`} error={err.moTa}>
              <Input value={form.moTa} maxLength={160} placeholder="Kiến thức tài chính cá nhân cho khách hàng trẻ" onChange={(e) => setForm({ ...form, moTa: e.target.value })} />
            </Field>
            <Field label="Đường dẫn (tự sinh từ tên, sửa được)" error={err.slug} hint={`Trang chuyên đề sẽ ở ${R.F03(slugify(form.slug || form.ten) || "…")}`}>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value, slugTuSua: true })} />
            </Field>
            <Field label="Thứ tự trên trang Thư viện">
              <Select value={form.thuTu} onChange={(e) => setForm({ ...form, thuTu: Number(e.target.value) })} className="w-[120px]">
                {Array.from({ length: form.id ? cds.length : cds.length + 1 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
            <Checkbox label="Hiện trên trang Thư viện" checked={form.hien} onChange={(e) => setForm({ ...form, hien: e.target.checked })} />
          </div>
        )}
      </Modal>
      {node}
    </>
  );
}

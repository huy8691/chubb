"use client";
/**
 * H13 · CMS — FAQ: HAI KHỐI độc lập theo trang (Tuyển dụng · Liên hệ & trợ giúp). Mỗi khối: tiêu đề + đếm + bảng
 * Thứ tự ⋮⋮ · Câu hỏi · Đối tượng · Cập nhật · Trạng thái · Sửa + nút "+ Thêm câu hỏi" riêng (điền sẵn trang).
 * H13a · Popup Thêm/sửa câu hỏi: câu hỏi ≤ 120 · trả lời ≤ 600 · Hiện trên trang ▾ · Đối tượng ▾ · Thứ tự ▾ · liên kết
 * · ○ Đã xuất bản ◉ Nháp · Lịch sử phiên bản · Lưu · Xem trước (mở B01/S03 tab mới) · Huỷ.
 */
import { useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDateTime } from "@/lib/seed";
import type { FAQ } from "@/lib/types";
import { Button, Field, Input, Modal, Radio, Select, StatusChip, Table, Textarea, cx, useFlash } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { DOI_TUONG, TRANG_FAQ, doiTuongLabel, trangFaqLabel } from "@/components/chung/const";

const MAX_CH = 120, MAX_TL = 600;
type Form = { id?: string; trang: FAQ["trang"]; doiTuong: FAQ["doiTuong"]; cauHoi: string; traLoi: string; thuTu: number; lienKet: string; trangThai: FAQ["trangThai"] };

export default function Page() {
  const { data, actions } = useStore();
  const { flash, node } = useFlash();
  const [form, setForm] = useState<Form | null>(null);
  const [loi, setLoi] = useState<Record<string, string>>({});
  const [moLichSu, setMoLichSu] = useState(false);
  const [keo, setKeo] = useState<string | null>(null);

  const cua = (trang: FAQ["trang"]) => data.faqs.filter((f) => f.trang === trang).sort((a, b) => a.thuTu - b.thuTu);
  const hienTai = form?.id ? data.faqs.find((f) => f.id === form.id) : undefined;

  const moThem = (trang: FAQ["trang"]) => { setLoi({}); setMoLichSu(false); setForm({ trang, doiTuong: trang === "tuyen-dung" ? "ung-vien" : "khach-hang", cauHoi: "", traLoi: "", thuTu: cua(trang).length + 1, lienKet: "", trangThai: "nhap" }); };
  const moSua = (f: FAQ) => { setLoi({}); setMoLichSu(false); setForm({ id: f.id, trang: f.trang, doiTuong: f.doiTuong, cauHoi: f.cauHoi, traLoi: f.traLoi, thuTu: f.thuTu, lienKet: f.lienKet ?? "", trangThai: f.trangThai }); };

  const luu = () => {
    if (!form) return;
    const e: Record<string, string> = {};
    if (!form.cauHoi.trim()) e.cauHoi = "Nhập câu hỏi.";
    if (form.cauHoi.length > MAX_CH) e.cauHoi = `Tối đa ${MAX_CH} ký tự.`;
    if (!form.traLoi.trim()) e.traLoi = "Nhập câu trả lời.";
    if (form.traLoi.length > MAX_TL) e.traLoi = `Tối đa ${MAX_TL} ký tự.`;
    if (form.lienKet && !form.lienKet.startsWith("/") && !/^https?:\/\//.test(form.lienKet)) e.lienKet = "Liên kết bắt đầu bằng / hoặc https://";
    setLoi(e);
    if (Object.keys(e).length) return;
    const now = new Date().toISOString();
    actions.update("faqs", (list) => {
      const id = form.id ?? `f${Date.now()}`;
      const khac = list.filter((f) => f.id !== id);
      const cu = list.find((f) => f.id === id);
      const moi: FAQ = {
        id, trang: form.trang, doiTuong: form.doiTuong, cauHoi: form.cauHoi.trim(), traLoi: form.traLoi.trim(), lienKet: form.lienKet.trim() || undefined,
        thuTu: form.thuTu, trangThai: form.trangThai, capNhat: now,
        lichSu: cu ? [{ ngay: cu.capNhat, cauHoi: cu.cauHoi, traLoi: cu.traLoi, trangThai: cu.trangThai }, ...(cu.lichSu ?? [])].slice(0, 10) : undefined,
      };
      // chèn vào vị trí thứ tự trong cùng trang, đánh số lại
      const cungTrang = khac.filter((f) => f.trang === form.trang).sort((a, b) => a.thuTu - b.thuTu);
      cungTrang.splice(Math.min(Math.max(form.thuTu - 1, 0), cungTrang.length), 0, moi);
      cungTrang.forEach((f, i) => { f.thuTu = i + 1; });
      return [...khac.filter((f) => f.trang !== form.trang), ...cungTrang.map((f) => ({ ...f }))];
    });
    flash(form.id ? "Đã lưu câu hỏi" : "Đã thêm câu hỏi");
    setForm(null);
  };

  const xemTruoc = () => { if (form) window.open(form.trang === "tuyen-dung" ? `${R.B01}#cau-hoi` : R.S03, "_blank"); };

  const khoiPhuc = (v: NonNullable<FAQ["lichSu"]>[number]) => { if (form) { setForm({ ...form, cauHoi: v.cauHoi, traLoi: v.traLoi, trangThai: v.trangThai }); setMoLichSu(false); flash(`Đã khôi phục bản ${fmtDateTime(v.ngay)} — bấm Lưu để áp dụng`); } };

  // Kéo ⋮⋮ đổi thứ tự trong cùng khối
  const tha = (trang: FAQ["trang"], dichId: string) => {
    if (!keo || keo === dichId) return;
    const ds = cua(trang);
    const tu = ds.findIndex((f) => f.id === keo), den = ds.findIndex((f) => f.id === dichId);
    if (tu < 0 || den < 0) return;
    const [m] = ds.splice(tu, 1); ds.splice(den, 0, m);
    const thuTu = new Map(ds.map((f, i) => [f.id, i + 1]));
    actions.update("faqs", (list) => list.map((f) => (thuTu.has(f.id) ? { ...f, thuTu: thuTu.get(f.id)!, capNhat: new Date().toISOString() } : f)));
    setKeo(null);
  };

  const khoi = (trang: FAQ["trang"], moTa: string) => {
    const ds = cua(trang);
    const nhap = ds.filter((f) => f.trangThai === "nhap").length;
    return (
      <CmsCard title={trangFaqLabel(trang)} desc={`${ds.length} câu hỏi · ${nhap} nháp · ${moTa}`} right={<Button size="sm" onClick={() => moThem(trang)}>+ Thêm câu hỏi</Button>}>
        <Table head={["Thứ tự", "Câu hỏi", "Đối tượng", "Cập nhật", "Trạng thái", ""]}>
          {ds.map((f) => (
            <tr key={f.id} draggable onDragStart={() => setKeo(f.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => tha(trang, f.id)} onDragEnd={() => setKeo(null)} className={cx("cursor-grab", keo === f.id && "opacity-40")}>
              <td className="text-ink2 whitespace-nowrap"><span className="text-mut mr-2" aria-hidden>⋮⋮</span>{f.thuTu}</td>
              <td className="text-den">{f.cauHoi}</td>
              <td className="text-ink2 whitespace-nowrap">{doiTuongLabel(f.doiTuong)}</td>
              <td className="text-ink2 whitespace-nowrap">{fmtDate(f.capNhat)}</td>
              <td><StatusChip s={f.trangThai} /></td>
              <td className="text-right"><button type="button" className="text-blue font-bold" onClick={() => moSua(f)}>Sửa</button></td>
            </tr>
          ))}
        </Table>
        {ds.length === 0 && <div className="text-[13px] text-mut py-6 text-center">Chưa có câu hỏi. Bấm “+ Thêm câu hỏi”.</div>}
      </CmsCard>
    );
  };

  return (
    <>
      <CmsHeader title="FAQ" desc={`${data.faqs.length} câu hỏi · hai khối theo trang hiển thị`} />
      <div className="space-y-6">
        {khoi("tuyen-dung", "hiện trên trang Tuyển dụng")}
        {khoi("lien-he", "hiện trên trang Liên hệ & trợ giúp, lọc theo đối tượng")}
      </div>
      <p className="mt-4 text-[13px] text-ink2">Kéo ⋮⋮ để đổi thứ tự hiện trên trang.</p>

      {/* H13a · Popup */}
      <Modal open={!!form} onClose={() => setForm(null)} width={760} title={form?.id ? `Sửa câu hỏi #${form.thuTu}` : "Thêm câu hỏi"}
        footer={form && (
          <div className="flex flex-wrap items-center gap-3 w-full">
            <Button onClick={luu}>Lưu</Button>
            <Button kind="secondary" onClick={xemTruoc}>Xem trước</Button>
            <Button kind="secondary" className="ml-auto" onClick={() => setForm(null)}>Huỷ</Button>
          </div>
        )}>
        {form && (
          <div className="space-y-5">
            <Field label={`Câu hỏi (≤ ${MAX_CH} ký tự)`} count={`${form.cauHoi.length}/${MAX_CH}`} error={loi.cauHoi}>
              <Input value={form.cauHoi} onChange={(e) => setForm({ ...form, cauHoi: e.target.value.slice(0, MAX_CH) })} placeholder="Thu nhập được tính thế nào?" />
            </Field>
            <Field label={`Trả lời (≤ ${MAX_TL} ký tự, định dạng cơ bản)`} count={`${form.traLoi.length}/${MAX_TL}`} error={loi.traLoi}>
              <Textarea value={form.traLoi} onChange={(e) => setForm({ ...form, traLoi: e.target.value.slice(0, MAX_TL) })} className="min-h-[120px]" />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Hiện trên trang"><Select value={form.trang} onChange={(e) => setForm({ ...form, trang: e.target.value as FAQ["trang"] })}>{TRANG_FAQ.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select></Field>
              <Field label="Đối tượng"><Select value={form.doiTuong} onChange={(e) => setForm({ ...form, doiTuong: e.target.value as FAQ["doiTuong"] })}>{DOI_TUONG.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</Select></Field>
              <Field label="Thứ tự"><Select value={form.thuTu} onChange={(e) => setForm({ ...form, thuTu: Number(e.target.value) })}>{Array.from({ length: cua(form.trang).length + (form.id ? 0 : 1) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
            </div>
            <Field label="Liên kết đính kèm (tuỳ chọn)" error={loi.lienKet} hint="Đường dẫn trong site, ví dụ /toan-tam-phat-trien/tai-chinh-ca-nhan">
              <Input value={form.lienKet} onChange={(e) => setForm({ ...form, lienKet: e.target.value })} placeholder="/toan-tam-phat-trien/tai-chinh-ca-nhan" />
            </Field>
            <div className="flex flex-wrap items-center gap-8">
              <Radio name="tt" label="Đã xuất bản" checked={form.trangThai === "da-xuat-ban"} onChange={() => setForm({ ...form, trangThai: "da-xuat-ban" })} />
              <Radio name="tt" label="Nháp" checked={form.trangThai === "nhap"} onChange={() => setForm({ ...form, trangThai: "nhap" })} />
              {form.id && (
                <button type="button" className="ml-auto text-[13px] text-blue font-bold" onClick={() => setMoLichSu(!moLichSu)}>Lịch sử phiên bản ({(hienTai?.lichSu?.length ?? 0) + 1})</button>
              )}
            </div>
            {moLichSu && hienTai && (
              <div className="border border-vien rounded-sm divide-y divide-vien2 text-[13px]">
                <div className="flex items-center justify-between px-4 py-2.5"><span className="text-den">{fmtDateTime(hienTai.capNhat)} · <StatusChip s={hienTai.trangThai} /></span><span className="text-mut">Bản hiện tại</span></div>
                {(hienTai.lichSu ?? []).map((v, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5"><span className="text-ink2">{fmtDateTime(v.ngay)} · <StatusChip s={v.trangThai} /> <span className="text-mut">— {v.cauHoi}</span></span><button type="button" className="text-blue font-bold" onClick={() => khoiPhuc(v)}>Khôi phục</button></div>
                ))}
                {!(hienTai.lichSu?.length) && <div className="px-4 py-2.5 text-mut">Chưa có bản trước — mỗi lần Lưu sẽ giữ lại bản cũ.</div>}
              </div>
            )}
          </div>
        )}
      </Modal>
      {node}
    </>
  );
}

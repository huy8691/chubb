"use client";
/**
 * H09a · CMS — Thêm / sửa một tài liệu (id "moi" = tệp mới). Ba phần theo thứ tự người dùng nghĩ:
 * 1 · Tệp (chọn tệp — chỉ PDF, DOC/DOCX, JPG, PNG; hiện tên · định dạng · kích cỡ; Bỏ)
 * 2 · Thông tin Tư vấn viên nhìn thấy (tên hiển thị ≤ 90 · Loại ▾ + Thêm loại mới → H09b · mô tả ngắn ≤ 120)
 * 3 · Phần · hiệu lực (◉ Công khai ○ Dành cho Tư vấn viên · ngày hết hạn · ghi chú thay đổi · phiên bản tự tăng khi thay tệp)
 * Cột phải: trạng thái tệp · lưu gần nhất · Lịch sử phiên bản (Thay phiên bản mới · Khôi phục).
 * Hàng nút: Lưu nháp · Xem trước (G04 tab mới) · Xuất bản · Gỡ · Huỷ → H09. Ghi store.documents.
 */
import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDateTime } from "@/lib/seed";
import type { Document } from "@/lib/types";
import { Button, Chip, Field, Input, Radio, Select, StatusChip, Textarea, cx, useFlash } from "@/components/ui";
import { CmsCard, CmsFormActions, CmsHeader } from "@/components/cms/CmsShell";

const MAX_TEN = 90, MAX_MOTA = 120;
const DINH_DANG_HOP_LE: Record<string, Document["dinhDang"]> = { pdf: "PDF", doc: "DOC", docx: "DOCX", jpg: "JPG", jpeg: "JPG", png: "PNG" };
const fmtKichCo = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const tangPhienBan = (v: string) => { const m = /^v?(\d+)\.(\d+)$/.exec(v); return m ? `v${m[1]}.${Number(m[2]) + 1}` : "v1.1"; };

const trong = (loaiId: string): Document => ({
  id: "", ten: "", loaiId, dinhDang: "PDF", kichCo: "", phienBan: "v1.0", capNhat: new Date().toISOString(), phan: "cong-khai", trangThai: "nhap", moTa: "", ghiChu: "", hetHan: undefined, tenTep: undefined,
});

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, ready, actions } = useStore();
  const { flash, node } = useFlash();
  const isNew = id === "moi";
  const loai = [...data.docTypes].sort((a, b) => a.thuTu - b.thuTu);
  const fileRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState<Document | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});
  const [luuGanNhat, setLuuGanNhat] = useState<string | undefined>(undefined);
  const [tepMoi, setTepMoi] = useState(false); // đã chọn tệp mới trong lần sửa này → phiên bản tự tăng khi lưu
  const [moLichSu, setMoLichSu] = useState(false);
  const [keo, setKeo] = useState(false);

  // Nạp form một lần khi store sẵn sàng (điều chỉnh state trong lúc render — không dùng effect)
  const [daNap, setDaNap] = useState(false);
  if (ready && !daNap) {
    setDaNap(true);
    if (isNew) setF(trong(loai[0]?.id ?? ""));
    else {
      const d = data.documents.find((x) => x.id === id);
      if (d) { setF({ ...d }); setLuuGanNhat(d.capNhat); }
    }
  }
  if (!ready || !daNap) return null;
  if (!f) return <CmsCard><div className="text-ink2">Không tìm thấy tài liệu. <button type="button" className="text-blue font-bold" onClick={() => router.push(R.H09)} >Về danh sách</button></div></CmsCard>;

  const set = (patch: Partial<Document>) => setF({ ...f, ...patch });
  const daXB = f.trangThai === "da-xuat-ban";
  const goc = isNew ? undefined : data.documents.find((x) => x.id === id);

  const chonTep = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const dd = DINH_DANG_HOP_LE[ext];
    if (!dd) { setErr({ ...err, tep: `Tệp “${file.name}” không đúng định dạng. Chỉ nhận PDF, DOC/DOCX, JPG, PNG.` }); return; }
    if (file.size > 50 * 1024 * 1024) { setErr({ ...err, tep: "Tệp vượt 50 MB." }); return; }
    const { tep: _bo, ...rest } = err; void _bo; setErr(rest);
    setTepMoi(!isNew && !!f.tenTep);
    set({ tenTep: file.name, dinhDang: dd, kichCo: fmtKichCo(file.size), ten: f.ten || file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") });
  };
  const boTep = () => { set({ tenTep: undefined, kichCo: "" }); setTepMoi(false); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.tenTep) e.tep = "Chọn một tệp PDF, DOC/DOCX, JPG hoặc PNG.";
    if (!f.ten.trim()) e.ten = "Nhập tên hiển thị.";
    else if (f.ten.length > MAX_TEN) e.ten = `Tên tối đa ${MAX_TEN} ký tự.`;
    if (!f.loaiId) e.loai = "Chọn loại tài liệu.";
    if ((f.moTa ?? "").length > MAX_MOTA) e.moTa = `Mô tả tối đa ${MAX_MOTA} ký tự.`;
    if (f.hetHan && f.hetHan < new Date().toISOString().slice(0, 10)) e.hetHan = "Ngày hết hạn phải sau hôm nay.";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  /** Ghi vào store; trả về bản đã ghi */
  const persist = (patch: Partial<Document>): Document => {
    const now = new Date().toISOString();
    const newId = f.id || `tl${now.replace(/\D/g, "").slice(0, 17)}`;
    const phienBan = tepMoi && goc ? tangPhienBan(goc.phienBan) : f.phienBan;
    const lichSu = tepMoi && goc ? [{ ngay: goc.capNhat, phienBan: goc.phienBan, tenTep: goc.tenTep, ghiChu: goc.ghiChu }, ...(goc.lichSu ?? [])].slice(0, 10) : f.lichSu;
    const saved: Document = { ...f, ...patch, id: newId, ten: f.ten.trim(), moTa: f.moTa?.trim() || undefined, ghiChu: f.ghiChu?.trim() || undefined, phienBan, lichSu, capNhat: now };
    actions.update("documents", (ds) => (ds.some((x) => x.id === newId) ? ds.map((x) => (x.id === newId ? saved : x)) : [saved, ...ds]));
    setF(saved); setLuuGanNhat(now); setTepMoi(false);
    if (isNew) router.replace(R.H09a(newId));
    return saved;
  };

  const luuNhap = () => { if (!validate()) return; persist({ trangThai: daXB ? "da-xuat-ban" : "nhap" }); flash(daXB ? "Đã lưu thay đổi" : "Đã lưu nháp"); };
  const xemTruoc = () => { if (!validate()) return; persist({}); window.open(f.phan === "tvv" ? R.G10 : R.G04, "_blank"); };
  const xuatBan = () => { if (!validate()) return; persist({ trangThai: "da-xuat-ban" }); flash(`Đã xuất bản — tệp hiện trên trang Tài liệu (${f.phan === "cong-khai" ? "Công khai" : "Dành cho Tư vấn viên"})`); };
  const go = () => { persist({ trangThai: "da-go" }); flash("Đã gỡ tệp khỏi trang Tài liệu"); };
  const khoiPhuc = (v: NonNullable<Document["lichSu"]>[number]) => { set({ phienBan: v.phienBan, tenTep: v.tenTep ?? f.tenTep, ghiChu: v.ghiChu ?? "" }); setTepMoi(false); setMoLichSu(false); flash(`Đã khôi phục bản ${v.phienBan} — bấm Lưu để áp dụng`); };

  const tieuDe = isNew ? "Thêm tài liệu" : "Sửa tài liệu";

  return (
    <>
      <CmsHeader crumbs={[{ label: "Tài liệu", href: R.H09 }, { label: tieuDe }]} title={tieuDe} />
      <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-6">
          {/* 1 · TỆP */}
          <CmsCard title="1 · Tệp">
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { chonTep(e.target.files?.[0]); e.target.value = ""; }} />
            {f.tenTep ? (
              <div className="flex items-center justify-between gap-4 border border-vien rounded-sm px-4 py-3 text-[13.5px]">
                <span className="text-den truncate">📄 {f.tenTep} · {f.dinhDang}{f.kichCo ? ` · ${f.kichCo}` : ""}</span>
                <span className="flex gap-4 shrink-0">
                  <button type="button" className="text-blue font-bold" onClick={() => fileRef.current?.click()}>Thay phiên bản mới</button>
                  <button type="button" className="text-ink2 hover:text-red-fg font-bold" onClick={boTep}>Bỏ</button>
                </span>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setKeo(true); }} onDragLeave={() => setKeo(false)}
                onDrop={(e) => { e.preventDefault(); setKeo(false); chonTep(e.dataTransfer.files?.[0]); }}
                className={cx("w-full border-2 border-dashed rounded-sm py-10 text-center text-[13px]", keo ? "border-blue bg-blue-soft text-blue" : "border-vien text-ink2 hover:border-blue")}>
                Kéo thả hoặc bấm chọn tệp · PDF, DOC/DOCX, JPG, PNG · tối đa 50 MB
              </button>
            )}
            {err.tep && <p className="mt-2 text-[12.5px] text-red-fg">{err.tep}</p>}
            {tepMoi && goc && <p className="mt-2 text-[12.5px] text-ink2">Tệp mới thay cho {goc.phienBan} — khi lưu, phiên bản thành {tangPhienBan(goc.phienBan)} và bản cũ vào Lịch sử phiên bản.</p>}
          </CmsCard>

          {/* 2 · THÔNG TIN TƯ VẤN VIÊN NHÌN THẤY */}
          <CmsCard title="2 · Thông tin Tư vấn viên nhìn thấy">
            <div className="grid grid-cols-[1fr_260px] gap-5">
              <Field label="Tên hiển thị *" count={`${f.ten.length}/${MAX_TEN}`} error={err.ten}>
                <Input value={f.ten} maxLength={MAX_TEN + 10} placeholder="Brochure Chubb Life An Tâm Trọn Đời" onChange={(e) => set({ ten: e.target.value })} />
              </Field>
              <div>
                <Field label="Loại tài liệu *" error={err.loai}>
                  <Select value={f.loaiId} onChange={(e) => set({ loaiId: e.target.value })}>
                    {!f.loaiId && <option value="">Chọn loại…</option>}
                    {loai.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
                  </Select>
                </Field>
                <Button kind="ghost" size="sm" href={R.H09b} className="mt-1 -ml-3">Thêm loại mới</Button>
              </div>
            </div>
            <Field label={`Mô tả ngắn (≤ ${MAX_MOTA} ký tự)`} count={`${(f.moTa ?? "").length}/${MAX_MOTA}`} error={err.moTa} className="mt-4">
              <Input value={f.moTa ?? ""} maxLength={MAX_MOTA + 20} placeholder="Bản chính thức 2026, dùng khi gặp khách hàng." onChange={(e) => set({ moTa: e.target.value })} />
            </Field>
          </CmsCard>

          {/* 3 · PHẦN · HIỆU LỰC */}
          <CmsCard title="3 · Phần · hiệu lực">
            <div className="grid grid-cols-[1fr_260px] gap-5">
              <div className="space-y-3">
                <Radio name="phan" label="Công khai — ai cũng xem và tải được" checked={f.phan === "cong-khai"} onChange={() => set({ phan: "cong-khai" })} />
                <Radio name="phan" label="Dành cho Tư vấn viên — cần đăng nhập để tải" checked={f.phan === "tvv"} onChange={() => set({ phan: "tvv" })} />
              </div>
              <div>
                <Field label="Ngày hết hạn (tệp tự ẩn sau ngày này)" error={err.hetHan}>
                  <Input type="date" value={f.hetHan ?? ""} onChange={(e) => set({ hetHan: e.target.value || undefined })} />
                </Field>
                <p className="mt-3 text-[12.5px] text-ink2">Phiên bản: <b className="text-den">{tepMoi && goc ? tangPhienBan(goc.phienBan) : f.phienBan}</b> — tự tăng khi thay tệp mới</p>
              </div>
            </div>
            <Field label="Ghi chú thay đổi (hiện ở “Mới cập nhật”)" className="mt-4">
              <Textarea value={f.ghiChu ?? ""} placeholder="Cập nhật biểu phí quý 3" className="min-h-[72px]" onChange={(e) => set({ ghiChu: e.target.value })} />
            </Field>

            <CmsFormActions>
              <Button kind="secondary" onClick={luuNhap}>{daXB ? "Lưu thay đổi" : "Lưu nháp"}</Button>
              <Button kind="secondary" onClick={xemTruoc}>Xem trước</Button>
              {!daXB && <Button onClick={xuatBan}>Xuất bản</Button>}
              {daXB && <Button kind="danger" onClick={go}>Gỡ</Button>}
              <Button kind="secondary" className="ml-auto" onClick={() => router.push(R.H09)}>Huỷ</Button>
            </CmsFormActions>
          </CmsCard>
        </div>

        {/* Cột phải */}
        <div className="space-y-6">
          <CmsCard title="Trạng thái tệp">
            <div className="flex flex-wrap gap-2">
              <StatusChip s={f.trangThai} />
              {f.phan === "cong-khai" ? <Chip tone="blue">Công khai</Chip> : <Chip tone="amber">Dành cho Tư vấn viên</Chip>}
              {f.hetHan && f.hetHan < new Date().toISOString().slice(0, 10) && <Chip tone="red">Hết hạn</Chip>}
            </div>
            <p className="mt-3 text-[12.5px] text-ink2">Nháp chỉ bạn thấy. Bấm Xuất bản thì tệp hiện trên trang Tài liệu theo phần đã chọn.</p>
            <dl className="mt-4 text-[13px] space-y-1.5">
              <div className="flex justify-between"><dt className="text-mut">Lưu gần nhất</dt><dd className="text-den">{luuGanNhat ? fmtDateTime(luuGanNhat) : "Chưa lưu"}</dd></div>
              <div className="flex justify-between"><dt className="text-mut">Phiên bản</dt><dd className="text-den">{f.phienBan}</dd></div>
              {f.hetHan && <div className="flex justify-between"><dt className="text-mut">Hết hạn</dt><dd className="text-den">{fmtDate(f.hetHan)}</dd></div>}
            </dl>
          </CmsCard>
          <CmsCard title={`Lịch sử phiên bản (${(f.lichSu?.length ?? 0) + (f.tenTep ? 1 : 0)})`}>
            <div className="flex flex-wrap gap-3 text-[13px]">
              <button type="button" className="text-blue font-bold" onClick={() => fileRef.current?.click()}>Thay phiên bản mới</button>
              {(f.lichSu?.length ?? 0) > 0 && <button type="button" className="text-blue font-bold" onClick={() => setMoLichSu(!moLichSu)}>{moLichSu ? "Ẩn bản trước" : "Khôi phục bản trước"}</button>}
            </div>
            <div className="mt-3 border border-vien rounded-sm divide-y divide-vien2 text-[13px]">
              <div className="flex items-center justify-between px-3 py-2.5"><span className="text-den"><b>{f.phienBan}</b> · {luuGanNhat ? fmtDate(luuGanNhat) : "chưa lưu"}</span><span className="text-mut">Bản hiện tại</span></div>
              {moLichSu && (f.lichSu ?? []).map((v, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="text-ink2 min-w-0"><b className="text-den">{v.phienBan}</b> · {fmtDate(v.ngay)}{v.ghiChu ? <span className="text-mut"> — {v.ghiChu}</span> : null}</span>
                  <button type="button" className="text-blue font-bold shrink-0" onClick={() => khoiPhuc(v)}>Khôi phục</button>
                </div>
              ))}
              {!(f.lichSu?.length) && <div className="px-3 py-2.5 text-mut">Chưa có bản trước — mỗi lần thay tệp mới sẽ giữ lại bản cũ.</div>}
            </div>
          </CmsCard>
        </div>
      </div>
      {node}
    </>
  );
}

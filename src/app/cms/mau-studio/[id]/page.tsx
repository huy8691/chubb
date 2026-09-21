"use client";
/**
 * H02a · CMS — Mẫu Studio — tạo / sửa (id "moi" = mẫu mới). Mô hình PNG + field:
 * mẫu = MỘT ảnh nền PNG (toàn bộ thiết kế nung vào ảnh) + các field chữ đặt trên ảnh + ô ảnh chân dung (lỗ trong suốt của PNG).
 * Trái: Tên mẫu · Ảnh nền mẫu (kéo thả) · Dòng disclaimer · Field đặt trên ảnh (thêm/sửa cỡ chữ·màu·căn lề·ký tự·xoá) · Ảnh chân dung (tự đặt theo ô trong suốt).
 * Phải: xem trước StudioPreview (kiêm khung đặt vị trí). Không còn: Màu nền · Hoạ tiết · Định dạng · Khung · Tỉ lệ · Lịch sử phiên bản · Xem trước.
 */
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDateTime } from "@/lib/seed";
import type { StudioField, StudioTemplate } from "@/lib/types";
import { Button, Field, Input, Select, StatusChip, Textarea, cx, useFlash } from "@/components/ui";
import { CmsCard, CmsFormActions, CmsHeader } from "@/components/cms/CmsShell";
import { StudioPreview } from "@/components/cong-cu/StudioPreview";

const DISCLAIMER = "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo.";
const LOAI_LABEL: Record<StudioField["loai"], string> = { hoTen: "Họ tên", chucDanh: "Chức danh", soDienThoai: "Số điện thoại", gioiThieu: "Câu giới thiệu" };
const LOAI_THU_TU: StudioField["loai"][] = ["hoTen", "chucDanh", "soDienThoai", "gioiThieu"];
/** Field mặc định theo loại (toạ độ + cỡ chữ khớp "Chubb – Tự Do An Phúc") */
const FIELD_DEFAULT: Record<StudioField["loai"], StudioField> = {
  hoTen: { loai: "hoTen", xPct: 24.7, yPct: 66.5, size: 2.8, mau: "#13235f", canLe: "center", gioiHan: 40, dam: true },
  chucDanh: { loai: "chucDanh", xPct: 24.7, yPct: 72.8, size: 1.8, mau: "#5b6270", canLe: "center", gioiHan: 30, dam: false },
  soDienThoai: { loai: "soDienThoai", xPct: 24.7, yPct: 79.2, size: 2.2, mau: "#13235f", canLe: "center", gioiHan: 15, dam: true },
  gioiThieu: { loai: "gioiThieu", xPct: 24.7, yPct: 86, size: 1.5, mau: "#5b6270", canLe: "center", gioiHan: 80, dam: false },
};

const trong = (): StudioTemplate => ({
  id: "", ten: "", anh: "", anhNen: "", tiLe: "16:9", phienBan: 1, disclaimer: DISCLAIMER, trangThai: "nhap", soAnhDaTao: 0,
  capNhat: new Date().toISOString(), anhChanDung: { xPct: 25.1, yPct: 34.5, dPct: 27.6 },
  fields: [{ ...FIELD_DEFAULT.hoTen }, { ...FIELD_DEFAULT.chucDanh }, { ...FIELD_DEFAULT.soDienThoai }],
});

/** Đọc ảnh nền đã chọn thành data URL (để xem trước ngay) */
function docAnhNen(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(file); });
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, ready, actions } = useStore();
  const { flash, node } = useFlash();
  const isNew = id === "moi";
  const fileRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState<StudioTemplate | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});
  const [luuGanNhat, setLuuGanNhat] = useState<string | undefined>(undefined);
  const [selField, setSelField] = useState(0);
  const [iconPos, setIconPos] = useState<Record<string, { left: number; top: number }>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ i: number; dx: number; dy: number } | null>(null);

  // Đo mép trái thật của từng field trên preview (để đặt icon kéo sát bên trái field, không đè chữ)
  useEffect(() => {
    const el = previewRef.current; if (!el) return;
    const pr = el.getBoundingClientRect(); if (!pr.width) return;
    const pos: Record<string, { left: number; top: number }> = {};
    el.querySelectorAll<HTMLElement>("[data-fld]").forEach((fe) => {
      const k = fe.getAttribute("data-fld"); if (!k) return; const r = fe.getBoundingClientRect();
      pos[k] = { left: ((r.left - pr.left) / pr.width) * 100, top: ((r.top + r.height / 2 - pr.top) / pr.height) * 100 };
    });
    setIconPos(pos);
  }, [f, ready]);

  // Nạp form một lần khi store sẵn sàng (điều chỉnh state trong lúc render — không dùng effect)
  const [daNap, setDaNap] = useState(false);
  if (ready && !daNap) {
    setDaNap(true);
    if (isNew) setF(trong());
    else {
      const m = data.studioTemplates.find((x) => x.id === id);
      if (m) { setF({ ...trong(), ...m }); setLuuGanNhat(m.capNhat); }
    }
  }

  if (!ready || !daNap) return null;
  if (!f) return <CmsCard><div className="text-ink2">Không tìm thấy mẫu Studio. <button type="button" className="text-blue font-bold" onClick={() => router.push(R.H02)}>Về danh sách</button></div></CmsCard>;

  const soAnh = isNew ? 0 : data.studioImages.filter((a) => a.templateId === f.id).length || f.soAnhDaTao;
  const tenTep = f.tenTep ?? (isNew ? "" : `nen-${f.id}.png`);
  const fields = f.fields ?? [];
  const conThieu = LOAI_THU_TU.filter((l) => !fields.some((x) => x.loai === l));
  const set = (patch: Partial<StudioTemplate>) => setF({ ...f, ...patch });
  const setFields = (fn: (l: StudioField[]) => StudioField[]) => setF({ ...f, fields: fn(fields) });
  const setField = (i: number, patch: Partial<StudioField>) => setFields((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const themField = () => { if (conThieu.length) setFields((l) => [...l, { ...FIELD_DEFAULT[conThieu[0]] }]); };
  const xoaField = (i: number) => setFields((l) => l.filter((_, j) => j !== i));

  // Kéo-thả field trên khung xem trước → cập nhật toạ độ (% theo khung)
  const clampPct = (v: number) => Math.max(2, Math.min(98, v));
  const pctOf = (e: React.PointerEvent<HTMLElement>) => { const r = previewRef.current!.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }; };
  const onHandleDown = (i: number) => (e: React.PointerEvent<HTMLElement>) => { e.preventDefault(); setSelField(i); if (!previewRef.current) return; const p = pctOf(e), fd = fields[i]; dragRef.current = { i, dx: p.x - fd.xPct, dy: p.y - fd.yPct }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} };
  const onHandleMove = (e: React.PointerEvent<HTMLElement>) => { const d = dragRef.current; if (!d || !previewRef.current) return; const p = pctOf(e); setField(d.i, { xPct: +clampPct(p.x - d.dx).toFixed(1), yPct: +clampPct(p.y - d.dy).toFixed(1) }); };
  const onHandleUp = () => { dragRef.current = null; };

  const validate = (publishing: boolean) => {
    const e: Record<string, string> = {};
    if (!f.ten.trim()) e.ten = "Nhập tên mẫu.";
    else if (f.ten.length > 60) e.ten = "Tên mẫu tối đa 60 ký tự.";
    if (data.studioTemplates.some((x) => x.ten.trim().toLowerCase() === f.ten.trim().toLowerCase() && x.id !== f.id)) e.ten = "Đã có mẫu khác cùng tên.";
    if (!(f.disclaimer ?? "").trim()) e.disclaimer = "Dòng disclaimer bắt buộc — in cố định dưới ảnh.";
    if (publishing && !f.anhNen) e.anh = "Mẫu xuất bản cần ảnh nền.";
    if (publishing && fields.length === 0) e.fields = "Thêm ít nhất một field cho Tư vấn viên điền.";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  /** Ghi vào store; trả về mẫu đã lưu */
  const persist = (patch: Partial<StudioTemplate>): StudioTemplate => {
    const now = new Date().toISOString();
    const saved: StudioTemplate = { ...f, ...patch, tenTep: tenTep || undefined, capNhat: now, id: f.id || `m${Date.now()}` };
    actions.update("studioTemplates", (l) => (l.some((x) => x.id === saved.id) ? l.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...l]));
    setF(saved); setLuuGanNhat(now);
    if (isNew) router.replace(R.H02a(saved.id));
    return saved;
  };

  const luuNhap = () => { if (!validate(false)) return; persist({ trangThai: f.trangThai === "da-xuat-ban" ? "da-xuat-ban" : "nhap" }); flash("Đã lưu nháp"); };
  const xuatBan = () => { if (!validate(true)) return; persist({ trangThai: "da-xuat-ban" }); flash(f.trangThai === "da-xuat-ban" ? "Đã lưu — mẫu vẫn hiện trong Studio" : "Đã xuất bản — mẫu hiện trong Studio"); };
  const chonTep = async (file?: File) => { if (!file) return; const url = await docAnhNen(file); set({ anhNen: url, anh: url, tenTep: file.name }); setErr({ ...err, anh: "" }); };

  return (
    <>
      <CmsHeader
        crumbs={[{ label: "Mẫu Studio", href: R.H02 }, { label: isNew ? "Tạo mẫu mới" : f.ten }]}
        title={<span className="flex items-center gap-3">{isNew ? "Tạo mẫu mới" : f.ten}<StatusChip s={f.trangThai} /></span>}
        desc={isNew ? "Mẫu mới ở trạng thái Nháp — chỉ hiện cho Tư vấn viên sau khi Xuất bản." : `Cập nhật ${fmtDate(f.capNhat)} · ${soAnh} ảnh Tư vấn viên đã tạo từ mẫu này`}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_520px] gap-6 items-start">
        <div className="space-y-6">
          <CmsCard title="Mẫu">
            <div className="space-y-5">
              <Field label="Tên mẫu" count={`${f.ten.length}/60`} error={err.ten}>
                <Input value={f.ten} onChange={(e) => set({ ten: e.target.value })} placeholder="Giới thiệu bản thân" className="max-w-[420px]" />
              </Field>
              <Field label="Ảnh nền mẫu" error={err.anh}>
                <button type="button" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chonTep(e.dataTransfer.files?.[0]); }} className="w-full border border-dashed border-vien rounded-sm px-4 py-6 text-left text-[13px] text-ink2 hover:border-blue">
                  Kéo thả hoặc bấm chọn ảnh nền · PNG · tỉ lệ nào cũng được{tenTep ? <> · đã có <b className="text-den">{tenTep}</b></> : <> · <span className="text-mut">chưa có ảnh nền</span></>}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => chonTep(e.target.files?.[0])} />
                <div className="mt-1.5 text-[12px] text-mut">Toàn bộ thiết kế (màu, hoạ tiết, bố cục, logo) nằm trong ảnh nền. Chừa một ô tròn trong suốt cho ảnh chân dung.</div>
              </Field>
              <Field label="Dòng disclaimer (in trong ảnh nền)" count={`${(f.disclaimer ?? "").length}/120`} error={err.disclaimer}>
                <Textarea value={f.disclaimer ?? ""} onChange={(e) => set({ disclaimer: e.target.value.slice(0, 120) })} className="min-h-[64px]" />
              </Field>

              <Field label="Field đặt trên ảnh" error={err.fields}>
                <div className="rounded-sm border border-vien2 overflow-hidden">
                  <div className="grid grid-cols-[1.4fr_0.9fr_1fr_1fr_0.7fr_auto] gap-2 items-center bg-vien2/60 px-3 py-2 text-[11.5px] font-bold text-ink2">
                    <span>Field</span><span>Cỡ chữ <span className="font-normal text-mut">(% rộng)</span></span><span>Màu</span><span>Căn lề</span><span>Ký tự</span><span></span>
                  </div>
                  {fields.length === 0 ? (
                    <div className="px-3 py-4 text-[13px] text-mut">Chưa có field nào. Bấm “+ Thêm field”.</div>
                  ) : fields.map((fd, i) => (
                    <div key={i} onClick={() => setSelField(i)} className={cx("grid grid-cols-[1.4fr_0.9fr_1fr_1fr_0.7fr_auto] gap-2 items-center px-3 py-2 border-t border-vien2 cursor-pointer", i === selField && "bg-blue-soft/60")}>
                      <span className="text-[13px] font-bold text-den">{LOAI_LABEL[fd.loai]}</span>
                      <Input type="number" step={0.1} min={0.5} max={12} value={fd.size} onChange={(e) => setField(i, { size: Number(e.target.value) })} className="!py-1 !px-2 text-[13px]" />
                      <input type="color" aria-label={`Màu ${LOAI_LABEL[fd.loai]}`} value={fd.mau} onChange={(e) => setField(i, { mau: e.target.value })} className="h-8 w-full rounded-sm border border-vien cursor-pointer" />
                      <Select value={fd.canLe} onChange={(e) => setField(i, { canLe: e.target.value as StudioField["canLe"] })} className="!py-1 !px-2 text-[13px]">
                        <option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option>
                      </Select>
                      <Input type="number" min={1} max={200} value={fd.gioiHan} onChange={(e) => setField(i, { gioiHan: Number(e.target.value) })} className="!py-1 !px-2 text-[13px]" />
                      <button type="button" className="text-[12.5px] font-bold text-red-fg hover:underline justify-self-end" onClick={() => xoaField(i)}>Xoá</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={themField} disabled={conThieu.length === 0} className={cx("mt-3 text-[13px] font-bold", conThieu.length ? "text-blue hover:underline" : "text-mut cursor-not-allowed")}>
                  + Thêm field{conThieu.length ? ` (${LOAI_LABEL[conThieu[0]]})` : " — đã đủ 4 field"}
                </button>
                <div className="mt-2 text-[12px] text-mut">Cỡ chữ tính theo <b className="text-ink2">% bề rộng ảnh</b> nên tự co giãn theo mọi kích thước (vd 2,8 ≈ 30px trên ảnh rộng 1080px).</div>
              </Field>
            </div>
          </CmsCard>

          <CmsCard>
            <CmsFormActions>
              <Button kind="secondary" onClick={luuNhap}>Lưu nháp</Button>
              <Button onClick={xuatBan}>Xuất bản</Button>
              <Button kind="ghost" className="ml-auto" onClick={() => router.push(R.H02)}>Huỷ</Button>
            </CmsFormActions>
          </CmsCard>
        </div>

        <aside className="space-y-6">
          <CmsCard title="Xem trước · Vùng đặt field" desc="Kéo nhãn field trên ảnh để đặt vị trí — đúng như Tư vấn viên sẽ thấy">
            <div className="max-w-[480px] mx-auto">
              {f.anhNen ? (
                <div ref={previewRef} className="relative touch-none">
                  <StudioPreview template={f} />
                  {fields.map((fd, i) => {
                    const p = iconPos[fd.loai];
                    return (
                      <div key={i} onPointerDown={onHandleDown(i)} onPointerMove={onHandleMove} onPointerUp={onHandleUp} onPointerCancel={onHandleUp}
                        title={`Kéo để đặt ${LOAI_LABEL[fd.loai]}`}
                        className={cx("absolute z-10 flex items-center justify-center rounded-full border size-5 text-[11px] cursor-move touch-none select-none shadow-sm", i === selField ? "border-blue bg-blue text-white" : "border-blue/50 bg-white/90 text-blue")}
                        style={{ left: `${p ? p.left : fd.xPct}%`, top: `${p ? p.top : fd.yPct}%`, transform: "translate(calc(-100% - 6px), -50%)" }}>
                        <span aria-hidden className="leading-none">✥</span>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="aspect-[16/9] rounded-sm border border-dashed border-vien flex items-center justify-center text-[13px] text-mut px-4 text-center">Chọn ảnh nền để xem trước</div>}
            </div>
            <div className="mt-3 text-[12px] text-ink2 leading-relaxed">Kéo nhãn field trên ảnh để đặt vị trí · chỉnh cỡ chữ · màu · căn lề ở bảng bên trái · Ảnh chân dung tự đặt vào ô trong suốt của ảnh nền.</div>
          </CmsCard>
          <CmsCard title="Trạng thái">
            <div className="flex flex-wrap gap-2">
              {(["nhap", "da-xuat-ban", "luu-tru"] as const).map((s) => <span key={s} className={cx(f.trangThai !== s && "opacity-30")}><StatusChip s={s} /></span>)}
            </div>
            <div className="mt-3 text-[13px] text-ink2">Lưu gần nhất {luuGanNhat ? fmtDateTime(luuGanNhat) : "— chưa lưu"}</div>
            {!isNew && <div className="mt-1 text-[13px] text-ink2">{soAnh} ảnh Tư vấn viên đã tạo</div>}
          </CmsCard>
        </aside>
      </div>
      {node}
    </>
  );
}

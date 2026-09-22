"use client";
/**
 * H21a · CMS — Mẫu danh thiếp — tạo / sửa (id "moi" = mẫu mới).
 * Mẫu = MỘT ảnh nền PNG (toàn bộ thiết kế nung vào ảnh) chừa một ô TRONG SUỐT cho ảnh chân dung Tư vấn viên.
 * KHÁC Mẫu Studio: KHÔNG có field chữ (tên/chức danh/SĐT) — profile chỉ trang trí ảnh chân dung.
 * Trái: Tên mẫu · Ảnh nền (kéo thả PNG) · Dòng disclaimer. Phải: xem trước + trạng thái.
 */
import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDateTime } from "@/lib/seed";
import type { StudioTemplate } from "@/lib/types";
import { Button, Field, Input, StatusChip, Textarea, cx, useFlash } from "@/components/ui";
import { CmsCard, CmsFormActions, CmsHeader } from "@/components/cms/CmsShell";
import { StudioPreview } from "@/components/cong-cu/StudioPreview";

const DISCLAIMER = "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo.";

const trong = (): StudioTemplate => ({
  id: "", ten: "", anh: "", anhNen: "", tiLe: "9:16", anhSauNen: true, phienBan: 1, disclaimer: DISCLAIMER,
  trangThai: "nhap", soAnhDaTao: 0, capNhat: new Date().toISOString(), anhChanDung: { xPct: 50, yPct: 30, dPct: 45 }, fields: [],
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

  const [daNap, setDaNap] = useState(false);
  if (ready && !daNap) {
    setDaNap(true);
    if (isNew) setF(trong());
    else {
      const m = data.profileTemplates.find((x) => x.id === id);
      if (m) { setF({ ...trong(), ...m }); setLuuGanNhat(m.capNhat); }
    }
  }

  if (!ready || !daNap) return null;
  if (!f) return <CmsCard><div className="text-ink2">Không tìm thấy mẫu danh thiếp. <button type="button" className="text-blue font-bold" onClick={() => router.push(R.H21)}>Về danh sách</button></div></CmsCard>;

  const tenTep = f.tenTep ?? (isNew ? "" : `nen-${f.id}.png`);
  const set = (patch: Partial<StudioTemplate>) => setF({ ...f, ...patch });

  const validate = (publishing: boolean) => {
    const e: Record<string, string> = {};
    if (!f.ten.trim()) e.ten = "Nhập tên mẫu.";
    else if (f.ten.length > 60) e.ten = "Tên mẫu tối đa 60 ký tự.";
    if (data.profileTemplates.some((x) => x.ten.trim().toLowerCase() === f.ten.trim().toLowerCase() && x.id !== f.id)) e.ten = "Đã có mẫu khác cùng tên.";
    if (!(f.disclaimer ?? "").trim()) e.disclaimer = "Dòng disclaimer bắt buộc — in cố định trong ảnh nền.";
    if (publishing && !f.anhNen) e.anh = "Mẫu xuất bản cần ảnh nền.";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const persist = (patch: Partial<StudioTemplate>): StudioTemplate => {
    const now = new Date().toISOString();
    const saved: StudioTemplate = { ...f, ...patch, fields: [], tenTep: tenTep || undefined, capNhat: now, id: f.id || `mp${Date.now()}` };
    actions.update("profileTemplates", (l) => (l.some((x) => x.id === saved.id) ? l.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...l]));
    setF(saved); setLuuGanNhat(now);
    if (isNew) router.replace(R.H21a(saved.id));
    return saved;
  };

  const luuNhap = () => { if (!validate(false)) return; persist({ trangThai: f.trangThai === "da-xuat-ban" ? "da-xuat-ban" : "nhap" }); flash("Đã lưu nháp"); };
  const xuatBan = () => { if (!validate(true)) return; persist({ trangThai: "da-xuat-ban" }); flash(f.trangThai === "da-xuat-ban" ? "Đã lưu — mẫu vẫn hiện cho Tư vấn viên" : "Đã xuất bản — mẫu hiện cho Tư vấn viên chọn"); };
  const chonTep = async (file?: File) => { if (!file) return; const url = await docAnhNen(file); set({ anhNen: url, anh: url, tenTep: file.name }); setErr({ ...err, anh: "" }); };

  return (
    <>
      <CmsHeader
        crumbs={[{ label: "Mẫu danh thiếp", href: R.H21 }, { label: isNew ? "Tạo mẫu mới" : f.ten }]}
        title={<span className="flex items-center gap-3">{isNew ? "Tạo mẫu mới" : f.ten}<StatusChip s={f.trangThai} /></span>}
        desc={isNew ? "Mẫu mới ở trạng thái Nháp — chỉ hiện cho Tư vấn viên sau khi Xuất bản." : `Cập nhật ${fmtDate(f.capNhat)}`}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6 items-start">
        <div className="space-y-6">
          <CmsCard title="Mẫu">
            <div className="space-y-5">
              <Field label="Tên mẫu" count={`${f.ten.length}/60`} error={err.ten}>
                <Input value={f.ten} onChange={(e) => set({ ten: e.target.value })} placeholder="An tâm hôm nay — Vững vàng tương lai" className="max-w-[420px]" />
              </Field>
              <Field label="Ảnh nền mẫu" error={err.anh}>
                <button type="button" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chonTep(e.dataTransfer.files?.[0]); }} className="w-full border border-dashed border-vien rounded-sm px-4 py-6 text-left text-[13px] text-ink2 hover:border-blue">
                  Kéo thả hoặc bấm chọn ảnh nền · PNG · tỉ lệ nào cũng được{tenTep ? <> · đã có <b className="text-den">{tenTep}</b></> : <> · <span className="text-mut">chưa có ảnh nền</span></>}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => chonTep(e.target.files?.[0])} />
                <div className="mt-1.5 text-[12px] text-mut">Toàn bộ thiết kế (màu, hoạ tiết, slogan, logo) nằm trong ảnh nền. Chừa một <b className="text-ink2">ô trong suốt</b> cho ảnh chân dung — hệ thống tự nhận diện, không cần nhập toạ độ.</div>
              </Field>
              <Field label="Dòng disclaimer (in trong ảnh nền)" count={`${(f.disclaimer ?? "").length}/120`} error={err.disclaimer}>
                <Textarea value={f.disclaimer ?? ""} onChange={(e) => set({ disclaimer: e.target.value.slice(0, 120) })} className="min-h-[64px]" />
              </Field>
            </div>
          </CmsCard>

          <CmsCard>
            <CmsFormActions>
              <Button kind="secondary" onClick={luuNhap}>Lưu nháp</Button>
              <Button onClick={xuatBan}>Xuất bản</Button>
              <Button kind="ghost" className="ml-auto" onClick={() => router.push(R.H21)}>Huỷ</Button>
            </CmsFormActions>
          </CmsCard>
        </div>

        <aside className="space-y-6">
          <CmsCard title="Xem trước" desc="Ảnh chân dung của Tư vấn viên tự lồng vào ô trong suốt của ảnh nền">
            <div className="max-w-[280px] mx-auto">
              {f.anhNen
                ? <div className="border border-vien rounded-sm overflow-hidden"><StudioPreview template={f} /></div>
                : <div className={cx("rounded-sm border border-dashed border-vien flex items-center justify-center text-[13px] text-mut px-4 text-center", "aspect-[9/16]")}>Chọn ảnh nền để xem trước</div>}
            </div>
            <div className="mt-3 text-[12px] text-ink2 leading-relaxed">Ô trống ở giữa là vùng trong suốt — khi Tư vấn viên chọn mẫu này, ảnh chân dung của họ sẽ lồng vào đó (kéo/thu-phóng để chỉnh).</div>
          </CmsCard>
          <CmsCard title="Trạng thái">
            <div className="flex flex-wrap gap-2">
              {(["nhap", "da-xuat-ban", "luu-tru"] as const).map((s) => <span key={s} className={cx(f.trangThai !== s && "opacity-30")}><StatusChip s={s} /></span>)}
            </div>
            <div className="mt-3 text-[13px] text-ink2">Lưu gần nhất {luuGanNhat ? fmtDateTime(luuGanNhat) : "— chưa lưu"}</div>
          </CmsCard>
        </aside>
      </div>
      {node}
    </>
  );
}

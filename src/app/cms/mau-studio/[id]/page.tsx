"use client";
/**
 * H02a · CMS — Mẫu Studio — tạo / sửa (id "moi" = mẫu mới).
 * Tên mẫu · Định dạng ▾ · Ảnh nền mẫu (chọn tệp chỉ đổi tên hiển thị) · Màu nền (bảng màu thương hiệu) · Hoạ tiết thương hiệu ·
 * Dòng disclaimer · Khung ảnh chân dung ▾ · Tỉ lệ khung ảnh ▾ · Trường Tư vấn viên được điền · giới hạn ký tự.
 * Cột phải: XEM TRƯỚC (StudioPreview) + "Không sửa được trong Studio" · trạng thái · lưu gần nhất · Lịch sử phiên bản.
 * Hàng nút: Lưu nháp · Xem trước (cuộn tới khung xem trước trong CMS — chủ dự án chốt 08/09, phương án A: mẫu nháp không hiện trên D02) · Xuất bản · Lưu trữ · Huỷ → H02.
 */
import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentCmsUser, useStore } from "@/lib/store";
import { fmtDate, fmtDateTime } from "@/lib/seed";
import type { StudioTemplate } from "@/lib/types";
import { Button, Checkbox, Chip, Field, Input, Modal, Select, StatusChip, Textarea, cx, useFlash } from "@/components/ui";
import { CmsCard, CmsFormActions, CmsHeader } from "@/components/cms/CmsShell";
import { StudioPreview, tiLeLabel } from "@/components/cong-cu/StudioPreview";

const MAU_NEN = [
  { ma: "#000ECC", ten: "Xanh Chubb" }, { ma: "#000066", ten: "Xanh đậm" }, { ma: "#FC0386", ten: "Hồng" },
  { ma: "#FFA300", ten: "Vàng" }, { ma: "#4BCCE5", ten: "Xanh ngọc" }, { ma: "#191919", ten: "Đen" },
];
const TI_LE: StudioTemplate["tiLe"][] = ["3:4", "4:5", "1:1", "9:16"];
const KHUNG_PCT = [30, 35, 40, 45, 50];
const GIOI_HAN = { hoTen: 32, chucDanh: 32, soDienThoai: 32, gioiThieu: 80 };
const DISCLAIMER = "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo.";

const trong = (): StudioTemplate => ({
  id: "", ten: "", anh: "", tiLe: "3:4", phienBan: 1, disclaimer: DISCLAIMER, mauNen: MAU_NEN[0].ma, khungAnh: "tron", tiLeKhung: 40,
  truong: { hoTen: true, chucDanh: true, soDienThoai: true, gioiThieu: false }, hoaTiet: 1, trangThai: "nhap", soAnhDaTao: 0, capNhat: new Date().toISOString(),
});

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, ready, actions } = useStore();
  const user = useCurrentCmsUser();
  const { flash, node } = useFlash();
  const isNew = id === "moi";
  const fileRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState<StudioTemplate | null>(null);
  const [noiBatXemTruoc, setNoiBatXemTruoc] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [luuGanNhat, setLuuGanNhat] = useState<string | undefined>(undefined);
  const [lichSu, setLichSu] = useState(false);

  // Nạp form một lần khi store sẵn sàng (điều chỉnh state trong lúc render — không dùng effect)
  const [daNap, setDaNap] = useState(false);
  if (ready && !daNap) {
    setDaNap(true);
    if (isNew) setF(trong());
    else {
      const m = data.studioTemplates.find((x) => x.id === id);
      if (m) { setF({ ...trong(), ...m, truong: { ...trong().truong!, ...m.truong } }); setLuuGanNhat(m.capNhat); }
    }
  }

  if (!ready || !daNap) return null;
  if (!f) return <CmsCard><div className="text-ink2">Không tìm thấy mẫu Studio. <button type="button" className="text-blue font-bold" onClick={() => router.push(R.H02)}>Về danh sách</button></div></CmsCard>;

  const soAnh = isNew ? 0 : data.studioImages.filter((a) => a.templateId === f.id).length || f.soAnhDaTao;
  const tenTep = f.tenTep ?? (isNew ? "" : `nen-${f.id}-v${f.phienBan ?? 1}.png`);
  const set = (patch: Partial<StudioTemplate>) => setF({ ...f, ...patch });
  const setTruong = (k: keyof NonNullable<StudioTemplate["truong"]>, v: boolean) => setF({ ...f, truong: { ...f.truong!, [k]: v } });

  const validate = (publishing: boolean) => {
    const e: Record<string, string> = {};
    if (!f.ten.trim()) e.ten = "Nhập tên mẫu.";
    else if (f.ten.length > 60) e.ten = "Tên mẫu tối đa 60 ký tự.";
    if (data.studioTemplates.some((x) => x.ten.trim().toLowerCase() === f.ten.trim().toLowerCase() && x.id !== f.id)) e.ten = "Đã có mẫu khác cùng tên.";
    if (!(f.disclaimer ?? "").trim()) e.disclaimer = "Dòng disclaimer bắt buộc — in cố định dưới ảnh.";
    if (publishing && !tenTep) e.anh = "Mẫu xuất bản cần ảnh nền.";
    if (publishing && !Object.values(f.truong!).some(Boolean)) e.truong = "Chọn ít nhất một trường Tư vấn viên được điền.";
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
  const xemTruoc = () => {
    document.getElementById("khung-xem-truoc")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setNoiBatXemTruoc(true); setTimeout(() => setNoiBatXemTruoc(false), 1600);
  };
  const xuatBan = () => {
    if (!validate(true)) return;
    const daXB = f.trangThai === "da-xuat-ban";
    persist({ trangThai: "da-xuat-ban", phienBan: daXB ? (f.phienBan ?? 1) + 1 : (f.phienBan ?? 1) });
    flash(daXB ? `Đã xuất bản phiên bản v${(f.phienBan ?? 1) + 1} — Tư vấn viên thấy mẫu mới trong Studio` : "Đã xuất bản — mẫu hiện trong Studio");
  };
  const luuTru = () => { persist({ trangThai: "luu-tru" }); flash("Đã lưu trữ — mẫu không còn hiện trong Studio, ảnh Tư vấn viên đã tạo vẫn giữ"); };
  const chonTep = (file?: File) => { if (!file) return; set({ tenTep: file.name }); setErr({ ...err, anh: "" }); };
  const khoiPhuc = (n: number) => { setLichSu(false); flash(`Đã khôi phục bản v${n} — nội dung đang hiện là bản đó, bấm Lưu nháp để giữ`); };

  const soPhienBan = isNew ? 0 : Math.max(1, f.phienBan ?? 1);
  const phienBan = Array.from({ length: soPhienBan }, (_, i) => soPhienBan - i).map((n) => ({ n, luc: new Date(new Date(luuGanNhat ?? f.capNhat).getTime() - (soPhienBan - n) * 3600e3 * 24 * 12).toISOString(), boi: n === soPhienBan ? (user?.hoTen ?? "Quản trị") : "Trần Thu Hà" }));
  const truongHien = [f.truong!.hoTen && "Họ tên", f.truong!.chucDanh && "Chức danh", f.truong!.soDienThoai && "SĐT", f.truong!.gioiThieu && "Câu giới thiệu"].filter(Boolean).join(" · ");

  return (
    <>
      <CmsHeader
        crumbs={[{ label: "Mẫu Studio", href: R.H02 }, { label: isNew ? "Tạo mẫu mới" : f.ten }]}
        title={<span className="flex items-center gap-3">{isNew ? "Tạo mẫu mới" : f.ten}<StatusChip s={f.trangThai} /></span>}
        desc={isNew ? "Mẫu mới ở trạng thái Nháp — chỉ hiện cho Tư vấn viên sau khi Xuất bản." : `Phiên bản v${f.phienBan ?? 1} · cập nhật ${fmtDate(f.capNhat)} · ${soAnh} ảnh Tư vấn viên đã tạo từ mẫu này`}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
        <div className="space-y-6">
          <CmsCard title="Mẫu">
            <div className="space-y-5">
              <Field label="Tên mẫu" count={`${f.ten.length}/60`} error={err.ten}>
                <Input value={f.ten} onChange={(e) => set({ ten: e.target.value })} placeholder="Giới thiệu bản thân — Dọc" className="max-w-[420px]" />
              </Field>
              <Field label="Định dạng">
                <Select value={f.tiLe} onChange={(e) => set({ tiLe: e.target.value as StudioTemplate["tiLe"] })} className="max-w-[268px]">
                  {TI_LE.map((t) => <option key={t} value={t}>{tiLeLabel(t)}</option>)}
                </Select>
              </Field>
              <Field label="Ảnh nền mẫu" error={err.anh}>
                <button type="button" onClick={() => fileRef.current?.click()} className="w-full border border-dashed border-vien rounded-sm px-4 py-6 text-left text-[13px] text-ink2 hover:border-blue">
                  Kéo thả hoặc bấm chọn ảnh nền · PNG/JPG {f.tiLe === "1:1" ? "1080×1080" : f.tiLe === "4:5" ? "1080×1350" : f.tiLe === "9:16" ? "1080×1920" : "1080×1440"}{tenTep ? <> · đã có <b className="text-den">{tenTep}</b></> : <> · <span className="text-mut">chưa có ảnh nền</span></>}
                </button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => chonTep(e.target.files?.[0])} />
              </Field>
              <Field label="Màu nền (bảng màu thương hiệu)">
                <div className="flex flex-wrap gap-3">
                  {MAU_NEN.map((c) => (
                    <button key={c.ma} type="button" title={c.ten} aria-label={c.ten} onClick={() => set({ mauNen: c.ma })} className={cx("size-9 rounded-sm border-2", f.mauNen === c.ma ? "border-den ring-2 ring-blue-soft" : "border-white shadow")} style={{ background: c.ma }} />
                  ))}
                  <span className="self-center text-[13px] text-ink2">{MAU_NEN.find((c) => c.ma === f.mauNen)?.ten ?? f.mauNen}</span>
                </div>
              </Field>
              <Field label="Hoạ tiết thương hiệu">
                <div className="grid grid-cols-4 gap-3 max-w-[560px]">
                  {[1, 2, 3, 4].map((n) => (
                    <button key={n} type="button" onClick={() => set({ hoaTiet: n })} className={cx("rounded-sm border-2 p-2 text-left", f.hoaTiet === n ? "border-blue bg-blue-soft/40" : "border-vien hover:border-blue")}>
                      <div className="aspect-[4/3] rounded-sm bg-vien2 border border-[#D6D6D6] flex items-center justify-center text-mut text-[12px]">Ảnh</div>
                      <div className="mt-1.5 text-[11px] text-ink2">Hoạ tiết {n}</div>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Dòng disclaimer (in cố định dưới ảnh)" count={`${(f.disclaimer ?? "").length}/120`} error={err.disclaimer}>
                <Textarea value={f.disclaimer ?? ""} onChange={(e) => set({ disclaimer: e.target.value.slice(0, 120) })} className="min-h-[64px]" />
              </Field>
              <div className="grid grid-cols-2 gap-5 max-w-[560px]">
                <Field label="Khung ảnh chân dung">
                  <Select value={f.khungAnh ?? "tron"} onChange={(e) => set({ khungAnh: e.target.value as StudioTemplate["khungAnh"] })}>
                    <option value="tron">Tròn · giữa mẫu</option>
                    <option value="vuong">Vuông · giữa mẫu</option>
                  </Select>
                </Field>
                <Field label="Tỉ lệ khung ảnh">
                  <Select value={String(f.tiLeKhung ?? 40)} onChange={(e) => set({ tiLeKhung: Number(e.target.value) })}>
                    {KHUNG_PCT.map((p) => <option key={p} value={p}>{p}% chiều rộng</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Trường Tư vấn viên được điền · giới hạn ký tự" error={err.truong}>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <Checkbox label={`Họ tên · ${GIOI_HAN.hoTen}`} checked={f.truong!.hoTen} onChange={(e) => setTruong("hoTen", e.target.checked)} />
                  <Checkbox label={`Chức danh · ${GIOI_HAN.chucDanh}`} checked={f.truong!.chucDanh} onChange={(e) => setTruong("chucDanh", e.target.checked)} />
                  <Checkbox label={`Số điện thoại · ${GIOI_HAN.soDienThoai}`} checked={f.truong!.soDienThoai} onChange={(e) => setTruong("soDienThoai", e.target.checked)} />
                  <Checkbox label={`Câu giới thiệu · ${GIOI_HAN.gioiThieu}`} checked={f.truong!.gioiThieu} onChange={(e) => setTruong("gioiThieu", e.target.checked)} />
                </div>
              </Field>
            </div>
          </CmsCard>

          <CmsCard>
            <CmsFormActions>
              <Button kind="secondary" onClick={luuNhap}>Lưu nháp</Button>
              <Button kind="secondary" onClick={xemTruoc}>Xem trước</Button>
              <Button onClick={xuatBan}>Xuất bản</Button>
              {!isNew && f.trangThai !== "luu-tru" && <Button kind="danger" onClick={luuTru}>Lưu trữ</Button>}
              <Button kind="ghost" className="ml-auto" onClick={() => router.push(R.H02)}>Huỷ</Button>
            </CmsFormActions>
            <button type="button" className="mt-4 text-[13px] text-blue font-bold" onClick={() => setLichSu(true)}>Lịch sử phiên bản ({soPhienBan}) · Khôi phục</button>
          </CmsCard>
        </div>

        <aside className="space-y-6">
          <div id="khung-xem-truoc" className={cx("rounded-sm transition-shadow", noiBatXemTruoc && "ring-2 ring-blue ring-offset-2")}>
          <CmsCard title="Xem trước" desc="Đúng như Tư vấn viên sẽ thấy trong Studio sau khi xuất bản">
            <div className="max-w-[320px] mx-auto">
              <StudioPreview template={f} hoTen={f.truong!.hoTen ? undefined : ""} chucDanh={f.truong!.chucDanh ? undefined : " "} soDienThoai={f.truong!.soDienThoai ? undefined : " "} />
            </div>
            <div className="mt-3 text-[12.5px] text-ink2">Tư vấn viên điền: {truongHien || "— chưa chọn trường nào"}</div>
            <div className="mt-4 text-[12.5px] text-ink2">Không sửa được trong Studio</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Logo Chubb + ®", "Màu nền", "Bố cục", "Dòng disclaimer", "Font chữ"].map((t) => <Chip key={t} tone="grey">{t}</Chip>)}
            </div>
          </CmsCard>
          </div>
          <CmsCard title="Trạng thái">
            <div className="flex flex-wrap gap-2">
              {(["nhap", "da-xuat-ban", "luu-tru"] as const).map((s) => <span key={s} className={cx(f.trangThai !== s && "opacity-30")}><StatusChip s={s} /></span>)}
            </div>
            <div className="mt-3 text-[13px] text-ink2">Lưu gần nhất {luuGanNhat ? fmtDateTime(luuGanNhat) : "— chưa lưu"}</div>
            {!isNew && <div className="mt-1 text-[13px] text-ink2">Phiên bản đang dùng v{f.phienBan ?? 1} · {soAnh} ảnh đã tạo</div>}
          </CmsCard>
        </aside>
      </div>

      <Modal open={lichSu} onClose={() => setLichSu(false)} title="Lịch sử phiên bản" width={560}>
        {isNew ? <div className="text-ink2 text-[14px]">Mẫu chưa lưu — chưa có phiên bản nào.</div> : (
          <ul className="divide-y divide-vien2 text-[14px]">
            {phienBan.map((p, i) => (
              <li key={p.n} className="py-3 flex items-center justify-between">
                <span><b>v{p.n}</b> · {fmtDateTime(p.luc)} · {p.boi}</span>
                {i === 0 ? <Chip tone="blue">Đang mở</Chip> : <Button size="sm" kind="secondary" onClick={() => khoiPhuc(p.n)}>Khôi phục</Button>}
              </li>
            ))}
          </ul>
        )}
      </Modal>
      {node}
    </>
  );
}

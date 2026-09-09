"use client";
/* eslint-disable react-hooks/set-state-in-effect -- đọc sessionStorage / tham số URL sau mount là chủ ý (tránh lệch hydration) */
/** D02 · Studio (cần đăng nhập TVV) — 3 bước: chọn Mẫu Studio → tải ảnh chân dung → thông tin hiển thị; xem trước; Tải ảnh / Lưu vào Ảnh Studio của tôi (không duyệt) / Hiển thị công khai trên Bộ sưu tập Studio (Chubb duyệt, gửi một lần); khối Bộ sưu tập Studio + Ảnh Studio của tôi. */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import type { StudioImage } from "@/lib/types";
import { RequireTVV } from "@/components/site/AccountShell";
import { Button, Card, Checkbox, Chip, Eyebrow, Field, H1, H2, ImageBox, Input, MoreLink, Muted, StatusChip, cx, useFlash } from "@/components/ui";
import { StudioPreview, tiLeLabel } from "@/components/cong-cu/StudioPreview";

const GIOI_HAN = 32;

/** Thu nhỏ ảnh về ≤ 640px để lưu được trong sessionStorage */
function docAnhThuNho(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => { const s = Math.min(1, 640 / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = img.width * s; c.height = img.height * s; c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.85)); };
      img.onerror = rej; img.src = String(r.result);
    };
    r.onerror = rej; r.readAsDataURL(file);
  });
}

function Studio() {
  const sp = useSearchParams();
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor()!;
  const { flash, node } = useFlash();
  const mau = useMemo(() => data.studioTemplates.filter((m) => m.trangThai === "da-xuat-ban"), [data.studioTemplates]);
  const [mauId, setMauId] = useState<string>(() => sp.get("mau") && mau.some((m) => m.id === sp.get("mau")) ? sp.get("mau")! : mau[0]?.id ?? "");
  useEffect(() => { const q = sp.get("mau"); if (q && mau.some((m) => m.id === q)) setMauId(q); }, [sp, mau]);
  const m = mau.find((x) => x.id === mauId) ?? mau[0];
  const [anh, setAnh] = useState<string>();
  const [zoom, setZoom] = useState(1);
  const [loiAnh, setLoiAnh] = useState("");
  const [hoTen, setHoTen] = useState(tvv.hoTen);
  const [chucDanh, setChucDanh] = useState(tvv.chucDanh);
  const [sdt, setSdt] = useState(tvv.soDienThoai);
  const [dongY, setDongY] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const chonTep = async (f?: File) => {
    if (!f) return;
    if (!/image\/(jpeg|png)/.test(f.type)) { setLoiAnh("Chỉ nhận ảnh JPG hoặc PNG."); return; }
    if (f.size > 5 * 1024 * 1024) { setLoiAnh("Ảnh vượt 5MB — chọn ảnh nhỏ hơn."); return; }
    setLoiAnh(""); setAnh(await docAnhThuNho(f));
  };
  const taoAnh = (trangThai: StudioImage["trangThai"]): StudioImage => ({ id: `as${Date.now()}`, templateId: m.id, advisorMa: tvv.ma, anh: anh ?? m.anh, tao: new Date().toISOString(), trangThai, dongYCongKhai: trangThai === "cho-duyet", phienBanMau: m.phienBan });
  const luu = () => { actions.update("studioImages", (l) => [taoAnh("rieng-tu"), ...l]); flash("Đã lưu vào Ảnh Studio của tôi"); };
  const gui = () => { actions.update("studioImages", (l) => [taoAnh("cho-duyet"), ...l]); flash("Đã gửi Chubb duyệt — ảnh hiển thị công khai trên Bộ sưu tập Studio sau khi duyệt"); setDongY(false); };
  const dungMau = (id: string) => { setMauId(id); topRef.current?.scrollIntoView({ behavior: "smooth" }); };

  const boSuuTap = data.studioImages.filter((a) => a.trangThai === "da-duyet").sort((a, b) => (b.ngayDuyet ?? b.tao).localeCompare(a.ngayDuyet ?? a.tao)).slice(0, 4);
  const cuaToi = data.studioImages.filter((a) => a.advisorMa === tvv.ma).sort((a, b) => b.tao.localeCompare(a.tao));
  const tenTVV = (ma: string) => data.advisors.find((a) => a.ma === ma)?.hoTen ?? ma;
  const tenMau = (id: string) => data.studioTemplates.find((t) => t.id === id)?.ten ?? "Mẫu Studio";

  if (!m) return <div className="wrap py-16"><Card className="p-8 text-center"><H2>Studio chưa có Mẫu Studio nào</H2><Muted className="mt-2">Chubb Life đang chuẩn bị mẫu. Bạn quay lại sau nhé.</Muted></Card></div>;

  return (
    <>
      <section className="bg-xam" ref={topRef}>
        <div className="wrap py-12">
          <Eyebrow className="mb-3">Toàn Tâm Phát Triển</Eyebrow>
          <H1>Studio</H1>
          <Muted className="mt-3 text-[16px] max-w-[720px]">Chọn mẫu Chubb đã duyệt, tải ảnh của bạn, nhận ảnh hoàn chỉnh. Không dùng AI, toàn bộ mẫu do Chubb cung cấp.</Muted>
        </div>
      </section>

      <section className="wrap py-10 grid grid-cols-1 lg:grid-cols-[1fr_560px] gap-8 items-start">
        <div className="space-y-8">
          <Card className="p-6">
            <div className="font-bold text-[16px] text-den">Bước 1 — Chọn mẫu</div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {mau.map((x) => (
                <button key={x.id} type="button" onClick={() => setMauId(x.id)} className={cx("text-left rounded-sm border p-2 transition-colors", x.id === m.id ? "border-blue bg-blue-soft" : "border-vien hover:border-blue")}>
                  <ImageBox src={x.anh} ratio="3/4" />
                  <div className="mt-2 text-[12px] font-bold text-den truncate">{x.ten}</div>
                  <div className="text-[11px] text-mut">{x.id === m.id ? "Đang chọn" : tiLeLabel(x.tiLe)}</div>
                </button>
              ))}
            </div>
            <Muted className="mt-3 text-[13px]">Chỉ hiện mẫu đã được Chubb phê duyệt</Muted>
          </Card>

          <Card className="p-6">
            <div className="font-bold text-[16px] text-den">Bước 2 — Tải ảnh chân dung</div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => chonTep(e.target.files?.[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chonTep(e.dataTransfer.files?.[0]); }} className={cx("mt-4 w-full h-24 rounded-sm border border-dashed flex items-center justify-center gap-3 text-[13px]", loiAnh ? "border-red-fg text-red-fg" : "border-vien text-mut hover:border-blue hover:text-blue")}>
              {anh ? <><img src={anh} alt="" className="size-16 rounded-full object-cover" /><span>Đã chọn ảnh — bấm để đổi ảnh khác</span></> : "Bấm để chọn ảnh · JPG/PNG · tối đa 5MB"}
            </button>
            {loiAnh && <div className="mt-1 text-[12px] text-red-fg">{loiAnh}</div>}
            <label className="mt-4 flex items-center gap-3 text-[13px] text-ink2">Thu phóng<input type="range" min={1} max={2} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} disabled={!anh} className="flex-1 accent-blue" /><span className="w-10 text-right">{Math.round(zoom * 100)}%</span></label>
          </Card>

          <Card className="p-6">
            <div className="font-bold text-[16px] text-den">Bước 3 — Thông tin hiển thị</div>
            <div className="mt-4 space-y-4 max-w-[600px]">
              <Field label="Họ tên" count={`${hoTen.length}/${GIOI_HAN}`}><Input value={hoTen} maxLength={GIOI_HAN} onChange={(e) => setHoTen(e.target.value)} /></Field>
              <Field label="Chức danh" count={`${chucDanh.length}/${GIOI_HAN}`}><Input value={chucDanh} maxLength={GIOI_HAN} onChange={(e) => setChucDanh(e.target.value)} /></Field>
              <Field label="Số điện thoại" count={`${sdt.length}/${GIOI_HAN}`}><Input value={sdt} maxLength={GIOI_HAN} onChange={(e) => setSdt(e.target.value)} /></Field>
            </div>
            <div className="mt-6 pt-5 border-t border-vien2">
              <div className="text-[12px] font-bold text-ink2 mb-2">Không sửa được</div>
              <div className="flex flex-wrap gap-2">{["Logo Chubb + ®", "Màu nền", "Bố cục", "Dòng disclaimer", "Font chữ"].map((c) => <Chip key={c}>{c}</Chip>)}</div>
            </div>
          </Card>
        </div>

        <Card className="p-6 lg:sticky lg:top-20">
          <div className="font-bold text-[16px] text-den">Xem trước</div>
          <div className="mt-4 max-w-[380px] mx-auto"><StudioPreview template={m} portrait={anh} zoom={zoom} hoTen={hoTen} chucDanh={chucDanh} soDienThoai={sdt} /></div>
          <Muted className="mt-3 text-[12px] text-center">Phiên bản mẫu v{m.phienBan ?? 1} · cập nhật {fmtDate(m.capNhat)}</Muted>
          <div className="mt-5">
            <div className="text-[11.5px] font-bold tracking-wider text-mut">LƯU CHO RIÊNG BẠN</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => flash("Đã tải ảnh về máy")}>Tải ảnh</Button>
              <Button size="sm" kind="secondary" onClick={luu}>Lưu vào Ảnh Studio của tôi</Button>
            </div>
            <Muted className="mt-2 text-[12px]">Chỉ bạn thấy. Ảnh nằm ở Trang cá nhân › Đã lưu › Ảnh Studio của tôi.</Muted>
          </div>
          <div className="mt-5 pt-5 border-t border-vien2">
            <div className="text-[11.5px] font-bold tracking-wider text-mut">HIỂN THỊ CÔNG KHAI</div>
            <div className="mt-2"><Checkbox checked={dongY} onChange={(e) => setDongY(e.target.checked)} label={<span className="text-[13px]">Tôi đồng ý cho ảnh này hiển thị công khai trên Bộ sưu tập Studio, kèm tên của tôi</span>} /></div>
            <Button className="mt-3" kind="secondary" disabled={!dongY} onClick={gui}>Lưu và hiển thị công khai trên Bộ sưu tập Studio</Button>
            <Muted className="mt-2 text-[12px]">Ảnh được lưu vào Ảnh Studio của tôi và gửi Chubb duyệt. Chỉ hiện sau khi duyệt, mỗi ảnh gửi một lần.</Muted>
          </div>
        </Card>
      </section>

      <section className="wrap py-10">
        <div className="flex items-end justify-between gap-6 mb-6"><H2>Ảnh Studio của tôi</H2><Link href={R.G02} className="link-more">Xem trong Đã lưu</Link></div>
        {cuaToi.length === 0 ? <Muted>Bạn chưa lưu ảnh nào. Bấm “Lưu vào Ảnh Studio của tôi” ở khung xem trước.</Muted> : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cuaToi.slice(0, 6).map((a) => (
              <div key={a.id} className="border border-vien rounded-sm p-2">
                <ImageBox src={a.anh} ratio="3/4" />
                <div className="mt-2 text-[12px] font-bold text-den truncate">{tenMau(a.templateId)}</div>
                <div className="mt-1 flex items-center justify-between gap-2"><span className="text-[11px] text-mut">{fmtDate(a.tao)}</span><StatusChip s={a.trangThai} /></div>
                {a.trangThai === "bi-tu-choi" && a.lyDoTuChoi && <div className="mt-1 text-[11px] text-red-fg">{a.lyDoTuChoi}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-xam">
        <div className="wrap py-14">
          <div className="flex items-end justify-between gap-6 mb-6"><H2>Bộ sưu tập Studio</H2><MoreLink href={R.D07} /></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {boSuuTap.map((a) => (
              <div key={a.id} className="bg-white border border-vien rounded-sm p-3">
                <div className="relative"><ImageBox src={a.anh} ratio="3/4" /><Button size="sm" kind="secondary" className="absolute bottom-2 right-2 bg-white" onClick={() => dungMau(a.templateId)}>Dùng mẫu này</Button></div>
                <div className="mt-3 text-[14px] font-bold text-den truncate">{tenTVV(a.advisorMa)} · {tenMau(a.templateId)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {node}
    </>
  );
}

export default function Page() {
  return <RequireTVV><Suspense fallback={null}><Studio /></Suspense></RequireTVV>;
}

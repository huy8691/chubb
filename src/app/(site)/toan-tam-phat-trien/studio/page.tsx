"use client";
/* eslint-disable react-hooks/set-state-in-effect -- đọc sessionStorage / tham số URL sau mount là chủ ý (tránh lệch hydration) */
/** D02 · Studio (cần đăng nhập TVV) — 3 bước: chọn Mẫu Studio → tải ảnh chân dung → thông tin hiển thị; xem trước; Tải ảnh / Lưu vào Ảnh Studio của tôi (không duyệt) / Hiển thị công khai trong Ảnh thực tế từ Tư vấn viên (Chubb duyệt, gửi một lần); khối cuối Tham khảo mẫu khác. (Danh sách "Ảnh Studio của tôi" ở G02, không ở D02 — bám Figma D02.) */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import type { StudioImage } from "@/lib/types";
import { RequireTVV } from "@/components/site/AccountShell";
import { Button, Card, Checkbox, Chip, Eyebrow, Field, H1, H2, ImageBox, Input, MoreLink, Muted, cx, useFlash } from "@/components/ui";
import { StudioPreview, tiLeLabel, tiLeToRatio } from "@/components/cong-cu/StudioPreview";

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
  const gui = () => { actions.update("studioImages", (l) => [taoAnh("cho-duyet"), ...l]); flash("Đã gửi Chubb duyệt — ảnh hiển thị công khai sau khi duyệt"); setDongY(false); };
  const dungMau = (id: string) => { setMauId(id); topRef.current?.scrollIntoView({ behavior: "smooth" }); };

  const mauKhac = mau.filter((x) => x.id !== m.id).sort((a, b) => b.soAnhDaTao - a.soAnhDaTao).slice(0, 6); // 09/09: khối cuối là mẫu khác để tham khảo, không phải ảnh TVV (D07 đi từ D08)

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
            <div className="font-bold text-[16px] text-den">Bước 1 — Mẫu đã chọn</div>
            <div className="mt-4 flex items-start gap-5">
              <div className="w-[130px] shrink-0 rounded-sm border border-blue bg-blue-soft p-2">
                <ImageBox src={m.anh} ratio="3/4" />
                <div className="mt-2 text-[11px] text-blue font-bold">Đã chọn</div>
              </div>
              <div>
                <div className="font-bold text-[15px] text-den">{m.ten}</div>
                <Muted className="mt-1 text-[12.5px]">{tiLeLabel(m.tiLe)} · phiên bản v{m.phienBan ?? 1} · cập nhật {fmtDate(m.capNhat)}</Muted>
                <Link href={R.D08} className="mt-3 inline-block text-[13px] font-bold text-blue hover:underline">Đổi mẫu</Link>
              </div>
            </div>
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
            <div className="mt-2"><Checkbox checked={dongY} onChange={(e) => setDongY(e.target.checked)} label={<span className="text-[13px]">Tôi đồng ý cho ảnh này hiển thị công khai trong <b>Ảnh thực tế từ Tư vấn viên</b>, kèm tên của tôi</span>} /></div>
            <Button className="mt-3" kind="secondary" disabled={!dongY} onClick={gui}>Lưu và hiển thị công khai</Button>
            <Muted className="mt-2 text-[12px]">Ảnh được lưu vào Ảnh Studio của tôi và gửi Chubb duyệt. Chỉ hiện sau khi duyệt, mỗi ảnh gửi một lần.</Muted>
          </div>
        </Card>
      </section>

      <section className="bg-xam">
        <div className="wrap py-14">
          <div className="flex items-end justify-between gap-6 mb-6"><H2>Tham khảo mẫu khác</H2><MoreLink href={R.D08} /></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mauKhac.map((x) => (
              <Card key={x.id} className="p-3 flex flex-col">
                <ImageBox src={x.anh} ratio={tiLeToRatio(x.tiLe)} />
                <div className="mt-3 text-[13px] font-bold text-den truncate">{x.ten}</div>
                <div className="text-[12px] text-ink2 mt-0.5 truncate">{tiLeLabel(x.tiLe)} · phiên bản v{x.phienBan ?? 1}</div>
                <div className="text-[12px] text-mut">Cập nhật {fmtDate(x.capNhat)}</div>
                <Button size="sm" kind="secondary" className="mt-3 w-full" onClick={() => dungMau(x.id)}>Dùng mẫu này</Button>
              </Card>
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

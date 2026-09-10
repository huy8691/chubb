"use client";
/** Khối "Tìm Tư vấn viên gần bạn" trên E01 (09/09): nhập địa chỉ/khu vực hoặc dùng vị trí trình duyệt → bản đồ (giả lập, marker = văn phòng, số TVV) + 5 TVV gần nhất theo khoảng cách tới văn phòng.
 *  Trạng thái: chưa có vị trí · không có TVV trong 10 km (mở rộng 30 km). "Xem tất cả trong N km" → lọc danh bạ bên dưới theo các văn phòng gần. */
import { useMemo, useState } from "react";
import { Button, Card, H2, Input, Muted } from "@/components/ui";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtNum } from "@/lib/seed";
import type { Office } from "@/lib/types";
import { QuickView } from "@/components/danh-thiep/QuickView";
import { khongDau, theXemDuoc, tinhThanh } from "@/components/danh-thiep/lib";

type ViTri = { lat: number; lng: number; nhan: string };
/** Giả lập tra địa chỉ: khớp tên tỉnh/thành → toạ độ trung tâm (bản thật dùng dịch vụ bản đồ) */
const TINH: { k: RegExp; v: ViTri }[] = [
  { k: /ho chi minh|hcm|sai gon|quan \d|thu duc|binh thanh|go vap|tan binh/, v: { lat: 10.7769, lng: 106.7009, nhan: "TP. Hồ Chí Minh" } },
  { k: /ha noi|hoan kiem|cau giay|dong da|ba dinh|thanh xuan/, v: { lat: 21.0285, lng: 105.8542, nhan: "Hà Nội" } },
  { k: /da nang|hai chau|son tra/, v: { lat: 16.0544, lng: 108.2022, nhan: "Đà Nẵng" } },
  { k: /can tho|ninh kieu/, v: { lat: 10.0452, lng: 105.7469, nhan: "Cần Thơ" } },
  { k: /hai phong|le chan/, v: { lat: 20.8449, lng: 106.6881, nhan: "Hải Phòng" } },
  { k: /binh duong|thu dau mot/, v: { lat: 10.9804, lng: 106.6519, nhan: "Bình Dương" } },
  { k: /vung tau/, v: { lat: 10.346, lng: 107.0843, nhan: "Vũng Tàu" } },
  { k: /nha trang|khanh hoa/, v: { lat: 12.2388, lng: 109.1967, nhan: "Nha Trang" } },
  { k: /hue/, v: { lat: 16.4637, lng: 107.5909, nhan: "Huế" } },
];
const kmGiua = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => { const R0 = 6371, d = Math.PI / 180; const dLat = (b.lat - a.lat) * d, dLng = (b.lng - a.lng) * d; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * d) * Math.cos(b.lat * d) * Math.sin(dLng / 2) ** 2; return 2 * R0 * Math.asin(Math.sqrt(h)); };
const fmtKm = (km: number) => (km < 10 ? km.toFixed(1).replace(".", ",") : Math.round(km).toString()) + " km";
/** Khung bản đồ giả lập: toàn Việt Nam khi chưa có vị trí; có vị trí thì thu về quanh người dùng theo bán kính */
type Box = { latMin: number; latMax: number; lngMin: number; lngMax: number };
const VN: Box = { latMin: 8.5, latMax: 23.4, lngMin: 102.1, lngMax: 109.6 };
const boxQuanh = (c: { lat: number; lng: number }, km: number): Box => { const half = Math.max(km * 1.6, 12); const dLat = half / 111, dLng = half / (111 * Math.cos((c.lat * Math.PI) / 180)); return { latMin: c.lat - dLat, latMax: c.lat + dLat, lngMin: c.lng - dLng * (880 / 420), lngMax: c.lng + dLng * (880 / 420) }; };
const toXY = (box: Box, lat: number, lng: number) => ({ x: ((lng - box.lngMin) / (box.lngMax - box.lngMin)) * 100, y: ((box.latMax - lat) / (box.latMax - box.latMin)) * 100 });

export function GanBan({ onLocVanPhong }: { onLocVanPhong: (tenVanPhong: string[] | null) => void }) {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [viTri, setViTri] = useState<ViTri | null>(null);
  const [loi, setLoi] = useState("");
  const [banKinh, setBanKinh] = useState(10);
  const datBanKinh = (v: number) => setBanKinh(Math.min(100, Math.max(1, Math.round(v) || 1)));
  const [xemNhanh, setXemNhanh] = useState<string>();
  const congKhai = useMemo(() => data.advisors.filter(theXemDuoc), [data.advisors]);
  const demTVV = (o: Office) => congKhai.filter((a) => a.vanPhong === o.ten).length;
  const vanPhongGan = useMemo(() => viTri ? data.offices.map((o) => ({ o, km: kmGiua(viTri, o) })).sort((a, b) => a.km - b.km) : [], [viTri, data.offices]);
  const trongBanKinh = vanPhongGan.filter((x) => x.km <= banKinh);
  const tvvGan = useMemo(() => trongBanKinh.flatMap((x) => congKhai.filter((a) => a.vanPhong === x.o.ten).map((a) => ({ a, km: x.km, o: x.o }))).slice(0, 5), [trongBanKinh, congKhai]);
  const tongGan = trongBanKinh.reduce((s, x) => s + demTVV(x.o), 0);
  const box = viTri ? boxQuanh(viTri, banKinh) : VN;
  const kmMoiPhanTram = (box.latMax - box.latMin) * 111 / 100; // km ứng với 1% chiều cao khung

  const tim = (e: React.FormEvent) => {
    e.preventDefault(); setLoi("");
    const k = khongDau(q.trim()); if (!k) return;
    const hit = TINH.find((t) => t.k.test(k));
    if (!hit) { setLoi("Chưa nhận ra địa chỉ này — thử tên tỉnh/thành hoặc quận."); return; }
    setBanKinh(10); setViTri(hit.v);
  };
  const dungViTri = () => {
    setLoi("");
    if (!("geolocation" in navigator)) { setLoi("Trình duyệt không hỗ trợ lấy vị trí — hãy nhập địa chỉ."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setBanKinh(10); setViTri({ lat: pos.coords.latitude, lng: pos.coords.longitude, nhan: "vị trí của bạn" }); },
      () => setLoi("Bạn chưa cho phép truy cập vị trí — cho phép trong trình duyệt hoặc nhập địa chỉ."));
  };

  return (
    <section>
      <H2 className="text-[22px]">Tìm Tư vấn viên gần bạn</H2>
      <form onSubmit={tim} className="mt-5 flex flex-wrap gap-3 max-w-[1100px]">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập địa chỉ hoặc khu vực của bạn…" aria-label="Địa chỉ của bạn" className="h-11 flex-1 min-w-[280px]" />
        <Button type="submit">Tìm</Button>
        <Button type="button" kind="secondary" onClick={dungViTri}>Dùng vị trí của tôi</Button>
      </form>
      {loi && <div className="mt-2 text-[13px] text-red-fg">{loi}</div>}

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="relative h-[420px] rounded-sm border border-vien bg-xam overflow-hidden" aria-label="Bản đồ văn phòng Chubb Life">
          {data.offices.map((o) => { const p = toXY(box, o.lat, o.lng); if (p.x < -5 || p.x > 105 || p.y < -5 || p.y > 105) return null; const gan = trongBanKinh.some((x) => x.o.id === o.id); return (
            <button key={o.id} type="button" title={`${o.ten} · ${demTVV(o)} Tư vấn viên`} onClick={() => { setBanKinh(10); setViTri({ lat: o.lat, lng: o.lng, nhan: o.ten }); }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 size-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow ${gan ? "bg-blue ring-4 ring-blue/25" : "bg-blue/70 hover:bg-blue"}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>{demTVV(o)}</button>); })}
          {viTri && (() => { const p = toXY(box, viTri.lat, viTri.lng); const dPct = (banKinh / kmMoiPhanTram) * 2; return <><div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue bg-blue/10 pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, height: `${dPct}%`, aspectRatio: "1" }} aria-label={`Bán kính ${banKinh} km`} /><div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5" style={{ left: `${p.x}%`, top: `${p.y}%` }}><span className="size-5 rounded-full bg-white border-4 border-blue" /><span className="text-[12px] font-bold text-blue">Bạn</span></div></>; })()}
          <div className="absolute left-4 bottom-3 text-[12px] text-mut">Bản đồ · marker là văn phòng Chubb Life, số trên marker là số Tư vấn viên</div>
        </div>

        <Card className="p-5 min-h-[420px]">
          {!viTri ? (
            <>
              <div className="font-bold text-[16px] text-den">Chưa có vị trí của bạn</div>
              <Muted className="mt-2 text-[13.5px]">Cho phép truy cập vị trí hoặc nhập địa chỉ để xem Tư vấn viên gần bạn.</Muted>
              <Button className="mt-4" kind="secondary" size="sm" onClick={dungViTri}>Cho phép truy cập vị trí</Button>
            </>
          ) : tvvGan.length === 0 ? (
            <>
              <div className="font-bold text-[16px] text-den">Không có Tư vấn viên trong {banKinh} km</div>
              <Muted className="mt-2 text-[13.5px]">Quanh {viTri.nhan} chưa có văn phòng Chubb Life. Kéo rộng bán kính tìm hoặc gọi hotline 1800 xxxx.</Muted>
              <div className="mt-4 flex gap-3"><Button size="sm" kind="ghost" href={R.S03}>Liên hệ & trợ giúp</Button></div>
            </>
          ) : (
            <>
              <div className="font-bold text-[16px] text-den">{tvvGan.length} Tư vấn viên gần nhất</div>
              <Muted className="mt-1 text-[12.5px]">Tính từ {viTri.nhan} tới văn phòng của Tư vấn viên.</Muted>
              <ul className="mt-3 divide-y divide-vien2">
                {tvvGan.map(({ a, km, o }) => (
                  <li key={a.ma} className="py-3">
                    <div className="font-bold text-[15px] text-den">{a.hoTen}</div>
                    <div className="text-[12.5px] text-ink2 mt-0.5">VP {tinhThanh(o.ten)} · {fmtKm(km)}</div>
                    <div className="mt-1 text-[12.5px] font-bold text-blue"><button type="button" className="hover:underline" onClick={() => setXemNhanh(a.ma)}>Xem nhanh</button> · <a href={R.E03(a.ma)} className="hover:underline">Xem đầy đủ</a></div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>
      {viTri && (
        <div className="mt-5">
          <div className="font-bold text-[14px] text-den">Bán kính tìm</div>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="w-full max-w-[600px]">
              <input type="range" min={1} max={100} value={banKinh} onChange={(e) => datBanKinh(Number(e.target.value))} className="w-full accent-blue" aria-label="Bán kính tìm (km)" />
              <div className="flex justify-between text-[12.5px] text-mut"><span>1 km</span><span>100 km</span></div>
            </div>
            <label className="flex items-center gap-2 text-[13px] text-ink2"><Input type="number" min={1} max={100} value={banKinh} onChange={(e) => datBanKinh(Number(e.target.value))} className="h-10 w-[100px]" aria-label="Bán kính (km)" />km</label>
          </div>
        </div>
      )}
      {viTri && tongGan > 0 && (
        <div className="mt-4 flex items-center gap-4 text-[14px]">
          <button type="button" className="link-more" onClick={() => onLocVanPhong(trongBanKinh.map((x) => x.o.ten))}>Xem tất cả {fmtNum(tongGan)} Tư vấn viên trong {banKinh} km</button>
          <button type="button" className="text-[13px] text-ink2 hover:underline" onClick={() => { setViTri(null); onLocVanPhong(null); }}>Xoá vị trí</button>
        </div>
      )}
      <QuickView ma={xemNhanh} onClose={() => setXemNhanh(undefined)} />
    </section>
  );
}

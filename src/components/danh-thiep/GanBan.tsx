"use client";
/** Khối "Tìm Tư vấn viên gần bạn" trên E01 (09–10/09): nhập địa chỉ/khu vực hoặc dùng vị trí trình duyệt → bản đồ thật (ô ảnh OpenStreetMap/CARTO, chiếu Mercator) với marker = văn phòng (số TVV),
 *  vòng tròn bán kính (thanh kéo 1–100 km + ô số), khung 5 TVV gần nhất theo khoảng cách tới văn phòng. Trạng thái: chưa có vị trí · không có TVV trong bán kính.
 *  "Xem tất cả trong N km" → lọc danh bạ bên dưới theo các văn phòng gần. Bản thật: Chubb chốt dịch vụ bản đồ (Google Maps có phí / OSM miễn phí). */
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, H2, Input, Muted } from "@/components/ui";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtNum } from "@/lib/seed";
import type { Office } from "@/lib/types";
import { QuickView } from "@/components/danh-thiep/QuickView";
import { khongDau, theXemDuoc, tinhThanh } from "@/components/danh-thiep/lib";

type ViTri = { lat: number; lng: number; nhan: string };
/** Giả lập tra địa chỉ: khớp tên tỉnh/thành/quận → toạ độ trung tâm (bản thật dùng dịch vụ bản đồ) */
const TINH: { k: RegExp; v: ViTri }[] = [
  { k: /ho chi minh|hcm|sai gon|quan \d|thu duc|binh thanh|go vap|tan binh|phu nhuan/, v: { lat: 10.7769, lng: 106.7009, nhan: "TP. Hồ Chí Minh" } },
  { k: /ha noi|hoan kiem|cau giay|dong da|ba dinh|thanh xuan|hai ba trung/, v: { lat: 21.0285, lng: 105.8542, nhan: "Hà Nội" } },
  { k: /da nang|hai chau|son tra|thanh khe/, v: { lat: 16.0544, lng: 108.2022, nhan: "Đà Nẵng" } },
  { k: /can tho|ninh kieu/, v: { lat: 10.0452, lng: 105.7469, nhan: "Cần Thơ" } },
  { k: /hai phong|le chan|ngo quyen/, v: { lat: 20.8449, lng: 106.6881, nhan: "Hải Phòng" } },
  { k: /binh duong|thu dau mot|di an/, v: { lat: 10.9804, lng: 106.6519, nhan: "Bình Dương" } },
  { k: /vung tau/, v: { lat: 10.346, lng: 107.0843, nhan: "Vũng Tàu" } },
  { k: /nha trang|khanh hoa/, v: { lat: 12.2388, lng: 109.1967, nhan: "Nha Trang" } },
  { k: /hue/, v: { lat: 16.4637, lng: 107.5909, nhan: "Huế" } },
  { k: /bien hoa|dong nai/, v: { lat: 10.9574, lng: 106.8427, nhan: "Biên Hoà" } },
];
const kmGiua = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => { const R0 = 6371, d = Math.PI / 180; const dLat = (b.lat - a.lat) * d, dLng = (b.lng - a.lng) * d; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * d) * Math.cos(b.lat * d) * Math.sin(dLng / 2) ** 2; return 2 * R0 * Math.asin(Math.sqrt(h)); };
const fmtKm = (km: number) => (km < 10 ? km.toFixed(1).replace(".", ",") : Math.round(km).toString()) + " km";

/* ---- Bản đồ ô ảnh (Web Mercator, tile 256) ---- */
const TILE = 256;
const worldPx = (lat: number, lng: number, z: number) => { const n = TILE * 2 ** z; const x = ((lng + 180) / 360) * n; const s = Math.sin((lat * Math.PI) / 180); const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n; return { x, y }; };
const metPerPx = (lat: number, z: number) => (156543.03 * Math.cos((lat * Math.PI) / 180)) / 2 ** z;
const zoomChoBanKinh = (lat: number, km: number, hPx: number) => { const mpp = (km * 2000) / (hPx * 0.6); const z = Math.floor(Math.log2((156543.03 * Math.cos((lat * Math.PI) / 180)) / mpp)); return Math.max(5, Math.min(14, z)); };
const tileUrl = (z: number, x: number, y: number) => `https://${"abcd"[(x + y) % 4]}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;

export function GanBan({ onLocVanPhong }: { onLocVanPhong: (tenVanPhong: string[] | null) => void }) {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [viTri, setViTri] = useState<ViTri | null>(null);
  const [loi, setLoi] = useState("");
  const [banKinh, setBanKinh] = useState(10);
  const [xemNhanh, setXemNhanh] = useState<string>();
  const mapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(880);
  const H = 420;
  useEffect(() => { const el = mapRef.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth || 880)); ro.observe(el); setW(el.clientWidth || 880); return () => ro.disconnect(); }, []);
  const datBanKinh = (v: number) => setBanKinh(Math.min(100, Math.max(1, Math.round(v) || 1)));

  const congKhai = useMemo(() => data.advisors.filter(theXemDuoc), [data.advisors]);
  const demTVV = (o: Office) => congKhai.filter((a) => a.vanPhong === o.ten).length;
  const vanPhongGan = useMemo(() => viTri ? data.offices.map((o) => ({ o, km: kmGiua(viTri, o) })).sort((a, b) => a.km - b.km) : [], [viTri, data.offices]);
  const trongBanKinh = vanPhongGan.filter((x) => x.km <= banKinh);
  const tvvGan = useMemo(() => trongBanKinh.flatMap((x) => congKhai.filter((a) => a.vanPhong === x.o.ten).map((a) => ({ a, km: x.km, o: x.o }))).slice(0, 5), [trongBanKinh, congKhai]);
  const tongGan = trongBanKinh.reduce((s, x) => s + demTVV(x.o), 0);

  // khung nhìn: toàn quốc khi chưa có vị trí; có vị trí thì zoom quanh người dùng theo bán kính
  const tam = viTri ?? { lat: 16.2, lng: 106.6 };
  const z = viTri ? zoomChoBanKinh(viTri.lat, banKinh, H) : 5;
  const c = worldPx(tam.lat, tam.lng, z); const x0 = c.x - w / 2, y0 = c.y - H / 2;
  const n = 2 ** z; const tiles: { tx: number; ty: number; left: number; top: number }[] = [];
  for (let tx = Math.floor(x0 / TILE); tx <= Math.floor((x0 + w) / TILE); tx++) for (let ty = Math.floor(y0 / TILE); ty <= Math.floor((y0 + H) / TILE); ty++) { if (ty < 0 || ty >= n) continue; tiles.push({ tx: ((tx % n) + n) % n, ty, left: tx * TILE - x0, top: ty * TILE - y0 }); }
  const toPx = (lat: number, lng: number) => { const p = worldPx(lat, lng, z); return { x: p.x - x0, y: p.y - y0 }; };
  const rPx = viTri ? (banKinh * 1000) / metPerPx(viTri.lat, z) : 0;

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
        <div ref={mapRef} className="relative rounded-sm border border-vien bg-xam overflow-hidden select-none" style={{ height: H }} aria-label="Bản đồ văn phòng Chubb Life">
          {tiles.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element -- ô ảnh bản đồ từ dịch vụ ngoài, không qua tối ưu ảnh của Next
            <img key={`${z}/${t.tx}/${t.ty}`} src={tileUrl(z, t.tx, t.ty)} alt="" width={TILE} height={TILE} draggable={false} className="absolute max-w-none" style={{ left: t.left, top: t.top }} />
          ))}
          {viTri && (() => { const p = toPx(viTri.lat, viTri.lng); return <div className="absolute rounded-full border-2 border-blue bg-blue/10 pointer-events-none" style={{ left: p.x - rPx, top: p.y - rPx, width: rPx * 2, height: rPx * 2 }} aria-label={`Bán kính ${banKinh} km`} />; })()}
          {data.offices.map((o) => { const p = toPx(o.lat, o.lng); if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > H + 20) return null; const gan = trongBanKinh.some((x) => x.o.id === o.id); return (
            <button key={o.id} type="button" title={`${o.ten} · ${demTVV(o)} Tư vấn viên`} onClick={() => { setBanKinh(10); setViTri({ lat: o.lat, lng: o.lng, nhan: o.ten }); }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 size-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow ${gan ? "bg-blue ring-4 ring-blue/25" : "bg-blue/80 hover:bg-blue"}`} style={{ left: p.x, top: p.y }}>{demTVV(o)}</button>); })}
          {viTri && (() => { const p = toPx(viTri.lat, viTri.lng); return <div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none" style={{ left: p.x, top: p.y }}><span className="size-5 rounded-full bg-white border-4 border-blue" /><span className="text-[12px] font-bold text-blue drop-shadow">Bạn</span></div>; })()}
          <div className="absolute right-2 bottom-1 text-[10px] text-ink2/80 bg-white/80 px-1 rounded">© OpenStreetMap contributors © CARTO</div>
        </div>

        <Card className="p-5 min-h-[420px]">
          {!viTri ? (
            <>
              <div className="font-bold text-[16px] text-den">Chưa có vị trí của bạn</div>
              <Muted className="mt-2 text-[13.5px]">Cho phép truy cập vị trí hoặc nhập địa chỉ để xem Tư vấn viên gần bạn. Bấm một marker trên bản đồ để xem Tư vấn viên tại văn phòng đó.</Muted>
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

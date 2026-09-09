"use client";
/** E06 · Danh bạ Tư vấn viên (archive, công khai) — 09/09: không có từ khoá là danh bạ toàn bộ TVV đang có thẻ công khai (lọc Khu vực · Văn phòng · Chức danh · Danh hiệu, sắp xếp, phân trang);
 *  có ?q= thì thành kết quả tìm (họ tên không dấu hoặc mã 7 số). Một màn hai trạng thái. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Avatar, Breadcrumb, Button, Card, EmptyState, FilterChips, H1, Input, Muted, Pagination, Select } from "@/components/ui";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtNum } from "@/lib/seed";
import { QuickView } from "@/components/danh-thiep/QuickView";
import { danhHieuCongKhai, khongDau, laMa7So, namKinhNghiem, theXemDuoc, tinhThanh } from "@/components/danh-thiep/lib";

type KV = "tat-ca" | "Miền Bắc" | "Miền Trung" | "Miền Nam";
const KHU_VUC: KV[] = ["tat-ca", "Miền Bắc", "Miền Trung", "Miền Nam"];
/** Miền theo tỉnh/thành của văn phòng (dùng cho chip Khu vực) */
const khuVuc = (vanPhong: string): KV => { const t = tinhThanh(vanPhong); return /Hà Nội|Hải Phòng|Bắc|Quảng Ninh|Nghệ An/.test(t) ? "Miền Bắc" : /Đà Nẵng|Huế|Nha Trang|Quy Nhơn/.test(t) ? "Miền Trung" : "Miền Nam"; };

const PAGE = 10;

export default function Page() {
  return <Suspense fallback={<div className="wrap py-24 text-mut">Đang tải…</div>}><DanhBa /></Suspense>;
}

function DanhBa() {
  const sp = useSearchParams();
  const router = useRouter();
  const q0 = sp.get("q") ?? "";
  const { data } = useStore();
  const [q, setQ] = useState(q0);
  const [kv, setKv] = useState<KV>("tat-ca");
  const [vp, setVp] = useState("");
  const [cd, setCd] = useState("");
  const [dh, setDh] = useState("");
  const [sort, setSort] = useState<"khop" | "ten" | "kinh-nghiem">(q0 ? "khop" : "ten");
  const [page, setPage] = useState(1);
  const [xemNhanh, setXemNhanh] = useState<string>();

  const congKhai = useMemo(() => data.advisors.filter(theXemDuoc), [data.advisors]);
  const vanPhongs = useMemo(() => Array.from(new Set(congKhai.map((a) => a.vanPhong))).sort(), [congKhai]);
  const chucDanhs = useMemo(() => Array.from(new Set(congKhai.map((a) => a.chucDanh))).sort(), [congKhai]);
  const danhHieus = useMemo(() => Array.from(new Set(congKhai.flatMap((a) => danhHieuCongKhai(a).map((d) => d.replace(/\s*\d{4}$/, ""))))).sort(), [congKhai]);
  const demKv = (k: KV) => congKhai.filter((a) => k === "tat-ca" || khuVuc(a.vanPhong) === k).length;

  const ketQua = useMemo(() => {
    const s = khongDau(q0);
    const list = congKhai.filter((a) =>
      (kv === "tat-ca" || khuVuc(a.vanPhong) === kv) && (!vp || a.vanPhong === vp) && (!cd || a.chucDanh === cd) &&
      (!dh || danhHieuCongKhai(a).some((d) => d.startsWith(dh))) &&
      (!s || (laMa7So(s) ? a.ma === s : khongDau(a.hoTen).includes(s))));
    const score = (hoTen: string) => (khongDau(hoTen).startsWith(s) ? 0 : khongDau(hoTen).split(" ").some((w) => w.startsWith(s)) ? 1 : 2);
    return [...list].sort((x, y) => sort === "ten" ? x.hoTen.localeCompare(y.hoTen, "vi") : sort === "kinh-nghiem" ? namKinhNghiem(y) - namKinhNghiem(x) : (s ? score(x.hoTen) - score(y.hoTen) : x.hoTen.localeCompare(y.hoTen, "vi")));
  }, [q0, kv, vp, cd, dh, sort, congKhai]);

  const pages = Math.max(1, Math.ceil(ketQua.length / PAGE));
  const p = Math.min(page, pages);
  const rows = ketQua.slice((p - 1) * PAGE, p * PAGE);
  const coLoc = kv !== "tat-ca" || vp || cd || dh;

  const tim = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    setPage(1);
    if (!s) { router.push(R.E06()); return; }
    router.push(laMa7So(s) && data.advisors.some((a) => a.ma === s) ? R.E03(s) : R.E06(s));
  };
  const boLoc = () => { setKv("tat-ca"); setVp(""); setCd(""); setDh(""); setQ(""); setPage(1); router.push(R.E06()); };

  return (
    <div className="wrap py-10">
      <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Kết Nối", href: R.E01 }, { label: "Danh bạ Tư vấn viên" }]} />
      <H1 className="mt-4 text-[34px] uppercase">Danh bạ Tư vấn viên</H1>
      <Muted className="mt-3 text-[16px]">{fmtNum(congKhai.length)} Tư vấn viên đang có danh thiếp công khai. Lọc theo khu vực, văn phòng, hoặc tìm theo họ tên · mã 7 chữ số in trên thẻ.</Muted>

      <form onSubmit={tim} className="mt-8 flex gap-3 max-w-[820px]">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Họ tên hoặc mã Tư vấn viên 7 chữ số…" aria-label="Tìm Tư vấn viên" className="h-11" />
        <Button type="submit">Tìm</Button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <FilterChips<KV> options={KHU_VUC.map((k) => ({ value: k, label: k === "tat-ca" ? "Tất cả" : k, count: demKv(k) }))} value={kv} onChange={(v) => { setKv(v); setVp(""); setPage(1); }} />
        <Select value={vp} onChange={(e) => { setVp(e.target.value); setPage(1); }} className="h-8 text-[13px] w-[200px]"><option value="">Văn phòng</option>{vanPhongs.filter((v) => kv === "tat-ca" || khuVuc(v) === kv).map((v) => <option key={v} value={v}>{v}</option>)}</Select>
        <Select value={cd} onChange={(e) => { setCd(e.target.value); setPage(1); }} className="h-8 text-[13px] w-[190px]"><option value="">Chức danh</option>{chucDanhs.map((v) => <option key={v} value={v}>{v}</option>)}</Select>
        <Select value={dh} onChange={(e) => { setDh(e.target.value); setPage(1); }} className="h-8 text-[13px] w-[160px]"><option value="">Danh hiệu</option>{danhHieus.map((v) => <option key={v} value={v}>{v}</option>)}</Select>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-[13px] text-ink2">
              {q0 ? <>{ketQua.length} Tư vấn viên khớp “{q0}” · <Link href={R.E06()} className="text-blue font-bold hover:underline" onClick={() => setQ("")}>Xem toàn bộ danh bạ</Link></> : <>Hiện {ketQua.length === 0 ? 0 : (p - 1) * PAGE + 1}–{Math.min(p * PAGE, ketQua.length)} / {fmtNum(ketQua.length)} Tư vấn viên</>}
            </div>
            <label className="flex items-center gap-2 text-[13px] text-ink2">Sắp xếp:
              <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="w-[170px] h-8 text-[13px]">
                {q0 && <option value="khop">Khớp nhất</option>}<option value="ten">Họ tên A–Z</option><option value="kinh-nghiem">Kinh nghiệm</option>
              </Select>
            </label>
          </div>

          {ketQua.length === 0 ? (
            <div className="mt-5">
              <EmptyState title={q0 ? `Không tìm thấy Tư vấn viên nào khớp “${q0}”` : "Không có Tư vấn viên nào khớp bộ lọc"} desc={q0 ? "Kiểm lại mã 7 chữ số, thử họ tên khác, hoặc quét lại mã QR trên thẻ." : "Đổi khu vực hoặc bỏ bộ lọc để xem toàn bộ danh bạ."} action={<div className="flex gap-3"><Button kind="secondary" onClick={boLoc}>Bỏ bộ lọc</Button><Button href={R.S03} kind="ghost">Liên hệ & trợ giúp</Button></div>} />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {rows.map((a) => (
                <Card key={a.ma} className="p-5 flex items-center gap-5">
                  <Avatar name={a.hoTen} size={96} src={a.avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-blue uppercase">Mã {a.ma} · {tinhThanh(a.vanPhong)}</div>
                    <div className="font-bold text-[17px] text-den mt-1">{a.hoTen}</div>
                    <div className="text-[13.5px] text-ink2 mt-1">{[a.chucDanh, ...danhHieuCongKhai(a), `${namKinhNghiem(a)} năm kinh nghiệm`].join(" · ")}</div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" onClick={() => setXemNhanh(a.ma)}>Xem nhanh</Button>
                    <Button size="sm" kind="secondary" href={R.E03(a.ma)}>Xem đầy đủ</Button>
                  </div>
                </Card>
              ))}
              <Pagination page={p} pages={pages} onChange={setPage} />
              {coLoc && <div className="text-[13px]"><button type="button" className="text-blue font-bold hover:underline" onClick={boLoc}>Bỏ bộ lọc</button></div>}
            </div>
          )}
        </div>

        <aside className="bg-xam rounded-sm p-6 self-start">
          <div className="font-bold text-[17px] text-den">Mẹo tìm</div>
          <ul className="mt-4 space-y-3 text-[13.5px] text-ink2 list-disc pl-5">
            <li>Mã TVV có 7 chữ số — in trên thẻ, ngay dưới mã QR</li>
            <li>Nhập đúng mã sẽ mở thẳng trang danh thiếp, không qua màn này.</li>
            <li>Chưa biết tên? Lọc theo khu vực và văn phòng gần bạn.</li>
            <li>Không tìm thấy? Gọi hotline 1800 xxxx hoặc <Link href={R.S03} className="text-blue font-bold hover:underline">Liên hệ & trợ giúp</Link></li>
          </ul>
        </aside>
      </div>

      <QuickView ma={xemNhanh} onClose={() => setXemNhanh(undefined)} />
    </div>
  );
}

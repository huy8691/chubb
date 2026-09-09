"use client";
/** Khối "Danh bạ Tư vấn viên" trên E01 (09/09): ô tìm (mã đúng → E03, họ tên → E06 kết quả tìm) · chip Khu vực · ô chọn Văn phòng · Chức danh · Danh hiệu · đếm · sắp xếp · danh sách TVV đang có thẻ công khai · phân trang. */
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, Button, Card, EmptyState, FilterChips, H2, Input, Muted, Pagination, Select } from "@/components/ui";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtNum } from "@/lib/seed";
import { QuickView } from "@/components/danh-thiep/QuickView";
import { danhHieuCongKhai, laMa7So, namKinhNghiem, theXemDuoc, tinhThanh } from "@/components/danh-thiep/lib";

const PAGE = 10;
type KV = "tat-ca" | "Miền Bắc" | "Miền Trung" | "Miền Nam";
const KHU_VUC: KV[] = ["tat-ca", "Miền Bắc", "Miền Trung", "Miền Nam"];
/** Miền theo tỉnh/thành của văn phòng */
const mien = (vanPhong: string): KV => { const t = tinhThanh(vanPhong); return /Hà Nội|Hải Phòng|Bắc|Quảng Ninh|Nghệ An/.test(t) ? "Miền Bắc" : /Đà Nẵng|Huế|Nha Trang|Quy Nhơn/.test(t) ? "Miền Trung" : "Miền Nam"; };

export function DanhBa() {
  const router = useRouter();
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [kv, setKv] = useState<KV>("tat-ca");
  const [vp, setVp] = useState("");
  const [cd, setCd] = useState("");
  const [dh, setDh] = useState("");
  const [sort, setSort] = useState<"ten" | "kinh-nghiem">("ten");
  const [page, setPage] = useState(1);
  const [xemNhanh, setXemNhanh] = useState<string>();

  const congKhai = useMemo(() => data.advisors.filter(theXemDuoc), [data.advisors]);
  const vanPhongs = useMemo(() => Array.from(new Set(congKhai.map((a) => a.vanPhong))).sort(), [congKhai]);
  const chucDanhs = useMemo(() => Array.from(new Set(congKhai.map((a) => a.chucDanh))).sort(), [congKhai]);
  const danhHieus = useMemo(() => Array.from(new Set(congKhai.flatMap((a) => danhHieuCongKhai(a).map((d) => d.replace(/\s*\d{4}$/, ""))))).sort(), [congKhai]);
  const demKv = (k: KV) => congKhai.filter((a) => k === "tat-ca" || mien(a.vanPhong) === k).length;
  const list = useMemo(() => congKhai
    .filter((a) => (kv === "tat-ca" || mien(a.vanPhong) === kv) && (!vp || a.vanPhong === vp) && (!cd || a.chucDanh === cd) && (!dh || danhHieuCongKhai(a).some((d) => d.startsWith(dh))))
    .sort((x, y) => sort === "kinh-nghiem" ? namKinhNghiem(y) - namKinhNghiem(x) : x.hoTen.localeCompare(y.hoTen, "vi")), [congKhai, kv, vp, cd, dh, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const p = Math.min(page, pages);
  const rows = list.slice((p - 1) * PAGE, p * PAGE);
  const coLoc = kv !== "tat-ca" || vp || cd || dh;
  const boLoc = () => { setKv("tat-ca"); setVp(""); setCd(""); setDh(""); setPage(1); };

  const tim = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    router.push(laMa7So(s) && data.advisors.some((a) => a.ma === s) ? R.E03(s) : R.E06(s));
  };

  return (
    <section>
      <H2 className="text-[22px]">Danh bạ Tư vấn viên</H2>
      <Muted className="mt-2 text-[14px]">{fmtNum(congKhai.length)} Tư vấn viên đang có danh thiếp công khai. Lọc theo khu vực, văn phòng, hoặc tìm theo họ tên · mã 7 chữ số in trên thẻ.</Muted>
      <form onSubmit={tim} className="mt-5 flex gap-3 max-w-[820px]">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Họ tên hoặc mã Tư vấn viên 7 chữ số…" aria-label="Tìm Tư vấn viên" className="h-11" />
        <Button type="submit">Tìm</Button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <FilterChips<KV> options={KHU_VUC.map((k) => ({ value: k, label: k === "tat-ca" ? "Tất cả" : k, count: demKv(k) }))} value={kv} onChange={(v) => { setKv(v); setVp(""); setPage(1); }} />
        <Select value={vp} onChange={(e) => { setVp(e.target.value); setPage(1); }} className="h-8 text-[13px] w-[200px]"><option value="">Văn phòng</option>{vanPhongs.filter((v) => kv === "tat-ca" || mien(v) === kv).map((v) => <option key={v} value={v}>{v}</option>)}</Select>
        <Select value={cd} onChange={(e) => { setCd(e.target.value); setPage(1); }} className="h-8 text-[13px] w-[190px]"><option value="">Chức danh</option>{chucDanhs.map((v) => <option key={v} value={v}>{v}</option>)}</Select>
        <Select value={dh} onChange={(e) => { setDh(e.target.value); setPage(1); }} className="h-8 text-[13px] w-[160px]"><option value="">Danh hiệu</option>{danhHieus.map((v) => <option key={v} value={v}>{v}</option>)}</Select>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-[13px] text-ink2">Hiện {list.length === 0 ? 0 : (p - 1) * PAGE + 1}–{Math.min(p * PAGE, list.length)} / {fmtNum(list.length)} Tư vấn viên</div>
        <label className="flex items-center gap-2 text-[13px] text-ink2">Sắp xếp:
          <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="w-[170px] h-8 text-[13px]"><option value="ten">Họ tên A–Z</option><option value="kinh-nghiem">Kinh nghiệm</option></Select>
        </label>
      </div>
      {list.length === 0 ? (
        <div className="mt-5"><EmptyState title="Không có Tư vấn viên nào khớp bộ lọc" desc="Đổi khu vực hoặc bỏ bộ lọc để xem toàn bộ danh bạ." action={<Button kind="secondary" onClick={boLoc}>Bỏ bộ lọc</Button>} /></div>
      ) : (
        <div className="mt-5 space-y-4">
          {rows.map((a) => (
            <Card key={a.ma} className="p-4 flex items-center gap-5">
              <Avatar name={a.hoTen} size={88} src={a.avatar} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-blue uppercase">Mã {a.ma} · {tinhThanh(a.vanPhong)}</div>
                <div className="font-bold text-[17px] text-den mt-1">{a.hoTen}</div>
                <div className="text-[13.5px] text-ink2 mt-1">{[a.chucDanh, ...danhHieuCongKhai(a), `${namKinhNghiem(a)} năm kinh nghiệm`].join(" · ")}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button size="sm" kind="secondary" className="w-[150px]" onClick={() => setXemNhanh(a.ma)}>Xem nhanh</Button>
                <Button size="sm" className="w-[150px]" href={R.E03(a.ma)}>Xem đầy đủ</Button>
              </div>
            </Card>
          ))}
          <Pagination page={p} pages={pages} onChange={setPage} />
          {coLoc && <div className="text-[13px]"><button type="button" className="text-blue font-bold hover:underline" onClick={boLoc}>Bỏ bộ lọc</button></div>}
        </div>
      )}
      <QuickView ma={xemNhanh} onClose={() => setXemNhanh(undefined)} />
    </section>
  );
}

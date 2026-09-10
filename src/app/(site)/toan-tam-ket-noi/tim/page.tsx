"use client";
/** E06 · Kết quả tìm Tư vấn viên (?q=). Tìm theo họ tên không dấu hoặc mã 7 số; chỉ danh thiếp công khai. */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Avatar, Breadcrumb, Button, Card, EmptyState, H1, Input, Muted, Pagination, Select } from "@/components/ui";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { QuickView } from "@/components/danh-thiep/QuickView";
import { danhHieuCongKhai, khongDau, laMa7So, namKinhNghiem, theXemDuoc, tinhThanh } from "@/components/danh-thiep/lib";

const PAGE = 5;

export default function Page() {
  return <Suspense fallback={<div className="wrap py-14 sm:py-24 text-mut">Đang tìm…</div>}><KetQuaTim /></Suspense>;
}

function KetQuaTim() {
  const sp = useSearchParams();
  const router = useRouter();
  const q0 = sp.get("q") ?? "";
  const { data } = useStore();
  const [q, setQ] = useState(q0);
  const [sort, setSort] = useState<"khop" | "ten" | "kinh-nghiem">("khop");
  const [page, setPage] = useState(1);
  const [xemNhanh, setXemNhanh] = useState<string>();

  const ketQua = useMemo(() => {
    const s = khongDau(q0);
    if (!s) return [];
    const list = data.advisors.filter((a) => theXemDuoc(a) && (laMa7So(s) ? a.ma === s : khongDau(a.hoTen).includes(s)));
    const score = (hoTen: string) => (khongDau(hoTen).startsWith(s) ? 0 : khongDau(hoTen).split(" ").some((w) => w.startsWith(s)) ? 1 : 2);
    return [...list].sort((x, y) => sort === "ten" ? x.hoTen.localeCompare(y.hoTen, "vi") : sort === "kinh-nghiem" ? namKinhNghiem(y) - namKinhNghiem(x) : score(x.hoTen) - score(y.hoTen));
  }, [q0, sort, data.advisors]);

  const pages = Math.max(1, Math.ceil(ketQua.length / PAGE));
  const rows = ketQua.slice((page - 1) * PAGE, page * PAGE);

  const tim = (e: React.FormEvent) => {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    setPage(1);
    router.push(laMa7So(s) && data.advisors.some((a) => a.ma === s) ? R.E03(s) : R.E06(s));
  };

  return (
    <div className="wrap py-10">
      <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Kết Nối", href: R.E01 }, { label: "Kết quả tìm" }]} />
      <H1 className="mt-4 text-[34px] uppercase">Kết quả tìm Tư vấn viên</H1>
      <Muted className="mt-3 text-[16px]">Tìm theo họ tên hoặc mã Tư vấn viên 7 chữ số (in trên thẻ, dưới mã QR).</Muted>

      <form onSubmit={tim} className="mt-8 flex gap-3 max-w-[820px]">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập mã Tư vấn viên (7 chữ số) hoặc họ tên" aria-label="Tìm Tư vấn viên" className="h-11" />
        <Button type="submit">Tìm</Button>
      </form>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-[13px] text-ink2">{ketQua.length} Tư vấn viên khớp “{q0}”</div>
            <label className="flex items-center gap-2 text-[13px] text-ink2">Sắp xếp:
              <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="w-[170px] h-8 text-[13px]">
                <option value="khop">Khớp nhất</option><option value="ten">Họ tên A–Z</option><option value="kinh-nghiem">Kinh nghiệm</option>
              </Select>
            </label>
          </div>

          {ketQua.length === 0 ? (
            <div className="mt-5">
              <EmptyState title={`Không tìm thấy Tư vấn viên nào khớp “${q0}”`} desc="Kiểm lại mã 7 chữ số, thử họ tên khác, hoặc quét lại mã QR trên thẻ." action={<div className="flex gap-3"><Button href={R.E01} kind="secondary">Về trang Danh thiếp</Button><Button href={R.S03} kind="ghost">Liên hệ & trợ giúp</Button></div>} />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {rows.map((a) => (
                <Card key={a.ma} className="p-4 sm:p-5 flex items-center gap-5">
                  <Avatar name={a.hoTen} size={96} src={a.avatar} />
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
              <Pagination page={page} pages={pages} onChange={setPage} />
            </div>
          )}
        </div>

        <aside className="bg-xam rounded-sm p-4 sm:p-6 self-start">
          <div className="font-bold text-[17px] text-den">Mẹo tìm</div>
          <ul className="mt-4 space-y-3 text-[13.5px] text-ink2 list-disc pl-5">
            <li>Mã TVV có 7 chữ số — in trên thẻ, ngay dưới mã QR</li>
            <li>Nhập đúng mã sẽ mở thẳng trang danh thiếp, không qua màn này.</li>
            <li>Nhập đủ họ và tên để thu hẹp kết quả</li>
            <li>Không tìm thấy? Gọi hotline 1800 xxxx hoặc <Link href={R.S03} className="text-blue font-bold hover:underline">Liên hệ & trợ giúp</Link></li>
          </ul>
        </aside>
      </div>

      <QuickView ma={xemNhanh} onClose={() => setXemNhanh(undefined)} />
    </div>
  );
}

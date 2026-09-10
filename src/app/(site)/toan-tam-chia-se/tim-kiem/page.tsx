"use client";
/** F04 · Tìm kiếm bài viết — trang RIÊNG (không tái dùng F03 "Tất cả"), đích của ô tìm trên F01 (?q=).
 *  Chỉ tìm trong bài viết Thư viện (tiêu đề · sapo). Hai trạng thái: có kết quả · không có kết quả. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Breadcrumb, Button, H1, Input, Pagination, Select, cx } from "@/components/ui";
import { daXuatBan, phutDoc } from "@/components/thu-vien/helpers";

const PER = 10;
const bo = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
const diem = (k: string, tieuDe: string, sapo: string) => { const t = bo(tieuDe), s = bo(sapo); if (t.startsWith(k)) return 3; if (t.includes(k)) return 2; if (s.includes(k)) return 1; return 0; };

function KetQua({ q0 }: { q0: string }) {
  const router = useRouter();
  const { data } = useStore();
  const [q, setQ] = useState(q0);
  const [sort, setSort] = useState<"lien-quan" | "moi-nhat">("lien-quan");
  const [page, setPage] = useState(1);
  const cdOf = (id: string) => data.chuyenDe.find((c) => c.id === id);

  const ket = useMemo(() => {
    const k = bo(q0.trim());
    if (!k) return [] as { a: (typeof data.articles)[number]; d: number }[];
    return data.articles.filter(daXuatBan).map((a) => ({ a, d: diem(k, a.tieuDe, a.sapo) })).filter((x) => x.d > 0);
  }, [q0, data.articles]);

  const loc = [...ket].sort((x, y) => (sort === "lien-quan" ? y.d - x.d || (y.a.ngayXuatBan ?? "").localeCompare(x.a.ngayXuatBan ?? "") : (y.a.ngayXuatBan ?? "").localeCompare(x.a.ngayXuatBan ?? "")));
  const pages = Math.max(1, Math.ceil(loc.length / PER));
  const cur = Math.min(page, pages);
  const hien = loc.slice((cur - 1) * PER, cur * PER);

  return (
    <div className="wrap py-10">
      <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Chia Sẻ", href: R.F01 }, { label: "Tìm kiếm bài viết" }]} />
      <H1 className="mt-3 text-[30px]">Tìm kiếm bài viết</H1>
      <form className="mt-5 flex gap-3 max-w-[900px]" onSubmit={(e) => { e.preventDefault(); if (q.trim()) { setPage(1); router.push(R.F04(q.trim())); } }}>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bài viết theo tiêu đề hoặc chuyên đề" aria-label="Từ khoá" className="h-11 text-[15px]" />
        <Button type="submit">Tìm</Button>
      </form>

      <p className="mt-8 text-[14px] text-ink2">{q0.trim() ? <>{ket.length} kết quả cho “{q0.trim()}”</> : "Nhập từ khoá để tìm trong bài viết Thư viện."}</p>

      {ket.length > 0 && (
        <div className="mt-4 flex justify-end">
          <label className="flex items-center gap-2 text-[13px] text-ink2">Sắp xếp:
            <Select value={sort} onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }} className="w-[150px]"><option value="lien-quan">Liên quan</option><option value="moi-nhat">Mới nhất</option></Select>
          </label>
        </div>
      )}

      {q0.trim() && ket.length === 0 ? (
        <div className="mt-6 border border-dashed border-vien rounded-sm p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="font-bold text-[15px] text-den max-w-[720px]">Không tìm thấy bài viết cho “{q0.trim()}” — thử từ khoá khác, hoặc xem tất cả bài viết.</div>
          <Button kind="secondary" href={R.F03("tat-ca")}>Xem tất cả bài viết</Button>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-vien2 border-y border-vien2">
          {hien.map(({ a }) => (
            <li key={a.id}>
              <Link href={R.F02(a.slug)} className={cx("group grid grid-cols-[200px_1fr] gap-6 items-center py-5 hover:bg-xam -mx-4 px-4")}>
                <div className="aspect-video bg-xam rounded-sm overflow-hidden"><span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[12px]">Ảnh</span></div>
                <div>
                  <div className="font-bold text-[16px] leading-snug text-den group-hover:text-blue line-clamp-2">{a.tieuDe}</div>
                  <div className="text-[13px] text-ink2 mt-1.5">{cdOf(a.chuyenDeId)?.ten ?? "Bài viết"} · {phutDoc(a)} phút đọc{a.ngayXuatBan ? ` · ${fmtDate(a.ngayXuatBan)}` : ""}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {ket.length > 0 && <Pagination page={cur} pages={pages} onChange={setPage} />}
    </div>
  );
}

function Wrapper({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = use(searchParams);
  return <KetQua q0={q ?? ""} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <Suspense fallback={<div className="wrap py-10 text-mut">Đang tìm…</div>}><Wrapper searchParams={searchParams} /></Suspense>;
}

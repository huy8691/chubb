"use client";
/**
 * F03 · Trang chuyên đề (archive) — đích của "Xem tất cả" trên F01.
 * Breadcrumb 3 cấp · masthead gọn · chip lọc 5 chuyên đề · đếm · sắp xếp · danh sách hàng ngang · phân trang · sidebar (tìm trong chuyên đề · chuyên đề anh em · xem nhiều).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { Breadcrumb, EmptyState, H1, H3, Muted, Pagination, SearchBox, Select, cx } from "@/components/ui";
import { ArticleRow, TopList } from "@/components/thu-vien/ArticleCard";
import { chuyenDeHien, daXuatBan, sapXep, type SapXep } from "@/components/thu-vien/helpers";

const PER_PAGE = 6;

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, ready } = useStore();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SapXep>("moi-nhat");
  const [page, setPage] = useState(1);

  const cd = data.chuyenDe.find((c) => c.slug === slug);
  const cds = chuyenDeHien(data.chuyenDe);
  const published = useMemo(() => data.articles.filter(daXuatBan), [data.articles]);
  const inCd = useMemo(() => (cd ? published.filter((a) => a.chuyenDeId === cd.id) : []), [published, cd]);
  const filtered = useMemo(() => sapXep(inCd.filter((a) => !q.trim() || a.tieuDe.toLowerCase().includes(q.trim().toLowerCase())), sort), [inCd, q, sort]);

  if (ready && (!cd || !cd.hien)) notFound();
  if (!cd) return null;

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const top = sapXep(inCd, "xem-nhieu").slice(0, 3);
  const countOf = (id: string) => published.filter((a) => a.chuyenDeId === id).length;

  return (
    <>
      <div className="bg-xam">
        <div className="wrap py-8">
          <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Chia Sẻ", href: R.F01 }, { label: cd.ten }]} />
          <H1 className="mt-3 uppercase text-[34px]">{cd.ten}</H1>
          <Muted className="mt-2 text-[16px]">{cd.moTa} — chuyên đề của Thư viện Toàn Tâm Chia Sẻ.</Muted>
          <div className="mt-5 flex flex-wrap gap-2">
            {cds.map((c) => (
              <Link key={c.id} href={R.F03(c.slug)} className={cx("h-8 px-3 inline-flex items-center rounded-sm text-[13px] font-bold border", c.id === cd.id ? "bg-blue text-white border-blue" : "bg-white text-ink2 border-vien hover:border-blue hover:text-blue")}>{c.ten}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap py-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-ink2">{filtered.length} bài viết trong chuyên đề này</span>
            <label className="flex items-center gap-2 text-[13px] text-ink2">Sắp xếp:
              <Select value={sort} onChange={(e) => { setSort(e.target.value as SapXep); setPage(1); }} className="w-auto h-8">
                <option value="moi-nhat">Mới nhất</option>
                <option value="xem-nhieu">Xem nhiều</option>
              </Select>
            </label>
          </div>
          {shown.length === 0 ? (
            <div className="mt-6"><EmptyState title="Không có bài viết phù hợp" desc={q ? `Không tìm thấy bài nào có “${q}” trong chuyên đề này.` : "Chuyên đề này chưa có bài viết."} /></div>
          ) : (
            <div className="mt-2">{shown.map((a) => <ArticleRow key={a.id} a={a} cd={cd} />)}</div>
          )}
          <Pagination page={cur} pages={pages} onChange={setPage} />
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24">
          <div className="bg-white border border-vien rounded-sm p-5">
            <H3 className="mb-3">Tìm trong chuyên đề</H3>
            <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm theo tiêu đề bài viết" />
          </div>
          <div className="bg-white border border-vien rounded-sm p-5">
            <H3 className="mb-3">Chuyên đề</H3>
            <ul className="divide-y divide-vien2">
              {cds.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5 text-[14px]">
                  <Link href={R.F03(c.slug)} className={cx("hover:text-blue", c.id === cd.id ? "font-bold text-blue" : "text-den")}>{c.ten}{c.id === cd.id && <span className="ml-2 text-[12px] font-normal text-mut">(đang xem)</span>}</Link>
                  <span className="text-[13px] text-mut">{countOf(c.id)} bài</span>
                </li>
              ))}
            </ul>
          </div>
          {top.length > 0 && (
            <div className="bg-white border border-vien rounded-sm p-5">
              <H3 className="mb-4">Bài xem nhiều nhất</H3>
              <TopList list={top} />
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

"use client";
/**
 * F01 · Toàn Tâm Chia Sẻ — trang đích tab Thư viện (index).
 * Hero · ô tìm → S01 · chip chuyên đề → F03 · bài mới nhất (1 lớn + 3 nhỏ) · 5 khối chuyên đề (theo thứ tự store.chuyenDe, chỉ khối đang hiện) · CTA cuối.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Button, H2, Hero, MoreLink, Muted, SearchBox, cx } from "@/components/ui";
import { ArticleCard } from "@/components/thu-vien/ArticleCard";
import { chuyenDeHien, daXuatBan, phutDoc, sapXep } from "@/components/thu-vien/helpers";

export default function Page() {
  const router = useRouter();
  const { data } = useStore();
  const [q, setQ] = useState("");
  const cds = chuyenDeHien(data.chuyenDe);
  const cdIds = new Set(cds.map((c) => c.id));
  const all = sapXep(data.articles.filter((a) => daXuatBan(a) && cdIds.has(a.chuyenDeId)), "moi-nhat");
  const cdOf = (id: string) => data.chuyenDe.find((c) => c.id === id);
  const [first, ...rest] = all;
  const latest = rest.slice(0, 3);

  return (
    <>
      <Hero eyebrow="Toàn Tâm Chia Sẻ" title="Thư viện tri thức của người Toàn Tâm" desc="Không phải ai bắt đầu cũng biết mình sẽ đi bao xa. Nhưng qua từng trải nghiệm, từng giá trị tạo ra, từng cột mốc đạt được, họ tìm thấy lý do để tiếp tục — và chia sẻ lại cho những người đi sau.">
        <div className="mt-6 inline-flex items-center gap-2 text-[13px] text-ink2 bg-white border border-vien rounded-sm px-3 h-9"><span className="size-2 rounded-full bg-blue" aria-hidden />3 bài viết mới mỗi tháng</div>
      </Hero>

      <section className="wrap pt-10">
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(R.S01(q.trim())); }} className="max-w-[720px]">
          <SearchBox value={q} onChange={setQ} placeholder="Tìm kiếm bài viết theo tiêu đề hoặc chuyên đề" />
        </form>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="text-[13px] text-ink2">{all.length} bài viết</span>
          <div className="flex flex-wrap gap-2">
            <span className="h-8 px-3 inline-flex items-center rounded-sm text-[13px] font-bold bg-blue text-white">Tất cả</span>
            {cds.map((c) => (
              <Link key={c.id} href={R.F03(c.slug)} className="h-8 px-3 inline-flex items-center rounded-sm text-[13px] font-bold border border-vien text-ink2 hover:border-blue hover:text-blue">{c.ten}</Link>
            ))}
          </div>
        </div>
      </section>

      {first && (
        <section className="wrap pt-12">
          <Link href={R.F02(first.slug)} className="group grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-xam rounded-sm p-8">
            <div className="aspect-[16/10] bg-white rounded-sm overflow-hidden"><span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span></div>
            <div>
              <div className="eyebrow mb-3">{cdOf(first.chuyenDeId)?.ten}</div>
              <h2 className="font-serif font-semibold text-[30px] leading-tight text-den group-hover:text-blue">{first.tieuDe}</h2>
              <Muted className="mt-4 text-[15px] line-clamp-2">{first.sapo}</Muted>
              <div className="mt-4 text-[13px] text-mut">{phutDoc(first)} phút đọc · {fmtDate(first.ngayXuatBan)}</div>
            </div>
          </Link>
        </section>
      )}

      <section className="wrap pt-14">
        <H2>Bài viết mới nhất</H2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {latest.map((a) => <ArticleCard key={a.id} a={a} cd={cdOf(a.chuyenDeId)} />)}
        </div>
        {cds[0] && <div className="mt-8 flex justify-center"><Button kind="secondary" href={R.F03(cds[0].slug)}>Xem thêm bài viết</Button></div>}
      </section>

      {cds.map((c, i) => {
        const list = all.filter((a) => a.chuyenDeId === c.id).slice(0, 3);
        return (
          <section key={c.id} className={cx("wrap pt-16", i === cds.length - 1 && "pb-16")}>
            <div className="flex items-end justify-between gap-6 border-t border-vien2 pt-10">
              <div>
                <H2 className="uppercase tracking-wide text-[22px]">{c.ten}</H2>
                <Muted className="mt-1">{c.moTa} · {all.filter((a) => a.chuyenDeId === c.id).length} bài</Muted>
              </div>
              <MoreLink href={R.F03(c.slug)} />
            </div>
            {list.length === 0 ? (
              <Muted className="mt-6">Chuyên đề này chưa có bài viết.</Muted>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">{list.map((a) => <ArticleCard key={a.id} a={a} cd={c} />)}</div>
            )}
          </section>
        );
      })}

      <section className="bg-xam">
        <div className="wrap py-14 flex flex-wrap items-center justify-between gap-6">
          <div>
            <H2>Bạn cần một Tư vấn viên đồng hành?</H2>
            <Muted className="mt-2 text-[15px]">Đội ngũ Toàn Tâm sẵn sàng lắng nghe và hoạch định cùng bạn.</Muted>
          </div>
          <Button href={R.E01}>Tìm Tư vấn viên</Button>
        </div>
      </section>
    </>
  );
}

"use client";
/**
 * F02 · Bài viết (detail). Slug không tồn tại hoặc bài chưa xuất bản (không có ?preview=1) → 404.
 * Breadcrumb · tiêu đề · tác giả · ngày · chia sẻ (Zalo · Facebook · Sao chép liên kết) · Lưu bài · ảnh hero · thân bài markdown
 * · sidebar dính (mục lục · cùng chuyên đề → F03 · xem nhiều) · CTA Tìm Tư vấn viên → E01 · bài liên quan.
 */
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import { Breadcrumb, Button, Chip, H2, H3, Muted, MoreLink, cx, useFlash } from "@/components/ui";
import { ArticleCard, TopList } from "@/components/thu-vien/ArticleCard";
import { Markdown } from "@/components/thu-vien/Markdown";
import { daXuatBan, mucLuc, phutDoc, sapXep } from "@/components/thu-vien/helpers";

function ShareRow({ onShare, saved, onSave, loggedIn, slug }: { onShare: (k: string) => void; saved: boolean; onSave: () => void; loggedIn: boolean; slug: string }) {
  const btn = "h-9 px-3 inline-flex items-center gap-1.5 rounded-sm border border-vien text-[13px] text-den hover:border-blue hover:text-blue";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={btn} onClick={() => onShare("Zalo")}>Zalo</button>
      <button type="button" className={btn} onClick={() => onShare("Facebook")}>Facebook</button>
      <button type="button" className={btn} onClick={() => onShare("Sao chép liên kết")}>Sao chép liên kết</button>
      <span className="w-px h-6 bg-vien mx-1" aria-hidden />
      {loggedIn ? (
        <button type="button" className={cx(btn, saved && "border-blue text-blue bg-blue-soft font-bold")} onClick={onSave}>{saved ? "Đã lưu" : "Lưu bài"}</button>
      ) : (
        <Link href={`${R.G01}?next=${encodeURIComponent(R.F02(slug))}`} className={btn}>Lưu bài</Link>
      )}
    </div>
  );
}

function ArticlePage({ slug }: { slug: string }) {
  const sp = useSearchParams();
  const preview = sp.get("preview") === "1";
  const { data, ready, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const [activeH2, setActiveH2] = useState<string>("");

  const a = data.articles.find((x) => x.slug === slug);
  const visible = a && (daXuatBan(a) || preview);
  const cd = a ? data.chuyenDe.find((c) => c.id === a.chuyenDeId) : undefined;
  const thanBai = a?.thanBai ?? "";
  const toc = mucLuc(thanBai);

  useEffect(() => {
    const ids = mucLuc(thanBai).map((t) => t.id);
    if (ids.length === 0) return;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => { const e = entries.find((x) => x.isIntersecting); if (e) setActiveH2(e.target.id); }, { rootMargin: "-20% 0px -60% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [thanBai]);

  if (ready && !visible) notFound();
  if (!a || !visible) return null;

  const published = data.articles.filter(daXuatBan);
  const sameCd = sapXep(published.filter((x) => x.chuyenDeId === a.chuyenDeId && x.id !== a.id), "moi-nhat");
  const related = sameCd.slice(0, 3);
  const top = sapXep(published.filter((x) => x.id !== a.id), "xem-nhieu").slice(0, 3);
  const saved = !!tvv && data.savedItems.some((s) => s.advisorMa === tvv.ma && s.loai === "bai-viet" && s.refId === a.id);

  const share = (k: string) => {
    if (k === "Sao chép liên kết") { try { navigator.clipboard?.writeText(window.location.origin + R.F02(a.slug)); } catch {} flash("Đã sao chép liên kết bài viết"); return; }
    flash(`Đã mở chia sẻ qua ${k}`);
  };
  const toggleSave = () => {
    if (!tvv) return;
    actions.update("savedItems", (list) => saved ? list.filter((s) => !(s.advisorMa === tvv.ma && s.loai === "bai-viet" && s.refId === a.id)) : [{ id: `s${Date.now()}`, advisorMa: tvv.ma, loai: "bai-viet" as const, refId: a.id, ngay: new Date().toISOString() }, ...list]);
    flash(saved ? "Đã bỏ lưu bài viết" : "Đã lưu bài viết vào Đã lưu");
  };

  return (
    <>
      {preview && !daXuatBan(a) && (
        <div className="bg-amber-bg text-amber-fg text-[13px] font-bold text-center py-2">Bản xem trước — bài viết chưa xuất bản, chỉ người quản trị thấy trang này.</div>
      )}
      <article className="wrap pt-8 pb-16">
        <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Chia Sẻ", href: R.F01 }, { label: cd?.ten ?? "Chuyên đề", href: cd ? R.F03(cd.slug) : R.F01 }]} />
        <div className="mt-6 max-w-[900px]">
          {cd && <Link href={R.F03(cd.slug)} className="eyebrow hover:underline">{cd.ten}</Link>}
          <h1 className="mt-3 font-serif font-semibold text-[40px] leading-[1.15] text-den text-balance">{a.tieuDe}</h1>
          <Muted className="mt-5 text-[17px] leading-relaxed">{a.sapo}</Muted>
          <div className="mt-5 text-[13px] text-ink2">{a.tacGia} · {fmtDate(a.ngayXuatBan ?? a.capNhat)} · {phutDoc(a)} phút đọc</div>
          <div className="mt-4"><ShareRow onShare={share} saved={saved} onSave={toggleSave} loggedIn={!!tvv} slug={a.slug} /></div>
        </div>
        <div className="mt-8 aspect-[1312/520] bg-xam rounded-sm overflow-hidden"><span className="flex items-center justify-center w-full h-full bg-vien2 border border-[#D6D6D6] text-mut text-[13px]">Ảnh</span></div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="max-w-[760px]">
            <Markdown md={a.thanBai} />
            <div className="mt-12 bg-xam rounded-sm p-5 sm:p-8 flex flex-wrap items-center justify-between gap-6">
              <div>
                <H2 className="text-[22px]">Bạn cần một Tư vấn viên đồng hành?</H2>
                <Muted className="mt-1">Tìm người phù hợp gần bạn và trò chuyện trực tiếp.</Muted>
              </div>
              <Button href={R.E01}>Tìm Tư vấn viên</Button>
            </div>
            <div className="mt-10 pt-6 border-t border-vien2">
              <div className="text-[13px] font-bold text-den mb-3">Chia sẻ bài viết</div>
              <ShareRow onShare={share} saved={saved} onSave={toggleSave} loggedIn={!!tvv} slug={a.slug} />
            </div>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24">
            {toc.length > 0 && (
              <div className="bg-white border border-vien rounded-sm p-4 sm:p-5">
                <H3 className="mb-3">Mục lục bài viết</H3>
                <ul className="space-y-2 text-[14px]">
                  {toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className={cx("block hover:text-blue", activeH2 === t.id ? "text-blue font-bold" : "text-den")}>{t.text}</a></li>)}
                </ul>
              </div>
            )}
            {cd && (
              <div className="bg-white border border-vien rounded-sm p-4 sm:p-5">
                <H3 className="mb-3">Cùng chuyên đề</H3>
                <div className="flex items-center justify-between text-[14px] mb-3"><Link href={R.F03(cd.slug)} className="text-den font-bold hover:text-blue">{cd.ten}</Link><span className="text-[13px] text-mut">{sameCd.length + 1} bài</span></div>
                <ul className="space-y-3 text-[14px]">{sameCd.slice(0, 3).map((x) => <li key={x.id}><Link href={R.F02(x.slug)} className="text-den hover:text-blue leading-snug">{x.tieuDe}</Link></li>)}</ul>
                <div className="mt-4"><MoreLink href={R.F03(cd.slug)}>Xem tất cả trong chuyên đề</MoreLink></div>
              </div>
            )}
            <div className="bg-white border border-vien rounded-sm p-4 sm:p-5">
              <H3 className="mb-4">Bài xem nhiều nhất</H3>
              <TopList list={top} />
            </div>
          </aside>
        </div>

        <section className="mt-16 pt-10 border-t border-vien2">
          <div className="flex items-end justify-between gap-6">
            <H2>Bài liên quan</H2>
            {cd && <Chip tone="blue">{cd.ten}</Chip>}
          </div>
          {related.length === 0 ? <Muted className="mt-4">Chưa có bài liên quan trong chuyên đề này.</Muted> : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">{related.map((x) => <ArticleCard key={x.id} a={x} cd={cd} />)}</div>
          )}
        </section>
      </article>
      {node}
    </>
  );
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <Suspense fallback={null}><ArticlePage slug={slug} /></Suspense>;
}

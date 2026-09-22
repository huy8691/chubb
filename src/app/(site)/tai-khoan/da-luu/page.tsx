"use client";
/* eslint-disable react-hooks/static-components -- component trình bày cục bộ, không giữ state; đủ cho demo */
/**
 * G02 · Trang cá nhân › Đã lưu — bài viết đã lưu + Ảnh Studio của tôi.
 * (Wireframe chỉ đặc tả luồng "Lưu bài" T6 → G02; lưu tài liệu/danh thiếp không có trong wireframe → đã gỡ 21/09.)
 * Mỗi mục: Mở · Bỏ lưu. Ảnh Studio: chỉ RIÊNG TƯ (Mở · Tải ảnh · Xoá) — luồng công khai/duyệt đã bỏ 22/09; TVV tự tải & đăng.
 */
import Link from "next/link";
import { useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import type { StudioImage } from "@/lib/types";
import { Button, Card, EmptyState, FilterChips, ImageBox, Modal, useFlash } from "@/components/ui";

type Loc = "tat-ca" | "bai-viet" | "anh-studio";

export default function Page() {
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const [loc, setLoc] = useState<Loc>("tat-ca");
  const [xoa, setXoa] = useState<StudioImage | null>(null);
  if (!tvv) return null;

  const saved = data.savedItems.filter((s) => s.advisorMa === tvv.ma);
  const baiViet = saved.filter((s) => s.loai === "bai-viet").map((s) => ({ s, b: data.articles.find((a) => a.id === s.refId) })).filter((x) => x.b);
  const anh = data.studioImages.filter((a) => a.advisorMa === tvv.ma).sort((a, b) => b.tao.localeCompare(a.tao));
  const tenMau = (id: string) => data.studioTemplates.find((m) => m.id === id)?.ten ?? "Ảnh Studio";
  const boLuu = (id: string) => { actions.update("savedItems", (l) => l.filter((x) => x.id !== id)); flash("Đã bỏ lưu"); };
  const show = (k: Loc) => loc === "tat-ca" || loc === k;
  const trong = saved.length === 0 && anh.length === 0;

  const Title = ({ children }: { children: React.ReactNode }) => <h2 className="text-[16px] font-bold text-den tracking-wide uppercase mb-4">{children}</h2>;
  const Row = ({ thumb, title, sub, ngay, mo, boLuuId }: { thumb: React.ReactNode; title: string; sub: string; ngay: string; mo: React.ReactNode; boLuuId: string }) => (
    <li className="flex items-center gap-5 px-4 py-3 sm:px-5 sm:py-4 border-b border-vien2 last:border-0">
      <div className="w-[96px] shrink-0">{thumb}</div>
      <div className="flex-1 min-w-0"><div className="font-bold text-[15px] text-den line-clamp-2">{title}</div><div className="text-[12.5px] text-ink2 mt-0.5">{sub}</div></div>
      <div className="text-[12.5px] text-ink2 shrink-0 w-[120px]">Lưu ngày {fmtDate(ngay).slice(0, 5)}</div>
      <div className="flex gap-4 shrink-0 text-[13px] font-bold">{mo}<button type="button" onClick={() => boLuu(boLuuId)} className="text-ink2 hover:text-red-fg">Bỏ lưu</button></div>
    </li>
  );

  return (
    <div className="space-y-10">
      {node}
      <FilterChips<Loc> value={loc} onChange={setLoc} options={[
        { value: "tat-ca", label: "Tất cả", count: saved.length + anh.length },
        { value: "bai-viet", label: "Bài viết", count: baiViet.length },
        { value: "anh-studio", label: "Ảnh Studio của tôi", count: anh.length },
      ]} />

      {trong && <EmptyState title="Bạn chưa lưu nội dung nào" desc="Bấm dấu trang ở bài viết hoặc lưu mẫu trong Studio." action={<Button href={R.F01}>Khám phá thư viện</Button>} />}

      {show("bai-viet") && !trong && (
        <section>
          <Title>Bài viết đã lưu ({baiViet.length})</Title>
          {baiViet.length === 0 ? <EmptyState title="Chưa có bài viết nào được lưu" action={<Button kind="secondary" href={R.F01}>Khám phá thư viện</Button>} /> : (
            <Card><ul>{baiViet.map(({ s, b }) => b && (
              <Row key={s.id} thumb={<ImageBox src={b.anh} alt={b.altAnh} />} title={b.tieuDe} sub={data.chuyenDe.find((c) => c.id === b.chuyenDeId)?.ten ?? ""} ngay={s.ngay} boLuuId={s.id} mo={<Link href={R.F02(b.slug)} className="text-blue">Mở</Link>} />
            ))}</ul></Card>
          )}
        </section>
      )}

      {show("anh-studio") && !trong && (
        <section>
          <Title>Ảnh Studio của tôi ({anh.length})</Title>
          {anh.length === 0 ? <EmptyState title="Bạn chưa tạo ảnh nào trong Studio" action={<Button kind="secondary" href={R.D08}>Mở Studio</Button>} /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {anh.map((a) => (
                <Card key={a.id} className="p-3 flex flex-col gap-3">
                  <ImageBox src={a.anh} alt={tenMau(a.templateId)} ratio="3/4" />
                  <div>
                    <div className="font-bold text-[13.5px] text-den">{tenMau(a.templateId)}</div>
                    <div className="text-[11.5px] text-ink2 mt-0.5">Từ mẫu v{a.phienBanMau ?? 1} · lưu {fmtDate(a.tao).slice(0, 5)}</div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-bold mt-auto">
                    <button type="button" className="text-blue" onClick={() => flash(`Đã tải ảnh "${tenMau(a.templateId)}" về máy`)}>Tải ảnh</button>
                    <button type="button" className="text-ink2 hover:text-red-fg" onClick={() => setXoa(a)}>Xoá</button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <Modal open={!!xoa} onClose={() => setXoa(null)} title={`Xoá ảnh "${xoa ? tenMau(xoa.templateId) : ""}"?`} width={520}
        footer={<><Button kind="secondary" onClick={() => setXoa(null)}>Huỷ</Button><Button onClick={() => { if (xoa) actions.update("studioImages", (l) => l.filter((x) => x.id !== xoa.id)); setXoa(null); flash("Đã xoá ảnh"); }}>Xoá</Button></>}>
        <p className="text-[14px] text-ink2">Ảnh sẽ bị xoá khỏi Ảnh Studio của tôi. Không khôi phục được.</p>
      </Modal>
    </div>
  );
}

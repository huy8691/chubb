"use client";
/* eslint-disable react-hooks/static-components -- component trình bày cục bộ, không giữ state; đủ cho demo */
/**
 * G02 · Trang cá nhân › Đã lưu — bài viết · tài liệu · danh thiếp đã lưu + Ảnh Studio của tôi.
 * Mỗi mục: Mở · Bỏ lưu. Ảnh Studio: năm trạng thái (Riêng tư · Chờ duyệt · Đang công khai · Từ chối kèm lý do · Đã ngừng công khai); mọi thẻ Mở · Tải ảnh · Xoá (xác nhận: mất cả hai nơi);
 * Riêng tư có "Hiển thị công khai" (gửi MỘT lần), Đang công khai có "Ngừng hiển thị công khai" (ảnh giữ lại, không gửi lại). 09/09: khớp wireframe G02.
 */
import Link from "next/link";
import { useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { fmtDate } from "@/lib/seed";
import type { StudioImage } from "@/lib/types";
import { Button, Card, EmptyState, FilterChips, ImageBox, Modal, StatusChip, useFlash } from "@/components/ui";

type Loc = "tat-ca" | "bai-viet" | "tai-lieu" | "danh-thiep" | "anh-studio";

export default function Page() {
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const [loc, setLoc] = useState<Loc>("tat-ca");
  const [xoa, setXoa] = useState<StudioImage | null>(null);
  if (!tvv) return null;

  const saved = data.savedItems.filter((s) => s.advisorMa === tvv.ma);
  const baiViet = saved.filter((s) => s.loai === "bai-viet").map((s) => ({ s, b: data.articles.find((a) => a.id === s.refId) })).filter((x) => x.b);
  const taiLieu = saved.filter((s) => s.loai === "tai-lieu").map((s) => ({ s, t: data.documents.find((a) => a.id === s.refId) })).filter((x) => x.t);
  const danhThiep = saved.filter((s) => s.loai === "danh-thiep").map((s) => ({ s, a: data.advisors.find((a) => a.ma === s.refId) })).filter((x) => x.a);
  const anh = data.studioImages.filter((a) => a.advisorMa === tvv.ma).sort((a, b) => b.tao.localeCompare(a.tao));
  const tenMau = (id: string) => data.studioTemplates.find((m) => m.id === id)?.ten ?? "Ảnh Studio";
  const boLuu = (id: string) => { actions.update("savedItems", (l) => l.filter((x) => x.id !== id)); flash("Đã bỏ lưu"); };
  const show = (k: Loc) => loc === "tat-ca" || loc === k;
  const trong = saved.length === 0 && anh.length === 0;

  const Title = ({ children }: { children: React.ReactNode }) => <h2 className="text-[16px] font-bold text-den tracking-wide uppercase mb-4">{children}</h2>;
  const Row = ({ thumb, title, sub, ngay, mo, boLuuId }: { thumb: React.ReactNode; title: string; sub: string; ngay: string; mo: React.ReactNode; boLuuId: string }) => (
    <li className="flex items-center gap-5 px-5 py-4 border-b border-vien2 last:border-0">
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
        { value: "tai-lieu", label: "Tài liệu", count: taiLieu.length },
        { value: "danh-thiep", label: "Danh thiếp", count: danhThiep.length },
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

      {show("tai-lieu") && !trong && (
        <section>
          <Title>Tài liệu đã lưu ({taiLieu.length})</Title>
          {taiLieu.length === 0 ? <EmptyState title="Chưa có tài liệu nào được lưu" action={<Button kind="secondary" href={R.G10}>Xem Tài liệu</Button>} /> : (
            <Card><ul>{taiLieu.map(({ s, t }) => t && (
              <Row key={s.id} thumb={<div className="h-[54px] rounded-sm bg-xam flex items-center justify-center text-[12px] font-bold text-ink2">{t.dinhDang}</div>} title={t.ten} sub={`${data.docTypes.find((d) => d.id === t.loaiId)?.ten ?? ""} · ${t.kichCo} · ${t.phienBan}`} ngay={s.ngay} boLuuId={s.id} mo={<button type="button" onClick={() => flash(`Đã mở "${t.ten}"`)} className="text-blue">Mở</button>} />
            ))}</ul></Card>
          )}
        </section>
      )}

      {show("danh-thiep") && !trong && (
        <section>
          <Title>Danh thiếp đã lưu ({danhThiep.length})</Title>
          {danhThiep.length === 0 ? <EmptyState title="Chưa có danh thiếp nào được lưu" action={<Button kind="secondary" href={R.E01}>Tìm Tư vấn viên</Button>} /> : (
            <Card><ul>{danhThiep.map(({ s, a }) => a && (
              <Row key={s.id} thumb={<div className="h-[54px] rounded-sm bg-blue-soft text-blue font-bold flex items-center justify-center">{a.hoTen.split(" ").slice(-2).map((x) => x[0]).join("")}</div>} title={a.hoTen} sub={`Mã ${a.ma} · ${a.chucDanh} · ${a.vanPhong}`} ngay={s.ngay} boLuuId={s.id} mo={<Link href={R.E03(a.ma)} className="text-blue">Mở</Link>} />
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
                  <div className="relative"><ImageBox src={a.anh} alt={tenMau(a.templateId)} ratio="3/4" /><span className="absolute top-2 left-2"><StatusChip s={a.trangThai} /></span></div>
                  <div>
                    <div className="font-bold text-[13.5px] text-den">{tenMau(a.templateId)}</div>
                    <div className="text-[11.5px] text-ink2 mt-0.5">Từ mẫu v{a.phienBanMau ?? 1} · lưu {fmtDate(a.tao).slice(0, 5)}</div>
                    {a.trangThai === "bi-tu-choi" && a.lyDoTuChoi && <div className="mt-2 text-[12.5px] text-red-fg bg-red-bg rounded-sm px-2.5 py-1.5">Lý do từ chối: {a.lyDoTuChoi}</div>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-bold mt-auto">
                    <Link href={`${R.D02}?mau=${a.templateId}`} className="text-blue">Mở</Link>
                    <button type="button" className="text-blue" onClick={() => flash(`Đã tải ảnh "${tenMau(a.templateId)}" về máy`)}>Tải ảnh</button>
                    <button type="button" className="text-ink2 hover:text-red-fg" onClick={() => setXoa(a)}>Xoá</button>
                    {a.trangThai === "rieng-tu" && <button type="button" className="text-blue basis-full text-left" onClick={() => { actions.update("studioImages", (l) => l.map((x) => x.id === a.id ? { ...x, trangThai: "cho-duyet", dongYCongKhai: true } : x)); flash("Đã gửi Chubb duyệt — ảnh hiển thị công khai sau khi duyệt"); }}>Hiển thị công khai</button>}
                    {a.trangThai === "da-duyet" && <button type="button" className="text-blue basis-full text-left" onClick={() => { actions.update("studioImages", (l) => l.map((x) => x.id === a.id ? { ...x, trangThai: "da-ngung" } : x)); flash("Đã ngừng hiển thị công khai — ảnh vẫn còn trong Ảnh Studio của tôi"); }}>Ngừng hiển thị công khai</button>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <Modal open={!!xoa} onClose={() => setXoa(null)} title={`Xoá ảnh "${xoa ? tenMau(xoa.templateId) : ""}"?`} width={520}
        footer={<><Button kind="secondary" onClick={() => setXoa(null)}>Huỷ</Button><Button onClick={() => { if (xoa) actions.update("studioImages", (l) => l.filter((x) => x.id !== xoa.id)); setXoa(null); flash("Đã xoá ảnh"); }}>Xoá</Button></>}>
        <p className="text-[14px] text-ink2">Ảnh sẽ bị xoá khỏi Ảnh Studio của tôi. Nếu ảnh đang hiển thị công khai, ảnh cũng bị gỡ khỏi Ảnh thực tế từ Tư vấn viên. Không khôi phục được.</p>
      </Modal>
    </div>
  );
}

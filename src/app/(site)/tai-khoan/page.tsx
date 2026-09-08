"use client";
/**
 * G02a · Trang cá nhân › Tổng quan — số liệu · việc cần làm · lối tắt · hoạt động gần đây · danh hiệu & vinh danh.
 * Khối Danh hiệu & vinh danh là nơi TVV bấm Đồng ý công khai / Không công khai (H03b · C01 cập nhật theo).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { fmtDate, thangLabel } from "@/lib/seed";
import type { DanhHieu } from "@/lib/types";
import { Button, Card, Chip, H2, Muted, Stat, useFlash } from "@/components/ui";

export default function Page() {
  const router = useRouter();
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const [moRong, setMoRong] = useState(false);
  if (!tvv) return null;

  const anhStudio = data.studioImages.filter((a) => a.advisorMa === tvv.ma);
  const choDuyet = anhStudio.filter((a) => a.trangThai === "cho-duyet").length;
  const tuChoi = anhStudio.filter((a) => a.trangThai === "bi-tu-choi");
  const daLuu = data.savedItems.filter((s) => s.advisorMa === tvv.ma);
  const baiDaLuu = daLuu.filter((s) => s.loai === "bai-viet").length;

  /* Việc cần làm */
  const viec: { text: string; href?: string; onClick?: () => void; nut: string }[] = [];
  tuChoi.forEach((a) => {
    const mau = data.studioTemplates.find((m) => m.id === a.templateId)?.ten ?? "Ảnh Studio";
    viec.push({ text: `Ảnh "${mau}" bị từ chối — xem lý do`, href: R.G02, nut: "Xem" });
  });
  if (!tvv.avatar) viec.push({ text: "Danh thiếp chưa có ảnh chân dung", href: R.E04, nut: "Sửa" });
  if (!tvv.hoSoNangLuc) viec.push({ text: "Hồ sơ năng lực chưa điền — khách chỉ thấy thông tin liên hệ", href: R.E04, nut: "Điền" });
  tvv.danhHieu.filter((d) => d.congKhai === "cho-dong-y").forEach((d) => {
    viec.push({ text: `Chubb xin đồng ý công khai thành tích ${d.ten} của bạn`, onClick: () => document.getElementById("danh-hieu")?.scrollIntoView({ behavior: "smooth", block: "start" }), nut: "Xem" });
  });

  /* Hoạt động gần đây: thông báo + mục đã lưu */
  const hoatDong = (() => {
    const rows: { ngay: string; text: string; href?: string }[] = [];
    data.notifications.filter((n) => n.advisorMa === tvv.ma).forEach((n) => rows.push({ ngay: n.ngay, text: n.noiDung, href: n.href }));
    daLuu.forEach((s) => {
      if (s.loai === "bai-viet") { const b = data.articles.find((a) => a.id === s.refId); if (b) rows.push({ ngay: s.ngay, text: `Bạn đã lưu bài "${b.tieuDe}"`, href: R.F02(b.slug) }); }
      if (s.loai === "tai-lieu") { const t = data.documents.find((a) => a.id === s.refId); if (t) rows.push({ ngay: s.ngay, text: `Bạn đã lưu tài liệu "${t.ten}"`, href: R.G10 }); }
      if (s.loai === "danh-thiep") { const a = data.advisors.find((x) => x.ma === s.refId); if (a) rows.push({ ngay: s.ngay, text: `Bạn đã lưu danh thiếp của ${a.hoTen}`, href: R.E03(a.ma) }); }
    });
    anhStudio.filter((a) => a.trangThai === "cho-duyet" || a.trangThai === "da-duyet").forEach((a) => {
      const mau = data.studioTemplates.find((m) => m.id === a.templateId)?.ten ?? "Ảnh Studio";
      rows.push({ ngay: a.tao, text: a.trangThai === "cho-duyet" ? `Bạn đã gửi ảnh "${mau}" vào Bộ sưu tập Studio` : `Chubb đã duyệt ảnh "${mau}"`, href: R.G02 });
    });
    return rows.sort((a, b) => b.ngay.localeCompare(a.ngay));
  })();
  const hienHoatDong = moRong ? hoatDong : hoatDong.slice(0, 4);

  /* Danh hiệu & vinh danh */
  const soNguoi = (d: DanhHieu) => data.honorMonths.find((m) => m.id === d.thangId)?.hangMuc.find((h) => h.hangMucId === d.hangMucId)?.nguoiDat.length ?? 0;
  const tenHangMuc = (id: string) => data.hangMuc.find((h) => h.id === id)?.ten ?? id;
  const thangCua = (d: DanhHieu) => { const m = data.honorMonths.find((x) => x.id === d.thangId); return m ? thangLabel(m) : d.thangId; };
  const doiCongKhai = (d: DanhHieu, dongY: boolean) => {
    actions.update("advisors", (list) => list.map((a) => a.ma !== tvv.ma ? a : { ...a, danhHieu: a.danhHieu.map((x) => x.id === d.id ? { ...x, congKhai: dongY ? "da-cong-khai" : "khong-cong-khai" } : x) }));
    actions.update("honorMonths", (list) => list.map((m) => m.id !== d.thangId ? m : { ...m, hangMuc: m.hangMuc.map((h) => h.hangMucId !== d.hangMucId ? h : { ...h, nguoiDat: h.nguoiDat.map((p) => p.advisorMa === tvv.ma ? { ...p, dongYCongKhai: dongY ? "dong-y" : "khong" } : p) }) }));
    flash(dongY ? `Đã đồng ý công khai ${d.ten} — tên bạn sẽ hiện trên trang Vinh danh` : `Đã ghi nhận: không công khai ${d.ten}`);
  };

  return (
    <div className="space-y-10">
      {node}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat value={tvv.luotXemThangNay ?? 0} label="lượt xem danh thiếp tháng này" href={R.E04} />
        <div className="bg-white border border-vien rounded-sm p-5">
          <div className="font-serif font-semibold text-[34px] text-blue leading-none">{data.ranking.find((r) => r.advisorMa === tvv.ma)?.luotDuocTinh ?? tvv.luotChiaSeThangNay}</div>
          <div className="mt-2 text-[14px] text-ink2">lượt chia sẻ được tính tháng này · <Link href={R.S03} className="text-blue font-bold hover:underline">Cách đếm</Link></div>
        </div>
        <Stat value={anhStudio.length} label={`Ảnh Studio · ${choDuyet} chờ duyệt · ${tuChoi.length} từ chối`} href={R.G02} />
        <Stat value={baiDaLuu} label="bài viết đã lưu" href={R.G02} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_620px] gap-8">
        <section>
          <H2 className="mb-4">Việc cần làm</H2>
          <Card>
            {viec.length === 0 ? <div className="px-5 py-6 text-[14px] text-ink2">Không có việc nào cần làm — mọi thứ đã xong.</div> : (
              <ul>
                {viec.map((v, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 px-5 py-4 border-b border-vien2 last:border-0 text-[14px] text-den">
                    <span>{v.text}</span>
                    {v.href ? <Link href={v.href} className="text-blue font-bold text-[13px] shrink-0">{v.nut}</Link> : <button type="button" onClick={v.onClick} className="text-blue font-bold text-[13px] shrink-0">{v.nut}</button>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
        <section>
          <H2 className="mb-4">Lối tắt</H2>
          <div className="grid grid-cols-2 gap-3">
            <Button kind="secondary" href={R.E04}>Sửa danh thiếp</Button>
            <Button kind="secondary" href={R.D02}>Studio của tôi</Button>
            <Button kind="secondary" href={R.G02}>Đã lưu</Button>
            <Button kind="secondary" href={R.G06}>Tài khoản & cài đặt</Button>
            <Button kind="secondary" href={R.G10}>Tài liệu</Button>
            <Button kind="secondary" onClick={() => { actions.logout(); router.push(R.A01); }}>Đăng xuất</Button>
          </div>
        </section>
      </div>

      <section>
        <H2 className="mb-4">Hoạt động gần đây</H2>
        {hoatDong.length === 0 ? <Muted>Chưa có hoạt động nào.</Muted> : (
          <ul className="divide-y divide-vien2">
            {hienHoatDong.map((h, i) => (
              <li key={i} className="flex gap-6 py-3 text-[14px]">
                <span className="w-[96px] shrink-0 text-[13px] text-mut">{fmtDate(h.ngay)}</span>
                {h.href ? <Link href={h.href} className="text-den hover:text-blue">{h.text}</Link> : <span className="text-den">{h.text}</span>}
              </li>
            ))}
          </ul>
        )}
        {hoatDong.length > 4 && <button type="button" onClick={() => setMoRong(!moRong)} className="mt-3 text-[13px] font-bold text-blue">{moRong ? "Thu gọn" : "Xem thêm hoạt động trước"}</button>}
      </section>

      <section id="danh-hieu" className="scroll-mt-24">
        <div className="flex items-end justify-between gap-4 mb-4">
          <H2>Danh hiệu & vinh danh</H2>
          <Link href={R.C01} className="text-[14px] font-bold text-blue hover:underline">Xem trang Vinh danh công khai</Link>
        </div>
        <Card>
          {tvv.danhHieu.length === 0 ? <div className="px-5 py-6 text-[14px] text-ink2">Bạn chưa có danh hiệu nào được Chubb ghi nhận.</div> : (
            <ul>
              {tvv.danhHieu.map((d) => {
                const cho = d.congKhai === "cho-dong-y";
                return (
                  <li key={d.id} className="flex items-center gap-4 px-5 py-4 border-b border-vien2 last:border-0">
                    <div className="size-12 shrink-0 rounded-sm bg-blue-soft text-blue font-bold flex items-center justify-center text-[11px]" aria-label="Huy hiệu">{tenHangMuc(d.hangMucId).split(" ").map((s) => s[0]).join("").slice(0, 3)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[15px] text-den">{cho ? `${tenHangMuc(d.hangMucId)} — ${thangCua(d)}` : d.ten}</div>
                      <div className="text-[13px] text-ink2 mt-0.5">
                        {cho ? `Chubb đề nghị công khai bạn trong hạng mục ${tenHangMuc(d.hangMucId)} · thứ ${d.thuHang} trong ${soNguoi(d)} người` : `Vinh danh ${thangCua(d)} · hạng mục ${tenHangMuc(d.hangMucId)} · thứ ${d.thuHang} trong ${soNguoi(d)} người`}
                      </div>
                    </div>
                    <div className="shrink-0 w-[150px]">
                      {d.congKhai === "da-cong-khai" && <Chip tone="green">ĐÃ CÔNG KHAI</Chip>}
                      {cho && <Chip tone="amber">CHỜ BẠN ĐỒNG Ý</Chip>}
                      {d.congKhai === "khong-cong-khai" && <Chip tone="grey">KHÔNG CÔNG KHAI</Chip>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {d.congKhai === "da-cong-khai" && <Button kind="secondary" size="sm" onClick={() => flash(`Đã sao chép link chia sẻ danh hiệu ${d.ten}`)}>Chia sẻ</Button>}
                      {cho && <><Button size="sm" onClick={() => doiCongKhai(d, true)}>Đồng ý công khai</Button><Button kind="secondary" size="sm" onClick={() => doiCongKhai(d, false)}>Không công khai</Button></>}
                      {d.congKhai === "khong-cong-khai" && <Button kind="ghost" size="sm" onClick={() => doiCongKhai(d, true)}>Đồng ý công khai</Button>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}

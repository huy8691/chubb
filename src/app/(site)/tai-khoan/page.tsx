"use client";
/**
 * G02a · Trang cá nhân › Tổng quan — số liệu · việc cần làm · danh hiệu & vinh danh · lời chúc.
 * (10/09: bỏ "Lối tắt" và "Hoạt động gần đây" — trùng dải tab / tab Đã lưu / Studio / chuông G07.)
 * Khối Danh hiệu & vinh danh: danh hiệu admin đã công bố (09/09: không còn bước TVV đồng ý) + Chia sẻ.
 */
import Link from "next/link";
import { useState } from "react";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import { fmtDateTime, thangLabel } from "@/lib/seed";
import type { DanhHieu } from "@/lib/types";
import { Button, Card, H2, Stat, useFlash } from "@/components/ui";

export default function Page() {
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const [moRongLC, setMoRongLC] = useState(false);
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
  const blCho = data.binhLuan.filter((b) => b.advisorMa === tvv.ma && b.trangThai === "cho-duyet").length;
  if (blCho) viec.push({ text: `${blCho} bình luận mới trên danh thiếp — xem & duyệt`, href: R.G12, nut: "Xem" });

  /* Lời chúc từ đồng nghiệp (09/09): mặc định 3 mới nhất, "Xem tất cả" bung tại chỗ (10/09); người nhận có thể Ẩn từng dòng */
  const loiChuc = data.loiChuc.filter((l) => l.nguoiNhanMa === tvv.ma && l.trangThai === "hien").sort((a, b) => b.ngay.localeCompare(a.ngay));
  const anLoiChuc = (id: string) => { actions.update("loiChuc", (ls) => ls.map((l) => l.id === id ? { ...l, trangThai: "da-an", lyDoCo: "Người nhận ẩn" } : l)); flash("Đã ẩn lời chúc này"); };
  const tenGui = (ma: string) => { const a = data.advisors.find((x) => x.ma === ma); return a ? `${a.hoTen} — ${a.vanPhong.replace(/ — .*$/, "")}` : ma; };

  /* Danh hiệu & vinh danh */
  const soNguoi = (d: DanhHieu) => data.honorMonths.find((m) => m.id === d.thangId)?.hangMuc.find((h) => h.hangMucId === d.hangMucId)?.nguoiDat.length ?? 0;
  const tenHangMuc = (id: string) => data.hangMuc.find((h) => h.id === id)?.ten ?? id;
  const thangCua = (d: DanhHieu) => { const m = data.honorMonths.find((x) => x.id === d.thangId); return m ? thangLabel(m) : d.thangId; };

  return (
    <div className="space-y-10">
      {node}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat value={tvv.luotXemThangNay ?? 0} label="lượt xem danh thiếp tháng này" href={R.E04} />
        <div className="bg-white border border-vien rounded-sm p-4 sm:p-5">
          <div className="font-serif font-semibold text-[34px] text-blue leading-none">{data.ranking.find((r) => r.advisorMa === tvv.ma)?.luotDuocTinh ?? tvv.luotChiaSeThangNay}</div>
          <div className="mt-2 text-[14px] text-ink2">lượt chia sẻ được tính tháng này · <Link href={R.S03} className="text-blue font-bold hover:underline">Cách đếm</Link></div>
        </div>
        <Stat value={anhStudio.length} label={`Ảnh Studio · ${choDuyet} chờ duyệt · ${tuChoi.length} từ chối`} href={R.G02} />
        <Stat value={baiDaLuu} label="bài viết đã lưu" href={R.G02} />
      </div>

      <section>
        <H2 className="mb-4">Việc cần làm</H2>
        <Card>
          {viec.length === 0 ? <div className="px-5 py-6 text-[14px] text-ink2">Không có việc nào cần làm — mọi thứ đã xong.</div> : (
            <ul>
              {viec.map((v, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4 border-b border-vien2 last:border-0 text-[14px] text-den">
                  <span>{v.text}</span>
                  {v.href ? <Link href={v.href} className="text-blue font-bold text-[13px] shrink-0">{v.nut}</Link> : <button type="button" onClick={v.onClick} className="text-blue font-bold text-[13px] shrink-0">{v.nut}</button>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section id="danh-hieu" className="scroll-mt-24">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4 mb-4">
          <H2>Danh hiệu & vinh danh</H2>
          <Link href={R.C01} className="text-[14px] font-bold text-blue hover:underline shrink-0">Xem trang Vinh danh công khai</Link>
        </div>
        <Card>
          {tvv.danhHieu.length === 0 ? <div className="px-5 py-6 text-[14px] text-ink2">Bạn chưa có danh hiệu nào được Chubb ghi nhận.</div> : (
            <ul>
              {tvv.danhHieu.map((d) => {
                return (
                  <li key={d.id} className="flex items-center gap-4 px-4 py-3 sm:px-5 sm:py-4 border-b border-vien2 last:border-0">
                    <div className="size-12 shrink-0 rounded-sm bg-blue-soft text-blue font-bold flex items-center justify-center text-[11px]" aria-label="Huy hiệu">{tenHangMuc(d.hangMucId).split(" ").map((s) => s[0]).join("").slice(0, 3)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[15px] text-den">{d.ten}</div>
                      <div className="text-[13px] text-ink2 mt-0.5">Bảng vinh danh {thangCua(d)} · {tenHangMuc(d.hangMucId)} · thứ {d.thuHang} trong {soNguoi(d)} người</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button kind="secondary" size="sm" onClick={() => flash(`Đã sao chép link chia sẻ danh hiệu ${d.ten}`)}>Chia sẻ</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <H2 className="mb-4">Lời chúc từ đồng nghiệp</H2>
        <Card>
          {loiChuc.length === 0 ? <div className="px-5 py-6 text-[14px] text-ink2">Chưa có lời chúc nào.</div> : (
            <ul>
              {(moRongLC ? loiChuc : loiChuc.slice(0, 3)).map((l) => (
                <li key={l.id} className="flex items-start gap-4 px-4 py-3 sm:px-5 sm:py-4 border-b border-vien2 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-3"><span className="font-bold text-[15px] text-den">{tenGui(l.nguoiGuiMa)}</span><span className="text-[12.5px] text-mut">{fmtDateTime(l.ngay)}</span></div>
                    <p className="text-[13.5px] text-ink2 mt-1">{l.noiDung}</p>
                  </div>
                  <Button kind="secondary" size="sm" onClick={() => anLoiChuc(l.id)}>Ẩn</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        {loiChuc.length > 3 && <button type="button" onClick={() => setMoRongLC(!moRongLC)} className="mt-3 text-[13px] font-bold text-blue">{moRongLC ? "Thu gọn" : `Xem tất cả lời chúc (${loiChuc.length})`}</button>}
      </section>
    </div>
  );
}

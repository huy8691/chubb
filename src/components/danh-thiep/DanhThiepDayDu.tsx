"use client";
/**
 * E03 · Danh thiếp — hồ sơ đầy đủ (/{ma}). Kèm E07 · trạng thái "không xem được" khi mã sai,
 * Tư vấn viên đã gỡ hoặc đang tạm ẩn thẻ. Mở từ QR thẻ giấy, E01/E06 "Xem đầy đủ", H11a, S01.
 */
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, Button, Chip, H1, H2, Muted, useFlash } from "@/components/ui";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import type { Advisor } from "@/lib/types";
import { StudioPreview } from "@/components/cong-cu/StudioPreview";
import { QrBox } from "./QrBox";
import { SharePopup, useChiaSe } from "./SharePopup";
import { danhHieuCongKhai, fmtPhone, linkDanhThiep, taiVCard, theXemDuoc } from "./lib";

export function DanhThiepDayDu({ ma }: { ma: string }) {
  const { data, ready } = useStore();
  const a = data.advisors.find((x) => x.ma === ma);
  if (!ready) return <div className="wrap py-14 sm:py-24 text-mut">Đang mở danh thiếp…</div>;
  if (!theXemDuoc(a)) return <KhongXemDuoc />;
  return <TheDayDu a={a} />;
}

/** E07 · Danh thiếp không tồn tại hoặc đã tạm ẩn (trạng thái của E03) */
export function KhongXemDuoc() {
  return (
    <div className="wrap py-16 sm:py-28 max-w-[1000px] mx-auto text-center">
      <H1 className="text-[34px]">Danh thiếp này hiện không xem được</H1>
      <Muted className="mt-5 text-[16px] max-w-[760px] mx-auto">Có thể mã Tư vấn viên không đúng, hoặc Tư vấn viên đang tạm ẩn danh thiếp. Bạn vẫn có thể tìm Tư vấn viên khác hoặc gọi hotline.</Muted>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Button href={R.E01}>Tìm Tư vấn viên</Button>
        <Button href={R.A01} kind="secondary">Về trang chủ</Button>
      </div>
      <p className="mt-6 text-[12.5px] text-ink2">Hotline 1800 xxxx</p>
    </div>
  );
}

function TheDayDu({ a }: { a: Advisor }) {
  const sp = useSearchParams();
  const ref = sp.get("ref");
  const { data, actions } = useStore();
  const tvv = useCurrentAdvisor();
  const { flash, node } = useFlash();
  const { chiaSe, flashNode } = useChiaSe(a);
  const [shareOpen, setShareOpen] = useState(false);
  const daDem = useRef(false);

  // Người nhận mở thẻ từ link chia sẻ (?ref=zalo|fb|copy|qr) → ghi "lượt mở từ link" một lần để đối soát
  useEffect(() => {
    if (!ref || daDem.current) return;
    daDem.current = true;
    actions.update("ranking", (rows) => rows.map((r) => (r.advisorMa === a.ma ? { ...r, moTuLink: r.moTuLink + 1 } : r)));
  }, [ref, a.ma, actions]);

  const dh = danhHieuCongKhai(a);
  const hs = a.hoSoNangLuc;
  const mauProfile = a.mauProfile ? data.profileTemplates.find((t) => t.id === a.mauProfile) : undefined;
  const zaloHref = `https://zalo.me/${a.zalo ?? a.soDienThoai}`;
  const btnA = "inline-flex items-center justify-center h-11 px-5 rounded-sm font-bold text-[14px] whitespace-nowrap";

  return (
    <>
      {/* Thẻ chính */}
      <section className="bg-xam">
        <div className="wrap py-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
          <div className="flex items-center gap-5 sm:gap-8 min-w-0 flex-1">
            {mauProfile ? (
              <div className="w-[220px] sm:w-[280px] shrink-0 border border-vien rounded-sm overflow-hidden bg-white shadow-sm"><StudioPreview template={mauProfile} portrait={a.avatar} zoom={a.avatarZoom} offsetX={a.avatarX} offsetY={a.avatarY} hoTen={a.hoTen} chucDanh={a.chucDanh} soDienThoai={a.soDienThoai} /></div>
            ) : (
              <Avatar name={a.hoTen} size={160} src={a.avatar} />
            )}
            <div className="min-w-0">
              <h1 className="font-serif font-semibold text-[24px] leading-tight text-den uppercase">{a.hoTen}</h1>
              <p className="text-[14px] text-ink2 mt-2">{[a.chucDanh, ...dh, `Mã ${a.ma}`].join(" · ")}</p>
              {hs?.vaiTro && <p className="text-[14px] font-bold text-blue mt-2">{hs.vaiTro}</p>}
              <p className="text-[12.5px] text-mut mt-2">Danh thiếp thật của Chubb Life Việt Nam — mã {a.ma}</p>
            </div>
          </div>
          <div className="flex flex-row flex-wrap sm:flex-col sm:items-end gap-3 sm:gap-2 shrink-0">
            <a href={zaloHref} target="_blank" rel="noopener" className={`${btnA} bg-blue text-white border border-blue hover:bg-blue2`}>Kết nối Zalo</a>
            {tvv && tvv.ma === a.ma && <Button kind="ghost" size="sm" href={R.E04}>Sửa danh thiếp của tôi</Button>}
          </div>
        </div>
      </section>

      <div className="wrap py-12 space-y-14">
        {hs && (
          <section>
            <H2 className="text-[22px]">Hồ sơ năng lực</H2>
            {hs.noiBat && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                {hs.noiBat.map((t) => <div key={t} className="bg-white border border-vien rounded-sm px-5 py-5 font-bold text-[17px] text-den">{t}</div>)}
              </div>
            )}
            <p className="mt-6 text-[15px] text-den leading-relaxed max-w-[1100px]">{hs.gioiThieu}</p>
          </section>
        )}

        {hs && hs.theManh.length > 0 && (
          <section>
            <H2 className="text-[22px]">Lĩnh vực chuyên môn</H2>
            <div className="mt-5 flex flex-wrap gap-3">{hs.theManh.map((t) => <Chip key={t} tone="blue" className="h-9 px-4 text-[14px] font-normal">{t}</Chip>)}</div>
          </section>
        )}

        {hs && hs.chungChi.length > 0 && (
          <section>
            <H2 className="text-[22px]">Chứng chỉ &amp; bằng cấp</H2>
            <div className="mt-5 flex flex-wrap gap-3">{hs.chungChi.map((c) => <Chip key={c} tone="grey" className="h-9 px-4 text-[14px] font-normal">{c}</Chip>)}</div>
          </section>
        )}

        {hs?.hanhTrinh && hs.hanhTrinh.length > 0 && (
          <section>
            <H2 className="text-[22px]">Hành trình nghề nghiệp</H2>
            <p className="mt-4 font-bold text-[17px] text-den">Hành trình {hs.noiBat?.[0] ?? ""} — từ những ngày đầu đến hôm nay</p>
            <ol className="mt-6 border-l-2 border-blue pl-10 space-y-8">
              {hs.hanhTrinh.map((m) => (
                <li key={m.nam} className="relative">
                  <span className="absolute -left-[49px] top-1 size-4 rounded-full bg-blue border-4 border-white" />
                  <div className="font-bold text-[16px] text-den">{m.nam} · {m.tieuDe}</div>
                  <p className="text-[14px] text-ink2 mt-1 max-w-[1100px]">{m.moTa}</p>
                </li>
              ))}
            </ol>
          </section>
        )}


        {/* CTA kết nối + chia sẻ */}
        <section className="bg-xam rounded-sm p-5 sm:p-8 flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1">
            <h2 className="font-serif font-semibold text-[26px] leading-tight text-den">Kết nối ngay với {a.hoTen}</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={zaloHref} target="_blank" rel="noopener" className={`${btnA} bg-blue text-white border border-blue hover:bg-blue2`}>Kết nối Zalo</a>
              <a href={`tel:${a.soDienThoai}`} className={`${btnA} bg-white text-blue border border-blue hover:bg-blue-soft`} onClick={() => flash("Đang gọi " + fmtPhone(a.soDienThoai))}>Gọi điện</a>
              <Button kind="secondary" onClick={() => { taiVCard(a); flash("Đã tải vCard về máy"); }}>Lưu danh bạ (vCard)</Button>
              <Button kind="secondary" onClick={() => setShareOpen(true)}>Chia sẻ</Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="font-bold text-[13px] text-den mr-2">Chia sẻ hồ sơ này:</span>
              <Button kind="ghost" size="sm" onClick={() => chiaSe("Zalo")}>Zalo</Button>
              <Button kind="ghost" size="sm" onClick={() => chiaSe("Facebook")}>Facebook</Button>
              <Button kind="ghost" size="sm" onClick={() => chiaSe("Sao chép link")}>Sao chép liên kết</Button>
              <Button kind="ghost" size="sm" onClick={() => chiaSe("Tải ảnh")}>Tải ảnh thẻ (PNG)</Button>
            </div>
          </div>
          <QrBox value={linkDanhThiep(a.ma, "qr")} size={140} caption="Quét để mở danh thiếp này" />
        </section>
      </div>

      <SharePopup a={a} open={shareOpen} onClose={() => setShareOpen(false)} />
      {flashNode}{node}
    </>
  );
}

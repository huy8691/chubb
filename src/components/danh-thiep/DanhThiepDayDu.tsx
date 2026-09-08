"use client";
/**
 * E03 · Danh thiếp — hồ sơ đầy đủ (/{ma}). Kèm E07 · trạng thái "không xem được" khi mã sai,
 * Tư vấn viên đã gỡ hoặc đang tạm ẩn thẻ. Mở từ QR thẻ giấy, E01/E06 "Xem đầy đủ", H11a, S01.
 */
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, Button, Chip, H1, H2, ImageBox, Muted, useFlash } from "@/components/ui";
import { R } from "@/lib/routes";
import { useCurrentAdvisor, useStore } from "@/lib/store";
import type { Advisor } from "@/lib/types";
import { QrBox } from "./QrBox";
import { SharePopup, useChiaSe } from "./SharePopup";
import { danhHieuCongKhai, fmtPhone, linkDanhThiep, taiVCard, theXemDuoc } from "./lib";

const ANH_KHACH = ["/img/p-nu-1.jpg", "/img/p-nam-2.jpg", "/img/p-nu-2.jpg"];

export function DanhThiepDayDu({ ma }: { ma: string }) {
  const { data, ready } = useStore();
  const a = data.advisors.find((x) => x.ma === ma);
  if (!ready) return <div className="wrap py-24 text-mut">Đang mở danh thiếp…</div>;
  if (!theXemDuoc(a)) return <KhongXemDuoc />;
  return <TheDayDu a={a} />;
}

/** E07 · Danh thiếp không tồn tại hoặc đã tạm ẩn (trạng thái của E03) */
export function KhongXemDuoc() {
  return (
    <div className="wrap py-28 max-w-[1000px] mx-auto text-center">
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
  const daLuu = !!tvv && data.savedItems.some((s) => s.advisorMa === tvv.ma && s.loai === "danh-thiep" && s.refId === a.ma);
  const toggleLuu = () => {
    if (!tvv) return;
    actions.update("savedItems", (list) => daLuu
      ? list.filter((s) => !(s.advisorMa === tvv.ma && s.loai === "danh-thiep" && s.refId === a.ma))
      : [...list, { id: `s${Date.now()}`, advisorMa: tvv.ma, loai: "danh-thiep", refId: a.ma, ngay: new Date().toISOString() }]);
    flash(daLuu ? "Đã bỏ lưu danh thiếp" : "Đã lưu danh thiếp vào Đã lưu");
  };
  const zaloHref = `https://zalo.me/${a.zalo ?? a.soDienThoai}`;
  const btnA = "inline-flex items-center justify-center h-11 px-5 rounded-sm font-bold text-[14px] whitespace-nowrap";

  return (
    <>
      {/* Thẻ chính */}
      <section className="bg-xam">
        <div className="wrap py-10 flex items-center gap-8">
          <Avatar name={a.hoTen} size={120} src={a.avatar} />
          <div className="flex-1 min-w-0">
            <h1 className="font-serif font-semibold text-[24px] leading-tight text-den uppercase">{a.hoTen}</h1>
            <p className="text-[14px] text-ink2 mt-2">{[a.chucDanh, ...dh, `Mã ${a.ma}`].join(" · ")}</p>
            <p className="text-[12.5px] text-mut mt-2">Danh thiếp thật của Chubb Life Việt Nam — mã {a.ma}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <a href={zaloHref} target="_blank" rel="noopener" className={`${btnA} bg-blue text-white border border-blue hover:bg-blue2`}>Kết nối Zalo</a>
            {tvv && tvv.ma !== a.ma && <Button kind="ghost" size="sm" onClick={toggleLuu}>{daLuu ? "Đã lưu" : "Lưu danh thiếp"}</Button>}
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
            {hs.loiNhan && (
              <blockquote className="mt-8 bg-xam rounded-sm px-6 py-5 max-w-[1100px]">
                <div className="font-bold text-[14px] text-den">Một điều tôi muốn nhắn người mới vào nghề</div>
                <p className="text-[14px] text-ink2 mt-1">{hs.loiNhan}</p>
              </blockquote>
            )}
          </section>
        )}

        {hs?.chungMinh && hs.chungMinh.length > 0 && (
          <section>
            <H2 className="text-[22px]">Chứng minh thực tế</H2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {hs.chungMinh.map((c, i) => (
                <figure key={c.ten} className="bg-white border border-vien rounded-sm p-6 flex flex-col">
                  <blockquote className="text-[14px] text-den leading-relaxed flex-1">“{c.trichDan}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3"><Avatar name={c.ten} size={32} /><span className="font-bold text-[13px] text-den">{c.ten}</span></figcaption>
                  <ImageBox src={ANH_KHACH[i % ANH_KHACH.length]} alt="Ảnh" ratio="16/9" className="mt-5" />
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* CTA kết nối + chia sẻ */}
        <section className="bg-xam rounded-sm p-8 flex flex-col lg:flex-row gap-8 items-start">
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

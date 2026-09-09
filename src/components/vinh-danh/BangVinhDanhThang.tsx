"use client";
/**
 * Một bảng vinh danh — C01 (/toan-tam-dan-dau: bảng công bố mới nhất, có hero) và C04 (/toan-tam-dan-dau/bang/[id]: bảng mở từ lưu trữ,
 * masthead gọn thay hero — trạng thái của C01, cùng thân trang; 09/09). Bảng có TÊN do Chubb đặt (tháng, quý, đợt riêng).
 * Khối 1: thẻ người dẫn đầu lớn + bốn người kế tiếp; khối 2–4: một hàng ngang, người dẫn đầu là thẻ rộng.
 * Mọi người trong bảng đều hiện khi bảng công bố (09/09: admin quyết). Hành động chia sẻ / gửi lời chúc chỉ ở C02.
 */
import Link from "next/link";
import { R } from "@/lib/routes";
import { fmtDate, fmtNum, thangLabel, thoiGianLabel } from "@/lib/seed";
import { Breadcrumb, Button, Card, Chip, EmptyState, H1, H2, Hero, ImageBox, MoreLink, Muted, Table } from "@/components/ui";
import { TheTVV, anhTVV, fmtTien, linkC02, useHonor } from "@/components/vinh-danh/honor";

export function BangVinhDanhThang({ thangId }: { thangId?: string }) {
  const { published, latest, congKhai, hangMucCoNguoi, tongCongKhai } = useHonor();
  const month = thangId ? published.find((m) => m.id === thangId) : latest;

  const hero = (
    <Hero eyebrow="Toàn Tâm Dẫn Đầu" title="Tự Hào Vinh Danh" desc="Mỗi thành tựu được ghi nhận đều trở thành một dấu ấn đáng nhớ, tiếp thêm động lực chinh phục những cột mốc phía trước." image="/img/vd-hero.jpg">
      <Muted className="mt-3 text-[16px] max-w-[560px]">Chubb Life tôn vinh những gương mặt Toàn Tâm Dẫn Đầu — những người đã bền bỉ kiến tạo giá trị cho khách hàng, đồng đội và khẳng định bản lĩnh trên hành trình sự nghiệp của chính mình.</Muted>
    </Hero>
  );

  if (!latest) {
    return (<>{hero}<div className="wrap py-16"><EmptyState title="Chưa có bảng vinh danh nào được công bố" desc="Bảng vinh danh sẽ xuất hiện ở đây ngay khi Chubb Life công bố bảng đầu tiên." /></div></>);
  }
  if (!month) {
    return (<>{hero}<div className="wrap py-16"><EmptyState title="Bảng này chưa được công bố" desc="Bảng vinh danh chỉ hiện sau khi Chubb Life công bố." action={<Button kind="secondary" href={R.C03}>Xem các bảng đã công bố</Button>} /></div></>);
  }

  const hms = hangMucCoNguoi(month);
  const thongTin = [thoiGianLabel(month), month.congBo ? `công bố ${fmtDate(month.congBo)}` : "", `${tongCongKhai(month)} Tư vấn viên được vinh danh trong ${hms.length} hạng mục`].filter(Boolean).join(" · ");
  // Các bảng gần đây: mỗi bảng một hàng (5 bảng công bố gần nhất khác bảng đang xem) → cùng màn này với bảng đó
  const luuTru = published.filter((m) => m.id !== month.id).slice(0, 5);

  return (
    <>
      {thangId ? (
        /* C04 · mở từ lưu trữ: masthead gọn thay hero (breadcrumb · tên bảng · thời gian · công bố · ô chọn bảng) */
        <section className="bg-xam">
          <div className="wrap pt-6 pb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Dẫn Đầu", href: R.C01 }, { label: "Các bảng vinh danh", href: R.C03 }, { label: thangLabel(month) }]} />
              <H1 className="mt-3 text-[34px] uppercase">{thangLabel(month)}</H1>
              <Muted className="mt-3 text-[16px]">{thongTin}</Muted>
            </div>
          </div>
        </section>
      ) : hero}
      <div className="wrap py-10">
        {!thangId && (
          /* C01 · trang đích tab: tiêu đề bảng + link sang lưu trữ (09/09: bỏ ô chọn bảng — C03 là nơi duyệt; không có dải tab hạng mục) */
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-vien pb-3">
            <div>
              <H2 className="text-[22px]">Bảng vinh danh {thangLabel(month)}</H2>
              <div className="mt-1 text-[13px] text-ink2">{[thoiGianLabel(month), month.congBo ? `công bố ${fmtDate(month.congBo)}` : ""].filter(Boolean).join(" · ")}</div>
            </div>
            <MoreLink href={R.C03}>Xem các bảng vinh danh khác</MoreLink>
          </div>
        )}

        {hms.length === 0 && <div className="mt-8"><EmptyState title="Bảng này chưa có người được vinh danh" /></div>}
        {hms.map((h, idx) => {
          const list = congKhai(month, h.id); const leader = list[0]; const keTiep = list.slice(1, 5);
          if (!leader) return null;
          const vp = leader.vanPhong.replace(/ — .*$/, "");
          const soLine = `${fmtTien(leader.nd.doanhSo)} · ${leader.nd.hopDong ?? "—"} hợp đồng mới · ${leader.nd.khachHang ?? "—"} khách hàng mới`;
          return (
            <section key={h.id} className="mt-10">
              <H2 className="text-[22px] uppercase">{h.ten} <span className="normal-case font-normal text-[16px] text-ink2">· {list.length} người được vinh danh</span></H2>
              {idx === 0 ? (
                <>
                  <Card className="mt-5 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 p-6">
                    <ImageBox src={anhTVV(leader.ma)} alt={leader.hoTen} ratio="1/1" />
                    <div className="flex flex-col">
                      <h3 className="font-serif font-semibold text-[32px] leading-tight text-den">{leader.hoTen}</h3>
                      <div className="mt-2 text-[15px] text-ink2">{h.ten} {month.nam} · {vp}</div>
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[940px]">
                        {[[fmtTien(leader.nd.doanhSo), "Doanh số · phí năm đầu"], [leader.nd.hopDong === undefined ? "—" : fmtNum(leader.nd.hopDong), "Hợp đồng mới"], [leader.nd.khachHang === undefined ? "—" : fmtNum(leader.nd.khachHang), "Khách hàng mới"]].map(([v, l]) => (
                          <div key={l} className="bg-xam rounded-sm px-5 py-4"><div className="font-serif font-semibold text-[26px] text-blue leading-none">{v}</div><div className="mt-2 text-[13px] text-ink2">{l}</div></div>
                        ))}
                      </div>
                      <div className="mt-6"><MoreLink href={linkC02(leader.ma, month.id, h.id)}>Xem chi tiết thành tích</MoreLink></div>
                    </div>
                  </Card>
                  {keTiep.length > 0 && (
                    <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-5">
                      {keTiep.map((v) => <TheTVV key={v.ma} v={v} sub={`${h.ten} ${month.nam} · ${v.vanPhong.replace(/ — .*$/, "")}`} thangId={month.id} hangMucId={h.id} />)}
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-5 grid grid-cols-2 lg:grid-cols-[minmax(0,2.4fr)_repeat(4,minmax(0,1fr))] gap-4 items-stretch">
                  <Card className="p-4 flex flex-col col-span-2 lg:col-span-1">
                    <div className="relative"><ImageBox src={anhTVV(leader.ma)} alt={leader.hoTen} ratio="16/9" /><Chip tone="blue" className="absolute top-3 left-3">NGƯỜI DẪN ĐẦU</Chip></div>
                    <div className="mt-3 font-bold text-[18px] text-den"><Link href={linkC02(leader.ma, month.id, h.id)} className="hover:text-blue">{leader.hoTen}</Link></div>
                    <div className="text-[13px] text-ink2 mt-0.5">{h.ten} {month.nam} · {vp}</div>
                    <div className="mt-2 text-[13px] text-den">{soLine}</div>
                    <div className="mt-auto pt-4"><Link href={linkC02(leader.ma, month.id, h.id)} className="text-[13px] font-bold text-blue hover:underline">Xem chi tiết thành tích</Link></div>
                  </Card>
                  {keTiep.map((v) => <TheTVV key={v.ma} v={v} sub={`${h.ten} ${month.nam} · ${v.vanPhong.replace(/ — .*$/, "")}`} thangId={month.id} hangMucId={h.id} />)}
                </div>
              )}
            </section>
          );
        })}

        {/* Các bảng gần đây (5 bảng đã công bố khác bảng đang xem) */}
        <section className="mt-14">
          <H2 className="text-[22px]">Các bảng gần đây</H2>
          <Card className="mt-6 p-2">
            {luuTru.length === 0 ? <EmptyState title="Chưa có bảng nào khác" /> : (
              <Table head={["Bảng vinh danh", "Thời gian", "Hạng mục có người", "Số người được vinh danh", ""]}>
                {luuTru.map((m) => (
                  <tr key={m.id} className="hover:bg-xam/60">
                    <td><Link href={m.id === latest.id ? R.C01 : R.C04(m.id)} className="font-bold text-blue hover:underline">{thangLabel(m)}</Link></td>
                    <td className="text-ink2">{thoiGianLabel(m) || "—"}</td>
                    <td>{hangMucCoNguoi(m).length} hạng mục</td>
                    <td>{tongCongKhai(m)}</td>
                    <td className="text-right"><Link href={m.id === latest.id ? R.C01 : R.C04(m.id)} className="text-[13px] font-bold text-blue hover:underline">Xem</Link></td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
          <div className="mt-5"><Button kind="secondary" href={R.C03}>Xem thêm</Button></div>
        </section>

        {/* CTA cuối trang (chuyển từ C04 khi gộp) */}
        <Card className="mt-12 p-6 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="font-bold text-[18px] text-den">Bạn muốn có tên ở đây?</div>
            <Muted className="mt-1 text-[15px]">Tìm hiểu lộ trình trở thành Tư vấn viên Chubb Life và cách các danh hiệu được ghi nhận.</Muted>
          </div>
          <Button href={R.B01}>Tìm hiểu nghề tư vấn</Button>
        </Card>
      </div>
    </>
  );
}

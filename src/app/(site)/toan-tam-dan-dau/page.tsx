"use client";
/**
 * C01 · Toàn Tâm Dẫn Đầu — trang đích tab Vinh danh.
 * Tháng đã công bố mới nhất; dải tab hạng mục đổi masthead; chỉ hiện người đã đồng ý công khai.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { R } from "@/lib/routes";
import { thangLabel } from "@/lib/seed";
import { Button, Card, EmptyState, H2, Hero, ImageBox, MoreLink, Muted, Table, cx, useFlash } from "@/components/ui";
import { ChonThang, ShareButtons, TheTVV, anhTVV, linkC02, useHonor, type NguoiDatView } from "@/components/vinh-danh/honor";

const SO_CHU = ["Không", "Một", "Hai", "Ba", "Bốn", "Năm", "Sáu"];

export default function Page() {
  const router = useRouter();
  const { flash, node } = useFlash();
  const { hangMucSorted, published, latest, congKhai, hangMucCoNguoi } = useHonor();
  const [hmId, setHmId] = useState<string | null>(null);

  const hero = (
    <Hero eyebrow="Toàn Tâm Dẫn Đầu" title="Tự Hào Vinh Danh" desc="Mỗi thành tựu được ghi nhận đều trở thành một dấu ấn đáng nhớ, tiếp thêm động lực chinh phục những cột mốc phía trước." image="/img/vd-hero.jpg">
      <Muted className="mt-3 text-[16px] max-w-[560px]">Chubb Life tôn vinh những gương mặt Toàn Tâm Dẫn Đầu — những người đã bền bỉ kiến tạo giá trị cho khách hàng, đồng đội và khẳng định bản lĩnh trên hành trình sự nghiệp của chính mình.</Muted>
    </Hero>
  );

  if (!latest) {
    return (<>{hero}<div className="wrap py-16"><EmptyState title="Chưa có tháng vinh danh nào được công bố" desc="Bảng vinh danh sẽ xuất hiện ở đây ngay khi Chubb Life công bố tháng đầu tiên." /></div></>);
  }

  const hms = hangMucCoNguoi(latest);
  const active = hms.find((h) => h.id === hmId) ?? hms[0];
  const list = active ? congKhai(latest, active.id) : [];
  const leader = list[0];
  const keTiep = list.slice(1, 5);
  const conLai = hms.filter((h) => h.id !== active?.id);
  const namKinhNghiem = (v: NguoiDatView) => (v.advisor ? latest.nam - new Date(v.advisor.ngayBatDau).getFullYear() : 0);
  const soThangVinhDanh = (v: NguoiDatView, hm: string) => published.filter((m) => congKhai(m, hm).some((x) => x.ma === v.ma)).length;

  // Lưu trữ theo tháng: các tháng trước, mỗi hàng một tháng · hạng mục (5 hàng đầu)
  const luuTru = published.filter((m) => m.id !== latest.id).flatMap((m) => hangMucCoNguoi(m).map((h) => ({ m, h, n: congKhai(m, h.id).length }))).slice(0, 5);

  return (
    <>
      {hero}
      <div className="wrap py-10">
        {/* Dải tab hạng mục + ô chọn tháng */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-vien pb-3">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Hạng mục">
            {hangMucSorted.filter((h) => h.hien).map((h) => {
              const co = hms.some((x) => x.id === h.id);
              return (
                <button key={h.id} type="button" role="tab" aria-selected={active?.id === h.id} disabled={!co} onClick={() => setHmId(h.id)} className={cx("h-9 px-4 rounded-sm text-[13px] font-bold uppercase tracking-wide", active?.id === h.id ? "bg-blue text-white" : co ? "text-ink2 hover:text-blue hover:bg-blue-soft" : "text-mut2 cursor-not-allowed")}>{h.ten}</button>
              );
            })}
          </div>
          <ChonThang months={published} value={latest.id} onChange={(id) => { if (id !== latest.id) router.push(R.C04(id)); }} />
        </div>

        {/* Masthead người dẫn đầu */}
        {leader && active && (
          <Card className="mt-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 p-6">
            <ImageBox src={anhTVV(leader.ma)} alt={leader.hoTen} ratio="1/1" />
            <div className="flex flex-col">
              <h2 className="font-serif font-semibold text-[32px] leading-tight text-den">{leader.hoTen}</h2>
              <div className="mt-2 text-[15px] text-ink2">{active.ten} {latest.nam} · {leader.vanPhong.replace(/ — .*$/, "")}</div>
              {(leader.advisor?.hoSoNangLuc?.gioiThieu || leader.nd.trichDan) && <p className="mt-5 text-[15px] leading-relaxed text-den max-w-[720px]">{leader.advisor?.hoSoNangLuc?.gioiThieu ?? leader.nd.trichDan}</p>}
              <div className="mt-6 flex flex-wrap gap-4">
                {(leader.advisor?.hoSoNangLuc?.noiBat?.slice(0, 2) ?? [`${soThangVinhDanh(leader, active.id)} tháng được vinh danh`, leader.advisor ? `${namKinhNghiem(leader)} năm kinh nghiệm` : ""]).filter(Boolean).map((t) => (
                  <div key={t} className="bg-xam rounded-sm px-6 py-4 font-bold text-[16px] text-den">{t}</div>
                ))}
              </div>
              {/* Hàng chia sẻ nội tuyến (09/09: thay nút + popup; bỏ "Tạo thiệp chúc mừng") */}
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="font-bold text-[13px] text-den mr-2">Chia sẻ thành tựu:</span>
                <ShareButtons onDone={flash} />
              </div>
              <div className="mt-5"><MoreLink href={linkC02(leader.ma, latest.id, active.id)}>Xem chi tiết thành tích</MoreLink></div>
            </div>
          </Card>
        )}

        {/* Bốn Tư vấn viên kế tiếp */}
        {active && keTiep.length > 0 && (
          <section className="mt-12">
            <H2 className="text-[22px]">{keTiep.length === 4 ? "Bốn" : SO_CHU[keTiep.length]} Tư vấn viên kế tiếp</H2>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
              {keTiep.map((v) => <TheTVV key={v.ma} v={v} sub={`${active.ten} ${latest.nam} · ${v.vanPhong.replace(/ — .*$/, "")}`} thangId={latest.id} hangMucId={active.id} />)}
            </div>
          </section>
        )}

        {/* Các hạng mục còn lại — mỗi hạng mục một dải rút gọn */}
        {conLai.length > 0 && (
          <section className="mt-14">
            <H2 className="text-[22px]">{SO_CHU[conLai.length] ?? conLai.length} hạng mục còn lại</H2>
            <Muted className="mt-2">Mỗi hạng mục là một dải rút gọn: một người dẫn đầu và bốn Tư vấn viên tiêu biểu.</Muted>
            <div className="mt-6 space-y-5">
              {conLai.map((h) => {
                const ds = congKhai(latest, h.id); const ld = ds[0]; const rest = ds.slice(1, 5);
                return (
                  <Card key={h.id} className="p-5 grid grid-cols-1 lg:grid-cols-[150px_1fr_2fr] gap-6 items-start">
                    <button type="button" onClick={() => { setHmId(h.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left font-bold text-[18px] uppercase text-blue hover:underline">{h.ten}</button>
                    <div className="flex gap-4">
                      <ImageBox src={anhTVV(ld.ma)} alt={ld.hoTen} ratio="3/4" className="w-[110px] shrink-0" />
                      <div>
                        <div className="font-bold text-[18px] text-den">{ld.hoTen}</div>
                        <div className="text-[13px] text-ink2 mt-1">{h.ten.toUpperCase()} · {thangLabel(latest)}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                                                    <Link href={linkC02(ld.ma, latest.id, h.id)} className="h-8 inline-flex items-center text-[13px] font-bold text-blue hover:underline">Chi tiết</Link>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {rest.map((v) => (
                        <Link key={v.ma} href={linkC02(v.ma, latest.id, h.id)} className="block group">
                          <ImageBox src={anhTVV(v.ma)} alt={v.hoTen} ratio="1/1" />
                          <div className="mt-2 font-bold text-[14px] text-den group-hover:text-blue">{v.hoTen}</div>
                          <div className="text-[12px] text-ink2">{v.vanPhong.replace(/ — .*$/, "")}</div>
                        </Link>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Lưu trữ theo tháng */}
        <section className="mt-14">
          <H2 className="text-[22px]">Lưu trữ theo tháng</H2>
          <Card className="mt-6 p-2">
            {luuTru.length === 0 ? <EmptyState title="Chưa có tháng nào trước đó" /> : (
              <Table head={["Tháng", "Hạng mục", "Số người được vinh danh"]}>
                {luuTru.map(({ m, h, n }) => (
                  <tr key={`${m.id}-${h.id}`} className="hover:bg-xam/60">
                    <td><Link href={R.C04(m.id)} className="font-bold text-blue hover:underline">{thangLabel(m)}</Link></td>
                    <td className="uppercase">{h.ten}</td>
                    <td>{n}</td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
          <div className="mt-5"><Button kind="secondary" href={R.C03}>Xem thêm</Button></div>
        </section>
      </div>
      {node}
    </>
  );
}

"use client";
/** C04 · Vinh danh một tháng — chi tiết: mỗi hạng mục một dải (người dẫn đầu + những người còn lại), sidebar tháng khác · chia sẻ · tuyển dụng. */
import Link from "next/link";
import { use } from "react";
import { R } from "@/lib/routes";
import { fmtDate, thangLabel } from "@/lib/seed";
import { Breadcrumb, Button, Card, EmptyState, H1, H3, ImageBox, Muted, useFlash } from "@/components/ui";
import { ShareButtons, anhTVV, linkC02, useHonor } from "@/components/vinh-danh/honor";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { flash, node } = useFlash();
  const { published, latest, congKhai, hangMucCoNguoi, tongCongKhai } = useHonor();
  const m = published.find((x) => x.id === id);

  if (!m) {
    return (
      <div className="wrap py-16">
        <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Dẫn Đầu", href: R.C01 }, { label: "Các tháng trước", href: R.C03 }]} />
        <div className="mt-6"><EmptyState title="Tháng này chưa được công bố" desc="Bảng vinh danh chỉ hiện sau khi Chubb Life công bố." action={<Button kind="secondary" href={R.C03}>Xem các tháng đã công bố</Button>} /></div>
      </div>
    );
  }
  const hms = hangMucCoNguoi(m);
  const khac = published.filter((x) => x.id !== m.id && x.id !== latest?.id).slice(0, 3);

  return (
    <div className="wrap py-8">
      <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Dẫn Đầu", href: R.C01 }, { label: "Các tháng trước", href: R.C03 }, { label: thangLabel(m) }]} />
      <H1 className="mt-3 text-[34px] uppercase">Vinh danh {thangLabel(m).toLowerCase()}</H1>
      <Muted className="mt-3 text-[16px]">{tongCongKhai(m)} Tư vấn viên được vinh danh trong {hms.length} hạng mục{m.congBo ? ` · công bố ${fmtDate(m.congBo)}` : ""}.</Muted>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
        <div className="space-y-10">
          {hms.length === 0 && <EmptyState title="Tháng này chưa có Tư vấn viên nào đồng ý công khai" />}
          {hms.map((h) => {
            const ds = congKhai(m, h.id); const ld = ds[0]; const rest = ds.slice(1);
            return (
              <section key={h.id}>
                <H3 className="text-[18px] uppercase">{h.ten} — {ds.length} người</H3>
                <Card className="mt-4 p-4 flex flex-wrap items-center gap-4">
                  <ImageBox src={anhTVV(ld.ma)} alt={ld.hoTen} ratio="1/1" className="w-[72px] shrink-0" />
                  <div className="flex-1 min-w-[200px]">
                    <div className="eyebrow text-[10.5px]">Người dẫn đầu</div>
                    <div className="font-bold text-[16px] text-den">{ld.hoTen}</div>
                    <div className="text-[13px] text-ink2">{ld.nd.trichDan ?? `${h.ten} ${m.nam} · ${ld.vanPhong}`}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={linkC02(ld.ma, m.id, h.id)} className="h-8 inline-flex items-center text-[13px] font-bold text-blue hover:underline">Chi tiết</Link>
                                      </div>
                </Card>
                {rest.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {rest.map((v) => (
                      <div key={v.ma} className="bg-white border border-vien rounded-sm p-3">
                        <div className="font-bold text-[13px] text-den">{v.hoTen}</div>
                        <div className="text-[11.5px] text-ink2">{v.vanPhong}</div>
                        <Link href={linkC02(v.ma, m.id, h.id)} className="mt-2 inline-block text-[13px] font-bold text-blue hover:underline">Chi tiết</Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <Card className="p-5">
            <div className="font-bold text-[15px] text-den">Tháng khác</div>
            <ul className="mt-3 space-y-2 text-[13px] font-bold">
              {latest && <li><Link href={R.C01} className="text-blue hover:underline">{thangLabel(latest)} — tháng hiện tại</Link></li>}
              {khac.map((x) => <li key={x.id}><Link href={R.C04(x.id)} className="text-blue hover:underline">{thangLabel(x)}</Link></li>)}
              <li className="pt-2 border-t border-vien2"><Link href={R.C03} className="text-blue hover:underline">Tất cả các tháng</Link></li>
            </ul>
          </Card>
          <Card className="p-5">
            <div className="font-bold text-[15px] text-den mb-3">Chia sẻ trang này</div>
            <ShareButtons onDone={flash} />
          </Card>
          <Card className="p-5 bg-hong-soft border-hong/20">
            <div className="font-bold text-[15px] text-den">Bạn muốn có tên ở đây?</div>
            <Muted className="mt-1 text-[13px]">Tìm hiểu lộ trình trở thành Tư vấn viên Chubb Life.</Muted>
            <Button kind="recruit" className="mt-4" href={R.B01}>Tìm hiểu nghề tư vấn</Button>
          </Card>
        </aside>
      </div>
      {node}
    </div>
  );
}

"use client";
/** C03 · Vinh danh — các tháng trước (archive theo tháng đã công bố; mỗi hàng "Xem tháng" tới C04). */
import Link from "next/link";
import { useState } from "react";
import { R } from "@/lib/routes";
import { thangLabel } from "@/lib/seed";
import { Breadcrumb, Button, Card, EmptyState, H1, Muted, Pagination, Select, Table } from "@/components/ui";
import { useHonor } from "@/components/vinh-danh/honor";

const MOI_TRANG = 6;

export default function Page() {
  const { hangMucSorted, published, congKhai, hangMucCoNguoi } = useHonor();
  const [thang, setThang] = useState("tat-ca");
  const [hm, setHm] = useState("tat-ca");
  const [page, setPage] = useState(1);

  const rows = published
    .filter((m) => thang === "tat-ca" || m.id === thang)
    .map((m) => {
      const hms = hangMucCoNguoi(m).filter((h) => hm === "tat-ca" || h.id === hm);
      return { m, hms: hms.map((h) => ({ ten: h.ten, n: congKhai(m, h.id).length })) };
    })
    .filter((r) => r.hms.length > 0);
  const pages = Math.max(1, Math.ceil(rows.length / MOI_TRANG));
  const cur = Math.min(page, pages);
  const slice = rows.slice((cur - 1) * MOI_TRANG, cur * MOI_TRANG);
  const first = rows[rows.length - 1]?.m; const last = rows[0]?.m;

  return (
    <div className="wrap py-8">
      <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Dẫn Đầu", href: R.C01 }, { label: "Các tháng trước" }]} />
      <H1 className="mt-3 text-[34px] uppercase">Vinh danh các tháng trước</H1>
      <Muted className="mt-3 text-[16px] max-w-[720px]">Lưu trữ bảng vinh danh theo tháng — chọn một tháng để xem lại đúng bảng của tháng đó.</Muted>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="text-[13px] text-ink2">{rows.length} tháng{first && last ? ` · từ ${thangLabel(first)} đến ${thangLabel(last)}` : ""}</div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-[13px] text-ink2">Tháng:
            <Select value={thang} onChange={(e) => { setThang(e.target.value); setPage(1); }} className="w-[170px]">
              <option value="tat-ca">Tất cả</option>
              {published.map((m) => <option key={m.id} value={m.id}>{thangLabel(m)}</option>)}
            </Select>
          </label>
          <label className="flex items-center gap-2 text-[13px] text-ink2">Hạng mục:
            <Select value={hm} onChange={(e) => { setHm(e.target.value); setPage(1); }} className="w-[170px]">
              <option value="tat-ca">Tất cả</option>
              {hangMucSorted.filter((h) => h.hien).map((h) => <option key={h.id} value={h.id}>{h.ten}</option>)}
            </Select>
          </label>
        </div>
      </div>

      <Card className="mt-4 p-2">
        {slice.length === 0 ? <EmptyState title="Không có tháng nào khớp bộ lọc" desc="Thử chọn lại tháng hoặc hạng mục." /> : (
          <Table head={["Tháng", "Hạng mục", "Số người được vinh danh", ""]}>
            {slice.map(({ m, hms }) => (
              <tr key={m.id} className="hover:bg-xam/60">
                <td><Link href={R.C04(m.id)} className="font-bold text-den hover:text-blue">{thangLabel(m)}</Link></td>
                <td>{hms.map((h) => h.ten).join(" · ")}</td>
                <td>{hms.map((h) => h.n).join(" · ")}</td>
                <td className="text-right"><Button size="sm" kind="secondary" href={R.C04(m.id)}>Xem tháng</Button></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Pagination page={cur} pages={pages} onChange={setPage} />
    </div>
  );
}

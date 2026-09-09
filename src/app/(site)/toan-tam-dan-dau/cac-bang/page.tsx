"use client";
/** C03 · Vinh danh — các bảng vinh danh đã công bố (lưu trữ; mỗi hàng "Xem bảng" → C01 với bảng đó). 09/09: bảng có tên do Chubb đặt, lọc theo năm công bố · hạng mục. */
import Link from "next/link";
import { useState } from "react";
import { R } from "@/lib/routes";
import { fmtDate, thangLabel, thoiGianLabel } from "@/lib/seed";
import { Breadcrumb, Button, Card, EmptyState, H1, Muted, Pagination, Select, Table } from "@/components/ui";
import { useHonor } from "@/components/vinh-danh/honor";

const MOI_TRANG = 6;

export default function Page() {
  const { hangMucSorted, published, latest, congKhai, hangMucCoNguoi } = useHonor();
  const [nam, setNam] = useState("tat-ca");
  const [hm, setHm] = useState("tat-ca");
  const [page, setPage] = useState(1);

  const namCongBo = (m: { congBo?: string; nam: number }) => (m.congBo ? new Date(m.congBo).getFullYear() : m.nam);
  const cacNam = Array.from(new Set(published.map(namCongBo))).sort((a, b) => b - a);
  const rows = published
    .filter((m) => nam === "tat-ca" || String(namCongBo(m)) === nam)
    .map((m) => {
      const hms = hangMucCoNguoi(m).filter((h) => hm === "tat-ca" || h.id === hm);
      return { m, hms: hms.map((h) => ({ ten: h.ten, n: congKhai(m, h.id).length })) };
    })
    .filter((r) => r.hms.length > 0);
  const pages = Math.max(1, Math.ceil(rows.length / MOI_TRANG));
  const cur = Math.min(page, pages);
  const slice = rows.slice((cur - 1) * MOI_TRANG, cur * MOI_TRANG);
  const first = rows[rows.length - 1]?.m; const last = rows[0]?.m;
  const linkBang = (id: string) => (latest && id === latest.id ? R.C01 : R.C04(id));

  return (
    <div className="wrap py-8">
      <Breadcrumb items={[{ label: "Trang chủ", href: R.A01 }, { label: "Toàn Tâm Dẫn Đầu", href: R.C01 }, { label: "Các bảng vinh danh" }]} />
      <H1 className="mt-3 text-[34px] uppercase">Các bảng vinh danh</H1>
      <Muted className="mt-3 text-[16px] max-w-[720px]">Mọi bảng vinh danh Chubb Life đã công bố — theo tháng, quý hay đợt riêng. Chọn một bảng để xem lại.</Muted>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="text-[13px] text-ink2">{rows.length} bảng{first?.congBo && last?.congBo ? ` · công bố từ ${fmtDate(first.congBo)} đến ${fmtDate(last.congBo)}` : ""}</div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-[13px] text-ink2">Năm:
            <Select value={nam} onChange={(e) => { setNam(e.target.value); setPage(1); }} className="w-[140px]">
              <option value="tat-ca">Tất cả</option>
              {cacNam.map((n) => <option key={n} value={String(n)}>{n}</option>)}
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
        {slice.length === 0 ? <EmptyState title="Không có bảng nào khớp bộ lọc" desc="Thử chọn lại năm hoặc hạng mục." /> : (
          <Table head={["Bảng vinh danh", "Hạng mục", "Số người được vinh danh", ""]}>
            {slice.map(({ m, hms }) => (
              <tr key={m.id} className="hover:bg-xam/60">
                <td><Link href={linkBang(m.id)} className="font-bold text-den hover:text-blue">{thangLabel(m)}</Link>{thoiGianLabel(m) && <div className="text-[12px] text-mut mt-0.5">{thoiGianLabel(m)}</div>}</td>
                <td>{hms.map((h) => h.ten).join(" · ")}</td>
                <td>{hms.map((h) => h.n).join(" · ")}</td>
                <td className="text-right"><Button size="sm" kind="secondary" href={linkBang(m.id)}>Xem bảng</Button></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Pagination page={cur} pages={pages} onChange={setPage} />
    </div>
  );
}

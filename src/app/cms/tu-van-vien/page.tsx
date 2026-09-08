"use client";
/** H11 · CMS — Quản lý Tư vấn viên & danh thiếp (danh sách). Đường thêm duy nhất: "+ Thêm Tư vấn viên" → H11b. */
import Link from "next/link";
import { useMemo, useState } from "react";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { Button, FilterChips, Pagination, SearchBox, Table } from "@/components/ui";
import { R } from "@/lib/routes";
import { fmtNum } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { khongDau, khuVuc, nhanThe } from "@/components/danh-thiep/lib";

type Loc = "tat-ca" | "cong-khai" | "an" | "da-go";
const PAGE = 10;

export default function Page() {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<Loc>("tat-ca");
  const [page, setPage] = useState(1);

  const dem = {
    "tat-ca": data.advisors.length,
    "cong-khai": data.advisors.filter((a) => a.trangThaiTaiKhoan === "hoat-dong" && a.theCongKhai).length,
    "an": data.advisors.filter((a) => a.trangThaiTaiKhoan === "hoat-dong" && !a.theCongKhai).length,
    "da-go": data.advisors.filter((a) => a.trangThaiTaiKhoan === "da-go").length,
  };

  const rows = useMemo(() => {
    const s = khongDau(q);
    return data.advisors.filter((a) => {
      if (loc === "cong-khai" && !(a.trangThaiTaiKhoan === "hoat-dong" && a.theCongKhai)) return false;
      if (loc === "an" && !(a.trangThaiTaiKhoan === "hoat-dong" && !a.theCongKhai)) return false;
      if (loc === "da-go" && a.trangThaiTaiKhoan !== "da-go") return false;
      return !s || a.ma.includes(s) || khongDau(a.hoTen).includes(s) || a.email.toLowerCase().includes(s);
    });
  }, [data.advisors, q, loc]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const p = Math.min(page, pages);
  const view = rows.slice((p - 1) * PAGE, p * PAGE);

  return (
    <>
      <CmsHeader title="Tư vấn viên & danh thiếp" desc={`${fmtNum(data.advisors.length)} Tư vấn viên`} right={<Button href={R.H11b()}>+ Thêm Tư vấn viên</Button>} />
      <CmsCard>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Tìm theo mã, họ tên, email…" className="w-[360px]" />
          <FilterChips<Loc>
            value={loc}
            onChange={(v) => { setLoc(v); setPage(1); }}
            options={[
              { value: "tat-ca", label: "Tất cả", count: dem["tat-ca"] },
              { value: "cong-khai", label: "Thẻ công khai", count: dem["cong-khai"] },
              { value: "an", label: "Thẻ ẩn", count: dem["an"] },
              { value: "da-go", label: "Đã gỡ", count: dem["da-go"] },
            ]}
          />
        </div>
        <Table head={["Mã", "Họ tên", "Email đăng nhập", "Văn phòng", "Thẻ", "Hồ sơ năng lực", "Hành động"]}>
          {view.map((a) => (
            <tr key={a.ma} className={a.trangThaiTaiKhoan === "da-go" ? "text-mut" : ""}>
              <td className="font-mono text-[13.5px]">{a.ma}</td>
              <td className="font-bold text-den">{a.hoTen}</td>
              <td className="text-[13px]">{a.email}</td>
              <td className="text-[13px]">{khuVuc(a.vanPhong)}</td>
              <td className="text-[13px]">{nhanThe(a)}</td>
              <td className="text-[12.5px] font-bold">{a.trangThaiTaiKhoan === "da-go" ? "—" : a.hoSoNangLuc ? "Đã điền" : "Chưa có"}</td>
              <td><Link href={R.H11a(a.ma)} className="font-bold text-blue hover:underline">Xem</Link></td>
            </tr>
          ))}
          {view.length === 0 && <tr><td colSpan={7} className="text-center text-mut py-10">Không có Tư vấn viên nào khớp bộ lọc</td></tr>}
        </Table>
        <div className="flex items-center justify-between mt-4 text-[12.5px] text-ink2">
          <span>Hiện {rows.length === 0 ? 0 : (p - 1) * PAGE + 1}–{Math.min(p * PAGE, rows.length)} / {fmtNum(rows.length)}</span>
          <Pagination page={p} pages={pages} onChange={setPage} />
        </div>
      </CmsCard>
    </>
  );
}

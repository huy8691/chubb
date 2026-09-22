"use client";
/**
 * H03g · CMS — Vinh danh từ Leader — chi tiết một lượt gửi (CHỈ XEM). ĐỀ XUẤT, chưa chốt.
 * Số do Leader nhập tay; admin đối chiếu với Bảng vinh danh (H03b) trước khi công bố.
 */
import { use } from "react";
import { R } from "@/lib/routes";
import { fmtDateTime, fmtNum } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { Button, Table } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, ready } = useStore();
  const s = data.leaderSubmissions.find((x) => x.id === id);
  if (!ready) return null;
  if (!s) {
    return (
      <>
        <CmsHeader crumbs={[{ label: "Vinh danh", href: R.H03 }, { label: "Vinh danh từ Leader", href: R.H03f }, { label: id }]} title="Không tìm thấy lượt gửi" />
        <Button href={R.H03f} kind="secondary">Về danh sách</Button>
      </>
    );
  }
  return (
    <>
      <CmsHeader
        crumbs={[{ label: "Vinh danh", href: R.H03 }, { label: "Vinh danh từ Leader", href: R.H03f }, { label: `${s.leaderTen} · ${s.bangLabel}` }]}
        title={`${s.leaderTen} — ${s.bangLabel}`}
        desc={`Leader gửi ${fmtDateTime(s.guiLuc)} · ${s.members.length} Tư vấn viên · Chỉ xem để đối chiếu với số trong Bảng vinh danh.`}
      />
      <CmsCard>
        <Table head={["Tư vấn viên", "Doanh số (phí năm đầu)", "Hợp đồng mới", "Khách hàng mới"]}>
          {s.members.map((m, i) => (
            <tr key={i} className="hover:bg-xam/60">
              <td className="text-den">{m.hoTen}</td>
              <td className="font-mono">{fmtNum(m.doanhSo)}</td>
              <td>{m.hopDong}</td>
              <td>{m.khachHang}</td>
            </tr>
          ))}
        </Table>
        <p className="mt-4 text-[13px] text-ink2">Số trên là do Leader nhập tay. Đối chiếu với số bạn nhập trong Bảng vinh danh (H03b) trước khi công bố.</p>
        <Button href={R.H03f} kind="ghost" className="mt-4">‹ Về danh sách</Button>
      </CmsCard>
    </>
  );
}

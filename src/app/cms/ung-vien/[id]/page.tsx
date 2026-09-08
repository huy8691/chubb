"use client";
/** H12a · CMS — Ứng viên — chi tiết chỉ đọc (đúng các trường form B01). Mở là tự đánh dấu Đã xem. Nút: Xoá dữ liệu theo yêu cầu ứng viên · ‹ Về danh sách. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { R } from "@/lib/routes";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/seed";
import { Button, Chip, EmptyState, Modal, StatusChip } from "@/components/ui";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, actions, ready } = useStore();
  const hs = data.candidates.find((c) => c.id === id);
  const [xoa, setXoa] = useState(false);

  useEffect(() => {
    if (ready && hs && hs.trangThai === "moi") actions.update("candidates", (list) => list.map((c) => (c.id === id ? { ...c, trangThai: "da-xem" } : c)));
  }, [ready, hs, id, actions]);

  if (!ready) return null;
  if (!hs) return (
    <>
      <CmsHeader crumbs={[{ label: "Ứng viên", href: R.H12 }, { label: id }]} title="Không tìm thấy hồ sơ" />
      <EmptyState title="Hồ sơ không tồn tại hoặc đã bị xoá theo yêu cầu ứng viên" action={<Button kind="secondary" href={R.H12}>‹ Về danh sách</Button>} />
    </>
  );

  const rows: [string, React.ReactNode][] = [
    ["Họ và tên", hs.hoTen],
    ["Số điện thoại", hs.soDienThoai],
    ["Email", hs.email],
    ["Tỉnh/Thành phố", hs.tinhThanh],
    ["Biết Chubb Life qua đâu?", hs.maGioiThieu ? <>{hs.nguon} (mã Tư vấn viên <Link href={R.E03(hs.maGioiThieu)} target="_blank" className="text-blue">{hs.maGioiThieu}</Link>)</> : hs.nguon],
    ["Đồng ý được Chubb Life liên hệ", hs.dongYLienHe ? "Có — tick khi gửi form" : "Không"],
  ];

  return (
    <>
      <CmsHeader crumbs={[{ label: "Ứng viên", href: R.H12 }, { label: hs.hoTen }]}
        title={<span className="flex items-center gap-3">{hs.hoTen} <StatusChip s={hs.trangThai === "moi" ? "chua-xem" : "da-xem"} /></span>}
        desc={`Gửi từ form trên trang Tuyển dụng · ${fmtDateTime(hs.gui)} · Mã hồ sơ #${hs.id}`} />
      <CmsCard>
        <dl className="divide-y divide-vien2">
          {rows.map(([l, v]) => (
            <div key={l} className="grid grid-cols-[300px_1fr] gap-6 py-3.5 text-[14px]"><dt className="text-ink2 text-[13px]">{l}</dt><dd className="font-bold text-den">{v}</dd></div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-vien2">
          <Button kind="secondary" href={R.H12}>‹ Về danh sách</Button>
          <Button kind="danger" className="ml-auto" onClick={() => setXoa(true)}>Xoá dữ liệu theo yêu cầu ứng viên</Button>
        </div>
      </CmsCard>

      <Modal open={xoa} onClose={() => setXoa(false)} title="Xoá dữ liệu ứng viên" width={520}
        footer={<><Button kind="danger" onClick={() => { actions.update("candidates", (list) => list.filter((c) => c.id !== id)); router.push(R.H12); }}>Xoá vĩnh viễn</Button><Button kind="secondary" onClick={() => setXoa(false)}>Huỷ</Button></>}>
        <p className="text-[14px] text-ink2">Toàn bộ thông tin của <b className="text-den">{hs.hoTen}</b> (mã hồ sơ #{hs.id}) sẽ bị xoá khỏi hệ thống và không khôi phục được. Chỉ thực hiện khi ứng viên yêu cầu.</p>
        <div className="mt-3"><Chip tone="amber">Không khôi phục được</Chip></div>
      </Modal>
    </>
  );
}

"use client";
/**
 * H01 · CMS — Bảng điều khiển.
 * 4 thẻ số (việc cần xử lý · bài đã xuất bản · danh thiếp đang công khai · mẫu Studio đang dùng)
 * + khối "Việc cần xử lý": Ứng viên · Ảnh Studio · Liên hệ · Báo cáo BXH, mỗi hàng một nút Mở tới danh sách module đã lọc.
 * Biên tập chỉ thấy 2 thẻ Bài viết / Mẫu Studio — hàng đợi là việc của Quản trị.
 */
import Link from "next/link";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { Chip, Stat, Table } from "@/components/ui";
import { R } from "@/lib/routes";
import { fmtNum } from "@/lib/seed";
import { useCurrentCmsUser, useStore } from "@/lib/store";

export default function Page() {
  const { data } = useStore();
  const user = useCurrentCmsUser();
  const laBienTap = user?.vai === "editor";

  const baiXuatBan = data.articles.filter((a) => a.trangThai === "da-xuat-ban").length;
  const theCongKhai = data.advisors.filter((a) => a.theCongKhai && a.trangThaiTaiKhoan === "hoat-dong").length;
  const mauDangDung = data.studioTemplates.filter((m) => m.trangThai === "da-xuat-ban").length;

  const ungVien = data.candidates.filter((c) => c.trangThai === "moi").length;
  const anhChoDuyet = data.studioImages.filter((a) => a.trangThai === "cho-duyet").length;
  const tinChuaXem = data.contactMessages.filter((m) => m.trangThai === "chua-xem").length;
  const coChuaXuLy = data.flaggedRows.filter((f) => !f.daXuLy).length;
  const tongViec = ungVien + anhChoDuyet + tinChuaXem + coChuaXuLy;

  const hang: { loai: string; noiDung: string; nguon: string; so: number; chip: string; tone: "amber" | "grey"; href: string }[] = [
    { loai: "Ứng viên", noiDung: `Ứng viên mới từ form tuyển dụng (${ungVien})`, nguon: "Form Tuyển dụng", so: ungVien, chip: "Mới", tone: "amber", href: `${R.H12}?loc=moi` },
    { loai: "Ảnh Studio", noiDung: `Ảnh gửi vào bộ sưu tập (${anhChoDuyet})`, nguon: "Tư vấn viên", so: anhChoDuyet, chip: "Chờ duyệt", tone: "amber", href: `${R.H07}?loc=cho-duyet` },
    { loai: "Liên hệ", noiDung: `Tin nhắn liên hệ chưa xem (${tinChuaXem})`, nguon: "Form Liên hệ", so: tinChuaXem, chip: "Mới", tone: "amber", href: `${R.H16}?loc=chua-xem` },
    { loai: "Báo cáo BXH", noiDung: `Hàng gắn cờ chưa xử lý (${coChuaXuLy})`, nguon: "Hệ thống", so: coChuaXuLy, chip: "Chờ xử lý", tone: "amber", href: R.H08 },
  ];

  const cuonXuong = () => document.getElementById("viec-can-xu-ly")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <CmsHeader title="Bảng điều khiển" />

      {laBienTap ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat value={fmtNum(baiXuatBan)} label="bài đã xuất bản" href={R.H04} />
            <Stat value={fmtNum(mauDangDung)} label="mẫu Studio đang dùng" href={R.H02} />
          </div>
          <p className="mt-6 text-[13.5px] text-ink2">Hàng đợi xử lý là việc của Quản trị.</p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button type="button" onClick={cuonXuong} className="text-left block bg-white border border-vien rounded-sm p-5 hover:border-blue">
              <div className="font-serif font-semibold text-[34px] text-blue leading-none">{fmtNum(tongViec)}</div>
              <div className="mt-2 text-[14px] text-ink2">việc cần xử lý</div>
            </button>
            <Stat value={fmtNum(baiXuatBan)} label="bài đã xuất bản" href={R.H04} />
            <Stat value={fmtNum(theCongKhai)} label="danh thiếp đang công khai" href={R.H11} />
            <Stat value={fmtNum(mauDangDung)} label="mẫu Studio đang dùng" href={R.H02} />
          </div>

          <div id="viec-can-xu-ly" className="mt-8 scroll-mt-6">
            <CmsCard title="Việc cần xử lý">
              <Table head={["Loại", "Nội dung", "Nguồn", "Trạng thái", ""]}>
                {hang.map((h) => (
                  <tr key={h.loai}>
                    <td className="text-ink2 whitespace-nowrap">{h.loai}</td>
                    <td className="font-bold text-den">{h.noiDung}</td>
                    <td className="text-ink2 whitespace-nowrap">{h.nguon}</td>
                    <td>{h.so > 0 ? <Chip tone={h.tone}>{h.chip}</Chip> : <Chip tone="grey">Không có</Chip>}</td>
                    <td className="text-right"><Link href={h.href} className="font-bold text-blue hover:underline">Mở</Link></td>
                  </tr>
                ))}
              </Table>
            </CmsCard>
          </div>
        </>
      )}
    </>
  );
}

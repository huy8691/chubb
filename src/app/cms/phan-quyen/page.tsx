"use client";
/**
 * H05 · CMS — Phân quyền (đơn giản hoá 08/09): quyền theo vai, không tick module.
 * Khối "Hai vai trò" (bảng 2 hàng) + khối "Người dùng" (Thêm người dùng → H05a; Sửa → H05a; Khoá / Mở khoá tại chỗ).
 */
import Link from "next/link";
import { CmsCard, CmsHeader } from "@/components/cms/CmsShell";
import { Avatar, Button, StatusChip, Table, useFlash } from "@/components/ui";
import { R } from "@/lib/routes";
import { useCurrentCmsUser, useStore } from "@/lib/store";

export default function Page() {
  const { data, actions } = useStore();
  const me = useCurrentCmsUser();
  const { flash, node } = useFlash();

  const doiKhoa = (id: string) => {
    const u = data.cmsUsers.find((x) => x.id === id);
    if (!u) return;
    const khoa = u.trangThai === "hoat-dong";
    actions.update("cmsUsers", (l) => l.map((x) => (x.id === id ? { ...x, trangThai: khoa ? "da-khoa" : "hoat-dong" } : x)));
    flash(khoa ? `Đã khoá tài khoản ${u.hoTen} — không đăng nhập CMS được nữa` : `Đã mở khoá tài khoản ${u.hoTen}`);
  };

  return (
    <>
      {node}
      <CmsHeader title="Phân quyền" />

      <CmsCard title="Hai vai trò" desc="Quản trị làm mọi việc trong CMS. Biên tập chỉ vào các module nội dung, soạn và xuất bản trong module của mình — không có bước duyệt.">
        <Table head={["Vai trò", "Module được vào"]}>
          <tr>
            <td className="font-bold text-den w-[380px]">Quản trị</td>
            <td className="text-ink2">Tất cả 14 module, kể cả Phân quyền và Báo cáo BXH</td>
          </tr>
          <tr>
            <td className="font-bold text-den">Biên tập</td>
            <td className="text-ink2">Bài viết · Mẫu Studio · Tài liệu · FAQ · Trắc nghiệm</td>
          </tr>
        </Table>
      </CmsCard>

      <div className="mt-6">
        <CmsCard title="Người dùng" right={<Button href={R.H05a()}>Thêm người dùng</Button>}>
          <Table head={["Người dùng", "Vai trò", "Trạng thái", "Thao tác"]}>
            {data.cmsUsers.map((u) => {
              const laToi = me?.email === u.email;
              return (
                <tr key={u.id} className={u.trangThai === "da-khoa" ? "text-mut" : ""}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.hoTen} size={40} />
                      <div>
                        <div className="font-bold text-[13.5px] text-den">{u.hoTen}{laToi && <span className="ml-2 text-[11px] font-bold text-ink2">(bạn)</span>}</div>
                        <div className="text-[12.5px] text-ink2">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-[13px]">{u.vai === "admin" ? "Quản trị" : "Biên tập"}</td>
                  <td><StatusChip s={u.trangThai} /></td>
                  <td className="whitespace-nowrap text-[12.5px] font-bold">
                    <Link href={R.H05a(u.id)} className="text-blue hover:underline">Sửa</Link>
                    {!laToi && (
                      <>
                        <span className="text-mut mx-1.5">·</span>
                        <button type="button" onClick={() => doiKhoa(u.id)} className={u.trangThai === "hoat-dong" ? "text-ink2 hover:text-red-fg" : "text-blue hover:underline"}>
                          {u.trangThai === "hoat-dong" ? "Khoá" : "Mở khoá"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {data.cmsUsers.length === 0 && <tr><td colSpan={4} className="text-center text-mut py-10">Chưa có người dùng CMS nào</td></tr>}
          </Table>
        </CmsCard>
      </div>
    </>
  );
}

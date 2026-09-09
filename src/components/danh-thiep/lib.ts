/**
 * Tiện ích dùng chung cho cụm Danh thiếp (E01 · E02 · E03 · E06 · E07 · H11 · H08).
 * Không có state riêng — mọi dữ liệu đọc/ghi qua useStore().
 */
import { SITE_ORIGIN } from "@/lib/routes";
import type { DemoData } from "@/lib/store";
import type { Advisor } from "@/lib/types";

/** Tháng đang tính bảng xếp hạng chia sẻ (H08 · E01) */
export const THANG_BXH = "9/2026";

/** Bỏ dấu tiếng Việt, hạ chữ thường — dùng khi tìm theo tên */
export const khongDau = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").trim();

export const laMa7So = (s: string) => /^\d{7}$/.test(s.trim());

/** Số năm kinh nghiệm tính từ ngày bắt đầu */
export const namKinhNghiem = (a: Advisor) => Math.max(1, new Date().getFullYear() - new Date(a.ngayBatDau).getFullYear());

/** Rút "Q.1 TP.HCM" từ "TP. Hồ Chí Minh — Q.1" cho cột hẹp */
export const khuVuc = (vanPhong: string) => {
  const [tinh, quan] = vanPhong.split(" — ");
  const t = tinh.replace("TP. Hồ Chí Minh", "TP.HCM");
  return quan ? `${quan} ${t}` : t;
};
export const tinhThanh = (vanPhong: string) => vanPhong.split(" — ")[0].replace("TP. Hồ Chí Minh", "TP.HCM");

/** Nhãn cột "Thẻ" trên H11 · chip trên H11a */
export const nhanThe = (a: Advisor) => {
  if (a.trangThaiTaiKhoan === "da-go") return "Đã gỡ (nghỉ việc)";
  if (!a.theCongKhai) return a.theAnBoi === "quan-tri" ? "Ẩn (Quản trị)" : "Ẩn (TVV tắt)";
  return "Công khai";
};

/** Danh thiếp xem được công khai (E03) */
export const theXemDuoc = (a?: Advisor): a is Advisor => !!a && a.trangThaiTaiKhoan !== "da-go" && a.theCongKhai;

/** Danh hiệu đã công khai, ngăn cách " · " — dòng dưới tên trên E02 · E03 · E06 */
export const danhHieuCongKhai = (a: Advisor) => a.danhHieu.map((d) => d.ten);

/** Định dạng SĐT 0901 234 567 */
export const fmtPhone = (p: string) => p.replace(/^(\d{4})(\d{3})(\d{3,4})$/, "$1 $2 $3");

/** Link danh thiếp tuyệt đối, kèm tham số nguồn để đối soát lượt mở */
export const linkDanhThiep = (ma: string, ref?: "zalo" | "fb" | "copy" | "qr") => {
  return `${SITE_ORIGIN}/${ma}${ref ? `?ref=${ref}` : ""}`;
};

/** Tải vCard (.vcf) về máy */
export function taiVCard(a: Advisor) {
  const lines = [
    "BEGIN:VCARD", "VERSION:3.0",
    `N:${a.hoTen};;;;`, `FN:${a.hoTen}`,
    `ORG:Chubb Life Việt Nam`, `TITLE:${a.chucDanh}`,
    `TEL;TYPE=CELL:${a.soDienThoai}`, `EMAIL:${a.email}`,
    `ADR;TYPE=WORK:;;${a.vanPhong};;;;Việt Nam`,
    `URL:${linkDanhThiep(a.ma)}`, `NOTE:Mã Tư vấn viên ${a.ma}`,
    "END:VCARD",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = url; el.download = `${a.hoTen.replace(/\s+/g, "-")}-${a.ma}.vcf`;
  document.body.appendChild(el); el.click(); el.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Bảng xếp hạng sắp theo Lượt được tính; `congKhai` = chỉ TVV hiện trên BXH và thẻ công khai (E01) */
export function xepHang(data: DemoData, congKhai: boolean) {
  const byMa = new Map(data.advisors.map((a) => [a.ma, a]));
  return data.ranking
    .map((r) => ({ r, a: byMa.get(r.advisorMa)! }))
    .filter(({ a }) => a && a.trangThaiTaiKhoan === "hoat-dong" && (!congKhai || (a.hienTrenBXH && a.theCongKhai)))
    .sort((x, y) => y.r.luotDuocTinh - x.r.luotDuocTinh)
    .map((x, i) => ({ ...x, hang: i + 1 }));
}

/** Tháng đã chốt hay chưa — suy từ thông báo "Bảng xếp hạng tháng … đã chốt" (không thêm khoá mới vào store) */
export const isThangChot = (data: DemoData) => data.notifications.some((n) => n.noiDung.startsWith(`Bảng xếp hạng tháng ${THANG_BXH} đã chốt`));

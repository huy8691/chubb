/** Danh mục chọn dùng chung cho cụm Chung + Tuyển dụng (S03 · B01 · H12 · H16 · H13). */
import type { ContactMessage, FAQ } from "@/lib/types";

export const BAN_LA: { value: ContactMessage["banLa"]; label: string }[] = [
  { value: "khach-hang", label: "Khách hàng" },
  { value: "ung-vien", label: "Ứng viên" },
  { value: "tu-van-vien", label: "Tư vấn viên" },
];
export const banLaLabel = (v: ContactMessage["banLa"]) => BAN_LA.find((b) => b.value === v)?.label ?? v;

export const DOI_TUONG: { value: FAQ["doiTuong"]; label: string }[] = [
  { value: "tat-ca", label: "Tất cả" },
  { value: "khach-hang", label: "Khách hàng" },
  { value: "ung-vien", label: "Ứng viên" },
  { value: "tu-van-vien", label: "Tư vấn viên" },
];
export const doiTuongLabel = (v: FAQ["doiTuong"]) => DOI_TUONG.find((d) => d.value === v)?.label ?? v;

export const TRANG_FAQ: { value: FAQ["trang"]; label: string }[] = [
  { value: "tuyen-dung", label: "Tuyển dụng" },
  { value: "lien-he", label: "Liên hệ & trợ giúp" },
];
export const trangFaqLabel = (v: FAQ["trang"]) => TRANG_FAQ.find((t) => t.value === v)?.label ?? v;

/** Chủ đề trên form Gửi tin nhắn (S03) và ô lọc Chủ đề (H16) */
export const CHU_DE = ["Tìm Tư vấn viên", "Kiểm tra danh thiếp", "Tuyển dụng", "Sản phẩm & hợp đồng", "Hỗ trợ Tư vấn viên", "Góp ý website", "Khác"];

export const TINH_THANH = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương", "Đồng Nai", "Khánh Hoà", "Nghệ An", "Thanh Hoá", "Khác"];

/** "Bạn biết Chubb Life qua đâu?" trên form B01 */
export const NGUON_BIET = ["Người giới thiệu", "Mạng xã hội", "Bạn bè, người thân", "Sự kiện Chubb Life", "Tìm kiếm Google", "Khác"];

export const HOTLINE = "1800 xxxx";
export const EMAIL_CHUBB = "chubblife.vietnam@chubb.com";
export const EMAIL_TVV = "hotro-tvv@chubb.com";

/** Kiểu dữ liệu demo — tên theo §10 QUY-TAC-WIREFRAME.md (một tính năng một tên). */

export type Role = "guest" | "tvv" | "admin" | "editor";

export interface Session {
  role: Role;
  /** mã TVV 7 số khi role = tvv */
  advisorMa?: string;
  /** email người dùng CMS khi role = admin | editor */
  email?: string;
}

/** Văn phòng Chubb — thực thể phụ của Tư vấn viên (H11 popup H11c, 09/09): marker trên bản đồ "Tìm Tư vấn viên gần bạn" (E01) */
export interface Office {
  id: string;
  ten: string; // trùng với Advisor.vanPhong
  diaChi: string;
  lat: number;
  lng: number;
}

export interface Advisor {
  ma: string; // 7 số, ví dụ 0161363
  hoTen: string;
  email: string;
  chucDanh: string;
  vanPhong: string;
  ngayBatDau: string; // ISO
  soDienThoai: string;
  zalo?: string;
  avatar?: string;
  /** Danh thiếp công khai (E03) đang hiện hay tạm ẩn */
  theCongKhai: boolean;
  /** Ai đã ẩn thẻ khi theCongKhai = false (H11 hiện "Ẩn (TVV tắt)" / "Ẩn (Quản trị)") */
  theAnBoi?: "tvv" | "quan-tri";
  hienTrenBXH: boolean;
  nhanThongBaoEmail: boolean;
  /** G06 công tắc thứ 4 — "Nhận bản tin nội bộ hàng tháng" */
  nhanBanTin?: boolean;
  /** G06 — "Số điện thoại liên hệ nội bộ" (khác SĐT trên danh thiếp) */
  soDienThoaiNoiBo?: string;
  /** G02a · E04 — "lượt xem danh thiếp tháng này" */
  luotXemThangNay?: number;
  hoSoNangLuc?: {
    gioiThieu: string;
    theManh: string[];
    chungChi: string[];
    /** 3 điểm nổi bật hiện đầu khối Hồ sơ năng lực (E02 · E03), ví dụ "15 năm kinh nghiệm" */
    noiBat?: string[];
    /** Hành trình nghề nghiệp (E03) */
    hanhTrinh?: { nam: string; tieuDe: string; moTa: string }[];
    /** "Một điều tôi muốn nhắn người mới vào nghề" (E03) */
    loiNhan?: string;
    /** Chứng minh thực tế — lời khách hàng (E03) */
    chungMinh?: { trichDan: string; ten: string }[];
    capNhat?: string; // ISO — H11a "Đã điền · cập nhật dd/mm/yyyy"
    /** E04 bước 2 — "Tôi muốn được nhớ đến với vai trò gì?" */
    vaiTro?: string;
    /** E04 bước 3 — hai ô số */
    namKinhNghiem?: number;
    namMDRT?: number;
    /** E04 — "Hiện từng phần trên trang công khai" */
    hienPhan?: { hanhTrinh: boolean; nhanXet: boolean; linhVuc: boolean; google: boolean };
  };
  danhHieu: DanhHieu[];
  luotChiaSeThangNay: number;
  moTuLinkThangNay: number;
  dangNhapGanNhat?: string;
  trangThaiTaiKhoan: "hoat-dong" | "da-go";
}

export interface DanhHieu {
  id: string;
  ten: string; // MDRT 2026 · Chubb Star 2025 …
  thangId: string; // tham chiếu HonorMonth.id
  hangMucId: string;
  thuHang: number;
}

export interface ChuyenDe {
  id: string;
  ten: string;
  moTa: string;
  slug: string;
  thuTu: number;
  hien: boolean;
}

export type TrangThaiXuatBan = "nhap" | "da-len-lich" | "da-xuat-ban" | "da-go";

export interface Article {
  id: string;
  slug: string;
  tieuDe: string;
  sapo: string;
  thanBai: string; // markdown đơn giản / đoạn văn
  chuyenDeId: string;
  tacGia: string;
  anh: string; // đường dẫn /img/...
  altAnh: string;
  ngayXuatBan?: string;
  /** ngày hẹn xuất bản khi trangThai = da-len-lich (H04 chip "Lên lịch dd/mm", H06 Xuất bản ▾ → Lên lịch) */
  ngayLenLich?: string;
  trangThai: TrangThaiXuatBan;
  seo: { tieuDe: string; moTa: string; duongDan: string; anhChiaSe?: string; choGoogle: boolean };
  capNhat: string;
  luotXem: number;
}

export interface StudioTemplate {
  id: string;
  ten: string;
  anh: string;
  tiLe: "1:1" | "3:4" | "4:5" | "9:16";
  /** Thêm cho H02a (cụm Công cụ) — tuỳ chọn để không phá seed cụm khác */
  phienBan?: number;
  disclaimer?: string;
  mauNen?: string; // mã màu nền thương hiệu
  khungAnh?: "tron" | "vuong";
  tiLeKhung?: number; // % chiều rộng khung ảnh chân dung
  truong?: { hoTen: boolean; chucDanh: boolean; soDienThoai: boolean; gioiThieu: boolean };
  /** Thêm cho H02a — hoạ tiết thương hiệu (1–4) và tên tệp ảnh nền đã tải lên */
  hoaTiet?: number;
  tenTep?: string;
  trangThai: TrangThaiXuatBan | "luu-tru";
  soAnhDaTao: number;
  capNhat: string;
}

export interface StudioImage {
  id: string;
  templateId: string;
  advisorMa: string;
  anh: string;
  tao: string;
  /** Vòng đời một ảnh (09/09): Riêng tư → (Hiển thị công khai, gửi MỘT lần) → Chờ duyệt → Đang công khai | Từ chối → Đã ngừng công khai (TVV hoặc admin ngừng; không gửi lại). Xoá = mất cả Ảnh Studio của tôi và Bộ sưu tập. */
  trangThai: "rieng-tu" | "cho-duyet" | "da-duyet" | "bi-tu-choi" | "da-ngung";
  lyDoTuChoi?: string;
  /** Thêm cho D02/D07/H07 (cụm Công cụ) */
  dongYCongKhai?: boolean; // TVV tick khi bấm Hiển thị công khai
  ngayDuyet?: string;
  phienBanMau?: number;
}

export interface HangMuc {
  id: string; // mdrt · chubb-star · chubb-chien · chubb-prime
  ten: string;
  hien: boolean;
  thuTu: number;
}

export interface NguoiDat {
  /** mã TVV; người nhập tay không có tài khoản dùng mã tạm "tay-<timestamp>" */
  advisorMa: string;
  thuHang: number;
  /** Thành tích tháng (C02 · H03b · H03c · H03d) — Chubb nạp cùng danh sách; chủ dự án 08/09: công khai */
  doanhSo?: number; // phí năm đầu, VND
  hopDong?: number; // hợp đồng mới trong tháng
  khachHang?: number; // khách hàng mới trong tháng
  /** Nguồn thêm vào tháng (cột "Nguồn" trên H03b) */
  nguon?: "excel" | "tay";
  /** Chỉ dùng khi nhập tay và TVV chưa có trong danh sách */
  hoTen?: string;
  vanPhong?: string;
}

/**
 * Bảng vinh danh (09/09): một danh sách có TÊN do Chubb đặt — tháng, quý, tuần hay đợt riêng ("Tân binh xuất sắc Quý 2/2026").
 * Giữ tên kiểu HonorMonth để không đổi mã khắp nơi; `thang` chỉ có khi bảng là một tháng.
 */
export interface HonorMonth {
  id: string; // "2026-08" hoặc slug tự đặt ("tan-binh-q2-2026")
  /** Tên bảng — tiêu đề trên C01, cột đầu H03 */
  ten: string;
  /** Khoảng thời gian tuỳ chọn (YYYY-MM-DD) — hiện dưới tiêu đề */
  tuNgay?: string;
  denNgay?: string;
  thang?: number;
  nam: number;
  trangThai: "nhap" | "da-cong-bo";
  hangMuc: { hangMucId: string; nguoiDat: NguoiDat[] }[];
  capNhat: string;
  /** Ngày công bố (cột "Công bố ngày" trên H03) */
  congBo?: string;
}

export interface DocType {
  id: string;
  ten: string;
  moTa: string;
  thuTu: number;
}

export interface Document {
  id: string;
  ten: string;
  loaiId: string;
  dinhDang: "PDF" | "DOC" | "DOCX" | "JPG" | "PNG";
  kichCo: string; // "2,4 MB"
  phienBan: string;
  capNhat: string;
  phan: "cong-khai" | "tvv";
  trangThai: TrangThaiXuatBan;
  moTa?: string;
  /** Thêm cho H09/H09a (cụm Công cụ) */
  hetHan?: string; // ISO — tệp tự ẩn sau ngày này
  ghiChu?: string; // ghi chú thay đổi, hiện ở "Mới cập nhật"
  tenTep?: string;
  /** Lịch sử phiên bản (H09a) — bản trước mỗi lần thay tệp mới, mới nhất đứng đầu */
  lichSu?: { ngay: string; phienBan: string; tenTep?: string; ghiChu?: string }[];
}

export interface FAQ {
  id: string;
  trang: "tuyen-dung" | "lien-he";
  doiTuong: "tat-ca" | "khach-hang" | "ung-vien" | "tu-van-vien";
  cauHoi: string;
  traLoi: string;
  /** Liên kết đính kèm (tuỳ chọn) — đường dẫn trong site, ví dụ /toan-tam-phat-trien/tai-chinh-ca-nhan */
  lienKet?: string;
  thuTu: number;
  trangThai: "nhap" | "da-xuat-ban";
  capNhat: string;
  /** Lịch sử phiên bản — bản trước mỗi lần Lưu trong popup H13a (mới nhất đứng đầu) */
  lichSu?: { ngay: string; cauHoi: string; traLoi: string; trangThai: "nhap" | "da-xuat-ban" }[];
}

export interface Candidate {
  id: string; // mã hồ sơ, ví dụ TD-0142
  hoTen: string;
  soDienThoai: string;
  email: string;
  tinhThanh: string;
  /** "Bạn biết Chubb Life qua đâu?" — ô chọn trên form B01 */
  nguon: string;
  /** mã Tư vấn viên 7 số khi nguồn là "Người giới thiệu" */
  maGioiThieu?: string;
  /** ô tick "Tôi đồng ý để Chubb Life Việt Nam liên hệ…" trên form B01 */
  dongYLienHe: boolean;
  kinhNghiem?: string;
  loiNhan?: string;
  gui: string;
  trangThai: "moi" | "da-xem";
}

export interface ContactMessage {
  id: string; // CL-0142
  banLa: "khach-hang" | "ung-vien" | "tu-van-vien";
  hoTen: string;
  lienHe: string; // email hoặc SĐT
  chuDe: string;
  noiDung: string;
  dinhKem?: string;
  /** ô tick "Đồng ý được liên hệ lại" trên form S03 */
  dongYLienHe: boolean;
  gui: string;
  trangThai: "chua-xem" | "da-xem" | "da-tra-loi";
}

export interface CmsUser {
  id: string;
  hoTen: string;
  email: string;
  vai: "admin" | "editor";
  trangThai: "hoat-dong" | "da-khoa";
  dangNhapGanNhat?: string;
}

export interface RankingRow {
  advisorMa: string;
  luotDuocTinh: number;
  luotKhongHopLe: number;
  nutBamNhieuNhat: "Zalo" | "Facebook" | "Sao chép link" | "QR";
  moTuLink: number;
}

export interface FlaggedRow {
  id: string;
  advisorMa: string;
  lyDo: string;
  soLuot: number;
  ip: string;
  nut: string;
  thoiGian: string;
  /** Số lượt người nhận mở từ link chia sẻ trong khoảng bị gắn cờ (dấu hiệu trên H08a) */
  luotMo?: number;
  /** Phân bố lượt theo nút (H08a "THEO NÚT") */
  theoNut?: { nut: string; so: number }[];
  daXuLy?: { quyetDinh: "loai" | "hop-le"; soLuotLoai: number; boi: string; ngay: string; ghiChu?: string };
}

export interface QuizQuestion {
  id: string;
  cauHoi: string;
  dapAn: { text: string; kieuId: string }[];
  thuTu: number;
  hien: boolean;
}

export interface QuizResultType {
  id: string;
  ten: string;
  huyHieu: string; // emoji hoặc /img
  diemManh: string;
  phongCach: string;
  phuHopVoi: string;
  dinhHuong: string;
  anhChiaSe?: string;
}

export interface FinanceParams {
  laiSuatMacDinh: number; // %/năm
  tyLeTietKiemGoiY: number; // %
  thoiGianMacDinh: number; // năm
  mucTieu: { id: string; ten: string; soTienGoiY: number }[];
  gioiHan: { thuNhapMin: number; thuNhapMax: number; thoiGianMax: number; tyLeMax?: number; laiSuatMax?: number; thoiGianMin?: number };
  /** Thêm cho H17 — lịch sử thay đổi tham số */
  lichSu?: { ngay: string; boi: string; noiDung: string }[];
  luuY: string;
  capNhatBoi: string;
  capNhat: string;
}

export interface Notification {
  id: string;
  advisorMa: string;
  noiDung: string;
  ngay: string;
  daDoc: boolean;
  href?: string;
}

/** Lời chúc TVV gửi nhau trên trang Thành tích (09/09, phương án B): hiện ngay, bộ lọc tự gắn cờ, Quản trị ẩn */
export type TrangThaiLoiChuc = "hien" | "gan-co" | "da-an";
export interface LoiChuc {
  id: string;
  nguoiGuiMa: string;
  nguoiNhanMa: string;
  thangId: string;
  hangMucId: string;
  noiDung: string;
  ngay: string;
  trangThai: TrangThaiLoiChuc;
  /** lý do gắn cờ (tự động) hoặc lý do ẩn (Quản trị / người nhận) */
  lyDoCo?: string;
}

export interface SavedItem {
  id: string;
  advisorMa: string;
  loai: "bai-viet" | "tai-lieu" | "danh-thiep";
  refId: string;
  ngay: string;
}

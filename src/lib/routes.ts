/** Tên miền công khai dùng cho link chia sẻ, QR, đường dẫn thẻ — hằng số để server và trình duyệt vẽ giống nhau (tránh lệch hydration) */
export const SITE_ORIGIN = "https://toantam.chubblife.vn";
export const SITE_HOST = "toantam.chubblife.vn";

/**
 * Bảng mã màn (wireframe Figma page 11/13) → đường dẫn trong demo.
 * Mọi link trong code phải đi qua bảng này: R.E03("0161363"), R.F02("slug")…
 * Nguồn đích của từng nút: thiet-ke/nut-dich.md
 */
export const R = {
  // Chung
  A01: "/",
  S01: (q: string) => `/tim-kiem?q=${encodeURIComponent(q)}`,
  S02: "/khong-tim-thay",
  S03: "/lien-he",
  // Tuyển dụng
  B01: "/toan-tam-tuyen-dung",
  B02: (ma: string) => `/toan-tam-tuyen-dung/da-gui?ma=${ma}`,
  // Vinh danh
  C01: "/toan-tam-dan-dau",
  C02: (hangMuc: string) => `/toan-tam-dan-dau/hang-muc/${hangMuc}`,
  C03: "/toan-tam-dan-dau/cac-bang", // các bảng vinh danh đã công bố (lưu trữ)
  C04: (id: string) => `/toan-tam-dan-dau/bang/${id}`, // C04 = trạng thái của C01 (09/09): cùng thân trang, đầu trang gọn không hero
  // Công cụ
  D01: "/toan-tam-phat-trien",
  D02: "/toan-tam-phat-trien/studio",
  D08: "/toan-tam-phat-trien/studio/mau",
  D07: "/toan-tam-phat-trien/studio/bo-suu-tap",
  D03: "/toan-tam-phat-trien/tai-chinh-ca-nhan",
  D04: "/toan-tam-phat-trien/trac-nghiem",
  D05: "/toan-tam-phat-trien/trac-nghiem/ket-qua",
  D06: "/toan-tam-phat-trien/trac-nghiem/chia-se",
  G04: "/toan-tam-phat-trien/tai-lieu",
  // Danh thiếp
  E01: "/toan-tam-ket-noi",
  E06: (q: string) => `/toan-tam-ket-noi/tim?q=${encodeURIComponent(q)}`,
  E03: (ma: string) => `/${ma}`,
  // Thư viện
  F01: "/toan-tam-chia-se",
  F03: (slug: string) => `/toan-tam-chia-se/chuyen-de/${slug}`,
  F02: (slug: string) => `/toan-tam-chia-se/${slug}`,
  // Tài khoản TVV
  G01: "/dang-nhap",
  G02a: "/tai-khoan",
  G02: "/tai-khoan/da-luu",
  E04: "/tai-khoan/danh-thiep",
  G10: "/tai-khoan/tai-lieu",
  G06: "/tai-khoan/cai-dat",
  // CMS
  H00: "/cms/dang-nhap",
  H01: "/cms",
  H04: "/cms/bai-viet",
  H06: (id: string) => `/cms/bai-viet/${id}`,
  H06new: "/cms/bai-viet/moi",
  H04b: "/cms/bai-viet/chuyen-de",
  H02: "/cms/mau-studio",
  H02a: (id: string) => `/cms/mau-studio/${id}`,
  H07: "/cms/anh-studio",
  H07a: (id: string) => `/cms/anh-studio/${id}`,
  H17: "/cms/tai-chinh-ca-nhan",
  H18: "/cms/trac-nghiem",
  H03: "/cms/vinh-danh",
  H03b: (id: string) => `/cms/vinh-danh/${id}`,
  H03d: (id: string) => `/cms/vinh-danh/${id}/them-tu-excel`,
  H19: "/cms/loi-chuc",
  H09: "/cms/tai-lieu",
  H09a: (id: string) => `/cms/tai-lieu/${id}`,
  H09new: "/cms/tai-lieu/moi",
  H09b: "/cms/tai-lieu/loai",
  H11: "/cms/tu-van-vien",
  H11a: (ma: string) => `/cms/tu-van-vien/${ma}`,
  H11b: (ma?: string) => (ma ? `/cms/tu-van-vien/${ma}/sua` : "/cms/tu-van-vien/moi"),
  H12: "/cms/ung-vien",
  H12a: (id: string) => `/cms/ung-vien/${id}`,
  H16: "/cms/lien-he",
  H16a: (id: string) => `/cms/lien-he/${id}`,
  H13: "/cms/faq",
  H05: "/cms/phan-quyen",
  H05a: (id?: string) => (id ? `/cms/phan-quyen/${id}` : "/cms/phan-quyen/moi"),
  H08: "/cms/bao-cao-bxh",
} as const;

/** 5 tab công khai theo brief §6 — dùng cho nav và footer */
export const TABS = [
  { code: "B01", label: "Toàn Tâm Tuyển Dụng", href: R.B01 },
  { code: "C01", label: "Toàn Tâm Dẫn Đầu", href: R.C01 },
  { code: "D01", label: "Toàn Tâm Phát Triển", href: R.D01 },
  { code: "E01", label: "Toàn Tâm Kết Nối", href: R.E01 },
  { code: "F01", label: "Toàn Tâm Chia Sẻ", href: R.F01 },
] as const;

/** 5 tab khu Trang cá nhân TVV (G02a · G02 · E04 · G10 · G06) */
export const ACCOUNT_TABS = [
  { code: "G02a", label: "Tổng quan", href: R.G02a },
  { code: "G02", label: "Đã lưu", href: R.G02 },
  { code: "E04", label: "Danh thiếp của tôi", href: R.E04 },
  { code: "G10", label: "Tài liệu", href: R.G10 },
  { code: "G06", label: "Tài khoản & cài đặt", href: R.G06 },
] as const;

/** Sidebar CMS 14 mục — đúng thứ tự trên wireframe; `editor: true` = Biên tập được vào */
export const CMS_MENU = [
  { code: "H01", label: "Bảng điều khiển", href: R.H01, editor: true },
  { code: "H04", label: "Bài viết", href: R.H04, editor: true },
  { code: "H02", label: "Mẫu Studio", href: R.H02, editor: true },
  { code: "H07", label: "Ảnh Studio", href: R.H07, editor: false },
  { code: "H17", label: "Tài chính cá nhân", href: R.H17, editor: false },
  { code: "H18", label: "Trắc nghiệm", href: R.H18, editor: true },
  { code: "H03", label: "Vinh danh", href: R.H03, editor: false },
  { code: "H19", label: "Lời chúc", href: R.H19, editor: false },
  { code: "H09", label: "Tài liệu", href: R.H09, editor: true },
  { code: "H11", label: "Tư vấn viên", href: R.H11, editor: false },
  { code: "H12", label: "Ứng viên", href: R.H12, editor: false },
  { code: "H16", label: "Liên hệ", href: R.H16, editor: false },
  { code: "H13", label: "FAQ", href: R.H13, editor: true },
  { code: "H05", label: "Phân quyền", href: R.H05, editor: false },
  { code: "H08", label: "Báo cáo BXH", href: R.H08, editor: false },
] as const;

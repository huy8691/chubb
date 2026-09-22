import type {
  Advisor, Article, Candidate, ChuyenDe, CmsUser, ContactMessage, DocType, Document, FAQ,
  FinanceParams, HangMuc, HonorMonth, NguoiDat, Notification, QuizQuestion, QuizResultType,
  RankingRow, SavedItem, StudioImage, StudioTemplate, Office } from "./types";

/* ---------- Tư vấn viên ---------- */
const HO_TEN = [
  "Nguyễn Minh An", "Trần Thu Hà", "Lê Quốc Huy", "Phạm Kim Ngân", "Võ Thị Lan", "Đặng Hoàng Nam",
  "Bùi Thanh Tâm", "Hoàng Gia Bảo", "Ngô Thị Mỹ Duyên", "Đỗ Anh Tuấn", "Lý Thanh Trúc", "Trịnh Văn Khoa",
  "Mai Phương Thảo", "Huỳnh Đức Thịnh", "Phan Ngọc Hân", "Vũ Minh Quân", "Tạ Thị Hồng", "Lâm Chí Cường",
  "Dương Hải Yến", "Cao Bảo Long",
];
const VAN_PHONG = ["TP. Hồ Chí Minh — Q.1", "Hà Nội — Cầu Giấy", "Đà Nẵng — Hải Châu", "Cần Thơ — Ninh Kiều", "Hải Phòng — Lê Chân"];
/** 5 văn phòng (H11c) — toạ độ để tính "gần bạn" trên E01 */
export const offices: Office[] = [
  { id: "vp-hcm-q1", ten: "TP. Hồ Chí Minh — Q.1", diaChi: "115 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" },
  { id: "vp-hn-cg", ten: "Hà Nội — Cầu Giấy", diaChi: "Tầng 12, 144 Xuân Thuỷ, Cầu Giấy, Hà Nội" },
  { id: "vp-dn-hc", ten: "Đà Nẵng — Hải Châu", diaChi: "38 Bạch Đằng, Hải Châu, Đà Nẵng" },
  { id: "vp-ct-nk", ten: "Cần Thơ — Ninh Kiều", diaChi: "209 đường 30/4, Ninh Kiều, Cần Thơ" },
  { id: "vp-hp-lc", ten: "Hải Phòng — Lê Chân", diaChi: "1 Lê Hồng Phong, Lê Chân, Hải Phòng" },
];
const CHUC_DANH = ["Tư vấn tài chính", "Trưởng nhóm kinh doanh", "Giám đốc kinh doanh khu vực", "Tư vấn tài chính cao cấp"];


/* ---------- Hồ sơ năng lực mẫu (sinh theo chỉ số để mỗi TVV khác nhau) ---------- */
const THE_MANH = ["Bảo vệ thu nhập", "Kế hoạch hưu trí", "Giáo dục cho con", "Bảo vệ gia đình", "Hoạch định tài chính", "Bảo hiểm sức khoẻ", "Doanh nhân & chủ hộ kinh doanh"];
const VAI_TRO = ["Người đồng hành cùng gia đình trẻ", "Người bạn tài chính của chủ doanh nghiệp nhỏ", "Người lập kế hoạch hưu trí an tâm", "Người bảo vệ tương lai học vấn cho con"];
const LOI_NHAN = [
  "Hãy lắng nghe nhiều hơn nói. Khách hàng sẽ cho bạn biết họ cần gì.",
  "Kiên trì mỗi ngày, thành quả sẽ đến.",
  "Làm nghề bằng sự tử tế, khách hàng sẽ ở lại với bạn rất lâu.",
  "Đừng bán sản phẩm, hãy giải một bài toán cho gia đình họ.",
];
function hoSoMau(i: number, hoTen: string): NonNullable<Advisor["hoSoNangLuc"]> {
  const nam = 3 + (i % 12);
  const batDau = 2026 - nam;
  const ten = hoTen.split(" ").slice(-1)[0];
  const mdrt = i % 2 === 1 ? 1 + (i % 5) : 0;
  return {
    gioiThieu: `${nam} năm gắn bó với nghề tư vấn tài chính tại Chubb Life, ${ten} tin rằng mỗi gia đình đều xứng đáng có một kế hoạch bảo vệ phù hợp với hoàn cảnh của mình. Với ${ten}, Toàn Tâm là lắng nghe trước, rồi mới đề xuất giải pháp.`,
    theManh: [THE_MANH[i % 7], THE_MANH[(i + 2) % 7], THE_MANH[(i + 4) % 7]],
    chungChi: ["Chứng chỉ đại lý bảo hiểm nhân thọ", mdrt ? "MDRT" : "Chubb Star"],
    noiBat: [`${nam} năm kinh nghiệm`, mdrt ? `${mdrt} năm đạt MDRT` : "Chubb Star", "Chứng chỉ đại lý bảo hiểm"],
    hanhTrinh: [
      { nam: String(batDau), tieuDe: "CHẬP CHỮNG", moTa: "Bắt đầu hành trình tại Chubb Life Việt Nam với quyết tâm xây dựng một sự nghiệp có thể tự hào." },
      { nam: String(batDau + Math.max(1, Math.floor(nam / 2))), tieuDe: "CHINH PHỤC", moTa: mdrt ? "Danh hiệu MDRT đầu tiên — cột mốc khẳng định cách làm nghề chuyên nghiệp và toàn tâm." : "Danh hiệu Chubb Star đầu tiên — cột mốc khẳng định cách làm nghề chuyên nghiệp và toàn tâm." },
      { nam: "2026", tieuDe: "ĐỒNG HÀNH", moTa: `Tiếp tục đồng hành cùng hơn ${40 + i * 15} gia đình đã tin tưởng.` },
    ],
    loiNhan: LOI_NHAN[i % LOI_NHAN.length],
    vaiTro: VAI_TRO[i % VAI_TRO.length],
    namKinhNghiem: nam,
    namMDRT: mdrt || undefined,
    hienPhan: { hanhTrinh: true, linhVuc: true, google: false },
    capNhat: `2026-08-${String(10 + (i % 18)).padStart(2, "0")}T10:00:00`,
  };
}

export const advisors: Advisor[] = HO_TEN.map((hoTen, i) => {
  const ma = String(161363 + i * 37).padStart(7, "0");
  const first = hoTen.split(" ").slice(-1)[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
  return {
    ma,
    hoTen,
    email: `${first}${i}@chubblife.vn`,
    chucDanh: CHUC_DANH[i % CHUC_DANH.length],
    vanPhong: VAN_PHONG[i % VAN_PHONG.length],
    ngayBatDau: `20${16 + (i % 9)}-0${1 + (i % 9)}-15`,
    soDienThoai: `09${String(12345678 + i * 4321).slice(0, 8)}`,
    zalo: `09${String(12345678 + i * 4321).slice(0, 8)}`,
    avatar: undefined,
    theCongKhai: i !== 7,
    theAnBoi: i === 7 ? "tvv" : undefined,
    hienTrenBXH: true,
    nhanThongBaoEmail: true,
    // Hồ sơ năng lực đầy đủ cho hầu hết TVV; hai người (i = 9, 12) cố ý CHƯA ĐIỀN để thấy trạng thái thẻ tối giản (chủ dự án 08/09: "nhiều TVV ít thông tin")
    hoSoNangLuc: i === 9 || i === 12 ? undefined : hoSoMau(i, hoTen),
    danhHieu: [],
    luotChiaSeThangNay: Math.max(0, 180 - i * 9 + (i % 4) * 3),
    luotXemThangNay: Math.max(0, 347 - i * 13),
    nhanBanTin: true,
    moTuLinkThangNay: Math.max(0, 120 - i * 6),
    dangNhapGanNhat: `2026-09-0${1 + (i % 8)}T09:${String(10 + i).padStart(2, "0")}:00`,
    trangThaiTaiKhoan: "hoat-dong",
  };
});
export const TVV_DEMO = advisors[0]; // Nguyễn Minh An · 0161363 — tài khoản TVV dùng để demo đăng nhập
// Hồ sơ năng lực đầy đủ của TVV demo — đúng nội dung wireframe E03 (hồ sơ đầy đủ) · E02
advisors[0].hoSoNangLuc = {
  gioiThieu: "Tôi tin rằng mỗi gia đình đều xứng đáng có một kế hoạch bảo vệ phù hợp với hoàn cảnh của mình. Suốt 15 năm gắn bó với nghề, tôi luôn chọn cách lắng nghe trước khi đưa ra bất kỳ giải pháp nào. Với tôi, Toàn Tâm là giữ đúng những gì đã cam kết với khách hàng của mình.",
  theManh: ["Bảo vệ gia đình", "Kế hoạch cho con", "Hoạch định tài chính", "Chuẩn bị hưu trí"],
  chungChi: ["Chứng chỉ đại lý bảo hiểm", "MDRT"],
  noiBat: ["15 năm kinh nghiệm", "10 năm liên tiếp MDRT", "Chứng chỉ đại lý bảo hiểm"],
  hanhTrinh: [
    { nam: "2011", tieuDe: "CHẬP CHỮNG", moTa: "Bắt đầu hành trình tại Chubb Life Việt Nam. Bước vào nghề với nhiệt huyết của một người trẻ và quyết tâm xây dựng sự nghiệp mà mình có thể tự hào." },
    { nam: "2016", tieuDe: "CHINH PHỤC", moTa: "Danh hiệu MDRT đầu tiên. Cột mốc giúp tôi nhận ra: làm nghề bằng sự chuyên nghiệp và toàn tâm sẽ tạo nên một sự nghiệp bền vững." },
    { nam: "2020", tieuDe: "DẪN DẮT", moTa: "Trở thành Trưởng nhóm Kinh doanh, đồng hành cùng đội ngũ Tư vấn viên mới." },
    { nam: "2026", tieuDe: "TRỌN ĐỜI", moTa: "10 năm liên tiếp đạt MDRT." },
  ],
  loiNhan: "Đừng đo hành trình của mình bằng tốc độ của người khác. Hãy đo bằng số gia đình đã an tâm hơn vì có bạn đồng hành.",
  vaiTro: "Người đồng hành cùng gia đình trẻ",
  namKinhNghiem: 15,
  namMDRT: 10,
  hienPhan: { hanhTrinh: true, linhVuc: true, google: false },
  capNhat: "2026-09-04T10:00:00",
};
advisors[0].anhBia = "/cover/cover-4.png"; // TVV demo đã chọn một mẫu bìa

/** Mẫu ảnh bìa/banner danh thiếp (Chubb cấp) — TVV chọn ở E04, hiện trên E03; hoặc tải về. */
export const coverTemplates = [
  { id: "cv1", ten: "Toàn Tâm — Xanh", anh: "/cover/cover-1.png" },
  { id: "cv2", ten: "Bảo vệ — Hồng", anh: "/cover/cover-2.png" },
  { id: "cv3", ten: "Đồng hành — Teal", anh: "/cover/cover-3.png" },
  { id: "cv4", ten: "Vững vàng — Gradient", anh: "/cover/cover-4.png" },
];

/* ---------- Vinh danh ---------- */
export const hangMuc: HangMuc[] = [
  { id: "mdrt", ten: "MDRT", hien: true, thuTu: 1 },
  { id: "chubb-star", ten: "Chubb Star", hien: true, thuTu: 2 },
  { id: "chubb-chien", ten: "Chubb Chiến", hien: true, thuTu: 3 },
  { id: "chubb-prime", ten: "Chubb Prime", hien: true, thuTu: 4 },
  { id: "tan-binh", ten: "Tân binh", hien: true, thuTu: 5 }, // dùng trong bảng đột xuất "Tân binh xuất sắc Quý 2/2026"
];

const monthOf = (nam: number, thang: number, trangThai: HonorMonth["trangThai"], shift: number): HonorMonth => {
  const id = `${nam}-${String(thang).padStart(2, "0")}`;
  const nd = (ks: number[]) =>
    ks.map((k, r) => ({ advisorMa: advisors[(k + shift) % advisors.length].ma, thuHang: r + 1, nguon: (r % 5 === 3 ? "tay" : "excel") as NguoiDat["nguon"], doanhSo: (2450 - r * 180 - (thang % 5) * 40 + (k % 3) * 25) * 1_000_000, hopDong: 18 - r + (thang % 3), khachHang: 15 - r + ((thang + k) % 3) }));
  // tháng sau công bố ngày 03 tháng kế tiếp
  const congBoDate = new Date(nam, thang, 3, 10, 0, 0);
  return {
    id, ten: `Tháng ${thang}/${nam}`, thang, nam, tuNgay: `${id}-01`, denNgay: `${id}-${String(new Date(nam, thang, 0).getDate()).padStart(2, "0")}`, trangThai,
    hangMuc: [
      { hangMucId: "mdrt", nguoiDat: nd([0, 1, 2, 3, 4, 5, 6, 7]) },
      { hangMucId: "chubb-star", nguoiDat: nd([8, 9, 10, 11, 12, 13]) },
      { hangMucId: "chubb-chien", nguoiDat: nd([14, 15, 16, 17, 18, 19]) },
      { hangMucId: "chubb-prime", nguoiDat: nd([1, 5, 9, 13]) },
    ],
    capNhat: `${id}-05T10:00:00`,
    congBo: trangThai === "da-cong-bo" ? congBoDate.toISOString() : undefined,
  };
};

/** Bảng vinh danh đột xuất (09/09): tên do Chubb đặt, không theo tháng — minh hoạ mô hình "Bảng vinh danh" */
const nguoiDot = (ks: number[], base: number, hd: number, kh: number): NguoiDat[] =>
  ks.map((k, r) => ({ advisorMa: advisors[k % advisors.length].ma, thuHang: r + 1, nguon: "excel" as const, doanhSo: base - r * 60_000_000, hopDong: hd - r, khachHang: kh - r }));
const bangTanBinh: HonorMonth = {
  id: "tan-binh-q2-2026", ten: "Tân binh xuất sắc Quý 2/2026", nam: 2026, tuNgay: "2026-04-01", denNgay: "2026-06-30", trangThai: "da-cong-bo",
  hangMuc: [{ hangMucId: "tan-binh", nguoiDat: nguoiDot([20, 21, 22, 23, 24, 25], 900_000_000, 9, 8) }, { hangMucId: "chubb-chien", nguoiDat: nguoiDot([26, 27, 28, 29], 1_100_000_000, 22, 19) }],
  capNhat: "2026-07-05T09:00:00", congBo: "2026-07-05T10:00:00",
};

export const honorMonths: HonorMonth[] = [
  monthOf(2026, 9, "nhap", 3),
  monthOf(2026, 8, "da-cong-bo", 0),
  monthOf(2026, 7, "da-cong-bo", 5),
  bangTanBinh,
  monthOf(2026, 6, "da-cong-bo", 2),
  monthOf(2026, 5, "da-cong-bo", 7),
  monthOf(2026, 4, "da-cong-bo", 1),
  monthOf(2026, 3, "da-cong-bo", 4),
  monthOf(2026, 2, "da-cong-bo", 6),
  monthOf(2026, 1, "da-cong-bo", 8),
  monthOf(2025, 12, "da-cong-bo", 9),
  monthOf(2025, 11, "da-cong-bo", 11),
  monthOf(2025, 10, "da-cong-bo", 12),
  monthOf(2025, 9, "da-cong-bo", 13),
  monthOf(2025, 8, "da-cong-bo", 14),
  monthOf(2025, 7, "da-cong-bo", 15),
];

// Danh hiệu của mọi TVV suy từ các bảng đã công bố (09/09: admin quyết, không cần TVV đồng ý)
for (const a of advisors) {
  a.danhHieu = [];
  for (const m of honorMonths) {
    if (m.trangThai !== "da-cong-bo") continue;
    for (const h of m.hangMuc) {
      const nd = h.nguoiDat.find((n) => n.advisorMa === a.ma);
      if (nd) a.danhHieu.push({ id: `dh-${a.ma}-${m.id}-${h.hangMucId}`, ten: `${hangMuc.find((x) => x.id === h.hangMucId)?.ten ?? h.hangMucId} ${m.nam}`, thangId: m.id, hangMucId: h.hangMucId, thuHang: nd.thuHang });
    }
  }
  // gọn: giữ tối đa 3 danh hiệu mới nhất, mỗi hạng mục một lần
  const seen = new Set<string>(); a.danhHieu = a.danhHieu.filter((d) => (seen.has(d.hangMucId) ? false : (seen.add(d.hangMucId), true))).slice(0, 3);
}
// TVV demo: bộ danh hiệu cố định theo wireframe (MDRT 2026 · Chubb Star 2025 · Chubb Chiến 2026)
advisors[0].danhHieu = [
  { id: "dh1", ten: "MDRT 2026", thangId: "2026-08", hangMucId: "mdrt", thuHang: 1 },
  { id: "dh2", ten: "Chubb Star 2025", thangId: "2026-04", hangMucId: "chubb-star", thuHang: 2 },
  { id: "dh3", ten: "Chubb Chiến 2026", thangId: "2026-08", hangMucId: "chubb-chien", thuHang: 3 },
];

/* ---------- Thư viện ---------- */
export const chuyenDe: ChuyenDe[] = [
  { id: "bao-ve", ten: "Toàn Tâm Bảo Vệ", moTa: "Kiến thức bảo vệ tài chính cho gia đình.", slug: "toan-tam-bao-ve", thuTu: 1, hien: true },
  { id: "but-pha", ten: "Toàn Tâm Bứt Phá", moTa: "Câu chuyện nghề và kỹ năng tư vấn.", slug: "toan-tam-but-pha", thuTu: 2, hien: true },
  { id: "the-hien", ten: "Toàn Tâm Thể Hiện", moTa: "Hình ảnh và hoạt động của đội ngũ.", slug: "toan-tam-the-hien", thuTu: 3, hien: true },
  { id: "lan-toa", ten: "Toàn Tâm Lan Toả", moTa: "Cộng đồng và trách nhiệm xã hội.", slug: "toan-tam-lan-toa", thuTu: 4, hien: true },
  { id: "minh-chung", ten: "Minh Chứng Toàn Tâm", moTa: "Câu chuyện khách hàng và quyền lợi thực tế.", slug: "minh-chung-toan-tam", thuTu: 5, hien: true },
];

// 6 bài mỗi chuyên đề (30 bài đã xuất bản) — tiêu đề khớp chủ đề chuyên đề
const BAI_THEO_CD: Record<string, string[]> = {
  "bao-ve": [
    "5 câu hỏi nên đặt ra trước khi mua bảo hiểm nhân thọ", "Lập quỹ giáo dục cho con: bắt đầu từ đâu?",
    "Bảo hiểm sức khoẻ: hiểu đúng về thời gian chờ", "Hưu trí sớm: bài toán 20 năm",
    "Bảo vệ thu nhập trước, tích luỹ sau", "Quỹ dự phòng khẩn cấp nên có bao nhiêu tháng?",
  ],
  "but-pha": [
    "Hành trình từ nhân viên văn phòng đến MDRT", "Kỹ năng lắng nghe trong tư vấn tài chính",
    "Từ kỹ sư đến Trưởng nhóm kinh doanh sau 2 năm", "Bí quyết giữ liên lạc với 300 khách hàng",
    "Nghệ thuật đặt câu hỏi trong buổi tư vấn đầu tiên", "Thói quen làm việc của Tư vấn viên top đầu",
  ],
  "the-hien": [
    "Một ngày làm việc của Tư vấn tài chính Chubb Life", "Đội ngũ Hà Nội chinh phục Fansipan",
    "Ngày hội gia đình Chubb Life 2026", "Chương trình học bổng Toàn Tâm 2026",
    "Xây dựng thương hiệu cá nhân trên mạng xã hội", "Câu chuyện nghề của bạn — tài sản đáng kể",
  ],
  "lan-toa": [
    "Chubb Life trồng 5.000 cây xanh tại Cần Giờ", "Tuần lễ sức khoẻ cộng đồng tại Đà Nẵng",
    "Đứng dậy sau mất mát — hành trình một gia đình", "Nghỉ ngơi không phải là lười biếng",
    "Hiến máu nhân đạo cùng đồng nghiệp Toàn Tâm", "Lớp học tài chính miễn phí cho sinh viên",
  ],
  "minh-chung": [
    "Khách hàng nhận quyền lợi 1,2 tỷ đồng sau 3 năm tham gia", "Vì sao khách hàng chọn tư vấn viên có chứng chỉ MDRT",
    "Câu chuyện chị Lan: bảo vệ thu nhập khi ốm bệnh", "Tham gia bảo hiểm khi đã có bệnh nền",
    "Chi trả viện phí trong 48 giờ — trải nghiệm thật", "Hợp đồng nhân thọ giúp gia đình vượt biến cố",
  ],
};
type BaiSeed = { ten: string; cd: string; trangThai: Article["trangThai"] };
// round-robin theo vòng để "Bài mới nhất" trộn nhiều chuyên đề
const baiXuatBan: BaiSeed[] = [];
for (let r = 0; r < 6; r++) for (const c of chuyenDe) baiXuatBan.push({ ten: BAI_THEO_CD[c.id][r], cd: c.id, trangThai: "da-xuat-ban" });
// 3 bài trạng thái khác cho CMS (không hiện công khai)
const baiKhac: BaiSeed[] = [
  { ten: "Hướng dẫn đọc bảng minh hoạ quyền lợi", cd: "bao-ve", trangThai: "nhap" },
  { ten: "Tổng kết quý 3/2026 của đội Toàn Tâm", cd: "the-hien", trangThai: "da-len-lich" },
  { ten: "Thông báo lịch nghỉ lễ 2/9", cd: "lan-toa", trangThai: "da-go" },
];
const BAI: BaiSeed[] = [...baiXuatBan, ...baiKhac];
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const ARTICLE_IMGS = ["/img/bai-1.jpg", "/img/bai-2.jpg", "/img/bai-3.jpg", "/img/bai-4.jpg", "/img/f01-bai-1.jpg", "/img/f01-bai-3.jpg", "/img/f01-bai-4.jpg", "/img/f01-bai-5.jpg", "/img/f01-bai-6.jpg", "/img/f01-bai-7.jpg", "/img/f01-bai-8.jpg", "/img/bai-lon.jpg"];

export const articles: Article[] = BAI.map((b, i) => {
  const d = new Date(2026, 8, 30); d.setDate(d.getDate() - i * 3);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    id: `bv${i + 1}`,
    slug: slugify(b.ten),
    tieuDe: b.ten,
    sapo: "Bài viết chia sẻ góc nhìn thực tế từ đội ngũ Chubb Life, giúp bạn hiểu rõ hơn về bảo vệ tài chính và nghề tư vấn.",
    thanBai: "## Mở đầu\n\nĐây là nội dung mẫu của bài viết trong bản demo. Đoạn văn được lặp lại để thể hiện độ dài thân bài, mục lục dính và các khối trích dẫn.\n\n> Trích dẫn: \"Toàn tâm với khách hàng là cách bền vững nhất để đi xa trong nghề.\"\n\n## Nội dung chính\n\nMỗi phần của bài viết có tiêu đề H2, đoạn văn, hình ảnh kèm alt và danh sách gạch đầu dòng.\n\n- Điểm thứ nhất\n- Điểm thứ hai\n- Điểm thứ ba\n\n## Kết luận\n\nHãy trao đổi với Tư vấn viên Chubb Life để được hoạch định phù hợp.",
    chuyenDeId: b.cd,
    tacGia: ["Ban biên tập Toàn Tâm", "Trần Thu Hà", "P2P Content"][i % 3],
    anh: ARTICLE_IMGS[i % ARTICLE_IMGS.length],
    altAnh: b.ten,
    ngayXuatBan: b.trangThai === "da-xuat-ban" ? iso : undefined,
    ngayLenLich: b.trangThai === "da-len-lich" ? "2026-09-25" : undefined,
    trangThai: b.trangThai,
    seo: { tieuDe: b.ten.slice(0, 58), moTa: "Chubb Life Toàn Tâm — " + b.ten, duongDan: `/toan-tam-chia-se/${slugify(b.ten)}`, choGoogle: true },
    capNhat: `${iso}T14:00:00`,
    luotXem: 1400 - i * 37,
  };
});

/* ---------- Studio ----------
 * Mô hình mới (theo wireframe H02a): một mẫu = MỘT ảnh nền PNG (toàn bộ thiết kế đã nung vào ảnh:
 * màu, hoạ tiết, bố cục, logo) + các field chữ đặt theo toạ độ + ô ảnh chân dung trong lỗ trong suốt
 * của PNG. Không còn tham số hoá (màu nền, hoạ tiết, khung, tỉ lệ khung, ruy-băng) và không có lịch sử phiên bản.
 * Toạ độ chuẩn lấy từ mẫu prototype "Chubb – Tự Do An Phúc".
 */
const DISCLAIMER_STUDIO = "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo.";
type FStudio = NonNullable<StudioTemplate["fields"]>;
/** An Phúc (16:9 ngang): ô chân dung trái, 3 field navy bên dưới-trái, SĐT có ☎ xanh */
const O_ANPHUC: NonNullable<StudioTemplate["anhChanDung"]> = { xPct: 25.1, yPct: 34.5, dPct: 27.6 };
const FIELDS_ANPHUC: FStudio = [
  { loai: "hoTen", xPct: 24.7, yPct: 66.5, size: 2.8, mau: "#13235f", canLe: "center", gioiHan: 40, dam: true },
  { loai: "chucDanh", xPct: 24.7, yPct: 72.8, size: 1.8, mau: "#5b6270", canLe: "center", gioiHan: 30 },
  { loai: "soDienThoai", xPct: 24.7, yPct: 79.2, size: 2.2, mau: "#13235f", canLe: "center", gioiHan: 15, dam: true, icon: true },
];
/** Mẫu dọc 4:5 (banner nền brand): ô chân dung trên-giữa, 3 field trắng dưới-giữa, tên serif HOA */
const O_DOC: NonNullable<StudioTemplate["anhChanDung"]> = { xPct: 50, yPct: 30, dPct: 41 };
const FIELDS_DOC: FStudio = [
  { loai: "hoTen", xPct: 50, yPct: 73.5, size: 5.4, mau: "#ffffff", canLe: "center", gioiHan: 40, dam: true, serif: true, hoa: true },
  { loai: "chucDanh", xPct: 50, yPct: 82, size: 2.6, mau: "#e6eaf5", canLe: "center", gioiHan: 30 },
  { loai: "soDienThoai", xPct: 50, yPct: 86.5, size: 2.8, mau: "#ffffff", canLe: "center", gioiHan: 15, dam: true },
];
/** Field mặc định cho mẫu KHUNG (ảnh + slogan): Họ tên · Chức danh · SĐT đặt ở vùng trống dưới ô ảnh, căn giữa.
 * mau/mauPhu tuỳ nền sáng-tối (nền sáng → chữ đậm màu; nền tối → trắng). Admin kéo tinh chỉnh trong CMS. */
const khungFields = (mau: string, mauPhu: string): FStudio => [
  { loai: "hoTen", xPct: 50, yPct: 53, size: 4.4, mau, canLe: "center", gioiHan: 40, dam: true },
  { loai: "chucDanh", xPct: 50, yPct: 59, size: 2.5, mau: mauPhu, canLe: "center", gioiHan: 30 },
  { loai: "soDienThoai", xPct: 50, yPct: 65, size: 2.7, mau, canLe: "center", gioiHan: 15, dam: true },
];
/** Helper tạo một mẫu mô hình mới — PNG nền + field + ô chân dung, không tham số hoá */
const mauStudio = (o: { id: string; ten: string; anhNen: string; anh?: string; tiLe?: StudioTemplate["tiLe"]; tyLe?: number; anhSauNen?: boolean; hole?: StudioTemplate["anhChanDung"]; fields?: FStudio; trangThai?: StudioTemplate["trangThai"]; soAnhDaTao?: number; capNhat: string }): StudioTemplate => ({
  id: o.id, ten: o.ten, anh: o.anh ?? o.anhNen, anhNen: o.anhNen, tiLe: o.tiLe ?? "4:5", tyLe: o.tyLe, anhSauNen: o.anhSauNen,
  trangThai: o.trangThai ?? "da-xuat-ban", soAnhDaTao: o.soAnhDaTao ?? 0, capNhat: o.capNhat, phienBan: 1,
  disclaimer: DISCLAIMER_STUDIO, anhChanDung: { ...(o.hole ?? O_DOC) }, fields: (o.fields ?? FIELDS_DOC).map((x) => ({ ...x })),
});
/** Chuẩn Mới — Mở Lối (KV chiến dịch ngang 1.915): ô chân dung TRÒN bên phải (trong vòng sáng), 3 field navy dưới vòng */
const FIELDS_CHUANMOI: FStudio = [
  { loai: "hoTen", xPct: 76, yPct: 69, size: 3.4, mau: "#13235f", canLe: "center", gioiHan: 40, dam: true },
  { loai: "chucDanh", xPct: 76, yPct: 75, size: 2.1, mau: "#13235f", canLe: "center", gioiHan: 30 },
  { loai: "soDienThoai", xPct: 76, yPct: 80, size: 2.5, mau: "#13235f", canLe: "center", gioiHan: 15, dam: true, icon: true },
];
export const studioTemplates: StudioTemplate[] = [
  mauStudio({ id: "m-chuan-moi", ten: "Chuẩn Mới — Mở Lối", anhNen: "/studio/mau-chuan-moi.png", tiLe: "16:9", tyLe: 1735 / 906, anhSauNen: true, hole: { xPct: 76, yPct: 39, dPct: 25.1 }, fields: FIELDS_CHUANMOI, soAnhDaTao: 0, capNhat: "2026-09-22T09:44:00" }),
  mauStudio({ id: "m-anphuc", ten: "Chubb – Tự Do An Phúc", anhNen: "/studio/tu-do-an-phuc.png", anh: "/studio/tu-do-an-phuc-mau.png", tiLe: "16:9", hole: O_ANPHUC, fields: FIELDS_ANPHUC, soAnhDaTao: 0, capNhat: "2026-09-21T09:00:00" }),
  mauStudio({ id: "m-antam", ten: "An tâm hôm nay — Vững vàng tương lai", anhNen: "/studio/khung-antam.png", tiLe: "9:16", tyLe: 1019 / 1543, anhSauNen: true, hole: { xPct: 49.8, yPct: 30.8, dPct: 45.9 }, fields: khungFields("#13235f", "#5b6270"), soAnhDaTao: 156, capNhat: "2026-09-21T10:00:00" }),
  mauStudio({ id: "m-giaiphap", ten: "Giải pháp hôm nay cho cuộc sống tốt đẹp hơn", anhNen: "/studio/khung-giaiphap.png", tiLe: "9:16", tyLe: 466 / 767, anhSauNen: true, hole: { xPct: 56, yPct: 29.5, dPct: 52.2 }, fields: khungFields("#ffffff", "#e6eaf5"), soAnhDaTao: 92, capNhat: "2026-09-21T10:05:00" }),
  mauStudio({ id: "m-baove", ten: "Bảo vệ điều quan trọng", anhNen: "/studio/khung-baove.png", tiLe: "9:16", tyLe: 1019 / 1543, anhSauNen: true, hole: { xPct: 49.9, yPct: 30, dPct: 52 }, fields: khungFields("#ffffff", "#ffe0f0"), soAnhDaTao: 74, capNhat: "2026-09-21T10:10:00" }),
  mauStudio({ id: "m-songantam", ten: "Sống an tâm — Trọn vẹn hơn", anhNen: "/studio/khung-songantam.png", tiLe: "9:16", tyLe: 475 / 769, anhSauNen: true, hole: { xPct: 48.3, yPct: 29.6, dPct: 57.5 }, fields: khungFields("#215c3a", "#5a7a63"), soAnhDaTao: 51, capNhat: "2026-09-21T10:15:00" }),
  mauStudio({ id: "m-gioi-thieu", ten: "Giới thiệu bản thân", anhNen: "/studio/mau-1.png", soAnhDaTao: 214, capNhat: "2026-09-18T09:00:00" }),
  mauStudio({ id: "m-uu-dai", ten: "Ưu đãi tháng", anhNen: "/studio/mau-2.png", soAnhDaTao: 132, capNhat: "2026-09-16T09:00:00" }),
  mauStudio({ id: "m-su-kien", ten: "Sự kiện & hội thảo", anhNen: "/studio/mau-3.png", soAnhDaTao: 88, capNhat: "2026-09-12T09:00:00" }),
  mauStudio({ id: "m-cam-on", ten: "Cảm ơn khách hàng", anhNen: "/studio/mau-4.png", soAnhDaTao: 64, capNhat: "2026-09-10T09:00:00" }),
  mauStudio({ id: "m-la-tvv", ten: "Tôi là Tư vấn viên Chubb Life", anhNen: "/studio/mau-1.png", trangThai: "nhap", soAnhDaTao: 0, capNhat: "2026-09-08T09:00:00" }),
];

export const studioImages: StudioImage[] = Array.from({ length: 41 }, (_, i) => ({
  id: `as${i + 1}`,
  templateId: studioTemplates[i % 2].id,
  advisorMa: i < 3 ? advisors[0].ma : advisors[i % advisors.length].ma, // TVV demo (0161363) có 3 ảnh riêng tư
  anh: `/img/aw-${(i % 8) + 1}.png`,
  tao: `2026-08-${String(1 + (i % 28)).padStart(2, "0")}T10:00:00`,
  trangThai: "rieng-tu", // luồng công khai/duyệt đã bỏ 22/09 — mọi ảnh Studio là riêng tư
  phienBanMau: i % 2 === 0 ? 3 : 2,
}));

/* ---------- Tài liệu ---------- */
export const docTypes: DocType[] = [
  { id: "brochure", ten: "Brochure sản phẩm", moTa: "Tờ rơi giới thiệu sản phẩm cho khách hàng", thuTu: 1 },
  { id: "hinh-anh", ten: "Hình ảnh", moTa: "Ảnh thương hiệu, logo, ảnh sự kiện", thuTu: 2 },
  { id: "bang-minh-hoa", ten: "Bảng minh hoạ quyền lợi", moTa: "Bảng minh hoạ theo sản phẩm", thuTu: 3 },
  { id: "bieu-mau", ten: "Biểu mẫu hồ sơ", moTa: "Mẫu đơn, giấy yêu cầu", thuTu: 4 },
  { id: "huong-dan", ten: "Hướng dẫn quy trình", moTa: "Quy trình nghiệp vụ nội bộ", thuTu: 5 },
];
const DINH_DANG: Document["dinhDang"][] = ["PDF", "PDF", "DOCX", "JPG", "PNG", "PDF"];
export const documents: Document[] = Array.from({ length: 45 }, (_, i) => ({
  id: `tl${i + 1}`,
  ten: ["Brochure Chubb Bảo An Toàn Diện", "Bộ logo Chubb Life 2026", "Bảng minh hoạ quyền lợi — gói Gia đình", "Giấy yêu cầu bảo hiểm (mẫu 2026)", "Hướng dẫn nộp hồ sơ bồi thường", "Tờ rơi Chubb An Tâm Hưu Trí"][i % 6] + (i >= 6 ? ` (${Math.floor(i / 6) + 1})` : ""),
  loaiId: docTypes[i % 5].id,
  dinhDang: DINH_DANG[i % 6],
  kichCo: `${(0.4 + (i % 9) * 0.7).toFixed(1).replace(".", ",")} MB`,
  phienBan: `v${1 + (i % 3)}.${i % 4}`,
  capNhat: `2026-0${1 + (i % 8)}-${String(2 + (i % 26)).padStart(2, "0")}`,
  phan: i < 20 ? "cong-khai" : "tvv",
  trangThai: i === 44 ? "nhap" : i === 43 ? "nhap" : "da-xuat-ban",
  hetHan: i % 7 === 3 ? "2026-08-31" : i % 5 === 0 ? "2026-12-31" : undefined,
  ghiChu: i % 4 === 0 ? "Cập nhật biểu phí quý 3" : undefined,
  moTa: i % 3 === 0 ? "Bản chính thức 2026, dùng khi gặp khách hàng." : undefined,
  tenTep: `${["Brochure_AnTamTronDoi", "Logo_ChubbLife_2026", "BangMinhHoa_GiaDinh", "GiayYeuCau_2026", "HuongDan_BoiThuong", "ToRoi_HuuTri"][i % 6]}_v${1 + (i % 3)}.${i % 4}.${DINH_DANG[i % 6].toLowerCase()}`,
  lichSu: i % 3 === 0 ? [{ ngay: `2026-0${1 + (i % 6)}-10`, phienBan: `v${i % 3}.${i % 4}`, ghiChu: "Bản trước khi cập nhật biểu phí" }, { ngay: "2025-12-02", phienBan: "v1.0", ghiChu: "Bản đầu tiên" }] : undefined,
}));

/* ---------- FAQ ---------- */
export const faqs: FAQ[] = [
  { id: "f1", trang: "tuyen-dung", doiTuong: "ung-vien", cauHoi: "Tôi chưa có kinh nghiệm bảo hiểm, có ứng tuyển được không?", traLoi: "Được. Chubb Life có chương trình đào tạo nền tảng 4 tuần cho người mới.", thuTu: 1, trangThai: "da-xuat-ban", capNhat: "2026-08-01" },
  { id: "f2", trang: "tuyen-dung", doiTuong: "ung-vien", cauHoi: "Thu nhập của Tư vấn viên gồm những gì?", traLoi: "Thu nhập gồm hoa hồng theo hợp đồng và thưởng theo chương trình từng tháng.", thuTu: 2, trangThai: "da-xuat-ban", capNhat: "2026-08-01" },
  { id: "f3", trang: "tuyen-dung", doiTuong: "ung-vien", cauHoi: "Sau khi gửi thông tin, bao lâu tôi được liên hệ?", traLoi: "Đội Tuyển dụng liên hệ trong 3 ngày làm việc.", thuTu: 3, trangThai: "da-xuat-ban", capNhat: "2026-08-01" },
  { id: "f4", trang: "tuyen-dung", doiTuong: "ung-vien", cauHoi: "Tôi có thể làm bán thời gian không?", traLoi: "Có, nhiều Tư vấn viên bắt đầu bán thời gian rồi chuyển toàn thời gian.", thuTu: 4, trangThai: "da-xuat-ban", capNhat: "2026-08-01" },
  { id: "f5", trang: "tuyen-dung", doiTuong: "ung-vien", cauHoi: "Cần bằng cấp gì?", traLoi: "Tốt nghiệp THPT trở lên và vượt qua kỳ thi chứng chỉ đại lý.", thuTu: 5, trangThai: "nhap", capNhat: "2026-09-01" },
  { id: "f6", trang: "lien-he", doiTuong: "khach-hang", cauHoi: "Làm sao tìm Tư vấn viên đang phục vụ tôi?", traLoi: "Vào Toàn Tâm Kết Nối, nhập tên hoặc mã 7 số in trên danh thiếp.", thuTu: 1, trangThai: "da-xuat-ban", capNhat: "2026-08-15" },
  { id: "f7", trang: "lien-he", doiTuong: "khach-hang", cauHoi: "Kiểm tra danh thiếp điện tử thật hay giả?", traLoi: "Danh thiếp thật luôn nằm trên tên miền của Chubb Life và có mã 7 số tra được.", thuTu: 2, trangThai: "da-xuat-ban", capNhat: "2026-08-15" },
  { id: "f8", trang: "lien-he", doiTuong: "ung-vien", cauHoi: "Tôi muốn bắt đầu nghề Tư vấn viên thì làm gì?", traLoi: "Gửi thông tin ở Toàn Tâm Tuyển Dụng, đội Tuyển dụng sẽ liên hệ.", thuTu: 3, trangThai: "da-xuat-ban", capNhat: "2026-08-15" },
  { id: "f9", trang: "lien-he", doiTuong: "tu-van-vien", cauHoi: "Không nhận được mã đăng nhập?", traLoi: "Kiểm tra thư rác; sau 3 lần sai hệ thống khoá 15 phút. Bấm Gửi lại mã hoặc gọi hotline TVV.", thuTu: 4, trangThai: "da-xuat-ban", capNhat: "2026-08-15" },
  { id: "f10", trang: "lien-he", doiTuong: "tu-van-vien", cauHoi: "Thứ hạng chia sẻ được tính thế nào?", traLoi: "1 lượt = 1 lần bấm một nút trong popup Chia sẻ trên danh thiếp của bạn, dù người bấm là bạn hay khách. Bảng xếp hạng chốt theo tháng.", thuTu: 5, trangThai: "da-xuat-ban", capNhat: "2026-08-15" },
  { id: "f11", trang: "lien-he", doiTuong: "tu-van-vien", cauHoi: "Tôi tạo ảnh trong Studio xong thì lưu ở đâu?", traLoi: "Ảnh lưu vào Ảnh Studio của tôi (Trang cá nhân › Đã lưu); bạn tải về máy và tự đăng lên kênh của mình.", thuTu: 6, trangThai: "da-xuat-ban", capNhat: "2026-08-15" },
];

/* ---------- Ứng viên · Liên hệ ---------- */
export const candidates: Candidate[] = Array.from({ length: 14 }, (_, i) => ({
  id: `TD-${String(142 - i).padStart(4, "0")}`,
  hoTen: HO_TEN[(i * 3) % HO_TEN.length].replace(/^\S+/, ["Trương", "Lưu", "Hồ", "Đinh"][i % 4]),
  soDienThoai: `03${String(98765432 - i * 1111).slice(0, 8)}`,
  email: `ungvien${i + 1}@gmail.com`,
  tinhThanh: ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương", "Đồng Nai"][i % 5],
  nguon: ["Người giới thiệu", "Mạng xã hội", "Bạn bè, người thân", "Sự kiện Chubb Life", "Tìm kiếm Google"][i % 5],
  maGioiThieu: i % 5 === 0 ? advisors[i % advisors.length].ma : undefined,
  dongYLienHe: true,
  kinhNghiem: ["Chưa có", "Dưới 1 năm", "1–3 năm", "Trên 3 năm"][i % 4],
  loiNhan: i % 3 === 0 ? "Tôi muốn tìm hiểu thêm về chương trình đào tạo." : undefined,
  gui: `2026-09-0${1 + (i % 8)}T${String(8 + i).padStart(2, "0")}:30:00`,
  trangThai: i < 6 ? "moi" : "da-xem",
}));

export const contactMessages: ContactMessage[] = Array.from({ length: 22 }, (_, i) => ({
  id: `CL-${String(160 - i).padStart(4, "0")}`,
  banLa: (["khach-hang", "ung-vien", "tu-van-vien"] as const)[i % 3],
  hoTen: HO_TEN[(i * 7) % HO_TEN.length],
  lienHe: i % 2 ? `lienhe${i}@gmail.com` : `09${String(11223344 + i * 991).slice(0, 8)}`,
  chuDe: ["Tìm Tư vấn viên", "Kiểm tra danh thiếp", "Ứng tuyển", "Mã đăng nhập", "Góp ý website", "Khác"][i % 6],
  noiDung: "Chào Chubb Life, tôi cần được hỗ trợ về nội dung nêu ở chủ đề. Vui lòng liên hệ lại theo thông tin bên trên. Xin cảm ơn.",
  dinhKem: i % 5 === 0 ? "anh-danh-thiep.jpg" : undefined,
  dongYLienHe: true,
  gui: `2026-09-0${1 + (i % 8)}T${String(7 + (i % 12)).padStart(2, "0")}:15:00`,
  trangThai: i < 14 ? "chua-xem" : i < 19 ? "da-xem" : "da-tra-loi",
}));

/* ---------- Người dùng CMS ---------- */
export const cmsUsers: CmsUser[] = [
  { id: "u1", hoTen: "Trần Thu Hà", email: "thuha@chubblife.vn", vai: "admin", trangThai: "hoat-dong", dangNhapGanNhat: "2026-09-08T08:40:00" },
  { id: "u2", hoTen: "Lê Quốc Huy", email: "quochuy@chubblife.vn", vai: "admin", trangThai: "hoat-dong", dangNhapGanNhat: "2026-09-07T17:05:00" },
  { id: "u3", hoTen: "Phạm Kim Ngân", email: "kimngan@chubblife.vn", vai: "editor", trangThai: "hoat-dong", dangNhapGanNhat: "2026-09-08T09:12:00" },
  { id: "u4", hoTen: "Nguyễn Minh An", email: "minhan@p2p.vn", vai: "editor", trangThai: "hoat-dong", dangNhapGanNhat: "2026-09-06T15:00:00" },
];
export const ADMIN_DEMO = cmsUsers[0];
export const EDITOR_DEMO = cmsUsers[2];

/* ---------- Bảng xếp hạng chia sẻ ---------- */
const NUT: RankingRow["nutBamNhieuNhat"][] = ["Zalo", "Facebook", "Sao chép link", "QR"];
export const ranking: RankingRow[] = advisors.map((a, i) => ({
  advisorMa: a.ma,
  luotDuocTinh: a.luotChiaSeThangNay,
  luotKhongHopLe: i === 4 ? 38 : i === 9 ? 12 : i % 5 === 0 ? 3 : 0,
  nutBamNhieuNhat: NUT[i % 4],
  moTuLink: a.moTuLinkThangNay,
}));
/* ---------- Trắc nghiệm ---------- */
export const quizResultTypes: QuizResultType[] = [
  { id: "dong-hanh", ten: "Người đồng hành", huyHieu: "🤝", diemManh: "Lắng nghe, kiên nhẫn, xây dựng niềm tin lâu dài.", phongCach: "Chăm sóc khách hàng bền bỉ", phuHopVoi: "Tư vấn cá nhân và gia đình", dinhHuong: "Bạn phù hợp với lộ trình Tư vấn tài chính, phát triển tệp khách hàng thân thiết." },
  { id: "hoach-dinh", ten: "Nhà hoạch định", huyHieu: "📐", diemManh: "Phân tích, lập kế hoạch, cẩn trọng với số liệu.", phongCach: "Tư vấn theo kế hoạch tài chính", phuHopVoi: "Khách hàng doanh nhân, hưu trí", dinhHuong: "Bạn nên theo hướng chuyên gia hoạch định tài chính với chứng chỉ chuyên sâu." },
  { id: "ket-noi", ten: "Người kết nối", huyHieu: "🌐", diemManh: "Giao tiếp rộng, tạo mạng lưới nhanh.", phongCach: "Mở rộng khách hàng qua cộng đồng", phuHopVoi: "Sự kiện, hội thảo, nhóm", dinhHuong: "Bạn hợp với vai trò phát triển thị trường và xây dựng đội nhóm." },
  { id: "dan-dat", ten: "Người dẫn dắt", huyHieu: "🚀", diemManh: "Quyết đoán, truyền cảm hứng, hướng mục tiêu.", phongCach: "Xây dựng và dẫn dắt đội nhóm", phuHopVoi: "Lộ trình quản lý kinh doanh", dinhHuong: "Bạn phù hợp lộ trình Trưởng nhóm rồi Giám đốc kinh doanh khu vực." },
];
const MAP: string[][] = [
  ["dong-hanh", "hoach-dinh", "ket-noi"], ["ket-noi", "dong-hanh", "dan-dat"], ["dong-hanh", "dan-dat", "hoach-dinh"],
  ["hoach-dinh", "dong-hanh", "ket-noi"], ["dan-dat", "ket-noi", "dong-hanh"], ["ket-noi", "hoach-dinh", "dan-dat"],
  ["hoach-dinh", "dong-hanh", "dan-dat"], ["dong-hanh", "ket-noi", "hoach-dinh"], ["dan-dat", "hoach-dinh", "ket-noi"],
  ["ket-noi", "dan-dat", "dong-hanh"], ["hoach-dinh", "ket-noi", "dan-dat"], ["dong-hanh", "dan-dat", "ket-noi"],
];
const CAU_HOI = [
  "Khi gặp một người lạ ở sự kiện, bạn thường…", "Cuối tuần lý tưởng của bạn là…", "Khi bạn bè gặp khó khăn tài chính, bạn…",
  "Điều khiến bạn hào hứng nhất trong công việc là…", "Khi nhóm không đạt mục tiêu, bạn…", "Bạn giữ liên lạc với mọi người bằng cách…",
  "Trước một quyết định lớn, bạn…", "Bạn thích được ghi nhận vì…", "Khi khách hàng từ chối, bạn…",
  "Bạn chọn học thêm điều gì trong 3 tháng tới?", "Cách bạn quản lý thời gian…", "Bạn mong công việc mang lại…",
];
const DAP_AN = [
  ["Hỏi thăm và lắng nghe câu chuyện của họ", "Tìm hiểu họ làm gì để xem có hợp tác được không", "Giới thiệu và kết nối họ với người khác"],
  ["Ở nhà với gia đình", "Lập kế hoạch cho tuần tới", "Đi gặp gỡ nhóm bạn"],
  ["Ngồi nghe và động viên", "Đứng ra sắp xếp giúp", "Cùng phân tích các phương án"],
];
export const quizQuestions: QuizQuestion[] = CAU_HOI.map((cauHoi, i) => ({
  id: `q${i + 1}`,
  cauHoi,
  dapAn: MAP[i].map((kieuId, k) => ({ text: DAP_AN[i % 3][k], kieuId })),
  thuTu: i + 1,
  hien: true,
}));

/* ---------- Tài chính cá nhân ---------- */
export const financeParams: FinanceParams = {
  laiSuatMacDinh: 5,
  tyLeTietKiemGoiY: 20,
  thoiGianMacDinh: 10,
  mucTieu: [
    { id: "mua-xe", ten: "Mua xe", soTienGoiY: 600_000_000 },
    { id: "mua-nha", ten: "Mua nhà", soTienGoiY: 2_500_000_000 },
    { id: "ket-hon", ten: "Kết hôn", soTienGoiY: 300_000_000 },
    { id: "du-hoc", ten: "Du học", soTienGoiY: 1_200_000_000 },
    { id: "khac", ten: "Khác", soTienGoiY: 0 },
  ],
  gioiHan: { thuNhapMin: 1_000_000, thuNhapMax: 1_000_000_000, thoiGianMax: 40, tyLeMax: 80, laiSuatMax: 15, thoiGianMin: 1 },
  luuY: "(*) Bảng tính chỉ mang tính tham khảo, không phải cam kết lợi nhuận.",
  capNhatBoi: "Trần Thu Hà",
  capNhat: "2026-08-20T10:00:00",
  lichSu: [
    { ngay: "2026-08-20T10:24:00", boi: "Trần Thu Hà", noiDung: "Đổi lãi suất mặc định 4,5% thành 5%." },
    { ngay: "2026-08-05T09:10:00", boi: "Lê Quốc Huy", noiDung: "Thêm mục tiêu Du học 1,2 tỷ." },
    { ngay: "2026-08-01T08:00:00", boi: "Trần Thu Hà", noiDung: "Tạo bộ tham số ban đầu." },
  ],
};

/* ---------- Thông báo · Đã lưu (TVV demo) ---------- */
export const notifications: Notification[] = [
  { id: "n1", advisorMa: TVV_DEMO.ma, noiDung: "Bạn được vinh danh Chubb Chiến · Tháng 8/2026 — bảng đã công bố.", ngay: "2026-09-06T09:00:00", daDoc: false, href: "/tai-khoan" },
  { id: "n2", advisorMa: TVV_DEMO.ma, noiDung: 'Ảnh "Ưu đãi tháng 8" bị từ chối · xem lý do', ngay: "2026-09-04T15:20:00", daDoc: false, href: "/tai-khoan/da-luu" },
  { id: "n3", advisorMa: TVV_DEMO.ma, noiDung: "Bảng xếp hạng tháng 8/2026 đã chốt: bạn xếp hạng 1.", ngay: "2026-09-01T08:00:00", daDoc: true, href: "/toan-tam-ket-noi" },
  { id: "n4", advisorMa: TVV_DEMO.ma, noiDung: "Tài liệu mới: Brochure Chubb Bảo An Toàn Diện v2.1", ngay: "2026-08-28T10:00:00", daDoc: true, href: "/tai-khoan/tai-lieu" },
];

export const savedItems: SavedItem[] = [
  { id: "s1", advisorMa: TVV_DEMO.ma, loai: "bai-viet", refId: "bv1", ngay: "2026-09-02" },
  { id: "s2", advisorMa: TVV_DEMO.ma, loai: "bai-viet", refId: "bv6", ngay: "2026-08-30" },
];

/* ---------- Tiện ích ---------- */
export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");
export const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "—");
export const fmtVND = (n: number) => n.toLocaleString("vi-VN") + " ₫";
export const fmtNum = (n: number) => n.toLocaleString("vi-VN");
/** Tên bảng vinh danh ("Tháng 8/2026", "Tân binh xuất sắc Quý 2/2026") — giữ tên hàm cũ để không đổi mã khắp nơi */
export const thangLabel = (m: HonorMonth) => m.ten;
/** "1–31/8/2026" · "1/4–30/6/2026" · "" nếu bảng không ghi thời gian */
export const thoiGianLabel = (m: HonorMonth) => {
  if (!m.tuNgay || !m.denNgay) return "";
  const [y1, m1, d1] = m.tuNgay.split("-").map(Number), [y2, m2, d2] = m.denNgay.split("-").map(Number);
  if (y1 === y2 && m1 === m2) return `${d1}–${d2}/${m1}/${y1}`;
  if (y1 === y2) return `${d1}/${m1}–${d2}/${m2}/${y1}`;
  return `${d1}/${m1}/${y1}–${d2}/${m2}/${y2}`;
};

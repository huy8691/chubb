import type {
  Advisor, Article, Candidate, ChuyenDe, CmsUser, ContactMessage, DocType, Document, FAQ,
  FinanceParams, FlaggedRow, HangMuc, HonorMonth, NguoiDat, Notification, QuizQuestion, QuizResultType,
  RankingRow, SavedItem, StudioImage, StudioTemplate, LoiChuc } from "./types";

/* ---------- Tư vấn viên ---------- */
const HO_TEN = [
  "Nguyễn Minh An", "Trần Thu Hà", "Lê Quốc Huy", "Phạm Kim Ngân", "Võ Thị Lan", "Đặng Hoàng Nam",
  "Bùi Thanh Tâm", "Hoàng Gia Bảo", "Ngô Thị Mỹ Duyên", "Đỗ Anh Tuấn", "Lý Thanh Trúc", "Trịnh Văn Khoa",
  "Mai Phương Thảo", "Huỳnh Đức Thịnh", "Phan Ngọc Hân", "Vũ Minh Quân", "Tạ Thị Hồng", "Lâm Chí Cường",
  "Dương Hải Yến", "Cao Bảo Long",
];
const VAN_PHONG = ["TP. Hồ Chí Minh — Q.1", "Hà Nội — Cầu Giấy", "Đà Nẵng — Hải Châu", "Cần Thơ — Ninh Kiều", "Hải Phòng — Lê Chân"];
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
const KHACH = ["Chị H., Quận 7", "Anh T., Bình Thạnh", "Cô L., Thủ Đức", "Anh P., Hà Đông", "Chị M., Hải Châu", "Gia đình anh K., Ninh Kiều"];
const TRICH = [
  "Giải thích rất rõ ràng, không giục tôi quyết định. Ba năm sau tôi vẫn thấy đó là lựa chọn đúng.",
  "Điều tôi yên tâm nhất là mỗi lần cần hỏi gì, gọi là có người nghe máy.",
  "Hồ sơ của gia đình tôi được hỗ trợ đến khi xong, không phải tự mò mẫm.",
  "Tư vấn đúng nhu cầu, không ép mua thêm. Rất trân trọng.",
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
    chungMinh: [0, 1, 2].map((k) => ({ trichDan: TRICH[(i + k) % TRICH.length], ten: KHACH[(i + k) % KHACH.length] })),
    vaiTro: VAI_TRO[i % VAI_TRO.length],
    namKinhNghiem: nam,
    namMDRT: mdrt || undefined,
    hienPhan: { hanhTrinh: true, nhanXet: true, linhVuc: true, google: false },
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
  chungMinh: [
    { trichDan: "Chị An giải thích rất rõ ràng, không giục tôi quyết định. Ba năm sau tôi vẫn thấy đó là lựa chọn đúng.", ten: "Chị H., Quận 7" },
    { trichDan: "Điều tôi yên tâm nhất là mỗi lần cần hỏi gì, gọi là có người nghe máy.", ten: "Anh T., Bình Thạnh" },
    { trichDan: "Hồ sơ của gia đình tôi được hỗ trợ đến khi xong, không phải tự mò mẫm.", ten: "Cô L., Thủ Đức" },
  ],
  vaiTro: "Người đồng hành cùng gia đình trẻ",
  namKinhNghiem: 15,
  namMDRT: 10,
  hienPhan: { hanhTrinh: true, nhanXet: true, linhVuc: true, google: false },
  capNhat: "2026-09-04T10:00:00",
};

/* ---------- Vinh danh ---------- */
export const hangMuc: HangMuc[] = [
  { id: "mdrt", ten: "MDRT", hien: true, thuTu: 1 },
  { id: "chubb-star", ten: "Chubb Star", hien: true, thuTu: 2 },
  { id: "chubb-chien", ten: "Chubb Chiến", hien: true, thuTu: 3 },
  { id: "chubb-prime", ten: "Chubb Prime", hien: true, thuTu: 4 },
];

const monthOf = (nam: number, thang: number, trangThai: HonorMonth["trangThai"], shift: number): HonorMonth => {
  const id = `${nam}-${String(thang).padStart(2, "0")}`;
  const nd = (ks: number[], cho: (r: number) => boolean) =>
    ks.map((k, r) => ({ advisorMa: advisors[(k + shift) % advisors.length].ma, thuHang: r + 1, dongYCongKhai: (cho(r) ? "cho" : "dong-y") as NguoiDat["dongYCongKhai"], nguon: (r % 5 === 3 ? "tay" : "excel") as NguoiDat["nguon"], doanhSo: (2450 - r * 180 - (thang % 5) * 40 + (k % 3) * 25) * 1_000_000, hopDong: 18 - r + (thang % 3), khachHang: 15 - r + ((thang + k) % 3) }));
  // tháng sau công bố ngày 03 tháng kế tiếp
  const congBoDate = new Date(nam, thang, 3, 10, 0, 0);
  return {
    id, thang, nam, trangThai,
    hangMuc: [
      { hangMucId: "mdrt", nguoiDat: nd([0, 1, 2, 3, 4, 5, 6, 7], (r) => r === 2 && trangThai === "nhap") },
      { hangMucId: "chubb-star", nguoiDat: nd([8, 9, 10, 11, 12, 13], () => false) },
      { hangMucId: "chubb-chien", nguoiDat: nd([14, 15, 16, 17, 18, 19], (r) => r === 0 && trangThai === "nhap") },
      { hangMucId: "chubb-prime", nguoiDat: nd([1, 5, 9, 13], () => false) },
    ],
    capNhat: `${id}-05T10:00:00`,
    congBo: trangThai === "da-cong-bo" ? congBoDate.toISOString() : undefined,
  };
};

export const honorMonths: HonorMonth[] = [
  monthOf(2026, 9, "nhap", 3),
  monthOf(2026, 8, "da-cong-bo", 0),
  monthOf(2026, 7, "da-cong-bo", 5),
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

// Danh hiệu của mọi TVV suy từ các tháng đã công bố (chỉ người đã đồng ý công khai)
for (const a of advisors) {
  a.danhHieu = [];
  for (const m of honorMonths) {
    if (m.trangThai !== "da-cong-bo") continue;
    for (const h of m.hangMuc) {
      const nd = h.nguoiDat.find((n) => n.advisorMa === a.ma && n.dongYCongKhai === "dong-y");
      if (nd) a.danhHieu.push({ id: `dh-${a.ma}-${m.id}-${h.hangMucId}`, ten: `${hangMuc.find((x) => x.id === h.hangMucId)?.ten ?? h.hangMucId} ${m.nam}`, thangId: m.id, hangMucId: h.hangMucId, thuHang: nd.thuHang, congKhai: "da-cong-khai" });
    }
  }
  // gọn: giữ tối đa 3 danh hiệu mới nhất, mỗi hạng mục một lần
  const seen = new Set<string>(); a.danhHieu = a.danhHieu.filter((d) => (seen.has(d.hangMucId) ? false : (seen.add(d.hangMucId), true))).slice(0, 3);
}
// TVV demo: bộ danh hiệu cố định theo wireframe (MDRT 2026 · Chubb Star 2025 · Chubb Chiến 9/2026 chờ đồng ý)
advisors[0].danhHieu = [
  { id: "dh1", ten: "MDRT 2026", thangId: "2026-08", hangMucId: "mdrt", thuHang: 1, congKhai: "da-cong-khai" },
  { id: "dh2", ten: "Chubb Star 2025", thangId: "2026-04", hangMucId: "chubb-star", thuHang: 2, congKhai: "da-cong-khai" },
  { id: "dh3", ten: "Chubb Chiến tháng 9/2026", thangId: "2026-09", hangMucId: "chubb-chien", thuHang: 3, congKhai: "cho-dong-y" },
];

/* ---------- Thư viện ---------- */
export const chuyenDe: ChuyenDe[] = [
  { id: "bao-ve", ten: "Toàn Tâm Bảo Vệ", moTa: "Kiến thức bảo vệ tài chính cho gia đình.", slug: "toan-tam-bao-ve", thuTu: 1, hien: true },
  { id: "but-pha", ten: "Toàn Tâm Bứt Phá", moTa: "Câu chuyện nghề và kỹ năng tư vấn.", slug: "toan-tam-but-pha", thuTu: 2, hien: true },
  { id: "the-hien", ten: "Toàn Tâm Thể Hiện", moTa: "Hình ảnh và hoạt động của đội ngũ.", slug: "toan-tam-the-hien", thuTu: 3, hien: true },
  { id: "lan-toa", ten: "Toàn Tâm Lan Toả", moTa: "Cộng đồng và trách nhiệm xã hội.", slug: "toan-tam-lan-toa", thuTu: 4, hien: true },
  { id: "minh-chung", ten: "Minh Chứng Toàn Tâm", moTa: "Câu chuyện khách hàng và quyền lợi thực tế.", slug: "minh-chung-toan-tam", thuTu: 5, hien: true },
];

const TIEU_DE = [
  "5 câu hỏi nên đặt ra trước khi mua bảo hiểm nhân thọ", "Hành trình từ nhân viên văn phòng đến MDRT",
  "Một ngày làm việc của Tư vấn tài chính Chubb Life", "Chubb Life trồng 5.000 cây xanh tại Cần Giờ",
  "Khách hàng nhận quyền lợi 1,2 tỷ đồng sau 3 năm tham gia", "Lập quỹ giáo dục cho con: bắt đầu từ đâu?",
  "Kỹ năng lắng nghe trong tư vấn tài chính", "Đội ngũ Hà Nội chinh phục Fansipan", "Ngày hội gia đình Chubb Life 2026",
  "Bảo hiểm sức khoẻ: hiểu đúng về thời gian chờ", "Từ kỹ sư đến Trưởng nhóm kinh doanh sau 2 năm", "Câu chuyện chị Lan: bảo vệ thu nhập khi ốm bệnh",
  "Chương trình học bổng Toàn Tâm 2026", "Hưu trí sớm: bài toán 20 năm", "Vì sao khách hàng chọn tư vấn viên có chứng chỉ MDRT",
  "Tham gia bảo hiểm khi đã có bệnh nền", "Tuần lễ sức khoẻ cộng đồng tại Đà Nẵng", "Bí quyết giữ liên lạc với 300 khách hàng",
];
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const ARTICLE_IMGS = ["/img/bai-1.jpg", "/img/bai-2.jpg", "/img/bai-3.jpg", "/img/bai-4.jpg", "/img/f01-bai-1.jpg", "/img/f01-bai-3.jpg", "/img/f01-bai-4.jpg", "/img/f01-bai-5.jpg", "/img/f01-bai-6.jpg", "/img/f01-bai-7.jpg", "/img/f01-bai-8.jpg", "/img/bai-lon.jpg"];

export const articles: Article[] = TIEU_DE.map((tieuDe, i) => {
  const cd = chuyenDe[i % 5];
  const trangThai: Article["trangThai"] = i === 16 ? "nhap" : i === 17 ? "da-len-lich" : i === 15 ? "da-go" : "da-xuat-ban";
  return {
    id: `bv${i + 1}`,
    slug: slugify(tieuDe),
    tieuDe,
    sapo: "Bài viết chia sẻ góc nhìn thực tế từ đội ngũ Chubb Life, giúp bạn hiểu rõ hơn về bảo vệ tài chính và nghề tư vấn.",
    thanBai: "## Mở đầu\n\nĐây là nội dung mẫu của bài viết trong bản demo. Đoạn văn được lặp lại để thể hiện độ dài thân bài, mục lục dính và các khối trích dẫn.\n\n> Trích dẫn: \"Toàn tâm với khách hàng là cách bền vững nhất để đi xa trong nghề.\"\n\n## Nội dung chính\n\nMỗi phần của bài viết có tiêu đề H2, đoạn văn, hình ảnh kèm alt và danh sách gạch đầu dòng.\n\n- Điểm thứ nhất\n- Điểm thứ hai\n- Điểm thứ ba\n\n## Kết luận\n\nHãy trao đổi với Tư vấn viên Chubb Life để được hoạch định phù hợp.",
    chuyenDeId: cd.id,
    tacGia: ["Ban biên tập Toàn Tâm", "Trần Thu Hà", "P2P Content"][i % 3],
    anh: ARTICLE_IMGS[i % ARTICLE_IMGS.length],
    altAnh: tieuDe,
    ngayXuatBan: trangThai === "da-xuat-ban" ? `2026-0${1 + (i % 8)}-${String(3 + i).padStart(2, "0")}` : undefined,
    ngayLenLich: trangThai === "da-len-lich" ? "2026-09-15" : undefined,
    trangThai,
    seo: { tieuDe: tieuDe.slice(0, 58), moTa: "Chubb Life Toàn Tâm — " + tieuDe, duongDan: `/toan-tam-chia-se/${slugify(tieuDe)}`, choGoogle: true },
    capNhat: `2026-08-${String(3 + i).padStart(2, "0")}T14:00:00`,
    luotXem: 1200 - i * 47,
  };
});

/* ---------- Studio ---------- */
export const studioTemplates: StudioTemplate[] = [
  { id: "m1", ten: "Chúc mừng năm mới", anh: "/img/d01-m1.jpg", tiLe: "4:5", trangThai: "da-xuat-ban", soAnhDaTao: 214, capNhat: "2026-08-01T09:00:00", phienBan: 3, disclaimer: "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo.", mauNen: "#000ECC", khungAnh: "tron", tiLeKhung: 40, truong: { hoTen: true, chucDanh: true, soDienThoai: true, gioiThieu: false } },
  { id: "m2", ten: "Cảm ơn khách hàng", anh: "/img/d01-m2.jpg", tiLe: "1:1", trangThai: "da-xuat-ban", soAnhDaTao: 98, capNhat: "2026-07-12T09:00:00", phienBan: 2, disclaimer: "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo.", mauNen: "#000066", khungAnh: "vuong", tiLeKhung: 45, truong: { hoTen: true, chucDanh: true, soDienThoai: true, gioiThieu: false } },
  { id: "m3", ten: "Tôi là Tư vấn viên Chubb Life", anh: "/img/d01-m3.jpg", tiLe: "9:16", trangThai: "nhap", soAnhDaTao: 0, capNhat: "2026-09-02T09:00:00", phienBan: 1, disclaimer: "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo.", mauNen: "#FC0386", khungAnh: "tron", tiLeKhung: 40, truong: { hoTen: true, chucDanh: true, soDienThoai: true, gioiThieu: true } },
  { id: "m4", ten: "Vinh danh tháng", anh: "/img/d01-m4.jpg", tiLe: "1:1", trangThai: "luu-tru", soAnhDaTao: 41, capNhat: "2026-05-20T09:00:00", phienBan: 1, disclaimer: "Sản phẩm bảo hiểm do Chubb Life Việt Nam cung cấp. Thông tin mang tính tham khảo.", mauNen: "#FFA300", khungAnh: "tron", tiLeKhung: 40, truong: { hoTen: true, chucDanh: false, soDienThoai: false, gioiThieu: false } },
];

export const studioImages: StudioImage[] = Array.from({ length: 41 }, (_, i) => ({
  id: `as${i + 1}`,
  templateId: studioTemplates[i % 2].id,
  advisorMa: advisors[i % advisors.length].ma,
  anh: `/img/aw-${(i % 8) + 1}.png`,
  tao: `2026-08-${String(1 + (i % 28)).padStart(2, "0")}T10:00:00`,
  trangThai: i < 6 ? "cho-duyet" : i < 30 ? "da-duyet" : i === 30 ? "bi-tu-choi" : "rieng-tu",
  lyDoTuChoi: i === 30 ? "Ảnh mờ, không thấy rõ logo Chubb Life." : undefined,
  dongYCongKhai: i < 31,
  ngayDuyet: i >= 6 && i < 30 ? `2026-08-${String(2 + (i % 26)).padStart(2, "0")}T15:00:00` : undefined,
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
  { id: "f10", trang: "lien-he", doiTuong: "tu-van-vien", cauHoi: "Thứ hạng chia sẻ được tính thế nào?", traLoi: "1 lượt = 1 lần bấm nút Chia sẻ trên danh thiếp; cùng thiết bị, cùng nút trong 30 phút tính 1.", thuTu: 5, trangThai: "da-xuat-ban", capNhat: "2026-08-15" },
  { id: "f11", trang: "lien-he", doiTuong: "tu-van-vien", cauHoi: "Ảnh Studio của tôi bao lâu được duyệt vào Bộ sưu tập?", traLoi: "Quản trị duyệt trong 2 ngày làm việc; kết quả báo ở Thông báo.", thuTu: 6, trangThai: "da-xuat-ban", capNhat: "2026-08-15" },
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
export const flaggedRows: FlaggedRow[] = [
  { id: "cờ1", advisorMa: advisors[4].ma, lyDo: "Cùng IP bấm 38 lượt trong 5 phút", soLuot: 38, ip: "113.161.xx.xx", nut: "Sao chép link", thoiGian: "2026-09-06 21:14–21:19", luotMo: 3, theoNut: [{ nut: "Sao chép liên kết", so: 36 }, { nut: "Zalo", so: 2 }, { nut: "Facebook", so: 0 }, { nut: "Tải ảnh", so: 0 }, { nut: "QR", so: 0 }] },
  { id: "cờ2", advisorMa: advisors[9].ma, lyDo: "Vượt ngưỡng 200 lượt/ngày", soLuot: 212, ip: "nhiều IP", nut: "Zalo", thoiGian: "2026-09-05 21:10–21:50", luotMo: 0, theoNut: [{ nut: "Zalo", so: 198 }, { nut: "Facebook", so: 10 }, { nut: "Sao chép liên kết", so: 4 }, { nut: "Tải ảnh", so: 0 }, { nut: "QR", so: 0 }] },
  { id: "cờ3", advisorMa: advisors[13].ma, lyDo: "Lượt từ thiết bị test nội bộ", soLuot: 12, ip: "10.0.0.x", nut: "QR", thoiGian: "2026-09-02 09:00–09:03", luotMo: 0, theoNut: [{ nut: "QR", so: 12 }, { nut: "Zalo", so: 0 }, { nut: "Facebook", so: 0 }, { nut: "Sao chép liên kết", so: 0 }, { nut: "Tải ảnh", so: 0 }] },
  { id: "cờ0", advisorMa: advisors[2].ma, lyDo: "Cùng thiết bị lặp 20 lượt", soLuot: 20, ip: "171.244.xx.xx", nut: "Facebook", thoiGian: "2026-09-01", daXuLy: { quyetDinh: "loai", soLuotLoai: 20, boi: "Trần Thu Hà", ngay: "2026-09-02", ghiChu: "Lặp liên tục, không có lượt mở." } },
];

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
  { id: "n1", advisorMa: TVV_DEMO.ma, noiDung: "Chubb Life xin bạn đồng ý công khai danh hiệu Chubb Chiến tháng 9/2026.", ngay: "2026-09-06T09:00:00", daDoc: false, href: "/tai-khoan" },
  { id: "n5", advisorMa: TVV_DEMO.ma, noiDung: `${advisors[1].hoTen} gửi lời chúc cho danh hiệu MDRT tháng 8/2026`, ngay: "2026-09-03T14:20:00", daDoc: false, href: `/toan-tam-dan-dau/hang-muc/${TVV_DEMO.ma}?thang=2026-08&hm=mdrt` },
  { id: "n2", advisorMa: TVV_DEMO.ma, noiDung: 'Ảnh "Ưu đãi tháng 8" bị từ chối · xem lý do', ngay: "2026-09-04T15:20:00", daDoc: false, href: "/tai-khoan/da-luu" },
  { id: "n3", advisorMa: TVV_DEMO.ma, noiDung: "Bảng xếp hạng tháng 8/2026 đã chốt: bạn xếp hạng 1.", ngay: "2026-09-01T08:00:00", daDoc: true, href: "/toan-tam-ket-noi" },
  { id: "n4", advisorMa: TVV_DEMO.ma, noiDung: "Tài liệu mới: Brochure Chubb Bảo An Toàn Diện v2.1", ngay: "2026-08-28T10:00:00", daDoc: true, href: "/tai-khoan/tai-lieu" },
];

export const savedItems: SavedItem[] = [
  { id: "s1", advisorMa: TVV_DEMO.ma, loai: "bai-viet", refId: "bv1", ngay: "2026-09-02" },
  { id: "s2", advisorMa: TVV_DEMO.ma, loai: "bai-viet", refId: "bv6", ngay: "2026-08-30" },
  { id: "s3", advisorMa: TVV_DEMO.ma, loai: "tai-lieu", refId: "tl3", ngay: "2026-08-25" },
  { id: "s4", advisorMa: TVV_DEMO.ma, loai: "danh-thiep", refId: advisors[3].ma, ngay: "2026-08-20" },
];

/* ---------- Lời chúc (09/09, phương án B) ---------- */
export const loiChuc: LoiChuc[] = [
  { id: "lc1", nguoiGuiMa: advisors[1].ma, nguoiNhanMa: TVV_DEMO.ma, thangId: "2026-08", hangMucId: "mdrt", noiDung: `Chúc mừng ${TVV_DEMO.hoTen} đạt MDRT tháng 8! Cả văn phòng tự hào về bạn.`, ngay: "2026-09-03T14:20:00", trangThai: "hien" },
  { id: "lc2", nguoiGuiMa: advisors[2].ma, nguoiNhanMa: TVV_DEMO.ma, thangId: "2026-08", hangMucId: "mdrt", noiDung: "10 năm liên tiếp, quá nể. Chúc bạn giữ vững phong độ!", ngay: "2026-09-03T09:05:00", trangThai: "hien" },
  { id: "lc3", nguoiGuiMa: advisors[3].ma, nguoiNhanMa: TVV_DEMO.ma, thangId: "2026-08", hangMucId: "mdrt", noiDung: "Cảm ơn bạn đã truyền cảm hứng cho cả đội. Chúc mừng!", ngay: "2026-09-02T17:40:00", trangThai: "hien" },
  { id: "lc4", nguoiGuiMa: advisors[4].ma, nguoiNhanMa: advisors[1].ma, thangId: "2026-08", hangMucId: "mdrt", noiDung: "Chúc mừng bạn! Xem thêm tại bit.ly/xyz để nhận ưu đãi từ đội mình nhé.", ngay: "2026-09-02T11:12:00", trangThai: "gan-co", lyDoCo: "Chứa liên kết ngoài (bit.ly)" },
  { id: "lc5", nguoiGuiMa: advisors[5].ma, nguoiNhanMa: advisors[2].ma, thangId: "2026-08", hangMucId: "mdrt", noiDung: "Chúc mừng em!", ngay: "2026-09-01T08:30:00", trangThai: "da-an", lyDoCo: "Người nhận ẩn" },
];

/* ---------- Tiện ích ---------- */
export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");
export const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "—");
export const fmtVND = (n: number) => n.toLocaleString("vi-VN") + " ₫";
export const fmtNum = (n: number) => n.toLocaleString("vi-VN");
export const thangLabel = (m: HonorMonth) => `Tháng ${m.thang}/${m.nam}`;

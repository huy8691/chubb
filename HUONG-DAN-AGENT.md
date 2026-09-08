# Hướng dẫn dựng màn cho demo `ecard2-next` (đọc trước khi viết code)

Mục tiêu: demo Next.js thể hiện **đúng 59 màn + 10 lớp phủ** của wireframe Figma `tKyOoBG2CSkzE4FMgQkJWK`, page **"Luồng người dùng - final"** (id `1415:1194`, trước 08/09 tối tên là "13 · Bản có màu") (nội dung, nút, cột bảng, trạng thái) — không sáng tác thêm chức năng, không bỏ nút nào.

## Nguồn đọc (theo thứ tự)
1. **Figma page "Luồng người dùng - final"** — lấy bằng `figma.root.children.find(p => p.id === '1415:1194')` (KHÔNG tìm theo tên '13 ·' — đã đổi tên). Dùng `mcp__figma-huy__use_figma` (nạp skill `figma-use`), một lần `setCurrentPageAsync` mỗi lệnh. Lấy frame theo mã: `pg.children.find(c => c.type==='FRAME' && c.name.startsWith('E03 · '))`, dump mọi TEXT (characters, x, y, fontSize, fontName.style) và RECTANGLE/FRAME nút để biết khối, cột, nhãn, trạng thái, dữ liệu mẫu. **Chữ trên màn là chữ UI thật — dùng nguyên văn.** Bỏ hai dòng meta trên đầu frame (y < 90: "CMS — …" / "URL: … · Ai xem được: …").
2. `thiet-ke/nut-dich.md` — mỗi nút dẫn đi đâu (bảng màn · nút · đích), phần cuối tệp là các cập nhật 08/09 (mới nhất thắng).
3. `QUY-TAC-WIREFRAME.md` §6 (thành phần bắt buộc theo loại trang), §7 (quyết định đã chốt), §10 (tên gọi thống nhất — không dùng từ khác).
4. `thiet-ke/wireframe-thanh-phan.md` — kích cỡ, mẫu thành phần.

## Kiến trúc có sẵn — dùng, không viết lại
- `src/lib/routes.ts` — **mọi href đi qua `R`** (`R.E03(ma)`, `R.F02(slug)`…), `TABS`, `ACCOUNT_TABS`, `CMS_MENU`.
- `src/lib/types.ts` + `src/lib/seed.ts` — kiểu và dữ liệu mẫu; helper `fmtDate · fmtDateTime · fmtVND · fmtNum · thangLabel`. Thiếu trường thì **thêm vào types + seed** (không tạo kiểu riêng trong page).
- `src/lib/store.tsx` — `useStore()` → `{ data, session, actions }`; `actions.update("articles", list => …)` để ghi; `actions.notify(ma, noiDung, href)` khi admin duyệt/từ chối/loại lượt; `useCurrentAdvisor()`, `useCurrentCmsUser()`. Không gọi API, không fetch.
- `src/components/ui.tsx` — `Button(kind: primary|secondary|ghost|danger|recruit)`, `Chip`, `StatusChip(s)`, `Eyebrow H1 H2 H3 Muted MoreLink Card SectionHead Hero ImageBox Breadcrumb Field Input Textarea Select Checkbox Radio Toggle SearchBox FilterChips Table Pagination EmptyState Modal useFlash Stat Avatar cx`.
- Khung: `app/(site)/layout.tsx` (Nav + Footer, tự nhận đăng nhập), `app/(site)/tai-khoan/layout.tsx` (dải 5 tab + chặn chưa đăng nhập), `app/cms/layout.tsx` (thanh trên + sidebar 14 mục + chặn vai). Trong CMS dùng `CmsHeader · CmsCard · CmsFormActions` từ `src/components/cms/CmsShell.tsx`.
- **Không dùng ảnh thật** (chủ dự án 08/09: "bỏ hình ảnh, dùng placeholder thôi, bám set wireframe"): mọi ô ảnh dùng `ImageBox` (ô xám chữ "Ảnh", có tỉ lệ) và `Avatar` (hình tròn chữ cái); không thêm `<img>` trừ logo `/chubb.svg` và ảnh chân dung người dùng tự tải lên trong Studio. Thư mục `public/img` đã xoá.

## Luật viết
- Trang có tương tác → `"use client"`; trang chỉ đọc có thể server component nhưng dữ liệu vẫn từ store (client) → thực tế hầu hết là client component. Dùng `useSearchParams` thì bọc `Suspense`.
- Route động: `params` là Promise trong Next 16 — dùng `use(params)` trong client component hoặc `await params` trong server component.
- Kiểu dáng: Tailwind 4 với token trong `globals.css` (`text-blue bg-hong-soft border-vien text-ink2 bg-xam…`), bo góc `rounded-sm` (4px) cho mọi thứ, hero nền `bg-xam`, eyebrow hồng, **hồng chỉ cho eyebrow và nút tuyển dụng (`kind="recruit"`)**, còn lại xanh. Font: tiêu đề `font-serif` (Publico), chữ `font-sans` (Lato). Chiều rộng `wrap` (1280).
- **Không dán chú thích wireframe vào UI**: không mã màn (E03, H04…), không "(đề xuất)", không "→", không mô tả hành vi. Người dùng cuối đọc được mọi chữ.
- Mỗi nút trên wireframe phải có hành vi thật trong demo: chuyển trang theo `R`, mở `Modal`, đổi state trong store, hoặc `flash("Đã …")` cho việc ra ngoài site (tải PDF, gọi điện, Zalo, gửi email).
- Trạng thái vẽ trên wireframe (rỗng, lỗi trường, chờ duyệt, đã khoá…) phải có thật: `EmptyState`, `Field error`, `StatusChip`.
- Danh sách dài: ô tìm · chip lọc · sắp xếp · đếm kết quả · `Pagination` (10–12 dòng/trang). Bảng CMS: hàng tiêu đề · cột trạng thái · nút tạo mới · Sửa trên hàng.
- Form CMS admin tự soạn: `Lưu nháp · Xem trước (mở màn công khai tab mới) · Xuất bản ▾ (ngay / lên lịch) · Gỡ xuất bản · Huỷ` + cột phải trạng thái + "Lịch sử phiên bản". Nội dung TVV gửi lên (Ảnh Studio, đồng ý công khai) mới có Duyệt / Từ chối (kèm lý do, TVV thấy qua `notify`).
- Tiếng Việt có dấu, đúng tên §10: Studio · Mẫu Studio · Ảnh Studio · Bộ sưu tập Studio · Tài liệu / Loại tài liệu / Phần · Tháng vinh danh / Hạng mục / Người đạt · Lượt được tính / Lượt không hợp lệ / Loại lượt · Chuyên đề · Danh thiếp / Hồ sơ năng lực · Quản lý tài chính cá nhân.
- Không thêm thư viện npm mới nếu chưa thật cần (không có UI kit); không sửa `globals.css`, `ui.tsx`, `store.tsx`, `routes.ts`, `Nav/Footer/Shell` — cần thêm helper thì tạo file mới trong `src/components/<cụm>/` hoặc báo lại ở kết quả.
- Xong mỗi cụm: `npx tsc --noEmit` sạch và `npm run lint` không lỗi; mở `npm run dev` bấm thử luồng chính rồi mô tả kết quả trong báo cáo (nút nào → đi đâu).

## Đăng nhập demo
- TVV: `/dang-nhap`, email `an0@chubblife.vn` (Nguyễn Minh An · 0161363), mã `123456`.
- CMS: `/cms/dang-nhap`, `thuha@chubblife.vn` (Quản trị) · `kimngan@chubblife.vn` (Biên tập), mã `123456`.

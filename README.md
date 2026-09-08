# ecard2-next — demo Advisor Portal E-Card 2.0 dựng từ wireframe

Bản demo Next.js 16 + Tailwind 4 thể hiện đủ 59 màn + 10 lớp phủ của wireframe Figma
(`tKyOoBG2CSkzE4FMgQkJWK`, page 13 · Bản có màu). Dữ liệu mock trong bộ nhớ trình duyệt,
không backend; mọi thao tác CMS (tạo, sửa, duyệt, chốt) đổi dữ liệu thật trong phiên.

## Chạy
```bash
npm install
npm run dev        # http://localhost:3000
```

## Tài khoản demo (mã đăng nhập luôn là `123456`)
| vai | đường vào | email |
|---|---|---|
| Tư vấn viên | `/dang-nhap` | `an0@chubblife.vn` (Nguyễn Minh An · 0161363) |
| Quản trị CMS | `/cms/dang-nhap` | `thuha@chubblife.vn` |
| Biên tập CMS | `/cms/dang-nhap` | `kimngan@chubblife.vn` |

Đặt lại dữ liệu về seed: đóng tab (sessionStorage) hoặc gọi `actions.reset()`.

## Trạng thái 08/09
59 màn + 10 lớp phủ đã dựng (58 route; E07 là trạng thái trong `/[ma]`). `npm run build` thành công, `tsc` và `eslint` sạch (còn cảnh báo `<img>` cho logo và ảnh người dùng tải lên). Không dùng ảnh thật — ô giữ chỗ theo wireframe.

## Bản đồ mã màn → đường dẫn
Xem `src/lib/routes.ts`. Đích của từng nút theo `../thiet-ke/nut-dich.md`.

## Cấu trúc
- `src/lib/` routes · types · seed · store (context)
- `src/components/ui.tsx` bộ thành phần; `site/` Nav Footer AccountShell; `cms/` CmsShell
- `src/app/(site)/` trang công khai + `tai-khoan/` (5 tab TVV)
- `src/app/cms/` 14 module CMS, vai chặn ở layout
- `HUONG-DAN-AGENT.md` luật dựng màn; spec: `../tai-lieu/docs/superpowers/specs/ecard2-next-demo.md`

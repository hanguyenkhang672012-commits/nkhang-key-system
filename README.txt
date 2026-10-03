NKHANG KEY SYSTEM

CHẠY LOCAL
1. Cài Node.js 20+.
2. npm install
3. Đặt ADMIN_TOKEN:
   PowerShell: $env:ADMIN_TOKEN="mat-khau-admin-rat-dai"
   macOS/Linux: export ADMIN_TOKEN="mat-khau-admin-rat-dai"
4. npm start
5. Panel: http://localhost:3000/
6. Quản lý: http://localhost:3000/admin

DEPLOY
- Có thể deploy bằng Docker hoặc Render.
- Render sẽ yêu cầu bạn nhập ADMIN_TOKEN trong Environment.
- Nếu muốn dữ liệu keys không mất khi server restart/redeploy, dùng persistent disk hoặc đổi DB sang PostgreSQL/Supabase.
- Không đưa ADMIN_TOKEN vào index.html.

KEY DEMO:
NKHANG-2026 (đã có trong keys.json, hạn 2027-12-31)

HỆ THỐNG NÀY CHỈ QUẢN LÝ QUYỀN TRUY CẬP VÀ GIAO DIỆN DEMO.

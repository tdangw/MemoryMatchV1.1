@echo off
setlocal

REM 👉 Nhập commit message nếu muốn
set /p message=Gõ nội dung commit (hoặc nhấn Enter để dùng mặc định): 
if "%message%"=="" set message=Tự động cập nhật MemoryMatch

echo.
echo 🔄 Khởi tạo Git (nếu cần)...
if not exist .git (
    git init
)

echo.
echo 📦 Thêm tất cả file...
git add .

echo.
echo 📝 Commit: %message%
git commit -m "%message%"

echo.
echo 🔗 Kiểm tra remote...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin https://github.com/tdangw/MemoryMatchV1.0
)

echo.
echo 🌿 Đặt nhánh chính là main...
git branch -M main

echo.
echo 🚀 Push lên GitHub...
git push -u origin main

echo.
echo ✅ Đã đẩy lên GitHub thành công!
pause

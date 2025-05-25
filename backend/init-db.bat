@echo off
echo === Khoi tao co so du lieu Quizizz Clone ===

rem 1. Tao Prisma client
echo 1. Tao Prisma client...
call npx prisma generate

rem 2. Ap dung migration
echo 2. Ap dung migration de tao cau truc co so du lieu...
call npx prisma migrate dev --name init

rem 3. Tao du lieu mau
echo 3. Tao du lieu mau...
call npx prisma db seed

echo === Hoan tat khoi tao co so du lieu ===
echo Ban co the xem co so du lieu bang lenh: npx prisma studio 
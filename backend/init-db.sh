#!/bin/bash

# Script khởi tạo cơ sở dữ liệu cho Quizizz Clone

echo "=== Khởi tạo cơ sở dữ liệu Quizizz Clone ==="

# 1. Tạo Prisma client
echo "1. Tạo Prisma client..."
npx prisma generate

# 2. Áp dụng migration
echo "2. Áp dụng migration để tạo cấu trúc cơ sở dữ liệu..."
npx prisma migrate dev --name init

# 3. Tạo dữ liệu mẫu
echo "3. Tạo dữ liệu mẫu..."
npx prisma db seed

echo "=== Hoàn tất khởi tạo cơ sở dữ liệu ==="
echo "Bạn có thể xem cơ sở dữ liệu bằng lệnh: npx prisma studio" 
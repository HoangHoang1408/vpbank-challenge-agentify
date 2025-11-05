#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}       XUẤT DỮ LIỆU SANG JSON FILES            ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../../.." && pwd )"

echo -e "${GREEN}📁 Project root: ${PROJECT_ROOT}${NC}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules không tồn tại. Vui lòng chạy 'pnpm install' trước.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ File .env không tồn tại. Vui lòng tạo file .env với cấu hình database.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Đang chạy script xuất dữ liệu...${NC}"
echo ""

# Run the TypeScript script using ts-node
npx ts-node src/data/scripts/export_to_json.ts

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}       ✅ HOÀN THÀNH XUẤT DỮ LIỆU             ${NC}"
    echo -e "${GREEN}================================================${NC}"
else
    echo ""
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}       ❌ LỖI KHI XUẤT DỮ LIỆU                ${NC}"
    echo -e "${RED}================================================${NC}"
    exit 1
fi


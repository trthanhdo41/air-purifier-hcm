#!/bin/bash

# Script tự động deploy lên Vercel Production
# Tự động sync environment variables từ .env.local

echo "🚀 Bắt đầu deploy lên Vercel Production..."
echo ""

# Màu sắc cho output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check xem .env.local có tồn tại không
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Không tìm thấy file .env.local${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Đồng bộ Environment Variables...${NC}"

# Đọc .env.local và sync lên Vercel
while IFS='=' read -r key value; do
    # Skip comments và dòng trống
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    
    # Remove leading/trailing whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    # Skip nếu key rỗng
    [[ -z $key ]] && continue
    
    echo -e "${YELLOW}  ⚙️  Syncing: $key${NC}"
    
    # Xóa env var cũ nếu có (ignore error nếu chưa tồn tại)
    vercel env rm "$key" production --yes 2>/dev/null || true
    
    # Thêm env var mới
    echo "$value" | vercel env add "$key" production > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ Đã sync: $key${NC}"
    else
        echo -e "${RED}  ✗ Lỗi khi sync: $key${NC}"
    fi
    
done < .env.local

echo ""
echo -e "${BLUE}🔨 Building và Deploy lên Production...${NC}"
echo ""

# Deploy lên production
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deploy thành công!${NC}"
    echo ""
    echo -e "${BLUE}📍 Production URL: https://air-purifier-hcm.vercel.app${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deploy thất bại!${NC}"
    exit 1
fi


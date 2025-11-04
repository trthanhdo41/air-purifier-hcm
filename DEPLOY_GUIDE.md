# 🚀 Hướng Dẫn Deploy Production

## Cách deploy nhanh

Chỉ cần chạy 1 lệnh:

```bash
./deploy.sh
```

Script sẽ tự động:
- ✅ Đồng bộ tất cả environment variables từ `.env.local` lên Vercel
- ✅ Build và deploy lên Production
- ✅ Hiển thị URL production khi hoàn thành

## Yêu cầu

- ✅ Đã cài đặt Vercel CLI: `npm i -g vercel`
- ✅ Đã đăng nhập Vercel: `vercel login`
- ✅ File `.env.local` phải tồn tại trong project

## Cập nhật Environment Variables

Nếu bạn thêm/sửa biến môi trường trong `.env.local`:

1. Cập nhật file `.env.local`
2. Chạy `./deploy.sh` - script sẽ tự động sync lên Vercel

## Production URL

- **Main Domain**: https://air-purifier-hcm.vercel.app
- **Latest Deployment**: Sẽ hiển thị sau khi deploy thành công

## Lưu ý quan trọng

⚠️ **KHÔNG** commit file `.env.local` lên Git (đã có trong `.gitignore`)

⚠️ **KHÔNG** chia sẻ các key trong `.env.local` ra ngoài

## Các lệnh Vercel khác

```bash
# Xem logs production
vercel logs --prod

# Xem danh sách env vars
vercel env ls

# Pull env vars về local (để test)
vercel env pull .env.production

# Rollback về deployment trước
vercel rollback

# Xem danh sách deployments
vercel ls
```

## Troubleshooting

### Lỗi: "Permission denied"
```bash
chmod +x deploy.sh
```

### Lỗi: "Vercel not found"
```bash
npm i -g vercel
```

### Lỗi khi sync env vars
- Check file `.env.local` có đúng format không
- Check đã login Vercel chưa: `vercel whoami`
- Thử xóa env var thủ công: `vercel env rm TEN_BIEN production`

## Support

Nếu gặp vấn đề, check:
1. Vercel Dashboard: https://vercel.com/dashboard
2. Build logs: `vercel logs --prod`
3. Environment Variables: Project Settings → Environment Variables


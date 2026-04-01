# Hướng dẫn Deploy lên Render

## Cách 1: Single Service với Auto-scaling (Khuyến nghị)

### Bước 1: Chuẩn bị
1. Push code lên GitHub repository
2. Đăng ký tài khoản Render.com

### Bước 2: Deploy
1. Vào Render Dashboard
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Chọn repository của bạn
5. Cấu hình:
   - **Name**: load-balancer-app
   - **Runtime**: Docker
   - **Dockerfile Path**: ./app/Dockerfile
   - **Plan**: Starter (Free)

### Bước 3: Environment Variables
Thêm các biến môi trường:
```
NODE_ENV=production
PORT=10000
```

### Bước 4: Health Check
- **Health Check Path**: `/health`

### Bước 5: Auto Scaling (Paid plans)
- **Min Instances**: 2
- **Max Instances**: 5

## Cách 2: Manual Deploy (Free)

### Nếu không có auto-scaling, tạo 2 services riêng:

**Service 1:**
- Name: load-balancer-app-1
- Dockerfile: ./app/Dockerfile
- Environment: INSTANCE_ID=render-app1

**Service 2:**
- Name: load-balancer-app-2  
- Dockerfile: ./app/Dockerfile
- Environment: INSTANCE_ID=render-app2

## Test sau khi deploy

### URLs sẽ có dạng:
- https://load-balancer-app.onrender.com
- https://load-balancer-app-2.onrender.com (nếu có service 2)

### Test endpoints:
```bash
curl https://your-app.onrender.com/
curl https://your-app.onrender.com/health
curl https://your-app.onrender.com/load
curl https://your-app.onrender.com/metrics
```

## Lưu ý quan trọng

1. **Free Plan**: Render free plan có giới hạn:
   - Service sẽ sleep sau 15 phút không hoạt động
   - Chỉ 750 giờ/tháng
   - Không có auto-scaling

2. **Load Balancing**: 
   - Render tự động có load balancer built-in
   - Không cần nginx riêng biệt
   - Auto-scaling sẽ tạo multiple instances

3. **Monitoring**:
   - Render có dashboard monitoring built-in
   - Prometheus/Grafana chỉ chạy được trên paid plans

## Kiểm tra hoạt động

Sau khi deploy, test bằng cách:
1. Refresh trang nhiều lần
2. Xem response có `instance` field khác nhau
3. Check `/health` endpoint
4. Monitor trong Render dashboard
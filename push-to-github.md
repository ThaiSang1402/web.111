# Hướng dẫn Push Code lên GitHub

## Bước 1: Tạo Repository trên GitHub
1. Vào https://github.com/ThaiSang1402
2. Click "New repository" 
3. Repository name: `DTDM`
4. Chọn "Public"
5. KHÔNG tick "Initialize with README" (vì đã có code)
6. Click "Create repository"

## Bước 2: Push Code (Chạy trong terminal)

Code đã được commit local, chỉ cần push:

```bash
git push -u origin main
```

Nếu gặp lỗi authentication, có thể cần:

### Option 1: Personal Access Token
1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token với repo permissions
3. Sử dụng token thay vì password khi push

### Option 2: SSH Key
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Add to GitHub: Settings → SSH and GPG keys
```

## Bước 3: Verify
Sau khi push thành công, check:
- https://github.com/ThaiSang1402/DTDM
- Tất cả files đã được upload

## Bước 4: Deploy lên Render
1. Vào Render.com
2. New Web Service
3. Connect GitHub → chọn repository DTDM
4. Render sẽ tự động detect render.yaml và deploy

## Files đã được commit:
- ✅ app/ (Node.js application)
- ✅ nginx/ (Load balancer config)  
- ✅ monitoring/ (Prometheus config)
- ✅ docker-compose.yml (Local development)
- ✅ render.yaml (Render deployment)
- ✅ README.md (Documentation)
- ✅ demo.html (Test interface)
- ✅ .gitignore (Git ignore rules)

Total: 15 files, 1716 lines of code
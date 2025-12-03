# Federal Gaz

Endüstriyel gaz çözümleri için modern web sitesi ve yönetim paneli.

## 🚀 Özellikler

- **Dashboard**: Tam özellikli yönetim paneli
  - Analytics & İstatistikler
  - Medya Kütüphanesi (Vercel Blob)
  - İçerik Yönetimi (CMS)
  - Kullanıcı Yönetimi
  - Sipariş Takibi
  
- **Güvenlik**: 
  - OTP ile giriş
  - Rate limiting
  - Secure headers
  - F12 engelleme

- **Database**: MySQL (Aiven)
- **Deployment**: Vercel

## 📦 Kurulum

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Environment Variables
`.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun.

### 3. Development Server
```bash
npm run dev
```

http://localhost:3000 adresinde çalışacak.

### 4. Production Build
```bash
npm run build
npm start
```

## 🗄️ Database Setup

1. Aiven'de MySQL servisi oluşturun
2. `scripts/db-init-full.sql` dosyasını çalıştırın
3. `.env` dosyasına bağlantı bilgilerini ekleyin

## 🌐 Deployment

Detaylı deployment rehberi için `final_deployment_guide.md` dosyasına bakın.

### Vercel'e Deploy
1. GitHub'a push edin
2. Vercel'de projeyi import edin
3. Environment variables ekleyin
4. Deploy!

## 📝 License

© 2024 Federal Gaz. Tüm hakları saklıdır.

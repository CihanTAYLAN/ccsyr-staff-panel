# CCSYR Staff Panel

![CCSYR Logo](https://ccsyr.org/wp-content/uploads/2024/12/website-logo-thin.png)

## Genel Bakış

CCSYR Staff Panel, personel giriş-çıkış ve lokasyon takibini yönetmek için geliştirilmiş merkezi bir yönetim sistemidir. Farklı yetki seviyelerine sahip kullanıcılar (Super Admin, Manager Admin, Personal) bu platform üzerinden personel hareketlerini izleyebilir ve yönetebilir.

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0+-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-cyan)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38B2AC)](https://tailwindcss.com/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.24.5-0170FE)](https://ant.design/)
[![Status](https://img.shields.io/badge/Status-Development-orange)]()

## Proje Yapısı

### Dashboard

- Genel istatistikler ve aktif personel sayısı
- Son 10 giriş-çıkış loglarını timeline olarak görüntüleme
- Lokasyonlara göre kullanıcı sayısını harita üzerinde ve liste olarak görüntüleme

### Kullanıcı Yönetimi

- Kullanıcı kayıtlarının oluşturulması ve yönetimi
- Rol tabanlı erişim kontrolleri (Super Admin, Manager Admin, Personal)
- Kullanıcı detay ve aktivite görüntüleme

### Lokasyon Yönetimi

- Lokasyon kayıtlarının oluşturulması ve yönetimi
- Lokasyon detay görüntüleme ve haritada gösterim
- Lokasyonda aktif bulunan kullanıcıların takibi

### Access Log Sistemi

- Kullanıcı giriş-çıkış kayıtlarının otomatik tutulması
- Detaylı log bilgileri ve kullanıcı aktivitesi takibi
- Lokasyon bazlı personel hareketliliği analizi

### Profil Yönetimi

- Kullanıcı profil bilgilerini görüntüleme ve düzenleme
- Konum güncelleme ve kişisel log kayıtlarını görüntüleme
- Şifre değiştirme ve güvenlik yönetimi

### Kimlik Doğrulama

- İki aşamalı giriş: Email/şifre doğrulaması + lokasyon/tarih seçimi
- Şifre sıfırlama ve güvenli oturum yönetimi

## Yetkilendirme Özeti

| Özellik               | Super Admin         | Manager Admin | Personal |
| --------------------- | ------------------- | ------------- | -------- |
| Dashboard             | READ                | READ          | N/A      |
| Kullanıcı Yönetimi    | READ, WRITE, DELETE | READ          | N/A      |
| Lokasyon Yönetimi     | READ, WRITE, DELETE | READ          | N/A      |
| Access Logları        | READ                | READ          | N/A      |
| Kendi Geçmişini Görme | READ                | READ          | READ     |

## Teknoloji Stack

- **Frontend**: Next.js, React, Ant Design, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Mail**: Nodemailer
- **Deployment**: Vercel / Docker
- **Harita**: Leaflet.js

## Kurulum

### Gereksinimler

- Node.js (v16+)
- PostgreSQL
- Yarn

### Kurulum Adımları

1. Repo klonlama:

   ```bash
   git clone https://github.com/CihanTAYLAN/ccsyr-staff-panel.git
   cd ccsyr-staff-panel
   ```

2. Bağımlılıkları yükleme:

   ```bash
   yarn install
   ```

3. `.env` dosyasını yapılandırma:

   ```
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ccsyr_staff_panel"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-in-production"

   MAIL_HOST=smtp.example.com
   MAIL_PORT=465
   MAIL_USER=youremail@example.com
   MAIL_PASSWORD=your-mail-password
   MAIL_SECURE=true
   MAIL_FROM_NAME="CCSYR Staff Panel"
   MAIL_FROM_ADDRESS=no-reply@ccsyr.org
   ```

4. Veritabanı migrasyonlarını çalıştırma:

   ```bash
   yarn prisma migrate dev
   ```

5. Geliştirme sunucusunu başlatma:
   ```bash
   yarn dev
   ```

## İletişim

Proje Yöneticisi: [@Murat Coskun](https://www.linkedin.com/in/murat-coskun-76a06b227/) - muraatcoskun@gmail.com

Proje Linki: [https://github.com/CihanTAYLAN/ccsyr-staff-panel](https://github.com/CihanTAYLAN/ccsyr-staff-panel)

---

&copy; 2024 CCSYR Corporation. All Rights Reserved.

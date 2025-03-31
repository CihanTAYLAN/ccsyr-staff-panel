# CCSYR Staff Panel

![CCSYR Logo](https://ccsyr.org/wp-content/uploads/2024/12/website-logo-thin.png)

## 📋 Proje Genel Bakış

CCSYR Staff Panel, personel giriş-çıkış ve lokasyon takibini tek bir panel üzerinden yönetmek için tasarlanmış kurumsal bir yönetim sistemidir. Farklı yetki seviyelerine sahip kullanıcılar bu sistem üzerinden personel hareketlerini izleyebilir ve yönetebilir.

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0+-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-cyan)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38B2AC)](https://tailwindcss.com/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.24.5-0170FE)](https://ant.design/)
[![Status](https://img.shields.io/badge/Status-Development-orange)]()

## 🔧 Teknoloji Stack

- **Frontend**: Next.js, React, Ant Design, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Mail**: Nodemailer
- **Deployment**: Vercel / Docker

## 📦 Kurulum

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
   DATABASE_URL="postgresql://username:password@localhost:5432/ccsyr_staff_panel"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Veritabanı migrasyonlarını çalıştırma:

   ```bash
   yarn prisma migrate dev
   ```

5. Geliştirme sunucusunu başlatma:
   ```bash
   yarn dev
   ```

## 🔐 Kullanıcı Rolleri

- **Super Admin**: Tüm sisteme tam erişim
- **Manager Admin**: Dashboard ve kayıtları görüntüleme
- **Personal**: Sadece kendi giriş-çıkış kayıtlarını görüntüleme

## 📞 İletişim

Proje Yöneticisi - [@Murat Coskun](https://www.linkedin.com/in/murat-coskun-76a06b227/) - muraatcoskun@gmail.com

Project Link: [https://github.com/CihanTAYLAN/ccsyr-staff-panel](https://github.com/CihanTAYLAN/ccsyr-staff-panel)

---

&copy; 2024 CCSYR Corporation. All Rights Reserved.

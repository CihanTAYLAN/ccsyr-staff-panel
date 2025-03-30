# CCSYR Staff Panel

![CCSYR Logo](https://ccsyr.org/wp-content/uploads/2024/12/website-logo-thin.png)

## 📋 Project Overview

CCSYR Staff Panel is a personnel management system designed to track employee building access and location monitoring. Different user groups with varied permissions can track and manage staff movements through a single panel interface.

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0+-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-cyan)](https://www.prisma.io/)
[![Status](https://img.shields.io/badge/Status-MVP-green)]()

## 🚀 Features

- **Multi-level Authorization System**

  - Super Admin
  - Manager Admin
  - Personal (Staff)

- **Location Tracking**

  - Multiple location support
  - Staff check-in/check-out recording
  - Real-time location status

- **User Management**

  - Add, edit, and delete users
  - Role-based authorization

- **Advanced Logging System**

  - Entry and exit logs
  - Date and time-based filtering
  - User and location analytics

- **Dashboard and Reporting**
  - Customizable dashboard
  - Analytical graphs and reports

## 🔧 Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Deployment**: Vercel / Docker

## 📦 Installation

### Requirements

- Node.js (v16+)
- PostgreSQL
- npm/yarn

### Setup Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/CihanTAYLAN/ccsyr-staff-panel.git
   cd ccsyr-staff-panel
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure the `.env` file:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/ccsyr_staff_panel"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   # or
   yarn prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🏗️ Project Structure

```
will be edit
```

## 👥 User Types and Permissions

| Feature                | Super Admin | Manager Admin | Personal |
| ---------------------- | ----------- | ------------- | -------- |
| Location Management    | ✅          | ❌            | ❌       |
| User Management        | ✅          | ❌            | ❌       |
| All Personnel Tracking | ✅          | ✅            | ❌       |
| View Own History       | ✅          | ✅            | ✅       |

## 📊 Database Schema

```
[users]
- id (PK)
- name
- email
- password
- userType
- status
- createdAt

[locations]
- id (PK)
- name
- description
- address
- latitude
- longitude
- createdAt

[access_logs]
- id (PK)
- userId (FK -> users.id)
- locationId (FK -> locations.id)
- actionType
- userAgent
- ipAddress
- createdAt
```

## 📞 Contact

Project Manager - [@Murat Coskun](https://www.linkedin.com/in/murat-coskun-76a06b227/) - muraatcoskun@gmail.com

Project Link: [https://github.com/CihanTAYLAN/ccsyr-staff-panel](https://github.com/CihanTAYLAN/ccsyr-staff-panel)

---

&copy; 2025 CCSYR Corporation. All Rights Reserved.

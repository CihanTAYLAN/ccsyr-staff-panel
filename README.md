# CCSYR Staff Panel

![CCSYR Logo](https://ccsyr.org/wp-content/uploads/2024/12/website-logo-thin.png)

## Overview

CCSYR Staff Panel is a centralized management system developed to track personnel check-ins/outs and locations. Users with different authorization levels (Super Admin, Manager Admin, Personal) can monitor and manage staff movements through this platform.

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0+-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-cyan)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38B2AC)](https://tailwindcss.com/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.24.5-0170FE)](https://ant.design/)
[![Status](https://img.shields.io/badge/Status-Development-orange)]()

## Project Structure

### Dashboard

- General statistics and active personnel count
- Timeline view of the last 10 check-in/out logs
- Map and list view of user distribution by location

### User Management

- Creation and management of user records
- Role-based access controls (Super Admin, Manager Admin, Personal)
- User details and activity monitoring

### Location Management

- Creation and management of location records
- Location details and map display
- Tracking of active users at locations

### Access Log System

- Automatic tracking of user check-ins and check-outs
- Detailed log information and user activity monitoring
- Location-based personnel movement analysis

### Profile Management

- View and edit user profile information
- Location updates and personal log record viewing
- Password changes and security management

### Authentication

- Two-step login: Email/password verification + location/date selection
- Password reset and secure session management

## Authorization Summary

| Feature             | Super Admin         | Manager Admin | Personal |
| ------------------- | ------------------- | ------------- | -------- |
| Dashboard           | READ                | READ          | N/A      |
| User Management     | READ, WRITE, DELETE | READ          | N/A      |
| Location Management | READ, WRITE, DELETE | READ          | N/A      |
| Access Logs         | READ                | READ          | N/A      |
| View Own History    | READ                | READ          | READ     |

## Technology Stack

- **Frontend**: Next.js, React, Ant Design, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Mail**: Nodemailer
- **Deployment**: Vercel / Docker
- **Map**: Leaflet.js

## Installation

### Requirements

- Node.js (v16+)
- PostgreSQL
- Yarn

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/CihanTAYLAN/ccsyr-staff-panel.git
   cd ccsyr-staff-panel
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Configure the `.env` file:

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

4. Run database migrations:

   ```bash
   yarn prisma migrate dev
   ```

5. Start the development server:
   ```bash
   yarn dev
   ```

## Contact

Project Manager: [@Murat Coskun](https://www.linkedin.com/in/murat-coskun-76a06b227/) - muraatcoskun@gmail.com

Project Link: [https://github.com/CihanTAYLAN/ccsyr-staff-panel](https://github.com/CihanTAYLAN/ccsyr-staff-panel)

---

&copy; 2024 CCSYR Corporation. All Rights Reserved.

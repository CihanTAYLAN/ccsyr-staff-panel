-- CreateEnum
CREATE TYPE "EUserType" AS ENUM ('SUPER_ADMIN', 'MANAGER_ADMIN', 'PERSONAL');

-- CreateEnum
CREATE TYPE "EUserStatus" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "EUserAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EActionType" AS ENUM ('CHECK_IN', 'CHECK_OUT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" "EUserType" NOT NULL,
    "status" "EUserStatus" DEFAULT 'OFFLINE',
    "userAccountStatus" "EUserAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "forcePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginDate" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "lastLoginUseragent" TEXT,
    "lastLoginOs" TEXT,
    "lastLoginDevice" TEXT,
    "lastLoginBrowser" TEXT,
    "lastLoginIpAddress" TEXT,
    "lastLogoutDate" TIMESTAMP(3),
    "lastLoginLocationStaticName" TEXT,
    "lastLoginLocationStaticAddress" TEXT,
    "lastLoginLocationStaticLat" DOUBLE PRECISION,
    "lastLoginLocationStaticLong" DOUBLE PRECISION,
    "currentLocationId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "actionType" "EActionType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "locationStaticName" TEXT,
    "locationStaticAddress" TEXT,
    "locationStaticLat" DOUBLE PRECISION,
    "locationStaticLong" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

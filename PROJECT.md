# CCSYR Staff Panel Documentation

## Overview

CCSYR Staff Panel is a management system developed to track personnel check-ins/outs and locations. It can be accessed by users with different authorization levels through a single panel.

### Project Structure

1. **Dashboard**

   - General statistics
   - Active personnel count
   - Timeline view of the last 10 check-in/out logs
   - Map and list view of user distribution by location

2. **Users** (Edit and Delete operations available only for Super Admin)

   - Model
     - name
     - email
     - password
     - forcePasswordChange (true/false) default false (if true, a new password modal will automatically open on first login, the user will update their password according to the specified password standards, and the forcePasswordChange value will be updated to false.)
     - userType (Super Admin, Manager Admin, Personal)
     - status (Active, Inactive)
     - created_at
     - updated_at
     - currentLocation
     - lastLoginDate - programmatically records the login date
     - lastLoginUseragent
     - lastLoginOs
     - lastLoginDevice
     - lastLoginBrowser
     - lastLoginIpAddress
     - lastLoginLocation
     - lastLoginLocationStaticName
     - lastLoginLocationStaticAddress
     - lastLoginLocationStaticLat
     - lastLoginLocationStaticLong
     - lastLogoutDate
     - userAccountStatus
   - Interface Features
     - User list
     - User detail view
     - User add/edit/delete (for Super Admin)

3. **Locations** (Add, Edit, and Delete operations available only for Super Admin)

   - Model
     - name
     - description
     - address
     - latitude
     - longitude
     - created_at
     - updated_at
   - Interface Features
     - Location list
     - Location detail view (with Personnel data)
       - View location on map
       - View list of active users at the location
     - Location add/edit/delete (for Super Admin)
     - Map integration for location selection when adding and editing locations

4. **Access Logs**

   - Model
     - user
     - location
     - actionType (Check-in, Check-out)
     - actionDate - session date selected by the user in the 2nd step of the auth section
     - userAgent
     - browser
     - os
     - device
     - ipAddress
     - created_at
     - updated_at
     - userStaticName
     - userStaticEmail
     - userStaticLastLoginDate
     - userStaticLastLoginLocationName
     - userStaticLastLoginLocationAddress
     - userStaticLastLoginLocationLat
     - userStaticLastLoginLocationLong
     - locationStaticName
     - locationStaticAddress
     - locationStaticLat
     - locationStaticLong
   - Interface Features
     - Access Log list
     - Access Log detail view
       - User information
       - Location information
       - Action Type
       - User Agent
       - IP Address
       - Created At
       - Updated At
       - User can view their current location
       - Access to the details of the user associated with this log
       - Timeline view of the last 10 check-in/out logs of the user associated with this log
       - Access to the details of the location associated with this log
       - Timeline view of the last 10 check-in/out logs of the location associated with this log
     - Access Log add, edit, and delete operations will only be performed automatically by the system; no add, edit, or delete operations can be performed on the panel.

5. **Profile Management**

   - Profile dropdown menu in the top right corner
     - Profile Button
       - View profile information
         - User can view their current location
         - User can view their check-in/out logs
       - Avatar generated from initials will be used instead of profile photo
       - Edit profile information
         - User can change their name
         - User cannot change their avatar
         - User cannot change their email
         - User can change their password
         - User cannot change their status
   - Update location feature
     - User can update their current location
     - When updating their current location, the browser's location information is used, and the location closest to the user is selected by default.
   - Sign out option

6. **Auth Section**

   - Users cannot register from outside.
   - Users can reset their passwords. (Forgot Password) (An 8-character password will be created and sent to the user via email, and the user's forcePasswordChange value will be updated to true.)

## Access Log System

### Check-in Logs

When personnel log into the system, they fill in the following information:

- Email
- Password

After logging in with email and password:

- Location (Selects one of the locations registered in the system) (by default, the location closest to the user will be selected based on the browser's lat and long values)
- Session Date (Login date) (by default, the current date and time)

The following information is automatically recorded in the access log when personnel log into the system:

- User (the user logging in)
- Location (the location logged in from)
- Action Date (the session date selected by the user)
- Created At (date and time of login - automatically recorded)
- User Agent (browser information)
- OS (operating system information)
- Device (device information)
- Action Type (recorded as "Check-in" for login event)
- IP Address (IP address of login)
- The user's current location is updated
- The active user count of the location is updated

### Check-out Logs

- When a user "Signs Out", they are considered to have left their location, and a checkout log is recorded: "User X checked out from location Z at time Y"
  - User (the user checking out)
  - Location (the location last logged in from)
  - Date (date and time of checkout)
  - User Agent (browser information)
  - Browser (browser information)
  - OS (operating system information)
  - Device (device information)
  - When checked out, the user's status is updated to "offline"
  - The active user count of the location is updated

## Authorization Summary

| Feature             | Super Admin                    | Manager Admin | Personal |
| ------------------- | ------------------------------ | ------------- | -------- |
| Dashboard           | READ                           | READ          | N/A      |
| User Management     | READ, WRITE, DELETE(with logs) | READ          | N/A      |
| Location Management | READ, WRITE, DELETE(with logs) | READ          | N/A      |
| Access Logs         | READ                           | READ          | N/A      |
| View Own History    | READ                           | READ          | READ     |

## Technical Requirements

- **Frontend**: Next.js, React, Ant Design, TailwindCSS
- **Backend**: Next.js API Routes
- **Mail**: Nodemailer
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Deployment**: Vercel / Docker
- **Map**: Leaflet.js

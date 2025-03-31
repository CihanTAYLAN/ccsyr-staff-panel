# CCSYR Staff Panel Dokümantasyonu

## Genel Bakış

CCSYR Staff Panel, personel giriş-çıkış ve lokasyon takibini yönetmek için geliştirilmiş bir yönetim sistemidir. Tek bir panel üzerinden farklı yetki seviyelerine sahip kullanıcılar tarafından erişilebilir.

### Proje Yapısı

1. **Dashboard**

   - Genel istatistikler
   - Aktif personel sayısı
   - Son 10 giriş-çıkış loglarını timeline olarak görüntüleme
   - Lokasyonlara göre kullanıcı sayısını harita üzerinde ve liste olarak görüntüleme

2. **Kullanıcılar** (Edit ve Delete işlemleri sadece Super Admin için yapılabilir)

   - Model
     - name
     - email
     - password
     - forcePasswordChange (true/false) default false (true ise kullanıcı ilk girişte yeni şifre modal ı otomatik olarak açılacak, kullanıcı kullanmak istediği şifreyi belirlenen şifre standartlarında güncelleyecek ve forcePasswordChange değeri false olarak güncellenecektir.)
     - userType (Super Admin, Manager Admin, Personal)
     - status (Active, Inactive)
     - created_at
     - updated_at
     - currentLocation
     - lastLoginDate
     - lastLoginIp
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
   - Arayüz Özellikleri
     - Kullanıcı listesi
     - Kullanıcı detay görüntüleme
     - Kullanıcı ekleme/düzenleme/silme (Super Admin için)

3. **Lokasyonlar** (Ekleme, Edit ve Delete işlemleri sadece Super Admin için yapılabilir)

   - Model
     - name
     - description
     - address
     - latitude
     - longitude
     - created_at
     - updated_at
   - Arayüz Özellikleri
     - Lokasyon listesi
     - Lokasyon detay görüntüleme (Personel verileri ile birlikte)
       - Lokasyon konumunu haritada görüntüleme
       - Lokasyonda aktif bulunan kullanıcıların listesini görüntüleme
     - Lokasyon ekleme/düzenleme/silme (Super Admin için)
     - Lokasyon eklerken ve düzenlerken konum seçimi için harita entegrasyonu

4. **Access Logları** (Ekleme, Edit ve Delete işlemleri sadece Super Admin için yapılabilir)

   - Model
     - user
     - location
     - actionType (Giriş, Çıkış)
     - userAgent
     - browser
     - os
     - device
     - ipAddress
     - created_at
     - updated_at
   - Arayüz Özellikleri
     - Access Log listesi
     - Access Log detay görüntüleme
       - Kullanıcı bilgileri
       - Lokasyon bilgileri
       - Action Type
       - User Agent
       - IP Address
       - Created At
       - Updated At
       - Kullanıcının şu anki lokasyonu görüntüyebilir
       - Bu log ile ilişkili kullanıcının detayına erişebilir
       - Bu log ile ilişkili kullanıcının son 10 giriş-çıkış loglarını timeline olarak görüntüyebilir
       - Bu log ile ilişkili lokasyonun detayına erişebilir
       - Bu log ile ilişkili lokasyonun son 10 giriş-çıkış loglarını timeline olarak görüntüyebilir
     - Access Log ekleme ve düzenleme ve silme işlemleri sadece sistemden otomatik olarak gerçekleşecektir, panelde herhangi bir ekleme düzenleme ve silme işlemi yapılamaz.

5. **Profil Yönetimi**

   - Sağ üst köşedeki profil dropdown menüsü
     - Profil Butonu
       - Profil bilgilerini görüntüleme
         - Kullanıcı şu anki lokasyonu görüntüyebilir
         - Kullanıcı kendi giriş-çıkış loglarını görüntüyebilir
       - Profil fotoğrafı yerine Baş harften üretilen avatar kullanılacak
       - Profil bilgilerini düzenleme
         - Kullanıcı adını değiştirebilir
         - Kullanıcı avatarını değiştiremez
         - Kullanıcı email'ini değiştiremez
         - Kullanıcı şifresini değiştirebilir
         - Kullancı status'unu değiştiremez
   - Çıkış yapma seçeneği

6. **Auth Bölümü**

   - Kullanıcılar login ve logout işlemlerini yapabilir.
   - Kullanıcılar dışarıdan kayıt olamazlar.
   - Kullanıcılar şifrelerini sıfırlayabilirler. (Şifremi Unuttum) (8 Karakterli bir şifre oluşturulacak ve kullanıcıya email ile gönderilecek ve kullanıcının forcePasswordChange değeri true olarak güncellenecektir.)

## Access Log Sistemi

### Giriş Logları

Personel sisteme giriş yaparken aşağıdaki bilgileri doldurur:

- Email
- Password
- Location (Sistemde kayıtlı lokasyonlardan birini seçer) (default olarak tarayıcı lokasyonunun lat ve long değerlerinden, kullanıcının en yakın olduğu lokasyon seçilecektir)
- Date (Giriş tarihi) (default olarak giriş yapıldığı tarih ve saat)

Personel sisteme giriş yaparken aşağıdaki bilgileri otomatik olarak access log'a kaydedilir:

- User (giriş yapan kullanıcı)
- Location (giriş yapıldığı lokasyon)
- Date (giriş yapıldığı tarih ve saat)
- User Agent (tarayıcı bilgileri)
- OS (işletim sistemi bilgileri)
- Device (cihaz bilgileri)
- Action Type (login eventi için "Giriş" olarak kaydedilir)
- IP Address (giriş yapıldığı IP adresi)
- Kullanıcının şu anki lokasyonu güncellenir
- Lokasyonun aktif kullanıcı sayısı güncellenir

### Çıkış Logları

- Kullanıcı "Sign Out" yaptığında bulunduğu lokasyondan çıkış yapmış kabul edilir ve çıkış logu kaydedilir: "X kullanıcısı, Y saatinde Z lokasyonundan çıkış yaptı"
  - User (çıkış yapan kullanıcı)
  - Location (en son giriş yapıldığı lokasyon)
  - Date (çıkış yapıldığı tarih ve saat)
  - User Agent (tarayıcı bilgileri)
  - Browser (tarayıcı bilgileri)
  - OS (işletim sistemi bilgileri)
  - Device (cihaz bilgileri)
  - Çıkış yapıldığında kullanıcı durumu "offline" olarak güncellenir
  - Lokasyonun aktif kullanıcı sayısı güncellenir

## Yetkilendirme Özeti

| Özellik               | Super Admin                           | Manager Admin | Personal |
| --------------------- | ------------------------------------- | ------------- | -------- |
| Dashboard             | READ                                  | READ          | N/A      |
| Kullanıcı Yönetimi    | READ, WRITE, DELETE(with access logs) | READ          | N/A      |
| Lokasyon Yönetimi     | READ, WRITE, DELETE(with access logs) | READ          | N/A      |
| Access Logları        | READ                                  | READ          | N/A      |
| Kendi Geçmişini Görme | READ                                  | READ          | READ     |

---

## Teknik Gereksinimler

- **Frontend**: Next.js, React, Ant Design, TailwindCSS
- **Backend**: Next.js API Routes
- **Mail**: Nodemailer
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Deployment**: Vercel / Docker

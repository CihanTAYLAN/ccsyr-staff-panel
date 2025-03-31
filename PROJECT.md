# CCSYR Staff Panel Dokümantasyonu

## Genel Bakış

CCSYR Staff Panel, personel giriş-çıkış ve lokasyon takibini yönetmek için geliştirilmiş bir yönetim sistemidir. Tek bir panel üzerinden farklı yetki seviyelerine sahip kullanıcılar tarafından erişilebilir.

### Proje Yapısı

1. **Dashboard**

   - Genel istatistikler ⚠️ _İmplemente edilmedi_
   - Aktif personel sayısı ⚠️ _İmplemente edilmedi_
   - Son 10 giriş-çıkış loglarını timeline olarak görüntüleme ⚠️ _İmplemente edilmedi_
   - Lokasyonlara göre kullanıcı sayısını harita üzerinde ve liste olarak görüntüleme ⚠️ _İmplemente edilmedi_

2. **Kullanıcılar** (Edit ve Delete işlemleri sadece Super Admin için yapılabilir)

   - Model
     - name
     - email
     - password
     - forcePasswordChange (true/false) default false (true ise kullanıcı ilk girişte yeni şifre modal ı otomatik olarak açılacak, kullanıcı kullanmak istediği şifreyi belirlenen şifre standartlarında güncelleyecek ve forcePasswordChange değeri false olarak güncellenecektir.) ⚠️ _Modelde eksik_
     - userType (Super Admin, Manager Admin, Personal)
     - status (Active, Inactive) ⚠️ _Status modelde ONLINE/OFFLINE olarak yapılmış, Active/Inactive eksik_
     - created_at
     - updated_at
     - currentLocation
     - lastLoginDate ⚠️ _Modelde eksik_
     - lastLoginIp ⚠️ _Modelde eksik_
     - lastLoginUseragent ⚠️ _Modelde eksik_
     - lastLoginOs ⚠️ _Modelde eksik_
     - lastLoginDevice ⚠️ _Modelde eksik_
     - lastLoginBrowser ⚠️ _Modelde eksik_
     - lastLoginIpAddress ⚠️ _Modelde eksik_
     - lastLoginLocation ⚠️ _Modelde eksik_
     - lastLoginLocationStaticName ⚠️ _Modelde eksik_
     - lastLoginLocationStaticAddress ⚠️ _Modelde eksik_
     - lastLoginLocationStaticLat ⚠️ _Modelde eksik_
     - lastLoginLocationStaticLong ⚠️ _Modelde eksik_
     - lastLogoutDate ⚠️ _Modelde eksik_
   - Arayüz Özellikleri
     - Kullanıcı listesi ✅ _İmplemente edilmiş gibi görünüyor_
     - Kullanıcı detay görüntüleme ✅ _İmplemente edilmiş gibi görünüyor_
     - Kullanıcı ekleme/düzenleme/silme (Super Admin için) ⚠️ _Tam olarak implemente edilip edilmediği kontrol edilmeli_

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
     - Lokasyon listesi ✅ _İmplemente edilmiş gibi görünüyor_
     - Lokasyon detay görüntüleme (Personel verileri ile birlikte) ⚠️ _Tam olarak implemente edilip edilmediği kontrol edilmeli_
       - Lokasyon konumunu haritada görüntüleme ⚠️ _Leaflet paketi eklenmiş, ancak implementasyon kontrol edilmeli_
       - Lokasyonda aktif bulunan kullanıcıların listesini görüntüleme ⚠️ _Tam olarak implemente edilip edilmediği kontrol edilmeli_
     - Lokasyon ekleme/düzenleme/silme (Super Admin için) ⚠️ _Tam olarak implemente edilip edilmediği kontrol edilmeli_
     - Lokasyon eklerken ve düzenlerken konum seçimi için harita entegrasyonu ⚠️ _Leaflet paketi eklenmiş, ancak implementasyon kontrol edilmeli_

4. **Access Logları** (Ekleme, Edit ve Delete işlemleri sadece Super Admin için yapılabilir)

   - Model
     - user
     - location
     - actionType (Giriş, Çıkış)
     - userAgent
     - os
     - device
     - ipAddress
     - created_at
     - updated_at
   - Arayüz Özellikleri
     - Access Log listesi ⚠️ _Tam olarak implemente edilip edilmediği kontrol edilmeli_
     - Access Log detay görüntüleme ⚠️ _Tam olarak implemente edilip edilmediği kontrol edilmeli_
       - Kullanıcı bilgileri
       - Lokasyon bilgileri
       - Action Type
       - User Agent
       - IP Address
       - Created At
       - Updated At
       - Kullanıcının şu anki lokasyonu görüntüyebilir ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
       - Bu log ile ilişkili kullanıcının detayına erişebilir ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
       - Bu log ile ilişkili kullanıcının son 10 giriş-çıkış loglarını timeline olarak görüntüyebilir ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
       - Bu log ile ilişkili lokasyonun detayına erişebilir ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
       - Bu log ile ilişkili lokasyonun son 10 giriş-çıkış loglarını timeline olarak görüntüyebilir ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
     - Access Log ekleme ve düzenleme ve silme işlemleri sadece sistemden otomatik olarak gerçekleşecektir, panelde herhangi bir ekleme düzenleme ve silme işlemi yapılamaz.

5. **Profil Yönetimi**

   - Sağ üst köşedeki profil dropdown menüsü ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
     - Profil Butonu ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
       - Profil bilgilerini görüntüleme ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
         - Kullanıcı şu anki lokasyonu görüntüyebilir ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
         - Kullanıcı kendi giriş-çıkış loglarını görüntüyebilir ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
       - Profil fotoğrafı yerine Baş harften üretilen avatar kullanılacak ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
       - Profil bilgilerini düzenleme ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
         - Kullanıcı adını değiştirebilir ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
         - Kullanıcı avatarını değiştiremez ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
         - Kullanıcı email'ini değiştiremez ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
         - Kullanıcı şifresini değiştirebilir ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
         - Kullancı status'unu değiştiremez ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
   - Çıkış yapma seçeneği ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_

6. **Auth Bölümü**

   - Kullanıcılar login ve logout işlemlerini yapabilir. ✅ _İmplemente edilmiş gibi görünüyor_
   - Kullanıcılar dışarıdan kayıt olamazlar. ✅ _İmplemente edilmiş gibi görünüyor_
   - Kullanıcılar şifrelerini sıfırlayabilirler. (Şifremi Unuttum) (8 Karakterli bir şifre oluşturulacak ve kullanıcıya email ile gönderilecek ve kullanıcının forcePasswordChange değeri true olarak güncellenecektir.) ⚠️ _Nodemailer bağımlılığı yok, implementasyon eksik_

## Access Log Sistemi

### Giriş Logları

Personel sisteme giriş yaparken aşağıdaki bilgileri doldurur:

- Email
- Password
- Location (Sistemde kayıtlı lokasyonlardan birini seçer) (default olarak tarayıcı lokasyonunun lat ve long değerlerinden, kullanıcının en yakın olduğu lokasyon seçilecektir) ⚠️ _İmplemente edilip edilmediği kontrol edilmeli_
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
  - Browser (tarayıcı bilgileri) ⚠️ _AccessLog modelinde eksik_
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

- **Frontend**: Next.js, React, Ant Design, TailwindCSS ✅ _İmplemente edilmiş_
- **Backend**: Next.js API Routes ✅ _İmplemente edilmiş_
- **Mail**: Nodemailer ⚠️ _Nodemailer bağımlılığı eksik, implementasyon eksik_
- **Database**: PostgreSQL ✅ _İmplemente edilmiş_
- **ORM**: Prisma ✅ _İmplemente edilmiş_
- **Authentication**: NextAuth.js ✅ _İmplemente edilmiş_
- **Deployment**: Vercel / Docker ✅ _Konfigürasyon mevcut_

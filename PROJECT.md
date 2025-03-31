# CCSYR Staff Panel Dokümantasyonu

## Genel Bakış

CCSYR Staff Panel, personel giriş-çıkış ve lokasyon takibini yönetmek için geliştirilmiş bir yönetim sistemidir. Tek bir panel üzerinden farklı yetki seviyelerine sahip kullanıcılar tarafından erişilebilir.

### Proje Yapısı

1. **Dashboard**

   - Genel istatistikler ✅ _İmplemente edildi_
   - Aktif personel sayısı ✅ _İmplemente edildi_
   - Son 10 giriş-çıkış loglarını timeline olarak görüntüleme ✅ _İmplemente edildi_
   - Lokasyonlara göre kullanıcı sayısını harita üzerinde ve liste olarak görüntüleme ✅ _Progress bar ile implemente edildi_

2. **Kullanıcılar** (Edit ve Delete işlemleri sadece Super Admin için yapılabilir)

   - Model
     - name
     - email
     - password
     - forcePasswordChange (true/false) default false (true ise kullanıcı ilk girişte yeni şifre modal ı otomatik olarak açılacak, kullanıcı kullanmak istediği şifreyi belirlenen şifre standartlarında güncelleyecek ve forcePasswordChange değeri false olarak güncellenecektir.) ✅ _İmplemente edildi_
     - userType (Super Admin, Manager Admin, Personal)
     - status (Active, Inactive) ✅ _userAccountStatus olarak implemente edildi_
     - created_at
     - updated_at
     - currentLocation
     - lastLoginDate ✅ _İmplemente edildi_
     - lastLoginIp ✅ _İmplemente edildi_
     - lastLoginUseragent ✅ _İmplemente edildi_
     - lastLoginOs ✅ _İmplemente edildi_
     - lastLoginDevice ✅ _İmplemente edildi_
     - lastLoginBrowser ✅ _İmplemente edildi_
     - lastLoginIpAddress ✅ _İmplemente edildi_
     - lastLoginLocation ✅ _İmplemente edildi_
     - lastLoginLocationStaticName ✅ _İmplemente edildi_
     - lastLoginLocationStaticAddress ✅ _İmplemente edildi_
     - lastLoginLocationStaticLat ✅ _İmplemente edildi_
     - lastLoginLocationStaticLong ✅ _İmplemente edildi_
     - lastLogoutDate ✅ _İmplemente edildi_
   - Arayüz Özellikleri
     - Kullanıcı listesi ✅ _İmplemente edilmiş gibi görünüyor_
     - Kullanıcı detay görüntüleme ✅ _İmplemente edilmiş gibi görünüyor_
     - Kullanıcı ekleme/düzenleme/silme (Super Admin için) ✅ _İmplemente edildi_

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
     - browser ✅ _İmplemente edildi_
     - os
     - device
     - ipAddress
     - created_at
     - updated_at
   - Arayüz Özellikleri
     - Access Log listesi ✅ _İmplemente edilmiş gibi görünüyor_
     - Access Log detay görüntüleme ✅ _İmplemente edildi_
       - Kullanıcı bilgileri
       - Lokasyon bilgileri
       - Action Type
       - User Agent
       - IP Address
       - Created At
       - Updated At
       - Kullanıcının şu anki lokasyonu görüntüyebilir ✅ _İmplemente edildi_
       - Bu log ile ilişkili kullanıcının detayına erişebilir ✅ _İmplemente edildi_
       - Bu log ile ilişkili kullanıcının son 10 giriş-çıkış loglarını timeline olarak görüntüyebilir ✅ _İmplemente edildi_
       - Bu log ile ilişkili lokasyonun detayına erişebilir ✅ _İmplemente edildi_
       - Bu log ile ilişkili lokasyonun son 10 giriş-çıkış loglarını timeline olarak görüntüyebilir ✅ _İmplemente edildi_
     - Access Log ekleme ve düzenleme ve silme işlemleri sadece sistemden otomatik olarak gerçekleşecektir, panelde herhangi bir ekleme düzenleme ve silme işlemi yapılamaz.

5. **Profil Yönetimi**

   - Sağ üst köşedeki profil dropdown menüsü ✅ _İmplemente edildi_
     - Profil Butonu ✅ _İmplemente edildi_
       - Profil bilgilerini görüntüleme ✅ _İmplemente edildi_
         - Kullanıcı şu anki lokasyonu görüntüyebilir ✅ _İmplemente edildi_
         - Kullanıcı kendi giriş-çıkış loglarını görüntüyebilir ✅ _İmplemente edildi_
       - Profil fotoğrafı yerine Baş harften üretilen avatar kullanılacak ✅ _İmplemente edildi_
       - Profil bilgilerini düzenleme ✅ _İmplemente edildi_
         - Kullanıcı adını değiştirebilir ✅ _İmplemente edildi_
         - Kullanıcı avatarını değiştiremez ✅ _İmplemente edildi_
         - Kullanıcı email'ini değiştiremez ✅ _İmplemente edildi_
         - Kullanıcı şifresini değiştirebilir ✅ _İmplemente edildi_
         - Kullancı status'unu değiştiremez ✅ _İmplemente edildi_
   - Çıkış yapma seçeneği ✅ _İmplemente edildi_

6. **Auth Bölümü**

   - Kullanıcılar login ve logout işlemlerini yapabilir. ✅ _İmplemente edilmiş gibi görünüyor_
   - Kullanıcılar dışarıdan kayıt olamazlar. ✅ _İmplemente edilmiş gibi görünüyor_
   - Kullanıcılar şifrelerini sıfırlayabilirler. (Şifremi Unuttum) (8 Karakterli bir şifre oluşturulacak ve kullanıcıya email ile gönderilecek ve kullanıcının forcePasswordChange değeri true olarak güncellenecektir.) ✅ _İmplemente edildi_

## Access Log Sistemi

### Giriş Logları

Personel sisteme giriş yaparken aşağıdaki bilgileri doldurur:

- Email
- Password
- Location (Sistemde kayıtlı lokasyonlardan birini seçer) (default olarak tarayıcı lokasyonunun lat ve long değerlerinden, kullanıcının en yakın olduğu lokasyon seçilecektir) ✅ _İmplemente edildi_
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
  - Browser (tarayıcı bilgileri) ✅ _İmplemente edildi_
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
- **Mail**: Nodemailer ✅ _İmplemente edildi_
- **Database**: PostgreSQL ✅ _İmplemente edilmiş_
- **ORM**: Prisma ✅ _İmplemente edilmiş_
- **Authentication**: NextAuth.js ✅ _İmplemente edilmiş_
- **Deployment**: Vercel / Docker ✅ _Konfigürasyon mevcut_

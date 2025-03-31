# CCSYR Staff Panel Dokümantasyonu

## Genel Bakış

CCSYR Staff Panel, personel giriş-çıkış ve lokasyon takibini yönetmek için geliştirilmiş bir yönetim sistemidir. Tek bir panel üzerinden farklı yetki seviyelerine sahip kullanıcılar tarafından erişilebilir.

### Proje Yapısı

1. **Dashboard**

   - Genel istatistikler
   - Aktif personel sayısı
   - Son 10 giriş-çıkış loglarını timeline olarak görüntüleme
   - Lokasyonlara göre kullanıcı sayısını harita üzerinde ve liste olarak görüntüleme ✅ _Progress bar ile implemente edildi_

2. **Kullanıcılar** (Edit ve Delete işlemleri sadece Super Admin için yapılabilir)

   - Model
     - name
     - email
     - password
     - forcePasswordChange (true/false) default false (true ise kullanıcı ilk girişte yeni şifre modal ı otomatik olarak açılacak, kullanıcı kullanmak istediği şifreyi belirlenen şifre standartlarında güncelleyecek ve forcePasswordChange değeri false olarak güncellenecektir.)
     - userType (Super Admin, Manager Admin, Personal)
     - status (Active, Inactive) ✅ _userAccountStatus olarak implemente edildi_
     - created_at
     - updated_at
     - currentLocation
     - lastLoginDate - programatik olarak login olunan tarihi kaydeder
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
     - Lokasyon detay görüntüleme (Personel verileri ile birlikte) ⚠️ _Kısmen implemente edildi, geliştirme gerekiyor_
       - Lokasyon konumunu haritada görüntüleme ✅ _Leaflet ile implemente edildi_
       - Lokasyonda aktif bulunan kullanıcıların listesini görüntüleme ⚠️ _Kısmen implemente edildi, geliştirme gerekiyor_
     - Lokasyon ekleme/düzenleme/silme (Super Admin için)
     - Lokasyon eklerken ve düzenlerken konum seçimi için harita entegrasyonu ✅ _Leaflet ile implemente edildi_

4. **Access Logları**

   - Model
     - user
     - location
     - actionType (Giriş, Çıkış)
     - actionDate - kullanıcının auth bölümünün 2. adımında seçtiği session date
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

   - Kullanıcı girişi iki adımdan oluşur:
     - 1. adım: Email ve password ile giriş yapma
     - 2. adım: Lokasyon ve session date seçimi
   - Kullanıcılar dışarıdan kayıt olamazlar.
   - Kullanıcılar şifrelerini sıfırlayabilirler. (Şifremi Unuttum) (8 Karakterli bir şifre oluşturulacak ve kullanıcıya email ile gönderilecek ve kullanıcının forcePasswordChange değeri true olarak güncellenecektir.)

## Access Log Sistemi

### Giriş Logları

Personel sisteme giriş yaparken aşağıdaki bilgileri doldurur:

- Email
- Password

Email ve password ile giriş yaptıktan sonra:

- Location (Sistemde kayıtlı lokasyonlardan birini seçer) (default olarak tarayıcı lokasyonunun lat ve long değerlerinden, kullanıcının en yakın olduğu lokasyon seçilecektir)
- Session Date (Giriş tarihi) (default olarak giriş yapıldığı tarih ve saat)

Personel sisteme giriş yaparken aşağıdaki bilgileri otomatik olarak access log'a kaydedilir:

- User (giriş yapan kullanıcı)
- Location (giriş yapıldığı lokasyon)
- Action Date (kullanıcının seçtiği session date)
- Created At (giriş yapıldığı tarih ve saat - otomatik olarak kaydedilir)
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

## YAPILACAKLAR LİSTESİ

1. **Lokasyon Yönetimi İyileştirmeleri**

   - Lokasyon detay sayfasında personel verileriyle birlikte görüntüleme özelliğinin tamamlanması
   - Lokasyonda aktif bulunan kullanıcıların listesini görüntüleme özelliğinin geliştirilmesi

2. **Access Log Modelinin Tamamlanması**

   - OS, device ve diğer eksik alanların API'de doğru bir şekilde kaydedilmesi
   - Çıkış loglarında kullanıcı durumu güncellemesinin tamamlanması
   - Lokasyon aktif kullanıcı sayısı güncellemesinin tamamlanması

3. **Genel İyileştirmeler**

   - Mock veri yerine gerçek API verilerinin kullanılması
   - Yetkilendirme kontrollerinin kapsamlı olarak uygulanması
   - Hata yönetimi ve kullanıcı bildirimlerinin geliştirilmesi

4. **UI İyileştirmeleri**

   - Duyarlı tasarımın tüm sayfalarda uygulanması
   - Tema desteğinin geliştirilmesi
   - Erişilebilirlik özelliklerinin iyileştirilmesi

5. **Performans Optimizasyonları**
   - Veri yükleme stratejilerinin optimize edilmesi
   - Önbelleğe alma mekanizmalarının uygulanması
   - Sayfa yükleme sürelerinin iyileştirilmesi

---

## Teknik Gereksinimler

- **Frontend**: Next.js, React, Ant Design, TailwindCSS ✅ _İmplemente edilmiş_
- **Backend**: Next.js API Routes ✅ _İmplemente edilmiş_
- **Mail**: Nodemailer
- **Database**: PostgreSQL ✅ _İmplemente edilmiş_
- **ORM**: Prisma ✅ _İmplemente edilmiş_
- **Authentication**: NextAuth.js ✅ _İmplemente edilmiş_
- **Deployment**: Vercel / Docker ✅ _Konfigürasyon mevcut_

# نظام مستودع قسم التعقيم (مجاني)

تطبيق ويب بسيط يعمل كـ PWA (قابل للتثبيت كأيقونة على الموبايل/الكمبيوتر) مع:

- سحب موظف برمز موظف
- لوحة مسؤول لإضافة/تعطيل الموظفين
- إدارة المنتجات والمخزون
- تقرير جرد أسبوعي (حسب المنتج + حسب الموظف)
- تخزين البيانات على Firebase Firestore

## 1) تجهيز Firebase (مرة واحدة)

1. افتحي [Firebase Console](https://console.firebase.google.com/).
2. أنشئي مشروع جديد.
3. من **Build > Firestore Database**:
   - أنشئي قاعدة Firestore.
   - اختاري production mode.
4. من **Project settings > General > Your apps**:
   - أضيفي Web App.
   - انسخي إعدادات Firebase.
5. افتحي الملف `public/firebase-config.js` وحطي القيم مكان `PUT_YOUR_...`.
6. غيّري `ADMIN_CODE` لرمز مسؤول آمن.

## 2) قواعد Firestore المقترحة

من Firestore > Rules ضعي مؤقتا:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> لاحقًا نقدر نرفع الأمان باستخدام Firebase Auth. حاليا هذا أسهل تشغيل سريع.

## 3) تشغيل محلي للتجربة

افتحي Terminal داخل المشروع ثم:

```bash
cd public
python -m http.server 8080
```

ثم افتحي:
[http://localhost:8080](http://localhost:8080)

## 4) نشر مجاني دائم على GitHub Pages

1. أنشئي Repository جديد على GitHub.
2. ارفعي ملفات المشروع.
3. في GitHub: Settings > Pages
   - Source: Deploy from branch
   - Branch: `master` (أو `main`)
   - Folder: `/public`
4. احفظي، وانتظري دقيقة.
5. سيظهر رابط الموقع، مثال:
   - `https://username.github.io/repo-name/`

## 5) تثبيت التطبيق كأيقونة

- Android (Chrome): افتحي الرابط > القائمة > Add to Home screen.
- Desktop (Chrome/Edge): من شريط العنوان يظهر زر Install.

## ملاحظات

- الموظف يدخل فقط: `رمز الموظف` + المنتج + الكمية.
- المسؤول فقط يدخل لوحة الإدارة برمز المسؤول.
- عند السحب يتم خصم المخزون تلقائيًا.
- زر **عرض الجرد الأسبوعي** يعطي مجموع السحب خلال 7 أيام.

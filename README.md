# Sterilization Department Inventory System (Free)

This project is a web-based inventory and withdrawal tracking system built for **Al-Kindi Hospital**.  
It runs as a PWA and can be used on mobile and desktop browsers.

## Features

- Employee withdrawal by personal code
- Admin dashboard for adding/disabling/deleting employees
- Product and stock management
- Weekly/custom period audit reports (by product and by employee)
- Notes from admin visible to employees
- Data storage using Firebase Firestore

## 1) Firebase Setup (One Time)

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project.
3. Go to **Firestore Database** and create a database.
4. In **Project settings > General > Your apps**, add a Web App.
5. Copy Firebase config values into `public/firebase-config.js`.
6. Set your admin code in `ADMIN_CODE`.

## 2) Firestore Rules (Quick Start)

Use these rules temporarily for setup/testing:

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

Later, you should secure access with Firebase Authentication and stricter rules.

## 3) Run Locally

```bash
cd public
python -m http.server 8080
```

Then open: [http://localhost:8080](http://localhost:8080)

## 4) Deploy on GitHub Pages

This repository is configured to deploy from:

- Branch: `main`
- Folder: `/docs`

After pushing changes to `main`, GitHub Pages updates automatically.

Live URL:
- `https://manar03-m.github.io/sterilization-inventory-pwa/`

## Notes

- Employees only enter: employee code, product, and quantity.
- Admin access is protected by `ADMIN_CODE`.
- Stock is reduced automatically after each withdrawal.
- Reports support dynamic day range and print/PDF export from browser.

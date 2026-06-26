// ── FIREBASE CONFIG ───────────────────────────────────────────────
const admin = require('firebase-admin');

let db, auth;

const initFirebase = () => {
  if (admin.apps.length > 0) return;

  // Option A: Variable d'environnement (production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
  // Option B: Fichier local (développement)
  else {
    try {
      const serviceAccount = require('./firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
    } catch (e) {
      console.warn('⚠️ Firebase non configuré — mode demo actif');
      return;
    }
  }

  db   = admin.firestore();
  auth = admin.auth();
  console.log('✅ Firebase connecté');
};

initFirebase();

module.exports = { admin, db, auth };

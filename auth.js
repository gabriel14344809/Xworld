// ── ROUTES AUTHENTIFICATION ───────────────────────────────────────
const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const { db }  = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');

const JWT_SECRET  = process.env.JWT_SECRET || 'xworld-secret-key-2026';
const JWT_EXPIRES = '30d';

// Générer un token JWT
const genToken = (user) => jwt.sign(
  { uid: user.id, email: user.email, firstName: user.firstName },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES }
);

// ── POST /api/auth/register ────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, country, avatar } = req.body;

    if (!firstName || !email || !password)
      return res.status(400).json({ error: 'Champs requis manquants', success: false });

    if (password.length < 6)
      return res.status(400).json({ error: 'Mot de passe trop court (6 min)', success: false });

    const hash = await bcrypt.hash(password, 12);

    const userData = {
      firstName, lastName: lastName || '',
      email: email.toLowerCase(),
      password: hash,
      country:  country || 'Suisse',
      avatar:   avatar  || '🌍',
      plan:     'free',
      xwlBalance: 1000, // Bonus bienvenue
      createdAt: new Date().toISOString(),
      regions:  ['europe', 'suisse'],
      accessAll: true
    };

    let userId;

    // Sauvegarder dans Firebase si disponible
    if (db) {
      const ref  = await db.collection('users').add(userData);
      userId = ref.id;
    } else {
      // Mode demo — générer un ID fictif
      userId = 'demo_' + Date.now();
    }

    const user  = { id: userId, ...userData };
    const token = genToken(user);

    // Ne pas retourner le mot de passe
    delete user.password;

    res.status(201).json({
      success: true,
      message: '🎉 Compte X World créé avec succès !',
      token,
      user
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email et mot de passe requis', success: false });

    let user = null;

    if (db) {
      const snap = await db.collection('users')
        .where('email', '==', email.toLowerCase())
        .limit(1).get();

      if (snap.empty)
        return res.status(404).json({ error: 'Compte introuvable', success: false });

      const doc = snap.docs[0];
      user = { id: doc.id, ...doc.data() };

      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return res.status(401).json({ error: 'Mot de passe incorrect', success: false });
    } else {
      // Mode demo
      user = {
        id: 'demo_user', firstName: 'Demo', lastName: 'User',
        email, country: 'Suisse', avatar: '🌍', plan: 'pro',
        xwlBalance: 5000, accessAll: true
      };
    }

    const token = genToken(user);
    delete user.password;

    res.json({
      success: true,
      message: `Bienvenue ${user.firstName} ! 🌍`,
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    let user = req.user;

    if (db && req.user.uid) {
      const doc = await db.collection('users').doc(req.user.uid).get();
      if (doc.exists) user = { id: doc.id, ...doc.data() };
      delete user.password;
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────
router.post('/logout', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Déconnecté avec succès' });
});

module.exports = router;

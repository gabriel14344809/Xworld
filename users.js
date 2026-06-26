// ── ROUTES UTILISATEURS ───────────────────────────────────────────
const router = require('express').Router();
const { db } = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    let user = req.user;
    if (db) {
      const doc = await db.collection('users').doc(req.user.uid).get();
      if (doc.exists) { user = { id: doc.id, ...doc.data() }; delete user.password; }
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

// PUT /api/users/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; delete updates.email;
    if (db) await db.collection('users').doc(req.user.uid).update({ ...updates, updatedAt: new Date().toISOString() });
    res.json({ success: true, message: 'Profil mis à jour ✅', updates });
  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

// GET /api/users/xwl-balance
router.get('/xwl-balance', requireAuth, async (req, res) => {
  try {
    let balance = 0;
    if (db) {
      const doc = await db.collection('users').doc(req.user.uid).get();
      balance = doc.data()?.xwlBalance || 0;
    } else { balance = 5000; }
    res.json({ success: true, balance, symbol: 'XWL' });
  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

module.exports = router;

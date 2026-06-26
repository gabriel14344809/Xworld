// ── ROUTES PAIEMENT STRIPE ────────────────────────────────────────
const router  = require('express').Router();
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_demo');
const { db }  = require('../config/firebase');
const { requireAuth } = require('../middleware/auth');

// ── POST /api/payments/create-intent ─────────────────────────────
// Crée un PaymentIntent Stripe pour une réservation
router.post('/create-intent', requireAuth, async (req, res) => {
  try {
    const { amount, currency = 'chf', description, type, metadata = {} } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ error: 'Montant invalide', success: false });

    // Mode demo si pas de clé Stripe
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo') {
      return res.json({
        success: true,
        demo: true,
        clientSecret: 'demo_secret_' + Date.now(),
        paymentIntentId: 'pi_demo_' + Date.now(),
        amount,
        currency,
        message: '✅ Mode demo — paiement simulé'
      });
    }

    const intent = await stripe.paymentIntents.create({
      amount:      Math.round(amount * 100), // Stripe utilise les centimes
      currency,
      description: description || 'X World Hub — Réservation',
      metadata: {
        userId: req.user.uid || 'anonymous',
        type:   type || 'booking',
        ...metadata
      }
    });

    res.json({
      success:         true,
      clientSecret:    intent.client_secret,
      paymentIntentId: intent.id,
      amount,
      currency
    });

  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

// ── POST /api/payments/confirm ────────────────────────────────────
// Confirme un paiement et sauvegarde la réservation
router.post('/confirm', requireAuth, async (req, res) => {
  try {
    const { paymentIntentId, bookingData } = req.body;

    const booking = {
      userId:          req.user.uid || 'demo',
      paymentIntentId: paymentIntentId || 'demo_' + Date.now(),
      status:          'confirmed',
      reference:       'XW-' + Date.now().toString(36).toUpperCase(),
      ...bookingData,
      confirmedAt:     new Date().toISOString()
    };

    if (db) {
      await db.collection('bookings').add(booking);
    }

    res.json({
      success:   true,
      message:   '🎉 Réservation confirmée !',
      reference: booking.reference,
      booking
    });

  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

// ── GET /api/payments/bookings ────────────────────────────────────
// Récupère les réservations de l'utilisateur
router.get('/bookings', requireAuth, async (req, res) => {
  try {
    let bookings = [];

    if (db) {
      const snap = await db.collection('bookings')
        .where('userId', '==', req.user.uid)
        .orderBy('confirmedAt', 'desc')
        .limit(50).get();
      bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      // Demo data
      bookings = [
        { id: '1', reference: 'XW-DEMO001', name: 'Vol Paris → Tokyo', price: 850, status: 'confirmed', confirmedAt: new Date().toISOString() },
        { id: '2', reference: 'XW-DEMO002', name: 'Hôtel Shinjuku 3 nuits', price: 450, status: 'confirmed', confirmedAt: new Date().toISOString() }
      ];
    }

    res.json({ success: true, bookings, total: bookings.length });

  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

// ── POST /api/payments/subscribe ─────────────────────────────────
// Abonnement X World Pro
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { plan = 'pro' } = req.body;
    const prices = { pro: 990, business: 2900 }; // en centimes CHF

    if (!prices[plan])
      return res.status(400).json({ error: 'Plan invalide', success: false });

    // Mode demo
    res.json({
      success:  true,
      demo:     true,
      plan,
      price:    prices[plan] / 100,
      currency: 'CHF',
      message:  `✅ Abonnement ${plan} activé (mode demo) !`
    });

  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

module.exports = router;

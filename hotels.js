// ── ROUTES HOTELS ─────────────────────────────────────────────────
const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth');

// POST /api/hotels/search
router.post('/search', optionalAuth, async (req, res) => {
  try {
    const { destination, checkIn, checkOut, guests = 1, budget = 'medium' } = req.body;
    if (!destination) return res.status(400).json({ error: 'Destination requise', success: false });

    const priceRanges = { economy: [50,120], medium: [120,280], luxury: [280,600], ultra: [600,2000] };
    const [min, max] = priceRanges[budget] || priceRanges.medium;

    const hotelNames = [
      { name:`Grand Hotel ${destination}`, stars:5, icon:'🏰' },
      { name:`${destination} Palace`,      stars:5, icon:'👑' },
      { name:`Hotel Central ${destination}`,stars:4,icon:'🏨' },
      { name:`${destination} Boutique`,    stars:4, icon:'🌟' },
      { name:`Budget Inn ${destination}`,  stars:3, icon:'🛏️' },
    ];

    const hotels = hotelNames.map((h, i) => ({
      id:          `HT${Date.now()}${i}`,
      name:        h.name,
      stars:       h.stars,
      icon:        h.icon,
      destination,
      checkIn:     checkIn  || new Date().toISOString().split('T')[0],
      checkOut:    checkOut || new Date(Date.now() + 3*86400000).toISOString().split('T')[0],
      pricePerNight: Math.round(min + Math.random() * (max - min)),
      currency:    'CHF',
      rating:      (3.5 + Math.random() * 1.5).toFixed(1),
      reviews:     Math.floor(Math.random() * 2000 + 100),
      amenities:   ['WiFi','Petit-déj','Parking','Piscine','Spa'].slice(0, 2 + i % 3),
      guests,
      available:   true
    }));

    res.json({ success: true, hotels, count: hotels.length, demo: true });
  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

module.exports = router;

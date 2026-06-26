// ── ROUTES VOLS ───────────────────────────────────────────────────
const flightRouter = require('express').Router();
const { optionalAuth } = require('../middleware/auth');

// POST /api/flights/search
flightRouter.post('/search', optionalAuth, async (req, res) => {
  try {
    const { from, to, date, passengers = 1, cabin = 'economy' } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Départ et destination requis', success: false });

    // Mode demo — résultats simulés réalistes
    const airlines = [
      { name:'Air France',  code:'AF', icon:'🇫🇷', hub:'CDG' },
      { name:'Swiss',       code:'LX', icon:'🇨🇭', hub:'ZRH' },
      { name:'Lufthansa',   code:'LH', icon:'🇩🇪', hub:'FRA' },
      { name:'British',     code:'BA', icon:'🇬🇧', hub:'LHR' },
      { name:'Emirates',    code:'EK', icon:'🇦🇪', hub:'DXB' },
    ];

    const flights = airlines.map((a, i) => ({
      id:          `FL${Date.now()}${i}`,
      airline:     a.name,
      code:        a.code,
      icon:        a.icon,
      from,
      to,
      date:        date || new Date().toISOString().split('T')[0],
      departure:   `${8 + i * 3}:${i % 2 === 0 ? '00' : '30'}`,
      arrival:     `${14 + i * 2}:${i % 2 === 0 ? '45' : '15'}`,
      duration:    `${6 + i}h${i * 15}min`,
      stops:       i === 0 ? 0 : 1,
      price:       Math.round(350 + i * 120 + Math.random() * 100),
      currency:    'CHF',
      cabin,
      passengers,
      available:   Math.floor(Math.random() * 8) + 1
    }));

    res.json({ success: true, flights, count: flights.length, demo: true });
  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

// GET /api/flights/status/:flightNumber
flightRouter.get('/status/:flightNumber', optionalAuth, (req, res) => {
  res.json({
    success: true,
    flight: req.params.flightNumber,
    status: 'On Time ✅',
    gate: 'B' + Math.floor(Math.random() * 30 + 1),
    demo: true
  });
});

module.exports = flightRouter;

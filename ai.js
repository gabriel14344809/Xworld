// ── ROUTE IA CLAUDE ───────────────────────────────────────────────
const router    = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');
const { optionalAuth } = require('../middleware/auth');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const SYSTEM = `Tu es l'assistant IA de X World Hub, la super app de voyage mondiale basée en Suisse. 
Tu aides les utilisateurs avec : vols, hôtels, transport VTC, météo, navigation, traduction, finance/devises, guide touristique, santé voyage, shopping Amazon.
Couvre 9 régions : Europe, Suisse, Russie, USA, Inde, Asie, Chine, Amérique du Sud, Australie.
Réponds en français, de façon pratique, concise et bienveillante. Utilise des emojis.`;

// ── POST /api/ai/chat ─────────────────────────────────────────────
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, history = [], context = '' } = req.body;

    if (!message)
      return res.status(400).json({ error: 'Message requis', success: false });

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({
        success: true,
        demo:    true,
        reply:   `🤖 Mode demo — Votre message "${message}" a bien été reçu ! Configurez ANTHROPIC_API_KEY pour activer l'IA complète.`
      });
    }

    // Construire l'historique pour Claude
    const messages = [
      ...history.slice(-10).map(h => ({
        role:    h.role === 'me' ? 'user' : 'assistant',
        content: h.text
      })),
      { role: 'user', content: context ? `[Contexte: ${context}]\n${message}` : message }
    ];

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system:     SYSTEM,
      messages
    });

    const reply = response.content[0]?.text || 'Désolé, je n\'ai pas pu répondre.';

    res.json({ success: true, reply, tokens: response.usage });

  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// ── POST /api/ai/translate ────────────────────────────────────────
router.post('/translate', optionalAuth, async (req, res) => {
  try {
    const { text, from = 'fr', to = 'en' } = req.body;

    if (!text)
      return res.status(400).json({ error: 'Texte requis', success: false });

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ success: true, demo: true, translation: `[Demo] ${text}` });
    }

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages:   [{
        role:    'user',
        content: `Traduis ce texte de ${from} vers ${to}: "${text}". Réponds UNIQUEMENT avec la traduction, sans explication.`
      }]
    });

    res.json({
      success:     true,
      translation: response.content[0]?.text || text,
      from,
      to
    });

  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

// ── POST /api/ai/guide ────────────────────────────────────────────
router.post('/guide', optionalAuth, async (req, res) => {
  try {
    const { destination, style = 'tourisme', days = 7 } = req.body;

    if (!destination)
      return res.status(400).json({ error: 'Destination requise', success: false });

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ success: true, demo: true, guide: `Guide demo pour ${destination}` });
    }

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages:   [{
        role:    'user',
        content: `Crée un guide de voyage de ${days} jours pour ${destination}, style "${style}". Inclus : top attractions, restaurants, transport, budget, conseils pratiques. Format structuré avec emojis.`
      }]
    });

    res.json({
      success:     true,
      guide:       response.content[0]?.text,
      destination,
      days,
      style
    });

  } catch (err) {
    res.status(500).json({ error: err.message, success: false });
  }
});

module.exports = router;

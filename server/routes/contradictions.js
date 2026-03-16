const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET /api/contradictions — all contradiction pairs
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contradictions')
      .select(`
        *,
        event_a:events!event_id_a(id, title, date, category),
        event_b:events!event_id_b(id, title, date, category)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// FIX: /stats MUST come before /:id to avoid Express matching 'stats' as an id param
router.get('/stats', async (req, res) => {
  try {
    const { president = 'trump' } = req.query;
    const { data, error } = await supabase
      .from('promises')
      .select('status')
      .eq('president', president);

    if (error) throw error;

    const stats = data.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, { kept: 0, broken: 0, pending: 0, reversed: 0 });

    stats.total = data.length;
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all promises with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, category, president = 'trump' } = req.query;
    let query = supabase
      .from('promises')
      .select('*')
      .eq('president', president)
      .order('date_made', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (category && category !== 'all') query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

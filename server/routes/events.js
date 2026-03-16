import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// GET all events with filters — includes reactions and contradiction flags
router.get('/', async (req, res) => {
  try {
    const { category, president = 'trump', limit = 50, offset = 0 } = req.query;
    let query = supabase
      .from('events')
      .select('*')
      .eq('president', president)
      .order('date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category && category !== 'all') query = query.eq('category', category);

    const { data: events, error } = await query;
    if (error) throw error;
    if (!events || events.length === 0) return res.json([]);

    // Fetch reactions for all returned events in one query
    const eventIds = events.map(e => e.id);
    const { data: reactions } = await supabase
      .from('reactions')
      .select('*')
      .in('event_id', eventIds);

    // Fetch contradictions (just IDs) to show badge on cards
    const { data: contradictions } = await supabase
      .from('contradictions')
      .select('event_id_a, event_id_b')
      .or(eventIds.map(id => `event_id_a.eq.${id},event_id_b.eq.${id}`).join(','));

    // Attach to events
    const contradictionSet = new Set();
    (contradictions || []).forEach(c => {
      contradictionSet.add(c.event_id_a);
      contradictionSet.add(c.event_id_b);
    });

    const enriched = events.map(ev => ({
      ...ev,
      reactions: (reactions || []).filter(r => r.event_id === ev.id),
      contradictions: contradictionSet.has(ev.id) ? [{}] : [], // just for badge presence
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single event with full reactions and contradictions
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [eventRes, reactionsRes, contraRes] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('reactions').select('*').eq('event_id', id),
      supabase
        .from('contradictions')
        .select('*, event_a:event_id_a(id,title,date,category), event_b:event_id_b(id,title,date,category)')
        .or(`event_id_a.eq.${id},event_id_b.eq.${id}`),
    ]);

    if (eventRes.error) throw eventRes.error;
    res.json({
      ...eventRes.data,
      reactions: reactionsRes.data || [],
      contradictions: contraRes.data || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

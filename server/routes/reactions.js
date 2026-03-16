import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// POST react to an event (upsert)
router.post('/', async (req, res) => {
  try {
    const { event_id, type } = req.body;
    const validTypes = ['absurd', 'outrageous', 'unbelievable', 'classic'];
    if (!event_id || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid event_id or reaction type' });
    }

    // Check if row exists
    const { data: existing } = await supabase
      .from('reactions')
      .select('id, count')
      .eq('event_id', event_id)
      .eq('type', type)
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('reactions')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('reactions')
        .insert({ event_id, type, count: 1 })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

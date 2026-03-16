import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// Basic sanitizer — strip HTML tags to prevent XSS stored in DB
function sanitize(str) {
  return String(str || '').replace(/<[^>]*>/g, '').trim();
}

// GET comments for an event
router.get('/:eventId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('event_id', req.params.eventId)
      .eq('flagged', false)
      .order('upvotes', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new comment
router.post('/', async (req, res) => {
  try {
    const { event_id, author_name, body } = req.body;
    if (!event_id || !body) return res.status(400).json({ error: 'event_id and body required' });

    const cleanBody = sanitize(body);
    const cleanName = sanitize(author_name) || 'Anonymous';

    if (cleanBody.length === 0) return res.status(400).json({ error: 'Comment cannot be empty' });
    if (cleanBody.length > 1000) return res.status(400).json({ error: 'Comment too long (max 1000 chars)' });
    if (cleanName.length > 80) return res.status(400).json({ error: 'Name too long' });

    const { data, error } = await supabase
      .from('comments')
      .insert({ event_id, author_name: cleanName, body: cleanBody })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upvote a comment
router.post('/:id/upvote', async (req, res) => {
  try {
    const { data: comment, error: fetchErr } = await supabase
      .from('comments').select('upvotes').eq('id', req.params.id).single();
    if (fetchErr) throw fetchErr;

    const { data, error } = await supabase
      .from('comments')
      .update({ upvotes: (comment?.upvotes || 0) + 1 })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST flag a comment
router.post('/:id/flag', async (req, res) => {
  try {
    const { error } = await supabase.from('comments').update({ flagged: true }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

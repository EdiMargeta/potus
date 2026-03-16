import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// Simple password middleware
const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Verify password endpoint
router.post('/verify', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// --- EVENTS ---
router.post('/events', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('events').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/events/:id', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('events').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/events/:id', adminAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('events').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROMISES ---
router.post('/promises', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('promises').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/promises/:id', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('promises').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/promises/:id', adminAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('promises').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CONTRADICTIONS ---
router.post('/contradictions', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('contradictions').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/contradictions/:id', adminAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('contradictions').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COMMENTS (moderation) ---
router.get('/comments', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/comments/:id', adminAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('comments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

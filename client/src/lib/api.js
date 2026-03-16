import { supabase } from './supabase.js';
import { getAdminClient } from './adminAuth.js';

// ─── PUBLIC API (anon key, RLS-protected) ────────────────────────────────────

export const api = {

  // EVENTS
  async getEvents({ category, president = 'trump', limit = 20, offset = 0 } = {}) {
    let query = supabase
      .from('events')
      .select('*, reactions(*), contradictions_a:contradictions!event_id_a(id), contradictions_b:contradictions!event_id_b(id)')
      .eq('president', president)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map(ev => ({
      ...ev,
      contradictions: [...(ev.contradictions_a || []), ...(ev.contradictions_b || [])],
    }));
  },

  async getEvent(id) {
    const [evRes, rxRes, cxRes] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('reactions').select('*').eq('event_id', id),
      supabase.from('contradictions')
        .select('*, event_a:event_id_a(id,title,date,category), event_b:event_id_b(id,title,date,category)')
        .or(`event_id_a.eq.${id},event_id_b.eq.${id}`),
    ]);
    if (evRes.error) throw new Error(evRes.error.message);
    return { ...evRes.data, reactions: rxRes.data || [], contradictions: cxRes.data || [] };
  },

  // PROMISES
  async getPromises({ status, category, president = 'trump' } = {}) {
    let q = supabase.from('promises').select('*').eq('president', president).order('date_made', { ascending: false });
    if (status && status !== 'all') q = q.eq('status', status);
    if (category && category !== 'all') q = q.eq('category', category);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getPromiseStats(president = 'trump') {
    const { data, error } = await supabase.from('promises').select('status').eq('president', president);
    if (error) throw new Error(error.message);
    const stats = (data || []).reduce(
      (acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; },
      { kept: 0, broken: 0, pending: 0, reversed: 0 }
    );
    stats.total = data.length;
    return stats;
  },

  // COMMENTS
  async getComments(eventId) {
    const { data, error } = await supabase.from('comments').select('*')
      .eq('event_id', eventId).eq('flagged', false).order('upvotes', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async postComment({ event_id, author_name, body }) {
    const clean = s => String(s || '').replace(/<[^>]*>/g, '').trim();
    const cleanBody = clean(body);
    const cleanName = clean(author_name) || 'Anonymous';
    if (!cleanBody) throw new Error('Comment cannot be empty');
    if (cleanBody.length > 1000) throw new Error('Comment too long (max 1000 chars)');
    if (cleanName.length > 80) throw new Error('Name too long');
    const { data, error } = await supabase.from('comments')
      .insert({ event_id, author_name: cleanName, body: cleanBody }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async upvoteComment(id) {
    const { data: cur } = await supabase.from('comments').select('upvotes').eq('id', id).single();
    const { data, error } = await supabase.from('comments')
      .update({ upvotes: (cur?.upvotes || 0) + 1 }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async flagComment(id) {
    const { error } = await supabase.from('comments').update({ flagged: true }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  // REACTIONS
  async postReaction(event_id, type) {
    const valid = ['absurd', 'outrageous', 'unbelievable', 'classic'];
    if (!valid.includes(type)) throw new Error('Invalid reaction type');
    const { data: ex } = await supabase.from('reactions').select('id,count').eq('event_id', event_id).eq('type', type).single();
    if (ex) {
      const { data, error } = await supabase.from('reactions').update({ count: ex.count + 1 }).eq('id', ex.id).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const { data, error } = await supabase.from('reactions').insert({ event_id, type, count: 1 }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
};

// ─── ADMIN API (service_role key — bypasses RLS) ─────────────────────────────

export const adminApi = {
  async getEvents() {
    const { data, error } = await getAdminClient().from('events').select('*').order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },
  async getPromises() {
    const { data, error } = await getAdminClient().from('promises').select('*').order('date_made', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },
  async createEvent(ev) {
    const { data, error } = await getAdminClient().from('events').insert(ev).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  async updateEvent(id, ev) {
    const { data, error } = await getAdminClient().from('events').update(ev).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  async deleteEvent(id) {
    const { error } = await getAdminClient().from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
  async createPromise(p) {
    const { data, error } = await getAdminClient().from('promises').insert(p).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  async updatePromise(id, p) {
    const { data, error } = await getAdminClient().from('promises').update(p).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  async deletePromise(id) {
    const { error } = await getAdminClient().from('promises').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
  async getComments() {
    const { data, error } = await getAdminClient().from('comments').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },
  async deleteComment(id) {
    const { error } = await getAdminClient().from('comments').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
  async createContradiction(c) {
    const { data, error } = await getAdminClient().from('contradictions').insert(c).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  async deleteContradiction(id) {
    const { error } = await getAdminClient().from('contradictions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

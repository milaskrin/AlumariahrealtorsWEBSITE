/* Shared database access. Permissions are enforced by Supabase RLS, not this UI. */
window.PropertyStore = (() => {
    const config = window.ALUMARIAH_CONFIG || {};
    const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey);
    const client = configured && window.supabase
        ? window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey)
        : null;
    function requireClient() {
        if (!client) throw new Error('Admin setup is incomplete. Connect the Supabase project in config.js.');
        return client;
    }
    function safeImage(value) {
        if (typeof value !== 'string') return '';
        try {
            const url = new URL(value);
            return url.protocol === 'https:' ? url.href : '';
        } catch { return ''; }
    }
    function normalise(row) {
        const p = row.data || {};
        if (!/^[a-zA-Z0-9_-]+$/.test(row.id)) throw new Error('Invalid property identifier.');
        return {
            id: row.id,
            title: String(p.title || ''), location: String(p.location || ''),
            status: String(p.status || ''), type: String(p.type || ''),
            price: Number(p.price) || 0, beds: Number(p.beds) || 0, baths: Number(p.baths) || 0,
            size: String(p.size || ''), description: String(p.description || ''),
            images: Array.isArray(p.images) ? p.images.map(safeImage).filter(Boolean) : [],
            createdAt: row.created_at
        };
    }
    async function list() {
        const db = requireClient();
        const all = [];
        // Supabase caps response sizes: page so larger catalogues remain complete.
        for (let offset = 0; ; offset += 100) {
            const { data, error } = await db.from('properties').select('id,data,created_at')
                .eq('archived', false).order('created_at', { ascending: false }).order('id')
                .range(offset, offset + 99);
            if (error) throw error;
            all.push(...data.map(normalise));
            if (data.length < 100) break;
        }
        return all;
    }
    async function isAdmin() {
        const db = requireClient();
        const { data: { user }, error } = await db.auth.getUser();
        if (error || !user) return null;
        const result = await db.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
        if (result.error) throw result.error;
        return result.data ? user : null;
    }
    async function save(property, editing) {
        const { id, createdAt, ...data } = property;
        const db = requireClient();
        const query = editing
            ? db.from('properties').update({ data }).eq('id', id).eq('archived', false)
            : db.from('properties').insert({ id, data });
        const result = await query.select('id').single();
        if (result.error) throw result.error;
    }
    async function archive(id) {
        const { error } = await requireClient().from('properties').update({ archived: true }).eq('id', id).select('id').single();
        if (error) throw error;
    }
    async function uploadImage(dataUrl, propertyId) {
        const blob = await (await fetch(dataUrl)).blob();
        const path = `${propertyId}/${crypto.randomUUID()}.jpg`;
        const bucket = requireClient().storage.from('property-images');
        const { error } = await bucket.upload(path, blob, { contentType: 'image/jpeg', upsert: false });
        if (error) throw error;
        return { path, url: bucket.getPublicUrl(path).data.publicUrl };
    }
    async function removeUploads(paths) {
        if (!paths.length) return;
        const { error } = await requireClient().storage.from('property-images').remove(paths);
        if (error) console.error('Unused uploaded images need cleanup:', error.message);
    }
    return { configured, client, requireClient, list, isAdmin, save, archive, uploadImage, removeUploads };
})();

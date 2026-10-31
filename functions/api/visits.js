// Visitor counter (Cloudflare Pages Function + D1). Bind a D1 database as "DB" in the Pages project settings.
// POST = count this visit (the page sends it once per browser per day); GET = read the total.
export async function onRequest({ request, env }) {
  const h = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  if (!env.DB) return new Response('{"ok":false}', { status: 503, headers: h });
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS counter (k TEXT PRIMARY KEY, n INTEGER NOT NULL)').run();
  if (request.method === 'POST') {
    const day = 'd:' + new Date().toISOString().slice(0, 10);
    const up = 'INSERT INTO counter (k, n) VALUES (?, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1';
    await env.DB.batch([env.DB.prepare(up).bind('visits'), env.DB.prepare(up).bind(day)]);
  }
  const t = await env.DB.prepare("SELECT n FROM counter WHERE k = 'visits'").first();
  const d = await env.DB.prepare('SELECT n FROM counter WHERE k = ?').bind('d:' + new Date().toISOString().slice(0, 10)).first();
  return new Response(JSON.stringify({ ok: true, n: t ? t.n : 0, today: d ? d.n : 0 }), { headers: h });
}

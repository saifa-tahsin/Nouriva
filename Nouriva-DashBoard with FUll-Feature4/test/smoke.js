/* Smoke test: node test/smoke.js  (no API key or internet needed — uses a fake AI server) */
const http = require('http');
const assert = require('assert');

let lastBody = null;
const fakeAI = http.createServer((req, res) => {          // pretends to be api.anthropic.com
  let b = ''; req.on('data', c => b += c); req.on('end', () => {
    lastBody = JSON.parse(b);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ content: [{ type: 'text', text: 'Fake answer: 2 eggs = 156 kcal.' }] }));
  });
});

fakeAI.listen(0, async () => {
  process.env.LLM_PROVIDER = 'anthropic';
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_BASE_URL = 'http://127.0.0.1:' + fakeAI.address().port;
  const { server } = require('../server.js');
  server.listen(0, async () => {
    const base = 'http://127.0.0.1:' + server.address().port;
    try {
      let r = await fetch(base + '/api/health');                       assert.strictEqual((await r.json()).aiConfigured, true);
      r = await fetch(base + '/member4/data/foods.json');                      assert.ok((await r.json()).length >= 20);
      r = await fetch(base + '/member4/tracker.html');                         assert.strictEqual(r.status, 200);
      r = await fetch(base + '/member4/assistant.html');                       assert.strictEqual(r.status, 200);
      r = await fetch(base + '/..%2Fserver.js');                       assert.ok([403, 404].includes(r.status), 'path traversal blocked');

      r = await fetch(base + '/api/chat', { method: 'POST', body: JSON.stringify({
        message: 'Calories in 2 eggs', history: [{ role: 'assistant', content: 'hi' }],
        context: { goals: { kcal: 2000 }, totals: { kcal: 300 }, entries: [{ meal: 'lunch', foodId: 'egg', qty: 2 }, { meal: 'x', foodId: 'hacker', qty: 1 }] } }) });
      const d = await r.json();
      assert.strictEqual(r.status, 200);                               assert.ok(d.reply.includes('156'));
      assert.strictEqual(lastBody.messages[0].role, 'user');          // starts with user
      assert.ok(lastBody.system.includes('Egg (boiled)'));             // dataset grounding
      assert.ok(lastBody.system.includes('2 x Egg (boiled)'));         // today's log included
      assert.ok(!lastBody.system.includes('hacker'));                  // unknown ids ignored

      r = await fetch(base + '/api/chat', { method: 'POST', body: JSON.stringify({ message: '' }) });
      assert.strictEqual(r.status, 400);
      console.log('All smoke tests passed');
    } catch (e) { console.error('FAILED:', e.message); process.exitCode = 1; }
    server.close(); fakeAI.close();
  });
});

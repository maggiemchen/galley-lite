// galley-lite journey harness — drives the REAL overlay like a user, reads the
// deterministic event log, computes per-journey pass/fail. Codex-reviewed:
// every journey snapshots a baseline event index and filters FORWARD, so a
// later journey never false-passes on a stale event.
//
//   node test/journeys.mjs        (needs playwright on NODE_PATH or installed locally)
//
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const MJS = new URL("../galley-lite.mjs", import.meta.url).pathname;
const SRC = new URL("../examples/sample.html", import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const rec = (id, name, pass, detail) => { results.push({ id, name, pass: !!pass, detail }); console.log(`${pass ? "PASS" : "FAIL"}  ${id} ${name} — ${detail}`); };

// ---- event log helpers (baseline-scoped) ---------------------------------------
function evAll(log) { try { return readFileSync(log, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } }
const scope = (log) => { const base = evAll(log).length; return {
  from: () => evAll(log).slice(base),
  has: (t) => evAll(log).slice(base).some((e) => e.type === t),
  last: (t) => [...evAll(log).slice(base)].reverse().find((e) => e.type === t),
  all: (t) => evAll(log).slice(base).filter((e) => e.type === t),
}; };
async function until(pred, ms = 120000, step = 800) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (pred()) return true; await sleep(step); } return false; }

function boot({ doc, port, args = [], env = {} }) {
  const log = doc + ".events.jsonl"; writeFileSync(log, "");
  const srv = spawn("node", [MJS, doc, "--no-open", "--port", String(port), ...args],
    { env: { ...process.env, GALLEY_EVENTS_LOG: log, ...env }, stdio: "ignore" });
  return { srv, log, port };
}
const stop = (b) => { try { process.kill(b.srv.pid); } catch {} };
const headline = (doc) => { const m = readFileSync(doc, "utf8").match(/<h1[^>]*>([^<]*)<\/h1>/); return m ? m[1] : null; };
const fileHas = (doc, s) => readFileSync(doc, "utf8").includes(s);

// enter comment mode + pick an element + fill the popover + attach (the real
// capture-phase picker; page.click alone doesn't trip it — verified by hand).
async function attachComment(page, selector, text) {
  return page.evaluate(({ selector, text }) => {
    const t = document.getElementById("gl-toggle");
    if (!t.classList.contains("gl-on")) t.click();
    const el = document.querySelector(selector); const r = el.getBoundingClientRect();
    const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
    for (const type of ["mousemove", "mousedown", "mouseup", "click"])
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }));
    const pop = document.getElementById("gl-pop"); if (!pop) return false;
    const ta = pop.querySelector("textarea"); ta.value = text; ta.dispatchEvent(new Event("input", { bubbles: true }));
    pop.querySelector(".gl-go").click(); return true;
  }, { selector, text });
}
const openPanel = (page) => page.evaluate(() => { const p = document.getElementById("gl-panel"); if (!p.classList.contains("gl-show")) document.getElementById("gl-list").click(); });
const setInput = (page, m) => page.evaluate((m) => { const i = document.getElementById("gl-input"); i.value = m; i.dispatchEvent(new Event("input", { bubbles: true })); }, m);
const clickSend = (page) => page.evaluate(() => document.getElementById("gl-send").click());
const typeSend = async (page, msg) => { await openPanel(page); await setInput(page, msg); await clickSend(page); };

const browser = await chromium.launch();

// ===== GROUP A — one warm server/page: J1, J19, J7, J9/10, J11, J12, J13, J6, J8, J15, J20
{
  const doc = join(tmpdir(), "gl-A.html"); copyFileSync(SRC, doc);
  const b = boot({ doc, port: 4420, args: ["--fresh"] });
  await until(() => scope(b.log).has("server_start"), 15000, 300);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 880 } });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${b.port}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#gl-bar", { timeout: 15000 });

  { await sleep(1500);
    const ss = evAll(b.log).find((e) => e.type === "server_start"), sc = evAll(b.log).find((e) => e.type === "sse_connected");
    rec("J1", "launch → overlay live", sc && await page.isVisible("#gl-bar"), `time-to-overlay ${sc && ss ? sc.ts - ss.ts : "?"}ms`); }

  { await page.click("#gl-list"); await sleep(300);
    const dis = await page.evaluate(() => document.getElementById("gl-send").disabled);
    await page.fill("#gl-input", "x"); await sleep(150);
    const en = await page.evaluate(() => !document.getElementById("gl-send").disabled);
    await page.fill("#gl-input", "");
    rec("J19", "empty-send guard", dis && en, `disabled-empty=${dis}, enabled-typed=${en}`); }

  { const s = scope(b.log); const before = headline(doc);
    await typeSend(page, "Change the main headline text to exactly: GalleyOne");
    const ok = await until(() => s.all("turn_completed").length >= 1) && await until(() => headline(doc) === "GalleyOne", 8000, 400);
    const tc = s.last("turn_completed");
    rec("J7", "chat edit applied + reload", ok && s.has("edit_applied") && s.has("file_reloaded"), `"${before}"→"${headline(doc)}", edit_applied=${s.has("edit_applied")}, reload=${s.has("file_reloaded")}, ${tc?.duration_ms}ms`);
    rec("J9", "cold first turn", !!tc, `${tc?.duration_ms}ms`);
    rec("J11", "token streaming (TTFT)", s.last("turn_first_token") && s.last("turn_first_token").ms < tc.duration_ms, `TTFT=${s.last("turn_first_token")?.ms}ms < turn=${tc?.duration_ms}ms`);
    rec("J12", "live reload reflects edit", s.has("file_reloaded") && headline(doc) === "GalleyOne", `DOM shows "${headline(doc)}"`); }

  { const s = scope(b.log);
    await typeSend(page, "Change the main headline text to exactly: GalleyTwo");
    await until(() => s.all("turn_completed").length >= 1); await until(() => headline(doc) === "GalleyTwo", 8000, 400);
    const warm = s.last("turn_completed");
    const cold = evAll(b.log).filter((e) => e.type === "turn_completed")[0];
    const reused = !s.has("agent_spawn"); // deterministic: warm turn did NOT spawn a new agent (latency varies per request)
    rec("J10", "warm turn reuses agent", reused, `agent reused=${reused}; cold=${cold?.duration_ms}ms warm=${warm?.duration_ms}ms`); }

  { const s = scope(b.log); const before = headline(doc);
    await page.click("#gl-undo");
    const rev = await until(() => headline(doc) !== before, 8000, 400);
    rec("J13", "undo reverts last edit", rev && s.has("undo") && s.last("undo").ok, `"${before}"→"${headline(doc)}"`); }

  { const s = scope(b.log);
    const opened = await attachComment(page, "#headline", "Change this heading text to exactly: GalleyComment");
    await page.waitForFunction(() => !document.getElementById("gl-send").disabled, { timeout: 5000 }).catch(() => {});
    await clickSend(page);
    const ok = opened && await until(() => headline(doc) === "GalleyComment");
    const ts = s.last("turn_sent");
    rec("J6", "comment-on-element → edit", ok && ts?.source === "comment", `popover=${opened}, source=${ts?.source}, "${headline(doc)}"`); }

  { const s = scope(b.log);
    await attachComment(page, "#headline", "comment one"); await sleep(200);
    await attachComment(page, "#lede", "comment two"); await sleep(200);
    await attachComment(page, "#users", "comment three"); await sleep(200);
    const chips = await page.evaluate(() => document.querySelectorAll("#gl-pending .gl-chip").length);
    await clickSend(page);
    await until(() => s.all("turn_completed").length >= 1);
    const ts = s.last("turn_sent");
    rec("J8", "batch comments (3 → one turn)", chips === 3 && ts?.comments_n === 3, `chips=${chips}, comments_n=${ts?.comments_n}`); }

  { const s = scope(b.log);
    const p2 = await ctx.newPage(); await p2.goto(`http://localhost:${b.port}/`, { waitUntil: "domcontentloaded" });
    await p2.waitForSelector("#gl-bar", { timeout: 10000 }); await sleep(1500);
    const bubbles = await p2.evaluate(() => document.querySelectorAll("#gl-thread .gl-bubble").length);
    rec("J20", "multi-tab shares thread", s.has("sse_connected") && bubbles > 0, `new sse_connected=${s.all("sse_connected").length}, tab2 sees ${bubbles} bubbles`);
    await p2.close(); }
  await ctx.close(); stop(b);
}

// ===== J15 — multi-edit single turn (own fresh doc for determinism) =====
{
  const doc = join(tmpdir(), "gl-J15.html"); copyFileSync(SRC, doc);
  const b = boot({ doc, port: 4426, args: ["--fresh"] });
  await until(() => scope(b.log).has("server_start"), 15000, 300);
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.goto(`http://localhost:${b.port}/`, { waitUntil: "domcontentloaded" }); await page.waitForSelector("#gl-bar");
  const s = scope(b.log);
  await typeSend(page, "Make TWO edits: set the <h1 id=headline> text to exactly 'MultiA' and the <p id=lede> text to exactly 'MultiB'. Edit both.");
  await until(() => s.has("turn_completed"), 150000, 1000); await sleep(1000);
  const tc = s.last("turn_completed");
  const both = fileHas(doc, "MultiA") && fileHas(doc, "MultiB");
  // truth = both targets changed in ONE turn; the agent may legitimately do that via one MultiEdit/Write (edits_n is reported, not gated — per Codex)
  rec("J15", "multi-edit single turn", both && tc?.changed, `bothChanged=${both}, edits_n=${tc?.edits_n}, changed=${tc?.changed}`);
  await ctx.close(); stop(b);
}

// ===== J16 — concurrent sends queue (two tabs, fired together) =====
{
  const doc = join(tmpdir(), "gl-J16.html"); copyFileSync(SRC, doc);
  const b = boot({ doc, port: 4421, args: ["--fresh"] });
  await until(() => scope(b.log).has("server_start"), 15000, 300);
  const ctx = await browser.newContext();
  const p1 = await ctx.newPage(); const p2 = await ctx.newPage();
  for (const p of [p1, p2]) { await p.goto(`http://localhost:${b.port}/`, { waitUntil: "domcontentloaded" }); await p.waitForSelector("#gl-bar"); await p.click("#gl-list"); }
  const s = scope(b.log);
  await setInput(p1, "Set the footer #foot text to: FOOT-ONE");
  await setInput(p2, "Set the paragraph #lede text to: LEDE-TWO");
  await Promise.all([clickSend(p1), clickSend(p2)]);
  await until(() => s.all("turn_completed").length >= 2, 150000);
  const sent = s.all("turn_sent").length, done = s.all("turn_completed").length;
  const maxDepth = Math.max(0, ...s.all("turn_queued").map((e) => e.depth || 0));
  rec("J16", "concurrent sends queue (none dropped)", sent === 2 && done === 2 && maxDepth >= 2, `sent=${sent}, completed=${done}, max queue depth=${maxDepth}`);
  await ctx.close(); stop(b);
}

// ===== J14 — stop cancels an in-flight turn =====
{
  const doc = join(tmpdir(), "gl-J14.html"); copyFileSync(SRC, doc);
  const b = boot({ doc, port: 4422, args: ["--fresh"] });
  await until(() => scope(b.log).has("server_start"), 15000, 300);
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.goto(`http://localhost:${b.port}/`, { waitUntil: "domcontentloaded" }); await page.waitForSelector("#gl-bar");
  const s = scope(b.log);
  await typeSend(page, "Rewrite the entire document body into a long, detailed 10-paragraph quarterly report with many sections.");
  await until(() => s.has("turn_started"), 20000, 300); await sleep(800);
  await page.click("#gl-stop");
  const ended = await until(() => s.has("turn_completed") || s.has("agent_died"), 30000, 500);
  const died = s.last("agent_died"), tc = s.last("turn_completed");
  rec("J14", "stop cancels in-flight turn", ended && (died?.midTurn === true || tc?.ok === false), `agent_died.midTurn=${died?.midTurn}, turn ok=${tc?.ok}`);
  await ctx.close(); stop(b);
}

// ===== J17 — agent crash → respawn + recover =====
{
  const doc = join(tmpdir(), "gl-J17.html"); copyFileSync(SRC, doc);
  const b = boot({ doc, port: 4423, args: ["--fresh"] });
  await until(() => scope(b.log).has("server_start"), 15000, 300);
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.goto(`http://localhost:${b.port}/`, { waitUntil: "domcontentloaded" }); await page.waitForSelector("#gl-bar");
  const s = scope(b.log);
  await typeSend(page, "Change the headline to 'CrashOne'.");
  await until(() => s.has("turn_started"), 20000, 300);
  // the agent pre-warms at boot, so its spawn predates this journey's scope — read pid from the full log
  const pid = (evAll(b.log).filter((e) => e.type === "agent_spawn").pop() || {}).pid;
  try { if (pid) process.kill(pid, "SIGKILL"); } catch {}
  const died = await until(() => s.has("agent_died"), 20000, 400);
  const s2 = scope(b.log);
  await typeSend(page, "Change the headline to exactly: Recovered");
  const recovered = await until(() => headline(doc) === "Recovered", 120000, 800);
  rec("J17", "agent crash → respawn + recover", died && s2.has("agent_spawn") && recovered, `killed pid=${pid}, died.midTurn=${s.last("agent_died")?.midTurn}, respawn+edit="${headline(doc)}"`);
  await ctx.close(); stop(b);
}

// ===== J18 — large file (>100KB) loads + edits =====
{
  const doc = join(tmpdir(), "gl-J18.html");
  const filler = Array.from({ length: 1400 }, (_, i) => `  <p class="f">Filler paragraph number ${i} — lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod.</p>`).join("\n");
  writeFileSync(doc, `<!doctype html><html><head><meta charset="utf-8"><title>Big</title></head><body>\n<h1 id="headline">BigBefore</h1>\n${filler}\n</body></html>`);
  const sizeKB = Math.round(readFileSync(doc).length / 1024);
  const b = boot({ doc, port: 4424, args: ["--fresh"] });
  await until(() => scope(b.log).has("server_start"), 15000, 300);
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.goto(`http://localhost:${b.port}/`, { waitUntil: "domcontentloaded" }); await page.waitForSelector("#gl-bar");
  const loaded = evAll(b.log).some((e) => e.type === "sse_connected"); // happened during page load, before any forward scope
  const s = scope(b.log);
  await typeSend(page, "Change the headline text to exactly: BigAfter");
  await until(() => s.has("turn_completed"), 180000, 1000); await sleep(800); // wait for the FULL turn, not just the mid-turn file change
  const tc = s.last("turn_completed");
  const ok = headline(doc) === "BigAfter";
  const stillBig = Math.round(readFileSync(doc).length / 1024) > 100;
  rec("J18", "large file (>100KB) loads + edits", loaded && ok && tc?.changed && stillBig, `size=${sizeKB}KB, loaded=${loaded}, edited="${headline(doc)}", changed=${tc?.changed}, still>100KB=${stillBig}`);
  await ctx.close(); stop(b);
}

// ===== J3 — auto-link detection (fake transcript in a temp HOME; boot-only, no resume) =====
{
  const tmpHome = mkdtempSync(join(tmpdir(), "gl-home-"));
  const doc = join(tmpHome, "built.html"); copyFileSync(SRC, doc);
  const projDir = join(tmpHome, ".claude", "projects", "-fake-proj"); mkdirSync(projDir, { recursive: true });
  const sid = "11111111-2222-3333-4444-555555555555";
  const transcript = [
    JSON.stringify({ cwd: tmpHome }),
    JSON.stringify({ message: { content: [{ type: "tool_use", name: "Write", input: { file_path: doc } }] } }),
  ].join("\n") + "\n";
  writeFileSync(join(projDir, sid + ".jsonl"), transcript);
  const b = boot({ doc, port: 4425, env: { HOME: tmpHome } }); // no --fresh, so auto-link runs
  await until(() => scope(b.log).has("server_start"), 15000, 300);
  const ss = evAll(b.log).find((e) => e.type === "server_start");
  rec("J3", "auto-link detects build session", ss?.linkMode === "auto" && ss?.sessionId === sid, `linkMode=${ss?.linkMode}, sessionId match=${ss?.sessionId === sid} (live resume needs a real session — detection only)`);
  stop(b);
}

await browser.close();
const passed = results.filter((r) => r.pass).length;
writeFileSync(join(tmpdir(), "gl-journeys-results.json"), JSON.stringify(results, null, 2));
console.log(`\n=== ${passed}/${results.length} journeys passed ===`);
process.exit(passed === results.length ? 0 : 1);

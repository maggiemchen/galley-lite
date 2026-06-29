// Dogfood the "what changed" visual locator against VARIED, non-agent-authored
// HTML — the falsifiable bar (NEXT-SLICE): does the diff-derived locator flash
// the CORRECT element (not just a whole-frame fallback), across structures that
// can break it: repeated text, deep nesting, lists, minified one-liners.
//
// PASS for a page = file changed AS asked AND the locator flashed the RIGHT
// element (.gl-changed on the intended target) AND a count chip appeared.
// PARTIAL = changed but locator missed (frameflash-only / wrong element) — that's
// a real feature gap. FAIL = no change.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const MJS = new URL("../galley-lite.mjs", import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// fixtures: { name, html, targetId, instruction, expectText } — hand-written varied
// structures (NOT authored by an agent through galley), each with one element to change.
const FIX = [
  { name: "plain", targetId: "t", expectText: "DONE-plain",
    instruction: "Change the text of the <h1> to exactly: DONE-plain",
    html: `<!doctype html><meta charset=utf-8><body><h1 id="t">Quarterly Update</h1><p>Some body copy here.</p></body>` },
  { name: "nested", targetId: "t", expectText: "DONE-nested",
    instruction: "Change the text of the paragraph with id 't' to exactly: DONE-nested",
    html: `<!doctype html><meta charset=utf-8><body><main><section><div class="card"><div class="inner"><p id="t">deeply nested original</p></div></div></section></main></body>` },
  { name: "repeated", targetId: "t2", expectText: "Done",
    instruction: "There are three rows that say 'Pending'. Change ONLY the SECOND one (id 't2') to exactly: Done",
    html: `<!doctype html><meta charset=utf-8><body><ul><li id="t1">Pending</li><li id="t2">Pending</li><li id="t3">Pending</li></ul></body>` },
  { name: "table", targetId: "t", expectText: "Shipped",
    instruction: "In the status cell with id 't', change the text to exactly: Shipped",
    html: `<!doctype html><meta charset=utf-8><body><table><tr><td>Feature A</td><td id="t">Backlog</td></tr><tr><td>Feature B</td><td>Done</td></tr></table></body>` },
  { name: "minified", targetId: "t", expectText: "DONE-min",
    instruction: "Change the text of the span with id 't' to exactly: DONE-min",
    html: `<!doctype html><meta charset=utf-8><body><div class=wrap><span>intro</span><span id="t">change me</span><span>outro</span></div></body>` },
];

const browser = await chromium.launch();
const results = [];
let port = 4440;
for (const fx of FIX) {
  port++;
  const doc = join(tmpdir(), `gl-dog-${fx.name}.html`); writeFileSync(doc, fx.html);
  const log = doc + ".events.jsonl"; writeFileSync(log, "");
  const ev = () => { try { return readFileSync(log, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
  const has = (t) => ev().some((e) => e.type === t);
  const srv = spawn("node", [MJS, doc, "--no-open", "--fresh", "--port", String(port)], { env: { ...process.env, GALLEY_EVENTS_LOG: log }, stdio: "ignore" });
  const until = async (p, ms = 300000, step = 1500) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (p()) return true; await sleep(step); } return false; };
  try {
    await until(() => has("server_start"), 15000, 300);
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#gl-bar", { timeout: 15000 });
    await page.evaluate((msg) => { const p = document.getElementById("gl-panel"); if (!p.classList.contains("gl-show")) document.getElementById("gl-list").click(); const i = document.getElementById("gl-input"); i.value = msg; i.dispatchEvent(new Event("input", { bubbles: true })); }, fx.instruction);
    await page.evaluate(() => document.getElementById("gl-send").click());
    await until(() => has("turn_completed"), 300000);
    // The flash is transient — .gl-changed is removed 1.7s after it lands (~1-2s
    // post-reload). Poll fast to CATCH which element flashes (sleeping past it = miss).
    let targetFlashed = false, anyFlashed = 0, chip = false, frameSeen = false, wrongFlashed = false;
    const tEnd = Date.now() + 9000;
    while (Date.now() < tEnd) {
      const s = await page.evaluate((id) => ({
        tf: !!(document.getElementById(id) && document.getElementById(id).classList.contains("gl-changed")),
        any: document.querySelectorAll(".gl-changed").length,
        wrong: Array.prototype.some.call(document.querySelectorAll(".gl-changed"), (e) => e.id !== id && e.children.length === 0),
        chip: !!document.querySelector("#gl-change-chip"),
        frame: !!document.querySelector("#gl-frameflash"),
      }), fx.targetId).catch(() => null);
      if (s) { if (s.tf) targetFlashed = true; if (s.any > anyFlashed) anyFlashed = s.any; if (s.wrong) wrongFlashed = true; if (s.chip) chip = true; if (s.frame) frameSeen = true; }
      if (targetFlashed && chip) break;
      await sleep(120);
    }
    const changed = readFileSync(doc, "utf8").includes(fx.expectText);
    const frameOnly = frameSeen && anyFlashed === 0;
    let verdict = "FAIL";
    if (changed && targetFlashed && chip) verdict = "PASS";
    else if (changed && (anyFlashed > 0 || frameOnly || chip)) verdict = "PARTIAL"; // changed but locator imprecise
    results.push({ name: fx.name, verdict, changed, targetFlashed, anyFlashed, wrongFlashed, chip, frameOnly });
    console.log(`${verdict.padEnd(7)} ${fx.name.padEnd(9)} changed=${changed} targetFlashed=${targetFlashed} wrong=${wrongFlashed} anyFlashed=${anyFlashed} chip=${chip} frameOnly=${frameOnly}`);
    await page.close();
  } catch (e) {
    results.push({ name: fx.name, verdict: "ERROR", error: e.message });
    console.log(`ERROR   ${fx.name} — ${e.message}`);
  } finally { try { process.kill(srv.pid); } catch {} await sleep(500); }
}
await browser.close();
const pass = results.filter((r) => r.verdict === "PASS").length;
const partial = results.filter((r) => r.verdict === "PARTIAL").length;
const nonAgent = results.length; // all fixtures are hand-written (not agent-authored)
writeFileSync(join(tmpdir(), "gl-dogfood-results.json"), JSON.stringify(results, null, 2));
console.log(`\n=== DOGFOOD: ${pass}/${results.length} precise PASS, ${partial} partial (locator imprecise), all ${nonAgent} non-agent-authored ===`);
console.log(`Falsifiable bar = >=8/10 precise on varied pages incl >=3 non-agent. This slice: ${pass}/${results.length} precise.`);
process.exit(0);

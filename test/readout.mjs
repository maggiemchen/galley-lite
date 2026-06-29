// Focused verification of the NEXT-SLICE feature: the "what changed" visual
// locator. One edit → after reload, assert (a) the server change payload is
// well-formed, and (b) the client renders the count chip / flashed element.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const MJS = new URL("../galley-lite.mjs", import.meta.url).pathname;
const SRC = new URL("../examples/sample.html", import.meta.url).pathname;
const doc = join(tmpdir(), "gl-readout.html"); copyFileSync(SRC, doc);
const log = doc + ".events.jsonl"; writeFileSync(log, "");
const PORT = 4430;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = () => { try { return readFileSync(log, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
const last = (t) => [...ev()].reverse().find((e) => e.type === t);
const headline = () => { const m = readFileSync(doc, "utf8").match(/<h1[^>]*>([^<]*)<\/h1>/); return m ? m[1] : null; };
async function until(p, ms = 300000, step = 1000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (p()) return true; await sleep(step); } return false; }

const srv = spawn("node", [MJS, doc, "--no-open", "--fresh", "--port", String(PORT)], { env: { ...process.env, GALLEY_EVENTS_LOG: log }, stdio: "ignore" });
await until(() => ev().some((e) => e.type === "server_start"), 15000, 300);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("#gl-bar");

console.log("sending edit (cold boot under load can take minutes)…");
await page.evaluate(() => { const p = document.getElementById("gl-panel"); if (!p.classList.contains("gl-show")) document.getElementById("gl-list").click(); const i = document.getElementById("gl-input"); i.value = "Change the headline text to exactly: ReadoutTest"; i.dispatchEvent(new Event("input", { bubbles: true })); });
await page.evaluate(() => document.getElementById("gl-send").click());

await until(() => last("turn_completed"), 300000);
await until(() => headline() === "ReadoutTest", 12000, 500);
const changeId = (last("file_reloaded") || {}).changeId;

// (a) server payload well-formed
let payload = null;
try { payload = await page.evaluate(async (id) => (await fetch("/__galley/change?id=" + id)).json(), changeId); } catch {}
const payloadOk = payload && (payload.kind === "edit" || payload.kind === "write") && payload.contentChanged === true;

// (b) client rendered the readout (chip and/or a flashed element) — poll right after reload
const chip = await page.waitForSelector("#gl-change-chip", { state: "attached", timeout: 8000 }).then(() => true).catch(() => false);
const chipText = chip ? await page.evaluate(() => { const c = document.querySelector("#gl-change-chip .gl-cc-l"); return c ? c.textContent.trim() : null; }) : null;
const flashed = await page.evaluate(() => document.querySelectorAll(".gl-changed").length);
const frameflash = await page.$("#gl-frameflash").then((x) => !!x).catch(() => false);

console.log("\n=== READOUT VERIFICATION ===");
console.log("edit applied:        ", headline() === "ReadoutTest");
console.log("changeId:            ", changeId);
console.log("server payload kind: ", payload && payload.kind, "| contentChanged:", payload && payload.contentChanged, "| fragments:", payload && payload.fragments ? payload.fragments.length : "-");
console.log("count chip rendered: ", chip, chipText ? `("${chipText}")` : "");
console.log("flashed elements:    ", flashed, "| frameflash:", frameflash);
const pass = headline() === "ReadoutTest" && payloadOk && (chip || flashed > 0 || frameflash);
console.log("\nREADOUT:", pass ? "PASS — change is captured server-side AND surfaced in the UI" : "FAIL — see above");

await browser.close();
try { process.kill(srv.pid); } catch {}
process.exit(pass ? 0 : 1);

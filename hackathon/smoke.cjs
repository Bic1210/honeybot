"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class Element {
  constructor(tag, document) {
    this.tag = tag;
    this.document = document;
    this.children = [];
    this.textContent = "";
    this.listeners = {};
    this.attributes = {};
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(event, handler) { this.listeners[event] = handler; }
  click() { if (!this.disabled) this.listeners.click?.(); }
  focus() { this.document.activeElement = this; }
  find(id) {
    if (this.id === id) return this;
    for (const child of this.children) {
      const found = child.find?.(id);
      if (found) return found;
    }
  }
}

const demo = path.join(__dirname, "demo");
const read = (file) => fs.readFileSync(path.join(demo, file), "utf8");
const html = read("index.html");
const root = new Element("root");
const document = {
  createElement: (tag) => new Element(tag, document),
  createTextNode: (textContent) => ({ textContent }),
  getElementById: (id) => root.find(id),
};
for (const [, tag, id] of html.matchAll(/<([a-z]+)[^>]* id="([^"]+)"/g)) {
  const element = document.createElement(tag);
  element.id = id;
  root.append(element);
}
let callback;
let exportedBlob;
let revokedUrl;
const context = vm.createContext({
  window: {}, document, Blob,
  URL: {
    createObjectURL: (blob) => { exportedBlob = blob; return "blob:test"; },
    revokeObjectURL: (url) => { revokedUrl = url; },
  },
  setTimeout: (action) => action(),
  setInterval: (step) => { callback = step; return 1; },
  clearInterval: () => { callback = undefined; },
});
for (const [, script] of html.matchAll(/<script[^>]* src="([^"]+)"/g)) {
  vm.runInContext(read(script), context, { filename: script });
}
const get = document.getElementById;
assert.equal(get("progress").value, 0);
assert.equal(get("sessions").children.length, 3);
get("next").click();
callback();
get("next").click();
assert.equal(callback, undefined);
assert.equal(get("progress").value, 2);
get("next").click();
for (let turn = 4; turn <= 6; turn += 1) callback();
assert.match(get("status").textContent, /0 項待查關聯/);
callback();
assert.match(get("status").textContent, /1 項待查關聯/);
while (callback) callback();
assert.equal(get("progress").value, 12);
assert.equal(get("next").disabled, true);
assert.match(get("summary").textContent, /投資群組、兼職招募.*DEMO-LOTUS-2048/);
assert.doesNotMatch(get("summary").textContent, /退款/);
const card = get("links").children[0];
assert.equal(card.children[0].textContent, "DEMO-LOTUS-2048");
assert.deepEqual(card.children.slice(2, 4).map((source) => source.textContent),
  ["查看 S-01-3", "查看 S-02-3"]);
for (const [index, id] of ["S-01-3", "S-02-3"].entries()) {
  get("links").children[0].children[index + 2].click();
  assert.equal(document.activeElement.id, id);
  assert.match(document.activeElement.children[1].textContent, /收款代碼：DEMO-LOTUS-2048/);
}
get("select-S-03").click();
assert.equal(get("select-S-03").attributes["aria-pressed"], "true");
assert.ok(get("clues").children.some(({ children }) =>
  children[1]?.textContent === "https://refund.example.invalid"));
get("reset").click();
assert.equal(get("progress").value, 0);
assert.equal(get("next").disabled, false);
assert.match(get("status").textContent, /0 項待查關聯/);
async function testImport() {
  const input = get("import");
  const scenario = fs.readFileSync(path.join(__dirname, "scenarios.json"), "utf8");
  const importText = (text) => {
    input.files = [{ size: Buffer.byteLength(text), text: async () => text }];
    return input.listeners.change({ currentTarget: input });
  };
  await importText(scenario);
  assert.match(get("mode").textContent, /本機匯入/);
  assert.match(get("status").textContent, /12 \/ 12 則訊息 · 1 項待查關聯/);
  assert.equal(get("next").hidden, true);
  get("export").click();
  const report = JSON.parse(await exportedBlob.text());
  assert.equal(revokedUrl, "blob:test");
  assert.equal(report.source, "local_import");
  assert.equal(report.session_count, 3);
  assert.equal(report.links[0].status, "unverified");
  assert.equal(report.links[0].evidence[1].message_id, "I-02-3");
  get("review-0").value = "follow_up";
  get("review-0").listeners.change();
  assert.match(get("summary").textContent, /保留追查/);
  get("export").click();
  assert.equal(JSON.parse(await exportedBlob.text()).links[0].status, "follow_up");
  await importText("{");
  assert.match(get("intake-status").textContent, /JSON 格式有誤/);
  assert.match(get("status").textContent, /1 項待查關聯/);
  assert.equal(get("review-0").value, "follow_up");
  get("reset").click();
  assert.equal(get("next").hidden, false);
  assert.equal(get("progress").value, 0);
  assert.equal(get("export").disabled, true);
  console.log("PASS: replay, both source jumps, local import, invalid JSON recovery, report evidence, reset.");
}

testImport().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

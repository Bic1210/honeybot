"use strict";

let sessions = window.replayData;
const element = (id) => document.getElementById(id);
const flatten = (items) => items.flatMap((session) =>
  session.messages.map((message) => ({ session, message })));
let turns = flatten(sessions);
let mode = "synthetic_replay";
let importVersion = 0;
const decisions = new Map();
const decisionLabels = { unverified: "待覆核", follow_up: "保留追查", dismissed: "排除" };
const clueNames = {
  account: "收款代碼", url: "網址", email: "電郵", phone: "電話",
  payment_request: "付款語句", suspicious_event: "風險語句", scam_type: "場景分類",
};
let cursor = 0;
let selected = sessions[0].id;
let timer = null;

function node(tag, text, className) {
  const result = document.createElement(tag);
  result.textContent = text;
  if (className) result.className = className;
  return result;
}

function button(text, className, action) {
  const result = node("button", text, className);
  result.type = "button";
  result.addEventListener("click", action);
  return result;
}

function visibleTurns() {
  return turns.slice(0, cursor);
}

function findLinks() {
  const candidates = new Map();
  for (const { session, message } of visibleTurns()) {
    for (const clue of message.clues) {
      if (!["account", "url", "email", "phone"].includes(clue.kind)) continue;
      const key = JSON.stringify([clue.kind, clue.value]);
      if (!candidates.has(key)) {
        candidates.set(key, { clue, sources: new Map(), decision: decisions.get(key) ?? "unverified" });
      }
      const sources = candidates.get(key).sources;
      if (!sources.has(session.id)) sources.set(session.id, { session, message });
    }
  }
  return [...candidates].filter(([, { sources }]) => sources.size > 1)
    .map(([key, candidate]) => ({ key, ...candidate }));
}

function openSource(sessionId, messageId) {
  stopReplay();
  selected = sessionId;
  render();
  element(messageId).focus();
}

function render() {
  const visible = visibleTurns();
  const links = findLinks();
  const session = sessions.find(({ id }) => id === selected);
  const messages = visible.filter((entry) => entry.session.id === selected);
  const imported = mode === "local_import";
  element("mode").textContent = imported ? "離線 · 本機匯入" : "離線 · 合成資料";
  element("session-heading").textContent = imported ? "匯入會話" : "模擬 Agent";
  element("progress").max = turns.length;
  element("progress").value = cursor;
  element("status").textContent = `${cursor} / ${turns.length} 則訊息 · ${links.length} 項待查關聯`;
  element("next").textContent = cursor === turns.length ? "重播完成"
    : timer ? "暫停" : cursor ? "繼續重播" : "開始重播";
  element("next").disabled = cursor === turns.length;
  element("next").hidden = imported;
  element("export").disabled = !cursor;

  element("sessions").replaceChildren(...sessions.map((item) => {
    const select = button("", "session", () => {
      stopReplay();
      selected = item.id;
      render();
      element(`select-${item.id}`).focus();
    });
    select.id = `select-${item.id}`;
    select.setAttribute("aria-pressed", String(item.id === selected));
    const details = node("span", "");
    const count = visible.filter((entry) => entry.session.id === item.id).length;
    details.append(node("strong", `${item.agent} · ${item.title}`),
      node("small", `${item.id} · ${count}/${item.messages.length} 則`));
    select.append(node("span", item.initial, "avatar"), details);
    return select;
  }));

  element("transcript-title").textContent = `會話原文 · ${session.title}`;
  const transcript = messages.map(({ message }) => {
    const row = node("article", "", `message ${message.role}`);
    row.id = message.id;
    row.tabIndex = -1;
    const speaker = message.role === "agent" ? session.agent : imported ? "對方" : "模擬對方";
    row.append(node("small", `${message.id} · ${speaker}`),
      node("p", message.text));
    return row;
  });
  element("transcript").replaceChildren(...(transcript.length ? transcript : [node("p", "這段會話等待重播。")]));

  const cards = links.map(({ key, clue, sources, decision }, index) => {
    const card = node("div", "", "match");
    card.append(node("strong", clue.value), node("small", `${clueNames[clue.kind]} · ${sources.size} 段會話`));
    for (const { session: sourceSession, message } of sources.values()) {
      card.append(button(`查看 ${message.id}`, "source", () => openSource(sourceSession.id, message.id)));
    }
    const label = node("label", "覆核結果", "review");
    const select = node("select", "");
    select.id = `review-${index}`;
    for (const [value, name] of Object.entries(decisionLabels)) {
      const option = node("option", name);
      option.value = value;
      select.append(option);
    }
    select.value = decision;
    select.addEventListener("change", () => {
      stopReplay();
      decisions.set(key, select.value);
      render();
      element(select.id).focus();
    });
    label.append(select);
    card.append(label);
    return card;
  });
  element("links").replaceChildren(...(cards.length ? cards : [node("p", "等待至少兩段會話出現相同線索。")]));
  element("summary").textContent = links.length
    ? links.map(({ clue, sources, decision }) => `${[...sources.values()].map((source) => source.session.title).join("、")}出現相同${clueNames[clue.kind]} ${clue.value}。覆核結果：${decisionLabels[decision]}。`).join(" ")
    : "目前沒有跨會話關聯。";
  const clues = messages.flatMap(({ message }) => message.clues.map((clue) => {
    const item = node("li", "");
    item.append(node("span", clueNames[clue.kind]), document.createTextNode(clue.evidence));
    return item;
  }));
  element("clues").replaceChildren(...(clues.length ? clues : [node("li", "等待線索。")]));
}

function stopReplay() {
  clearInterval(timer);
  timer = null;
}

function step() {
  selected = turns[cursor].session.id;
  cursor += 1;
  if (cursor === turns.length) stopReplay();
  render();
}

element("next").addEventListener("click", () => {
  if (timer) {
    stopReplay();
    render();
  } else if (cursor < turns.length) {
    timer = setInterval(step, 850);
    step();
  }
});
element("reset").addEventListener("click", () => {
  importVersion += 1;
  stopReplay();
  decisions.clear();
  sessions = window.replayData;
  turns = flatten(sessions);
  mode = "synthetic_replay";
  cursor = 0;
  selected = sessions[0].id;
  element("intake-status").textContent = "";
  render();
});
element("import").addEventListener("change", async (event) => {
  const input = event.currentTarget;
  const file = input.files[0];
  if (!file) return;
  input.value = "";
  const version = ++importVersion;
  try {
    if (file.size > 1_000_000) throw new Error("檔案最多 1 MB。");
    const imported = parseCase(await file.text());
    if (version !== importVersion) return;
    stopReplay();
    decisions.clear();
    sessions = imported;
    turns = flatten(sessions);
    mode = "local_import";
    selected = sessions[0].id;
    cursor = turns.length;
    render();
    element("intake-status").textContent = `已分析 ${sessions.length} 段本機會話。`;
  } catch (error) {
    if (version === importVersion) {
      element("intake-status").textContent = error instanceof SyntaxError
        ? "JSON 格式有誤，請參考範例。" : error.message;
    }
  }
});
element("export").addEventListener("click", () => {
  const report = caseReport(mode, visibleTurns(), findLinks());
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  }));
  const link = node("a", "");
  link.href = url;
  link.download = "honeybot-case-report.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render();

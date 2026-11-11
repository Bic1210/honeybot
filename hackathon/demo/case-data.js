"use strict";

function parseCase(raw) {
  if (raw.length > 1_000_000) throw new Error("檔案最多 1 MB。");
  const input = JSON.parse(raw.replace(/^\uFEFF/, ""));
  if (!Array.isArray(input) || !input.length || input.length > 50) {
    throw new Error("請提供包含 1 至 50 段會話的 JSON 陣列。");
  }
  const patterns = {
    account: /收款代碼[：:]\s*(DEMO-[A-Z]+-\d+)/g,
    url: /https?:\/\/[A-Za-z0-9./_?=&%#:+~-]+/g,
    email: /[\w.+-]+@[\w.-]+\.[A-Za-z]+/g,
  };
  return input.map((session, index) => {
    const { title, agent, messages } = session ?? {};
    if (typeof title !== "string" || !title.trim() || title.length > 80 ||
        typeof agent !== "string" || !agent.trim() || agent.length > 80 ||
        !Array.isArray(messages) || !messages.length || messages.length > 100) {
      throw new Error(`第 ${index + 1} 段會話需要 title、agent 和 1 至 100 則 messages。`);
    }
    const id = `I-${String(index + 1).padStart(2, "0")}`;
    return {
      id, title, agent, initial: [...agent.trim()][0],
      messages: messages.map((message, turn) => {
        const { role, text } = message ?? {};
        if (!["peer", "agent"].includes(role) || typeof text !== "string" ||
            !text.trim() || text.length > 4000) {
          throw new Error(`${id} 第 ${turn + 1} 則訊息需要 peer 或 agent 角色與有效文字。`);
        }
        const clues = role === "peer" ? Object.entries(patterns).flatMap(([kind, pattern]) =>
          [...text.matchAll(pattern)].map((match) => ({
            kind, value: match[1] ?? match[0], evidence: match[0],
          }))) : [];
        return { id: `${id}-${turn + 1}`, role, text, clues };
      }),
    };
  });
}

function caseReport(mode, visible, links) {
  return {
    source: mode,
    message_count: visible.length,
    session_count: new Set(visible.map(({ session }) => session.id)).size,
    links: links.map(({ clue, sources, decision }) => ({
      type: clue.kind,
      value: clue.value,
      status: decision,
      evidence: [...sources.values()].map(({ session, message }) => ({
        session_id: session.id,
        title: session.title,
        message_id: message.id,
        text: message.text,
      })),
    })),
  };
}

# Honeybot — Scam Investigation Room

## 可貼入報名表的英文簡介

Scam reports often arrive as disconnected conversations. Honeybot Investigation Room lets reviewers replay three synthetic conversations or import their own JSON transcripts locally. It identifies exact matches across conversations, links each match to its source messages, and exports a JSON report with the supporting evidence. The built-in replay uses Honeybot’s existing rule-based extractor.

## 開發範圍

- 本次新作：離線調查室、三段合成會話、重播介面、JSON 匯入、跨會話比對、原句定位與案件報告匯出。
- 既有元件：Honeybot 規則式線索擷取器。展示中的 Agent 回覆為固定劇本。
- 可重現成果：12 則訊息、3 段會話、1 個跨會話共同收款代碼，及兩則可定位的原始訊息。

## 90 秒錄影腳本

- **0–20 秒**。停在調查室首頁。「Scam reports often arrive as separate conversations. An investigator has to find what those conversations have in common.」
- **20–50 秒**。點「開始重播」，讓三個 Agent 依序顯示訊息。「Here are three simulated conversations: an investment pitch, a job offer, and a fake support refund. Honeybot’s existing extractor identifies clues in those messages.」
- **50–75 秒**。點「查看 S-01-3」和「查看 S-02-3」，各停數秒。「The investment pitch and the job offer share the same synthetic payment reference. Each link opens the exact source message so a reviewer can verify the match.」
- **75–90 秒**。點「匯出案件報告」。「Reviewers can import their own transcripts locally and export a report with the exact messages supporting each lead.」

## 提交檔案

- 原型入口：解壓後的 `hackathon/demo/index.html`
- 原始碼和操作說明：提交 ZIP
- 錄影及 GitHub／報名表欄位：依主辦方入口填入

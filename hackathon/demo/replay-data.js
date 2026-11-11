window.replayData = [
  {
    "id": "S-01",
    "agent": "阿晴",
    "initial": "晴",
    "title": "投資群組",
    "label": "投資招攬",
    "persona": {
      "handle": "qing_notes",
      "profile": "理財新手",
      "placement": "模擬社群 · 投資討論區"
    },
    "messages": [
      {
        "role": "peer",
        "text": "我們是投資研究群，這期方案保證收益。",
        "id": "S-01-1",
        "clues": [
          {
            "kind": "suspicious_event",
            "value": "保證收益",
            "evidence": "保證收益",
            "start": 13,
            "end": 17,
            "source_message_id": "S-01-1",
            "turn": 1,
            "method": "regex_v1",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          },
          {
            "kind": "scam_type",
            "value": "investment",
            "evidence": "投資",
            "start": 3,
            "end": 5,
            "source_message_id": "S-01-1",
            "turn": 1,
            "method": "regex_v1",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          }
        ]
      },
      {
        "role": "agent",
        "text": "可以先給我方案說明嗎？我會先核對來源。",
        "id": "S-01-2",
        "clues": []
      },
      {
        "role": "peer",
        "text": "今天要先匯款保留名額，收款代碼：DEMO-LOTUS-2048。",
        "id": "S-01-3",
        "clues": [
          {
            "kind": "payment_request",
            "value": "今天要先匯款保留名額",
            "evidence": "今天要先匯款保留名額",
            "start": 0,
            "end": 10,
            "source_message_id": "S-01-3",
            "turn": 3,
            "method": "regex_v1",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          },
          {
            "kind": "account",
            "value": "DEMO-LOTUS-2048",
            "evidence": "收款代碼：DEMO-LOTUS-2048",
            "start": 11,
            "end": 31,
            "source_message_id": "S-01-3",
            "turn": 3,
            "method": "demo_account_pattern",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          }
        ]
      },
      {
        "role": "agent",
        "text": "我會保留這則訊息供查核，先暫停匯款。",
        "id": "S-01-4",
        "clues": []
      }
    ]
  },
  {
    "id": "S-02",
    "agent": "小宇",
    "initial": "宇",
    "title": "兼職招募",
    "label": "兼職押金",
    "persona": {
      "handle": "yu_afterclass",
      "profile": "尋找兼職的學生",
      "placement": "模擬社群 · 兼職招募版"
    },
    "messages": [
      {
        "role": "peer",
        "text": "我們在招募兼職，完成商品評價就能領報酬。",
        "id": "S-02-1",
        "clues": [
          {
            "kind": "scam_type",
            "value": "recruitment",
            "evidence": "兼職",
            "start": 5,
            "end": 7,
            "source_message_id": "S-02-1",
            "turn": 1,
            "method": "regex_v1",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          }
        ]
      },
      {
        "role": "agent",
        "text": "有公司名稱與公開職缺頁面可以核對嗎？",
        "id": "S-02-2",
        "clues": []
      },
      {
        "role": "peer",
        "text": "先支付押金才能開通，收款代碼：DEMO-LOTUS-2048。",
        "id": "S-02-3",
        "clues": [
          {
            "kind": "payment_request",
            "value": "先支付押金才能開通",
            "evidence": "先支付押金才能開通",
            "start": 0,
            "end": 9,
            "source_message_id": "S-02-3",
            "turn": 3,
            "method": "regex_v1",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          },
          {
            "kind": "account",
            "value": "DEMO-LOTUS-2048",
            "evidence": "收款代碼：DEMO-LOTUS-2048",
            "start": 10,
            "end": 30,
            "source_message_id": "S-02-3",
            "turn": 3,
            "method": "demo_account_pattern",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          }
        ]
      },
      {
        "role": "agent",
        "text": "我會先查證公司資料，暫停付款。",
        "id": "S-02-4",
        "clues": []
      }
    ]
  },
  {
    "id": "S-03",
    "agent": "可可",
    "initial": "可",
    "title": "假客服退款",
    "label": "退款誘導",
    "persona": {
      "handle": "coco_orders",
      "profile": "網購消費者",
      "placement": "模擬社群 · 購物互助區"
    },
    "messages": [
      {
        "role": "peer",
        "text": "我是商城客服，有一筆訂單需要處理退款。",
        "id": "S-03-1",
        "clues": [
          {
            "kind": "scam_type",
            "value": "support",
            "evidence": "客服",
            "start": 4,
            "end": 6,
            "source_message_id": "S-03-1",
            "turn": 1,
            "method": "regex_v1",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          }
        ]
      },
      {
        "role": "agent",
        "text": "我會從官方客服入口確認訂單。",
        "id": "S-03-2",
        "clues": []
      },
      {
        "role": "peer",
        "text": "請在 https://refund.example.invalid 登入，並提供驗證碼。",
        "id": "S-03-3",
        "clues": [
          {
            "kind": "url",
            "value": "https://refund.example.invalid",
            "evidence": "https://refund.example.invalid",
            "start": 3,
            "end": 33,
            "source_message_id": "S-03-3",
            "turn": 3,
            "method": "regex_v1",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          },
          {
            "kind": "suspicious_event",
            "value": "驗證碼",
            "evidence": "驗證碼",
            "start": 40,
            "end": 43,
            "source_message_id": "S-03-3",
            "turn": 3,
            "method": "regex_v1",
            "verification": "unverified_suspicion_not_confirmed_fraud"
          }
        ]
      },
      {
        "role": "agent",
        "text": "我會記錄這項要求並透過官方管道查證。",
        "id": "S-03-4",
        "clues": []
      }
    ]
  }
];

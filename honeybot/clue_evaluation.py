"""Deterministic evidence spans; no generated labels are claimed as human ground truth."""
import re

PATTERNS = {
    'url': r'https?://[A-Za-z0-9./_?=&%#:+~-]+',
    'email': r'[\w.+-]+@[\w.-]+\.[A-Za-z]+',
    'phone': r'(?<!\d)(?:1[3-9]\d{9}|09\d{8}|0[2-8]-?\d{7,8})(?!\d)',
    'payment_request': r'[^，。！？\n]*(?:转账|轉帳|汇款|匯款|支付|付款|押金)[^，。！？\n]*',
    'suspicious_event': r'保证收益|保證收益|日赚千元|日賺千元|验证码|驗證碼|远程控制|遠端控制|身份证|身分證',
}
TYPES = {'investment': r'投资|投資|理财|理財|收益', 'support': r'客服|退款', 'recruitment': r'招聘|兼职|兼職|入职|入職'}


def structured_clues(text, message_id, turn):
    rows = []
    for kind, pattern in {**PATTERNS, **{'scam_type:'+k: p for k, p in TYPES.items()}}.items():
        for match in re.finditer(pattern, text):
            rows.append({'kind': 'scam_type' if kind.startswith('scam_type:') else kind,
                         'value': kind.split(':')[1] if kind.startswith('scam_type:') else match.group(),
                         'evidence': match.group(), 'start': match.start(), 'end': match.end(),
                         'source_message_id': message_id, 'turn': turn, 'method': 'regex_v1',
                         'verification': 'unverified_suspicion_not_confirmed_fraud'})
            if kind.startswith('scam_type:'):
                break  # One category/message; retain its first supporting span.
    return rows


# Explicit developer-authored specifications, not model-generated predictions,
# not human adjudication, not a representative real-fraud test set.
SPECIFICATIONS = [
    ('投资保证收益，联系 a@example.invalid', [('scam_type','investment'),('suspicious_event','保证收益'),('email','a@example.invalid')]),
    ('客服退款：https://help.example.invalid', [('scam_type','support'),('url','https://help.example.invalid')]),
    ('招聘兼职，请先支付押金300元', [('scam_type','recruitment'),('payment_request','请先支付押金300元')]),
    ('联系方式是0912345678', [('phone','0912345678')]),
    ('请提供验证码', [('suspicious_event','验证码')]),
    ('下載遠端控制軟體', [('suspicious_event','遠端控制')]),
    ('今天想吃牛肉麵', []),
    ('不要轉帳，先查證客服', [('payment_request','不要轉帳'),('scam_type','support')]),
    ('投資保證收益', [('scam_type','investment'),('suspicious_event','保證收益')]),
    ('我的聯絡電話是02-23456789', [('phone','02-23456789')]),
    ('请勿透露身份证或密码', [('suspicious_event','身份证')]),
    ('会议改到下午三点', []),
]


def specification_score():
    from collections import Counter
    tp = fp = fn = 0
    cases = []
    for index, (text, labels) in enumerate(SPECIFICATIONS):
        rows = structured_clues(text, f'spec:{index}', index)
        predicted = Counter((r['kind'], r['value']) for r in rows)
        expected = Counter(labels)
        hit = sum((predicted & expected).values())
        extra, missing = sum((predicted-expected).values()), sum((expected-predicted).values())
        tp += hit; fp += extra; fn += missing
        cases.append({'text':text,'expected_specification':labels,'predictions':rows,'tp':hit,'fp':extra,'fn':missing})
    precision = tp/(tp+fp) if tp+fp else 0
    recall = tp/(tp+fn) if tp+fn else 0
    return {'n':len(cases),'tp':tp,'fp':fp,'fn':fn,'precision':precision,'recall':recall,
            'f1':2*precision*recall/(precision+recall) if precision+recall else 0,
            'reference_type':'developer_authored_specification_not_human_gold',
            'human_verified_precision':None,'human_verified_recall':None,'human_verified_f1':None,'cases':cases}

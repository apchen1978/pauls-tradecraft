# -*- coding: utf-8 -*-
"""Paul's Tradecraft — Executive Capability Brief (v5, 7 pages, enterprise layout).

Design read: executive / restrained / evidence-driven, McKinsey-grade print
discipline. Same content and evidence status as v4 — this pass is PURE LAYOUT:

  * strict 8-pt baseline grid — every text line snaps to a multiple of 8
  * single left text edge per column (no hand-tuned x offsets)
  * consistent card padding + one radius; hairline rules instead of busy borders
  * chapter openers with quiet numerals, not loud gold slabs
  * status lines aligned to a fixed right rail
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

PAGE_W, PAGE_H = A4
MARGIN = 48
CONTENT_W = PAGE_W - MARGIN * 2

# -- palette: keep navy + gold brand, mute everything else -------------------
NAVY = HexColor('#0B1B33')
NAVY_SOFT = HexColor('#122B52')
CARD = HexColor('#122B52')
CARD2 = HexColor('#16325E')
GOLD = HexColor('#C9A227')
BLUE = HexColor('#7EA6E0')        # quieter than #3B82F6
WHITE = HexColor('#FFFFFF')
MUTED = HexColor('#A8B7C9')
BODY = HexColor('#E6EDF4')
DARK = HexColor('#3A4A5E')
LINE = HexColor('#2A4466')
HAIR = HexColor('#3B5878')

# -- baseline grid ------------------------------------------------------------
GRID = 8
def snap(y):
    """Round a y (top-down drawing position) down to the 8-pt grid."""
    return float(int(y) // GRID * GRID)

JH = 'JH'
JHB = 'JHB'
pdfmetrics.registerFont(TTFont(JH, r'C:\Windows\Fonts\msjh.ttc', subfontIndex=0))
pdfmetrics.registerFont(TTFont(JHB, r'C:\Windows\Fonts\msjhbd.ttc', subfontIndex=0))

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'files')
os.makedirs(OUT, exist_ok=True)
PDF = os.path.join(OUT, 'PaulTradecraft-Capability-Brief.pdf')

import re
_TOKEN = re.compile(r'\s+|[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*|[^\s]')

def wrap(text, font, size, max_w):
    lines, cur = [], ''
    pending_space = False
    for tok in _TOKEN.findall(text):
        if tok.isspace():
            pending_space = bool(cur)
            continue
        t = cur + (' ' if pending_space and cur else '') + tok
        if cur and pdfmetrics.stringWidth(t, font, size) > max_w:
            lines.append(cur)
            cur = tok
        else:
            cur = t
        pending_space = False
    if cur:
        lines.append(cur)
    return lines

def para(c, x, y, text, font, size, color, max_w, leading=None):
    leading = leading or size * 1.7
    for ln in wrap(text, font, size, max_w):
        c.setFont(font, size)
        c.setFillColor(color)
        c.drawString(x, snap(y), ln)
        y -= leading
    return y

def footer(c, page):
    c.setStrokeColor(HAIR)
    c.setLineWidth(0.5)
    c.line(MARGIN, 34, PAGE_W - MARGIN, 34)
    c.setFont(JH, 7.5)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, 23, 'Paul\u2019s Tradecraft \u00b7 paulstradecraft.com')
    c.drawRightString(PAGE_W - MARGIN, 23, str(page).zfill(2))

def chapter_opener(c, num, title, sub=None):
    """Quiet executive opener: thin gold rule + navy band, baseline-aligned."""
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 118, PAGE_W, 118, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(MARGIN, PAGE_H - 124, 34, 2.2, stroke=0, fill=1)
    c.setFont(JHB, 11)
    c.setFillColor(GOLD)
    c.drawString(MARGIN, PAGE_H - 78, num)
    c.setFont(JHB, 19)
    c.setFillColor(WHITE)
    c.drawString(MARGIN + 34, PAGE_H - 80, title)
    if sub:
        c.setFont(JH, 9)
        c.setFillColor(MUTED)
        c.drawString(MARGIN + 34, PAGE_H - 102, sub)

def card(c, x, y_top, w, title, body, min_h=70, body_size=9.5, title_size=12,
         title_color=WHITE, body_color=BODY, tag=None, tag_color=BLUE, border=GOLD):
    """Baseline-aligned card: single left text edge, consistent padding."""
    pad = 16
    lines = wrap(body, JH, body_size, w - pad * 2)
    h = max(min_h, pad + 14 + len(lines) * (body_size * 1.62) + 6)
    h = snap(h)
    y_top = snap(y_top)
    y_bottom = y_top - h
    c.setFillColor(CARD)
    c.roundRect(x, y_bottom, w, h, 5, stroke=0, fill=1)
    c.setFillColor(border)
    c.rect(x, y_bottom + 5, 2.6, h - 10, stroke=0, fill=1)
    ty = y_top - pad - 8
    if tag:
        c.setFont(JH, 7.5)
        c.setFillColor(tag_color)
        c.drawString(x + pad, snap(ty), tag)
        ty -= 12
    c.setFont(JHB, title_size)
    c.setFillColor(title_color)
    c.drawString(x + pad, snap(ty), title)
    ty -= 16
    c.setFont(JH, body_size)
    c.setFillColor(body_color)
    for ln in lines:
        c.drawString(x + pad, snap(ty), ln)
        ty -= body_size * 1.62
    return y_bottom

def stat_card(c, x, y_top, w, h, big, label):
    y_top = snap(y_top)
    y_bottom = y_top - snap(h)
    c.setFillColor(CARD)
    c.roundRect(x, y_bottom, w, y_top - y_bottom, 5, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(x, y_bottom, w, 2.6, stroke=0, fill=1)
    c.setFont(JHB, 16)
    c.setFillColor(WHITE)
    c.drawCentredString(x + w / 2, y_bottom + 26, big)
    c.setFont(JH, 7.8)
    c.setFillColor(MUTED)
    c.drawCentredString(x + w / 2, y_bottom + 12, label)

def status_line(c, x, y, text, color=GOLD):
    c.setFont(JHB, 7.5)
    c.setFillColor(color)
    c.drawString(x, snap(y), text)

c = canvas.Canvas(PDF, pagesize=A4)
c.setTitle("Paul's Tradecraft · Executive Capability Brief")
c.setAuthor('Paul Chen')

# ================= Page 1 — Cover / Positioning =================
c.setFillColor(NAVY)
c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(0, PAGE_H - 12, PAGE_W, 4, stroke=0, fill=1)
c.setFont(JH, 8.5)
c.setFillColor(BLUE)
c.drawString(MARGIN, PAGE_H - 60, 'PAUL\u2019S TRADECRAFT \u00b7 EXECUTIVE CAPABILITY BRIEF')
y = PAGE_H - 128
c.setFont(JHB, 22)
c.setFillColor(WHITE)
for ln in wrap('AI-native 商業流程設計 × 決策工具 × Agent Orchestration', JHB, 22, CONTENT_W - 16):
    c.drawString(MARGIN, snap(y), ln)
    y -= 36
y -= 4
c.setFont(JH, 10.5)
c.setFillColor(GOLD)
for ln in wrap('Trade experience turned into verifiable AI systems.', JH, 10.5, CONTENT_W - 16):
    c.drawString(MARGIN, snap(y), ln)
    y -= 18
y -= 6
c.setFont(JH, 10)
c.setFillColor(MUTED)
for ln in wrap('15 年國際貿易總監 × AI 協作 | TOEIC 955 | Human-led, AI-accelerated', JH, 10, CONTENT_W - 16):
    c.drawString(MARGIN, snap(y), ln)
    y -= 18
c.setStrokeColor(HAIR)
c.setLineWidth(0.5)
c.line(MARGIN, 84, PAGE_W - MARGIN, 84)
c.setFont(JH, 8.5)
c.setFillColor(MUTED)
c.drawString(MARGIN, 58, 'paulstradecraft.com')
c.drawRightString(PAGE_W - MARGIN, 58, 'Paul Chen · paulchen1978@gmail.com')
footer(c, 1)
c.showPage()

# ================= Page 2 — Why Paul =================
chapter_opener(c, '01', 'Why Paul · 為什麼是 Paul', '三根柱子：商業經驗 × AI 執行 × 證據紀律。')
y = PAGE_H - 178
pillars = [
    ('01', '商業經驗', '15 年國際貿易總監：報價、談判、供應鏈、貿易系統——不是履歷關鍵字，是做過千百次的工作。TOEIC 955，能直接面對國際客戶與合約。'),
    ('02', 'AI-native 執行', '不是把 AI 當打字機，而是用 AI agents、coding tools、workflows 與 orchestration 把商業邏輯變成可運作、可測試的系統。人類主導，AI 加速。'),
    ('03', '證據紀律', 'Build → test → review → verify。每一項宣稱都有對應的驗證：不知道就寫 UNKNOWN，證據優先於判斷，上線後獨立複查。'),
]
for i, (num, t, b) in enumerate(pillars):
    y = card(c, MARGIN, y, CONTENT_W, t, b, min_h=100, title_size=12.5, tag=num + ' · 支柱', tag_color=GOLD)
    y -= 14
y -= 2
sw = (CONTENT_W - 24) / 3
for i, (big, lab) in enumerate([('955', 'TOEIC (2019)'), ('15年', '國際貿易總監'), ('23/23', 'Pilot 流程驗證項目通過')]):
    stat_card(c, MARGIN + i * (sw + 12), y, sw, 60, big, lab)
y -= 72
c.setFont(JHB, 11.5)
c.setFillColor(GOLD)
c.drawString(MARGIN, snap(y), '不是技術公司的外包，而是貿易內行人的 AI 加速。')
footer(c, 2)
c.showPage()

# ================= Page 3 — How Paul Works =================
chapter_opener(c, '02', 'How Paul Works · 運作方式', 'Human-led, AI-accelerated：定界、分工、交叉驗證，直到可部署。')
y = PAGE_H - 178
steps = ['人類定界', 'AI 分工', '交叉驗證', '人類審核', '部署', '獨立複查']
bw = (CONTENT_W - 5 * 16) / 6
bh = 80
for i, s in enumerate(steps):
    x = MARGIN + i * (bw + 16)
    c.setFillColor(CARD)
    c.roundRect(x, snap(y) - bh, bw, bh, 5, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(x, snap(y) - bh, bw, 2.6, stroke=0, fill=1)
    c.setFont(JHB, 9)
    c.setFillColor(WHITE)
    c.drawCentredString(x + bw / 2, snap(y) - bh / 2 - 6, s)
    c.setFont(JHB, 10)
    c.setFillColor(GOLD)
    c.drawCentredString(x + bw / 2, snap(y) - bh + 12, str(i + 1).zfill(2))
    if i < 5:
        c.setFont(JHB, 12)
        c.setFillColor(GOLD)
        c.drawCentredString(x + bw + 8, snap(y) - bh / 2 - 6, '\u2192')
y -= bh + 30
y = card(c, MARGIN, y, CONTENT_W, '多 Agent 原則：更少不必要的工作', '重點不是「很多 AI」。獨立 Agent 互相挑戰、驗證、收斂，直到只剩下必要的工作——交叉驗證取代重複勞動，證據取代口頭保證。', min_h=96, title_size=12.5, tag='OPERATING PRINCIPLE', tag_color=GOLD)
y -= 20
c.setFont(JHB, 11.5)
c.setFillColor(GOLD)
c.drawString(MARGIN, snap(y), '更多 Agent ≠ 更多工作。Better agents → less unnecessary work.')
footer(c, 3)
c.showPage()

# ================= Page 4 — Selected Evidence (1/2) =================
chapter_opener(c, '03', 'Selected Evidence · 精選實證（1/2）', '優先商業案例：先收斂是否值得推進，再深入交易判斷。')
y = PAGE_H - 178
cases1 = [
    ('Commercial Decision Desk · 商業決策收斂層',
     '商機、交易條件、付款暴露、矛盾與 UNKNOWN，收斂為可稽核的人類決策。8 條硬規則引擎化、38/38 自動檢查；SYNTHETIC proof，無自主商業動作。',
     'PENDING — SYNTHETIC proof; adoption / ROI NOT YET PROVEN'),
    ('AI Trade Deal Desk · 報價/匯率決策工作流',
     '把 RFQ 判斷做成 fixture-driven 的決策支援工作流：AI 建議、人類審批、判斷可稽核。13/13 商業案例 + 5/5 負向測試 PASS；human override 已驗證。',
     'TESTED'),
]
for i, (t, b, st) in enumerate(cases1):
    y = card(c, MARGIN, y, CONTENT_W, t, b, min_h=140, title_size=12.5, tag='CASE %02d' % (i + 1), tag_color=BLUE)
    status_line(c, MARGIN + 16, y - 10, 'STATUS: ' + st, GOLD)
    y -= 30
footer(c, 4)
c.showPage()

# ================= Page 5 — Selected Evidence (2/2) =================
chapter_opener(c, '03', 'Selected Evidence · 精選實證（2/2）', '從商機到交付：可驗證的流程、網站與銷售支援。')
y = PAGE_H - 178
cases2 = [
    ('Curtain Soft-Furnishing Pilot Tracker',
     '窗簾軟裝：商機到報價與跟進的單一追蹤器。23/23 Pilot 流程驗證項目通過；以可檢視的 evidence files 保留流程依據。',
     'VERIFIED'),
    ('MORI Soft-Furnishing Brand Website & Workflow',
     '以品牌網站與可重複流程支援行銷、諮詢與銷售推進。已證明建置與交付能力；市場成效不在宣稱內。',
     'DELIVERED'),
]
for i, (t, b, st) in enumerate(cases2, start=3):
    y = card(c, MARGIN, y, CONTENT_W, t, b, min_h=110, title_size=12, tag='CASE %02d' % i, tag_color=BLUE)
    status_line(c, MARGIN + 16, y - 10, 'STATUS: ' + st, GOLD)
    y -= 26
c.setFillColor(CARD2)
c.roundRect(MARGIN, snap(y) - 78, CONTENT_W, 78, 5, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(MARGIN, snap(y) - 78, 2.6, 78, stroke=0, fill=1)
c.setFont(JHB, 10.5)
c.setFillColor(WHITE)
c.drawString(MARGIN + 18, snap(y) - 26, '驗證語彙')
yy = snap(y) - 44
c.setFont(JH, 9)
c.setFillColor(BODY)
for ln in wrap('VERIFIED = 線上實測通過 · TESTED = 自動驗證通過（可重跑）· PENDING = 合成/待真人確認 · NOT YET PROVEN = 未證明（adoption / ROI 不在宣稱內）。', JH, 9, CONTENT_W - 56):
    c.drawString(MARGIN + 18, snap(yy), ln)
    yy -= 14
y -= 98
c.setFont(JHB, 11.5)
c.setFillColor(GOLD)
c.drawString(MARGIN, snap(y), '每一項宣稱都有對應的驗證；不知道就寫 UNKNOWN。')
footer(c, 5)
c.showPage()

# ================= Page 6 — Paul OS / Multi-Agent Governance =================
chapter_opener(c, '04', 'Paul OS · 多 Agent 治理', '不是「很多 AI」，而是會互相挑戰、驗證、收斂的 AI。')
y = PAGE_H - 178
cw = (CONTENT_W - 24) / 2
agents = [
    ('建構者 · Codex', '負責實作：把想法落地成可運作的系統，build、test、部署。', '第一雙眼睛：做出東西。'),
    ('獨立驗證者 · DSH', '不看建構者的推理，用同一套技能獨立重審，輸出 PASS / PASS_WITH_GAPS / FAIL 與證據。', '第二雙眼睛：獨立檢查。'),
]
for i, (t, b, note) in enumerate(agents):
    x = MARGIN + i * (cw + 24)
    yy = card(c, x, y, cw, t, b, min_h=112, title_size=12)
    c.setFont(JHB, 9)
    c.setFillColor(GOLD)
    c.drawString(x + 16, snap(yy) - 8, note)
y -= 92
y = card(c, MARGIN, y, CONTENT_W, '治理與紀律', '一處治理文件定義能力與分工；共享技能層只有一份 canonical；冷審計由獨立執行器執行；UNKNOWN 不腦補、證據優先於判斷。多 Agent 不是多做一次，而是讓第二雙眼睛獨立檢查。', min_h=96, title_size=12, tag='GOVERNANCE', tag_color=GOLD)
y -= 20
c.setFont(JHB, 11.5)
c.setFillColor(GOLD)
c.drawString(MARGIN, snap(y), '獨立 Agent 挑戰、驗證、收斂，直到只剩下必要的工作。')
footer(c, 6)
c.showPage()

# ================= Page 7 — Engagement / CTA =================
chapter_opener(c, '05', '合作與聯絡', '從一個流程開始。')
y = PAGE_H - 178
c.setFont(JH, 10.5)
c.setFillColor(DARK)
y = para(c, MARGIN, y, '合作不是一次「交付」，而是一段流程：先診斷問題，再做可驗證的原型，驗證通過才談規模化。', JH, 10.5, DARK, CONTENT_W)
y -= 20
areas = ['商業決策系統', 'AI 工作流設計', 'AI 輔助營運', '快速商業原型', '流程診斷']
bw = (CONTENT_W - 4 * 16) / 5
bh = 60
for i, s in enumerate(areas):
    x = MARGIN + i * (bw + 16)
    c.setFillColor(CARD)
    c.roundRect(x, snap(y) - bh, bw, bh, 5, stroke=0, fill=1)
    c.setFillColor(BLUE)
    c.rect(x, snap(y) - bh, bw, 2.6, stroke=0, fill=1)
    c.setFont(JHB, 9.5)
    c.setFillColor(WHITE)
    c.drawCentredString(x + bw / 2, snap(y) - bh / 2 - 5, s)
y -= bh + 32
c.setFillColor(CARD)
c.roundRect(MARGIN, snap(y) - 84, CONTENT_W, 84, 5, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(MARGIN, snap(y) - 84, 2.6, 84, stroke=0, fill=1)
c.setFont(JH, 8.5)
c.setFillColor(BLUE)
c.drawString(MARGIN + 18, snap(y) - 26, 'WEBSITE')
c.setFont(JHB, 12.5)
c.setFillColor(WHITE)
c.drawString(MARGIN + 18, snap(y) - 46, 'paulstradecraft.com')
c.setFont(JH, 8.5)
c.setFillColor(BLUE)
c.drawRightString(PAGE_W - MARGIN - 18, snap(y) - 26, 'EMAIL')
c.setFont(JHB, 12.5)
c.setFillColor(WHITE)
c.drawRightString(PAGE_W - MARGIN - 18, snap(y) - 46, 'paulchen1978@gmail.com')
y -= 124
c.setFont(JHB, 11.5)
c.setFillColor(GOLD)
c.drawString(MARGIN, snap(y), '人類主導，AI 加速。你的問題，從這裡開始。')
footer(c, 7)
c.showPage()

c.save()
print('PDF v5 (7 pages, enterprise layout) saved:', PDF)

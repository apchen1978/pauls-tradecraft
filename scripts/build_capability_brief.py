# -*- coding: utf-8 -*-
"""Paul's Tradecraft — Executive Capability Brief (v6, 7 pages, light-body enterprise).

Same content and evidence status as v4/v5. Two changes this pass:
  1. COLOR: kill the heavy all-dark blocks. Cover + chapter bands stay navy
     (brand), but every body page is now LIGHT: white canvas, navy ink text,
     hairline rules, gold/blue used only as thin accents. Higher contrast,
     less visual weight — the McKinsey/Bain print look.
  2. LAYOUT p4: no oversized cards with dead space; evidence cases become
     compact white cards sized to content with a fixed rhythm.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

PAGE_W, PAGE_H = A4
MARGIN = 50
CONTENT_W = PAGE_W - MARGIN * 2

# -- palette: navy brand on LIGHT canvas --------------------------------------
NAVY = HexColor('#0B1B33')
NAVY_2 = HexColor('#143054')
GOLD = HexColor('#B08D1F')       # slightly deeper gold for white bg contrast
BLUE = HexColor('#2B5B9E')       # accent on light bg (WCAG-friendly)
WHITE = HexColor('#FFFFFF')
INK = HexColor('#1A2534')        # body text on white
MUTED = HexColor('#5A6B80')      # secondary text on white
FAINT = HexColor('#9AA8B9')      # tertiary / footer
LINE = HexColor('#D8DEE6')       # hairline on white
CARD_BG = HexColor('#F6F8FA')    # card fill on white (very light)
BAND = HexColor('#0B1B33')       # chapter band fill (navy)

GRID = 8
def snap(y):
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
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(MARGIN, 32, PAGE_W - MARGIN, 32)
    c.setFont(JH, 7.5)
    c.setFillColor(FAINT)
    c.drawString(MARGIN, 21, 'Paul\u2019s Tradecraft \u00b7 paulstradecraft.com')
    c.drawRightString(PAGE_W - MARGIN, 21, str(page).zfill(2))

def chapter_opener(c, num, title, sub=None):
    """Navy band on top; page below is LIGHT."""
    c.setFillColor(BAND)
    c.rect(0, PAGE_H - 108, PAGE_W, 108, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(MARGIN, PAGE_H - 114, 34, 2, stroke=0, fill=1)
    c.setFont(JHB, 10.5)
    c.setFillColor(GOLD)
    c.drawString(MARGIN, PAGE_H - 70, num)
    c.setFont(JHB, 18)
    c.setFillColor(WHITE)
    c.drawString(MARGIN + 32, PAGE_H - 72, title)
    if sub:
        c.setFont(JH, 8.5)
        c.setFillColor(HexColor('#A8B7C9'))
        c.drawString(MARGIN + 32, PAGE_H - 94, sub)

def light_card(c, x, y_top, w, title, body, min_h=64, body_size=9.5, title_size=12,
               tag=None, tag_color=BLUE, accent=GOLD, body_color=INK, title_color=INK):
    """McKinsey/a16z card: NO fill, NO box — hairline top rule + thin accent bar,
    text floats on whitespace. Height accounts for tag + title + body."""
    pad = 15
    lines = wrap(body, JH, body_size, w - pad * 2)
    tag_h = 13 if tag else 0
    h = max(min_h, pad + tag_h + 12 + len(lines) * (body_size * 1.62) + 6)
    h = snap(h)
    y_top = snap(y_top)
    y_bottom = y_top - h
    # hairline top rule (a16z style separator) + thin accent bar
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(x, y_top, x + w, y_top)
    c.setFillColor(accent)
    c.rect(x, y_top - 1.4, 26, 2.2, stroke=0, fill=1)
    ty = y_top - pad - 4
    if tag:
        c.setFont(JH, 7)
        c.setFillColor(tag_color)
        c.drawString(x + pad, snap(ty), tag)
        ty -= 14
    ty -= 2
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

def dark_card(c, x, y_top, w, title, body, min_h=64, body_size=9.5, title_size=12,
              tag=None, tag_color=GOLD, accent=GOLD, body_color=HexColor('#E6EDF4')):
    """Dark card (used only inside navy band contexts if ever needed)."""
    pad = 15
    lines = wrap(body, JH, body_size, w - pad * 2)
    h = max(min_h, pad + 12 + len(lines) * (body_size * 1.62) + 8)
    h = snap(h)
    y_top = snap(y_top)
    y_bottom = y_top - h
    c.setFillColor(NAVY_2)
    c.roundRect(x, y_bottom, w, h, 4, stroke=0, fill=1)
    c.setFillColor(accent)
    c.rect(x, y_bottom + 4, 2.4, h - 8, stroke=0, fill=1)
    ty = y_top - pad - 6
    if tag:
        c.setFont(JH, 7)
        c.setFillColor(tag_color)
        c.drawString(x + pad, snap(ty), tag)
        ty -= 11
    c.setFont(JHB, title_size)
    c.setFillColor(WHITE)
    c.drawString(x + pad, snap(ty), title)
    ty -= 15
    c.setFont(JH, body_size)
    c.setFillColor(body_color)
    for ln in lines:
        c.drawString(x + pad, snap(ty), ln)
        ty -= body_size * 1.62
    return y_bottom

def stat_card_light(c, x, y_top, w, h, big, label, big_color=NAVY):
    """Stat without a box: big number + thin gold rule + label on whitespace."""
    y_top = snap(y_top)
    y_bottom = y_top - snap(h)
    c.setFillColor(GOLD)
    c.rect(x, y_bottom, w, 1.6, stroke=0, fill=1)
    c.setFont(JHB, 15)
    c.setFillColor(big_color)
    c.drawCentredString(x + w / 2, y_bottom + 22, big)
    c.setFont(JH, 7.6)
    c.setFillColor(MUTED)
    c.drawCentredString(x + w / 2, y_bottom + 9, label)

def status_line(c, x, y, text, color=GOLD):
    c.setFont(JHB, 7.3)
    c.setFillColor(color)
    c.drawString(x, snap(y), text)

c = canvas.Canvas(PDF, pagesize=A4)
c.setTitle("Paul's Tradecraft · Executive Capability Brief")
c.setAuthor('Paul Chen')

# ================= Page 1 — Cover (keeps full navy brand) =================
c.setFillColor(NAVY)
c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(0, PAGE_H - 11, PAGE_W, 3.4, stroke=0, fill=1)
c.setFont(JH, 8.5)
c.setFillColor(BLUE)
c.drawString(MARGIN, PAGE_H - 58, 'PAUL\u2019S TRADECRAFT \u00b7 EXECUTIVE CAPABILITY BRIEF')
y = PAGE_H - 126
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
c.setFillColor(HexColor('#A8B7C9'))
for ln in wrap('15 年國際貿易總監 × AI 協作 | TOEIC 955 | Human-led, AI-accelerated', JH, 10, CONTENT_W - 16):
    c.drawString(MARGIN, snap(y), ln)
    y -= 18
c.setStrokeColor(HexColor('#2A4466'))
c.setLineWidth(0.5)
c.line(MARGIN, 84, PAGE_W - MARGIN, 84)
c.setFont(JH, 8.5)
c.setFillColor(HexColor('#A8B7C9'))
c.drawString(MARGIN, 58, 'paulstradecraft.com')
c.drawRightString(PAGE_W - MARGIN, 58, 'Paul Chen · paulchen1978@gmail.com')
footer(c, 1)
c.showPage()

# ================= Page 2 — Why Paul (LIGHT body) =================
chapter_opener(c, '01', 'Why Paul · 為什麼是 Paul', '三根柱子：商業經驗 × AI 執行 × 證據紀律。')
y = PAGE_H - 168
pillars = [
    ('01', '商業經驗', '15 年國際貿易總監：報價、談判、供應鏈、貿易系統——不是履歷關鍵字，是做過千百次的工作。TOEIC 955，能直接面對國際客戶與合約。'),
    ('02', 'AI-native 執行', '不是把 AI 當打字機，而是用 AI agents、coding tools、workflows 與 orchestration 把商業邏輯變成可運作、可測試的系統。人類主導，AI 加速。'),
    ('03', '證據紀律', 'Build → test → review → verify。每一項宣稱都有對應的驗證：不知道就寫 UNKNOWN，證據優先於判斷，上線後獨立複查。'),
]
for i, (num, t, b) in enumerate(pillars):
    y = light_card(c, MARGIN, y, CONTENT_W, t, b, min_h=92, title_size=12.5, tag=num + ' · 支柱', tag_color=BLUE)
    y -= 13
y -= 2
sw = (CONTENT_W - 24) / 3
for i, (big, lab) in enumerate([('955', 'TOEIC (2019)'), ('15年', '國際貿易總監'), ('23/23', 'Pilot 流程驗證項目通過')]):
    stat_card_light(c, MARGIN + i * (sw + 12), y, sw, 58, big, lab)
y -= 70
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), '不是技術公司的外包，而是貿易內行人的 AI 加速。')
footer(c, 2)
c.showPage()

# ================= Page 3 — How Paul Works (LIGHT) =================
chapter_opener(c, '02', 'How Paul Works · 運作方式', 'Human-led, AI-accelerated：定界、分工、交叉驗證，直到可部署。')
y = PAGE_H - 168
steps = ['人類定界', 'AI 分工', '交叉驗證', '人類審核', '部署', '獨立複查']
bw = (CONTENT_W - 5 * 14) / 6
bh = 74
for i, s in enumerate(steps):
    x = MARGIN + i * (bw + 14)
    c.setFillColor(CARD_BG)
    c.roundRect(x, snap(y) - bh, bw, bh, 4, stroke=0, fill=1)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.roundRect(x, snap(y) - bh, bw, bh, 4, stroke=1, fill=0)
    c.setFillColor(GOLD)
    c.rect(x, snap(y) - bh, bw, 2, stroke=0, fill=1)
    c.setFont(JHB, 8.5)
    c.setFillColor(INK)
    c.drawCentredString(x + bw / 2, snap(y) - bh / 2 - 5, s)
    c.setFont(JHB, 9.5)
    c.setFillColor(NAVY)
    c.drawCentredString(x + bw / 2, snap(y) - bh + 11, str(i + 1).zfill(2))
    if i < 5:
        c.setFont(JHB, 11)
        c.setFillColor(FAINT)
        c.drawCentredString(x + bw + 7, snap(y) - bh / 2 - 5, '\u2192')
y -= bh + 28
y = light_card(c, MARGIN, y, CONTENT_W, '多 Agent 原則：更少不必要的工作', '重點不是「很多 AI」。獨立 Agent 互相挑戰、驗證、收斂，直到只剩下必要的工作——交叉驗證取代重複勞動，證據取代口頭保證。', min_h=88, title_size=12.5, tag='OPERATING PRINCIPLE', tag_color=BLUE)
y -= 18
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), '更多 Agent ≠ 更多工作。Better agents → less unnecessary work.')
footer(c, 3)
c.showPage()

# ================= Page 4 — Selected Evidence (1/2) LIGHT + fixed rhythm =====
chapter_opener(c, '03', 'Selected Evidence · 精選實證（1/2）', '優先商業案例：先收斂是否值得推進，再深入交易判斷。')
y = PAGE_H - 168
cases1 = [
    ('Commercial Decision Desk · 商業決策收斂層',
     '商機、交易條件、付款暴露、矛盾與 UNKNOWN，收斂為可稽核的人類決策。8 條硬規則引擎化、38/38 自動檢查；SYNTHETIC proof，無自主商業動作。',
     'PENDING — SYNTHETIC proof; adoption / ROI NOT YET PROVEN'),
    ('AI Trade Deal Desk · 報價/匯率決策工作流',
     '把 RFQ 判斷做成 fixture-driven 的決策支援工作流：AI 建議、人類審批、判斷可稽核。13/13 商業案例 + 5/5 負向測試 PASS；human override 已驗證。',
     'TESTED'),
]
for i, (t, b, st) in enumerate(cases1):
    # compact cards sized to content; status on its own hairline row
    y = light_card(c, MARGIN, y, CONTENT_W, t, b, min_h=78, title_size=12.5, tag='CASE %02d' % (i + 1), tag_color=BLUE)
    y -= 8
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(MARGIN, snap(y) - 2, MARGIN + 2, snap(y) - 2)  # placeholder kept minimal
    status_line(c, MARGIN + 15, y - 4, 'STATUS: ' + st, GOLD)
    y -= 26
footer(c, 4)
c.showPage()

# ================= Page 5 — Selected Evidence (2/2) LIGHT =================
chapter_opener(c, '03', 'Selected Evidence · 精選實證（2/2）', '從商機到交付：可驗證的流程、網站與銷售支援。')
y = PAGE_H - 168
cases2 = [
    ('Curtain Soft-Furnishing Pilot Tracker',
     '窗簾軟裝：商機到報價與跟進的單一追蹤器。23/23 Pilot 流程驗證項目通過；以可檢視的 evidence files 保留流程依據。',
     'VERIFIED'),
    ('MORI Soft-Furnishing Brand Website & Workflow',
     '以品牌網站與可重複流程支援行銷、諮詢與銷售推進。已證明建置與交付能力；市場成效不在宣稱內。',
     'DELIVERED'),
]
for i, (t, b, st) in enumerate(cases2, start=3):
    y = light_card(c, MARGIN, y, CONTENT_W, t, b, min_h=72, title_size=12, tag='CASE %02d' % i, tag_color=BLUE)
    y -= 8
    status_line(c, MARGIN + 15, y - 4, 'STATUS: ' + st, GOLD)
    y -= 22
# vocabulary band — light card
y = light_card(c, MARGIN, y, CONTENT_W, '驗證語彙', 'VERIFIED = 線上實測通過 · TESTED = 自動驗證通過（可重跑）· PENDING = 合成/待真人確認 · NOT YET PROVEN = 未證明（adoption / ROI 不在宣稱內）。', min_h=60, title_size=11, tag=None, accent=BLUE)
y -= 16
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), '每一項宣稱都有對應的驗證；不知道就寫 UNKNOWN。')
footer(c, 5)
c.showPage()

# ================= Page 6 — Paul OS / Multi-Agent Governance (LIGHT) =========
chapter_opener(c, '04', 'Paul OS · 多 Agent 治理', '不是「很多 AI」，而是會互相挑戰、驗證、收斂的 AI。')
y = PAGE_H - 168
cw = (CONTENT_W - 24) / 2
agents = [
    ('建構者 · Codex', '負責實作：把想法落地成可運作的系統，build、test、部署。', '第一雙眼睛：做出東西。'),
    ('獨立驗證者 · DSH', '不看建構者的推理，用同一套技能獨立重審，輸出 PASS / PASS_WITH_GAPS / FAIL 與證據。', '第二雙眼睛：獨立檢查。'),
]
for i, (t, b, note) in enumerate(agents):
    x = MARGIN + i * (cw + 24)
    yy = light_card(c, x, y, cw, t, b, min_h=104, title_size=12)
    # note inside the card bounds, after body, never below the card
    note_lines = wrap(note, JHB, 8.5, cw - 30)
    ny = yy + 14
    c.setFont(JHB, 8.5)
    c.setFillColor(NAVY)
    for ln in note_lines:
        c.drawString(x + 15, snap(ny), ln)
        ny += 12
y -= 128
y = light_card(c, MARGIN, y, CONTENT_W, '治理與紀律', '一處治理文件定義能力與分工；共享技能層只有一份 canonical；冷審計由獨立執行器執行；UNKNOWN 不腦補、證據優先於判斷。多 Agent 不是多做一次，而是讓第二雙眼睛獨立檢查。', min_h=88, title_size=12, tag='GOVERNANCE', tag_color=BLUE)
y -= 16
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), '獨立 Agent 挑戰、驗證、收斂，直到只剩下必要的工作。')
footer(c, 6)
c.showPage()

# ================= Page 7 — Engagement / CTA (LIGHT) =================
chapter_opener(c, '05', '合作與聯絡', '從一個流程開始。')
y = PAGE_H - 168
c.setFont(JH, 10.5)
c.setFillColor(INK)
y = para(c, MARGIN, y, '合作不是一次「交付」，而是一段流程：先診斷問題，再做可驗證的原型，驗證通過才談規模化。', JH, 10.5, INK, CONTENT_W)
y -= 18
areas = ['商業決策系統', 'AI 工作流設計', 'AI 輔助營運', '快速商業原型', '流程診斷']
bw = (CONTENT_W - 4 * 14) / 5
bh = 56
for i, s in enumerate(areas):
    x = MARGIN + i * (bw + 14)
    c.setFillColor(CARD_BG)
    c.roundRect(x, snap(y) - bh, bw, bh, 4, stroke=0, fill=1)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.roundRect(x, snap(y) - bh, bw, bh, 4, stroke=1, fill=0)
    c.setFillColor(BLUE)
    c.rect(x, snap(y) - bh, bw, 2, stroke=0, fill=1)
    c.setFont(JHB, 9)
    c.setFillColor(INK)
    c.drawCentredString(x + bw / 2, snap(y) - bh / 2 - 4, s)
y -= bh + 30
c.setFillColor(CARD_BG)
c.roundRect(MARGIN, snap(y) - 78, CONTENT_W, 78, 4, stroke=0, fill=1)
c.setStrokeColor(LINE)
c.setLineWidth(0.6)
c.roundRect(MARGIN, snap(y) - 78, CONTENT_W, 78, 4, stroke=1, fill=0)
c.setFillColor(GOLD)
c.rect(MARGIN, snap(y) - 78, 2.4, 78, stroke=0, fill=1)
c.setFont(JH, 8)
c.setFillColor(BLUE)
c.drawString(MARGIN + 16, snap(y) - 24, 'WEBSITE')
c.setFont(JHB, 12)
c.setFillColor(NAVY)
c.drawString(MARGIN + 16, snap(y) - 43, 'paulstradecraft.com')
c.setFont(JH, 8)
c.setFillColor(BLUE)
c.drawRightString(PAGE_W - MARGIN - 16, snap(y) - 24, 'EMAIL')
c.setFont(JHB, 12)
c.setFillColor(NAVY)
c.drawRightString(PAGE_W - MARGIN - 16, snap(y) - 43, 'paulchen1978@gmail.com')
y -= 116
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), '人類主導，AI 加速。你的問題，從這裡開始。')
footer(c, 7)
c.showPage()

c.save()
print('PDF v6 (7 pages, light-body enterprise) saved:', PDF)

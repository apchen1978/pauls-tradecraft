# -*- coding: utf-8 -*-
"""Paul's Tradecraft — Executive Capability Brief (v7, 7 pages, light-body enterprise).

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
PALE_GOLD = HexColor('#F7F1DF')
PALE_BLUE = HexColor('#EEF3F9')
TEAL = HexColor('#287A78')
PALE_TEAL = HexColor('#EAF4F2')
ORANGE = HexColor('#C96E42')
PALE_ORANGE = HexColor('#FAF0EA')

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

def draw_pill(c, x, y, text, fill, ink, font_size=7.2, pad_x=9, pad_y=5):
    c.setFont(JHB, font_size)
    w = pdfmetrics.stringWidth(text, JHB, font_size) + pad_x * 2
    h = font_size + pad_y * 2
    c.setFillColor(fill)
    c.roundRect(x, y - h + 2, w, h, h / 2, stroke=0, fill=1)
    c.setFillColor(ink)
    c.drawString(x + pad_x, y - font_size - pad_y / 2 + 2, text)
    return w, h

def number_tile(c, x, y_top, w, h, number, title, body, accent=GOLD,
                bg=CARD_BG, body_size=8.7, title_size=11):
    """Compact editorial tile with a strong number and readable body."""
    y_bottom = y_top - h
    c.setFillColor(bg)
    c.roundRect(x, y_bottom, w, h, 5, stroke=0, fill=1)
    c.setFillColor(accent)
    c.roundRect(x, y_bottom, 4, h, 2, stroke=0, fill=1)
    c.setFont(JHB, 22)
    c.setFillColor(accent)
    c.drawString(x + 15, y_top - 31, number)
    title_lines = wrap(title, JHB, title_size, w - 30)
    title_y = y_top - 54
    for line in title_lines:
        c.setFont(JHB, title_size)
        c.setFillColor(NAVY)
        c.drawString(x + 15, snap(title_y), line)
        title_y -= title_size * 1.25
    body_y = title_y - 3
    para(c, x + 15, body_y, body, JH, body_size, INK, w - 30,
         leading=body_size * 1.55)

def draw_flow(c, x, y, w, items, colors=None, gap=7, font_size=8.3):
    """Draw a restrained sequence of equally sized labeled stages."""
    colors = colors or [NAVY_2, BLUE, TEAL, GOLD]
    n = len(items)
    item_w = (w - gap * (n - 1)) / n
    for i, text in enumerate(items):
        bx = x + i * (item_w + gap)
        c.setFillColor(colors[i % len(colors)])
        c.roundRect(bx, y - 27, item_w, 27, 4, stroke=0, fill=1)
        c.setFont(JHB, font_size)
        c.setFillColor(WHITE if colors[i % len(colors)] != GOLD else NAVY)
        c.drawCentredString(bx + item_w / 2, y - 18, text)
        if i < n - 1:
            c.setStrokeColor(FAINT)
            c.setLineWidth(0.9)
            c.line(bx + item_w + 1, y - 13.5, bx + item_w + gap - 1, y - 13.5)

c = canvas.Canvas(PDF, pagesize=A4)
c.setTitle("Paul's Tradecraft · Executive Capability Brief")
c.setAuthor('Paul Chen')

# ================= Page 1 — Cover ==========================================
c.setFillColor(NAVY)
c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(0, PAGE_H - 11, PAGE_W, 3.4, stroke=0, fill=1)
c.setFont(JHB, 8.5)
c.setFillColor(GOLD)
c.drawString(MARGIN, PAGE_H - 58, 'PAUL’S TRADECRAFT  /  EXECUTIVE CAPABILITY BRIEF')

# A quiet orbital mark makes the three capability threads feel connected.
cx, cy = PAGE_W - 118, PAGE_H - 246
for radius, color in [(68, HexColor('#284364')), (49, HexColor('#345273')), (29, HexColor('#59708D'))]:
    c.setStrokeColor(color)
    c.setLineWidth(0.8)
    c.circle(cx, cy, radius, stroke=1, fill=0)
c.setFillColor(GOLD)
c.circle(cx + 41, cy + 42, 4, stroke=0, fill=1)
c.setFillColor(TEAL)
c.circle(cx - 49, cy + 6, 4, stroke=0, fill=1)
c.setFillColor(ORANGE)
c.circle(cx + 9, cy - 55, 4, stroke=0, fill=1)

y = PAGE_H - 151
c.setFont(JHB, 25)
c.setFillColor(WHITE)
for ln in wrap('海外商業開發 ×\n商業決策 × AI 工作流', JHB, 25, 390):
    c.drawString(MARGIN, snap(y), ln)
    y -= 38
y -= 9
c.setFont(JHB, 12)
c.setFillColor(GOLD)
for ln in wrap('Global commercial judgment made visible through AI-assisted workflows.', JHB, 12, 385):
    c.drawString(MARGIN, snap(y), ln)
    y -= 20
y -= 7
c.setFont(JH, 10)
c.setFillColor(HexColor('#C2CEDB'))
for ln in wrap('15 年國際貿易總監 × AI 協作  |  TOEIC 955  |  Human-led, AI-accelerated', JH, 10, 400):
    c.drawString(MARGIN, snap(y), ln)
    y -= 17

# Three capability marks provide an energetic but restrained cover spine.
spine_y = 270
spine_items = [
    ('01', '海外開發', GOLD),
    ('02', '商業判斷', TEAL),
    ('03', 'AI 工作流', ORANGE),
]
tile_gap = 12
tile_w = (CONTENT_W - tile_gap * 2) / 3
for idx, (num, label, accent) in enumerate(spine_items):
    x = MARGIN + idx * (tile_w + tile_gap)
    c.setStrokeColor(HexColor('#344C69'))
    c.setLineWidth(0.8)
    c.roundRect(x, spine_y - 72, tile_w, 72, 5, stroke=1, fill=0)
    c.setFillColor(accent)
    c.rect(x + 13, spine_y - 3, 28, 2.5, stroke=0, fill=1)
    c.setFont(JHB, 17)
    c.setFillColor(accent)
    c.drawString(x + 13, spine_y - 31, num)
    c.setFont(JHB, 10)
    c.setFillColor(WHITE)
    c.drawString(x + 13, spine_y - 53, label)

c.setStrokeColor(HexColor('#2A4466'))
c.setLineWidth(0.5)
c.line(MARGIN, 84, PAGE_W - MARGIN, 84)
c.setFont(JH, 8.5)
c.setFillColor(HexColor('#A8B7C9'))
c.drawString(MARGIN, 58, 'paulstradecraft.com')
c.drawRightString(PAGE_W - MARGIN, 58, 'Paul Chen · paulchen1978@gmail.com')
footer(c, 1)
c.showPage()

# ================= Page 2 — Global Business Development ===================
chapter_opener(c, '01', 'Global Business Development · 海外商業開發', '找到公司很容易；判斷哪裡值得投入商業資源更難。')
pillars = [
    ('01', '先看供應商現實', '產品、技術、MOQ、價格帶、交期、品質、付款與開發能力，是市場開發的起點；不是先列一長串公司，再倒過來找理由。', GOLD, PALE_GOLD),
    ('02', '再選值得追的商業路徑', '買方／通路類型、產品切入、外部採購路徑與 Owner 目標必須一起看。相關公司不等於可能買家；大公司不等於現在優先。', TEAL, PALE_TEAL),
    ('03', '把興趣與訂單分開', '樣品、設計或開發需求，可以支持內部檢視；但不是訂單。技術可行性、資源、經濟性、交期、合規與 Owner 授權仍需分開判斷。', BLUE, PALE_BLUE),
]
tile_gap = 12
tile_w = (CONTENT_W - tile_gap * 2) / 3
for i, (num, title, body, accent, bg) in enumerate(pillars):
    number_tile(c, MARGIN + i * (tile_w + tile_gap), PAGE_H - 147, tile_w, 248,
                num, title, body, accent=accent, bg=bg, body_size=8.5, title_size=10.4)

# Credential strip: the facts stay compact, with the commercial point below.
stat_top = PAGE_H - 424
c.setFillColor(CARD_BG)
c.roundRect(MARGIN, stat_top - 67, CONTENT_W, 67, 5, stroke=0, fill=1)
stat_width = CONTENT_W / 3
for i, (big, label, accent) in enumerate([
        ('955', 'TOEIC (2019)', GOLD),
        ('15年', '國際貿易總監', TEAL),
        ('23/23', 'Pilot 流程驗證項目通過', BLUE)]):
    x = MARGIN + i * stat_width
    if i:
        c.setStrokeColor(LINE)
        c.setLineWidth(0.7)
        c.line(x, stat_top - 54, x, stat_top - 12)
    c.setFont(JHB, 18)
    c.setFillColor(accent)
    c.drawCentredString(x + stat_width / 2, stat_top - 31, big)
    c.setFont(JH, 7.8)
    c.setFillColor(MUTED)
    c.drawCentredString(x + stat_width / 2, stat_top - 49, label)

c.setFillColor(NAVY)
c.roundRect(MARGIN, 178, CONTENT_W, 70, 5, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(MARGIN, 178, 4, 70, stroke=0, fill=1)
c.setFont(JHB, 12)
c.setFillColor(WHITE)
c.drawString(MARGIN + 18, 218, '從供應商現實出發，才知道哪一個海外機會值得先花業務時間。')
c.setFont(JH, 8.2)
c.setFillColor(HexColor('#C2CEDB'))
c.drawString(MARGIN + 18, 197, 'Commercial judgment starts before the prospect list.')
footer(c, 2)
c.showPage()

# ================= Page 3 — Owner Special Projects =========================
chapter_opener(c, '02', 'Owner Special Projects · Owner 特案推進', '重要但模糊的問題，不必因為暫時沒有明確部門，就停在原地。')
column_gap = 16
column_w = (CONTENT_W - column_gap) / 2
number_tile(c, MARGIN, PAGE_H - 151, column_w, 257, 'A',
            'Owner 特案：把事情往前推，而不是把它再交回去',
            '當一個問題跨部門、資訊零散、沒有既定 SOP，Owner 需要的不是行政協助，而是有人能理解情境、查資料、整理選項、挑戰假設，並把模糊問題收斂成可行的下一步。',
            accent=GOLD, bg=PALE_GOLD, body_size=9.1, title_size=11.3)
number_tile(c, MARGIN + column_w + column_gap, PAGE_H - 151, column_w, 257, 'B',
            '商業經濟／會計視角：先看懂錢的商業意義',
            '利潤、現金、支出、時間與證據，往往不是同一件事。這個視角能幫 Owner 在作出重大決定前提出更好的問題；記帳、稅務、法律與個案結論仍交由適當專業人士確認。',
            accent=TEAL, bg=PALE_TEAL, body_size=9.1, title_size=11.3)

c.setFont(JHB, 8)
c.setFillColor(BLUE)
c.drawString(MARGIN, 345, 'A PRACTICAL DECISION SEQUENCE')
draw_flow(c, MARGIN, 326, CONTENT_W,
          ['重要問題', '結構與證據', '可比較選項', 'Owner 決定'],
          colors=[NAVY_2, BLUE, TEAL, GOLD], gap=9, font_size=8.4)
c.setFont(JHB, 10.5)
c.setFillColor(NAVY)
c.drawString(MARGIN, 265, '把模糊的事，推到一個可判斷的下一步。')
footer(c, 3)
c.showPage()

# ================= Page 4 — AI-Native Execution ===========================
chapter_opener(c, '03', 'AI-Native Execution · AI 原生執行', 'AI 擴大 Paul 的研究、比較與建構能力；它不是取代商業判斷的主角。')
column_gap = 14
column_w = (CONTENT_W - column_gap) / 2
number_tile(c, MARGIN, PAGE_H - 151, column_w, 215, '01', 'AI 能做什麼',
            '擴大公開研究、整理分散資訊、比較候選、保留反證與 UNKNOWN、檢查矛盾、快速把商業邏輯做成可操作原型。它讓一位有商業判斷的人，能處理更廣的資訊與更快的反覆驗證。',
            accent=BLUE, bg=PALE_BLUE, body_size=8.8, title_size=12)
number_tile(c, MARGIN + column_w + column_gap, PAGE_H - 151, column_w, 215, '02', 'AI 不替誰做決定',
            '供應商能否交付、哪一條市場路徑值得投入、開發是否動用資源、報價與付款能否承諾，仍需要 Owner 的目標、外部證據與明確授權。AI inference 不是買方意圖；開發需求不是訂單。',
            accent=ORANGE, bg=PALE_ORANGE, body_size=8.8, title_size=12)

# The operating discipline gets a distinct, high-contrast anchor.
c.setFillColor(NAVY)
c.roundRect(MARGIN, 292, CONTENT_W, 109, 5, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(MARGIN, 292, 4, 109, stroke=0, fill=1)
draw_pill(c, MARGIN + 17, 377, 'EVIDENCE BEFORE CONSEQUENTIAL ACTION', PALE_GOLD, NAVY, font_size=7)
c.setFont(JHB, 11.2)
c.setFillColor(WHITE)
c.drawString(MARGIN + 17, 345, '運作紀律')
c.setFont(JH, 8.8)
c.setFillColor(HexColor('#D4DEE8'))
para(c, MARGIN + 17, 326,
     '先定義邊界，再分工、驗證、審核與獨立複查。更多 Agent 不等於更多工作；目標是更少不必要的工作，以及更清楚的證據與責任。',
     JH, 8.8, HexColor('#D4DEE8'), CONTENT_W - 36, leading=13.5)

c.setFont(JHB, 13)
c.setFillColor(NAVY)
c.drawString(MARGIN, 244, 'AI assists. Owner judges. Evidence moves the decision.')
c.setFillColor(GOLD)
c.rect(MARGIN, 225, 54, 2, stroke=0, fill=1)
footer(c, 4)
c.showPage()

# ================= Page 5 — Selected Proof ================================
chapter_opener(c, '04', 'Selected Proof · 精選證據', '作品是能力的可檢視證據，不是身份本身。')

def case_panel(x, y_top, w, h, num, title, body, status, accent, bg):
    y_bottom = y_top - h
    c.setFillColor(bg)
    c.roundRect(x, y_bottom, w, h, 5, stroke=0, fill=1)
    c.setFillColor(accent)
    c.roundRect(x, y_bottom, 4, h, 2, stroke=0, fill=1)
    c.setFont(JHB, 20)
    c.setFillColor(accent)
    c.drawString(x + 16, y_top - 29, num)
    title_lines = wrap(title, JHB, 10.8, w - 82)
    title_y = y_top - 24
    for line in title_lines:
        c.setFont(JHB, 10.8)
        c.setFillColor(NAVY)
        c.drawString(x + 62, snap(title_y), line)
        title_y -= 14
    body_y = min(y_top - 61, title_y - 8)
    body_end = para(c, x + 16, body_y, body, JH, 8.3, INK, w - 32, leading=12.3)
    status_y = max(y_bottom + 14, body_end - 7)
    c.setStrokeColor(HexColor('#D5DDE6'))
    c.setLineWidth(0.6)
    c.line(x + 16, status_y + 8, x + w - 16, status_y + 8)
    para(c, x + 16, status_y, 'STATUS  /  ' + status, JH, 6.9,
         MUTED, w - 32, leading=9.5)

case_panel(MARGIN, PAGE_H - 143, CONTENT_W, 174, '01',
           'Global Business Development · 海外商業開發',
           '合成互動示範：同一組候選與證據，會因 Owner 目標不同而改變優先研究路徑；沒有採購路徑證據的高知名度帳戶維持 HOLD。供應商現實、產品切入、UNKNOWN 與內部資源關卡保持可檢視。',
           'synthetic demonstrator; human / market validation not performed', GOLD, PALE_GOLD)

half_gap = 13
half_w = (CONTENT_W - half_gap) / 2
case_panel(MARGIN, PAGE_H - 336, half_w, 201, '02',
           'AI-Native Market Entry · AI 原生市場開發',
           '以合成供應商與真實公開市場證據做 bounded research：六家生態系相關帳戶重新分類後，沒有任何一家被足夠證據支持為可能買家。市場相關性不等於商業取得路徑。',
           'no buyer, response, RFQ, order, or revenue claim', TEAL, PALE_TEAL)
case_panel(MARGIN + half_w + half_gap, PAGE_H - 336, half_w, 201, '03',
           'Commercial Decision Desk · 商業決策收斂層',
           '商機、交易條件、付款暴露、矛盾與 UNKNOWN，收斂為可稽核的人類決策。硬規則引擎化，並保留「系統建議」與「人類決定」的分界。',
           'synthetic proof; adoption / ROI not yet proven', BLUE, PALE_BLUE)

c.setFillColor(NAVY)
c.roundRect(MARGIN, 184, CONTENT_W, 63, 5, stroke=0, fill=1)
c.setFont(JHB, 9.7)
c.setFillColor(GOLD)
c.drawString(MARGIN + 16, 225, '三個值得記住的判斷')
c.setFont(JH, 8)
c.setFillColor(WHITE)
para(c, MARGIN + 16, 207,
     '供應商現實先於買方搜尋 · 市場相關性不等於買方可能性 · UNKNOWN 可以改變下一步。',
     JH, 8, WHITE, CONTENT_W - 32, leading=12)
footer(c, 5)
c.showPage()

# ================= Page 6 — Business Economics ============================
chapter_opener(c, '05', 'Business Economics · 商業經濟判斷', '把「花了錢」與「這件事對公司代表什麼」分開來看。')
half_gap = 14
half_w = (CONTENT_W - half_gap) / 2
number_tile(c, MARGIN, PAGE_H - 151, half_w, 222, '01',
            'Business Spending Insight · 企業支出決策啟發',
            '用清楚的商業語言，幫 SME Owner 在找 CPA 前看懂支出牽涉的現金、費用、證據與時間點，並整理待確認問題；不代替記帳、報稅或 CPA 專業判斷。',
            accent=TEAL, bg=PALE_TEAL, body_size=8.3, title_size=9.3)
number_tile(c, MARGIN + half_w + half_gap, PAGE_H - 151, half_w, 222, '02',
            'Trade Profit Navigator · 利潤槓桿導航',
            '把單筆貿易拆成可見的利潤槓桿、現金暴露、風險與 UNKNOWN，讓 Owner 比較下一步要測試什麼，而不是把計算結果偽裝成自動建議。',
            accent=GOLD, bg=PALE_GOLD, body_size=8.7, title_size=10.1)
draw_pill(c, MARGIN + 14, PAGE_H - 341, 'SYNTHETIC CASES · HUMAN VALIDATION PENDING', PALE_BLUE, BLUE, font_size=6.4)
draw_pill(c, MARGIN + half_w + half_gap + 14, PAGE_H - 341,
          'PUBLIC DEMO · SYNTHETIC USD CASE', PALE_GOLD, NAVY, font_size=6.4)

number_tile(c, MARGIN, PAGE_H - 399, CONTENT_W, 132, '03',
            'MORI 與 Pilot Tracker · 可交付的營運／銷售支援',
            '品牌網站、行銷諮詢、報價與跟進流程，能被整理成清楚、可重複的工作表面。這證明建置與交付能力，不宣稱市場成效。',
            accent=BLUE, bg=PALE_BLUE, body_size=8.9, title_size=11.2)
draw_pill(c, MARGIN + CONTENT_W - 168, PAGE_H - 423,
          'DELIVERED / TESTED SURFACES', PALE_BLUE, BLUE, font_size=6.8)

c.setFillColor(NAVY)
c.roundRect(MARGIN, 180, CONTENT_W, 63, 5, stroke=0, fill=1)
c.setFillColor(TEAL)
c.rect(MARGIN, 180, 4, 63, stroke=0, fill=1)
c.setFont(JHB, 10.5)
c.setFillColor(WHITE)
c.drawString(MARGIN + 17, 218, '會計背景增加的是一層看問題的鏡頭，')
c.setFillColor(GOLD)
c.drawString(MARGIN + 17, 199, '不是取代 CPA 的權限。')
footer(c, 6)
c.showPage()

# ================= Page 7 — Engagement =====================================
chapter_opener(c, '06', '合作與聯絡', '如果你有一個值得被好好看待的商業問題，可以從一段對話開始。')
para(c, MARGIN, PAGE_H - 153,
     '合作不是先買一套工具，而是先判斷：這個問題是否值得投入、現有事實夠不夠、下一步該由誰做什麼。需要時，再把商業判斷轉成可驗證的原型或工作流程。',
     JH, 9.6, INK, CONTENT_W, leading=15)

areas = [
    ('01', '我們有產品與供應能力，但海外商業資源該先投在哪裡？', '從供應商現實、Owner 目標與可支持的商業路徑開始。', GOLD, PALE_GOLD),
    ('02', '這件重要事情跨部門、資訊雜亂，又沒有自然的負責人。', '把問題研究、結構化、挑戰，推向一個可判斷的下一步。', TEAL, PALE_TEAL),
    ('03', '我們想把 AI 用在真實商業工作，不想只做工具實驗。', '先定義人類判斷、外部證據與授權邊界，再決定是否值得做成流程。', BLUE, PALE_BLUE),
]
area_gap = 9
area_w = (CONTENT_W - area_gap * 2) / 3
for i, (num, title, body, accent, bg) in enumerate(areas):
    number_tile(c, MARGIN + i * (area_w + area_gap), PAGE_H - 233,
                area_w, 154, num, title, body, accent=accent, bg=bg,
                body_size=8.0, title_size=9.1)

# Closing panel creates one clear destination and a confident finish.
c.setFillColor(NAVY)
c.roundRect(MARGIN, 211, CONTENT_W, 114, 5, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(MARGIN, 211, 4, 114, stroke=0, fill=1)
c.setFont(JHB, 8)
c.setFillColor(GOLD)
c.drawString(MARGIN + 18, 300, 'START WITH A REAL BUSINESS QUESTION')
c.setFont(JH, 8)
c.setFillColor(HexColor('#C2CEDB'))
c.drawString(MARGIN + 18, 278, 'WEBSITE')
c.drawString(MARGIN + CONTENT_W / 2 + 7, 278, 'EMAIL')
c.setFont(JHB, 12)
c.setFillColor(WHITE)
c.drawString(MARGIN + 18, 257, 'paulstradecraft.com')
c.drawString(MARGIN + CONTENT_W / 2 + 7, 257, 'paulchen1978@gmail.com')
c.setStrokeColor(HexColor('#344C69'))
c.setLineWidth(0.7)
c.line(MARGIN + 18, 244, PAGE_W - MARGIN - 18, 244)
c.setFont(JHB, 9.5)
c.setFillColor(WHITE)
c.drawString(MARGIN + 18, 228, '先把問題攤開；再決定它值不值得推進。')
footer(c, 7)
c.showPage()

c.save()
print('PDF v7 (7 pages, identity-led capability brief) saved:', PDF)

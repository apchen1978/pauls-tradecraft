# -*- coding: utf-8 -*-
"""Paul's Tradecraft — Executive Capability Brief (v8, 7 pages, current positioning).

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
    if len(lines) > 1 and lines[-1] in {'。', '，', '、', '；', '：', '！', '？', '）', '」', '』'}:
        previous = lines[-2]
        moved = previous[-2:]
        lines[-2] = previous[:-2]
        lines[-1] = moved + lines[-1]
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
    if title == '特案：把事情往前推，而不是把它再交回去':
        title_lines = ['特案：把事情往前推，', '而不是把它再交回去']
    else:
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

def evidence_row(c, y_top, number, title, body, accent, bg):
    """Draw a content-sized proof row and fail rather than clipping its copy."""
    x = MARGIN
    w = CONTENT_W
    title_size = 10.1
    body_size = 8.0
    title_lines = wrap(title, JHB, title_size, w - 66)
    body_lines = wrap(body, JH, body_size, w - 58)
    title_leading = 12.2
    body_leading = 10.6
    h = max(68, 15 + len(title_lines) * title_leading + 4 + len(body_lines) * body_leading + 10)
    bottom = y_top - h
    c.setFillColor(bg)
    c.roundRect(x, bottom, w, h, 4, stroke=0, fill=1)
    c.setFillColor(accent)
    c.roundRect(x, bottom, 3.5, h, 2, stroke=0, fill=1)
    c.setFont(JHB, 16)
    c.setFillColor(accent)
    c.drawString(x + 13, y_top - 23, number)
    text_x = x + 52
    y = y_top - 17
    for line in title_lines:
        c.setFont(JHB, title_size)
        c.setFillColor(NAVY)
        c.drawString(text_x, snap(y), line)
        y -= title_leading
    y -= 3
    for line in body_lines:
        c.setFont(JH, body_size)
        c.setFillColor(INK)
        c.drawString(text_x, snap(y), line)
        y -= body_leading
    if y < bottom + 6:
        raise ValueError(f"Evidence row {number} copy exceeds its panel by {bottom + 6 - y:.1f}pt")
    return bottom

def compact_topic_card(c, x, y_top, w, h, number, title_zh, title_en, body, accent, bg):
    """Compact bilingual topic card with explicit content-boundary checking."""
    bottom = y_top - h
    pad = 11
    c.setFillColor(bg)
    c.roundRect(x, bottom, w, h, 4, stroke=0, fill=1)
    c.setFillColor(accent)
    c.roundRect(x, bottom, 3.5, h, 2, stroke=0, fill=1)
    c.setFont(JHB, 8)
    c.setFillColor(accent)
    c.drawString(x + pad, y_top - 16, number)
    title_lines = wrap(title_zh, JHB, 9.2, w - 42)
    title_y = y_top - 16
    for line in title_lines:
        c.setFont(JHB, 9.2)
        c.setFillColor(NAVY)
        c.drawString(x + 34, snap(title_y), line)
        title_y -= 11.0
    en_lines = wrap(title_en, JH, 7.4, w - pad * 2)
    en_y = title_y - 1
    for line in en_lines:
        c.setFont(JH, 7.4)
        c.setFillColor(MUTED)
        c.drawString(x + pad, snap(en_y), line)
        en_y -= 9.0
    body_lines = wrap(body, JH, 8.2, w - pad * 2)
    body_y = en_y - 8
    for line in body_lines:
        c.setFont(JH, 8.2)
        c.setFillColor(INK)
        c.drawString(x + pad, snap(body_y), line)
        body_y -= 10.3
    if body_y < bottom + 5:
        raise ValueError(f"AI Lab topic {number} copy exceeds its panel by {bottom + 5 - body_y:.1f}pt")

def example_card(c, x, y_top, w, h, title, body, english, accent, bg):
    bottom = y_top - h
    pad = 10
    c.setFillColor(bg)
    c.roundRect(x, bottom, w, h, 4, stroke=0, fill=1)
    c.setFillColor(accent)
    c.roundRect(x, bottom, 3.5, h, 2, stroke=0, fill=1)
    c.setFont(JHB, 8.2)
    c.setFillColor(NAVY)
    c.drawString(x + pad, y_top - 15, title)
    body_lines = wrap(body, JH, 8.0, w - pad * 2)
    y = y_top - 28
    for line in body_lines:
        c.setFont(JH, 8.0)
        c.setFillColor(INK)
        c.drawString(x + pad, snap(y), line)
        y -= 9.5
    en_lines = wrap(english, JH, 7.2, w - pad * 2)
    y -= 10
    for line in en_lines:
        c.setFont(JH, 7.2)
        c.setFillColor(MUTED)
        c.drawString(x + pad, snap(y), line)
        y -= 8.6
    if y < bottom + 4:
        raise ValueError(f"Example '{title}' copy exceeds its panel by {bottom + 4 - y:.1f}pt")

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

# A quiet orbital mark keeps the cover balanced without competing with the title.
cx, cy = PAGE_W - 101, 387
for radius, color in [(57, HexColor('#284364')), (41, HexColor('#345273')), (25, HexColor('#59708D'))]:
    c.setStrokeColor(color)
    c.setLineWidth(0.8)
    c.circle(cx, cy, radius, stroke=1, fill=0)
c.setFillColor(GOLD)
c.circle(cx + 41, cy + 42, 4, stroke=0, fill=1)
c.setFillColor(TEAL)
c.circle(cx - 49, cy + 6, 4, stroke=0, fill=1)
c.setFillColor(ORANGE)
c.circle(cx + 9, cy - 55, 4, stroke=0, fill=1)

y = PAGE_H - 148
c.setFillColor(WHITE)
for ln in ['把 15 年國際業務總監的判斷，', '做成人和 AI 一起用的工具。']:
    c.setFont(JHB, 25)
    c.drawString(MARGIN, snap(y), ln)
    y -= 38
y -= 7
c.setFillColor(HexColor('#D9E1E9'))
for ln in wrap('I turn 15 years of international sales judgment into tools that people and AI can run together.', JH, 10.2, 430):
    c.setFont(JH, 10.2)
    c.drawString(MARGIN, snap(y), ln)
    y -= 14
y -= 8
c.setFont(JHB, 11.2)
c.setFillColor(GOLD)
for ln in wrap('Paul × AI 協作作品集 · 判斷在人，執行有節奏。', JHB, 11.2, 430):
    c.drawString(MARGIN, snap(y), ln)
    y -= 17
c.setFont(JH, 8.7)
c.setFillColor(HexColor('#C2CEDB'))
for ln in wrap('Human–AI collaborative work · Judgment stays human; execution has a rhythm.', JH, 8.7, 430):
    c.drawString(MARGIN, snap(y), ln)
    y -= 12
y -= 6
c.setFont(JH, 9.2)
c.setFillColor(HexColor('#C2CEDB'))
for ln in wrap('15 年國際業務總監，含中國大陸通路與團隊管理  |  TOEIC 955', JH, 9.2, 430):
    c.drawString(MARGIN, snap(y), ln)
    y -= 15

# Three capability marks provide an energetic but restrained cover spine.
spine_y = 270
spine_items = [
    ('01', '國際業務判斷', 'International sales judgment', GOLD),
    ('02', '把做法變成工具', 'Turning how-to into tools', TEAL),
    ('03', '用 AI 又不失控', 'AI without losing control', ORANGE),
]
tile_gap = 12
tile_w = (CONTENT_W - tile_gap * 2) / 3
for idx, (num, label, en_label, accent) in enumerate(spine_items):
    x = MARGIN + idx * (tile_w + tile_gap)
    c.setStrokeColor(HexColor('#344C69'))
    c.setLineWidth(0.8)
    c.roundRect(x, spine_y - 82, tile_w, 82, 5, stroke=1, fill=0)
    c.setFillColor(accent)
    c.rect(x + 13, spine_y - 3, 28, 2.5, stroke=0, fill=1)
    c.setFont(JHB, 17)
    c.setFillColor(accent)
    c.drawString(x + 13, spine_y - 31, num)
    c.setFont(JHB, 10)
    c.setFillColor(WHITE)
    c.drawString(x + 13, spine_y - 51, label)
    c.setFont(JH, 6.3)
    c.setFillColor(HexColor('#C2CEDB'))
    for line_index, line in enumerate(wrap(en_label, JH, 6.3, tile_w - 24)):
        c.drawString(x + 13, spine_y - 65 - line_index * 8, line)

c.setStrokeColor(HexColor('#2A4466'))
c.setLineWidth(0.5)
c.line(MARGIN, 84, PAGE_W - MARGIN, 84)
c.setFont(JH, 8.5)
c.setFillColor(HexColor('#A8B7C9'))
c.drawString(MARGIN, 58, 'paulstradecraft.com')
c.drawRightString(PAGE_W - MARGIN, 58, 'Paul Chen · paulchen1978@gmail.com')
footer(c, 1)
c.showPage()

# ================= Page 2 — International Sales Judgment ===================
chapter_opener(c, '01', 'International Sales Judgment · 國際業務判斷', '找到公司很容易；判斷哪裡值得投入商業資源更難。')
pillars = [
    ('01', '先看供應商現實', '產品、技術、MOQ、價格帶、交期、品質、付款與開發能力，是市場開發的起點；不是先列一長串公司，再倒過來找理由。海外商業開發是其中一個面向，不是全部。', GOLD, PALE_GOLD),
    ('02', '再選值得追的商業路徑', '買方／通路類型、產品切入、外部採購路徑與負責人目標必須一起看。相關公司不等於可能買家；大公司不等於現在優先。', TEAL, PALE_TEAL),
    ('03', '把興趣與訂單分開', '樣品、設計或開發需求，可以支持內部檢視；但不是訂單。技術可行性、資源、經濟性、交期、合規與負責人授權仍需分開判斷。', BLUE, PALE_BLUE),
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
        ('15年', '國際業務總監', TEAL),
        ('中國大陸', '通路與團隊管理經驗', BLUE)]):
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

# ================= Page 3 — Special Projects =========================
chapter_opener(c, '02', 'Special Projects · 特案推進', '重要但模糊的問題，不必因為暫時沒有明確部門，就停在原地。')
column_gap = 16
column_w = (CONTENT_W - column_gap) / 2
number_tile(c, MARGIN, PAGE_H - 151, column_w, 257, 'A',
            '特案：把事情往前推，而不是把它再交回去',
            '當一個問題跨部門、資訊零散、沒有既定 SOP，負責人需要的不是行政協助，而是有人能理解情境、查資料、整理選項、挑戰假設，並把模糊問題收斂成可行的下一步。',
            accent=GOLD, bg=PALE_GOLD, body_size=9.1, title_size=11.3)
number_tile(c, MARGIN + column_w + column_gap, PAGE_H - 151, column_w, 257, 'B',
            '商業經濟視角：先看懂錢的商業意義',
            '利潤、現金、支出、時間與證據，往往不是同一件事。這個視角能幫負責人在作出重大決定前提出更好的問題；記帳、稅務、法律與個案結論仍交由適當專業人士確認。',
            accent=TEAL, bg=PALE_TEAL, body_size=9.1, title_size=11.3)

c.setFont(JHB, 8)
c.setFillColor(BLUE)
c.drawString(MARGIN, 345, 'A PRACTICAL DECISION SEQUENCE')
draw_flow(c, MARGIN, 326, CONTENT_W,
          ['重要問題', '結構與證據', '可比較選項', '負責人決定'],
          colors=[NAVY_2, BLUE, TEAL, GOLD], gap=9, font_size=8.4)
c.setFont(JHB, 10.5)
c.setFillColor(NAVY)
c.drawString(MARGIN, 265, '把模糊的事，推到一個可判斷的下一步。')
footer(c, 3)
c.showPage()

# ================= Page 4 — Working Method ===========================
chapter_opener(c, '03', 'Working Method · 工作方法', '先定義邊界，再下判斷；證據走在行動之前。')
column_gap = 14
column_w = (CONTENT_W - column_gap) / 2
number_tile(c, MARGIN, PAGE_H - 151, column_w, 215, '01', '判斷怎麼下',
            '擴大公開研究、整理分散資訊、比較候選、保留反證與未知、檢查矛盾、把商業邏輯做成可操作的原型。目的是讓有商業判斷的人，能處理更廣的資訊、做更快的反覆驗證。',
            accent=BLUE, bg=PALE_BLUE, body_size=8.8, title_size=12)
number_tile(c, MARGIN + column_w + column_gap, PAGE_H - 151, column_w, 215, '02', '推論不能取代決定',
            '供應商能否交付、哪一條市場路徑值得投入、開發是否動用資源、報價與付款能否承諾，仍需要負責人的目標、外部證據與明確授權。推論不是買方意圖；開發需求不是訂單。',
            accent=ORANGE, bg=PALE_ORANGE, body_size=8.8, title_size=12)

# The operating discipline gets a distinct, high-contrast anchor.
c.setFillColor(NAVY)
c.roundRect(MARGIN, 264, CONTENT_W, 166, 5, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(MARGIN, 264, 4, 166, stroke=0, fill=1)
draw_pill(c, MARGIN + 17, 412, 'EVIDENCE BEFORE CONSEQUENTIAL ACTION', PALE_GOLD, NAVY, font_size=7)
c.setFont(JHB, 11.2)
c.setFillColor(WHITE)
c.drawString(MARGIN + 17, 380, '運作紀律')
c.setFont(JH, 8.4)
c.setFillColor(HexColor('#D4DEE8'))
discipline_y = para(c, MARGIN + 17, 360,
     '先定義邊界，再分工、驗證、審核與獨立複查。更多步驟不等於更多工作；目標是更少不必要的工作，以及更清楚的證據與責任。',
     JH, 8.4, HexColor('#D4DEE8'), CONTENT_W - 36, leading=12.2)
c.setFont(JH, 8.4)
discipline_y = para(c, MARGIN + 17, discipline_y - 1,
     'AI 負責快速給方向、整理與草擬；負責人決定目標與邊界，證據決定什麼值得繼續。',
     JH, 8.4, HexColor('#D4DEE8'), CONTENT_W - 36, leading=12.2)
c.setFont(JH, 7.3)
c.setFillColor(HexColor('#A8B7C9'))
english_discipline_y = discipline_y - 10
para(c, MARGIN + 17, english_discipline_y,
     'AI gives fast direction, organises and drafts; the decision-maker sets the objective and the boundary, and evidence decides what moves forward.',
     JH, 7.3, HexColor('#A8B7C9'), CONTENT_W - 36, leading=9.8)
if english_discipline_y - 20 < 270:
    raise ValueError('Page 4 operating discipline copy exceeds its panel')

c.setFont(JHB, 13)
c.setFillColor(NAVY)
c.drawString(MARGIN, 239, 'Evidence moves the decision. A person makes it.')
c.setFillColor(GOLD)
c.rect(MARGIN, 220, 54, 2, stroke=0, fill=1)
footer(c, 4)
c.showPage()

# ================= Page 5 — Selected Proof =================================
chapter_opener(c, '04', '精選證據 · 五件主力作品', 'Selected Proof · Five Main Works')
c.setFont(JH, 8.2)
c.setFillColor(INK)
para(c, MARGIN, PAGE_H - 126,
     '作品是能力的可檢視證據，不是身份本身。五件都可以直接打開試。',
     JH, 8.2, INK, CONTENT_W, leading=11)
c.setFont(JH, 7.6)
c.setFillColor(MUTED)
para(c, MARGIN, PAGE_H - 141,
     'Works are inspectable evidence of capability, not identity. All five can be opened and tried.',
     JH, 7.6, MUTED, CONTENT_W, leading=10)

proof_items = [
    ('01', 'ROOMVERSE 3D · 空間幻境',
     '轉一轉視角，換牆面、地毯、窗簾與掛畫，看看光下的房間。示範／虛構情境；插畫轉 3D 的示意，顏色與質感以樣品和現場光線為準。', GOLD, PALE_GOLD),
    ('02', 'Trade Street · 貿易街',
     '一櫃貨明天要出海。沿著港口走，在接力途中做幾個決定。教學示意，不含具體天數、費用或比例。', TEAL, PALE_TEAL),
    ('03', 'Which Step Holds? · 先走哪一步，才踩得住？',
     '一間示範公司想用 AI。先走哪站，哪些基礎不能跳？示範／虛構情境，回應預先寫好。', BLUE, PALE_BLUE),
    ('04', 'Commercial Decision Desk · 商務決策工作台',
     '承諾前，把淨貢獻、付款與未知放在同一張桌上，由負責人決定。示範／虛構資料。', ORANGE, PALE_ORANGE),
    ('05', 'AI Lab',
     '從個人到企業的 AI 實務十七章，附可操作的小互動（例如「要開幾個 agent？」）。示範／虛構情境。', GOLD, CARD_BG),
]
proof_y = PAGE_H - 164
for number, title, body, accent, bg in proof_items:
    proof_y = evidence_row(c, proof_y, number, title, body, accent, bg) - 6

c.setFillColor(NAVY)
c.roundRect(MARGIN, 151, CONTENT_W, 67, 5, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(MARGIN, 151, 4, 67, stroke=0, fill=1)
c.setFont(JHB, 8.5)
c.setFillColor(WHITE)
para(c, MARGIN + 16, 198,
     '五件作品都標示示範／虛構情境，不代表任何企業的實際成效。',
     JHB, 8.5, WHITE, CONTENT_W - 32, leading=11)
c.setFont(JH, 7.1)
c.setFillColor(HexColor('#C2CEDB'))
para(c, MARGIN + 16, 178,
     "All five works are demonstrations on fictional scenarios; they do not represent any company's results.",
     JH, 7.1, HexColor('#C2CEDB'), CONTENT_W - 32, leading=9)
footer(c, 5)
c.showPage()

# ================= Page 6 — Tools and AI Practice ==========================
chapter_opener(c, '05', '把做法變成工具 · 用 AI 又不失控',
               'Turning how-to into tools · AI without losing control')
c.setFont(JH, 8.1)
c.setFillColor(INK)
c.drawString(MARGIN, PAGE_H - 126, '一句話變成同事能用的工具；人在前面決定，agent 在後面接手。')
c.setFont(JH, 7.3)
c.setFillColor(MUTED)
c.drawString(MARGIN, PAGE_H - 140,
             'One sentence becomes a tool colleagues can use; people decide first, agents take over after.')

topic_gap = 11
topic_w = (CONTENT_W - topic_gap) / 2
topic_items = [
    ('13', '給 agent 開權限：開多少才剛好？',
     'Giving an agent access: how much is just enough?',
     '先唯讀、先由人用；寫入與對外送出要負責人確認，並留下紀錄。', GOLD, PALE_GOLD),
    ('14', '先讓人用熟工具，再讓 agent 上場',
     'People first, agents later',
     '跑順幾個工具、資料乾淨之後，才讓 agent 接手重複的段落。', TEAL, PALE_TEAL),
    ('15', '一句話怎麼變成工具？',
     'From one sentence to a tool',
     '把一句判斷包成表單或小工具，讓同事不必重問一次。', BLUE, PALE_BLUE),
    ('16', '把判斷寫下來，agent 才接得住',
     'Write the judgment down so an agent can use it',
     '為什麼這樣決定、踩過什麼雷，寫成 agent 也照得做的規矩。', ORANGE, PALE_ORANGE),
]
topic_top = PAGE_H - 151
for idx, item in enumerate(topic_items):
    col = idx % 2
    row = idx // 2
    x = MARGIN + col * (topic_w + topic_gap)
    y_top = topic_top - row * 107
    compact_topic_card(c, x, y_top, topic_w, 96, *item)
compact_topic_card(c, MARGIN, topic_top - 214, CONTENT_W, 73,
                   '17', '做好了，有人在用嗎？', 'Built is not the same as used',
                   '工具沒人用就等於沒做；看誰在用、省下什麼，再決定要不要留。', BLUE, CARD_BG)

c.setFont(JHB, 8.3)
c.setFillColor(NAVY)
c.drawString(MARGIN, 350, '人機分工例子')
example_gap = 11
example_w = (CONTENT_W - example_gap) / 2
example_card(c, MARGIN, 338, example_w, 88,
             '先有fu，再有家',
             '先認識一位女生今天的處境，AI 給三個預置初稿，由人取捨與深化；固定內容，不連 AI 服務。',
             'Feeling First: AI offers three prepared directions; a person chooses and deepens.',
             GOLD, PALE_GOLD)
example_card(c, MARGIN + example_w + example_gap, 338, example_w, 88,
             '要開幾個 agent？',
             '調 agent 數量與設限，看成本、品質、風險怎麼變；示意模型，非實測。',
             'How Many Agents?: an illustrative model, not measurements.',
             TEAL, PALE_TEAL)

c.setFillColor(NAVY)
c.roundRect(MARGIN, 153, CONTENT_W, 84, 5, stroke=0, fill=1)
c.setFillColor(GOLD)
c.rect(MARGIN, 153, 4, 84, stroke=0, fill=1)
c.setFont(JHB, 8.2)
c.setFillColor(GOLD)
c.drawString(MARGIN + 14, 220, '商業經濟')
c.setFont(JH, 7.5)
c.setFillColor(WHITE)
para(c, MARGIN + 14, 204,
     '商業經濟（企業支出決策、利潤槓桿）是支撐判斷的視角；記帳、稅務與個案結論仍交由專業人士確認。',
     JH, 7.5, WHITE, CONTENT_W - 28, leading=10.5)
c.setFont(JH, 6.9)
c.setFillColor(HexColor('#C2CEDB'))
para(c, MARGIN + 14, 178,
     'Business economics supports the judgment; accounting, tax and case conclusions stay with professionals.',
     JH, 6.9, HexColor('#C2CEDB'), CONTENT_W - 28, leading=9)
footer(c, 6)
c.showPage()

# ================= Page 7 — Engagement =====================================
chapter_opener(c, '06', '合作與聯絡', '如果你有一個值得被好好看待的商業問題，可以從一段對話開始。')
para(c, MARGIN, PAGE_H - 153,
     '合作不是先買一套工具，而是先看清楚卡在哪。帶一項產品、一份舊型錄、一個卡住的流程，或一件想讓 AI 幫上忙的工作；先判斷值不值得投入、現有證據夠不夠，再決定下一步該由誰做什麼。',
     JH, 9.2, INK, CONTENT_W, leading=14)
c.setFont(JH, 7.5)
c.setFillColor(MUTED)
c.drawString(MARGIN, 622, 'Engagement does not start with buying a tool. Start with one question.')

areas = [
    ('01', '我們有產品與供應能力，但海外商業資源該先投在哪裡？', '從供應商現實、負責人目標與可支持的商業路徑開始。', GOLD, PALE_GOLD),
    ('02', '這件重要事情跨部門、資訊雜亂，又沒有自然的負責人。', '把問題研究、結構化、挑戰，推向一個可判斷的下一步。', TEAL, PALE_TEAL),
    ('03', '我們想把新方法用在真實商業工作，不想只做工具實驗。', '先定義人類判斷、外部證據與授權邊界，再決定是否值得做成流程。', BLUE, PALE_BLUE),
]
area_gap = 9
area_w = (CONTENT_W - area_gap * 2) / 3
for i, (num, title, body, accent, bg) in enumerate(areas):
    number_tile(c, MARGIN + i * (area_w + area_gap), PAGE_H - 260,
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
print('PDF v8 (7 pages, current capability positioning) saved:', PDF)

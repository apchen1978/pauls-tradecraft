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
for ln in wrap('海外商業開發 × 商業決策 × AI 工作流', JHB, 22, CONTENT_W - 16):
    c.drawString(MARGIN, snap(y), ln)
    y -= 36
y -= 4
c.setFont(JH, 10.5)
c.setFillColor(GOLD)
for ln in wrap('Global commercial judgment made visible through AI-assisted workflows.', JH, 10.5, CONTENT_W - 16):
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

# ================= Page 2 — Primary human capability (LIGHT body) ==========
chapter_opener(c, '01', 'Global Business Development · 海外商業開發', '找到公司很容易；判斷哪裡值得投入商業資源更難。')
y = PAGE_H - 168
pillars = [
    ('01', '先看供應商現實', '產品、技術、MOQ、價格帶、交期、品質、付款與開發能力，是市場開發的起點；不是先列一長串公司，再倒過來找理由。'),
    ('02', '再選值得追的商業路徑', '買方／通路類型、產品切入、外部採購路徑與 Owner 目標必須一起看。相關公司不等於可能買家；大公司不等於現在優先。'),
    ('03', '把興趣與訂單分開', '樣品、設計或開發需求，可以支持內部檢視；但不是訂單。技術可行性、資源、經濟性、交期、合規與 Owner 授權仍需分開判斷。'),
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
c.drawString(MARGIN, snap(y), '從供應商現實出發，才知道哪一個海外機會值得先花業務時間。')
footer(c, 2)
c.showPage()

# ================= Page 3 — Owner projects / economics (LIGHT) =============
chapter_opener(c, '02', 'Owner Special Projects · Owner 特案推進', '重要但模糊的問題，不必因為暫時沒有明確部門，就停在原地。')
y = PAGE_H - 168
y = light_card(c, MARGIN, y, CONTENT_W, 'Owner 特案：把事情往前推，而不是把它再交回去', '當一個問題跨部門、資訊零散、沒有既定 SOP，Owner 需要的不是行政協助，而是有人能理解情境、查資料、整理選項、挑戰假設，並把模糊問題收斂成可行的下一步。', min_h=108, title_size=13, tag='IMPORTANT PROBLEM · UNCLEAR OWNERSHIP', tag_color=BLUE)
y -= 20
y = light_card(c, MARGIN, y, CONTENT_W, '商業經濟／會計視角：先看懂錢的商業意義', '利潤、現金、支出、時間與證據，往往不是同一件事。這個視角能幫 Owner 在作出重大決定前提出更好的問題；記帳、稅務、法律與個案結論仍交由適當專業人士確認。', min_h=108, title_size=13, tag='OWNER DECISION SUPPORT · NOT PROFESSIONAL ADVICE', tag_color=BLUE)
y -= 26
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), '重要問題 → 結構與證據 → 可比較選項 → Owner 決定下一步。')
footer(c, 3)
c.showPage()

# ================= Page 4 — AI leverage (LIGHT) =============================
chapter_opener(c, '03', 'AI-Native Execution · AI 原生執行', 'AI 擴大 Paul 的研究、比較與建構能力；它不是取代商業判斷的主角。')
y = PAGE_H - 168
y = light_card(c, MARGIN, y, CONTENT_W, 'AI 能做什麼', '擴大公開研究、整理分散資訊、比較候選、保留反證與 UNKNOWN、檢查矛盾、快速把商業邏輯做成可操作原型。它讓一位有商業判斷的人，能處理更廣的資訊與更快的反覆驗證。', min_h=102, title_size=13, tag='EXECUTION LEVERAGE', tag_color=BLUE)
y -= 20
y = light_card(c, MARGIN, y, CONTENT_W, 'AI 不替誰做決定', '供應商能否交付、哪一條市場路徑值得投入、開發是否動用資源、報價與付款能否承諾，仍需要 Owner 的目標、外部證據與明確授權。AI inference 不是買方意圖；開發需求不是訂單。', min_h=102, title_size=13, tag='HUMAN JUDGMENT REMAINS CONSEQUENTIAL', tag_color=BLUE)
y -= 20
y = light_card(c, MARGIN, y, CONTENT_W, '運作紀律', '先定義邊界，再分工、驗證、審核與獨立複查。更多 Agent 不等於更多工作；目標是更少不必要的工作，以及更清楚的證據與責任。', min_h=86, title_size=13, tag='EVIDENCE BEFORE CONSEQUENTIAL ACTION', tag_color=BLUE)
y -= 24
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), 'AI assists. Owner judges. Evidence moves the decision.')
footer(c, 4)
c.showPage()

# ================= Page 5 — Selected proof (LIGHT) =========================
chapter_opener(c, '04', 'Selected Proof · 精選證據', '作品是能力的可檢視證據，不是身份本身。')
y = PAGE_H - 168
cases2 = [
    ('Global Business Development · 海外商業開發',
     '合成互動示範：同一組候選與證據，會因 Owner 目標不同而改變優先研究路徑；沒有採購路徑證據的高知名度帳戶維持 HOLD。供應商現實、產品切入、UNKNOWN 與內部資源關卡保持可檢視。',
     'METHOD VISIBILITY — synthetic demonstrator; HUMAN / MARKET VALIDATION NOT PERFORMED'),
    ('AI-Native Market Entry · AI 原生市場開發',
     '以合成供應商與真實公開市場證據做 bounded research：六家生態系相關帳戶重新分類後，沒有任何一家被足夠證據支持為可能買家。市場相關性不等於商業取得路徑。',
     'METHOD CASE — no buyer, response, RFQ, order, or revenue claim'),
    ('Commercial Decision Desk · 商業決策收斂層',
     '商機、交易條件、付款暴露、矛盾與 UNKNOWN，收斂為可稽核的人類決策。硬規則引擎化，並保留「系統建議」與「人類決定」的分界。',
     'SYNTHETIC proof; adoption / ROI NOT YET PROVEN'),
]
for i, (t, b, st) in enumerate(cases2, start=1):
    y = light_card(c, MARGIN, y, CONTENT_W, t, b, min_h=72, title_size=12, tag='CASE %02d' % i, tag_color=BLUE)
    y -= 8
    status_line(c, MARGIN + 15, y - 4, 'STATUS: ' + st, GOLD)
    y -= 22
# vocabulary band — light card
y = light_card(c, MARGIN, y, CONTENT_W, '三個值得記住的判斷', '供應商現實先於買方搜尋 · 市場相關性不等於買方可能性 · UNKNOWN 可以改變下一步。', min_h=60, title_size=11, tag=None, accent=BLUE)
y -= 16
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), '每一項宣稱都要有證據；不知道就維持 UNKNOWN。')
footer(c, 5)
c.showPage()

# ================= Page 6 — Economics / supporting proof (LIGHT) ============
chapter_opener(c, '05', 'Business Economics · 商業經濟判斷', '把「花了錢」與「這件事對公司代表什麼」分開來看。')
y = PAGE_H - 168
y = light_card(c, MARGIN, y, CONTENT_W, 'Business Spending Insight · 企業支出決策啟發', '以 plain business language 幫 SME Owner 在找 CPA 前，先理解一筆支出可能牽涉的現金、費用、證據、時間點與應確認的問題。它不代替記帳、報稅或專業判斷。', min_h=104, title_size=13, tag='SYNTHETIC CASES · HUMAN VALIDATION PENDING', tag_color=BLUE)
y -= 18
y = light_card(c, MARGIN, y, CONTENT_W, 'Trade Profit Navigator · 利潤槓桿導航', '把單筆貿易拆成可見的利潤槓桿、現金暴露、風險與 UNKNOWN，讓 Owner 比較下一步要測試什麼，而不是把計算結果偽裝成自動建議。', min_h=94, title_size=13, tag='PUBLIC INTERACTIVE DEMO · SYNTHETIC USD CASE', tag_color=BLUE)
y -= 18
y = light_card(c, MARGIN, y, CONTENT_W, 'MORI 與 Pilot Tracker · 可交付的營運／銷售支援', '品牌網站、行銷諮詢、報價與跟進流程，能被整理成清楚、可重複的工作表面。這證明建置與交付能力，不宣稱市場成效。', min_h=88, title_size=13, tag='DELIVERED / TESTED SURFACES', tag_color=BLUE)
y -= 22
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), '會計背景增加的是一層看問題的鏡頭，不是取代 CPA 的權限。')
footer(c, 6)
c.showPage()

# ================= Page 7 — Engagement / CTA (LIGHT) =================
chapter_opener(c, '06', '合作與聯絡', '如果你有一個值得被好好看待的商業問題，可以從一段對話開始。')
y = PAGE_H - 168
c.setFont(JH, 10.5)
c.setFillColor(INK)
y = para(c, MARGIN, y, '合作不是先買一套工具，而是先判斷：這個問題是否值得投入、現有事實夠不夠、下一步該由誰做什麼。需要時，再把商業判斷轉成可驗證的原型或工作流程。', JH, 10.5, INK, CONTENT_W)
y -= 18
areas = [
    ('我們有產品與供應能力，但海外商業資源該先投在哪裡？', '從供應商現實、Owner 目標與可支持的商業路徑開始。'),
    ('這件重要事情跨部門、資訊雜亂，又沒有自然的負責人。', '把問題研究、結構化、挑戰，推向一個可判斷的下一步。'),
    ('我們想把 AI 用在真實商業工作，不想只做工具實驗。', '先定義人類判斷、外部證據與授權邊界，再決定是否值得做成流程。'),
]
for i, (t, b) in enumerate(areas, start=1):
    y = light_card(c, MARGIN, y, CONTENT_W, t, b, min_h=70, title_size=11.5, tag='CONVERSATION %02d' % i, tag_color=BLUE)
    y -= 12
y -= 6
c.setFillColor(CARD_BG)
c.roundRect(MARGIN, snap(y) - 70, CONTENT_W, 70, 4, stroke=0, fill=1)
c.setStrokeColor(LINE)
c.setLineWidth(0.6)
c.roundRect(MARGIN, snap(y) - 70, CONTENT_W, 70, 4, stroke=1, fill=0)
c.setFillColor(GOLD)
c.rect(MARGIN, snap(y) - 70, 2.4, 70, stroke=0, fill=1)
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
y -= 104
c.setFont(JHB, 11)
c.setFillColor(NAVY)
c.drawString(MARGIN, snap(y), '先把問題攤開；再決定它值不值得推進。')
footer(c, 7)
c.showPage()

c.save()
print('PDF v7 (7 pages, identity-led capability brief) saved:', PDF)

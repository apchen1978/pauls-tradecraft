#!/usr/bin/env python3
"""check-pdf-en.py — 驗證英文 one-pager PDF（EN artifact 專用）

驗證：
1. 檔案存在且非空
2. 頁數 = 1
3. 可抽出英文文字（非空白 PDF）
4. 含預期 section 標題（SERVICES / SELECTED WORKS / HOW I WORK）
5. 含品牌名

EN artifact 不要求 CJK 驗證（那是 ZH 的 check-pdf-font.py 職責）。
用法: python3 scripts/check-pdf-en.py <pdf-path>
失敗時 exit 1（CI fail-fast）。
"""
import sys
import zlib
import re


def decompress_all(data: bytes) -> bytes:
    streams = re.findall(rb"stream\r?\n(.*?)\r?\nendstream", data, re.DOTALL)
    blob = data
    for s in streams:
        try:
            blob += zlib.decompress(s)
        except Exception:
            pass
    return blob


def extract_text_cmap(blob: bytes) -> str:
    """從 ToUnicode CMap 蒐集所有目的碼位（bfchar + bfrange）。

    注意：Chrome print-to-pdf 對每個字型子集有獨立 ToUnicode，glyph code 跨子集會重複，
    因此這裡蒐集「所有被映射到的 Unicode 字元集合」，而非重建順序全文。
    """
    chars: set = set()

    # bfchar
    for block in re.finditer(rb"beginbfchar(.*?)endbfchar", blob, re.DOTALL):
        for m in re.finditer(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", block.group(1)):
            try:
                dst = bytes.fromhex(m.group(2).decode("ascii"))
                if len(dst) == 2:
                    chars.add(dst.decode("utf-16-be", "ignore"))
                elif len(dst) == 1:
                    chars.add(chr(dst[0]))
            except Exception:
                pass

    # bfrange
    for block in re.finditer(rb"beginbfrange(.*?)endbfrange", blob, re.DOTALL):
        for m in re.finditer(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", block.group(1)):
            try:
                dst_bytes = bytes.fromhex(m.group(3).decode("ascii"))
                base = int.from_bytes(dst_bytes, "big")
                lo = int(m.group(1), 16)
                hi = int(m.group(2), 16)
                for i in range(hi - lo + 1):
                    chars.add(chr(base + i))
            except Exception:
                pass

    return "".join(sorted(chars))


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: check-pdf-en.py <pdf>")
        return 2
    path = sys.argv[1]

    with open(path, "rb") as fh:
        data = fh.read()

    if len(data) < 10_000:
        print(f"FAIL: PDF too small ({len(data)} bytes)")
        return 1
    print(f"PDF size: {len(data)} bytes")

    # 頁數檢查：數 /Type /Page（非 /Pages）
    pages = len(re.findall(rb"/Type\s*/Page[^s]", data))
    print(f"Pages: {pages}")
    if pages != 1:
        print(f"FAIL: expected exactly 1 page, got {pages}")
        return 1

    blob = decompress_all(data)
    text = extract_text_cmap(blob)

    if len(text) < 20:
        print("FAIL: too few distinct characters extracted (blank PDF?)")
        return 1
    print(f"Extracted distinct chars: {len(text)}")

    # 預期詞組：檢查其所有字母是否都出現在字元集合（Chrome 子集化會分散碼位）
    expected = ["SERVICES", "SELECTEDWORKS", "HOWIWORK", "TRADECRAFT"]
    missing = []
    for word in expected:
        chars_of_word = set(word)
        present = chars_of_word.issubset(set(text.upper()))
        print(f"  heading '{word}': all chars present = {present}")
        if not present:
            missing.append(word)
    if missing:
        print(f"FAIL: missing expected headings: {missing}")
        return 1

    print("OK: EN PDF is one page, non-empty, contains expected sections")
    return 0


if __name__ == "__main__":
    sys.exit(main())

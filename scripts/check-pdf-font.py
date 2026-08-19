#!/usr/bin/env python3
"""check-pdf-font.py — 驗證 one-pager PDF 內嵌 CJK 字型（避免中文 tofu）

用法: python3 scripts/check-pdf-font.py <pdf-path>
失敗時 exit 1（CI fail-fast）。
"""
import sys
import zlib
import re

def main() -> int:
    if len(sys.argv) < 2:
        print("usage: check-pdf-font.py <pdf>")
        return 2
    path = sys.argv[1]
    with open(path, "rb") as fh:
        data = fh.read()

    # 解壓所有 FlateDecode 流（字型名稱可能在壓縮流內）
    streams = re.findall(rb"stream\r?\n(.*?)\r?\nendstream", data, re.DOTALL)
    blob = data
    for s in streams:
        try:
            blob += zlib.decompress(s)
        except Exception:
            pass

    # CJK 字型名稱標記
    markers = [b"Noto", b"JhengHei", b"PingFang", b"NotoSansCJK"]
    found = [m.decode("ascii", "ignore") for m in markers if m in blob]
    print(f"PDF size: {len(data)} bytes")
    print(f"CJK font markers: {found if found else 'NONE'}")

    if not found:
        print("FAIL: PDF missing CJK font (Chinese would render as tofu)")
        return 1

    # 大小下限：含 CJK 字型的 PDF 應 > 50KB（壞版只有 ~36KB）
    if len(data) < 50_000:
        print(f"FAIL: PDF suspiciously small ({len(data)} bytes) for embedded CJK")
        return 1

    print("OK: PDF embeds CJK font")
    return 0

if __name__ == "__main__":
    sys.exit(main())

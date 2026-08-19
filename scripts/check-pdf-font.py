#!/usr/bin/env python3
"""check-pdf-font.py — 驗證 one-pager PDF 確實渲染中文字元（非 tofu）

三層驗證（由弱到強）：
1. 字型名稱標記：PDF 宣告內嵌 Noto/JhengHei/PingFang 等 CJK 字型
2. 大小下限：含 CJK 字型的 PDF 應 > 50KB（壞版只有 ~36KB）
3. ToUnicode CMap：解析 PDF 內嵌的 Unicode 映射表，
   確認內容實際包含 CJK Unified Ideographs (U+4E00–U+9FFF) 的碼位。
   這是「字元實際存在並映射到字形」的鐵證——光有字型名稱但沒用到的 PDF 會被擋下。

用法: python3 scripts/check-pdf-font.py <pdf-path>
失敗時 exit 1（CI fail-fast）。
"""
import sys
import zlib
import re


def decompress_all(data: bytes) -> bytes:
    """解壓所有 FlateDecode 流，回傳原始 + 解壓內容的合體。"""
    streams = re.findall(rb"stream\r?\n(.*?)\r?\nendstream", data, re.DOTALL)
    blob = data
    for s in streams:
        try:
            blob += zlib.decompress(s)
        except Exception:
            pass
    return blob


def parse_to_unicode_cmap(blob: bytes) -> set:
    """從 PDF 內容解析 ToUnicode CMap，回傳所有映射到的 Unicode 碼位集合。

    Chrome print-to-pdf 會為每個子集字型嵌入 ToUnicode CMap，
    格式為 beginbfchar / beginbfrange 區塊，把 glyph code 映射到 Unicode。
    """
    codepoints: set = set()

    # bfchar: <src> <dst>  （src 為 glyph code，dst 為 1~4 個 UTF-16BE code unit）
    for block in re.finditer(rb"beginbfchar(.*?)endbfchar", blob, re.DOTALL):
        for m in re.finditer(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", block.group(1)):
            dst_hex = m.group(2)
            try:
                dst_bytes = bytes.fromhex(dst_hex.decode("ascii"))
                if len(dst_bytes) == 2:
                    codepoints.add(int.from_bytes(dst_bytes, "big"))
                elif len(dst_bytes) == 4:
                    cp = int.from_bytes(dst_bytes, "big")
                    # 代理對 (surrogate pair) 轉成真正碼位
                    hi, lo = dst_bytes[0:2], dst_bytes[2:4]
                    hi_i, lo_i = int.from_bytes(hi, "big"), int.from_bytes(lo, "big")
                    if 0xD800 <= hi_i <= 0xDBFF and 0xDC00 <= lo_i <= 0xDFFF:
                        codepoints.add(0x10000 + ((hi_i - 0xD800) << 10) + (lo_i - 0xDC00))
                    else:
                        codepoints.add(cp)
            except Exception:
                pass

    # bfrange: <lo> <hi> <dst>  （dst 為起始 Unicode，連續映射）
    for block in re.finditer(rb"beginbfrange(.*?)endbfrange", blob, re.DOTALL):
        for m in re.finditer(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", block.group(1)):
            try:
                lo_i = int(m.group(1), 16)
                hi_i = int(m.group(2), 16)
                dst_i = int(m.group(3), 16)
                for cp in range(dst_i, dst_i + (hi_i - lo_i) + 1):
                    codepoints.add(cp)
            except Exception:
                pass

    return codepoints


def has_cjk_codepoints(codepoints: set) -> bool:
    """檢查是否有 CJK Unified Ideographs (U+4E00–U+9FFF) 或 CJK 標點。"""
    for cp in codepoints:
        if 0x4E00 <= cp <= 0x9FFF:  # CJK Unified Ideographs
            return True
        if 0x3000 <= cp <= 0x303F:  # CJK 標點
            return True
        if 0xFF00 <= cp <= 0xFFEF:  # 全形
            return True
    return False


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: check-pdf-font.py <pdf>")
        return 2
    path = sys.argv[1]
    with open(path, "rb") as fh:
        data = fh.read()

    blob = decompress_all(data)

    # 1) 字型名稱標記
    markers = [b"Noto", b"JhengHei", b"PingFang", b"NotoSansCJK"]
    found = [m.decode("ascii", "ignore") for m in markers if m in blob]
    print(f"PDF size: {len(data)} bytes")
    print(f"CJK font markers: {found if found else 'NONE'}")

    # 2) 大小下限
    if len(data) < 50_000:
        print(f"FAIL: PDF suspiciously small ({len(data)} bytes) for embedded CJK")
        return 1

    # 3) ToUnicode CMap：內容真的有中文字元碼位
    codepoints = parse_to_unicode_cmap(blob)
    cjk = has_cjk_codepoints(codepoints)
    print(f"ToUnicode codepoints parsed: {len(codepoints)}")
    print(f"Contains CJK codepoints (U+4E00-9FFF etc.): {cjk}")

    if not found:
        print("FAIL: PDF missing CJK font (Chinese would render as tofu)")
        return 1
    if not cjk:
        print("FAIL: PDF content has no actual CJK codepoints (font embedded but unused)")
        return 1

    print("OK: PDF embeds CJK font AND content contains real Chinese characters")
    return 0


if __name__ == "__main__":
    sys.exit(main())

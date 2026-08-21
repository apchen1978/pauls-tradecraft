#!/usr/bin/env python3
"""check-onepager-sync.py — One-Pager 編輯審查 guardrail

比對 canonical Works（src/data/works.js）與 One-Pager 的 reviewedWorkIds：

1. 每個 reviewedWorkId 必須存在於 canonical Works。
2. 每個 canonical Work ID 必須已被編輯審查（在 reviewedWorkIds 中）。

此機制**不要求**每個已審查作品都出現在 One-Pager 中——
收錄與否、順序、敘述由 Paul 決定（編輯精選）。

失敗時輸出：
  Portfolio inventory changed — One-Pager editorial review required.
並 exit 1（CI fail-fast）。

用法: python3 scripts/check-onepager-sync.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKS_JS = ROOT / "src" / "data" / "works.js"
ONEPAGER_JSONS = [ROOT / "content" / f"onepager-{loc}.json" for loc in ("zh", "en")]

MISMATCH_MSG = "Portfolio inventory changed — One-Pager editorial review required."


def canonical_works_ids() -> set:
    """從 works.js 抽出 id（正則，避免 import JSX）。"""
    src = WORKS_JS.read_text(encoding="utf-8")
    return set(re.findall(r'^\s*id:\s*"([^"]+)"', src, re.MULTILINE))


def reviewed_ids(path: Path) -> set:
    data = json.loads(path.read_text(encoding="utf-8"))
    return set(data.get("reviewedWorkIds", []))


def main() -> int:
    canonical = canonical_works_ids()
    if not canonical:
        print("FAIL: could not parse Works IDs from works.js")
        return 1

    problems = []
    for path in ONEPAGER_JSONS:
        reviewed = reviewed_ids(path)
        # 1) reviewed 中不存在的 id（One-Pager 引用已刪除的作品）
        unknown_reviewed = reviewed - canonical
        # 2) canonical 中未審查的 id（新增作品未進 reviewedWorkIds）
        unreviewed = canonical - reviewed
        for rid in sorted(unknown_reviewed):
            problems.append(f"[{path.name}] reviewedWorkId '{rid}' not in canonical Works")
        for cid in sorted(unreviewed):
            problems.append(f"[{path.name}] Work '{cid}' not editorially reviewed")

    if problems:
        print(MISMATCH_MSG)
        for p in problems:
            print("  -", p)
        return 1

    print(
        f"OK: {len(canonical)} canonical Works all reviewed; "
        f"no stale One-Pager references."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())

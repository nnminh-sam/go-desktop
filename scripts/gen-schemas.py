#!/usr/bin/env python3
"""Regenerate doc/component-schemas.md from the exported types in frontend/src/components/ui/*.tsx."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UI = ROOT / "frontend/src/components/ui"
ORDER = ["button", "icon-button", "toggle-group", "segmented-control", "tabs", "dropdown-menu", "context-menu",
         "command-menu", "text-field", "form-field", "select", "switch", "dialog", "popover", "tooltip", "toaster",
         "badge", "kbd", "spinner", "skeleton", "empty-state", "card", "separator", "scroll-area", "resizable",
         "tree-view", "breadcrumb", "code-block"]


def exported_types(src: str) -> list[str]:
    lines, blocks, i = src.split("\n"), [], 0
    while i < len(lines):
        if re.match(r"^export (type|interface) ", lines[i]):
            j, depth, buf = i, 0, []
            while j < len(lines):
                buf.append(lines[j])
                depth += lines[j].count("{") + lines[j].count("(") - lines[j].count("}") - lines[j].count(")")
                if depth <= 0 and lines[j].rstrip().endswith((";", "}")):
                    break
                j += 1
            blocks.append("\n".join(buf))
            i = j
        i += 1
    return blocks


names = ORDER + sorted(p.stem for p in UI.glob("*.tsx") if p.stem not in ORDER)
out = ["# Component schemas\n",
       "Generated from the source in `frontend/src/components/ui/` by `scripts/gen-schemas.py` — the exported types are "
       "the component contracts. Do not edit by hand; regenerate after changing a component.\n"]
for n in names:
    src = (UI / f"{n}.tsx").read_text()
    fns = re.findall(r"^export (?:function|const) (\w+)", src, re.M)
    out.append(f"\n## {n}\n\nExports: {', '.join(f'`{f}`' for f in fns)}\n\n```ts\n" + "\n\n".join(exported_types(src)) + "\n```\n")
(ROOT / "doc/component-schemas.md").write_text("\n".join(out))
print(f"wrote {len(names)} components")

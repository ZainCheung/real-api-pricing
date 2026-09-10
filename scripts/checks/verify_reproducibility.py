"""Verify byte-for-byte reproducibility of the canonical publication build."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
result = subprocess.run(
    [sys.executable, str(ROOT / "scripts" / "generate_publication.py"), "--reproducibility-check"],
    cwd=ROOT,
)
raise SystemExit(result.returncode)


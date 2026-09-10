"""Shared rendering configuration for preview and canonical chart builds.

The plotting scripts intentionally keep their business logic separate from
this module.  This module only selects the renderer configuration and checks
the one font used by the canonical build.
"""
from __future__ import annotations

import hashlib
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# The URL points at an immutable commit in notofonts/noto-cjk rather than a
# moving release branch.  The digest is checked before Matplotlib or librsvg
# is allowed to use the file.
CANONICAL_FONT_NAME = "Noto Sans CJK SC"
CANONICAL_FONT_FILENAME = "NotoSansCJKsc-Regular.otf"
CANONICAL_FONT_URL = (
    "https://raw.githubusercontent.com/notofonts/noto-cjk/"
    "523d033d6cb47f4a80c58a35753646f5c3608a78/"
    "Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf"
)
CANONICAL_FONT_SHA256 = "2c76254f6fc379fddfce0a7e84fb5385bb135d3e399294f6eeb6680d0365b74b"
CANONICAL_FONT_ENV = "REAL_API_PRICING_FONT_PATH"
CANONICAL_MODE_ENV = "REAL_API_PRICING_CANONICAL"
SVG_HASH_SALT = "real-api-pricing"

# Preview-only fallback.  It is deliberately not used when canonical mode is
# enabled; CI registers the exact Noto file and fails if it is unavailable.
PREVIEW_FONT_FAMILY = [
    "Microsoft YaHei",
    "Heiti SC",
    "PingFang SC",
    "Noto Sans CJK SC",
    "Segoe UI",
    "DejaVu Sans",
]

# Matplotlib's SVG backend adds the current time unless Date is explicitly
# disabled.  Creator is fixed so the remaining metadata is stable too.
SAVE_METADATA = {
    "Date": None,
    "Creator": "real-api-pricing canonical chart generator",
}


def canonical_mode() -> bool:
    """Return whether plotting must use the checked canonical font."""

    return os.environ.get(CANONICAL_MODE_ENV, "").lower() in {"1", "true", "yes"}


def default_font_path() -> Path:
    return ROOT / "_build" / "fonts" / CANONICAL_FONT_FILENAME


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def resolve_canonical_font(*, required: bool | None = None) -> Path | None:
    """Resolve and verify the canonical font, or return ``None`` for preview."""

    if required is None:
        required = canonical_mode()
    configured = os.environ.get(CANONICAL_FONT_ENV)
    path = Path(configured).expanduser() if configured else default_font_path()
    if not path.is_file():
        if required:
            raise RuntimeError(
                "Canonical chart build requires "
                f"{CANONICAL_FONT_NAME!r}; run scripts/setup_canonical_font.py "
                f"or set {CANONICAL_FONT_ENV} to the downloaded font"
            )
        return None
    actual = sha256(path)
    if actual != CANONICAL_FONT_SHA256:
        raise RuntimeError(
            f"Canonical font checksum mismatch for {path}: "
            f"expected {CANONICAL_FONT_SHA256}, got {actual}"
        )
    return path.resolve()


def configure_matplotlib(*, required: bool | None = None) -> Path | None:
    """Apply deterministic Matplotlib settings and verify the resolved font."""

    import matplotlib
    from matplotlib import font_manager

    path = resolve_canonical_font(required=required)
    if path:
        font_manager.fontManager.addfont(str(path))
        family = [CANONICAL_FONT_NAME]
    else:
        family = PREVIEW_FONT_FAMILY
    matplotlib.rcParams.update(
        {
            "font.family": family,
            "font.sans-serif": family,
            "axes.unicode_minus": False,
            "svg.hashsalt": SVG_HASH_SALT,
        }
    )
    if path:
        resolved = Path(
            font_manager.findfont(CANONICAL_FONT_NAME, fallback_to_default=False)
        ).resolve()
        if resolved != path:
            raise RuntimeError(
                f"Canonical font resolution mismatch: expected {path}, got {resolved}"
            )
        resolved_hash = sha256(resolved)
        if resolved_hash != CANONICAL_FONT_SHA256:
            raise RuntimeError(
                f"Canonical font resolution mismatch: expected SHA256 "
                f"{CANONICAL_FONT_SHA256}, got {resolved_hash} at {resolved}"
            )
        print(f"canonical font: {CANONICAL_FONT_NAME} ({resolved}; source {path})")
    else:
        print("preview font fallback:", ", ".join(PREVIEW_FONT_FAMILY))
    return path


def svg_style() -> str:
    """Return the complete CSS block serialized by the hand-written SVG generator."""

    if canonical_mode():
        # The matching font file is installed in the canonical CI image before
        # Sharp renders PNGs. Every text role uses that one family; no OS font
        # fallback can change glyph metrics in a canonical artifact.
        family = '"Noto Sans CJK SC",sans-serif'
        serif = family
        number = family
    else:
        family = '"Microsoft YaHei","Heiti SC","PingFang SC","Noto Sans CJK SC","Segoe UI",sans-serif'
        serif = '"Times New Roman",serif'
        number = '"Segoe UI",sans-serif'
    return (
        f'text{{font-family:{family}}} .serif{{font-family:{serif}}} '
        f'.number{{font-family:{number};font-variant-numeric:tabular-nums}} '
        '.label-name{paint-order:stroke;stroke:#fff;stroke-width:5px;'
        'stroke-linejoin:round} .point:hover{opacity:1}'
    )


def strip_svg_line_padding(path: Path) -> None:
    """Remove only trailing ASCII padding emitted by Matplotlib's SVG writer.

    This intentionally does not parse, pretty-print, minify, reorder or round
    XML.  It keeps generated text files friendly to ``git diff --check`` while
    leaving every SVG token and numeric value untouched.
    """

    raw = path.read_bytes()
    lines = raw.splitlines(keepends=True)
    normalized = b"".join(
        line.rstrip(b" \t\r\n") + (b"\n" if line.endswith((b"\n", b"\r")) else b"")
        for line in lines
    )
    if normalized != raw:
        path.write_bytes(normalized)

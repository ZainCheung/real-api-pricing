"""Run the complete publication pipeline in one reproducible entry point.

``python scripts/generate_publication.py`` is the canonical generator used by
the publisher workflow.  ``--preview`` leaves font selection to the local
machine.  ``--check`` and ``--reproducibility-check`` build in isolated copies
so neither mode overwrites a developer's checkout.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONT_FILENAME = "NotoSansCJKsc-Regular.otf"

PIPELINE = (
    ("python", "scripts/build_adopted.py"),
    ("python", "scripts/compute.py"),
    ("python", "scripts/checks/verify_benchmark_configs.py"),
    ("python", "scripts/plot_svg.py"),
    ("node", "scripts/render_svg.cjs"),
    ("python", "scripts/build_html.py"),
    ("node", "scripts/checks/verify_configuration_html.cjs"),
    ("python", "scripts/plot_quotas.py"),
    ("python", "scripts/publish_charts.py"),
    ("python", "scripts/checks/verify_svg.py"),
    ("python", "scripts/checks/verify_four_boards.py"),
    ("python", "scripts/checks/verify_aa_snapshot.py"),
    ("python", "scripts/checks/verify_fee_bands.py"),
    ("python", "scripts/checks/verify_publication.py"),
)


def load_baseline(root: Path = ROOT) -> dict[str, str]:
    """Return historical chart paths that must not be normalized in this PR."""

    path = root / "config" / "chart-baseline.json"
    if not path.is_file():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    entries = payload.get("paths", {})
    if isinstance(entries, list):
        return {item["path"]: item["sha256"] for item in entries}
    return {
        name: (value if isinstance(value, str) else value["sha256"])
        for name, value in entries.items()
    }


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def baseline_hash(baseline: dict[str, str], chart_relative: str) -> str | None:
    """Look up a baseline entry using either repository or charts-relative paths."""

    return baseline.get(chart_relative) or baseline.get(f"charts/{chart_relative}")


def baseline_snapshot(root: Path) -> dict[str, bytes]:
    """Snapshot only files that still match the documented historical hashes."""

    snapshot = {}
    for relative, expected in load_baseline(root).items():
        path = root / relative
        if path.is_file() and file_sha256(path) == expected:
            snapshot[relative] = path.read_bytes()
    return snapshot


def restore_baseline(root: Path, snapshot: dict[str, bytes]) -> None:
    """Restore legacy chart bytes in both ``charts`` and their build sources."""

    if not snapshot:
        return
    # Import the injectable exporter without relying on its module globals.
    sys.path.insert(0, str(root / "scripts"))
    try:
        from publish_charts import exports

        destinations = {
            destination.relative_to(root / "charts").as_posix(): source
            for source, destination in exports(root)
        }
    finally:
        sys.path.pop(0)
    for relative, content in snapshot.items():
        destination = root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)
        source = destinations.get(relative)
        if source is not None:
            source.parent.mkdir(parents=True, exist_ok=True)
            source.write_bytes(content)


def command_line(kind: str, command: str) -> list[str]:
    executable = sys.executable if kind == "python" else kind
    return [executable, *command.split()]


def base_environment(*, canonical: bool) -> dict[str, str]:
    env = os.environ.copy()
    env.update(
        {
            "PYTHONHASHSEED": "0",
            "TZ": "UTC",
            "MPLBACKEND": "Agg",
            "LC_ALL": "C.UTF-8",
        }
    )
    if canonical:
        env["REAL_API_PRICING_CANONICAL"] = "1"
    else:
        env.pop("REAL_API_PRICING_CANONICAL", None)
    return env


def run(command: list[str], root: Path, env: dict[str, str]) -> None:
    print("+", " ".join(command))
    subprocess.run(command, cwd=root, env=env, check=True)


def ensure_canonical_font(root: Path, env: dict[str, str]) -> None:
    """Download the pinned font into this workspace when CI did not preinstall it."""

    configured = env.get("REAL_API_PRICING_FONT_PATH")
    if configured:
        path = Path(configured).expanduser()
        if not path.is_file():
            raise RuntimeError(f"REAL_API_PRICING_FONT_PATH does not exist: {path}")
        return
    font_dir = root / "_build" / "fonts"
    install_dir = Path.home() / ".local" / "share" / "fonts"
    # Isolated checks can reuse a verified font already downloaded by a prior
    # canonical run in the source checkout. This keeps self-tests offline once
    # setup has succeeded, while a clean CI checkout still downloads normally.
    shared_font = ROOT / "_build" / "fonts" / FONT_FILENAME
    if root != ROOT and shared_font.is_file():
        font_dir = shared_font.parent
    run(
        [
            sys.executable,
            "scripts/setup_canonical_font.py",
            "--font-dir",
            str(font_dir),
            "--install-dir",
            str(install_dir),
        ],
        root,
        env,
    )
    # Sharp/librsvg resolves SVG text through fontconfig, while Matplotlib
    # resolves the same file explicitly. Refresh the user cache for local
    # canonical runs; CI installs this directory in its setup step.
    if shutil.which("fc-cache"):
        run(["fc-cache", "-f", str(install_dir)], root, env)
    # Point Matplotlib at the same fontconfig path that librsvg/Sharp uses.
    # This makes the resolved path check strict even when a workspace copy
    # and an installed copy are both present.
    env["REAL_API_PRICING_FONT_PATH"] = str(install_dir / FONT_FILENAME)


def run_pipeline(root: Path, *, canonical: bool, preserve_legacy: bool = True) -> None:
    env = base_environment(canonical=canonical)
    snapshot = baseline_snapshot(root) if preserve_legacy else {}
    if canonical:
        ensure_canonical_font(root, env)
    for kind, command in PIPELINE:
        run(command_line(kind, command), root, env)
    if snapshot:
        restore_baseline(root, snapshot)


def copy_workspace(source: Path) -> tuple[tempfile.TemporaryDirectory, Path]:
    temporary = tempfile.TemporaryDirectory(prefix="real-api-pricing-publication-")
    target = Path(temporary.name) / "repo"
    ignored = shutil.ignore_patterns(
        ".git",
        "_build",
        "node_modules",
        ".venv",
        "__pycache__",
        "*.pyc",
        "dist",
    )
    shutil.copytree(source, target, ignore=ignored, symlinks=True)
    node_modules = source / "node_modules"
    if node_modules.is_dir():
        (target / "node_modules").symlink_to(node_modules, target_is_directory=True)
    return temporary, target


def chart_hashes(root: Path) -> dict[str, str]:
    charts = root / "charts"
    return {
        path.relative_to(charts).as_posix(): file_sha256(path)
        for path in sorted(charts.rglob("*"))
        if path.is_file() and path.suffix in {".svg", ".png", ".txt", ".html"}
    }


def check_svg_metadata(root: Path) -> None:
    """Reject volatile metadata in canonical SVGs (legacy baseline is explicit)."""

    baseline = load_baseline(root)
    for path in sorted((root / "charts").rglob("*.svg")):
        relative = path.relative_to(root / "charts").as_posix()
        expected = baseline_hash(baseline, relative)
        if expected and file_sha256(path) == expected:
            continue
        content = path.read_bytes()
        if b"<dc:date>" in content:
            raise RuntimeError(f"volatile SVG date found in canonical artifact: {relative}")


def check_tracked_charts(root: Path) -> int:
    temporary, isolated = copy_workspace(root)
    try:
        run_pipeline(isolated, canonical=True, preserve_legacy=True)
        check_svg_metadata(isolated)
        expected = chart_hashes(isolated)
        actual = chart_hashes(root)
        failures = []
        baseline = load_baseline(root)
        for path in sorted(set(actual) | set(expected)):
            expected_baseline = baseline_hash(baseline, path)
            if expected_baseline and actual.get(path) == expected_baseline:
                # These files retain the Microsoft YaHei historical baseline;
                # a separate migration can remove this exception later.
                continue
            if actual.get(path) != expected.get(path):
                failures.append(path)
        if failures:
            print("Stale canonical chart artifacts:")
            for path in failures:
                print(" -", path)
            return 1
        print("PASS: tracked canonical chart artifacts are up to date")
        return 0
    finally:
        temporary.cleanup()


def reproducibility_check(root: Path) -> int:
    runs: list[tuple[tempfile.TemporaryDirectory, Path]] = []
    try:
        hashes = []
        for index in ("a", "b"):
            temporary, isolated = copy_workspace(root)
            runs.append((temporary, isolated))
            print(f"canonical generation run {index}")
            run_pipeline(isolated, canonical=True, preserve_legacy=True)
            check_svg_metadata(isolated)
            hashes.append(chart_hashes(isolated))
        first, second = hashes
        mismatches = [
            path
            for path in sorted(set(first) | set(second))
            if first.get(path) != second.get(path)
        ]
        if mismatches:
            print("Non-reproducible canonical artifacts:")
            for path in mismatches:
                print(" -", path)
            return 1
        print(
            "PASS: canonical SVG, PNG and TXT artifacts are byte-identical across two runs "
            f"({len(first)} files)"
        )
        return 0
    finally:
        for temporary, _ in runs:
            temporary.cleanup()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--preview",
        action="store_true",
        help="use local preview font fallbacks instead of canonical Noto",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="generate in a temporary copy and fail when tracked charts are stale",
    )
    parser.add_argument(
        "--reproducibility-check",
        action="store_true",
        help="generate two isolated canonical runs and compare SVG/PNG/TXT hashes",
    )
    parser.add_argument(
        "--publisher",
        action="store_true",
        help="canonical in-place generation for the GitHub Actions publisher",
    )
    args = parser.parse_args()
    if args.check and args.reproducibility_check:
        parser.error("--check and --reproducibility-check are mutually exclusive")
    if args.check:
        return check_tracked_charts(ROOT)
    if args.reproducibility_check:
        return reproducibility_check(ROOT)
    # Keep the documented historical baseline out of ordinary local and CI
    # runs.  A separate baseline-normalization change can remove that config
    # once all historical charts have been regenerated canonically.
    run_pipeline(ROOT, canonical=not args.preview, preserve_legacy=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

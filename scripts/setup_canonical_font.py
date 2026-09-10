"""Download and verify the immutable font used by canonical chart builds."""
from __future__ import annotations

import argparse
import shutil
import tempfile
import time
import urllib.request
from pathlib import Path

from chart_environment import (
    CANONICAL_FONT_FILENAME,
    CANONICAL_FONT_SHA256,
    CANONICAL_FONT_URL,
    default_font_path,
    sha256,
)


def download(destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(
        CANONICAL_FONT_URL,
        headers={"User-Agent": "real-api-pricing-canonical-build"},
    )
    temporary_path: Path | None = None
    for attempt in range(1, 4):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                with tempfile.NamedTemporaryFile(
                    mode="wb", dir=destination.parent, prefix=f".{destination.name}.", delete=False
                ) as temporary:
                    temporary_path = Path(temporary.name)
                    shutil.copyfileobj(response, temporary)
            break
        except Exception as error:  # pragma: no cover - network failure is environment-specific
            if attempt == 3:
                raise RuntimeError(f"Unable to download canonical font after 3 attempts: {error}") from error
            time.sleep(attempt)
    try:
        actual = sha256(temporary_path)
        if actual != CANONICAL_FONT_SHA256:
            raise RuntimeError(
                f"Downloaded font checksum mismatch: expected {CANONICAL_FONT_SHA256}, got {actual}"
            )
        temporary_path.replace(destination)
    finally:
        if temporary_path is not None and temporary_path.exists():
            temporary_path.unlink()
    return destination


def install_font(path: Path, directory: Path) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    installed = directory / CANONICAL_FONT_FILENAME
    shutil.copyfile(path, installed)
    if sha256(installed) != CANONICAL_FONT_SHA256:
        raise RuntimeError(f"Installed font checksum mismatch: {installed}")
    return installed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--font-dir",
        type=Path,
        default=default_font_path().parent,
        help="directory in which to store the verified font",
    )
    parser.add_argument(
        "--install-dir",
        type=Path,
        help="optional fontconfig directory for librsvg/Sharp",
    )
    args = parser.parse_args()
    destination = args.font_dir / CANONICAL_FONT_FILENAME
    if destination.is_file() and sha256(destination) == CANONICAL_FONT_SHA256:
        print(f"canonical font already present: {destination}")
    else:
        print(f"downloading canonical font from immutable revision to {destination}")
        download(destination)
    if args.install_dir:
        installed = install_font(destination, args.install_dir)
        print(f"installed canonical font for fontconfig: {installed}")
    print(destination.resolve())


if __name__ == "__main__":
    main()

# Reproducing the charts

Charts are generated artifacts. Local generation is for preview/testing; the
canonical `charts/**` publication is performed by GitHub Actions in the pinned
Python/Matplotlib/Sharp environment. Interactive HTML still loads Plotly from
its CDN.

The canonical entry point is:

```sh
python -m pip install -r requirements.lock
npm ci
python scripts/generate_publication.py
```

The entry point runs the existing data, calculation, plotting, rendering,
publication and verification scripts in a fixed order. It downloads the
immutable Noto Sans CJK SC revision listed in `scripts/chart_environment.py`,
checks its SHA-256, fixes Matplotlib's SVG hash salt, and disables volatile SVG
dates. Use `python scripts/generate_publication.py --preview` for a local-only
font fallback. `npm ci` (not `npm install`) is required for the locked Sharp
PNG renderer.

Before opening a PR, run the non-mutating checks:

```sh
python scripts/generate_publication.py --check
python scripts/checks/verify_reproducibility.py
```

`--check` builds in a temporary copy and reports stale tracked canonical
artifacts without overwriting the checkout. The reproducibility check performs
two independent canonical builds and compares every SVG, PNG and TXT SHA-256.

Run `python scripts/setup_canonical_font.py --install-dir ~/.local/share/fonts`
and `fc-cache -f` when you want Sharp's local PNG preview to use the same font.
The small `config/chart-baseline.json` exception records historical charts that
were rendered with Microsoft YaHei; it keeps PR #21 from mixing a one-time
historical font migration into a data update. Remove that exception in a
separate baseline-normalization change.

For debugging individual stages, the underlying commands remain available:

```sh
python scripts/build_adopted.py
python scripts/compute.py
python scripts/checks/verify_benchmark_configs.py
python scripts/plot_svg.py
node scripts/render_svg.cjs
python scripts/build_html.py
node scripts/checks/verify_configuration_html.cjs
python scripts/plot_quotas.py
python scripts/publish_charts.py
python scripts/checks/verify_svg.py
python scripts/checks/verify_four_boards.py
python scripts/checks/verify_aa_snapshot.py
python scripts/checks/verify_fee_bands.py
python scripts/checks/verify_publication.py
```

On Windows, set `PYTHONIOENCODING=utf-8` if the console cannot print Chinese filenames. `plot_static.py` is a compatibility entry point for `plot_svg.py`.

## Layout

- `data/research/`: append-only evidence and dated leaderboard snapshots. Historical claims may disagree with current adoption decisions.
- `data/raw/`: aggregate usage evidence, retained for traceability.
- `data/conventions.json`: shared calculation conventions and exchange rate.
- `scripts/build_adopted.py`: adopted values, confidence and rationale; generates `data/adopted.csv`.
- `derived/`: price/score summary pairs, lossless benchmark configurations and explicit plan/configuration reference mappings. Run `compute.py` to regenerate all four benchmark JSON/CSV files.
- `charts/`: public bilingual charts and tables; start with `charts/README.md`. English and Chinese filenames live in `en/` and `zh/`, grouped into `pareto/`, `overview/` and `frontier/`.
- `_build/`: ignored intermediate renders, interactive HTML and audit reports. `publish_charts.py` exports full-data Pareto charts and all overview/frontier figures to `charts/`. Selected-data renders are never published.
- `scripts/checks/`: coordinate, frontier and language checks.

Older `data/subscription-quotas*.json`, `data/subscriptions.json` and claim archives are historical evidence, not current build inputs. The build uses the adoption script and dated research scores. Local `_backup/` and caches are ignored by Git and are not publication assets.

## Publication status

Original software is licensed under MIT; third-party attribution and license boundaries are documented in SOURCES.md. Data files are the documented public redacted edition; original evidence is preserved only in ignored local backups. Aggregate measurements remain for reproducibility. See PUBLICATION.md for the redaction scope. Public chart discovery starts at charts/README.md; all full-data charts, both languages and both SVG/PNG formats are retained.

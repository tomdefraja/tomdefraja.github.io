# Coastal walk map + stats — what changed

Unzip this into the root of your repo, letting it overwrite the matching files.

## Map files
| Path | Status | What it does |
|---|---|---|
| `scripts/kmz_to_json.py` | replaced | Now pulls colour, name, description, and date out of the KMZ, not just lat/lng |
| `.github/workflows/convert_kmz.yml` | **new location** | This is your existing `convert_kmz.yaml`, moved into `.github/workflows/` — GitHub only runs workflows from that exact folder, so it was never actually active before |
| `data/camps.kmz` | replaced | Your real KMZ (the placeholder test file is gone) |
| `data/spots.json` | replaced | Generated from that KMZ — 12 spots, ready to go |

## Stats files (new)
| Path | What it does |
|---|---|
| `data/walk_stats.csv` | Your real 14 days of data, in exactly the shape an "export sheet as CSV" from your spreadsheet produces (title row, formula columns, all included) |
| `stats/walk_stats.qmd` | The R/Quarto document — reads the CSV, recomputes everything (rolling averages, totals, spend by category) itself rather than trusting the spreadsheet's formulas, and produces charts + a JSON summary |
| `.github/workflows/render_stats.yml` | Runs on every push to `data/walk_stats.csv`: installs R + Quarto, renders the document, commits the generated charts/JSON/report back |
| `assets/images/stats/*.png` | The 5 charts (already generated from your real data, so the site works immediately) |
| `data/walk_stats_summary.json` | Headline numbers (total distance, swims, spend, etc.) for the stat cards |

## Shared/updated files
| Path | Status | What it does |
|---|---|---|
| `_layouts/map.html` | replaced | Map (colour-coded markers, popups, legend) **plus** a "Trip stats" section below it: stat cards, 5 charts, link to the full R report |
| `_sass/layout/_map.scss` | replaced | Styling for the map, popups, legend, stat cards, and chart grid |
| `assets/css/main.scss` | replaced | One line added: `"layout/map"` in the import list |

## One manual step
Delete the old `convert_kmz.yaml` sitting in your **repo root** (not `.github/workflows/`) — it's dead weight now that the real one lives in the right place.

## The day-to-day workflow, once this is merged

**Map:**
1. Export from maps.me → `camps.kmz`
2. Dad drops it into `data/camps.kmz`, commits, pushes
3. Action regenerates `data/spots.json` automatically

**Stats:**
1. Export the "stats" tab of your spreadsheet as CSV, no need to tidy it up first
2. Dad drops it into `data/walk_stats.csv`, commits, pushes
3. Action installs R + Quarto, re-renders `stats/walk_stats.qmd`, commits the new charts/JSON/report back automatically

Both run independently — updating one doesn't touch the other.

## Colour scheme (map)
- red → Hosted
- orange → Wild camp
- yellow → Accommodation
- any other maps.me colour still plots fine, just labelled by colour name until you add a line for it in `scripts/kmz_to_json.py`

## Worth checking
A few orange points in your sample data ("The Gribbin", "Sculpture Park", "Portheras", "Bosahan Cove") read like waypoints rather than camps — no description, tagged as tourist POIs. They'll show as "Wild camp" since that's what orange means. Worth a quick look to make sure your colour habit in maps.me stays consistent, since the parser has nothing to go on but colour.

## About `stats/walk_stats.qmd`
Table 1 from your spreadsheet (the distance-bucket table) is skipped entirely — it was broken by Excel autocorrect turning bucket labels like "5-10" into dates. The Quarto doc rebuilds the same idea properly as `distance_histogram.png`, computed straight from the daily distances rather than a manually-maintained bucket table.

`£ - accom` and `£ - gear` are entirely blank in your current 14 days (no accommodation or gear spend logged yet) — handled explicitly so those columns won't misbehave once real numbers show up in them.

If you want to add or tweak a chart, edit the `.qmd` directly — it's plain R inside standard Quarto code chunks (` ```{r} `). Pushing a change to it won't re-trigger the Action by itself though, since the workflow only watches `data/walk_stats.csv` — for a chart-only tweak, either add `stats/walk_stats.qmd` to the workflow's trigger paths, or just run `quarto render stats/walk_stats.qmd` locally (needs R + Quarto installed) and commit the results yourself.


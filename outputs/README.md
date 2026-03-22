# Outputs (generated)

| Path | Produced by | Description |
|------|-------------|-------------|
| `lithuania_fiscal_benchmark_report.txt` | `node scripts/lithuania_model_sim.mjs` | Text benchmark vs Excel **Model** row 29. |
| `figures/<workbook-slug>/` | `python scripts/plot_lithuania_benchmarks.py` | PNG charts + CSV time series; filenames include source `.xlsx` slug and **Model** sheet reference. |

Regenerate after changing the workbook. Figures use **cached** Excel values until you recalculate in Excel and save.

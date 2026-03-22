# LAM-Benchmark-Scenario — Lithuania fiscal–demographic simulation

Reference documentation for the **Euro Challenge / Lithuania retention pipeline** workbook and the **Node.js replication script** that benchmarks all scenarios against the Excel **Model** sheet.

---

## What this repository is

- A **scenario benchmark**, not an economic **forecast**. It answers: *if* Lithuania retains a specified flow of young contributors each year, *how do 2050 population and old-age dependency move relative to an EC/Eurostat-style baseline?*
- The **Excel workbook** (`final_lithuania_model*.xlsx`) is the original specification; **`scripts/lithuania_model_sim.mjs`** reproduces its **Inputs → Scenario_Drivers → Model** logic without third-party xlsx libraries (reads OOXML via `unzip` + XML parse).

---

## What this repository is not

- Not a general-equilibrium or pension microsimulation.
- Not a substitute for the **European Commission 2024 Ageing Report** fiscal projections; those provide **spending-to-GDP** context. This model provides a **compact demographic + retention** layer.
- The workbook **“fiscal” column** is a **stylized index** (scaled flows × a budget line), **not** general government net lending or AMIF/ERDF cash flows.

---

## Repository layout

| Path | Purpose |
|------|--------|
| `final_lithuania_model (1).xlsx`, `(2).xlsx` | Source workbook(s). Default inputs for the script if present in repo root. |
| `final_lithuania_model.xlsx - Inputs.csv` | Optional text extract of **Inputs**-style labels (not a full workbook). |
| `scripts/lithuania_model_sim.mjs` | Simulation + validation vs Excel cached row 29. |
| `lithuania_fiscal_benchmark_report.txt` | **Generated** full text report (overwritten each run). |
| `Q_AND_A_Answer_Doc.md` | Presentation-aligned Q&A and talking points with numbers. |
| `README.md` | This file. |

---

## Workbook structure (expected sheets)

The script assumes the standard sheet order from the packaged model:

| Order | Sheet name | Role |
|------:|------------|------|
| 1 | **Inputs** | Demographics, policy headcounts, fiscal parameters, 2050 anchors. |
| 2 | **Scenario_Drivers** | Four rows (Excel rows 4–7): multipliers and demographic “adders” per scenario. |
| 3 | **Model** | Year grid 2025–2050; columns **B–G** Baseline, **H–M** Moderate, **N–S** Strong, **T–Y** Stress. |
| 4 | **Summary** | Dashboard (pulls from **Model**). |
| 5 | **Notes** | Interpretation. |

If sheet order changes, the script must be updated (`readSheetCells(tmp, sheetNum, …)`).

---

## Inputs sheet — cell map (column B)

These are the cells **`lithuania_model_sim.mjs`** reads:

| Cell | Meaning |
|------|--------|
| `B7` | Start year (e.g. 2025) |
| `B8` | End year (e.g. 2050) |
| `B9`–`B11` | Starting total population, working-age population, old-age population |
| `B12` | Baseline annual **total** population decline rate (decimal, calibrated) |
| `B13` | Baseline annual **working-age** decline rate (decimal) |
| `B14` | Baseline annual **old-age** growth rate (decimal) |
| `B17` | Official-style **2050 population anchor** (reference) |
| `B18` | Official-style **2050 old-age dependency anchor** (reference) |
| `B21` | Immigrant entrants (18–34) helped by policy, per year |
| `B22` | Returning Lithuanians (18–34) helped, per year |
| `B23` | Priority-sector graduates retained, per year |
| `B24` | Base retention rate on policy entrants |
| `B25` | Annual exits from retained pool |
| `B26` | Additional parents kept in labor force (headcount-style input) |
| `B30` | Average annual wage of retained cohort (€) |
| `B31` | Effective tax + social contribution rate (decimal) |
| `B32` | Annual public-service cost per added resident (€) |
| `B33` | Annual national policy cost line (€) — used in the **stylized fiscal** formula |
| `B34` | Net annual fiscal benefit per retained contributor (€) — **documented** in Inputs; **not** used in the Excel fiscal column the script mirrors |

---

## Scenario_Drivers sheet (Excel rows 4–7)

Each row defines one scenario. Columns **B–I**:

| Col | Symbol in code | Meaning |
|-----|----------------|--------|
| B | `mIn` | Inflow multiplier |
| C | `mRet` | Retention multiplier |
| D | `mExit` | Exit multiplier |
| E | `mParent` | Parent labor-force multiplier |
| F | `mPol` | Policy-cost multiplier (fiscal side) |
| G | `addPop` | Adder to total population decline rate |
| H | `addWork` | Adder to working-age decline rate |
| I | `addOld` | Adder to old-age growth rate |

**Default interpretation in the packaged workbook:**

- **Baseline:** inflow multiplier `0`, exit multiplier `0` → policy engine would yield **zero** net retained if computed from drivers alone; the **Model** sheet uses a **constant** baseline net-retained column (**F4:F29** = stored value, typically **72**).
- **Moderate / Strong / Stress:** full policy recursion with **net retained** from the engine, scaled by multipliers; **Stress** adds positive **G/H/I** (worse background demographics).

Row-to-scenario mapping in code:

- `drivers[0]` → Baseline (Excel row 4)  
- `drivers[1]` → Moderate (row 5)  
- `drivers[2]` → Strong (row 6)  
- `drivers[3]` → Stress (row 7)  

---

## Model dynamics (replicated formulas)

### Time indexing

- **Model row 4** = year `startYear` (2025), opening stocks = `Inputs!B9:B11`.
- **Model row 29** = year `endYear` (2050).
- Number of transitions: **`endYear - startYear`** (e.g. **25** for 2025→2050).  
  Each iteration advances one year and should match **Model** row `4 + k` → `4 + k + 1`.

### Net retained contributors (policy scenarios)

\[
\text{NR} = (I_\text{imm} + I_\text{ret} + I_\text{grad}) \cdot m_\text{in} \cdot (r_\text{base} \cdot m_\text{ret}) - E_\text{exits} \cdot m_\text{exit}
\]

where \(I_*\), \(r_\text{base}\), \(E_\text{exits}\) come from **Inputs** and \(m_*\) from **Scenario_Drivers**.

**Baseline** in the script: **NR** = constant read from **`Model!F4`** (fallback **72** if missing), **not** the formula above with row-4 multipliers.

### Population and labor (per year, per scenario)

Effective rates (decimals):

- \(\delta_P = \texttt{B12} + G\)  
- \(\delta_W = \texttt{B13} + H\)  
- \(g_O = \texttt{B14} + I\)  

**Baseline** (`policyAddsRetained = false`):

\[
P_{t+1} = P_t (1 - \delta_P),\quad
W_{t+1} = W_t (1 - \delta_W),\quad
O_{t+1} = O_t (1 + g_O)
\]

**Policy scenarios** (`true`):

\[
P_{t+1} = P_t (1 - \delta_P) + \text{NR},\quad
W_{t+1} = W_t (1 - \delta_W) + \text{NR} + B_{26}\cdot m_\text{parent},\quad
O_{t+1} = O_t (1 + g_O)
\]

**Old-age dependency ratio** (each year):

\[
\text{Dep} = O_{t+1} / W_{t+1}
\]

### Stylized “fiscal” index (per year)

Matches the **Model** sheet’s fiscal columns:

**Policy scenarios:**

\[
F_t = \text{NR} \cdot B_{33} + B_{26} \cdot m_\text{parent} \cdot (B_{30}\cdot B_{31}) - B_{32}\cdot m_\text{pol}
\]

**Baseline:**

\[
F_t = \text{NR} \cdot B_{33} - B_{32}\cdot m_\text{pol}
\]

with \(m_\text{pol}\) from **Baseline** scenario row (**Scenario_Drivers** row 4, column F — **0** in default workbook).

**Important:** This is **not** “net fiscal balance”; it is a **large-index scaling** tied to **`B33`**. **Do not** equate it to € government surplus/deficit.

---

## Excel **Model** column map (2050 = row 29)

| Scenario | Pop | Work | Old | Dep | Net ret | Fiscal |
|----------|-----|------|-----|-----|---------|--------|
| Baseline | B | C | D | E | F | G |
| Moderate | H | I | J | K | L | M |
| Strong | N | O | P | Q | R | S |
| Stress | T | U | V | W | X | Y |

The script compares its final-year state to these cells for validation.

---

## Requirements

- **Node.js** (ES modules; tested with modern Node, e.g. v18+).
- **`unzip`** on `PATH` (standard on macOS/Linux; used to extract `.xlsx`).

No `npm install` is required.

---

## How to run

From the repository root:

```bash
node scripts/lithuania_model_sim.mjs
```

Uses every default path that exists:

- `final_lithuania_model (1).xlsx`
- `final_lithuania_model (2).xlsx`

Or pass explicit workbooks:

```bash
node scripts/lithuania_model_sim.mjs path/to/model_a.xlsx path/to/model_b.xlsx
```

### Outputs

1. **Stdout:** human-readable benchmark for each file (SHA-256, inputs summary, scenario drivers, 2050 comparison, averages).  
2. **`lithuania_fiscal_benchmark_report.txt`:** same content **concatenated** for all processed files (overwritten each run).  
3. **Stderr:** path to the written report file.

---

## Validation behavior

For each scenario, the script compares **simulated 2050** to **cached Excel values** in **Model row 29** for `pop`, `work`, `old`, `dep`, `netRet`, `fiscal`.

- **Relative tolerance:** about **1e-5** for numeric fields.  
- **Baseline fiscal:** Excel often stores **`G29 = 0`** while the **formula** is `F*B33 - B32*F4`. The script follows the **formula**, so the report flags **`[mismatch]`** for baseline fiscal when the cache is zero. **Moderate / Strong / Stress** fiscal values matched the cached workbook in testing.

---

## Known quirks and design choices

1. **Baseline net retained:** The workbook **Model** column **F** has **no formula** in the extracted XML — only a **constant** (e.g. **72**). The script reads **`Model!F4`** for that constant. This is **not** the same as setting inflow multiplier to zero in the policy engine (which would give **NR = 0**).
2. **Baseline population path:** Baseline **does not** add **NR** to population or working-age stocks (matches Excel **B/C** columns for the Baseline block).
3. **Duplicate workbooks:** If two `.xlsx` files are **byte-identical**, SHA-256 matches and the report prints twice; useful once you maintain **version A / B** with different inputs.
4. **Inputs `B34`:** “Net benefit per contributor” is **for narrative / extended analysis**; the replicated fiscal column uses **`B33`**, not **`B34`**.

---

## External reference

- **EC 2024 Ageing Report — Lithuania (country fiche, PDF):**  
  [download link](https://economy-finance.ec.europa.eu/document/download/b8767642-877c-4605-ad16-8b4b174e1f05_en?filename=2024-ageing-report-country-fiche-Lithuania.pdf)  

Use this for **official** long-term fiscal and demographic **context**. The workbook’s **2050 population** and **dependency** anchors are styled to align with that **Eurostat / EC** framing (see **Inputs** and **Notes** in the workbook).

---

## Related documentation

- **`Q_AND_A_Answer_Doc.md`** — Judge Q&A, slide alignment, and headline numbers (e.g. Strong vs **~100k** population lift).  
- **`lithuania_fiscal_benchmark_report.txt`** — Latest machine-generated numbers (regenerate after any workbook edit).

---

## Maintenance checklist

After editing the Excel model:

1. Run `node scripts/lithuania_model_sim.mjs`.  
2. Confirm all scenarios show **`[OK]`** except known **baseline fiscal** cache issue.  
3. Copy refreshed sections into **`Q_AND_A_Answer_Doc.md`** if you keep a static snapshot there.  
4. If sheet order or column layout changes, update **`lithuania_model_sim.mjs`** (`readSheetCells` indices, `readExcelBenchmark` column letters, and this README).

---

## License / attribution

Euro Challenge team materials; workbook logic attributed to the team’s **final_lithuania_model** specification. Script is a **faithful mechanical replication** for benchmarking and CI-style checks.

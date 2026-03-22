# Lithuania Retention Pipeline — Scenario Benchmark Model

This repository is a demographic scenario model for Lithuania and **automation script** that re-runs the arithmetic and checks it against spreadsheet (verify OpenAI data).

**Two Groups**:

1. **EU-facing financial and policy analysts** — start with [Executive summary](#executive-summary-for-policy-and-finance-readers) and [How to interpret outputs](#how-to-interpret-the-outputs-eu-fiscal-analyst-lens).
2. **Engineers and data people** — see [Technical implementation](#technical-implementation-for-cs--data-staff).

**Official long-term context (European Commission):** 
[2024 Ageing Report — Lithuania country fiche (PDF)](https://economy-finance.ec.europa.eu/document/download/b8767642-877c-4605-ad16-8b4b174e1f05_en?filename=2024-ageing-report-country-fiche-Lithuania.pdf) (this is where everything is based from)

---

## Executive summary (for policy and finance readers)

### What question does this model answer?

It does **not** produce a macro forecast or a general government balance. It asks a narrower **“what-if”** question:

> *Starting from a Eurostat-style demographic path for Lithuania, if the country **retains** an additional flow of young working-age contributors each year (immigrants, returnees, priority-sector graduates, net of exits), **how much does 2050 total population, working-age population, and the old-age dependency ratio move** compared with a **no-extra-retention baseline**?*

That is useful for **storylines** about **labour supply**, **future tax base**, and **age-related spending pressure**, in line with how the **2024 Ageing Report** frames long-term challenges — but it is **not** a replacement for the Commission’s own fiscal projections.

### Why it matters in the euro area

Lithuania uses the **euro**. That limits **external adjustment through the exchange rate**. Over the long run, **demographic structure** (workers vs older dependents) feeds into **pension, health, and care** spending intensity. This model highlights **dependency ratios** and **population paths** under **alternative retention assumptions**, which speak to **fiscal sustainability narratives** without claiming to reproduce **EDP/SGP** aggregates.

### What you should **not** use this model for

| Misuse | Why |
|--------|-----|
| Predicting exact **pension spending % GDP** in 2050 | Use **EC ageing report** tables; this workbook does not model pension rules or revenue. |
| **General government net lending** | The workbook **“fiscal” column** is a **stylised index**, not cash government accounts. |
| **EU fund absorption** (AMIF, ERDF, ESF+) | Financing slides are **separate**; they are not fed through this spreadsheet as programme ledgers. |

### Where the numbers live after a run

Run the script (or open Excel) and read **`lithuania_fiscal_benchmark_report.txt`** for a text summary, or **`Q_AND_A_Answer_Doc.md`** for presentation-aligned Q&A.

---

## How to interpret the outputs (EU fiscal analyst lens)

### Core stock variables (end-2050, or any year in the grid)

| Variable | Definition in this model | Typical use in debate |
|----------|-------------------------|------------------------|
| **Total population** | Headcount track including policy-driven additions in scenario columns | Size of economy / domestic market (crude); not GDP. |
| **Working-age population** | People in the **working-age** bracket as defined in the workbook | Proxy for **labour supply** and **tax base** potential. |
| **Old-age population** | Older bracket as defined in the workbook | Proxy for **age-related spending** pressure (with country-specific rules elsewhere). |
| **Old-age dependency ratio** | **Old-age population ÷ working-age population** | Standard **demographic pressure** indicator; higher means fewer workers per older person. |
| **Net retained contributors / year** | Policy “engine”: helped inflows × retention, minus exits (see formulas below) | **Throughput** of the retention story; comparable across scenarios. |

### The four scenarios (plain language)

| Scenario | Intuition |
|----------|-----------|
| **Baseline** | **No policy uplift** to population/working-age from the retention engine (demographic decay only, as calibrated). The spreadsheet still carries a **small constant** in the “net retained” column for the baseline block — a **modelling artefact**; see [Known quirks](#known-quirks-and-modelling-artefacts). |
| **Moderate** | **Central** implementation: policy inflows, retention, exits, and parent effect at “1×” multipliers. |
| **Strong** | **Upside**: higher assisted inflows, better retention, lower effective exits, stronger parent labour-force scaling. |
| **Stress** | **Downside**: weaker inflows/retention, higher exits, slightly **harsher** background demographic adjustments (extra decline / old-age growth adders). |

### The “fiscal” column — read this carefully

In Excel **Model**, each scenario block has a **fiscal** column. It is **not** “surplus or deficit”. It is a **stylised scalar** built from:

- **Net retained contributors** × a large **annual policy budget line** (Inputs **B33**, e.g. €60 million in the packaged file), **plus**
- A **parent** term: parents kept in labour force × wage × tax/SSC rate, **minus**
- **Public service cost per added resident** × a **policy-cost multiplier**.

So it moves **monotonically** with retention in a **toy accounting** sense. **Do not** map it 1:1 to **government accounts** or **ageing report** spending paths without a separate macro bridge.

**Important:** Inputs **B34** (“net annual fiscal benefit per retained contributor”) is **documented for narrative** but is **not** the driver of this fiscal column in the replicated Excel logic (the column uses **B33**).

---

## Model logic in plain formulas (renders in any Markdown viewer)

*Below, all formulas are in **monospace blocks** so they display correctly in Cursor, VS Code, GitHub, and PDF exports. Symbols like `×` mean multiply.*

### 1) Net retained contributors per year (Moderate / Strong / Stress)

```
NetRet = (Immigrants + Returnees + Graduates) × m_inflow × (BaseRetention × m_retention)
         − Exits × m_exit
```

- **Immigrants, Returnees, Graduates, BaseRetention, Exits** come from the **Inputs** sheet (e.g. B21–B25).
- **m_inflow, m_retention, m_exit** come from the scenario row on **Scenario_Drivers**.

### 2) Baseline net retained (as implemented in the workbook)

The **Baseline** block does **not** use formula (1) with the baseline multipliers. The Excel file stores a **constant** in column **F** (read from **Model!F4**, often **72**). The replication script uses that same constant.

### 3) Effective demographic rates each year

```
effective_pop_decline   = B12_pop_decline   + add_pop_decline    (column G)
effective_work_decline  = B13_work_decline  + add_work_decline   (column H)
effective_old_growth    = B14_old_growth    + add_old_growth     (column I)
```

`B12`, `B13`, `B14` are decimals (e.g. 0.0086 ≈ 0.86% per year). **Stress** adds positive **G/H/I** “adders” on top.

### 4) Next year — total population, working-age, old-age

**Baseline** (no policy addition to population / working-age from retention):

```
P_next = P_now × (1 − effective_pop_decline)
W_next = W_now × (1 − effective_work_decline)
O_next = O_now × (1 + effective_old_growth)
```

**Policy scenarios** (Moderate, Strong, Stress):

```
P_next = P_now × (1 − effective_pop_decline) + NetRet
W_next = W_now × (1 − effective_work_decline) + NetRet + (Parents × m_parent)
O_next = O_now × (1 + effective_old_growth)
```

- **Parents** = Inputs **B26** (additional parents kept in labour force).
- **m_parent** = Scenario_Drivers column **E**.

### 5) Old-age dependency ratio

```
DependencyRatio = Old_age_next / Working_age_next
```

### 6) Stylised fiscal index (per year)

**Policy scenarios:**

```
FiscalIndex = NetRet × PolicyBudget
              + Parents × m_parent × (Wage × TaxAndSSC_rate)
              − PublicServiceCostPerResident × m_policy_cost
```

**Baseline:**

```
FiscalIndex = NetRet × PolicyBudget − PublicServiceCostPerResident × m_policy_cost
```

- **PolicyBudget** = Inputs **B33**. **Wage** = **B30**. **TaxAndSSC_rate** = **B31**. **PublicServiceCostPerResident** = **B32**.
- **m_policy_cost** = Scenario_Drivers column **F** (for Baseline, typically **0**).

### 7) Time horizon

```
number_of_years = EndYear − StartYear          (e.g. 2050 − 2025 = 25 steps)
```

Each step advances one row in the **Model** sheet (row 4 → row 29 for 2025 → 2050 in the packaged workbook).

---

## Repository layout

| Path | Purpose |
|------|--------|
| `final_lithuania_model (1).xlsx`, `(2).xlsx` | Master workbook(s); default inputs for the script if present. |
| `final_lithuania_model.xlsx - Inputs.csv` | Optional flat extract of labels/values (not a full workbook). |
| `scripts/lithuania_model_sim.mjs` | Replication + validation vs Excel **Model** row 29. |
| `lithuania_fiscal_benchmark_report.txt` | **Generated** benchmark text (overwritten each run). |
| `Q_AND_A_Answer_Doc.md` | Deck-aligned Q&A and headline numbers. |
| `README.md` | This reference. |

---

## Workbook structure (expected sheets)

| Order | Sheet | Role |
|------:|-------|------|
| 1 | **Inputs** | Stocks, decay rates, policy headcounts, fiscal parameters, anchors. |
| 2 | **Scenario_Drivers** | Four rows (Excel rows 4–7): multipliers **B–I**. |
| 3 | **Model** | Annual grid; **B–G** Baseline, **H–M** Moderate, **N–S** Strong, **T–Y** Stress. |
| 4 | **Summary** | Dashboard. |
| 5 | **Notes** | Narrative. |

If sheet order changes, the script’s sheet indices must be updated.

---

## Inputs sheet — cells read by the script (column B)

| Cell | Content |
|------|--------|
| B7, B8 | Start year, end year |
| B9–B11 | Starting total pop, working-age, old-age |
| B12–B14 | Baseline decay/growth rates (decimals) |
| B17–B18 | Reference 2050 population and dependency anchor |
| B21–B26 | Policy flows (immigrants, returnees, grads, retention, exits, parents) |
| B30–B34 | Wage, tax/SSC rate, service cost, policy budget line, net benefit (B34 not used in fiscal column replication) |

---

## Scenario_Drivers (rows 4–7)

| Excel column | Role |
|--------------|------|
| B | Inflow multiplier |
| C | Retention multiplier |
| D | Exit multiplier |
| E | Parent labour-force multiplier |
| F | Policy-cost multiplier (fiscal side) |
| G | Adder to total pop decline rate |
| H | Adder to working-age decline rate |
| I | Adder to old-age growth rate |

Code mapping: row 4 → Baseline, 5 → Moderate, 6 → Strong, 7 → Stress.

---

## Model sheet — where 2050 lives

2050 corresponds to **row 29** in the packaged **Model** sheet.

| Scenario | Pop | Work | Old | Dep | Net ret | Fiscal |
|----------|-----|------|-----|-----|---------|--------|
| Baseline | B | C | D | E | F | G |
| Moderate | H | I | J | K | L | M |
| Strong | N | O | P | Q | R | S |
| Stress | T | U | V | W | X | Y |

---

## Technical implementation (for CS / data staff)

### Stack

- **Node.js** (ES modules). **No `npm install`.**
- **`unzip`** on the PATH: `.xlsx` files are ZIP archives; the script unpacks **OOXML** and parses **XML** directly (no `openpyxl` / `xlsx` npm dependency).

### What the script does

1. Unzip workbook → read `xl/sharedStrings.xml` + `xl/worksheets/sheet1.xml` (Inputs), `sheet2.xml` (Scenario_Drivers), `sheet3.xml` (Model).
2. Parse cells into a `Map` keyed by **A1** notation.
3. Run the same recursion as documented in [Model logic](#model-logic-in-plain-formulas-renders-in-any-markdown-viewer).
4. Compare simulated **2050** to **cached** values in **Model row 29** (validation).
5. Print report to **stdout** and write **`lithuania_fiscal_benchmark_report.txt`**.
6. Emit **SHA-256** of each workbook (useful when comparing two “versions”).

### Run commands

```bash
node scripts/lithuania_model_sim.mjs
```

```bash
node scripts/lithuania_model_sim.mjs path/to/model_a.xlsx path/to/model_b.xlsx
```

Default paths (if files exist): `final_lithuania_model (1).xlsx`, `final_lithuania_model (2).xlsx` in the repo root.

### Validation rules

- Numeric comparison uses a small **relative tolerance** (~1e-5) for most fields.
- **Baseline fiscal:** Excel sometimes stores **G29 = 0** while the cell **formula** is `F × B33 − B32 × F_driver`. The script follows the **formula**, so you may see **`[mismatch]`** vs a stale **zero** cache. Policy scenarios **Moderate / Strong / Stress** matched cached values in testing.

### Code entry points

| Function / area | File | Role |
|-----------------|------|------|
| `loadWorkbook`, `readInputs`, `readDrivers` | `scripts/lithuania_model_sim.mjs` | Parse workbook |
| `simulateScenario` | same | Year loop |
| `readExcelBenchmark` | same | Pull row 29 for diff |
| `buildReport` | same | Text report |

### Maintenance after Excel changes

1. Run `node scripts/lithuania_model_sim.mjs`.
2. Fix any systematic `[Δ …%]` lines (logic or cell map drift).
3. Update **`Q_AND_A_Answer_Doc.md`** if you keep static numbers there.
4. If **sheet order** or **column layout** changes, update `readSheetCells(..., sheetNum)` and `readExcelBenchmark` column letters.

---

## Known quirks and modelling artefacts

1. **Baseline column F** is a **hard-coded series** in the workbook (no formula in the extracted XML), not the output of the inflow×retention engine with baseline multipliers.
2. **Baseline** does **not** add **NetRet** into **P** or **W** (only demographic decay).
3. **B34** is not used in the replicated **fiscal** column; **B33** is.
4. Identical **.xlsx** byte copies produce **identical** SHA-256 and duplicate report sections until inputs diverge.

---

## Related documents

- **`Q_AND_A_Answer_Doc.md`** — oral-exam style Q&A tied to the team deck.
- **`lithuania_fiscal_benchmark_report.txt`** — latest run output.

---

## Licence / attribution

Euro Challenge team materials. The script is a **mechanical replication** of the team **final_lithuania_model** workbook for benchmarking and reproducibility.

---

### Note on mathematical notation in Markdown

This README avoids **LaTeX** delimiters (`\[ … \]`, `\frac{}`) because many Markdown previews **do not render** them. All equations are in **fenced code blocks** or **inline prose** so they stay readable in **Cursor, VS Code, GitHub, and printed PDFs**. If you paste into a LaTeX paper, translate the code blocks into your preferred notation.

# Euro Challenge 2026 — Lithuania: Q&A Answer Document

**Purpose:** Back up live Q&A with **numbers from the team’s scenario workbook**, **fiscal framing** from the presentation, and **official EC ageing context**. This is **not** a forecast; it is a **benchmarked scenario model** (same logic as `final_lithuania_model` + `scripts/lithuania_model_sim.mjs`).

**External anchor (EC):** [2024 Ageing Report — Lithuania country fiche (PDF)](https://economy-finance.ec.europa.eu/document/download/b8767642-877c-4605-ad16-8b4b174e1f05_en?filename=2024-ageing-report-country-fiche-Lithuania.pdf)

---

## Speaker quick map (fill names as needed)

| Role   | Slide focus (from script) |
|--------|---------------------------|
| Ethan  | 1, 4, 11, 15; intro/conclusion; financing overview |
| Bener  | 2, 3, 6; country facts; population problem; KPIs |
| Mahati | 7, 8, 10, 14; pipeline; modeled impact; competitiveness |
| Andy   | 5, 9, 12; fiscal pressure; graduates; returnees |

---

## Slide-by-slide: facts, model hooks, and Q&A bullets

### Slide 1 — Title (Ethan)

- **Q: What are you actually arguing today?**  
  - **A:** Lithuania’s demographic shift is structural; we start from **people**, then show how retention policy can **bend the 2050 trajectory** relative to an official-style baseline — and why that matters fiscally in the euro area.

---

### Slide 2 — General information (Bener)

- **Q: Why Lithuania specifically?**  
  - **A:** Small open economy, euro member, strong niche sectors — but **demographic headwinds** constrain labor supply and long-run fiscal room. (Use deck stats: ~&lt;3M people, GDP figures from slide.)

---

### Slide 3 — Population problem (Bener)

- **Q: Your slide says ~2.2M by 2050; the model uses ~2.33M baseline. Which is right?**  
  - **A:** Different **sources and definitions**. Expert commentary often rounds or uses another projection. **Our workbook baseline** pins **2050 population to ~2.329M** to align with an **EC/Eurostat-style path** (see Inputs + EC fiche). In Q&A: *we chose an explicit official-style anchor so the scenario is reproducible; the directional story is the same — sharp decline.*

---

### Slide 4 — Demographic shock (Ethan)

- **Q: What metric captures “pressure” beyond population size?**  
  - **A:** **Old-age dependency ratio** — in the model, **old-age population ÷ working-age population** each year. Baseline **2050** in the workbook lands at **~0.58** (i.e. **~58%**), meaning fewer workers per older person.

---

### Slide 5 — Demographic → fiscal (Andy)

- **Q: Why is this a fiscal issue in the eurozone?**  
  - **A:** Age-related spending rises with dependency; **“doing nothing” is not neutral**. Lithuania cannot rely on **devaluation**; adjustment must come through **real channels** — labor supply, productivity, **targeted fiscal/investment choices** (aligned with script: pensions/health/LTC pressures; ECB/euro constraint).

- **Q: Does your spreadsheet prove pension spending?**  
  - **A:** No. The workbook is a **stylized demographic + retention benchmark**. EC ageing reports provide **aggregate spending-to-GDP** context; our model shows **how retaining workers shifts dependency** — the **mechanism** that eases long-run pressure on the same budget lines.

---

### Slide 6 — Solutions overview / KPIs (Bener)

- **Q: What is the single KPI?**  
  - **A:** **Net retained contributors per year** (immigrants + returnees + priority-sector graduates the policy helps, × retention, minus exits), plus a **small parent labor-force module** in the workbook.

- **Q: What does the model assume for “success” numerically?**  
  - **A (from calibrated run):**  

  | Scenario   | Avg net retained / yr | 2050 population | vs baseline pop | 2050 dependency ratio (old/work) |
  |------------|----------------------:|----------------:|----------------:|---------------------------------:|
  | Baseline   | 72*                  | **2,329,000**   | —               | **~0.58** (~58%)                 |
  | Moderate   | **2,770**            | **~2,391,556**  | **~+62,600**    | **~0.55** (~55%)                 |
  | Strong     | **~4,340**           | **~2,427,023**  | **~+98,000**    | **~0.53** (~53%)                 |
  | Stress     | **~847**             | **~2,233,033**  | **~-96,000**    | **~0.60** (~60%)                 |

  \*Baseline **F** column is a **constant 72** in the workbook (not the full policy engine); baseline path is still the **no extra policy inflow** demographic track.

- **Q: Slide says “raise 2050 population by 0.10–0.15M” and “4,000–7,000 net retained”; does the model hit that?**  
  - **A:** **Strong** is closest to the **~100k** population lift (**~98k** vs baseline) and **~4.3k** net retained/year. **Moderate** is **~63k** people and **~2.8k**/yr — credible “implementation risk” band. **Stress** shows **weaker execution + harsher background** (lower inflows, higher exits, worse demographic adders).

- **Q: “5–7 percentage points” lower dependency?**  
  - **A:** In **this** calibration, **Strong** improves dependency by about **5 percentage points** vs baseline (58% → 53%). **Moderate** is about **3 points**. Treat **7** as an **upper aspirational bound** unless you recalibrate inputs upward.

---

### Slides 7–8 — Retention pipeline (Mahati)

- **Q: Where does the model encode “three levels”?**  
  - **A:** Conceptually in the **policy narrative**; numerically the workbook collapses them into **one headcount engine** (inflows, retention, exits, parents) **scaled** by **Moderate / Strong / Stress** multipliers on the **Scenario_Drivers** sheet.

---

### Slide 9 — Graduate retention (Andy)

- **Q: Is the bonded-graduate idea in the Excel?**  
  - **A:** Not line-by-line. The model counts **“priority-sector graduates retained by policy”** as part of the **engine**. Use the slide for **legal/funding design**; use the model for **orders of magnitude** on retention.

---

### Slide 10 — Modeled demographic impact (Mahati / Ethan)

- **Q: Is this a forecast?**  
  - **A:** **No.** It is a **scenario benchmark**: *if* net retained contributors are **X** per year under **Y** implementation quality, *then* 2050 **population** and **dependency** move **this direction* relative to baseline.

- **Q: What exactly moves in the graphs?**  
  - **A:** **Population path:** baseline EC-style decline; policy scenarios add **net retained** people to **total** and **working-age** each year (baseline block does **not** add policy inflows to population — by workbook design). **Dependency path:** **old ÷ working-age**; more workers **lower** the ratio **if** old-age path is unchanged (Stress slightly **raises** old-age growth via adders — see below).

- **Q: What is “Stress”?**  
  - **A:** **Weaker** inflow/retention/parent multipliers, **higher** exits, **slightly worse** demographic adders (extra pop/work decline, old-age growth). It is a **downside QA** case, not a prediction.

---

### Slide 11 — Financing (Ethan)

- **Q: How does this connect to the spreadsheet “fiscal” column?**  
  - **A:** The workbook includes a **stylized fiscal index**: essentially **scales net retained flow by a large annual budget line (€60M in Inputs)** plus a **parent × wage × tax** term minus a **public-service cost × policy-cost multiplier**. It is **not** general-government balance or AMIF/ERDF/ESF+ cash flow. Use **Slide 11** for **real financing**; use the model fiscal column only to say **“directionally, stronger retention associates with a higher index in this toy fiscal mapping.”**

- **Q: Numbers from the run (illustrative only)?**  
  - Moderate avg index **~1.66×10¹¹**, Strong **~2.60×10¹¹**, Stress **~5.08×10¹⁰** (same order as Excel cache). **Baseline** formula gives **72 × €60M** per year; Excel **cached 0** in one cell — **do not cite baseline fiscal without that caveat.**

---

### Slide 12 — Returnees (Andy)

- **Q: Are the 1.3M diaspora in the model?**  
  - **A:** Not as a stock. The engine includes **“returning Lithuanians 18–34 helped by policy”** as an **annual flow** input (with scenario multipliers). Tie the **big pool** (slide) to the **small annual retained flow** (model) explicitly: *the model tests plausible orders of magnitude, not the full diaspora.*

---

### Slide 14 — Why Lithuania can compete (Mahati)

- **Q: Does the model use wage competition?**  
  - **A:** It uses a **fixed average wage** for a **fiscal side calculation**, not a labor-market equilibrium. **Non-wage cost / friction** arguments stay on the **economics slide**, not inside the demographic recursion.

---

### Slide 15 — Conclusion (Ethan)

- **Q: One sentence takeaway with numbers?**  
  - **A:** Under **Strong** assumptions, **~4.3k net retained contributors/year** compound to about **~98k more people by 2050** and roughly **5 percentage points** lower **old-age dependency** than baseline — **Stress** goes the other way. **Small additions compound**; **retention matters as much as arrival.**

- **Q: “MODELS PROJECT — RAISE POP 2050 by 100,000”**  
  - **A:** In the current workbook, that headline matches the **Strong** scenario **(~98k)** vs **Baseline** **2.329M**, not **Moderate** (~63k). Pick **one** headline scenario for the deck and stay consistent.

---

## Fiscal analysis (aligned with presentation)

1. **Structural imbalance**  
   Fewer workers supporting more older residents → **pressure on pensions, health, care** (EC ageing report for **levels**; our model for **dependency ratio** trajectory).

2. **Euro constraint**  
   No exchange-rate valve → **supply-side and targeted policies** dominate (matches Andy/Ethan narrative).

3. **What the model proves vs does not prove**  
   - **Proves:** With fixed EC-style baseline decay, **plausible annual retention flows** materially change **2050 population** and **dependency** across **Moderate / Strong / Stress**.  
   - **Does not prove:** Exact **€** impact on pension spending, AMIF utilization, or GDP — those need **macro/fiscal modules** beyond this workbook.

4. **Co-financing story (Slide 11) stays primary**  
   **AMIF / ERDF / ESF+** explain **how to pay**; the model explains **why retention is worth targeting** in **fiscal–demographic space**.

5. **Talking-point guardrail**  
   When judges ask **“where do euros come from?”** → **Slide 11**. When they ask **“how do you know it matters?”** → **dependency + population table** above + **“scenario not forecast.”**

---

## Model assumptions (short list for judges)

- **Horizon:** 2025–2050 (**25** year-to-year steps; aligns with Model rows 4–29).  
- **Start stocks:** population **2.89M**, working-age **1.75M**, old-age **560k**.  
- **Baseline decay rates (calibrated in Inputs):** total pop **~0.86%/yr**, working-age **~1.25%/yr**, old-age growth **~1.12%/yr**.  
- **Policy engine (annual, before scenario scaling):** e.g. **3,500** immigrants + **1,000** returnees + **600** grads helped; **70%** retention; **800** exits; **450** parents (see Inputs sheet).  
- **Inputs fiscal fields:** e.g. **€28k** wage, **35%** tax+SSC, **€6k** public-service cost per added resident, **€60M** national policy cost line, **€3,800** net benefit per contributor (B34 is **not** what the Excel fiscal column multiplies — cite carefully).

---

## Full benchmark output (single workbook — `workbooks/final_lithuania_model (1).xlsx`)

```
Lithuania retention pipeline — multiscenario benchmark (replicated from workbook formulas)
========================================================================
Workbook: workbooks/final_lithuania_model (1).xlsx
SHA-256: f83e5b1f678dc0a54643b4f509293caf247710ca5f060dece1ec5fdf5e4ef175
EC 2024 Ageing Report — Lithuania (context PDF): https://economy-finance.ec.europa.eu/document/download/b8767642-877c-4605-ad16-8b4b174e1f05_en?filename=2024-ageing-report-country-fiche-Lithuania.pdf

Inputs (summary)
  Horizon: 2025–2050 (25 transitions; Model rows 4–29)
  Start stocks: pop 2,890,000, work 1,750,000, old 560,000
  Baseline decline rates (calibrated): pop 0.860% / yr, work 1.251%, old-age growth 1.116%
  EC-style anchors in Inputs: 2050 pop 2,329,000, dependency 0.579
  Policy headcount engine: immigrants 3500, returnees 1000, grads 600, retention 0.7, exits 800
  Baseline net-retained constant (from Model!F4, workbook): 72
  Fiscal scalars: policy budget €60,000,000, net benefit / contributor (Inputs) €3,800 — fiscal column uses budget line like Excel, not B34.

Scenario drivers (Inflow, Retention, Exit, Parent, Policy-cost, adders G–I)
  Baseline: in 0, ret 1, ex 0, par 0, pol 0 | +popDecl 0, +workDecl 0, +oldGr 0
  Moderate: in 1, ret 1, ex 1, par 1, pol 1 | +popDecl 0, +workDecl 0, +oldGr 0
  Strong: in 1.35, ret 1.05, ex 0.9, par 1.2, pol 1.1 | +popDecl 0, +workDecl 0, +oldGr 0
  Stress: in 0.55, ret 0.9, ex 1.15, par 0.6, pol 0.9 | +popDecl 0.002, +workDecl 0.0015, +oldGr 0.0005

2050 outcomes — simulation vs Excel cached Model row 29
------------------------------------------------------------------------

Baseline:
  pop: sim 2,329,000 | xlsx 2,329,000 [OK]
  work: sim 1,277,500 | xlsx 1,277,500 [OK]
  old: sim 739,000 | xlsx 739,000 [OK]
  dep: sim 0.58 | xlsx 0.58 [OK]
  netRet: sim 72 | xlsx 72 [OK]
  fiscal: sim 4.3200e+9 | xlsx 0 [mismatch]
  Avg net retained / yr (sim, 25 yrs): 72
  Avg fiscal index / yr (sim): 4.3200e+9

Moderate:
  pop: sim 2,391,556.34 | xlsx 2,391,556.34 [OK]
  work: sim 1,346,999.03 | xlsx 1,346,999.03 [OK]
  old: sim 739,000 | xlsx 739,000 [OK]
  dep: sim 0.55 | xlsx 0.55 [OK]
  netRet: sim 2,770 | xlsx 2,770 [OK]
  fiscal: sim 1.6620e+11 | xlsx 1.6620e+11 [OK]
  Avg net retained / yr (sim, 25 yrs): 2,770
  Avg fiscal index / yr (sim): 1.6620e+11

Strong:
  pop: sim 2,427,023.19 | xlsx 2,427,023.19 [OK]
  work: sim 1,382,837.98 | xlsx 1,382,837.98 [OK]
  old: sim 739,000 | xlsx 739,000 [OK]
  dep: sim 0.53 | xlsx 0.53 [OK]
  netRet: sim 4,340.47 | xlsx 4,340.48 [OK]
  fiscal: sim 2.6043e+11 | xlsx 2.6043e+11 [OK]
  Avg net retained / yr (sim, 25 yrs): 4,340.48
  Avg fiscal index / yr (sim): 2.6043e+11

Stress:
  pop: sim 2,233,032.84 | xlsx 2,233,032.84 [OK]
  work: sim 1,253,562.11 | xlsx 1,253,562.11 [OK]
  old: sim 748,190 | xlsx 748,190 [OK]
  dep: sim 0.6 | xlsx 0.6 [OK]
  netRet: sim 847.15 | xlsx 847.15 [OK]
  fiscal: sim 5.0832e+10 | xlsx 5.0832e+10 [OK]
  Avg net retained / yr (sim, 25 yrs): 847.15
  Avg fiscal index / yr (sim): 5.0832e+10

========================================================================
Interpretation: benchmark scenario model; policy scenarios add retained contributors to pop/working-age only.
Stress adds higher demographic headwinds via Scenario_Drivers G–I. Fiscal column is stylized (× annual policy budget line).
Note: Baseline fiscal in the workbook often shows cached 0 while formulas imply netRet × policy budget; the script follows the Excel formulas (72 × €60M per year in Baseline).
```

**Regenerate this block:** `node scripts/lithuania_model_sim.mjs` → updates `outputs/lithuania_fiscal_benchmark_report.txt`.

---

## Appendix — Fragment from presentation script (reference)

*Slide 10 closing:* “So the key takeaway is that under conservative assumptions, the policy slows demographic decline in a meaningful way…”

*Slide 15 closing:* “No country is able to fully reverse the demographic decline, but we can reshape its trajectory…”

*Models note:* “RAISE POP 2050 by 100,000” → align verbally with **Strong** scenario (~**98k**) unless inputs are recalibrated.

---

*Document generated to align Q&A with `workbooks/final_lithuania_model*.xlsx` + `outputs/lithuania_fiscal_benchmark_report.txt`. Update numbers after any workbook change.*

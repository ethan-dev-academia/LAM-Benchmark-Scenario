#!/usr/bin/env node
/**
 * Multiscenario fiscal-demographic simulation mirroring final_lithuania_model.xlsx
 * (Inputs, Scenario_Drivers, Model formulas).
 *
 * External anchor (Euro Challenge / EC ageing context):
 * https://economy-finance.ec.europa.eu/document/download/b8767642-877c-4605-ad16-8b4b174e1f05_en?filename=2024-ageing-report-country-fiche-Lithuania.pdf
 *
 * Usage:
 *   node scripts/lithuania_model_sim.mjs [workbook.xlsx ...]
 * Default: workbooks/final_lithuania_model (1|2).xlsx (fallback: repo root).
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const EC_AGEING_LT_PDF =
  "https://economy-finance.ec.europa.eu/document/download/b8767642-877c-4605-ad16-8b4b174e1f05_en?filename=2024-ageing-report-country-fiche-Lithuania.pdf";

const SCENARIO_LABELS = ["Baseline", "Moderate", "Strong", "Stress"];

function sha256File(p) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(p));
  return h.digest("hex");
}

function unzipXlsx(xlsxPath) {
  const tmp = fs.mkdtempSync(path.join("/tmp", "ltmx-"));
  execSync(`unzip -q ${JSON.stringify(xlsxPath)} -d ${JSON.stringify(tmp)}`);
  return tmp;
}

function parseSharedStrings(xml) {
  const texts = [];
  xml.replace(/<si>([\s\S]*?)<\/si>/g, (_, b) => {
    texts.push((b.match(/<t[^>]*>([^<]*)<\/t>/) || [])[1] || "");
    return "";
  });
  return texts;
}

function cellValue(inner, texts) {
  if (inner.includes("<v>")) {
    const v = (inner.match(/<v>([^<]*)<\/v>/) || [])[1];
    if (/t="s"/.test(inner) || /t='s'/.test(inner)) {
      const i = parseInt(v, 10);
      return texts[i] ?? v;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }
  const t = (inner.match(/<t[^>]*>([^<]*)<\/t>/) || [])[1];
  return t || undefined;
}

function readSheetCells(tmp, sheetNum, texts) {
  const xml = fs.readFileSync(path.join(tmp, `xl/worksheets/sheet${sheetNum}.xml`), "utf8");
  const map = new Map();
  for (const m of xml.matchAll(/<c r="([A-Z]+)([0-9]+)"[^>]*>([\s\S]*?)<\/c>/g)) {
    map.set(m[1] + m[2], cellValue(m[3], texts));
  }
  return map;
}

function num(x, fallback = 0) {
  if (x === undefined || x === "") return fallback;
  const n = typeof x === "number" ? x : Number(String(x).replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function readDrivers(cells) {
  const rows = [];
  for (let r = 4; r <= 7; r++) {
    const idx = r - 4;
    const rawName = cells.get(`A${r}`);
    const name =
      typeof rawName === "string" && !/^\d+$/.test(rawName)
        ? rawName
        : SCENARIO_LABELS[idx] ?? `Scenario_${idx}`;
    rows.push({
      name,
      mIn: num(cells.get(`B${r}`)),
      mRet: num(cells.get(`C${r}`)),
      mExit: num(cells.get(`D${r}`)),
      mParent: num(cells.get(`E${r}`)),
      mPol: num(cells.get(`F${r}`)),
      addPop: num(cells.get(`G${r}`)),
      addWork: num(cells.get(`H${r}`)),
      addOld: num(cells.get(`I${r}`)),
    });
  }
  return rows;
}

function readInputs(cells) {
  return {
    startYear: num(cells.get("B7")),
    endYear: num(cells.get("B8")),
    pop0: num(cells.get("B9")),
    work0: num(cells.get("B10")),
    old0: num(cells.get("B11")),
    declinePop: num(cells.get("B12")),
    declineWork: num(cells.get("B13")),
    growthOld: num(cells.get("B14")),
    anchorPop2050: num(cells.get("B17")),
    anchorDep2050: num(cells.get("B18")),
    imm: num(cells.get("B21")),
    ret: num(cells.get("B22")),
    grad: num(cells.get("B23")),
    retention: num(cells.get("B24")),
    exits: num(cells.get("B25")),
    parents: num(cells.get("B26")),
    wage: num(cells.get("B30")),
    taxRate: num(cells.get("B31")),
    svcPerRes: num(cells.get("B32")),
    policyBudget: num(cells.get("B33")),
    netBenPerRet: num(cells.get("B34")),
  };
}

function netRetained(inp, d) {
  const sum = inp.imm + inp.ret + inp.grad;
  return sum * d.mIn * (inp.retention * d.mRet) - inp.exits * d.mExit;
}

/**
 * Excel Model: row 4 = year startYear; row 29 = endYear. Steps = endYear - startYear (25 for 2025→2050).
 * Baseline block: no +net to pop/work; net retained column is constant (from workbook F4).
 * Policy blocks: pop and work get +nr; fiscal uses full formula with parent term.
 */
function simulateScenario(inp, d, policyAddsRetained, baselineNetRetained) {
  const steps = inp.endYear - inp.startYear;
  let pop = inp.pop0;
  let work = inp.work0;
  let old = inp.old0;
  const series = [];

  for (let i = 0; i < steps; i++) {
    const nr = policyAddsRetained ? netRetained(inp, d) : baselineNetRetained;
    const effPopDecl = inp.declinePop + d.addPop;
    const effWorkDecl = inp.declineWork + d.addWork;
    const effOldGrowth = inp.growthOld + d.addOld;

    let popN;
    let workN;
    let oldN;
    if (policyAddsRetained) {
      popN = pop * (1 - effPopDecl) + nr;
      workN = work * (1 - effWorkDecl) + nr + inp.parents * d.mParent;
      oldN = old * (1 + effOldGrowth);
    } else {
      popN = pop * (1 - effPopDecl);
      workN = work * (1 - effWorkDecl);
      oldN = old * (1 + effOldGrowth);
    }

    const dep = workN > 0 ? oldN / workN : NaN;
    let fiscal;
    if (policyAddsRetained) {
      fiscal = nr * inp.policyBudget + inp.parents * d.mParent * (inp.wage * inp.taxRate) - inp.svcPerRes * d.mPol;
    } else {
      fiscal = nr * inp.policyBudget - inp.svcPerRes * d.mPol;
    }

    series.push({ pop: popN, work: workN, old: oldN, dep, netRet: nr, fiscal });
    pop = popN;
    work = workN;
    old = oldN;
  }

  const last = series[series.length - 1];
  const avg = (sel) => series.reduce((s, r) => s + sel(r), 0) / series.length;
  return {
    last2050: { ...last, year: inp.endYear },
    avgNetRet: avg((r) => r.netRet),
    avgFiscal: avg((r) => r.fiscal),
    series,
  };
}

function readExcelBenchmark(modelCells) {
  const row = 29;
  return {
    Baseline: {
      pop: num(modelCells.get(`B${row}`)),
      work: num(modelCells.get(`C${row}`)),
      old: num(modelCells.get(`D${row}`)),
      dep: num(modelCells.get(`E${row}`)),
      netRet: num(modelCells.get(`F${row}`)),
      fiscal: num(modelCells.get(`G${row}`)),
    },
    Moderate: {
      pop: num(modelCells.get(`H${row}`)),
      work: num(modelCells.get(`I${row}`)),
      old: num(modelCells.get(`J${row}`)),
      dep: num(modelCells.get(`K${row}`)),
      netRet: num(modelCells.get(`L${row}`)),
      fiscal: num(modelCells.get(`M${row}`)),
    },
    Strong: {
      pop: num(modelCells.get(`N${row}`)),
      work: num(modelCells.get(`O${row}`)),
      old: num(modelCells.get(`P${row}`)),
      dep: num(modelCells.get(`Q${row}`)),
      netRet: num(modelCells.get(`R${row}`)),
      fiscal: num(modelCells.get(`S${row}`)),
    },
    Stress: {
      pop: num(modelCells.get(`T${row}`)),
      work: num(modelCells.get(`U${row}`)),
      old: num(modelCells.get(`V${row}`)),
      dep: num(modelCells.get(`W${row}`)),
      netRet: num(modelCells.get(`X${row}`)),
      fiscal: num(modelCells.get(`Y${row}`)),
    },
  };
}

function loadWorkbook(xlsxPath) {
  const tmp = unzipXlsx(xlsxPath);
  try {
    const texts = parseSharedStrings(fs.readFileSync(path.join(tmp, "xl/sharedStrings.xml"), "utf8"));
    const inputs = readSheetCells(tmp, 1, texts);
    const driversSheet = readSheetCells(tmp, 2, texts);
    const model = readSheetCells(tmp, 3, texts);
    return { inputs, driversSheet, model, texts };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function runWorkbook(xlsxPath) {
  const { inputs: inc, driversSheet, model } = loadWorkbook(xlsxPath);
  const inp = readInputs(inc);
  const drivers = readDrivers(driversSheet);
  const baselineNr = num(model.get("F4"), 72);

  const scenarios = [
    { key: "Baseline", d: drivers[0], policy: false },
    { key: "Moderate", d: drivers[1], policy: true },
    { key: "Strong", d: drivers[2], policy: true },
    { key: "Stress", d: drivers[3], policy: true },
  ];

  const results = {};
  for (const s of scenarios) {
    results[s.key] = simulateScenario(inp, s.d, s.policy, baselineNr);
  }

  const excel = readExcelBenchmark(model);
  return { xlsxPath, inp, drivers, baselineNr, results, excel };
}

function relDiff(a, b) {
  if (b === 0) return a === 0 ? 0 : NaN;
  return Math.abs(a - b) / Math.abs(b);
}

function formatNum(x) {
  if (typeof x !== "number" || !Number.isFinite(x)) return String(x);
  if (Math.abs(x) >= 1e9) return x.toExponential(4);
  if (Math.abs(x) < 0.01 && x !== 0) return x.toExponential(4);
  return x.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function buildReport(bundle) {
  const lines = [];
  const push = (s) => lines.push(s);

  push("Lithuania retention pipeline — multiscenario benchmark (replicated from workbook formulas)");
  push("=".repeat(72));
  push(`Workbook: ${bundle.xlsxPath}`);
  push(`SHA-256: ${sha256File(bundle.xlsxPath)}`);
  push(`EC 2024 Ageing Report — Lithuania (context PDF): ${EC_AGEING_LT_PDF}`);
  push("");
  push("Inputs (summary)");
  push(`  Horizon: ${bundle.inp.startYear}–${bundle.inp.endYear} (${bundle.inp.endYear - bundle.inp.startYear} transitions; Model rows 4–29)`);
  push(`  Start stocks: pop ${formatNum(bundle.inp.pop0)}, work ${formatNum(bundle.inp.work0)}, old ${formatNum(bundle.inp.old0)}`);
  push(
    `  Baseline decline rates (calibrated): pop ${(bundle.inp.declinePop * 100).toFixed(3)}% / yr, work ${(bundle.inp.declineWork * 100).toFixed(3)}%, old-age growth ${(bundle.inp.growthOld * 100).toFixed(3)}%`
  );
  push(`  EC-style anchors in Inputs: 2050 pop ${formatNum(bundle.inp.anchorPop2050)}, dependency ${bundle.inp.anchorDep2050}`);
  push(`  Policy headcount engine: immigrants ${bundle.inp.imm}, returnees ${bundle.inp.ret}, grads ${bundle.inp.grad}, retention ${bundle.inp.retention}, exits ${bundle.inp.exits}`);
  push(`  Baseline net-retained constant (from Model!F4, workbook): ${bundle.baselineNr}`);
  push(`  Fiscal scalars: policy budget €${formatNum(bundle.inp.policyBudget)}, net benefit / contributor (Inputs) €${formatNum(bundle.inp.netBenPerRet)} — fiscal column uses budget line like Excel, not B34.`);
  push("");

  push("Scenario drivers (Inflow, Retention, Exit, Parent, Policy-cost, adders G–I)");
  for (const d of bundle.drivers) {
    push(
      `  ${d.name}: in ${d.mIn}, ret ${d.mRet}, ex ${d.mExit}, par ${d.mParent}, pol ${d.mPol} | +popDecl ${d.addPop}, +workDecl ${d.addWork}, +oldGr ${d.addOld}`
    );
  }
  push("");

  push("2050 outcomes — simulation vs Excel cached Model row 29");
  push("-".repeat(72));
  const keys = ["pop", "work", "old", "dep", "netRet", "fiscal"];
  for (const sk of ["Baseline", "Moderate", "Strong", "Stress"]) {
    const sim = bundle.results[sk].last2050;
    const ex = bundle.excel[sk];
    push(`\n${sk}:`);
    for (const k of keys) {
      const sv = sim[k];
      const ev = ex[k];
      const rd = relDiff(sv, ev);
      let ok = Number.isFinite(rd) && rd < 1e-5;
      if (!Number.isFinite(rd)) ok = sv === ev;
      if (k === "fiscal" && ev === 0 && sv !== 0) ok = false;
      const flag = ok ? "OK" : Number.isFinite(rd) ? `Δ ${(rd * 100).toFixed(4)}%` : "mismatch";
      push(`  ${k}: sim ${formatNum(sv)} | xlsx ${formatNum(ev)} [${flag}]`);
    }
    push(`  Avg net retained / yr (sim, ${bundle.inp.endYear - bundle.inp.startYear} yrs): ${formatNum(bundle.results[sk].avgNetRet)}`);
    push(`  Avg fiscal index / yr (sim): ${formatNum(bundle.results[sk].avgFiscal)}`);
  }

  push("\n" + "=".repeat(72));
  push("Interpretation: benchmark scenario model; policy scenarios add retained contributors to pop/working-age only.");
  push("Stress adds higher demographic headwinds via Scenario_Drivers G–I. Fiscal column is stylized (× annual policy budget line).");
  push(
    "Note: Baseline fiscal in the workbook often shows cached 0 while formulas imply netRet × policy budget; the script follows the Excel formulas (72 × €60M per year in Baseline)."
  );
  return lines.join("\n");
}

function defaultPaths() {
  const cands = [
    path.join(REPO_ROOT, "workbooks", "final_lithuania_model (1).xlsx"),
    path.join(REPO_ROOT, "workbooks", "final_lithuania_model (2).xlsx"),
    path.join(REPO_ROOT, "final_lithuania_model (1).xlsx"),
    path.join(REPO_ROOT, "final_lithuania_model (2).xlsx"),
  ];
  return cands.filter((p) => fs.existsSync(p));
}

const paths = process.argv.slice(2).length ? process.argv.slice(2) : defaultPaths();
if (!paths.length) {
  console.error(
    "No workbook paths found. Pass .xlsx paths or place workbooks under workbooks/ (or repo root)."
  );
  process.exit(1);
}

const reports = [];
for (const p of paths) {
  const abs = path.resolve(p);
  if (!fs.existsSync(abs)) {
    console.error("Missing file:", abs);
    process.exit(1);
  }
  const bundle = runWorkbook(abs);
  reports.push(buildReport(bundle));
}

const combined = reports.join("\n\n\n");
console.log(combined);

const outDir = path.join(REPO_ROOT, "outputs");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "lithuania_fiscal_benchmark_report.txt");
fs.writeFileSync(outFile, combined + "\n", "utf8");
console.error("\nWrote:", outFile);

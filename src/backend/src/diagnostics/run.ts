import { bootstrapBenchContext, specs } from './config';
import { BenchSpec, BenchCtx } from './bench-types';

type StatSummary = {
  count: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  stdev: number;
};

const ns = process.argv;
const arg = (name: string, def?: string) => {
  const ix = ns.findIndex((x) => x === name || x.startsWith(name + '='));
  if (ix < 0) return def;
  const val = ns[ix].includes('=') ? ns[ix].split('=')[1] : ns[ix + 1];
  return val ?? def;
};

const parseCSV = (s?: string) =>
  s
    ? s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

if (ns.some((arg) => arg === '-h' || arg === '--help')) {
  console.log(`
Backend Benchmarking Tool

USAGE:
  yarn benchmark [OPTIONS]

OPTIONS:
  -h, --help              Show this help message and exit

  --grep <pattern>        Filter benchmarks by name pattern
                          Example: --grep "user" runs only benchmarks with "user" in the name

  --groups <group1,group2>  Run only benchmarks in specified groups (comma-separated)
                          Example: --groups auth,database

  --runs <number>         Number of times to run each benchmark (default: 3)
                          Higher values provide more reliable statistics
                          Example: --runs 10

  --warms <number>      Number of warmup runs before measuring (default: 1)
                          Warmups help stabilize performance by priming caches
                          Example: --warmups 3

  --per-test              Show individual test statistics
                          Example: --per-test

  --print-samples         Print raw sample times for each test
                          Example: --print-samples

  -r, --read              Run only read benchmarks
                          Cannot be used with --write

  -w, --write             Run only write benchmarks
                          Cannot be used with --read

EXAMPLES:
  # Run all benchmarks with default settings
  npm run benchmark

  # Run benchmarks 5 times with 2 warmups
  npm run benchmark --runs 5 --warmups 2

  # Run only database-related benchmarks
  npm run benchmark --groups database

  # Run only read operations for auth group
  npm run benchmark --groups auth --read

  # Filter benchmarks by name and show detailed stats
  npm run benchmark --grep "login" --per-test 1 --runs 10

OUTPUT:
  The tool displays:
  - Progress bar during execution
  - Summary statistics table by group (Total, Avg, P50, P90, P99)
  - Overall suite statistics
  - Optional per-test results (with --per-test)
  - Optional raw samples (with --print-samples)

STATISTICS:
  - Count: Number of samples
  - Total: Sum of all sample times
  - Avg: Mean execution time
  - P50: Median (50th percentile)
  - P90: 90th percentile
  - P99: 99th percentile
`);
  process.exit(0);
}

const GREP = arg('--grep');
const GROUPS = parseCSV(arg('--groups'));
const RUNS = Number(arg('--runs', '3'));
const WARMS = Number(arg('--warms', '1'));
const PER_TEST = ns.some((arg) => arg === '--per-test');
const PRINT_SAMPLES = ns.some((arg) => arg === '--print-samples');
const READ_ONLY = ns.some((arg) => arg === '--read' || arg === '-r');
const WRITE_ONLY = ns.some((arg) => arg === '--write' || arg === 'w');

if (READ_ONLY && WRITE_ONLY) {
  throw new Error('Cannot run benchmarks with both read only (--read) and write only (--write) flags');
}

const computeStats = (samples: number[]): StatSummary => {
  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const min = sorted[0] ?? 0;
  const max = sorted[n - 1] ?? 0;
  const mean = sorted.reduce((a, b) => a + b, 0) / (n || 1);
  const pct = (q: number) => sorted[Math.min(n - 1, Math.max(0, Math.floor(q * (n - 1))))] ?? 0;
  const variance = sorted.reduce((acc, x) => acc + (x - mean) * (x - mean), 0) / (n || 1);
  return {
    count: n,
    min,
    max,
    mean,
    p50: pct(0.5),
    p90: pct(0.9),
    p95: pct(0.95),
    p99: pct(0.99),
    stdev: Math.sqrt(variance)
  };
};

const runSpec = async (spec: BenchSpec<any>, ctx: BenchCtx) => {
  const warmups = spec.warmups ?? WARMS;
  const runs = spec.runs ?? RUNS;

  const prep = await spec.prepare(ctx);
  if ('skip' in prep) return { name: spec.name, tags: spec.tags, skipped: prep.skip } as const;

  // warmup to warm cache
  for (let i = 0; i < warmups; i++) {
    await spec.run(prep.inputs, ctx);
  }

  // measured runs
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    await spec.run(prep.inputs, ctx);
    const t1 = performance.now();
    samples.push(t1 - t0);
  }

  return { name: spec.name, tags: spec.tags, samples } as const;
};

const main = async () => {
  const ctx = await bootstrapBenchContext();

  let selected = specs;
  if (GREP) selected = selected.filter((s) => s.name.includes(GREP));
  if (GROUPS.length) selected = selected.filter((s) => s.tags.some((t) => GROUPS.includes(t)));

  if (selected.length === 0) {
    const allGroups = Array.from(new Set(specs.flatMap((s) => s.tags).filter((t) => t !== 'read' && t !== 'write'))).sort();
    console.log(
      `No benchmarks matched the filters. Use --groups <group> or --grep <name>. Available groups: ${allGroups.join(', ')}`
    );
    return;
  }

  if (READ_ONLY) {
    selected = selected.filter((spec) => spec.tags.some((tag) => tag === 'read'));
  }

  if (WRITE_ONLY) {
    selected = selected.filter((spec) => spec.tags.some((tag) => tag === 'write'));
  }

  const totalTests = selected.length;
  const progressBarLength = 40;
  let testsRan = 0;

  const results: Array<
    { name: string; tags: string[]; skipped: string } | { name: string; tags: string[]; samples: number[] }
  > = [];
  for (const s of selected) {
    // Progress bar
    const percentage = Math.round((testsRan / totalTests) * 100);
    const completed = Math.round((testsRan / totalTests) * progressBarLength);
    const remaining = progressBarLength - completed;

    const progressBar = '█'.repeat(completed) + '░'.repeat(remaining);

    process.stdout.write('\r\x1b[K');
    process.stdout.write(`Progress: [${progressBar}] ${percentage}% (${testsRan}/${totalTests}) Current test: ${s.name}`);
    testsRan++;

    const r = await runSpec(s, ctx);
    results.push(r);
  }
  process.stdout.write('\n✅ Complete!\n');

  const perTest = results.map((r) => {
    if ('skipped' in r) return { name: r.name, tags: r.tags, skipped: r.skipped };
    return { name: r.name, tags: r.tags, stats: computeStats(r.samples) };
  });

  // group aggregates
  const groupToSamples = new Map<string, number[]>();
  for (const r of results) {
    if ('skipped' in r) continue;
    for (const tag of r.tags) {
      const arr = groupToSamples.get(tag) ?? [];
      arr.push(...r.samples);
      groupToSamples.set(tag, arr);
    }
  }

  // whole suite
  const allSamples: number[] = [];
  const allReadSamples: number[] = [];
  const allWriteSamples: number[] = [];
  for (const r of results) {
    if ('skipped' in r) continue;
    allSamples.push(...r.samples);
    if (r.tags.includes('read')) allReadSamples.push(...r.samples);
    if (r.tags.includes('write')) allWriteSamples.push(...r.samples);
  }
  const suite = { stats: allSamples.length ? computeStats(allSamples) : undefined };

  const formatMs = (n: number | undefined) => (n === undefined ? '-' : `${Math.round(n)}ms`);

  // Derive domain groups, treat 'read' and 'write' as sub-groups.
  const domainTags = new Set<string>();
  for (const r of results) {
    if ('skipped' in r) continue;
    for (const t of r.tags) {
      if (t !== 'read' && t !== 'write') domainTags.add(t);
    }
  }

  // table printer
  const printTable = (headers: string[], rows: string[][]) => {
    const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)));
    const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length));
    console.log(headers.map((h, i) => pad(h, widths[i])).join('  '));
    console.log(widths.map((w) => '-'.repeat(w)).join('  '));
    // rows
    for (const row of rows) {
      console.log(row.map((c, i) => pad(c, widths[i])).join('  '));
    }
  };

  type Row = [string, string, string, string, string, string, string, string]; // Domain, Scope, Count, Total, Avg, P50, P95
  const header = ['Group', 'Scope', 'Count', 'Total', 'Avg', 'P50', 'P90', 'P99'];
  const rows: Row[] = [];

  for (const domain of Array.from(domainTags).sort()) {
    const domainSamples: number[] = [];
    const readSamples: number[] = [];
    const writeSamples: number[] = [];

    for (const r of results) {
      if ('skipped' in r) continue;
      if (!r.tags.includes(domain)) continue;
      domainSamples.push(...r.samples);
      if (r.tags.includes('read')) readSamples.push(...r.samples);
      if (r.tags.includes('write')) writeSamples.push(...r.samples);
    }

    if (domainSamples.length && !READ_ONLY && !WRITE_ONLY) {
      const s = computeStats(domainSamples);
      const total = domainSamples.reduce((a, b) => a + b, 0);
      rows.push([
        domain,
        'total',
        String(s.count),
        formatMs(total),
        formatMs(s.mean),
        formatMs(s.p50),
        formatMs(s.p90),
        formatMs(s.p99)
      ]);
    }
    if (readSamples.length) {
      const s = computeStats(readSamples);
      const total = readSamples.reduce((a, b) => a + b, 0);
      rows.push([
        READ_ONLY ? domain : '',
        'read',
        String(s.count),
        formatMs(total),
        formatMs(s.mean),
        formatMs(s.p50),
        formatMs(s.p90),
        formatMs(s.p99)
      ]);
    }
    if (writeSamples.length) {
      const s = computeStats(writeSamples);
      const total = writeSamples.reduce((a, b) => a + b, 0);
      rows.push([
        WRITE_ONLY ? domain : '',
        'write',
        String(s.count),
        formatMs(total),
        formatMs(s.mean),
        formatMs(s.p50),
        formatMs(s.p90),
        formatMs(s.p99)
      ]);
    }
    if (domainSamples.length) {
      rows.push(['', '', '', '', '', '', '', '']);
    }
  }

  if (rows.length) {
    printTable(header, rows);
  }

  console.log(`Warms on each test: ${WARMS}`);
  console.log(`Runs for each test: ${RUNS}`);

  // Print suite stats as a small table, plus read/write aggregates
  if (suite.stats) {
    const total = allSamples.reduce((a, b) => a + b, 0);
    const rows: string[][] = [];

    if (!READ_ONLY && !WRITE_ONLY) {
      rows.push([
        'suite',
        String(suite.stats.count),
        formatMs(total),
        formatMs(suite.stats.mean),
        formatMs(suite.stats.p50),
        formatMs(suite.stats.p95)
      ]);
    }
    if (allReadSamples.length) {
      const s = computeStats(allReadSamples);
      rows.push([
        'read',
        String(s.count),
        formatMs(allReadSamples.reduce((a, b) => a + b, 0)),
        formatMs(s.mean),
        formatMs(s.p50),
        formatMs(s.p95)
      ]);
    }
    if (allWriteSamples.length) {
      const s = computeStats(allWriteSamples);
      rows.push([
        'write',
        String(s.count),
        formatMs(allWriteSamples.reduce((a, b) => a + b, 0)),
        formatMs(s.mean),
        formatMs(s.p50),
        formatMs(s.p95)
      ]);
    }
    console.log('');
    printTable(['Scope', 'Count', 'Total', 'Avg', 'P50', 'P95'], rows);
  }

  if (PER_TEST) {
    const testsWithStats = perTest.filter((t: any) => t.stats);
    for (const t of testsWithStats as Array<{ name: string; tags: string[]; stats: any }>) {
      console.log(`test ${t.name}: count=${t.stats.count} p50=${formatMs(t.stats.p50)} p95=${formatMs(t.stats.p95)}`);
    }
  }

  if (PRINT_SAMPLES) {
    for (const r of results) {
      if ('skipped' in r) continue;
      console.log(`samples ${r.name}: ${r.samples.map((s) => Math.round(s)).join(',')}`);
    }
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

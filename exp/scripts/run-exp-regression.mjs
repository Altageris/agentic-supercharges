const fs = await import('node:fs');
const path = await import('node:path');
const {fileURLToPath} = await import('node:url');
const {formatReport, scoreSuite} = await import('./score-exp-output.mjs');

function resolveDefault(relativePath) {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', relativePath);
}

function usage() {
  return [
    'Usage:',
    '  node run-exp-regression.mjs [outputs.json] [suite.json] [mode]',
    '',
    'Defaults:',
    '  outputs.json -> ../references/historical-test-outputs.json',
    '  suite.json   -> ../references/regression-suite.json',
    '  mode         -> all',
    '',
    'Modes:',
    '  all          score every case',
    '  generation-1 score only generation 1 cases',
    '  generation-2 score only generation 2 cases',
    '  resolved-only score only cases with strict resolved-surface filtering',
    '  quality-only  score only next_surface_quality cases',
  ].join('\n');
}

function filterSuiteByMode(suite, mode) {
  if (!mode || mode === 'all') {
    return suite;
  }

  const cases = Array.isArray(suite.cases) ? suite.cases : [];
  let filteredCases = cases;

  if (mode === 'generation-1') {
    filteredCases = cases.filter((testCase) => (testCase.generation ?? 1) === 1);
  } else if (mode === 'generation-2') {
    filteredCases = cases.filter((testCase) => (testCase.generation ?? 1) === 2);
  } else if (mode === 'resolved-only') {
    filteredCases = cases.filter((testCase) => testCase.strictResolvedSurfaceFilter !== false);
  } else if (mode === 'quality-only') {
    filteredCases = cases.filter((testCase) => testCase.dimension === 'next_surface_quality');
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }

  return {
    ...suite,
    name: `${suite.name || 'exp-regression-suite'}:${mode}`,
    cases: filteredCases,
  };
}

if (typeof process !== 'undefined' && process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    process.stdout.write(`${usage()}\n`);
    process.exit(0);
  }

  const outputsPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : resolveDefault('references/historical-test-outputs.json');
  const suitePath = process.argv[3]
    ? path.resolve(process.argv[3])
    : resolveDefault('references/regression-suite.json');
  const mode = process.argv[4] || 'all';
  try {
    const suite = JSON.parse(fs.readFileSync(suitePath, 'utf8').replace(/^\uFEFF/, ''));
    const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8').replace(/^\uFEFF/, ''));
    const filteredSuite = filterSuiteByMode(suite, mode);
    const results = scoreSuite(filteredSuite, outputs);
    process.stdout.write(`${formatReport(results)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

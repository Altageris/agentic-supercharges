const fs = await import('node:fs');
const path = await import('node:path');
const {fileURLToPath} = await import('node:url');

function readTextFile(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function readJsonFile(filePath) {
  return JSON.parse(readTextFile(filePath));
}

function normalizeText(value) {
  return typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '';
}

function normalizeSurfaceToken(token) {
  return String(token)
    .replace(/^\[[^\]]+\]\((?:\/abs\/path\/)?/, '')
    .replace(/\)$/, '')
    .replace(/\\/g, '/')
    .replace(/:\d+$/, '')
    .toLowerCase()
    .trim();
}

function extractCandidateSurfaces(text) {
  const patterns = [
    /\[[^\]]+\]\((?:\/abs\/path\/)?[A-Z]:[^\s)]+\)/g,
    /[A-Z]:\\[^\s`"'<>|)]+/g,
    /[A-Za-z0-9_.-]+\/[A-Za-z0-9_.\/-]+\.[A-Za-z0-9]+/g,
  ];

  const matches = new Set();
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      matches.add(normalizeSurfaceToken(match[0]));
    }
  }

  const normalized = Array.from(matches).filter(Boolean);
  return normalized.filter((surface, index, items) =>
    !items.some((other, otherIndex) =>
      otherIndex !== index &&
      other.length > surface.length &&
      other.endsWith(surface)));
}

function includesAny(text, values = []) {
  const lowered = text.toLowerCase();
  return values.some((value) => lowered.includes(String(value).toLowerCase()));
}

function countMatches(text, values = []) {
  const lowered = text.toLowerCase();
  return values.filter((value) => lowered.includes(String(value).toLowerCase())).length;
}

function scoreCase(testCase, outputText) {
  const text = normalizeText(outputText);
  const candidateSurfaces = extractCandidateSurfaces(text);
  const candidateSurfaceCount = candidateSurfaces.length;
  const resolvedHits = countMatches(text, testCase.resolvedSurfaces);
  const expectedHits = countMatches(text, testCase.acceptableNextSurfaces);
  const forbiddenHits = countMatches(text, testCase.forbiddenPhrases);
  const lineCount = text ? text.split('\n').length : 0;

  const scores = {
    contractFit: candidateSurfaceCount <= 1 ? 1 : candidateSurfaceCount === 2 ? 0.5 : 0,
    expectedSurface: expectedHits > 0 ? 1 : 0,
    resolvedStateAwareness: resolvedHits === 0 ? 1 : 0,
    compactness: lineCount <= (testCase.maxLines || 8) ? 1 : 0.5,
    forbiddenLanguage: forbiddenHits === 0 ? 1 : 0,
  };

  const strictResolvedSurfaceFilter = testCase.strictResolvedSurfaceFilter !== false;
  const overall = (
    scores.contractFit * 0.20 +
    scores.expectedSurface * 0.25 +
    scores.resolvedStateAwareness * 0.35 +
    scores.compactness * 0.10 +
    scores.forbiddenLanguage * 0.10
  );

  const failReasons = [];
  if (strictResolvedSurfaceFilter && resolvedHits > 0) {
    failReasons.push('resolved_surface_repeat');
  }
  if (candidateSurfaceCount > 1) {
    failReasons.push('multiple_candidate_surfaces');
  }
  if (expectedHits === 0) {
    failReasons.push('missing_expected_surface');
  }

  return {
    id: testCase.id,
    prompt: testCase.prompt,
    outputText: text,
    candidateSurfaces,
    candidateSurfaceCount,
    resolvedHits,
    expectedHits,
    forbiddenHits,
    lineCount,
    scores,
    overall,
    failReasons,
    pass: failReasons.length === 0 && overall >= (testCase.passThreshold ?? 0.85),
  };
}

function scoreSuite(suite, outputMap) {
  return suite.cases.map((testCase) => {
    const outputText = outputMap[testCase.id];
    if (typeof outputText !== 'string' || !outputText.trim()) {
      return {
        id: testCase.id,
        generation: testCase.generation ?? 1,
        prompt: testCase.prompt,
        skipped: true,
        reason: 'missing_output',
      };
    }
    return scoreCase(testCase, outputText);
  });
}

function summarize(results) {
  const scored = results.filter((result) => !result.skipped);
  const total = scored.length;
  const passed = scored.filter((result) => result.pass).length;
  const skipped = results.filter((result) => result.skipped).length;
  const average = total
    ? scored.reduce((sum, result) => sum + result.overall, 0) / total
    : 0;
  return {total, passed, skipped, average};
}

function formatReport(results) {
  const summary = summarize(results);
  const lines = [
    `cases=${results.length}`,
    `scored=${summary.total}`,
    `passed=${summary.passed}`,
    `skipped=${summary.skipped}`,
    `average=${summary.average.toFixed(3)}`,
  ];

  for (const result of results) {
    lines.push('');
    if (result.skipped) {
      lines.push(`[${result.id}] skipped=true generation=${result.generation}`);
      lines.push(`  reason=${result.reason}`);
      continue;
    }
    lines.push(`[${result.id}] pass=${result.pass} overall=${result.overall.toFixed(3)}`);
    lines.push(`  candidate_surface_count=${result.candidateSurfaceCount}`);
    lines.push(`  candidate_surfaces=${result.candidateSurfaces.join(' | ') || '(none)'}`);
    lines.push(`  resolved_hits=${result.resolvedHits}`);
    lines.push(`  expected_hits=${result.expectedHits}`);
    lines.push(`  forbidden_hits=${result.forbiddenHits}`);
    lines.push(`  line_count=${result.lineCount}`);
    lines.push(`  fail_reasons=${result.failReasons.join(',') || '(none)'}`);
    lines.push(
      `  scores contract=${result.scores.contractFit.toFixed(2)} expected=${result.scores.expectedSurface.toFixed(2)} resolved=${result.scores.resolvedStateAwareness.toFixed(2)} compact=${result.scores.compactness.toFixed(2)} forbidden=${result.scores.forbiddenLanguage.toFixed(2)}`,
    );
  }

  return lines.join('\n');
}

function usage() {
  return [
    'Usage:',
    '  node score-exp-output.mjs <suite.json> <outputs.json>',
    '',
    'outputs.json shape:',
    '  {',
    '    "case-id": "raw model output here"',
    '  }',
  ].join('\n');
}

if (typeof process !== 'undefined' && process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const suitePath = process.argv[2];
  const outputsPath = process.argv[3];

  if (!suitePath || !outputsPath) {
    process.stderr.write(`${usage()}\n`);
    process.exit(1);
  }

  const suite = readJsonFile(path.resolve(suitePath));
  const outputs = readJsonFile(path.resolve(outputsPath));
  const results = scoreSuite(suite, outputs);
  process.stdout.write(`${formatReport(results)}\n`);
}

export {formatReport, scoreCase, scoreSuite, summarize};

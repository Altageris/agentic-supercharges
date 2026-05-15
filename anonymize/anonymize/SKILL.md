---
name: anonymize
description: Use when stripping identifying signals from any content — code, documents, submissions, or writing — so that authorship, group identity, or domain origin cannot be determined or inferred
---

# Anonymize

Strip identifying signals from content so that authorship, group membership, or system origin cannot be determined — and is difficult to infer even indirectly.

## When to Use

**Triggers:**
- Removing group identity from a submission so reviewers cannot determine which group produced it
- Stripping authorship signals from writing (style, phrasing, idioms, self-references)
- Publishing code examples or documentation without exposing system internals or domain origin
- Preparing content for blind review, external audit, or public sharing
- Building knowledge-base entries or tutorials from proprietary or internal work
- Any case where even inference of origin should be made difficult

**NOT when:**
- Sharing with authorized parties who need the real context
- Creating internal documentation where real names/paths are required
- The goal is just formatting or style normalization (not identity removal)

## Core Pattern

Three categories of transformation:

| Category | Examples | Replace With | Keep As-Is |
|----------|----------|--------------|-----------|
| **Paths & Files** | `/home/user/project/data/runs`, `results/standards_map.json` | `<data_dir>`, `<config_file>` | Directory structure, nesting logic |
| **Domain Terms** | `standards`, `module`, `sweep`, `category::name` | `<entity>`, `<work_item>`, `<category>::<item>` | Logic structure, variable relationships |
| **Specific Values** | `r2_state.json`, `status: "uploaded"` | `<config_key>`, `<status_value>` | Comparison operators, JSON shape |
| **Identifiers** | Function `discover_modules()` → Domain-specific | `load_work_items()` or `<load_X>` | Generic-applicable names (check, filter, process) |
| **Identity Signals** | Group names, team aliases, self-references ("we built", "our approach"), distinctive phrasing, acknowledgments, repeated stylistic patterns | Remove or rewrite neutrally | Factual claims, technical content |

**Rule:** If a term wouldn't be meaningful to someone outside your domain, redact it. If the logic pattern is universal, keep it.

**Inference resistance:** Direct redaction is not enough when a group has a recognizable style, vocabulary, or structural preference. Also check:
- Self-referential phrases ("in our prior work", "we chose X because") → rewrite as third-person or remove
- Unique formatting choices (unusual indentation conventions, comment style, naming patterns) → normalize to neutral standard
- Acknowledgment sections, repo names, tool chains that fingerprint a team → remove or genericize
- Consistent terminology that only one group uses → replace with a generic synonym throughout

## Implementation

### 1. Identify Redaction Boundaries

Ask: **"Would this need explanation to a general audience?"**
- Absolute paths → Yes, redact
- Domain jargon (standards, modules, sweeps) → Yes, redact
- Generic logic patterns (filtering, dedup, manifest) → No, keep but genericize names
- Status values, config keys → Redact

### 2. Replace with Placeholders and Generic Renames

Two strategies applied together:

**Use `<placeholder>` format for anything proprietary** (paths, config keys, API names, filenames):
```python
# Production
standards_map_path = RESULTS_DIR / "standards_map.json"
manifest["modules"]

# Anonymized
config_path = <data_dir> / "<config_file>"
manifest["<item_collection>"]
```

**Use generic renames for variables and functions** (improve readability while removing domain jargon):
```python
# Production
sm = assemble_latest_map()
for module_key in sm.get("modules"):
    cat, name = module_key.split("::", 1)

# Anonymized
config = load_configuration()
for item_key in config.get("<item_collection>"):
    category, name = item_key.split("::", 1)
```

**Rule:** Placeholders redact system-specific details; generic names make variables universally readable.

### 3. Redact Credential-Fetching Functions (CRITICAL)

Any function that returns API keys, tokens, or secrets must be genericized:

```python
# Production
resp.headers = {"Authorization": f"Bearer {openrouter_key()}"}
token = aws_secret_manager()

# Anonymized
resp.headers = {"Authorization": f"Bearer {<api_credential>()}"}
token = <credential_provider>()
```

**Rule:** If a function name contains or implies credential access (`key()`, `secret()`, `token()`, `password()`), replace the name with `<credential_provider>()` or `<api_credential>()`.

### 4. Preserve Structure & Logic

**Keep intact:**
- Control flow (if/for/while patterns)
- Data structures (lists, dicts, tuples)
- Function signatures and argument relationships
- Error handling logic
- Atomic operations (mutations, writes, reads)
- Helper function names that are generic (`_read()`, `_write()`, `_load()`) — only genericize if they're tightly domain-coupled

**Genericize:**
- Domain-specific function names: `discover_modules()` → `load_work_items()`
- Variable names: `m.category` → `item.category`
- Config keys: Keep key names but show them as placeholders in examples

### 5. Handle Docstrings & Comments

Docstrings leak domain context via jargon and timelines:

```python
# Production
"""Validates whether a learning module aligns with state standards.
Used in the standards sweep since 2026-04-15 refactor."""

# Anonymized
"""Validates whether a work item aligns with requirement standards.
Replaces legacy single-file rollup pattern."""
```

**Rules:**
- Replace domain jargon in docstrings (same replacements as code)
- Remove timeline references (dates, version numbers, release names) unless architecturally essential
- Keep explanations of the logic pattern itself
- Don't over-explain redactions; let the code speak

### 6. Validate No Info Leakage

Scan the anonymized code for:
- [ ] No real file paths (absolute or relative to proprietary structure)
- [ ] No API keys, tokens, or credentials
- [ ] No company/product names
- [ ] No specific usernames or email domains
- [ ] No proprietary algorithms or secret logic
- [ ] No cost/performance numbers that reveal system scale

### 7. Add Explanation

Always include prose explaining:
- What was redacted and why (e.g., "domain-specific terms replaced with generic placeholders")
- What the pattern does and when to use it
- How to adapt it to your own domain (e.g., "replace `<entity_collection>` with your work item type")

## Example: Dedup Filter

**Production code:**
```python
done = _processed_keys()  # calls keys_with_traces()
queue = [m for m in all_modules 
         if args.force or f"{m.category}::{m.module_name}" not in done]
```

**Anonymized:**
```python
done = _completed_items()  # calls check_processed()
queue = [item for item in all_items 
         if args.force or f"{item.category}::{item.name}" not in done]
```

**Explanation:** This filter gates a processing queue by checking whether each item has been completed in prior runs. The `done` set loads from persisted records (manifests, traces). If `--force` is set, all items enter the queue; otherwise, only new items are queued. This pattern prevents reprocessing and supports resumption on crash.

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Over-redacting | `<x>` everywhere, unreadable | Keep generic names (check, filter, load) |
| Redacting logic | Replacing `if/for/while` with placeholders | Never redact control flow, only data names |
| Inconsistent replacements | `standards` → `<item>` in some places, `<entity>` in others | Use consistent placeholder names per concept |
| Missing credentials | "That's just a helper function" | Redact all credential-fetching functions (`key()`, `secret()`, `token()`) |
| Ignoring docstrings | Leaving "module", "state standards", dates in comments | Edit docstrings same way as code; remove timelines |
| Unclear helper functions | Keeping `_read_manifest()` when it should be generic | Genericize helpers if domain-coupled; otherwise keep for readability |
| Adding too much explanation | Tutorial bloat, loses the pattern | 3-5 sentences on what + when to use |
| Leaving one real path/name | "Just this one won't matter" | Scan entire output, use find+replace to verify |

## Quick Checklist

Before sharing anonymized code:

- [ ] No absolute paths
- [ ] No domain jargon left unexplained or redacted
- [ ] No credentials, keys, tokens
- [ ] Logic and structure fully preserved
- [ ] Placeholders use `<snake_case>` consistently
- [ ] Explanation covers: what it does, when to use, how to adapt
- [ ] Example is runnable/understandable without the redacted terms

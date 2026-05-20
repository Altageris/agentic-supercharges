---
name: accessibility-pass
description: Make content and systems accessible across users, models, and use cases via autonomous multi-pass analysis
metadata:
  type: skill
  category: content-processing
  complexity: high
  agent-friendly: true
---

# Accessibility Pass Skill

**Purpose:** Perform autonomous, chainable passes on documentation, code, and entire systems to maximize accessibility across:
- Human users (varying literacy, language, ability)
- AI models (varying context windows, reasoning capability)
- Use cases (quick reference, deep learning, reproduction, debugging)

**Paradigm:** Analyze content once → decide pass count → execute passes → output machine-readable metadata → return chainable results

---

## 1. Invocation

```bash
/accessibility-pass <target>
```

**Parameters:**
- `<target>`: File path, directory, or system to analyze
  - File: single Markdown/code file
  - Directory: entire folder (recursively analyzed)
  - System: special keyword (processes current project structure)

**Optional flags:**
- `--min-passes <N>`: Minimum passes (default: auto)
- `--max-passes <N>`: Maximum passes (default: 5)
- `--output-format <json|yaml|markdown>`: Metadata format (default: json)
- `--preserve-originals`: Keep original files unmodified (default: true)

---

## 2. Autonomous Pass Detection

Before running passes, the skill analyzes the target to determine:

### 2.1 Content Audit

Scan for:
- **Complexity markers**
  - Technical jargon density (words per 100 that require external lookup)
  - Nesting depth (code/doc structure depth)
  - Abstraction level (how generic vs. specific)
  - Domain coupling (how tied to specific systems/products)

- **Accessibility gaps**
  - Missing alt text (images/diagrams)
  - No table of contents (long docs)
  - No runnable examples (code-heavy content)
  - Missing error case documentation
  - No terminology glossary
  - Undefined acronyms on first use

- **Audience diversity**
  - Multiple audience levels detected? (beginner → advanced)
  - Code and docs mixed (requires different reading strategies)
  - Different languages present? (i18n gaps)

- **Use case distribution**
  - Reference documentation vs. tutorials vs. how-tos
  - Research vs. operational vs. debugging content

### 2.2 Pass Count Decision Logic

```
passes = 1  (base)

if technical_jargon_density > 30%:
  passes += 1  (add: terminology simplification pass)

if nesting_depth > 4 OR abstraction_level > high:
  passes += 1  (add: structural decomposition pass)

if domain_coupling > 40%:
  passes += 1  (add: genericization pass)

if missing_accessibility_elements > 5:
  passes += 1  (add: annotation pass)

if audience_diversity > 2:
  passes += 1  (add: audience segmentation pass)

passes = min(passes, max_passes)
passes = max(passes, min_passes)
```

**Example outputs:**
- Simple README: 1 pass (formatting/polish)
- Complex technical doc: 3 passes (simplification + structure + annotation)
- Mixed codebase: 4 passes (decomposition + genericization + annotation + examples)

---

## 3. Pass Types (Ordered Execution)

Passes execute sequentially. Output of each pass feeds into the next.

### Pass 1: Structural Analysis & Decomposition
**Goal:** Make content navigable at all reading speeds

**Operations:**
- Add table of contents with anchor links
- Break long sections (>500 words) into subsections
- Extract key takeaways at section start (3-5 bullet points)
- Add "Quick Reference" boxes for procedural content
- Create visual hierarchy (headers, lists, spacing)
- Mark sections by reading time (2 min read, 5 min read, etc.)

**Output markers:**
- `[TOC-ADDED]` above table of contents
- `[SECTION-BREAK]` where sections split
- `[KEY-POINTS: title]` marking extracted takeaways
- `[READING-TIME: Xm]` marking estimated time

**Agent metadata:**
```json
{
  "pass": 1,
  "name": "structural-decomposition",
  "sections_added": 3,
  "reading_time_total": "15 min",
  "navigation_aids": ["toc", "anchors", "reading-time"],
  "output_file": "target-A1-structural.md"
}
```

---

### Pass 2: Terminology Simplification
**Goal:** Reduce jargon; explain domain-specific terms

**Operations:**
- Extract all technical terms/acronyms
- Create inline glossary (first use: `term [definition]`)
- Replace jargon with plain language where possible
- Add footnotes for unavoidable technical terms
- Create separate glossary document
- Link repeated terms to glossary entry on first use per section

**Target reduction:** Jargon density 30% → 10%

**Output markers:**
- `[TERM: acronym → spelled out]` on first use
- `[GLOSSARY-REF]` pointing to glossary section
- Glossary document: `target-GLOSSARY.md`

**Agent metadata:**
```json
{
  "pass": 2,
  "name": "terminology-simplification",
  "terms_identified": 47,
  "terms_simplified": 23,
  "jargon_density_before": "32%",
  "jargon_density_after": "9%",
  "glossary_entries": 47,
  "output_files": ["target-A2-simplified.md", "target-GLOSSARY.md"]
}
```

---

### Pass 3: Genericization
**Goal:** Remove domain/product coupling; make portable

**Operations:**
- Replace product names: `Claude` → `<product>`, `VS Code` → `<editor>`
- Replace version numbers: `v2.1.142` → `<version>`
- Replace file paths: `/Users/...` → `<user_home>`
- Extract domain-specific examples → genericize while preserving logic
- Create mapping document (original → generic terms)
- Mark all redacted terms with `<angle_brackets>`

**Target:** Enable skill to apply to similar systems with minimal adaptation

**Output markers:**
- `[REDACTED: original_term → <generic>]` annotations
- `[MAPPING-DOCUMENT]` reference

**Agent metadata:**
```json
{
  "pass": 3,
  "name": "genericization",
  "terms_redacted": 34,
  "domains_identified": ["product-name", "platform", "version", "paths"],
  "mapping_document": "target-MAPPING.json",
  "portability_score": "high",
  "output_file": "target-A3-generic.md"
}
```

---

### Pass 4: Annotation & Evidence
**Goal:** Add accessibility metadata; support different consumption modes

**Operations:**
- Add alt text to diagrams/images: `![description](image)` → `![description with color, layout, data](image)`
- Annotate code examples: what this does, why, common mistakes
- Add runnable examples (or links to them)
- Extract and explain error cases
- Add "For experienced users" / "For beginners" sections
- Create checklists for procedural content

**Output markers:**
- `[ALT-TEXT]` over images
- `[EXAMPLE: language]` over code
- `[ERROR-CASE]` over error documentation
- `[FOR-LEVEL: beginner|intermediate|advanced]` over sections

**Agent metadata:**
```json
{
  "pass": 4,
  "name": "annotation-and-evidence",
  "images_annotated": 8,
  "code_examples_annotated": 12,
  "error_cases_documented": 5,
  "checklists_created": 3,
  "audience_segmentation": true,
  "output_file": "target-A4-annotated.md"
}
```

---

### Pass 5: Audience Segmentation
**Goal:** Support multiple reading paths through same content

**Operations:**
- Identify audience segments (beginner, intermediate, advanced, researcher, practitioner)
- Create audience-specific versions (index shows all segments)
- Add "Choose your path" section at top
- Mark sections by audience: `[FOR: beginner]` / `[FOR: advanced]`
- Generate audience-specific TOC (shows only relevant sections)
- Create parallel quick-reference guides per audience

**Output structure:**
```
target-segments/
├── index.html              # Audience chooser
├── beginner/
│   └── target-beginner.md
├── intermediate/
│   └── target-intermediate.md
├── advanced/
│   └── target-advanced.md
└── manifest.json           # Metadata
```

**Agent metadata:**
```json
{
  "pass": 5,
  "name": "audience-segmentation",
  "audiences_identified": 3,
  "segments_created": ["beginner", "intermediate", "advanced"],
  "paths_generated": 3,
  "cross_references": 24,
  "output_directory": "target-segments/",
  "index_file": "target-segments/index.html"
}
```

---

## 4. Chainable Output Format

Each pass outputs metadata that feeds into the next:

```json
{
  "accessibility_analysis": {
    "target": "/path/to/content",
    "content_type": "hybrid",  // code, docs, hybrid
    "passes_planned": 4,
    "passes_completed": [1, 2, 3, 4],
    "overall_progress": "100%",
    
    "pass_results": [
      {
        "pass_num": 1,
        "pass_name": "structural-decomposition",
        "status": "completed",
        "duration": "23s",
        "output_file": "target-A1-structural.md",
        "metrics": {
          "sections_added": 3,
          "reading_time": "15m",
          "navigation_aids": ["toc", "anchors"]
        },
        "next_pass_input": "target-A1-structural.md",
        "next_pass_ready": true
      },
      {
        "pass_num": 2,
        "pass_name": "terminology-simplification",
        "status": "completed",
        "duration": "18s",
        "output_file": "target-A2-simplified.md",
        "metrics": {
          "jargon_before": "32%",
          "jargon_after": "9%",
          "glossary_entries": 47
        },
        "next_pass_input": "target-A2-simplified.md",
        "next_pass_ready": true
      }
      // ... more passes
    ],
    
    "final_outputs": {
      "main": "target-A4-final.md",
      "glossary": "target-GLOSSARY.md",
      "mapping": "target-MAPPING.json",
      "segments": "target-segments/",
      "manifest": {
        "accessibility_score": 0.87,
        "audience_coverage": 3,
        "readability_improvement": "32%",
        "completeness": "100%"
      }
    }
  }
}
```

---

## 5. Agent Integration Patterns

### Pattern 1: Autonomous Execution (Hands-Off)

```bash
/accessibility-pass /path/to/system
# Skill analyzes, decides passes, runs all, returns manifest
```

Agent receives metadata → can chain to next operation → manifests become discoverable artifacts.

### Pattern 2: Agent-Controlled Pipeline

```bash
/accessibility-pass /path --max-passes 5 --output-format json
# Skill returns pass-by-pass metadata as JSON
# Agent reads metadata, decides whether to continue or modify approach
```

Use case: Agent analyzing errors in documentation → decides to continue to pass 4 → stop before audience segmentation (not needed).

### Pattern 3: Iterative Refinement

```bash
# Pass 1
/accessibility-pass /path --min-passes 1 --max-passes 1
# Agent receives structural-decomposition output
# Agent evaluates: "Is this readable enough?"
# If no, triggers passes 2-3
# If yes, stops and moves to next task
```

---

## 6. Accessibility Score & Manifest

Final manifest includes:

```json
{
  "accessibility": {
    "score": 0.87,  // 0-1, measures improvement
    "dimensions": {
      "navigability": 0.95,      // TOC, sections, anchors
      "comprehensibility": 0.82, // jargon reduction, glossary
      "clarity": 0.88,           // structure, examples, annotations
      "inclusivity": 0.79,       // audience segmentation, alt text
      "portability": 0.91        // genericization, mapping
    },
    "improvements": {
      "before": {
        "reading_time": "45m",
        "jargon_density": "32%",
        "sections": 12,
        "audience_coverage": "advanced users only"
      },
      "after": {
        "reading_time": "15m + 30m (advanced path)",
        "jargon_density": "9%",
        "sections": 18,
        "audience_coverage": "beginner, intermediate, advanced"
      }
    }
  }
}
```

---

## 7. Configuration & Customization

### Custom Pass Order

Users/agents can specify pass order:

```bash
/accessibility-pass /path --pass-order "3,1,2,4"
# Run genericization first, then structure, then simplify, then annotate
# (useful if product-specific content already confusing)
```

### Skip Specific Passes

```bash
/accessibility-pass /path --skip-passes "5"
# Run passes 1-4, skip audience segmentation
```

### Pass Parameters

```bash
/accessibility-pass /path --pass-config '{"2": {"jargon_target": "5%"}, "4": {"image_alt_style": "detailed"}}'
# Configure individual pass behavior
```

---

## 8. When to Use / Not Use

### ✓ Use accessibility-pass when:
- Documentation is hard to navigate (no TOC, long sections)
- Content has unexplained jargon or technical terms
- You want content to work across user skill levels
- System analysis is domain-specific but should be portable
- Creating content for both humans and AI models to understand
- Building "model battleground" datasets (genericized, portable)

### ✗ Don't use when:
- Content is already simple (README < 200 words)
- You need to preserve exact original terminology (trademarks, proper names)
- Document is reference-only (API docs, specs) rather than explanatory
- Content is machine-generated and intentionally terse

---

## 9. Output Artifacts

After running `/accessibility-pass`, you receive:

- **Primary output**: Fully accessible version(s) of content
- **Glossary**: Standalone terminology reference (if pass 2 ran)
- **Mapping document**: Original → generic term mappings (if pass 3 ran)
- **Segments directory**: Audience-specific versions (if pass 5 ran)
- **Manifest**: Machine-readable metadata with metrics and chain-ready JSON
- **Original files**: Preserved (unchanged) unless `--preserve-originals=false`

---

## 10. Accessibility Skill in Practice: Example Walkthrough

### Input
```
/accessibility-pass /Users/AI-CCORE/claude-code-fork-anonymized/reports/
```

### Skill Analysis
```
Scanning: 2 HTML files, 1 markdown file
Content type: documentation + reports (hybrid)
Technical jargon: 28%
Nesting depth: 3
Accessibility gaps: 3 (missing alt text, no glossary, no audience segmentation)
Audience diversity: 2 (researchers, developers)

→ Passes needed: 4 (structure + simplify + annotate + segment)
→ Est. duration: 2m 15s
```

### Execution

**Pass 1 (Structural):** Adds TOC, reading times, key-point boxes
- Output: `reports-A1-structural.md`

**Pass 2 (Terminology):** Creates glossary for terms like "anonymization", "structural equivalence"
- Output: `reports-A2-simplified.md`, `reports-GLOSSARY.md`

**Pass 3 (Genericization):** Already anonymized, minimal changes
- Output: `reports-A3-generic.md` (same as A2)

**Pass 4 (Annotation):** Adds alt text to comparison tables, sections for different audiences
- Output: `reports-A4-final.md`

### Manifest
```json
{
  "accessibility_score": 0.84,
  "improvements": {
    "reading_time": "45 min → 12 min (browsing) + 40 min (deep read)",
    "jargon_density": "28% → 6%",
    "audiences": "1 → 3 (researchers, developers, beginners)"
  },
  "outputs": [
    "reports-A4-final.md",
    "reports-GLOSSARY.md",
    "reports-segments/"
  ]
}
```

---

## 11. Agent Integration Checklist

- [ ] Skill outputs machine-readable JSON metadata
- [ ] Each pass produces chainable output (next pass reads previous)
- [ ] Skill can run fully autonomously OR step-by-step
- [ ] Pass count decided automatically based on content analysis
- [ ] Agents can query "is this accessible enough?" via manifest
- [ ] Skill supports skip/reorder via flags (agent control)
- [ ] Manifest includes "next action" recommendations

---

**Status:** Ready for implementation  
**Target Integration:** Claude Code skill system  
**Agent Friendly:** Yes (full JSON metadata, chainable, autonomous)

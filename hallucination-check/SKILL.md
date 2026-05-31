---
name: hallucination-check
description: Audit a recent answer, claim set, deployment report, test result, or code-change summary for unsupported statements. Use when the user invokes $hallucination-check, says a response may be wrong, asks whether a claim was actually verified, or wants a compact evidence-backed correction after implementation, deployment, browsing, or local command work.
---

# Hallucination Check

Use this skill to turn a prior answer into a claim ledger, re-check the claims against current evidence, and correct any overreach. Favor direct verification over explanation.

## Workflow

1. Identify the claim scope.
   - Default to the most recent assistant answer if the user does not specify another target.
   - Include concrete claims about files, URLs, commands, statuses, tests, dimensions, deployment state, screenshots, APIs, auth, DNS, certificates, or generated artifacts.
   - Ignore tone, intent, and general advice unless the user asks to audit those too.

2. Build a compact claim ledger.
   - Write each claim as a testable sentence.
   - Mark whether the claim needs current verification, prior-command evidence, source citation, visual inspection, or user-provided context.
   - Treat "works", "deployed", "verified", "secure", "public", "complete", and "returns 200" as high-risk claims.

3. Re-check the highest-risk claims first.
   - Use direct current-state checks when cheap: file reads, `git status`, tests, `curl`, DNS lookups, screenshots, image inspection, service logs, or API responses.
   - If a claim was based on prior tool output, prefer re-running a narrow check rather than trusting memory.
   - If direct verification would be risky, expensive, or require broad secret search, say that and use the safest narrower check.

4. Separate results into three buckets.
   - `Proven`: current evidence directly supports the claim.
   - `Corrected`: current evidence contradicts or narrows the claim.
   - `Unverified`: evidence is missing, indirect, stale, or too narrow.

5. Correct the record.
   - If a claim was wrong, state the exact corrected version.
   - If the prior answer overclaimed, name the stronger wording that would have been accurate.
   - If user action or external propagation remains required, state it as a requirement, not a completed fact.

## Output

Keep the report concise:

```text
Hallucination Check
Proven:
- ...

Corrected:
- Prior claim: ...
  Current evidence: ...
  Correct statement: ...

Unverified:
- ...

Next check:
- ...
```

Omit empty sections. Include commands or file paths only when they materially support the correction.

## Guardrails

- Do not claim a live service works solely because a forced-host, cached, local, or bypassed check works. State what path was actually tested.
- Do not convert a server-side route check into a public-user claim unless normal public DNS/TLS/browser conditions were also checked.
- Do not treat generated test fixtures as representative user assets unless the limitation is stated.
- Do not verify broad claims with narrow samples unless the sample limitation is explicit.
- Do not search secret-bearing directories broadly to prove a claim. Ask or use a narrow non-secret check.

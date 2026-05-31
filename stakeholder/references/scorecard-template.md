# Stakeholder Scorecard Template

Use this template for experiments, prototypes, and generation pipelines.

| Dimension | Score | Evidence | Decision Meaning |
| --- | ---: | --- | --- |
| Functional capability | 1-5 | What the system can demonstrably do | Whether it solves the target workflow |
| Output quality | 1-5 | Visual/test/user-facing quality evidence | Whether results are usable or only diagnostic |
| Controllability | 1-5 | Degree of hard control vs prompt steering | Whether quality can be improved predictably |
| Repeatability | 1-5 | Batch runs, manifests, deterministic paths | Whether future sessions can reproduce progress |
| Observability | 1-5 | Logs, manifests, metadata, screenshots | Whether failures can be diagnosed |
| Operability | 1-5 | One-command paths, permissions, auth, privacy | Whether routine use is low-friction |
| Risk | 1-5 | Safety, privacy, policy, model dependency | Whether work can proceed safely |
| Leverage | 1-5 | Whether next changes compound learning | Whether further investment is justified |

Scoring guide:

- 1: missing or mostly unproven.
- 2: partial and fragile.
- 3: usable for research or internal iteration.
- 4: strong demo or near-production capability.
- 5: robust, repeatable, and decision-ready.

Always include a short evidence note. Use `not scored` instead of guessing.

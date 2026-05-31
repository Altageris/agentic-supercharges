---
name: session-reload
description: Use when the user wants to reload the current Codex session into a fresh shell, reopen an exact session id, prepare a resume handoff, or predict where the resumed session should launch. Captures the session id, writes a reload record, includes current hook-config status, and can launch `codex resume <session_id>` in a new shell.
---

# Session Reload

Use this skill when the user wants continuity through a fresh terminal session without losing the exact Codex thread.

This skill is for:

- reopening the exact current session by id
- preparing a deterministic handoff record before switching shells
- launching `codex resume <session_id>` in a fresh shell window
- verifying the active hook config surface that the resumed session should inherit

This skill does not truly terminate the current live Codex host from inside itself. It can prepare and launch the replacement session, but the outer host/client still controls final shutdown of the current one.

## Inputs to gather

Prefer small targeted checks:

1. current session id
2. current working directory
3. whether the user wants a launch or just a handoff record

Current session id sources, in order:

- explicit session id already known in the current task
- the latest matching entry in `C:\Users\jeanj\.codex\history.jsonl`

## Script

Use:

- `C:\Users\jeanj\.codex\skills\session-reload\scripts\prepare_session_reload.ps1`

The script:

- accepts an explicit `-SessionId` when available
- otherwise falls back to the latest `session_id` in `history.jsonl`
- defaults the predicted resumed cwd to the current shell location unless `-TargetCwd` is provided
- writes the handoff record to `C:\Users\jeanj\.codex\memories\skills\session-reload\last_reload.json`
- records current hook-config status from `C:\Users\jeanj\.codex\config.toml` and `C:\Users\jeanj\.codex\hooks.json`
- expects the non-deprecated feature key to be `[features].hooks`
- can launch a new PowerShell window with `-NoProfile` that runs `codex resume <session_id>`

## Recommended workflow

1. Resolve the session id explicitly when possible.
2. Run the script with the current cwd or a deliberate target cwd.
3. Tell the user:
   - the exact session id
   - the predicted resumed cwd
   - the handoff record path
   - the exact resume command
   - the current hook feature key and whether it is enabled
   - whether `hooks.json` exists
4. If the user asked for launch, use `-Launch`.
5. Be explicit that the current Codex host may still need to be closed manually.

## Example

```powershell
& 'C:\Users\jeanj\.codex\skills\session-reload\scripts\prepare_session_reload.ps1' `
  -SessionId '019dade2-7df1-7fc2-b82e-3b2b33b204d8' `
  -TargetCwd 'C:\Users\jeanj' `
  -Launch
```

## Output contract

Report:

- `session_id`
- `predicted_cwd`
- `resume_command`
- `launch_command`
- `record_path`
- `hooks.feature_key`
- `hooks.feature_enabled`
- `hooks.hooks_path`
- `hooks.hooks_file_exists`
- whether a new shell was launched
- that current-session termination is not guaranteed from inside the skill


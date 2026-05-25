---
name: reload-config
description: This skill should be used when the user asks to reload config, check active settings, view permissions, or list available skills.
---

# Reload Config

Shows the current active Claude Code configuration: permissions, hooks, and settings across all levels.

## Steps

1. Read global user settings:
```bash
cat ~/.claude/settings.json
```

2. Read project settings:
```bash
cat .claude/settings.json 2>/dev/null || echo "(none)"
```

3. Read project local settings:
```bash
cat .claude/settings.local.json 2>/dev/null || echo "(none)"
```

4. List available local skills:
```bash
ls -lt ~/.claude/skills/ 2>/dev/null
ls -lt .claude/skills/ 2>/dev/null || echo "(none)"
```

5. Summarise:
- Active permission allow/deny rules
- Any hooks configured
- List of available skills
- Note: if changes still aren't reflected, restart is the last resort

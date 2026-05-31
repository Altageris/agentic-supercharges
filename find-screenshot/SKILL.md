---
name: find-screenshot
description: Find and open the latest screenshot from the exact Windows capture folder used in this workspace. Use when the user asks to locate a recent screenshot, inspect the last screenshot, or reopen the screenshot found at `C:\Users\jeanj\OneDrive\Images\Captures d’écran`.
---

# Find Screenshot

Use the exact capture folder:

`C:\Users\jeanj\OneDrive\Images\Captures d’écran`

## Workflow

1. Search only that folder unless the user gives a different source path.
2. Use `Get-ChildItem -LiteralPath` on the exact folder path instead of a broad recursive search.
3. Pick the newest image file by `LastWriteTime`.
4. Open the file with `view_image`.
5. If multiple files share the same timestamp, use the screenshot-style filename with the latest sort order.
6. If the folder is missing or empty, report that directly and do not broaden the search across the profile.

## File Types

Prefer these image extensions:

- `.png`
- `.jpg`
- `.jpeg`
- `.webp`
- `.bmp`

## Notes

- Do not broaden the search across the whole profile unless the exact folder is empty.
- Preserve the user’s exact local path when reporting the result.

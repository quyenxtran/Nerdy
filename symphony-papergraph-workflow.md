---
tracker:
  kind: memory
  active_states:
    - Todo
    - In Progress
  terminal_states:
    - Done
    - Closed
polling:
  interval_ms: 5000
observability:
  dashboard_enabled: false
workspace:
  root: "C:/Users/qtran47/devs/Nerd_App/.symphony-workspaces"
hooks:
  after_create: |
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:/Users/qtran47/devs/Nerd_App/scripts/symphony-copy-workspace.ps1
  timeout_ms: 120000
agent:
  max_concurrent_agents: 1
  max_turns: 1
codex:
  command: "'/c/Users/qtran47/AppData/Roaming/npm/codex.cmd' app-server"
  approval_policy: never
  thread_sandbox: workspace-write
  turn_timeout_ms: 900000
  read_timeout_ms: 10000
  stall_timeout_ms: 300000
---

You are working on a local PaperGraph AI implementation issue.

Identifier: {{ issue.identifier }}
Title: {{ issue.title }}

Description:
{{ issue.description }}

Rules:
- Work only inside the isolated Symphony workspace.
- Preserve the existing PaperGraph product plan and UI direction.
- Use `npm install`, `npm run typecheck`, and `npm run build` as validation when needed.
- Keep changes scoped and list changed files in the final response.
- Do not ask the human for follow-up unless a required secret or external account is missing.

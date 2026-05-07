alias SymphonyElixir.Linear.Issue
alias SymphonyElixir.Orchestrator
alias SymphonyElixir.Workflow

root = Path.expand("../..", File.cwd!())
workflow_path = Path.join(root, "symphony-papergraph-workflow.md")
logs_root = Path.join(root, ".symphony-logs")

git_bash_paths = [
  "C:\\Program Files\\Git\\usr\\bin",
  "C:\\Program Files\\Git\\bin"
]

System.put_env("PATH", Enum.join(git_bash_paths ++ [System.get_env("PATH") || ""], ";"))
Application.put_env(:symphony_elixir, :log_file, Path.join(logs_root, "symphony.log"))
Workflow.set_workflow_file_path(workflow_path)

Application.put_env(:symphony_elixir, :memory_tracker_issues, [
  %Issue{
    id: "papergraph-ui-polish",
    identifier: "PG-UI-1",
    title: "Polish PaperGraph MVP UI and implementation flow",
    description: """
    Review the current PaperGraph AI MVP and implement one contained improvement that makes the UI feel more complete, evidence-dense, and demo-ready.

    Preferred improvements:
    - Tighten the landing/app cockpit visual hierarchy.
    - Improve the paper import, repost, assistant, thesis, or memo interaction.
    - Add a small verification doc or smoke path if code changes are already complete.

    Avoid broad rewrites. Keep the MVP mock-first and runnable without external API keys.
    """,
    priority: 1,
    state: "Todo",
    branch_name: "symphony/pg-ui-1",
    url: "memory://papergraph-ui-polish",
    labels: ["papergraph", "ui", "mvp"],
    created_at: DateTime.utc_now(),
    updated_at: DateTime.utc_now()
  }
])

Process.flag(:trap_exit, true)

{:ok, _started} = Application.ensure_all_started(:symphony_elixir)

case Orchestrator.request_refresh() do
  :unavailable -> IO.puts("Symphony orchestrator unavailable")
  result -> IO.puts("Symphony refresh queued: #{inspect(result)}")
end

run_ms =
  case Integer.parse(System.get_env("SYMPHONY_RUN_MS") || "120000") do
    {value, _} when value > 0 -> value
    _ -> 120000
  end

deadline = System.monotonic_time(:millisecond) + run_ms

receive_loop = fn receive_loop ->
  remaining = max(deadline - System.monotonic_time(:millisecond), 0)

  if remaining == 0 do
    :timeout
  else
    receive do
      {:EXIT, pid, reason} ->
        IO.puts("Symphony linked process exited: #{inspect(pid)} #{inspect(reason)}")
        receive_loop.(receive_loop)
    after
      min(remaining, 1000) ->
        receive_loop.(receive_loop)
    end
  end
end

receive_loop.(receive_loop)

IO.inspect(Orchestrator.snapshot(), label: "Symphony snapshot")

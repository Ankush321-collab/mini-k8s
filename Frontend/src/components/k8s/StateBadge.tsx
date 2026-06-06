import type { JobState } from "@/lib/minik8s";

const LABEL: Record<JobState, string> = {
  submitted: "queued",
  runnable: "waiting",
  running: "active",
  succeed: "success",
  failed: "error",
};

const STYLES: Record<JobState, string> = {
  submitted: "bg-state-submitted/15 text-state-submitted border-state-submitted/30",
  runnable: "bg-state-runnable/15 text-state-runnable border-state-runnable/40",
  running: "bg-state-running/15 text-state-running border-state-running/40",
  succeed: "bg-state-succeed/15 text-state-succeed border-state-succeed/40",
  failed: "bg-state-failed/15 text-state-failed border-state-failed/40",
};

export function StateBadge({ state }: { state: JobState }) {
  const pulse = state === "running" || state === "runnable";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wider mono ${STYLES[state]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? "pulse-dot" : ""}`}
        aria-hidden
      />
      {state} · {LABEL[state]}
    </span>
  );
}

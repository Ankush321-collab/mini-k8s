import type { Job } from "@/lib/minik8s";
import { StateBadge } from "./StateBadge";
import { Timeline } from "./Timeline";

function Row({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="border-b border-border/60 py-2.5 last:border-b-0">
      <div className="mono mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`text-sm break-all ${mono ? "mono" : ""}`}>{value || "—"}</div>
    </div>
  );
}

export function JobDetails({ job }: { job: Job | null }) {
  if (!job) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Inspector</h2>
        <p className="mono mt-1 text-xs text-muted-foreground">
          Select a workload to inspect
        </p>
        <div className="grid-bg mt-4 flex h-48 items-center justify-center rounded-md border border-dashed border-border">
          <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
            no selection
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Inspector</h2>
          <p className="mono text-xs text-muted-foreground">job #{String(job.id).slice(0, 12)}</p>
        </div>
        <StateBadge state={job.state} />
      </div>

      <div className="rounded-md border border-border bg-surface p-3">
        <Timeline state={job.state} />
      </div>

      <div className="mt-4">
        <Row label="image" value={job.image} />
        <Row label="cmd" value={job.cmd || "—"} />
        <Row
          label="container id"
          value={
            job.containerId ? (
              <span className="rounded bg-surface-2 px-1.5 py-0.5">{job.containerId}</span>
            ) : (
              <span className="text-muted-foreground">not yet allocated</span>
            )
          }
        />
        <Row label="created" value={new Date(job.createdAt).toLocaleString()} />
        <Row label="updated" value={new Date(job.updatedAt).toLocaleString()} />
      </div>

      {job.state === "failed" && (
        <div className="mt-4 rounded-md border border-state-failed/40 bg-state-failed/10 p-3">
          <div className="mono mb-1 text-[10px] uppercase tracking-wider text-state-failed">
            error message
          </div>
          <p className="mono text-xs text-state-failed/90">
            {job.errorMessage || "Container exited with a non-zero code."}
          </p>
        </div>
      )}

      <div className="mt-4">
        <div className="mono mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>output</span>
          <span>tail -f</span>
        </div>
        <pre className="mono max-h-56 overflow-auto rounded-md border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
{logLines(job)}
        </pre>
      </div>
    </div>
  );
}

function logLines(job: Job): string {
  const lines: string[] = [];
  const ts = (d: string) => new Date(d).toISOString().split("T")[1]?.slice(0, 8) || "--:--:--";
  lines.push(`[${ts(job.createdAt)}] scheduler: received job ${String(job.id).slice(0, 8)} (image=${job.image})`);
  if (["runnable", "running", "succeed", "failed"].includes(job.state))
    lines.push(`[${ts(job.updatedAt)}] dispatcher: marked runnable, dispatching to worker`);
  if (["running", "succeed", "failed"].includes(job.state))
    lines.push(
      `[${ts(job.updatedAt)}] worker: docker run ${job.image}${job.cmd ? " " + job.cmd : ""}`,
    );
  if (job.containerId)
    lines.push(`[${ts(job.updatedAt)}] runtime: container ${job.containerId.slice(0, 12)} started`);
  if (job.state === "succeed")
    lines.push(`[${ts(job.updatedAt)}] runtime: exit code 0 — container exited cleanly`);
  if (job.state === "failed")
    lines.push(
      `[${ts(job.updatedAt)}] runtime: ${job.errorMessage || "non-zero exit code"}`,
    );
  return lines.join("\n");
}

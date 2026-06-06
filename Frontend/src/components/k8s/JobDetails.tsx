import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export function JobDetails({ job, hideLogs }: { job: Job | null; hideLogs?: boolean }) {
  if (!job) {
    return (
      <div className="group h-full rounded-xl p-[1px] bg-gradient-to-br from-border/50 to-border/50 hover:from-blue-500/60 hover:to-cyan-500/60 transition-colors duration-500 shadow-[0_20px_60px_-25px_color-mix(in_oklab,var(--primary)_40%,transparent)]">
        <div className="h-full flex flex-col rounded-xl bg-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Inspector</h2>
          <p className="mono mt-1 text-xs text-muted-foreground">
            Select a workload to inspect
          </p>
          <div className="grid-bg flex-1 mt-4 flex items-center justify-center rounded-md border border-dashed border-border">
            <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              no selection
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group h-full rounded-xl p-[1px] bg-gradient-to-br from-border/50 to-border/50 hover:from-blue-500/60 hover:to-cyan-500/60 transition-colors duration-500 shadow-[0_20px_60px_-25px_color-mix(in_oklab,var(--primary)_50%,transparent)]">
      <div className="h-full flex flex-col overflow-y-auto rounded-xl bg-card p-5">
        <div className="mb-4 shrink-0 flex items-start justify-between gap-2">
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
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-md border border-state-failed/40 bg-state-failed/10 p-3"
          >
            <div className="mono mb-1 text-[10px] uppercase tracking-wider text-state-failed">
              error message
            </div>
            <p className="mono text-xs text-state-failed/90">
              {job.errorMessage || "Container exited with a non-zero code."}
            </p>
          </motion.div>
        )}

        {!hideLogs && <AnimatedLogs job={job} />}
      </div>
    </div>
  );
}

function AnimatedLogs({ job }: { job: Job }) {
  const targetLines = useMemo(() => buildLogLines(job), [job]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    if (targetLines.length === 0) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= targetLines.length) clearInterval(id);
    }, 280);
    return () => clearInterval(id);
  }, [targetLines]);

  return (
    <div className="mt-4 flex-1 min-h-0 flex flex-col">
      <div className="mono mb-2 shrink-0 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>output</span>
        <span className="flex items-center gap-1.5">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-state-running text-state-running" />
          tail -f
        </span>
      </div>
      <div className="mono flex-1 min-h-0 overflow-auto rounded-md border border-border bg-background p-3 text-xs leading-relaxed">
        <AnimatePresence initial={false}>
          {targetLines.slice(0, visibleCount).map((line, i) => (
            <motion.div
              key={`${job.id}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22 }}
              className={lineColor(line)}
            >
              <span className="text-primary/60">$</span> {line}
            </motion.div>
          ))}
        </AnimatePresence>
        {visibleCount < targetLines.length && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="inline-block h-3 w-1.5 translate-y-0.5 bg-primary"
          />
        )}
      </div>
    </div>
  );
}

function lineColor(line: string) {
  if (line.includes("exit code 0") || line.includes("cleanly")) return "text-state-succeed";
  if (line.includes("non-zero") || line.toLowerCase().includes("error")) return "text-state-failed";
  if (line.includes("docker run") || line.includes("started")) return "text-state-running";
  return "text-muted-foreground";
}

function buildLogLines(job: Job): string[] {
  const lines: string[] = [];
  const ts = (d: string) => new Date(d).toISOString().split("T")[1]?.slice(0, 8) || "--:--:--";
  lines.push(`[${ts(job.createdAt)}] scheduler: received job ${String(job.id).slice(0, 8)} (image=${job.image})`);
  if (["runnable", "running", "succeed", "failed"].includes(job.state))
    lines.push(`[${ts(job.updatedAt)}] dispatcher: marked runnable, dispatching to worker`);
  if (["running", "succeed", "failed"].includes(job.state))
    lines.push(`[${ts(job.updatedAt)}] worker: docker run ${job.image}${job.cmd ? " " + job.cmd : ""}`);
  if (job.containerId)
    lines.push(`[${ts(job.updatedAt)}] runtime: container ${job.containerId.slice(0, 12)} started`);
  if (job.state === "succeed")
    lines.push(`[${ts(job.updatedAt)}] runtime: exit code 0 — container exited cleanly`);
  if (job.state === "failed")
    lines.push(`[${ts(job.updatedAt)}] runtime: ${job.errorMessage || "non-zero exit code"}`);
  return lines;
}

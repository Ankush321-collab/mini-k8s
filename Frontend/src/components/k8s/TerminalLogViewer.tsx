import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Job } from "@/lib/minik8s";

export function TerminalLogViewer({ job }: { job: Job }) {
  const targetLines = useMemo(() => buildLogLines(job), [job]);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    let i = 0;
    setLines([]);
    if (targetLines.length === 0) return;
    
    function cycle() {
      if (!active) return;
      if (i >= targetLines.length) return;
      setLines((prev) => [...prev, targetLines[i]]);
      i++;
      setTimeout(cycle, 300 + Math.random() * 200); // simulate realistic log timing
    }
    cycle();
    return () => { active = false; };
  }, [targetLines]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: 12 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.7 }}
      whileHover={{ rotateY: -2, rotateX: 2 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="group h-full rounded-xl p-[1px] bg-gradient-to-br from-border/50 to-border/50 hover:from-orange-500/60 hover:to-amber-500/60 transition-colors duration-500 shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
    >
      <div className="h-full flex flex-col overflow-hidden rounded-xl bg-card">
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-state-failed/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-state-running/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-state-succeed/80" />
          </div>
          <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
            mini-k8s · tail -f job/{String(job.id).slice(0, 8)}
          </span>
          <span className="mono text-[10px] text-muted-foreground">live</span>
        </div>
        <div className="mono flex-1 overflow-auto bg-background p-4 text-[12px] leading-relaxed">
          {lines.map((line, idx) => {
            if (!line) return null;
            const color = line.includes("exit code 0") || line.includes("cleanly") || line.includes("succeeded")
              ? "text-state-succeed"
              : line.includes("stdout") || line.includes("docker run") || line.includes("started")
                ? "text-foreground"
                : line.includes("error") || line.includes("non-zero") || line.includes("stderr")
                  ? "text-state-failed"
                  : "text-muted-foreground";
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={color}
              >
                <span className="text-primary/70">$</span> {line}
              </motion.div>
            );
          })}
          {lines.length < targetLines.length && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block h-3 w-2 translate-y-0.5 bg-primary"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
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
  if (job.state === "succeed") {
    if (job.cmd) lines.push(`[${ts(job.updatedAt)}] stdout: executing ${job.cmd}...`);
    lines.push(`[${ts(job.updatedAt)}] runtime: exit code 0 — container exited cleanly`);
    lines.push(`[${ts(job.updatedAt)}] scheduler: marked job ${String(job.id).slice(0, 8)} as succeeded ✓`);
  }
  if (job.state === "failed") {
    if (job.cmd) lines.push(`[${ts(job.updatedAt)}] stderr: command failed`);
    lines.push(`[${ts(job.updatedAt)}] runtime: ${job.errorMessage || "non-zero exit code"}`);
  }
  return lines;
}

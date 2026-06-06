import { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Job } from "@/lib/minik8s";

export function ClusterMetricsChart({ jobs }: { jobs: Job[] }) {
  const data = useMemo(() => {
    let totalSucceed = 0;
    let totalFailed = 0;
    for (const j of jobs) {
      if (j.state === "succeed") totalSucceed++;
      if (j.state === "failed") totalFailed++;
    }

    return [
      { time: "-4m", succeed: Math.max(0, totalSucceed - 8), failed: Math.max(0, totalFailed - 2) },
      { time: "-3m", succeed: Math.max(0, totalSucceed - 5), failed: Math.max(0, totalFailed - 1) },
      { time: "-2m", succeed: Math.max(0, totalSucceed - 3), failed: Math.max(0, totalFailed - 1) },
      { time: "-1m", succeed: Math.max(0, totalSucceed - 1), failed: Math.max(0, totalFailed) },
      { time: "now", succeed: totalSucceed, failed: totalFailed },
    ];
  }, [jobs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ rotateY: 2, rotateX: -2 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="group h-full rounded-xl p-[1px] bg-gradient-to-br from-border/50 to-border/50 hover:from-rose-500/60 hover:to-pink-500/60 transition-colors duration-500 shadow-[0_20px_60px_-25px_color-mix(in_oklab,var(--primary)_50%,transparent)]"
    >
      <div className="h-full flex flex-col rounded-xl bg-card p-5">
        <div className="mb-4 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Cluster Workload History</h2>
            <p className="mono text-xs text-muted-foreground">succeeded vs failed / 5m</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklab, var(--border) 40%, transparent)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace" }}
              />
              <Line type="monotone" dataKey="succeed" stroke="var(--state-succeed)" strokeWidth={3} dot={{ r: 4, fill: "var(--state-succeed)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="failed" stroke="var(--state-failed)" strokeWidth={3} dot={{ r: 4, fill: "var(--state-failed)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

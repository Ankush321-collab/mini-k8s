import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { POLL_INTERVAL } from "@/lib/minik8s";
import { Header } from "@/components/k8s/Header";
import { BackgroundFX } from "@/components/k8s/BackgroundFX";
import { useCluster } from "@/contexts/ClusterContext";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Mini-K8S · Workloads" },
      { name: "description", content: "Submit, schedule, and monitor containerized workloads on your mini-k8s cluster." },
    ],
  }),
  component: JobsLayout,
});

function JobsLayout() {
  const { jobs, healthy, refreshing, usingRemote, refresh } = useCluster();

  const stats = useMemo(() => {
    const c = { running: 0, succeed: 0, failed: 0, pending: 0 };
    for (const j of jobs) {
      if (j.state === "running") c.running++;
      else if (j.state === "succeed") c.succeed++;
      else if (j.state === "failed") c.failed++;
      else c.pending++;
    }
    return c;
  }, [jobs]);

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <BackgroundFX />
      <div className="relative z-10 shrink-0">
        <Header healthy={healthy} onRefresh={refresh} refreshing={refreshing} />
      </div>

      <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-6 py-6 flex flex-col">
        <div className="mb-4 shrink-0">
          <Link to="/" className="mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
            ← back to overview
          </Link>
        </div>
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 shrink-0">
          <Stat label="pending" value={stats.pending} color="text-state-submitted" delay={0} />
          <Stat label="running" value={stats.running} color="text-state-running" delay={0.05} />
          <Stat label="succeeded" value={stats.succeed} color="text-state-succeed" delay={0.1} />
          <Stat label="failed" value={stats.failed} color="text-state-failed" delay={0.15} />
        </section>

        <Outlet />

        <footer className="shrink-0 mono mt-6 flex items-center justify-between border-t border-border pt-4 text-[11px] text-muted-foreground">
          <span>mini-k8s · {usingRemote ? "live cluster feed" : "local simulator (no /jobs endpoint yet)"}</span>
          <span>poll {POLL_INTERVAL}ms</span>
        </footer>
      </main>
    </div>
  );
}

function Stat({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, rotateX: -20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3, rotateX: 4, rotateY: -4 }}
      style={{ transformStyle: "preserve-3d", perspective: 600 }}
      className="rounded-xl border border-border bg-card p-4 shadow-[0_10px_30px_-15px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
    >
      <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
    </motion.div>
  );
}

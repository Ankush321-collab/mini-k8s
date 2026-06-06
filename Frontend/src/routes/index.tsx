import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import type { Job, JobState } from "@/lib/minik8s";
import { POLL_INTERVAL, fetchJobs, pingHealth } from "@/lib/minik8s";
import { Header } from "@/components/k8s/Header";
import { CreateJobForm } from "@/components/k8s/CreateJobForm";
import { JobTable } from "@/components/k8s/JobTable";
import { JobDetails } from "@/components/k8s/JobDetails";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mini-K8S · Control Plane" },
      { name: "description", content: "Submit, schedule, and monitor containerized workloads on your mini-k8s cluster." },
    ],
  }),
  component: Dashboard,
});

// Local simulation that advances optimistic jobs through their lifecycle
// until the backend exposes a real /jobs endpoint.
function nextState(s: JobState): JobState {
  if (s === "submitted") return "runnable";
  if (s === "runnable") return "running";
  if (s === "running") return Math.random() < 0.85 ? "succeed" : "failed";
  return s;
}

function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [usingRemote, setUsingRemote] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const [ok, remote] = await Promise.all([pingHealth(), fetchJobs()]);
    setHealthy(ok);
    if (remote) {
      setUsingRemote(true);
      setJobs(remote);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  // Local lifecycle simulator (only when backend has no list endpoint yet)
  useEffect(() => {
    if (usingRemote) return;
    const id = setInterval(() => {
      setJobs((prev) =>
        prev.map((j) => {
          if (j.state === "succeed" || j.state === "failed") return j;
          const ageMs = Date.now() - new Date(j.updatedAt).getTime();
          if (ageMs < 2500) return j;
          const ns = nextState(j.state);
          return {
            ...j,
            state: ns,
            updatedAt: new Date().toISOString(),
            containerId:
              ns === "running" && !j.containerId
                ? Math.random().toString(16).slice(2, 14).padEnd(12, "0")
                : j.containerId,
            errorMessage:
              ns === "failed" ? "exit status 1 — container exited with non-zero code" : j.errorMessage,
          };
        }),
      );
    }, 1500);
    return () => clearInterval(id);
  }, [usingRemote]);

  const selected = useMemo(
    () => jobs.find((j) => j.id === selectedId) || null,
    [jobs, selectedId],
  );

  function handleCreated(meta: { id: string | number; image: string; cmd?: string }) {
    const now = new Date().toISOString();
    const job: Job = {
      id: meta.id,
      image: meta.image,
      cmd: meta.cmd || null,
      state: "submitted",
      containerId: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    };
    setJobs((prev) => [job, ...prev]);
    setSelectedId(job.id);
  }

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
    <div className="min-h-screen">
      <Header healthy={healthy} onRefresh={refresh} refreshing={refreshing} />

      <main className="mx-auto max-w-7xl px-6 py-6">
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="pending" value={stats.pending} color="text-state-submitted" />
          <Stat label="running" value={stats.running} color="text-state-running" />
          <Stat label="succeeded" value={stats.succeed} color="text-state-succeed" />
          <Stat label="failed" value={stats.failed} color="text-state-failed" />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <CreateJobForm onCreated={handleCreated} />
          </div>
          <div className="lg:col-span-6">
            <JobTable jobs={jobs} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="lg:col-span-3">
            <JobDetails job={selected} />
          </div>
        </div>

        <footer className="mono mt-10 flex items-center justify-between border-t border-border pt-4 text-[11px] text-muted-foreground">
          <span>mini-k8s · {usingRemote ? "live cluster feed" : "local simulator (no /jobs endpoint yet)"}</span>
          <span>poll {POLL_INTERVAL}ms</span>
        </footer>
      </main>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

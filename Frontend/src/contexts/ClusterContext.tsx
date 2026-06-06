import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Job, JobState } from "@/lib/minik8s";
import { POLL_INTERVAL, fetchJobs, pingHealth } from "@/lib/minik8s";

interface ClusterState {
  jobs: Job[];
  healthy: boolean | null;
  refreshing: boolean;
  usingRemote: boolean;
  refresh: () => Promise<void>;
  createLocalJob: (job: Job) => void;
}

const ClusterContext = createContext<ClusterState | null>(null);

function nextState(s: JobState): JobState {
  if (s === "submitted") return "runnable";
  if (s === "runnable") return "running";
  if (s === "running") return Math.random() < 0.85 ? "succeed" : "failed";
  return s;
}

export function ClusterProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
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

  const createLocalJob = useCallback((job: Job) => {
    setJobs((prev) => [job, ...prev]);
  }, []);

  return (
    <ClusterContext.Provider value={{ jobs, healthy, refreshing, usingRemote, refresh, createLocalJob }}>
      {children}
    </ClusterContext.Provider>
  );
}

export function useCluster() {
  const ctx = useContext(ClusterContext);
  if (!ctx) throw new Error("useCluster must be used within a ClusterProvider");
  return ctx;
}

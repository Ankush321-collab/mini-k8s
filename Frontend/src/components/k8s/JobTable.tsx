import type { Job } from "@/lib/minik8s";
import { StateBadge } from "./StateBadge";

interface Props {
  jobs: Job[];
  selectedId: string | number | null;
  onSelect: (id: string | number) => void;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function JobTable({ jobs, selectedId, onSelect }: Props) {
  return (
    <div className="group h-full rounded-xl p-[1px] bg-gradient-to-br from-border/50 to-border/50 hover:from-emerald-500/60 hover:to-teal-500/60 transition-colors duration-500 shadow-[0_20px_60px_-25px_color-mix(in_oklab,var(--primary)_40%,transparent)]">
      <div className="h-full flex flex-col overflow-hidden rounded-xl bg-card">
        <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Workloads</h2>
            <p className="mono text-xs text-muted-foreground">
              {jobs.length} job{jobs.length === 1 ? "" : "s"} in cluster
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="flex-1 grid-bg flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mono mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              no workloads scheduled
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Submit a Docker image on the left to dispatch your first container to the worker pool.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="mono border-b border-border bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">id</th>
                  <th className="px-5 py-2.5 font-medium">image</th>
                  <th className="px-5 py-2.5 font-medium">cmd</th>
                  <th className="px-5 py-2.5 font-medium">state</th>
                  <th className="px-5 py-2.5 font-medium">container</th>
                  <th className="px-5 py-2.5 font-medium">updated</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => {
                  const active = selectedId === j.id;
                  return (
                    <tr
                      key={String(j.id)}
                      onClick={() => onSelect(j.id)}
                      className={`cursor-pointer border-b border-border/60 transition last:border-b-0 hover:bg-accent/40 ${
                        active ? "bg-accent/60" : ""
                      }`}
                    >
                      <td className="mono px-5 py-3 text-xs text-muted-foreground">
                        #{String(j.id).slice(0, 8)}
                      </td>
                      <td className="mono px-5 py-3 text-foreground">{j.image}</td>
                      <td className="mono max-w-[220px] truncate px-5 py-3 text-xs text-muted-foreground">
                        {j.cmd || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <StateBadge state={j.state} />
                      </td>
                      <td className="mono px-5 py-3 text-xs text-muted-foreground">
                        {j.containerId ? j.containerId.slice(0, 12) : "—"}
                      </td>
                      <td className="mono px-5 py-3 text-xs text-muted-foreground">
                        {timeAgo(j.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

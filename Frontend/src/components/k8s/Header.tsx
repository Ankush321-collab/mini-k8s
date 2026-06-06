import { API_BASE } from "@/lib/minik8s";

interface Props {
  healthy: boolean | null;
  onRefresh: () => void;
  refreshing?: boolean;
}

export function Header({ healthy, onRefresh, refreshing }: Props) {
  const status =
    healthy === null ? "checking" : healthy ? "online" : "offline";
  const color =
    healthy === null
      ? "bg-state-submitted text-state-submitted"
      : healthy
        ? "bg-state-succeed text-state-succeed"
        : "bg-state-failed text-state-failed";

  return (
    <header className="border-b border-border bg-surface/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/20 text-primary">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
              <path d="m3 7 9 5 9-5M12 22V12" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">
              mini-k8s <span className="text-muted-foreground">/ control plane</span>
            </h1>
            <p className="mono text-[11px] text-muted-foreground">
              {API_BASE}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5`}>
            <span className={`h-2 w-2 rounded-full ${color.split(" ")[0]} ${healthy ? "pulse-dot" : ""}`} />
            <span className={`mono text-[11px] uppercase tracking-wider ${color.split(" ")[1]}`}>
              api {status}
            </span>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="mono inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground transition hover:border-ring hover:text-foreground disabled:opacity-50"
          >
            <svg className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            refresh
          </button>
        </div>
      </div>
    </header>
  );
}

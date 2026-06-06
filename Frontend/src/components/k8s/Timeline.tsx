import type { JobState } from "@/lib/minik8s";
import { STATE_ORDER } from "@/lib/minik8s";

const COLOR: Record<JobState, string> = {
  submitted: "bg-state-submitted",
  runnable: "bg-state-runnable",
  running: "bg-state-running",
  succeed: "bg-state-succeed",
  failed: "bg-state-failed",
};

export function Timeline({ state }: { state: JobState }) {
  const failed = state === "failed";
  const reachedIdx = failed
    ? STATE_ORDER.indexOf("running")
    : STATE_ORDER.indexOf(state);

  return (
    <div className="flex w-full items-center gap-2">
      {STATE_ORDER.map((s, i) => {
        const reached = i <= reachedIdx;
        const active = i === reachedIdx && !failed && state !== "succeed";
        const isFinal = i === STATE_ORDER.length - 1;
        return (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  failed && i === reachedIdx
                    ? "bg-state-failed pulse-dot text-state-failed"
                    : reached
                      ? `${COLOR[s]} ${active ? "pulse-dot text-state-running" : ""}`
                      : "bg-muted"
                }`}
              />
              <span
                className={`mono text-[10px] uppercase tracking-wider ${
                  reached ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {failed && i === reachedIdx ? "failed" : s}
              </span>
            </div>
            {!isFinal && (
              <div
                className={`h-px flex-1 ${
                  i < reachedIdx ? "bg-foreground/40" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

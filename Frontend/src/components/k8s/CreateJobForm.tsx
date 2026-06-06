import { useState } from "react";
import { createJob } from "@/lib/minik8s";

interface Props {
  onCreated: (job: { id: string | number; image: string; cmd?: string }) => void;
}

const EXAMPLES = [
  { image: "busybox", cmd: "echo hello from mini-k8s" },
  { image: "alpine", cmd: "sleep 5" },
  { image: "node:20-alpine", cmd: "node -e 'console.log(1+1)'" },
];

export function CreateJobForm({ onCreated }: Props) {
  const [image, setImage] = useState("busybox");
  const [cmd, setCmd] = useState("sleep 10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!image.trim()) {
      setError("Image is required");
      return;
    }
    setLoading(true);
    try {
      const res = await createJob(image.trim(), cmd.trim() || undefined);
      onCreated({ id: res.id, image: image.trim(), cmd: cmd.trim() });
      setCmd("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Schedule workload</h2>
          <p className="mono text-xs text-muted-foreground">POST /job</p>
        </div>
        <span className="mono rounded-md bg-surface-2 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          docker
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mono mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground">
            image
          </label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="busybox"
            className="mono w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div>
          <label className="mono mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground">
            cmd <span className="opacity-60">(optional)</span>
          </label>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="sleep 100"
            className="mono w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {error && (
        <p className="mono mt-3 rounded-md border border-state-failed/40 bg-state-failed/10 px-3 py-2 text-xs text-state-failed">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
            Submitting…
          </>
        ) : (
          <>→ apply job</>
        )}
      </button>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mono mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          quick presets
        </p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.image + ex.cmd}
              type="button"
              onClick={() => {
                setImage(ex.image);
                setCmd(ex.cmd);
              }}
              className="mono rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground transition hover:border-ring hover:text-foreground"
            >
              {ex.image}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

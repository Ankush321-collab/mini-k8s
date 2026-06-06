export type JobState = "submitted" | "runnable" | "running" | "succeed" | "failed";

export interface Job {
  id: string | number;
  image: string;
  cmd?: string | null;
  state: JobState;
  containerId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "http://localhost:5000";

export const POLL_INTERVAL =
  Number(
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_POLL_INTERVAL_MS) || 3000,
  );

export const STATE_ORDER: JobState[] = ["submitted", "runnable", "running", "succeed"];

export async function pingHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createJob(image: string, cmd?: string): Promise<{ id: string | number }> {
  const res = await fetch(`${API_BASE}/job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, cmd: cmd || undefined }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with ${res.status}`);
  }
  const data = await res.json().catch(() => ({}));
  const id = data.id ?? data.jobId ?? data?.[0]?.id ?? crypto.randomUUID();
  return { id };
}

export async function fetchJobs(): Promise<Job[] | null> {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) return null;
    return (await res.json()) as Job[];
  } catch {
    return null;
  }
}

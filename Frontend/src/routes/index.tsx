import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BackgroundFX } from "@/components/k8s/BackgroundFX";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mini-K8S · A tiny container orchestrator" },
      { name: "description", content: "Mini-K8S is a lightweight Kubernetes-style control plane. Submit Docker images, watch jobs flow from queued to running to done — with real-time logs." },
      { property: "og:title", content: "Mini-K8S · A tiny container orchestrator" },
      { property: "og:description", content: "Submit, schedule, and monitor containerized workloads with a beautiful real-time UI." },
    ],
  }),
  component: Landing,
});

const STAGES = [
  {
    key: "submitted",
    label: "Submitted",
    desc: "Job is queued in the control plane.",
    badge: "border-state-submitted/40 bg-state-submitted/10 text-state-submitted",
    dot: "bg-state-submitted",
    pulse: false,
  },
  {
    key: "runnable",
    label: "Runnable",
    desc: "Dispatcher selects a worker.",
    badge: "border-state-runnable/40 bg-state-runnable/10 text-state-runnable",
    dot: "bg-state-runnable",
    pulse: false,
  },
  {
    key: "running",
    label: "Running",
    desc: "Docker container is live, streaming logs.",
    badge: "border-state-running/40 bg-state-running/10 text-state-running",
    dot: "bg-state-running",
    pulse: true,
  },
  {
    key: "succeed",
    label: "Succeeded",
    desc: "Container exits cleanly with code 0.",
    badge: "border-state-succeed/40 bg-state-succeed/10 text-state-succeed",
    dot: "bg-state-succeed",
    pulse: false,
  },
];

const FAKE_LOGS = [
  "[10:42:01] scheduler: received job a1b2c3 (image=busybox)",
  "[10:42:01] dispatcher: marked runnable, dispatching to worker-2",
  "[10:42:02] worker-2: docker pull busybox:latest",
  "[10:42:03] worker-2: docker run busybox echo 'hello mini-k8s'",
  "[10:42:03] runtime: container 7f3a91e2c started",
  "[10:42:03] stdout: hello mini-k8s",
  "[10:42:04] runtime: exit code 0 — container exited cleanly",
  "[10:42:04] scheduler: marked job a1b2c3 as succeeded ✓",
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundFX />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ rotate: -20, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
              <path d="m3 7 9 5 9-5M12 22V12" />
            </svg>
          </motion.div>
          <span className="mono text-sm font-semibold tracking-tight">mini-k8s</span>
        </div>
        <Link
          to="/jobs"
          className="mono rounded-md border border-border bg-card px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground transition hover:border-ring hover:text-foreground"
        >
          dashboard →
        </Link>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6">
        {/* HERO */}
        <section className="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mono mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur"
            >
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-state-succeed text-state-succeed" />
              control plane online
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
            >
              A tiny{" "}
              <span className="bg-gradient-to-r from-primary via-state-running to-state-succeed bg-clip-text text-transparent">
                Kubernetes
              </span>
              <br />
              for learning the real one.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg"
            >
              Submit a Docker image. Watch it flow through{" "}
              <span className="mono text-state-submitted">submitted</span> →{" "}
              <span className="mono text-state-runnable">runnable</span> →{" "}
              <span className="mono text-state-running">running</span> →{" "}
              <span className="mono text-state-succeed">succeed</span> in real time, with live container logs and a visual timeline.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/jobs"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--primary)_80%,transparent)] transition hover:scale-[1.03]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-state-running to-primary opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">Explore the cluster</span>
                <svg className="relative h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#how"
                className="mono inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur transition hover:border-ring hover:text-foreground"
              >
                how it works
              </a>
            </motion.div>
          </div>

          {/* 3D cube visual */}
          <div className="lg:col-span-5">
            <Cube3D />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="mono text-[11px] uppercase tracking-widest text-primary">// lifecycle</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">From submitted to succeed.</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Every workload travels through four states. The control plane tracks transitions; the worker pool runs your container.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 20, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6, rotateX: 6, rotateY: -6 }}
                style={{ transformStyle: "preserve-3d", perspective: 800 }}
                className="relative rounded-xl border border-border bg-card p-5 shadow-[0_10px_40px_-20px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
              >
                <div className="mono mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                  step 0{i + 1}
                </div>
                <div className={`mono inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wider ${s.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${s.pulse ? "pulse-dot" : ""}`} />
                  {s.label}
                </div>
                <p className="mt-3 text-sm text-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LIVE LOGS DEMO */}
        <section className="py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="mono text-[11px] uppercase tracking-widest text-primary">// streaming output</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Watch containers think out loud.</h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
                The inspector tails your container's stdout in real time. Each line types in as the runtime emits it — no manual refresh, no guessing.
              </p>
              <ul className="mono mt-5 space-y-2 text-xs text-muted-foreground">
                <li>→ visual state-machine timeline</li>
                <li>→ container id, exit codes, error messages</li>
                <li>→ schedules through the worker pool</li>
              </ul>
            </motion.div>

            <TerminalDemo />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-semibold tracking-tight md:text-3xl"
          >
            Ready to ship your first container?
          </motion.h3>
          <Link
            to="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--primary)_80%,transparent)] transition hover:scale-[1.03]"
          >
            Open the dashboard
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        <footer className="mono border-t border-border py-6 text-center text-[11px] text-muted-foreground">
          mini-k8s · built for learning · {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}



function Cube3D() {
  return (
    <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center" style={{ perspective: 1200 }}>
      <motion.div
        className="relative h-48 w-48"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        {[
          { t: "translateZ(96px)", c: "from-primary/40 to-primary/10", label: "pod" },
          { t: "rotateY(180deg) translateZ(96px)", c: "from-state-running/40 to-state-running/10", label: "node" },
          { t: "rotateY(90deg) translateZ(96px)", c: "from-state-succeed/40 to-state-succeed/10", label: "svc" },
          { t: "rotateY(-90deg) translateZ(96px)", c: "from-state-runnable/40 to-state-runnable/10", label: "job" },
          { t: "rotateX(90deg) translateZ(96px)", c: "from-state-failed/30 to-state-failed/5", label: "ctr" },
          { t: "rotateX(-90deg) translateZ(96px)", c: "from-primary/30 to-state-succeed/10", label: "api" },
        ].map((face, i) => (
          <div
            key={i}
            className={`absolute inset-0 flex items-center justify-center rounded-xl border border-border/60 bg-gradient-to-br ${face.c} backdrop-blur-md`}
            style={{ transform: face.t, backfaceVisibility: "hidden" }}
          >
            <span className="mono text-xs uppercase tracking-[0.3em] text-foreground/80">{face.label}</span>
          </div>
        ))}
      </motion.div>

      {/* orbit dots */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-4 h-2 w-2 -translate-x-1/2 rounded-full bg-state-succeed shadow-[0_0_20px] shadow-state-succeed" />
        <span className="absolute bottom-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-state-running shadow-[0_0_20px] shadow-state-running" />
      </motion.div>
    </div>
  );
}

function TerminalDemo() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    let i = 0;
    function cycle() {
      if (!active) return;
      if (i >= FAKE_LOGS.length) {
        setTimeout(() => {
          if (!active) return;
          setLines([]);
          i = 0;
          cycle();
        }, 2500);
        return;
      }
      setLines((prev) => [...prev, FAKE_LOGS[i]]);
      i++;
      setTimeout(cycle, 700);
    }
    cycle();
    return () => { active = false; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: 12 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      whileHover={{ rotateY: -4, rotateX: 4 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
    >
      <div className="flex items-center justify-between border-b border-border bg-surface/80 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-state-failed/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-running/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-succeed/80" />
        </div>
        <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
          mini-k8s · tail -f job/a1b2c3
        </span>
        <span className="mono text-[10px] text-muted-foreground">live</span>
      </div>
      <div className="mono min-h-[280px] space-y-1 bg-background p-4 text-[12px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line) return null;
          const color = line.includes("exit code 0") || line.includes("succeeded")
            ? "text-state-succeed"
            : line.includes("stdout")
              ? "text-foreground"
              : line.includes("error") || line.includes("non-zero")
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
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block h-3 w-2 translate-y-0.5 bg-primary"
        />
      </div>
    </motion.div>
  );
}

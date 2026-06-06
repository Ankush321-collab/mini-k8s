import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useCluster } from "@/contexts/ClusterContext";
import { JobTable } from "@/components/k8s/JobTable";
import { JobDetails } from "@/components/k8s/JobDetails";
import { TerminalLogViewer } from "@/components/k8s/TerminalLogViewer";
import { ClusterMetricsChart } from "@/components/k8s/ClusterMetricsChart";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobView,
});

function JobView() {
  const { jobId } = Route.useParams();
  const { jobs } = useCluster();
  const navigate = useNavigate();

  const selected = useMemo(
    () => jobs.find((j) => String(j.id) === jobId) || null,
    [jobs, jobId],
  );

  if (!selected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="mono text-muted-foreground">job not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-12">
      <motion.div 
        initial={{ opacity: 0, x: 12, rotateY: -8 }} 
        animate={{ opacity: 1, x: 0, rotateY: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }} 
        whileHover={{ rotateY: 2, rotateX: 2 }}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        className="w-full h-[600px]"
      >
        <TerminalLogViewer job={selected} />
      </motion.div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.05 }} 
          whileHover={{ rotateY: -1, rotateX: 1 }}
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          className="min-h-[400px]"
        >
          <JobDetails job={selected} hideLogs={true} />
        </motion.div>

        {selected.state === "succeed" && (
          <motion.div 
            initial={{ opacity: 0, y: 12, rotateX: 10 }} 
            animate={{ opacity: 1, y: 0, rotateX: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ rotateY: 1, rotateX: -1 }}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            className="min-h-[400px]"
          >
            <ClusterMetricsChart jobs={jobs} />
          </motion.div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        whileHover={{ rotateY: 1, rotateX: 1 }}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        className="w-full h-[500px]"
      >
        <JobTable jobs={jobs} selectedId={selected.id} onSelect={(id) => navigate({ to: `/jobs/${id}` })} />
      </motion.div>

      {/* Floating Apply New Job Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
        whileHover={{ scale: 1.05, rotate: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Link
          to="/jobs"
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_10px_40px_-10px_color-mix(in_oklab,var(--primary)_80%,transparent)] transition-all hover:bg-primary/90 hover:shadow-[0_20px_60px_-15px_color-mix(in_oklab,var(--primary)_100%,transparent)]"
        >
          <span className="text-xl leading-none">+</span> Apply New Job
        </Link>
      </motion.div>
    </div>
  );
}

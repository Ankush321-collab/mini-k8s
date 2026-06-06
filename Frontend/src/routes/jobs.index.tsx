import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useCluster } from "@/contexts/ClusterContext";
import { CreateJobForm } from "@/components/k8s/CreateJobForm";
import { JobTable } from "@/components/k8s/JobTable";
import { JobDetails } from "@/components/k8s/JobDetails";

export const Route = createFileRoute("/jobs/")({
  component: Dashboard,
});

function Dashboard() {
  const { jobs, createLocalJob } = useCluster();
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const navigate = useNavigate();

  const selected = useMemo(
    () => jobs.find((j) => j.id === selectedId) || null,
    [jobs, selectedId],
  );

  function handleCreated(meta: { id: string | number; image: string; cmd?: string }) {
    const now = new Date().toISOString();
    createLocalJob({
      id: meta.id,
      image: meta.image,
      cmd: meta.cmd || null,
      state: "submitted",
      containerId: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    });
    navigate({ to: `/jobs/${meta.id}` });
  }

  return (
    <div className="flex flex-col gap-10 pb-12">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -12, rotateY: 8 }} 
          animate={{ opacity: 1, x: 0, rotateY: 0 }} 
          transition={{ duration: 0.5 }} 
          whileHover={{ rotateY: -2, rotateX: 2 }}
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          className="min-h-[400px]"
        >
          <CreateJobForm onCreated={handleCreated} />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 12, rotateY: -8 }} 
          animate={{ opacity: 1, x: 0, rotateY: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }} 
          whileHover={{ rotateY: 2, rotateX: 2 }}
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          className="min-h-[400px]"
        >
          <JobDetails job={selected} />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.05 }} 
        whileHover={{ rotateY: -1, rotateX: 1 }}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        className="w-full h-[500px]"
      >
        <JobTable jobs={jobs} selectedId={selectedId} onSelect={(id) => navigate({ to: `/jobs/${id}` })} />
      </motion.div>
    </div>
  );
}

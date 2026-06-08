import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import { Alert, Badge, Button, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import { ChevronRight, Plus } from "lucide-react";

const statusVariant = {
  OPEN: "primary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export default function ClientJobs() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs/my_jobs/");
        setJobs(res.data.results || res.data);
      } catch (e) {
        console.error(e);
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "CLIENT") fetchJobs();
  }, [user]);

  return (
    <AppShell title="My Jobs" subtitle="Review all jobs you have posted.">
      <PageHeader
        title="My Jobs"
        description="Manage your postings, proposals, and hiring progress."
        actions={<Link to="/client/jobs/new"><Button icon={Plus}>Create job</Button></Link>}
      />

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {loading ? (
        <LoadingState label="Loading your jobs..." />
      ) : jobs.length === 0 ? (
        <EmptyState title="You have not posted any jobs yet" description="Create a clear brief to start receiving proposals." action={<Link to="/client/jobs/new"><Button icon={Plus}>Create a job</Button></Link>} />
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <Link key={job.id} to={`/client/jobs/${job.id}`} className="flex flex-col gap-4 p-6 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{job.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                    <span>{job.budget_type === "HOURLY" ? "Hourly" : "Fixed"}</span>
                    <span>${job.budget_min}{job.budget_max > job.budget_min && ` - $${job.budget_max}`}</span>
                    <span>{job.bid_count || 0} proposals</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[job.status] || "neutral"}>{job.status.replace("_", " ")}</Badge>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </AppShell>
  );
}

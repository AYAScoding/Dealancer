import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AppShell from "../components/AppShell";
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader, TextInput } from "../components/ui";
import { Briefcase, Clock, Filter, Search, SlidersHorizontal } from "lucide-react";

export default function JobMarketplace() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [budgetType, setBudgetType] = useState("ALL");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs/");
        const data = res.data.results || res.data;
        setJobs(data.filter((job) => job.status === "OPEN"));
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.categories?.some((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBudget = budgetType === "ALL" || job.budget_type === budgetType;
    return matchesSearch && matchesBudget;
  }), [jobs, searchTerm, budgetType]);

  return (
    <AppShell title="Find Jobs" subtitle="Browse active client work and submit proposals.">
      <PageHeader
        title="Job marketplace"
        description="Search active assignments and choose work that matches your expertise."
      />

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput
              placeholder="Search jobs, categories, or skills"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "FIXED", "HOURLY"].map((type) => (
              <button
                key={type}
                onClick={() => setBudgetType(type)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  budgetType === type ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type === "ALL" ? "All" : type === "FIXED" ? "Fixed" : "Hourly"}
              </button>
            ))}
            <Button variant="secondary" icon={SlidersHorizontal}>Advanced</Button>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <DemoFilter icon={Filter} title="Saved searches" text="Coming soon" />
        <DemoFilter icon={Briefcase} title="Best matches" text={`${filteredJobs.length} open jobs`} />
        <DemoFilter icon={Clock} title="Fresh work" text="Sorted by newest" />
      </div>

      {loading ? (
        <LoadingState label="Loading open jobs..." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState title="No active jobs found" description="Try a different search or check back when new client work is posted." />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block">
              <Card className="p-6 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg hover:shadow-slate-200/70">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl font-black text-slate-950">{job.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.categories?.map((cat) => <Badge key={cat.id} variant="primary">{cat.name}</Badge>)}
                      <Badge variant="success">{job.budget_type === "FIXED" ? "Fixed price" : "Hourly"}</Badge>
                    </div>
                  </div>
                  <div className="lg:text-right">
                    <p className="text-2xl font-black text-slate-950">${job.budget_min}{job.budget_max > job.budget_min && ` - $${job.budget_max}`}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{job.bid_count || 0} proposals</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-500"><Clock className="h-4 w-4" /> Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  <span className="text-sm font-bold text-cyan-700">View and apply</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function DemoFilter({ icon: Icon, title, text }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-950">{title}</p>
          <p className="text-xs text-slate-500">{text}</p>
        </div>
      </div>
    </Card>
  );
}

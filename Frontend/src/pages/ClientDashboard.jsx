import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import { BarChart3, Bell, Briefcase, ChevronRight, Plus, ShieldCheck, Star, Users } from "lucide-react";

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [profileRes, jobsRes, contractsRes] = await Promise.all([
          api.get("/auth/me/profile/"),
          api.get("/jobs/my_jobs/"),
          api.get("/contracts/"),
        ]);
        setProfile(profileRes.data);
        setJobs(jobsRes.data.results || jobsRes.data);
        setContracts(contractsRes.data.results || contractsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const activePostings = jobs.filter((job) => job.status === "OPEN").length;
  const newProposals = jobs.reduce((total, job) => total + (job.bid_count || 0), 0);
  const activeContracts = contracts.filter((contract) => contract.status === "ACTIVE").length;
  const recentJobs = jobs.slice(0, 4);

  return (
    <AppShell title="Client Dashboard" subtitle="Post jobs, review proposals, and manage active work.">
      <PageHeader
        title={`Welcome, ${user?.first_name || "there"}`}
        description={profile?.company_name || "Complete your company profile to improve marketplace trust."}
        actions={
          <Link to="/client/jobs/new">
            <Button icon={Plus}>Post a job</Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Briefcase} label="Active postings" value={loading ? "..." : activePostings} tone="cyan" />
        <StatCard icon={Users} label="New proposals" value={loading ? "..." : newProposals} tone="violet" />
        <StatCard icon={ShieldCheck} label="Active contracts" value={loading ? "..." : activeContracts} tone="emerald" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">Recent job postings</h2>
              <p className="mt-1 text-sm text-slate-500">Your latest work opportunities and proposal counts.</p>
            </div>
            <Link to="/client/jobs" className="text-sm font-bold text-cyan-700 hover:text-cyan-900">View all</Link>
          </div>
          {loading ? (
            <div className="p-6"><LoadingState label="Loading recent jobs..." /></div>
          ) : recentJobs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <Link key={job.id} to={`/client/jobs/${job.id}`} className="flex items-center justify-between gap-4 p-6 transition hover:bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-950">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                      <span>${job.budget_min} - ${job.budget_max}</span>
                      <Badge variant={job.status === "OPEN" ? "primary" : job.status === "IN_PROGRESS" ? "warning" : "neutral"}>
                        {job.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="text-sm font-semibold">{job.bid_count || 0} proposals</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <EmptyState title="No jobs yet" description="Post your first job to begin receiving proposals." action={<Link to="/client/jobs/new"><Button icon={Plus}>Create job</Button></Link>} />
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-black text-slate-950">Demo-ready modules</h2>
            <div className="mt-5 space-y-3">
              <DemoItem icon={Star} title="Saved freelancers" text="Shortlist talent for future projects." />
              <DemoItem icon={Bell} title="Notifications" text="Proposal and contract updates." />
              <DemoItem icon={BarChart3} title="Hiring analytics" text="Track spend, proposals, and completion." />
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-black text-slate-950">Subscription plan</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Starter workspace with premium search and admin insights reserved for future plans.</p>
            <Button variant="secondary" className="mt-5 w-full">View plans</Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <Card className="p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="text-3xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function DemoItem({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

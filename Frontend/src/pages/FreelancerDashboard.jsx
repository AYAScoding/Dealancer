import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import { Briefcase, ChevronRight, MessageSquare, Search, Send, Star, UserRoundCheck, WalletCards } from "lucide-react";

export default function FreelancerDashboard() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [bids, setBids] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [profileRes, bidsRes, jobsRes, contractsRes] = await Promise.all([
          api.get("/auth/me/profile/"),
          api.get("/bids/"),
          api.get("/jobs/"),
          api.get("/contracts/"),
        ]);
        setProfile(profileRes.data);
        setBids(bidsRes.data.results || bidsRes.data);
        setJobs((jobsRes.data.results || jobsRes.data).filter((job) => job.status === "OPEN"));
        setContracts(contractsRes.data.results || contractsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const activeProposals = bids.filter((bid) => bid.status === "PENDING").length;
  const activeJobs = contracts.filter((contract) => contract.status === "ACTIVE").length;
  const recommendedJobs = jobs.slice(0, 4);

  return (
    <AppShell title="Freelancer Dashboard" subtitle="Browse work, manage proposals, and track contracts.">
      <PageHeader
        title={`Welcome back, ${user?.first_name || "there"}`}
        description={profile?.bio ? `${profile.bio.substring(0, 90)}${profile.bio.length > 90 ? "..." : ""}` : "Complete your profile to help clients trust your expertise."}
        actions={<Link to="/jobs"><Button icon={Search}>Browse jobs</Button></Link>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Send} label="Active proposals" value={loading ? "..." : activeProposals} tone="amber" />
        <StatCard icon={Briefcase} label="Active jobs" value={loading ? "..." : activeJobs} tone="emerald" />
        <StatCard icon={Star} label="Rating" value={profile?.avg_rating || "0.00"} tone="yellow" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">Recommended jobs</h2>
              <p className="mt-1 text-sm text-slate-500">Open projects matched from the current marketplace.</p>
            </div>
            <Link to="/jobs" className="text-sm font-bold text-cyan-700 hover:text-cyan-900">View all</Link>
          </div>
          {loading ? (
            <div className="p-6"><LoadingState label="Loading recommended jobs..." /></div>
          ) : recommendedJobs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recommendedJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center justify-between gap-4 p-6 transition hover:bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-950">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                      <span>${job.budget_min} - ${job.budget_max}</span>
                      <Badge variant="primary">{job.categories?.[0]?.name || "General"}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <EmptyState title="No open jobs right now" description="New work will appear here as clients post jobs." />
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-black text-slate-950">Portfolio highlights</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Showcase case studies, featured reviews, and availability in a future profile upgrade.</p>
            <div className="mt-5 space-y-3">
              <DemoItem icon={UserRoundCheck} title="Profile strength" text="Categories, skills, bio, rate, portfolio." />
              <DemoItem icon={MessageSquare} title="Messages" text="Client communication placeholder." />
              <DemoItem icon={WalletCards} title="Earnings" text="Future payments and invoices." />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    yellow: "bg-yellow-50 text-yellow-700",
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

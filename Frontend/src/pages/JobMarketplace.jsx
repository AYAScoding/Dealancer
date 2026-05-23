import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Search, MapPin, Clock, Briefcase, Filter } from "lucide-react";

export default function JobMarketplace() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs/");
        const data = res.data.results || res.data;
        // Filter out non-open jobs if any slip through
        setJobs(data.filter(j => j.status === "OPEN"));
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.categories && job.categories.some(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex justify-center items-center">
            <Briefcase className="text-primary w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-900">Job Marketplace</span>
        </div>
        <button
          onClick={() => navigate("/freelancer/dashboard")}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          Back to Dashboard
        </button>
      </header>

      <main className="flex-1 p-8 max-w-6xl w-full mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for active assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm text-slate-900 transition-shadow"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-8 py-4 rounded-2xl font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white/50 border border-slate-100 rounded-3xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-slate-900">No active jobs found</h3>
            <p className="text-slate-500 mt-2 text-lg">Check back later or adjust your search.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all relative group cursor-pointer"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {job.title}
                    </h2>
                    {job.categories && job.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.categories.map((cat) => (
                          <span key={cat.id} className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-semibold uppercase tracking-wider">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-2xl text-slate-900">
                      ${job.budget_min} {job.budget_max > job.budget_min && `- $${job.budget_max}`}
                    </p>
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full mt-2 font-bold tracking-wide">
                      {job.budget_type === "FIXED" ? "FIXED PRICE" : "HOURLY"}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between border-t border-slate-100 pt-6">
                  <div className="flex gap-6 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    {job.deadline && (
                      <div className="flex items-center gap-1.5 text-orange-600">
                        <MapPin className="w-4 h-4" />
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Briefcase className="w-4 h-4" />
                      {job.bid_count} Bids
                    </div>
                  </div>
                  <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-bold transition-transform group-hover:scale-105">
                    View & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

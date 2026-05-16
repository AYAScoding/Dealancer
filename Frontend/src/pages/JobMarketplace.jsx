import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Search, Filter, Clock, MapPin, DollarSign, Briefcase } from "lucide-react";

export default function JobMarketplace() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs/");
        // Depending on DRF pagination, structure might be res.data.results
        setJobs(res.data.results || res.data);
      } catch (e) {
        console.error("Failed to fetch jobs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Briefcase className="text-primary"/>
            <span className="font-bold text-xl">Job Marketplace</span>
         </div>
         <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-900">Back</button>
      </header>

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search for jobs, skills, or keywords..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5"/> Filters
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <h3 className="text-xl font-medium text-slate-900">No jobs found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
                 <div className="flex justify-between items-start">
                    <div className="max-w-2xl">
                       <h2 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{job.title}</h2>
                       <p className="mt-2 text-slate-600 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-lg text-slate-900">${job.budget}</p>
                       <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full mt-2 font-medium">
                         {job.duration || "Flexible"}
                       </span>
                    </div>
                 </div>
                 
                 <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> Posted {new Date(job.created_at).toLocaleDateString()}</div>
                    {/* Mocked fields below since backend categorization might vary */}
                    <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Remote Worldwide</div>
                    <div className="flex gap-2 ml-auto">
                        <button className="text-primary font-medium hover:underline">View Details</button>
                        <button className="bg-primary text-white px-4 py-1.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">Apply</button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

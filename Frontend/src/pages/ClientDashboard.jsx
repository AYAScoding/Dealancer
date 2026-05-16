import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { Plus, Briefcase, ChevronRight, LogOut } from "lucide-react";

export default function ClientDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me/profile/");
        setProfile(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation mocked */}
      <aside className="w-64 glass-dark hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Dealancer</h2>
          <p className="text-slate-400 text-sm mt-1">Client Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/client/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-medium">
            <LayoutDashboard className="w-5 h-5"/> Dashboard
          </Link>
          <Link to="/client/jobs/new" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors">
            <Plus className="w-5 h-5"/> Post a Job
          </Link>
        </nav>
        <div className="p-4">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors">
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.first_name}</h1>
            <p className="text-slate-500 mt-1">{profile?.company_name ? profile.company_name : "Complete your profile details"}</p>
          </div>
          <Link to="/client/jobs/new" className="hidden sm:flex bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md items-center gap-2">
            <Plus className="w-5 h-5"/> Create Job
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
               <Briefcase />
             </div>
             <div>
               <p className="text-sm text-slate-500 font-medium">Active Postings</p>
               <p className="text-2xl font-bold text-slate-900">3</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
               <Users />
             </div>
             <div>
               <p className="text-sm text-slate-500 font-medium">New Proposals</p>
               <p className="text-2xl font-bold text-slate-900">12</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
               <ShieldCheck />
             </div>
             <div>
               <p className="text-sm text-slate-500 font-medium">Active Contracts</p>
               <p className="text-2xl font-bold text-slate-900">1</p>
             </div>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Recent Job Postings</h2>
            <button className="text-sm text-primary font-medium hover:text-primary-dark">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {/* Mocked jobs */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors flex justify-between items-center cursor-pointer group">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">Senior React Developer for Marketplace UI</h3>
                  <div className="flex gap-4 mt-2 text-sm text-slate-500">
                    <span>Budget: $2,000 - $4,000</span>
                    <span>•</span>
                    <span>Posted 2 days ago</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400 group-hover:text-primary">
                  <span className="text-sm font-medium">4 Proposals</span>
                  <ChevronRight size={20}/>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

// Inline imports missing above
import { LayoutDashboard, Users, ShieldCheck } from "lucide-react";

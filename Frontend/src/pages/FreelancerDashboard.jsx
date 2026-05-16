import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { Search, LayoutDashboard, Send, Star, LogOut, ChevronRight } from "lucide-react";

export default function FreelancerDashboard() {
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
          <p className="text-slate-400 text-sm mt-1">Freelancer Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/freelancer/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-medium">
            <LayoutDashboard className="w-5 h-5"/> Dashboard
          </Link>
          <Link to="/jobs" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors">
            <Search className="w-5 h-5"/> Find Jobs
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
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.first_name}</h1>
            <p className="text-slate-500 mt-1">{profile?.bio ? (profile.bio.substring(0, 50) + "...") : "Complete your profile to attract more clients!"}</p>
          </div>
          <Link to="/jobs" className="hidden sm:flex bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md items-center gap-2">
            <Search className="w-5 h-5"/> Browse Jobs
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
               <Send />
             </div>
             <div>
               <p className="text-sm text-slate-500 font-medium">Active Proposals</p>
               <p className="text-2xl font-bold text-slate-900">7</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
               <span className="font-bold text-lg">$</span>
             </div>
             <div>
               <p className="text-sm text-slate-500 font-medium">Earnings (Mock)</p>
               <p className="text-2xl font-bold text-slate-900">$2,450</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
               <Star />
             </div>
             <div>
               <p className="text-sm text-slate-500 font-medium">My Rating</p>
               <p className="text-2xl font-bold text-slate-900">{profile?.avg_rating || "0.00"}</p>
             </div>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Recommended Jobs</h2>
            <Link to="/jobs" className="text-sm text-primary font-medium hover:text-primary-dark">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {/* Mocked recommendations */}
            {[1, 2].map((i) => (
              <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer group">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">Looking for Django REST API Expert</h3>
                  <div className="flex gap-4 mt-2 text-sm text-slate-500">
                    <span>Budget: $500 - $1,000</span>
                    <span>•</span>
                    <span>Backend Development</span>
                  </div>
                </div>
                <button className="mt-4 sm:mt-0 text-primary font-medium flex items-center gap-1 group-hover:underline">
                  Submit Proposal <ChevronRight size={16}/>
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

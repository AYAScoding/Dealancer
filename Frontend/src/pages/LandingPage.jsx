import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden flex flex-col">
      {/* Navbar */}
      <nav className="glass fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl tracking-tight text-slate-900">
                Dealancer
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-slate-600 hover:text-primary font-medium">Log in</Link>
              <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow pt-32 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="max-w-4xl max-auto text-center z-10 space-y-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            The next generation <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">freelance marketplace</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with elite talent and visionary clients seamlessly. Secure, powerful, and built for modern professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/register?role=FREELANCER" className="glass py-4 px-8 rounded-xl font-semibold text-lg hover:bg-white/90 transform hover:scale-105 transition-all text-primary flex items-center justify-center gap-2">
              <Users className="w-5 h-5"/> Find Work
            </Link>
            <Link to="/register?role=CLIENT" className="bg-slate-900 text-white py-4 px-8 rounded-xl font-semibold shadow-2xl hover:bg-slate-800 text-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2">
              <LayoutDashboard className="w-5 h-5"/> Post a Job
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
             <div className="glass p-6 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Briefcase size={80}/></div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Verified Projects</h3>
               <p className="text-slate-600">Access thousands of high-quality, verified job postings across multiple industries.</p>
             </div>
             <div className="glass p-6 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ShieldCheck size={80}/></div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Payments</h3>
               <p className="text-slate-600">Your funds are protected with industry-leading escrow and milestone tracking features.</p>
             </div>
             <div className="glass p-6 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={80}/></div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Global Network</h3>
               <p className="text-slate-600">Hire professionals worldwide and scale your business operations effortlessly.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

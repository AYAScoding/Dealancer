import { Link } from "react-router-dom";
import { BarChart3, Briefcase, CheckCircle, MessageSquare, ShieldCheck, Star, Users } from "lucide-react";
import heroImage from "../assets/hero.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-cyan-300">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight">Dealancer</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
              Log in
            </Link>
            <Link to="/register" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative min-h-[92vh] overflow-hidden pt-16">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl animate-in">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
                Trusted work marketplace demo
              </div>
              <h1 className="text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
                Dealancer
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
                A focused freelance marketplace where clients post clear work, freelancers submit proposals, and both sides manage active contracts with confidence.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/register?role=CLIENT" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-200 hover:-translate-y-0.5">
                  <Briefcase className="h-4 w-4" /> Hire talent
                </Link>
                <Link to="/register?role=FREELANCER" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/15 hover:-translate-y-0.5">
                  <Users className="h-4 w-4" /> Find work
                </Link>
              </div>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              {[
                ["Active contracts", "Track delivery from hire to completion."],
                ["Proposal workflow", "Review bids and hire from one place."],
                ["Profile readiness", "Keep marketplace interactions trustworthy."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="font-bold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              [MessageSquare, "Messages", "Static preview for client-freelancer chat."],
              [BarChart3, "Analytics", "Pipeline, proposal, and contract insight placeholders."],
              [Star, "Reviews", "Ratings surface for future completed contracts."],
              [CheckCircle, "Saved talent", "Shortlist freelancers for later hiring."],
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Briefcase, Clock, FileText, Send, CheckCircle, XCircle } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Bidding states
  const [bidding, setBidding] = useState(false);
  const [bidForm, setBidForm] = useState({
    cover_letter: "",
    proposed_amount: "",
    estimated_days: ""
  });
  const [bidStatus, setBidStatus] = useState("idle"); // idle, loading, success, error
  const [bidMessage, setBidMessage] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}/`);
        setJob(res.data);
      } catch (err) {
        console.error("Failed to fetch job details:", err);
        setError("Failed to load job. It may have been removed or you don't have access.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidStatus("loading");
    setBidMessage("");
    
    try {
      await api.post("/bids/", {
        job: job.id,
        cover_letter: bidForm.cover_letter,
        proposed_amount: parseFloat(bidForm.proposed_amount),
        estimated_days: parseInt(bidForm.estimated_days, 10)
      });
      setBidStatus("success");
      setBidMessage("Your proposal has been submitted successfully!");
      setBidding(false);
      // Optimistically push the new bid into the UI
      setJob(prev => ({
        ...prev, 
        bids: [...prev.bids, { 
          id: 'temp', 
          cover_letter: bidForm.cover_letter, 
          proposed_amount: bidForm.proposed_amount,
          status: 'PENDING'
        }]
      }));
    } catch (err) {
      setBidStatus("error");
      const errMsgs = Object.values(err.response?.data || {}).flat().join(" | ");
      setBidMessage(errMsgs || "Failed to submit proposal. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-center">
        <div className="bg-white p-10 max-w-lg mx-auto rounded-3xl shadow-sm border border-slate-200">
           <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
           <p className="text-slate-600 mb-6">{error}</p>
           <button onClick={() => navigate("/jobs")} className="bg-primary text-white px-6 py-2 rounded-xl">Back to Jobs</button>
        </div>
      </div>
    );
  }

  const hasBid = job.bids && job.bids.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/jobs")} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-5 h-5"/> Back to Marketplace
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-t-3xl shadow-sm border border-slate-200 p-8">
           <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-3">{job.title}</h1>
                <div className="flex flex-wrap gap-3">
                  {job.category && (
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary-dark text-xs font-bold rounded-lg uppercase">
                      {job.category.name}
                    </span>
                  )}
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase border border-slate-200">
                    {job.budget_type === "HOURLY" ? "Hourly Rate" : "Fixed Price"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                 <div className="text-3xl font-black text-slate-900">
                   ${job.budget_min} {job.budget_max > job.budget_min && `- $${job.budget_max}`}
                 </div>
                 <p className="text-sm text-slate-500 font-medium mt-1">Posted by {job.client}</p>
              </div>
           </div>
        </div>

        {/* Job Details & Description */}
        <div className="bg-white shadow-sm border-x border-b border-slate-200 p-8 border-t-0 space-y-8">
           <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900">
                <FileText className="w-5 h-5 text-primary" /> Project Description
              </h2>
              <div className="prose prose-slate max-w-none">
                 <p className="whitespace-pre-wrap text-slate-600 leading-relaxed text-lg">{job.description}</p>
              </div>
           </div>

           {/* Skills */}
           {job.skills_required && job.skills_required.length > 0 && (
             <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                   {job.skills_required.map(skillId => (
                     <span key={skillId} className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-sm font-medium">
                       Skill ID: {skillId}
                     </span>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Bid Status Banner */}
        {bidStatus === "success" && (
           <div className="my-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
             <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
             <p className="font-medium text-emerald-700">{bidMessage}</p>
           </div>
        )}
        
        {bidStatus === "error" && (
           <div className="my-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
             <XCircle className="w-6 h-6 text-red-600 shrink-0" />
             <p className="font-medium text-red-700">{bidMessage}</p>
           </div>
        )}

        {/* Action Area */}
        <div className="bg-slate-50 border border-slate-200 rounded-b-3xl p-8 text-center flex flex-col items-center shadow-sm">
           
           {hasBid ? (
             <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full text-center">
                 <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                 <h3 className="text-xl font-bold text-slate-900">You've successfully applied</h3>
                 <p className="text-slate-500 mt-1">Your proposal is currently pending review by the client.</p>
                 <div className="mt-4 inline-block bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold">
                    Bid Amount: ${job.bids[0].proposed_amount}
                 </div>
             </div>
           ) : !bidding ? (
             <>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to take on this project?</h3>
               <p className="text-slate-500 mb-6">Submit a compelling proposal to win this job.</p>
               <button onClick={() => setBidding(true)} className="bg-primary hover:bg-primary-dark text-white text-lg px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                  Write Proposal
               </button>
             </>
           ) : (
             <form onSubmit={handleBidSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm w-full text-left animate-in fade-in slide-in-from-bottom-4">
                 <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <Send className="w-5 h-5 text-primary" /> Submit Your Proposal
                 </h3>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Proposed Amount ($)</label>
                      <input 
                        type="number" required min="1" step="0.01" 
                        value={bidForm.proposed_amount} onChange={e => setBidForm({...bidForm, proposed_amount: e.target.value})}
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary outline-none" 
                        placeholder="e.g. 800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Estimated Days to Deliver</label>
                      <input 
                        type="number" required min="1" 
                        value={bidForm.estimated_days} onChange={e => setBidForm({...bidForm, estimated_days: e.target.value})}
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary outline-none" 
                        placeholder="e.g. 5"
                      />
                    </div>
                 </div>

                 <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Cover Letter</label>
                    <textarea 
                      required rows="6" 
                      value={bidForm.cover_letter} onChange={e => setBidForm({...bidForm, cover_letter: e.target.value})}
                      className="w-full p-4 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary outline-none" 
                      placeholder="Introduce yourself and explain why you're perfect for this job..."
                    />
                 </div>

                 <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setBidding(false)} className="px-6 py-3 font-medium text-slate-500 hover:text-slate-900">Cancel</button>
                    <button type="submit" disabled={bidStatus === "loading"} className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-md disabled:opacity-50 hover:bg-primary-dark">
                      {bidStatus === "loading" ? "Submitting..." : "Send Proposal"}
                    </button>
                 </div>
             </form>
           )}
        </div>
      </div>
    </div>
  );
}

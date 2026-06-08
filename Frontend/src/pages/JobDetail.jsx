import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Briefcase, FileText, Send, CheckCircle, XCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
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
  const [hiringBidId, setHiringBidId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchJob = useCallback(async () => {
    try {
      const res = await api.get(`/jobs/${id}/`);
      setJob(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch job details:", err);
      setError("Failed to load job. It may have been removed or you don't have access.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJob();
  }, [fetchJob]);

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
          freelancer_id: user?.id,
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

  const handleHire = async (bidId) => {
    if (!window.confirm("Are you sure you want to hire this freelancer?")) return;
    setHiringBidId(bidId);
    setActionError("");
    setActionMessage("");
    try {
      const res = await api.post(`/bids/${bidId}/accept/`);
      const acceptedBid = res.data;
      setJob(prev => ({
        ...prev,
        status: "IN_PROGRESS",
        bids: prev.bids.map(b => b.id === bidId ? { ...b, ...acceptedBid, status: "ACCEPTED" } : { ...b, status: "REJECTED" })
      }));
      setActionMessage("Freelancer hired successfully. A contract has been created in Active Work.");
    } catch (err) {
      const refreshedJob = await fetchJob();
      const acceptedAfterRefresh = refreshedJob?.bids?.some((bid) => bid.id === bidId && bid.status === "ACCEPTED");
      if (acceptedAfterRefresh || refreshedJob?.status === "IN_PROGRESS") {
        setActionMessage("Freelancer hired successfully. A contract has been created in Active Work.");
      } else {
        setActionError(err.response?.data?.detail || "Hiring failed. Please try again.");
      }
    } finally {
      setHiringBidId(null);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      const res = await api.patch(`/jobs/${job.id}/update_status/`, { status: newStatus });
      setJob(prev => ({ ...prev, status: res.data.status }));
    } catch (err) {
      setActionError(err.response?.data?.detail || "Failed to update status.");
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
           <button onClick={() => navigate("/client/jobs")} className="bg-primary text-white px-6 py-2 rounded-xl">Back to Jobs</button>
        </div>
      </div>
    );
  }

  const isOwner = user && job && user.id === job.client_id;
  const isFreelancer = user && user.role === "FREELANCER";
  const hasBid = job.bids && job.bids.some(b => b.freelancer_id === user?.id);
  const backPath = isOwner ? "/client/jobs" : "/jobs";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(backPath)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-5 h-5"/> Back to Marketplace
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-t-3xl shadow-sm border border-slate-200 p-8">
           <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-extrabold text-slate-900">{job.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${job.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                      job.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                      job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {job.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {job.categories && job.categories.map((cat) => (
                    <span key={cat.id} className="inline-block px-3 py-1 bg-primary/10 text-primary-dark text-xs font-bold rounded-lg uppercase">
                      {cat.name}
                    </span>
                  ))}
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
                   {job.skills_required.map(skill => (
                     <span key={skill.id} className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-sm font-medium">
                       {skill.name} <span className="text-[10px] text-slate-400 font-normal">({skill.category?.name})</span>
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

        {actionMessage && (
           <div className="my-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
             <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
             <p className="font-medium text-emerald-700">{actionMessage}</p>
           </div>
        )}

        {actionError && (
           <div className="my-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
             <XCircle className="w-6 h-6 text-red-600 shrink-0" />
             <p className="font-medium text-red-700">{actionError}</p>
           </div>
        )}

        {/* Action Area */}
        <div className="bg-slate-50 border border-slate-200 rounded-b-3xl p-8 shadow-sm">
           
           {isOwner ? (
             <div className="w-full text-left">
               <h3 className="text-2xl font-bold mb-4">Manage Job</h3>
               <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-slate-200">
                 {job.status === "OPEN" && (
                   <button onClick={() => handleUpdateStatus("CANCELLED")} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-6 py-3 rounded-xl transition-colors">Cancel Job</button>
                 )}
                 {job.status === "IN_PROGRESS" && (
                   <>
                     <button onClick={() => handleUpdateStatus("COMPLETED")} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold px-6 py-3 rounded-xl transition-colors">Mark Completed</button>
                     <button onClick={() => handleUpdateStatus("CANCELLED")} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-6 py-3 rounded-xl transition-colors">Cancel Job</button>
                   </>
                 )}
                 {job.status === "COMPLETED" && (
                   <p className="text-slate-500 font-medium text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> This job has been successfully completed.</p>
                 )}
                 {job.status === "CANCELLED" && (
                   <p className="text-slate-500 font-medium text-lg flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" /> This job was cancelled.</p>
                 )}
               </div>

               <h4 className="text-xl font-bold mb-6 flex items-center gap-2">Proposals <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-sm">{job.bids?.length || 0}</span></h4>
               {job.bids && job.bids.length > 0 ? (
                 <div className="space-y-4">
                   {job.bids.map(bid => (
                     <div key={bid.id} className={`bg-white p-6 rounded-2xl border ${bid.status === 'ACCEPTED' ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-slate-200'} shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:shadow-md`}>
                       <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                           <p className="font-bold text-lg text-slate-900">{bid.freelancer}</p>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider
                            ${bid.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                              bid.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                             {bid.status}
                           </span>
                         </div>
                         <p className="text-slate-600 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">{bid.cover_letter}</p>
                         <div className="flex gap-4 text-sm font-medium text-slate-700">
                           <span className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong>Amount:</strong> ${bid.proposed_amount}</span>
                           <span className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg"><strong>Duration:</strong> {bid.estimated_days} days</span>
                         </div>
                       </div>
                       {job.status === "OPEN" && bid.status === "PENDING" && (
                         <button
                           onClick={() => handleHire(bid.id)}
                           disabled={hiringBidId === bid.id}
                           className="bg-slate-950 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shrink-0 shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                         >
                           {hiringBidId === bid.id ? "Hiring..." : "Hire Freelancer"}
                         </button>
                       )}
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 border-dashed">
                   <p className="text-slate-500 font-medium">No proposals have been submitted yet.</p>
                 </div>
               )}
             </div>
           ) : isFreelancer ? (
               hasBid ? (
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full max-w-lg mx-auto text-center shadow-sm">
                     <Briefcase className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Proposal Status</h3>
                     <p className="text-slate-500 mb-6">Your proposal is currently <strong className="text-slate-700">{job.bids.find(b => b.freelancer_id === user.id)?.status}</strong>.</p>

                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                       <p className="text-sm text-slate-500 mb-1">Proposed Amount</p>
                       <p className="font-bold text-slate-900 text-lg">${job.bids[0].proposed_amount}</p>
                     </div>
                 </div>
               ) : job.status === "OPEN" ? (
                 !bidding ? (
                   <div className="text-center w-full">
                     <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to take on this project?</h3>
                     <p className="text-slate-500 mb-6">Submit a compelling proposal to win this job.</p>
                     <button onClick={() => setBidding(true)} className="bg-primary hover:bg-primary-dark text-white text-lg px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                        Write Proposal
                     </button>
                   </div>
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
                              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary outline-none transition-shadow focus:shadow-sm"
                              placeholder="e.g. 800"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">Estimated Days to Deliver</label>
                            <input
                              type="number" required min="1"
                              value={bidForm.estimated_days} onChange={e => setBidForm({...bidForm, estimated_days: e.target.value})}
                              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary outline-none transition-shadow focus:shadow-sm"
                              placeholder="e.g. 5"
                            />
                          </div>
                       </div>

                       <div className="mb-8">
                          <label className="block text-sm font-semibold text-slate-900 mb-2">Cover Letter</label>
                          <textarea
                            required rows="6"
                            value={bidForm.cover_letter} onChange={e => setBidForm({...bidForm, cover_letter: e.target.value})}
                            className="w-full p-4 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary outline-none transition-shadow focus:shadow-sm"
                            placeholder="Introduce yourself and explain why you're perfect for this job..."
                          />
                       </div>

                       <div className="flex justify-end gap-3">
                          <button type="button" onClick={() => setBidding(false)} className="px-6 py-3 font-medium text-slate-500 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100">Cancel</button>
                          <button type="submit" disabled={bidStatus === "loading"} className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-md disabled:opacity-50 hover:bg-primary-dark transition-all">
                            {bidStatus === "loading" ? "Submitting..." : "Send Proposal"}
                          </button>
                       </div>
                   </form>
                 )
               ) : (
                 <div className="text-center w-full">
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Bidding is Closed</h3>
                   <p className="text-slate-500">This job is no longer accepting new proposals.</p>
                 </div>
               )
           ) : (
             <p className="text-slate-500">Please log in to submit a proposal or manage jobs.</p>
           )}
        </div>
      </div>
    </div>
  );
}

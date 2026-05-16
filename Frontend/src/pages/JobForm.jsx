import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Save } from "lucide-react";

export default function JobForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    duration: "Flexible"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/jobs/", formData);
      navigate("/client/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to post job. Check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5"/> Back to Dashboard
         </button>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
               <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
               <p className="text-slate-500 mt-1">Describe what you need and set your terms.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                 <input 
                   type="text" required
                   placeholder="e.g. Fullstack Developer for SaaS MVP"
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                   className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow duration-200"
                 />
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
                 <textarea 
                   required rows={6}
                   placeholder="Describe the project scope, required skills, and deliverables..."
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none resize-y transition-shadow duration-200"
                 />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Budget ($)</label>
                    <input 
                      type="number" required min="1"
                      placeholder="e.g. 1000"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow duration-200"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Expected Duration</label>
                    <select 
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow duration-200 bg-white"
                    >
                       <option value="Flexible">Flexible</option>
                       <option value="Less than 1 week">Less than 1 week</option>
                       <option value="1 to 4 weeks">1 to 4 weeks</option>
                       <option value="1 to 3 months">1 to 3 months</option>
                       <option value="More than 3 months">More than 3 months</option>
                    </select>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                 <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Cancel
                 </button>
                 <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                    <Save className="w-5 h-5"/> {loading ? "Posting..." : "Post Job"}
                 </button>
              </div>
            </form>
         </div>
      </div>
    </div>
  );
}

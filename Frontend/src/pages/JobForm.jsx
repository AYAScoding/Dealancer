import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Save, Briefcase, DollarSign, Clock } from "lucide-react";

export default function JobForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  
  // Data for select fields
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    budget_type: "FIXED",
    budget_min: "",
    budget_max: "",
    deadline: "",
    skills_required: []
  });

  // Fetch categories and skills on mount
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [catRes, skillRes] = await Promise.all([
          api.get("/categories/"),
          api.get("/skills/")
        ]);
        
        // DRF usually paginates, so handle potentially paginated responses
        const catData = catRes.data.results || catRes.data;
        const skillData = skillRes.data.results || skillRes.data;
        
        setCategories(catData);
        setSkills(skillData);
      } catch (err) {
        console.error("Failed to load options", err);
        setError("Could not load categories or skills from the server.");
      } finally {
        setFetchingData(false);
      }
    };
    fetchSelectData();
  }, []);

  const handleSkillToggle = (skillId) => {
    setFormData((prev) => {
      const currentSkills = prev.skills_required;
      if (currentSkills.includes(skillId)) {
        return { ...prev, skills_required: currentSkills.filter((id) => id !== skillId) };
      } else {
        return { ...prev, skills_required: [...currentSkills, skillId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/jobs/", {
        ...formData,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max)
      });
      navigate("/client/dashboard");
    } catch (err) {
      if (err.response?.data) {
        // Build a readable string from DRF validation errors
        const errMessages = Object.entries(err.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
          .join(" | ");
        setError(errMessages || "Failed to post job. Check your inputs.");
      } else {
        setError("Failed to post job. Check your inputs.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5"/> Back to Dashboard
         </button>

         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-8 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Briefcase className="w-6 h-6"/>
                 </div>
                 <h1 className="text-3xl font-bold text-slate-900">Post a New Job</h1>
               </div>
               <p className="text-slate-500 text-lg">Describe what you need securely and attract elite talent.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                   <label className="block text-sm font-semibold text-slate-900 mb-2">Job Title</label>
                   <input 
                     type="text" required
                     placeholder="e.g. Need a Senior Django Developer for API Project"
                     value={formData.title}
                     onChange={(e) => setFormData({...formData, title: e.target.value})}
                     className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow"
                   />
                </div>

                <div className="col-span-1 md:col-span-2">
                   <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                   <select 
                     required
                     value={formData.category_id}
                     onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                     className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none bg-white transition-shadow"
                   >
                     <option value="" disabled>Select a category...</option>
                     {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                     ))}
                   </select>
                </div>
              </div>

              {/* Description */}
              <div>
                 <label className="block text-sm font-semibold text-slate-900 mb-2">Job Description</label>
                 <textarea 
                   required rows={6}
                   placeholder="Describe the project scope, required deliverables, and timeline..."
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none resize-y transition-shadow"
                 />
              </div>

              {/* Skills (Checkboxes) */}
              {skills.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Required Skills</label>
                  <div className="flex flex-wrap gap-3">
                    {skills.map(skill => {
                      const isSelected = formData.skills_required.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleSkillToggle(skill.id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            isSelected 
                              ? "bg-primary text-white border-primary shadow-md" 
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-primary"
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Budget & Timeline */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                   <DollarSign className="w-5 h-5 text-emerald-500"/> Budget & Terms
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Payment Type</label>
                      <select 
                        value={formData.budget_type}
                        onChange={(e) => setFormData({...formData, budget_type: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none bg-white transition-shadow"
                      >
                         <option value="FIXED">Fixed Price</option>
                         <option value="HOURLY">Hourly Rate</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Min Budget ($)</label>
                      <input 
                        type="number" required min="1" step="0.01"
                        placeholder="e.g. 500"
                        value={formData.budget_min}
                        onChange={(e) => setFormData({...formData, budget_min: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Max Budget ($)</label>
                      <input 
                        type="number" required min="1" step="0.01"
                        placeholder="e.g. 1000"
                        value={formData.budget_max}
                        onChange={(e) => setFormData({...formData, budget_max: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                     <Clock className="w-4 h-4"/> Deadline (Optional)
                   </label>
                   <input 
                     type="date"
                     value={formData.deadline}
                     onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                     className="max-w-xs w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow"
                   />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                 <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Cancel
                 </button>
                 <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                    <Save className="w-5 h-5"/> {loading ? "Posting..." : "Post Job Live"}
                 </button>
              </div>
            </form>
         </div>
      </div>
    </div>
  );
}

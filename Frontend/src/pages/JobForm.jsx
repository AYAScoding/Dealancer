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
    category_ids: [],
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

  const handleCategoryToggle = (catId) => {
    const currentCats = formData.category_ids;
    if (currentCats.includes(catId)) {
      // Remove category and clear all skills associated with it
      const updatedCats = currentCats.filter((id) => id !== catId);
      const skillsToKeep = formData.skills_required.filter(skillId => {
        const skill = skills.find(s => s.id === skillId);
        return skill && updatedCats.includes(skill.category?.id);
      });
      setFormData((prev) => ({
        ...prev,
        category_ids: updatedCats,
        skills_required: skillsToKeep
      }));
      setError("");
    } else {
      if (currentCats.length >= 2) {
        setError("You can select a maximum of 2 job categories.");
        return;
      }
      setError("");
      setFormData((prev) => ({
        ...prev,
        category_ids: [...currentCats, catId]
      }));
    }
  };

  const getSkillsCountForCategory = (catId) => {
    return formData.skills_required.filter(skillId => {
      const skill = skills.find(s => s.id === skillId);
      return skill && skill.category?.id === catId;
    }).length;
  };

  const handleSkillToggle = (skillId) => {
    const isSelected = formData.skills_required.includes(skillId);
    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        skills_required: prev.skills_required.filter((id) => id !== skillId)
      }));
      setError("");
    } else {
      const skill = skills.find((s) => s.id === skillId);
      if (!skill || !skill.category?.id) return;
      const count = getSkillsCountForCategory(skill.category.id);
      if (count >= 5) {
        setError(`You can choose a maximum of 5 skills for the '${skill.category.name}' category.`);
        return;
      }
      setError("");
      setFormData((prev) => ({
        ...prev,
        skills_required: [...prev.skills_required, skillId]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.category_ids.length === 0) {
      setError("Please select at least one job category.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/jobs/", {
        title: formData.title,
        description: formData.description,
        category_ids: formData.category_ids,
        skill_ids: formData.skills_required,
        budget_type: formData.budget_type,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
        deadline: formData.deadline || null
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
                   <label className="block text-sm font-bold text-slate-900 mb-2">
                     Job Categories <span className="text-red-500">*</span>
                     <span className="text-slate-400 font-normal text-xs ml-2">
                       (Select up to 2 categories: {formData.category_ids.length}/2)
                     </span>
                   </label>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                     {categories.map((cat) => {
                       const isSelected = formData.category_ids.includes(cat.id);
                       const isLimitReached = formData.category_ids.length >= 2 && !isSelected;
                       return (
                         <button
                           key={cat.id}
                           type="button"
                           disabled={isLimitReached}
                           onClick={() => handleCategoryToggle(cat.id)}
                           className={`px-4 py-3 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                             isSelected
                               ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20"
                               : isLimitReached
                               ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                               : "bg-white text-slate-700 border-slate-200 hover:border-primary/50 hover:bg-slate-50/50"
                           }`}
                         >
                           <span>{cat.name}</span>
                           {isSelected && <span className="w-2 h-2 rounded-full bg-white shrink-0 ml-1.5" />}
                         </button>
                       );
                     })}
                   </div>
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
              <div className="space-y-4">
                 <label className="block text-sm font-bold text-slate-900">Required Skills <span className="text-red-500">*</span></label>
                 
                 {formData.category_ids.length === 0 ? (
                   <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-slate-500 text-xs font-medium">
                     Select at least one category above to choose matching required skills.
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {/* Category-based Skill Lists with Counters */}
                     {formData.category_ids.map((catId) => {
                       const category = categories.find(c => c.id === catId);
                       if (!category) return null;
                       const catSkills = skills.filter(s => s.category?.id === catId);
                       const count = getSkillsCountForCategory(catId);
                       
                       return (
                         <div key={catId} className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl space-y-3 animate-in fade-in">
                           <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                             <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                               <span className="w-2 h-2 rounded-full bg-primary" />
                               {category.name} Skills
                             </h4>
                             <span className={`text-xs font-bold ${count >= 5 ? "text-amber-600" : "text-slate-500"}`}>
                               Selected: {count}/5
                             </span>
                           </div>
                           
                           <div className="flex flex-wrap gap-2.5">
                             {catSkills.map(skill => {
                               const isSelected = formData.skills_required.includes(skill.id);
                               const isCatLimit = count >= 5 && !isSelected;
                               return (
                                 <button
                                   key={skill.id}
                                   type="button"
                                   disabled={isCatLimit}
                                   onClick={() => handleSkillToggle(skill.id)}
                                   className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                                     isSelected 
                                       ? "bg-primary text-white border-primary shadow-sm" 
                                       : isCatLimit
                                       ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                                       : "bg-white text-slate-700 border-slate-200 hover:border-primary hover:bg-slate-50/30"
                                   }`}
                                 >
                                   {skill.name}
                                 </button>
                               );
                             })}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>

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

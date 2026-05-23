import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import {
  User,
  Briefcase,
  LayoutDashboard,
  Search,
  Plus,
  LogOut,
  Upload,
  AlertCircle,
  X,
  Check,
  Globe,
  Loader2,
  DollarSign
} from "lucide-react";

export default function Profile() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const mustComplete = location.state?.mustComplete || false;

  // Profile data state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Freelancer specific form states
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [availability, setAvailability] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Client specific form states
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");

  // Photo uploading states
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // Skills & Categories loading & searching states
  const [allSkills, setAllSkills] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch current profile details
        const res = await api.get("/auth/me/profile/");
        setProfile(res.data);
        
        if (user?.role === "FREELANCER") {
          setBio(res.data.bio || "");
          setHourlyRate(res.data.hourly_rate || "");
          setPortfolioUrl(res.data.portfolio_url || "");
          setAvailability(res.data.availability !== false);
          setSelectedSkills(res.data.skills || []);
          setSelectedCategories(res.data.categories || []);
        } else {
          setCompanyName(res.data.company_name || "");
          setIndustry(res.data.industry || "");
          setWebsite(res.data.website || "");
        }

        if (res.data.photo) {
          setPhotoPreview(res.data.photo);
        }

        // Fetch all available skills and categories for searchable selectors
        if (user?.role === "FREELANCER") {
          const [skillsRes, catsRes] = await Promise.all([
            api.get("/skills/"),
            api.get("/categories/")
          ]);
          setAllSkills(skillsRes.data.results || skillsRes.data);
          setAllCategories(catsRes.data.results || catsRes.data);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
        setErrorMsg("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleCategory = (category) => {
    const isSelected = selectedCategories.some(c => c.id === category.id);
    if (isSelected) {
      // Removing category: dynamically clear any selected skills belonging to this category
      setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
      setSelectedSkills(selectedSkills.filter(s => s.category?.id !== category.id));
      setErrorMsg("");
    } else {
      if (selectedCategories.length >= 3) {
        setErrorMsg("You can select a maximum of 3 distinct skill categories.");
        return;
      }
      setErrorMsg("");
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const getSkillsCountForCategory = (categoryId) => {
    return selectedSkills.filter(s => s.category?.id === categoryId).length;
  };

  const addSkill = (skill) => {
    const catId = skill.category?.id;
    if (!catId) return;

    const count = getSkillsCountForCategory(catId);
    if (count >= 5) {
      setErrorMsg(`You can choose a maximum of 5 skills for the '${skill.category.name}' category.`);
      return;
    }

    if (!selectedSkills.find(s => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
      setErrorMsg("");
    }
    setSkillSearch("");
    setShowSkillDropdown(false);
  };

  const removeSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    // Validate frontend rules for completeness
    if (user?.role === "FREELANCER") {
      if (!bio.trim()) {
        setErrorMsg("Please write a short bio about yourself.");
        setSaving(false);
        return;
      }
      if (!hourlyRate || parseFloat(hourlyRate) <= 0) {
        setErrorMsg("Please specify a valid hourly rate (greater than 0).");
        setSaving(false);
        return;
      }
      if (selectedCategories.length === 0) {
        setErrorMsg("Please select at least one expertise category.");
        setSaving(false);
        return;
      }
      if (selectedSkills.length === 0) {
        setErrorMsg("Please add at least one skill tag.");
        setSaving(false);
        return;
      }
    } else {
      if (!companyName.trim()) {
        setErrorMsg("Company name is required.");
        setSaving(false);
        return;
      }
      if (!industry.trim()) {
        setErrorMsg("Industry name is required.");
        setSaving(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      
      if (user?.role === "FREELANCER") {
        formData.append("bio", bio);
        formData.append("hourly_rate", hourlyRate);
        formData.append("portfolio_url", portfolioUrl);
        formData.append("availability", availability);
        selectedSkills.forEach((skill) => {
          formData.append("skill_ids", skill.id);
        });
        selectedCategories.forEach((cat) => {
          formData.append("category_ids", cat.id);
        });
      } else {
        formData.append("company_name", companyName);
        formData.append("industry", industry);
        formData.append("website", website);
      }

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      await api.patch("/auth/me/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh global user state to update user.is_profile_complete
      const updatedUser = await refreshUser();
      setSuccessMsg("Profile saved successfully!");

      // If user was redirected to complete profile, redirect them back to dashboard
      if (mustComplete && updatedUser?.is_profile_complete) {
        setTimeout(() => {
          const dest = user.role === "FREELANCER" ? "/freelancer/dashboard" : "/client/dashboard";
          navigate(dest);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      let errorText = "Failed to update profile. Please try again.";
      if (err.response?.data) {
        errorText = Object.values(err.response.data).flat()[0] || errorText;
      }
      setErrorMsg(errorText);
    } finally {
      setSaving(false);
    }
  };

  const availableSkills = allSkills.filter(skill =>
    selectedCategories.some(cat => cat.id === skill.category?.id)
  );

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.some(s => s.id === skill.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dynamic Sidebar Adaptation */}
      <aside className="w-64 glass-dark hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Dealancer</h2>
          <p className="text-slate-400 text-sm mt-1">
            {user?.role === "FREELANCER" ? "Freelancer Portal" : "Client Portal"}
          </p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {user?.role === "FREELANCER" ? (
            <>
              <Link
                to="/freelancer/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
              <Link
                to="/jobs"
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors"
              >
                <Search className="w-5 h-5" /> Find Jobs
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/client/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
              <Link
                to="/client/jobs/new"
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors"
              >
                <Plus className="w-5 h-5" /> Post a Job
              </Link>
            </>
          )}
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-medium"
          >
            <User className="w-5 h-5" /> My Profile
          </Link>
        </nav>
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Warning notification for locked profile */}
        {mustComplete && !user?.is_profile_complete && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl p-4 flex gap-4 mb-6 shadow-sm items-start">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
              <AlertCircle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Profile Details Required</h3>
              <p className="text-amber-800 text-sm mt-0.5">
                Before searching, posting, or bidding on jobs, you must complete your profile so other members can recognize your skills and trust your credentials.
              </p>
            </div>
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Profile</h1>
          <p className="text-slate-500 mt-1">Manage your public credentials and professional information.</p>
        </header>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
            
            {/* Success & Error alerts */}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 p-4 rounded-xl flex items-center gap-2">
                <Check className="text-emerald-500 shrink-0" size={20} />
                <span className="font-medium text-sm">{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-800 p-4 rounded-xl flex items-center gap-2">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <span className="font-medium text-sm">{errorMsg}</span>
              </div>
            )}

            {/* Profile Avatar Upload block */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-slate-400" />
                )}
                <label className="absolute inset-0 bg-black/50 text-white text-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload size={16} className="mb-1" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-slate-900 text-lg">Profile Photo</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Recommended size: Square JPG or PNG. Click the preview thumbnail to browse files.
                </p>
                {photoFile && (
                  <span className="inline-block mt-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {photoFile.name}
                  </span>
                )}
              </div>
            </div>

            {/* Adapt fields dynamically based on Freelancer vs. Client */}
            {user?.role === "FREELANCER" ? (
              <div className="space-y-6">
                {/* BIO */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Professional Summary / Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your expertise, achievements, and the kinds of projects you deliver best..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* HOURLY RATE */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Hourly Rate ($) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <DollarSign size={16} />
                      </div>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="45.00"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* PORTFOLIO URL */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Portfolio / Website URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Globe size={16} />
                      </div>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://github.com/johndoe"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* CATEGORIES SELECTION (New Feature) */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Expertise Categories <span className="text-red-500">*</span>
                    <span className="text-slate-400 font-normal text-xs ml-2">
                      (Select up to 3 categories: {selectedCategories.length}/3)
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allCategories.map((cat) => {
                      const isSelected = selectedCategories.some(c => c.id === cat.id);
                      const isLimitReached = selectedCategories.length >= 3 && !isSelected;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          disabled={isLimitReached}
                          onClick={() => toggleCategory(cat)}
                          className={`px-4 py-3 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20"
                              : isLimitReached
                              ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                              : "bg-white text-slate-700 border-slate-200 hover:border-primary/50 hover:bg-slate-50/50"
                          }`}
                        >
                          <span>{cat.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SKILLS MULTI-SELECT SEARCH tags */}
                <div className="relative">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Professional Skills <span className="text-red-500">*</span>
                  </label>
                  
                  {selectedCategories.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-slate-500 text-xs font-medium">
                      Select at least one expertise category above to unlock skill search.
                    </div>
                  ) : (
                    <>
                      {/* Skill limits per category display */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {selectedCategories.map((cat) => {
                          const count = getSkillsCountForCategory(cat.id);
                          return (
                            <div key={cat.id} className="text-xs font-medium flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              <span className="text-slate-600">{cat.name}:</span>
                              <span className={`font-bold ${count >= 5 ? "text-amber-600" : "text-slate-900"}`}>
                                {count}/5 selected
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="w-full min-h-[50px] rounded-xl border border-slate-200 p-2 flex flex-wrap gap-2 items-center bg-white">
                        {selectedSkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="bg-slate-100 text-slate-800 text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border border-slate-200/50 shadow-sm animate-in fade-in"
                          >
                            <span className="text-slate-900">{skill.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({skill.category?.name})</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(skill.id)}
                              className="hover:bg-slate-200 rounded-full p-0.5 transition-colors text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={skillSearch}
                          onChange={(e) => {
                            setSkillSearch(e.target.value);
                            setShowSkillDropdown(true);
                          }}
                          onFocus={() => setShowSkillDropdown(true)}
                          placeholder="Search and add skills..."
                          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm px-2 text-slate-900 placeholder-slate-400"
                        />
                      </div>

                      {/* Dropdown search container */}
                      {showSkillDropdown && skillSearch.trim() && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-50">
                          {filteredSkills.length > 0 ? (
                            filteredSkills.map((skill) => {
                              const catId = skill.category?.id;
                              const isCatLimit = getSkillsCountForCategory(catId) >= 5;
                              return (
                                <button
                                  type="button"
                                  disabled={isCatLimit}
                                  key={skill.id}
                                  onClick={() => addSkill(skill)}
                                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                    isCatLimit
                                      ? "text-slate-300 bg-slate-50/30 cursor-not-allowed"
                                      : "text-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{skill.name}</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal">
                                      {skill.category?.name}
                                    </span>
                                  </div>
                                  {isCatLimit ? (
                                    <span className="text-xs text-amber-600 font-semibold">Limit (5/5)</span>
                                  ) : (
                                    <Plus size={14} className="text-slate-400" />
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-4 text-xs text-slate-400 text-center font-medium">
                              No matching skills found.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Backdrop click closer */}
                      {showSkillDropdown && (
                        <div
                          className="fixed inset-0 z-[5]"
                          onClick={() => setShowSkillDropdown(false)}
                        />
                      )}
                    </>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Enter keywords above and choose skills matching your chosen categories.
                  </p>
                </div>

                {/* AVAILABILITY */}
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={availability}
                    onChange={(e) => setAvailability(e.target.checked)}
                    className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary/20 accent-primary"
                  />
                  <label htmlFor="availability" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    Currently available for immediate client bookings
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* COMPANY NAME */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Company / Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Google Inc."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  {/* INDUSTRY */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Industry / Sector <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Software Development, E-commerce..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* WEBSITE URL */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Company Website URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe size={16} />
                    </div>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-4">
            {!mustComplete && (
              <button
                type="button"
                onClick={() => {
                  const dest = user.role === "FREELANCER" ? "/freelancer/dashboard" : "/client/dashboard";
                  navigate(dest);
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 transition-colors shadow-sm text-sm cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-md items-center gap-2 text-sm flex disabled:opacity-75 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

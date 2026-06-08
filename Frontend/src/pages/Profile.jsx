import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import {
  User,
  LayoutDashboard,
  Search,
  Plus,
  LogOut,
  Upload,
  AlertCircle,
  ChevronDown,
  X,
  Check,
  Pencil,
  Globe,
  Loader2,
  DollarSign,
  Shield,
  ShieldCheck
} from "lucide-react";
import { Alert, Button, Card, TextInput } from "../components/ui";

export default function Profile() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const mustComplete = location.state?.mustComplete || false;

  // Profile data state
  const [, setProfile] = useState(null);
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

  // Skills & Categories loading states
  const [allSkills, setAllSkills] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [editingSkillCategoryId, setEditingSkillCategoryId] = useState(null);
  const [draftCategoryId, setDraftCategoryId] = useState("");
  const [draftSkillIds, setDraftSkillIds] = useState([]);
  const [skillPickerError, setSkillPickerError] = useState("");

  // Two-factor authentication state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [twoFactorMode, setTwoFactorMode] = useState("idle");
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorStep, setTwoFactorStep] = useState(1);
  const [twoFactorOtp, setTwoFactorOtp] = useState("");
  const [disableOtp, setDisableOtp] = useState("");
  const [disableOpen, setDisableOpen] = useState(false);
  const [manualSecretOpen, setManualSecretOpen] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");

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
            api.get("/skill-categories/")
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

  useEffect(() => {
    const fetchTwoFactorStatus = async () => {
      try {
        const res = await api.get("/auth/2fa/status/");
        setTwoFactorEnabled(res.data.is_2fa_enabled);
      } catch (e) {
        console.error("Failed to load two-factor status", e);
      } finally {
        setTwoFactorLoading(false);
      }
    };

    if (user) {
      fetchTwoFactorStatus();
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getSkillsCountForCategory = (categoryId) => {
    return selectedSkills.filter(s => s.category?.id === categoryId).length;
  };

  const beginCategoryDraft = (categoryId) => {
    const numericCategoryId = Number(categoryId);
    if (!numericCategoryId) {
      setDraftCategoryId("");
      setDraftSkillIds([]);
      setEditingSkillCategoryId(null);
      return;
    }
    if (!editingSkillCategoryId && selectedCategories.length >= 3 && !selectedCategories.some((category) => category.id === numericCategoryId)) {
      setSkillPickerError("You can choose up to 3 skill categories.");
      return;
    }

    setDraftCategoryId(numericCategoryId);
    setDraftSkillIds(
      selectedSkills
        .filter((skill) => skill.category?.id === numericCategoryId)
        .map((skill) => skill.id)
    );
    setEditingSkillCategoryId(selectedCategories.some((category) => category.id === numericCategoryId) ? numericCategoryId : null);
    setSkillPickerError("");
  };

  const editSkillCategory = (category) => {
    setDraftCategoryId(category.id);
    setDraftSkillIds(selectedSkills.filter((skill) => skill.category?.id === category.id).map((skill) => skill.id));
    setEditingSkillCategoryId(category.id);
    setSkillPickerError("");
  };

  const toggleDraftSkill = (skillId) => {
    setDraftSkillIds((prev) => (
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : prev.length >= 5
        ? prev
        : [...prev, skillId]
    ));
    if (!draftSkillIds.includes(skillId) && draftSkillIds.length >= 5) {
      setSkillPickerError("You can choose up to 5 skills per category.");
    } else {
      setSkillPickerError("");
    }
  };

  const confirmSkillCategory = () => {
    const category = allCategories.find((cat) => cat.id === draftCategoryId);
    if (!category) {
      setSkillPickerError("Choose a category first.");
      return;
    }
    if (draftSkillIds.length === 0) {
      setSkillPickerError("Pick at least one skill to continue");
      return;
    }
    if (draftSkillIds.length > 5) {
      setSkillPickerError("You can choose up to 5 skills per category.");
      return;
    }
    if (!editingSkillCategoryId && selectedCategories.length >= 3 && !selectedCategories.some((cat) => cat.id === category.id)) {
      setSkillPickerError("You can choose up to 3 skill categories.");
      return;
    }

    const confirmedSkills = allSkills.filter((skill) => draftSkillIds.includes(skill.id));
    setSelectedCategories((prev) => (
      prev.some((cat) => cat.id === category.id)
        ? prev.map((cat) => (cat.id === category.id ? category : cat))
        : [...prev, category]
    ));
    setSelectedSkills((prev) => [
      ...prev.filter((skill) => skill.category?.id !== category.id),
      ...confirmedSkills,
    ]);
    setDraftCategoryId("");
    setDraftSkillIds([]);
    setEditingSkillCategoryId(null);
    setSkillPickerError("");
    setErrorMsg("");
  };

  const removeSkillCategory = (categoryId) => {
    setSelectedCategories((prev) => prev.filter((category) => category.id !== categoryId));
    setSelectedSkills((prev) => prev.filter((skill) => skill.category?.id !== categoryId));
    if (draftCategoryId === categoryId) {
      setDraftCategoryId("");
      setDraftSkillIds([]);
      setEditingSkillCategoryId(null);
      setSkillPickerError("");
    }
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
        setErrorMsg("Please confirm at least one expertise category with skills.");
        setSaving(false);
        return;
      }
      if (selectedCategories.length > 3) {
        setErrorMsg("You can choose up to 3 expertise categories.");
        setSaving(false);
        return;
      }
      const categoriesWithoutSkills = selectedCategories.filter((category) => getSkillsCountForCategory(category.id) === 0);
      if (selectedSkills.length === 0 || categoriesWithoutSkills.length > 0) {
        setErrorMsg("Each confirmed expertise category needs at least one skill.");
        setSaving(false);
        return;
      }
      const categoriesWithTooManySkills = selectedCategories.filter((category) => getSkillsCountForCategory(category.id) > 5);
      if (categoriesWithTooManySkills.length > 0) {
        setErrorMsg("Each expertise category can include up to 5 skills.");
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

  const startTwoFactorSetup = async () => {
    setSecurityError("");
    setSecuritySuccess("");
    setTwoFactorMode("setup");
    setTwoFactorStep(1);
    setTwoFactorOtp("");
    try {
      const res = await api.post("/auth/2fa/setup/");
      setTwoFactorSetup(res.data);
    } catch (e) {
      console.error("Failed to start two-factor setup", e);
      setTwoFactorMode("idle");
      setSecurityError(e.response?.data?.detail || "Failed to start two-factor setup.");
    }
  };

  const verifyTwoFactorSetup = async () => {
    setSecurityError("");
    setSecuritySuccess("");
    try {
      await api.post("/auth/2fa/verify-setup/", { otp_code: twoFactorOtp });
      setTwoFactorEnabled(true);
      setTwoFactorMode("idle");
      setTwoFactorSetup(null);
      setTwoFactorOtp("");
      setSecuritySuccess("Two-factor authentication is now enabled.");
    } catch (e) {
      setSecurityError(e.response?.data?.detail || "Invalid authentication code.");
    }
  };

  const disableTwoFactor = async () => {
    setSecurityError("");
    setSecuritySuccess("");
    try {
      await api.post("/auth/2fa/disable/", { otp_code: disableOtp });
      setTwoFactorEnabled(false);
      setDisableOpen(false);
      setDisableOtp("");
      setSecuritySuccess("Two-factor authentication has been disabled.");
    } catch (e) {
      setSecurityError(e.response?.data?.detail || "Invalid authentication code.");
    }
  };

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

                <FreelancerSkillCategoryPicker
                  categories={allCategories}
                  skills={allSkills}
                  selectedCategories={selectedCategories}
                  selectedSkills={selectedSkills}
                  draftCategoryId={draftCategoryId}
                  draftSkillIds={draftSkillIds}
                  editingCategoryId={editingSkillCategoryId}
                  error={skillPickerError}
                  onBeginCategory={beginCategoryDraft}
                  onEditCategory={editSkillCategory}
                  onToggleSkill={toggleDraftSkill}
                  onConfirm={confirmSkillCategory}
                  onRemoveCategory={removeSkillCategory}
                />

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

        <SecuritySection
          loading={twoFactorLoading}
          enabled={twoFactorEnabled}
          mode={twoFactorMode}
          setup={twoFactorSetup}
          setupStep={twoFactorStep}
          otp={twoFactorOtp}
          disableOtp={disableOtp}
          disableOpen={disableOpen}
          manualSecretOpen={manualSecretOpen}
          error={securityError}
          success={securitySuccess}
          onStartSetup={startTwoFactorSetup}
          onSetupStep={setTwoFactorStep}
          onOtpChange={setTwoFactorOtp}
          onVerifySetup={verifyTwoFactorSetup}
          onDisableOtpChange={setDisableOtp}
          onDisableOpen={setDisableOpen}
          onDisable={disableTwoFactor}
          onManualSecretOpen={setManualSecretOpen}
        />
      </main>
    </div>
  );
}

function FreelancerSkillCategoryPicker({
  categories,
  skills,
  selectedCategories,
  selectedSkills,
  draftCategoryId,
  draftSkillIds,
  editingCategoryId,
  error,
  onBeginCategory,
  onEditCategory,
  onToggleSkill,
  onConfirm,
  onRemoveCategory,
}) {
  const availableCategories = categories.filter(
    (category) => category.id === editingCategoryId || !selectedCategories.some((selected) => selected.id === category.id)
  );
  const categorySkills = skills.filter((skill) => skill.category?.id === draftCategoryId);
  const hasDraft = Boolean(draftCategoryId);
  const categoryLimitReached = selectedCategories.length >= 3 && !editingCategoryId;

  const skillsForCategory = (categoryId) => selectedSkills.filter((skill) => skill.category?.id === categoryId);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700">
          Expertise Categories & Skills <span className="text-red-500">*</span>
        </label>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Add 1 to 3 categories. Each category must include 1 to 5 skills.
        </p>
      </div>

      {selectedCategories.length > 0 && (
        <div className="space-y-3">
          {selectedCategories.map((category) => (
            <ConfirmedSkillCategoryRow
              key={category.id}
              category={category}
              skills={skillsForCategory(category.id)}
              onEdit={() => onEditCategory(category)}
              onRemove={() => onRemoveCategory(category.id)}
            />
          ))}
        </div>
      )}

      <Card className="p-4 md:p-5">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-950">
                {editingCategoryId ? "Edit category skills" : "Add a Category"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {categoryLimitReached
                  ? "You have reached the 3 category limit. Edit or remove a category to add another."
                  : "Already confirmed categories are hidden from the selector."}
              </p>
            </div>
            {hasDraft && (
              <button
                type="button"
                onClick={() => onBeginCategory("")}
                className="text-sm font-bold text-slate-500 transition hover:text-slate-900"
              >
                Cancel edit
              </button>
            )}
          </div>

          <SearchableCategorySelect
            categories={availableCategories}
            value={draftCategoryId}
            placeholder="Choose a category"
            disabled={categoryLimitReached}
            onChange={onBeginCategory}
          />

          <div
            className={`overflow-hidden transition-all duration-300 ${
              hasDraft ? "max-h-[520px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"
            }`}
          >
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/30 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-900">Pick at least one skill</p>
                <span className={`text-xs font-semibold ${draftSkillIds.length >= 5 ? "text-amber-600" : "text-slate-500"}`}>
                  {draftSkillIds.length}/5 selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categorySkills.length > 0 ? (
                  categorySkills.map((skill) => {
                    const selected = draftSkillIds.includes(skill.id);
                    return (
                      <SkillChip
                        key={skill.id}
                        selected={selected}
                        disabled={!selected && draftSkillIds.length >= 5}
                        onClick={() => onToggleSkill(skill.id)}
                      >
                        {skill.name}
                      </SkillChip>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No skills are listed for this category yet.</p>
                )}
              </div>
              {error && <Alert variant="warning" className="mt-4">{error}</Alert>}
              <div className="mt-4">
                <Button type="button" onClick={onConfirm} icon={Check}>
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ConfirmedSkillCategoryRow({ category, skills, onEdit, onRemove }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <p className="shrink-0 text-sm font-black text-slate-950">{category.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span key={skill.id} className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700 ring-1 ring-cyan-100">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label={`Edit ${category.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove ${category.name}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function SearchableCategorySelect({ categories, value, placeholder, disabled = false, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedCategory = categories.find((category) => category.id === value);
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        <span className={selectedCategory ? "text-slate-900" : "text-slate-400"}>
          {selectedCategory?.name || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="border-b border-slate-100 p-2">
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search category by name..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onChange(category.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    value === category.id ? "bg-cyan-50 text-cyan-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {category.name}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm font-medium text-slate-400">No categories found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillChip({ selected, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-sm font-bold transition-all duration-200 ${
        selected
          ? "border-cyan-600 bg-cyan-600 text-white shadow-sm shadow-cyan-700/20"
          : disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
          : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
      }`}
    >
      {children}
    </button>
  );
}

function SecuritySection({
  loading,
  enabled,
  mode,
  setup,
  setupStep,
  otp,
  disableOtp,
  disableOpen,
  manualSecretOpen,
  error,
  success,
  onStartSetup,
  onSetupStep,
  onOtpChange,
  onVerifySetup,
  onDisableOtpChange,
  onDisableOpen,
  onDisable,
  onManualSecretOpen,
}) {
  return (
    <Card className="mt-8 p-6 md:p-8 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-cyan-50 text-cyan-700"}`}>
            {enabled ? <ShieldCheck className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Security</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Protect your account with Google Authenticator two-factor authentication.
            </p>
          </div>
        </div>
      </div>

      {error && <Alert variant="error" className="mt-5">{error}</Alert>}
      {success && <Alert variant="success" className="mt-5">{success}</Alert>}

      {loading ? (
        <div className="mt-6 text-sm font-medium text-slate-500">Loading security settings...</div>
      ) : mode === "setup" ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 animate-in">
          <div className="mb-5 flex gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${setupStep === 1 ? "bg-slate-950 text-white" : "bg-white text-slate-500"}`}>1. Scan</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${setupStep === 2 ? "bg-slate-950 text-white" : "bg-white text-slate-500"}`}>2. Confirm</span>
          </div>

          {setupStep === 1 ? (
            <div className="space-y-5">
              <p className="text-sm leading-6 text-slate-600">
                Open Google Authenticator, add a new account, and scan this QR code.
              </p>
              {setup?.qr_code ? (
                <div className="inline-block rounded-2xl border border-slate-200 bg-white p-4">
                  <img src={`data:image/png;base64,${setup.qr_code}`} alt="Google Authenticator QR code" className="h-48 w-48" />
                </div>
              ) : (
                <div className="text-sm text-slate-500">Generating QR code...</div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => onManualSecretOpen(!manualSecretOpen)}
                  className="text-sm font-bold text-cyan-700 hover:text-cyan-900"
                >
                  {manualSecretOpen ? "Hide manual entry key" : "Show manual entry key"}
                </button>
                {manualSecretOpen && setup?.secret && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Manual entry key</p>
                    <code className="mt-2 block select-all break-all rounded-lg bg-slate-950 px-3 py-2 font-mono text-sm text-cyan-100">
                      {setup.secret}
                    </code>
                  </div>
                )}
              </div>
              <Button type="button" onClick={() => onSetupStep(2)} disabled={!setup?.secret}>
                Continue
              </Button>
            </div>
          ) : (
            <div className="max-w-sm space-y-5">
              <p className="text-sm leading-6 text-slate-600">
                Enter the 6-digit code from Google Authenticator to finish setup.
              </p>
              <TextInput
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center font-mono text-3xl tracking-[0.35em]"
                placeholder="000000"
              />
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={onVerifySetup} disabled={otp.length !== 6} icon={ShieldCheck}>
                  Verify and enable
                </Button>
                <Button type="button" variant="secondary" onClick={() => onSetupStep(1)}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : enabled ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 animate-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-emerald-900">Two-factor authentication is active.</p>
              <p className="mt-1 text-sm text-emerald-800">You will be asked for a 6-digit code when signing in.</p>
            </div>
            <Button type="button" variant="danger" onClick={() => onDisableOpen(!disableOpen)}>
              Disable 2FA
            </Button>
          </div>
          {disableOpen && (
            <div className="mt-5 max-w-sm space-y-4 animate-in">
              <TextInput
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={disableOtp}
                onChange={(e) => onDisableOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center font-mono text-3xl tracking-[0.35em]"
                placeholder="000000"
              />
              <Button type="button" variant="danger" onClick={onDisable} disabled={disableOtp.length !== 6}>
                Confirm disable
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between animate-in">
          <div>
            <p className="font-bold text-slate-950">Two-factor authentication is disabled.</p>
            <p className="mt-1 text-sm text-slate-500">Enable it to require a Google Authenticator code at login.</p>
          </div>
          <Button type="button" onClick={onStartSetup} icon={Shield}>
            Enable 2FA
          </Button>
        </div>
      )}
    </Card>
  );
}

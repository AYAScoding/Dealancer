import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Briefcase, Check, ChevronDown, Clock, DollarSign, Pencil, Save } from "lucide-react";
import { Alert, Button, Card } from "../components/ui";

const emptySelection = {
  categoryId: "",
  skillIds: [],
  confirmed: false,
  skipped: false,
};

export default function JobForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState("primary");
  const [categorySelections, setCategorySelections] = useState({
    primary: { ...emptySelection },
    secondary: { ...emptySelection },
  });

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
    skills_required: [],
  });

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [catRes, skillRes] = await Promise.all([
          api.get("/skill-categories/"),
          api.get("/skills/"),
        ]);

        setCategories(catRes.data.results || catRes.data);
        setSkills(skillRes.data.results || skillRes.data);
      } catch (err) {
        console.error("Failed to load options", err);
        setError("Could not load categories or skills from the server.");
      } finally {
        setFetchingData(false);
      }
    };
    fetchSelectData();
  }, []);

  const confirmedSelections = useMemo(
    () => Object.entries(categorySelections).filter(([, selection]) => selection.confirmed && selection.categoryId),
    [categorySelections]
  );

  const confirmedCategoryIds = confirmedSelections.map(([, selection]) => selection.categoryId);
  const confirmedSkillIds = confirmedSelections.flatMap(([, selection]) => (
    selection.skipped ? [] : selection.skillIds
  ));

  const updateSelection = (slot, updates) => {
    setCategorySelections((prev) => {
      return {
        ...prev,
        [slot]: {
          ...prev[slot],
          ...updates,
        },
      };
    });
  };

  const handleCategoryChange = (slot, value) => {
    updateSelection(slot, {
      categoryId: Number(value),
      skillIds: [],
      confirmed: false,
      skipped: false,
    });
    setActiveStep(slot);
    setError("");
  };

  const toggleSkill = (slot, skillId) => {
    const selection = categorySelections[slot];
    if (!selection.skillIds.includes(skillId) && selection.skillIds.length >= 5) {
      setError("You can choose up to 5 skills per category.");
      return;
    }
    const nextSkillIds = selection.skillIds.includes(skillId)
      ? selection.skillIds.filter((id) => id !== skillId)
      : [...selection.skillIds, skillId];
    updateSelection(slot, { skillIds: nextSkillIds, skipped: false });
    setError("");
  };

  const confirmSelection = (slot, skipped = false) => {
    const selection = categorySelections[slot];
    if (!selection.categoryId) {
      setError("Choose a category before continuing.");
      return;
    }

    updateSelection(slot, {
      confirmed: true,
      skipped,
      skillIds: skipped ? [] : selection.skillIds,
    });
    setError("");
    setActiveStep(slot === "primary" ? "secondary" : "");
  };

  const editSelection = (slot) => {
    updateSelection(slot, { confirmed: false });
    setActiveStep(slot);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (confirmedCategoryIds.length === 0) {
      setError("Please confirm at least one job category.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/jobs/", {
        title: formData.title,
        description: formData.description,
        category_ids: confirmedCategoryIds,
        skill_ids: confirmedSkillIds,
        budget_type: formData.budget_type,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
        deadline: formData.deadline || null,
      });
      navigate("/client/dashboard");
    } catch (err) {
      if (err.response?.data) {
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Briefcase className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Post a New Job</h1>
            </div>
            <p className="text-slate-500 text-lg">Describe what you need securely and attract elite talent.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            {error && <Alert variant="error">{error}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need a Senior Django Developer for API Project"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <JobCategoryPicker
                  categories={categories}
                  skills={skills}
                  selections={categorySelections}
                  activeStep={activeStep}
                  confirmedSelections={confirmedSelections}
                  onCategoryChange={handleCategoryChange}
                  onToggleSkill={toggleSkill}
                  onConfirm={confirmSelection}
                  onEdit={editSelection}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Job Description</label>
              <textarea
                required
                rows={6}
                placeholder="Describe the project scope, required deliverables, and timeline..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none resize-y transition-shadow"
              />
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" /> Budget & Terms
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Type</label>
                  <select
                    value={formData.budget_type}
                    onChange={(e) => setFormData({ ...formData, budget_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none bg-white transition-shadow"
                  >
                    <option value="FIXED">Fixed Price</option>
                    <option value="HOURLY">Hourly Rate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Min Budget ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 500"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Budget ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 1000"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="max-w-xs w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-primary focus:border-primary shadow-sm outline-none transition-shadow"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> {loading ? "Posting..." : "Post Job Live"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function JobCategoryPicker({
  categories,
  skills,
  selections,
  activeStep,
  confirmedSelections,
  onCategoryChange,
  onToggleSkill,
  onConfirm,
  onEdit,
}) {
  const getCategory = (categoryId) => categories.find((category) => category.id === categoryId);
  const selectedCategoryIds = Object.entries(selections)
    .filter(([, selection]) => selection.confirmed && selection.categoryId)
    .map(([, selection]) => selection.categoryId);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-900">
          Skill Categories <span className="text-red-500">*</span>
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Choose 1 to 2 categories. Each category can include up to 5 specific skills.
        </p>
      </div>

      {confirmedSelections.length > 0 && (
        <div className="space-y-3">
          {confirmedSelections.map(([slot, selection]) => (
            <ConfirmedCategoryRow
              key={slot}
              category={getCategory(selection.categoryId)}
              skills={skills.filter((skill) => selection.skillIds.includes(skill.id))}
              general={selection.skipped || selection.skillIds.length === 0}
              onEdit={() => onEdit(slot)}
            />
          ))}
        </div>
      )}

      <CategoryStep
        title="Primary Category"
        slot="primary"
        selection={selections.primary}
        categories={categories}
        skills={skills}
        active={activeStep === "primary" || !selections.primary.confirmed}
        excludedIds={selectedCategoryIds.filter((id) => id !== selections.primary.categoryId)}
        onCategoryChange={onCategoryChange}
        onToggleSkill={onToggleSkill}
        onConfirm={onConfirm}
      />

      {selections.primary.confirmed && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <CategoryStep
            title="Add a second category (optional)"
            slot="secondary"
            optional
            selection={selections.secondary}
            categories={categories}
            skills={skills}
            active={activeStep === "secondary" || (!selections.secondary.confirmed && activeStep === "secondary")}
            excludedIds={[selections.primary.categoryId]}
            onCategoryChange={onCategoryChange}
            onToggleSkill={onToggleSkill}
            onConfirm={onConfirm}
          />
        </div>
      )}
    </div>
  );
}

function CategoryStep({
  title,
  slot,
  selection,
  categories,
  skills,
  active,
  optional = false,
  excludedIds,
  onCategoryChange,
  onToggleSkill,
  onConfirm,
}) {
  if (selection.confirmed || !active) return null;

  const availableCategories = categories.filter((category) => !excludedIds.includes(category.id));
  const categorySkills = skills.filter((skill) => skill.category?.id === selection.categoryId);
  const selectedCount = selection.skillIds.length;

  return (
    <Card className="p-4 md:p-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-800">
            {title}
            {!optional && <span className="text-red-500"> *</span>}
          </label>
          <SearchableCategorySelect
            categories={availableCategories}
            value={selection.categoryId}
            placeholder={optional ? "Choose a category or leave it empty" : "Choose a category"}
            onChange={(value) => onCategoryChange(slot, value)}
          />
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            selection.categoryId ? "max-h-[420px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"
          }`}
        >
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900">Select matching skills</p>
              <span className={`text-xs font-semibold ${selectedCount >= 5 ? "text-amber-600" : "text-slate-500"}`}>
                {selectedCount}/5 selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categorySkills.length > 0 ? (
                categorySkills.map((skill) => {
                  const selected = selection.skillIds.includes(skill.id);
                  return (
                    <SkillChip
                      key={skill.id}
                      selected={selected}
                      disabled={!selected && selectedCount >= 5}
                      onClick={() => onToggleSkill(slot, skill.id)}
                    >
                      {skill.name}
                    </SkillChip>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No skills are listed for this category yet.</p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button" onClick={() => onConfirm(slot, false)} icon={Check}>
                Confirm Skills
              </Button>
              <button
                type="button"
                onClick={() => onConfirm(slot, true)}
                className="text-sm font-bold text-slate-500 transition hover:text-slate-900"
              >
                Skip - keep it general
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ConfirmedCategoryRow({ category, skills, general, onEdit }) {
  if (!category) return null;

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <p className="shrink-0 text-sm font-black text-slate-950">{category.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {general ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">General</span>
            ) : (
              skills.map((skill) => (
                <span key={skill.id} className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700 ring-1 ring-cyan-100">
                  {skill.name}
                </span>
              ))
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label={`Edit ${category.name}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function SearchableCategorySelect({ categories, value, placeholder, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedCategory = categories.find((category) => category.id === value);
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
      >
        <span className={selectedCategory ? "text-slate-900" : "text-slate-400"}>
          {selectedCategory?.name || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
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

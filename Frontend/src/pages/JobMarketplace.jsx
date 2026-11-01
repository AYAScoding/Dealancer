import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  LoadingState,
  PageHeader,
} from "../components/ui";
import { apiError, getCollection, money } from "../services/collections";

export default function JobMarketplace() {
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(false);
  const search = params.get("q") || "";
  const category = params.get("category") || "";
  const type = params.get("type") || "";
  const sort = params.get("sort") || "newest";
  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  useEffect(() => {
    const controller = new AbortController();
    getCollection("/jobs/?status=OPEN", controller.signal)
      .then((items) => setJobs(items.filter((item) => item.status === "OPEN")))
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(
            apiError(
              err,
              "Opportunities could not load. Please refresh to try again.",
            ),
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);
  const categories = [
    ...new Map(
      jobs
        .flatMap((job) => job.categories || [])
        .map((item) => [String(item.id), item]),
    ).values(),
  ];
  const filtered = jobs
    .filter(
      (job) =>
        (!type || job.budget_type === type) &&
        (!category ||
          job.categories?.some((item) => String(item.id) === category)) &&
        `${job.title} ${job.categories?.map((item) => item.name).join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "budget"
        ? Number(b.budget_max) - Number(a.budget_max)
        : new Date(b.created_at) - new Date(a.created_at),
    );
  return (
    <>
      <PageHeader
        eyebrow="The marketplace"
        title="Find your next opportunity."
        description="Discover projects that need your perspective and expertise."
      />
      <div className="filter-bar">
        <div className="search-field">
          <Search size={19} />
          <input
            aria-label="Search jobs by title or category"
            placeholder="Search jobs or expertise"
            value={search}
            onChange={(event) => update("q", event.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          icon={SlidersHorizontal}
          aria-expanded={filters}
          aria-controls="job-filters"
          onClick={() => setFilters(!filters)}
        >
          Filters{(category || type) && " (active)"}
        </Button>
      </div>
      {filters && (
        <div id="job-filters" className="filter-panel">
          <label className="field">
            Category
            <select
              value={category}
              onChange={(event) => update("category", event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Budget type
            <select
              value={type}
              onChange={(event) => update("type", event.target.value)}
            >
              <option value="">Any budget type</option>
              <option value="FIXED">Fixed price</option>
              <option value="HOURLY">Hourly</option>
            </select>
          </label>
          <label className="field">
            Sort by
            <select
              value={sort}
              onChange={(event) => update("sort", event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="budget">Highest budget</option>
            </select>
          </label>
        </div>
      )}
      {loading ? (
        <LoadingState label="Finding opportunities" />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : (
        <>
          <div className="feed-meta">
            <span>
              {filtered.length} open{" "}
              {filtered.length === 1 ? "opportunity" : "opportunities"}
            </span>
            <span>
              {sort === "newest" ? "Newest first" : "Highest budget first"}
            </span>
          </div>
          {!filtered.length ? (
            <EmptyState
              title="No matching opportunities"
              description="Try a different search or check back for new projects."
            >
              <Button variant="secondary" onClick={() => setParams({})}>
                Clear filters
              </Button>
            </EmptyState>
          ) : (
            <div className="job-grid">
              {filtered.map((job, index) => (
                <Link
                  className="surface job-card"
                  to={`/jobs/${job.id}`}
                  key={job.id}
                  style={{ "--index": Math.min(index, 7) }}
                >
                  <div className="job-card-top">
                    <Badge tone="success">Open for proposals</Badge>
                    <span>
                      {new Date(job.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h2>{job.title}</h2>
                  <div className="chips">
                    {job.categories?.map((item) => (
                      <Badge key={item.id}>{item.name}</Badge>
                    ))}
                  </div>
                  <div className="job-card-footer">
                    <div className="budget">
                      {money(job.budget_min)}
                      {Number(job.budget_max) > Number(job.budget_min) &&
                        ` - ${money(job.budget_max)}`}
                      <small>
                        {job.budget_type === "HOURLY"
                          ? "Per hour"
                          : "Fixed budget"}{" "}
                        &middot; {job.bid_count ?? 0} proposals
                      </small>
                    </div>
                    <ArrowUpRight size={21} />
                  </div>
                  {job.deadline && (
                    <p
                      className="muted"
                      style={{ fontSize: 11, marginTop: 15 }}
                    >
                      Deadline {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

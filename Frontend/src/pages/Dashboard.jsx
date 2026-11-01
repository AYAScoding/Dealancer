import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  Handshake,
  Plus,
  Search,
  CheckCircle2,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import {
  Alert,
  Button,
  Card,
  Drawer,
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
  Tabs,
} from "../components/ui";
import { apiError, getCollection, money } from "../services/collections";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const client = user?.role === "CLIENT";
  const [data, setData] = useState({ jobs: [], bids: [], contracts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("work");
  const [contract, setContract] = useState(null);
  const [action, setAction] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const jobs = client
          ? await getCollection("/jobs/my_jobs/", controller.signal)
          : [];
        const bids = await getCollection("/bids/", controller.signal);
        const contracts = await getCollection("/contracts/", controller.signal);
        setData({ jobs, bids, contracts });
      } catch (err) {
        if (!controller.signal.aborted)
          setError(
            apiError(
              err,
              "Your workspace could not load. Please refresh to try again.",
            ),
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [client]);
  async function updateContract() {
    setBusy(true);
    setActionError("");
    try {
      const { data: updated } = await api.patch(
        `/contracts/${contract.id}/${action}/`,
      );
      setData((previous) => ({
        ...previous,
        contracts: previous.contracts.map((item) =>
          item.id === contract.id ? updated : item,
        ),
        jobs: previous.jobs.map((item) =>
          item.id === updated.job
            ? { ...item, status: updated.job_status }
            : item,
        ),
      }));
      setContract(updated);
      setAction("");
    } catch (err) {
      setActionError(apiError(err));
    } finally {
      setBusy(false);
    }
  }
  const active = data.contracts.filter((item) => item.status === "ACTIVE");
  const completed = data.contracts.filter(
    (item) => item.status === "COMPLETED",
  );
  const pending = data.bids.filter((item) => item.status === "PENDING");
  const stats = [
    {
      label: client ? "Open jobs" : "Proposals sent",
      value: client
        ? data.jobs.filter((item) => item.status === "OPEN").length
        : data.bids.length,
      note: client ? "Accepting proposals" : "Across your opportunities",
      icon: BriefcaseBusiness,
    },
    {
      label: "Pending proposals",
      value: pending.length,
      note: client ? "Ready for your review" : "Awaiting a client decision",
      icon: FileText,
    },
    {
      label: "Active contracts",
      value: active.length,
      note: "Work in progress",
      icon: Handshake,
    },
    {
      label: "Completed projects",
      value: completed.length,
      note: "Marked as completed",
      icon: CheckCircle2,
    },
  ];
  const rows =
    tab === "contracts" ? data.contracts : client ? data.jobs : data.bids;
  return (
    <>
      <PageHeader
        eyebrow={client ? "Client overview" : "Freelancer overview"}
        title={`Welcome back${user?.first_name ? `, ${user.first_name}` : ""}.`}
        description={
          client
            ? "Your projects, people, and next steps in one place."
            : "Keep your opportunities and ongoing work in view."
        }
      >
        <Link
          className="button button-primary"
          to={client ? "/client/jobs/new" : "/jobs"}
        >
          {client ? <Plus size={17} /> : <Search size={17} />}
          {client ? "Post a job" : "Find work"}
        </Link>
      </PageHeader>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map(({ label, value, note, icon: Icon }) => (
              <Card className="stat-card" key={label}>
                <div className="stat-label">
                  {label}
                  <Icon size={17} />
                </div>
                <p className="stat-value">{value}</p>
                <p className="stat-note">{note}</p>
              </Card>
            ))}
          </div>
          <div className="overview-grid">
            <section>
              <h2 className="section-heading">Your workspace</h2>
              <Tabs
                value={tab}
                onChange={setTab}
                tabs={[
                  {
                    value: "work",
                    label: client ? "Job postings" : "My proposals",
                    count: client ? data.jobs.length : data.bids.length,
                  },
                  {
                    value: "contracts",
                    label: "Contracts",
                    count: data.contracts.length,
                  },
                ]}
              />
              {rows.length === 0 ? (
                <EmptyState
                  title={
                    tab === "contracts"
                      ? "No contracts yet"
                      : client
                        ? "Your first project starts here"
                        : "No proposals yet"
                  }
                  description={
                    tab === "contracts"
                      ? "An accepted proposal becomes a contract and appears here."
                      : client
                        ? "Post a clear brief to start receiving proposals."
                        : "Find an opportunity that matches your expertise."
                  }
                >
                  <Link
                    className="button button-secondary"
                    to={client ? "/client/jobs/new" : "/jobs"}
                  >
                    {client ? "Post a job" : "Explore opportunities"}
                  </Link>
                </EmptyState>
              ) : (
                rows.map((item) =>
                  tab === "contracts" ? (
                    <button
                      type="button"
                      key={item.id}
                      className="surface work-row w-full text-left"
                      onClick={() => {
                        setContract(item);
                        setAction("");
                        setActionError("");
                      }}
                    >
                      <div>
                        <h3>{item.job_title}</h3>
                        <div className="row-meta">
                          <span>{client ? item.freelancer : item.client}</span>
                          <span>{money(item.amount)}</span>
                        </div>
                      </div>
                      <div className="row-end">
                        <StatusBadge status={item.status} />
                        <ArrowUpRight size={17} />
                      </div>
                    </button>
                  ) : (
                    <Link
                      className="surface work-row"
                      to={`/jobs/${client ? item.id : item.job}`}
                      key={item.id}
                    >
                      <div>
                        <h3>{client ? item.title : item.job_title}</h3>
                        <div className="row-meta">
                          <span>
                            {client
                              ? `${money(item.budget_min)} - ${money(item.budget_max)}`
                              : money(item.proposed_amount)}
                          </span>
                          <span>
                            {client
                              ? `${item.bid_count ?? data.bids.filter((bid) => bid.job === item.id).length} proposals`
                              : `${item.estimated_days} days`}
                          </span>
                        </div>
                      </div>
                      <div className="row-end">
                        <StatusBadge status={item.status} />
                        <ArrowUpRight size={17} />
                      </div>
                    </Link>
                  ),
                )
              )}
            </section>
            <aside className="activity-panel">
              <h3>Contract snapshot</h3>
              <div className="row-meta">
                <span>Completed</span>
                <strong>
                  {completed.length} / {data.contracts.length}
                </strong>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Completed contracts"
                aria-valuemin={0}
                aria-valuemax={Math.max(data.contracts.length, 1)}
                aria-valuenow={completed.length}
              >
                <span
                  style={{
                    width: `${data.contracts.length ? (completed.length / data.contracts.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <p>Active contract value</p>
              <p
                className="budget"
                style={{ color: "var(--ink)", fontSize: 25, marginBottom: 28 }}
              >
                {money(
                  active.reduce((sum, item) => sum + Number(item.amount), 0),
                )}
              </p>
              <h3>Keep your profile current.</h3>
              <p>
                {client
                  ? "A complete company profile helps freelancers understand who they will work with."
                  : "Your skills and portfolio help clients understand what you bring to a project."}
              </p>
              <Link
                className="button button-secondary"
                style={{ marginTop: 18 }}
                to="/profile"
              >
                View profile
                <ArrowUpRight size={15} />
              </Link>
            </aside>
          </div>
        </>
      )}
      <Drawer
        open={Boolean(contract)}
        title="Contract details"
        onClose={() => {
          if (!busy) setContract(null);
        }}
      >
        {contract && (
          <>
            <StatusBadge status={contract.status} />
            <h3 style={{ fontSize: 22, margin: "20px 0" }}>
              {contract.job_title}
            </h3>
            <p className="muted">
              {client ? contract.freelancer : contract.client} &middot;{" "}
              {money(contract.amount)} &middot; {contract.estimated_days} days
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {contract.bid_cover_letter}
            </p>
            <Link
              className="button button-secondary"
              to={`/jobs/${contract.job}`}
            >
              View project
              <ArrowUpRight size={16} />
            </Link>
            {actionError && <Alert>{actionError}</Alert>}
            {contract.status === "ACTIVE" && (
              <>
                {action ? (
                  <div style={{ marginTop: 28 }}>
                    <p>
                      {action === "complete"
                        ? "Mark this contract and its job as completed?"
                        : "Cancel this contract? The project will no longer be active."}
                    </p>
                    <div className="heading-actions">
                      <Button
                        variant="secondary"
                        disabled={busy}
                        onClick={() => setAction("")}
                      >
                        Keep active
                      </Button>
                      <Button
                        variant={action === "cancel" ? "danger" : "primary"}
                        disabled={busy}
                        onClick={updateContract}
                      >
                        {busy ? "Saving..." : "Confirm"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="heading-actions">
                    <Button
                      variant="secondary"
                      onClick={() => setAction("cancel")}
                    >
                      Cancel contract
                    </Button>
                    <Button onClick={() => setAction("complete")}>
                      Mark completed
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}

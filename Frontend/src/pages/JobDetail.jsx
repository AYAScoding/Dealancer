import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Send } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { apiError, money } from "../services/collections";
import {
  Alert,
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from "../components/ui";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [panel, setPanel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [form, setForm] = useState({
    cover_letter: "",
    proposed_amount: "",
    estimated_days: "",
  });
  const client = user?.role === "CLIENT";
  const owner = client && String(job?.client_id) === String(user?.id);
  useEffect(() => {
    const controller = new AbortController();
    api
      .get(`/jobs/${id}/`, { signal: controller.signal })
      .then((response) => setJob(response.data))
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(apiError(err, "This project could not be loaded."));
      });
    return () => controller.abort();
  }, [id]);
  function openPanel(value) {
    setActionError("");
    setMessage("");
    setPanel(value);
  }
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setActionError("");
    try {
      const { data } = await api.post("/bids/", {
        job: job.id,
        cover_letter: form.cover_letter,
        proposed_amount: Number(form.proposed_amount),
        estimated_days: Number(form.estimated_days),
      });
      setJob((previous) => ({
        ...previous,
        bids: [...(previous.bids || []), data],
      }));
      setMessage("Your proposal was submitted successfully.");
      setPanel(null);
    } catch (err) {
      setActionError(apiError(err, "Your proposal could not be submitted."));
    } finally {
      setBusy(false);
    }
  }
  async function hire() {
    setBusy(true);
    setActionError("");
    const bid = panel;
    try {
      const { data } = await api.post(`/bids/${bid.id}/accept/`);
      setJob((previous) => ({
        ...previous,
        status: "IN_PROGRESS",
        bids: previous.bids.map((item) =>
          item.id === bid.id
            ? data
            : item.status === "PENDING"
              ? { ...item, status: "REJECTED" }
              : item,
        ),
      }));
      setMessage("Freelancer hired. Your contract is ready in your workspace.");
      setPanel(null);
    } catch (err) {
      // A post-commit notification error must not turn a completed hire into a false failure.
      try {
        const { data } = await api.get(`/jobs/${id}/`);
        setJob(data);
        if (
          data.bids?.some(
            (item) => item.id === bid.id && item.status === "ACCEPTED",
          )
        ) {
          setMessage(
            "Freelancer hired. Your contract is ready in your workspace.",
          );
          setPanel(null);
        } else
          setActionError(
            apiError(
              err,
              "Hiring was not completed. Please review the current project status.",
            ),
          );
      } catch {
        setActionError(
          "We could not confirm the hiring status. Refresh the project before trying again.",
        );
      }
    } finally {
      setBusy(false);
    }
  }
  if (error) return <Alert>{error}</Alert>;
  if (!job) return <LoadingState label="Loading project details" />;
  const ownBid = !client ? job.bids?.[0] : null;
  return (
    <>
      <Link
        className="button button-ghost"
        style={{ marginBottom: 22, paddingLeft: 0 }}
        to={client ? "/client/dashboard" : "/jobs"}
      >
        <ArrowLeft size={16} />
        {client ? "Back to workspace" : "Back to opportunities"}
      </Link>
      <PageHeader
        eyebrow="Project brief"
        title={job.title}
        description={`Posted by ${job.client} on ${new Date(job.created_at).toLocaleDateString()}`}
      >
        <StatusBadge status={job.status} />
      </PageHeader>
      {message && <Alert variant="success">{message}</Alert>}
      <div className="detail-layout">
        <div>
          <Card className="detail-copy">
            <h2>About the project</h2>
            <p>{job.description}</p>
            <div className="chips">
              {job.categories?.map((item) => (
                <Badge key={item.id}>{item.name}</Badge>
              ))}
            </div>
            {job.skills_required?.length > 0 && (
              <>
                <h2 style={{ marginTop: 30 }}>Skills & expertise</h2>
                <div className="chips">
                  {job.skills_required.map((skill) => (
                    <Badge tone="success" key={skill.id}>
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </Card>
          {owner && (
            <section style={{ marginTop: 30 }}>
              <h2 className="section-heading">
                Proposals <span className="muted">{job.bids?.length || 0}</span>
              </h2>
              {job.bids?.length ? (
                job.bids.map((bid) => (
                  <Card className="work-row" key={bid.id}>
                    <div>
                      <h3>{bid.freelancer}</h3>
                      <div className="row-meta">
                        <span>{money(bid.proposed_amount)}</span>
                        <span>{bid.estimated_days} days</span>
                        <StatusBadge status={bid.status} />
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => openPanel(bid)}>
                      Review
                      <ArrowUpRight size={15} />
                    </Button>
                  </Card>
                ))
              ) : (
                <EmptyState
                  title="Your next collaborator is on the way"
                  description="Proposals will appear here as freelancers apply."
                />
              )}
            </section>
          )}
          {ownBid && (
            <Card className="detail-copy" style={{ marginTop: 20 }}>
              <div className="section-heading">
                <h2>Your proposal</h2>
                <StatusBadge status={ownBid.status} />
              </div>
              <p>{ownBid.cover_letter}</p>
              <div className="row-meta" style={{ marginTop: 20 }}>
                <strong>{money(ownBid.proposed_amount)}</strong>
                <span>{ownBid.estimated_days} days</span>
              </div>
            </Card>
          )}
        </div>
        <Card className="project-facts">
          <div className="budget">
            {money(job.budget_min)}
            {Number(job.budget_max) > Number(job.budget_min) &&
              ` - ${money(job.budget_max)}`}
            <small>
              {job.budget_type === "HOURLY"
                ? "Hourly rate"
                : "Fixed project budget"}
            </small>
          </div>
          <dl>
            <dt>Posted</dt>
            <dd>{new Date(job.created_at).toLocaleDateString()}</dd>
            <dt>Deadline</dt>
            <dd>
              {job.deadline
                ? new Date(job.deadline).toLocaleDateString()
                : "Not specified"}
            </dd>
            <dt>Project status</dt>
            <dd>
              <StatusBadge status={job.status} />
            </dd>
          </dl>
          {!client && !ownBid && (
            <Button
              icon={Send}
              disabled={job.status !== "OPEN"}
              onClick={() => openPanel("proposal")}
            >
              {job.status === "OPEN"
                ? "Submit a proposal"
                : "Applications closed"}
            </Button>
          )}
          {owner && job.status === "IN_PROGRESS" && (
            <Link className="button button-primary" to="/client/dashboard">
              Go to contracts
              <ArrowUpRight size={16} />
            </Link>
          )}
        </Card>
      </div>
      <Drawer
        open={Boolean(panel)}
        title={panel === "proposal" ? "Your proposal" : "Review proposal"}
        onClose={() => {
          if (!busy) setPanel(null);
        }}
      >
        {panel === "proposal" ? (
          <form onSubmit={submit}>
            <p className="muted" style={{ fontSize: 13, marginBottom: 25 }}>
              {job.title}
            </p>
            <label className="field">
              Proposed amount ($)
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={form.proposed_amount}
                onChange={(event) =>
                  setForm({ ...form, proposed_amount: event.target.value })
                }
              />
            </label>
            <label className="field">
              Estimated delivery (days)
              <input
                type="number"
                min="1"
                step="1"
                required
                value={form.estimated_days}
                onChange={(event) =>
                  setForm({ ...form, estimated_days: event.target.value })
                }
              />
            </label>
            <label className="field">
              Cover letter
              <textarea
                required
                rows={7}
                value={form.cover_letter}
                onChange={(event) =>
                  setForm({ ...form, cover_letter: event.target.value })
                }
                placeholder="Your approach, relevant experience, and what you can deliver."
              />
            </label>
            {actionError && <Alert>{actionError}</Alert>}
            <div className="heading-actions">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => setPanel(null)}
              >
                Cancel
              </Button>
              <Button type="submit" icon={Send} disabled={busy}>
                {busy ? "Submitting..." : "Send proposal"}
              </Button>
            </div>
          </form>
        ) : (
          panel && (
            <>
              <h3 style={{ fontSize: 23, marginBottom: 14 }}>
                {panel.freelancer}
              </h3>
              <StatusBadge status={panel.status} />
              <p className="muted" style={{ marginTop: 24 }}>
                {money(panel.proposed_amount)} &middot; {panel.estimated_days}{" "}
                days
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{panel.cover_letter}</p>
              {actionError && <Alert>{actionError}</Alert>}
              {job.status === "OPEN" && panel.status === "PENDING" && (
                <>
                  <p className="muted">
                    Accepting creates a contract for{" "}
                    {money(panel.proposed_amount)} and closes the project to
                    other proposals.
                  </p>
                  <Button disabled={busy} onClick={hire}>
                    {busy ? "Confirming..." : "Confirm & hire freelancer"}
                  </Button>
                </>
              )}
            </>
          )
        )}
      </Drawer>
    </>
  );
}

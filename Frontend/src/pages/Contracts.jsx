import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import { Alert, Badge, Button, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import { CheckCircle, Clock, XCircle } from "lucide-react";

const statusVariant = {
  ACTIVE: "primary",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export default function Contracts() {
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const isClient = user?.role === "CLIENT";

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await api.get("/contracts/");
        setContracts(res.data.results || res.data);
      } catch (e) {
        console.error(e);
        setError("Failed to load contracts.");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const updateContract = async (contractId, action) => {
    const label = action === "complete" ? "mark this contract completed" : "cancel this contract";
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;

    setUpdatingId(contractId);
    setError("");
    try {
      const res = await api.patch(`/contracts/${contractId}/${action}/`);
      setContracts((prev) => prev.map((contract) => contract.id === contractId ? res.data : contract));
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.detail || `Failed to ${action} contract.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const activeContracts = contracts.filter((contract) => contract.status === "ACTIVE");
  const pastContracts = contracts.filter((contract) => contract.status !== "ACTIVE");

  return (
    <AppShell title="Active Work" subtitle={isClient ? "Track hired freelancers and delivery." : "Track jobs you have been hired for."}>
      <PageHeader
        title="Active Work"
        description={isClient ? "Manage contract delivery after hiring a freelancer." : "Keep your accepted client work organized."}
      />

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {loading ? (
        <LoadingState label="Loading contracts..." />
      ) : (
        <div className="space-y-8">
          <ContractSection
            title="Active contracts"
            emptyText="No active work yet."
            contracts={activeContracts}
            isClient={isClient}
            updatingId={updatingId}
            onComplete={(id) => updateContract(id, "complete")}
            onCancel={(id) => updateContract(id, "cancel")}
          />
          <ContractSection
            title="Past contracts"
            emptyText="Completed and cancelled contracts will appear here."
            contracts={pastContracts}
            isClient={isClient}
            updatingId={updatingId}
            onComplete={(id) => updateContract(id, "complete")}
            onCancel={(id) => updateContract(id, "cancel")}
          />
        </div>
      )}
    </AppShell>
  );
}

function ContractSection({ title, emptyText, contracts, isClient, updatingId, onComplete, onCancel }) {
  return (
    <Card>
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
      </div>
      {contracts.length === 0 ? (
        <div className="p-6">
          <EmptyState title={emptyText} description="Contracts are created automatically when a client hires a freelancer." />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {contracts.map((contract) => (
            <div key={contract.id} className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-black text-slate-950">{contract.job_title}</h3>
                    <Badge variant={statusVariant[contract.status] || "neutral"}>{contract.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>{isClient ? `Freelancer: ${contract.freelancer}` : `Client: ${contract.client}`}</span>
                    <span>Amount: ${contract.amount}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {contract.estimated_days} days</span>
                  </div>
                  {contract.bid_cover_letter && (
                    <p className="mt-4 max-w-3xl rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600 line-clamp-3">
                      {contract.bid_cover_letter}
                    </p>
                  )}
                </div>

                {contract.status === "ACTIVE" && (
                  <div className="flex flex-wrap gap-3">
                    <Button variant="success" icon={CheckCircle} disabled={updatingId === contract.id} onClick={() => onComplete(contract.id)}>
                      Mark completed
                    </Button>
                    <Button variant="danger" icon={XCircle} disabled={updatingId === contract.id} onClick={() => onCancel(contract.id)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

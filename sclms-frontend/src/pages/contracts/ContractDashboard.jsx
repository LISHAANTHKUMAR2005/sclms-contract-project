import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/contract.css";

function ContractDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⛔ wait until id exists
    if (!id) return;

    const fetchContract = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/contracts/${id}`);

        if (!res.ok) throw new Error("Server error");

        const data = await res.json();
        setContract(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load contract details");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  if (loading) return <p style={{ padding: "32px" }}>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!contract) return <p className="error">Contract not found</p>;

  return (
    <div className="contract-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="contract-detail-card">
        <h1>{contract.title}</h1>

        <div className="contract-meta">
          <span><b>From:</b> {contract.fromOrg}</span>
          <span><b>To:</b> {contract.toOrg}</span>

          <span className={`contract-status ${contract.status?.toLowerCase()}`}>
            {contract.status}
          </span>
        </div>

        <hr />

        <p><b>Contract Type:</b> {contract.contractType || "—"}</p>

        <p><b>Description</b></p>
        <p>{contract.description || "No description provided"}</p>

        <div className="contract-dates">
          <p><b>Start Date:</b> {contract.startDate || "—"}</p>
          <p><b>End Date:</b> {contract.endDate || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export default ContractDetails;

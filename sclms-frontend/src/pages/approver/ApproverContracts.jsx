import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { createDebugLogger } from "../../utils/debug";
import { Search } from "lucide-react";
import "../../styles/approver-contracts.css";

const debugLogger = createDebugLogger('ApproverContracts');
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ApproverContracts() {

  // eslint-disable-next-line no-unused-vars
  const { user } = useContext(AuthContext);

  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("date_desc");

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      debugLogger.log("Starting data load");
      setLoading(true);
      setError("");

      try {
        const [p, a, r] = await Promise.all([
          apiRequest("contracts/approver/pending"),
          apiRequest("contracts/approver/approved"),
          apiRequest("contracts/approver/rejected")
        ]);

        setPending(Array.isArray(p) ? p : []);
        setApproved(Array.isArray(a) ? a : []);
        setRejected(Array.isArray(r) ? r : []);

      } catch (err) {
        debugLogger.error("Load failed", err);
        setError(`Failed to load contracts: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Merge lists
  const merged = [
    ...pending.map(c => ({ ...c, status: "PENDING" })),
    ...approved.map(c => ({ ...c, status: "APPROVED" })),
    ...rejected.map(c => ({ ...c, status: "REJECTED" }))
  ];

  // Search
  const filtered = merged.filter(c =>
    (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.fromOrg || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.toOrg || "").toLowerCase().includes(search.toLowerCase())
  );

  // Status filter
  const statusFiltered =
    statusFilter === "ALL"
      ? filtered
      : filtered.filter(c => c.status === statusFilter);

  // Sort
  const sorted = [...statusFiltered].sort((a, b) => {
    if (sort === "title_asc") return a.title.localeCompare(b.title);
    if (sort === "title_desc") return b.title.localeCompare(a.title);
    if (sort === "date_asc") return new Date(a.createdDate) - new Date(b.createdDate);
    return new Date(b.createdDate) - new Date(a.createdDate);
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Export
  const exportData = merged.map(c => ({
    Title: c.title,
    From: c.fromOrg,
    To: c.toOrg,
    Status: c.status,
    Created: c.createdDate
  }));

  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Contracts");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "contracts.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Approver Contract Report", 14, 20);

    autoTable(doc, {
      head: [["Title", "From", "To", "Status", "Created"]],
      body: exportData.map(o => Object.values(o)),
      startY: 30
    });

    doc.save("contracts.pdf");
  };

  return (
    <div className="ap-page">

      <h2 className="page-title">Contracts</h2>

      <div className="filter-bar">

        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search title / organization"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="export-bar">
          <button onClick={exportExcel}>Export Excel</button>
          <button onClick={exportPDF}>Export PDF</button>
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="title_asc">Title A–Z</option>
          <option value="title_desc">Title Z–A</option>
        </select>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="tab-card">

          {paginated.length === 0 && (
            <p className="empty">No matching records found</p>
          )}

          {paginated.map(c => (
            <div className="contract-row" key={c.id}>
              <div>
                <b>{c.title}</b>
                <p className="muted">{c.fromOrg} → {c.toOrg}</p>
              </div>

              <div className="action-buttons">

                {c.status === "PENDING" && (
                  <Link to={`/approver/contracts/approve/${c.id}`} className="btn-primary">
                    Review
                  </Link>
                )}

                {(c.status === "APPROVED" || c.status === "REJECTED") && (
                  <>
                    <Link to={`/approver/contracts/view/${c.id}`} className="btn-secondary">
                      View Details
                    </Link>

                    <span className={`status-text ${c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

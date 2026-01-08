import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../utils/api";
import {
  FiSearch, FiFilter, FiEye, FiFileText, FiDownload,
  FiPlus, FiCalendar, FiHome, FiCheckCircle,
  FiClock, FiXCircle, FiAlertCircle, FiGrid, FiList,
  FiRefreshCw
} from "react-icons/fi";
import "../../styles/contract-list.css";

function ViewAllContracts() {
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("table"); // table or card
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadContracts();
  }, [user]);

  useEffect(() => {
    filterAndSortContracts();
  }, [contracts, search, statusFilter, sortBy]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await api.get(`contracts/my/${user.id}`);
      setContracts(data);
    } catch (error) {
      console.error("Failed to load contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortContracts = () => {
    let filtered = contracts.filter(contract => {
      const matchesSearch = contract.title.toLowerCase().includes(search.toLowerCase()) ||
                           contract.fromOrg.toLowerCase().includes(search.toLowerCase()) ||
                           contract.toOrg.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || contract.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort contracts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
        case "oldest":
          return new Date(a.createdDate || 0) - new Date(b.createdDate || 0);
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredContracts(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED": return <FiCheckCircle className="status-icon approved" />;
      case "PENDING": return <FiClock className="status-icon pending" />;
      case "REJECTED": return <FiXCircle className="status-icon rejected" />;
      default: return <FiAlertCircle className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "approved";
      case "PENDING": return "pending";
      case "REJECTED": return "rejected";
      default: return "";
    }
  };

  const exportMyContracts = async () => {
    try {
      const contracts = await api.get(`contracts/my/${user.id}`);

      // Create CSV content
      const csvContent = [
        ['Title', 'Status', 'From Organization', 'To Organization', 'Created Date', 'Description'].join(','),
        ...contracts.map(contract => [
          `"${contract.title || ''}"`,
          contract.status || '',
          `"${contract.fromOrg || ''}"`,
          `"${contract.toOrg || ''}"`,
          contract.createdDate || '',
          `"${contract.description || ''}"`
        ].join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'my_contracts.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      alert('Contracts exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export contracts. Please try again.');
    }
  };

  const ContractCard = ({ contract }) => (
    <div className="contract-card">
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">{contract.title}</h3>
          <span className={`card-status ${getStatusColor(contract.status)}`}>
            {getStatusIcon(contract.status)}
            {contract.status}
          </span>
        </div>
        <div className="card-date">
          <FiCalendar />
          {contract.createdDate ? new Date(contract.createdDate).toLocaleDateString() : 'N/A'}
        </div>
      </div>

      <div className="card-content">
        <div className="card-orgs">
          <div className="org-item">
            <FiHome className="org-icon from" />
            <span><strong>From:</strong> {contract.fromOrg}</span>
          </div>
          <div className="org-item">
            <FiHome className="org-icon to" />
            <span><strong>To:</strong> {contract.toOrg}</span>
          </div>
        </div>

        <div className="card-meta">
          <span className="contract-type">{contract.contractType || 'General'}</span>
          {contract.startDate && contract.endDate && (
            <span className="contract-duration">
              {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="card-actions">
        <Link to={`view/${contract.id}`} className="btn-primary">
          <FiEye /> View Details
        </Link>

        {contract.documentUrl && (
          <a
            href={`http://localhost:8080/api/contracts/file/${contract.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <FiDownload /> Download
          </a>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="contracts-loading">
        <div className="loading-spinner"></div>
        <p>Loading your contracts...</p>
      </div>
    );
  }

  return (
    <div className="contracts-page">

      {/* Header Section */}
      <div className="contracts-header">
        <div className="header-content">
          <h1 className="page-title">
            <FiFileText className="title-icon" />
            My Contracts
          </h1>
          <p className="page-subtitle">Manage and track all your contract requests</p>
        </div>

        <div className="header-actions">
          <button onClick={exportMyContracts} className="btn-export">
            <FiDownload /> Export My Contracts
          </button>
          <Link to="create" className="btn-create">
            <FiPlus /> Create Contract
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="contracts-stats">
        <div className="stat-item">
          <div className="stat-number">{contracts.length}</div>
          <div className="stat-label">Total Contracts</div>
        </div>
        <div className="stat-item approved">
          <div className="stat-number">{contracts.filter(c => c.status === 'APPROVED').length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-item pending">
          <div className="stat-number">{contracts.filter(c => c.status === 'PENDING').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-item rejected">
          <div className="stat-number">{contracts.filter(c => c.status === 'REJECTED').length}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="contracts-controls">

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Filters & View Options */}
        <div className="controls-section">

          {/* Status Filter */}
          <div className="filter-group">
            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> Filters
            </button>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="sort-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <FiList />
            </button>
            <button
              className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
            >
              <FiGrid />
            </button>
          </div>

        </div>

      </div>

      {/* Contracts Display */}
      <div className="contracts-content">

        {filteredContracts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No contracts found</h3>
            <p>
              {contracts.length === 0
                ? "You haven't created any contracts yet."
                : "No contracts match your current filters."
              }
            </p>
            <Link to="create" className="btn-create">
              <FiPlus /> Create Your First Contract
            </Link>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="results-summary">
              <p>Showing {filteredContracts.length} of {contracts.length} contracts</p>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="contracts-table-container">
                <table className="contracts-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>From Organization</th>
                      <th>To Organization</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map(contract => (
                      <tr key={contract.id}>
                        <td>
                          <div className="contract-title-cell">
                            <strong>{contract.title}</strong>
                          </div>
                        </td>
                        <td>{contract.fromOrg}</td>
                        <td>{contract.toOrg}</td>
                        <td>
                          <span className="contract-type-badge">
                            {contract.contractType || 'General'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(contract.status)}`}>
                            {getStatusIcon(contract.status)}
                            {contract.status}
                          </span>
                        </td>
                        <td>
                          {contract.createdDate
                            ? new Date(contract.createdDate).toLocaleDateString()
                            : 'N/A'
                          }
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link
                              to={`view/${contract.id}`}
                              className="btn-action view"
                              title="View Details"
                            >
                              <FiEye />
                            </Link>

                            {contract.documentUrl && (
                              <a
                                href={`http://localhost:8080/api/contracts/file/${contract.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-action download"
                                title="Download Document"
                              >
                                <FiDownload />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Card View */}
            {viewMode === 'card' && (
              <div className="contracts-grid">
                {filteredContracts.map(contract => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </>
        )}

      </div>

    </div>
  );
}

export default ViewAllContracts;

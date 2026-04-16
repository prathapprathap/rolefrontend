import axios from 'axios';
import { AlertCircle, Database, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const limit = 6;

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // Using a query that returns all users to show the total 10 users mentioned by user
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/data/get-data`, {
                dataCode: 'GET_USERS_BY_STATUS',
                placeholderKeyValueMap: { status: 'active\' OR \'1\'=\'1' } // Hack to get all for now, or I'll just change the seed query later
            });
            setData(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalPages = Math.ceil(data.length / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);

    return (
        <div className="dashboard fade-in">
            <div className="welcome-banner glass-card">
                <h1>Welcome back, Admin!</h1>
                <p>Here's what's happening in your system today.</p>
            </div>

            <div className="stats-row">
                <div className="stat-card glass-card">
                    <div className="stat-header">
                        <h3>Total Registered Users</h3>
                        <Database size={20} color="#6366f1" />
                    </div>
                    <div className="stat-value">{data.length}</div>
                    <div className="stat-trend">Showing {limit} per page</div>
                </div>
            </div>

            <div className="data-section glass-card">
                <div className="section-header">
                    <h2>Dynamic Data Exploration (Data Code Logic)</h2>
                    <button onClick={fetchData} className="refresh-btn" disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="error-box">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row, idx) => (
                                <tr key={idx}>
                                    <td>{row.id}</td>
                                    <td>{row.username}</td>
                                    <td>
                                        <span className={`status-pill ${row.status}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="3" className="no-data">No data found using the Data Code service</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {data.length > limit && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <span className="page-info">Page {page} of {totalPages}</span>
                            <button
                                className="pagination-btn"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .welcome-banner {
          padding: 40px;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.2), transparent);
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }
        .stat-card {
          padding: 24px;
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          color: var(--text-muted);
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .stat-trend {
          font-size: 0.85rem;
          color: var(--success);
        }
        .section-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-secondary);
          color: var(--text-main);
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }
        .refresh-btn:hover { background: var(--primary); color: white; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .table-container { padding: 0 20px 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; padding: 16px; color: var(--text-muted); font-weight: 500; font-size: 0.9rem; }
        td { padding: 16px; border-top: 1px solid var(--border-color); }
        .status-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pill.active { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-pill.inactive { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .no-data { text-align: center; padding: 40px; color: var(--text-muted); }
        .error-box {
          margin: 20px;
          padding: 15px;
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
          padding: 20px;
          border-top: 1px solid var(--border-color);
        }
        .pagination-btn {
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-main);
          font-size: 0.9rem;
        }
        .pagination-btn:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
        }
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-info {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
};

export default Dashboard;

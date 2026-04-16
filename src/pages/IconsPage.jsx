import axios from 'axios';
import * as LucideIcons from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const IconsPage = () => {
    const [icons, setIcons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIcon, setEditingIcon] = useState(null);
    const [formData, setFormData] = useState({ name: '', prefix: 'lucide', icon_url: '', status: 'active' });
    const user = JSON.parse(localStorage.getItem('user'));
    const isSuperAdmin = user?.role_id === 1 || user?.permissions?.includes('*');
    const limit = 6;

    useEffect(() => {
        fetchIcons();
    }, [page]);

    const fetchIcons = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/icons/paginated?page=${page}&limit=${limit}`);
            setIcons(response.data.icons);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.totalItems);
        } catch (error) {
            console.error('Error fetching icons:', error);
        } finally {
            setLoading(false);
        }
    };

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Icon name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (editingIcon) {
                await axios.put(`${import.meta.env.VITE_API_URL}/icons/${editingIcon.id}`, formData);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/icons`, formData);
            }
            setIsModalOpen(false);
            setEditingIcon(null);
            setFormData({ name: '', prefix: 'lucide', icon_url: '', status: 'active' });
            setErrors({});
            fetchIcons();
        } catch (err) {
            setErrors({ submit: err.response?.data?.error || 'Operation failed' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this icon?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/icons/${id}`);
                fetchIcons();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const openEdit = (icon) => {
        setEditingIcon(icon);
        setFormData({ name: icon.name, prefix: icon.prefix, icon_url: icon.icon_url || '', status: icon.status });
        setIsModalOpen(true);
    };

    return (
        <div className="icons-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Icon Management</h1>
                    <p className="subtitle">Manage and view all available system icons</p>
                </div>
                {isSuperAdmin && (
                    <button className="btn-primary" onClick={() => { setEditingIcon(null); setFormData({ name: '', prefix: 'lucide', icon_url: '', status: 'active' }); setIsModalOpen(true); }}>
                        <LucideIcons.Plus size={18} />
                        <span>New Icon</span>
                    </button>
                )}
            </div>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <span className="stat-label">Total Icons</span>
                    <span className="stat-value">{totalItems}</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-label">Current Page</span>
                    <span className="stat-value">{page} / {totalPages}</span>
                </div>
            </div>

            <div className="table-wrapper glass-card">
                {loading ? (
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <p>Loading icons...</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Preview</th>
                                    <th>Icon Name</th>
                                    <th>Internet Path</th>
                                    <th>Status</th>
                                    {isSuperAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {icons.map((icon) => {
                                    const IconComponent = LucideIcons[icon.name] || LucideIcons.Circle;
                                    return (
                                        <tr key={icon.id}>
                                            <td>#{icon.id}</td>
                                            <td>
                                                <div className="icon-preview-circle">
                                                    {icon.icon_url ? (
                                                        <img src={icon.icon_url} alt={icon.name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                                    ) : (
                                                        <IconComponent size={20} />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="font-mono">{icon.name}</td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {icon.icon_url ? <code title={icon.icon_url}>{icon.icon_url}</code> : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${icon.status}`}>
                                                    {icon.status}
                                                </span>
                                            </td>
                                            {isSuperAdmin && (
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button className="icon-btn" onClick={() => openEdit(icon)}><LucideIcons.Edit2 size={16} /></button>
                                                        <button className="icon-btn text-danger" onClick={() => handleDelete(icon.id)}><LucideIcons.Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="pagination-btn"
                            >
                                <ChevronLeft size={18} /> Previous
                            </button>
                            <div className="page-info">
                                Page <strong>{page}</strong> of {totalPages}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="pagination-btn"
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card fade-in">
                        <h2>{editingIcon ? 'Edit Icon' : 'Create New Icon'}</h2>
                        <form onSubmit={handleSubmit}>
                            {errors.submit && <div className="error-box" style={{ marginBottom: '15px' }}>{errors.submit}</div>}

                            <div className="input-group">
                                <label>Icon Name (Lucide name or label)</label>
                                <input
                                    type="text"
                                    className={errors.name ? 'error' : ''}
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (errors.name) setErrors({ ...errors, name: null });
                                    }}
                                    placeholder="e.g. LayoutDashboard"
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>

                            <div className="input-group">
                                <label>Internet Path (Icon URL)</label>
                                <input
                                    type="text"
                                    value={formData.icon_url}
                                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                                    placeholder="e.g. https://example.com/icon.svg"
                                />
                                <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                    If provided, this URL will be used instead of the Lucide icon.
                                </small>
                            </div>

                            <div className="input-group">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Icon</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .btn-primary {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 8px;
                    background: var(--primary);
                    color: white;
                    font-weight: 600;
                    transition: 0.2s;
                }
                .btn-primary:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                .icon-btn {
                    padding: 8px;
                    border-radius: 6px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    color: var(--text-main);
                    cursor: pointer;
                    transition: 0.2s;
                }
                .icon-btn:hover {
                    background: var(--primary);
                    color: white;
                }
                .icon-btn.text-danger:hover {
                    background: var(--danger);
                    color: white;
                }

                .icons-container {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }
                .page-header {
                    margin-bottom: 10px;
                }
                .subtitle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    margin-top: 5px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }
                .stat-card {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .stat-label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .stat-value {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--primary);
                }
                .table-wrapper {
                    padding: 0;
                    overflow: hidden;
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .data-table th {
                    padding: 16px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    border-bottom: 1px solid var(--border-color);
                }
                .data-table td {
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--border-color);
                    vertical-align: middle;
                }
                .icon-preview-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .font-mono {
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 500;
                    color: var(--text-main);
                }
                .status-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .status-badge.active {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }
                .pagination {
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(255, 255, 255, 0.01);
                }
                .pagination-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 8px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    color: var(--text-main);
                    cursor: pointer;
                    transition: 0.2s;
                    font-weight: 500;
                }
                .pagination-btn:hover:not(:disabled) {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: rgba(99, 102, 241, 0.05);
                }
                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .page-info {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .loading-state {
                    padding: 60px;
                    text-align: center;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};

export default IconsPage;

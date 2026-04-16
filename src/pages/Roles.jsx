import axios from 'axios';
import { CheckCircle2, Edit2, Plus, Power, Shield, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 6;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({ role_name: '', permissions: [], status: 'active' });

    const fetchRoles = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/roles?page=${page}&limit=${limit}`);
        if (res.data.roles) {
            setRoles(res.data.roles);
            setTotalPages(res.data.totalPages);
        } else {
            setRoles(res.data);
        }
    };

    const fetchMenus = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/menus/all`);
        setMenus(res.data);
    };

    useEffect(() => {
        fetchRoles();
        fetchMenus();
    }, [page]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await axios.put(`${import.meta.env.VITE_API_URL}/roles/${editingRole.id}`, formData);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/roles`, formData);
            }
            setIsModalOpen(false);
            setEditingRole(null);
            setFormData({ role_name: '', permissions: [], status: 'active' });
            fetchRoles();
        } catch (err) {
            alert('Operation failed');
        }
    };

    const toggleStatus = async (id) => {
        await axios.patch(`${import.meta.env.VITE_API_URL}/roles/${id}/status`);
        fetchRoles();
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setFormData({ role_name: role.role_name, permissions: role.permissions || [], status: role.status });
        setIsModalOpen(true);
    };

    const handleMenuToggle = (menuId) => {
        const updated = formData.permissions.includes(menuId)
            ? formData.permissions.filter(id => id !== menuId)
            : [...formData.permissions, menuId];
        setFormData({ ...formData, permissions: updated });
    };

    return (
        <div className="roles-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Role Management</h1>
                    <p>Define access levels and menu permissions</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingRole(null); setFormData({ role_name: '', permissions: [], status: 'active' }); setIsModalOpen(true); }}>
                    <Plus size={18} />
                    <span>New Role</span>
                </button>
            </div>

            <div className="roles-grid">
                {roles.map(role => (
                    <div key={role.id} className={`role-card glass-card ${role.status === 'inactive' ? 'dimmed' : ''}`}>
                        <div className="role-card-header">
                            <div className="role-icon">
                                <Shield size={24} color={role.status === 'active' ? '#6366f1' : '#94a3b8'} />
                            </div>
                            <div className={`status-badge ${role.status}`}>
                                {role.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                {role.status}
                            </div>
                        </div>

                        <h3 className="role-name">{role.role_name}</h3>
                        <p className="role-perms-count">{role.permissions?.includes('*') ? 'All Permissions' : `${role.permissions?.length || 0} Menus Access`}</p>

                        <div className="role-actions">
                            <button className="icon-btn" onClick={() => openEdit(role)}>
                                <Edit2 size={18} />
                            </button>
                            <button className={`icon-btn ${role.status === 'active' ? 'text-danger' : 'text-success'}`} onClick={() => toggleStatus(role.id)}>
                                <Power size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', alignItems: 'center' }}>
                    <button
                        className="btn-ghost"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        style={{ padding: '8px 16px', opacity: page === 1 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>
                    <span style={{ color: 'var(--text-muted)' }}>Page <strong>{page}</strong> of {totalPages}</span>
                    <button
                        className="btn-ghost"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        style={{ padding: '8px 16px', opacity: page === totalPages ? 0.5 : 1 }}
                    >
                        Next
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card fade-in">
                        <h2>{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Role Name</label>
                                <input
                                    type="text"
                                    value={formData.role_name}
                                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                                    placeholder="e.g. Sales Manager"
                                    required
                                />
                            </div>

                            <div className="permissions-section">
                                <label>Menu Permissions</label>
                                <div className="menus-list" style={{ display: 'block', maxHeight: '300px' }}>
                                    {(() => {
                                        const buildTree = (items, parentId = null) => {
                                            return items
                                                .filter(item => item.parent_id === parentId)
                                                .map(item => ({
                                                    ...item,
                                                    children: buildTree(items, item.id)
                                                }));
                                        };
                                        const menuTree = buildTree(menus);

                                        const renderMenuItem = (item, depth = 0) => (
                                            <div key={item.id} style={{ marginLeft: `${depth * 24}px`, marginBottom: '10px' }}>
                                                <div className="menu-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input
                                                        type="checkbox"
                                                        id={`menu-${item.id}`}
                                                        checked={formData.permissions.includes(item.id) || formData.permissions.includes('*')}
                                                        onChange={() => handleMenuToggle(item.id)}
                                                        disabled={formData.permissions.includes('*')}
                                                    />
                                                    <label htmlFor={`menu-${item.id}`} style={{ cursor: 'pointer', color: 'var(--text-main)' }}>
                                                        {depth > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '4px' }}>└</span>}
                                                        {item.title}
                                                    </label>
                                                </div>
                                                {item.children.length > 0 && (
                                                    <div className="menu-children">
                                                        {item.children.map(child => renderMenuItem(child, depth + 1))}
                                                    </div>
                                                )}
                                            </div>
                                        );

                                        return menuTree.length > 0 ? menuTree.map(item => renderMenuItem(item)) : <p style={{ color: 'var(--text-muted)' }}>No menus found</p>;
                                    })()}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Role</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .roles-page { display: flex; flex-direction: column; gap: 30px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
        .role-card { padding: 24px; transition: transform 0.3s; }
        .role-card:hover { transform: translateY(-5px); }
        .role-card.dimmed { opacity: 0.6; }
        .role-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .role-icon { width: 48px; height: 48px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .status-badge { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
        .status-badge.active { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-badge.inactive { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .role-name { font-size: 1.25rem; margin-bottom: 8px; }
        .role-perms-count { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; }
        .role-actions { display: flex; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 16px; }
        .icon-btn { background: var(--bg-secondary); color: var(--text-main); padding: 10px; border-radius: 8px; display: flex; align-items: center; border: 1px solid var(--border-color); }
        .icon-btn:hover { background: var(--primary); color: white; }
        .text-danger:hover { background: var(--danger); color: white; }
        .text-success:hover { background: var(--success); color: white; }

        /* Modal Styles */
        .permissions-section { margin-bottom: 24px; }
        .permissions-section label { display: block; margin-bottom: 12px; color: var(--text-muted); font-size: 0.9rem; }
        .menus-list { max-height: 250px; overflow-y: auto; padding: 16px; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); }
        .menu-checkbox { display: flex; align-items: center; gap: 10px; color: var(--text-main); }
      `}</style>
        </div>
    );
};

export default Roles;

import axios from 'axios';
import * as LucideIcons from 'lucide-react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const Menus = () => {
    const [menus, setMenus] = useState([]);
    const [allMenus, setAllMenus] = useState([]);
    const [icons, setIcons] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 6;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [formData, setFormData] = useState({
        title: '', path: '', icon_id: '', parent_id: null, order: 0
    });

    const fetchMenus = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/menus/all?page=${page}&limit=${limit}`);
            if (res.data.menus) {
                setMenus(res.data.menus);
                setTotalPages(res.data.totalPages);
            } else {
                setMenus(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch menus');
        }
    };

    const fetchIcons = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/icons/list`);
            setIcons(res.data);
        } catch (err) {
            console.error('Failed to fetch icons');
        }
    };

    const fetchAllMenus = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/menus/all`);
            const data = Array.isArray(res.data) ? res.data : (res.data.menus || []);
            setAllMenus(data);
        } catch (err) {
            console.error('Failed to fetch all menus');
        }
    };

    // Build a flat list with depth for the parent dropdown
    const buildFlatTree = (items, parentId = null, depth = 0) => {
        const result = [];
        items
            .filter(item => item.parent_id === parentId)
            .sort((a, b) => a.order - b.order)
            .forEach(item => {
                result.push({ ...item, depth });
                result.push(...buildFlatTree(items, item.id, depth + 1));
            });
        return result;
    };

    const flatMenuTree = buildFlatTree(allMenus);

    // Get depth of a menu item for table display
    const getMenuDepth = (menuId, items) => {
        let depth = 0;
        let current = items.find(m => m.id === menuId);
        while (current && current.parent_id) {
            depth++;
            current = items.find(m => m.id === current.parent_id);
        }
        return depth;
    };

    useEffect(() => {
        fetchMenus();
        fetchIcons();
        fetchAllMenus();
    }, [page]);

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Menu title is required';
        if (!formData.path.trim()) newErrors.path = 'Route path is required';
        else if (!formData.path.startsWith('/')) newErrors.path = 'Path must start with /';

        if (!formData.icon_id) newErrors.icon_id = 'Please select an icon';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const data = {
                ...formData,
                parent_id: formData.parent_id === "" ? null : formData.parent_id,
                icon_id: formData.icon_id === "" ? null : parseInt(formData.icon_id)
            };
            if (editingMenu) {
                await axios.put(`${import.meta.env.VITE_API_URL}/menus/${editingMenu.id}`, data);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/menus`, data);
            }
            setIsModalOpen(false);
            setEditingMenu(null);
            setFormData({ title: '', path: '', icon_id: '', parent_id: null, order: 0 });
            fetchMenus();
            fetchAllMenus();
        } catch (err) {
            setErrors({ submit: err.response?.data?.error || 'Operation failed' });
        }
    };

    const deleteMenu = async (id) => {
        if (window.confirm('Are you sure? This will delete the menu and its submenus if relations rely on it.')) {
            await axios.delete(`${import.meta.env.VITE_API_URL}/menus/${id}`);
            fetchMenus();
            fetchAllMenus();
        }
    };

    const openEdit = (menu) => {
        setEditingMenu(menu);
        setFormData({
            title: menu.title,
            path: menu.path,
            icon_id: menu.icon_id || '',
            parent_id: menu.parent_id || '',
            order: menu.order
        });
        setIsModalOpen(true);
    };

    return (
        <div className="menus-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Menu Management</h1>
                    <p>Configure system sidebar and navigation architecture</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingMenu(null); setFormData({ title: '', path: '', icon: 'Circle', parent_id: null, order: 0 }); setIsModalOpen(true); }}>
                    <Plus size={18} />
                    <span>New Menu Item</span>
                </button>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Icon</th>
                                <th>Title</th>
                                <th>Path</th>
                                <th>Parent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menus.map(menu => {
                                const iconUrl = menu.Icon?.icon_url;
                                const iconName = menu.Icon ? menu.Icon.name : 'Circle';
                                const Icon = LucideIcons[iconName] || LucideIcons.Circle;
                                const depth = getMenuDepth(menu.id, allMenus.length ? allMenus : menus);
                                const parent = allMenus.find(m => m.id === menu.parent_id) || menus.find(m => m.id === menu.parent_id);

                                // Build parent path
                                const getParentPath = (menuItem) => {
                                    const path = [];
                                    let current = allMenus.find(m => m.id === menuItem.parent_id);
                                    while (current) {
                                        path.unshift(current.title);
                                        current = allMenus.find(m => m.id === current.parent_id);
                                    }
                                    return path.join(' › ');
                                };

                                return (
                                    <tr key={menu.id}>
                                        <td>{menu.order}</td>
                                        <td>
                                            {iconUrl ? (
                                                <img src={iconUrl} alt={menu.title} style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                                            ) : (
                                                <Icon size={18} color="var(--primary)" />
                                            )}
                                        </td>
                                        <td style={{ fontWeight: '600' }}>
                                            {depth > 0 && <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>{'└'.padStart(depth * 2, ' ')}</span>}
                                            {menu.title}
                                            {depth > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', marginLeft: '8px', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px' }}>L{depth}</span>}
                                        </td>
                                        <td><code>{menu.path}</code></td>
                                        <td>{parent ? <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{getParentPath(menu)} › <strong style={{ color: 'var(--text-main)' }}>{parent.title}</strong></span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="icon-btn" onClick={() => openEdit(menu)} title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="icon-btn text-danger" onClick={() => deleteMenu(menu.id)} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px', alignItems: 'center' }}>
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
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card fade-in">
                        <h2>{editingMenu ? 'Edit Menu Item' : 'Create Menu Item'}</h2>
                        <form onSubmit={handleSubmit}>
                            {errors.submit && <div className="error-box" style={{ marginBottom: '15px' }}>{errors.submit}</div>}

                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Menu Title</label>
                                    <input
                                        type="text"
                                        className={errors.title ? 'error' : ''}
                                        value={formData.title}
                                        onChange={(e) => {
                                            setFormData({ ...formData, title: e.target.value });
                                            if (errors.title) setErrors({ ...errors, title: null });
                                        }}
                                        placeholder="e.g. Analytics"
                                    />
                                    {errors.title && <span className="error-text">{errors.title}</span>}
                                </div>
                                <div className="input-group">
                                    <label>Route Path</label>
                                    <input
                                        type="text"
                                        className={errors.path ? 'error' : ''}
                                        value={formData.path}
                                        onChange={(e) => {
                                            setFormData({ ...formData, path: e.target.value });
                                            if (errors.path) setErrors({ ...errors, path: null });
                                        }}
                                        placeholder="e.g. /analytics"
                                    />
                                    {errors.path && <span className="error-text">{errors.path}</span>}
                                </div>
                            </div>

                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Select Icon</label>
                                    <select
                                        className={errors.icon_id ? 'error' : ''}
                                        value={formData.icon_id || ""}
                                        onChange={(e) => {
                                            setFormData({ ...formData, icon_id: e.target.value });
                                            if (errors.icon_id) setErrors({ ...errors, icon_id: null });
                                        }}
                                    >
                                        <option value="">Select an icon...</option>
                                        {icons.map(icon => (
                                            <option key={icon.id} value={icon.id}>{icon.name} {icon.icon_url ? '(URL)' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Parent Menu (for Submenus)</label>
                                <select
                                    value={formData.parent_id || ""}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                >
                                    <option value="">None (Top Level)</option>
                                    {flatMenuTree
                                        .filter(m => m.id !== editingMenu?.id)
                                        .map(m => (
                                            <option key={m.id} value={m.id}>
                                                {'—'.repeat(m.depth)} {m.title}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Menu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .menus-page { display: flex; flex-direction: column; gap: 30px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .table-container { padding: 0 20px 20px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; padding: 16px; color: var(--text-muted); font-weight: 500; font-size: 0.9rem; }
        td { padding: 16px; border-top: 1px solid var(--border-color); color: var(--text-main); }
        .table-actions { display: flex; gap: 8px; }
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        code { background: var(--bg-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; }
        .icon-btn { background: var(--bg-secondary); color: var(--text-main); padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); display: flex; align-items: center; }
        .icon-btn:hover { background: var(--primary); color: white; }
        .icon-btn.text-danger:hover { background: var(--danger); color: white; }
      `}</style>
        </div>
    );
};

export default Menus;

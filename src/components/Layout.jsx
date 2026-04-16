import axios from 'axios';
import * as LucideIcons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const SidebarLink = ({ menu }) => {
  const iconUrl = menu.Icon?.icon_url;
  const iconName = menu.Icon ? menu.Icon.name : 'Circle';
  const Icon = LucideIcons[iconName] || LucideIcons.Circle;
  const [isOpen, setIsOpen] = useState(false);
  const hasSubMenus = menu.subMenus && menu.subMenus.length > 0;

  const renderIcon = () => {
    if (iconUrl) {
      return <img src={iconUrl} alt={menu.title} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />;
    }
    return <Icon size={20} />;
  };

  return (
    <div className="menu-item-container">
      {hasSubMenus ? (
        <>
          <div
            className={`menu-item ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="menu-link-content">
              {renderIcon()}
              <span>{menu.title}</span>
            </div>
            <ChevronRight size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
          </div>
          {isOpen && (
            <div className="sub-menu">
              {menu.subMenus.map(sub => (
                <SidebarLink key={sub.id} menu={sub} />
              ))}
            </div>
          )}
        </>
      ) : (
        <NavLink to={menu.path} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <div className="menu-link-content">
            {renderIcon()}
            <span>{menu.title}</span>
          </div>
        </NavLink>
      )}
    </div>
  );
};

const Layout = ({ children }) => {
  const [menus, setMenus] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') !== 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Recursive search to find the menu item (and its parents) for breadcrumbs
  const findBreadcrumbs = (items, targetPath) => {
    for (const item of items) {
      if (item.path === targetPath) {
        return [item.title];
      }
      if (item.subMenus && item.subMenus.length > 0) {
        const childBreadcrumbs = findBreadcrumbs(item.subMenus, targetPath);
        if (childBreadcrumbs) {
          return [item.title, ...childBreadcrumbs];
        }
      }
    }
    return null;
  };

  const breadcrumbList = findBreadcrumbs(menus, location.pathname) || (location.pathname === '/' ? ['Dashboard'] : []);

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchMenus = async () => {
      const roleId = user.permissions?.includes('*') ? 1 : user.role_id;
      if (!roleId) {
        console.warn('No role_id found for user');
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/menus/role/${roleId}`);
        setMenus(response.data);
      } catch (err) {
        console.error('Failed to fetch menus');
      }
    };
    fetchMenus();
  }, []);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && <div className="sidebar-overlay-bg" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`sidebar glass-card ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <LucideIcons.ShieldCheck size={32} color="#6366f1" />
          <h2>AdminPro</h2>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <LucideIcons.X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menus.map(menu => (
            <SidebarLink key={menu.id} menu={menu} />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div className="user-details-text">
              <p className="user-name">{user?.username}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <LucideIcons.LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-nav glass-card">
          <div className="top-nav-left">
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
              <LucideIcons.Menu size={24} />
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-root">Admin</span> {breadcrumbList.length > 0 && ' / '}
              {breadcrumbList.map((crumb, index) => (
                <span key={index}>
                  <span className={index === breadcrumbList.length - 1 ? 'current' : ''}>{crumb}</span>
                  {index < breadcrumbList.length - 1 && ' / '}
                </span>
              ))}
              {breadcrumbList.length === 0 && location.pathname !== '/' && (
                <span className="current">{location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}</span>
              )}
            </div>
          </div>
          <div className="top-nav-actions">
            <button
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            >
              {isDarkMode ? <LucideIcons.Sun size={20} /> : <LucideIcons.Moon size={20} />}
            </button>
          </div>
        </header>
        <div className="page-wrapper">
          {children}
        </div>
      </main>

      <style jsx>{`
        .theme-toggle {
            padding: 8px;
            border-radius: 8px;
            color: var(--text-main);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
        }
        .theme-toggle:hover {
            color: var(--primary);
            border-color: var(--primary);
        }
        .layout {
          display: flex;
          min-height: 100vh;
          position: relative;
        }
        .sidebar {
          width: 280px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          border-radius: 0;
          border-right: 1px solid var(--border-color);
          z-index: 1001;
          background: var(--bg-card);
          transition: transform 0.3s ease;
        }

        .sidebar-overlay-bg {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .hamburger-btn {
          display: none;
          color: var(--text-main);
          padding: 8px;
          margin-right: 12px;
        }

        .mobile-close-btn {
          display: none;
          color: var(--text-muted);
          padding: 8px;
        }

        .sidebar-header {
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
        }
        .sidebar-header h2 { font-size: 1.5rem; }

        .sidebar-nav {
          flex: 1;
          padding: 20px 15px;
          overflow-y: auto;
        }
        .menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          color: var(--text-muted);
          text-decoration: none;
          border-radius: 8px;
          margin-bottom: 4px;
          transition: 0.2s;
        }
        .menu-link-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .menu-item:hover, .menu-item.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
        }
        .sub-menu {
          padding-left: 20px;
          margin-top: 4px;
        }
        .chevron {
          transition: transform 0.3s;
        }
        .chevron.rotate {
          transform: rotate(90deg);
        }
        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        }
        .user-name { font-weight: 600; font-size: 0.9rem; margin: 0; }
        .user-role { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
        .logout-btn {
          background: none;
          color: var(--text-muted);
          padding: 8px;
          border-radius: 6px;
        }
        .logout-btn:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
        }
        .main-content {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }
        .top-nav {
          padding: 15px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .top-nav-left {
          display: flex;
          align-items: center;
        }
        .breadcrumb {
          font-size: 0.9rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .breadcrumb .current {
          color: var(--text-main);
          font-weight: 500;
        }
        .page-wrapper {
          flex: 1;
        }

        /* Responsive Mobile Styles */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .hamburger-btn {
            display: block;
          }
          .mobile-close-btn {
            display: block;
          }
          .main-content {
            padding: 10px;
          }
          .top-nav {
            padding: 10px 15px;
          }
          .breadcrumb-root {
            display: none;
          }
          .user-details-text {
            display: none;
          }
          .sidebar-header {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsOpen(false);

  const adminLinks = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/products', icon: '📦', label: 'Products' },
    { to: '/inventory', icon: '🏭', label: 'Inventory' },
    { to: '/reports', icon: '📋', label: 'Reports' },
    { to: '/ai-insights', icon: '🤖', label: 'AI Insights' },
  ];

  const staffLinks = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/products', icon: '📦', label: 'Products' },
    { to: '/inventory', icon: '🏭', label: 'Inventory' },
  ];

  const links = user?.role === 'admin' ? adminLinks : staffLinks;

  return (
    <>
      {/* Hamburger button for mobile */}
      <button className="hamburger" onClick={() => setIsOpen(true)} aria-label="Open menu">
        ☰
      </button>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${!isOpen ? 'hidden' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2><span>Inven</span>Track</h2>
          <p>Warehouse Management</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <p>{user?.name || 'User'}</p>
            <span>{user?.role || 'staff'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

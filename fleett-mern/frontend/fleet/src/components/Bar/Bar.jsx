import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PropTypes from 'prop-types';
import './Bar.css';

const Sidebar = ({
  isOpen, 
  onToggle, 
  activeNav, 
  onNavChange = () => {},  // Default empty function
  handleNavigation 
}) => {
  const navigate = useNavigate();

  const NAV_ITEMS = localStorage.getItem("role") !== "fleet" ? [
    { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', key: 'dashboard' },
    { path: '/vehicle-management', icon: 'bi-car-front', label: 'Vehicles', key: 'vehicles' },
    { path: '/customer-management', icon: 'bi-people', label: 'Customers', key: 'customers' },
    { path: '/active-rentals', icon: 'bi-calendar-check', label: 'Rentals', key: 'rentals' },
    { path: '/maintenance-list', icon: 'bi-tools', label: 'Maintenance', key: 'maintenance' },
    { path: '/reports', icon: 'bi-graph-up', label: 'Reports', key: 'reports' },
  ] : [
    { path: '/fleet/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', key: 'dashboard' },
    { path: '/vehicle-management', icon: 'bi-car-front', label: 'Vehicles', key: 'vehicles' },
    { path: '/customer-management', icon: 'bi-people', label: 'Customers', key: 'customers' },
  ]

  const handleNavClick = (path, key) => {
    onNavChange(key);
    navigate(path);
    if (handleNavigation) {
      handleNavigation(path, key);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {isOpen ? (
          <>
            <h2 className="logo">LUXE<span className="gold">DRIVE</span></h2>
            <button onClick={onToggle} className="sidebar-toggle">◄</button>
          </>
        ) : (
          <button onClick={onToggle} className="hamburger-toggle">☰</button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => handleNavClick(item.path, item.key)}
                className={`nav-item ${activeNav === item.key ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`} />
                {isOpen && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <i className="bi bi-box-arrow-right" />
          {isOpen && (
            <div className="logout-text">
              <span>Logout</span>
              <span>{JSON.parse(localStorage.getItem("user")).username}</span>
              <small>{localStorage.getItem("role") === "fleet" ? "Fleet Manager" : "Admin"}</small>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  activeNav: PropTypes.string,
  onNavChange: PropTypes.func,
  handleNavigation: PropTypes.func
};

Sidebar.defaultProps = {
  activeNav: 'dashboard',
  onNavChange: () => {},
  handleNavigation: () => {}
};
    

export default Sidebar; 
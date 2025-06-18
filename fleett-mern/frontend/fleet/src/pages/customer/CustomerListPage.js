import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Bar/Bar';

const CustomerListPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch customers + active rentals so we know who currently has a car
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [custRes, rentalRes] = await Promise.all([
          axios.get('/api/customers'),
          axios.get('/api/rentals'),
        ]);

        // Get customer IDs that have ACTIVE rentals
        const activeCustomerIds = new Set(
          (rentalRes.data || [])
            .filter((r) => r.status === 'ACTIVE')
            .map((r) => (r.customer?._id || r.customer))
        );

        const enriched = (custRes.data || []).map((c) => ({
          ...c,
          hasActiveRental: activeCustomerIds.has(c._id),
        }));
        setCustomers(enriched);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load customers.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Has Rented' && customer.hasActiveRental) ||
      (filter === 'Has Not Rented' && !customer.hasActiveRental);
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      axios.delete(`/api/customers/${id}`)
        .then(() => {
          setCustomers(customers.filter(c => c._id !== id));
        })
        .catch(error => {
          alert(error.response?.data?.message || "Delete failed");
        });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.background}></div>
      
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeNav="customers"
        handleNavigation={(path) => navigate(path)}
      />

      <div style={{
        ...styles.content,
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <i className="bi bi-people me-2"></i>
            Customer Management
          </h1>
          <div style={styles.userInfo}>
            {/* User info from AdminDashboard */}
          </div>
        </header>

        {/* Search/Filter Bar */}
        <div style={styles.actionBar}>
          <div style={styles.searchContainer}>
            <i className="bi bi-search" style={styles.searchIcon}></i>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            style={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Customers</option>
            <option value="Has Rented">Has Rented</option>
            <option value="Has Not Rented">Has Not Rented</option>
          </select>
          
          <button 
            style={styles.addButton}
            onClick={() => navigate('/add-customer')}
          >
            <i className="bi bi-plus-lg"></i> Add Customer
          </button>
        </div>

        {/* Customer Table */}
        {loading ? (
          <div style={styles.loading}>
            <i className="bi bi-arrow-repeat" style={styles.spinner}></i>
          </div>
        ) : error ? (
          <div style={styles.errorCard}>
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="bi bi-people" style={styles.emptyIcon}></i>
            <p>No customers found</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>NAME</th>
                  <th style={styles.th}>EMAIL</th>
                  <th style={styles.th}>PHONE</th>
                  <th style={styles.th}>ADDRESS</th>
                  <th style={styles.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <button 
                        style={styles.nameButton}
                        onClick={() => navigate(`/customer/${customer._id}`)}>
                        {customer.name}
                      </button>
                    </td>
                    <td style={styles.td}>{customer.email}</td>
                    <td style={styles.td}>{customer.phoneNumber}</td>
                    <td style={styles.td}>{customer.address}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.editButton}
                          onClick={() => navigate(`/edit-customer/${customer._id}`)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          style={styles.deleteButton}
                          onClick={() => handleDelete(customer._id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles matching AdminDashboard
const styles = {
  dashboardContainer: {
    position: 'relative',
    minHeight: '100vh',
    overflowX: 'hidden',
    fontFamily: '"Barlow", sans-serif',
    color: '#fff',
  },
  background: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(rgba(15, 15, 25, 0.97), rgba(15, 15, 25, 0.97)), url("https://plus.unsplash.com/premium_photo-1675799274314-934349e9e845?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmxhY2slMjBsZWF0aGVyfGVufDB8fDB8fHww")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: -1,
  },
  content: {
    padding: '25px 30px',
    transition: 'all 0.3s',
    opacity: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
  },
  headerTitle: {
    fontSize: '26px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  actionBar: {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.6)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 20px 12px 45px',
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    backdropFilter: 'blur(5px)',
    ':focus': {
      outline: 'none',
      borderColor: 'rgba(212, 175, 55, 0.5)',
    },
  },
  filterSelect: {
    padding: '12px 20px',
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    backdropFilter: 'blur(5px)',
    cursor: 'pointer',
    minWidth: '200px',
  },
  addButton: {
    padding: '12px 20px',
    backgroundColor: '#D4AF37',
    border: 'none',
    borderRadius: '10px',
    color: '#111',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#F1C232',
    },
  },
  tableContainer: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(5px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.03)',
    },
  },
  td: {
    padding: '14px 20px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
  },
  nameButton: {
    background: 'none',
    border: 'none',
    color: '#D4AF37',
    cursor: 'pointer',
    padding: 0,
    fontWeight: '500',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    backgroundColor: 'rgba(75, 192, 192, 0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#4BC0C0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 99, 132, 0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#FF6384',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    },
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: '50px',
  },
  spinner: {
    fontSize: '24px',
    color: '#D4AF37',
    animation: 'spin 1s linear infinite',
  },
  errorCard: {
    backgroundColor: 'rgba(255, 99, 132, 0.1)',
    border: '1px solid rgba(255, 99, 132, 0.3)',
    borderRadius: '10px',
    padding: '20px',
    color: '#FF6384',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    color: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(40, 40, 50, 0.5)',
    borderRadius: '10px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '15px',
    color: 'rgba(212, 175, 55, 0.3)',
  },
};

export default CustomerListPage;
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Bar/Bar';
import { formatInTimeZone } from 'date-fns-tz';
import RentalStatusBadge from '../../components/RentalStatusBadge';

const ActiveRentalsPage = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch rentals from the backend
  useEffect(() => {
    setLoading(true);
    axios.get('/api/rentals')
      .then((response) => {
        const activeRentals = response.data.filter(
          (rental) => rental.status && rental.status.toUpperCase() !== 'RETURNED'
        );
        setRentals(activeRentals);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching rentals:', error);
        setError('Failed to fetch rentals. Please try again.');
        setLoading(false);
      });
  }, []);

  // Filter rentals with memoization
  const filteredRentals = useMemo(() => {
    return rentals.filter((rental) => {
      const upperStatus = (rental.status || '').toUpperCase();
      const matchesSearch =
        rental.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        `${rental.vehicle?.make} ${rental.vehicle?.model}`
          .toLowerCase()
          .includes(search.toLowerCase());
      
      const matchesDate =
        !dateFilter || rental.rentalDate.includes(dateFilter);
      
      const matchesStatus =
        statusFilter === 'All' || upperStatus === statusFilter.toUpperCase();
      
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [rentals, search, dateFilter, statusFilter]);

  // Handle Return rental
  const handleReturn = (id) => {
    if (window.confirm('Are you sure you want to mark this rental as returned?')) {
      axios.post(`/api/rentals/return/${id}`)
        .then(() => {
          setRentals(rentals.filter((rental) => rental.rentalId !== id));
        })
        .catch((error) => {
          console.error('Error returning rental:', error);
          alert(error.response?.data || 'Failed to return rental.');
        });
    }
  };

  // Handle Cancel rental
  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this rental?')) {
      axios.delete(`/api/rentals/cancel/${id}`)
        .then(() => {
          setRentals(rentals.filter((rental) => rental.rentalId !== id));
        })
        .catch((error) => {
          console.error('Error cancelling rental:', error);
          alert(error.response?.data || 'Failed to cancel rental.');
        });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return formatInTimeZone(dateString, userTimeZone, 'PPp');
    } catch {
      return dateString;
    }
  };

  // Safely format price values (handles string or number)
  const formatPrice = (cost) => {
    const num = typeof cost === 'number' ? cost : parseFloat(cost);
    return `$${(!isNaN(num) ? num : 0).toFixed(2)}`;
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.background}></div>
      
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeNav="rentals"
        handleNavigation={(path) => navigate(path)}
      />

      <div style={{
        ...styles.content,
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <i className="bi bi-speedometer2 me-2"></i>
            Active Rentals Dashboard
          </h1>
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{rentals.length}</div>
              <div style={styles.statLabel}>Total Active</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {rentals.filter(r => (r.status || '').toUpperCase() === 'ACTIVE').length}
              </div>
              <div style={styles.statLabel}>Currently Rented</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {rentals.filter(r => (r.status || '').toUpperCase() === 'PENDING').length}
              </div>
              <div style={styles.statLabel}>Pending Approval</div>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div style={styles.actionBar}>
          <div style={styles.searchContainer}>
            <i className="bi bi-search" style={styles.searchIcon}></i>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search rentals by customer or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <div style={styles.dateFilterContainer}>
              <i className="bi bi-calendar" style={styles.filterIcon}></i>
              <input
                type="date"
                style={styles.dateInput}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <select 
              style={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value.toUpperCase())}
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
          
          <button 
            style={styles.addButton}
            onClick={() => navigate('/rent-vehicle')}
          >
            <i className="bi bi-plus-circle"></i> Create New Rental
          </button>
        </div>

        {/* Rentals Table */}
        {loading ? (
          <div style={styles.loading}>
            <i className="bi bi-arrow-repeat" style={styles.spinner}></i>
            <span style={{marginLeft: '10px'}}>Loading premium rentals...</span>
          </div>
        ) : error ? (
          <div style={styles.errorCard}>
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        ) : filteredRentals.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="bi bi-car-front" style={styles.emptyIcon}></i>
            <p style={styles.emptyText}>No active rentals found</p>
            <button 
              style={styles.emptyAction}
              onClick={() => navigate('/rent-vehicle')}
            >
              Create Your First Rental
            </button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>CUSTOMER</th>
                  <th style={styles.th}>VEHICLE</th>
                  <th style={styles.th}>RENTAL PERIOD</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>TOTAL</th>
                  <th style={styles.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRentals.map((rental) => (
                  <tr key={rental.rentalId} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.customerCell}>
                        <div style={styles.avatar}>
                          {rental.customer?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div style={styles.customerName}>{rental.customer?.name || 'Unknown'}</div>
                          <div style={styles.customerContact}>
                            {rental.customer?.phoneNumber || 'No contact'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.vehicleCell}>
                        <div style={styles.vehicleMakeModel}>
                          {rental.vehicle?.make} {rental.vehicle?.model}
                        </div>
                        <div style={styles.vehicleDetails}>
                          {rental.vehicle?.year} • {rental.vehicle?.licensePlate}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateCell}>
                        <div style={styles.dateRange}>
                          <i className="bi bi-calendar-check"></i> {formatDate(rental.rentalDate)}
                        </div>
                        <div style={styles.dateRange}>
                          <i className="bi bi-calendar-x"></i> {rental.returnDate ? formatDate(rental.returnDate) : 'Ongoing'}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <RentalStatusBadge status={rental.status} />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.priceCell}>
                        {formatPrice(rental.totalCost)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        {/* <button 
                          style={styles.viewButton}
                          onClick={() => navigate(`/rental/${rental.rentalId}`)}
                        >
                          <i className="bi bi-eye"></i> Details
                        </button> */}
                        {(rental.status || '').toUpperCase() === 'ACTIVE' && (
                          <button 
                            style={styles.returnButton}
                            onClick={() => handleReturn(rental.rentalId)}
                          >
                            <i className="bi bi-check-circle"></i> Return
                          </button>
                        )}
                        {(rental.status || '').toUpperCase() !== 'RETURNED' && (
                          <button 
                            style={styles.cancelButton}
                            onClick={() => handleCancel(rental.rentalId)}
                          >
                            <i className="bi bi-x-circle"></i> Cancel
                          </button>
                        )}
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

// Luxury styling matching your theme
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
    backgroundImage: 'linear-gradient(rgba(15, 15, 25, 0.97), rgba(15, 15, 25, 0.97)), url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80")',
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
    marginBottom: '20px',
  },
  statsContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '10px',
    padding: '15px 20px',
    minWidth: '150px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    backdropFilter: 'blur(5px)',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  actionBar: {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
    maxWidth: '400px',
    minWidth: '250px',
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
  filterGroup: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  dateFilterContainer: {
    position: 'relative',
  },
  filterIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.6)',
  },
  dateInput: {
    padding: '12px 20px 12px 45px',
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    backdropFilter: 'blur(5px)',
    minWidth: '180px',
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
    minWidth: '180px',
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
    verticalAlign: 'middle',
  },
  customerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#D4AF37',
    fontWeight: '600',
    fontSize: '16px',
  },
  customerName: {
    fontWeight: '500',
    marginBottom: '2px',
  },
  customerContact: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
  },
  vehicleCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  vehicleMakeModel: {
    fontWeight: '500',
    marginBottom: '2px',
  },
  vehicleDetails: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  dateRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    ':first-child': {
      marginBottom: '5px',
    },
  },
  priceCell: {
    fontWeight: '600',
    color: '#D4AF37',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  viewButton: {
    backgroundColor: 'rgba(75, 192, 192, 0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#4BC0C0',
    padding: '8px 12px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
  },
  returnButton: {
    backgroundColor: 'rgba(75, 192, 75, 0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#4BC04B',
    padding: '8px 12px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(75, 192, 75, 0.2)',
    },
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 99, 132, 0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#FF6384',
    padding: '8px 12px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    },
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px',
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'rgba(40, 40, 50, 0.5)',
    borderRadius: '10px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '15px',
    color: 'rgba(212, 175, 55, 0.3)',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '20px',
  },
  emptyAction: {
    padding: '10px 20px',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '6px',
    color: '#D4AF37',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(212, 175, 55, 0.3)',
    },
  },
};

export default ActiveRentalsPage;
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Bar/Bar';
import { format, parseISO } from 'date-fns';
import MaintenanceStatusBadge from '../../components/MaintenanceStatusBadge';

const MaintenanceListPage = () => {
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState([]);
  const [filter, setFilter] = useState('Scheduled');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch maintenance data
  useEffect(() => {
    setLoading(true);
    axios.get('/api/maintenance')
      .then((response) => {
        setMaintenance(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching maintenance:', error);
        setError('Failed to load maintenance data. Please try again.');
        setLoading(false);
      });
  }, []);

  // Handle completion of maintenance
  const handleDeleteMaintenance = (id) => {
    if (window.confirm('Delete this maintenance record?')) {
      axios.delete(`/api/maintenance/${id}`)
        .then(() => {
          setMaintenance(prev => prev.filter(m => m._id !== id));
        })
        .catch((error) => {
          console.error('Error deleting maintenance:', error);
          alert(error.response?.data || 'Failed to delete maintenance.');
        });
    }
  };

  // Handle completion of maintenance
  const handleCompleteMaintenance = (id) => {
    if (window.confirm('Mark this maintenance as completed?')) {
      axios.put(`/api/maintenance/update/${id}`, { completedDate: new Date().toISOString() })
        .then((response) => {
          setMaintenance(prev => prev.map(entry =>
            entry._id === id
              ? { 
                  ...entry, 
                  status: 'Completed',
                  completedDate: new Date().toISOString(), 
                  
                  vehicle: { ...entry.vehicle, status: 'Available' }
                }
              : entry
          ));
        })
        .catch((error) => {
          console.error('Error completing maintenance:', error);
          alert(error.response?.data || 'Failed to complete maintenance.');
        });
    }
  };

  // Filter maintenance data
  const filteredMaintenance = useMemo(() => {
    return maintenance.filter((entry) => {
      const matchesFilter = filter === 'All' || (entry.status || '').toLowerCase() === filter.toLowerCase();
      const matchesSearch = 
        `${entry.vehicle?.make} ${entry.vehicle?.model}`.toLowerCase().includes(search.toLowerCase()) ||
        (entry.description || '').toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [maintenance, filter, search]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'PPp');
    } catch {
      return dateString;
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.background}></div>
      
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeNav="maintenance"
        handleNavigation={(path) => navigate(path)}
      />

      <div style={{
        ...styles.content,
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <i className="bi bi-tools me-2"></i>
            Maintenance Management
          </h1>
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {maintenance.filter(m => (m.status || '').toLowerCase() === 'scheduled').length}
              </div>
              <div style={styles.statLabel}>Scheduled</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {maintenance.filter(m => (m.status || '').toLowerCase() === 'completed').length}
              </div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {maintenance.length}
              </div>
              <div style={styles.statLabel}>Total</div>
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
              placeholder="Search by vehicle or issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            style={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Records</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
          </select>
          
          <button 
            style={styles.addButton}
            onClick={() => navigate('/schedule-maintenance')}
          >
            <i className="bi bi-plus-circle"></i> Schedule Maintenance
          </button>
        </div>

        {/* Maintenance Table */}
        {loading ? (
          <div style={styles.loading}>
            <i className="bi bi-arrow-repeat" style={styles.spinner}></i>
            <span style={{marginLeft: '10px'}}>Loading maintenance records...</span>
          </div>
        ) : error ? (
          <div style={styles.errorCard}>
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        ) : filteredMaintenance.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="bi bi-tools" style={styles.emptyIcon}></i>
            <p style={styles.emptyText}>No maintenance records found</p>
            <button 
              style={styles.emptyAction}
              onClick={() => navigate('/schedule-maintenance')}
            >
              Schedule New Maintenance
            </button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>VEHICLE</th>
                  <th style={styles.th}>ISSUE</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>MAINTENANCE DATE</th>
                  <th style={styles.th}>COMPLETION DATE</th>
                  <th style={styles.th}>COST</th>
                  <th style={styles.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenance.map((entry) => (
                  <tr key={entry._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.vehicleCell}>
                        <div style={styles.vehicleMakeModel}>
                          {entry.vehicle?.make} {entry.vehicle?.model}
                        </div>
                        <div style={styles.vehicleDetails}>
                          {entry.vehicle?.year} • {entry.vehicle?.licensePlate}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.issueCell}>
                        {entry.description || entry.issueDescription || '-'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <MaintenanceStatusBadge status={entry.status} />
                    </td>
                    <td style={styles.td}>
                      {formatDate(entry.scheduledDate || entry.maintenanceDate)}
                    </td>
                    <td style={styles.td}>
                      {entry.completedDate ? formatDate(entry.completedDate) : '-'}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.costCell}>
                        ${(entry.cost ?? entry.maintenanceCost ?? 0).toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        {/* <button 
                          style={styles.viewButton}
                          onClick={() => navigate(`/maintenance/${entry._id}`)}
                        >
                          <i className="bi bi-eye"></i> Details
                        </button> */}
                        {(entry.status || '').toLowerCase() === 'scheduled' && (
                          <button 
                            style={styles.completeButton}
                            onClick={() => handleCompleteMaintenance(entry._id)}
                          >
                            <i className="bi bi-check-circle"></i> Complete
                          </button>
                        )}
                        <button 
                          style={styles.deleteButton}
                          onClick={() => handleDeleteMaintenance(entry._id)}
                        >
                          <i className="bi bi-trash"></i> Delete
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
    backgroundImage: 'linear-gradient(rgba(15, 15, 25, 0.97), rgba(15, 15, 25, 0.97)), url("https://images.unsplash.com/photo-1494972308805-463bc619d34e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80")',
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
    verticalAlign: 'middle',
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
  issueCell: {
    maxWidth: '300px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  completeButton: {
    backgroundColor: 'rgba(75, 192, 75, 0.1)',
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
  deleteButton: {
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
  descriptionCell: {
    maxWidth: '400px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  costCell: {
    fontWeight: '500',
    color: '#D4AF37',
  },
};

export default MaintenanceListPage;
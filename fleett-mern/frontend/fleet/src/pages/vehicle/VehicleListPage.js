import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Bar/Bar';
import { FaCar, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';

const VehicleListPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  // Normalize status values (trim, uppercase, convert _ to space) so filtering works reliably
  const normalizeStatus = (status) => (status || '')
    .toString()
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ');

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch vehicles from the backend
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/vehicles');
        setVehicles(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicle data');
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Filter and search logic
  const filteredVehicles = vehicles.filter((vehicle) => {
    const make = vehicle.make || '';
    const model = vehicle.model || '';
    const matchesSearch =
      make.toLowerCase().includes(search.toLowerCase()) ||
      model.toLowerCase().includes(search.toLowerCase());

    const upperStatus = normalizeStatus(vehicle.status);
    // Treat "Under Maintenance" dropdown as matching status "MAINTENANCE" in DB
    const normalizedFilter = normalizeStatus(filter);
    const matchesFilter =
      normalizedFilter === 'ALL' ||
      upperStatus === normalizedFilter ||
      (normalizedFilter === 'UNDER MAINTENANCE' && upperStatus === 'MAINTENANCE');
    return matchesSearch && matchesFilter;
  });

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`/api/vehicles/${id}`);
        setVehicles(vehicles.filter((vehicle) => vehicle.vehicleId !== id));
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setError('Failed to delete vehicle');
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusBadge = (status) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'AVAILABLE':
        return <span style={styles.statusAvailable}>Available</span>;
      case 'RENTED':
        return <span style={styles.statusRented}>Rented</span>;
      case 'UNDER MAINTENANCE':
      case 'MAINTENANCE':
        return <span style={styles.statusMaintenance}>Maintenance</span>;
      default:
        return <span style={styles.statusDefault}>{status}</span>;
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.background}></div>
      
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeNav="vehicles"
      />

      <div style={{
        ...styles.content,
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <GiSteeringWheel style={styles.headerIcon} />
            Luxury Fleet Management
          </h1>
        </header>

        {/* Action Bar */}
        <div style={styles.actionBar}>
          <div style={styles.searchContainer}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search by make or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            style={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Vehicles</option>
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Under Maintenance</option>
          </select>
          
          <button 
            style={styles.addButton}
            onClick={() => navigate('/add-vehicle')}
          >
            <FaPlus style={styles.buttonIcon} />
            Add Vehicle
          </button>
        </div>

        {/* Vehicle Table */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Loading luxury fleet...</p>
          </div>
        ) : error ? (
          <div style={styles.errorCard}>
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div style={styles.emptyState}>
            <FaCar style={styles.emptyIcon} />
            <p>No vehicles found matching your criteria</p>
            <button 
              style={styles.emptyAction}
              onClick={() => navigate('/add-vehicle')}
            >
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>BRAND</th>
                  <th style={styles.th}>MODEL</th>
                  <th style={styles.th}>YEAR</th>
                  <th style={styles.th}>CATEGORY</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>REGISTRATION</th>
                  <th style={styles.th}>PRICE/DAY</th>
                  <th style={styles.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId} style={styles.tableRow}>
                    <td style={styles.td}>
                      <button 
                        style={styles.vehicleButton}
                        onClick={() => navigate(`/vehicle/${vehicle.vehicleId}`)}
                      >
                        {vehicle.make}
                      </button>
                    </td>
                    <td style={styles.td}>{vehicle.model}</td>
                    <td style={styles.td}>{vehicle.year}</td>
                    <td style={styles.td}>{vehicle.category === "benzina" ? "Petrol" : vehicle.category }</td>
                    <td style={styles.td}>
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td style={styles.td}>{vehicle.registrationNumber}</td>
                    <td style={styles.td}>${vehicle.pricePerDay}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.editButton}
                          onClick={() => navigate(`/edit-vehicle/${vehicle.vehicleId}`)}
                        >
                          <FaEdit style={styles.buttonIcon} />
                        </button>
                        <button 
                          style={styles.deleteButton}
                          onClick={() => handleDelete(vehicle.vehicleId)}
                        >
                          <FaTrash style={styles.buttonIcon} />
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
  },
  headerIcon: {
    marginRight: '15px',
    color: '#D4AF37',
    fontSize: '28px',
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
  vehicleButton: {
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
  buttonIcon: {
    fontSize: '14px',
  },
  statusAvailable: {
    backgroundColor: 'rgba(75, 192, 75, 0.1)',
    color: '#4BC04B',
    padding: '5px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusRented: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    color: '#FFC107',
    padding: '5px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusMaintenance: {
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    color: '#FF0000',
    padding: '5px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusDefault: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    color: '#969696',
    padding: '5px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    color: 'rgba(255,255,255,0.7)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(212, 175, 55, 0.2)',
    borderTopColor: '#D4AF37',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
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

export default VehicleListPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import Sidebar from '../../components/Bar/Bar'; // Corrected path

const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Ongoing') return 'Ongoing';
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return formatInTimeZone(dateString, userTimeZone, 'PPp'); // e.g., Jun 18, 2025, 12:30 PM
    } catch {
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [custRes, rentalsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/customers/${id}`),
          axios.get(`http://localhost:5000/api/rentals/customer/${id}`),
        ]);
        setCustomer(custRes.data);
        setRentalHistory(rentalsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch customer data:', err);
        setError('Could not load customer details. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '48px', color: '#FF6384' }}></i>
        <h2 style={{ color: '#fff' }}>An Error Occurred</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>{error}</p>
        <button style={styles.backButton} onClick={() => navigate('/customers')}>Back to Customer List</button>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.background}></div>
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeNav="customers"
        handleNavigation={(path) => navigate(path)}
      />
      <div style={{ ...styles.content, marginLeft: sidebarOpen ? '280px' : '80px' }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <i className="bi bi-person-circle me-3"></i>
            {customer?.name || 'Customer'} Details
          </h1>
          <button style={styles.backButton} onClick={() => navigate('/customers')}>Back to List</button>
        </header>

        <div style={styles.detailsGrid}>
          {/* Customer Information Card */}
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>Contact Information</h3>
            <div style={styles.infoItem}>
              <i className="bi bi-telephone" style={styles.icon}></i>
              <div>
                <p style={styles.infoLabel}>Phone Number</p>
                <p style={styles.infoValue}>{customer?.phoneNumber}</p>
              </div>
            </div>
            <div style={styles.infoItem}>
              <i className="bi bi-envelope" style={styles.icon}></i>
              <div>
                <p style={styles.infoLabel}>Email</p>
                <p style={styles.infoValue}>{customer?.email}</p>
              </div>
            </div>
            <div style={styles.infoItem}>
              <i className="bi bi-geo-alt" style={styles.icon}></i>
              <div>
                <p style={styles.infoLabel}>Address</p>
                <p style={styles.infoValue}>{customer?.address}</p>
              </div>
            </div>
          </div>

          {/* Rental History Card */}
          <div style={{...styles.card, ...styles.rentalCard}}>
            <h3 style={styles.cardHeader}><i className="bi bi-clock-history me-2"></i>Rental History</h3>
            <div style={styles.rentalHistoryContainer}>
              {rentalHistory.length > 0 ? (
                rentalHistory.map((rental) => (
                  <div key={rental._id} style={styles.rentalItem}>
                    <div style={styles.rentalVehicle}>
                      <i className={`bi bi-car-front-fill me-2`} style={{color: rental.status === 'ACTIVE' ? '#4BC0C0' : '#D4AF37'}}></i>
                      {rental.vehicle.make} {rental.vehicle.model} ({rental.vehicle.year})
                    </div>
                    <div style={styles.rentalDates}>
                      <p><strong>Start:</strong> {formatDate(rental.rentalDate)}</p>
                      <p><strong>End:</strong> {formatDate(rental.returnDate)}</p>
                    </div>
                    <div style={styles.rentalStatus(rental.status)}>{rental.status}</div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <i className="bi bi-calendar-x" style={styles.emptyIcon}></i>
                  <p>No rental history found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Styles for a modern, consistent look
const styles = {
  dashboardContainer: {
    position: 'relative',
    minHeight: '100vh',
    fontFamily: '"Barlow", sans-serif',
    color: '#fff',
  },
  background: {
    position: 'fixed',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundImage: 'linear-gradient(rgba(15, 15, 25, 0.97), rgba(15, 15, 25, 0.97)), url("https://images.unsplash.com/photo-1549287304-957554b8156d?q=80&w=2940&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: -1,
  },
  content: {
    padding: '25px 30px',
    transition: 'all 0.3s',
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
  backButton: {
    padding: '10px 20px',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    border: '1px solid #D4AF37',
    borderRadius: '8px',
    color: '#D4AF37',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px',
  },
  card: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '25px',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
  },
  rentalCard: {
    gridColumn: '2',
  },
  cardHeader: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
    display: 'flex',
    alignItems: 'center',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  icon: {
    fontSize: '20px',
    color: '#D4AF37',
    marginRight: '15px',
    marginTop: '5px',
    width: '25px',
  },
  infoLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '16px',
    color: '#fff',
    margin: 0,
  },
  rentalHistoryContainer: {
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  rentalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  rentalVehicle: {
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },
  rentalDates: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
  },
  rentalStatus: (status) => ({
    padding: '5px 12px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: status === 'ACTIVE' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(212, 175, 55, 0.2)',
    color: status === 'ACTIVE' ? '#4BC0C0' : '#D4AF37',
  }),
  loadingContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
    backgroundColor: '#101018',
  },
  spinner: {
    border: '4px solid rgba(255, 255, 255, 0.1)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    borderLeftColor: '#D4AF37',
    animation: 'spin 1s ease infinite',
  },
  errorContainer: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh',
    backgroundColor: '#101018',
    textAlign: 'center',
    padding: '20px',
  },
  emptyState: {
    textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)',
  },
  emptyIcon: {
    fontSize: '48px', color: 'rgba(212, 175, 55, 0.3)', marginBottom: '15px',
  },
};

export default CustomerDetailsPage;


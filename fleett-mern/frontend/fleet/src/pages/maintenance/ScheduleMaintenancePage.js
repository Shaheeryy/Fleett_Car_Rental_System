import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Bar/Bar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ScheduleMaintenancePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState({
    issueDescription: '',
    maintenanceDate: new Date(),
    maintenanceCost: '',
    workDescription: '',
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch available vehicles
  useEffect(() => {
    setLoading(true);
    api.get('/vehicles')
      .then((response) => {
        const availableVehicles = response.data.filter(
          (vehicle) => (vehicle.status || '').toUpperCase() === 'AVAILABLE'
        );
        setVehicles(availableVehicles);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles. Please try again.');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setMaintenanceData(prev => ({
      ...prev,
      maintenanceDate: date
    }));
  };

  const handleVehicleSelection = (e) => {
    setSelectedVehicleId(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedVehicleId) {
      setError('Please select a vehicle for maintenance.');
      return;
    }

    const cost = Number(maintenanceData.maintenanceCost);
    if (isNaN(cost) || cost < 20) {
      setError('Minimum maintenance cost is $20 at our premium service.');
      return;
    }

    const formattedData = {
      ...maintenanceData,
      scheduledDate: maintenanceData.maintenanceDate.toISOString(),
      description: maintenanceData.issueDescription,
      cost: cost
    };

    api.post(`/maintenance/schedule/${selectedVehicleId}`, formattedData)
      .then(() => {
        navigate('/maintenance-list');
      })
      .catch(error => {
        console.error('Error scheduling maintenance:', error);
        const errorMsg = typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || 'Failed to schedule maintenance.';
        setError(errorMsg);
      });
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
        activeNav="maintenance"
        handleNavigation={(path) => navigate(path)}
      />

      <div style={{
        ...styles.content,
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <i className="bi bi-calendar-plus me-2"></i>
            Schedule Premium Maintenance
          </h1>
        </header>

        {loading ? (
          <div style={styles.loading}>
            <i className="bi bi-arrow-repeat" style={styles.spinner}></i>
            <span style={{marginLeft: '10px'}}>Loading premium vehicles...</span>
          </div>
        ) : error ? (
          <div style={styles.errorCard}>
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        ) : (
          <div style={styles.formContainer}>
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Vehicle Selection */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <i className="bi bi-car-front me-2"></i>
                  Select Luxury Vehicle
                </label>
                <select
                  style={styles.selectInput}
                  value={selectedVehicleId}
                  onChange={handleVehicleSelection}
                  required
                >
                  <option value="">-- Select a Vehicle --</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                      {`${vehicle.make} ${vehicle.model} (${vehicle.licensePlate || vehicle.registrationNumber})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <i className="bi bi-exclamation-octagon me-2"></i>
                  Issue Description
                </label>
                <textarea
                  name="issueDescription"
                  style={styles.textarea}
                  value={maintenanceData.issueDescription}
                  onChange={handleChange}
                  placeholder="Describe the issue requiring maintenance"
                  rows="4"
                  required
                />
              </div>

              {/* Maintenance Date */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <i className="bi bi-calendar-date me-2"></i>
                  Scheduled Date
                </label>
                <DatePicker
                  selected={maintenanceData.maintenanceDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select a date"
                  style={styles.dateInput}
                  wrapperClassName="date-picker"
                  required
                />
              </div>

              {/* Maintenance Cost */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <i className="bi bi-currency-dollar me-2"></i>
                  Estimated Cost
                </label>
                <div style={styles.priceInputContainer}>
                  <span style={styles.currencySymbol}>$</span>
                  <input
                    type="number"
                    name="maintenanceCost"
                    style={styles.priceInput}
                    value={maintenanceData.maintenanceCost}
                    onChange={handleChange}
                    placeholder="500.00"
                    min="20"
                    step="5"
                    required
                  />
                </div>
                <div style={styles.priceNote}>Minimum service charge: $20</div>
              </div>

              {/* Work Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <i className="bi bi-clipboard-check me-2"></i>
                  Work Description (Optional)
                </label>
                <textarea
                  name="workDescription"
                  style={styles.textarea}
                  value={maintenanceData.workDescription}
                  onChange={handleChange}
                  placeholder="Describe the work to be performed"
                  rows="4"
                />
              </div>

              {/* Form Actions */}
              <div style={styles.formActions}>
                <button 
                  type="submit" 
                  style={styles.submitButton}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Schedule Premium Maintenance
                </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => navigate('/maintenance-list')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Maintenance
                </button>
              </div>
            </form>
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
    backgroundImage: 'linear-gradient(rgba(15, 15, 25, 0.97), rgba(15, 15, 25, 0.97)), url("https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80")',
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
  formContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  form: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '30px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    backdropFilter: 'blur(5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
  },
  formGroup: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    fontWeight: '500',
  },
  selectInput: {
    width: '100%',
    padding: '12px 15px',
    backgroundColor: 'rgba(30, 30, 40, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: 'rgba(212, 175, 55, 0.5)',
      boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
    },
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    backgroundColor: 'rgba(30, 30, 40, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    backdropFilter: 'blur(5px)',
    resize: 'vertical',
    minHeight: '100px',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: 'rgba(212, 175, 55, 0.5)',
      boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
    },
  },
  dateInput: {
    width: '100%',
    padding: '12px 15px',
    backgroundColor: 'rgba(30, 30, 40, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: 'rgba(212, 175, 55, 0.5)',
      boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
    },
  },
  priceInputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: '15px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
  },
  priceInput: {
    width: '100%',
    padding: '12px 15px 12px 30px',
    backgroundColor: 'rgba(30, 30, 40, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: 'rgba(212, 175, 55, 0.5)',
      boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
    },
  },
  priceNote: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '5px',
    fontStyle: 'italic',
  },
  formActions: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
  },
  submitButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#D4AF37',
    border: 'none',
    borderRadius: '8px',
    color: '#111',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#F1C232',
    },
  },
  cancelButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
};

export default ScheduleMaintenancePage;   
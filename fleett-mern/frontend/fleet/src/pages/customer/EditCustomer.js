import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import Sidebar from '../../components/Bar/Bar';
import { FaUserEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/customers/${id}`);
        setCustomerData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customer details:', error);
        setError('Failed to load customer details');
        setLoading(false);
        setTimeout(() => navigate('/customers'), 2000);
      }
    };

    fetchCustomerDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerData.name || !customerData.email || !customerData.phoneNumber) {
      setError('Name, email, and phone are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.put(`/customers/${id}`, customerData);
      setLoading(false);
      navigate('/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setLoading(false);
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
      />

      <div style={{
        ...styles.content,
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <FaUserEdit style={styles.headerIcon} />
            Edit Elite Client Profile
          </h1>
          <p style={styles.headerSubtitle}>Update your premium client's details</p>
        </header>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading client details...</p>
          </div>
        ) : error ? (
          <div style={styles.errorCard}>
            <i className="bi bi-exclamation-triangle" style={styles.errorIcon}></i>
            {error}
          </div>
        ) : (
          <div style={styles.formContainer}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formColumns}>
                {/* Left Column */}
                <div style={styles.formColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaUserEdit style={styles.inputIcon} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      style={styles.input}
                      value={customerData.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaEnvelope style={styles.inputIcon} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      style={styles.input}
                      value={customerData.email}
                      onChange={handleChange}
                      placeholder="client@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div style={styles.formColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaPhone style={styles.inputIcon} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      style={styles.input}
                      value={customerData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaMapMarkerAlt style={styles.inputIcon} />
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      style={styles.input}
                      value={customerData.address}
                      onChange={handleChange}
                      placeholder="123 Luxury Avenue"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={styles.formActions}>
                <button type="submit" style={styles.submitButton}>
                  Update Client Profile
                </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => navigate('/customers')}
                >
                  <FaArrowLeft style={styles.backIcon} />
                  Back to Clients
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Luxury styling
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
    backgroundImage: 'linear-gradient(rgba(15, 15, 25, 0.97), rgba(15, 15, 25, 0.97)), url("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
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
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    margin: '5px 0 0 0',
  },
  formContainer: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '30px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    backdropFilter: 'blur(5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formColumns: {
    display: 'flex',
    gap: '30px',
    '@media (max-width: 992px)': {
      flexDirection: 'column',
    },
  },
  formColumn: {
    flex: 1,
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
  inputIcon: {
    marginRight: '10px',
    color: '#D4AF37',
    fontSize: '16px',
  },
  input: {
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
  addressRow: {
    display: 'flex',
    gap: '15px',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
    },
  },
  addressField: {
    flex: 1,
  },
  formActions: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
  },
  submitButton: {
    flex: 1,
    padding: '15px',
    backgroundColor: '#D4AF37',
    border: 'none',
    borderRadius: '8px',
    color: '#111',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#F1C232',
    },
  },
  cancelButton: {
    flex: 1,
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '500',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  backIcon: {
    marginRight: '10px',
    fontSize: '16px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
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
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '16px',
  },
  errorCard: {
    backgroundColor: 'rgba(255, 99, 132, 0.1)',
    border: '1px solid rgba(255, 99, 132, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    color: '#FF6384',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  errorIcon: {
    fontSize: '24px',
  },
};

export default EditCustomer;
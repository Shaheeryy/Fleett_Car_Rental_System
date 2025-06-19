import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Bar/Bar';
import API_BASE_URL from '../../api';

const AddCustomerPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    if (input === '' || /^\+\d*$/.test(input)) {
      setCustomerData(prev => ({ ...prev, phoneNumber: input }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const nameTrimmed = customerData.name.trim();
    const nameParts = nameTrimmed.split(/\s+/);

    if (!nameTrimmed) {
      newErrors.name = 'Name is required';
    } else if (!/^[A-Za-zÀ-ȕ\s]+$/.test(nameTrimmed)) {
      newErrors.name = 'Only letters and spaces allowed';
    } else if (nameParts.length < 2 || nameParts.some(part => part.length < 2)) {
      newErrors.name = 'Enter first and last name (min 2 letters each)';
    }

    if (!customerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!customerData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone is required';
    } else if (!/^\+\d{6,15}$/.test(customerData.phoneNumber)) {
      newErrors.phoneNumber = 'Format: + followed by 6-15 digits';
    }

    if (!customerData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/customers`, {
        name: customerData.name,
        email: customerData.email,
        phoneNumber: customerData.phoneNumber,
        address: customerData.address
      });

      if (response.status === 200) {
        // Show success message or redirect
        navigate('/customer-management');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setSubmissionError(
        error.response?.data?.message || 
        'Failed to add customer. Please try again.'
      );
    } finally {
      setLoading(false);
    }
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
            <i className="bi bi-person-plus me-2"></i>
            Add New Customer
          </h1>
        </header>

        {/* Error Message */}
        {submissionError && (
          <div style={styles.errorCard}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {submissionError}
          </div>
        )}

        {/* Customer Form */}
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={customerData.name}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: errors.name ? '#FF6384' : 'rgba(255,255,255,0.1)'
                }}
                placeholder="John Doe"
              />
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={customerData.email}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: errors.email ? '#FF6384' : 'rgba(255,255,255,0.1)'
                }}
                placeholder="john@example.com"
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={customerData.phoneNumber}
                onChange={handlePhoneChange}
                style={{
                  ...styles.input,
                  borderColor: errors.phoneNumber ? '#FF6384' : 'rgba(255,255,255,0.1)'
                }}
                placeholder="+40712345678"
              />
              {errors.phoneNumber && <span style={styles.errorText}>{errors.phoneNumber}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <textarea
                name="address"
                value={customerData.address}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: errors.address ? '#FF6384' : 'rgba(255,255,255,0.1)',
                  minHeight: '100px'
                }}
                placeholder="123 Main St, City, Country"
              />
              {errors.address && <span style={styles.errorText}>{errors.address}</span>}
            </div>

            <div style={styles.buttonGroup}>
              <button 
                type="submit" 
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <i className="bi bi-arrow-repeat spin" style={styles.spinner}></i> Processing...
                  </span>
                ) : (
                  'Add Customer'
                )}
              </button>
              
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => navigate('/customer-management')}
              >
                Back to List
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reusing the same styles from CustomerListPage with additions
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
  errorCard: {
    backgroundColor: 'rgba(255, 99, 132, 0.1)',
    border: '1px solid rgba(255, 99, 132, 0.3)',
    borderRadius: '10px',
    padding: '15px 20px',
    color: '#FF6384',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '25px',
  },
  formContainer: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '25px',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(5px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  input: {
    padding: '12px 15px',
    backgroundColor: 'rgba(30, 30, 40, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    transition: 'all 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: 'rgba(212, 175, 55, 0.5)',
      boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
    },
  },
  errorText: {
    fontSize: '12px',
    color: '#FF6384',
    marginTop: '4px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#D4AF37',
    border: 'none',
    borderRadius: '8px',
    color: '#111',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#F1C232',
    },
    ':disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '500',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  spinner: {
    display: 'inline-block',
    marginRight: '8px',
    animation: 'spin 1s linear infinite',
  },
};


export default AddCustomerPage;
import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Bar/Bar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaUserTie, FaCar, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';

const AddRentalPage = () => {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [rentalDetails, setRentalDetails] = useState({
    customerId: '',
    vehicleId: '',
    rentalDate: new Date(),
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
  });
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  // Fetch customers from backend
  useEffect(() => {
    setLoading(true);
    api.get('/customers')
      .then((response) => {
        setCustomers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching customers:', error);
        setError('Failed to load customers.');
        setLoading(false);
      });
  }, []);

  // Fetch vehicles from backend
  useEffect(() => {
    setLoading(true);
    api.get('/vehicles')
      .then((response) => {
        const availableVehicles = response.data.filter(
          (vehicle) => (vehicle.status || '').toUpperCase() === 'AVAILABLE'
        ).map(vehicle => ({
          ...vehicle,
          pricePerDay: parseFloat(vehicle.pricePerDay) || 0
        }));
        setVehicles(availableVehicles);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles.');
        setLoading(false);
      });
  }, []);

  // Calculate price when vehicle or dates change
  useEffect(() => {
    if (rentalDetails.vehicleId && rentalDetails.rentalDate && rentalDetails.returnDate) {
      const vehicle = vehicles.find(v => v.vehicleId === rentalDetails.vehicleId);
      if (vehicle) {
        const startDate = new Date(rentalDetails.rentalDate);
        const endDate = new Date(rentalDetails.returnDate);
        const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        const calculatedPrice = days * vehicle.pricePerDay;
        setTotalPrice(calculatedPrice);
      }
    } else {
      setTotalPrice(0);
    }
  }, [rentalDetails.vehicleId, rentalDetails.rentalDate, rentalDetails.returnDate, vehicles]);

  const handleDateChange = (date, field) => {
    setRentalDetails(prev => {
      const updated = { ...prev, [field]: date };

      // Ensure return date is not before rental date
      if (field === 'rentalDate' && updated.returnDate < date) {
        updated.returnDate = date;
      }
      
      // Ensure rental date is not after return date
      if (field === 'returnDate' && date < updated.rentalDate) {
        updated.rentalDate = date;
      }

      return updated;
    });
  };

  const handleVehicleSelect = (e) => {
    const vehicleId = e.target.value;
    const vehicle = vehicles.find(v => String(v.vehicleId) === String(vehicleId));
    setSelectedVehicle(vehicle);
    setRentalDetails(prev => ({ ...prev, vehicleId }));
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    setRentalDetails(prev => ({ ...prev, customerId }));
    const customer = customers.find(c => c._id === customerId);
    setSelectedCustomer(customer);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { customerId, vehicleId, rentalDate, returnDate } = rentalDetails;

    if (!customerId || !vehicleId || !rentalDate || !returnDate) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const rentalData = {
      customerId,
      vehicleId,
      rentalDate: rentalDate.toISOString(),
      returnDate: returnDate.toISOString(),
      totalCost: totalPrice,
    };

    try {
      const response = await api.post('/rentals/rent', rentalData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.status === 200) {
        navigate('/active-rentals');
      }
    } catch (error) {
      console.error('Error adding rental:', error);
      const errorMsg = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || 'Failed to add rental. Please try again.';
      setError(errorMsg);
    } finally {
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
        activeNav="rentals"
      />

      <div style={{
        ...styles.content,
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <GiSteeringWheel style={styles.headerIcon} />
            Premium Rental Booking
          </h1>
          <p style={styles.headerSubtitle}>Reserve our luxury vehicles for your elite clients</p>
        </header>

        <div style={styles.formContainer}>
          {loading ? (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner}></div>
              <p>Processing your luxury reservation...</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={styles.errorCard}>
                  <i className="bi bi-exclamation-triangle"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formColumns}>
                  {/* Left Column */}
                  <div style={styles.formColumn}>
                    {/* Customer Selection */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <FaUserTie style={styles.inputIcon} />
                        Select Elite Client
                      </label>
                      <select
                        style={styles.selectInput}
                        value={rentalDetails.customerId}
                        onChange={handleCustomerSelect}
                        required
                      >
                        <option value="">-- Select Client --</option>
                        {customers.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name} - {customer.email}
                          </option>
                        ))}
                      </select>
                      {selectedCustomer && (
                        <div style={styles.customerDetails}>
                          <p style={styles.detailText}>
                            <strong>Phone:</strong> {selectedCustomer.phoneNumber}
                          </p>
                          <p style={styles.detailText}>
                            <strong>Address:</strong> {selectedCustomer.address}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Vehicle Selection */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <FaCar style={styles.inputIcon} />
                        Select Luxury Vehicle
                      </label>
                      <select
                        style={styles.selectInput}
                        value={rentalDetails.vehicleId}
                        onChange={handleVehicleSelect}
                        required
                      >
                        <option value="">-- Select Vehicle --</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                            {vehicle.make} {vehicle.model} ({vehicle.year}) - ${Number(vehicle.pricePerDay).toFixed(2)}/day
                          </option>
                        ))}
                      </select>
                      {selectedVehicle && (
                        <div style={styles.vehicleDetails}>
                          <div style={styles.vehicleImagePlaceholder}>
                            <FaCar style={styles.vehicleIcon} />
                          </div>
                          <div style={styles.vehicleInfo}>
                            <p style={styles.detailText}>
                              <strong>Year:</strong> {selectedVehicle.year}
                            </p>
                            <p style={styles.detailText}>
                              <strong>License:</strong> {selectedVehicle.licensePlate || selectedVehicle.registrationNumber}
                            </p>
                            <p style={styles.detailText}>
                              <strong>Status:</strong> {selectedVehicle.status}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div style={styles.formColumn}>
                    {/* Rental Dates */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        <FaCalendarAlt style={styles.inputIcon} />
                        Rental Period
                      </label>
                      <div style={styles.datePickerGroup}>
                        <div style={styles.datePickerContainer}>
                          <label style={styles.dateLabel}>Start Date</label>
                          <DatePicker
                            selected={rentalDetails.rentalDate}
                            onChange={(date) => handleDateChange(date, 'rentalDate')}
                            selectsStart
                            startDate={rentalDetails.rentalDate}
                            endDate={rentalDetails.returnDate}
                            minDate={new Date()}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="form-control"
                            popperPlacement="top-start"
                            customInput={<input style={styles.dateInput} />}
                            required
                          />
                        </div>
                        <div style={styles.datePickerContainer}>
                          <label style={styles.dateLabel}>End Date</label>
                          <DatePicker
                            selected={rentalDetails.returnDate}
                            onChange={(date) => handleDateChange(date, 'returnDate')}
                            selectsEnd
                            startDate={rentalDetails.rentalDate}
                            endDate={rentalDetails.returnDate}
                            minDate={rentalDetails.rentalDate}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="form-control"
                            popperPlacement="top-start"
                            customInput={<input style={styles.dateInput} />}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div style={styles.priceSummary}>
                      <h3 style={styles.priceTitle}>Reservation Summary</h3>
                      <div style={styles.priceRow}>
                        <span>Daily Rate:</span>
                        <span>${(selectedVehicle?.pricePerDay || 0).toFixed(2)}</span>
                      </div>
                      <div style={styles.priceRow}>
                        <span>Rental Days:</span>
                        <span>
                          {rentalDetails.rentalDate && rentalDetails.returnDate ? 
                            Math.max(1, Math.ceil(
                              (new Date(rentalDetails.returnDate) - new Date(rentalDetails.rentalDate)) 
                              / (1000 * 60 * 60 * 24)
                            )) : '0'}
                        </span>
                      </div>
                      <div style={styles.priceDivider}></div>
                      <div style={{...styles.priceRow, ...styles.totalPrice}}>
                        <span>Total Estimated Price:</span>
                        <span>${(totalPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" style={styles.submitButton}>
                      Confirm Luxury Reservation
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}

          <button
            style={styles.backButton}
            onClick={() => navigate('/active-rentals')}
          >
            <FaArrowLeft style={styles.backIcon} />
            Back to Active Rentals
          </button>
        </div>
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
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    zIndex: 10,
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
    padding: '15px',
    color: '#FF6384',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '25px',
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
    display: 'flex',
    alignItems: 'center',
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
  customerDetails: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: '6px',
  },
  vehicleDetails: {
    marginTop: '10px',
    display: 'flex',
    gap: '15px',
    padding: '10px',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: '6px',
  },
  vehicleImagePlaceholder: {
    width: '80px',
    height: '60px',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIcon: {
    fontSize: '24px',
    color: 'rgba(212, 175, 55, 0.5)',
  },
  vehicleInfo: {
    flex: 1,
  },
  detailText: {
    margin: '5px 0',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
  },
  datePickerGroup: {
    display: 'flex',
    gap: '15px',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
    },
  },
  datePickerContainer: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: '10px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
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
  priceSummary: {
    backgroundColor: 'rgba(15, 15, 25, 0.7)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '25px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
  },
  priceTitle: {
    fontSize: '16px',
    color: '#D4AF37',
    margin: '0 0 15px 0',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '10px 0',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
  },
  priceDivider: {
    height: '1px',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    margin: '15px 0',
  },
  totalPrice: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#D4AF37',
    marginTop: '15px',
  },
  submitButton: {
    padding: '15px',
    backgroundColor: '#D4AF37',
    border: 'none',
    borderRadius: '8px',
    color: '#111',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    ':hover': {
      backgroundColor: '#F1C232',
    },
  },
  backButton: {
    padding: '12px 20px',
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
    marginTop: '20px',
    transition: 'all 0.2s',
    width: '100%',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  backIcon: {
    marginRight: '10px',
    fontSize: '16px',
  },
};

export default AddRentalPage;
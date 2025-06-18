import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/Bar/Bar";
import { FaCar, FaGasPump, FaMoneyBillWave, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import { GiCarWheel } from "react-icons/gi";

const AddVehicle = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    category: "",
    registrationNumber: "",
    pricePerDay: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!/^[A-Za-z0-9\s]+$/.test(vehicle.make)) {
      newErrors.make = "Vehicle brand must contain letters and numbers only.";
    } else if (/^\d+$/.test(vehicle.make)) {
      newErrors.make = "Vehicle brand cannot be only numbers.";
    }

    if (!/^[A-Za-z0-9\s]+$/.test(vehicle.model)) {
      newErrors.model = "Model must contain letters and numbers only.";
    }

    if (!/^\d{4}$/.test(vehicle.year.toString()) || 
        Number(vehicle.year) < 1950 || 
        Number(vehicle.year) > currentYear) {
      newErrors.year = `Please select a value that is no more than ${currentYear}.`;
    }

    if (!["electric", "hibrid", "diesel", "benzina"].includes(vehicle.category)) {
      newErrors.category = "Select a valid fuel category.";
    }

    if (Number(vehicle.pricePerDay) < 10) {
      newErrors.pricePerDay = "Price per day must be greater than 10.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/vehicles", {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        registrationNumber: vehicle.registrationNumber,
        pricePerDay: vehicle.pricePerDay,
        status: "Available" // Set initial status
      });

      if (response.status === 200) {
        // Show success message or redirect
        navigate("/vehicle-management");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "year" || name === "pricePerDay" ? Number(value) : value;
    setVehicle(prev => ({ ...prev, [name]: newValue }));
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
        activeNav="vehicles"
      />

      <div style={{
        ...styles.content,
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <GiCarWheel style={styles.headerIcon} />
            Register New Luxury Vehicle
          </h1>
          <p style={styles.headerSubtitle}>Add a premium vehicle to your elite fleet</p>
        </header>

        {loading ? (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner}></div>
            <p>Registering your luxury vehicle...</p>
          </div>
        ) : (
          <div style={styles.formContainer}>
            {error && (
              <div style={styles.errorCard}>
                <i className="bi bi-exclamation-triangle"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formColumns}>
                {/* Left Column */}
                <div style={styles.formColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaCar style={styles.inputIcon} />
                      Vehicle Brand
                    </label>
                    <input
                      type="text"
                      name="make"
                      style={styles.input}
                      value={vehicle.make}
                      onChange={handleChange}
                      placeholder="e.g., Mercedes-Benz"
                      required
                    />
                    {errors.make && <div style={styles.errorText}>{errors.make}</div>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaCar style={styles.inputIcon} />
                      Model
                    </label>
                    <input
                      type="text"
                      name="model"
                      style={styles.input}
                      value={vehicle.model}
                      onChange={handleChange}
                      placeholder="e.g., S-Class"
                      required
                    />
                    {errors.model && <div style={styles.errorText}>{errors.model}</div>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaCalendarAlt style={styles.inputIcon} />
                      Year of Fabrication
                    </label>
                    <input
                      type="number"
                      name="year"
                      style={styles.input}
                      value={vehicle.year}
                      onChange={handleChange}
                      min="1950"
                      max={new Date().getFullYear()}
                      placeholder="2023"
                      required
                    />
                    {errors.year && <div style={styles.errorText}>{errors.year}</div>}
                  </div>
                </div>

                {/* Right Column */}
                <div style={styles.formColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaGasPump style={styles.inputIcon} />
                      Fuel Category
                    </label>
                    <select
                      name="category"
                      style={styles.selectInput}
                      value={vehicle.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="electric">Electric</option>
                      <option value="hibrid">Hybrid</option>
                      <option value="diesel">Diesel</option>
                      <option value="benzina">Petrol</option>
                    </select>
                    {errors.category && <div style={styles.errorText}>{errors.category}</div>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaCar style={styles.inputIcon} />
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      style={styles.input}
                      value={vehicle.registrationNumber}
                      onChange={handleChange}
                      placeholder="AB 123 CD"
                      required
                    />
                    {errors.registrationNumber && (
                      <div style={styles.errorText}>{errors.registrationNumber}</div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <FaMoneyBillWave style={styles.inputIcon} />
                      Price Per Day (€)
                    </label>
                    <input
                      type="number"
                      name="pricePerDay"
                      style={styles.input}
                      value={vehicle.pricePerDay}
                      onChange={handleChange}
                      min="10"
                      step="0.5"
                      placeholder="150.00"
                      required
                    />
                    {errors.pricePerDay && (
                      <div style={styles.errorText}>{errors.pricePerDay}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={styles.formActions}>
                <button type="submit" style={styles.submitButton}>
                  Register Luxury Vehicle
                </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => navigate("/vehicle-management")}
                >
                  <FaArrowLeft style={styles.backIcon} />
                  Cancel
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
    display: 'flex',
    alignItems: 'center',
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
  errorText: {
    color: '#FF6384',
    fontSize: '12px',
    marginTop: '5px',
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
  loadingOverlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
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
    padding: '15px',
    color: '#FF6384',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '25px',
  },
};

export default AddVehicle;
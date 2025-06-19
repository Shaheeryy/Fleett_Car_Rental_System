import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import API_BASE_URL from '../api';

const EditVehicle = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    category: "",
    registrationNumber: "",
    pricePerDay: "",
    image: "",
    status: "",
    features: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/vehicles/${vehicleId}`)
      .then((response) => {
        const vehicleData = response.data?.vehicle || response.data;
        if (!vehicleData || Object.keys(vehicleData).length === 0) {
          setError('Vehicle not found.');
        } else {
          setVehicle(vehicleData);
        }
      })
      .catch((error) => {
        const message = typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || 'Unable to fetch vehicle details.';
        setError(message);
        console.error('Fetch vehicle failed:', error);
      })
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.put(`${API_BASE_URL}/vehicles/${vehicleId}`, vehicle)
      .then(() => {
        navigate("/vehicle-management", { state: { success: "Vehicle updated successfully!" } });
      })
      .catch((error) => {
        setError("Failed to update vehicle. Please try again.");
        console.error(error);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle({ ...vehicle, [name]: value });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading vehicle details...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <i className="bi bi-car-front" style={styles.headerIcon}></i>
          <h2 style={styles.title}>Edit Vehicle</h2>
          {error && <div style={styles.errorAlert}>{error}</div>}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Make</label>
              <input
                type="text"
                name="make"
                value={vehicle.make}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Model</label>
              <input
                type="text"
                name="model"
                value={vehicle.model}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Year</label>
              <input
                type="number"
                name="year"
                value={vehicle.year}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={vehicle.status}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select status</option>
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>  

            <div style={styles.formGroup}>
              <label style={styles.label}>Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={vehicle.registrationNumber}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Price Per Day ($)</label>
              <input
                type="number"
                step="0.01"
                name="pricePerDay"
                value={vehicle.pricePerDay}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>



            <div style={styles.formGroup}>
              {/* <label style={styles.label}>Features (comma separated)</label>
              <textarea
                name="features"
                value={vehicle.features}
                onChange={handleChange}
                style={{...styles.input, height: '80px'}}
                placeholder="GPS, Leather seats, Sunroof..."
              /> */}
            </div>

            <div style={styles.formGroup}>
              {/* <label style={styles.label}>Image URL</label> */}
              {/* <input
                type="text"
                name="image"
                value={vehicle.image}
                onChange={handleChange}
                style={styles.input}
                placeholder="https://example.com/vehicle.jpg"
              /> */}
              {vehicle.image && (
                <div style={styles.imagePreview}>
                  <img 
                    src={vehicle.image} 
                    alt="Vehicle preview" 
                    style={styles.previewImage}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              style={styles.primaryButton}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.buttonLoading}>
                  <i className="bi bi-arrow-repeat"></i> Saving...
                </span>
              ) : (
                <span><i className="bi bi-check-circle"></i> Save Changes</span>
              )}
            </button>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => navigate("/vehicle-management")}
            >
              <i className="bi bi-x-circle"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    padding: '30px',
    fontFamily: '"Barlow", sans-serif',
    color: '#fff',
  },
  background: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(rgba(15, 15, 25, 0.97), rgba(15, 15, 25, 0.97)), url("https://www.transparenttextures.com/patterns/dark-leather.png")',
    zIndex: -1,
  },
  card: {
    backgroundColor: 'rgba(40, 40, 50, 0.85)',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    backdropFilter: 'blur(5px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
  },
  headerIcon: {
    fontSize: '32px',
    color: '#D4AF37',
    marginRight: '15px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    margin: 0,
    color: '#fff',
  },
  errorAlert: {
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    color: '#FF6384',
    padding: '10px 15px',
    borderRadius: '6px',
    marginLeft: 'auto',
    border: '1px solid rgba(255, 99, 132, 0.3)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // input: {
  //   width: '100%',
  //   padding: '12px 15px',
  //   backgroundColor: 'rgba(255, 255, 255, 0.05)',
  //   border: '1px solid rgba(255, 255, 255, 0.1)',
  //   borderRadius: '6px',
  //   color: '#fff',
  //   fontSize: '15px',
  //   transition: 'all 0.3s',
  // },
  input: {
    width: '100%',
    padding: '12px 15px',
    backgroundColor: 'rgba(30, 30, 40, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '15px',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s',
    ':focus': {
      outline: 'none',
      borderColor: 'rgba(212, 175, 55, 0.5)',
      boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
    },
  },
  imagePreview: {
    marginTop: '10px',
    width: '100%',
    height: '150px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    color: '#000',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '12px 25px',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
  },
  buttonLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#D4AF37',
  },
  loadingSpinner: {
    border: '4px solid rgba(212, 175, 55, 0.2)',
    borderTop: '4px solid #D4AF37',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '15px',
  },
  loadingText: {
    fontSize: '16px',
    fontWeight: '500',
  },
};

export default EditVehicle;
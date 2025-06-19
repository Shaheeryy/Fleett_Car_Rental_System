import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatInTimeZone } from 'date-fns-tz';
import api from '../../api';
import { 
  FiArrowLeft, FiTool, FiCalendar, FiDollarSign, FiAlertTriangle, 
  FiCheckCircle, FiBarChart2, FiInfo 
} from 'react-icons/fi';
import { 
  GiCarDoor, GiCarKey,
  GiSpeedometer, 
} from 'react-icons/gi';
import { MdDateRange } from 'react-icons/md';
import { FaHistory, FaCalendarAlt } from 'react-icons/fa';

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [anomalyScore, setAnomalyScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('specs');
  //const [imageError, setImageError] = useState(false);

  // Helper to safely format dates and avoid "Invalid time value"
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return formatInTimeZone(dateString, userTimeZone, 'PPp');
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await api.get(`/vehicles/${id}`);
        // API returns { vehicle, rentals, maintenance }
        const { vehicle: veh, rentals, maintenance } = response.data;
        // attach histories so the rest of the component can keep working untouched
        const enrichedVehicle = {
          ...veh,
          rentalHistory: rentals || [],
          maintenanceHistory: maintenance || [],
        };
        setVehicle(enrichedVehicle);

        // Fetch anomaly score – API returns { anomalyScore }
        const anomalyResponse = await api.get(`/vehicles/${id}/anomaly-score`);
        const score = Number(anomalyResponse.data?.anomalyScore);
        setAnomalyScore(isNaN(score) ? null : score);

        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("Unable to fetch vehicle information.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /*const handleImageError = () => {
    setImageError(true);
  };*/

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading vehicle details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <FiAlertTriangle style={styles.errorIcon} />
          <h2 style={styles.errorTitle}>Error Loading Vehicle</h2>
          <p style={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => navigate('/vehicle-management')}
            style={styles.backButton}
          >
            <FiArrowLeft style={{ marginRight: 8 }} />
            Back to Vehicle List
          </button>
        </div>
      </div>
    );
  }

  const safeScore = typeof anomalyScore === 'number' && !isNaN(anomalyScore) ? anomalyScore : 0;
  const isAnomalous = safeScore > 0.7;
  const anomalyPercentage = Math.round(safeScore * 100);
  //const totalRevenue = vehicle.rentalHistory?.reduce((sum, rental) => sum + rental.revenue, 0) || 0;

  return (
    <div style={styles.container}>
      {/* Background Gradient */}
      <div style={styles.background}></div>
      
      {/* Header */}
      <div style={styles.header}>
        <button 
          onClick={() => navigate('/vehicle-management')}
          style={styles.backButton}
        >
          <FiArrowLeft style={{ marginRight: 8 }} />
          Back to Vehicles
        </button>
        
        <div style={styles.titleContainer}>
          <h1 style={styles.title}>
            <span style={styles.make}>{vehicle.make}</span> {vehicle.model}
          </h1>
          <div style={styles.subtitle}>
            <span style={styles.regNumber}>{vehicle.registrationNumber}</span>
            <span style={styles.statusBadge(vehicle.status)}>
              {vehicle.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Vehicle Image Card */}
        <div style={styles.imageCard}>
          {/* <div style={styles.imageContainer}>
            {/* <img 
              src={imageError ? '/images/default-car.jpg' : vehicle.imageUrl} 
              alt={`${vehicle.make} ${vehicle.model}`}
              style={styles.vehicleImage}
              onError={handleImageError}
            /> 
            <div style={styles.imageOverlay}></div>
          </div> */}
          <div style={styles.quickStats}>
           
            <div style={styles.quickStat}>
              <FaCalendarAlt style={styles.statIcon} />
              <span>{vehicle.year}</span>
            </div>
            <div style={styles.quickStat}>
              <FiDollarSign style={styles.statIcon} />
              <span>${vehicle.pricePerDay}/day</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'specs' ? {
                  color: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  borderBottom: '2px solid #D4AF37'
                } : {
                  color: "rgba(255, 255, 255, 0.6)",
                  background: "none",
                  backgroundColor: 'transparent',
                  border: "none",
                })
              }}
              onClick={() => setActiveTab('specs')}
            >
              <FiInfo style={{ marginRight: 8 }} />
              Specifications
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'analytics' ? {
                  color: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  borderBottom: '2px solid #D4AF37'
                } : {
                  color: "rgba(255, 255, 255, 0.6)",
                  background: "none",
                  backgroundColor: 'transparent',
                  border: "none",
                })
              }}
              onClick={() => setActiveTab('analytics')}
            >
              <FiBarChart2 style={{ marginRight: 8 }} />
              Analytics
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'maintenance' ? {
                  color: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  borderBottom: '2px solid #D4AF37'
                } : {
                  color: "rgba(255, 255, 255, 0.6)",
                  background: "none",
                  backgroundColor: 'transparent',
                  border: "none",
                })
              }}
              onClick={() => setActiveTab('maintenance')}
            >
              <FiTool style={{ marginRight: 8 }} />
              Maintenance
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'rentals' ? {
                  color: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  borderBottom: '2px solid #D4AF37'
                } : {
                  color: "rgba(255, 255, 255, 0.6)",
                  background: "none",
                  backgroundColor: 'transparent',
                  border: "none",
                })
              }}
              onClick={() => setActiveTab('rentals')}
            >
              <FiCalendar style={{ marginRight: 8 }} />
              Rentals
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {activeTab === 'specs' && (
            <div style={styles.specsGrid}>
              <div style={styles.specCard}>
                <div style={styles.specHeader}>
                  <GiCarDoor style={styles.specIcon} />
                  <h3 style={styles.specTitle}>Basic Info</h3>
                </div>
                <div style={styles.specList}>
                  <SpecItem icon={<GiCarDoor />} label="Make/Model" value={`${vehicle.make} ${vehicle.model}`} />
                  <SpecItem icon={<MdDateRange />} label="Year" value={vehicle.year} />
                  {/* <SpecItem icon={<FaCarSide />} label="Color" value={vehicle.color || 'N/A'} /> */}
                </div>
              </div>

              <div style={styles.specCard}>
                <div style={styles.specHeader}>
                  <GiSpeedometer style={styles.specIcon} />
                  <h3 style={styles.specTitle}>Performance</h3>
                </div>
                <div style={styles.specList}>
                  <SpecItem icon={<GiCarKey />} label="Registration" value={vehicle.registrationNumber} />

                  {/* <SpecItem icon={<GiGasPump />} label="Fuel Type" value={vehicle.fuelCategory} /> */}
                  {/* <SpecItem icon={<GiPowerLightning />} label="Engine" value={vehicle.engine} />
                  <SpecItem icon={<GiSteeringWheel />} label="Transmission" value={vehicle.transmission} /> */}
                  <SpecItem icon={<FiDollarSign />} label="Price/Day" value={`$${vehicle.pricePerDay}`} />
                </div>
              </div>

              {/* <div style={styles.specCard}>
                <div style={styles.specHeader}>
                  <GiCarWheel style={styles.specIcon} />
                  <h3 style={styles.specTitle}>Features</h3>
                </div>
                <div style={styles.featuresList}>
                  {vehicle.features?.map((feature, index) => (
                    <div key={index} style={styles.featureItem}>
                      <FiCheckCircle style={styles.featureIcon} />
                      <span>{feature}</span>
                    </div>
                  )) || <p>No features listed</p>}
                </div>
              </div> */}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div style={styles.analyticsContainer}>
              <div style={styles.anomalyCard}>
                <h3 style={styles.analyticsTitle}>
                  <FiAlertTriangle style={{ marginRight: 10 }} />
                  Anomaly Detection
                </h3>
                <div style={styles.anomalyContent}>
                  <div style={styles.anomalyMeter}>
                    <div 
                      style={styles.anomalyMeterFill(safeScore)}
                      title={`Anomaly score: ${safeScore.toFixed(2)}`}
                    ></div>
                    <div style={styles.anomalyLabels}>
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div style={styles.anomalyMessage(isAnomalous)}>
                    {isAnomalous ? (
                      <>
                        <FiAlertTriangle style={{ marginRight: 8 }} />
                        High anomaly detected ({anomalyPercentage}%)
                      </>
                    ) : (
                      <>
                        <FiCheckCircle style={{ marginRight: 8 }} />
                        Normal behavior ({anomalyPercentage}%)
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.statsCard}>
                <h3 style={styles.analyticsTitle}>
                  <FaHistory style={{ marginRight: 10 }} />
                  Usage Statistics
                </h3>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Total Rentals</span>
                    <span style={styles.statValue}>{vehicle.rentalHistory?.length || 0}</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Maintenance Events</span>
                    <span style={styles.statValue}>{vehicle.maintenanceHistory?.length || 0}</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Days in Service</span>
                    <span style={styles.statValue}>
                      {vehicle.createdAt ? Math.round(
                        (new Date() - new Date(vehicle.createdAt)) / (1000 * 60 * 60 * 24)
                      ) : 'N/A'}
                    </span>
                  </div>
                  {/* <div style={styles.statItem}>
                    <span style={styles.statLabel}>Revenue Generated</span>
                    <span style={styles.statValue}>
                      ${totalRevenue.toLocaleString()}
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div style={styles.historyContainer}>
              <h3 style={styles.historyTitle}>
                <FiTool style={{ marginRight: 10 }} />
                Maintenance History
              </h3>
              {vehicle.maintenanceHistory?.length > 0 ? (
                vehicle.maintenanceHistory.map((record, index) => (
                  <div key={index} style={styles.historyCard}>
                    <div style={styles.historyHeader}>
                      <span style={styles.historyDate}>
                        {formatDate(record.scheduledDate || record.maintenanceDate || record.createdAt)}
                      </span>
                      <span style={styles.historyStatus(record.status)}>
                        {record.status}
                      </span>
                    </div>
                    <div style={styles.historyContent}>
                      <p style={styles.historyDescription}>{record.issueDescription}</p>
                      <div style={styles.historyMeta}>
                        <span style={styles.historyCost}>${record.cost ?? record.maintenanceCost ?? 0}</span>
                        {(record.completedDate || record.resolutionDate) && (
                          <span style={styles.historyResolved}>
                            Resolved: {formatDate(record.completedDate || record.resolutionDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <FiTool style={styles.emptyIcon} />
                  <p>No maintenance records found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rentals' && (
            <div style={styles.historyContainer}>
              <h3 style={styles.historyTitle}>
                <FiCalendar style={{ marginRight: 10 }} />
                Rental History
              </h3>
              {vehicle.rentalHistory?.length > 0 ? (
                vehicle.rentalHistory.map((record, index) => (
                  <div key={index} style={styles.historyCard}>
                    <div style={styles.historyHeader}>
                      <span style={styles.historyDate}>
                        {formatDate(record.rentalDate)} -{' '}
                        {record.returnDate ? formatDate(record.returnDate) : 'Present'}
                      </span>
                      <span style={styles.historyStatus(record.status)}>
                        {record.status}
                      </span>
                    </div>
                    <div style={styles.historyContent}>
                      <div style={styles.historyMeta}>
                        <span style={styles.historyCustomer}>
                          Customer: {record.customer?.name ?? record.customerId ?? 'N/A'}
                          {record.customer?.email ? ` - ${record.customer.email}` : ''}
                        </span>
                      </div>
                      {record.returnDate && (
                        <div style={styles.rentalDuration}>
                          <span>
                            Duration: {(() => {
                              const start = new Date(record.rentalDate);
                              const end = new Date(record.returnDate);
                              return isNaN(start) || isNaN(end) ? 'N/A' : `${Math.round((end - start) / (1000 * 60 * 60 * 24))} days`;
                            })()}
                          </span>
                          {/* <div style={styles.ratingStars(record.rating)}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={styles.star(i < record.rating)}>★</span>
                            ))}
                          </div> */}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <FiCalendar style={styles.emptyIcon} />
                  <p>No rental records found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Specification Item Component
const SpecItem = ({ icon, label, value }) => (
  <div style={styles.specItem}>
    <div style={styles.specIconContainer}>
      {icon}
    </div>
    <div style={styles.specText}>
      <small style={styles.specLabel}>{label}</small>
      <span style={styles.specValue}>{value || 'N/A'}</span>
    </div>
  </div>
);

// Styles
const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: '"Barlow", sans-serif',
    paddingBottom: '40px',
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
    filter: 'blur(1px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '25px 40px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    color: '#D4AF37',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginRight: '30px',
    fontSize: '14px',
    fontWeight: '500',
    ':hover': {
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
    },
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    margin: '0 0 5px 0',
    letterSpacing: '0.5px',
  },
  make: {
    color: '#D4AF37',
  },
  subtitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  regNumber: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: '1px',
  },
  statusBadge: (status) => ({
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    backgroundColor: status === 'Available' ? 'rgba(75, 192, 192, 0.2)' : 
                    status === 'Rented' ? 'rgba(255, 206, 86, 0.2)' : 
                    'rgba(255, 99, 132, 0.2)',
    color: status === 'Available' ? '#4BC0C0' : 
           status === 'Rented' ? '#FFCE56' : 
           '#FF6384',
  }),
  content: {
    padding: '0 40px',
    marginTop: '20px',
  },
  imageCard: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(5px)',
  },
  imageContainer: {
    height: '300px',
    backgroundColor: 'rgba(30, 30, 40, 0.5)',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '20px',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
    ':hover': {
      transform: 'scale(1.05)',
    },
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, rgba(15,15,25,0.9) 0%, rgba(15,15,25,0.3) 50%, rgba(15,15,25,0.1) 100%)',
  },
  quickStats: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  quickStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 15px',
    backgroundColor: 'rgba(30, 30, 40, 0.5)',
    borderRadius: '6px',
    fontSize: '14px',
  },
  statIcon: {
    color: '#D4AF37',
    fontSize: '16px',
  },
  tabsContainer: {
    marginBottom: '25px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    gap: '5px',
  },
  tab: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    padding: '12px 20px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  tabContent: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '25px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(5px)',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  specCard: {
    backgroundColor: 'rgba(30, 30, 40, 0.5)',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  specHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  specIcon: {
    fontSize: '20px',
    color: '#D4AF37',
  },
  specTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  specItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
  },
  specIconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#D4AF37',
    flexShrink: 0,
  },
  specText: {
    flex: 1,
  },
  specLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '12px',
    display: 'block',
    marginBottom: '2px',
  },
  specValue: {
    fontSize: '16px',
    fontWeight: '500',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  featureIcon: {
    color: '#4BC0C0',
    fontSize: '16px',
  },
  historyContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  historyTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 20px 0',
  },
  historyCard: {
    backgroundColor: 'rgba(30, 30, 40, 0.5)',
    borderRadius: '8px',
    padding: '15px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  historyDate: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  historyStatus: (status) => ({
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: status === 'Completed' ? 'rgba(75, 192, 192, 0.2)' : 
                    'rgba(255, 206, 86, 0.2)',
    color: status === 'Completed' ? '#4BC0C0' : '#FFCE56',
  }),
  historyContent: {
    fontSize: '14px',
  },
  historyDescription: {
    margin: '0 0 10px 0',
  },
  historyMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '5px',
  },
  historyCost: {
    color: '#D4AF37',
    fontWeight: '500',
  },
  historyCustomer: {
    fontWeight: '500',
  },
  historyRevenue: {
    color: '#4BC0C0',
    fontWeight: '500',
  },
  historyResolved: {
    fontStyle: 'italic',
  },
  technicianInfo: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '5px',
  },
  rentalDuration: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '5px',
  },
  ratingStars: (rating) => ({
    color: '#FFCE56',
    fontSize: '14px',
  }),
  star: (filled) => ({
    color: filled ? '#FFCE56' : 'rgba(255, 255, 255, 0.2)',
  }),
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: 'rgba(30, 30, 40, 0.5)',
    borderRadius: '8px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '15px',
    color: 'rgba(212, 175, 55, 0.3)',
  },
  analyticsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  anomalyCard: {
    backgroundColor: 'rgba(30, 30, 40, 0.5)',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  analyticsTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 20px 0',
  },
  anomalyContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  anomalyMeter: {
    height: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '5px',
  },
  anomalyMeterFill: (score) => ({
    height: '100%',
    width: `${score * 100}%`,
    background: score > 0.7 ? 'linear-gradient(90deg, #FF6384, #FF8FA3)' : 
               'linear-gradient(90deg, #4BC0C0, #36A2EB)',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
  }),
  anomalyLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  anomalyMessage: (isAnomalous) => ({
    padding: '10px 15px',
    borderRadius: '6px',
    backgroundColor: isAnomalous ? 'rgba(255, 99, 132, 0.2)' : 
                   'rgba(75, 192, 192, 0.2)',
    color: isAnomalous ? '#FF6384' : '#4BC0C0',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
  }),
  statsCard: {
    backgroundColor: 'rgba(30, 30, 40, 0.5)',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '8px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '600',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#fff',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(212, 175, 55, 0.2)',
    borderTopColor: '#D4AF37',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '20px',
  },
  errorCard: {
    backgroundColor: 'rgba(40, 40, 50, 0.9)',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    textAlign: 'center',
    border: '1px solid rgba(255, 99, 132, 0.3)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#FF6384',
    marginBottom: '20px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 15px 0',
    color: '#FF6384',
  },
  errorMessage: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '25px',
  },
};

export default VehicleDetailsPage;
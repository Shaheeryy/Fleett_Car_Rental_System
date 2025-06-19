import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Bar/Bar';
import api from '../api';



const AdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [financialReports, setFinancialReports] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsResponse, financialResponse, activityResponse] = await Promise.all([
          api.get('/admin/dashboard/metrics'),
          api.get('/admin/dashboard/financial'),
          api.get('/admin/dashboard/recent-activity')
        ]);

        setMetrics(metricsResponse.data);
        setFinancialReports(financialResponse.data);
        setRecentActivity(activityResponse.data);
      } catch (err) {
        setError('Error fetching dashboard data');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleNavigation = (path, navItem) => {
    setActiveNav(navItem);
    document.querySelector('.dashboard-content').style.opacity = '0';
    setTimeout(() => navigate(path), 300);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard" style={styles.dashboardContainer}>
      <div className="dashboard-bg" style={styles.background}></div>
      
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        handleNavigation={handleNavigation}
      />

      <div 
        className="dashboard-content" 
        style={{
          ...styles.content,
          marginLeft: sidebarOpen ? '280px' : '80px'
        }}
      >
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          <div style={styles.userInfo}>
            <div style={styles.userText}>
              <span style={styles.userName}>Admin User</span>
              <small style={styles.userRole}>Super Administrator</small>
            </div>
            <div style={styles.userAvatar}>
              <i className="bi bi-person-circle" style={styles.avatarIcon}></i>
            </div>
          </div>
        </header>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{
              ...styles.statIconContainer,
              backgroundColor: 'rgba(75, 192, 192, 0.1)'
            }}>
              <i className="bi bi-car-front" style={{
                ...styles.statIcon,
                color: '#4BC0C0'
              }}></i>
            </div>
            <div style={styles.statText}>
              <h3 style={styles.statTitle}>Total Vehicles</h3>
              <p style={styles.statValue}>
                {metrics ? metrics.totalVehicles : '--'}
              </p>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{
              ...styles.statIconContainer,
              backgroundColor: 'rgba(54, 162, 235, 0.1)'
            }}>
              <i className="bi bi-people" style={{
                ...styles.statIcon,
                color: '#36A2EB'
              }}></i>
            </div>
            <div style={styles.statText}>
              <h3 style={styles.statTitle}>Total Customers</h3>
              <p style={styles.statValue}>
                {metrics ? metrics.totalCustomers : '--'}
              </p>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{
              ...styles.statIconContainer,
              backgroundColor: 'rgba(255, 206, 86, 0.1)'
            }}>
              <i className="bi bi-calendar-check" style={{
                ...styles.statIcon,
                color: '#FFCE56'
              }}></i>
            </div>
            <div style={styles.statText}>
              <h3 style={styles.statTitle}>Active Rentals</h3>
              <p style={styles.statValue}>
                {metrics ? metrics.activeRentals : '--'}
              </p>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{
              ...styles.statIconContainer,
              backgroundColor: 'rgba(255, 99, 132, 0.1)'
            }}>
              <i className="bi bi-tools" style={{
                ...styles.statIcon,
                color: '#FF6384'
              }}></i>
            </div>
            <div style={styles.statText}>
              <h3 style={styles.statTitle}>Under Maintenance</h3>
              <p style={styles.statValue}>
                {metrics ? metrics.vehiclesUnderMaintenance : '--'}
              </p>
            </div>
          </div>
        </div>

        <div style={styles.financialSection}>
          <h2 style={styles.sectionTitle}>
            <i className="bi bi-graph-up" style={styles.sectionIcon}></i>
            Financial Overview
          </h2>
          <div style={styles.financialCards}>
            <div style={styles.financialCard}>
              <div style={styles.financialHeader}>
                <h3 style={styles.financialTitle}>Total Revenue</h3>
                <i className="bi bi-currency-dollar" style={styles.financialCardIcon}></i>
              </div>
              <p style={styles.financialValue}>
                ${financialReports ? financialReports.revenue.toLocaleString() : '--'}
              </p>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill, 
                  width: '100%',
                  background: 'linear-gradient(90deg, #D4AF37, #F1C232)'
                }}></div>
              </div>
            </div>
            
            <div style={styles.financialCard}>
              <div style={styles.financialHeader}>
                <h3 style={styles.financialTitle}>Maintenance Costs</h3>
                <i className="bi bi-wrench" style={styles.financialCardIcon}></i>
              </div>
              <p style={styles.financialValue}>
                ${financialReports ? financialReports.maintenanceCost.toLocaleString() : '--'}
              </p>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill, 
                  width: '26%',
                  background: 'linear-gradient(90deg, #FF6384, #FF8FA3)'
                }}></div>
              </div>
            </div>
            
            <div style={styles.financialCard}>
              <div style={styles.financialHeader}>
                <h3 style={styles.financialTitle}>Net Profit</h3>
                <i className="bi bi-piggy-bank" style={styles.financialCardIcon}></i>
              </div>
              <p style={styles.financialValue}>
                ${financialReports ? financialReports.netProfit.toLocaleString() : '--'}
              </p>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill, 
                  width: '74%',
                  background: 'linear-gradient(90deg, #4BC0C0, #36A2EB)'
                }}></div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.activitySection}>
          <h2 style={styles.sectionTitle}>
            <i className="bi bi-clock-history" style={styles.sectionIcon}></i>
            Recent Activity
          </h2>
          <div style={styles.activityList}>
            {recentActivity.map((activity, index) => {
              const palette = {
                rental: { bg: 'rgba(75, 192, 192, 0.1)', color: '#4BC0C0', icon: 'calendar-check' },
                maintenance: { bg: 'rgba(255, 99, 132, 0.1)', color: '#FF6384', icon: 'tools' },
                customer: { bg: 'rgba(54, 162, 235, 0.1)', color: '#36A2EB', icon: 'person-plus' },
                vehicle: { bg: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', icon: 'car-front' },
              }[activity.type] || { bg: 'rgba(255,255,255,0.05)', color: '#fff', icon: 'info-circle' };

              return (
                <div key={index} style={styles.activityItem}>
                  <div style={{
                    ...styles.activityIcon,
                    backgroundColor: palette.bg,
                    color: palette.color,
                  }}>
                    <i className={`bi bi-${palette.icon}`}></i>
                  </div>
                  <div style={styles.activityText}>
                    <p>{activity.description}</p>
                    <small style={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </small>
                  </div>
                </div>
              );
            })}
        
          </div>
        </div>
      </div>
    </div>
  );
};

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
  backgroundRepeat: 'no-repeat',
  
  zIndex: -1, 
  },
  content: {
    padding: '25px 30px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '35px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
  },
  headerTitle: {
    fontSize: '26px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
    letterSpacing: '0.5px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userRole: {
    fontSize: '12px',
    color: 'rgba(212, 175, 55, 0.8)',
    fontWeight: '500',
  },
  userAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    color: '#D4AF37',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    overflow: 'hidden',
  },
  avatarIcon: {
    fontSize: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '25px',
    marginBottom: '35px',
  },
  statCard: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '22px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(5px)',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 25px rgba(0, 0, 0, 0.3)',
      borderColor: 'rgba(212, 175, 55, 0.2)',
    },
  },
  statIconContainer: {
    width: '55px',
    height: '55px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s',
  },
  statIcon: {
    fontSize: '24px',
  },
  statText: {
    flex: 1,
  },
  statTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '0 0 6px 0',
    letterSpacing: '0.3px',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 4px 0',
    letterSpacing: '0.5px',
  },
  financialSection: {
    marginBottom: '35px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 25px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    letterSpacing: '0.3px',
  },
  sectionIcon: {
    color: '#D4AF37',
    fontSize: '20px',
  },
  financialCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '25px',
  },
  financialCard: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '22px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s',
    ':hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 25px rgba(0, 0, 0, 0.3)',
    },
  },
  financialHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  financialTitle: {
    fontSize: '17px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    letterSpacing: '0.3px',
  },
  financialCardIcon: {
    fontSize: '22px',
    color: 'rgba(212, 175, 55, 0.7)',
  },
  financialValue: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 20px 0',
    letterSpacing: '0.5px',
  },
  progressBar: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 1s ease',
  },
  activitySection: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '25px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(5px)',
  },
  activityList: {
    marginTop: '20px',
  },
  activityItem: {
    display: 'flex',
    gap: '18px',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s',
    ':last-child': {
      borderBottom: 'none',
    },
    ':hover': {
      transform: 'translateX(5px)',
    },
  },
  activityIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  activityText: {
    flex: 1,
    'p': {
      margin: '0 0 4px 0',
      color: 'rgba(255, 255, 255, 0.9)',
    },
  },
  activityTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
};

export default AdminDashboard;
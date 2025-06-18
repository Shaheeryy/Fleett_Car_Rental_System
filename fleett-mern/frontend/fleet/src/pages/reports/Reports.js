import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FiDownload, FiUsers, FiTruck, FiCalendar, FiTool } from "react-icons/fi";
import { FaCar, FaUserTie, FaMoneyBillWave } from "react-icons/fa";
import Sidebar from "../../components/Bar/Bar";
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [monthlyMaintenanceCost, setMonthlyMaintenanceCost] = useState({});
  const [vehicleCategoryDistribution, setVehicleCategoryDistribution] = useState({});
  const [vehicleStatusDistribution, setVehicleStatusDistribution] = useState({});
  const [mostLeastRentedModel, setMostLeastRentedModel] = useState({});
  const [rentalCountPerVehicle, setRentalCountPerVehicle] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          customersResponse,
          vehiclesResponse,
          rentalsResponse,
          maintenanceResponse,
          monthlyRevenueResponse,
          monthlyMaintenanceCostResponse,
          vehicleCategoryResponse,
          vehicleStatusResponse,
          mostLeastRentedModelResponse,
          rentalCountPerVehicleResponse
        ] = await Promise.all([
          axios.get("/api/customers"),
          axios.get("/api/vehicles"),
          axios.get("/api/rentals"),
          axios.get("/api/maintenance"),
          axios.get("/api/reports/monthly-revenue"),
          axios.get("/api/reports/monthly-maintenance-cost"),
          axios.get("/api/reports/vehicle-category-distribution"),
          axios.get("/api/reports/vehicle-status-distribution"),
          axios.get("/api/reports/most-least-rented-model"),
          axios.get("/api/reports/rental-count-per-vehicle")
        ]);

        setCustomers(customersResponse.data);
        setVehicles(vehiclesResponse.data);
        setRentals(rentalsResponse.data);
        setMaintenance(maintenanceResponse.data);

        // ----- Dynamic monthly aggregation -----
        const monthKey = (date) => {
          const d = new Date(date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        };

        const revenueMap = {};
        rentalsResponse.data.forEach((r) => {
          if (r.totalCost && r.totalCost > 0) {
            const key = monthKey(r.returnDate || r.rentalDate || r.updatedAt || r.createdAt);
            revenueMap[key] = (revenueMap[key] || 0) + r.totalCost;
          }
        });

        const maintenanceMap = {};
        maintenanceResponse.data.forEach((m) => {
          if (m.cost && m.cost > 0) {
            const key = monthKey(m.completedDate || m.scheduledDate || m.updatedAt || m.createdAt);
            maintenanceMap[key] = (maintenanceMap[key] || 0) + m.cost;
          }
        });

        setMonthlyRevenue(revenueMap);
        setMonthlyMaintenanceCost(maintenanceMap);
        setVehicleCategoryDistribution(vehicleCategoryResponse.data);
        setVehicleStatusDistribution(vehicleStatusResponse.data);

        // Re-shape the most / least rented model payload coming from the backend so that
        // it matches the keys expected by the UI (mostRentedModel, mostRentedCount, ...).
        const mlData = mostLeastRentedModelResponse.data || {};
        const formattedML = mlData.most ? {
          mostRentedModel: mlData.most?._id || "N/A",
          mostRentedCount: mlData.most?.count || 0,
          leastRentedModel: mlData.least?._id || "N/A",
          leastRentedCount: mlData.least?.count || 0,
        } : {
          mostRentedModel: "N/A",
          mostRentedCount: 0,
          leastRentedModel: "N/A",
          leastRentedCount: 0,
        };
        setMostLeastRentedModel(formattedML);

        setRentalCountPerVehicle(rentalCountPerVehicleResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c._id == customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.vehicleId == vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : "Unknown Vehicle";
  };

  const generateLuxuryPDF = (data, title) => {
    if (data.length === 0) {
      alert(`No data available for ${title}`);
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Add luxury header
    doc.setFillColor(40, 40, 50);
    doc.rect(0, 0, 297, 30, "F");
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(212, 175, 55);
    doc.text(title, 15, 20);

    // Add logo and date
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("LUXURY CAR RENTAL", 200, 15);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 200, 20);

    // Prepare table data with enhanced formatting
    let formattedData = [];
    let columns = [];
    
    if (title === "Customers Report") {
      columns = ["ID", "Name", "Email", "Phone", "Address", "VIP Status"];
      formattedData = data.map(customer => [
        customer._id,
        customer.name,
        customer.email,
        customer.phoneNumber,
        customer.address,
        customer.hasRented ? "Premium" : "Standard"
      ]);
    } else if (title === "Vehicles Report") {
      columns = ["ID", "Make & Model", "Year", "Category", "Status", "Daily Rate", "# Rentals"];
      formattedData = data.map(vehicle => [
        vehicle.vehicleId,
        `${vehicle.make} ${vehicle.model}`,
        vehicle.year,
        vehicle.category == "benzina" ? "Petrol" : vehicle.category ,
        vehicle.status,
        `$${vehicle.pricePerDay.toFixed(2)}`,
        rentalCountPerVehicle[vehicle.vehicleId] || 0
      ]);
    } else if (title === "Rentals Report") {
      columns = ["ID", "Customer", "Vehicle", "Start Date", "End Date", "Status", "Revenue"];
      formattedData = data.map((rental) => {
        const customerName = rental.customer
          ? getCustomerName(rental.customer._id || rental.customer)
          : "Unknown";
        const vehicleName = rental.vehicle
          ? getVehicleName(rental.vehicle.vehicleId || rental.vehicle._id || rental.vehicle)
          : "Unknown";

        return [
          rental.rentalId || rental._id,
          customerName,
          vehicleName,
          rental.rentalDate ? new Date(rental.rentalDate).toLocaleDateString() : "-",
          rental.returnDate ? new Date(rental.returnDate).toLocaleDateString() : "Ongoing",
          rental.status || "-",
          `$${(rental.totalCost || 0).toFixed(2)}`,
        ];
      });
    } else if (title === "Maintenance Report") {
      columns = ["ID", "Vehicle", "Description", "Status", "Scheduled", "Completed", "Cost"];
      formattedData = data.map((m) => {
        const vehicleName = m.vehicle
          ? getVehicleName(m.vehicle.vehicleId || m.vehicle._id || m.vehicle)
          : "Unknown";
        return [
          m._id,
          vehicleName,
          m.description || "-",
          m.status || "-",
          m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : "-",
          m.completedDate ? new Date(m.completedDate).toLocaleDateString() : "Pending",
          `$${(m.cost || 0).toFixed(2)}`,
        ];
      });
    }

    // Luxury table styling
    doc.autoTable({
      head: [columns],
      body: formattedData,
      startY: 35,
      theme: "grid",
      headStyles: {
        fillColor: [15, 15, 25],
        textColor: [212, 175, 55],
        fontStyle: "bold",
        halign: "center"
      },
      bodyStyles: {
        textColor: [40, 40, 40],
        cellPadding: 5,
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 35 },
      styles: {
        overflow: "linebreak",
        columnWidth: "wrap"
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { cellWidth: 35 },
        6: { cellWidth: 30 }
      }
    });

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Confidential - Luxury Car Rental Management System", 15, 200);

    // Save the PDF
    doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}_${new Date().getTime()}.pdf`);
  };

  const calculateRevenue = () => {
    return rentals.reduce((total, rental) => total + (rental.totalCost || 0), 0).toFixed(2);
  };

  const getAvailableVehiclesCount = () => {
    return vehicles.filter(v => v.status === "Available").length;
  };

  const getActiveRentalsCount = () => {
    return rentals.filter(r => r.status === "Active").length;
  };

  const getPendingMaintenanceCount = () => {
    return maintenance.filter(m => m.status === "under maintenance").length;
  };

  // Dynamically build chart data only for months that actually have entries
  const buildTimeSeriesData = (obj, label, lineColor, fillColor) => {
    const sortedKeys = Object.keys(obj).sort((a, b) => new Date(a + '-01') - new Date(b + '-01'));
    const labels = sortedKeys.map((k) => {
      const [year, monthNum] = k.split('-');
      return new Date(year, monthNum - 1).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
    });
    const values = sortedKeys.map((k) => obj[k]);

    return {
      labels,
      datasets: [
        {
          label,
          data: values,
          borderColor: lineColor,
          backgroundColor: fillColor,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const revenueChartData = buildTimeSeriesData(
    monthlyRevenue,
    'Monthly Revenue',
    '#D4AF37',
    'rgba(212, 175, 55, 0.1)',
  );

  const maintenanceCostChartData = buildTimeSeriesData(
    monthlyMaintenanceCost,
    'Monthly Maintenance Cost',
    '#FF6384',
    'rgba(255, 99, 132, 0.1)',
  );

  const vehicleCategoryChartData = {
    labels: Object.keys(vehicleCategoryDistribution),
    datasets: [
      {
        data: Object.values(vehicleCategoryDistribution),
        backgroundColor: [
          '#D4AF37',
          '#4BC0C0',
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
        ],
      },
    ],
  };

  const vehicleStatusChartData = {
    labels: Object.keys(vehicleStatusDistribution).map(e => e.charAt(0)),
    datasets: [
      {
        data: Object.values(vehicleStatusDistribution),
        backgroundColor: [
          '#4BC04B', // Available
          '#FF6384', // Under Maintenance
          '#36A2EB', // Rented
          '#FFCE56', // Other
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
        },
      },
    },
  };

  if (loading) {
    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.background}></div>
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          activeNav="reports"
        />
        <div style={{...styles.content, marginLeft: sidebarOpen ? '280px' : '80px'}}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Preparing luxury reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.background}></div>
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          activeNav="reports"
        />
        <div style={{...styles.content, marginLeft: sidebarOpen ? '280px' : '80px'}}>
          <div style={styles.errorContainer}>
            <i className="bi bi-exclamation-triangle" style={styles.errorIcon}></i>
            <h3 style={styles.errorTitle}>Report Error</h3>
            <p style={styles.errorMessage}>{error}</p>
            <button 
              style={styles.errorButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.background}></div>
      
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeNav="reports"
      />

      <div style={{
        ...styles.content,
        marginLeft: sidebarOpen ? '280px' : '80px'
      }}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            <i className="bi bi-graph-up me-2"></i>
            Executive Reports Dashboard
          </h1>
        </header>

        <div style={styles.tabContainer}>
          <button 
            style={activeTab === "summary" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("summary")}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Summary
          </button>
          <button 
            style={activeTab === "reports" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("reports")}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Detailed Reports
          </button>
        </div>

        {activeTab === "summary" ? (
          <>
            <div style={styles.summaryContainer}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryIconContainer}>
                  <FiUsers style={styles.summaryIcon} />
                </div>
                <div style={styles.summaryContent}>
                  <h3 style={styles.summaryTitle}>Customers</h3>
                  <p style={styles.summaryValue}>{customers.length}</p>
                  <p style={styles.summarySubtext}>Total Clients</p>
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryIconContainer}>
                  <FaCar style={styles.summaryIcon} />
                </div>
                <div style={styles.summaryContent}>
                  <h3 style={styles.summaryTitle}>Fleet</h3>
                  <p style={styles.summaryValue}>{vehicles.length}</p>
                  <p style={styles.summarySubtext}>{getAvailableVehiclesCount()} Available</p>
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryIconContainer}>
                  <FiCalendar style={styles.summaryIcon} />
                </div>
                <div style={styles.summaryContent}>
                  <h3 style={styles.summaryTitle}>Rentals</h3>
                  <p style={styles.summaryValue}>{rentals.length}</p>
                  <p style={styles.summarySubtext}>{getActiveRentalsCount()} Active</p>
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryIconContainer}>
                  <FiTool style={styles.summaryIcon} />
                </div>
                <div style={styles.summaryContent}>
                  <h3 style={styles.summaryTitle}>Maintenance</h3>
                  <p style={styles.summaryValue}>{maintenance.length}</p>
                  <p style={styles.summarySubtext}>{getPendingMaintenanceCount()} Pending</p>
                </div>
              </div>

              <div style={styles.revenueCard}>
                <div style={styles.summaryIconContainer}>
                  <FaMoneyBillWave style={styles.revenueIcon} />
                </div>
                <div style={styles.summaryContent}>
                  <h3 style={styles.summaryTitle}>Total Revenue</h3>
                  <p style={styles.revenueValue}>${calculateRevenue()}</p>
                  <p style={styles.summarySubtext}>All-time earnings</p>
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryIconContainer}>
                  <FaCar style={styles.summaryIcon} />
                </div>
                <div style={styles.summaryContent}>
                  <h3 style={styles.summaryTitle}>Most Rented Model</h3>
                  <p style={styles.summaryValue}>{mostLeastRentedModel.mostRentedModel || '-'}</p>
                  <p style={styles.summarySubtext}>Rented {mostLeastRentedModel.mostRentedCount || 0} times</p>
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryIconContainer}>
                  <FaCar style={styles.summaryIcon} />
                </div>
                <div style={styles.summaryContent}>
                  <h3 style={styles.summaryTitle}>Least Rented Model</h3>
                  <p style={styles.summaryValue}>{mostLeastRentedModel.leastRentedModel || '-'}</p>
                  <p style={styles.summarySubtext}>Rented {mostLeastRentedModel.leastRentedCount || 0} times</p>
                </div>
              </div>
            </div>

            <div style={styles.chartsContainer}>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Monthly Revenue</h3>
                <Line data={revenueChartData} options={chartOptions} />
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Monthly Maintenance Cost</h3>
                <Line data={maintenanceCostChartData} options={chartOptions} />
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Vehicle Category Distribution</h3>
                <Pie data={vehicleCategoryChartData} options={pieChartOptions} />
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Vehicle Status Distribution</h3>
                <Pie data={vehicleStatusChartData} options={pieChartOptions} />
              </div>
            </div>
          </>
        ) : (
          <div style={styles.reportsContainer}>
            <div style={styles.reportCard}>
              <div style={styles.reportHeader}>
                <FiUsers style={styles.reportIcon} />
                <h3 style={styles.reportTitle}>Clients Report</h3>
              </div>
              <div style={styles.reportBody}>
                <p style={styles.reportDescription}>
                  Detailed information about all registered clients including contact details and rental history.
                </p>
                <button 
                  style={styles.reportButton}
                  onClick={() => generateLuxuryPDF(customers, "Customers Report")}
                >
                  <FiDownload style={styles.buttonIcon} />
                  Download Report
                </button>
              </div>
            </div>

            <div style={styles.reportCard}>
              <div style={styles.reportHeader}>
                <FaCar style={styles.reportIcon} />
                <h3 style={styles.reportTitle}>Fleet Report</h3>
              </div>
              <div style={styles.reportBody}>
                <p style={styles.reportDescription}>
                  Complete overview of luxury vehicles including specifications, status, and availability.
                </p>
                <button 
                  style={styles.reportButton}
                  onClick={() => generateLuxuryPDF(vehicles, "Vehicles Report")}
                >
                  <FiDownload style={styles.buttonIcon} />
                  Download Report
                </button>
              </div>
            </div>

            <div style={styles.reportCard}>
              <div style={styles.reportHeader}>
                <FiCalendar style={styles.reportIcon} />
                <h3 style={styles.reportTitle}>Rentals Report</h3>
              </div>
              <div style={styles.reportBody}>
                <p style={styles.reportDescription}>
                  Comprehensive rental transactions with client details, vehicle information, and financials.
                </p>
                <button 
                  style={styles.reportButton}
                  onClick={() => generateLuxuryPDF(rentals, "Rentals Report")}
                >
                  <FiDownload style={styles.buttonIcon} />
                  Download Report
                </button>
              </div>
            </div>

            <div style={styles.reportCard}>
              <div style={styles.reportHeader}>
                <FiTool style={styles.reportIcon} />
                <h3 style={styles.reportTitle}>Maintenance Report</h3>
              </div>
              <div style={styles.reportBody}>
                <p style={styles.reportDescription}>
                  Detailed service records including issues, costs, and vehicle maintenance history.
                </p>
                <button 
                  style={styles.reportButton}
                  onClick={() => generateLuxuryPDF(maintenance, "Maintenance Report")}
                >
                  <FiDownload style={styles.buttonIcon} />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}
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
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '10px',
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  activeTab: {
    padding: '10px 20px',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    border: 'none',
    color: '#D4AF37',
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  summaryContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  summaryCard: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    },
  },
  revenueCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    },
  },
  summaryIconContainer: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: {
    fontSize: '24px',
    color: '#D4AF37',
  },
  revenueIcon: {
    fontSize: '24px',
    color: '#4BC04B',
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    margin: '0 0 5px 0',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: '24px',
    color: '#fff',
    margin: '0 0 5px 0',
    fontWeight: '600',
  },
  revenueValue: {
    fontSize: '24px',
    color: '#4BC04B',
    margin: '0 0 5px 0',
    fontWeight: '600',
  },
  summarySubtext: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  reportsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  reportCard: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(5px)',
    overflow: 'hidden',
    transition: 'all 0.3s',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    },
  },
  reportHeader: {
    padding: '20px',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  reportIcon: {
    fontSize: '24px',
    color: '#D4AF37',
  },
  reportTitle: {
    fontSize: '18px',
    color: '#fff',
    margin: 0,
    fontWeight: '600',
  },
  reportBody: {
    padding: '20px',
  },
  reportDescription: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },
  reportButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '6px',
    color: '#D4AF37',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(212, 175, 55, 0.3)',
    },
  },
  buttonIcon: {
    fontSize: '16px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 200px)',
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
  errorContainer: {
    backgroundColor: 'rgba(255, 99, 132, 0.1)',
    border: '1px solid rgba(255, 99, 132, 0.3)',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '50px auto',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#FF6384',
    marginBottom: '20px',
  },
  errorTitle: {
    color: '#FF6384',
    margin: '0 0 10px 0',
  },
  errorMessage: {
    color: 'rgba(255,255,255,0.7)',
    margin: '0 0 20px 0',
  },
  errorButton: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    border: '1px solid rgba(255, 99, 132, 0.3)',
    borderRadius: '6px',
    color: '#FF6384',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 99, 132, 0.3)',
    },
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginTop: '30px',
  },
  chartCard: {
    backgroundColor: 'rgba(40, 40, 50, 0.7)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(5px)',
  },
  chartTitle: {
    fontSize: '18px',
    color: '#fff',
    margin: '0 0 20px 0',
    fontWeight: '600',
  },
};

export default Reports;
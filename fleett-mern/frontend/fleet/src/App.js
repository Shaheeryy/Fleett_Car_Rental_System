import React from 'react';    
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import FleetManagerDashboard from './pages/FleetManagerDashboard';
import VehicleListPage from './pages/vehicle/VehicleListPage';
import EditVehicle from './pages/vehicle/EditVehicle';
import VehicleDetailsPage from './pages/vehicle/VehicleDetailsPage';
import AddVehiclePage from './pages/vehicle/AddVehiclePage';
import CustomerListPage from './pages/customer/CustomerListPage';
import EditCustomerPage from './pages/customer/EditCustomer';
import Reports from './pages/reports/Reports';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'



import CustomerDetailsPage from './pages/customer/CustomerDetailsPage';
import AddCustomerPage from './pages/customer/AddCustomerPage';
import ActiveRentalsPage from './pages/transactions/ActiveRentalsPage';
import NewRentalPage from './pages/transactions/AddRentalPage';
import RentalHistoryPage from './pages/transactions/RentalHistoryPage';
import MaintenanceListPage from './pages/maintenance/MaintenanceListPage';
import ScheduleMaintenancePage from './pages/maintenance/ScheduleMaintenancePage';
import MaintenanceHistoryPage from './pages/maintenance/MaintenanceHistoryPage';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/fleet/dashboard" element={<FleetManagerDashboard />} />
        <Route path="/vehicle-management" element={<VehicleListPage />} />
        <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
        <Route path="/add-vehicle" element={<AddVehiclePage />} />
        <Route path="/customer-management" element={<CustomerListPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customer/:id" element={<CustomerDetailsPage />} />
        <Route path="/add-customer" element={<AddCustomerPage />} />
        <Route path="/edit-customer/:id" element={<EditCustomerPage />} />
        <Route path="/active-rentals" element={<ActiveRentalsPage />} />
        <Route path="/rent-vehicle" element={<NewRentalPage />} />
        <Route path="/rental-history" element={<RentalHistoryPage />} />
        <Route path="/maintenance-list" element={<MaintenanceListPage />} />
        <Route path="/schedule-maintenance" element={<ScheduleMaintenancePage />} />
        <Route path="/maintenance-history" element={<MaintenanceHistoryPage />} />
        <Route path="/edit-vehicle/:vehicleId" element={<EditVehicle />} />
        <Route path="/reports" element={<Reports />} />



      </Routes>
    </Router>
  );
}

export default App;

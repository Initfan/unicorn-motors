import { Routes, Route } from "react-router-dom";
import Marketplace from "./pages/Marketplace";
import CarDetailPage from "./pages/CarDetailPage";
import BookingPage from "./pages/BookingPage";
import SellPage from "./pages/SellPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPaymentPage from "./pages/DashboardPaymentPage";
import DashboardBookingsPage from "./pages/DashboardBookingsPage";
import ScrollToTop from "./components/ScrollToTop";
import AdminTransactionsPage from "./pages/AdminTransactionsPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import AdminDeliveryPage from "./pages/AdminDeliveryPage";
import AdminAcquisitionsPage from "./pages/AdminAcquisitionsPage";
import AdminRBACPage from "./pages/AdminRBACPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SellRequestsPage from "./pages/SellRequestsPage";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Marketplace />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/car/:id" element={<CarDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Buyer Routes */}
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <DashboardBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/payment/:id"
          element={
            <ProtectedRoute allowedRoles={["buyer", "admin"]}>
              <DashboardPaymentPage />
            </ProtectedRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path="/sell"
          element={
            <ProtectedRoute allowedRoles={["buyer", "admin"]}>
              <SellPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell/requests"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <SellRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Console - Restricted to Admin & Specific Roles */}
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminInventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/delivery"
          element={
            <ProtectedRoute allowedRoles={["admin", "delivery"]}>
              <AdminDeliveryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/acquisitions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAcquisitionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRBACPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

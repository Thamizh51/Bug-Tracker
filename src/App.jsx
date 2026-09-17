import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/DeveloperDashboard";
import TesterDashboard from "./components/TesterDashboard";

// ==========================================
// GET AUTH DATA
// ==========================================

function getAuthData() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const loggedIn =
    localStorage.getItem("loggedIn") ||
    sessionStorage.getItem("loggedIn");

  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role");

  return {
    token,
    loggedIn,
    role,
  };
}

// ==========================================
// CHECK AUTHENTICATION
// ==========================================

function isAuthenticated() {
  const {
    token,
    loggedIn,
  } = getAuthData();

  return Boolean(token) || loggedIn === "true";
}

// ==========================================
// ADMIN ROUTE
// ==========================================

function AdminRoute({ children }) {
  const {
    role,
  } = getAuthData();

  // Not logged in
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // Wrong role
  if (role !== "admin") {

    if (role === "tester") {
      return (
        <Navigate
          to="/tester-dashboard"
          replace
        />
      );
    }

    if (role === "developer") {
      return (
        <Navigate
          to="/user-dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

// ==========================================
// DEVELOPER / USER ROUTE
// ==========================================

function UserRoute({ children }) {
  const {
    role,
  } = getAuthData();

  // Not logged in
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // Wrong role
  if (role !== "developer") {

    if (role === "admin") {
      return (
        <Navigate
          to="/admin-dashboard"
          replace
        />
      );
    }

    if (role === "tester") {
      return (
        <Navigate
          to="/tester-dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

// ==========================================
// TESTER ROUTE
// ==========================================

function TesterRoute({ children }) {
  const {
    role,
  } = getAuthData();

  // Not logged in
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // Wrong role
  if (role !== "tester") {

    if (role === "admin") {
      return (
        <Navigate
          to="/admin-dashboard"
          replace
        />
      );
    }

    if (role === "developer") {
      return (
        <Navigate
          to="/user-dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

// ==========================================
// APP
// ==========================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================
            LOGIN
        ================================== */}

        <Route
          path="/"
          element={
            <Login />
          }
        />


        {/* ==================================
            ADMIN DASHBOARD
        ================================== */}

        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />


        {/* ==================================
            DEVELOPER DASHBOARD
        ================================== */}

        <Route
          path="/user-dashboard"
          element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          }
        />


        {/* ==================================
            TESTER DASHBOARD
        ================================== */}

        <Route
          path="/tester-dashboard"
          element={
            <TesterRoute>
              <TesterDashboard />
            </TesterRoute>
          }
        />


        {/* ==================================
            UNKNOWN ROUTE
        ================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;

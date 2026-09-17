import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setUsernameError("");
    setPasswordError("");
    setLoginMessage("");

    // =========================
    // VALIDATION
    // =========================

    if (!username.trim()) {
      setUsernameError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // =========================
      // API LOGIN REQUEST
      // =========================

      const response = await fetch(
        "https://glorified-paltry-upbeat.ngrok-free.dev/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: username,
            password: password,
          }),
        }
      );

      // =========================
      // API ERROR
      // =========================

      if (!response.ok) {
        let errorMessage = "Login failed.";

        try {
          const errorData = await response.json();

          if (errorData.message) {
            errorMessage = errorData.message;
          }

          if (errorData.detail) {
            if (typeof errorData.detail === "string") {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail
                .map((item) => item.msg || "Validation error")
                .join(", ");
            }
          }
        } catch {
          errorMessage = "Login failed.";
        }

        throw new Error(
          `${errorMessage} (HTTP ${response.status})`
        );
      }

      // =========================
      // API RESPONSE
      // =========================

      const data = await response.json();

      // =========================
      // GET TOKEN
      // =========================

      const authToken =
        data?.token ||
        data?.access_token ||
        data?.accessToken ||
        data?.data?.token ||
        data?.data?.access_token;

      if (!authToken) {
        throw new Error(
          "Authentication token was not returned by the API."
        );
      }

      // =========================
      // GET USER
      // =========================

      const user = data?.user;

      if (!user) {
        throw new Error(
          "User details were not returned by the API."
        );
      }

      const userId = user?.id;
      const userName = user?.name;
      const userEmail = user?.email;

      const userRole = String(user?.role || "").toLowerCase();

      // =========================
      // CHECK ROLE
      // =========================

      if (
        userRole !== "admin" &&
        userRole !== "developer" &&
        userRole !== "tester"
      ) {
        throw new Error(
          "Invalid user role returned by the API."
        );
      }

      if (!userName) {
        throw new Error(
          "User name was not returned by the API."
        );
      }

      // =========================
      // USER DATA
      // =========================

      const userData = {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
      };

      // =========================
      // CLEAR OLD LOGIN
      // =========================

      localStorage.clear();
      sessionStorage.clear();

      // =========================
      // SAVE LOGIN DETAILS
      // =========================

      if (remember) {
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", userRole);
        localStorage.setItem("loggedIn", "true");
      } else {
        sessionStorage.setItem("token", authToken);
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("role", userRole);
        sessionStorage.setItem("loggedIn", "true");
      }

      // =========================
      // SUCCESS
      // =========================

      setLoginMessage("Login successful! Redirecting...");

      // =========================
      // ROLE BASED ROUTING
      // =========================

      if (userRole === "admin") {
        navigate("/admin-dashboard", {
          replace: true,
        });
      } else if (userRole === "tester") {
        navigate("/tester-dashboard", {
          replace: true,
        });
      } else if (userRole === "developer") {
        navigate("/user-dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      setLoginMessage(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* ==============================
          LEFT BRANDING SECTION
      ============================== */}

      <section className="login-left">

        <div className="left-content">

          {/* Brand */}
          <div className="brand">
            <div className="brand-icon">
              <span>🐞</span>
            </div>

            <span className="brand-name">
              Bug<span>Tracker</span>
            </span>
          </div>

          {/* Main heading */}
          <div className="hero-content">

            <div className="eyebrow">
              <span className="status-dot"></span>
              SMART BUG MANAGEMENT
            </div>

            <h1>
              Find bugs.
              <br />
              <span>Fix faster.</span>
            </h1>

            <p>
              A powerful workspace for development teams
              to track, manage and resolve issues from
              one centralized platform.
            </p>

          </div>

          {/* Features */}
          <div className="feature-list">

            <div className="feature-item">
              <div className="feature-icon">✓</div>

              <div>
                <strong>Easy Bug Management</strong>
                <span>
                  Organize and track every issue effortlessly
                </span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">✓</div>

              <div>
                <strong>Team Collaboration</strong>
                <span>
                  Keep developers and testers connected
                </span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">✓</div>

              <div>
                <strong>Real-time Tracking</strong>
                <span>
                  Monitor bug progress and status instantly
                </span>
              </div>
            </div>

          </div>

          {/* Bottom text */}
          <div className="left-footer">
            <span>© 2026 Bug Tracker</span>
            <span>•</span>
            <span>Built for development teams</span>
          </div>

        </div>

      </section>


      {/* ==============================
          RIGHT LOGIN SECTION
      ============================== */}

      <section className="login-right">

        <div className="login-box">

          {/* Mobile logo */}
          <div className="mobile-brand">
            <div className="brand-icon">
              🐞
            </div>

            <span>
              Bug<span>Tracker</span>
            </span>
          </div>

          {/* Header */}
          <div className="login-header">

            <div className="welcome-badge">
              <span>👋</span>
              Welcome back
            </div>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your credentials to access your dashboard.
            </p>

          </div>


          {/* Form */}
          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="input-group">

              <label htmlFor="username">
                Email address
              </label>

              <div
                className={`input-wrapper ${
                  usernameError ? "input-error" : ""
                }`}
              >

                <span className="input-icon">
                  ✉
                </span>

                <input
                  type="email"
                  id="username"
                  placeholder="you@example.com"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  autoComplete="username"
                />

              </div>

              {usernameError && (
                <span className="error">
                  <span>!</span>
                  {usernameError}
                </span>
              )}

            </div>


            {/* PASSWORD */}
            <div className="input-group">

              <div className="password-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() => {
                    setLoginMessage(
                      "Password reset is not configured yet."
                    );
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div
                className={`input-wrapper ${
                  passwordError ? "input-error" : ""
                }`}
              >

                <span className="input-icon">
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

              {passwordError && (
                <span className="error">
                  <span>!</span>
                  {passwordError}
                </span>
              )}

            </div>


            {/* OPTIONS */}
            <div className="options">

              <label className="remember-label">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                />

                <span className="custom-checkbox"></span>

                <span>
                  Remember me
                </span>

              </label>

            </div>


            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className={`login-btn ${
                loading ? "loading" : ""
              }`}
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}

            </button>


            {/* MESSAGE */}
            {loginMessage && (
              <div
                className={
                  loginMessage.startsWith(
                    "Login successful"
                  )
                    ? "success-message"
                    : "login-message"
                }
              >
                <span>
                  {loginMessage.startsWith(
                    "Login successful"
                  )
                    ? "✓"
                    : "!"}
                </span>

                {loginMessage}
              </div>
            )}

          </form>


          {/* DIVIDER */}
          <div className="divider">
            <span></span>
            <p>Secure access</p>
            <span></span>
          </div>


          {/* SECURITY */}
          <div className="security-note">
            <span className="shield-icon">
              🛡
            </span>

            <div>
              <strong>Your data is secure</strong>
              <p>
                Protected authentication for your
                development workspace.
              </p>
            </div>
          </div>


          {/* SIGN UP */}
          <p className="signup">
            Don't have an account?
            <button
              type="button"
              onClick={() => {
                setLoginMessage(
                  "Account creation is not configured yet."
                );
              }}
            >
              Create account
            </button>
          </p>

        </div>

      </section>

    </div>
  );
}

export default Login;
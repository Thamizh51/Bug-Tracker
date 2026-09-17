
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./DeveloperDashboard.css";
import { getBugImageUrl } from "../utils/bugMedia";
import BugImage from "./BugImage";

function DeveloperDashboard() {
  const navigate = useNavigate();

  // ==========================================
  // API URL
  // ==========================================

  const apiurl =
    import.meta.env.VITE_API_URL ||
    "https://glorified-paltry-upbeat.ngrok-free.dev";

  // ==========================================
  // PREVENT DUPLICATE REQUEST
  // ==========================================

  const apiCalled = useRef(false);

  // ==========================================
  // GET LOGGED-IN USER DETAILS
  // ==========================================

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  let user = {};

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : {};
  } catch {
    user = {};
  }

  const userName =
    user?.name || "Developer";

  const userRole =
    user?.role || "developer";

  const userInitial =
    userName.charAt(0).toUpperCase();

  // ==========================================
  // ASSIGNED BUG STATES
  // ==========================================

  const [bugs, setBugs] = useState([]);

  const [totalBugs, setTotalBugs] =
    useState(0);

  const [loadingBugs, setLoadingBugs] =
    useState(true);

  const [bugError, setBugError] =
    useState("");

  // ==========================================
  // PAGE / PROJECT STATES
  // ==========================================

  const [activePage, setActivePage] =
    useState("dashboard");

  const [projects, setProjects] =
    useState([]);

  const [loadingProjects, setLoadingProjects] =
    useState(false);

  const [projectError, setProjectError] =
    useState("");

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [projectBugs, setProjectBugs] =
    useState([]);

  const [loadingProjectBugs, setLoadingProjectBugs] =
    useState(false);

  const [projectBugError, setProjectBugError] =
    useState("");

  const [projectBugFilter, setProjectBugFilter] =
    useState("all");

  const [projectDepartmentFilter, setProjectDepartmentFilter] =
    useState("all");

  const [bugSearch, setBugSearch] =
    useState("");

  const [bugStatusFilter, setBugStatusFilter] =
    useState("all");

  const [projectBugSearch, setProjectBugSearch] =
    useState("");

  // ==========================================
  // SINGLE BUG STATES
  // ==========================================

  const [selectedBug, setSelectedBug] =
    useState(null);

  const [loadingSingleBug, setLoadingSingleBug] =
    useState(false);

  const [singleBugError, setSingleBugError] =
    useState("");

  // ==========================================
  // STATUS UPDATE STATES
  // ==========================================

  const [editStatus, setEditStatus] =
    useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusUpdateMessage, setStatusUpdateMessage] =
    useState("");

  // ==========================================
  // GET ASSIGNED BUGS
  // ONLY ONE REQUEST
  // ==========================================

  useEffect(() => {

    if (apiCalled.current) {
      return;
    }

    apiCalled.current = true;

    const getAssignedBugs = async () => {

      try {

        setLoadingBugs(true);
        setBugError("");

        // ======================================
        // GET TOKEN
        // ======================================

        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Login token not found. Please login again."
          );
        }

        // ======================================
        // API REQUEST
        // ======================================

        const response = await fetch(
          `${apiurl}/api/developer/assigned-bugs`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",
              Authorization:
                `Bearer ${token}`,
              "ngrok-skip-browser-warning":
                "true",
            },
          }
        );

        // ======================================
        // RESPONSE TEXT
        // ======================================

        const responseText =
          await response.text();

        // ======================================
        // CHECK RESPONSE
        // ======================================

        if (!response.ok) {
          throw new Error(
            `API Error ${response.status}: ${
              responseText ||
              response.statusText
            }`
          );
        }

        // ======================================
        // JSON
        // ======================================

        let data;

        try {

          data =
            JSON.parse(responseText);

        } catch {

          throw new Error(
            "API did not return valid JSON."
          );

        }

        // ======================================
        // SAVE BUGS
        // ======================================

        setTotalBugs(
          data?.total_bugs || 0
        );

        setBugs(
          Array.isArray(data?.bugs)
            ? data.bugs
            : []
        );

      } catch (error) {

        setBugError(
          error?.message ||
          "Unable to fetch assigned bugs."
        );

        setBugs([]);
        setTotalBugs(0);

      } finally {

        setLoadingBugs(false);

      }

    };

    getAssignedBugs();

  }, [apiurl]);

  // ==========================================
  // GET PROJECTS
  // GET /api/projects
  // ==========================================

  const getProjects = async () => {
    try {
      setLoadingProjects(true);
      setProjectError("");

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      const response = await fetch(
        `${apiurl}/api/projects`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `API Error ${response.status}: ${
            responseText || response.statusText
          }`
        );
      }

      let data;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          "Projects API did not return valid JSON."
        );
      }

      // Supports common API response formats:
      // { projects: [] }, { data: [] }, or []
      const projectList =
        Array.isArray(data?.projects)
          ? data.projects
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

      setProjects(projectList);
    } catch (error) {
      setProjectError(
        error?.message ||
          "Unable to fetch projects."
      );
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // ==========================================
  // GET BUGS FOR PARTICULAR PROJECT
  // GET /api/projects/{id}/bugs
  // ==========================================

  const getProjectBugs = async (
    project,
    departmentOverride = null
  ) => {
    try {
      const projectId =
        project?.id ??
        project?.project_id;

      if (!projectId) {
        throw new Error("Project ID not found.");
      }

      setSelectedProject(project);

      if (departmentOverride === null) {
        setProjectDepartmentFilter("all");
      }

      setLoadingProjectBugs(true);
      setProjectBugError("");

      const department =
        departmentOverride !== null
          ? departmentOverride
          : projectDepartmentFilter;

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      // Backend department filtering:
      // /api/projects/{projectId}/bugs?department=Frontend
      // /api/projects/{projectId}/bugs?department=Backend
      // No department parameter = all departments.
      const queryParams = new URLSearchParams();

      if (
        department &&
        department !== "all"
      ) {
        queryParams.set(
          "department",
          department
        );
      }

      const queryString =
        queryParams.toString();

      const projectBugsUrl =
        `${apiurl}/api/projects/${projectId}/bugs` +
        (queryString
          ? `?${queryString}`
          : "");

      const response = await fetch(
        projectBugsUrl,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `API Error ${response.status}: ${
            responseText || response.statusText
          }`
        );
      }

      let data;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          "Project bugs API did not return valid JSON."
        );
      }

      const bugList =
        Array.isArray(data?.bugs)
          ? data.bugs
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

      setProjectBugs(bugList);
    } catch (error) {
      setProjectBugError(
        error?.message ||
          "Unable to fetch project bugs."
      );
      setProjectBugs([]);
    } finally {
      setLoadingProjectBugs(false);
    }
  };

  // ==========================================
  // BACK TO PROJECT LIST
  // ==========================================

  const backToProjects = () => {
    setSelectedProject(null);
    setProjectBugs([]);
    setProjectBugError("");
    setProjectBugFilter("all");
  };

  // ==========================================
  // PROJECT BUG FILTER
  // ==========================================

  // ==========================================
  // PROJECT BUG DEPARTMENT OPTIONS
  // ==========================================

  const projectDepartmentOptions = [
    "Frontend",
    "Backend",
  ];

  const filteredProjectBugs = projectBugs.filter((bug) => {
    const status = String(bug?.status || "")
      .toLowerCase()
      .replace("-", "_")
      .replace(" ", "_");
    const search = projectBugSearch.trim().toLowerCase();
    const searchableText = [
      bug?.id,
      bug?.title,
      bug?.description,
      bug?.assigned_to,
      bug?.assigned_team,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (projectBugFilter === "all" || status === projectBugFilter) &&
      (!search || searchableText.includes(search))
    );
  });

  const filteredAssignedBugs = bugs.filter((bug) => {
    const status = String(bug?.status || "")
      .toLowerCase()
      .replace("-", "_")
      .replace(" ", "_");
    const search = bugSearch.trim().toLowerCase();
    const searchableText = [
      bug?.id,
      bug?.title,
      bug?.project?.name,
      bug?.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (bugStatusFilter === "all" || status === bugStatusFilter) &&
      (!search || searchableText.includes(search))
    );
  });

  // ==========================================
  // PROJECT BUG STATS
  // ==========================================

  const projectAssignedBugs =
    projectBugs.filter((bug) => {
      const assigned =
        bug?.assigned_to ??
        bug?.assignedTo ??
        bug?.assigned_user ??
        bug?.assignee;

      return Boolean(
        assigned ||
        bug?.is_assigned ||
        bug?.assigned === true
      );
    }).length;

  const projectPendingBugs =
    projectBugs.filter(
      (bug) =>
        String(bug?.status || "")
          .toLowerCase()
          .replace("-", "_")
          .replace(" ", "_") === "pending"
    ).length;

  const projectInProgressBugs =
    projectBugs.filter(
      (bug) =>
        String(bug?.status || "")
          .toLowerCase()
          .replace("-", "_")
          .replace(" ", "_") ===
        "in_progress"
    ).length;

  const projectResolvedBugs =
    projectBugs.filter(
      (bug) =>
        String(bug?.status || "")
          .toLowerCase() === "resolved"
    ).length;

  const projectOpenBugs =
    projectBugs.filter(
      (bug) =>
        String(bug?.status || "")
          .toLowerCase() === "open"
    ).length;

  // ==========================================
  // GET SINGLE BUG
  // ==========================================

  const singlebug = async (id) => {

    try {

      setLoadingSingleBug(true);
      setSingleBugError("");
      setStatusUpdateMessage("");
      setSelectedBug(null);

      // ======================================
      // GET TOKEN
      // ======================================

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      // ======================================
      // SINGLE BUG API
      // ======================================

      const response = await fetch(
        `${apiurl}/api/bugs/${id}`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization:
              `Bearer ${token}`,
            "ngrok-skip-browser-warning":
              "true",
          },
        }
      );

      // ======================================
      // RESPONSE
      // ======================================

      const responseText =
        await response.text();

      // ======================================
      // CHECK RESPONSE
      // ======================================

      if (!response.ok) {
        throw new Error(
          `API Error ${response.status}: ${
            responseText ||
            response.statusText
          }`
        );
      }

      // ======================================
      // JSON
      // ======================================

      let data;

      try {

        data =
          JSON.parse(responseText);

      } catch {

        throw new Error(
          "Single bug API did not return valid JSON."
        );

      }

      // ======================================
      // GET BUG OBJECT
      // ======================================

      const bugDetails =
        data?.bug ||
        data?.data ||
        data;

      // ======================================
      // SAVE SELECTED BUG
      // ======================================

      setSelectedBug(bugDetails);

      // ======================================
      // SET CURRENT STATUS
      // ======================================

      setEditStatus(
        bugDetails?.status || ""
      );

    } catch (error) {

      setSingleBugError(
        error?.message ||
        "Unable to fetch bug details."
      );

    } finally {

      setLoadingSingleBug(false);

    }

  };

  // ==========================================
  // UPDATE BUG STATUS
  // PUT /api/bugs/{id}/status
  // ==========================================

  const updateBugStatus = async () => {

    try {

      if (!selectedBug?.id) {
        return;
      }

      if (!editStatus) {
        setStatusUpdateMessage(
          "Please select a status."
        );

        return;
      }

      setUpdatingStatus(true);
      setStatusUpdateMessage("");

      // ======================================
      // GET TOKEN
      // ======================================

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      // ======================================
      // PUT API
      // ======================================

      const response = await fetch(
        `${apiurl}/api/bugs/${selectedBug.id}/status`,
        {
          method: "PUT",

          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
            "ngrok-skip-browser-warning":
              "true",
          },

          // ==================================
          // REQUEST BODY
          // ==================================

          body: JSON.stringify({
            status: editStatus,
          }),
        }
      );

      // ======================================
      // RESPONSE
      // ======================================

      const responseText =
        await response.text();

      // ======================================
      // CHECK RESPONSE
      // ======================================

      if (!response.ok) {
        throw new Error(
          `API Error ${response.status}: ${
            responseText ||
            response.statusText
          }`
        );
      }

      // ======================================
      // PARSE RESPONSE
      // ======================================

      let data = {};

      try {

        data =
          responseText
            ? JSON.parse(responseText)
            : {};

      } catch {

        data = {};

      }

      // ======================================
      // UPDATE SELECTED BUG
      // ======================================

      setSelectedBug(
        (previousBug) => ({
          ...previousBug,
          status: editStatus,
        })
      );

      // ======================================
      // UPDATE TABLE BUG
      // ======================================

      setBugs(
        (previousBugs) =>
          previousBugs.map(
            (bug) =>
              bug.id === selectedBug.id
                ? {
                    ...bug,
                    status:
                      editStatus,
                  }
                : bug
          )
      );

      // ======================================
      // SUCCESS MESSAGE
      // ======================================

      setStatusUpdateMessage(
        data?.message ||
        "Bug status updated successfully."
      );

    } catch (error) {

      setStatusUpdateMessage(
        error?.message ||
        "Unable to update bug status."
      );

    } finally {

      setUpdatingStatus(false);

    }

  };

  // ==========================================
  // CLOSE BUG DETAILS
  // ==========================================

  const closeBugDetails = () => {

    setSelectedBug(null);
    setSingleBugError("");
    setStatusUpdateMessage("");

  };

  // ==========================================
  // BUG COUNTS
  // ==========================================

  const openBugs =
    bugs.filter(
      (bug) =>
        String(
          bug?.status || ""
        ).toLowerCase() === "open"
    ).length;

  const inProgressBugs =
    bugs.filter(
      (bug) => {

        const status =
          String(
            bug?.status || ""
          )
            .toLowerCase()
            .replace("_", " ");

        return (
          status === "in progress"
        );

      }
    ).length;

  const pendingBugs =
    bugs.filter(
      (bug) =>
        String(
          bug?.status || ""
        ).toLowerCase().replace("-", "_") ===
        "pending"
    ).length;

  const resolvedBugs =
    bugs.filter(
      (bug) =>
        String(
          bug?.status || ""
        ).toLowerCase() ===
        "resolved"
    ).length;

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {

    localStorage.clear();
    sessionStorage.clear();

    navigate("/", {
      replace: true,
    });

  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {

    const value =
      String(status || "")
        .toLowerCase()
        .replace("_", "-")
        .replace(" ", "-");

    if (
      value === "in-progress"
    ) {
      return "progress";
    }

    return value;

  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="user-dashboard">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="user-sidebar">

        <div className="user-logo">

          <span className="user-logo-icon">
            🐞
          </span>

          <span>
            BUG TRACKER
          </span>

        </div>

        <nav className="user-nav">

          <button
            type="button"
            className={`user-nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            <span>📊</span>
            Dashboard
          </button>

          <button
            type="button"
            className={`user-nav-item ${
              activePage === "projects" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("projects");
              getProjects();
            }}
          >
            <span>🐞</span>
            Projects
          </button>

        </nav>

        <button
          className="user-logout"
          onClick={logout}
        >
          <span>🚪</span>
          Logout
        </button>

      </aside>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="user-main">

        {/* HEADER */}

        <header className="user-header">

          <div>

            <h1>
              Developer Dashboard
            </h1>

            <p>
              Welcome back, {userName}!
              Manage your assigned bugs
              and track your progress.
            </p>

          </div>

          {/* PROFILE */}

          <div className="user-profile">

            <div className="user-notification">
              🔔
              <span>2</span>
            </div>

            <div className="user-avatar">
              {userInitial}
            </div>

            <div className="user-profile-info">

              <strong>
                {userName}
              </strong>

              <small>
                {userRole}
              </small>

            </div>

          </div>

        </header>

        {/* ====================================
            STATISTICS
        ==================================== */}

        {selectedProject ? (
          <section className="user-stats">

            <div className="user-stat-card">
              <div className="user-stat-icon blue">🐞</div>
              <div>
                <p>Assigned</p>
                <h2>
                  {loadingProjectBugs ? "..." : projectAssignedBugs}
                </h2>
                <span>This project's assignments</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon red">🔴</div>
              <div>
                <p>Open</p>
                <h2>
                  {loadingProjectBugs ? "..." : projectOpenBugs}
                </h2>
                <span>Open bugs</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon orange">⏳</div>
              <div>
                <p>Pending</p>
                <h2>
                  {loadingProjectBugs ? "..." : projectPendingBugs}
                </h2>
                <span>Waiting to be worked on</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon orange">🔧</div>
              <div>
                <p>In Progress</p>
                <h2>
                  {loadingProjectBugs ? "..." : projectInProgressBugs}
                </h2>
                <span>Currently being worked on</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon green">✅</div>
              <div>
                <p>Resolved</p>
                <h2>
                  {loadingProjectBugs ? "..." : projectResolvedBugs}
                </h2>
                <span>Completed bugs</span>
              </div>
            </div>

          </section>
        ) : (
          <section className="user-stats">

            <div className="user-stat-card">
              <div className="user-stat-icon blue">🐞</div>
              <div>
                <p>Assigned Bugs</p>
                <h2>{loadingBugs ? "..." : totalBugs}</h2>
                <span>Current assignments</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon red">🔴</div>
              <div>
                <p>Open Bugs</p>
                <h2>{loadingBugs ? "..." : openBugs}</h2>
                <span>Need attention</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon orange">⏳</div>
              <div>
                <p>Pending</p>
                <h2>{loadingBugs ? "..." : pendingBugs}</h2>
                <span>Waiting to be worked on</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon orange">🔧</div>
              <div>
                <p>In Progress</p>
                <h2>{loadingBugs ? "..." : inProgressBugs}</h2>
                <span>Currently being worked on</span>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon green">✅</div>
              <div>
                <p>Resolved</p>
                <h2>{loadingBugs ? "..." : resolvedBugs}</h2>
                <span>Completed bugs</span>
              </div>
            </div>

          </section>
        )}

        {/* ====================================
            CONTENT AREA
        ==================================== */}

        {activePage === "dashboard" ? (
          <section className="user-content">

            <div className="user-content-header">
              <div>
                <h2>Assigned Bugs</h2>
                <p>Assigned bugs and projects</p>
              </div>

              <div className="dashboard-filters">
                <input
                  type="search"
                  value={bugSearch}
                  onChange={(event) =>
                    setBugSearch(event.target.value)
                  }
                  placeholder="Search assigned bugs"
                  aria-label="Search assigned bugs"
                />

                <select
                  value={bugStatusFilter}
                  onChange={(event) =>
                    setBugStatusFilter(event.target.value)
                  }
                  aria-label="Filter assigned bugs by status"
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {bugError && (
              <div
                style={{
                  padding: "15px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  fontWeight: "500",
                }}
              >
                {bugError}
              </div>
            )}

            {loadingBugs ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Loading assigned bugs...
              </div>
            ) : (
              <div className="user-table-container">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Bug ID</th>
                      <th>Image</th>
                      <th>Project</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Assigned Team</th>
                      <th>Severity</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAssignedBugs.length > 0 ? (
                      filteredAssignedBugs.map((bug) => (
                        <tr
                          key={bug.id}
                          onClick={() => singlebug(bug.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>#BUG-{bug.id}</td>

                          <td>
                            <BugImage
                              bug={bug}
                              apiUrl={apiurl}
                              alt={`${bug?.title || "Bug"} screenshot`}
                              className="bug-table-thumbnail"
                            />
                          </td>

                          <td style={{ fontWeight: 700 }}>
                            {bug?.project?.name || "-"}
                          </td>

                          <td>{bug?.title || "-"}</td>

                          <td>
                            <div className="bug-description-cell">
                              {bug?.description || "-"}
                            </div>
                          </td>

                          <td>
                            {bug?.assigned_team ||
                              bug?.assignedTeam ||
                              bug?.team?.name ||
                              bug?.assigned_team_name ||
                              "-"}
                          </td>

                          <td>
                            <span
                              className={`user-priority ${
                                String(
                                  bug?.severity || ""
                                ).toLowerCase()
                              }`}
                            >
                              {bug?.severity || "-"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`user-priority ${
                                String(
                                  bug?.priority || ""
                                ).toLowerCase()
                              }`}
                            >
                              {bug?.priority || "-"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`user-status ${
                                getStatusClass(bug?.status)
                              }`}
                            >
                              {bug?.status || "-"}
                            </span>
                          </td>

                          <td>
                            {bug?.created_at
                              ? new Date(
                                  bug.created_at
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                          }}
                        >
                          No assigned bugs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="user-content">

            {!selectedProject ? (
              <>
                <div className="user-content-header">
                  <div>
                    <h2>Projects</h2>
                    <p>All projects available to you</p>
                  </div>

                  <button
                    type="button"
                    onClick={getProjects}
                    disabled={loadingProjects}
                    style={{
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 16px",
                      cursor: loadingProjects
                        ? "not-allowed"
                        : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {loadingProjects ? "Loading..." : "Refresh"}
                  </button>
                </div>

                {projectError && (
                  <div
                    style={{
                      padding: "15px",
                      marginBottom: "20px",
                      borderRadius: "8px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      fontWeight: "500",
                    }}
                  >
                    {projectError}
                  </div>
                )}

                {loadingProjects ? (
                  <div
                    style={{
                      padding: "50px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        marginBottom: "10px",
                      }}
                    >
                      🐞
                    </div>
                    Loading projects...
                  </div>
                ) : (
                  <div className="user-table-container">
                    <table className="user-table">
                      <thead>
                        <tr>
                          <th>Project ID</th>
                          <th>Project Name</th>
                          <th>Status</th>
                          <th>Created</th>
                        </tr>
                      </thead>

                      <tbody>
                        {projects.length > 0 ? (
                          projects.map((project, index) => {
                            const projectId =
                              project?.id ??
                              project?.project_id ??
                              index + 1;

                            const projectName =
                              project?.name ??
                              project?.project_name ??
                              project?.title ??
                              "-";

                            const description =
                              project?.description ??
                              project?.details ??
                              "-";

                            const status =
                              project?.status ??
                              project?.project_status ??
                              "-";

                            const createdAt =
                              project?.created_at ??
                              project?.createdAt ??
                              project?.created ??
                              null;

                            return (
                              <tr
                                key={projectId}
                                onClick={() =>
                                  getProjectBugs(project)
                                }
                                style={{
                                  cursor: "pointer",
                                }}
                                title="Click to view project bugs"
                              >
                                <td>#PROJ-{projectId}</td>

                                <td
                                  style={{
                                    fontWeight: 700,
                                  }}
                                >
                                  {projectName}
                                </td>

                                <td>
                                  <span
                                    className={`user-status ${
                                      getStatusClass(status)
                                    }`}
                                  >
                                    {status}
                                  </span>
                                </td>

                                <td>
                                  {createdAt
                                    ? new Date(
                                        createdAt
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              style={{
                                textAlign: "center",
                                padding: "50px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "36px",
                                  marginBottom: "10px",
                                }}
                              >
                                📁
                              </div>
                              No projects found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="user-content-header">
                  <div>
                    <button
                      type="button"
                      onClick={backToProjects}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0",
                        marginBottom: "8px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      ← Back to Projects
                    </button>

                    <h2>
                      {selectedProject?.name ||
                        selectedProject?.project_name ||
                        selectedProject?.title ||
                        "Project"}
                    </h2>

                    <p>
                      All bugs from this project
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      getProjectBugs(selectedProject)
                    }
                    disabled={loadingProjectBugs}
                    style={{
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 16px",
                      cursor: loadingProjectBugs
                        ? "not-allowed"
                        : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {loadingProjectBugs
                      ? "Loading..."
                      : "Refresh Bugs"}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <strong>
                      Project Bugs: {filteredProjectBugs.length}
                    </strong>
                  </div>

                  <div className="dashboard-filters">
                    <input
                      type="search"
                      value={projectBugSearch}
                      onChange={(event) =>
                        setProjectBugSearch(event.target.value)
                      }
                      placeholder="Search project bugs"
                      aria-label="Search project bugs"
                    />

                    <label
                      htmlFor="projectBugFilter"
                      style={{ fontWeight: 600 }}
                    >
                      Filter:
                    </label>

                    <select
                      id="projectDepartmentFilter"
                      value={projectDepartmentFilter}
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        setProjectDepartmentFilter(
                          value
                        );

                        getProjectBugs(
                          selectedProject,
                          value
                        );
                      }}
                      aria-label="Filter project bugs by department"
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      <option value="all">
                        All Departments
                      </option>

                      <option value="Frontend">
                        Frontend
                      </option>

                      <option value="Backend">
                        Backend
                      </option>
                    </select>

                    <select
                      id="projectBugFilter"
                      value={projectBugFilter}
                      onChange={(event) =>
                        setProjectBugFilter(
                          event.target.value
                        )
                      }
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      <option value="all">
                        All Bugs
                      </option>
                      <option value="open">
                        Open
                      </option>
                      <option value="pending">
                        Pending
                      </option>
                      <option value="in_progress">
                        In Progress
                      </option>
                      <option value="resolved">
                        Resolved
                      </option>
                    </select>
                  </div>
                </div>

                {projectBugError && (
                  <div
                    style={{
                      padding: "15px",
                      marginBottom: "20px",
                      borderRadius: "8px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      fontWeight: "500",
                    }}
                  >
                    {projectBugError}
                  </div>
                )}

                {loadingProjectBugs ? (
                  <div
                    style={{
                      padding: "50px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        marginBottom: "10px",
                      }}
                    >
                      🐞
                    </div>
                    Loading project bugs...
                  </div>
                ) : (
                  <div className="user-table-container">
                    <table className="user-table">
                      <thead>
                        <tr>
                          <th>Bug ID</th>
                          <th>Image</th>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Assigned To</th>
                          <th>Assigned Team</th>
                          <th>Severity</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Created</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredProjectBugs.length > 0 ? (
                          filteredProjectBugs.map((bug) => (
                            <tr
                              key={bug.id}
                              onClick={() =>
                                singlebug(bug.id)
                              }
                              style={{
                                cursor: "pointer",
                              }}
                            >
                              <td>
                                #BUG-{bug.id}
                              </td>

                              <td>
                                <BugImage
                                  bug={bug}
                                  apiUrl={apiurl}
                                  alt={`${bug?.title || "Bug"} screenshot`}
                                  className="bug-table-thumbnail"
                                />
                              </td>

                              <td
                                style={{
                                  fontWeight: 700,
                                }}
                              >
                                {bug?.title || "-"}
                              </td>

                              <td>
                                <div className="bug-description-cell">
                                  {bug?.description || "-"}
                                </div>
                              </td>

                              <td>
                                {bug?.assigned_to ||
                                  bug?.assignedTo ||
                                  bug?.assigned_user?.name ||
                                  bug?.assignee?.name ||
                                  bug?.assignee ||
                                  "-"}
                              </td>

                              <td>
                                {bug?.assigned_team ||
                                  bug?.assignedTeam ||
                                  bug?.team?.name ||
                                  bug?.assigned_team_name ||
                                  "-"}
                              </td>

                              <td>
                                <span
                                  className={`user-priority ${
                                    String(
                                      bug?.severity || ""
                                    ).toLowerCase()
                                  }`}
                                >
                                  {bug?.severity || "-"}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`user-priority ${
                                    String(
                                      bug?.priority || ""
                                    ).toLowerCase()
                                  }`}
                                >
                                  {bug?.priority || "-"}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`user-status ${
                                    getStatusClass(
                                      bug?.status
                                    )
                                  }`}
                                >
                                  {bug?.status || "-"}
                                </span>
                              </td>

                              <td>
                                {bug?.created_at
                                  ? new Date(
                                      bug.created_at
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="10"
                              style={{
                                textAlign: "center",
                                padding: "50px",
                              }}
                            >
                              {projectBugFilter === "all" && !projectBugSearch
                                ? "No bugs found in this project."
                                : "No bugs match this filter."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

          </section>

          )}
      </main>

      {/* ======================================
          SINGLE BUG MODAL
      ====================================== */}

      {(loadingSingleBug ||
        singleBugError ||
        selectedBug) && (

        <div
          className="bug-modal-overlay"
          onClick={
            closeBugDetails
          }
        >

          <div
            className="bug-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="bug-modal-header">

              <div>

                <h2>
                  Bug Details
                </h2>

                {selectedBug?.id && (

                  <span>
                    #BUG-{selectedBug.id}
                  </span>

                )}

              </div>

              <button
                className="bug-modal-close"
                onClick={
                  closeBugDetails
                }
              >
                ×
              </button>

            </div>

            {/* =================================
                LOADING
            ================================= */}

            {loadingSingleBug && (

              <div className="bug-modal-loading">

                <div className="bug-loader">
                </div>

                <p>
                  Loading bug details...
                </p>

              </div>

            )}

            {/* =================================
                ERROR
            ================================= */}

            {!loadingSingleBug &&
              singleBugError && (

                <div className="bug-modal-error">

                  {singleBugError}

                </div>

              )}

            {/* =================================
                DETAILS
            ================================= */}

            {!loadingSingleBug &&
              !singleBugError &&
              selectedBug && (

                <div className="bug-details">

                  {/* TITLE */}

                  <div className="bug-detail-full">

                    <label>
                      Bug Title
                    </label>

                    <h3>
                      {selectedBug?.title ||
                        "-"}
                    </h3>

                  </div>

                  {/* PROJECT */}

                  <div className="bug-detail-item">

                    <label>
                      Project
                    </label>

                    <p>
                      {selectedBug?.project?.name ||
                        "-"}
                    </p>

                  </div>

                  {/* ASSIGNED TO */}

                  <div className="bug-detail-item">

                    <label>
                      Assigned To
                    </label>

                    <p>
                      {selectedBug?.assigned_to ||
                        "-"}
                    </p>

                  </div>

                  {/* TEAM */}

                  <div className="bug-detail-item">

                    <label>
                      Assigned Team
                    </label>

                    <p>
                      {selectedBug?.assigned_team ||
                        "-"}
                    </p>

                  </div>

                  {/* REPORTED BY */}

                  <div className="bug-detail-item">

                    <label>
                      Reported By
                    </label>

                    <p>
                      {selectedBug?.reported_by ||
                        "-"}
                    </p>

                  </div>

                  {/* SEVERITY */}

                  <div className="bug-detail-item">

                    <label>
                      Severity
                    </label>

                    <p>

                      <span
                        className={`user-priority ${
                          String(
                            selectedBug?.severity ||
                            ""
                          ).toLowerCase()
                        }`}
                      >
                        {selectedBug?.severity ||
                          "-"}
                      </span>

                    </p>

                  </div>

                  {/* PRIORITY */}

                  <div className="bug-detail-item">

                    <label>
                      Priority
                    </label>

                    <p>

                      <span
                        className={`user-priority ${
                          String(
                            selectedBug?.priority ||
                            ""
                          ).toLowerCase()
                        }`}
                      >
                        {selectedBug?.priority ||
                          "-"}
                      </span>

                    </p>

                  </div>

                  {/* CURRENT STATUS */}

                  <div className="bug-detail-item">

                    <label>
                      Current Status
                    </label>

                    <p>

                      <span
                        className={`user-status ${
                          getStatusClass(
                            selectedBug?.status
                          )
                        }`}
                      >
                        {selectedBug?.status ||
                          "-"}
                      </span>

                    </p>

                  </div>

                  {/* =================================
                      EDIT STATUS
                  ================================= */}

                  <div className="bug-status-edit">

                    <div className="bug-status-edit-header">

                      <label>
                        Edit Status
                      </label>

                      <p>
                        Change the current
                        bug status
                      </p>

                    </div>

                    <div className="bug-status-edit-controls">

                      <select
                        value={
                          editStatus
                        }
                        onChange={(event) =>
                          setEditStatus(
                            event.target.value
                          )
                        }
                        disabled={
                          updatingStatus
                        }
                        className="bug-status-select"
                      >

                        <option value="">
                          Select Status
                        </option>

                        <option value="pending">
                          Pending
                        </option>

                        <option value="in_progress">
                          In Progress
                        </option>

                        <option value="resolved">
                          Resolved
                        </option>

                      </select>

                      <button
                        type="button"
                        className="bug-status-update-btn"
                        onClick={
                          updateBugStatus
                        }
                        disabled={
                          updatingStatus ||
                          !editStatus
                        }
                      >

                        {updatingStatus
                          ? "Updating..."
                          : "Update"}

                      </button>

                    </div>

                    {/* UPDATE MESSAGE */}

                    {statusUpdateMessage && (

                      <div
                        className={
                          statusUpdateMessage
                            .toLowerCase()
                            .includes(
                              "success"
                            )
                            ? "status-update-success"
                            : "status-update-error"
                        }
                      >
                        {statusUpdateMessage}
                      </div>

                    )}

                  </div>

                  {/* DESCRIPTION */}

                  <div className="bug-detail-full">

                    <label>
                      Description
                    </label>

                    <div className="bug-description">
                      {selectedBug?.description ||
                        "-"}
                    </div>

                  </div>

                  {/* EXPECTED RESULT */}

                  <div className="bug-detail-full">

                    <label>
                      Expected Result
                    </label>

                    <div className="bug-description">
                      {selectedBug?.expected_result ||
                        "-"}
                    </div>

                  </div>

                  {/* ACTUAL RESULT */}

                  <div className="bug-detail-full">

                    <label>
                      Actual Result
                    </label>

                    <div className="bug-description">
                      {selectedBug?.actual_result ||
                        "-"}
                    </div>

                  </div>

                  {/* CREATED */}

                  <div className="bug-detail-item">

                    <label>
                      Created
                    </label>

                    <p>
                      {selectedBug?.created_at
                        ? new Date(
                            selectedBug.created_at
                          ).toLocaleString()
                        : "-"}
                    </p>

                  </div>

                  {/* UPDATED */}

                  <div className="bug-detail-item">

                    <label>
                      Updated
                    </label>

                    <p>
                      {selectedBug?.updated_at
                        ? new Date(
                            selectedBug.updated_at
                          ).toLocaleString()
                        : "-"}
                    </p>

                  </div>

                  {/* RESOLVED */}

                  <div className="bug-detail-item">

                    <label>
                      Resolved At
                    </label>

                    <p>
                      {selectedBug?.resolved_at
                        ? new Date(
                            selectedBug.resolved_at
                          ).toLocaleString()
                        : "Not resolved"}
                    </p>

                  </div>

                  {/* IMAGE */}

                  {getBugImageUrl(selectedBug, apiurl) && (

                    <div className="bug-detail-full">

                      <label>
                        Bug Screenshot
                      </label>

                      <BugImage
                        bug={selectedBug}
                        apiUrl={apiurl}
                        alt="Bug screenshot"
                        className="bug-detail-image"
                      />

                    </div>

                  )}

                </div>

              )}

          </div>

        </div>

      )}

    </div>
  );
}

export default DeveloperDashboard;


import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./DeveloperDashboard.css";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  // ==========================================
  // API URL
  // ==========================================

  const apiurl =
    import.meta.env.VITE_API_URL ||
    "https://glorified-paltry-upbeat.ngrok-free.dev";

  // ==========================================
  // ⚠️ ROUTES USED ON THIS PAGE
  // ------------------------------------------
  // These match your routes/api.php file exactly,
  // EXCEPT the two marked "GUESSED" below — your
  // api.php has no GET/DELETE user route yet, so
  // add them on the backend and adjust here if the
  // paths differ.
  // ==========================================
  //
  //   GET    /admin/users          -> GUESSED (no route in api.php yet)
  //   POST   /admin/users          -> confirmed (UserController@store)
  //   DELETE /admin/users/{user}   -> GUESSED (no route in api.php yet)
  //
  //   GET    /projects             -> confirmed (ProjectController@show)
  //   POST   /create-project       -> confirmed (ProjectController@store)
  //   DELETE /projects/{project}   -> confirmed (ProjectController@destroy)
  //
  // ==========================================

  // ==========================================
  // PREVENT DUPLICATE REQUEST
  // ==========================================

  const usersApiCalled = useRef(false);
  const projectsApiCalled = useRef(false);

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
    user?.name || "Admin";

  const userRole =
    user?.role || "admin";

  const userInitial =
    userName.charAt(0).toUpperCase();

  // ==========================================
  // GET TOKEN HELPER
  // ==========================================

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // ==========================================
  // ACTIVE TAB (users / projects)
  // ==========================================

  const [activeTab, setActiveTab] =
    useState("users");

  // ==========================================
  // USERS STATE
  // ==========================================

  const [users, setUsers] = useState([]);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [usersError, setUsersError] =
    useState("");

  // ==========================================
  // PROJECTS STATE
  // ==========================================

  const [projects, setProjects] =
    useState([]);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [projectsError, setProjectsError] =
    useState("");

  const [userSearch, setUserSearch] =
    useState("");

  const [userRoleFilter, setUserRoleFilter] =
    useState("all");

  const [projectSearch, setProjectSearch] =
    useState("");

  const [projectStatusFilter, setProjectStatusFilter] =
    useState("all");

  // ==========================================
  // ADD USER MODAL STATE
  // ==========================================

  const [showAddUser, setShowAddUser] =
    useState(false);

  const [newUserName, setNewUserName] =
    useState("");

  const [newUserEmail, setNewUserEmail] =
    useState("");

  const [newUserPassword, setNewUserPassword] =
    useState("");

  const [newUserRole, setNewUserRole] =
    useState("developer");

  const [creatingUser, setCreatingUser] =
    useState(false);

  const [addUserError, setAddUserError] =
    useState("");

  // ==========================================
  // CREATE PROJECT MODAL STATE
  // ==========================================

  const [showAddProject, setShowAddProject] =
    useState(false);

  const [newProjectName, setNewProjectName] =
    useState("");

  const [newProjectDescription, setNewProjectDescription] =
    useState("");

  const [newProjectStatus, setNewProjectStatus] =
    useState("active");

  const [creatingProject, setCreatingProject] =
    useState(false);

  const [addProjectError, setAddProjectError] =
    useState("");

  // ==========================================
  // DELETE CONFIRM STATE
  // (shared for both users + projects)
  // ==========================================

  const [deleteTarget, setDeleteTarget] =
    useState(null);
  // shape: { type: "user" | "project", id, label }

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  // ==========================================
  // GET ALL USERS
  // GET /admin/users  (GUESSED - add this route)
  // ==========================================

  const fetchUsers = async () => {

    try {

      setLoadingUsers(true);
      setUsersError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      const response = await fetch(
        `${apiurl}/api/admin/users`,
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

      const responseText =
        await response.text();

      if (!response.ok) {
        throw new Error(
          `API Error ${response.status}: ${
            responseText ||
            response.statusText
          }`
        );
      }

      let data;

      try {

        data =
          JSON.parse(responseText);

      } catch {

        throw new Error(
          "Users API did not return valid JSON."
        );

      }

      // Accept a few common shapes:
      // { users: [...] } or { data: [...] } or a raw array
      const userList =
        data?.users ||
        data?.data ||
        (Array.isArray(data)
          ? data
          : []);

      setUsers(
        Array.isArray(userList)
          ? userList
          : []
      );

    } catch (error) {

      setUsersError(
        error?.message ||
        "Unable to fetch users."
      );

      setUsers([]);

    } finally {

      setLoadingUsers(false);

    }

  };

  // ==========================================
  // GET ALL PROJECTS
  // GET /projects (confirmed)
  // ==========================================

  const fetchProjects = async () => {

    try {

      setLoadingProjects(true);
      setProjectsError("");

      const token = getToken();

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
            Authorization:
              `Bearer ${token}`,
            "ngrok-skip-browser-warning":
              "true",
          },
        }
      );

      const responseText =
        await response.text();

      if (!response.ok) {
        throw new Error(
          `API Error ${response.status}: ${
            responseText ||
            response.statusText
          }`
        );
      }

      let data;

      try {

        data =
          JSON.parse(responseText);

      } catch {

        throw new Error(
          "Projects API did not return valid JSON."
        );

      }

      const projectList =
        data?.projects ||
        data?.data ||
        (Array.isArray(data)
          ? data
          : []);

      setProjects(
        Array.isArray(projectList)
          ? projectList
          : []
      );

    } catch (error) {

      setProjectsError(
        error?.message ||
        "Unable to fetch projects."
      );

      setProjects([]);

    } finally {

      setLoadingProjects(false);

    }

  };

  // ==========================================
  // INITIAL LOAD
  // ONLY ONE REQUEST EACH
  // ==========================================

  useEffect(() => {

    if (usersApiCalled.current) {
      return;
    }

    usersApiCalled.current = true;

    fetchUsers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiurl]);

  useEffect(() => {

    if (projectsApiCalled.current) {
      return;
    }

    projectsApiCalled.current = true;

    fetchProjects();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiurl]);

  // ==========================================
  // ADD USER
  // POST /admin/users (confirmed)
  // body: { name, email, password, role }
  // ==========================================

  const openAddUser = () => {

    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("developer");
    setAddUserError("");
    setShowAddUser(true);

  };

  const closeAddUser = () => {

    if (creatingUser) {
      return;
    }

    setShowAddUser(false);

  };

  const createUser = async (event) => {

    event.preventDefault();

    try {

      if (
        !newUserName ||
        !newUserEmail ||
        !newUserPassword
      ) {
        setAddUserError(
          "Please fill in name, email, and password."
        );

        return;
      }

      if (newUserPassword.length < 8) {
        setAddUserError(
          "Password must be at least 8 characters."
        );

        return;
      }

      setCreatingUser(true);
      setAddUserError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      const response = await fetch(
        `${apiurl}/api/admin/users`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
            "ngrok-skip-browser-warning":
              "true",
          },

          body: JSON.stringify({
            name: newUserName,
            email: newUserEmail,
            password: newUserPassword,
            role: newUserRole,
          }),
        }
      );

      const responseText =
        await response.text();

      if (!response.ok) {

        // Laravel validation errors come back as
        // { message, errors: { field: [messages] } }
        let serverMessage =
          responseText ||
          response.statusText;

        try {

          const parsedError =
            JSON.parse(responseText);

          if (parsedError?.errors) {

            const firstField =
              Object.keys(
                parsedError.errors
              )[0];

            serverMessage =
              parsedError.errors[
                firstField
              ]?.[0] ||
              parsedError?.message ||
              serverMessage;

          } else if (
            parsedError?.message
          ) {

            serverMessage =
              parsedError.message;

          }

        } catch {
          // responseText wasn't JSON, keep as-is
        }

        throw new Error(serverMessage);

      }

      let data = {};

      try {

        data =
          responseText
            ? JSON.parse(responseText)
            : {};

      } catch {

        data = {};

      }

      const createdUser =
        data?.user || {
          id: Date.now(),
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          created_at:
            new Date().toISOString(),
        };

      // Add the new user to the top of the table
      setUsers(
        (previousUsers) => [
          createdUser,
          ...previousUsers,
        ]
      );

      setShowAddUser(false);

    } catch (error) {

      setAddUserError(
        error?.message ||
        "Unable to create user."
      );

    } finally {

      setCreatingUser(false);

    }

  };

  // ==========================================
  // CREATE PROJECT
  // POST /create-project (confirmed)
  // body: { name, description, status }
  // ==========================================

  const openAddProject = () => {

    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectStatus("active");
    setAddProjectError("");
    setShowAddProject(true);

  };

  const closeAddProject = () => {

    if (creatingProject) {
      return;
    }

    setShowAddProject(false);

  };

  const createProject = async (event) => {

    event.preventDefault();

    try {

      if (!newProjectName) {
        setAddProjectError(
          "Please enter a project name."
        );

        return;
      }

      setCreatingProject(true);
      setAddProjectError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      const response = await fetch(
        `${apiurl}/api/create-project`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
            "ngrok-skip-browser-warning":
              "true",
          },

          body: JSON.stringify({
            name: newProjectName,
            description:
              newProjectDescription ||
              null,
            status: newProjectStatus,
          }),
        }
      );

      const responseText =
        await response.text();

      if (!response.ok) {

        let serverMessage =
          responseText ||
          response.statusText;

        try {

          const parsedError =
            JSON.parse(responseText);

          if (parsedError?.errors) {

            const firstField =
              Object.keys(
                parsedError.errors
              )[0];

            serverMessage =
              parsedError.errors[
                firstField
              ]?.[0] ||
              parsedError?.message ||
              serverMessage;

          } else if (
            parsedError?.message
          ) {

            serverMessage =
              parsedError.message;

          }

        } catch {
          // not JSON, keep as-is
        }

        throw new Error(serverMessage);

      }

      let data = {};

      try {

        data =
          responseText
            ? JSON.parse(responseText)
            : {};

      } catch {

        data = {};

      }

      const createdProject =
        data?.project || {
          id: Date.now(),
          name: newProjectName,
          description:
            newProjectDescription,
          status: newProjectStatus,
          created_at:
            new Date().toISOString(),
        };

      setProjects(
        (previousProjects) => [
          createdProject,
          ...previousProjects,
        ]
      );

      setShowAddProject(false);

    } catch (error) {

      setAddProjectError(
        error?.message ||
        "Unable to create project."
      );

    } finally {

      setCreatingProject(false);

    }

  };

  // ==========================================
  // DELETE CONFIRM FLOW
  // (shared modal for user + project delete)
  // ==========================================

  const askDeleteUser = (targetUser) => {

    setDeleteError("");

    setDeleteTarget({
      type: "user",
      id: targetUser.id,
      label:
        targetUser.name ||
        targetUser.email ||
        `User #${targetUser.id}`,
    });

  };

  const askDeleteProject = (targetProject) => {

    setDeleteError("");

    setDeleteTarget({
      type: "project",
      id: targetProject.id,
      label:
        targetProject.name ||
        `Project #${targetProject.id}`,
    });

  };

  const cancelDelete = () => {

    if (deleting) {
      return;
    }

    setDeleteTarget(null);
    setDeleteError("");

  };

  // DELETE /admin/users/{user}   -> GUESSED
  // DELETE /projects/{project}   -> confirmed

  const confirmDelete = async () => {

    if (!deleteTarget) {
      return;
    }

    try {

      setDeleting(true);
      setDeleteError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      const endpoint =
        deleteTarget.type === "user"
          ? `${apiurl}/api/admin/users/${deleteTarget.id}`
          : `${apiurl}/api/projects/${deleteTarget.id}`;

      const response = await fetch(
        endpoint,
        {
          method: "DELETE",

          headers: {
            Accept: "application/json",
            Authorization:
              `Bearer ${token}`,
            "ngrok-skip-browser-warning":
              "true",
          },
        }
      );

      const responseText =
        await response.text();

      if (!response.ok) {
        throw new Error(
          `API Error ${response.status}: ${
            responseText ||
            response.statusText
          }`
        );
      }

      if (deleteTarget.type === "user") {

        setUsers(
          (previousUsers) =>
            previousUsers.filter(
              (item) =>
                item.id !==
                deleteTarget.id
            )
        );

      } else {

        setProjects(
          (previousProjects) =>
            previousProjects.filter(
              (item) =>
                item.id !==
                deleteTarget.id
            )
        );

      }

      setDeleteTarget(null);

    } catch (error) {

      setDeleteError(
        error?.message ||
        "Unable to delete. Please try again."
      );

    } finally {

      setDeleting(false);

    }

  };

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
  // STATUS CLASS (projects use active/inactive)
  // ==========================================

  const getProjectStatusClass = (status) => {

    const value =
      String(status || "")
        .toLowerCase();

    if (value === "active") {
      return "resolved";
    }

    if (value === "inactive") {
      return "open";
    }

    return value;

  };

  // ==========================================
  // COUNTS
  // ==========================================

  const totalUsers = users.length;

  const totalDevelopers =
    users.filter(
      (item) =>
        String(
          item?.role || ""
        ).toLowerCase() ===
        "developer"
    ).length;

  const totalTesters =
    users.filter(
      (item) =>
        String(
          item?.role || ""
        ).toLowerCase() ===
        "tester"
    ).length;

  const totalProjects =
    projects.length;

  const filteredUsers = users.filter((item) => {
    const search = userSearch.trim().toLowerCase();
    const role = String(item?.role || "").toLowerCase();
    const searchableText = [
      item?.id,
      item?.name,
      item?.email,
      item?.role,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (userRoleFilter === "all" || role === userRoleFilter) &&
      (!search || searchableText.includes(search))
    );
  });

  const filteredProjects = projects.filter((item) => {
    const search = projectSearch.trim().toLowerCase();
    const status = String(item?.status || "").toLowerCase();
    const searchableText = [
      item?.id,
      item?.name,
      item?.description,
      item?.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (projectStatusFilter === "all" || status === projectStatusFilter) &&
      (!search || searchableText.includes(search))
    );
  });

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
            className={
              activeTab === "users"
                ? "user-nav-item active"
                : "user-nav-item"
            }
            onClick={() =>
              setActiveTab("users")
            }
          >
            <span>👤</span>
            Users
          </button>

          <button
            className={
              activeTab === "projects"
                ? "user-nav-item active"
                : "user-nav-item"
            }
            onClick={() =>
              setActiveTab("projects")
            }
          >
            <span>📁</span>
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
              Admin Dashboard
            </h1>

            <p>
              Welcome back, {userName}!
              Manage users and projects
              from one place.
            </p>

          </div>

          {/* PROFILE */}

          <div className="user-profile">

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

        <section className="user-stats">

          {/* TOTAL USERS */}

          <div className="user-stat-card">

            <div className="user-stat-icon blue">
              👤
            </div>

            <div>

              <p>
                Total Users
              </p>

              <h2>
                {loadingUsers
                  ? "..."
                  : totalUsers}
              </h2>

              <span>
                Developers + Testers
              </span>

            </div>

          </div>

          {/* DEVELOPERS */}

          <div className="user-stat-card">

            <div className="user-stat-icon orange">
              🧑‍💻
            </div>

            <div>

              <p>
                Developers
              </p>

              <h2>
                {loadingUsers
                  ? "..."
                  : totalDevelopers}
              </h2>

              <span>
                Assigned to fix bugs
              </span>

            </div>

          </div>

          {/* TESTERS */}

          <div className="user-stat-card">

            <div className="user-stat-icon green">
              🧪
            </div>

            <div>

              <p>
                Testers
              </p>

              <h2>
                {loadingUsers
                  ? "..."
                  : totalTesters}
              </h2>

              <span>
                Report and verify bugs
              </span>

            </div>

          </div>

          {/* PROJECTS */}

          <div className="user-stat-card">

            <div className="user-stat-icon red">
              📁
            </div>

            <div>

              <p>
                Total Projects
              </p>

              <h2>
                {loadingProjects
                  ? "..."
                  : totalProjects}
              </h2>

              <span>
                Active + Inactive
              </span>

            </div>

          </div>

        </section>

        {/* ====================================
            USERS TABLE
        ==================================== */}

        {activeTab === "users" && (

          <section className="user-content">

            <div className="user-content-header">

              <div>

                <h2>
                  Users
                </h2>

                <p>
                  All developers and testers
                </p>

              </div>

              <button
                className="user-create-button"
                onClick={openAddUser}
              >
                + Add User
              </button>

              <div className="dashboard-filters">
                <input
                  type="search"
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(event.target.value)
                  }
                  placeholder="Search users"
                  aria-label="Search users"
                />

                <select
                  value={userRoleFilter}
                  onChange={(event) =>
                    setUserRoleFilter(event.target.value)
                  }
                  aria-label="Filter users by role"
                >
                  <option value="all">All roles</option>
                  <option value="developer">Developers</option>
                  <option value="tester">Testers</option>
                </select>
              </div>

            </div>

            {usersError && (

              <div
                style={{
                  padding: "15px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  background:
                    "#fee2e2",
                  color: "#dc2626",
                  fontWeight: "500",
                }}
              >
                {usersError}
              </div>

            )}

            {loadingUsers ? (

              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Loading users...
              </div>

            ) : (

              <div className="user-table-container">

                <table className="user-table">

                  <thead>

                    <tr>

                      <th>
                        Name
                      </th>

                      <th>
                        Email
                      </th>

                      <th>
                        Role
                      </th>

                      <th>
                        Created
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredUsers.length > 0 ? (

                      filteredUsers.map(
                        (item) => (

                          <tr
                            key={item.id}
                          >

                            <td style={{ fontWeight: 700 }}>
                              {item?.name ||
                                "-"}
                            </td>

                            <td>
                              {item?.email ||
                                "-"}
                            </td>

                            <td>

                              <span
                                className={`user-priority ${
                                  String(
                                    item?.role ||
                                    ""
                                  ).toLowerCase() ===
                                  "developer"
                                    ? "medium"
                                    : "low"
                                }`}
                              >
                                {item?.role ||
                                  "-"}
                              </span>

                            </td>

                            <td>

                              {item?.created_at
                                ? new Date(
                                    item.created_at
                                  ).toLocaleDateString()
                                : "-"}

                            </td>

                            <td>

                              <button
                                className="row-delete-btn"
                                onClick={() =>
                                  askDeleteUser(
                                    item
                                  )
                                }
                              >
                                Delete
                              </button>

                            </td>

                          </tr>

                        )
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="5"
                          style={{
                            textAlign:
                              "center",
                            padding:
                              "40px",
                          }}
                        >
                          No users found.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        )}

        {/* ====================================
            PROJECTS TABLE
        ==================================== */}

        {activeTab === "projects" && (

          <section className="user-content">

            <div className="user-content-header">

              <div>

                <h2>
                  Projects
                </h2>

                <p>
                  All projects in the system
                </p>

              </div>

              <button
                className="user-create-button"
                onClick={openAddProject}
              >
                + Create Project
              </button>

              <div className="dashboard-filters">
                <input
                  type="search"
                  value={projectSearch}
                  onChange={(event) =>
                    setProjectSearch(event.target.value)
                  }
                  placeholder="Search projects"
                  aria-label="Search projects"
                />

                <select
                  value={projectStatusFilter}
                  onChange={(event) =>
                    setProjectStatusFilter(event.target.value)
                  }
                  aria-label="Filter projects by status"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

            </div>

            {projectsError && (

              <div
                style={{
                  padding: "15px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  background:
                    "#fee2e2",
                  color: "#dc2626",
                  fontWeight: "500",
                }}
              >
                {projectsError}
              </div>

            )}

            {loadingProjects ? (

              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Loading projects...
              </div>

            ) : (

              <div className="user-table-container">

                <table className="user-table">

                  <thead>

                    <tr>

                      <th>
                        Project
                      </th>

                      <th>
                        Description
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Created
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredProjects.length > 0 ? (

                      filteredProjects.map(
                        (item) => (

                          <tr
                            key={item.id}
                          >

                            <td style={{ fontWeight: 700 }}>
                              {item?.name ||
                                "-"}
                            </td>

                            <td
                              style={{
                                maxWidth: "280px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item?.description ||
                                "-"}
                            </td>

                            <td>

                              <span
                                className={`user-status ${getProjectStatusClass(
                                  item?.status
                                )}`}
                              >
                                {item?.status ||
                                  "-"}
                              </span>

                            </td>

                            <td>

                              {item?.created_at
                                ? new Date(
                                    item.created_at
                                  ).toLocaleDateString()
                                : "-"}

                            </td>

                            <td>

                              <button
                                className="row-delete-btn"
                                onClick={() =>
                                  askDeleteProject(
                                    item
                                  )
                                }
                              >
                                Delete
                              </button>

                            </td>

                          </tr>

                        )
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="5"
                          style={{
                            textAlign:
                              "center",
                            padding:
                              "40px",
                          }}
                        >
                          No projects found.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        )}

      </main>

      {/* ======================================
          ADD USER MODAL
      ====================================== */}

      {showAddUser && (

        <div
          className="bug-modal-overlay"
          onClick={closeAddUser}
        >

          <div
            className="bug-modal small-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="bug-modal-header">

              <div>

                <h2>
                  Add User
                </h2>

                <span>
                  Create a developer or tester
                </span>

              </div>

              <button
                className="bug-modal-close"
                onClick={closeAddUser}
              >
                ×
              </button>

            </div>

            <form
              className="admin-form"
              onSubmit={createUser}
            >

              <div className="admin-form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={newUserName}
                  onChange={(event) =>
                    setNewUserName(
                      event.target.value
                    )
                  }
                  placeholder="Jane Cooper"
                  disabled={creatingUser}
                />

              </div>

              <div className="admin-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(event) =>
                    setNewUserEmail(
                      event.target.value
                    )
                  }
                  placeholder="jane@example.com"
                  disabled={creatingUser}
                />

              </div>

              <div className="admin-form-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(event) =>
                    setNewUserPassword(
                      event.target.value
                    )
                  }
                  placeholder="At least 8 characters"
                  disabled={creatingUser}
                />

              </div>

              <div className="admin-form-group">

                <label>
                  Role
                </label>

                <select
                  value={newUserRole}
                  onChange={(event) =>
                    setNewUserRole(
                      event.target.value
                    )
                  }
                  disabled={creatingUser}
                >

                  <option value="developer">
                    Developer
                  </option>

                  <option value="tester">
                    Tester
                  </option>

                </select>

              </div>

              {addUserError && (

                <div className="status-update-error">
                  {addUserError}
                </div>

              )}

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={closeAddUser}
                  disabled={creatingUser}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bug-status-update-btn"
                  disabled={creatingUser}
                >

                  {creatingUser
                    ? "Creating..."
                    : "Create User"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ======================================
          CREATE PROJECT MODAL
      ====================================== */}

      {showAddProject && (

        <div
          className="bug-modal-overlay"
          onClick={closeAddProject}
        >

          <div
            className="bug-modal small-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="bug-modal-header">

              <div>

                <h2>
                  Create Project
                </h2>

                <span>
                  Add a new project to track bugs against
                </span>

              </div>

              <button
                className="bug-modal-close"
                onClick={closeAddProject}
              >
                ×
              </button>

            </div>

            <form
              className="admin-form"
              onSubmit={createProject}
            >

              <div className="admin-form-group">

                <label>
                  Project Name
                </label>

                <input
                  type="text"
                  value={newProjectName}
                  onChange={(event) =>
                    setNewProjectName(
                      event.target.value
                    )
                  }
                  placeholder="Mobile App Revamp"
                  disabled={creatingProject}
                />

              </div>

              <div className="admin-form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={
                    newProjectDescription
                  }
                  onChange={(event) =>
                    setNewProjectDescription(
                      event.target.value
                    )
                  }
                  placeholder="Optional short description"
                  disabled={creatingProject}
                  rows={3}
                />

              </div>

              <div className="admin-form-group">

                <label>
                  Status
                </label>

                <select
                  value={newProjectStatus}
                  onChange={(event) =>
                    setNewProjectStatus(
                      event.target.value
                    )
                  }
                  disabled={creatingProject}
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                </select>

              </div>

              {addProjectError && (

                <div className="status-update-error">
                  {addProjectError}
                </div>

              )}

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={closeAddProject}
                  disabled={creatingProject}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bug-status-update-btn"
                  disabled={creatingProject}
                >

                  {creatingProject
                    ? "Creating..."
                    : "Create Project"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ======================================
          DELETE CONFIRM MODAL
      ====================================== */}

      {deleteTarget && (

        <div
          className="bug-modal-overlay"
          onClick={cancelDelete}
        >

          <div
            className="bug-modal small-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="bug-modal-header">

              <div>

                <h2>
                  Confirm Delete
                </h2>

              </div>

              <button
                className="bug-modal-close"
                onClick={cancelDelete}
              >
                ×
              </button>

            </div>

            <div className="admin-form">

              <p
                style={{
                  color: "#334155",
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                Are you sure you want to
                delete{" "}
                <strong>
                  {deleteTarget.label}
                </strong>
                ? This action cannot be
                undone.
              </p>

              {deleteError && (

                <div className="status-update-error">
                  {deleteError}
                </div>

              )}

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={cancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-btn-danger"
                  onClick={confirmDelete}
                  disabled={deleting}
                >

                  {deleting
                    ? "Deleting..."
                    : "Delete"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;
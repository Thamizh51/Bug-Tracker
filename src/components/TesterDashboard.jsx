import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./DeveloperDashboard.css";
import "./AdminDashboard.css";
import "./TesterDashboard.css";
import { getBugImageUrl } from "../utils/bugMedia";
import BugImage from "./BugImage";

function TesterDashboard() {
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
  // All confirmed against your routes/api.php,
  // EXCEPT the developers list, which is a NEW
  // route + controller method you need to add
  // (see UserController_ADDITION.php and
  // routes_ADDITION.php).
  // ==========================================
  //
  //   GET    /projects                        -> confirmed (ProjectController@show)
  //   GET    /projects/{project}/bugs          -> confirmed (BugController@show)
  //   POST   /projects/{project}/create-bug    -> confirmed (BugController@store)
  //   PUT    /bugs/{bug}                       -> confirmed (BugController@update)
  //   DELETE /bugs/{bug}                       -> confirmed (BugController@destroy)
  //   GET    /admin/developers                 -> NEW, add this route + method first
  //
  // ==========================================

  // ==========================================
  // PREVENT DUPLICATE REQUEST
  // ==========================================

  const projectsApiCalled = useRef(false);
  const developersApiCalled = useRef(false);

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
    user?.name || "Tester";

  const userRole =
    user?.role || "tester";

  const userInitial =
    userName.charAt(0).toUpperCase();

  // ==========================================
  // GET TOKEN HELPER
  // ==========================================

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // ==========================================
  // PROJECTS STATE
  // (tester picks a project to see its bugs)
  // ==========================================

  const [projects, setProjects] =
    useState([]);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [projectsError, setProjectsError] =
    useState("");

  const [selectedProjectId, setSelectedProjectId] =
    useState("");

  const [selectedProject, setSelectedProject] =
    useState(null);

  // ==========================================
  // DEVELOPERS STATE
  // (for the assign dropdown)
  // ==========================================

  const [developers, setDevelopers] =
    useState([]);

  const [loadingDevelopers, setLoadingDevelopers] =
    useState(true);

  const [developersError, setDevelopersError] =
    useState("");

  // ==========================================
  // BUGS STATE
  // ==========================================

  const [bugs, setBugs] = useState([]);

  const [loadingBugs, setLoadingBugs] =
    useState(false);

  const [bugsError, setBugsError] =
    useState("");

  const [projectSearch, setProjectSearch] =
    useState("");

  const [bugSearch, setBugSearch] =
    useState("");

  const [bugStatusFilter, setBugStatusFilter] =
    useState("all");

  // ==========================================
  // CREATE / EDIT BUG MODAL STATE
  // (shared form, "mode" says which)
  // ==========================================

  const [showBugForm, setShowBugForm] =
    useState(false);

  const [formMode, setFormMode] =
    useState("create");
  // "create" | "edit"

  const [editingBugId, setEditingBugId] =
    useState(null);

  const [formTitle, setFormTitle] =
    useState("");

  const [formDescription, setFormDescription] =
    useState("");

  const [formSeverity, setFormSeverity] =
    useState("medium");

  const [formPriority, setFormPriority] =
    useState("medium");

  const [formExpectedResult, setFormExpectedResult] =
    useState("");

  const [formActualResult, setFormActualResult] =
    useState("");

  const [formAssignedTo, setFormAssignedTo] =
    useState("");

  const [formAssignedTeam, setFormAssignedTeam] =
    useState("");

  const [formUrl, setFormUrl] =
    useState("");

  // BUG IMAGE STATE
  const [formImage, setFormImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [savingBug, setSavingBug] =
    useState(false);

  const [bugFormError, setBugFormError] =
    useState("");

  // ==========================================
  // DELETE CONFIRM STATE
  // ==========================================

  const [deleteTarget, setDeleteTarget] =
    useState(null);
  // shape: { id, label }

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

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

      const safeList =
        Array.isArray(projectList)
          ? projectList
          : [];

      setProjects(safeList);

      // Do not auto-open a project.
      // Tester must click a project first.

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
  // GET DEVELOPERS
  // GET /admin/developers (NEW - see notes above)
  // ==========================================

  const fetchDevelopers = async () => {

    try {

      setLoadingDevelopers(true);
      setDevelopersError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      const response = await fetch(
        `${apiurl}/api/admin/developers`,
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
          "Developers API did not return valid JSON."
        );

      }

      const developerList =
        data?.developers ||
        data?.data ||
        (Array.isArray(data)
          ? data
          : []);

      setDevelopers(
        Array.isArray(developerList)
          ? developerList
          : []
      );

    } catch (error) {

      setDevelopersError(
        error?.message ||
        "Unable to fetch developers. Add the /admin/developers route first."
      );

      setDevelopers([]);

    } finally {

      setLoadingDevelopers(false);

    }

  };

  // ==========================================
  // GET BUGS FOR SELECTED PROJECT
  // GET /projects/{project}/bugs (confirmed)
  // ==========================================

  const fetchBugs = async (projectId) => {

    if (!projectId) {
      setBugs([]);
      return;
    }

    try {

      setLoadingBugs(true);
      setBugsError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      const response = await fetch(
        `${apiurl}/api/projects/${projectId}/bugs`,
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
          "Bugs API did not return valid JSON."
        );

      }

      const bugList =
        data?.bugs ||
        data?.data ||
        (Array.isArray(data)
          ? data
          : []);

      setBugs(
        Array.isArray(bugList)
          ? bugList
          : []
      );

    } catch (error) {

      setBugsError(
        error?.message ||
        "Unable to fetch bugs."
      );

      setBugs([]);

    } finally {

      setLoadingBugs(false);

    }

  };

  // ==========================================
  // INITIAL LOAD
  // ONLY ONE REQUEST EACH
  // ==========================================

  useEffect(() => {

    if (projectsApiCalled.current) {
      return;
    }

    projectsApiCalled.current = true;

    fetchProjects();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiurl]);

  useEffect(() => {

    if (developersApiCalled.current) {
      return;
    }

    developersApiCalled.current = true;

    fetchDevelopers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiurl]);

  // ==========================================
  // RE-FETCH BUGS WHENEVER PROJECT CHANGES
  // ==========================================

  useEffect(() => {

    if (selectedProjectId && selectedProject) {
      fetchBugs(selectedProjectId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  // ==========================================
  // OPEN / CLOSE PROJECT
  // ==========================================

  const openProject = (project) => {
    const projectId =
      project?.id ??
      project?.project_id;

    if (!projectId) {
      return;
    }

    setSelectedProject(project);
    setSelectedProjectId(String(projectId));
    setBugsError("");
  };

  const closeProject = () => {
    setSelectedProject(null);
    setSelectedProjectId("");
    setBugs([]);
    setBugsError("");
    setShowBugForm(false);
  };

  // ==========================================
  // OPEN CREATE FORM
  // ==========================================

  const openCreateBug = () => {

    setFormMode("create");
    setEditingBugId(null);
    setFormTitle("");
    setFormDescription("");
    setFormSeverity("medium");
    setFormPriority("medium");
    setFormExpectedResult("");
    setFormActualResult("");
    setFormAssignedTo("");
    setFormAssignedTeam("");
    setFormUrl("");
    setFormImage(null);
    setImagePreview("");
    setBugFormError("");
    setShowBugForm(true);

  };

  // ==========================================
  // OPEN EDIT FORM
  // (pre-fills from the bug row we already have,
  // no extra fetch needed since the bugs list
  // already contains full bug objects)
  // ==========================================

  const openEditBug = (bug) => {
    if (!bug) {
      return;
    }

    const bugId =
      bug?.id ??
      bug?.bug_id;

    if (!bugId) {
      setBugFormError("Bug ID not found.");
      return;
    }

    console.log("Editing bug:", bug);

    setFormMode("edit");
    setEditingBugId(String(bugId));

    setFormTitle(
      bug?.title ??
      ""
    );

    setFormDescription(
      bug?.description ??
      ""
    );

    setFormSeverity(
      String(
        bug?.severity ??
        "medium"
      ).toLowerCase()
    );

    setFormPriority(
      String(
        bug?.priority ??
        "medium"
      ).toLowerCase()
    );

    setFormExpectedResult(
      bug?.expected_result ??
      ""
    );

    setFormActualResult(
      bug?.actual_result ??
      ""
    );

    const assignedDeveloper =
      bug?.assigned_to ??
      bug?.assigned_to_id ??
      bug?.developer_id ??
      "";

    setFormAssignedTo(
      assignedDeveloper
        ? String(assignedDeveloper)
        : ""
    );

    setFormAssignedTeam(
      String(
        bug?.assigned_team ??
        bug?.team ??
        ""
      ).toLowerCase()
    );

    setFormUrl(
      bug?.url ??
      bug?.bug_url ??
      bug?.reference_url ??
      ""
    );

    setFormImage(null);

    setImagePreview(
      getBugImageUrl(
        bug,
        apiurl
      )
    );

    setBugFormError("");
    setShowBugForm(true);
  };

  const closeBugForm = () => {

    if (savingBug) {
      return;
    }

    setShowBugForm(false);

  };

  // ==========================================
  // PARSE LARAVEL VALIDATION ERRORS
  // (shared by create + update)
  // ==========================================

  const parseServerError = (
    responseText,
    fallback
  ) => {

    let serverMessage =
      responseText || fallback;

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

    return serverMessage;

  };

  // ==========================================
  // SAVE BUG (create or edit, based on formMode)
  // POST /projects/{project}/create-bug (confirmed)
  // PUT  /bugs/{bug}                     (confirmed)
  // ==========================================

  const saveBug = async (event) => {
    event.preventDefault();

    try {
      if (!formTitle.trim()) {
        setBugFormError("Please enter a bug title.");
        return;
      }

      if (
        formMode === "create" &&
        !selectedProjectId
      ) {
        setBugFormError(
          "Please select a project first."
        );
        return;
      }

      if (
        formMode === "edit" &&
        !editingBugId
      ) {
        setBugFormError(
          "Bug ID is missing. Please try editing again."
        );
        return;
      }

      setSavingBug(true);
      setBugFormError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      const formData = new FormData();

      formData.append(
        "title",
        formTitle.trim()
      );

      formData.append(
        "description",
        formDescription || ""
      );

      formData.append(
        "severity",
        formSeverity || "medium"
      );

      formData.append(
        "priority",
        formPriority || "medium"
      );

      formData.append(
        "expected_result",
        formExpectedResult || ""
      );

      formData.append(
        "actual_result",
        formActualResult || ""
      );

      formData.append(
        "assigned_to",
        formAssignedTo || ""
      );

      formData.append(
        "assigned_team",
        formAssignedTeam || ""
      );

      formData.append(
        "url",
        formUrl || ""
      );

      if (formImage) {
        formData.append(
          "image",
          formImage
        );
      }

      let endpoint;
      let method;

      if (formMode === "create") {
        endpoint =
          `${apiurl}/api/projects/${selectedProjectId}/create-bug`;

        method = "POST";
      } else {
        endpoint =
          `${apiurl}/api/bugs/${editingBugId}`;

        /*
         * Laravel/PHP can fail to populate multipart
         * FormData correctly for a real PUT request.
         *
         * Use POST + Laravel method spoofing instead.
         */
        formData.append(
          "_method",
          "PUT"
        );

        method = "POST";
      }

      console.log("Saving bug:", {
        mode: formMode,
        bugId: editingBugId,
        endpoint,
        method,
      });

      const response = await fetch(
        endpoint,
        {
          method,
          headers: {
            Accept: "application/json",
            Authorization:
              `Bearer ${token}`,
            "ngrok-skip-browser-warning":
              "true",
          },
          body: formData,
        }
      );

      const responseText =
        await response.text();

      console.log(
        "Save API response:",
        response.status,
        responseText
      );

      if (!response.ok) {
        throw new Error(
          parseServerError(
            responseText,
            `API Error ${response.status}`
          )
        );
      }

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = {};
      }

      console.log(
        "Saved bug response:",
        data
      );

      /*
       * CREATE
       */
      if (formMode === "create") {
        const savedBug =
          data?.bug ||
          data?.data;

        if (savedBug) {
          setBugs(
            (previousBugs) => [
              savedBug,
              ...previousBugs,
            ]
          );
        } else {
          await fetchBugs(
            selectedProjectId
          );
        }
      }

      /*
       * EDIT
       *
       * Reload the list from the backend.
       * This guarantees the edited row displays
       * exactly what the API saved.
       */
      else {
        await fetchBugs(
          selectedProjectId
        );
      }

      setShowBugForm(false);
      setFormMode("create");
      setEditingBugId(null);
      setBugFormError("");

    } catch (error) {
      console.error(
        "Save bug error:",
        error
      );

      setBugFormError(
        error?.message ||
        "Unable to save bug."
      );
    } finally {
      setSavingBug(false);
    }
  };

  // ==========================================
  // DELETE BUG
  // DELETE /bugs/{bug} (confirmed)
  // ==========================================

  const askDeleteBug = (bug) => {

    setDeleteError("");

    setDeleteTarget({
      id: bug.id,
      label:
        bug.title ||
        `Bug #${bug.id}`,
    });

  };

  const cancelDelete = () => {

    if (deleting) {
      return;
    }

    setDeleteTarget(null);
    setDeleteError("");

  };

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

      const response = await fetch(
        `${apiurl}/api/bugs/${deleteTarget.id}`,
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

      setBugs(
        (previousBugs) =>
          previousBugs.filter(
            (bug) =>
              bug.id !==
              deleteTarget.id
          )
      );

      setDeleteTarget(null);

    } catch (error) {

      setDeleteError(
        error?.message ||
        "Unable to delete bug."
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
  // STATUS / HELPER CLASSES
  // ==========================================

  const getStatusClass = (status) => {

    const value =
      String(status || "")
        .toLowerCase()
        .replace("_", "-")
        .replace(" ", "-");

    if (value === "in-progress") {
      return "progress";
    }

    return value;

  };

  const getDeveloperName = (developerId) => {

    if (!developerId) {
      return "Unassigned";
    }

    const match =
      developers.find(
        (developer) =>
          String(developer.id) ===
          String(developerId)
      );

    return (
      match?.name ||
      `${developerId}`
    );

  };

  // ==========================================
  // COUNTS
  // ==========================================

  const totalBugs = bugs.length;

  const openBugs =
    bugs.filter(
      (bug) =>
        String(
          bug?.status || ""
        ).toLowerCase() === "open"
    ).length;

  const unassignedBugs =
    bugs.filter(
      (bug) => !bug?.assigned_to
    ).length;

  const resolvedBugs =
    bugs.filter(
      (bug) =>
        String(
          bug?.status || ""
        ).toLowerCase() ===
        "resolved"
    ).length;

  const visibleProjects = projects.filter((project) => {
    const search = projectSearch.trim().toLowerCase();
    const searchableText = [
      project?.id,
      project?.name,
      project?.project_name,
      project?.title,
      project?.description,
      project?.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return !search || searchableText.includes(search);
  });

  const filteredBugs = bugs.filter((bug) => {
    const status = String(bug?.status || "")
      .toLowerCase()
      .replace("-", "_")
      .replace(" ", "_");
    const search = bugSearch.trim().toLowerCase();
    const searchableText = [
      bug?.id,
      bug?.title,
      bug?.description,
      bug?.severity,
      bug?.priority,
      bug?.assigned_team,
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
            className="user-nav-item active"
          >
            <span>🧪</span>
            Bugs
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
              Tester Dashboard
            </h1>

            <p>
              Welcome back, {userName}!
              Report and track bugs
              across your projects.
            </p>

          </div>

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
            PROJECT / BUG STATISTICS
        ==================================== */}

        {selectedProjectId && (
          <section className="user-stats">

            <div className="user-stat-card">
              <div className="user-stat-icon blue">🐞</div>
              <div>
                <p>Total Bugs</p>
                <h2>{loadingBugs ? "..." : totalBugs}</h2>
                <span>Inside this project</span>
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
              <div className="user-stat-icon orange">👤</div>
              <div>
                <p>Unassigned</p>
                <h2>{loadingBugs ? "..." : unassignedBugs}</h2>
                <span>Waiting for developer</span>
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
            PROJECTS -> PROJECT -> BUGS
        ==================================== */}

        <section className="user-content">

          {!selectedProjectId ? (

            /* ================================
               LEVEL 1: PROJECT LIST
            ================================= */

            <>
              <div className="user-content-header">

                <div>
                  <h2>Projects</h2>
                  <p>
                    Select a project to manage the bugs inside that project.
                  </p>
                </div>

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

                  <button
                    type="button"
                    className="user-create-button"
                    onClick={fetchProjects}
                    disabled={loadingProjects}
                  >
                    {loadingProjects
                      ? "Loading..."
                      : "Refresh Projects"}
                  </button>
                </div>

              </div>

              {projectsError && (
                <div
                  style={{
                    padding: "15px",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    fontWeight: 500,
                  }}
                >
                  {projectsError}
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
                      fontSize: "42px",
                      marginBottom: "10px",
                    }}
                  >
                    📁
                  </div>

                  Loading projects...
                </div>

              ) : visibleProjects.length === 0 ? (

                <div
                  style={{
                    padding: "50px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      fontSize: "42px",
                      marginBottom: "10px",
                    }}
                  >
                    📁
                  </div>

                  No projects found.
                </div>

              ) : (

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "20px",
                  }}
                >

                  {visibleProjects.map((project, index) => {

                    const projectId =
                      project?.id ??
                      project?.project_id ??
                      index + 1;

                    const projectName =
                      project?.name ??
                      project?.project_name ??
                      project?.title ??
                      `Project ${projectId}`;

                    const projectDescription =
                      project?.description ??
                      project?.details ??
                      "No description available.";

                    const projectStatus =
                      project?.status ??
                      project?.project_status ??
                      "active";

                    return (
                      <button
                        type="button"
                        key={projectId}
                        onClick={() => openProject(project)}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "16px",
                          background: "#ffffff",
                          padding: "22px",
                          textAlign: "left",
                          cursor: "pointer",
                          boxShadow:
                            "0 4px 16px rgba(15, 23, 42, 0.08)",
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "18px",
                          }}
                        >
                          <div
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#eff6ff",
                              fontSize: "26px",
                            }}
                          >
                            📁
                          </div>

                          <span
                            className={`user-status ${getStatusClass(
                              projectStatus
                            )}`}
                          >
                            {projectStatus}
                          </span>
                        </div>

                        <h3
                          style={{
                            margin: "0 0 8px",
                            color: "#0f172a",
                            fontSize: "19px",
                          }}
                        >
                          {projectName}
                        </h3>

                        <p
                          style={{
                            margin: "0 0 18px",
                            color: "#64748b",
                            lineHeight: 1.5,
                            minHeight: "45px",
                          }}
                        >
                          {projectDescription}
                        </p>

                        <div
                          style={{
                            borderTop: "1px solid #e2e8f0",
                            paddingTop: "14px",
                            color: "#2563eb",
                            fontWeight: 700,
                            fontSize: "14px",
                          }}
                        >
                          Open Project →
                        </div>

                      </button>
                    );
                  })}

                </div>
              )}
            </>

          ) : (

            /* ================================
               LEVEL 2: SELECTED PROJECT
               BUGS ARE INSIDE THIS PROJECT
            ================================= */

            <>
              <div className="user-content-header">

                <div>

                  <button
                    type="button"
                    onClick={closeProject}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      marginBottom: "8px",
                      cursor: "pointer",
                      fontWeight: 700,
                      color: "#2563eb",
                    }}
                  >
                    ← Back to Projects
                  </button>

                  <h2>
                    📁{" "}
                    {selectedProject?.name ||
                      selectedProject?.project_name ||
                      selectedProject?.title ||
                      `Project ${selectedProjectId}`}
                  </h2>

                  <p>
                    Project → Bugs
                  </p>

                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >

                  <div className="dashboard-filters">
                    <input
                      type="search"
                      value={bugSearch}
                      onChange={(event) =>
                        setBugSearch(event.target.value)
                      }
                      placeholder="Search bugs"
                      aria-label="Search bugs"
                    />

                    <select
                      value={bugStatusFilter}
                      onChange={(event) =>
                        setBugStatusFilter(event.target.value)
                      }
                      aria-label="Filter bugs by status"
                    >
                      <option value="all">All statuses</option>
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() =>
                      fetchBugs(selectedProjectId)
                    }
                    disabled={loadingBugs}
                  >
                    {loadingBugs
                      ? "Loading..."
                      : "Refresh Bugs"}
                  </button>

                  <button
                    type="button"
                    className="user-create-button"
                    onClick={openCreateBug}
                  >
                    + Create Bug
                  </button>

                </div>

              </div>

              {/* PROJECT INFORMATION */}

              <div
                style={{
                  padding: "18px 20px",
                  marginBottom: "20px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <strong>
                  📁 Project:{" "}
                  {selectedProject?.name ||
                    selectedProject?.project_name ||
                    selectedProject?.title ||
                    `Project ${selectedProjectId}`}
                </strong>

                <div
                  style={{
                    marginTop: "6px",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  All bugs created inside this project are shown below.
                </div>
              </div>

              {developersError && (
                <div
                  style={{
                    padding: "15px",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    background: "#fef3c7",
                    color: "#92400e",
                    fontWeight: 500,
                  }}
                >
                  {developersError}
                </div>
              )}

              {bugsError && (
                <div
                  style={{
                    padding: "15px",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    fontWeight: 500,
                  }}
                >
                  {bugsError}
                </div>
              )}

              {/* BUGS INSIDE PROJECT */}

              {loadingBugs ? (

                <div
                  style={{
                    padding: "50px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom: "10px",
                    }}
                  >
                    🐞
                  </div>

                  Loading bugs for this project...
                </div>

              ) : (

                <div className="user-table-container">

                  <table className="user-table">

                    <thead>
                      <tr>
                        <th>Bug ID</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Severity</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredBugs.length > 0 ? (

                        filteredBugs.map((bug) => (

                          <tr key={String(bug?.id ?? bug?.bug_id)}>

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
                              <span
                                className={`user-priority ${String(
                                  bug?.severity || ""
                                ).toLowerCase()}`}
                              >
                                {bug?.severity || "-"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`user-priority ${String(
                                  bug?.priority || ""
                                ).toLowerCase()}`}
                              >
                                {bug?.priority || "-"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`user-status ${getStatusClass(
                                  bug?.status
                                )}`}
                              >
                                {bug?.status || "-"}
                              </span>
                            </td>

                            <td>
                              {getDeveloperName(
                                bug?.assigned_to
                              )}
                            </td>

                            <td>

                              <div className="tester-row-actions">

                                <button
                                  type="button"
                                  className="row-edit-btn"
                                  onClick={() =>
                                    openEditBug(bug)
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="row-delete-btn"
                                  onClick={() =>
                                    askDeleteBug(bug)
                                  }
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>

                        ))

                      ) : (

                        <tr>

                          <td
                            colSpan="8"
                            style={{
                              textAlign: "center",
                              padding: "50px",
                            }}
                          >

                            <div
                              style={{
                                fontSize: "42px",
                                marginBottom: "10px",
                              }}
                            >
                              🐞
                            </div>

                            <strong>
                              {bugSearch || bugStatusFilter !== "all"
                                ? "No bugs match the current filters"
                                : "No bugs in this project"}
                            </strong>

                            <p
                              style={{
                                color: "#64748b",
                                marginTop: "8px",
                              }}
                            >
                              Click "+ Create Bug" to create the
                              first bug for this project.
                            </p>

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

      </main>

      {/* ======================================
          CREATE / EDIT BUG MODAL
      ====================================== */}

      {showBugForm && (

        <div
          className="bug-modal-overlay"
          onClick={closeBugForm}
        >

          <div
            className="bug-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="bug-modal-header">

              <div>

                <h2>
                  {formMode === "create"
                    ? "Create Bug"
                    : "Edit Bug"}
                </h2>

                <span>
                  {formMode === "create"
                    ? "Report a new bug for this project"
                    : `Editing #BUG-${editingBugId}`}
                </span>

              </div>

              <button
                className="bug-modal-close"
                onClick={closeBugForm}
              >
                ×
              </button>

            </div>

            <form
              className="admin-form"
              onSubmit={saveBug}
            >

              <div className="admin-form-group">

                <label>
                  Bug Title
                </label>

                <input
                  type="text"
                  value={formTitle}
                  onChange={(event) =>
                    setFormTitle(
                      event.target.value
                    )
                  }
                  placeholder="Login button unresponsive on Safari"
                  disabled={savingBug}
                />

              </div>

              <div className="admin-form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={
                    formDescription
                  }
                  onChange={(event) =>
                    setFormDescription(
                      event.target.value
                    )
                  }
                  placeholder="What's happening, and how to reproduce it"
                  disabled={savingBug}
                  rows={3}
                />

              </div>

              <div className="tester-form-row">

                <div className="admin-form-group">

                  <label>
                    Severity
                  </label>

                  <select
                    value={
                      formSeverity
                    }
                    onChange={(event) =>
                      setFormSeverity(
                        event.target.value
                      )
                    }
                    disabled={savingBug}
                  >

                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>

                  </select>

                </div>

                <div className="admin-form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    value={
                      formPriority
                    }
                    onChange={(event) =>
                      setFormPriority(
                        event.target.value
                      )
                    }
                    disabled={savingBug}
                  >

                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>

                  </select>

                </div>

              </div>

              <div className="admin-form-group">

                <label>
                  Expected Result
                </label>

                <textarea
                  value={
                    formExpectedResult
                  }
                  onChange={(event) =>
                    setFormExpectedResult(
                      event.target.value
                    )
                  }
                  placeholder="What should happen"
                  disabled={savingBug}
                  rows={2}
                />

              </div>

              <div className="admin-form-group">

                <label>
                  Actual Result
                </label>

                <textarea
                  value={
                    formActualResult
                  }
                  onChange={(event) =>
                    setFormActualResult(
                      event.target.value
                    )
                  }
                  placeholder="What actually happens instead"
                  disabled={savingBug}
                  rows={2}
                />

              </div>

              <div className="admin-form-group">

                <label>
                  Assign To
                </label>

                <select
                  value={
                    formAssignedTo
                  }
                  onChange={(event) =>
                    setFormAssignedTo(
                      event.target.value
                    )
                  }
                  disabled={
                    savingBug ||
                    loadingDevelopers
                  }
                >

                  <option value="">
                    Unassigned
                  </option>

                  {developers.map(
                    (developer) => (

                      <option
                        key={
                          developer.id
                        }
                        value={
                          developer.id
                        }
                      >
                        {developer.name}
                      </option>

                    )
                  )}

                </select>

              </div>

              <div className="admin-form-group">

                <label>
                  Assigned Team
                </label>

                <select
                  value={formAssignedTeam}
                  onChange={(event) =>
                    setFormAssignedTeam(event.target.value)
                  }
                  disabled={savingBug}
                >

                  <option value="">
                    Select a team
                  </option>

                  <optgroup label="Frontend">
                    <option value="frontend">
                      Frontend
                    </option>
                  </optgroup>

                  <optgroup label="Backend">
                    <option value="backend">
                      Backend
                    </option>
                  </optgroup>

                </select>

              </div>

              <div className="admin-form-group">

                <label htmlFor="bug-url">
                  Bug URL
                </label>

                <input
                  id="bug-url"
                  type="url"
                  value={formUrl}
                  onChange={(event) =>
                    setFormUrl(event.target.value)
                  }
                  placeholder="https://example.com/page-with-the-bug"
                  disabled={savingBug}
                />

              </div>

              {/* BUG IMAGE / SCREENSHOT */}
              <div className="admin-form-group">

                <label htmlFor="bug-image">
                  Bug Image / Screenshot
                </label>

                <input
                  id="bug-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      setBugFormError("Image must be 5 MB or smaller.");
                      event.target.value = "";
                      return;
                    }

                    setBugFormError("");
                    setFormImage(file);

                    const previewUrl = URL.createObjectURL(file);
                    setImagePreview(previewUrl);
                  }}
                  disabled={savingBug}
                />

                {imagePreview && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      background: "#f8fafc",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Bug screenshot preview"
                      style={{
                        display: "block",
                        width: "100%",
                        maxHeight: "240px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        background: "#ffffff",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setFormImage(null);
                        setImagePreview("");
                      }}
                      disabled={savingBug}
                      style={{
                        marginTop: "10px",
                        border: "none",
                        background: "#fee2e2",
                        color: "#dc2626",
                        padding: "8px 12px",
                        borderRadius: "7px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                <small style={{ color: "#64748b", marginTop: "6px" }}>
                  PNG, JPG, JPEG, WEBP or GIF. Maximum 5 MB.
                </small>

              </div>

              {bugFormError && (

                <div className="status-update-error">
                  {bugFormError}
                </div>

              )}

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={closeBugForm}
                  disabled={savingBug}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bug-status-update-btn"
                  disabled={savingBug}
                >

                  {savingBug
                    ? "Saving..."
                    : formMode === "create"
                    ? "Create Bug"
                    : "Save Changes"}

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
    
export default TesterDashboard;
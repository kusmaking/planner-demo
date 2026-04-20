(()=> {
  const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const state = {
    employees: [],
    projects: [],
    entries: [],
    auditLog: [],
    notificationLog: [],
    currentUser: "Ikke innlogget",
    currentUserEmail: "",
    currentRole: "",
    authReady: false,
    employeeFilter: "Alle ansatte",
    selectedEmployeeGroups: [],
    groupFilterSearch: "",
    employeeGroupFilterOpen: false,
    search: "",
    viewMode: "Måned",
    calendarMode: load(STORAGE_KEYS.calendarMode, "personal"),
    startDate: startOfCurrentMonth(),
    selectedEntryId: null,
    selectedProjectId: null,
    selectedEmployeeId: null,
    storageMode: "local",
    supabaseReady: false,
    supabaseError: null,
    remoteCapabilities: {
      employeeGroupColumn: false
    },
    sync: {
      channel: null,
      pollingTimer: null,
      pendingRefresh: false,
      fetchInFlight: false,
      lastRemoteRefreshAt: 0
    },
    derived: {
      projectById: new Map(),
      entriesByEmployee: new Map(),
      entryCountByProject: new Map()
    },
    dragEntryId: null,
    justDraggedEntryId: null,
    dragAnchor: {
      timeUnit: "day",
      slotOffset: 0
    },
    resize: {
      active: false,
      type: "",
      targetId: "",
      row: null,
      bar: null,
      originalEndDate: "",
      previewEndDate: "",
      originalValueSnapshot: null
    },
    activeTab: "calendar",
    calendarPanelOpen: false,
    projectListFilter: "all",
    contextMenu: {
      visible: false,
      employeeName: "",
      startDate: "",
      endDate: "",
      x: 0,
      y: 0
    },
    availability: {
      open: true,
      available: [],
      unavailable: [],
      summary: null,
      filters: {
        selectedGroups: [],
        showAvailableOnly: false,
        showUnavailableOnly: false
      }
    }
  };

  const els = {};
  const PERSONAL_BLOCK_TYPES = ["Kurs", "Ferie", "Syk", "Avspasering"];
  const PERSONAL_PROJECT_MARKER = "__personal_block_system_project__";
  const EMPLOYEE_GROUP_OPTIONS = [
    "",
    "Offshore arbeider",
    "Onshore arbeider",
    "Lager og logistikk",
    "Engineer",
    "3 parts innleie"
  ];
  const EMPLOYEE_GROUP_STORAGE_KEY = "planner_employee_groups_v41";
  const EMPLOYEE_GROUP_CARD_STYLES = {
    "Offshore arbeider": "border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50",
    "Onshore arbeider": "border-blue-500 bg-blue-50/40 hover:bg-blue-50",
    "Lager og logistikk": "border-amber-500 bg-amber-50/40 hover:bg-amber-50",
    "Engineer": "border-violet-500 bg-violet-50/40 hover:bg-violet-50",
    "3 parts innleie": "border-rose-500 bg-rose-50/40 hover:bg-rose-50"
  };
  const EMPLOYEE_GROUP_BADGE_STYLES = {
    "Offshore arbeider": "border-emerald-200 bg-emerald-50 text-emerald-800",
    "Onshore arbeider": "border-blue-200 bg-blue-50 text-blue-800",
    "Lager og logistikk": "border-amber-200 bg-amber-50 text-amber-800",
    "Engineer": "border-violet-200 bg-violet-50 text-violet-800",
    "3 parts innleie": "border-rose-200 bg-rose-50 text-rose-800"
  };
  const EMPLOYEE_GROUP_DOT_STYLES = {
    "Offshore arbeider": "bg-emerald-500",
    "Onshore arbeider": "bg-blue-500",
    "Lager og logistikk": "bg-amber-500",
    "Engineer": "bg-violet-500",
    "3 parts innleie": "bg-rose-500"
  };
  const EMPLOYEE_GROUP_ORDER = {
    "Offshore arbeider": 1,
    "Onshore arbeider": 2,
    "Lager og logistikk": 3,
    "Engineer": 4,
    "3 parts innleie": 5
  };
  const EMPLOYEE_GROUP_FILTER_ALL_VALUE = "__all__";
  let saveStatusTimer = null;
  let calendarScrollSyncRaf = null;

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("resize", debounce(() => renderCalendar(), 120));

  async function init() {
    cacheElements();
    ensureEmployeeGroupFilterControl();
    ensureAccountPanel();
    ensurePersonalBlockPanel();
    ensureCalendarContextMenu();
    ensureAvailabilityPanel();
    setupStaticOptions();
    bindEvents();

    state.viewMode = "Måned";
    state.startDate = startOfCurrentMonth();
    persistUiState();

    await loadAuthUser();

    if (supabaseClient?.auth) {
      supabaseClient.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          window.location.replace(window.location.origin + window.location.pathname);
        }
      });
    }

    await bootData();
    rebuildDerivedState();
    renderAll();
    clearAssignForm();
    clearPersonalBlockForm();
    applyRoleChrome();
    startRemoteSync();
  }

  function cacheElements() {
    const ids = [
      "statsRow", "searchInput", "employeeFilter", "viewMode", "calendarMode", "prevBtn", "nextBtn", "todayBtn",
      "calendarWrap", "warningBox", "legendList", "projectList", "assignProject", "assignEmployeesWrap", "assignSummary", "assignRole",
      "assignStart", "assignEnd", "assignNotes", "assignBtn", "bulkEmployees", "bulkAddBtn",
      "employeeList", "kanbanBoard", "notificationList", "auditList", "editModal", "closeModalBtn",
      "editProject", "editEmployee", "editRole", "editStart", "editEnd", "editNotes",
      "saveEditBtn", "deleteEditBtn", "storageBadge", "resetDemoBtn", "systemStatus", "rangeTitle",
      "saveStatus", "plannerTabs", "tabCalendarBtn", "tabProjectsBtn", "tabEmployeesBtn", "tabAdminBtn", "tabCalendarSection", "tabProjectsSection", "tabEmployeesSection", "tabAdminSection", "calendarMainCol", "calendarPanelCol", "calendarPanelHandleBtn", "calendarPanelCloseBtn", "calendarPanelContent", "newProjectBtn", "projectModal", "projectModalTitle", "closeProjectModalBtn",
      "projectName", "projectCategory", "projectStatus", "projectPlannedStart", "projectPlannedEnd",
      "projectLocation", "projectHeadcount", "projectNotes", "saveProjectBtn", "deleteProjectBtn",
      "newEmployeeBtn", "employeeModal", "employeeModalTitle", "closeEmployeeModalBtn",
      "employeeName", "employeeEmail", "employeePhone", "employeeTitle", "employeeGroup", "employeeActive", "saveEmployeeBtn", "deleteEmployeeBtn",
      "calendarContextMenu", "contextMenuEmployee", "contextMenuStart", "contextMenuEnd", "contextMenuType", "contextMenuNotes", "contextMenuAddBtn", "contextMenuCloseBtn",
      "accountPanel", "accountUserInfo", "changePasswordBtn", "resetPasswordBtn", "logoutBtn", "loginBtn", "loginModal", "closeLoginModalBtn", "loginEmail", "loginPassword", "loginSubmitBtn", "forgotPasswordBtn"
    ];

    ids.forEach(id => els[id] = document.getElementById(id));
  }

  function ensureAvailabilityPanel() {
    const projectsSection = els.tabProjectsSection;
    if (!projectsSection) return;

    if (document.getElementById("availabilityCard")) {
      els.availabilityCard = document.getElementById("availabilityCard");
      els.availabilitySummary = document.getElementById("availabilitySummary");
      els.availabilityAvailableList = document.getElementById("availabilityAvailableList");
      els.availabilityUnavailableList = document.getElementById("availabilityUnavailableList");
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "xl:col-span-4";
    wrapper.innerHTML = `
      <div id="availabilityCard" class="rounded-2xl bg-white border border-slate-200 shadow-sm h-full">
        <div class="p-4 border-b border-slate-200">
          <h2 class="font-semibold">Tilgjengelighetsanalyse ved bemanning</h2>
          <p class="text-sm text-slate-500 mt-1">Viser hvem som er ledige og hvem som har konflikt i valgt periode.</p>
        </div>
        <div class="p-4 space-y-4">
          <div id="availabilitySummary" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">Velg prosjekt og periode for å analysere tilgjengelighet.</div>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div>
              <div class="mb-2 flex items-center justify-between gap-2">
                <h3 class="font-medium text-green-700">Tilgjengelige ansatte</h3>
                <span id="availabilityAvailableCount" class="text-xs text-slate-500"></span>
              </div>
              <div id="availabilityAvailableList" class="space-y-2"></div>
            </div>
            <div>
              <div class="mb-2 flex items-center justify-between gap-2">
                <h3 class="font-medium text-red-700">Ikke tilgjengelige ansatte</h3>
                <span id="availabilityUnavailableCount" class="text-xs text-slate-500"></span>
              </div>
              <div id="availabilityUnavailableList" class="space-y-2"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const anchor = projectsSection.lastElementChild || projectsSection;
    projectsSection.appendChild(wrapper);

    els.availabilityCard = document.getElementById("availabilityCard");
    els.availabilitySummary = document.getElementById("availabilitySummary");
    els.availabilityAvailableList = document.getElementById("availabilityAvailableList");
    els.availabilityUnavailableList = document.getElementById("availabilityUnavailableList");
    els.availabilityAvailableCount = document.getElementById("availabilityAvailableCount");
    els.availabilityUnavailableCount = document.getElementById("availabilityUnavailableCount");
  }

  function analyzeAvailabilityForPeriod(projectId, startDate, endDate) {
    const activeEmployees = state.employees
      .filter(employee => employee.active !== fal

(() => {
  // v18.49b-employee-crew-layout-fix-safe
  // v18.48-employee-calendar-layout-v1-safe
  // v18.54-access-user-management-ui-v1
  // v18.53-access-one-flow-employee-setup-ui-v1
  // v18.51-access-setup-checklist-ui-v1-safe
  // v18.50-access-setup-rpc-ui-v1-safe
  // v18.43-access-management-v1-safe
  // v18.42-access-approval-v1-safe
  // v18.41-access-request-v1-safe
  // v18.40c-import-workshop-date-only-create-safe
  // v18.40b-import-workshop-only-no-change-detection-safe
  // v18.40a-import-selection-summary-and-row-status-safe
  // v18.39b-clean-project-search-and-phase-filter-safe
  // v18.39a-project-responsible-customer-fields-safe
  // v18.38e-import-notes-project-responsible-only-safe
  // v18.38d-import-duplicate-match-project-code-safe
  // v18.38c-import-batch-notes-confirmation-safe
  // v18.38b-import-default-deselected-safe
  // v18.38a-import-selected-projects-test-mode-safe
  // v18.37j-import-workshop-only-fleet-delta-preview-safe
  // v18.37i-import-worklist-norwegian-date-input-safe
  // v18.37h-import-worklist-responsible-clean-layout-safe
  // v18.37g-import-worklist-full-width-preview-only-safe
  // v18.37f-import-approval-list-preview-only-safe
  // v18.37e-keep-import-preview-state-safe
  // v18.32b-final-login-startpage-gradient-safe
  // v18.31g-sandbox-project-modal-scroll-safe
  // v18.19-ansattplan-project-focus-toggle-safe
  // v18.11: plain visible available-row render for project inspector.
  const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const state = {
    employees: [],
    projects: [],
    entries: [],
    auditLog: [],
    notificationLog: [],
    currentUser: "Ikke innlogget",
    currentUserEmail: "",
    currentUserId: "",
    currentRole: "",
    currentUserIsActive: true,
    authReady: false,
    employeePortalSelectedProjectId: "",
    employeePortalSelectedEntryId: "",
    employeePortalProjectDetailsOpen: false,
    employeePortalCrewByProject: {},
    employeePortalCrewFetchError: "",
    employeeFilter: "Alle ansatte",
    selectedEmployeeGroups: [],
    groupFilterSearch: "",
    employeeGroupFilterOpen: false,
    collapsedEmployeeGroups: load("planner_collapsed_employee_groups_v1", []),
    projectSpotlightId: "",
    search: "",
    viewMode: "Måned",
    calendarMode: load(STORAGE_KEYS.calendarMode, "personal"),
    startDate: startOfCurrentMonth(),
    selectedEntryId: null,
    selectedProjectId: null,
    selectedEmployeeId: null,
    employeeAdminSelectedId: null,
    focusProjectId: "",
    projectModalPeriods: [],
    selectedAssignPeriodId: "",
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
    dragWorkshopProjectId: null,
    dragFieldProjectId: null,
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
    activeTab: "home",
    calendarPanelOpen: false,
    projectListFilter: "all",
    projectPhaseFilter: "all",
    projectSearchReturnStartDate: null,
    dashboardEmployeeFilter: "",
    dashboardEmployeeFilterLabel: "",
    projectInspectorSearch: "",
    projectInspectorGroup: "all",
    projectInspectorShowAvailable: false,
    projectInspectorAddCandidateName: "",
    projectInspectorAddRole: "",
    projectInspectorAddUseCustomRange: false,
    projectInspectorAddCustomStart: "",
    projectInspectorAddCustomEnd: "",
    projectInspectorSelectedNames: [],
    projectInspectorBatchMode: false,
    projectInspectorPendingDeleteIds: new Set(),
    projectWorkbenchWindow: null,
    projectImportPreview: {
      fileName: "",
      rowCount: 0,
      counts: { total: 0, readyNew: 0, workshopOnly: 0, noChange: 0, dateUpdate: 0, missingOperationDate: 0, missingHeadcount: 0, workshopDateError: 0, notReady: 0 },
      examples: { readyNew: [], workshopOnly: [], noChange: [], dateUpdate: [], missingOperationDate: [], missingHeadcount: [], workshopDateError: [], notReady: [] },
      approvalRows: [],
      selectedIds: [],
      importResults: {},
      lastImportSummary: null,
      statusText: "Ingen fil valgt."
    },
    contextMenu: {
      visible: false,
      employeeName: "",
      startDate: "",
      endDate: "",
      x: 0,
      y: 0
    },
    availability: {
      available: [],
      unavailable: [],
      summary: null
    },
    accessRequests: {
      rows: [],
      loading: false,
      error: "",
      lastLoadedAt: ""
    },
    accessUsers: {
      rows: [],
      loading: false,
      error: "",
      lastLoadedAt: ""
    },
    accessUserDrafts: {
      passwords: {}
    },
    employeeAccessPanelEmployeeId: "",
    employeeAccessPanelRequestId: ""
  };

  const els = {};
  const PERSONAL_BLOCK_TYPES = ["Kurs", "Ferie", "Syk", "Avspasering", "Travel"];
  const PROJECT_STATUS_OPTIONS = ["Planlagt", "Pågår", "Avventer", "Fullført", "Kansellert"];
  const PERSONAL_PROJECT_MARKER = "__personal_block_system_project__";
  // v18.20-personalblock-modal-click-guard-safe
  const EMPLOYEE_GROUP_DEFINITIONS = [
    {
      value: "Offshore arbeider",
      label: "Offshore",
      icon: "plane",
      order: 1,
      aliases: ["Offshore", "Offshore arbeider"],
      cardClass: "border-slate-200 bg-white/80 hover:bg-slate-50",
      badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
      dotClass: "bg-slate-400",
      calendarCellClass: "bg-white text-slate-900"
    },
    {
      value: "Onshore arbeider",
      label: "Workshop technician",
      icon: "tools",
      order: 2,
      aliases: ["Onshore", "Onshore arbeider"],
      cardClass: "border-slate-200 bg-white/80 hover:bg-slate-50",
      badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
      dotClass: "bg-slate-400",
      calendarCellClass: "bg-white text-slate-900"
    },
    {
      value: "Lager og logistikk",
      label: "Lager og logistikk",
      icon: "box",
      order: 3,
      aliases: ["Lager og logistikk", "Lager/logistikk"],
      cardClass: "border-slate-200 bg-white/80 hover:bg-slate-50",
      badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
      dotClass: "bg-slate-400",
      calendarCellClass: "bg-white text-slate-900"
    },
    {
      value: "Engineering",
      label: "Engineering",
      icon: "gear",
      order: 4,
      aliases: ["Engineer", "Engineering"],
      cardClass: "border-slate-200 bg-white/80 hover:bg-slate-50",
      badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
      dotClass: "bg-slate-400",
      calendarCellClass: "bg-white text-slate-900"
    },
    {
      value: "3 parts innleie",
      label: "3 parts innleie",
      icon: "network",
      order: 5,
      aliases: ["3 parts innleie", "3 Parts innleie", "3 party"],
      cardClass: "border-slate-200 bg-white/80 hover:bg-slate-50",
      badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
      dotClass: "bg-slate-400",
      calendarCellClass: "bg-white text-slate-900"
    },
    {
      value: "Management",
      label: "Management",
      icon: "people",
      order: 6,
      aliases: ["Management", "Managment"],
      cardClass: "border-slate-200 bg-white/80 hover:bg-slate-50",
      badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
      dotClass: "bg-slate-400",
      calendarCellClass: "bg-white text-slate-900"
    },
    {
      value: "Prosjektledelse / planlegging",
      label: "Prosjektledelse / planlegging",
      icon: "clipboard",
      order: 7,
      aliases: ["Prosjektledelse / planlegging", "Prosjektledelse", "Project managers / planners", "Project Managers / Planners", "Project managers", "Planners", "Planner", "Planleggere"],
      cardClass: "border-slate-200 bg-white/80 hover:bg-slate-50",
      badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
      dotClass: "bg-slate-400",
      calendarCellClass: "bg-white text-slate-900"
    }
  ];
  const EMPLOYEE_GROUP_OPTIONS = ["", ...EMPLOYEE_GROUP_DEFINITIONS.map(group => group.value)];
  const EMPLOYEE_GROUP_STORAGE_KEY = "planner_employee_groups_v41";
  const EMPLOYEE_GROUP_CARD_STYLES = Object.fromEntries(EMPLOYEE_GROUP_DEFINITIONS.map(group => [group.value, group.cardClass]));
  const EMPLOYEE_GROUP_BADGE_STYLES = Object.fromEntries(EMPLOYEE_GROUP_DEFINITIONS.map(group => [group.value, group.badgeClass]));
  const EMPLOYEE_GROUP_DOT_STYLES = Object.fromEntries(EMPLOYEE_GROUP_DEFINITIONS.map(group => [group.value, group.dotClass]));
  const EMPLOYEE_GROUP_CALENDAR_CELL_STYLES = Object.fromEntries(EMPLOYEE_GROUP_DEFINITIONS.map(group => [group.value, group.calendarCellClass]));
  const EMPLOYEE_GROUP_ORDER = Object.fromEntries(EMPLOYEE_GROUP_DEFINITIONS.map(group => [group.value, group.order]));
  const EMPLOYEE_GROUP_META = Object.fromEntries(EMPLOYEE_GROUP_DEFINITIONS.map(group => [group.value, group]));
  const EMPLOYEE_GROUP_ALIAS_MAP = EMPLOYEE_GROUP_DEFINITIONS.reduce((map, group) => {
    group.aliases.forEach(alias => {
      map[String(alias || "").trim().toLowerCase()] = group.value;
    });
    map[String(group.value || "").trim().toLowerCase()] = group.value;
    return map;
  }, {});
  const EMPLOYEE_GROUP_FILTER_ALL_VALUE = "__all__";
  let saveStatusTimer = null;
  let calendarScrollSyncRaf = null;

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("resize", debounce(() => renderCalendar(), 120));

  async function init() {
    cacheElements();
    hardenSearchInput();
    ensureEmployeeGroupFilterControl();
    ensureProjectFilterControl();
    ensureCalendarNewProjectButton();
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

    if (isLoggedInUser() && state.currentUserIsActive === false) {
      await supabaseClient?.auth?.signOut?.();
      state.currentUser = "Ikke innlogget";
      state.currentUserEmail = "";
      state.currentUserId = "";
      state.currentRole = "";
      state.currentUserIsActive = true;
      showStartPage();
      setStartLoginError("Tilgangen din er deaktivert. Kontakt superadmin.");
      window.izomaxApplyLanguage?.();
      return;
    }

    if (!isLoggedInUser()) {
      showStartPage();
      window.izomaxApplyLanguage?.();
      return;
    }

    showPlannerApp();
    window.izomaxApplyLanguage?.();

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

    if (!isEmployeePortalUser()) {
      clearAssignForm();
      clearPersonalBlockForm();
      applyRoleChrome();
    }

    startRemoteSync();
  }

  function cacheElements() {
    const ids = [
      "statsRow", "searchInput", "employeeFilter", "projectFilterControl", "calendarNewProjectBtn", "viewMode", "calendarMode", "personalPlanQuickBtn", "projectPlanQuickBtn", "unstaffedProjectsQuickBtn", "prevBtn", "nextBtn", "todayBtn",
      "calendarWrap", "holidayInfo", "projectSpotlightBar", "warningBox", "legendList", "projectList", "projectWorkspaceCard", "projectWorkspaceEmpty", "projectWorkspaceContent", "projectWorkspaceTitle", "projectWorkspaceMeta", "projectWorkspaceNotes", "projectWorkspaceAssignments", "projectWorkspaceActions", "assignProject", "assignPeriodWrap", "assignPeriod", "assignPeriodHint", "assignPeriodNav", "assignPrevPeriodBtn", "assignNextPeriodBtn", "assignEmployeesWrap", "assignSummary", "assignRole",
      "assignStart", "assignEnd", "assignNotes", "assignBtn", "bulkEmployees", "bulkAddBtn",
      "employeeList", "kanbanBoard", "notificationList", "auditList", "editModal", "closeModalBtn",
      "editProject", "editEmployee", "editRole", "editStart", "editEnd", "editNotes",
      "saveEditBtn", "deleteEditBtn", "storageBadge", "resetDemoBtn", "systemStatus", "rangeTitle",
      "saveStatus", "plannerTabs", "tabHomeBtn", "tabProjectPlanBtn", "tabUnstaffedBtn", "tabCalendarBtn", "tabProjectsBtn", "tabEmployeesBtn", "tabAdminBtn", "tabHomeSection", "homeDashboard", "tabCalendarSection", "tabProjectsSection", "tabEmployeesSection", "tabAdminSection", "calendarMainCol", "calendarPanelCol", "calendarPanelHandleBtn", "calendarPanelCloseBtn", "calendarPanelContent", "newProjectBtn", "projectModal", "projectModalTitle", "closeProjectModalBtn",
      "projectName", "projectCategory", "projectStatus", "projectPlannedStart", "projectPlannedEnd", "projectHasMultiplePeriods", "projectPeriodsSection", "projectPeriodsList", "addProjectPeriodBtn",
      "projectWorkshopEnabled", "projectWorkshopStart", "projectWorkshopEnd", "projectWorkshopHeadcount", "projectWorkshopAddBtn", "projectWorkshopRemoveBtn",
      "projectResponsible", "projectLocation", "projectHeadcount", "projectNotes", "saveProjectBtn", "deleteProjectBtn",
      "newEmployeeBtn", "employeeModal", "employeeModalTitle", "closeEmployeeModalBtn",
      "employeeName", "employeeEmail", "employeePhone", "employeeTitle", "employeeGroup", "employeeActive", "saveEmployeeBtn", "deleteEmployeeBtn",
      "calendarContextMenu", "contextMenuEmployee", "contextMenuStart", "contextMenuEnd", "contextMenuType", "contextMenuNotes", "contextMenuAddBtn", "contextMenuCloseBtn",
      "employeePortalShell", "employeePortalContent", "employeePortalTopInitials", "employeePortalTopName", "employeePortalLogoutBtn", "plannerStartPage", "plannerAppShell", "startLoginEmail", "startLoginPassword", "startLoginSubmitBtn", "startForgotPasswordBtn", "startAccessHelpBtn", "startLoginError", "accessRequestModal", "accessRequestCloseBtn", "accessRequestCancelBtn", "accessRequestSubmitBtn", "accessRequestName", "accessRequestEmail", "accessRequestPhone", "accessRequestType", "accessRequestMessage", "accessRequestFeedback", "accessApprovalList", "accessApprovalRefreshBtn", "accessApprovalStatus", "accessUsersList", "accessUsersRefreshBtn", "accessUsersStatus", "accountPanel", "accountUserInfo", "changePasswordBtn", "resetPasswordBtn", "logoutBtn", "loginBtn", "loginModal", "closeLoginModalBtn", "loginEmail", "loginPassword", "loginSubmitBtn", "forgotPasswordBtn"
    ];

    ids.forEach(id => els[id] = document.getElementById(id));
  }




  function hardenSearchInput() {
    if (!els.searchInput) return;
    els.searchInput.value = "";
    els.searchInput.setAttribute("autocomplete", "off");
    els.searchInput.setAttribute("autocorrect", "off");
    els.searchInput.setAttribute("autocapitalize", "none");
    els.searchInput.setAttribute("spellcheck", "false");
    els.searchInput.setAttribute("name", "planner_search_filter_no_autofill");
    els.searchInput.setAttribute("data-lpignore", "true");
    els.searchInput.removeAttribute("data-ix-placeholder-key");
    els.searchInput.addEventListener("focus", () => {
      const currentSearchValue = String(els.searchInput.value || "").trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentSearchValue)) {
        els.searchInput.value = "";
        state.search = "";
      }
    });
  }

  function startOfWeekMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getMonthHeaderGroups(days) {
    const groups = [];
    for (const day of days) {
      const key = `${day.getFullYear()}-${day.getMonth()}`;
      const label = `${capitalize(monthLong(day))} ${day.getFullYear()}`;
      const current = groups[groups.length - 1];
      if (current && current.key === key) current.count += 1;
      else groups.push({ key, label, count: 1 });
    }
    return groups;
  }

  function getWeekHeaderGroups(days) {
    const groups = [];
    for (const day of days) {
      const weekStart = startOfWeekMonday(day);
      const key = toIsoDate(weekStart);
      const label = `Uke ${getIsoWeek(day)}`;
      const current = groups[groups.length - 1];
      if (current && current.key === key) current.count += 1;
      else groups.push({ key, label, count: 1 });
    }
    return groups;
  }

  function getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function isNorwegianHoliday(date) {
    if (!date) return false;
    const year = date.getFullYear();
    const easter = getEasterSunday(year);
    const fixed = new Set([
      `${year}-01-01`,
      `${year}-05-01`,
      `${year}-05-17`,
      `${year}-12-25`,
      `${year}-12-26`
    ]);
    const movable = [
      addDays(easter, -3),
      addDays(easter, -2),
      easter,
      addDays(easter, 1),
      addDays(easter, 39),
      addDays(easter, 49),
      addDays(easter, 50)
    ].map(toIsoDate);
    const iso = toIsoDate(date);
    return fixed.has(iso) || movable.includes(iso);
  }

  function isRedDay(date) {
    return !!date && (date.getDay() === 0 || isNorwegianHoliday(date));
  }

  function isTodayDate(date) {
    return !!date && toIsoDate(date) === toIsoDate(new Date());
  }

  // v18.62al: clean today marker. No badge text and no blue column fill.
  // A single vertical overlay line marks today without creating horizontal marks in project bars.
  function getTodayColumnStyle(date, mode = "cell") {
    if (!isTodayDate(date)) return "";
    if (mode === "header") {
      return "color:#1d4ed8; font-weight:800; box-shadow:none; outline:none; position:relative; z-index:5;";
    }
    return "background:transparent; box-shadow:none; outline:none;";
  }

  function getTodayHeaderBadgeHtml(date) {
    return "";
  }

  function renderTodayLineOverlay(days, stickyWidth, colWidth) {
    const todayIndex = days.findIndex(day => isTodayDate(day));
    if (todayIndex < 0) return "";
    const left = stickyWidth + (todayIndex * colWidth) + Math.floor(colWidth / 2);
    return `<div class="today-clean-line" aria-hidden="true" style="left:${left}px;"></div>`;
  }

  function getHolidayNamesForYear(year) {
    const easter = getEasterSunday(year);
    return [
      { date: new Date(year, 0, 1), label: "1. nyttårsdag" },
      { date: addDays(easter, -3), label: "Skjærtorsdag" },
      { date: addDays(easter, -2), label: "Langfredag" },
      { date: easter, label: "1. påskedag" },
      { date: addDays(easter, 1), label: "2. påskedag" },
      { date: new Date(year, 4, 1), label: "1. mai" },
      { date: new Date(year, 4, 17), label: "17. mai" },
      { date: addDays(easter, 39), label: "Kristi himmelfartsdag" },
      { date: addDays(easter, 49), label: "1. pinsedag" },
      { date: addDays(easter, 50), label: "2. pinsedag" },
      { date: new Date(year, 11, 25), label: "1. juledag" },
      { date: new Date(year, 11, 26), label: "2. juledag" }
    ];
  }

  function renderHolidayInfo(range) {
    if (!els.holidayInfo) return;
    const names = [];
    for (let year = range.start.getFullYear(); year <= range.end.getFullYear(); year++) {
      for (const holiday of getHolidayNamesForYear(year)) {
        if (holiday.date >= range.start && holiday.date <= range.end) {
          names.push(`${holiday.label} (${formatDate(holiday.date)})`);
        }
      }
    }
    els.holidayInfo.textContent = names.length
      ? `Helligdager i perioden: ${names.join(" • ")}`
      : "Ingen helligdager i valgt periode.";
  }

  function renderTimelineHeaderRows(days, leftLabel = "Ansatt") {
    const monthGroups = getMonthHeaderGroups(days);
    const weekGroups = getWeekHeaderGroups(days);
    let html = '';

    html += `<div class="sticky-col z-40 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-semibold">${escapeHtml(leftLabel)}</div>`;
    for (const group of monthGroups) {
      html += `<div class="border-b border-r border-slate-200 bg-slate-50 px-2 py-3 text-center text-sm font-semibold" style="grid-column: span ${group.count};">${escapeHtml(group.label)}</div>`;
    }

    html += `<div class="sticky-col z-40 border-b border-r border-slate-200 bg-slate-50 px-3 py-2"></div>`;
    for (const group of weekGroups) {
      html += `<div class="border-b border-r border-slate-200 bg-white px-1 py-2 text-center text-[11px] text-slate-600" style="grid-column: span ${group.count};">${escapeHtml(group.label)}</div>`;
    }

    html += `<div class="sticky-col z-40 border-b border-r border-slate-200 bg-slate-50 px-3 py-2"></div>`;
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const nextDay = days[i + 1] || null;
      const monthBoundary = !nextDay || nextDay.getMonth() !== day.getMonth();
      const redDay = isRedDay(day);
      const today = isTodayDate(day);
      const todayHeaderStyle = getTodayColumnStyle(day, "header");
      html += `<div data-today-header="${today ? "true" : "false"}" class="border-b ${monthBoundary ? 'border-r-2 border-r-slate-400' : 'border-r border-slate-200'} px-1 py-2 text-center text-[10px] ${redDay ? 'bg-red-50 text-red-700' : 'bg-white text-slate-500'}" style="${todayHeaderStyle}"><div class="font-medium">${escapeHtml(weekdayShort(day))}</div><div>${day.getDate()}</div><div>${escapeHtml(monthShort(day))}</div>${getTodayHeaderBadgeHtml(day)}</div>`;
    }

    return html;
  }

  function ensureEmployeeGroupFilterControl() {
    if (!els.employeeFilter) return;

    if (document.getElementById("employeeGroupFilterControl")) {
      els.groupFilterControl = document.getElementById("employeeGroupFilterControl");
      els.groupFilterButton = document.getElementById("employeeGroupFilterButton");
      els.groupFilterLabel = document.getElementById("employeeGroupFilterLabel");
      els.groupFilterPanel = document.getElementById("employeeGroupFilterPanel");
      els.groupFilterSearch = document.getElementById("employeeGroupFilterSearch");
      els.groupFilterOptions = document.getElementById("employeeGroupFilterOptions");
      els.employeeFilter.classList.add("hidden");
      renderEmployeeGroupFilterControl();
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.id = "employeeGroupFilterControl";
    wrapper.className = "relative";
    wrapper.innerHTML = `
      <button id="employeeGroupFilterButton" type="button" class="w-[280px] rounded-2xl border border-slate-300 bg-white px-3 py-2 text-left text-sm flex items-center justify-between gap-3">
        <span id="employeeGroupFilterLabel" class="truncate">Alle ansatte / alle grupper</span>
        <span class="text-slate-400">▾</span>
      </button>
      <div id="employeeGroupFilterPanel" class="hidden absolute left-0 top-full mt-2 z-40 w-[360px] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div class="p-3 border-b border-slate-200">
          <input id="employeeGroupFilterSearch" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Søk gruppe" />
        </div>
        <div id="employeeGroupFilterOptions" class="max-h-[320px] overflow-auto"></div>
      </div>
    `;

    els.employeeFilter.parentNode.insertBefore(wrapper, els.employeeFilter);
    els.employeeFilter.classList.add("hidden");
    els.employeeFilter.setAttribute("aria-hidden", "true");
    els.employeeFilter.tabIndex = -1;

    els.groupFilterControl = wrapper;
    els.groupFilterButton = document.getElementById("employeeGroupFilterButton");
    els.groupFilterLabel = document.getElementById("employeeGroupFilterLabel");
    els.groupFilterPanel = document.getElementById("employeeGroupFilterPanel");
    els.groupFilterSearch = document.getElementById("employeeGroupFilterSearch");
    els.groupFilterOptions = document.getElementById("employeeGroupFilterOptions");

    renderEmployeeGroupFilterControl();
  }

  function ensureProjectFilterControl() {
    if (!els.employeeFilter) return;
    if (document.getElementById("projectFilterControl")) {
      els.projectFilterControl = document.getElementById("projectFilterControl");
      return;
    }
    const select = document.createElement("select");
    select.id = "projectFilterControl";
    select.className = "hidden w-[260px] rounded border border-slate-300 bg-white px-3 py-2 text-sm";
    select.setAttribute("aria-label", "Filtrer prosjekter");
    const anchor = document.getElementById("employeeGroupFilterControl") || els.employeeFilter;
    anchor.parentNode.insertBefore(select, anchor.nextSibling);
    els.projectFilterControl = select;
  }

  function ensureCalendarNewProjectButton() {
    if (!els.employeeFilter) return;
    if (document.getElementById("calendarNewProjectBtn")) {
      els.calendarNewProjectBtn = document.getElementById("calendarNewProjectBtn");
      return;
    }
    const button = document.createElement("button");
    button.id = "calendarNewProjectBtn";
    button.type = "button";
    button.className = "hidden rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";
    button.textContent = "+ Nytt prosjekt";
    const anchor = document.getElementById("projectFilterControl") || els.employeeFilter;
    anchor.parentNode.insertBefore(button, anchor.nextSibling);
    els.calendarNewProjectBtn = button;
  }

  function updateCalendarSearchControls() {
    if (!els.searchInput) return;
    const isProjectMode = state.calendarMode === "project";
    els.searchInput.placeholder = isProjectMode ? "Søk prosjekt" : "Søk ansatt";
    els.searchInput.setAttribute("aria-label", isProjectMode ? "Søk prosjekt" : "Søk ansatt");
    els.searchInput.setAttribute("name", isProjectMode ? "planner_project_search_filter_no_autofill" : "planner_search_filter_no_autofill");
    els.searchInput.setAttribute("autocomplete", "off");
    els.searchInput.setAttribute("autocorrect", "off");
    els.searchInput.setAttribute("autocapitalize", "none");
    els.searchInput.setAttribute("spellcheck", "false");
    els.searchInput.setAttribute("data-lpignore", "true");

    const currentSearchValue = String(els.searchInput.value || "").trim();
    const looksLikeAutofilledEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentSearchValue);
    if (isProjectMode && (looksLikeAutofilledEmail || currentSearchValue === String(state.currentUser?.email || "").trim())) {
      els.searchInput.value = "";
      state.search = "";
    }

    if (els.groupFilterControl) els.groupFilterControl.classList.toggle("hidden", isProjectMode);
    if (els.projectFilterControl) els.projectFilterControl.classList.toggle("hidden", !isProjectMode);
    if (els.calendarNewProjectBtn) els.calendarNewProjectBtn.classList.toggle("hidden", !isProjectMode);
  }

  function getProjectFilterOptions() {
    return [
      { id: "all", name: "Alle prosjektfaser" },
      { id: "field", name: "Feltperiode" },
      { id: "workshop", name: "Workshop / mobilisering" },
      { id: "workshopOnly", name: "Workshop-only" }
    ];
  }

  function projectHasConfiguredWorkshopPhase(project) {
    return Boolean(
      project &&
      project.workshop_enabled !== false &&
      project.workshop_start_date &&
      project.workshop_end_date &&
      String(project.workshop_start_date) <= String(project.workshop_end_date)
    );
  }

  function projectHasActiveFieldPhase(project) {
    if (!project || isSystemPersonalProject(project)) return false;
    if (isCancelledProject(project)) return true;
    const fieldNeed = Math.max(Number(project?.headcount_required || 0), 0);

    // Field need = 0 means the project should not create/show a red field period
    // when a valid workshop phase exists. This supports workshop-only projects where
    // planned_start/end are kept as reference data, but operational rendering should
    // only show the green workshop/mobilisation block.
    if (projectHasConfiguredWorkshopPhase(project) && fieldNeed === 0) return false;

    return Boolean(
      project?.has_multiple_periods
        ? normalizeProjectPeriods(project?.project_periods_json || []).some(period => period.start && period.end)
        : (project?.planned_start_date && project?.planned_end_date)
    );
  }

  function getProjectTimelinePhaseTypes(project) {
    const periods = getProjectTimelinePeriodsWithWorkshop(project);
    const hasField = periods.some(period => period.phase !== "workshop");
    const hasWorkshop = periods.some(period => period.phase === "workshop");
    return { hasField, hasWorkshop, isWorkshopOnly: hasWorkshop && !hasField };
  }

  function projectMatchesPhaseFilter(project, filter = state.projectPhaseFilter || "all") {
    if (!filter || filter === "all") return true;
    const phases = getProjectTimelinePhaseTypes(project);
    if (filter === "field") return phases.hasField;
    if (filter === "workshop") return phases.hasWorkshop;
    if (filter === "workshopOnly") return phases.isWorkshopOnly;
    return true;
  }

  function filterProjectPeriodsByPhase(project, periods) {
    const filter = state.projectPhaseFilter || "all";
    if (!filter || filter === "all") return periods;
    if (filter === "field") return periods.filter(period => period.phase !== "workshop");
    if (filter === "workshop" || filter === "workshopOnly") return periods.filter(period => period.phase === "workshop");
    return periods;
  }

  function getProjectSearchableText(project) {
    return [
      project?.name,
      project?.category,
      project?.location,
      project?.project_responsible,
      project?.status,
      extractProjectImportCode(project?.name || "")
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function getProjectPrimaryTimelineDate(project) {
    const periods = getProjectTimelinePeriodsWithWorkshop(project)
      .filter(period => period?.start && period?.end)
      .slice()
      .sort((a, b) => String(a.start).localeCompare(String(b.start)) || String(a.end).localeCompare(String(b.end)));
    return periods[0]?.start || project?.planned_start_date || project?.workshop_start_date || "";
  }

  function setCalendarStartDateForTargetIso(targetIso) {
    const targetDate = asLocalDate(targetIso);
    if (!targetDate) return false;
    if (state.viewMode === "Uke") state.startDate = startOfWeek(targetDate);
    else if (state.viewMode === "År") state.startDate = new Date(targetDate.getFullYear(), 0, 1);
    else state.startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    persistUiState();
    return true;
  }

  function isDateInsideCurrentRange(targetIso) {
    const targetDate = asLocalDate(targetIso);
    if (!targetDate) return true;
    const range = getCurrentRange();
    return targetDate >= range.start && targetDate <= range.end;
  }

  function resetProjectSearchIfEmpty() {
    if (state.calendarMode !== "project") return;
    state.search = "";
    if (els.searchInput) els.searchInput.value = "";
    state.focusProjectId = "";
    state.calendarPanelOpen = false;
    state.projectSpotlightId = "";
    if (state.projectSearchReturnStartDate) {
      const returnDate = asLocalDate(state.projectSearchReturnStartDate);
      if (returnDate) state.startDate = returnDate;
      state.projectSearchReturnStartDate = null;
      persistUiState();
    }
  }

  function jumpProjectCalendarToSearchMatch() {
    if (state.calendarMode !== "project") return;
    const search = String(state.search || "").trim().toLowerCase();
    if (!search) {
      resetProjectSearchIfEmpty();
      return;
    }
    if (search.length < 3) return;

    const project = getVisibleProjects()
      .slice()
      .sort((a, b) => compareProjectDates(a, b))
      .find(item => getProjectSearchableText(item).includes(search));

    if (!project) return;

    const targetIso = getProjectPrimaryTimelineDate(project);
    if (!targetIso || isDateInsideCurrentRange(targetIso)) return;

    if (!state.projectSearchReturnStartDate) {
      state.projectSearchReturnStartDate = toIsoDate(state.startDate);
    }

    state.focusProjectId = project.id;
    state.calendarPanelOpen = true;
    setCalendarStartDateForTargetIso(targetIso);
  }


  function ensureAccountPanel() {
    if (document.getElementById("accountPanel")) {
      els.accountPanel = document.getElementById("accountPanel");
      els.accountMenuWrap = document.getElementById("accountMenuWrap");
      els.accountMenuButton = document.getElementById("accountMenuButton");
      els.accountMenuDropdown = document.getElementById("accountMenuDropdown");
      els.accountUserInfo = document.getElementById("accountUserInfo");
      els.accountAvatar = document.getElementById("accountAvatar");
      els.accountRoleInfo = document.getElementById("accountRoleInfo");
      els.changePasswordBtn = document.getElementById("changePasswordBtn");
      els.resetPasswordBtn = document.getElementById("resetPasswordBtn");
      els.logoutBtn = document.getElementById("logoutBtn");
      els.loginBtn = document.getElementById("loginBtn");
      // v18.62u: Guard against accidental workbench controls being rendered in the profile/header area.
      els.accountPanel?.querySelectorAll?.(".iz-workbench-footer, .iz-workbench-resize-handle, .iz-workbench-control-island, [data-project-workbench-close], [data-project-workbench-resize]")?.forEach(node => {
        if (node.closest?.("#calendarPanelCol")) return;
        node.remove();
      });
      if (els.accountMenuButton && !els.accountMenuButton.dataset.boundAccountMenu) {
        els.accountMenuButton.dataset.boundAccountMenu = "true";
        els.accountMenuButton.addEventListener("click", event => {
          event.stopPropagation();
          els.accountMenuDropdown?.classList.toggle("hidden");
        });
      }
      ensureLoginModal();
      window.izomaxApplyLanguage?.();
      return;
    }

    const panel = document.createElement("div");
    panel.id = "accountPanel";
    panel.className = "flex flex-wrap items-center justify-end gap-2 relative";
    panel.innerHTML = `
      <button id="loginBtn" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">Logg inn</button>
      <div id="accountMenuWrap" class="hidden relative">
        <button id="accountMenuButton" type="button" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-3">
          <span id="accountAvatar" class="account-avatar">OH</span>
          <span class="account-text">
            <span id="accountUserInfo" class="account-name">Ikke innlogget</span>
            <span id="accountRoleInfo" class="account-role"></span>
          </span>
          <span class="account-caret text-xs ml-auto">▾</span>
        </button>
        <div id="accountMenuDropdown" class="hidden absolute right-0 top-full mt-2 min-w-[210px] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-[120]">
          <div class="iz-language-menu border-b border-slate-200 px-3 py-3">
            <div id="ixAccountLanguageTitle" class="iz-language-title text-xs font-semibold text-slate-500 mb-2">Språk</div>
            <div class="iz-language-inline-row">
              <div class="iz-language-options flex gap-2">
                <button type="button" data-ix-lang="no" class="iz-language-option">NO</button>
                <button type="button" data-ix-lang="en" class="iz-language-option">EN</button>
              </div>
            </div>
          </div>
          <button id="changePasswordBtn" class="w-full text-left border-b border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">Endre passord</button>
          <button id="logoutBtn" class="w-full text-left bg-white px-3 py-2 text-sm hover:bg-slate-50">Logg ut</button>
          <button id="resetPasswordBtn" class="hidden">Send reset-link</button>
        </div>
      </div>
    `;

    const anchor = els.storageBadge?.parentElement || document.body.firstElementChild || document.body;
    anchor.appendChild(panel);

    els.accountPanel = panel;
    els.accountMenuWrap = document.getElementById("accountMenuWrap");
    els.accountMenuButton = document.getElementById("accountMenuButton");
    els.accountMenuDropdown = document.getElementById("accountMenuDropdown");
    els.accountUserInfo = document.getElementById("accountUserInfo");
    els.accountAvatar = document.getElementById("accountAvatar");
    els.accountRoleInfo = document.getElementById("accountRoleInfo");
    els.changePasswordBtn = document.getElementById("changePasswordBtn");
    els.resetPasswordBtn = document.getElementById("resetPasswordBtn");
    els.logoutBtn = document.getElementById("logoutBtn");
    els.loginBtn = document.getElementById("loginBtn");

    if (els.accountMenuButton) {
      els.accountMenuButton.addEventListener("click", event => {
        event.stopPropagation();
        els.accountMenuDropdown?.classList.toggle("hidden");
      });
    }

    document.addEventListener("click", event => {
      if (!els.accountPanel?.contains(event.target)) {
        els.accountMenuDropdown?.classList.add("hidden");
      }
    });

    [els.changePasswordBtn, els.logoutBtn].forEach(btn => {
      if (!btn) return;
      btn.addEventListener("click", () => els.accountMenuDropdown?.classList.add("hidden"));
    });

    ensureLoginModal();
    window.izomaxApplyLanguage?.();
  }


  function ensurePersonalBlockPanel() {
    const employeeSection = els.tabEmployeesSection;
    if (!employeeSection) return;

    const target = document.getElementById("employeeAdminAdvancedBody") || employeeSection;

    if (document.getElementById("personalBlockCard")) {
      els.personalBlockEmployee = document.getElementById("personalBlockEmployee");
      els.personalBlockType = document.getElementById("personalBlockType");
      els.personalBlockStart = document.getElementById("personalBlockStart");
      els.personalBlockEnd = document.getElementById("personalBlockEnd");
      els.personalBlockNotes = document.getElementById("personalBlockNotes");
      els.personalBlockSaveBtn = document.getElementById("personalBlockSaveBtn");
      window.izomaxApplyLanguage?.();
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div id="personalBlockCard" class="rounded-2xl bg-slate-50 border border-slate-200 shadow-sm h-full">
        <div class="p-4 border-b border-slate-200">
          <h2 id="personalBlockTitle" class="font-semibold text-slate-950">Direkte blokk på ansatt</h2>
          <p id="personalBlockDescription" class="text-sm text-slate-500 mt-1">Brukes for kurs, ferie, syk og avspasering direkte på personen, uten å gå via prosjektmodulen.</p>
        </div>
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select id="personalBlockEmployee" class="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2"></select>
            <select id="personalBlockType" class="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2"></select>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input id="personalBlockStart" type="date" class="rounded-2xl border border-slate-300 bg-white px-3 py-2" />
            <input id="personalBlockEnd" type="date" class="rounded-2xl border border-slate-300 bg-white px-3 py-2" />
          </div>
          <textarea id="personalBlockNotes" class="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2" rows="4" placeholder="Notat"></textarea>
          <button id="personalBlockSaveBtn" class="w-full rounded-2xl bg-slate-900 text-white px-4 py-2">Lagre blokk i kalender</button>
        </div>
      </div>
    `;
    target.appendChild(wrapper);

    els.personalBlockEmployee = document.getElementById("personalBlockEmployee");
    els.personalBlockType = document.getElementById("personalBlockType");
    els.personalBlockStart = document.getElementById("personalBlockStart");
    els.personalBlockEnd = document.getElementById("personalBlockEnd");
    els.personalBlockNotes = document.getElementById("personalBlockNotes");
    els.personalBlockSaveBtn = document.getElementById("personalBlockSaveBtn");
    window.izomaxApplyLanguage?.();
  }



  function normalizeCalendarContextMenuElement() {
    const menu = els.calendarContextMenu || document.getElementById("calendarContextMenu");
    if (!menu) return;
    if (menu.parentElement !== document.body) {
      document.body.appendChild(menu);
    }
    menu.className = menu.classList.contains("hidden") ? "hidden" : "";
    menu.style.setProperty("position", "fixed", "important");
    menu.style.setProperty("z-index", "2147483647", "important");
    menu.style.setProperty("width", "320px", "important");
    menu.style.setProperty("max-width", "calc(100vw - 24px)", "important");
    menu.style.setProperty("background", "#ffffff", "important");
    menu.style.setProperty("color", "#0f172a", "important");
    menu.style.setProperty("border", "1px solid #cbd5e1", "important");
    menu.style.setProperty("border-radius", "16px", "important");
    menu.style.setProperty("box-shadow", "0 24px 80px rgba(0,0,0,0.35)", "important");
    menu.style.setProperty("pointer-events", "auto", "important");
    menu.style.setProperty("overflow", "hidden", "important");
  }

  function ensureCalendarContextMenu() {
    // Rebuild the context menu as a true body-level portal every time app.js starts.
    // This avoids the old problem where the menu stayed inside the calendar/layout grid
    // and rendered as a full-width section below the calendar.
    document.querySelectorAll('#calendarContextMenu').forEach(existing => existing.remove());

    const menu = document.createElement("div");
    menu.id = "calendarContextMenu";
    menu.className = "hidden";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-label", "Legg til direkte blokk");
    menu.innerHTML = `
      <div class="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <div class="font-semibold">Legg til direkte blokk</div>
          <div class="text-xs text-slate-500 mt-1">Fra kalender</div>
        </div>
        <button id="contextMenuCloseBtn" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm">Lukk</button>
      </div>
      <div class="p-4 space-y-3">
        <div>
          <div class="text-xs text-slate-500">Ansatt</div>
          <div id="contextMenuEmployee" class="font-medium text-slate-800"></div>
        </div>
        <div>
          <div class="text-xs text-slate-500">Kategori</div>
          <select id="contextMenuType" class="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2"></select>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-slate-500">Fra</div>
            <input id="contextMenuStart" type="date" class="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2" />
          </div>
          <div>
            <div class="text-xs text-slate-500">Til</div>
            <input id="contextMenuEnd" type="date" class="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2" />
          </div>
        </div>
        <div>
          <div class="text-xs text-slate-500">Notat / beskrivelse</div>
          <textarea id="contextMenuNotes" class="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2" rows="4" placeholder="For eksempel kursnavn eller kommentar"></textarea>
        </div>
        <button id="contextMenuAddBtn" type="button" class="w-full rounded-2xl bg-slate-900 text-white px-4 py-2">Legg i kalender</button>
      </div>
    `;

    document.body.appendChild(menu);

    els.calendarContextMenu = menu;
    els.contextMenuEmployee = document.getElementById("contextMenuEmployee");
    els.contextMenuStart = document.getElementById("contextMenuStart");
    els.contextMenuEnd = document.getElementById("contextMenuEnd");
    els.contextMenuType = document.getElementById("contextMenuType");
    els.contextMenuNotes = document.getElementById("contextMenuNotes");
    els.contextMenuAddBtn = document.getElementById("contextMenuAddBtn");
    els.contextMenuCloseBtn = document.getElementById("contextMenuCloseBtn");

    normalizeCalendarContextMenuElement();
  }

  function ensureAvailabilityPanel() {
    const projectsSection = els.tabProjectsSection;
    if (!projectsSection) return;

    if (document.getElementById("availabilityCard")) {
      els.availabilityCard = document.getElementById("availabilityCard");
      els.availabilitySummary = document.getElementById("availabilitySummary");
      els.availabilityAvailableList = document.getElementById("availabilityAvailableList");
      els.availabilityUnavailableList = document.getElementById("availabilityUnavailableList");
      els.availabilityAvailableCount = document.getElementById("availabilityAvailableCount");
      els.availabilityUnavailableCount = document.getElementById("availabilityUnavailableCount");
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "xl:col-span-12";
    wrapper.innerHTML = `
      <div id="availabilityCard" class="rounded-[28px] bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-200 bg-slate-50/80">
          <h2 class="font-semibold text-lg text-slate-900">Tilgjengelighet i valgt periode</h2>
          <p class="text-sm text-slate-500 mt-1">Beslutningsstøtte for bemanning. Systemet sjekker andre prosjekter, kurs, ferie, syk og avspasering i valgt periode.</p>
        </div>
        <div class="p-5 space-y-5">
          <div id="availabilitySummary" class="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 shadow-sm">
            Velg prosjekt og gyldig fra/til-dato for å analysere tilgjengelighet.
          </div>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div class="rounded-[24px] border border-green-200 bg-green-50/50 p-4">
              <div class="mb-3 flex items-center justify-between gap-2">
                <h3 class="font-medium text-green-800">Tilgjengelige</h3>
                <span id="availabilityAvailableCount" class="rounded-full border border-green-200 bg-white px-2.5 py-1 text-xs font-medium text-green-700"></span>
              </div>
              <div id="availabilityAvailableList" class="space-y-3"></div>
            </div>
            <div class="rounded-[24px] border border-rose-200 bg-rose-50/50 p-4">
              <div class="mb-3 flex items-center justify-between gap-2">
                <h3 class="font-medium text-rose-800">Ikke tilgjengelige</h3>
                <span id="availabilityUnavailableCount" class="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700"></span>
              </div>
              <div id="availabilityUnavailableList" class="space-y-3"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    projectsSection.appendChild(wrapper);

    els.availabilityCard = document.getElementById("availabilityCard");
    els.availabilitySummary = document.getElementById("availabilitySummary");
    els.availabilityAvailableList = document.getElementById("availabilityAvailableList");
    els.availabilityUnavailableList = document.getElementById("availabilityUnavailableList");
    els.availabilityAvailableCount = document.getElementById("availabilityAvailableCount");
    els.availabilityUnavailableCount = document.getElementById("availabilityUnavailableCount");
  }


  function ensureLoginModal() {
    if (document.getElementById("loginModal")) {
      els.loginModal = document.getElementById("loginModal");
      els.closeLoginModalBtn = document.getElementById("closeLoginModalBtn");
      els.loginEmail = document.getElementById("loginEmail");
      els.loginPassword = document.getElementById("loginPassword");
      els.loginSubmitBtn = document.getElementById("loginSubmitBtn");
      els.forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
      return;
    }

    const modal = document.createElement("div");
    modal.id = "loginModal";
    modal.className = "fixed inset-0 bg-black/40 hidden items-center justify-center p-4";
    modal.innerHTML = `
      <div class="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="font-semibold">Logg inn</h2>
          <button id="closeLoginModalBtn" class="rounded-lg border border-slate-300 px-3 py-1 text-sm">Lukk</button>
        </div>
        <div class="p-4 space-y-4">
          <input id="loginEmail" type="email" class="w-full rounded-2xl border border-slate-300 px-3 py-2" placeholder="E-post" />
          <input id="loginPassword" type="password" class="w-full rounded-2xl border border-slate-300 px-3 py-2" placeholder="Passord" />
          <button id="loginSubmitBtn" class="w-full rounded-2xl bg-slate-900 text-white px-4 py-2">Logg inn</button>
          <button id="forgotPasswordBtn" class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2">Glemt passord?</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    els.loginModal = modal;
    els.closeLoginModalBtn = document.getElementById("closeLoginModalBtn");
    els.loginEmail = document.getElementById("loginEmail");
    els.loginPassword = document.getElementById("loginPassword");
    els.loginSubmitBtn = document.getElementById("loginSubmitBtn");
    els.forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
  }

  async function loadAuthUser() {
    if (!supabaseClient?.auth) {
      state.authReady = true;
      return;
    }

    try {
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userError) throw userError;

      const user = userData?.user || null;
      state.currentUserEmail = user?.email || "";
      state.currentUserId = user?.id || "";
      state.currentUser = user?.user_metadata?.full_name || user?.email || "Ikke innlogget";
      state.currentRole = "";
      state.currentUserIsActive = true;

      try {
        const { data, error } = await supabaseClient.rpc("get_my_profile");
        if (!error && Array.isArray(data) && data[0]) {
          state.currentRole = normalizeRoleValue(data[0].role || "");
          state.currentUserIsActive = data[0].is_active !== false;
          if (data[0].full_name) state.currentUser = data[0].full_name;
          if (data[0].email) state.currentUserEmail = data[0].email;
        }
      } catch (_) {}

      state.authReady = true;
      updateAccountPanel();
    } catch (err) {
      state.authReady = true;
      state.supabaseError = err?.message || state.supabaseError;
      updateAccountPanel();
    }
  }

  function normalizeRoleValue(role) {
    const normalized = String(role || "").trim().toLowerCase();
    if (normalized === "planlegger") return "planner";
    if (normalized === "leser") return "reader";
    if (["ansatt", "employee", "medarbeider", "user"].includes(normalized)) return "employee";
    return normalized;
  }

  function isEmployeePortalUser() {
    return normalizeRoleValue(state.currentRole) === "employee";
  }

  function isSuperadmin() {
    return normalizeRoleValue(state.currentRole) === "superadmin";
  }

  function isAdminUser() {
    return normalizeRoleValue(state.currentRole) === "admin";
  }

  function isPlannerOnlyUser() {
    return normalizeRoleValue(state.currentRole) === "planner";
  }

  function canApproveAccessRequests() {
    return isSuperadmin() || isAdminUser() || isPlannerOnlyUser();
  }

  function canManageUserAccess() {
    return isSuperadmin() || isAdminUser() || isPlannerOnlyUser();
  }

  function isPlanner() {
    const role = normalizeRoleValue(state.currentRole);
    return role === "planner" || role === "admin";
  }

  function isLoggedInUser() {
    return !!state.currentUserEmail;
  }

  function showStartPage() {
    if (els.plannerStartPage) els.plannerStartPage.classList.remove("hidden");
    if (els.plannerAppShell) els.plannerAppShell.classList.add("hidden");
  }

  function showPlannerApp() {
    if (els.plannerStartPage) els.plannerStartPage.classList.add("hidden");
    if (els.plannerAppShell) els.plannerAppShell.classList.remove("hidden");
  }

  function setStartLoginError(message) {
    if (!els.startLoginError) return;
    const text = String(message || "").trim();
    els.startLoginError.textContent = text;
    els.startLoginError.classList.toggle("visible", Boolean(text));
  }

  function canPlanApp() {
    return isSuperadmin() || isPlanner();
  }

  function canEditApp() {
    return canPlanApp();
  }

  function getCardByElement(el) {
    return el?.closest(".rounded-2xl.bg-white.border.border-slate-200.shadow-sm") || null;
  }

  function setCardDisplayByElement(el, visible) {
    const card = getCardByElement(el);
    if (card) card.style.display = visible ? "" : "none";
  }

  function setCardDisplayById(id, visible) {
    const el = document.getElementById(id);
    const card = getCardByElement(el);
    if (card) card.style.display = visible ? "" : "none";
  }

  function toTitleCaseName(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const noDomain = raw.includes("@") ? raw.split("@")[0] : raw;
    return noDomain
      .replace(/[._-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  function getAccountDisplayName() {
    return toTitleCaseName(state.currentUser || state.currentUserEmail) || "Ikke innlogget";
  }

  function getAccountInitials(name) {
    const parts = String(name || "")
      .replace(/[^A-Za-zÆØÅæøå\s-]/g, " ")
      .split(/[\s-]+/)
      .filter(Boolean);
    if (!parts.length) return "OH";
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join("");
  }

  function formatRoleLabel(role) {
    const raw = String(role || "").trim();
    if (!raw) return "";
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }

  function updateAccountPanel() {
    if (!els.accountUserInfo) return;
    const nameText = getAccountDisplayName();
    const roleText = formatRoleLabel(state.currentRole);
    els.accountUserInfo.textContent = nameText;
    if (els.accountRoleInfo) els.accountRoleInfo.textContent = roleText;
    if (els.accountAvatar) els.accountAvatar.textContent = getAccountInitials(nameText);
    window.izomaxApplyLanguage?.();
  }

  function bindTabEvents() {
    if (els.tabHomeBtn) els.tabHomeBtn.addEventListener("click", () => setActiveTab("home"));
    if (els.tabCalendarBtn) els.tabCalendarBtn.addEventListener("click", () => openPersonalCalendarView());
    if (els.tabProjectPlanBtn) els.tabProjectPlanBtn.addEventListener("click", () => openProjectCalendarView("all"));
    if (els.tabUnstaffedBtn) els.tabUnstaffedBtn.addEventListener("click", () => openProjectCalendarView("unstaffed"));
    if (els.tabProjectsBtn) els.tabProjectsBtn.addEventListener("click", () => setActiveTab("projects"));
    if (els.tabEmployeesBtn) els.tabEmployeesBtn.addEventListener("click", () => setActiveTab("employees"));
    if (els.tabAdminBtn) els.tabAdminBtn.addEventListener("click", () => setActiveTab("admin"));
  }

  function setActiveTab(tabName) {
    state.activeTab = tabName;
    renderLayoutTabs();
  }

  function getActiveNavigationKey() {
    if (state.activeTab === "home") return "home";
    if (state.activeTab === "projects") return "projects";
    if (state.activeTab === "employees") return "employees";
    if (state.activeTab === "admin") return "admin";
    if (state.activeTab === "calendar" && state.calendarMode === "project" && state.projectListFilter === "unstaffed") return "unstaffed";
    if (state.activeTab === "calendar" && state.calendarMode === "project") return "projectplan";
    return "calendar";
  }

  function renderLayoutTabs() {
    const canPlan = canPlanApp();
    const allowedTabs = canPlan ? ["home", "calendar", "projects", "employees", "admin"] : ["calendar"];

    if (!allowedTabs.includes(state.activeTab)) {
      state.activeTab = canPlan ? "home" : "calendar";
    }

    const activeKey = getActiveNavigationKey();

    const buttons = {
      home: els.tabHomeBtn,
      calendar: els.tabCalendarBtn,
      projectplan: els.tabProjectPlanBtn,
      unstaffed: els.tabUnstaffedBtn,
      projects: els.tabProjectsBtn,
      employees: els.tabEmployeesBtn,
      admin: els.tabAdminBtn
    };

    const hiddenForGuests = new Set(["home", "projectplan", "unstaffed", "projects", "employees", "admin"]);

    Object.entries(buttons).forEach(([name, btn]) => {
      if (!btn) return;
      const visible = canPlan || !hiddenForGuests.has(name);
      btn.style.display = visible ? "" : "none";
      if (activeKey === name) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
      btn.className = [
        "rounded-2xl px-4 py-2 text-sm border transition",
        activeKey === name
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      ].join(" ");
    });

    const sections = {
      home: els.tabHomeSection,
      calendar: els.tabCalendarSection,
      projects: els.tabProjectsSection,
      employees: els.tabEmployeesSection,
      admin: els.tabAdminSection
    };

    Object.entries(sections).forEach(([name, section]) => {
      if (!section) return;
      const active = state.activeTab === name;
      section.style.display = active ? "" : "none";
      section.classList.toggle("hidden", !active);
    });

    if (els.statsRow) {
      const showStats = state.activeTab !== "home";
      els.statsRow.style.display = showStats ? "grid" : "none";
      els.statsRow.classList.toggle("hidden", !showStats);
    }
  }



  function showEmployeePortal() {
    if (!els.employeePortalShell) return;
    els.employeePortalShell.classList.add("iz-employee-active");
    const plannerElements = [
      document.querySelector("#plannerAppShell > header.iz-app-header"),
      els.statsRow,
      els.plannerTabs,
      els.tabHomeSection,
      els.tabCalendarSection,
      els.tabProjectsSection,
      els.tabEmployeesSection,
      els.tabAdminSection
    ];
    plannerElements.forEach(element => {
      if (!element) return;
      element.style.display = "none";
      element.classList.add("hidden");
    });
  }

  function hideEmployeePortal() {
    if (els.employeePortalShell) els.employeePortalShell.classList.remove("iz-employee-active");
  }

  function normalizeComparableText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getEmployeePortalEmployee() {
    const email = normalizeComparableText(state.currentUserEmail);
    const currentName = normalizeComparableText(state.currentUser);
    const byEmail = (state.employees || []).find(employee => normalizeComparableText(employee.email) === email);
    if (byEmail) return byEmail;
    const byName = (state.employees || []).find(employee => normalizeComparableText(employee.name) === currentName);
    if (byName) return byName;
    return null;
  }

  function getProjectDateBounds(project) {
    const periods = getProjectTimelinePeriodsWithWorkshop(project).filter(period => period.start && period.end);
    if (periods.length) {
      const starts = periods.map(period => period.start).sort();
      const ends = periods.map(period => period.end).sort();
      return { start: starts[0], end: ends[ends.length - 1] };
    }
    return {
      start: project?.planned_start_date || project?.workshop_start_date || "",
      end: project?.planned_end_date || project?.workshop_end_date || ""
    };
  }

  function getEmployeePortalAssignments(employee) {
    if (!employee?.name) return [];
    return (state.entries || [])
      .filter(entry => entry?.employee_name === employee.name)
      .map(entry => ({ ...entry, project: getProjectById(entry.project_id) }))
      .filter(item => item.project && !isSystemPersonalProject(item.project));
  }

  function getEmployeePortalNextAssignment(assignments) {
    const todayIso = toIsoDate(new Date());
    return assignments
      .filter(item => String(item.end_date || "") >= todayIso)
      .sort((a, b) => String(a.start_date || "9999-12-31").localeCompare(String(b.start_date || "9999-12-31")) || String(a.end_date || "9999-12-31").localeCompare(String(b.end_date || "9999-12-31")))[0] || null;
  }

  function getEmployeePortalUpcomingAssignments(assignments) {
    const todayIso = toIsoDate(new Date());
    return (assignments || [])
      .filter(item => String(item.end_date || "") >= todayIso)
      .sort((a, b) => String(a.start_date || "9999-12-31").localeCompare(String(b.start_date || "9999-12-31")) || String(a.end_date || "9999-12-31").localeCompare(String(b.end_date || "9999-12-31")));
  }

  function getEmployeePortalHistory(assignments) {
    const todayIso = toIsoDate(new Date());
    return assignments
      .filter(item => String(item.end_date || "") < todayIso)
      .sort((a, b) => String(b.end_date || "").localeCompare(String(a.end_date || "")))
      .slice(0, 3);
  }

  function extractProjectCode(name) {
    const text = String(name || "").trim();
    const match = text.match(/\b(?:PRJ|IZO)[-\s]?\d+[A-Z0-9-]*\b/i);
    return match ? match[0].replace(/\s+/, "-").toUpperCase() : "";
  }

  function getProjectNameWithoutCode(name) {
    const code = extractProjectCode(name);
    let text = String(name || "").trim();
    if (code) text = text.replace(new RegExp(code.replace("-", "[-\\s]?"), "i"), "").trim();
    return text.replace(/^[-–—:|\s]+/, "") || text || "Prosjekt";
  }

  function getExplicitProjectCode(project, name) {
    const candidates = [
      project?.project_code,
      project?.izo_code,
      project?.izo,
      project?.code,
      project?.projectCode,
      name
    ];
    for (const candidate of candidates) {
      const code = extractProjectCode(candidate);
      if (code) return code;
    }
    return "";
  }

  function getEmployeePortalProjectTitle(project) {
    const name = displayProjectName(project) || "Prosjekt";
    const code = getExplicitProjectCode(project, name);
    let cleanName = getProjectNameWithoutCode(name);

    // Avoid exposing internal UUID/id fragments as project title fallback in the employee portal.
    cleanName = String(cleanName || "").replace(/^([0-9a-f]{8})(?:[-\s]+)?/i, "").trim();

    const fallbackName = cleanName || name || "Prosjekt";
    return {
      code,
      cleanName: fallbackName,
      full: code ? `${code} ${fallbackName}`.trim() : fallbackName
    };
  }

  function getEmployeePortalProjectPhaseText(project) {
    const phases = getProjectTimelinePhaseTypes(project);
    if (phases.isWorkshopOnly) return "Workshop-only";
    if (phases.hasField && phases.hasWorkshop) return "Workshop + feltperiode";
    if (phases.hasWorkshop) return "Workshop / mobilisering";
    if (phases.hasField) return "Feltperiode";
    return project?.category || "Ikke satt";
  }

  function getEmployeePortalCustomerText(project) {
    return project?.location || project?.customer || project?.company || "Ikke satt";
  }

  function getEmployeePortalResponsibleText(project) {
    return project?.project_responsible || project?.projectResponsible || project?.responsible || "Ikke satt";
  }

  function getEmployeePortalStatusText(project) {
    return project?.status || "Ikke satt";
  }

  function getWorkshopText(project) {
    const workshop = getDefaultWorkshopPeriodForProject(project, getProjectTimelinePeriods(project));
    if (workshop?.start && workshop?.end) return `${formatDate(workshop.start)} – ${formatDate(workshop.end)}`;
    if (project?.workshop_start_date && project?.workshop_end_date) return `${formatDate(project.workshop_start_date)} – ${formatDate(project.workshop_end_date)}`;
    return "Ikke satt";
  }

  function getEmployeePortalCrewRows(projectId) {
    if (!projectId) return [];
    const rows = state.employeePortalCrewByProject?.[projectId];
    if (Array.isArray(rows)) return rows;
    return (state.entries || []).filter(entry => entry?.project_id === projectId);
  }

  function getEmployeePortalCrewSummary(project, crewRows = []) {
    const required = Number(project?.headcount_required || 0);
    const byName = new Map();
    (crewRows || []).forEach(row => {
      const name = String(row?.employee_name || "").trim();
      if (name && !byName.has(name)) byName.set(name, row);
    });
    const assigned = byName.size;
    const missing = required > 0 ? Math.max(required - assigned, 0) : 0;
    return {
      required,
      assigned,
      missing,
      label: required > 0 ? `${assigned} / ${required} satt opp` : `${assigned} satt opp`,
      status: required > 0 ? (missing > 0 ? `Mangler ${missing}` : "Fullt crew") : "Krav ikke satt",
      complete: required > 0 && missing === 0
    };
  }

  function renderEmployeePortalProjectDetails(selectedAssignment, employee, crewRows) {
    if (!selectedAssignment) return "";
    const project = selectedAssignment.project;
    const title = getEmployeePortalProjectTitle(project);
    const bounds = getProjectDateBounds(project);
    const assignmentPeriodText = selectedAssignment.start_date && selectedAssignment.end_date ? `${formatDate(selectedAssignment.start_date)} – ${formatDate(selectedAssignment.end_date)}` : "Ikke satt";
    const projectPeriodText = bounds.start && bounds.end ? `${formatDate(bounds.start)} – ${formatDate(bounds.end)}` : assignmentPeriodText;
    const roleText = selectedAssignment.role || employee?.title || "Ikke satt";
    const crewSummary = getEmployeePortalCrewSummary(project, crewRows);
    const crewItems = (crewRows || []).slice(0, 12);
    const crewStatusClass = crewSummary.missing > 0 ? "iz-emp-chip-warning" : (crewSummary.complete ? "iz-emp-chip-ok" : "");
    return `
      <section class="iz-emp-card iz-emp-section-card iz-emp-project-detail-card">
        <div class="iz-emp-section-head">
          <div class="iz-emp-section-icon">▣</div>
          <div>
            <div class="iz-emp-section-title">Prosjektinfo</div>
            <div class="iz-emp-section-subtitle">Lesende detaljvisning for valgt prosjekt.</div>
          </div>
        </div>
        <div class="iz-emp-detail-title">${title.code ? `<span>${escapeHtml(title.code)}</span> ` : ""}${escapeHtml(title.cleanName)}</div>
        <div class="iz-emp-detail-grid">
          <div><span>Din rolle</span><strong>${escapeHtml(roleText)}</strong></div>
          <div><span>Din periode</span><strong>${escapeHtml(assignmentPeriodText)}</strong></div>
          <div><span>Prosjektperiode</span><strong>${escapeHtml(projectPeriodText)}</strong></div>
          <div><span>Prosjektleder</span><strong>${escapeHtml(getEmployeePortalResponsibleText(project))}</strong></div>
          <div><span>Kunde</span><strong>${escapeHtml(getEmployeePortalCustomerText(project))}</strong></div>
          <div><span>Workshop / feltperiode</span><strong>${escapeHtml(getWorkshopText(project))}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(getEmployeePortalStatusText(project))}</strong></div>
          <div><span>Bemanning</span><strong>${escapeHtml(crewSummary.label)} · ${escapeHtml(crewSummary.status)}</strong></div>
        </div>
        <div class="iz-emp-detail-crew-head">Crew på prosjektet <span class="iz-emp-chip ${crewStatusClass}">${escapeHtml(crewSummary.status)}</span></div>
        ${crewItems.length ? `<div class="iz-emp-detail-crew-list">${crewItems.map(row => `
          <div class="iz-emp-detail-crew-row">
            <span>${escapeHtml(getInitials(row.employee_name))}</span>
            <strong>${escapeHtml(row.employee_name || "Ukjent")}</strong>
            <em>${escapeHtml(row.role || "Tildelt")}</em>
            <small>${escapeHtml(row.start_date && row.end_date ? `${formatDate(row.start_date)} – ${formatDate(row.end_date)}` : "Dato ikke satt")}</small>
          </div>
        `).join("")}</div>` : `<div class="iz-emp-empty iz-emp-empty-dark">Crewdata er ikke tilgjengelig for valgt prosjekt. Dette krever at RPC-funksjonen for crew er opprettet i Supabase.</div>`}
      </section>
    `;
  }

  function getEmployeePortalTeam(projectId, currentEmployeeName) {
    const byName = new Map();
    getEmployeePortalCrewRows(projectId)
      .filter(entry => entry?.employee_name && entry.employee_name !== currentEmployeeName)
      .forEach(entry => {
        if (!byName.has(entry.employee_name)) byName.set(entry.employee_name, entry);
      });
    return [...byName.values()].slice(0, 4);
  }

  function getTimelineMonths(startIso, endIso) {
    const fallbackStart = startIso || endIso || toIsoDate(new Date());
    const startDate = asLocalDate(fallbackStart) || new Date();
    const months = [];
    const base = new Date(startDate.getFullYear(), Math.max(0, startDate.getMonth()), 1);
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(base.getFullYear(), base.getMonth() + i, 1);
      months.push({ date, label: capitalize(monthShort(date)).replace(".", "") });
    }
    return months;
  }

  function getTimelinePercent(dateIso, months) {
    if (!dateIso || !months?.length) return 0;
    const start = months[0].date;
    const end = new Date(months[months.length - 1].date.getFullYear(), months[months.length - 1].date.getMonth() + 1, 0);
    const target = asLocalDate(dateIso) || start;
    const total = Math.max(end.getTime() - start.getTime(), 1);
    const pct = ((target.getTime() - start.getTime()) / total) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  function getIsoWeekNumber(date) {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  }

  function getTimelineMonthSegments(startDate, endDate) {
    const segments = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (current <= endDate) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const weeks = [];
      let weekCursor = startOfWeekMonday(monthStart);
      while (weekCursor <= monthEnd) {
        const weekLabelDate = weekCursor < monthStart ? monthStart : weekCursor;
        weeks.push({
          label: `U${getIsoWeekNumber(weekLabelDate)}`,
          day: `${weekLabelDate.getDate()}. ${capitalize(monthShort(weekLabelDate)).replace(".", "")}`
        });
        weekCursor = addDays(weekCursor, 7);
      }
      segments.push({
        label: `${capitalize(monthShort(monthStart)).replace(".", "")} ${monthStart.getFullYear()}`,
        weeks
      });
      current.setMonth(current.getMonth() + 1);
    }
    return segments;
  }

  function getTimelineDatePercent(dateIso, startDate, endDate) {
    const target = asLocalDate(dateIso) || startDate;
    const total = Math.max(endDate.getTime() - startDate.getTime(), 1);
    const pct = ((target.getTime() - startDate.getTime()) / total) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  function renderEmployeePortalTimeline(assignments, selectedEntryId) {
    const timelineAssignments = (assignments || [])
      .filter(item => item?.start_date && item?.end_date)
      .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)) || String(a.end_date).localeCompare(String(b.end_date)));

    if (!timelineAssignments.length) {
      return `
        <section class="iz-emp-card iz-emp-section-card">
          <div class="iz-emp-section-head">
            <div class="iz-emp-section-icon">▣</div>
            <div>
              <div class="iz-emp-section-title">Prosjektkalender</div>
              <div class="iz-emp-section-subtitle">Ingen kommende perioder registrert.</div>
            </div>
          </div>
          <div class="iz-emp-empty">Når du får kommende prosjekt-tildelinger, vises de her på måned, uke og dag.</div>
        </section>
      `;
    }

    const minStart = timelineAssignments.reduce((min, item) => String(item.start_date) < String(min) ? item.start_date : min, timelineAssignments[0].start_date);
    const maxEnd = timelineAssignments.reduce((max, item) => String(item.end_date) > String(max) ? item.end_date : max, timelineAssignments[0].end_date);
    const rangeStart = asLocalDate(minStart) || new Date();
    const rangeEndRaw = asLocalDate(maxEnd) || rangeStart;
    const startDate = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const endDate = new Date(rangeEndRaw.getFullYear(), rangeEndRaw.getMonth() + 1, 0);
    const monthSegments = getTimelineMonthSegments(startDate, endDate);
    const timelineWidth = Math.max(820, monthSegments.length * 160);
    const trackHeight = Math.max(76, timelineAssignments.length * 42 + 24);

    return `
      <section class="iz-emp-card iz-emp-section-card iz-emp-plan-card">
        <div class="iz-emp-section-head">
          <div class="iz-emp-section-icon">▣</div>
          <div>
            <div class="iz-emp-section-title">Prosjektkalender</div>
            <div class="iz-emp-section-subtitle">Alle kommende prosjekter vist på måned, uke og dag. Trykk på en linje for detaljer.</div>
          </div>
        </div>
        <div class="iz-emp-plan-scroll" aria-label="Prosjektkalender for kommende prosjekter">
          <div class="iz-emp-plan-timeline" style="width:${timelineWidth}px;">
            <div class="iz-emp-plan-months" style="grid-template-columns: repeat(${monthSegments.length}, minmax(160px, 1fr));">
              ${monthSegments.map(segment => `
                <div class="iz-emp-plan-month">
                  <div class="iz-emp-plan-month-label">${escapeHtml(segment.label)}</div>
                  <div class="iz-emp-plan-weeks">${segment.weeks.map(week => `<span><strong>${escapeHtml(week.label)}</strong><em>${escapeHtml(week.day || "")}</em></span>`).join("")}</div>
                </div>
              `).join("")}
            </div>
            <div class="iz-emp-plan-track" style="height:${trackHeight}px;">
              ${monthSegments.map((_, index) => `<div class="iz-emp-plan-month-grid" style="left:${(index / monthSegments.length) * 100}%; width:${100 / monthSegments.length}%;"></div>`).join("")}
              ${timelineAssignments.map((item, index) => {
                const title = getEmployeePortalProjectTitle(item.project);
                const left = getTimelineDatePercent(item.start_date, startDate, endDate);
                const right = getTimelineDatePercent(item.end_date, startDate, endDate);
                const width = Math.max(right - left, 1.8);
                const isSelected = String(item.id || "") === String(selectedEntryId || "");
                const label = `${title.full || title.cleanName} · ${formatDate(item.start_date)}–${formatDate(item.end_date)}`;
                return `<button type="button" class="iz-emp-plan-bar ${isSelected ? "iz-emp-plan-bar-active" : ""}" data-employee-portal-select-assignment="${escapeHtml(item.id || "")}" style="left:${left}%; width:${width}%; top:${index * 42 + 16}px;" title="${escapeHtml(label)}">
                  <span>${escapeHtml(title.full || title.cleanName)}</span>
                  <small>${escapeHtml(formatDate(item.start_date))}–${escapeHtml(formatDate(item.end_date))}</small>
                </button>`;
              }).join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderEmployeePortalEmpty(message) {
    return `
      <div class="iz-emp-topbar">
        <div class="iz-emp-brand"><div class="iz-emp-brand-main">IZOMAX</div><div class="iz-emp-brand-sub">Planner</div></div>
      </div>
      <div class="iz-emp-page"><div class="iz-emp-empty">${escapeHtml(message)}</div></div>
    `;
  }


  function renderEmployeePortalProfileCard(employee, displayName) {
    const title = employee?.title || employee?.employee_type || "Ansatt";
    const email = employee?.email || state.currentUserEmail || "";
    const phone = employee?.phone || "";
    return `
      <section class="iz-emp-card iz-emp-profile-card">
        <div class="iz-emp-section-head iz-emp-section-head-compact">
          <div class="iz-emp-section-icon">♙</div>
          <div class="iz-emp-section-title">Min profil</div>
        </div>
        <div class="iz-emp-profile-body">
          <div class="iz-emp-profile-avatar">${escapeHtml(getInitials(displayName))}</div>
          <div class="iz-emp-profile-info">
            <div class="iz-emp-profile-name">${escapeHtml(displayName)}</div>
            <div class="iz-emp-profile-role">${escapeHtml(title)}</div>
            ${email ? `<div class="iz-emp-profile-line">✉ ${escapeHtml(email)}</div>` : ""}
            ${phone ? `<div class="iz-emp-profile-line">☎ ${escapeHtml(phone)}</div>` : ""}
          </div>
        </div>
      </section>
    `;
  }

  function renderEmployeePortalSelectedProjectCard(selectedAssignment, employee, upcomingAssignments) {
    if (!selectedAssignment) {
      return `
        <section class="iz-emp-card iz-emp-next-card">
          <div class="iz-emp-section-head iz-emp-section-head-compact">
            <div class="iz-emp-section-icon">▣</div>
            <div class="iz-emp-section-title">Neste prosjekt</div>
          </div>
          <div class="iz-emp-empty iz-emp-empty-dark">Ingen kommende prosjekter registrert.</div>
        </section>
      `;
    }
    const project = selectedAssignment.project;
    const title = getEmployeePortalProjectTitle(project);
    const assignmentPeriodText = selectedAssignment.start_date && selectedAssignment.end_date ? `${formatDate(selectedAssignment.start_date)} – ${formatDate(selectedAssignment.end_date)}` : "Ikke satt";
    const roleText = selectedAssignment.role || employee?.title || "Ikke satt";
    const responsibleText = getEmployeePortalResponsibleText(project);
    const customerText = getEmployeePortalCustomerText(project);
    const isNext = selectedAssignment.id === upcomingAssignments[0]?.id;
    return `
      <section class="iz-emp-card iz-emp-next-card">
        <div class="iz-emp-section-head iz-emp-section-head-compact">
          <div class="iz-emp-section-icon">▣</div>
          <div class="iz-emp-section-title">${isNext ? "Neste prosjekt" : "Valgt prosjekt"}</div>
        </div>
        <div class="iz-emp-next-body">
          <div class="iz-emp-project-icon iz-emp-project-icon-small">♒</div>
          <div class="iz-emp-next-title">${title.code ? `<span>${escapeHtml(title.code)}</span> ` : ""}${escapeHtml(title.cleanName)}</div>
          <div class="iz-emp-next-meta">
            <div><span>Prosjektleder</span><strong>${escapeHtml(responsibleText)}</strong></div>
            <div><span>Kunde</span><strong>${escapeHtml(customerText)}</strong></div>
            <div><span>Din rolle</span><strong>${escapeHtml(roleText)}</strong></div>
            <div><span>Periode</span><strong>${escapeHtml(assignmentPeriodText)}</strong></div>
            <div><span>Workshop / feltperiode</span><strong>${escapeHtml(getWorkshopText(project))}</strong></div>
          </div>
          <button type="button" class="iz-emp-open-project iz-emp-open-project-wide" data-employee-portal-toggle-project-details="true">Åpne prosjekt →</button>
        </div>
      </section>
    `;
  }

  function renderEmployeePortal() {
    if (!els.employeePortalContent) return;
    const employee = getEmployeePortalEmployee();
    const displayName = employee?.name || getAccountDisplayName();
    const initials = getInitials(displayName);
    if (els.employeePortalTopInitials) els.employeePortalTopInitials.textContent = initials;
    if (els.employeePortalTopName) els.employeePortalTopName.textContent = displayName;

    if (!employee) {
      els.employeePortalContent.innerHTML = `
        <div class="iz-emp-dashboard iz-emp-dashboard-single">
          <section class="iz-emp-card iz-emp-project-card iz-emp-empty-state-card">
            <div class="iz-emp-project-icon iz-emp-muted-icon">!</div>
            <div>
              <div class="iz-emp-eyebrow">Min side</div>
              <div class="iz-emp-title">Ansattprofil mangler</div>
              <div class="iz-emp-empty">Fant ikke ansattprofil koblet til ${escapeHtml(state.currentUserEmail || "innlogget bruker")}. Be administrator koble brukeren til riktig ansattprofil.</div>
            </div>
          </section>
        </div>
      `;
      return;
    }

    const assignments = getEmployeePortalAssignments(employee);
    const upcomingAssignments = getEmployeePortalUpcomingAssignments(assignments);
    const selectedEntryId = String(state.employeePortalSelectedEntryId || "");
    let selectedAssignment = selectedEntryId ? upcomingAssignments.find(item => String(item.id || "") === selectedEntryId) : null;
    if (!selectedAssignment) {
      selectedAssignment = upcomingAssignments[0] || null;
      state.employeePortalSelectedEntryId = selectedAssignment?.id || "";
    }
    const history = getEmployeePortalHistory(assignments);

    if (!selectedAssignment) {
      els.employeePortalContent.innerHTML = `
        <div class="iz-emp-dashboard">
          <aside class="iz-emp-left-col">
            ${renderEmployeePortalProfileCard(employee, displayName)}
            ${renderEmployeePortalSelectedProjectCard(null, employee, upcomingAssignments)}
          </aside>
          <section class="iz-emp-main-col">
            ${renderEmployeePortalTimeline([], "")}
            <div class="iz-emp-content-grid">
              ${renderEmployeePortalUpcoming([], "")}
              ${renderEmployeePortalHistory(history)}
            </div>
          </section>
        </div>
      `;
      return;
    }

    const project = selectedAssignment.project;
    const title = getEmployeePortalProjectTitle(project);
    const bounds = getProjectDateBounds(project);
    const crewRows = getEmployeePortalCrewRows(project.id);
    const team = getEmployeePortalTeam(project.id, employee.name);
    const assignmentPeriodText = selectedAssignment.start_date && selectedAssignment.end_date ? `${formatDate(selectedAssignment.start_date)} – ${formatDate(selectedAssignment.end_date)}` : "Ikke satt";
    const projectPeriodText = bounds.start && bounds.end ? `${formatDate(bounds.start)} – ${formatDate(bounds.end)}` : assignmentPeriodText;
    const roleText = selectedAssignment.role || employee.title || "Ikke satt";
    const responsibleText = getEmployeePortalResponsibleText(project);
    const customerText = getEmployeePortalCustomerText(project);
    const phaseText = getEmployeePortalProjectPhaseText(project);
    const statusText = getEmployeePortalStatusText(project);
    const hasCode = Boolean(title.code);

    els.employeePortalContent.innerHTML = `
      <div class="iz-emp-dashboard">
        <aside class="iz-emp-left-col">
          ${renderEmployeePortalProfileCard(employee, displayName)}
          ${renderEmployeePortalSelectedProjectCard(selectedAssignment, employee, upcomingAssignments)}
          ${state.employeePortalProjectDetailsOpen ? renderEmployeePortalProjectDetails(selectedAssignment, employee, crewRows) : ""}
        </aside>
        <section class="iz-emp-main-col">
          ${renderEmployeePortalTimeline(upcomingAssignments, selectedAssignment.id)}
          ${renderEmployeePortalTeam(employee, project, crewRows)}
          <div class="iz-emp-content-grid">
            ${renderEmployeePortalUpcoming(upcomingAssignments, selectedAssignment.id)}
            ${renderEmployeePortalHistory(history)}
          </div>
        </section>
      </div>
    `;
  }

  function renderEmployeePortalUpcoming(assignments, selectedEntryId) {
    const upcoming = assignments || [];
    return `
      <section class="iz-emp-card iz-emp-section-card iz-emp-upcoming-card">
        <div class="iz-emp-section-head">
          <div class="iz-emp-section-icon">▦</div>
          <div>
            <div class="iz-emp-section-title">Kommende prosjekter</div>
            <div class="iz-emp-section-subtitle">Trykk på et prosjekt for å vise detaljene øverst.</div>
          </div>
        </div>
        ${upcoming.length ? `<div class="iz-emp-upcoming-list">${upcoming.map(item => {
          const title = getEmployeePortalProjectTitle(item.project);
          const period = item.start_date && item.end_date ? `${formatDate(item.start_date)} – ${formatDate(item.end_date)}` : "Dato ikke satt";
          const customer = getEmployeePortalCustomerText(item.project);
          const responsible = getEmployeePortalResponsibleText(item.project);
          const isSelected = String(item.id || "") === String(selectedEntryId || "");
          return `<button type="button" class="iz-emp-upcoming-row ${isSelected ? "iz-emp-upcoming-row-active" : ""}" data-employee-portal-select-assignment="${escapeHtml(item.id || "")}" aria-current="${isSelected ? "true" : "false"}">
            <div class="iz-emp-upcoming-date">${escapeHtml(period)}</div>
            <div class="iz-emp-upcoming-main">
              <div class="iz-emp-upcoming-title">${title.code ? `<span>${escapeHtml(title.code)}</span> ` : ""}${escapeHtml(title.cleanName)}</div>
              <div class="iz-emp-upcoming-meta">${escapeHtml(item.role || "Rolle ikke satt")}${customer !== "Ikke satt" ? ` · ${escapeHtml(customer)}` : ""}${responsible !== "Ikke satt" ? ` · PL: ${escapeHtml(responsible)}` : ""}</div>
            </div>
            <div class="iz-emp-upcoming-action">${isSelected ? "Vises" : "Vis"}</div>
          </button>`;
        }).join("")}</div>` : `<div class="iz-emp-empty">Ingen kommende prosjekter registrert.</div>`}
      </section>
    `;
  }

  function renderEmployeePortalTeam(employee, project, crewRows = []) {
    const currentName = String(employee?.name || "").trim().toLowerCase();
    const uniqueCrew = [];
    const seen = new Set();
    (crewRows || []).forEach(entry => {
      const name = String(entry?.employee_name || "").trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return;
      seen.add(key);
      uniqueCrew.push(entry);
    });
    uniqueCrew.sort((a, b) => {
      const aIsMe = String(a?.employee_name || "").trim().toLowerCase() === currentName;
      const bIsMe = String(b?.employee_name || "").trim().toLowerCase() === currentName;
      if (aIsMe !== bIsMe) return aIsMe ? -1 : 1;
      return String(a?.employee_name || "").localeCompare(String(b?.employee_name || ""), "no");
    });
    const crewSummary = getEmployeePortalCrewSummary(project, uniqueCrew);
    const statusClass = crewSummary.missing > 0 ? "iz-emp-chip-warning" : (crewSummary.complete ? "iz-emp-chip-ok" : "");
    const missingText = crewSummary.required > 0
      ? (crewSummary.missing > 0 ? `${crewSummary.missing} rolle${crewSummary.missing === 1 ? "" : "r"} mangler` : "Crew er komplett")
      : "Bemanningskrav er ikke satt på prosjektet";
    return `
      <section class="iz-emp-card iz-emp-section-card iz-emp-crew-card">
        <div class="iz-emp-section-head iz-emp-crew-head">
          <div class="iz-emp-section-icon">♙</div>
          <div>
            <div class="iz-emp-section-title">Prosjektteam</div>
            <div class="iz-emp-section-subtitle">${escapeHtml(crewSummary.label)} · ${escapeHtml(missingText)}</div>
          </div>
          <span class="iz-emp-chip ${statusClass}">${escapeHtml(crewSummary.status)}</span>
        </div>
        ${uniqueCrew.length ? `<div class="iz-emp-crew-list">${uniqueCrew.map(entry => {
          const isMe = String(entry?.employee_name || "").trim().toLowerCase() === currentName;
          const period = entry.start_date && entry.end_date ? `${formatDate(entry.start_date)} – ${formatDate(entry.end_date)}` : "Dato ikke satt";
          return `
            <div class="iz-emp-crew-row ${isMe ? "iz-emp-crew-row-current" : ""}">
              <div class="iz-emp-crew-avatar">${escapeHtml(getInitials(entry.employee_name))}</div>
              <div class="iz-emp-crew-person">
                <div class="iz-emp-crew-name">${escapeHtml(entry.employee_name || "Ukjent")}${isMe ? ` <span class="iz-emp-crew-you">Deg</span>` : ""}</div>
                <div class="iz-emp-crew-role">${escapeHtml(entry.role || "Tildelt")}</div>
              </div>
              <div class="iz-emp-crew-period">${escapeHtml(period)}</div>
            </div>
          `;
        }).join("")}</div>` : `<div class="iz-emp-empty">Crewdata er ikke tilgjengelig for valgt prosjekt. Kontroller at RPC-funksjonen er opprettet og at prosjektet har tildelinger.</div>`}
      </section>
    `;
  }

  function renderEmployeePortalHistory(history) {
    const rows = (history || []).slice(0, 3);
    return `
      <section class="iz-emp-card iz-emp-history-card">
        <div>
          <div class="iz-emp-section-head"><div class="iz-emp-section-icon">◴</div><div class="iz-emp-section-title">Siste aktivitet</div></div>
          ${rows.length ? `<div class="iz-emp-history-list">${rows.map(item => {
            const title = getEmployeePortalProjectTitle(item.project);
            return `<div class="iz-emp-history-row"><div class="iz-emp-history-code">${escapeHtml(title.code)}</div><div class="iz-emp-history-name">${escapeHtml(title.cleanName)}</div><div class="iz-emp-history-date">${escapeHtml(formatDate(item.start_date))} – ${escapeHtml(formatDate(item.end_date))}</div></div>`;
          }).join("")}</div>` : `<div class="iz-emp-empty">Ingen historikk registrert.</div>`}
        </div>
        <button type="button" class="iz-emp-view-all">Se all historikk ›</button>
      </section>
    `;
  }

  function applyRoleChrome() {
    updateAccountPanel();

    const canPlan = canPlanApp();
    const isLoggedIn = isLoggedInUser();
    const isSA = isSuperadmin();

    if (els.storageBadge) {
      els.storageBadge.style.display = isSA ? "" : "none";
    }

    if (els.saveStatus) {
      els.saveStatus.style.display = "none";
    }

    if (els.resetDemoBtn) {
      els.resetDemoBtn.style.display = isSA ? "" : "none";
    }

    if (els.loginBtn) {
      els.loginBtn.style.display = isLoggedIn ? "none" : "";
      els.loginBtn.classList.toggle("hidden", isLoggedIn);
    }

    if (els.accountMenuWrap) {
      els.accountMenuWrap.style.display = isLoggedIn ? "" : "none";
      els.accountMenuWrap.classList.toggle("hidden", !isLoggedIn);
    }

    if (els.changePasswordBtn) {
      els.changePasswordBtn.style.display = isLoggedIn ? "" : "none";
    }

    if (els.resetPasswordBtn) {
      els.resetPasswordBtn.style.display = "none";
    }

    if (els.logoutBtn) {
      els.logoutBtn.style.display = isLoggedIn ? "" : "none";
    }

    if (els.newProjectBtn) {
      els.newProjectBtn.style.display = canPlan ? "" : "none";
    }

    if (els.newEmployeeBtn) {
      els.newEmployeeBtn.style.display = canPlan ? "" : "none";
    }

    if (els.bulkAddBtn) {
      els.bulkAddBtn.style.display = canPlan ? "" : "none";
    }

    if (els.bulkEmployees) {
      els.bulkEmployees.disabled = !canPlan;
      els.bulkEmployees.style.display = canPlan ? "" : "none";
    }

    if (els.assignBtn) {
      els.assignBtn.style.display = canPlan ? "" : "none";
    }

    if (els.assignProject) els.assignProject.disabled = !canPlan;
    if (els.assignStart) els.assignStart.disabled = !canPlan;
    if (els.assignEnd) els.assignEnd.disabled = !canPlan;
    if (els.assignNotes) els.assignNotes.disabled = !canPlan;

    setCardDisplayByElement(els.newProjectBtn, canPlan);       // Prosjekter
    setCardDisplayByElement(els.assignBtn, canPlan);           // Tildel prosjekt i kalender
    setCardDisplayByElement(els.newEmployeeBtn, canPlan);      // Ansatte
    setCardDisplayById("kanbanBoard", canPlan);                // Kanban – prosjekter
    setCardDisplayById("notificationList", isSA);              // Varsellogg
    setCardDisplayById("auditList", isSA);                     // Endringslogg

    if (!canPlan) {
      closeEditModal();
      closeProjectModal();
      closeEmployeeModal();
    }

    renderLayoutTabs();
    renderCalendarPanel();
  }

  async function handleLogout() {
    if (!supabaseClient?.auth) return;
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;

      state.currentUser = "Ikke innlogget";
      state.currentUserEmail = "";
      state.currentUserId = "";
      state.currentRole = "";
      closeLoginModal();
      if (els.loginEmail) els.loginEmail.value = "";
      if (els.loginPassword) els.loginPassword.value = "";
      window.location.reload();
    } catch (error) {
      alert(`Kunne ikke logge ut: ${error?.message || "Ukjent feil"}`);
    }
  }

  function openLoginModal() {
    if (!els.loginModal) return;
    if (els.loginEmail) els.loginEmail.value = "";
    if (els.loginPassword) els.loginPassword.value = "";
    els.loginModal.classList.remove("hidden");
    els.loginModal.classList.add("flex");
    if (els.loginEmail) {
      els.loginEmail.focus();
    }
  }

  function closeLoginModal() {
    if (!els.loginModal) return;
    els.loginModal.classList.add("hidden");
    els.loginModal.classList.remove("flex");
    if (els.loginEmail) els.loginEmail.value = "";
    if (els.loginPassword) els.loginPassword.value = "";
    flushPendingRemoteRefresh();
  }

  async function handleStartLogin() {
    if (!supabaseClient?.auth) {
      setStartLoginError("Innlogging er ikke konfigurert i denne versjonen.");
      return;
    }

    const email = els.startLoginEmail?.value?.trim() || "";
    const password = els.startLoginPassword?.value || "";

    if (!email || !password) {
      setStartLoginError("Legg inn e-post og passord.");
      return;
    }

    setStartLoginError("");
    if (els.startLoginSubmitBtn) {
      els.startLoginSubmitBtn.disabled = true;
      els.startLoginSubmitBtn.textContent = "Logger inn...";
    }

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      setStartLoginError(`Kunne ikke logge inn: ${error?.message || "Ukjent feil"}`);
      if (els.startLoginSubmitBtn) {
        els.startLoginSubmitBtn.disabled = false;
        els.startLoginSubmitBtn.textContent = "Logg inn";
      }
    }
  }

  async function handleStartForgotPassword() {
    if (!supabaseClient?.auth) {
      setStartLoginError("Passordreset er ikke konfigurert i denne versjonen.");
      return;
    }

    const email = els.startLoginEmail?.value?.trim() || "";
    if (!email) {
      setStartLoginError("Legg inn e-postadressen din først.");
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });

    if (error) {
      setStartLoginError(`Kunne ikke sende reset-link: ${error.message}`);
      return;
    }

    setStartLoginError("Reset-link er sendt hvis e-postadressen finnes i systemet.");
  }

  function setAccessRequestFeedback(message = "", variant = "neutral") {
    if (!els.accessRequestFeedback) return;
    els.accessRequestFeedback.textContent = message;
    els.accessRequestFeedback.classList.toggle("visible", Boolean(message));
    els.accessRequestFeedback.classList.toggle("success", variant === "success");
    els.accessRequestFeedback.classList.toggle("error", variant === "error");
  }

  function openAccessRequestModal() {
    if (!els.accessRequestModal) return;
    setStartLoginError("");
    setAccessRequestFeedback("");
    if (els.accessRequestName) els.accessRequestName.value = "";
    if (els.accessRequestEmail) els.accessRequestEmail.value = els.startLoginEmail?.value?.trim() || "";
    if (els.accessRequestPhone) els.accessRequestPhone.value = "";
    if (els.accessRequestType) els.accessRequestType.value = "employee";
    if (els.accessRequestMessage) els.accessRequestMessage.value = "";
    if (els.accessRequestSubmitBtn) {
      els.accessRequestSubmitBtn.disabled = false;
      els.accessRequestSubmitBtn.textContent = "Send søknad";
    }
    els.accessRequestModal.classList.add("visible");
    els.accessRequestModal.setAttribute("aria-hidden", "false");
    setTimeout(() => els.accessRequestName?.focus(), 0);
  }

  function closeAccessRequestModal() {
    if (!els.accessRequestModal) return;
    els.accessRequestModal.classList.remove("visible");
    els.accessRequestModal.setAttribute("aria-hidden", "true");
    setAccessRequestFeedback("");
  }

  function handleStartAccessHelp() {
    openAccessRequestModal();
  }

  async function submitAccessRequest() {
    if (!supabaseClient) {
      setAccessRequestFeedback("Supabase er ikke konfigurert i denne versjonen.", "error");
      return;
    }

    const fullName = els.accessRequestName?.value?.trim() || "";
    const email = els.accessRequestEmail?.value?.trim().toLowerCase() || "";
    const phone = els.accessRequestPhone?.value?.trim() || "";
    const requestedAccess = els.accessRequestType?.value || "employee";
    const message = els.accessRequestMessage?.value?.trim() || "";

    if (!fullName) {
      setAccessRequestFeedback("Legg inn navn.", "error");
      els.accessRequestName?.focus();
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAccessRequestFeedback("Legg inn en gyldig e-postadresse.", "error");
      els.accessRequestEmail?.focus();
      return;
    }

    if (!["employee", "planner", "admin"].includes(requestedAccess)) {
      setAccessRequestFeedback("Velg ønsket tilgang.", "error");
      els.accessRequestType?.focus();
      return;
    }

    const row = {
      full_name: fullName,
      email,
      phone: phone || null,
      requested_access: requestedAccess,
      message: message || null,
      status: "pending"
    };

    if (els.accessRequestSubmitBtn) {
      els.accessRequestSubmitBtn.disabled = true;
      els.accessRequestSubmitBtn.textContent = "Sender...";
    }

    setAccessRequestFeedback("");

    try {
      const { error } = await supabaseClient.from("access_requests").insert(row);
      if (error) throw error;

      setAccessRequestFeedback("Søknad sendt. Superadmin må godkjenne tilgangen før brukeren kan åpne systemet.", "success");
      if (els.accessRequestSubmitBtn) {
        els.accessRequestSubmitBtn.textContent = "Sendt";
      }
      if (els.startLoginEmail) els.startLoginEmail.value = email;
    } catch (error) {
      setAccessRequestFeedback(`Kunne ikke sende søknad: ${error?.message || "Ukjent feil"}`, "error");
      if (els.accessRequestSubmitBtn) {
        els.accessRequestSubmitBtn.disabled = false;
        els.accessRequestSubmitBtn.textContent = "Send søknad";
      }
    }
  }

  function formatAccessRequestDate(value) {
    if (!value) return "-";
    try {
      return new Intl.DateTimeFormat("no-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    } catch (_) {
      return String(value || "-");
    }
  }

  function formatAccessRequestStatus(status) {
    const normalized = String(status || "pending").toLowerCase();
    if (normalized === "approved") return "Godkjent";
    if (normalized === "rejected") return "Avslått";
    return "Venter";
  }

  function formatRequestedAccess(value) {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "employee") return "Ansatt / Min side";
    if (normalized === "reader") return "Lesetilgang";
    if (normalized === "planner") return "Planlegger";
    if (normalized === "admin") return "Admin";
    return value || "Ikke valgt";
  }

  async function fetchAccessRequests(options = {}) {
    const silent = Boolean(options.silent);
    if (!supabaseClient || !canApproveAccessRequests()) {
      state.accessRequests.rows = [];
      state.accessRequests.error = "";
      return;
    }

    state.accessRequests.loading = true;
    if (!silent) renderAccessRequests();

    try {
      const { data, error } = await supabaseClient
        .from("access_requests")
        .select("id, full_name, email, phone, requested_access, message, status, created_at, reviewed_at, reviewed_by, review_note, setup_completed_at, setup_completed_by, approved_role, linked_employee_id")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      state.accessRequests.rows = data || [];
      state.accessRequests.error = "";
      state.accessRequests.lastLoadedAt = new Date().toISOString();
    } catch (error) {
      state.accessRequests.error = error?.message || "Kunne ikke hente tilgangssøknader.";
    } finally {
      state.accessRequests.loading = false;
      renderAccessRequests();
      renderEmployees();
    }
  }

  function refreshAccessRequests() {
    return fetchAccessRequests({ silent: false });
  }

  function getAccessRequestBadgeClass(status) {
    const normalized = String(status || "pending").toLowerCase();
    if (normalized === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (normalized === "rejected") return "border-rose-200 bg-rose-50 text-rose-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  function renderAccessRequests() {
    if (!els.accessApprovalList) return;

    const allowed = canApproveAccessRequests();
    const card = els.accessApprovalList.closest(".rounded-2xl");
    if (card) card.style.display = allowed ? "" : "none";
    if (!allowed) return;

    const focusedEmployee = getEmployeeAdminAccessPanelEmployee();
    const allRows = state.accessRequests.rows || [];
    const rows = focusedEmployee ? getAccessRequestsForEmployee(focusedEmployee, allRows) : allRows;
    updateEmployeeAccessPanelHeader(focusedEmployee);
    const pendingCount = rows.filter(row => String(row.status || "pending").toLowerCase() === "pending").length;
    const readyForSetupCount = rows.filter(row => String(row.status || "pending").toLowerCase() === "approved" && !row.setup_completed_at).length;
    const completedCount = rows.filter(row => row.setup_completed_at || ["rejected", "declined"].includes(String(row.status || "").toLowerCase())).length;

    if (els.accessApprovalStatus) {
      const loadedText = state.accessRequests.lastLoadedAt ? `Sist hentet ${formatAccessRequestDate(state.accessRequests.lastLoadedAt)}` : "Ikke hentet ennå";
      const scopeText = focusedEmployee ? `${focusedEmployee.name || "Valgt ansatt"} • ` : "";
      els.accessApprovalStatus.textContent = state.accessRequests.loading ? "Henter søknader..." : `${scopeText}${pendingCount} ventende • ${readyForSetupCount} klar for oppsett • ${completedCount} i historikk • ${loadedText}`;
    }

    if (state.accessRequests.loading && !rows.length) {
      els.accessApprovalList.innerHTML = `<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Henter tilgangssøknader...</div>`;
      return;
    }

    if (state.accessRequests.error) {
      els.accessApprovalList.innerHTML = `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Kunne ikke hente tilgangssøknader: ${escapeHtml(state.accessRequests.error)}</div>`;
      return;
    }

    if (!rows.length) {
      const emptyText = focusedEmployee
        ? `Ingen tilgangssøknader funnet for ${escapeHtml(focusedEmployee.name || "valgt ansatt")}.`
        : "Ingen tilgangssøknader ennå.";
      els.accessApprovalList.innerHTML = `<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">${emptyText}</div>`;
      return;
    }

    const displayRows = rows.slice().sort((a, b) => {
      const rank = row => {
        const status = String(row.status || "pending").toLowerCase();
        if (status === "pending") return 0;
        if (status === "approved" && !row.setup_completed_at) return 1;
        if (status === "approved" && row.setup_completed_at) return 2;
        return 3;
      };
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    const activeRequestRows = displayRows.filter(row => {
      const status = String(row.status || "pending").toLowerCase();
      return status === "pending" || (status === "approved" && !row.setup_completed_at);
    });
    const historyRequestRows = displayRows.filter(row => !activeRequestRows.some(activeRow => activeRow.id === row.id));
    const activeRequestsIntro = activeRequestRows.length
      ? ""
      : `<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Ingen åpne tilgangssøknader. Fullførte/avslåtte søknader ligger kompakt i historikken under.</div>`;

    const activeRequestsHtml = activeRequestRows.map(row => {
      const status = String(row.status || "pending").toLowerCase();
      const isPending = status === "pending";
      const isApproved = status === "approved";
      const isSetupCompleted = Boolean(row.setup_completed_at);
      const matchingProfile = findAccessUserProfileByEmail(row.email);
      const canSetup = isApproved && !isSetupCompleted && canManageUserAccess();
      const setupInfo = renderAccessSetupBlock(row, matchingProfile, canSetup);
      return `
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100" data-access-request-row-id="${escapeHtml(row.id)}">
          <div class="p-5">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0 space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <div class="font-semibold text-slate-900">${escapeHtml(row.full_name || "Uten navn")}</div>
                <span class="rounded-full border px-2.5 py-1 text-xs font-semibold ${getAccessRequestBadgeClass(status)}">${escapeHtml(formatAccessRequestStatus(status))}</span>
                ${isSetupCompleted ? `<span class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Tilgang satt opp</span>` : ""}
              </div>
              <div class="text-sm text-slate-600">${escapeHtml(row.email || "Ingen e-post")}${row.phone ? ` • ${escapeHtml(row.phone)}` : ""}</div>
              <div class="text-sm text-slate-700"><span class="font-medium">Ønsket tilgang:</span> ${escapeHtml(formatRequestedAccess(row.requested_access))}</div>
              ${row.message ? `<div class="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">${escapeHtml(row.message)}</div>` : ""}
              <div class="text-xs text-slate-500">Sendt ${escapeHtml(formatAccessRequestDate(row.created_at))}${row.reviewed_at ? ` • Behandlet ${escapeHtml(formatAccessRequestDate(row.reviewed_at))}` : ""}${row.setup_completed_at ? ` • Oppsatt ${escapeHtml(formatAccessRequestDate(row.setup_completed_at))}` : ""}</div>
            </div>
            <div class="flex shrink-0 flex-wrap gap-2">
              <button type="button" data-access-action="approved" data-access-request-id="${escapeHtml(row.id)}" class="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40" ${isPending ? "" : "disabled"}>Godkjenn</button>
              <button type="button" data-access-action="rejected" data-access-request-id="${escapeHtml(row.id)}" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40" ${isPending ? "" : "disabled"}>Avslå</button>
            </div>
          </div>
          </div>
          ${setupInfo}
        </div>
      `;
    }).join("");

    const historyHtml = historyRequestRows.length
      ? `<details class="rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
          <summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Historikk: ${historyRequestRows.length} fullførte/avslåtte søknader</summary>
          <div class="divide-y divide-slate-100 border-t border-slate-100">
            ${historyRequestRows.slice(0, 25).map(row => {
              const status = String(row.status || "pending").toLowerCase();
              return `<div class="flex flex-col gap-1 px-5 py-3 text-sm md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <div class="truncate font-semibold text-slate-800">${escapeHtml(row.full_name || row.email || "Uten navn")}</div>
                  <div class="truncate text-xs text-slate-500">${escapeHtml(row.email || "Ingen e-post")} • ${escapeHtml(formatRequestedAccess(row.approved_role || row.requested_access))}</div>
                </div>
                <div class="flex shrink-0 flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span class="rounded-full border px-2 py-0.5 font-semibold ${getAccessRequestBadgeClass(status)}">${escapeHtml(formatAccessRequestStatus(status))}</span>
                  ${row.setup_completed_at ? `<span>Oppsatt ${escapeHtml(formatAccessRequestDate(row.setup_completed_at))}</span>` : `<span>Sendt ${escapeHtml(formatAccessRequestDate(row.created_at))}</span>`}
                </div>
              </div>`;
            }).join("")}
            ${historyRequestRows.length > 25 ? `<div class="px-5 py-3 text-xs text-slate-500">Viser de 25 siste historikkradene.</div>` : ""}
          </div>
        </details>`
      : "";

    els.accessApprovalList.innerHTML = `${activeRequestsIntro}${activeRequestsHtml}${historyHtml}`;
  }

  function findAccessUserProfileByEmail(email) {
    const normalized = normalizeComparableText(email);
    if (!normalized) return null;
    return (state.accessUsers.rows || []).find(row => normalizeComparableText(row.email) === normalized) || null;
  }

  const ACCESS_CREATE_NEW_EMPLOYEE_VALUE = "__create_new_employee__";

  function normalizeAccessPhone(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function getAccessEmployeeMatchReasons(row, employee) {
    if (!row || !employee) return [];
    const reasons = [];
    const requestedEmail = normalizeComparableText(row.email || "");
    const employeeEmail = normalizeComparableText(employee.email || "");
    if (requestedEmail && employeeEmail && requestedEmail === employeeEmail) reasons.push("e-post");

    const requestedPhone = normalizeAccessPhone(row.phone || "");
    const employeePhone = normalizeAccessPhone(employee.phone || "");
    if (requestedPhone && employeePhone && (requestedPhone === employeePhone || requestedPhone.endsWith(employeePhone) || employeePhone.endsWith(requestedPhone))) reasons.push("telefon");

    const requestedName = normalizeComparableText(row.full_name || "");
    const employeeName = normalizeComparableText(employee.name || "");
    if (requestedName && employeeName && requestedName === employeeName) reasons.push("navn");
    return reasons;
  }

  function getAccessEmployeeMatches(row) {
    const employees = (state.employees || []).filter(employee => employee?.id && employee.active !== false);
    return employees
      .map(employee => ({ employee, reasons: getAccessEmployeeMatchReasons(row, employee) }))
      .filter(item => item.reasons.length)
      .sort((a, b) => {
        const score = item => {
          if (item.reasons.includes("e-post")) return 0;
          if (item.reasons.includes("telefon")) return 1;
          if (item.reasons.includes("navn")) return 2;
          return 3;
        };
        const rank = score(a) - score(b);
        if (rank !== 0) return rank;
        return String(a.employee.name || "").localeCompare(String(b.employee.name || ""), "no");
      });
  }

  function getAccessCompletePreferredEmployeeId(row) {
    const linkedId = row?.linked_employee_id ? String(row.linked_employee_id) : "";
    if (linkedId) {
      const linkedEmployee = (state.employees || []).find(employee => String(employee?.id || "") === linkedId && employee.active !== false);
      if (linkedEmployee) return linkedEmployee.id;
    }
    const firstMatch = getAccessEmployeeMatches(row)[0]?.employee;
    return firstMatch?.id || "";
  }

  function getAccessCompleteEmployeeLinkOptions(selectedEmployeeId, row = null) {
    const selected = String(selectedEmployeeId || "");
    const matches = getAccessEmployeeMatches(row);
    const matchMap = new Map(matches.map(item => [String(item.employee.id), item.reasons]));
    const employees = (state.employees || [])
      .filter(employee => employee?.id && employee.active !== false)
      .slice()
      .sort((a, b) => {
        const aMatched = matchMap.has(String(a.id)) ? 0 : 1;
        const bMatched = matchMap.has(String(b.id)) ? 0 : 1;
        if (aMatched !== bMatched) return aMatched - bMatched;
        return String(a.name || "").localeCompare(String(b.name || ""), "no");
      });

    const options = [`<option value="">Velg eksisterende ansatt eller opprett ny</option>`];
    employees.forEach(employee => {
      const reasons = matchMap.get(String(employee.id)) || [];
      const matchLabel = reasons.length ? `MATCH: ${reasons.join("+")}` : "";
      const label = [employee.name, employee.title, employee.employee_group, employee.email, matchLabel].filter(Boolean).join(" • ");
      options.push(`<option value="${escapeHtml(employee.id)}" ${String(employee.id) === selected ? "selected" : ""}>${escapeHtml(label || employee.id)}</option>`);
    });
    options.push(`<option value="${ACCESS_CREATE_NEW_EMPLOYEE_VALUE}" ${selected === ACCESS_CREATE_NEW_EMPLOYEE_VALUE ? "selected" : ""}>Opprett ny ansatt – kun hvis personen ikke finnes fra før</option>`);
    return options.join("");
  }

  function getAccessCompleteSelectedEmployee(row) {
    const employeeId = getAccessCompletePreferredEmployeeId(row);
    if (!employeeId) return null;
    return (state.employees || []).find(employee => String(employee?.id || "") === String(employeeId)) || null;
  }

  function renderAccessCompleteEmployeeLinkBlock(row, selectedRole) {
    const isEmployeeRole = String(selectedRole || "").toLowerCase() === "employee";
    const matches = getAccessEmployeeMatches(row);
    const selectedEmployeeId = isEmployeeRole ? getAccessCompletePreferredEmployeeId(row) : "";
    const selectedEmployee = selectedEmployeeId ? (state.employees || []).find(employee => String(employee?.id || "") === String(selectedEmployeeId)) : null;
    const matchedText = matches.length
      ? `Fant ${matches.length} mulig eksisterende ansatt. Standard er å koble til eksisterende ansatt for å hindre duplikat.`
      : "Ingen sikker match funnet. Velg eksisterende ansatt manuelt, eller velg opprett ny hvis personen faktisk ikke finnes fra før.";
    const selectedText = selectedEmployee
      ? `${selectedEmployee.name || "Ansatt"}${selectedEmployee.title ? ` • ${selectedEmployee.title}` : ""}${selectedEmployee.employee_group ? ` • ${selectedEmployee.employee_group}` : ""}`
      : "Ingen ansatt valgt ennå.";

    return `
      <div class="mt-4 rounded-xl border ${matches.length ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"} p-4" data-access-complete-employee-link-box="${escapeHtml(row.id)}">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0">
            <div class="text-sm font-bold text-slate-900">Ansattkobling / duplikatkontroll</div>
            <div class="mt-1 text-xs leading-relaxed ${matches.length ? "text-amber-800" : "text-slate-600"}">${escapeHtml(matchedText)}</div>
            <div class="mt-1 text-xs text-slate-600">Valgt: ${escapeHtml(selectedText)}</div>
          </div>
          ${matches.length ? `<span class="inline-flex w-fit rounded-md border border-amber-400 bg-white px-3 py-1.5 text-xs font-bold text-amber-800">Mulig match funnet</span>` : `<span class="inline-flex w-fit rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700">Manuelt valg kreves</span>`}
        </div>
        <label class="mt-3 block text-sm text-slate-700">
          <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Koble til ansattprofil</span>
          <select data-access-complete-existing-employee="${escapeHtml(row.id)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" ${isEmployeeRole ? "" : "disabled"}>
            ${getAccessCompleteEmployeeLinkOptions(selectedEmployeeId, row)}
          </select>
        </label>
        <div class="mt-2 text-xs leading-relaxed text-slate-600">
          Bruk <span class="font-semibold">Opprett ny ansatt</span> bare når personen ikke allerede finnes i ansattlisten. Dette hindrer at ansatte som allerede er planlagt på jobber blir opprettet på nytt.
        </div>
      </div>
    `;
  }

  function getAccessEmployeeAutoMatch(row) {
    const linkedId = row?.linked_employee_id ? String(row.linked_employee_id) : "";
    if (linkedId) {
      const linked = (state.employees || []).find(employee => String(employee?.id || "") === linkedId);
      if (linked) return linked;
    }

    const requestedEmail = normalizeComparableText(row?.email || "");
    if (requestedEmail) {
      const emailMatch = (state.employees || []).find(employee => normalizeComparableText(employee?.email || "") === requestedEmail);
      if (emailMatch) return emailMatch;
    }

    const requestedName = normalizeComparableText(row?.full_name || "");
    if (requestedName) {
      const nameMatch = (state.employees || []).find(employee => normalizeComparableText(employee?.name || "") === requestedName);
      if (nameMatch) return nameMatch;
    }

    return null;
  }

  function getAccessSetupChecklistHtml(row, matchingProfile, autoMatchedEmployee, selectedRole) {
    const normalizedRole = String(selectedRole || row?.requested_access || "").toLowerCase();
    const isEmployeeRole = normalizedRole === "employee";
    const roleIsValid = ["employee", "planner", "admin"].includes(normalizedRole);
    const employeeReady = !isEmployeeRole || Boolean(autoMatchedEmployee || row?.linked_employee_id);
    const profileReady = Boolean(matchingProfile);
    const requestApproved = String(row?.status || "pending").toLowerCase() === "approved";
    const readyForSetup = requestApproved && roleIsValid && employeeReady;

    const statusChip = (ok, labelOk, labelMissing) => ok
      ? `<span class="inline-flex items-center rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800">✓ ${escapeHtml(labelOk)}</span>`
      : `<span class="inline-flex items-center rounded-md border border-amber-400 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">Mangler: ${escapeHtml(labelMissing)}</span>`;

    return `
      <div class="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div class="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="text-sm font-bold text-slate-950">Status for oppsett</div>
            <div class="text-xs text-slate-600">Følg stegene under fra venstre mot høyre. Fargene er kun statusmarkører, ikke egne arbeidsbokser.</div>
          </div>
          <span class="inline-flex w-fit items-center rounded-md border px-3 py-1.5 text-xs font-bold ${readyForSetup ? "border-emerald-500 bg-emerald-700 text-white" : "border-amber-500 bg-amber-600 text-white"}">${readyForSetup ? "Klar til fullføring" : "Mangler steg"}</span>
        </div>
        <div class="grid gap-2 text-sm lg:grid-cols-5">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-bold uppercase tracking-wide text-slate-500">1. Søknad</div>
            <div class="mt-2">${statusChip(requestApproved, "Godkjent", "Godkjenning")}</div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-bold uppercase tracking-wide text-slate-500">2. Auth / profil</div>
            <div class="mt-2">${statusChip(profileReady, "Bruker finnes", "Opprett Auth-bruker")}</div>
            <div class="mt-2 truncate text-xs text-slate-600">${escapeHtml(profileReady ? (matchingProfile.email || row.email || "OK") : "Opprettes via knappen under")}</div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-bold uppercase tracking-wide text-slate-500">3. Rolle</div>
            <div class="mt-2">${statusChip(roleIsValid, formatRequestedAccess(normalizedRole), "Velg rolle")}</div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-bold uppercase tracking-wide text-slate-500">4. Ansatt</div>
            <div class="mt-2">${statusChip(employeeReady, isEmployeeRole ? "Koblet" : "Ikke relevant", "Koble ansatt")}</div>
            <div class="mt-2 truncate text-xs text-slate-600">${escapeHtml(!isEmployeeRole ? "Kun for employee" : autoMatchedEmployee ? autoMatchedEmployee.name || "Ansatt valgt" : "Velg i listen under")}</div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-bold uppercase tracking-wide text-slate-500">5. Fullføring</div>
            <div class="mt-2">${statusChip(readyForSetup, "Klar", "Steg over")}</div>
          </div>
        </div>
      </div>
    `;
  }

  function getAllowedAccessRoleOptions() {
    const role = normalizeRoleValue(state.currentRole);
    if (role === "superadmin" || role === "admin") {
      return [
        ["employee", "Ansatt / Min side"],
        ["planner", "Planlegger"],
        ["admin", "Admin"]
      ];
    }
    if (role === "planner") {
      return [
        ["employee", "Ansatt / Min side"],
        ["planner", "Planlegger"]
      ];
    }
    return [];
  }

  function getAccessSetupRoleOptions(selectedValue) {
    const selected = String(selectedValue || "").toLowerCase();
    const options = getAllowedAccessRoleOptions();
    return options.map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  }

  function canAssignAccessRole(role) {
    const normalized = normalizeRoleValue(role);
    return Boolean(normalized) && getAllowedAccessRoleOptions().some(([value]) => value === normalized);
  }

  function getDefaultAssignableAccessRole(preferredRole = "employee") {
    const normalized = normalizeRoleValue(preferredRole);
    if (canAssignAccessRole(normalized)) return normalized;
    const first = getAllowedAccessRoleOptions()[0];
    return first?.[0] || "employee";
  }

  function getAccessSetupEmployeeOptions(selectedEmployeeId, row = null) {
    const selected = String(selectedEmployeeId || "");
    const requestedEmail = normalizeComparableText(row?.email || "");
    const employees = (state.employees || [])
      .filter(employee => employee?.id && employee.active !== false)
      .slice()
      .sort((a, b) => {
        const aEmailMatch = requestedEmail && normalizeComparableText(a.email || "") === requestedEmail ? 0 : 1;
        const bEmailMatch = requestedEmail && normalizeComparableText(b.email || "") === requestedEmail ? 0 : 1;
        if (aEmailMatch !== bEmailMatch) return aEmailMatch - bEmailMatch;
        return String(a.name || "").localeCompare(String(b.name || ""), "no");
      });

    const options = [`<option value="">Velg ansattprofil</option>`];
    employees.forEach(employee => {
      const emailMatch = requestedEmail && normalizeComparableText(employee.email || "") === requestedEmail;
      const label = [employee.name, employee.title, employee.employee_group, emailMatch ? "matcher e-post" : ""].filter(Boolean).join(" • ");
      options.push(`<option value="${escapeHtml(employee.id)}" ${String(employee.id) === selected ? "selected" : ""}>${escapeHtml(label || employee.id)}</option>`);
    });
    return options.join("");
  }

  function generateTemporaryAccessPassword(length = 14) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const symbols = "!#%?";
    const random = new Uint32Array(length);
    crypto.getRandomValues(random);
    let password = "";
    for (let i = 0; i < length; i += 1) {
      password += alphabet[random[i] % alphabet.length];
    }
    return `${password}${symbols[random[0] % symbols.length]}`;
  }

  function getAccessCompleteEmployeeTypeOptions(selectedValue) {
    const selected = String(selectedValue || "");
    const options = [
      ["", "Velg type"],
      ["Offshore", "Offshore"],
      ["Onshore", "Onshore"],
      ["Engineering", "Engineering"],
      ["Lager og logistikk", "Lager og logistikk"],
      ["3 parts innleie", "3 parts innleie"],
      ["Management", "Management"],
      ["Prosjektledelse / planlegging", "Prosjektledelse / planlegging"]
    ];
    return options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  }

  function getAccessCompleteGroupOptions(selectedValue) {
    const selected = normalizeEmployeeGroup(selectedValue || "");
    return EMPLOYEE_GROUP_OPTIONS.map(value => {
      const label = value ? getEmployeeGroupLabel(value) : "Velg gruppe";
      return `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
    }).join("");
  }

  function getAccessCompleteDefaultGroup(row) {
    const requested = normalizeEmployeeGroup(row?.requested_access || "");
    if (requested) return requested;
    return "Offshore arbeider";
  }

  function getAccessCompleteDefaultType(row) {
    const group = getAccessCompleteDefaultGroup(row);
    if (group === "Offshore arbeider") return "Offshore";
    if (group === "Onshore arbeider") return "Onshore";
    if (group === "Engineering") return "Engineering";
    if (group === "Lager og logistikk") return "Lager og logistikk";
    if (group === "3 parts innleie") return "3 parts innleie";
    if (group === "Management") return "Management";
    if (group === "Prosjektledelse / planlegging") return "Prosjektledelse / planlegging";
    return "Offshore";
  }

  function renderAccessCompleteSetupBlock(row, matchingProfile) {
    const status = String(row.status || "pending").toLowerCase();
    const canComplete = canApproveAccessRequests();
    if (!["pending", "approved"].includes(status) || row.setup_completed_at || !canComplete) return "";

    const selectedRole = String(row.approved_role || row.requested_access || "employee").toLowerCase();
    const safeRole = getDefaultAssignableAccessRole(selectedRole);
    const selectedEmployee = safeRole === "employee" ? getAccessCompleteSelectedEmployee(row) : null;
    const defaultTitle = selectedEmployee?.title || (row.full_name ? "Ansatt" : "");
    const defaultType = selectedEmployee?.employee_type || getAccessCompleteDefaultType(row);
    const defaultGroup = selectedEmployee?.employee_group || getAccessCompleteDefaultGroup(row);
    const adminNote = isSuperadmin()
      ? "Superadmin kan sette employee, planner og admin."
      : isAdminUser()
        ? "Admin kan sette employee, planner og admin."
        : "Planner kan sette employee og planner. Admin-rolle krever admin/superadmin.";

    return `
      <div class="border-t border-slate-200 bg-slate-50 p-5" data-access-complete-panel="${escapeHtml(row.id)}">
        <div class="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm ring-1 ring-emerald-100">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="text-xs font-bold uppercase tracking-wide text-emerald-700">v18.53 samlet flyt</div>
              <div class="mt-1 text-base font-bold text-slate-950">Godkjenn og opprett komplett tilgang</div>
              <div class="mt-1 text-sm text-slate-600">Denne knappen bruker Edge Function <span class="font-mono">admin-complete-access-request</span>. Den godkjenner søknaden, oppretter/gjenbruker Auth-bruker, oppretter/oppdaterer brukerprofil og oppretter/kobler ansattprofil når rollen er Ansatt.</div>
            </div>
            <span class="inline-flex w-fit items-center rounded-md border border-slate-300 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">${escapeHtml(status === "pending" ? "Kan kjøres direkte fra pending" : "Godkjent – klar")}</span>
          </div>

          <div class="mt-4 grid gap-3 xl:grid-cols-4">
            <label class="block text-sm text-slate-700">
              <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Endelig rolle</span>
              <select data-access-complete-role="${escapeHtml(row.id)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                ${getAccessSetupRoleOptions(safeRole)}
              </select>
            </label>
            <label class="block text-sm text-slate-700 xl:col-span-2">
              <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Midlertidig passord</span>
              <input data-access-complete-password="${escapeHtml(row.id)}" type="text" autocomplete="off" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Skriv eller generer midlertidig passord" />
            </label>
            <button type="button" data-access-action="generate-temp-password" data-access-request-id="${escapeHtml(row.id)}" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 xl:self-end">Generer passord</button>
          </div>

          ${renderAccessCompleteEmployeeLinkBlock(row, safeRole)}

          <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4" data-access-complete-new-employee-fields="${escapeHtml(row.id)}">
            <div class="text-sm font-bold text-slate-900">Ansattdata ved ny ansatt</div>
            <div class="mt-1 text-xs text-slate-600">Brukes kun hvis du eksplisitt velger “Opprett ny ansatt”. Ved eksisterende ansatt hentes tittel/type/gruppe fra ansattprofilen.</div>
            <div class="mt-3 grid gap-3 lg:grid-cols-3">
              <label class="block text-sm text-slate-700">
                <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Stilling / tittel</span>
                <input data-access-complete-title="${escapeHtml(row.id)}" type="text" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" value="${escapeHtml(defaultTitle)}" placeholder="F.eks. Supervisor" ${selectedEmployee ? "disabled" : ""} />
              </label>
              <label class="block text-sm text-slate-700">
                <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Employee type</span>
                <select data-access-complete-employee-type="${escapeHtml(row.id)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" ${selectedEmployee ? "disabled" : ""}>
                  ${getAccessCompleteEmployeeTypeOptions(defaultType)}
                </select>
              </label>
              <label class="block text-sm text-slate-700">
                <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Employee group</span>
                <select data-access-complete-employee-group="${escapeHtml(row.id)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" ${selectedEmployee ? "disabled" : ""}>
                  ${getAccessCompleteGroupOptions(defaultGroup)}
                </select>
              </label>
            </div>
          </div>

          <div class="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="text-xs leading-relaxed text-slate-600">
              ${escapeHtml(adminNote)} ${matchingProfile ? "Brukerprofil finnes allerede og blir oppdatert." : "Auth-bruker og brukerprofil opprettes hvis de mangler."}
              Passord sendes ikke på e-post automatisk.
            </div>
            <button type="button" data-access-action="complete-access" data-access-request-id="${escapeHtml(row.id)}" class="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40">Godkjenn og opprett komplett tilgang</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderAccessSetupBlock(row, matchingProfile, canSetup) {
    const status = String(row.status || "pending").toLowerCase();
    if (row.setup_completed_at) return renderLegacyAccessSetupBlock(row, matchingProfile, canSetup);

    const completeBlock = renderAccessCompleteSetupBlock(row, matchingProfile);
    if (!["pending", "approved"].includes(status)) return "";

    const legacyBlock = status === "approved" && canManageUserAccess()
      ? `<details class="border-t border-slate-200 bg-white px-5 py-4"><summary class="cursor-pointer text-sm font-semibold text-slate-700">Vis gammel todelt fallback-flyt</summary><div class="mt-4">${renderLegacyAccessSetupBlock(row, matchingProfile, canSetup)}</div></details>`
      : "";

    return `${completeBlock}${legacyBlock}`;
  }

  function renderLegacyAccessSetupBlock(row, matchingProfile, canSetup) {
    const status = String(row.status || "pending").toLowerCase();
    if (status !== "approved") return "";

    if (row.setup_completed_at) {
      const employee = row.linked_employee_id ? (state.employees || []).find(item => item.id === row.linked_employee_id) : null;
      return `
        <div class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <div class="font-semibold">Tilgang er satt opp</div>
          <div class="mt-1">Rolle: ${escapeHtml(formatRequestedAccess(row.approved_role || row.requested_access))}${employee ? ` • Ansatt: ${escapeHtml(employee.name)}` : ""}</div>
        </div>
      `;
    }

    if (!canManageUserAccess()) {
      return `
        <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <div class="font-semibold">Godkjent søknad</div>
          <div class="mt-1">Kun superadmin kan sette opp faktisk brukertilgang og rolle.</div>
        </div>
      `;
    }

    const selectedRole = String(row.approved_role || row.requested_access || "employee").toLowerCase();
    const isEmployeeRole = selectedRole === "employee";
    const autoMatchedEmployee = getAccessEmployeeAutoMatch(row);
    const selectedEmployeeId = row.linked_employee_id || (isEmployeeRole && autoMatchedEmployee ? autoMatchedEmployee.id : "");
    const needsEmployee = isEmployeeRole && !selectedEmployeeId;

    return `
      <div class="border-t border-slate-200 bg-slate-50 p-5" data-access-setup-panel="${escapeHtml(row.id)}">
        <div class="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div class="text-sm font-semibold text-slate-900">Sett opp tilgang</div>
            <div class="text-xs text-slate-500">Følg rekkefølgen fra venstre mot høyre: Auth-bruker → rolle → ansattkobling → fullfør.</div>
          </div>
          <div class="text-xs font-medium ${matchingProfile ? "text-emerald-700" : "text-amber-700"}">${matchingProfile ? "Brukerprofil finnes" : "Auth/profil mangler – bruk Opprett Auth-bruker"}</div>
        </div>
        <div class="mb-4 rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0">
              <div class="text-xs font-bold uppercase tracking-wide text-slate-500">Steg 1 — Auth-bruker</div>
              <div class="mt-1 text-base font-bold text-slate-950">${matchingProfile ? "Auth / brukerprofil finnes" : "Opprett Auth-bruker"}</div>
              <div class="mt-1 text-sm text-slate-600">${matchingProfile ? "Brukeren finnes allerede i systemet. Gå videre til rolle, ansattkobling og fullføring." : "Oppretter login-bruker via Edge Function. Bruk et midlertidig passord for test."}</div>
            </div>
            <button type="button" data-access-action="create-auth-user" data-access-request-id="${escapeHtml(row.id)}" class="rounded-xl border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500" ${canSetup && !matchingProfile ? "" : "disabled"}>Opprett Auth-bruker</button>
          </div>
        </div>
        ${getAccessSetupChecklistHtml(row, matchingProfile, autoMatchedEmployee, selectedRole)}
        <div class="mt-4 grid gap-3 lg:grid-cols-[240px_minmax(280px,1fr)_auto] lg:items-end">
          <label class="block text-sm text-slate-700">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Endelig rolle</span>
            <select data-access-setup-role="${escapeHtml(row.id)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
              ${getAccessSetupRoleOptions(selectedRole)}
            </select>
          </label>
          <label class="block text-sm text-slate-700">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Koble til ansattprofil</span>
            <select data-access-setup-employee="${escapeHtml(row.id)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" ${isEmployeeRole ? "" : "disabled"}>
              ${getAccessSetupEmployeeOptions(selectedEmployeeId, row)}
            </select>
          </label>
          <button type="button" data-access-action="setup" data-access-request-id="${escapeHtml(row.id)}" class="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40" ${canSetup && !needsEmployee ? "" : "disabled"}>Fullfør oppsett</button>
        </div>
        <div class="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">
          Kort flyt: Godkjenn søknad → Opprett Auth-bruker → Velg rolle → Koble ansattprofil ved employee → Fullfør oppsett.
        </div>
      </div>
    `;
  }

  async function updateAccessRequestStatus(requestId, status) {
    const nextStatus = String(status || "").toLowerCase();
    if (!canApproveAccessRequests()) {
      alert("Kun superadmin/admin kan behandle tilgangssøknader.");
      return;
    }
    if (!["approved", "rejected"].includes(nextStatus)) return;

    const request = (state.accessRequests.rows || []).find(row => row.id === requestId);
    const label = nextStatus === "approved" ? "godkjenne" : "avslå";
    const name = request?.full_name || request?.email || "denne søknaden";
    const ok = window.confirm(`Vil du ${label} tilgangssøknaden for ${name}?\n\nDette endrer kun søknadsstatus. Det oppretter ikke bruker, rolle eller ansattkobling.`);
    if (!ok) return;

    try {
      const { error } = await supabaseClient
        .from("access_requests")
        .update({
          status: nextStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: state.currentUserId || null,
          review_note: nextStatus === "approved" ? "Godkjent i access approval v1. Bruker/rolle må settes opp manuelt i neste steg." : "Avslått i access approval v1."
        })
        .eq("id", requestId)
        .eq("status", "pending");

      if (error) throw error;
      await fetchAccessRequests({ silent: true });
    } catch (error) {
      alert(`Kunne ikke oppdatere søknad: ${error?.message || "Ukjent feil"}`);
    }
  }

  function updateAccessCompleteEmployeeFields(requestId) {
    const panel = els.accessApprovalList?.querySelector?.(`[data-access-complete-panel="${CSS.escape(requestId)}"]`);
    if (!panel) return;

    const role = panel.querySelector?.(`[data-access-complete-role="${CSS.escape(requestId)}"]`)?.value || "employee";
    const employeeSelect = panel.querySelector?.(`[data-access-complete-existing-employee="${CSS.escape(requestId)}"]`);
    const titleField = panel.querySelector?.(`[data-access-complete-title="${CSS.escape(requestId)}"]`);
    const typeField = panel.querySelector?.(`[data-access-complete-employee-type="${CSS.escape(requestId)}"]`);
    const groupField = panel.querySelector?.(`[data-access-complete-employee-group="${CSS.escape(requestId)}"]`);
    const employeeFields = [titleField, typeField, groupField].filter(Boolean);
    const newEmployeeBox = panel.querySelector?.(`[data-access-complete-new-employee-fields="${CSS.escape(requestId)}"]`);

    const isEmployee = role === "employee";
    if (employeeSelect) employeeSelect.disabled = !isEmployee;

    const employeeChoice = employeeSelect?.value || "";
    const isCreatingNewEmployee = isEmployee && employeeChoice === ACCESS_CREATE_NEW_EMPLOYEE_VALUE;
    const selectedEmployee = isEmployee && employeeChoice && !isCreatingNewEmployee
      ? (state.employees || []).find(employee => String(employee?.id || "") === String(employeeChoice))
      : null;

    if (selectedEmployee) {
      if (titleField) titleField.value = selectedEmployee.title || titleField.value || "Ansatt";
      if (typeField && selectedEmployee.employee_type) typeField.value = selectedEmployee.employee_type;
      if (groupField && selectedEmployee.employee_group) groupField.value = normalizeEmployeeGroup(selectedEmployee.employee_group || "");
    }

    employeeFields.forEach(field => {
      field.disabled = !isCreatingNewEmployee;
      field.closest?.("label")?.classList.toggle("opacity-50", !isCreatingNewEmployee);
    });
    if (newEmployeeBox) {
      newEmployeeBox.classList.toggle("opacity-60", !isCreatingNewEmployee);
    }
  }

  function generateTemporaryPasswordForAccessRequest(requestId) {
    const panel = els.accessApprovalList?.querySelector?.(`[data-access-complete-panel="${CSS.escape(requestId)}"]`);
    const input = panel?.querySelector?.(`[data-access-complete-password="${CSS.escape(requestId)}"]`);
    if (!input) return;
    input.value = generateTemporaryAccessPassword();
    setAccessUserDraftPassword(userId, input.value);
    input.focus();
    input.select?.();
  }

  async function completeAccessRequestFromAdmin(requestId) {
    if (!canApproveAccessRequests()) {
      alert("Kun superadmin/admin/planner kan opprette komplett tilgang fra tilgangssøknad.");
      return;
    }

    const row = (state.accessRequests.rows || []).find(item => item.id === requestId);
    if (!row) return;

    const status = String(row.status || "pending").toLowerCase();
    if (!["pending", "approved"].includes(status)) {
      alert("Denne søknaden kan ikke fullføres fra nåværende status.");
      return;
    }

    if (row.setup_completed_at) {
      alert("Tilgang er allerede satt opp for denne søknaden.");
      return;
    }

    const panel = els.accessApprovalList?.querySelector?.(`[data-access-complete-panel="${CSS.escape(requestId)}"]`);
    if (!panel) {
      alert("Fant ikke oppsettsfelt for denne søknaden. Oppdater siden og prøv igjen.");
      return;
    }

    const role = panel.querySelector?.(`[data-access-complete-role="${CSS.escape(requestId)}"]`)?.value || row.requested_access || "employee";
    const normalizedRole = String(role || "").toLowerCase();
    const temporaryPassword = panel.querySelector?.(`[data-access-complete-password="${CSS.escape(requestId)}"]`)?.value?.trim() || "";
    const employeeChoice = panel.querySelector?.(`[data-access-complete-existing-employee="${CSS.escape(requestId)}"]`)?.value || "";
    const createNewEmployee = normalizedRole === "employee" && employeeChoice === ACCESS_CREATE_NEW_EMPLOYEE_VALUE;
    const existingEmployee = normalizedRole === "employee" && employeeChoice && !createNewEmployee
      ? (state.employees || []).find(employee => String(employee?.id || "") === String(employeeChoice) && employee.active !== false)
      : null;
    const existingEmployeeId = existingEmployee?.id || "";
    const title = (createNewEmployee
      ? panel.querySelector?.(`[data-access-complete-title="${CSS.escape(requestId)}"]`)?.value?.trim()
      : existingEmployee?.title || panel.querySelector?.(`[data-access-complete-title="${CSS.escape(requestId)}"]`)?.value?.trim()) || "";
    const employeeType = (createNewEmployee
      ? panel.querySelector?.(`[data-access-complete-employee-type="${CSS.escape(requestId)}"]`)?.value?.trim()
      : existingEmployee?.employee_type || panel.querySelector?.(`[data-access-complete-employee-type="${CSS.escape(requestId)}"]`)?.value?.trim()) || "";
    const employeeGroup = normalizeEmployeeGroup((createNewEmployee
      ? panel.querySelector?.(`[data-access-complete-employee-group="${CSS.escape(requestId)}"]`)?.value
      : existingEmployee?.employee_group || panel.querySelector?.(`[data-access-complete-employee-group="${CSS.escape(requestId)}"]`)?.value) || "");

    if (!["employee", "planner", "admin"].includes(normalizedRole) || !canAssignAccessRole(normalizedRole)) {
      alert("Du har ikke tilgang til å sette denne rollen.");
      return;
    }

    if (!temporaryPassword || temporaryPassword.length < 8) {
      alert("Midlertidig passord må være minst 8 tegn. Skriv inn passord eller bruk Generer passord.");
      return;
    }

    if (normalizedRole === "employee") {
      if (!existingEmployeeId && !createNewEmployee) {
        alert("Velg eksisterende ansattprofil, eller velg 'Opprett ny ansatt' hvis personen ikke finnes fra før.");
        return;
      }
      if (existingEmployeeId && createNewEmployee) {
        alert("Velg enten eksisterende ansatt eller opprett ny ansatt – ikke begge deler.");
        return;
      }
      if (!existingEmployeeId) {
        if (!title) {
          alert("Legg inn stilling/tittel for ny ansatt.");
          return;
        }
        if (!employeeType) {
          alert("Velg employee type for ny ansatt.");
          return;
        }
        if (!employeeGroup) {
          alert("Velg employee group for ny ansatt.");
          return;
        }
      }
    }

    const existingProfile = findAccessUserProfileByEmail(row.email);
    if (existingProfile?.id === state.currentUserId) {
      alert("Ikke bruk denne flyten til å endre din egen bruker.");
      return;
    }

    const employeeLines = normalizedRole === "employee"
      ? existingEmployeeId
        ? `
Ansattkobling: Koble til eksisterende ansatt
Ansatt: ${existingEmployee?.name || existingEmployeeId}
Stilling: ${title || "Ikke satt"}
Employee type: ${employeeType || "Ikke satt"}
Employee group: ${employeeGroup || "Ikke satt"}`
        : `
Ansattkobling: OPPRETT NY ANSATT
Stilling: ${title}
Employee type: ${employeeType}
Employee group: ${employeeGroup}`
      : "";

    const ok = window.confirm(`Opprette komplett tilgang for:

${row.full_name || row.email}
${row.email}

Rolle: ${formatRequestedAccess(normalizedRole)}${employeeLines}

Dette kan opprette/gjenbruke Auth-bruker og user_profile. For employee skal eksisterende ansatt kobles når den er valgt. Passord sendes ikke automatisk på e-post.`);
    if (!ok) return;

    const button = panel.querySelector?.(`[data-access-action="complete-access"][data-access-request-id="${CSS.escape(requestId)}"]`);
    const oldText = button?.textContent || "";
    if (button) {
      button.disabled = true;
      button.textContent = "Oppretter...";
    }

    try {
      if (normalizedRole === "employee" && existingEmployeeId) {
        const { error: linkError } = await supabaseClient
          .from("access_requests")
          .update({
            linked_employee_id: existingEmployeeId,
            approved_role: normalizedRole,
            review_note: "Koblet til eksisterende ansatt i v18.58b duplikatkontroll."
          })
          .eq("id", requestId);
        if (linkError) {
          throw new Error(`Kunne ikke lagre ansattkobling før fullføring: ${linkError.message || linkError}`);
        }
      }

      const payload = {
        request_id: requestId,
        role: normalizedRole,
        temporary_password: temporaryPassword,
        employee_id: normalizedRole === "employee" && existingEmployeeId ? existingEmployeeId : undefined,
        linked_employee_id: normalizedRole === "employee" && existingEmployeeId ? existingEmployeeId : undefined,
        create_new_employee: normalizedRole === "employee" ? createNewEmployee : undefined,
        employee_type: normalizedRole === "employee" ? employeeType : undefined,
        employee_group: normalizedRole === "employee" ? employeeGroup : undefined,
        title: normalizedRole === "employee" ? title : undefined
      };

      const { data, error } = await supabaseClient.functions.invoke("admin-complete-access-request", {
        body: payload
      });

      if (error) {
        throw new Error(error.message || "Edge Function returnerte feil.");
      }

      if (!data?.ok) {
        const code = data?.code ? `${data.code}: ` : "";
        throw new Error(`${code}${data?.message || "Kunne ikke opprette komplett tilgang."}`);
      }

      alert(data.message || "Komplett tilgang er opprettet.");
      await fetchFromSupabase();
      await fetchAccessUsers({ silent: true });
      await fetchAccessRequests({ silent: true });
      rebuildDerivedState();
      renderAll();
    } catch (error) {
      const message = error?.message || "Ukjent feil";
      if (message.includes("ROLE_NOT_ALLOWED_FOR_CALLER") || message.includes("ADMIN_ROLE_REQUIRES_SUPERADMIN")) {
        alert("Du har ikke tilgang til å sette denne rollen.");
      } else if (message.includes("TEMPORARY_PASSWORD_REQUIRED")) {
        alert("Midlertidig passord må være minst 8 tegn.");
      } else if (message.includes("EMPLOYEE_TYPE_REQUIRED") || message.includes("EMPLOYEE_GROUP_REQUIRED") || message.includes("TITLE_REQUIRED")) {
        alert("Employee-oppsett mangler type, gruppe eller tittel.");
      } else if (message.includes("ACCESS_REQUEST_ALREADY_COMPLETED")) {
        alert("Denne søknaden er allerede satt opp. Oppdater listen.");
        await fetchAccessRequests({ silent: true });
        renderAll();
      } else if (message.includes("NOT_ALLOWED") || message.includes("403")) {
        alert("Du har ikke tilgang til å utføre denne handlingen.");
      } else {
        alert(`Kunne ikke opprette komplett tilgang: ${message}`);
      }
    } finally {
      if (button && !row.setup_completed_at) {
        button.disabled = false;
        button.textContent = oldText || "Godkjenn og opprett komplett tilgang";
      }
    }
  }




  async function createAuthUserForAccessRequest(requestId) {
    if (!canManageUserAccess()) {
      alert("Kun superadmin/admin kan opprette Auth-bruker fra tilgangssøknad.");
      return;
    }

    const row = (state.accessRequests.rows || []).find(item => item.id === requestId);
    if (!row) return;

    const status = String(row.status || "pending").toLowerCase();
    if (status !== "approved") {
      alert("Søknaden må være godkjent før Auth-bruker kan opprettes.");
      return;
    }

    if (row.setup_completed_at) {
      alert("Tilgang er allerede satt opp for denne søknaden.");
      return;
    }

    const existingProfile = findAccessUserProfileByEmail(row.email);
    if (existingProfile) {
      alert("Brukerprofil finnes allerede. Du kan gå videre med Fullfør oppsett.");
      return;
    }

    const email = row.email || "";
    const tempPassword = window.prompt(
      `Midlertidig passord for ${email}\n\nBruk minst 8 tegn. Dette er kun for test/pre-go-live.`,
      "Test1234!"
    );
    if (tempPassword === null) return;
    if (!tempPassword || tempPassword.length < 8) {
      alert("Midlertidig passord må være minst 8 tegn.");
      return;
    }

    const ok = window.confirm(
      `Opprette Supabase Auth-bruker for:\n\n${email}\n\nDette oppretter kun Auth-brukeren. Rolle og ansattkobling settes etterpå med Fullfør oppsett.`
    );
    if (!ok) return;

    try {
      const { data, error } = await supabaseClient.functions.invoke("create-approved-auth-user", {
        body: {
          request_id: requestId,
          temporary_password: tempPassword
        }
      });

      if (error) {
        throw new Error(error.message || "Edge Function returnerte feil.");
      }

      if (!data?.ok) {
        const code = data?.code ? `${data.code}: ` : "";
        throw new Error(`${code}${data?.message || "Kunne ikke opprette Auth-bruker."}`);
      }

      alert(data.message || "Auth-bruker er opprettet. Fortsett med Fullfør oppsett.");
      await fetchAccessUsers({ silent: true });
      await fetchAccessRequests({ silent: true });
      renderAll();
    } catch (error) {
      const message = error?.message || "Ukjent feil";
      if (message.includes("NOT_ALLOWED") || message.includes("403")) {
        alert("Du har ikke tilgang til å opprette Auth-bruker. Logg inn som superadmin/admin og prøv igjen.");
      } else if (message.includes("REQUEST_NOT_APPROVED")) {
        alert("Søknaden må være godkjent før Auth-bruker kan opprettes.");
      } else if (message.includes("AUTH_USER_ALREADY_EXISTS")) {
        alert("Auth-brukeren finnes allerede. Fortsett med Fullfør oppsett.");
        await fetchAccessUsers({ silent: true });
        await fetchAccessRequests({ silent: true });
        renderAll();
      } else {
        alert(`Kunne ikke opprette Auth-bruker: ${message}`);
      }
    }
  }


  async function setupApprovedAccessRequest(requestId) {
    if (!canManageUserAccess()) {
      alert("Kun superadmin kan sette opp godkjente tilgangssøknader.");
      return;
    }

    const row = (state.accessRequests.rows || []).find(item => item.id === requestId);
    if (!row) return;

    const status = String(row.status || "pending").toLowerCase();
    if (status !== "approved") {
      alert("Søknaden må være godkjent før tilgang kan settes opp.");
      return;
    }

    if (row.setup_completed_at) {
      alert("Denne søknaden er allerede satt opp.");
      return;
    }

    const panel = els.accessApprovalList?.querySelector?.(`[data-access-setup-panel="${CSS.escape(requestId)}"]`);
    const role = panel?.querySelector?.(`[data-access-setup-role="${CSS.escape(requestId)}"]`)?.value || row.requested_access || "employee";
    const normalizedRole = String(role || "").toLowerCase();
    const employeeId = panel?.querySelector?.(`[data-access-setup-employee="${CSS.escape(requestId)}"]`)?.value || "";

    if (!["employee", "planner", "admin"].includes(normalizedRole)) {
      alert("Velg en gyldig rolle.");
      return;
    }

    const profile = findAccessUserProfileByEmail(row.email);
    if (profile?.id === state.currentUserId) {
      alert("Ikke bruk denne flyten til å endre din egen superadmin-bruker.");
      return;
    }

    if (normalizedRole === "employee" && !employeeId) {
      alert("Velg hvilken ansattprofil brukeren skal kobles til.");
      return;
    }

    const employee = employeeId ? (state.employees || []).find(item => item.id === employeeId) : null;
    const profileText = profile ? "Brukerprofil finnes og oppdateres." : "Brukerprofil mangler. RPC oppretter den hvis Auth-brukeren finnes.";
    const employeeText = employee ? `
Ansattprofil: ${employee.name}` : "";
    const ok = window.confirm(`Vil du fullføre tilgang for ${row.full_name || row.email}?

Rolle: ${formatRequestedAccess(normalizedRole)}${employeeText}
${profileText}

Dette oppretter ikke Auth-bruker. Hvis Auth-brukeren mangler, får du en tydelig feilmelding.`);
    if (!ok) return;

    try {
      const { data, error } = await supabaseClient.rpc("admin_setup_access_request", {
        p_request_id: requestId,
        p_role: normalizedRole,
        p_employee_id: normalizedRole === "employee" ? employeeId : null
      });
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      if (result && result.ok === false) {
        throw new Error(result.message || "RPC returnerte feil ved oppsett av tilgang.");
      }

      await fetchFromSupabase();
      await fetchAccessUsers({ silent: true });
      await fetchAccessRequests({ silent: true });
      rebuildDerivedState();
      renderAll();
    } catch (error) {
      const message = error?.message || "Ukjent feil";
      if (message.includes("AUTH_USER_MISSING")) {
        alert(`Auth-bruker mangler. Opprett brukeren først i Supabase Authentication med e-post ${row.email}, og prøv deretter Fullfør oppsett igjen.`);
      } else if (message.includes("EMPLOYEE_REQUIRED")) {
        alert("Velg ansattprofil før du fullfører employee-tilgang.");
      } else if (message.includes("NOT_ALLOWED")) {
        alert("Du har ikke tilgang til å fullføre denne handlingen.");
      } else {
        alert(`Kunne ikke sette opp tilgang: ${message}`);
      }
    }
  }




  async function fetchAccessUsers(options = {}) {
    const silent = Boolean(options.silent);
    if (!supabaseClient || !canManageUserAccess()) {
      state.accessUsers.rows = [];
      state.accessUsers.error = "";
      return;
    }

    state.accessUsers.loading = true;
    if (!silent) renderAccessUsers();

    try {
      const { data, error } = await supabaseClient
        .from("user_profiles")
        .select("id, email, full_name, role, is_active, created_at, updated_at")
        .order("email", { ascending: true });

      if (error) throw error;
      state.accessUsers.rows = data || [];
      state.accessUsers.error = "";
      state.accessUsers.lastLoadedAt = new Date().toISOString();
    } catch (error) {
      state.accessUsers.error = error?.message || "Kunne ikke hente brukertilganger.";
    } finally {
      state.accessUsers.loading = false;
      renderAccessUsers();
      renderAccessRequests();
      renderEmployees();
    }
  }

  function refreshAccessUsers() {
    return fetchAccessUsers({ silent: false });
  }

  function getAccessUserStatusBadgeClass(isActive) {
    return isActive === false
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  function canCurrentUserManageAccessTarget(row) {
    if (!row?.id) return false;
    if (row.id === state.currentUserId) return false;
    const currentRole = normalizeRoleValue(state.currentRole);
    const targetRole = normalizeRoleValue(row.role);
    if (targetRole === "superadmin") return false;
    if (currentRole === "superadmin" || currentRole === "admin") return true;
    if (currentRole === "planner") return ["employee", "planner"].includes(targetRole);
    return false;
  }

  function getAccessUserRoleOptions(selectedValue) {
    const selected = normalizeRoleValue(selectedValue || "");
    const options = getAllowedAccessRoleOptions().slice();

    if (selected === "reader") {
      return [
        `<option value="" selected disabled>Legacy: Lesetilgang - velg ny rolle</option>`,
        ...options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
      ].join("");
    }

    if (selected && !options.some(([value]) => value === selected) && selected !== "reader") {
      options.unshift([selected, formatRoleLabel(selected) || selected]);
    }

    return options
      .map(([value, label]) => `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`)
      .join("");
  }

  function captureAccessUserDrafts() {
    if (!els.accessUsersList) return;
    els.accessUsersList.querySelectorAll("[data-access-user-password]").forEach(input => {
      const userId = input?.dataset?.accessUserPassword || "";
      if (!userId) return;
      const value = input.value || "";
      state.accessUserDrafts.passwords[userId] = value;
    });
  }

  function setAccessUserDraftPassword(userId, value) {
    if (!userId) return;
    state.accessUserDrafts.passwords[userId] = value || "";
  }

  function clearAccessUserDraftPassword(userId) {
    if (!userId) return;
    delete state.accessUserDrafts.passwords[userId];
  }

  function getAccessUserDraftPassword(userId) {
    return state.accessUserDrafts.passwords[userId] || "";
  }

  function renderAccessUsers() {
    if (!els.accessUsersList) return;

    const allowed = canManageUserAccess();
    const card = els.accessUsersList.closest(".rounded-2xl");
    if (card) card.style.display = allowed ? "" : "none";
    if (!allowed) return;

    const focusedEmployee = getEmployeeAdminAccessPanelEmployee();
    const allRows = state.accessUsers.rows || [];
    const rows = focusedEmployee ? getAccessUsersForEmployee(focusedEmployee, allRows) : allRows;
    updateEmployeeAccessPanelHeader(focusedEmployee);
    const activeCount = rows.filter(row => row.is_active !== false).length;
    const inactiveCount = rows.filter(row => row.is_active === false).length;

    if (els.accessUsersStatus) {
      const loadedText = state.accessUsers.lastLoadedAt ? `Sist hentet ${formatAccessRequestDate(state.accessUsers.lastLoadedAt)}` : "Ikke hentet ennå";
      const scopeText = focusedEmployee ? `${focusedEmployee.name || "Valgt ansatt"} • ` : "";
      els.accessUsersStatus.textContent = state.accessUsers.loading ? "Henter brukere..." : `${scopeText}${activeCount} aktive • ${inactiveCount} deaktivert • ${loadedText}`;
    }

    if (state.accessUsers.loading && !rows.length) {
      els.accessUsersList.innerHTML = `<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Henter brukertilganger...</div>`;
      return;
    }

    if (state.accessUsers.error) {
      els.accessUsersList.innerHTML = `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Kunne ikke hente brukertilganger: ${escapeHtml(state.accessUsers.error)}</div>`;
      return;
    }

    if (!rows.length) {
      const emptyText = focusedEmployee
        ? `Ingen brukertilgang funnet for ${escapeHtml(focusedEmployee.name || "valgt ansatt")}.`
        : "Ingen brukere funnet.";
      els.accessUsersList.innerHTML = `<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">${emptyText}</div>`;
      return;
    }

    captureAccessUserDrafts();

    els.accessUsersList.innerHTML = rows.map(row => {
      const isCurrentUser = row.id === state.currentUserId;
      const isActive = row.is_active !== false;
      const targetRole = normalizeRoleValue(row.role);
      const isProtectedSuperadmin = targetRole === "superadmin";
      const canManageTarget = canCurrentUserManageAccessTarget(row);
      const actionLabel = isActive ? "Deaktiver" : "Aktiver";
      const nextAction = isActive ? "deactivate" : "activate";
      const disabled = canManageTarget ? "" : "disabled";
      const disabledReason = isCurrentUser
        ? "Du kan ikke endre eller deaktivere egen bruker."
        : isProtectedSuperadmin
          ? "Superadmin er låst i vanlig UI."
          : !canManageTarget
            ? "Din rolle kan ikke administrere denne brukeren."
            : "";
      const passwordInputId = `access-user-password-${row.id}`;
      const passwordDraft = getAccessUserDraftPassword(String(row.id || ""));
      return `
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" data-access-user-row-id="${escapeHtml(row.id)}">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="font-semibold text-slate-900">${escapeHtml(row.full_name || row.email || "Uten navn")}</div>
                  <span class="rounded-full border px-2.5 py-1 text-xs font-semibold ${getAccessUserStatusBadgeClass(row.is_active)}">${isActive ? "Aktiv" : "Deaktivert"}</span>
                  <span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">${escapeHtml(formatRoleLabel(row.role))}</span>
                </div>
                <div class="text-sm text-slate-600">${escapeHtml(row.email || "Ingen e-post")}</div>
                <div class="text-xs text-slate-500">Opprettet ${escapeHtml(formatAccessRequestDate(row.created_at))}${row.updated_at ? ` • Sist endret ${escapeHtml(formatAccessRequestDate(row.updated_at))}` : ""}</div>
                ${disabledReason ? `<div class="text-xs font-medium text-slate-400">${escapeHtml(disabledReason)}</div>` : ""}
              </div>
              <div class="flex shrink-0 flex-wrap gap-2">
                <button type="button" data-access-user-action="toggle-active" data-access-user-id="${escapeHtml(row.id)}" data-access-user-next-action="${escapeHtml(nextAction)}" class="rounded-xl ${isActive ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"} px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40" ${disabled}>${actionLabel}</button>
              </div>
            </div>

            <div class="grid gap-3 border-t border-slate-100 pt-4 xl:grid-cols-[minmax(180px,240px)_auto_minmax(260px,1fr)_auto_auto] xl:items-end">
              <label class="block text-sm text-slate-700">
                <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Rolle</span>
                <select data-access-user-role="${escapeHtml(row.id)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400" ${disabled || isProtectedSuperadmin ? "disabled" : ""}>
                  ${getAccessUserRoleOptions(row.role)}
                </select>
              </label>
              <button type="button" data-access-user-action="set-role" data-access-user-id="${escapeHtml(row.id)}" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" ${disabled || isProtectedSuperadmin ? "disabled" : ""}>Lagre rolle</button>

              <label class="block text-sm text-slate-700">
                <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Midlertidig passord</span>
                <input id="${escapeHtml(passwordInputId)}" data-access-user-password="${escapeHtml(row.id)}" type="text" autocomplete="off" value="${escapeHtml(passwordDraft)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400" placeholder="Skriv/generer nytt midlertidig passord" ${disabled ? "disabled" : ""} />
              </label>
              <button type="button" data-access-user-action="generate-password" data-access-user-id="${escapeHtml(row.id)}" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" ${disabled ? "disabled" : ""}>Generer</button>
              <button type="button" data-access-user-action="set-password" data-access-user-id="${escapeHtml(row.id)}" class="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40" ${disabled ? "disabled" : ""}>Sett passord</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  async function invokeManageUserAccess(payload) {
    const { data, error } = await supabaseClient.functions.invoke("admin-manage-user-access", {
      body: payload
    });

    if (error) {
      throw new Error(error.message || "Edge Function returnerte feil.");
    }

    if (!data?.ok) {
      const code = data?.code ? `${data.code}: ` : "";
      throw new Error(`${code}${data?.message || "Kunne ikke oppdatere brukertilgang."}`);
    }

    return data;
  }

  function getAccessUserById(userId) {
    return (state.accessUsers.rows || []).find(row => row.id === userId) || null;
  }

  function getAccessUserControlRow(userId, sourceRow = null) {
    if (sourceRow) return sourceRow;
    if (!userId) return null;
    const selector = `[data-access-user-row-id="${CSS.escape(userId)}"]`;
    return document.getElementById("employeeAdminDetail")?.querySelector?.(selector)
      || els.accessUsersList?.querySelector?.(selector)
      || document.querySelector?.(selector)
      || null;
  }

  async function updateAccessUserActive(userId, action) {
    if (!canManageUserAccess()) {
      alert("Du har ikke tilgang til å administrere brukertilganger.");
      return;
    }
    if (!userId) return;

    const user = getAccessUserById(userId);
    if (!user) return;
    if (!canCurrentUserManageAccessTarget(user)) {
      alert("Du kan ikke endre denne brukeren fra vanlig UI.");
      return;
    }

    const normalizedAction = action === "activate" ? "activate" : "deactivate";
    const name = user.full_name || user.email || "denne brukeren";
    const actionText = normalizedAction === "activate" ? "aktivere" : "deaktivere";
    const ok = window.confirm(`Vil du ${actionText} tilgangen for ${name}?\n\nDette sletter ikke Auth-brukeren. Det endrer kun user_profiles.is_active.`);
    if (!ok) return;

    try {
      await invokeManageUserAccess({
        action: normalizedAction,
        target_user_id: userId
      });
      await fetchAccessUsers({ silent: true });
      renderAccessUsers();
      renderEmployees();
    } catch (error) {
      alert(`Kunne ikke oppdatere brukertilgang: ${error?.message || "Ukjent feil"}`);
    }
  }

  async function updateAccessUserRole(userId, sourceRow = null) {
    if (!canManageUserAccess()) {
      alert("Du har ikke tilgang til å administrere brukertilganger.");
      return;
    }

    const user = getAccessUserById(userId);
    if (!user) return;
    if (!canCurrentUserManageAccessTarget(user)) {
      alert("Du kan ikke endre denne brukeren fra vanlig UI.");
      return;
    }

    const row = getAccessUserControlRow(userId, sourceRow);
    const role = normalizeRoleValue(row?.querySelector?.(`[data-access-user-role="${CSS.escape(userId)}"]`)?.value || "");

    if (!canAssignAccessRole(role)) {
      alert("Du har ikke tilgang til å sette denne rollen.");
      return;
    }

    const ok = window.confirm(`Endre rolle for ${user.full_name || user.email}?\n\nNy rolle: ${formatRequestedAccess(role)}`);
    if (!ok) return;

    try {
      await invokeManageUserAccess({
        action: "set_role",
        target_user_id: userId,
        role
      });
      await fetchAccessUsers({ silent: true });
      renderAccessUsers();
      renderEmployees();
    } catch (error) {
      const message = error?.message || "Ukjent feil";
      if (message.includes("EMPLOYEE_PROFILE_REQUIRED")) {
        alert("Kan ikke sette employee-rolle fordi det ikke finnes ansattprofil med samme e-post.");
      } else if (message.includes("ROLE_NOT_ALLOWED_FOR_CALLER")) {
        alert("Din rolle kan ikke sette denne rollen.");
      } else {
        alert(`Kunne ikke endre rolle: ${message}`);
      }
    }
  }

  function generatePasswordForAccessUser(userId, sourceRow = null) {
    const row = getAccessUserControlRow(userId, sourceRow);
    const input = row?.querySelector?.(`[data-access-user-password="${CSS.escape(userId)}"]`);
    if (!input) return;
    input.value = generateTemporaryAccessPassword();
    input.focus();
    input.select?.();
  }

  async function setTemporaryPasswordForAccessUser(userId, sourceRow = null) {
    if (!canManageUserAccess()) {
      alert("Du har ikke tilgang til å administrere brukertilganger.");
      return;
    }

    const user = getAccessUserById(userId);
    if (!user) return;
    if (!canCurrentUserManageAccessTarget(user)) {
      alert("Du kan ikke endre denne brukeren fra vanlig UI.");
      return;
    }

    const row = getAccessUserControlRow(userId, sourceRow);
    const input = row?.querySelector?.(`[data-access-user-password="${CSS.escape(userId)}"]`);
    const temporaryPassword = (input?.value || getAccessUserDraftPassword(userId) || "").trim();

    if (!temporaryPassword || temporaryPassword.length < 8) {
      alert("Midlertidig passord må være minst 8 tegn. Skriv inn passord eller bruk Generer.");
      input?.focus?.();
      return;
    }

    const ok = window.confirm(`Sette nytt midlertidig passord for ${user.full_name || user.email}?\n\nPassord sendes ikke automatisk på e-post.`);
    if (!ok) return;

    try {
      await invokeManageUserAccess({
        action: "set_temporary_password",
        target_user_id: userId,
        temporary_password: temporaryPassword
      });
      if (input) input.value = "";
      clearAccessUserDraftPassword(userId);
      alert("Midlertidig passord er oppdatert.");
    } catch (error) {
      alert(`Kunne ikke sette midlertidig passord: ${error?.message || "Ukjent feil"}`);
    }
  }

  async function handleLogin() {
    if (!supabaseClient?.auth) return;

    const email = els.loginEmail?.value?.trim() || "";
    const password = els.loginPassword?.value || "";

    if (!email || !password) {
      alert("Legg inn e-post og passord.");
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      alert(`Kunne ikke logge inn: ${error.message}`);
      return;
    }

    closeLoginModal();
    if (els.loginEmail) els.loginEmail.value = "";
    if (els.loginPassword) els.loginPassword.value = "";
    window.location.reload();
  }

  async function handleForgotPassword() {
    if (!supabaseClient?.auth) return;

    const email = els.loginEmail?.value?.trim() || "";
    if (!email) {
      alert("Legg inn e-postadressen din først.");
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });

    if (error) {
      alert(`Kunne ikke sende reset-link: ${error.message}`);
      return;
    }

    alert("Reset-link er sendt på e-post.");
  }

  async function handleChangePassword() {
    if (!supabaseClient?.auth) return;

    const newPassword = prompt("Nytt passord:");
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("Passordet må være minst 6 tegn.");
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) {
      alert(`Kunne ikke endre passord: ${error.message}`);
      return;
    }

    alert("Passordet er endret.");
  }

  async function handleResetPassword() {
    if (!supabaseClient?.auth) return;
    const email = state.currentUserEmail || prompt("E-postadresse:");
    if (!email) return;

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });

    if (error) {
      alert(`Kunne ikke sende reset-link: ${error.message}`);
      return;
    }

    alert("Reset-link er sendt på e-post.");
  }


  function startRemoteSync() {
    stopRemoteSync();

    if (!state.supabaseReady || !supabaseClient) return;

    const requestSyncRefresh = debounce(() => {
      if (canAutoRefreshFromRemote()) {
        void refreshFromRemote("realtime");
      } else {
        state.sync.pendingRefresh = true;
      }
    }, 250);

    if (typeof supabaseClient.channel === "function") {
      const channel = supabaseClient
        .channel("planner-live-sync-v41")
        .on("postgres_changes", { event: "*", schema: "public", table: "planner_employees" }, () => requestSyncRefresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "planner_projects" }, () => requestSyncRefresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "planner_entries" }, () => requestSyncRefresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "planner_audit_log" }, () => requestSyncRefresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "planner_notification_log" }, () => requestSyncRefresh())
        .subscribe();

      state.sync.channel = channel;
    }

    state.sync.pollingTimer = window.setInterval(() => {
      if (!state.supabaseReady) return;
      if (canAutoRefreshFromRemote()) {
        void refreshFromRemote("poll");
      } else {
        state.sync.pendingRefresh = true;
      }
    }, 10000);
  }

  function stopRemoteSync() {
    if (state.sync.pollingTimer) {
      window.clearInterval(state.sync.pollingTimer);
      state.sync.pollingTimer = null;
    }

    if (state.sync.channel && typeof supabaseClient?.removeChannel === "function") {
      supabaseClient.removeChannel(state.sync.channel);
    }
    state.sync.channel = null;
  }

  function hasOpenEditorModal() {
    const modalElements = [els.editModal, els.projectModal, els.employeeModal, els.loginModal];
    return modalElements.some(el => el && !el.classList.contains("hidden"));
  }

  function canAutoRefreshFromRemote() {
    return !state.dragEntryId && !state.resize.active && !hasOpenEditorModal();
  }

  async function refreshFromRemote(reason = "sync") {
    if (!state.supabaseReady || state.sync.fetchInFlight) return;
    if (reason === "poll" && document.hidden) return;

    state.sync.fetchInFlight = true;

    try {
      await fetchFromSupabase();
      rebuildDerivedState();
      renderAll();
      state.sync.lastRemoteRefreshAt = Date.now();
      state.sync.pendingRefresh = false;
    } finally {
      state.sync.fetchInFlight = false;
    }
  }

  function flushPendingRemoteRefresh() {
    if (!state.sync.pendingRefresh || !state.supabaseReady) return;
    if (!canAutoRefreshFromRemote()) return;

    state.sync.pendingRefresh = false;
    void refreshFromRemote("pending");
  }

  function handleSyncVisibilityChange() {
    if (document.hidden || !state.supabaseReady) return;

    if (canAutoRefreshFromRemote()) {
      void refreshFromRemote("visibility");
    } else {
      state.sync.pendingRefresh = true;
    }
  }

  function handleWindowFocusRefresh() {
    if (!state.supabaseReady) return;

    if (canAutoRefreshFromRemote()) {
      void refreshFromRemote("focus");
    } else {
      state.sync.pendingRefresh = true;
    }
  }

  function setupStaticOptions() {
    if (els.projectCategory) els.projectCategory.value = "Offshore";
    fillSelect(els.projectStatus, PROJECT_STATUS_OPTIONS, "Planlagt");
    fillSelect(els.editRole, ROLE_OPTIONS, "Supervisor");
    fillSelect(els.personalBlockType, getPersonalBlockTypeOptions());
    fillSelect(els.contextMenuType, getPersonalBlockTypeOptions());
  }


  function toggleEmployeeGroupFilter(forceOpen = null) {
    if (!els.groupFilterPanel) return;
    const nextOpen = typeof forceOpen === "boolean" ? forceOpen : !state.employeeGroupFilterOpen;
    state.employeeGroupFilterOpen = nextOpen;
    els.groupFilterPanel.classList.toggle("hidden", !nextOpen);

    if (nextOpen) {
      requestAnimationFrame(() => {
        if (els.groupFilterSearch) els.groupFilterSearch.focus();
      });
    }
  }

  function handleEmployeeGroupFilterOutsideClick(event) {
    if (!state.employeeGroupFilterOpen || !els.groupFilterControl) return;
    if (els.groupFilterControl.contains(event.target)) return;
    toggleEmployeeGroupFilter(false);
  }

  function isPointerInsideCalendarWrap(event) {
    if (!els.calendarWrap || typeof event.clientX !== "number" || typeof event.clientY !== "number") return false;
    const rect = els.calendarWrap.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }

  function isCalendarMenuBlockedTarget(target) {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest([
      "button",
      "a",
      "input",
      "select",
      "textarea",
      "label",
      "summary",
      "[role='button']",
      "[role='menu']",
      "[role='menuitem']",
      "[role='dialog']",
      "#calendarContextMenu",
      "#groupFilterControl",
      "#groupFilterPanel",
      "#calendarSidePanel",
      "#calendarPanel",
      "#projectInspector",
      "#projectInspectorPanel",
      "#editModal",
      "#projectModal",
      "#employeeModal",
      "#loginModal",
      "#accessRequestModal",
      ".modal",
      ".dropdown",
      ".menu",
      ".filter-panel"
    ].join(",")));
  }

  function getCalendarDropRowFromPointer(event) {
    if (!els.calendarWrap) return null;
    if (!isPointerInsideCalendarWrap(event)) return null;
    const target = event.target;

    // First try the normal DOM path. This works when the pointer event lands directly on a calendar row/cell.
    const directRow = target?.closest?.(".drop-row");
    if (directRow && els.calendarWrap.contains(directRow)) return directRow;

    // Then try the browser hit-stack. This helps when visual layers sit above the row.
    if (typeof document.elementsFromPoint === "function") {
      const hitElements = document.elementsFromPoint(event.clientX, event.clientY);
      for (const hit of hitElements) {
        if (!(hit instanceof HTMLElement)) continue;
        const row = hit.matches(".drop-row") ? hit : hit.closest(".drop-row");
        if (row && els.calendarWrap.contains(row)) return row;
      }
    }

    // Final fallback after employee grouping/expand-collapse:
    // keep it bounded to the actual row rectangle. Earlier fallback used Y-position only,
    // which caused clicks on menus beside/above the calendar to open "Legg til direkte blokk".
    const rows = Array.from(els.calendarWrap.querySelectorAll(".drop-row"));
    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        return row;
      }
    }

    return null;
  }

  function openCalendarContextMenuFromEvent(event) {
    if (state.calendarMode !== "personal" || state.viewMode === "År") return false;
    if (!canEditApp()) return false;
    if (!els.calendarWrap) return false;
    if (!isPointerInsideCalendarWrap(event)) return false;
    if (isCalendarMenuBlockedTarget(event.target)) return false;
    if (event.target?.closest?.(".entry-bar")) return false;
    if (event.target?.closest?.("[data-resize-handle]")) return false;
    if (event.target?.closest?.("#calendarContextMenu")) return false;
    // v18.20: Ikke åpne direkteblokk-popup når et modalvindu er aktivt, eller når brukeren klikker inni et modal.
    // Dette hindrer at Lukk/Lagre/Fjern i Rediger tildeling åpner "Legg til direkte blokk" på kalenderen bak.
    if (event.target?.closest?.("#editModal, #projectModal, #employeeModal, #loginModal")) return false;
    if (hasOpenEditorModal()) return false;

    // Når prosjekt-spotlight er aktiv, skal tomme kalenderfelt ikke åpne
    // ferie/syk/kurs/avspasering. Bruk Nullstill fokus først.
    if (getProjectSpotlightProject()) return false;

    const row = getCalendarDropRowFromPointer(event);
    if (!row) return false;

    const targetEmployeeName = row.dataset.employeeName;
    if (!targetEmployeeName) return false;

    const dropMeta = getDropMetaFromRow(row, event);
    if (!dropMeta?.rangeStart || !Number.isFinite(dropMeta.colIndex)) return false;

    const selectedDate = dropMeta?.dropDate
      ? toIsoDate(parseIsoDateLocal(dropMeta.dropDate))
      : toIsoDate(addDays(parseIsoDateLocal(dropMeta.rangeStart), dropMeta.colIndex));

    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    openCalendarContextMenu(targetEmployeeName, selectedDate, event.clientX + 8, event.clientY + 8);
    return true;
  }

  function handleCalendarWrapContextMenu(event) {
    openCalendarContextMenuFromEvent(event);
  }

  function handleCalendarDocumentContextMenu(event) {
    openCalendarContextMenuFromEvent(event);
  }

  function handleCalendarDocumentClick(event) {
    if (event.button !== 0) return;
    openCalendarContextMenuFromEvent(event);
  }


  function normalizeCalendarWheelDelta(value, mode, referenceSize) {
    const numeric = Number(value) || 0;
    if (!numeric) return 0;
    if (mode === 1) return numeric * 32;
    if (mode === 2) return numeric * Math.max(240, Number(referenceSize) || 0);
    return numeric;
  }

  function handleCalendarWrapWheelScroll(event) {
    const wrap = els.calendarWrap;
    if (!wrap) return;
    if (event.target?.closest?.("#calendarPanelCol, #calendarContextMenu, #projectModal, #editModal, #employeeModal, #loginModal, select, option")) return;

    const maxX = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
    if (maxX <= 1) return;

    const dy = normalizeCalendarWheelDelta(event.deltaY, event.deltaMode, wrap.clientHeight);
    const dx = normalizeCalendarWheelDelta(event.deltaX, event.deltaMode, wrap.clientWidth);
    if (!dy && !dx) return;

    // v18.62ao: the calendar must only own horizontal scrolling.
    // Plain mouse wheel over the calendar should move the outer page/frame, not an internal calendar scrollbar.
    const wantsHorizontal = event.shiftKey || Math.abs(dx) > Math.abs(dy);
    if (!wantsHorizontal) {
      const outer = document.scrollingElement || document.documentElement || document.body;
      if (outer && dy) {
        event.preventDefault();
        event.stopPropagation();
        outer.scrollTop += dy;
      }
      return;
    }

    const beforeLeft = wrap.scrollLeft;
    const horizontalDelta = dx || dy;
    wrap.scrollLeft = Math.max(0, Math.min(maxX, wrap.scrollLeft + horizontalDelta));

    if (wrap.scrollLeft !== beforeLeft) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function getEmployeeGroupBadgeClass(group) {
    return EMPLOYEE_GROUP_BADGE_STYLES[group] || "border-slate-200 bg-slate-100 text-slate-700";
  }

  function getEmployeeGroupDotClass(group) {
    return EMPLOYEE_GROUP_DOT_STYLES[group] || "bg-slate-400";
  }

  function getEmployeeGroupMeta(group) {
    const normalized = normalizeEmployeeGroup(group || "");
    return EMPLOYEE_GROUP_META[normalized] || null;
  }

  function getEmployeeGroupLabel(group) {
    return getEmployeeGroupMeta(group)?.label || normalizeEmployeeGroup(group || "") || "";
  }

  function getEmployeeGroupIcon(group) {
    return getEmployeeGroupMeta(group)?.icon || "";
  }

  function getEmployeeGroupIconSvg(iconKey) {
    const attrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const icons = {
      plane: `<svg ${attrs}><path d="M10.8 13.2 3.6 10.8c-.8-.3-.8-1.4 0-1.7L20.4 3.2c.7-.2 1.3.4 1.1 1.1l-5.9 16.9c-.3.8-1.4.8-1.7 0l-2.4-7.2 5.1-5.1"/></svg>`,
      tools: `<svg ${attrs}><path d="M14.7 6.3a4 4 0 0 0 4.7 4.7l-7.9 7.9a2.3 2.3 0 0 1-3.3 0l-2.1-2.1a2.3 2.3 0 0 1 0-3.3l7.9-7.9Z"/><path d="m5.2 18.8 3-3"/><path d="M4 4l5 5"/><path d="M6 3 3 6"/></svg>`,
      box: `<svg ${attrs}><path d="m21 8.5-9-5-9 5 9 5 9-5Z"/><path d="M3 8.5v7l9 5 9-5v-7"/><path d="M12 13.5v7"/><path d="m7.5 6 9 5"/></svg>`,
      gear: `<svg ${attrs}><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06a2.1 2.1 0 0 1-3 3l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1 1.64V21.4a2.1 2.1 0 0 1-4.2 0v-.1a1.8 1.8 0 0 0-1-1.64 1.8 1.8 0 0 0-2 .36l-.06.06a2.1 2.1 0 0 1-3-3l.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.64-1H2.6a2.1 2.1 0 0 1 0-4.2h.1a1.8 1.8 0 0 0 1.64-1 1.8 1.8 0 0 0-.36-2l-.06-.06a2.1 2.1 0 0 1 3-3l.06.06a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1-1.64V2.6a2.1 2.1 0 0 1 4.2 0v.1a1.8 1.8 0 0 0 1 1.64 1.8 1.8 0 0 0 2-.36l.06-.06a2.1 2.1 0 0 1 3 3l-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.64 1h.1a2.1 2.1 0 0 1 0 4.2h-.1a1.8 1.8 0 0 0-1.64 1Z"/></svg>`,
      network: `<svg ${attrs}><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M10.8 7.2 6.2 15.8"/><path d="m13.2 7.2 4.6 8.6"/><path d="M7.5 18h9"/></svg>`,
      people: `<svg ${attrs}><path d="M16 20v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.6A3.6 3.6 0 0 0 4 18.6V20"/><circle cx="10" cy="7" r="3"/><path d="M20 20v-1.2a3.2 3.2 0 0 0-2.4-3.1"/><path d="M15.5 4.2a3 3 0 0 1 0 5.6"/></svg>`,
      clipboard: `<svg ${attrs}><path d="M9 4.5h6a2 2 0 0 1 2 2V7H7v-.5a2 2 0 0 1 2-2Z"/><path d="M8 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"/><path d="M8 12h8"/><path d="M8 16h6"/></svg>`
    };
    return icons[iconKey] || "";
  }

  function getEmployeeGroupIconHtml(group, classes = "") {
    const iconKey = getEmployeeGroupMeta(group)?.icon || "";
    const svg = getEmployeeGroupIconSvg(iconKey);
    if (!svg) return "";
    return `<span class="${classes || "inline-flex h-5 w-5 items-center justify-center text-slate-600 shrink-0"}">${svg}</span>`;
  }

  function getOrderedEmployeeGroups() {
    return EMPLOYEE_GROUP_DEFINITIONS.map(group => group.value);
  }

  function getEmployeeGroupSortIndex(group) {
    const normalized = normalizeEmployeeGroup(group || "");
    return EMPLOYEE_GROUP_ORDER[normalized] || 999;
  }

  function getEmployeeGroupFilterLabel() {
    const selectedGroups = state.selectedEmployeeGroups || [];
    if (!selectedGroups.length) return "Alle ansatte / alle grupper";
    if (selectedGroups.length <= 2) return selectedGroups.map(group => getEmployeeGroupLabel(group)).join(", ");
    return `${selectedGroups.length} grupper valgt`;
  }


  function getCalendarEmployeeGroups(employees) {
    const map = new Map();
    employees.forEach(employee => {
      const group = normalizeEmployeeGroup(employee.employee_group || "");
      const key = group || "__ungrouped__";
      if (!map.has(key)) {
        map.set(key, {
          key,
          group,
          label: group ? getEmployeeGroupLabel(group) : "Ingen gruppe valgt",
          iconHtml: group ? getEmployeeGroupIconHtml(group, "inline-flex h-5 w-5 items-center justify-center text-slate-600 shrink-0") : "",
          employees: []
        });
      }
      map.get(key).employees.push(employee);
    });

    return Array.from(map.values()).sort((a, b) => {
      const groupDiff = getEmployeeGroupSortIndex(a.group) - getEmployeeGroupSortIndex(b.group);
      if (groupDiff !== 0) return groupDiff;
      return a.label.localeCompare(b.label, "no");
    });
  }

  function isEmployeeGroupCollapsed(key) {
    return (state.collapsedEmployeeGroups || []).includes(key);
  }

  function setEmployeeGroupCollapsed(key, collapsed) {
    const current = new Set(state.collapsedEmployeeGroups || []);
    if (collapsed) current.add(key);
    else current.delete(key);
    state.collapsedEmployeeGroups = Array.from(current);
    localStorage.setItem("planner_collapsed_employee_groups_v1", JSON.stringify(state.collapsedEmployeeGroups));
  }

  function bindEmployeeGroupCollapseButtons() {
    if (!els.calendarWrap) return;
    els.calendarWrap.querySelectorAll("[data-employee-group-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        const key = button.dataset.employeeGroupToggle || "";
        setEmployeeGroupCollapsed(key, !isEmployeeGroupCollapsed(key));
        renderCalendar();
      });
    });
  }

  function renderEmployeeGroupFilterControl() {
    if (!els.groupFilterControl || !els.groupFilterLabel || !els.groupFilterOptions) return;
    els.groupFilterLabel.textContent = getEmployeeGroupFilterLabel();
    renderEmployeeGroupFilterOptions();
    if (els.groupFilterPanel) {
      els.groupFilterPanel.classList.toggle("hidden", !state.employeeGroupFilterOpen);
    }
  }

  function renderEmployeeGroupFilterOptions() {
    if (!els.groupFilterOptions) return;

    const searchValue = String(state.groupFilterSearch || "").trim().toLowerCase();
    const activeEmployees = state.employees.filter(employee => employee.active !== false);
    const groupCounts = new Map();

    activeEmployees.forEach(employee => {
      const group = normalizeEmployeeGroup(employee.employee_group || "");
      if (!group) return;
      groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
    });

    const groupOptions = getOrderedEmployeeGroups().filter(group => {
      if (!searchValue) return true;
      return group.toLowerCase().includes(searchValue);
    });

    const allMatchesSearch = !searchValue || "alle ansatte alle grupper".includes(searchValue);
    const selectedGroups = new Set(state.selectedEmployeeGroups || []);

    const allOptionHtml = allMatchesSearch ? `
      <label class="flex items-center justify-between gap-3 px-3 py-3 hover:bg-slate-50 border-b border-slate-100">
        <div>
          <div class="font-medium text-sm">Alle ansatte</div>
          <div class="text-xs text-slate-500">Vis alle grupper i kalenderen</div>
        </div>
        <input data-group-filter-checkbox type="checkbox" value="${EMPLOYEE_GROUP_FILTER_ALL_VALUE}" ${selectedGroups.size === 0 ? "checked" : ""} />
      </label>
    ` : "";

    const groupOptionsHtml = groupOptions.map(group => `
      <label class="flex items-center justify-between gap-3 px-3 py-3 hover:bg-slate-50 border-b border-slate-100">
        <div class="flex items-center gap-3 min-w-0">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 shrink-0">${getEmployeeGroupIconSvg(getEmployeeGroupIcon(group))}</span>
          <div class="min-w-0">
            <div class="font-medium text-sm text-slate-800 truncate">${escapeHtml(getEmployeeGroupLabel(group) || group)}</div>
            <div class="text-xs text-slate-500">${groupCounts.get(group) || 0} ansatte</div>
          </div>
        </div>
        <input data-group-filter-checkbox type="checkbox" value="${escapeHtml(group)}" ${selectedGroups.has(group) ? "checked" : ""} />
      </label>
    `).join("");

    const emptyHtml = (!allOptionHtml && !groupOptionsHtml)
      ? `<div class="px-3 py-4 text-sm text-slate-500">Fant ingen grupper.</div>`
      : "";

    els.groupFilterOptions.innerHTML = `${allOptionHtml}${groupOptionsHtml}${emptyHtml}`;
  }

  function handleEmployeeGroupFilterOptionChange(event) {
    const checkbox = event.target.closest("[data-group-filter-checkbox]");
    if (!checkbox) return;

    const value = checkbox.value || "";
    if (value === EMPLOYEE_GROUP_FILTER_ALL_VALUE) {
      state.selectedEmployeeGroups = [];
    } else {
      const next = new Set(state.selectedEmployeeGroups || []);
      if (checkbox.checked) {
        next.add(value);
      } else {
        next.delete(value);
      }
      state.selectedEmployeeGroups = getOrderedEmployeeGroups().filter(group => next.has(group));
    }

    renderEmployeeGroupFilterControl();
    renderCalendar();
  }

  function getEmployeeCalendarCellClass(employee) {
    const group = normalizeEmployeeGroup(employee?.employee_group || "");
    return EMPLOYEE_GROUP_CALENDAR_CELL_STYLES[group] || "bg-white text-slate-900";
  }

  function getEmployeeNameTabHtml(employee) {
    const group = normalizeEmployeeGroup(employee?.employee_group || "");
    return `
      <div class="flex items-center gap-2 min-w-0">
        ${getEmployeeGroupIconHtml(group, "inline-flex h-5 w-5 items-center justify-center text-slate-600 shrink-0 opacity-90")}
        <div class="employee-plan-name-main min-w-0 text-sm font-semibold leading-tight truncate">${escapeHtml(employee?.name || "")}</div>
      </div>
    `;
  }

  function refreshCalendarModeControls() {
    // v18.54 safety guard: older language hook calls this helper, but this build has no separate calendar mode control renderer.
  }

  function bindEvents() {
    window.addEventListener("izomax-language-changed", () => {
      // v18.56c: Do not call izomaxApplyLanguage from inside the language-changed event.
      // index.html dispatches this event after language has already been applied.
      // Calling applyLanguage here re-entered setLanguage() and caused a maximum call stack loop.
      refreshCalendarModeControls();
      renderLegend();
      if (state.activeTab === "calendar") {
        renderCalendarPanel();
        renderCalendar();
      }
    });

    els.searchInput.addEventListener("input", e => {
      state.search = String(e.target.value || "").trim().toLowerCase();
      if (state.calendarMode === "project") {
        if (state.search) jumpProjectCalendarToSearchMatch();
        else resetProjectSearchIfEmpty();
      }
      updateCalendarSearchControls();
      renderStats();
      renderCalendar();
    });

    els.searchInput.addEventListener("search", e => {
      state.search = String(e.target.value || "").trim().toLowerCase();
      if (state.calendarMode === "project" && !state.search) resetProjectSearchIfEmpty();
      updateCalendarSearchControls();
      renderStats();
      renderCalendar();
    });

    if (els.groupFilterButton) {
      els.groupFilterButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        toggleEmployeeGroupFilter();
      });
    }

    if (els.groupFilterSearch) {
      els.groupFilterSearch.addEventListener("input", event => {
        state.groupFilterSearch = event.target.value || "";
        renderEmployeeGroupFilterOptions();
      });
      els.groupFilterSearch.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          toggleEmployeeGroupFilter(false);
        }
      });
    }

    if (els.groupFilterOptions) {
      els.groupFilterOptions.addEventListener("change", handleEmployeeGroupFilterOptionChange);
      els.groupFilterOptions.addEventListener("click", event => event.stopPropagation());
    }

    document.addEventListener("click", handleEmployeeGroupFilterOutsideClick);
    if (els.calendarWrap) {
      els.calendarWrap.addEventListener("contextmenu", handleCalendarWrapContextMenu, true);
      els.calendarWrap.addEventListener("wheel", handleCalendarWrapWheelScroll, { passive: false });
      els.calendarWrap.addEventListener("pointerdown", event => {
        if (event.button === 2) openCalendarContextMenuFromEvent(event);
      }, true);
      els.calendarWrap.addEventListener("mousedown", event => {
        if (event.button === 2) openCalendarContextMenuFromEvent(event);
      }, true);
    }
    document.addEventListener("contextmenu", handleCalendarDocumentContextMenu, true);
    document.addEventListener("click", handleCalendarDocumentClick, true);

    bindTabEvents();
    if (els.calendarPanelHandleBtn) {
      els.calendarPanelHandleBtn.addEventListener("click", () => {
        state.calendarPanelOpen = !state.calendarPanelOpen;
        renderCalendarPanel();
      });
    }
    if (els.calendarPanelCloseBtn) {
      els.calendarPanelCloseBtn.addEventListener("click", () => {
        state.calendarPanelOpen = false;
        renderCalendarPanel();
      });
    }

    els.employeeFilter.addEventListener("change", e => {
      state.employeeFilter = e.target.value;
      if (state.employeeFilter !== "Alle ansatte") {
        state.selectedEmployeeGroups = [];
        renderEmployeeGroupFilterControl();
      }
      renderStats();
      renderCalendar();
    });

    if (els.projectFilterControl) {
      els.projectFilterControl.addEventListener("change", e => {
        state.projectPhaseFilter = e.target.value || "all";
        renderStats();
        renderCalendar();
      });
    }

    if (els.calendarNewProjectBtn) {
      els.calendarNewProjectBtn.addEventListener("click", () => openProjectModal());
    }

    els.viewMode.addEventListener("change", e => {
      state.viewMode = e.target.value;
      persistUiState();
      renderStats();
      renderCalendar();
    });

    if (els.calendarMode) {
      els.calendarMode.addEventListener("change", e => {
        state.calendarMode = e.target.value;
        if (state.calendarMode !== "personal") state.projectSpotlightId = "";
        state.projectSearchReturnStartDate = null;
        if (state.calendarMode === "personal") {
          state.projectListFilter = "all";
          state.calendarPanelOpen = false;
          state.focusProjectId = "";
          resetProjectInspectorFilters();
        }
        persistUiState();
        renderStats();
        renderCalendar();
      });
    }

    if (els.personalPlanQuickBtn) {
      els.personalPlanQuickBtn.addEventListener("click", () => openPersonalCalendarView());
    }

    if (els.projectPlanQuickBtn) {
      els.projectPlanQuickBtn.addEventListener("click", () => openProjectCalendarView("all"));
    }

    if (els.unstaffedProjectsQuickBtn) {
      els.unstaffedProjectsQuickBtn.addEventListener("click", () => openProjectCalendarView("unstaffed"));
    }

    els.prevBtn.addEventListener("click", () => {
      shiftPeriod(-1);
      renderStats();
      renderCalendar();
    });

    els.nextBtn.addEventListener("click", () => {
      shiftPeriod(1);
      renderStats();
      renderCalendar();
    });

    els.todayBtn.addEventListener("click", () => {
      state.startDate = state.viewMode === "År"
        ? new Date(new Date().getFullYear(), 0, 1)
        : state.viewMode === "Måned"
          ? startOfCurrentMonth()
          : startOfWeek(new Date());
      persistUiState();
      renderStats();
      renderCalendar();
    });

    els.assignProject.addEventListener("change", () => {
      const projectId = els.assignProject?.value || "";
      state.selectedAssignPeriodId = "";
      if (projectId) state.focusProjectId = projectId;
      syncAssignDatesFromProject({ projectId, periodId: "" });
      updateAvailabilityAnalysis();
      renderProjects();
    });
    if (els.assignPeriod) {
      els.assignPeriod.addEventListener("change", () => {
        state.selectedAssignPeriodId = els.assignPeriod?.value || "";
        syncAssignDatesFromProject({ periodId: state.selectedAssignPeriodId });
        updateAvailabilityAnalysis();
      });
    }
    if (els.assignPrevPeriodBtn) {
      els.assignPrevPeriodBtn.addEventListener("click", () => {
        const project = getProjectById(els.assignProject?.value || "");
        const periods = getProjectAssignablePeriods(project);
        if (!periods.length) return;
        const currentIndex = Math.max(0, periods.findIndex(period => period.id === state.selectedAssignPeriodId));
        const nextIndex = Math.max(0, currentIndex - 1);
        state.selectedAssignPeriodId = periods[nextIndex]?.id || state.selectedAssignPeriodId;
        syncAssignDatesFromProject({ projectId: els.assignProject?.value || "", periodId: state.selectedAssignPeriodId });
      });
    }
    if (els.assignNextPeriodBtn) {
      els.assignNextPeriodBtn.addEventListener("click", () => {
        const project = getProjectById(els.assignProject?.value || "");
        const periods = getProjectAssignablePeriods(project);
        if (!periods.length) return;
        const currentIndex = Math.max(0, periods.findIndex(period => period.id === state.selectedAssignPeriodId));
        const nextIndex = Math.min(periods.length - 1, currentIndex + 1);
        state.selectedAssignPeriodId = periods[nextIndex]?.id || state.selectedAssignPeriodId;
        syncAssignDatesFromProject({ projectId: els.assignProject?.value || "", periodId: state.selectedAssignPeriodId });
      });
    }
    els.assignStart.addEventListener("change", updateAvailabilityAnalysis);
    els.assignEnd.addEventListener("change", updateAvailabilityAnalysis);
    els.assignStart.addEventListener("change", updateAvailabilityAnalysis);
    els.assignEnd.addEventListener("change", updateAvailabilityAnalysis);
    els.assignBtn.addEventListener("click", createEntry);
    els.bulkAddBtn.addEventListener("click", bulkAddEmployees);
    if (els.personalBlockSaveBtn) {
      els.personalBlockSaveBtn.addEventListener("click", createPersonalBlockEntry);
    }
    if (els.contextMenuAddBtn) {
      els.contextMenuAddBtn.addEventListener("click", createContextMenuPersonalBlockEntry);
    }
    if (els.contextMenuCloseBtn) {
      els.contextMenuCloseBtn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        hideCalendarContextMenu();
      });
    }
    document.addEventListener("click", handleGlobalPointerClose, true);
    window.addEventListener("resize", hideCalendarContextMenu);
    window.addEventListener("mousemove", handleResizePointerMove);
    window.addEventListener("mouseup", handleResizePointerUp);
    document.addEventListener("visibilitychange", handleSyncVisibilityChange);
    window.addEventListener("focus", handleWindowFocusRefresh);
    window.addEventListener("beforeunload", stopRemoteSync);
    if (els.resetDemoBtn) {
      els.resetDemoBtn.style.display = "none";
    }

    els.closeModalBtn.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
      closeEditModal();
    });
    els.saveEditBtn.addEventListener("click", saveEditedEntry);
    els.deleteEditBtn.addEventListener("click", deleteEditedEntry);

    els.newProjectBtn.addEventListener("click", () => openProjectModal());
    els.closeProjectModalBtn.addEventListener("click", closeProjectModal);
    els.saveProjectBtn.addEventListener("click", saveProjectFromModal);
    els.deleteProjectBtn.addEventListener("click", deleteProjectFromModal);
    if (els.projectHasMultiplePeriods) {
      els.projectHasMultiplePeriods.addEventListener("change", () => {
        setProjectMultiplePeriodsUiState();
        renderProjectPeriodsEditor();
      });
    }
    if (els.projectPlannedStart) {
      els.projectPlannedStart.addEventListener("change", () => applyDefaultWorkshopDraft(false));
    }
    if (els.projectWorkshopEnabled) {
      els.projectWorkshopEnabled.addEventListener("change", () => {
        setWorkshopModalEnabled(Boolean(els.projectWorkshopEnabled.checked), Boolean(els.projectWorkshopEnabled.checked));
      });
    }
    if (els.projectWorkshopAddBtn) {
      els.projectWorkshopAddBtn.addEventListener("click", () => setWorkshopModalEnabled(true, true));
    }
    if (els.projectWorkshopRemoveBtn) {
      els.projectWorkshopRemoveBtn.addEventListener("click", () => setWorkshopModalEnabled(false, false));
    }
    if (els.addProjectPeriodBtn) {
      els.addProjectPeriodBtn.addEventListener("click", addProjectPeriodDraft);
    }
    if (els.projectPeriodsList) {
      els.projectPeriodsList.addEventListener("click", event => {
        const removeBtn = event.target.closest("[data-remove-project-period]");
        if (!removeBtn) return;
        removeProjectPeriodDraft(removeBtn.dataset.periodId || "");
      });
      els.projectPeriodsList.addEventListener("input", event => {
        const input = event.target;
        if (!(input instanceof HTMLInputElement)) return;
        const periodId = input.dataset.periodId || "";
        if (input.hasAttribute("data-project-period-start")) {
          updateProjectPeriodDraft(periodId, "start", input.value || "");
        }
        if (input.hasAttribute("data-project-period-end")) {
          updateProjectPeriodDraft(periodId, "end", input.value || "");
        }
      });
    }

    els.newEmployeeBtn.addEventListener("click", () => openEmployeeModal());
    els.closeEmployeeModalBtn.addEventListener("click", closeEmployeeModal);
    els.saveEmployeeBtn.addEventListener("click", saveEmployeeFromModal);
    els.deleteEmployeeBtn.addEventListener("click", deleteEmployeeFromModal);

    els.editModal.addEventListener("click", e => {
      if (e.target === els.editModal) closeEditModal();
    });

    els.projectModal.addEventListener("click", e => {
      if (e.target === els.projectModal) closeProjectModal();
    });

    els.employeeModal.addEventListener("click", e => {
      if (e.target === els.employeeModal) closeEmployeeModal();
    });

    if (els.changePasswordBtn) {
      els.changePasswordBtn.addEventListener("click", handleChangePassword);
    }

    if (els.resetPasswordBtn) {
      els.resetPasswordBtn.addEventListener("click", handleResetPassword);
    }

    if (els.logoutBtn) {
      els.logoutBtn.addEventListener("click", handleLogout);
    }

    if (els.employeePortalLogoutBtn) {
      els.employeePortalLogoutBtn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        handleLogout();
      });
    }

    if (els.employeePortalContent) {
      els.employeePortalContent.addEventListener("click", event => {
        const detailButton = event.target?.closest?.("[data-employee-portal-toggle-project-details]");
        if (detailButton) {
          event.preventDefault();
          state.employeePortalProjectDetailsOpen = !state.employeePortalProjectDetailsOpen;
          renderEmployeePortal();
          return;
        }
        const selectButton = event.target?.closest?.("[data-employee-portal-select-assignment]");
        if (!selectButton) return;
        event.preventDefault();
        const entryId = selectButton.dataset.employeePortalSelectAssignment || "";
        if (!entryId) return;
        state.employeePortalSelectedEntryId = entryId;
        state.employeePortalProjectDetailsOpen = false;
        renderEmployeePortal();
      });
    }

    if (els.startLoginSubmitBtn) {
      els.startLoginSubmitBtn.addEventListener("click", handleStartLogin);
    }

    if (els.startForgotPasswordBtn) {
      els.startForgotPasswordBtn.addEventListener("click", handleStartForgotPassword);
    }

    if (els.startAccessHelpBtn) {
      els.startAccessHelpBtn.addEventListener("click", handleStartAccessHelp);
    }

    if (els.accessRequestCloseBtn) {
      els.accessRequestCloseBtn.addEventListener("click", closeAccessRequestModal);
    }

    if (els.accessRequestCancelBtn) {
      els.accessRequestCancelBtn.addEventListener("click", closeAccessRequestModal);
    }

    if (els.accessRequestSubmitBtn) {
      els.accessRequestSubmitBtn.addEventListener("click", submitAccessRequest);
    }

    if (els.accessRequestModal) {
      els.accessRequestModal.addEventListener("click", event => {
        if (event.target === els.accessRequestModal) closeAccessRequestModal();
      });
    }

    if (els.accessRequestMessage) {
      els.accessRequestMessage.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          submitAccessRequest();
        }
      });
    }

    if (els.accessApprovalRefreshBtn) {
      els.accessApprovalRefreshBtn.addEventListener("click", () => refreshAccessRequests());
    }

    if (els.accessApprovalList) {
      els.accessApprovalList.addEventListener("click", event => {
        const button = event.target?.closest?.("[data-access-action]");
        if (!button) return;
        const requestId = button.dataset.accessRequestId || "";
        const action = button.dataset.accessAction || "";
        if (!requestId || !action) return;
        if (action === "setup") setupApprovedAccessRequest(requestId);
        else if (action === "create-auth-user") createAuthUserForAccessRequest(requestId);
        else if (action === "complete-access") completeAccessRequestFromAdmin(requestId);
        else if (action === "generate-temp-password") generateTemporaryPasswordForAccessRequest(requestId);
        else updateAccessRequestStatus(requestId, action);
      });
      els.accessApprovalList.addEventListener("change", event => {
        const select = event.target?.closest?.("[data-access-complete-role]");
        if (!select) return;
        const requestId = select.dataset.accessCompleteRole || "";
        if (requestId) updateAccessCompleteEmployeeFields(requestId);
      });
      els.accessApprovalList.addEventListener("change", event => {
        const select = event.target?.closest?.("[data-access-complete-existing-employee]");
        if (!select) return;
        const requestId = select.dataset.accessCompleteExistingEmployee || "";
        if (requestId) updateAccessCompleteEmployeeFields(requestId);
      });
      els.accessApprovalList.addEventListener("change", event => {
        const select = event.target?.closest?.("[data-access-setup-role]");
        if (!select) return;
        const requestId = select.dataset.accessSetupRole || "";
        const panel = requestId ? els.accessApprovalList.querySelector(`[data-access-setup-panel="${CSS.escape(requestId)}"]`) : null;
        const employeeSelect = panel?.querySelector?.(`[data-access-setup-employee="${CSS.escape(requestId)}"]`);
        if (employeeSelect) employeeSelect.disabled = select.value !== "employee";
        const button = panel?.querySelector?.(`[data-access-action="setup"]`);
        if (button && select.value === "employee") button.disabled = !employeeSelect?.value;
        if (button && select.value !== "employee") button.disabled = false;
      });
      els.accessApprovalList.addEventListener("change", event => {
        const select = event.target?.closest?.("[data-access-setup-employee]");
        if (!select) return;
        const requestId = select.dataset.accessSetupEmployee || "";
        const panel = requestId ? els.accessApprovalList.querySelector(`[data-access-setup-panel="${CSS.escape(requestId)}"]`) : null;
        const roleSelect = panel?.querySelector?.(`[data-access-setup-role="${CSS.escape(requestId)}"]`);
        const button = panel?.querySelector?.(`[data-access-action="setup"]`);
        if (button && roleSelect?.value === "employee") button.disabled = !select.value;
      });
    }

    if (els.accessUsersRefreshBtn) {
      els.accessUsersRefreshBtn.addEventListener("click", () => refreshAccessUsers());
    }

    if (els.accessUsersList) {
      els.accessUsersList.addEventListener("click", event => {
        const button = event.target?.closest?.("[data-access-user-action]");
        if (!button) return;
        const userId = button.dataset.accessUserId || "";
        const action = button.dataset.accessUserAction || "";
        if (!userId || !action) return;
        const sourceRow = button.closest("[data-access-user-row-id]");
        if (action === "toggle-active") updateAccessUserActive(userId, button.dataset.accessUserNextAction || "");
        else if (action === "set-role") updateAccessUserRole(userId, sourceRow);
        else if (action === "generate-password") generatePasswordForAccessUser(userId, sourceRow);
        else if (action === "set-password") setTemporaryPasswordForAccessUser(userId, sourceRow);
      });
      els.accessUsersList.addEventListener("input", event => {
        const input = event.target?.closest?.("[data-access-user-password]");
        if (!input) return;
        const userId = input.dataset.accessUserPassword || "";
        setAccessUserDraftPassword(userId, input.value || "");
      });
    }

    if (els.startLoginPassword) {
      els.startLoginPassword.addEventListener("keydown", e => {
        if (e.key === "Enter") handleStartLogin();
      });
    }

    if (els.startLoginEmail) {
      els.startLoginEmail.addEventListener("keydown", e => {
        if (e.key === "Enter") handleStartLogin();
      });
    }

    if (els.loginBtn) {
      els.loginBtn.addEventListener("click", openLoginModal);
    }

    if (els.closeLoginModalBtn) {
      els.closeLoginModalBtn.addEventListener("click", closeLoginModal);
    }

    if (els.loginSubmitBtn) {
      els.loginSubmitBtn.addEventListener("click", handleLogin);
    }

    if (els.forgotPasswordBtn) {
      els.forgotPasswordBtn.addEventListener("click", handleForgotPassword);
    }

    if (els.loginPassword) {
      els.loginPassword.addEventListener("keydown", e => {
        if (e.key === "Enter") handleLogin();
      });
    }

    if (els.loginModal) {
      els.loginModal.addEventListener("click", e => {
        if (e.target === els.loginModal) closeLoginModal();
      });
    }
  }

  function fillSelect(selectEl, values, selected = null, labelKey = null, valueKey = null) {
    if (!selectEl) return;
    selectEl.innerHTML = "";

    values.forEach(item => {
      const option = document.createElement("option");
      if (typeof item === "object") {
        option.value = valueKey ? item[valueKey] : item.id;
        {
          const labelText = labelKey ? item[labelKey] : item.name;
          option.textContent = window.izomaxTranslateValue?.(labelText) || labelText;
        }
      } else {
        option.value = item;
        option.textContent = window.izomaxTranslateValue?.(item) || item;
      }
      if (selected !== null && option.value === selected) option.selected = true;
      selectEl.appendChild(option);
    });
  }

  async function bootData() {
    const localData = loadAllLocal();
    state.employees = normalizeEmployees(localData.employees);
    state.projects = normalizeProjects(localData.projects);
    state.entries = localData.entries;
    state.auditLog = localData.auditLog;
    state.notificationLog = localData.notificationLog;

    if (!supabaseClient) {
      state.storageMode = "local";
      state.supabaseReady = false;
      state.supabaseError = "Supabase-biblioteket ble ikke lastet.";
      setSaveStatus("Lokal fallback", "warn");
      updateBadge();
      return;
    }

    const ok = await testSupabase();
    if (!ok) {
      state.storageMode = "local";
      setSaveStatus("Lokal fallback", "warn");
      updateBadge();
      renderAll();
      return;
    }

    await fetchFromSupabase();
    await fetchAccessRequests({ silent: true });
    await fetchAccessUsers({ silent: true });

    const hasMainData = state.employees.length || state.projects.length || state.entries.length;
    if (!isEmployeePortalUser() && !hasMainData) {
      state.employees = normalizeEmployees(structuredClone(DEFAULT_EMPLOYEES));
      state.projects = normalizeProjects(structuredClone(DEFAULT_PROJECTS));
      state.entries = structuredClone(DEFAULT_ENTRIES);
      state.auditLog = structuredClone(DEFAULT_AUDIT_LOG);
      state.notificationLog = structuredClone(DEFAULT_NOTIFICATION_LOG);
      saveAllLocal();
      await seedDemoDataBatch();
      await fetchFromSupabase();
    }

    setSaveStatus("Lagret", "ok");
  }

  async function testSupabase() {
    try {
      const { error } = await supabaseClient.from("planner_employees").select("id", { head: true, count: "exact" });
      if (error) throw error;

      state.remoteCapabilities.employeeGroupColumn = await detectEmployeeGroupColumn();

      state.supabaseReady = true;
      state.storageMode = "supabase";
      state.supabaseError = null;
      return true;
    } catch (err) {
      state.supabaseReady = false;
      state.supabaseError = err?.message || "Ukjent Supabase-feil.";
      return false;
    }
  }

  async function detectEmployeeGroupColumn() {
    try {
      const { error } = await supabaseClient
        .from("planner_employees")
        .select("id, employee_group")
        .limit(1);

      if (error) {
        const message = String(error.message || "").toLowerCase();
        if (message.includes("employee_group")) return false;
        throw error;
      }

      return true;
    } catch (err) {
      console.warn("Kunne ikke verifisere employee_group-kolonne i Supabase:", err);
      return false;
    }
  }

  async function fetchEmployeePortalCrewForProjects(projectIds = []) {
    state.employeePortalCrewByProject = {};
    state.employeePortalCrewFetchError = "";
    if (!supabaseClient || !isEmployeePortalUser()) return;
    const ids = [...new Set((projectIds || []).filter(Boolean))];
    if (!ids.length) return;

    const results = await Promise.all(ids.map(async projectId => {
      const { data, error } = await supabaseClient.rpc("get_employee_project_crew", { p_project_id: projectId });
      if (error) return { projectId, error };
      return { projectId, data: data || [] };
    }));

    results.forEach(result => {
      if (result.error) {
        state.employeePortalCrewFetchError = state.employeePortalCrewFetchError || result.error.message || "Kunne ikke hente prosjektteam.";
        return;
      }
      state.employeePortalCrewByProject[result.projectId] = result.data || [];
    });
  }

  function getProjectInspectorPendingDeleteIds() {
    if (!(state.projectInspectorPendingDeleteIds instanceof Set)) {
      state.projectInspectorPendingDeleteIds = new Set();
    }
    return state.projectInspectorPendingDeleteIds;
  }

  function filterPendingDeletedEntries(rows = []) {
    const pendingDeleteIds = getProjectInspectorPendingDeleteIds();
    if (!pendingDeleteIds.size) return rows || [];
    return (rows || []).filter(row => !pendingDeleteIds.has(row?.id));
  }

  async function fetchFromSupabase() {
    if (!state.supabaseReady) return;

    try {
      if (isEmployeePortalUser()) {
        const [employeesRes, projectsRes, entriesRes] = await Promise.all([
          supabaseClient.from("planner_employees").select("*").order("name"),
          supabaseClient.from("planner_projects").select("*").order("planned_start_date", { ascending: true }),
          supabaseClient.from("planner_entries").select("*").order("start_date")
        ]);

        [employeesRes, projectsRes, entriesRes].forEach(r => {
          if (r.error) throw r.error;
        });

        state.employees = normalizeEmployees(employeesRes.data || []);
        state.projects = normalizeProjects(projectsRes.data || []);
        state.entries = filterPendingDeletedEntries(entriesRes.data || []);
        state.auditLog = [];
        state.notificationLog = [];
        await fetchEmployeePortalCrewForProjects((state.entries || []).map(entry => entry.project_id));

        saveAllLocal();
        state.storageMode = "supabase";
        state.supabaseError = null;
        updateBadge();
        return;
      }

      const [
        employeesRes,
        projectsRes,
        entriesRes,
        auditRes,
        notificationRes
      ] = await Promise.all([
        supabaseClient.from("planner_employees").select("*").order("name"),
        supabaseClient.from("planner_projects").select("*").order("planned_start_date", { ascending: true }),
        supabaseClient.from("planner_entries").select("*").order("start_date"),
        supabaseClient.from("planner_audit_log").select("*").order("created_at", { ascending: false }).limit(100),
        supabaseClient.from("planner_notification_log").select("*").order("created_at", { ascending: false }).limit(100)
      ]);

      [employeesRes, projectsRes, entriesRes, auditRes, notificationRes].forEach(r => {
        if (r.error) throw r.error;
      });

      state.employees = normalizeEmployees(employeesRes.data || []);
      state.projects = normalizeProjects(projectsRes.data || []);
      state.entries = filterPendingDeletedEntries(entriesRes.data || []);
      state.auditLog = auditRes.data || [];
      state.notificationLog = notificationRes.data || [];

      saveAllLocal();
      state.storageMode = "supabase";
      state.supabaseError = null;
      updateBadge();
    } catch (err) {
      state.storageMode = "local";
      state.supabaseError = err?.message || "Kunne ikke hente data.";
      updateBadge();
      setSaveStatus("Feil ved henting", "error");
    }
  }

  function normalizeEmployees(list) {
    const storedGroups = loadEmployeeGroupMap();
    return (list || []).map(emp => ({
      ...emp,
      title: emp?.title || "",
      employee_group: normalizeEmployeeGroup(emp?.employee_group || storedGroups[emp?.id] || "")
    }));
  }

  function normalizeProjectStatus(status) {
    const value = String(status || "").trim();
    if (!value) return "Planlagt";
    if (value === "Avsluttet") return "Fullført";
    if (value === "Fullført") return "Fullført";
    if (value === "Kansellert") return "Kansellert";
    return PROJECT_STATUS_OPTIONS.includes(value) ? value : "Planlagt";
  }

  function isCancelledProject(project) {
    return normalizeProjectStatus(project?.status || "") === "Kansellert";
  }

  function isCompletedProject(project) {
    return normalizeProjectStatus(project?.status || "") === "Fullført";
  }

  function isClosedProject(project) {
    return isCompletedProject(project) || isCancelledProject(project);
  }

  function normalizeProjects(list) {
    return (list || []).map(project => ({
      ...project,
      category: project?.category === "Project" ? "Offshore" : project?.category,
      status: normalizeProjectStatus(project?.status || "Planlagt"),
      has_multiple_periods: Boolean(project?.has_multiple_periods),
      project_periods_json: normalizeProjectPeriods(project?.project_periods_json || []),
      project_responsible: project?.project_responsible || "",
      workshop_enabled: project?.workshop_enabled !== false,
      workshop_start_date: project?.workshop_start_date || null,
      workshop_end_date: project?.workshop_end_date || null,
      workshop_headcount_required: Number(project?.workshop_headcount_required || 2)
    }));
  }

  function loadLegacyValue(currentKey, legacyKeys, fallback) {
    const current = load(currentKey, null);
    if (current !== null) return current;
    for (const key of legacyKeys || []) {
      const legacy = load(key, null);
      if (legacy !== null) return legacy;
    }
    return fallback;
  }

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function loadAllLocal() {
    return {
      employees: loadLegacyValue(STORAGE_KEYS.employees, LEGACY_STORAGE_KEYS.employees, structuredClone(DEFAULT_EMPLOYEES)),
      projects: loadLegacyValue(STORAGE_KEYS.projects, LEGACY_STORAGE_KEYS.projects, structuredClone(DEFAULT_PROJECTS)),
      entries: loadLegacyValue(STORAGE_KEYS.entries, LEGACY_STORAGE_KEYS.entries, structuredClone(DEFAULT_ENTRIES)),
      auditLog: loadLegacyValue(STORAGE_KEYS.auditLog, LEGACY_STORAGE_KEYS.auditLog, structuredClone(DEFAULT_AUDIT_LOG)),
      notificationLog: loadLegacyValue(STORAGE_KEYS.notificationLog, LEGACY_STORAGE_KEYS.notificationLog, structuredClone(DEFAULT_NOTIFICATION_LOG))
    };
  }


  function loadEmployeeGroupMap() {
    return load(EMPLOYEE_GROUP_STORAGE_KEY, {});
  }

  function saveEmployeeGroupMap() {
    const groupMap = {};
    state.employees.forEach(employee => {
      const group = normalizeEmployeeGroup(employee?.employee_group || "");
      if (employee?.id && group) {
        groupMap[employee.id] = group;
      }
    });
    localStorage.setItem(EMPLOYEE_GROUP_STORAGE_KEY, JSON.stringify(groupMap));
  }

  function normalizeEmployeeGroup(value) {
    const group = String(value || "").trim();
    if (!group) return "";
    return EMPLOYEE_GROUP_ALIAS_MAP[group.toLowerCase()] || (EMPLOYEE_GROUP_OPTIONS.includes(group) ? group : "");
  }

  function getEmployeeGroupCardClass(group) {
    return EMPLOYEE_GROUP_CARD_STYLES[group] || "border-slate-200 bg-slate-50 hover:bg-slate-100";
  }

  function getEmployeeRowForRemote(employee) {
    const row = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      title: employee.title,
      active: employee.active
    };

    if (state.remoteCapabilities.employeeGroupColumn) {
      row.employee_group = normalizeEmployeeGroup(employee.employee_group || "");
    }

    return row;
  }

  function saveAllLocal() {
    localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(state.employees));
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects));
    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(state.entries));
    localStorage.setItem(STORAGE_KEYS.auditLog, JSON.stringify(state.auditLog));
    localStorage.setItem(STORAGE_KEYS.notificationLog, JSON.stringify(state.notificationLog));
    saveEmployeeGroupMap();
  }

  function persistUiState() {
    localStorage.setItem(STORAGE_KEYS.startDate, JSON.stringify(toIsoDate(state.startDate)));
    localStorage.setItem(STORAGE_KEYS.viewMode, JSON.stringify(state.viewMode));
    localStorage.setItem(STORAGE_KEYS.calendarMode, JSON.stringify(state.calendarMode));
  }

  function setSaveStatus(text, variant = "neutral") {
    clearTimeout(saveStatusTimer);
    const base = "rounded-xl px-3 py-2 text-sm border ";
    const map = {
      neutral: "border-slate-300 bg-white text-slate-700",
      saving: "border-blue-300 bg-blue-50 text-blue-700",
      ok: "border-green-300 bg-green-50 text-green-700",
      warn: "border-amber-300 bg-amber-50 text-amber-700",
      error: "border-red-300 bg-red-50 text-red-700"
    };
    els.saveStatus.textContent = text;
    els.saveStatus.className = base + (map[variant] || map.neutral);

    if (variant === "ok") {
      saveStatusTimer = setTimeout(() => {
        els.saveStatus.textContent = "Klar";
        els.saveStatus.className = base + map.neutral;
      }, 1800);
    }
  }

  function updateBadge() {
    if (!els.storageBadge) return;
    if (state.storageMode === "supabase") {
      els.storageBadge.textContent = "Supabase aktiv";
      els.storageBadge.className = "rounded-xl border border-green-300 bg-green-50 text-green-700 px-3 py-2 text-sm";
    } else {
      els.storageBadge.textContent = "Lokal fallback";
      els.storageBadge.className = "rounded-xl border border-amber-300 bg-amber-50 text-amber-700 px-3 py-2 text-sm";
    }
  }

  async function saveRow(table, row) {
    saveAllLocal();
    if (!state.supabaseReady) {
      setSaveStatus("Lagret lokalt", "warn");
      return { ok: true };
    }

    setSaveStatus("Lagrer...", "saving");
    const { error } = await supabaseClient.from(table).upsert(row);
    if (error) {
      state.supabaseError = error.message;
      state.storageMode = "local";
      updateBadge();
      setSaveStatus("Feil ved lagring", "error");
      renderSystemStatus();
      return { ok: false, error };
    }

    state.storageMode = "supabase";
    state.supabaseError = null;
    updateBadge();
    setSaveStatus("Lagret", "ok");
    return { ok: true };
  }

  async function saveRows(table, rows) {
    saveAllLocal();
    if (!state.supabaseReady) {
      setSaveStatus("Lagret lokalt", "warn");
      return { ok: true };
    }

    setSaveStatus("Lagrer...", "saving");
    const { error } = await supabaseClient.from(table).upsert(rows);
    if (error) {
      state.supabaseError = error.message;
      state.storageMode = "local";
      updateBadge();
      setSaveStatus("Feil ved lagring", "error");
      renderSystemStatus();
      return { ok: false, error };
    }

    state.storageMode = "supabase";
    state.supabaseError = null;
    updateBadge();
    setSaveStatus("Lagret", "ok");
    return { ok: true };
  }

  async function deleteRow(table, id) {
    saveAllLocal();
    if (!state.supabaseReady) {
      setSaveStatus("Slettet lokalt", "warn");
      return { ok: true };
    }

    setSaveStatus("Lagrer...", "saving");
    const { error } = await supabaseClient.from(table).delete().eq("id", id);
    if (error) {
      state.supabaseError = error.message;
      state.storageMode = "local";
      updateBadge();
      setSaveStatus("Feil ved sletting", "error");
      renderSystemStatus();
      return { ok: false, error };
    }

    state.storageMode = "supabase";
    state.supabaseError = null;
    updateBadge();
    setSaveStatus("Lagret", "ok");
    return { ok: true };
  }

  async function addAudit(text) {
    const row = {
      id: crypto.randomUUID(),
      user_name: state.currentUser,
      action_text: text,
      created_at: new Date().toISOString()
    };

    state.auditLog.unshift(row);
    state.auditLog = state.auditLog.slice(0, 100);
    saveAllLocal();

    if (!state.supabaseReady) return { ok: true };

    try {
      const { error } = await supabaseClient.from("planner_audit_log").insert(row);
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      console.error("Audit log feilet:", err);
      return { ok: false, error: err };
    }
  }

  async function addNotification(employeeName, projectName) {
    const row = {
      id: crypto.randomUUID(),
      type: "System",
      recipient: employeeName,
      target: projectName,
      created_at: new Date().toISOString()
    };

    state.notificationLog.unshift(row);
    state.notificationLog = state.notificationLog.slice(0, 100);
    saveAllLocal();

    if (!state.supabaseReady) return { ok: true };

    try {
      const { error } = await supabaseClient.from("planner_notification_log").insert(row);
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      console.error("Notification log feilet:", err);
      return { ok: false, error: err };
    }
  }

  async function seedDemoDataBatch() {
    if (!state.supabaseReady) return;
    await saveRows("planner_employees", state.employees.map(getEmployeeRowForRemote));
    await saveRows("planner_projects", state.projects);
    await saveRows("planner_entries", state.entries);
    await saveRows("planner_audit_log", state.auditLog);
    if (state.notificationLog.length) {
      await saveRows("planner_notification_log", state.notificationLog);
    }
  }

  async function resetDemo() {
    if (!confirm("Vil du nullstille til demo-data?")) return;

    state.employees = normalizeEmployees(structuredClone(DEFAULT_EMPLOYEES));
    state.projects = normalizeProjects(structuredClone(DEFAULT_PROJECTS));
    state.entries = structuredClone(DEFAULT_ENTRIES);
    state.auditLog = structuredClone(DEFAULT_AUDIT_LOG);
    state.notificationLog = structuredClone(DEFAULT_NOTIFICATION_LOG);
    state.startDate = new Date("2026-01-05");
    state.viewMode = "Uke";
    state.calendarMode = "personal";
    rebuildDerivedState();
    persistUiState();
    saveAllLocal();

    if (state.supabaseReady) {
      setSaveStatus("Nullstiller...", "saving");
      await clearAllTables();
      await seedDemoDataBatch();
      await fetchFromSupabase();
      rebuildDerivedState();
      setSaveStatus("Lagret", "ok");
    }

    renderAll();
  }

  async function clearAllTables() {
    const tables = [
      "planner_entries",
      "planner_projects",
      "planner_employees",
      "planner_audit_log",
      "planner_notification_log"
    ];

    for (const table of tables) {
      const { error } = await supabaseClient.from(table).delete().not("id", "is", null);
      if (error) throw error;
    }
  }


  function getProjectAssignablePeriods(project) {
    if (!project || !project.has_multiple_periods) return [];
    return normalizeProjectPeriods(project.project_periods_json || []);
  }

  function getInitials(name = "") {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join("") || "?";
  }

  function getProjectPeriodStatusItems(project) {
    const periods = getProjectAssignablePeriods(project);
    if (!project || !periods.length) return [];

    return periods.map((period, index) => {
      const assigned = getAssignedCountForProjectRange(project.id, period.start || "", period.end || "");
      const required = Math.max(Number(project.headcount_required || 0), 0);
      let tone = "slate";
      let label = required === 0 ? "Ingen plasser" : "Ikke bemannet";

      if (required > 0 && assigned >= required) {
        tone = "green";
        label = `Komplett ${assigned}/${required}`;
      } else if (assigned > 0) {
        tone = "amber";
        label = `Delvis ${assigned}/${required}`;
      } else if (required > 0) {
        tone = "rose";
        label = `Manglende ${assigned}/${required}`;
      }

      return {
        id: period.id,
        index,
        period,
        assigned,
        required,
        tone,
        label,
        optionLabel: formatProjectPeriodOptionLabel(period, index)
      };
    });
  }

  function formatProjectPeriodOptionLabel(period, index) {
    const startLabel = period?.start ? formatDate(period.start) : "ingen start";
    const endLabel = period?.end ? formatDate(period.end) : "ingen slutt";
    return `Periode ${index + 1}: ${startLabel} – ${endLabel}`;
  }


  function populateAssignPeriodSelect(project, preferredPeriodId = "") {
    if (!els.assignPeriodWrap || !els.assignPeriod) return null;
    const periods = getProjectAssignablePeriods(project);

    if (!project || !periods.length) {
      state.selectedAssignPeriodId = "";
      els.assignPeriod.innerHTML = "";
      els.assignPeriodWrap.classList.add("hidden");
      if (els.assignPeriodHint) els.assignPeriodHint.textContent = "";
      if (els.assignPeriodNav) els.assignPeriodNav.classList.add("hidden");
      if (els.assignPrevPeriodBtn) els.assignPrevPeriodBtn.disabled = true;
      if (els.assignNextPeriodBtn) els.assignNextPeriodBtn.disabled = true;
      return null;
    }

    const selectedPeriod = periods.find(period => period.id === preferredPeriodId)
      || periods.find(period => period.id === state.selectedAssignPeriodId)
      || periods[0];

    const selectedIndex = Math.max(0, periods.findIndex(period => period.id === selectedPeriod?.id));
    const options = periods.map((period, index) => ({
      id: period.id,
      name: formatProjectPeriodOptionLabel(period, index)
    }));
    fillSelect(els.assignPeriod, options, selectedPeriod?.id || "", "name", "id");
    els.assignPeriodWrap.classList.remove("hidden");
    if (els.assignPeriodHint) els.assignPeriodHint.textContent = `Periode ${selectedIndex + 1} av ${periods.length}`;
    if (els.assignPeriodNav) els.assignPeriodNav.classList.remove("hidden");
    if (els.assignPrevPeriodBtn) els.assignPrevPeriodBtn.disabled = selectedIndex <= 0;
    if (els.assignNextPeriodBtn) els.assignNextPeriodBtn.disabled = selectedIndex >= periods.length - 1;
    state.selectedAssignPeriodId = selectedPeriod?.id || "";
    return selectedPeriod || null;
  }


  function getSelectedAssignPeriod(project, preferredPeriodId = "") {
    const periods = getProjectAssignablePeriods(project);
    if (!periods.length) return null;
    return periods.find(period => period.id === preferredPeriodId)
      || periods.find(period => period.id === state.selectedAssignPeriodId)
      || periods[0]
      || null;
  }

  function getAssignRangeForProject(project, preferredPeriodId = "") {
    if (!project) {
      return { start: "", end: "", period: null, usesMultiplePeriods: false };
    }
    const period = getSelectedAssignPeriod(project, preferredPeriodId);
    if (period) {
      return {
        start: period.start || "",
        end: period.end || "",
        period,
        usesMultiplePeriods: true
      };
    }
    return {
      start: project.planned_start_date || "",
      end: project.planned_end_date || "",
      period: null,
      usesMultiplePeriods: false
    };
  }

  function getAssignedCountForProjectRange(projectId, startDate, endDate) {
    if (!projectId || !startDate || !endDate) return 0;
    return state.entries.filter(entry =>
      entry.project_id === projectId &&
      overlaps(entry.start_date, entry.end_date, startDate, endDate)
    ).length;
  }

  function syncAssignDatesFromProject(options = {}) {
    const projectId = options.projectId ?? (els.assignProject?.value || "");
    const project = getProjectById(projectId);
    const preservedRows = Array.isArray(options.rows)
      ? options.rows
      : getAssignRowsSnapshot();
    const requestedPeriodId = options.periodId ?? state.selectedAssignPeriodId ?? "";

    if (els.assignProject && els.assignProject.value !== projectId) {
      els.assignProject.value = projectId;
    }

    const selectedPeriod = populateAssignPeriodSelect(project, requestedPeriodId);
    if (selectedPeriod) {
      state.selectedAssignPeriodId = selectedPeriod.id;
    } else {
      state.selectedAssignPeriodId = "";
    }

    renderAssignEmployeeSelectors(projectId, preservedRows);

    if (!project) {
      if (els.assignStart) els.assignStart.value = "";
      if (els.assignEnd) els.assignEnd.value = "";
      updateAssignSummary(null);
      updateAvailabilityAnalysis();
      return;
    }

    const range = getAssignRangeForProject(project, state.selectedAssignPeriodId);
    if (els.assignStart) els.assignStart.value = range.start || "";
    if (els.assignEnd) els.assignEnd.value = range.end || "";
    updateAssignSummary(project);
    updateAvailabilityAnalysis();
  }

  function clearAssignForm() {
    if (els.assignProject) els.assignProject.value = "";
    if (els.assignPeriod) els.assignPeriod.innerHTML = "";
    if (els.assignPeriodWrap) els.assignPeriodWrap.classList.add("hidden");
    state.selectedAssignPeriodId = "";
    if (els.assignStart) els.assignStart.value = "";
    if (els.assignEnd) els.assignEnd.value = "";
    if (els.assignNotes) els.assignNotes.value = "";
    updateAssignSummary(null);
    renderAssignEmployeeSelectors("", []);
    updateAvailabilityAnalysis();
  }


  function getDefaultRoleForIndex(index) {
    return ROLE_OPTIONS[index] || ROLE_OPTIONS[ROLE_OPTIONS.length - 1] || "";
  }

  function getAssignRowsSnapshot() {
    if (!els.assignEmployeesWrap) return [];
    return Array.from(els.assignEmployeesWrap.querySelectorAll("[data-assign-row]")).map((row, index) => ({
      employee_name: row.querySelector("[data-assign-employee-select]")?.value || "",
      role: row.querySelector("[data-assign-role-select]")?.value || getDefaultRoleForIndex(index)
    }));
  }

  function getAssignAssignments() {
    return getAssignRowsSnapshot().filter(item => item.employee_name);
  }

  function updateAssignSummary(project) {
    if (!els.assignSummary) return;
    if (!project) {
      els.assignSummary.className = "rounded-[24px] border border-blue-200 bg-gradient-to-br from-blue-50 to-white px-5 py-4 text-sm text-slate-700 shadow-sm";
      els.assignSummary.innerHTML = `
        <div class="space-y-1">
          <div class="text-sm font-semibold text-slate-900">Velg et prosjekt</div>
          <div class="text-sm text-slate-600">Velg prosjekt og periode for å starte bemanning.</div>
        </div>
      `;
      return;
    }

    const required = Math.max(Number(project.headcount_required || 0), 0);
    const range = getAssignRangeForProject(project, state.selectedAssignPeriodId);
    const assigned = getAssignedCountForProjectRange(project.id, range.start, range.end);
    const remaining = Math.max(required - assigned, 0);
    const startLabel = range.start ? formatDate(range.start) : "ingen start";
    const endLabel = range.end ? formatDate(range.end) : "ingen slutt";
    const periods = getProjectAssignablePeriods(project);
    const periodIndex = range.usesMultiplePeriods
      ? Math.max(0, periods.findIndex(item => item.id === range.period?.id))
      : -1;
    const leadTone = required === 0
      ? "border-slate-200 from-slate-50 to-white"
      : assigned > required
        ? "border-amber-200 from-amber-50 to-white"
        : remaining === 0
          ? "border-green-200 from-green-50 to-white"
          : "border-blue-200 from-blue-50 to-white";

    let headline = `Bemannet: ${assigned} / ${required}`;
    let helper = required === 0
      ? "Dette prosjektet har ingen bemanningsplasser definert."
      : remaining === 0
        ? "Valgt periode er fullbemannet."
        : `Valgt periode har ${remaining} ledig${remaining === 1 ? " plass" : "e plasser"} igjen.`;

    if (assigned > required) {
      headline = `Overbemannet: ${assigned} / ${required}`;
      helper = `Valgt periode er overbemannet med ${assigned - required}.`;
    }

    const periodText = range.usesMultiplePeriods
      ? `Periode ${periodIndex + 1} av ${periods.length}`
      : "Hovedperiode";

    els.assignSummary.className = `rounded-[24px] border bg-gradient-to-br px-5 py-4 text-sm text-slate-700 shadow-sm ${leadTone}`;
    els.assignSummary.innerHTML = `
      <div class="space-y-4">
        <div>
          <div class="text-base font-semibold text-slate-950">${escapeHtml(project.name)}</div>
          <div class="mt-1 flex flex-wrap gap-2 text-xs">
            <span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">${escapeHtml(project.category || "Uten kategori")}</span>
            ${project.location ? `<span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">Kunde: ${escapeHtml(project.location)}</span>` : ""}
            ${project.project_responsible ? `<span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">Prosjektleder: ${escapeHtml(project.project_responsible)}</span>` : ""}
            <span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">${escapeHtml(project.status || "Uten status")}</span>
          </div>
        </div>
        <div class="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Valgt periode</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">${escapeHtml(periodText)}</div>
          <div class="mt-1 text-sm text-slate-600">${escapeHtml(startLabel)} – ${escapeHtml(endLabel)}</div>
        </div>
        <div class="flex items-end justify-between gap-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</div>
            <div class="mt-1 text-2xl font-semibold text-slate-950">${escapeHtml(headline)}</div>
            <div class="mt-1 text-sm text-slate-600">${escapeHtml(helper)}</div>
          </div>
          <div class="grid shrink-0 grid-cols-2 gap-2 text-center">
            <div class="rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <div class="text-[11px] uppercase tracking-wide text-slate-500">Behov</div>
              <div class="text-lg font-semibold text-slate-900">${required}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <div class="text-[11px] uppercase tracking-wide text-slate-500">Tildelt</div>
              <div class="text-lg font-semibold text-slate-900">${assigned}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }


  function renderAssignEmployeeSelectors(projectId = null, preservedRows = null) {
    if (!els.assignEmployeesWrap) return;
    const resolvedProjectId = projectId ?? (els.assignProject?.value || "");
    const project = getProjectById(resolvedProjectId);
    const activeEmployees = state.employees.filter(e => e.active !== false);
    const currentRows = Array.isArray(preservedRows) ? preservedRows : getAssignRowsSnapshot();

    if (!project) {
      els.assignEmployeesWrap.innerHTML = "";
      return;
    }

    const required = Math.max(Number(project?.headcount_required || 0), 0);
    const range = getAssignRangeForProject(project, state.selectedAssignPeriodId);
    const assigned = getAssignedCountForProjectRange(project.id, range.start, range.end);
    const remaining = Math.max(required - assigned, 0);
    const count = Math.max(remaining, currentRows.filter(item => item.employee_name || item.role).length, 0);

    if (required === 0) {
      els.assignEmployeesWrap.innerHTML = `<div class="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-500">Dette prosjektet har ingen bemanningsplasser definert.</div>`;
      return;
    }

    if (assigned > required) {
      els.assignEmployeesWrap.innerHTML = `<div class="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5 text-sm text-amber-800">Prosjektet er allerede overbemannet i valgt periode. Behov: ${required} • Tildelt: ${assigned}</div>`;
      return;
    }

    if (count === 0) {
      els.assignEmployeesWrap.innerHTML = `<div class="rounded-[24px] border border-green-200 bg-green-50 px-5 py-5 text-sm text-green-800">Prosjektet er fullbemannet i valgt periode. Ingen ledige plasser å fylle.</div>`;
      return;
    }

    const blocks = [];
    for (let i = 0; i < count; i++) {
      const selectedEmployee = currentRows[i]?.employee_name || "";
      const selectedRole = currentRows[i]?.role || getDefaultRoleForIndex(i);
      const employee = activeEmployees.find(emp => emp.name === selectedEmployee);
      const employeeOptions = ['<option value="">Velg ansatt</option>']
        .concat(activeEmployees.map(emp => `<option value="${escapeHtml(emp.name)}" ${emp.name === selectedEmployee ? "selected" : ""}>${escapeHtml(emp.name)}</option>`))
        .join("");
      const roleOptions = ROLE_OPTIONS.map(role => `<option value="${escapeHtml(role)}" ${role === selectedRole ? "selected" : ""}>${escapeHtml(role)}</option>`).join("");
      const groupLabel = employee ? normalizeEmployeeGroup(employee.employee_group || "") : "";

      blocks.push(`
        <div data-assign-row class="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 shadow-sm space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-slate-900">Bemanning ${i + 1}</div>
              <div class="mt-1 text-xs text-slate-500">Fyll inn rolle og ressurs for valgt periode.</div>
            </div>
            <span class="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">Plass ${i + 1}</span>
          </div>
          ${selectedEmployee ? `
            <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">${escapeHtml(getInitials(selectedEmployee))}</div>
              <div class="min-w-0">
                <div class="text-sm font-medium text-slate-900 truncate">${escapeHtml(selectedEmployee)}</div>
                <div class="mt-0.5 text-xs text-slate-500">${escapeHtml(getEmployeeGroupLabel(groupLabel) || "Ingen gruppe valgt")}${employee?.title ? ` • ${escapeHtml(employee.title)}` : ""}</div>
              </div>
            </div>
          ` : ""}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700">Ansatt</label>
              <select data-assign-employee-select class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm">${employeeOptions}</select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700">Rolle</label>
              <select data-assign-role-select class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm">${roleOptions}</select>
            </div>
          </div>
        </div>
      `);
    }

    els.assignEmployeesWrap.innerHTML = blocks.join("");
  }


  function analyzeAvailabilityForPeriod(projectId, startDate, endDate) {
    const available = [];
    const unavailable = [];

    if (!startDate || !endDate || startDate > endDate) {
      return {
        available,
        unavailable,
        summary: {
          valid: false,
          projectName: projectId ? (getProjectById(projectId)?.name || "Valgt prosjekt") : "Ingen prosjekt valgt",
          startDate,
          endDate
        }
      };
    }

    const activeEmployees = state.employees
      .filter(employee => employee.active !== false)
      .slice()
      .sort((a, b) => {
        const groupDiff = getEmployeeGroupSortIndex(a.employee_group) - getEmployeeGroupSortIndex(b.employee_group);
        if (groupDiff !== 0) return groupDiff;
        return a.name.localeCompare(b.name, "no");
      });

    for (const employee of activeEmployees) {
      const conflicts = (state.derived.entriesByEmployee.get(employee.name) || [])
        .filter(entry => overlaps(entry.start_date, entry.end_date, startDate, endDate))
        .filter(entry => !(projectId && entry.project_id === projectId))
        .map(entry => buildAvailabilityConflict(entry));

      const item = {
        id: employee.id,
        name: employee.name,
        title: employee.title || "",
        group: normalizeEmployeeGroup(employee.employee_group || ""),
        conflicts
      };

      if (conflicts.length) {
        unavailable.push(item);
      } else {
        available.push(item);
      }
    }

    return {
      available,
      unavailable,
      summary: {
        valid: true,
        projectName: projectId ? (getProjectById(projectId)?.name || "Valgt prosjekt") : "Ingen prosjekt valgt",
        startDate,
        endDate
      }
    };
  }

  function buildAvailabilityConflict(entry) {
    const project = getProjectById(entry.project_id);
    const category = String(project?.category || "").trim();
    const isAbsenceBlock = PERSONAL_BLOCK_TYPES.includes(category);
    const label = isAbsenceBlock ? category : (project?.name || "Ukjent prosjekt");

    return {
      label,
      startDate: entry.start_date,
      endDate: entry.end_date,
      role: entry.role || "",
      notes: entry.notes || "",
      isAbsenceBlock
    };
  }

  function updateAvailabilityAnalysis() {
    if (!els.availabilitySummary || !els.availabilityAvailableList || !els.availabilityUnavailableList) return;

    const projectId = els.assignProject?.value || "";
    const startDate = els.assignStart?.value || "";
    const endDate = els.assignEnd?.value || "";

    const analysis = analyzeAvailabilityForPeriod(projectId, startDate, endDate);
    state.availability.available = analysis.available;
    state.availability.unavailable = analysis.unavailable;
    state.availability.summary = analysis.summary;
    renderAvailabilityPanel();
  }

  function renderAvailabilityPanel() {
    if (!els.availabilitySummary || !els.availabilityAvailableList || !els.availabilityUnavailableList) return;

    const summary = state.availability.summary;
    if (!summary || !summary.valid) {
      if (els.availabilitySummary) {
        els.availabilitySummary.className = "rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 shadow-sm";
        els.availabilitySummary.innerHTML = `
          <div class="space-y-1">
            <div class="text-sm font-semibold text-slate-900">Ingen analyse kjørt</div>
            <div class="text-sm text-slate-600">Velg prosjekt og gyldig fra/til-dato for å analysere tilgjengelighet.</div>
          </div>
        `;
      }
      els.availabilityAvailableList.innerHTML = `<div class="rounded-2xl border border-dashed border-green-200 bg-white/80 px-4 py-5 text-sm text-slate-500">Ingen analyse kjørt.</div>`;
      els.availabilityUnavailableList.innerHTML = `<div class="rounded-2xl border border-dashed border-rose-200 bg-white/80 px-4 py-5 text-sm text-slate-500">Ingen analyse kjørt.</div>`;
      if (els.availabilityAvailableCount) els.availabilityAvailableCount.textContent = "";
      if (els.availabilityUnavailableCount) els.availabilityUnavailableCount.textContent = "";
      return;
    }

    if (els.availabilitySummary) {
      els.availabilitySummary.className = "rounded-[24px] border border-blue-200 bg-gradient-to-br from-blue-50 to-white px-5 py-4 text-sm text-slate-700 shadow-sm";
      els.availabilitySummary.innerHTML = `
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="text-base font-semibold text-slate-950">${escapeHtml(summary.projectName)}</div>
            <div class="mt-1 text-sm text-slate-600">${escapeHtml(formatDate(summary.startDate))} – ${escapeHtml(formatDate(summary.endDate))}</div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="rounded-2xl border border-green-200 bg-white px-3 py-2">
              <div class="text-[11px] uppercase tracking-wide text-slate-500">Tilgjengelige</div>
              <div class="text-lg font-semibold text-green-700">${state.availability.available.length}</div>
            </div>
            <div class="rounded-2xl border border-rose-200 bg-white px-3 py-2">
              <div class="text-[11px] uppercase tracking-wide text-slate-500">Ikke tilgjengelige</div>
              <div class="text-lg font-semibold text-rose-700">${state.availability.unavailable.length}</div>
            </div>
          </div>
        </div>
      `;
    }

    if (els.availabilityAvailableCount) els.availabilityAvailableCount.textContent = `${state.availability.available.length} stk`;
    if (els.availabilityUnavailableCount) els.availabilityUnavailableCount.textContent = `${state.availability.unavailable.length} stk`;

    els.availabilityAvailableList.innerHTML = state.availability.available.length
      ? state.availability.available.map(employee => `
        <div class="rounded-2xl border border-green-200 bg-white px-4 py-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">${escapeHtml(getInitials(employee.name))}</div>
            <div class="min-w-0">
              <div class="font-medium text-slate-900 truncate">${escapeHtml(employee.name)}</div>
              <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(getEmployeeGroupLabel(employee.group) || "Ingen gruppe valgt")}${employee.title ? ` • ${escapeHtml(employee.title)}` : ""}</div>
            </div>
          </div>
          <div class="mt-3 inline-flex rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">Tilgjengelig i valgt periode</div>
        </div>
      `).join("")
      : `<div class="rounded-2xl border border-dashed border-green-200 bg-white/80 px-4 py-5 text-sm text-slate-500">Ingen tilgjengelige ansatte i valgt periode.</div>`;

    const conflictTone = (conflict) => {
      if (conflict.isAbsenceBlock) {
        if (conflict.label === "Ferie") return 'border-orange-200 bg-orange-50 text-orange-700';
        if (conflict.label === "Syk") return 'border-red-200 bg-red-50 text-red-700';
        if (conflict.label === "Kurs") return 'border-violet-200 bg-violet-50 text-violet-700';
        if (conflict.label === "Avspasering") return 'border-amber-200 bg-amber-50 text-amber-700';
      }
      return 'border-rose-200 bg-rose-50 text-rose-700';
    };

    els.availabilityUnavailableList.innerHTML = state.availability.unavailable.length
      ? state.availability.unavailable.map(employee => `
        <div class="rounded-2xl border border-rose-200 bg-white px-4 py-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">${escapeHtml(getInitials(employee.name))}</div>
            <div class="min-w-0">
              <div class="font-medium text-slate-900 truncate">${escapeHtml(employee.name)}</div>
              <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(getEmployeeGroupLabel(employee.group) || "Ingen gruppe valgt")}${employee.title ? ` • ${escapeHtml(employee.title)}` : ""}</div>
            </div>
          </div>
          <div class="mt-3 space-y-2">
            ${employee.conflicts.map(conflict => `
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full border px-2.5 py-1 text-xs font-medium ${conflictTone(conflict)}">${escapeHtml(conflict.isAbsenceBlock ? conflict.label : 'Opptatt i prosjekt')}</span>
                  <span class="text-xs text-slate-500">${escapeHtml(formatDate(conflict.startDate))} – ${escapeHtml(formatDate(conflict.endDate))}</span>
                </div>
                <div class="mt-2 text-sm font-medium text-slate-800">${escapeHtml(conflict.label)}</div>
                ${conflict.role && !conflict.isAbsenceBlock ? `<div class="mt-1 text-xs text-slate-500">Rolle: ${escapeHtml(conflict.role)}</div>` : ""}
                ${conflict.notes ? `<div class="mt-1 text-xs text-slate-500">${escapeHtml(conflict.notes)}</div>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")
      : `<div class="rounded-2xl border border-dashed border-rose-200 bg-white/80 px-4 py-5 text-sm text-slate-500">Ingen konflikter i valgt periode.</div>`;
  }


  function canSeePersonalBlockType(type) {
    if (type !== "Syk") return true;
    return canEditApp();
  }

  function getPersonalBlockTypeOptions() {
    return Array.from(new Set([...(PERSONAL_BLOCK_TYPES || []), "Travel"]));
  }

  function getVisiblePersonalBlockTypes() {
    return getPersonalBlockTypeOptions().filter(canSeePersonalBlockType);
  }

  function getVisibleEntriesForEmployee(employeeName, rangeStart, rangeEnd) {
    return (state.derived.entriesByEmployee.get(employeeName) || []).filter(entry => {
      if (!overlaps(entry.start_date, entry.end_date, rangeStart, rangeEnd)) return false;
      const project = getProjectById(entry.project_id);
      if (isSystemPersonalProject(project) && !canSeePersonalBlockType(project.category)) return false;
      return true;
    });
  }

  function openCalendarContextMenu(employeeName, isoDate, x, y) {
    if (!canEditApp() || !els.calendarContextMenu) return;
    // Hard stop: personalblokker skal ikke kunne åpnes mens prosjekt-spotlight er aktiv.
    // Brukeren må først trykke Nullstill fokus.
    if (state.projectSpotlightId || getProjectSpotlightProject()) return;

    state.contextMenu = {
      visible: true,
      employeeName,
      startDate: isoDate,
      endDate: isoDate,
      x,
      y
    };

    if (els.contextMenuEmployee) els.contextMenuEmployee.textContent = employeeName;
    if (els.contextMenuStart) els.contextMenuStart.value = isoDate;
    if (els.contextMenuEnd) els.contextMenuEnd.value = isoDate;
    fillSelect(els.contextMenuType, getPersonalBlockTypeOptions());
    if (els.contextMenuType) els.contextMenuType.value = "Ferie";
    if (els.contextMenuNotes) els.contextMenuNotes.value = "";

    const menu = els.calendarContextMenu;
    normalizeCalendarContextMenuElement();
    menu.classList.remove("hidden");
    menu.style.setProperty("display", "block", "important");
    menu.style.setProperty("position", "fixed", "important");
    menu.style.setProperty("z-index", "2147483647", "important");

    const menuWidth = 320;
    const menuHeight = Math.min(520, window.innerHeight - 24);
    const maxLeft = Math.max(12, window.innerWidth - menuWidth - 12);
    const maxTop = Math.max(12, window.innerHeight - menuHeight - 12);
    menu.style.setProperty("left", `${Math.min(Math.max(12, x), maxLeft)}px`, "important");
    menu.style.setProperty("top", `${Math.min(Math.max(12, y), maxTop)}px`, "important");
  }

  function hideCalendarContextMenu() {
    state.contextMenu.visible = false;
    if (!els.calendarContextMenu) return;
    els.calendarContextMenu.classList.add("hidden");
    els.calendarContextMenu.style.setProperty("display", "none", "important");
  }

  function handleGlobalPointerClose(event) {
    if (!state.contextMenu.visible) return;
    if (els.calendarContextMenu?.contains(event.target)) return;
    hideCalendarContextMenu();
  }

  async function createContextMenuPersonalBlockEntry() {
    const employeeName = state.contextMenu.employeeName;
    const startDate = els.contextMenuStart?.value || state.contextMenu.startDate;
    const endDate = els.contextMenuEnd?.value || state.contextMenu.endDate;
    const type = els.contextMenuType?.value || "Ferie";
    const notes = els.contextMenuNotes?.value?.trim() || "";
    if (!employeeName || !startDate || !endDate || !type) return;
    if (startDate > endDate) {
      alert("Startdato kan ikke være etter sluttdato.");
      return;
    }

    hideCalendarContextMenu();

    if (els.personalBlockEmployee) els.personalBlockEmployee.value = employeeName;
    if (els.personalBlockType) els.personalBlockType.value = type;
    if (els.personalBlockStart) els.personalBlockStart.value = startDate;
    if (els.personalBlockEnd) els.personalBlockEnd.value = endDate;
    if (els.personalBlockNotes) els.personalBlockNotes.value = notes;

    await createPersonalBlockEntry();
  }

  function isPersonalBlockType(value) {
    return PERSONAL_BLOCK_TYPES.includes(value);
  }

  function isSystemPersonalProject(project) {
    return !!project && project.notes === PERSONAL_PROJECT_MARKER && isPersonalBlockType(project.category);
  }

  function getVisibleProjects() {
    return state.projects.filter(project => !isSystemPersonalProject(project));
  }

  function getProjectsForCurrentListFilter() {
    const visibleProjects = getVisibleProjects().slice().sort((a, b) => compareProjectDates(a, b));
    if (state.projectListFilter === "unstaffed") {
      return visibleProjects.filter(project => getProjectAssignedCount(project.id) === 0);
    }
    return visibleProjects;
  }

  function openProjectListView(filter = "all") {
    state.projectListFilter = filter === "unstaffed" ? "unstaffed" : "all";
    setActiveTab("projects");
    renderProjects();
    if (els.projectList) {
      els.projectList.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openProjectCalendarView(filter = "all") {
    state.calendarMode = "project";
    state.projectListFilter = filter === "unstaffed" ? "unstaffed" : "all";
    state.projectSpotlightId = "";
    state.projectSearchReturnStartDate = null;
    state.calendarPanelOpen = false;
    state.focusProjectId = "";
    if (els.calendarMode) els.calendarMode.value = "project";
    updateCalendarSearchControls();
    persistUiState();
    setActiveTab("calendar");
    renderStats();
    renderCalendarPanel();
    renderCalendar();
  }

  function clearDashboardEmployeeFilter() {
    state.dashboardEmployeeFilter = "";
    state.dashboardEmployeeFilterLabel = "";
    renderCalendar();
  }

  function openDashboardEmployeeFilter(filterType, label) {
    state.dashboardEmployeeFilter = filterType;
    state.dashboardEmployeeFilterLabel = label || "";
    state.calendarMode = "personal";
    state.projectSearchReturnStartDate = null;
    state.projectListFilter = "all";
    state.calendarPanelOpen = false;
    state.focusProjectId = "";
    resetProjectInspectorFilters();
    if (els.calendarMode) els.calendarMode.value = "personal";
    updateCalendarSearchControls();
    persistUiState();
    setActiveTab("calendar");
    renderStats();
    renderCalendarPanel();
    renderCalendar();
  }

  function openPersonalCalendarView() {
    state.dashboardEmployeeFilter = "";
    state.dashboardEmployeeFilterLabel = "";
    state.calendarMode = "personal";
    state.projectListFilter = "all";
    state.calendarPanelOpen = false;
    state.focusProjectId = "";
    resetProjectInspectorFilters();
    if (els.calendarMode) els.calendarMode.value = "personal";
    updateCalendarSearchControls();
    persistUiState();
    setActiveTab("calendar");
    renderStats();
    renderCalendarPanel();
    renderCalendar();
  }

  function getProjectCalendarItems() {
    const baseProjects = state.projectListFilter === "unstaffed"
      ? getUnstaffedProjectsForCurrentCalendarRange()
      : getVisibleProjects().slice();

    return baseProjects.filter(project => {
      const phaseMatch = projectMatchesPhaseFilter(project);
      const search = String(state.search || "").trim().toLowerCase();
      const searchMatch = !search || getProjectSearchableText(project).includes(search);
      return phaseMatch && searchMatch;
    });
  }

  async function ensurePersonalProject(type) {
    let project = state.projects.find(item => isSystemPersonalProject(item) && item.category === type);
    if (project) return { ok: true, project };

    project = {
      id: crypto.randomUUID(),
      name: `System • ${type}`,
      category: type,
      status: "Planlagt",
      planned_start_date: null,
      planned_end_date: null,
      location: "",
      headcount_required: 0,
      notes: PERSONAL_PROJECT_MARKER
    };

    state.projects.push(project);
    rebuildDerivedState();

    const result = await saveRow("planner_projects", project);
    if (!result.ok) {
      state.projects = state.projects.filter(item => item.id !== project.id);
      rebuildDerivedState();
      return { ok: false, error: result.error || new Error("Kunne ikke opprette systemprosjekt.") };
    }

    return { ok: true, project };
  }

  function clearPersonalBlockForm() {
    if (els.personalBlockEmployee) els.personalBlockEmployee.value = "";
    if (els.personalBlockType) els.personalBlockType.value = getPersonalBlockTypeOptions()[0] || "";
    if (els.personalBlockStart) els.personalBlockStart.value = "";
    if (els.personalBlockEnd) els.personalBlockEnd.value = "";
    if (els.personalBlockNotes) els.personalBlockNotes.value = "";
  }

  async function createPersonalBlockEntry() {
    if (!canEditApp()) return;

    const employeeName = els.personalBlockEmployee?.value || "";
    const type = els.personalBlockType?.value || "";
    const startDate = els.personalBlockStart?.value || "";
    const endDate = els.personalBlockEnd?.value || "";
    const notes = els.personalBlockNotes?.value?.trim() || "";

    if (!employeeName || !type || !startDate || !endDate) {
      alert("Velg ansatt, type og start/slutt.");
      return;
    }

    if (startDate > endDate) {
      alert("Startdato kan ikke være etter sluttdato.");
      return;
    }

    const ensured = await ensurePersonalProject(type);
    if (!ensured.ok || !ensured.project) {
      renderAll();
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      project_id: ensured.project.id,
      employee_name: employeeName,
      role: "Supervisor",
      start_date: startDate,
      end_date: endDate,
      notes
    };

    state.entries.push(entry);
    rebuildDerivedState();
    renderAll();

    const result = await saveRow("planner_entries", entry);
    if (!result.ok) {
      state.entries = state.entries.filter(item => item.id !== entry.id);
      rebuildDerivedState();
      renderAll();
      alert(`Kunne ikke lagre tildelingen: ${result.error?.message || "ukjent feil"}`);
      return;
    }

    clearPersonalBlockForm();
    renderAll();
    void addAudit(`La inn ${type.toLowerCase()} direkte på ${employeeName}`);
  }


function getEntryOverlapConflicts(candidateEntry, excludeEntryId = null) {
  if (!candidateEntry?.employee_name || !candidateEntry?.start_date || !candidateEntry?.end_date) return [];
  return state.entries.filter(other =>
    other &&
    other.id !== excludeEntryId &&
    other.employee_name === candidateEntry.employee_name &&
    overlaps(candidateEntry.start_date, candidateEntry.end_date, other.start_date, other.end_date)
  );
}

function getEntryConflictSummary(candidateEntry, conflicts) {
  const project = getProjectById(candidateEntry.project_id);
  const targetName = candidateEntry.employee_name || "Ansatt";
  const lines = conflicts.slice(0, 6).map(conflict => {
    const conflictProject = getProjectById(conflict.project_id);
    return `${displayProjectName(conflictProject) || "Ukjent aktivitet"} (${conflict.start_date} – ${conflict.end_date})`;
  });
  const header = `${targetName} kan ikke legges inn på ${displayProjectName(project) || "valgt prosjekt"} i perioden ${candidateEntry.start_date} – ${candidateEntry.end_date}.`;
  return `${header}\nKonflikt med:\n- ${lines.join("\n- ")}`;
}

function hasIllegalEntryOverlap(candidateEntry, excludeEntryId = null) {
  return getEntryOverlapConflicts(candidateEntry, excludeEntryId).length > 0;
}

function entryHasVisibleConflict(entry) {
  return hasIllegalEntryOverlap(entry, entry.id);
}


async function createEntry() {
  if (!canEditApp()) return;
  const projectId = els.assignProject.value;
  const assignments = getAssignAssignments();
  const employeeNames = assignments.map(item => item.employee_name);
  const uniqueEmployeeNames = [...new Set(employeeNames)];
  const notes = els.assignNotes.value.trim();

  if (!projectId || !uniqueEmployeeNames.length) {
    alert("Fyll ut prosjekt og minst én ansatt.");
    return;
  }

  if (uniqueEmployeeNames.length !== employeeNames.length) {
    alert("Samme ansatt kan ikke velges flere ganger i samme bemanning.");
    return;
  }

  const project = getProjectById(projectId);
  if (!project) {
    alert("Prosjekt finnes ikke.");
    return;
  }

  const selectedPeriodId = els.assignPeriod?.value || state.selectedAssignPeriodId || "";
  const resolvedRange = getAssignRangeForProject(project, selectedPeriodId);
  let startDate = resolvedRange.start || els.assignStart.value || project.planned_start_date || "";
  let endDate = resolvedRange.end || els.assignEnd.value || project.planned_end_date || "";

  if (!startDate || !endDate) {
    alert("Prosjekt eller tildeling mangler start/slutt.");
    return;
  }

  if (startDate > endDate) {
    alert("Startdato kan ikke være etter sluttdato.");
    return;
  }

  const uniqueAssignments = assignments.filter((item, index) =>
    item.employee_name && employeeNames.indexOf(item.employee_name) === index
  );

  const newEntries = uniqueAssignments.map(item => ({
    id: crypto.randomUUID(),
    project_id: projectId,
    employee_name: item.employee_name,
    role: item.role,
    start_date: startDate,
    end_date: endDate,
    notes
  }));

  for (const newEntry of newEntries) {
    const conflicts = getEntryOverlapConflicts(newEntry);
    if (conflicts.length) {
      alert(getEntryConflictSummary(newEntry, conflicts));
      return;
    }
  }

  state.entries.push(...newEntries);
  rebuildDerivedState();
  const result = await saveRows("planner_entries", newEntries);
  if (!result.ok) {
    const ids = new Set(newEntries.map(entry => entry.id));
    state.entries = state.entries.filter(e => !ids.has(e.id));
    rebuildDerivedState();
    renderAll();
    return;
  }

  clearAssignForm();
  renderAll();

  void addAudit(`La inn ${newEntries.length} tildeling${newEntries.length > 1 ? "er" : ""} på ${project.name}`);
  newEntries.forEach(entry => void addNotification(entry.employee_name, project.name));
}

function openEditModal(entryId) {
    if (!canEditApp()) return;
    state.selectedEntryId = entryId;
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;

    fillSelect(els.editProject, state.projects, entry.project_id, "name", "id");
    fillSelect(els.editEmployee, state.employees.filter(e => e.active !== false), entry.employee_name, "name", "name");
    fillSelect(els.editRole, ROLE_OPTIONS, entry.role);

    els.editStart.value = entry.start_date;
    els.editEnd.value = entry.end_date;
    els.editNotes.value = entry.notes || "";

    els.editModal.classList.remove("hidden");
    els.editModal.classList.add("flex");
  }

  function closeEditModal() {
    state.selectedEntryId = null;
    els.editModal.classList.add("hidden");
    els.editModal.classList.remove("flex");
    flushPendingRemoteRefresh();
  }


async function saveEditedEntry() {
  if (!canEditApp()) return;
  const entry = state.entries.find(e => e.id === state.selectedEntryId);
  if (!entry) return;

  if (els.editStart.value > els.editEnd.value) {
    alert("Startdato kan ikke være etter sluttdato.");
    return;
  }

  const previous = {
    project_id: entry.project_id,
    employee_name: entry.employee_name,
    role: entry.role,
    start_date: entry.start_date,
    end_date: entry.end_date,
    notes: entry.notes
  };

  entry.project_id = els.editProject.value;
  entry.employee_name = els.editEmployee.value;
  entry.role = els.editRole.value;
  entry.start_date = els.editStart.value;
  entry.end_date = els.editEnd.value;
  entry.notes = els.editNotes.value.trim();

  const conflicts = getEntryOverlapConflicts(entry, entry.id);
  if (conflicts.length) {
    Object.assign(entry, previous);
    alert(getEntryConflictSummary({ ...entry, ...previous }, conflicts));
    return;
  }

  rebuildDerivedState();

  const result = await saveRow("planner_entries", entry);
  if (!result.ok) {
    Object.assign(entry, previous);
    rebuildDerivedState();
    renderAll();
    return;
  }

  const project = getProjectById(entry.project_id);
  closeEditModal();
  renderAll();
  void addAudit(`Redigerte tildeling: ${entry.employee_name} → ${displayProjectName(project) || "Ukjent prosjekt"}`);
}

async function deleteEditedEntry() {
    if (!canEditApp()) return;
    const entry = state.entries.find(e => e.id === state.selectedEntryId);
    if (!entry) return;
    if (!confirm("Vil du fjerne denne tildelingen?")) return;

    state.entries = state.entries.filter(e => e.id !== state.selectedEntryId);
    rebuildDerivedState();
    const result = await deleteRow("planner_entries", state.selectedEntryId);
    if (!result.ok) {
      state.entries.push(entry);
      rebuildDerivedState();
      renderAll();
      return;
    }

    const project = getProjectById(entry.project_id);
    closeEditModal();
    renderAll();
    void addAudit(`Slettet tildeling: ${entry.employee_name} → ${displayProjectName(project) || "Ukjent prosjekt"}`);
  }

  function normalizeProjectPeriods(value) {
    let periods = value;
    if (typeof periods === "string") {
      try {
        periods = JSON.parse(periods);
      } catch (_) {
        periods = [];
      }
    }

    if (!Array.isArray(periods)) return [];

    return periods
      .map((period, index) => ({
        id: period?.id || `period_${index + 1}`,
        start: String(period?.start || period?.start_date || "").trim(),
        end: String(period?.end || period?.end_date || "").trim()
      }))
      .filter(period => period.start || period.end);
  }

  function getProjectTimelinePeriods(project) {
    if (!project) return [];

    if (!projectHasActiveFieldPhase(project)) {
      return [];
    }

    const periods = normalizeProjectPeriods(project?.project_periods_json || []);
    if (project?.has_multiple_periods && periods.length) {
      return periods
        .filter(period => period.start && period.end)
        .slice()
        .sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
    }

    if (project.planned_start_date && project.planned_end_date) {
      return [{
        id: project.id,
        start: project.planned_start_date,
        end: project.planned_end_date
      }];
    }

    return [];
  }

  function getDefaultWorkshopPeriodForProject(project, fieldPeriods = null) {
    if (!project || isSystemPersonalProject(project) || isCancelledProject(project)) return null;
    if (project.workshop_enabled === false) return null;

    const periods = (fieldPeriods || getProjectTimelinePeriods(project) || [])
      .filter(period => period?.start && period?.end)
      .slice()
      .sort((a, b) => String(a.start).localeCompare(String(b.start)));

    const storedStart = project.workshop_start_date || "";
    const storedEnd = project.workshop_end_date || "";
    let workshopStart = storedStart;
    let workshopEnd = storedEnd;

    if (!workshopStart || !workshopEnd) {
      if (!periods.length) return null;
      const fieldStart = asLocalDate(periods[0].start);
      if (!fieldStart) return null;
      workshopStart = toIsoDate(addDays(fieldStart, -14));
      workshopEnd = toIsoDate(addDays(fieldStart, -1));
    }

    if (!workshopStart || !workshopEnd || workshopStart > workshopEnd) return null;

    return {
      id: `${project.id}__workshop`,
      start: workshopStart,
      end: workshopEnd,
      phase: "workshop",
      phaseLabel: "Workshop / mobilisering",
      required: project.workshop_headcount_required === 0 ? 0 : Number(project.workshop_headcount_required || 2),
      generated: !storedStart || !storedEnd
    };
  }

  function getProjectTimelinePeriodsWithWorkshop(project) {
    const fieldPeriods = getProjectTimelinePeriods(project).map(period => ({
      ...period,
      phase: "field",
      phaseLabel: "Feltoppdrag"
    }));
    const workshopPeriod = getDefaultWorkshopPeriodForProject(project, fieldPeriods);
    return [
      ...(workshopPeriod ? [workshopPeriod] : []),
      ...fieldPeriods
    ].filter(period => period.start && period.end)
      .sort((a, b) => String(a.start).localeCompare(String(b.start)) || String(a.end).localeCompare(String(b.end)));
  }

  function getDefaultWorkshopDraftFromFieldStart(fieldStartValue) {
    if (!fieldStartValue) return { start: "", end: "", headcount: 2 };
    const fieldStart = asLocalDate(fieldStartValue);
    if (!fieldStart) return { start: "", end: "", headcount: 2 };
    return {
      start: toIsoDate(addDays(fieldStart, -14)),
      end: toIsoDate(addDays(fieldStart, -1)),
      headcount: 2
    };
  }

  function applyDefaultWorkshopDraft(force = false) {
    if (!els.projectWorkshopStart || !els.projectWorkshopEnd || !els.projectWorkshopHeadcount) return;
    if (!force && (els.projectWorkshopStart.value || els.projectWorkshopEnd.value)) return;
    const draft = getDefaultWorkshopDraftFromFieldStart(els.projectPlannedStart?.value || "");
    els.projectWorkshopStart.value = draft.start || "";
    els.projectWorkshopEnd.value = draft.end || "";
    if (!els.projectWorkshopHeadcount.value || force) {
      els.projectWorkshopHeadcount.value = String(draft.headcount || 2);
    }
  }

  function setWorkshopModalEnabled(enabled, applyDefault = false) {
    const isEnabled = Boolean(enabled);
    if (els.projectWorkshopEnabled) els.projectWorkshopEnabled.checked = isEnabled;

    if (applyDefault && isEnabled) {
      applyDefaultWorkshopDraft(true);
    }

    [els.projectWorkshopStart, els.projectWorkshopEnd, els.projectWorkshopHeadcount].forEach(input => {
      if (!input) return;
      input.disabled = !isEnabled;
      input.classList.toggle("opacity-50", !isEnabled);
      input.classList.toggle("bg-slate-100", !isEnabled);
    });

    if (!isEnabled) {
      if (els.projectWorkshopStart) els.projectWorkshopStart.value = "";
      if (els.projectWorkshopEnd) els.projectWorkshopEnd.value = "";
      if (els.projectWorkshopHeadcount) els.projectWorkshopHeadcount.value = "0";
    } else if (els.projectWorkshopHeadcount && (!els.projectWorkshopHeadcount.value || Number(els.projectWorkshopHeadcount.value) <= 0)) {
      els.projectWorkshopHeadcount.value = "2";
    }
  }


  function createEmptyProjectPeriod() {
    return {
      id: crypto.randomUUID(),
      start: "",
      end: ""
    };
  }

  function setProjectMultiplePeriodsUiState() {
    if (!els.projectHasMultiplePeriods || !els.projectPeriodsSection) return;
    const enabled = !!els.projectHasMultiplePeriods.checked;
    els.projectPeriodsSection.classList.toggle("hidden", !enabled);
  }

  function renderProjectPeriodsEditor() {
    if (!els.projectPeriodsList) return;
    const periods = state.projectModalPeriods || [];

    if (!periods.length) {
      els.projectPeriodsList.innerHTML = `<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">Ingen perioder lagt inn ennå.</div>`;
      return;
    }

    els.projectPeriodsList.innerHTML = periods.map((period, index) => `
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-3" data-project-period-row data-period-id="${escapeHtml(period.id)}">
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm font-medium text-slate-700">Periode ${index + 1}</div>
          <button type="button" data-remove-project-period data-period-id="${escapeHtml(period.id)}" class="rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm">Fjern</button>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <input type="date" data-project-period-start data-period-id="${escapeHtml(period.id)}" value="${escapeHtml(period.start || "")}" class="rounded-2xl border border-slate-300 px-3 py-2 bg-white" />
          <input type="date" data-project-period-end data-period-id="${escapeHtml(period.id)}" value="${escapeHtml(period.end || "")}" class="rounded-2xl border border-slate-300 px-3 py-2 bg-white" />
        </div>
      </div>
    `).join("");
  }

  function updateProjectPeriodDraft(periodId, field, value) {
    state.projectModalPeriods = (state.projectModalPeriods || []).map(period =>
      period.id === periodId ? { ...period, [field]: value } : period
    );
  }

  function addProjectPeriodDraft() {
    state.projectModalPeriods = [...(state.projectModalPeriods || []), createEmptyProjectPeriod()];
    renderProjectPeriodsEditor();
  }

  function removeProjectPeriodDraft(periodId) {
    state.projectModalPeriods = (state.projectModalPeriods || []).filter(period => period.id !== periodId);
    renderProjectPeriodsEditor();
  }

  function validateProjectPeriods(periods) {
    const normalized = normalizeProjectPeriods(periods);
    if (!normalized.length) {
      return { ok: false, message: "Legg inn minst én periode." };
    }

    for (const period of normalized) {
      if (!period.start || !period.end) {
        return { ok: false, message: "Alle perioder må ha start- og sluttdato." };
      }
      if (period.start > period.end) {
        return { ok: false, message: "En periode har sluttdato før startdato." };
      }
    }

    const sorted = normalized.slice().sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start <= sorted[i - 1].end) {
        return { ok: false, message: "Prosjektperioder kan ikke overlappe hverandre." };
      }
    }

    return { ok: true, periods: sorted };
  }

  function openProjectModal(projectId = null) {
    if (!canEditApp()) return;
    state.selectedProjectId = projectId;
    const project = state.projects.find(p => p.id === projectId);

    els.projectModalTitle.textContent = project ? (window.izomaxTranslateKey?.("editProject") || "Rediger prosjekt") : (window.izomaxTranslateKey?.("newProject") || "Nytt prosjekt");
    els.projectName.value = project?.name || "";
    if (els.projectCategory) els.projectCategory.value = "Offshore";
    fillSelect(els.projectStatus, PROJECT_STATUS_OPTIONS, normalizeProjectStatus(project?.status || "Planlagt"));
    els.projectPlannedStart.value = project?.planned_start_date || "";
    els.projectPlannedEnd.value = project?.planned_end_date || "";
    if (els.projectHasMultiplePeriods) {
      els.projectHasMultiplePeriods.checked = Boolean(project?.has_multiple_periods);
    }
    if (els.projectWorkshopEnabled) {
      els.projectWorkshopEnabled.checked = project?.workshop_enabled !== false;
    }
    const workshopDraft = getDefaultWorkshopDraftFromFieldStart(project?.planned_start_date || "");
    if (els.projectWorkshopStart) els.projectWorkshopStart.value = project?.workshop_start_date || workshopDraft.start || "";
    if (els.projectWorkshopEnd) els.projectWorkshopEnd.value = project?.workshop_end_date || workshopDraft.end || "";
    if (els.projectWorkshopHeadcount) els.projectWorkshopHeadcount.value = project?.workshop_headcount_required ?? 2;
    setWorkshopModalEnabled(project?.workshop_enabled !== false, false);
    state.projectModalPeriods = normalizeProjectPeriods(project?.project_periods_json || []);
    if (els.projectResponsible) els.projectResponsible.value = project?.project_responsible || "";
    els.projectLocation.value = project?.location || "";
    els.projectHeadcount.value = project?.headcount_required ?? "";
    els.projectNotes.value = project?.notes || "";
    els.deleteProjectBtn.style.display = project ? "inline-flex" : "none";
    setProjectMultiplePeriodsUiState();
    renderProjectPeriodsEditor();

    els.projectModal.classList.remove("hidden");
    els.projectModal.classList.add("flex");
    window.izomaxApplyLanguage?.();
  }

  function closeProjectModal() {
    state.selectedProjectId = null;
    state.projectModalPeriods = [];
    els.projectModal.classList.add("hidden");
    els.projectModal.classList.remove("flex");
    els.projectModal.classList.remove("iz-workbench-project-edit");
    els.projectModal.removeAttribute("data-opened-from-workbench");
    ["position", "z-index", "inset"].forEach(prop => els.projectModal.style.removeProperty(prop));
    flushPendingRemoteRefresh();
  }

  async function saveProjectFromModal() {
    if (!canEditApp()) return;
    const name = els.projectName.value.trim();
    const category = "Offshore";
    const status = normalizeProjectStatus(els.projectStatus.value);
    const singlePlannedStart = els.projectPlannedStart.value;
    const singlePlannedEnd = els.projectPlannedEnd.value;
    const hasMultiplePeriods = Boolean(els.projectHasMultiplePeriods?.checked);
    const projectResponsible = els.projectResponsible?.value?.trim() || "";
    const location = els.projectLocation.value.trim();
    const headcountRequired = Number(els.projectHeadcount.value || 0);
    const workshopEnabled = els.projectWorkshopEnabled ? Boolean(els.projectWorkshopEnabled.checked) : true;
    const workshopStartDate = els.projectWorkshopStart?.value || "";
    const workshopEndDate = els.projectWorkshopEnd?.value || "";
    const workshopHeadcountRequired = workshopEnabled ? Number(els.projectWorkshopHeadcount?.value || 0) : 0;
    const notes = els.projectNotes.value.trim();

    if (!name) {
      alert("Legg inn prosjektnavn.");
      return;
    }

    if (headcountRequired < 0) {
      alert("Ressursbehov i felt kan ikke være negativt.");
      return;
    }

    if (workshopEnabled) {
      if (!workshopStartDate || !workshopEndDate) {
        alert("Legg inn start/slutt for workshopfasen, eller deaktiver workshopfasen.");
        return;
      }
      if (workshopStartDate > workshopEndDate) {
        alert("Workshop start kan ikke være etter workshop slutt.");
        return;
      }
      if (workshopHeadcountRequired < 0) {
        alert("Workshop ressursbehov kan ikke være negativt.");
        return;
      }
    }

    let plannedStart = singlePlannedStart;
    let plannedEnd = singlePlannedEnd;
    let projectPeriods = [];

    if (hasMultiplePeriods) {
      const validation = validateProjectPeriods(state.projectModalPeriods || []);
      if (!validation.ok) {
        alert(validation.message);
        return;
      }
      projectPeriods = validation.periods;
      plannedStart = projectPeriods[0]?.start || "";
      plannedEnd = projectPeriods[projectPeriods.length - 1]?.end || "";
    } else if (plannedStart && plannedEnd && plannedStart > plannedEnd) {
      alert("Planlagt start kan ikke være etter planlagt slutt.");
      return;
    }

    const duplicate = getVisibleProjects().find(p =>
      p.name.toLowerCase() === name.toLowerCase() && p.id !== state.selectedProjectId
    );
    if (duplicate) {
      alert("Et prosjekt med dette navnet finnes allerede.");
      return;
    }

    let project = state.projects.find(p => p.id === state.selectedProjectId);
    const isExistingProject = Boolean(project);
    const willCancelProject = status === "Kansellert";
    const entriesToRemoveOnCancel = project
      ? state.entries.filter(entry => entry.project_id === project.id)
      : [];

    if (willCancelProject && entriesToRemoveOnCancel.length) {
      const confirmed = confirm(
        `Prosjektet settes til Kansellert. Dette fjerner ${entriesToRemoveOnCancel.length} tildeling${entriesToRemoveOnCancel.length === 1 ? "" : "er"} fra ansattplanen. Prosjektet blir fortsatt liggende i prosjektplanen. Fortsette?`
      );
      if (!confirmed) return;
    }

    if (project) {
      project.name = name;
      project.category = category;
      project.status = status;
      project.planned_start_date = plannedStart || null;
      project.planned_end_date = plannedEnd || null;
      project.has_multiple_periods = hasMultiplePeriods;
      project.project_periods_json = hasMultiplePeriods ? projectPeriods : [];
      project.location = location;
      project.project_responsible = projectResponsible;
      project.headcount_required = headcountRequired;
      project.workshop_enabled = workshopEnabled;
      project.workshop_start_date = workshopEnabled ? (workshopStartDate || null) : null;
      project.workshop_end_date = workshopEnabled ? (workshopEndDate || null) : null;
      project.workshop_headcount_required = workshopEnabled ? workshopHeadcountRequired : 0;
      project.notes = notes;
    } else {
      project = {
        id: crypto.randomUUID(),
        name,
        category,
        status,
        planned_start_date: plannedStart || null,
        planned_end_date: plannedEnd || null,
        has_multiple_periods: hasMultiplePeriods,
        project_periods_json: hasMultiplePeriods ? projectPeriods : [],
        location,
        project_responsible: projectResponsible,
        headcount_required: headcountRequired,
        workshop_enabled: workshopEnabled,
        workshop_start_date: workshopEnabled ? (workshopStartDate || null) : null,
        workshop_end_date: workshopEnabled ? (workshopEndDate || null) : null,
        workshop_headcount_required: workshopEnabled ? workshopHeadcountRequired : 0,
        notes
      };
      state.projects.push(project);
    }

    state.projects = normalizeProjects(state.projects);
    state.projects.sort((a, b) => compareProjectDates(a, b));
    rebuildDerivedState();

    const result = await saveRow("planner_projects", project);
    if (!result.ok) return;

    if (willCancelProject && entriesToRemoveOnCancel.length) {
      const removedEntryIds = new Set(entriesToRemoveOnCancel.map(entry => entry.id));
      state.entries = state.entries.filter(entry => !removedEntryIds.has(entry.id));
      rebuildDerivedState();
      saveAllLocal();

      let failedDeletes = 0;
      for (const entry of entriesToRemoveOnCancel) {
        const deleteResult = await deleteRow("planner_entries", entry.id);
        if (!deleteResult.ok) failedDeletes += 1;
      }

      if (failedDeletes) {
        alert(`Prosjektet ble kansellert, men ${failedDeletes} tildeling${failedDeletes === 1 ? "" : "er"} kunne ikke slettes fra Supabase. Oppdater siden og kontroller ansattplanen.`);
      }

      void addAudit(`Kansellerte prosjekt og fjernet ${entriesToRemoveOnCancel.length} tildeling${entriesToRemoveOnCancel.length === 1 ? "" : "er"}: ${name}`);
    }

    closeProjectModal();
    if (!isExistingProject && state.calendarMode === "project") {
      state.focusProjectId = project.id;
      state.calendarPanelOpen = true;
    }
    renderAll();
    void addAudit(`${isExistingProject ? "Redigerte" : "Opprettet"} prosjekt: ${name}`);
  }

  async function deleteProjectFromModal() {
    if (!canEditApp()) return;
    const project = state.projects.find(p => p.id === state.selectedProjectId);
    if (!project) return;

    const hasEntries = state.entries.some(e => e.project_id === project.id);
    if (hasEntries) {
      alert("Prosjektet kan ikke slettes før tilhørende tildelinger er fjernet.");
      return;
    }

    if (!confirm("Vil du slette dette prosjektet?")) return;

    state.projects = state.projects.filter(p => p.id !== project.id);
    if (state.focusProjectId === project.id) state.focusProjectId = "";
    rebuildDerivedState();
    const result = await deleteRow("planner_projects", project.id);
    if (!result.ok) {
      state.projects.push(project);
      state.projects.sort((a, b) => compareProjectDates(a, b));
      rebuildDerivedState();
      renderAll();
      return;
    }

    closeProjectModal();
    renderAll();
    void addAudit(`Slettet prosjekt: ${project.name}`);
  }

  function openEmployeeModal(employeeId = null) {
    if (!canEditApp()) return;
    state.selectedEmployeeId = employeeId;
    const employee = state.employees.find(e => e.id === employeeId);

    els.employeeModalTitle.textContent = employee ? "Rediger ansatt" : "Ny ansatt";
    els.employeeName.value = employee?.name || "";
    els.employeeEmail.value = employee?.email || "";
    els.employeePhone.value = employee?.phone || "";
    els.employeeTitle.value = employee?.title || "";
    fillSelect(els.employeeGroup, EMPLOYEE_GROUP_OPTIONS.map(value => ({ id: value, name: value ? getEmployeeGroupLabel(value) : "Ingen gruppe valgt" })), normalizeEmployeeGroup(employee?.employee_group || ""), "name", "id");
    els.employeeActive.checked = employee?.active ?? true;
    els.deleteEmployeeBtn.style.display = employee ? "inline-flex" : "none";

    els.employeeModal.classList.remove("hidden");
    els.employeeModal.classList.add("flex");
  }

  function closeEmployeeModal() {
    state.selectedEmployeeId = null;
    els.employeeModal.classList.add("hidden");
    els.employeeModal.classList.remove("flex");
    flushPendingRemoteRefresh();
  }

  async function saveEmployeeFromModal() {
    if (!canEditApp()) return;
    const name = els.employeeName.value.trim();
    const email = els.employeeEmail.value.trim();
    const phone = els.employeePhone.value.trim();
    const title = els.employeeTitle.value.trim();
    const employeeGroup = normalizeEmployeeGroup(els.employeeGroup?.value || "");
    const active = els.employeeActive.checked;

    if (!name) {
      alert("Legg inn navn.");
      return;
    }

    const duplicate = state.employees.find(e =>
      e.name.toLowerCase() === name.toLowerCase() && e.id !== state.selectedEmployeeId
    );
    if (duplicate) {
      alert("En ansatt med dette navnet finnes allerede.");
      return;
    }

    let employee = state.employees.find(e => e.id === state.selectedEmployeeId);

    if (employee) {
      const oldName = employee.name;
      employee.name = name;
      employee.email = email;
      employee.phone = phone;
      employee.title = title;
      employee.employee_group = employeeGroup;
      employee.active = active;

      if (oldName !== name) {
        const affectedEntries = state.entries.filter(entry => entry.employee_name === oldName);
        for (const entry of affectedEntries) {
          entry.employee_name = name;
        }
        rebuildDerivedState();
        if (affectedEntries.length) {
          const saveEntriesResult = await saveRows("planner_entries", affectedEntries);
          if (!saveEntriesResult.ok) return;
        }
      }
    } else {
      employee = {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        title,
        employee_group: employeeGroup,
        active
      };
      state.employees.push(employee);
    }

    state.employees = normalizeEmployees(state.employees);
    state.employees.sort((a, b) => a.name.localeCompare(b.name, "no"));
    rebuildDerivedState();

    const result = await saveRow("planner_employees", getEmployeeRowForRemote(employee));
    if (!result.ok) return;

    closeEmployeeModal();
    renderAll();
    void addAudit(`${state.selectedEmployeeId ? "Redigerte" : "Opprettet"} ansatt: ${name}`);
  }

  async function deleteEmployeeFromModal() {
    if (!canEditApp()) return;
    const employee = state.employees.find(e => e.id === state.selectedEmployeeId);
    if (!employee) return;

    const hasEntries = state.entries.some(e => e.employee_name === employee.name);
    if (hasEntries) {
      alert("Ansatt kan ikke slettes før tilhørende tildelinger er fjernet. Sett eventuelt ansatt som inaktiv.");
      return;
    }

    if (!confirm("Vil du slette denne ansatte?")) return;

    state.employees = state.employees.filter(e => e.id !== employee.id);
    saveEmployeeGroupMap();
    rebuildDerivedState();
    const result = await deleteRow("planner_employees", employee.id);
    if (!result.ok) {
      state.employees.push(employee);
      state.employees.sort((a, b) => a.name.localeCompare(b.name, "no"));
      rebuildDerivedState();
      renderAll();
      return;
    }

    closeEmployeeModal();
    renderAll();
    void addAudit(`Slettet ansatt: ${employee.name}`);
  }

  async function bulkAddEmployees() {
    if (!canEditApp()) return;
    const names = els.bulkEmployees.value.split("\n").map(v => v.trim()).filter(Boolean);
    if (!names.length) {
      alert("Lim inn minst ett navn.");
      return;
    }

    let count = 0;
    const inserted = [];

    for (const name of names) {
      const exists = state.employees.some(e => e.name.toLowerCase() === name.toLowerCase());
      if (exists) continue;

      const employee = {
        id: crypto.randomUUID(),
        name,
        email: "",
        phone: "",
        title: "",
        employee_group: "",
        active: true
      };

      state.employees.push(employee);
      inserted.push(employee);
      count++;
    }

    state.employees.sort((a, b) => a.name.localeCompare(b.name, "no"));
    rebuildDerivedState();

    if (inserted.length) {
      const result = await saveRows("planner_employees", inserted.map(getEmployeeRowForRemote));
      if (!result.ok) {
        state.employees = state.employees.filter(e => !inserted.some(i => i.id === e.id));
        rebuildDerivedState();
        renderAll();
        return;
      }
    }

    els.bulkEmployees.value = "";
    renderAll();
    void addAudit(`La til ${count} ansatte via masseimport`);
  }

  function rebuildDerivedState() {
    const projectById = new Map();
    const entriesByEmployee = new Map();
    const entryCountByProject = new Map();

    state.projects.forEach(project => {
      projectById.set(project.id, project);
    });

    state.entries.forEach(entry => {
      if (!entriesByEmployee.has(entry.employee_name)) {
        entriesByEmployee.set(entry.employee_name, []);
      }
      entriesByEmployee.get(entry.employee_name).push(entry);
      entryCountByProject.set(entry.project_id, (entryCountByProject.get(entry.project_id) || 0) + 1);
    });

    entriesByEmployee.forEach(list => {
      list.sort((a, b) => a.start_date.localeCompare(b.start_date));
    });

    state.derived.projectById = projectById;
    state.derived.entriesByEmployee = entriesByEmployee;
    state.derived.entryCountByProject = entryCountByProject;
  }

  function renderAll() {
    if (isEmployeePortalUser()) {
      renderEmployeePortal();
      showEmployeePortal();
      return;
    }

    hideEmployeePortal();
    populateDynamicSelects();
    renderStats();
    renderHomeDashboard();
    renderLegend();
    renderCalendarPanel();
    renderProjects();
    renderEmployees();
    renderCalendar();
    renderKanban();
    renderNotifications();
    renderAudit();
    renderSystemStatus();
    renderAccessRequests();
    renderAccessUsers();
    updateBadge();
    updateAvailabilityAnalysis();
    applyRoleChrome();
    updateAvailabilityAnalysis();
    window.izomaxApplyLanguage?.();
  }

  function populateDynamicSelects() {
    const employeeFilterItems = [
      { name: "Alle ansatte", id: "Alle ansatte" },
      ...state.employees.filter(e => e.active !== false).map(e => ({ id: e.name, name: e.name }))
    ];

    const visibleProjects = getVisibleProjects();
    const assignFormState = {
      projectId: els.assignProject?.value || "",
      periodId: els.assignPeriod?.value || state.selectedAssignPeriodId || "",
      rows: getAssignRowsSnapshot(),
      notes: els.assignNotes?.value || ""
    };

    fillSelect(els.employeeFilter, employeeFilterItems, state.employeeFilter, "name", "id");
    if (els.projectFilterControl) {
      fillSelect(els.projectFilterControl, getProjectFilterOptions(), state.projectPhaseFilter || "all", "name", "id");
    }
    updateCalendarSearchControls();
    renderEmployeeGroupFilterControl();
    fillSelect(els.editEmployee, state.employees.filter(e => e.active !== false), null, "name", "name");
    fillSelect(els.assignProject, [{ id: "", name: "Velg prosjekt" }, ...visibleProjects.map(p => ({ id: p.id, name: p.name }))], assignFormState.projectId, "name", "id");
    fillSelect(els.editProject, state.projects, null, "name", "id");
    fillSelect(els.personalBlockEmployee, [{ id: "", name: "Velg ansatt" }, ...state.employees.filter(e => e.active !== false).map(e => ({ id: e.name, name: e.name }))], els.personalBlockEmployee?.value || "", "name", "id");
    fillSelect(els.personalBlockType, getPersonalBlockTypeOptions(), els.personalBlockType?.value || getPersonalBlockTypeOptions()[0] || "");
    fillSelect(els.contextMenuType, getPersonalBlockTypeOptions(), els.contextMenuType?.value || "Ferie");
    fillSelect(els.viewMode, ["Uke", "Måned", "År"], state.viewMode);
    fillSelect(els.calendarMode, [
      { id: "personal", name: "Personalplan" },
      { id: "project", name: "Prosjektplan" }
    ], state.calendarMode, "name", "id");

    if (!assignFormState.projectId) {
      renderAssignEmployeeSelectors("", assignFormState.rows);
      if (els.assignStart) els.assignStart.value = "";
      if (els.assignEnd) els.assignEnd.value = "";
      updateAssignSummary(null);
    } else {
      syncAssignDatesFromProject({ projectId: assignFormState.projectId, periodId: assignFormState.periodId, rows: assignFormState.rows });
    }

    if (els.assignNotes) {
      els.assignNotes.value = assignFormState.notes;
    }
  }

  function getUnstaffedProjectsForCurrentCalendarRange() {
    const range = getCurrentRange();
    return getVisibleProjects()
      .filter(project => projectNeedsStaffing(project))
      .filter(project => projectOverlapsRange(project, range.start, range.end));
  }

  function renderStats() {
    const visibleProjects = getVisibleProjects();
    const unstaffedProjects = getUnstaffedProjectsForCurrentCalendarRange();

    if (els.statsRow) {
      els.statsRow.innerHTML = "";
    }

    updateProjectQuickControls(visibleProjects.length, unstaffedProjects.length);
  }

  function makeLocalDateISO(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function renderHomeDashboard() {
    if (!els.homeDashboard) return;

    const canPlan = canPlanApp();
    if (!canPlan) {
      els.homeDashboard.innerHTML = "";
      return;
    }

    const GROUPS = [
      { value: "Offshore arbeider", label: "Offshore", color: "#2dd4bf" },
      { value: "Onshore arbeider", label: "Onshore", color: "#60a5fa" },
      { value: "Engineering", label: "Engineering", color: "#fb923c" },
      { value: "3 parts innleie", label: "3 parts innleie", color: "#c084fc" }
    ];
    const UNAVAILABLE_TYPES = ["Ferie", "Syk", "Avspasering", "Kurs", "Travel"];
    const activeEmployees = (state.employees || []).filter(employee => employee && employee.active !== false);
    const activeProjects = (state.projects || []).filter(project => project && !isSystemPersonalProject(project) && !isCancelledProject(project) && normalizeProjectStatus(project.status) !== "Fullført");
    const activeProjectIds = new Set(activeProjects.map(project => project.id));
    const getEntryEmployee = (entry) => entry?.employee_name || entry?.employeeName || "";
    const getEntryProject = (entry) => entry?.project_id || entry?.projectId || "";
    const getEntryStart = (entry) => entry?.start_date || entry?.start || "";
    const getEntryEnd = (entry) => entry?.end_date || entry?.end || "";
    const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
    const dayKey = (date) => makeLocalDateISO(date);
    const overlaps = (entry, startKey, endKey) => entry && getEntryStart(entry) <= endKey && getEntryEnd(entry) >= startKey;
    const getProject = (entry) => getProjectById(getEntryProject(entry));
    const isRealProject = (entry) => activeProjectIds.has(getProject(entry)?.id || "");
    const isUnavailable = (entry) => {
      const project = getProject(entry);
      return !!project && isSystemPersonalProject(project) && UNAVAILABLE_TYPES.includes(project.category);
    };

    function entriesForRange(startDate, endDate) {
      const startKey = dayKey(startDate);
      const endKey = dayKey(endDate);
      return (state.entries || []).filter(entry => overlaps(entry, startKey, endKey));
    }

    function daysBetween(startDate, endDate) {
      const days = [];
      const d = new Date(startDate);
      d.setHours(0,0,0,0);
      const end = new Date(endDate);
      end.setHours(0,0,0,0);
      while (d <= end) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      return days;
    }

    function groupMetrics(group, startDate, endDate) {
      const employees = activeEmployees.filter(employee => normalizeEmployeeGroup(employee.employee_group || "") === group.value);
      const names = new Set(employees.map(employee => employee.name));
      const entries = entriesForRange(startDate, endDate);
      const onProjectNames = new Set();
      const unavailableNames = new Set();
      let projectDays = 0;
      let capacityDays = 0;

      entries.forEach(entry => {
        const name = getEntryEmployee(entry);
        if (!name || !names.has(name)) return;
        if (isRealProject(entry)) onProjectNames.add(name);
        if (isUnavailable(entry)) unavailableNames.add(name);
      });

      daysBetween(startDate, endDate).forEach(day => {
        const key = dayKey(day);
        employees.forEach(employee => {
          const employeeEntries = entries.filter(entry => getEntryEmployee(entry) === employee.name && getEntryStart(entry) <= key && getEntryEnd(entry) >= key);
          const unavailable = employeeEntries.some(isUnavailable);
          const project = employeeEntries.some(isRealProject);
          if (unavailable) return;
          capacityDays += 1;
          if (project) projectDays += 1;
        });
      });

      const utilization = capacityDays ? Math.round((projectDays / capacityDays) * 100) : 0;
      return { ...group, total: employees.length, onProject: onProjectNames.size, unavailable: unavailableNames.size, available: Math.max(employees.length - onProjectNames.size - unavailableNames.size, 0), utilization, projectDays, capacityDays };
    }

    function dailyGroupMetric(group, date) {
      const employees = activeEmployees.filter(employee => normalizeEmployeeGroup(employee.employee_group || "") === group.value);
      const key = dayKey(date);
      const entries = entriesForRange(date, date);
      let unavailable = 0;
      let onProject = 0;
      employees.forEach(employee => {
        const employeeEntries = entries.filter(entry => getEntryEmployee(entry) === employee.name && getEntryStart(entry) <= key && getEntryEnd(entry) >= key);
        if (employeeEntries.some(isUnavailable)) unavailable += 1;
        else if (employeeEntries.some(isRealProject)) onProject += 1;
      });
      return { total: employees.length, unavailable, onProject, available: Math.max(employees.length - unavailable - onProject, 0) };
    }


    const normalizeCapacityText = (value) => String(value || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    function isWorkshopCapacityEmployee(employee) {
      if (!employee || employee.active === false) return false;
      const title = normalizeCapacityText(employee.title);
      const type = normalizeCapacityText(employee.employee_type);
      const group = normalizeCapacityText(employee.employee_group);
      const combined = `${title} ${type} ${group}`;

      if (combined.includes("management") || combined.includes("manager") || combined.includes("projectledelse")) return false;
      if (combined.includes("3 part") || combined.includes("3 parts") || combined.includes("innleie")) return false;
      if (combined.includes("lager") || combined.includes("logistikk") || combined.includes("warehouse") || combined.includes("logistics")) return false;
      if (combined.includes("offshore") && !combined.includes("onshore workshop")) return false;

      const isOnshoreWorkshopTechnician = title.includes("onshore workshop technician") || title.includes("workshop technician");
      const isApprentice = title === "apprentice" || title.includes("apprentice");
      return isOnshoreWorkshopTechnician || isApprentice;
    }

    function isOffshoreCapacityEmployee(employee) {
      return Boolean(employee && employee.active !== false && normalizeEmployeeGroup(employee.employee_group || "") === "Offshore arbeider");
    }

    function getCapacityEmployees(resourceType) {
      if (resourceType === "workshop") return activeEmployees.filter(isWorkshopCapacityEmployee);
      if (resourceType === "offshore") return activeEmployees.filter(isOffshoreCapacityEmployee);
      if (resourceType === "engineering") return activeEmployees.filter(employee => normalizeEmployeeGroup(employee.employee_group || "") === "Engineering");
      if (resourceType === "thirdParty") return activeEmployees.filter(employee => normalizeEmployeeGroup(employee.employee_group || "") === "3 parts innleie");
      return [];
    }

    function isEmployeeBlockedOnDate(employee, date) {
      const key = dayKey(date);
      const entries = entriesForRange(date, date).filter(entry => getEntryEmployee(entry) === employee.name && getEntryStart(entry) <= key && getEntryEnd(entry) >= key);
      const unavailable = entries.some(isUnavailable);
      const onProject = entries.some(isRealProject);
      return { unavailable, onProject, blocked: unavailable || onProject };
    }

    function getAssignedRelevantCountForProjectOnDate(project, date, resourceType) {
      if (!project?.id) return 0;
      const key = dayKey(date);
      const resourceNames = new Set(getCapacityEmployees(resourceType).map(employee => employee.name).filter(Boolean));
      const assigned = new Set();
      (state.entries || []).forEach(entry => {
        if (getEntryProject(entry) !== project.id) return;
        if (!getEntryStart(entry) || !getEntryEnd(entry)) return;
        if (!(getEntryStart(entry) <= key && getEntryEnd(entry) >= key)) return;
        const name = getEntryEmployee(entry);
        if (resourceNames.has(name)) assigned.add(name);
      });
      return assigned.size;
    }

    function getCapacityDemandForDate(resourceType, date) {
      const key = dayKey(date);
      const demandProjects = [];
      let totalNeed = 0;
      let remainingNeed = 0;

      activeProjects.forEach(project => {
        if (!project || isClosedProject(project)) return;
        const periods = getProjectTimelinePeriodsWithWorkshop(project).filter(period => period?.start && period?.end && period.start <= key && period.end >= key);
        periods.forEach(period => {
          let required = 0;
          if (resourceType === "workshop" && period.phase === "workshop") {
            required = Math.max(Number(period.required ?? project.workshop_headcount_required ?? 0), 0);
          } else if (resourceType === "offshore" && period.phase !== "workshop" && String(project.category || "").toLowerCase() === "offshore") {
            required = Math.max(Number(project.headcount_required || 0), 0);
          }
          if (!required) return;
          const assigned = getAssignedRelevantCountForProjectOnDate(project, date, resourceType);
          const remaining = Math.max(required - assigned, 0);
          totalNeed += required;
          remainingNeed += remaining;
          demandProjects.push({ project, phase: period.phase || "field", required, assigned, remaining });
        });
      });

      return { totalNeed, remainingNeed, projectCount: demandProjects.length, demandProjects };
    }

    function dailyCapacityMetric(capacityGroup, date) {
      if (capacityGroup.mode === "legacy") {
        const legacy = dailyGroupMetric(capacityGroup.legacyGroup, date);
        return {
          ...legacy,
          totalNeed: 0,
          remainingNeed: 0,
          net: legacy.available,
          projectCount: legacy.onProject,
          resourceTotal: legacy.total
        };
      }

      const employees = getCapacityEmployees(capacityGroup.resourceType);
      let unavailable = 0;
      let onProject = 0;
      employees.forEach(employee => {
        const blocked = isEmployeeBlockedOnDate(employee, date);
        if (blocked.unavailable) unavailable += 1;
        else if (blocked.onProject) onProject += 1;
      });
      const available = Math.max(employees.length - unavailable - onProject, 0);
      const demand = getCapacityDemandForDate(capacityGroup.resourceType, date);
      const net = available - demand.remainingNeed;
      return {
        total: employees.length,
        resourceTotal: employees.length,
        unavailable,
        onProject,
        available,
        totalNeed: demand.totalNeed,
        remainingNeed: demand.remainingNeed,
        net,
        projectCount: demand.projectCount,
        demandProjects: demand.demandProjects
      };
    }

    const today = new Date();
    const analysisStart = new Date(today);
    analysisStart.setHours(0, 0, 0, 0);
    const analysisEnd = addDays(analysisStart, 14);
    const metrics = GROUPS.map(group => groupMetrics(group, analysisStart, analysisEnd));
    const totalProjectPeople = metrics.reduce((sum, row) => sum + row.onProject, 0);
    const totalCapacityDays = metrics.reduce((sum, row) => sum + row.capacityDays, 0);
    const totalProjectDays = metrics.reduce((sum, row) => sum + row.projectDays, 0);
    const totalAvailable = metrics.reduce((sum, row) => sum + row.available, 0);
    const totalUnavailable = metrics.reduce((sum, row) => sum + row.unavailable, 0);
    const overallUtilization = totalCapacityDays ? Math.round((totalProjectDays / totalCapacityDays) * 100) : 0;

    const allProjects = (state.projects || []).filter(project => project && !isSystemPersonalProject(project));
    const projectTotals = allProjects.reduce((acc, project) => {
      const status = normalizeProjectStatus(project.status);
      if (isCancelledProject(project)) acc.cancelled += 1;
      else if (status === "Fullført") acc.completed += 1;
      else acc.remaining += 1;
      acc.total += 1;
      return acc;
    }, { total: 0, completed: 0, remaining: 0, cancelled: 0 });
    const unstaffedCount = getUnstaffedProjectsForCurrentCalendarRange().length;
    const completedPct = projectTotals.total ? Math.round((projectTotals.completed / projectTotals.total) * 100) : 0;

    const dashboardRangeStart = analysisStart;
    const dashboardRangeEnd = analysisEnd;
    const dashboardRangeStartKey = dayKey(dashboardRangeStart);
    const dashboardRangeEndKey = dayKey(dashboardRangeEnd);
    const getProjectRequiredForDashboard = (project) => Math.max(
      Number(project?.headcount_required || 0),
      Number(project?.workshop_headcount_required || 0),
      0
    );
    const getProjectAssignedForDashboard = (project) => {
      if (!project?.id) return 0;
      return (state.entries || []).filter(entry =>
        entry?.project_id === project.id &&
        entry?.start_date &&
        entry?.end_date &&
        overlaps(entry, dashboardRangeStartKey, dashboardRangeEndKey)
      ).length;
    };
    const next14Projects = allProjects
      .filter(project => project && !isClosedProject(project))
      .filter(project => getProjectTimelinePeriodsWithWorkshop(project).some(period =>
        period?.start &&
        period?.end &&
        period.start <= dashboardRangeEndKey &&
        period.end >= dashboardRangeStartKey
      ));
    const next14ProjectSummary = next14Projects.reduce((acc, project) => {
      const required = getProjectRequiredForDashboard(project);
      const assigned = getProjectAssignedForDashboard(project);
      acc.total += 1;

      if (required <= 0) {
        acc.noRequirement += 1;
      } else if (assigned >= required) {
        acc.full += 1;
      } else if (assigned > 0) {
        acc.partial += 1;
      } else {
        acc.unstaffed += 1;
      }

      return acc;
    }, { total: 0, full: 0, partial: 0, unstaffed: 0, noRequirement: 0 });
    const next14StaffingTotal = next14ProjectSummary.full + next14ProjectSummary.partial + next14ProjectSummary.unstaffed;
    const next14StaffedPct = next14StaffingTotal ? Math.round((next14ProjectSummary.full / next14StaffingTotal) * 100) : 0;
    const next14AttentionCount = next14ProjectSummary.partial + next14ProjectSummary.unstaffed;

    const actionIcon = (key) => {
      const attrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
      const icons = {
        sun: `<svg ${attrs}><path d="M12 4V2"/><path d="M12 22v-2"/><path d="m17.7 6.3 1.4-1.4"/><path d="m4.9 19.1 1.4-1.4"/><path d="M20 12h2"/><path d="M2 12h2"/><circle cx="12" cy="12" r="4"/></svg>`,
        calendar: `<svg ${attrs}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M9 16h6"/></svg>`,
        project: `<svg ${attrs}><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 12h18"/></svg>`,
        warning: `<svg ${attrs}><path d="M10.3 4.9 2.9 18a1.2 1.2 0 0 0 1.1 1.8h16a1.2 1.2 0 0 0 1.1-1.8L13.7 4.9a1 1 0 0 0-1.7 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        gear: `<svg ${attrs}><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06a2.1 2.1 0 0 1-3 3l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1 1.64V21.4a2.1 2.1 0 0 1-4.2 0v-.1a1.8 1.8 0 0 0-1-1.64 1.8 1.8 0 0 0-2 .36l-.06.06a2.1 2.1 0 0 1-3-3l.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.64-1H2.6a2.1 2.1 0 0 1 0-4.2h.1a1.8 1.8 0 0 0 1.64-1 1.8 1.8 0 0 0-.36-2l-.06-.06a2.1 2.1 0 0 1 3-3l.06.06a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1-1.64V2.6a2.1 2.1 0 0 1 4.2 0v.1a1.8 1.8 0 0 0 1 1.64 1.8 1.8 0 0 0 2-.36l.06-.06a2.1 2.1 0 0 1 3 3l-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.64 1h.1a2.1 2.1 0 0 1 0 4.2h-.1a1.8 1.8 0 0 0-1.64 1Z"/></svg>`,
        people: `<svg ${attrs}><path d="M16 20v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.6A3.6 3.6 0 0 0 4 18.6V20"/><circle cx="10" cy="7" r="3"/><path d="M20 20v-1.2a3.2 3.2 0 0 0-2.4-3.1"/></svg>`,
        check: `<svg ${attrs}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>`,
        bag: `<svg ${attrs}><rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>`
      };
      return icons[key] || icons.calendar;
    };

    const shortcuts = [
      { key: "calendar", title: "Ansattplan", text: "Bemanning og kapasitet.", action: "personal" },
      { key: "project", title: "Prosjektplan", text: "Prosjekter og oppdrag.", action: "project" },
      { key: "warning", title: "Uten bemanning", text: "Prosjekter som mangler crew.", action: "unstaffed" },
      { key: "gear", title: "Prosjektadmin", text: "Prosjekter og faser.", action: "projects" },
      { key: "people", title: "Ansattadmin", text: "Ansatte og kompetanse.", action: "employees" }
    ];

    const displayName = String(getAccountDisplayName() || state.currentUser || "Planlegger").trim();
    const firstName = displayName && displayName !== "Ikke innlogget" ? displayName.split(/\s+/)[0] : "Planlegger";
    const todayUnavailable = new Set(
      entriesForRange(analysisStart, analysisStart)
        .filter(isUnavailable)
        .map(entry => getEntryEmployee(entry))
        .filter(Boolean)
    ).size;

    const shortcutHtml = shortcuts.map(card => `
      <button type="button" data-home-action="${card.action}" class="dash27-white-card dash27-shortcut text-left">
        <div class="flex items-start justify-between gap-4"><span class="dash27-iconbox">${actionIcon(card.key)}</span><span class="text-2xl text-slate-500">→</span></div>
        <div class="mt-4 text-[17px] font-extrabold text-slate-950">${escapeHtml(card.title)}</div>
        <div class="mt-2 text-sm leading-6 text-slate-600">${escapeHtml(card.text)}</div>
      </button>
    `).join("");

    const next14ProjectKpiHtml = `
      <div class="dash27-panel dash57-projects14 p-5">
        <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div class="dash27-card-title">Prosjekter neste 14 dager</div>
            <div class="mt-1 text-sm dash27-muted">Bemanning oppsummert for prosjekter som starter eller pågår i perioden.</div>
          </div>
          <button type="button" data-home-action="project" class="dash57-open-link">Se prosjektplan →</button>
        </div>
        <div class="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <button type="button" data-home-action="project" class="dash57-stat text-left">
            <div class="dash57-stat-label">Totalt</div>
            <div class="dash57-stat-value">${next14ProjectSummary.total}</div>
            <div class="dash57-stat-sub">aktive prosjekter</div>
          </button>
          <button type="button" data-home-action="project" class="dash57-stat dash57-stat-ok text-left">
            <div class="dash57-stat-label">Fullbemannet</div>
            <div class="dash57-stat-value">${next14ProjectSummary.full}</div>
            <div class="dash57-stat-sub">${next14StaffedPct}% av bemannede krav</div>
          </button>
          <button type="button" data-home-action="unstaffed" class="dash57-stat dash57-stat-warn text-left">
            <div class="dash57-stat-label">Delvis bemannet</div>
            <div class="dash57-stat-value">${next14ProjectSummary.partial}</div>
            <div class="dash57-stat-sub">trenger oppfølging</div>
          </button>
          <button type="button" data-home-action="unstaffed" class="dash57-stat dash57-stat-danger text-left">
            <div class="dash57-stat-label">Uten bemanning</div>
            <div class="dash57-stat-value">${next14ProjectSummary.unstaffed}</div>
            <div class="dash57-stat-sub">kritisk bemanningsgap</div>
          </button>
          <button type="button" data-home-action="unstaffed" class="dash57-stat ${next14AttentionCount ? "dash57-stat-danger" : "dash57-stat-ok"} text-left">
            <div class="dash57-stat-label">Må følges opp</div>
            <div class="dash57-stat-value">${next14AttentionCount}</div>
            <div class="dash57-stat-sub">delvis + uten crew</div>
          </button>
        </div>
      </div>
    `;

    const kpiCards = [
      { label: "På prosjekt", value: totalProjectPeople, icon: "people", color: "#2dd4bf", text: `${overallUtilization}% neste 14 dager`, action: "dash-on-project", actionText: "Vis disse" },
      { label: "Tilgjengelige", value: totalAvailable, icon: "check", color: "#86efac", text: "ikke brukt i perioden", action: "dash-available", actionText: "Vis disse" },
      { label: "Borte / fravær", value: totalUnavailable, icon: "bag", color: "#fb923c", text: "ferie, syk, kurs, travel", action: "dash-away", actionText: "Vis disse" },
      { label: "Uten bemanning", value: next14ProjectSummary.unstaffed, icon: "warning", color: "#fb7185", text: `${next14ProjectSummary.unstaffed} prosjekter neste 14 dager`, action: "unstaffed", actionText: "Se prosjekter" }
    ].map(card => `
      <button type="button" data-home-action="${card.action}" class="dash27-kpi text-left w-full">
        <span class="dash27-kpi-icon" style="color:${card.color}">${actionIcon(card.icon)}</span>
        <div>
          <div class="text-xs uppercase font-black tracking-[.16em]" style="color:${card.color}">${escapeHtml(card.label)}</div>
          <div class="mt-1 text-4xl font-black text-white">${card.value}</div>
          <div class="mt-1 text-sm dash27-muted">${escapeHtml(card.text)}</div>
          <div class="dash27-kpi-action">${escapeHtml(card.actionText)} <span>→</span></div>
        </div>
      </button>
    `).join("");

    const weekDays = Array.from({ length: 5 }, (_, i) => addDays(today, i + 1));
    const capacityDays = Array.from({ length: 14 }, (_, i) => addDays(today, i));

    const CAPACITY_GROUPS = [
      {
        value: "Offshore",
        label: "Offshore",
        color: "#2dd4bf",
        resourceType: "offshore",
        threshold: { critical: -1, low: 1, note: "Gap <0 · Lav 0–1" },
        mode: "demand"
      },
      {
        value: "Workshop",
        label: "Workshop",
        color: "#22c55e",
        resourceType: "workshop",
        threshold: { critical: -1, low: 1, note: "Kun Onshore Workshop Technician + Apprentice" },
        mode: "demand"
      },
      {
        value: "Engineering",
        label: "Engineering",
        color: "#fb923c",
        legacyGroup: GROUPS.find(group => group.value === "Engineering"),
        threshold: { critical: 0, low: 1, note: "Tilgjengelighet" },
        mode: "legacy"
      },
      {
        value: "3 parts innleie",
        label: "3 parts innleie",
        color: "#c084fc",
        legacyGroup: GROUPS.find(group => group.value === "3 parts innleie"),
        threshold: { critical: 0, low: 2, note: "Tilgjengelighet" },
        mode: "legacy"
      }
    ];

    const getCapacityThreshold = (group) => group.threshold || { critical: -1, low: 1, note: "Gap <0 · Lav 0–1" };
    const capacityHeatLevel = (group, metric) => {
      const threshold = getCapacityThreshold(group);
      if (!metric.total && !metric.remainingNeed) return "ok";
      const value = group.mode === "legacy" ? metric.available : metric.net;
      if (value <= threshold.critical) return "critical";
      if (value <= threshold.low) return "low";
      return "ok";
    };
    const heatClass = (level) => level === "critical" ? "dash27-heat-critical" : level === "low" ? "dash27-heat-low" : "dash27-heat-ok";
    const heatLabel = (level) => level === "critical" ? "Kritisk" : level === "low" ? "Lav" : "OK";

    let lowSituations = 0;
    const lowSituationRows = [];
    const heatmapHtml = `
      <div class="grid grid-cols-[116px_repeat(5,1fr)] gap-2 items-center">
        <div></div>
        ${weekDays.map(day => `<div class="text-center text-xs font-bold dash27-muted">${escapeHtml(day.toLocaleDateString("no-NO", { weekday: "short" }).replace(".", ""))}<br><span class="text-[11px]">${escapeHtml(day.toLocaleDateString("no-NO", { day: "numeric", month: "numeric" }))}</span></div>`).join("")}
        ${CAPACITY_GROUPS.map(group => `
          <div>
            <div class="text-sm font-bold text-white">${escapeHtml(group.label)}</div>
            <div class="dash27-threshold-note">${escapeHtml(getCapacityThreshold(group).note)}</div>
          </div>
          ${weekDays.map(day => {
            const m = dailyCapacityMetric(group, day);
            const level = capacityHeatLevel(group, m);
            if (level !== "ok") {
              lowSituations += 1;
              if (lowSituationRows.length < 5) {
                lowSituationRows.push({ group: group.label, day, metric: m, level, mode: group.mode });
              }
            }
            const mainValue = group.mode === "legacy" ? m.available : m.net;
            const sub = group.mode === "legacy"
              ? `${heatLabel(level)}`
              : `Behov ${m.remainingNeed}`;
            return `<div class="dash27-heatcell ${heatClass(level)}" title="${escapeHtml(group.label)} ${escapeHtml(day.toLocaleDateString("no-NO"))}: netto ${m.net}, tilgjengelig ${m.available}, gjenstående behov ${m.remainingNeed}, på prosjekt ${m.onProject}, borte ${m.unavailable}">${mainValue}<span class="block text-[10px] font-medium">${escapeHtml(sub)}</span></div>`;
          }).join("")}
        `).join("")}
      </div>
    `;

    const capacityOverviewHtml = `
      <div class="dash27-capacity-scroll">
        <div class="dash27-capacity-table">
          <div></div>
          ${capacityDays.map(day => `<div class="dash27-capacity-head">${escapeHtml(day.toLocaleDateString("no-NO", { weekday: "short" }).replace(".", ""))}<br>${escapeHtml(day.toLocaleDateString("no-NO", { day: "numeric", month: "numeric" }))}</div>`).join("")}
          ${CAPACITY_GROUPS.map(group => `
            <div class="dash27-capacity-group">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-2.5 w-2.5 rounded-full" style="background:${group.color}"></span>
                <strong>${escapeHtml(group.label)}</strong>
              </div>
              <div class="dash27-threshold-note">${escapeHtml(getCapacityThreshold(group).note)}</div>
            </div>
            ${capacityDays.map(day => {
              const metric = dailyCapacityMetric(group, day);
              const level = capacityHeatLevel(group, metric);
              const mainValue = group.mode === "legacy" ? metric.available : metric.net;
              const subText = group.mode === "legacy"
                ? `P:${metric.onProject} · B:${metric.unavailable}`
                : `Behov:${metric.remainingNeed} · Ledig:${metric.available}`;
              const title = group.mode === "legacy"
                ? `${group.label} ${day.toLocaleDateString("no-NO")}: ledig ${metric.available}, på prosjekt ${metric.onProject}, borte ${metric.unavailable}`
                : `${group.label} ${day.toLocaleDateString("no-NO")}: netto ${metric.net}, tilgjengelig ${metric.available}, gjenstående behov ${metric.remainingNeed}, totalbehov ${metric.totalNeed}, på jobb ${metric.onProject}, borte ${metric.unavailable}, aktive faser ${metric.projectCount}`;
              return `<div class="dash27-capacity-cell ${heatClass(level)}" title="${escapeHtml(title)}">
                <strong>${mainValue}</strong>
                <span>${escapeHtml(subText)}</span>
              </div>`;
            }).join("")}
          `).join("")}
        </div>
      </div>
    `;

    const lowSituationSummaryHtml = lowSituationRows.length
      ? `<div class="dash27-why-low">${lowSituationRows.map(item => {
          const metric = item.metric || {};
          const detail = item.mode === "legacy"
            ? `${metric.available} ledig · ${metric.onProject} på prosjekt · ${metric.unavailable} borte`
            : `netto ${metric.net} · behov ${metric.remainingNeed} · tilgjengelig ${metric.available}`;
          return `<div class="dash27-alert-line"><strong>${escapeHtml(item.group)}</strong> · ${escapeHtml(item.day.toLocaleDateString("no-NO", { weekday: "short", day: "numeric", month: "numeric" }))}: ${escapeHtml(detail)}</div>`;
        }).join("")}</div>`
      : `<div class="dash27-why-low"><div class="dash27-alert-line">Ingen lave kapasitetsdager i denne ukevisningen.</div></div>`;

    let deg = 0;
    const segments = metrics.map(row => {
      const slice = totalProjectPeople ? (row.onProject / totalProjectPeople) * 360 : 0;
      const start = deg;
      const end = deg + slice;
      deg = end;
      return `${row.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
    });
    const donutBg = totalProjectPeople ? `conic-gradient(${segments.join(", ")})` : "#334155";
    const distLegend = metrics.map(row => {
      const pct = totalProjectPeople ? Math.round((row.onProject / totalProjectPeople) * 100) : 0;
      return `<div class="flex items-center justify-between gap-3 py-2"><div class="flex items-center gap-2"><span class="inline-flex h-3 w-3 rounded-sm" style="background:${row.color}"></span><span class="text-sm">${escapeHtml(row.label)}</span></div><div class="text-right text-sm"><strong>${row.onProject}</strong><span class="dash27-muted ml-3">${pct}%</span></div></div>`;
    }).join("");
    const maxTotal = Math.max(...metrics.map(row => row.total), 1);
    const employeesBars = metrics.map(row => `<div class="dash27-list-row grid grid-cols-[150px_1fr_52px_64px] gap-3 items-center py-2 px-2"><div class="flex items-center gap-2 text-sm"><span class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15" style="color:${row.color}">${getEmployeeGroupIconHtml(row.value, "inline-flex h-4 w-4")}</span><span>${escapeHtml(row.label)}</span></div><div class="dash27-progress"><span style="width:${Math.round((row.total / maxTotal) * 100)}%; background:${row.color};"></span></div><div class="text-right font-bold">${row.total}</div><div class="text-right"><span class="dash27-chip">↑ ${row.onProject}</span></div></div>`).join("");
    const projectRows = [
      ["Totalt", projectTotals.total, "#e2e8f0"],
      ["Avsluttet", projectTotals.completed, "#86efac"],
      ["Gjennomføring", projectTotals.remaining, "#60a5fa"],
      ["Uten bemanning", unstaffedCount, "#fb7185"],
      ["Kansellert", projectTotals.cancelled, "#cbd5e1"]
    ].map(row => `<div class="dash27-list-row flex items-center justify-between gap-3 py-3 px-2"><div class="flex items-center gap-2"><span class="inline-flex h-5 w-5 rounded-full border" style="border-color:${row[2]}; background:${row[2]}22"></span><span class="${row[0] === "Uten bemanning" ? "text-red-300 font-bold" : ""}">${escapeHtml(row[0])}</span></div><strong class="text-xl">${row[1]}</strong></div>`).join("");

    els.homeDashboard.innerHTML = `
      <div class="dash27-shell space-y-4">
        <div><h2 class="dash27-title">Oppstart</h2><p class="dash27-subtitle">Operativ oversikt for dagens dato og de neste 14 dagene.</p></div>
        <div class="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
          <div class="dash27-panel p-5 flex items-center gap-4"><span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-300/20 shrink-0">${actionIcon("sun")}</span><div><div class="text-xl font-extrabold">God morgen, ${escapeHtml(firstName)}!</div><div class="mt-2 text-sm dash27-muted">${next14AttentionCount} prosjekter trenger bemanningsoppfølging de neste 14 dagene.</div><div class="mt-2 text-sm dash27-muted">${todayUnavailable} borte/fravær i dag · oppdatert ${escapeHtml(today.toLocaleDateString("no-NO"))}</div></div></div>
          <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-5 gap-3">${shortcutHtml}</div>
        </div>
        ${next14ProjectKpiHtml}
        <div class="dash27-panel overflow-hidden"><div class="px-5 pt-4 text-xl font-extrabold">Operativ status – neste 14 dager</div><div class="grid grid-cols-1 lg:grid-cols-4">${kpiCards}</div></div>
        <div class="grid grid-cols-1 2xl:grid-cols-[1.25fr_.75fr] gap-4">
          <div class="dash27-panel p-5"><div class="flex items-center justify-between gap-3 mb-4"><div class="dash27-card-title">Kapasitet dag for dag – neste 14 dager <span class="dash27-info">i</span></div><div class="text-sm dash27-muted">Netto kapasitet · Behov vs ledige ressurser</div></div>${capacityOverviewHtml}<div class="mt-3 text-xs dash27-muted">Offshore og Workshop viser netto kapasitet: tilgjengelige ressurser minus gjenstående prosjektbehov. Workshop teller kun Onshore Workshop Technician og Apprentice.</div></div>
          <div class="dash27-panel p-5"><div class="flex items-center justify-between gap-3 mb-4"><div class="dash27-card-title">Kapasitetsgap – neste uke <span class="dash27-info">i</span></div><button type="button" data-home-action="project" class="text-cyan-300 text-sm font-bold">Se detaljer →</button></div>${heatmapHtml}<div class="mt-4 pt-4 border-t border-white/10 text-sm"><span class="text-orange-300 font-bold">⚠</span> Totalt ${lowSituations} kapasitetsgap/lave marginer i kommende uke</div>${lowSituationSummaryHtml}</div>
        </div>
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div class="dash27-panel p-5"><div class="dash27-card-title mb-4">Prosjektfordeling pr gruppe <span class="dash27-info">i</span></div><div class="grid grid-cols-1 md:grid-cols-[190px_1fr] gap-5 items-center"><div class="dash27-donut mx-auto" style="background:${donutBg}"><div class="dash27-donut-inner"><div class="text-sm dash27-muted">Totalt</div><div class="text-4xl font-black">${totalProjectPeople}</div><div class="text-xs dash27-muted">personer</div></div></div><div>${distLegend}</div></div></div>
          <div class="dash27-panel p-5"><div class="dash27-card-title mb-4">Ansatte pr gruppe <span class="dash27-info">i</span></div><div class="grid grid-cols-[150px_1fr_52px_48px] gap-3 pb-2 text-xs uppercase tracking-wider dash27-muted"><div>Gruppe</div><div></div><div class="text-right">Antall</div><div class="text-right">Endr.</div></div>${employeesBars}<div class="flex items-center justify-between pt-4 font-black"><span>Totalt</span><span>${metrics.reduce((sum, row) => sum + row.total, 0)}</span></div></div>
          <div class="dash27-panel p-5 grid grid-cols-1 md:grid-cols-[1fr_150px] gap-4 items-center"><div><div class="dash27-card-title mb-4">Prosjektoversikt <span class="dash27-info">i</span></div>${projectRows}</div><div class="dash27-donut mx-auto" style="width:140px;height:140px;background:conic-gradient(#2dd4bf 0 ${completedPct}%, rgba(148,163,184,.38) ${completedPct}% 100%)"><div class="dash27-donut-inner"><div class="text-4xl font-black">${completedPct}%</div><div class="text-[11px] font-bold tracking-wider">AVSLUTTET</div><div class="text-xs dash27-muted">${projectTotals.completed} prosjekter</div></div></div></div>
        </div>
      </div>
    `;

    els.homeDashboard.querySelectorAll("[data-home-action]").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-home-action");
        if (action === "dash-on-project") return openDashboardEmployeeFilter("on_project", "På prosjekt");
        if (action === "dash-available") return openDashboardEmployeeFilter("available", "Tilgjengelige");
        if (action === "dash-away") return openDashboardEmployeeFilter("away", "Borte / fravær");
        if (action === "personal") return openPersonalCalendarView();
        if (action === "project") return openProjectCalendarView("all");
        if (action === "unstaffed") return openProjectCalendarView("unstaffed");
        if (action === "projects") return setActiveTab("projects");
        if (action === "employees") return setActiveTab("employees");
      });
    });
  }


  function updateProjectQuickControls(projectCount = null, unstaffedCount = null) {
    const totalProjects = projectCount ?? getVisibleProjects().length;
    const missingStaffCount = unstaffedCount ?? getUnstaffedProjectsForCurrentCalendarRange().length;

    if (els.personalPlanQuickBtn) {
      const active = state.calendarMode === "personal";
      els.personalPlanQuickBtn.classList.toggle("is-active", active);
      els.personalPlanQuickBtn.textContent = window.izomaxTranslateKey?.("employeePlan") || "Ansattplan";
      els.personalPlanQuickBtn.title = window.izomaxTranslateKey?.("employeePlanTitle") || "Vis ansattplan i kalenderen";
    }

    if (els.projectPlanQuickBtn) {
      const active = state.calendarMode === "project" && state.projectListFilter !== "unstaffed";
      els.projectPlanQuickBtn.classList.toggle("is-active", active);
      const projectPlanLabel = window.izomaxTranslateKey?.("projectPlan") || "Prosjektplan";
      els.projectPlanQuickBtn.textContent = `${projectPlanLabel} (${totalProjects})`;
      els.projectPlanQuickBtn.title = window.izomaxTranslateKey?.("projectPlanTitle") || "Åpne prosjektplan i kalenderen";
    }

    if (els.unstaffedProjectsQuickBtn) {
      const active = state.calendarMode === "project" && state.projectListFilter === "unstaffed";
      els.unstaffedProjectsQuickBtn.classList.toggle("is-active", active);
      const unstaffedLabel = window.izomaxTranslateKey?.("unstaffed") || "Uten bemanning";
      els.unstaffedProjectsQuickBtn.innerHTML = `${escapeHtml(unstaffedLabel)} <span class="quick-count">${escapeHtml(String(missingStaffCount))}</span>`;
      els.unstaffedProjectsQuickBtn.title = window.izomaxTranslateKey?.("unstaffedTitle") || "Vis prosjekter som mangler bemanning i prosjektplanen for valgt periode";
    }
  }


  function renderLegend() {
    const projectCategoryHtml = [
      { name: "Feltoppdrag", color: "bg-red-600" },
      { name: "Workshop / mobilisering", color: "bg-green-600" }
    ].map(item => `
      <div class="flex items-center gap-2">
        <span class="inline-block w-4 h-4 rounded ${item.color}"></span>
        <span>${escapeHtml(window.izomaxTranslateValue?.(item.name) || item.name)}</span>
      </div>
    `).join("");

    const personalCategoryHtml = getVisiblePersonalBlockTypes().map(name => `
      <div class="flex items-center gap-2">
        <span class="inline-block w-4 h-4 rounded ${getLegendDotClasses(name)}"></span>
        <span>${escapeHtml(window.izomaxTranslateValue?.(name) || name)}</span>
      </div>
    `).join("");

    const statusHtml = Object.keys(STATUS_COLORS).map(name => `
      <div class="flex items-center gap-2">
        <span class="inline-block rounded-full border px-2 py-0.5 ${STATUS_COLORS[name]}">${escapeHtml(window.izomaxTranslateValue?.(name) || name)}</span>
      </div>
    `).join("");

    const range = getCurrentRange();
    const holidayItems = [];
    for (let year = range.start.getFullYear(); year <= range.end.getFullYear(); year++) {
      for (const holiday of getHolidayNamesForYear(year)) {
        if (holiday.date >= range.start && holiday.date <= range.end) {
          holidayItems.push(`<div class="iz-holiday-row"><span>${escapeHtml(holiday.label)}</span><span>${escapeHtml(formatDate(holiday.date))}</span></div>`);
        }
      }
    }

    els.legendList.innerHTML = `
      <div>
        <div class="font-medium mb-2">Prosjekter</div>
        <div class="space-y-2">${projectCategoryHtml}</div>
      </div>
      <div class="pt-4 border-t border-slate-200">
        <div class="font-medium mb-2">Direkte blokk på ansatt</div>
        <div class="space-y-2">${personalCategoryHtml}</div>
      </div>
      <div class="pt-4 border-t border-slate-200">
        <div class="font-medium mb-2">Prosjektstatus</div>
        <div class="space-y-2">${statusHtml}</div>
      </div>
      <div class="iz-holiday-panel">
        <div class="iz-holiday-panel-title">Helligdager</div>
        <div class="space-y-1">${holidayItems.length ? holidayItems.join("") : '<div class="text-slate-400">Ingen helligdager i valgt periode.</div>'}</div>
      </div>
    `;
  }

  function selectProjectInCalendar(projectId) {
    state.focusProjectId = projectId || "";
    state.calendarPanelOpen = !!projectId;
    renderCalendarPanel();
    renderCalendar();
  }

  function getProjectInspectorPeriods(project) {
    const periods = getProjectTimelinePeriods(project);
    if (periods.length) return periods;
    if (project?.planned_start_date && project?.planned_end_date) {
      return [{ start: project.planned_start_date, end: project.planned_end_date }];
    }
    return [];
  }

  function getProjectStaffingGroupRank(group) {
    const normalized = normalizeEmployeeGroup(group || "");
    if (normalized === "Offshore arbeider") return 1;
    if (normalized === "3 parts innleie") return 2;
    if (normalized === "Engineering") return 3;
    if (normalized === "Onshore arbeider") return 4;
    return 9;
  }

  function getProjectStaffingGroupLabel(group) {
    const normalized = normalizeEmployeeGroup(group || "");
    if (normalized === "Offshore arbeider") return "Offshore";
    if (normalized === "3 parts innleie") return "3 Part";
    if (normalized === "Engineering") return "Engineer";
    if (normalized === "Onshore arbeider") return "Onshore";
    return getEmployeeGroupLabel(normalized) || "Annet";
  }

  function getProjectInspectorConflictLabel(entry) {
    const conflictProject = getProjectById(entry?.project_id);
    const title = displayProjectName(conflictProject) || entry?.project_name || entry?.project || entry?.type || "Ukjent aktivitet";
    const period = entry?.start_date && entry?.end_date ? `${formatDate(entry.start_date)} – ${formatDate(entry.end_date)}` : "Dato ikke satt";
    return `${title} · ${period}`;
  }

  function entryFullyCoversPeriod(entry, period) {
    const entryStart = asLocalDate(entry?.start_date);
    const entryEnd = asLocalDate(entry?.end_date);
    const periodStart = asLocalDate(period?.start);
    const periodEnd = asLocalDate(period?.end);
    if (!entryStart || !entryEnd || !periodStart || !periodEnd) return false;
    return entryStart <= periodStart && entryEnd >= periodEnd;
  }

  function getProjectInspectorAvailability(employee, project) {
    const periods = getProjectInspectorPeriods(project);
    if (!periods.length) return { label: "Ukjent", tone: "text-slate-500", rank: 3, conflicts: [] };

    const entries = (state.derived.entriesByEmployee.get(employee.name) || [])
      .filter(entry => entry.project_id !== project.id);
    const conflictMap = new Map();
    let conflictPeriods = 0;
    let hasPartialConflict = false;

    for (const period of periods) {
      const periodConflicts = entries.filter(entry => overlaps(entry.start_date, entry.end_date, period.start, period.end));
      if (periodConflicts.length) {
        conflictPeriods += 1;
        periodConflicts.forEach(entry => conflictMap.set(entry.id || `${entry.project_id}-${entry.start_date}-${entry.end_date}`, entry));
        const periodFullyCovered = periodConflicts.some(entry => entryFullyCoversPeriod(entry, period));
        if (!periodFullyCovered) hasPartialConflict = true;
      } else {
        hasPartialConflict = true;
      }
    }

    const conflicts = Array.from(conflictMap.values());
    if (conflictPeriods === 0) return { label: "Ledig", tone: "text-green-700", rank: 1, conflicts: [] };
    if (hasPartialConflict || conflictPeriods < periods.length) return { label: "Delvis ledig", tone: "text-amber-700", rank: 2, conflicts };
    return { label: "Opptatt", tone: "text-red-700", rank: 3, conflicts };
  }

  function getProjectInspectorEmployees(project) {
    return state.employees
      .filter(employee => employee.active !== false)
      .map(employee => ({
        ...employee,
        normalizedGroup: normalizeEmployeeGroup(employee.employee_group || ""),
        availability: getProjectInspectorAvailability(employee, project)
      }))
      .sort((a, b) => {
        const groupDiff = getProjectStaffingGroupRank(a.normalizedGroup) - getProjectStaffingGroupRank(b.normalizedGroup);
        if (groupDiff !== 0) return groupDiff;
        const availabilityDiff = a.availability.rank - b.availability.rank;
        if (availabilityDiff !== 0) return availabilityDiff;
        return a.name.localeCompare(b.name, "no");
      });
  }

  function getEmployeeRoleSearchText(employee) {
    const employeeAssignments = state.entries.filter(entry => entry.employee_name === employee.name && entry.role);
    const roles = new Set(employeeAssignments.map(entry => String(entry.role || "").trim()).filter(Boolean));
    if (employee.title) roles.add(String(employee.title).trim());
    return Array.from(roles).join(" ");
  }

  function getProjectInspectorFilterOptions() {
    return [
      { id: "all", label: "Alle" },
      { id: "Offshore arbeider", label: "Offshore" },
      { id: "Onshore arbeider", label: "Onshore" },
      { id: "Engineering", label: "Engineering" },
      { id: "3 parts innleie", label: "3 party" },
      { id: "Projekt", label: "Projekt" }
    ];
  }

  function employeeMatchesProjectInspectorGroup(employee, filterValue) {
    if (!filterValue || filterValue === "all") return true;
    const normalizedGroup = normalizeEmployeeGroup(employee.normalizedGroup || employee.employee_group || "");
    if (filterValue === "Projekt") {
      const text = [
        employee.name,
        employee.title,
        employee.roleText,
        getProjectStaffingGroupLabel(normalizedGroup),
        employee.employee_group
      ].join(" ").toLowerCase();
      return text.includes("projekt") || text.includes("project") || text.includes("prosjekt");
    }
    return normalizedGroup === filterValue;
  }

  function getProjectInspectorFilteredEmployees(project, assignedNames) {
    const search = String(state.projectInspectorSearch || "").trim().toLowerCase();
    const groupFilter = String(state.projectInspectorGroup || "all");

    return getProjectInspectorEmployees(project)
      .filter(employee => !assignedNames.has(employee.name))
      .map(employee => {
        const roleText = getEmployeeRoleSearchText(employee);
        return { ...employee, roleText };
      })
      .filter(employee => {
        if (!employeeMatchesProjectInspectorGroup(employee, groupFilter)) return false;
        if (!search) return true;
        const haystack = [
          employee.name,
          employee.title,
          employee.roleText,
          getProjectStaffingGroupLabel(employee.normalizedGroup),
          employee.availability.label
        ].join(" ").toLowerCase();
        return haystack.includes(search);
      });
  }

  function getProjectInspectorAvailabilitySummary(project, assignedNames) {
    const employees = getProjectInspectorEmployees(project).filter(employee => !assignedNames.has(employee.name));
    return employees.reduce((summary, employee) => {
      const label = employee.availability.label;
      if (label === "Ledig") summary.available += 1;
      else if (label === "Delvis ledig") summary.partial += 1;
      else summary.busy += 1;
      return summary;
    }, { available: 0, partial: 0, busy: 0, assigned: assignedNames.size });
  }

  function resetProjectInspectorFilters() {
    state.projectInspectorSearch = "";
    state.projectInspectorGroup = "all";
    state.projectInspectorShowAvailable = false;
    state.projectInspectorAddCandidateName = "";
    state.projectInspectorAddRole = "";
    state.projectInspectorAddUseCustomRange = false;
    state.projectInspectorAddCustomStart = "";
    state.projectInspectorAddCustomEnd = "";
    state.projectInspectorSelectedNames = [];
    state.projectInspectorBatchMode = false;
  }

  function getProjectInspectorProjectBounds(project) {
    const periods = getProjectInspectorPeriods(project).filter(period => period.start && period.end);
    if (periods.length) {
      const starts = periods.map(period => period.start).sort();
      const ends = periods.map(period => period.end).sort();
      return { start: starts[0], end: ends[ends.length - 1] };
    }
    if (project?.planned_start_date && project?.planned_end_date) {
      return { start: project.planned_start_date, end: project.planned_end_date };
    }
    return { start: "", end: "" };
  }

  function getProjectInspectorAddCandidate(project) {
    const name = String(state.projectInspectorAddCandidateName || "").trim();
    if (!name) return null;
    const assignedNames = new Set(state.entries.filter(entry => entry.project_id === project?.id).map(entry => entry.employee_name));
    if (assignedNames.has(name)) return null;
    return getProjectInspectorEmployees(project).find(employee => employee.name === name) || null;
  }

  function getProjectInspectorAddRole(employee) {
    const current = String(state.projectInspectorAddRole || "").trim();
    if (current && ROLE_OPTIONS.includes(current)) return current;
    const title = String(employee?.title || "").trim();
    const exact = ROLE_OPTIONS.find(role => role.toLowerCase() === title.toLowerCase());
    return exact || getDefaultRoleForIndex(0);
  }

  function primeProjectInspectorCandidate(project, employeeName, suggestedRole = "") {
    const bounds = getProjectInspectorProjectBounds(project);
    state.projectInspectorAddCandidateName = employeeName || "";
    state.projectInspectorAddRole = suggestedRole || "";
    state.projectInspectorAddUseCustomRange = false;
    state.projectInspectorAddCustomStart = bounds.start || "";
    state.projectInspectorAddCustomEnd = bounds.end || "";
  }

  function getProjectInspectorAddRange(project) {
    const bounds = getProjectInspectorProjectBounds(project);
    const fallbackStart = bounds.start || String(project?.planned_start_date || "").trim();
    const fallbackEnd = bounds.end || String(project?.planned_end_date || "").trim();
    const safeBounds = {
      start: fallbackStart,
      end: fallbackEnd
    };

    if (state.projectInspectorAddUseCustomRange) {
      return {
        start: String(state.projectInspectorAddCustomStart || fallbackStart || "").trim(),
        end: String(state.projectInspectorAddCustomEnd || fallbackEnd || "").trim(),
        bounds: safeBounds
      };
    }
    return {
      start: fallbackStart || "",
      end: fallbackEnd || "",
      bounds: safeBounds
    };
  }

  function projectPanelDebug(label, payload = {}) {
    try {
      // v18.16: debug logging disabled after locating flow issue.
      // console.log(`[PROJECT PANEL DEBUG v18.16] ${label}`, payload);
    } catch (_) {}
  }

  function getProjectInspectorSelectableEmployee(project, employeeName) {
    const name = String(employeeName || "").trim();
    if (!project || !name) return null;
    const assignedNames = new Set(state.entries.filter(entry => entry.project_id === project.id).map(entry => entry.employee_name));
    if (assignedNames.has(name)) return null;
    return getProjectInspectorEmployees(project).find(employee => employee.name === name) || null;
  }

  function getProjectInspectorSelectedNames(project) {
    const raw = Array.isArray(state.projectInspectorSelectedNames) ? state.projectInspectorSelectedNames : [];
    const seen = new Set();
    return raw
      .map(name => String(name || "").trim())
      .filter(name => {
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return !!getProjectInspectorSelectableEmployee(project, name);
      });
  }

  function toggleProjectInspectorSelectedName(project, employeeName, checked = null) {
    const name = String(employeeName || "").trim();
    if (!name || !getProjectInspectorSelectableEmployee(project, name)) return;
    const current = new Set(getProjectInspectorSelectedNames(project));
    const shouldSelect = checked === null ? !current.has(name) : !!checked;
    if (shouldSelect) current.add(name);
    else current.delete(name);
    state.projectInspectorSelectedNames = Array.from(current);
  }

  function getProjectInspectorRoleForBatch(project) {
    const current = String(state.projectInspectorAddRole || "").trim();
    if (current && ROLE_OPTIONS.includes(current)) return current;
    const first = getProjectInspectorSelectedNames(project)[0];
    const employee = first ? getProjectInspectorSelectableEmployee(project, first) : null;
    return getProjectInspectorAddRole(employee) || getDefaultRoleForIndex(0);
  }

  function validateProjectInspectorRange(project) {
    const range = getProjectInspectorAddRange(project);
    if (!range.start || !range.end) return { ok: false, message: "Velg en gyldig periode." };
    if (range.start > range.end) return { ok: false, message: "Fra-dato kan ikke være senere enn til-dato." };
    if (range.bounds.start && range.start < range.bounds.start) return { ok: false, message: "Fra-dato må være innenfor prosjektperioden." };
    if (range.bounds.end && range.end > range.bounds.end) return { ok: false, message: "Til-dato må være innenfor prosjektperioden." };
    return { ok: true, range };
  }

  async function createProjectInspectorAssignments(projectId, employeeNames, options = {}) {
    projectPanelDebug("createProjectInspectorAssignments called", { projectId, employeeNames, options });
    if (!canEditApp()) return;
    const project = getProjectById(projectId);
    if (!project) return;

    const requestedNames = Array.isArray(employeeNames) ? employeeNames : [employeeNames];
    const uniqueNames = [...new Set(requestedNames.map(name => String(name || "").trim()).filter(Boolean))];
    const employees = uniqueNames.map(name => getProjectInspectorSelectableEmployee(project, name)).filter(Boolean);
    if (!employees.length) {
      alert(window.izomaxTranslateKey?.("selectEmployeeFirst") || "Velg minst én ansatt fra listen først.");
      return;
    }

    const assigned = state.entries.filter(entry => entry.project_id === project.id).length;
    const required = Math.max(Number(project.headcount_required || 0), 0);
    if (required > 0 && assigned + employees.length > required) {
      const overBy = assigned + employees.length - required;
      const ok = confirm(`Dette gir ${overBy} person(er) mer enn bemanningsbehovet. Vil du fortsette?`);
      if (!ok) return;
    }

    const validation = validateProjectInspectorRange(project);
    if (!validation.ok) {
      alert(validation.message);
      return;
    }
    const { range } = validation;

    const role = options.role || getProjectInspectorRoleForBatch(project) || getDefaultRoleForIndex(0);
    const newEntries = [];
    const overbookWarnings = [];

    for (const employee of employees) {
      const entry = {
        id: crypto.randomUUID(),
        project_id: project.id,
        employee_name: employee.name,
        role,
        start_date: range.start,
        end_date: range.end,
        notes: ""
      };
      const conflicts = getEntryOverlapConflicts(entry);
      const isPanelOverbook = employee.availability?.label === "Opptatt" || conflicts.length > 0;
      if (isPanelOverbook) {
        const conflictText = conflicts.length
          ? getEntryConflictSummary(entry, conflicts)
          : `${employee.name} er markert som opptatt i prosjektperioden.`;
        overbookWarnings.push(conflictText);
        entry.notes = "OVERBOOKET fra prosjektpanel - kontroller i Ansattplan";
      }
      newEntries.push(entry);
    }

    if (overbookWarnings.length) {
      const warningText = `${overbookWarnings.slice(0, 5).join("\n\n")}${overbookWarnings.length > 5 ? `\n\n+${overbookWarnings.length - 5} flere konflikt(er).` : ""}\n\nOverbooking blir lagret og skal vises som konflikt i Ansattplan. Fortsette?`;
      if (!confirm(warningText)) return;
    }

    state.entries.push(...newEntries);
    const addedNames = new Set(newEntries.map(entry => entry.employee_name));
    state.projectInspectorSelectedNames = getProjectInspectorSelectedNames(project).filter(name => !addedNames.has(name));
    if (!state.projectInspectorSelectedNames.length) state.projectInspectorBatchMode = false;
    state.projectInspectorAddCandidateName = "";
    state.projectInspectorAddRole = "";
    state.projectInspectorAddUseCustomRange = false;
    state.projectInspectorAddCustomStart = "";
    state.projectInspectorAddCustomEnd = "";
    rebuildDerivedState();
    renderProjectInspectorPanel(project);
    renderCalendar();
    renderHomeDashboard();
    updateBadge();
    updateAvailabilityAnalysis();

    const result = newEntries.length === 1
      ? await saveRow("planner_entries", newEntries[0])
      : await saveRows("planner_entries", newEntries);
    if (!result.ok) {
      const ids = new Set(newEntries.map(entry => entry.id));
      state.entries = state.entries.filter(item => !ids.has(item.id));
      rebuildDerivedState();
      renderAll();
      return;
    }

    state.calendarMode = "project";
    state.focusProjectId = project.id;
    state.calendarPanelOpen = true;
    renderAll();
    void addAudit(`La til ${newEntries.length} tildeling${newEntries.length > 1 ? "er" : ""} på ${project.name} fra prosjektpanelet`);
    newEntries.forEach(entry => void addNotification(entry.employee_name, project.name));
  }

  async function createProjectInspectorAssignment(projectId) {
    const project = getProjectById(projectId);
    const employee = getProjectInspectorAddCandidate(project);
    return createProjectInspectorAssignments(projectId, employee?.name || state.projectInspectorAddCandidateName || "");
  }


  function getProjectWorkbenchDefaultRect() {
    // v18.62l: Default skal oppleves som et flyttbart Outlook-vindu, ikke som sidepanel/fullskjerm.
    // Ca. 1/4-1/3 av arbeidsflaten, med tydelig kalender synlig bak.
    const margin = 24;
    const viewportWidth = Math.max(window.innerWidth || 1280, 360);
    const viewportHeight = Math.max(window.innerHeight || 760, 360);
    const maxWidth = Math.max(320, viewportWidth - margin * 2);
    const maxHeight = Math.max(300, viewportHeight - margin * 2);
    const width = Math.min(Math.max(620, Math.round(viewportWidth * 0.48)), Math.min(980, maxWidth));
    const height = Math.min(Math.max(420, Math.round(viewportHeight * 0.54)), Math.min(680, maxHeight));
    const left = Math.min(Math.max(margin + 80, Math.round(viewportWidth * 0.20)), Math.max(margin, viewportWidth - width - margin));
    const top = Math.min(Math.max(margin + 76, Math.round(viewportHeight * 0.16)), Math.max(margin, viewportHeight - height - margin));
    return {
      left,
      top,
      width,
      height,
      maximized: false,
      restore: null
    };
  }

  function normalizeProjectWorkbenchRect(rect = {}) {
    const margin = 12;
    const viewportWidth = Math.max(window.innerWidth || 1280, 360);
    const viewportHeight = Math.max(window.innerHeight || 760, 360);
    const minWidth = Math.min(460, Math.max(300, viewportWidth - margin * 2));
    const minHeight = Math.min(330, Math.max(260, viewportHeight - margin * 2));
    const maxWidth = Math.max(minWidth, viewportWidth - margin * 2);
    const maxHeight = Math.max(minHeight, viewportHeight - margin * 2);
    const width = Math.min(Math.max(Number(rect.width) || minWidth, minWidth), maxWidth);
    const height = Math.min(Math.max(Number(rect.height) || minHeight, minHeight), maxHeight);
    const maxLeft = Math.max(margin, viewportWidth - width - margin);
    const maxTop = Math.max(margin, viewportHeight - height - margin);
    const rawLeft = Number.isFinite(Number(rect.left)) ? Number(rect.left) : Math.round((viewportWidth - width) / 2);
    const rawTop = Number.isFinite(Number(rect.top)) ? Number(rect.top) : Math.round((viewportHeight - height) / 2);
    return {
      left: Math.min(Math.max(margin, rawLeft), maxLeft),
      top: Math.min(Math.max(margin, rawTop), maxTop),
      width,
      height,
      maximized: !!rect.maximized,
      restore: rect.restore || null
    };
  }

  function getCurrentProjectWorkbenchRect() {
    const shell = els.calendarPanelCol;
    const rect = shell?.getBoundingClientRect?.();
    if (!rect || !rect.width || !rect.height) {
      return normalizeProjectWorkbenchRect(state.projectWorkbenchWindow || getProjectWorkbenchDefaultRect());
    }
    return normalizeProjectWorkbenchRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      maximized: !!state.projectWorkbenchWindow?.maximized,
      restore: state.projectWorkbenchWindow?.restore || null
    });
  }

  function applyProjectWorkbenchWindowState() {
    const shell = els.calendarPanelCol;
    if (!shell) return;
    let rect = state.projectWorkbenchWindow || getProjectWorkbenchDefaultRect();
    rect = normalizeProjectWorkbenchRect(rect);
    state.projectWorkbenchWindow = rect;

    // Viktig: gamle panelregler brukte `inset/width/height: ... !important`.
    // Derfor må flytende vindu styres med inline !important, ellers låser CSS det til full bredde.
    shell.style.setProperty("position", "fixed", "important");
    shell.style.setProperty("inset", "auto", "important");
    shell.style.setProperty("left", `${rect.left}px`, "important");
    shell.style.setProperty("top", `${rect.top}px`, "important");
    shell.style.setProperty("width", `${rect.width}px`, "important");
    shell.style.setProperty("height", `${rect.height}px`, "important");
    shell.style.setProperty("right", "auto", "important");
    shell.style.setProperty("bottom", "auto", "important");
    shell.style.setProperty("max-width", "calc(100vw - 24px)", "important");
    shell.style.setProperty("max-height", "calc(100vh - 24px)", "important");
    shell.style.setProperty("min-width", "460px", "important");
    shell.style.setProperty("min-height", "330px", "important");
    shell.style.setProperty("transform", "none", "important");
    shell.style.setProperty("z-index", "10000", "important");
    shell.style.setProperty("display", "block", "important");
    shell.style.setProperty("pointer-events", "auto", "important");
    shell.style.setProperty("box-sizing", "border-box", "important");
    shell.style.setProperty("overflow", "visible", "important");
  }

  function closeProjectWorkbenchPanel() {
    state.calendarPanelOpen = false;
    state.focusProjectId = "";
    resetProjectInspectorFilters();
    if (els.calendarPanelCol) {
      els.calendarPanelCol.querySelectorAll(".iz-workbench-control-island").forEach(node => node.remove());
      ["position", "inset", "left", "top", "width", "height", "right", "bottom", "min-width", "min-height", "max-width", "max-height", "transform", "z-index", "display", "pointer-events", "box-sizing", "overflow"].forEach(prop => {
        els.calendarPanelCol.style.removeProperty(prop);
      });
    }
    renderCalendarPanel();
    renderCalendar();
  }

  function resetProjectWorkbenchWindow() {
    state.projectWorkbenchWindow = getProjectWorkbenchDefaultRect();
    applyProjectWorkbenchWindowState();
  }

  function toggleProjectWorkbenchMaximize() {
    const current = getCurrentProjectWorkbenchRect();
    if (state.projectWorkbenchWindow?.maximized) {
      state.projectWorkbenchWindow = normalizeProjectWorkbenchRect(state.projectWorkbenchWindow.restore || getProjectWorkbenchDefaultRect());
    } else {
      state.projectWorkbenchWindow = normalizeProjectWorkbenchRect({
        left: 12,
        top: 12,
        width: Math.max(740, (window.innerWidth || 1280) - 24),
        height: Math.max(440, (window.innerHeight || 760) - 24),
        maximized: true,
        restore: current
      });
    }
    applyProjectWorkbenchWindowState();
  }

  function ensureProjectWorkbenchControlIsland(project = null) {
    const shell = els.calendarPanelCol;
    if (!shell) return null;
    const projectId = project?.id || state.focusProjectId || "";
    let island = shell.querySelector(":scope > .iz-workbench-control-island");
    if (!island) {
      island = document.createElement("div");
      island.className = "iz-workbench-control-island";
      shell.appendChild(island);
    }
    island.innerHTML = `
      <button data-project-workbench-edit="${escapeHtml(projectId)}" type="button" class="iz-workbench-control-edit" title="Rediger prosjekt">✎ Rediger</button>
      <button data-project-workbench-reset-window="1" type="button">Nullstill</button>
      <button data-project-workbench-maximize="1" type="button">Fullvisning</button>
      <button data-project-workbench-close="1" type="button" class="iz-workbench-control-close" aria-label="Lukk prosjektvindu" title="Lukk prosjektvindu">×</button>
    `;
    return island;
  }

  function getProjectWorkbenchScrollableTarget(target, boundary) {
    let node = target instanceof Element ? target : null;
    while (node && node !== boundary && node !== document.body) {
      const style = window.getComputedStyle ? window.getComputedStyle(node) : null;
      const overflowY = style?.overflowY || "";
      const overflowX = style?.overflowX || "";
      const canScrollY = /(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight + 1;
      const canScrollX = /(auto|scroll)/.test(overflowX) && node.scrollWidth > node.clientWidth + 1;
      if (canScrollY || canScrollX) return node;
      node = node.parentElement;
    }
    return null;
  }

  function canProjectWorkbenchScrollableMove(element, event) {
    if (!element) return false;
    const dx = Number(event.deltaX) || 0;
    const dy = Number(event.deltaY) || 0;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) return element.scrollLeft > 0;
      if (dx > 0) return element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
      return false;
    }
    if (dy < 0) return element.scrollTop > 0;
    if (dy > 0) return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
    return false;
  }

  function openProjectWorkbenchEditModal(projectId = "") {
    const id = projectId || state.focusProjectId || "";
    if (!id) return;
    openProjectModal(id);
    // Åpnet fra prosjektvindu: bruk mørk prosjektmodal som matcher bemanningsvinduet.
    if (els.projectModal) {
      els.projectModal.classList.add("iz-workbench-project-edit");
      els.projectModal.dataset.openedFromWorkbench = "1";
      els.projectModal.style.setProperty("position", "fixed", "important");
      els.projectModal.style.setProperty("z-index", "30050", "important");
      els.projectModal.style.setProperty("inset", "0", "important");
    }
  }

  function setupProjectWorkbenchWindowControls(project = null) {
    const shell = els.calendarPanelCol;
    if (!shell) return;
    applyProjectWorkbenchWindowState();
    const controlIsland = ensureProjectWorkbenchControlIsland(project);
    if (controlIsland && !controlIsland.dataset.pointerGuardBound) {
      controlIsland.dataset.pointerGuardBound = "true";
      ["pointerdown", "mousedown", "click"].forEach(type => {
        controlIsland.addEventListener(type, event => event.stopPropagation());
      });
    }

    if (!shell.dataset.workbenchDelegatedActionsBound) {
      shell.dataset.workbenchDelegatedActionsBound = "true";
      shell.addEventListener("click", event => {
        const closeButton = event.target?.closest?.("[data-project-workbench-close]");
        if (closeButton) {
          event.preventDefault();
          event.stopPropagation();
          closeProjectWorkbenchPanel();
          return;
        }
        const resetButton = event.target?.closest?.("[data-project-workbench-reset-window]");
        if (resetButton) {
          event.preventDefault();
          event.stopPropagation();
          resetProjectWorkbenchWindow();
          return;
        }
        const maximizeButton = event.target?.closest?.("[data-project-workbench-maximize]");
        if (maximizeButton) {
          event.preventDefault();
          event.stopPropagation();
          toggleProjectWorkbenchMaximize();
          return;
        }
        const editButton = event.target?.closest?.("[data-project-workbench-edit], [data-calendar-panel-edit-project]");
        if (editButton) {
          event.preventDefault();
          event.stopPropagation();
          const projectId = editButton.dataset.projectWorkbenchEdit || editButton.dataset.calendarPanelEditProject || state.focusProjectId || "";
          openProjectWorkbenchEditModal(projectId);
          return;
        }
      });
    }

    if (!shell.dataset.workbenchWheelGuardBound) {
      shell.dataset.workbenchWheelGuardBound = "true";
      shell.addEventListener("wheel", event => {
        // Når musepeker er over prosjektvinduet skal kalenderen bak aldri scrolle.
        // Vi stopper default scrolling og flytter kun nærmeste interne scrollområde manuelt.
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        const scrollable = getProjectWorkbenchScrollableTarget(event.target, shell);
        if (scrollable) {
          scrollable.scrollTop += Number(event.deltaY) || 0;
          scrollable.scrollLeft += Number(event.deltaX) || 0;
        }
      }, { passive: false, capture: true });
    }

    if (!window.__izomaxProjectWorkbenchEscapeBound) {
      window.__izomaxProjectWorkbenchEscapeBound = true;
      document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        if (!state.calendarPanelOpen || state.calendarMode !== "project") return;
        closeProjectWorkbenchPanel();
      });
    }

    shell.querySelectorAll("[data-project-workbench-close]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        closeProjectWorkbenchPanel();
      });
    });

    shell.querySelectorAll("[data-project-workbench-reset-window]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        resetProjectWorkbenchWindow();
      });
    });

    shell.querySelectorAll("[data-project-workbench-maximize]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        toggleProjectWorkbenchMaximize();
      });
    });

    shell.querySelectorAll("[data-project-workbench-edit], [data-calendar-panel-edit-project]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const projectId = btn.dataset.projectWorkbenchEdit || btn.dataset.calendarPanelEditProject || state.focusProjectId || "";
        openProjectWorkbenchEditModal(projectId);
      });
    });

    const dragHandle = shell.querySelector("[data-project-workbench-drag-handle]");
    if (dragHandle) {
      dragHandle.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;
        if (event.target?.closest?.("button, input, select, textarea, a, [role='button']")) return;
        const startRect = getCurrentProjectWorkbenchRect();
        state.projectWorkbenchWindow = { ...startRect, maximized: false, restore: null };
        const startX = event.clientX;
        const startY = event.clientY;
        shell.classList.add("is-dragging");
        const onMove = moveEvent => {
          const next = normalizeProjectWorkbenchRect({
            left: startRect.left + moveEvent.clientX - startX,
            top: startRect.top + moveEvent.clientY - startY,
            width: startRect.width,
            height: startRect.height,
            maximized: false,
            restore: null
          });
          state.projectWorkbenchWindow = next;
          shell.style.setProperty("left", `${next.left}px`, "important");
          shell.style.setProperty("top", `${next.top}px`, "important");
          shell.style.setProperty("width", `${next.width}px`, "important");
          shell.style.setProperty("height", `${next.height}px`, "important");
        };
        const onUp = () => {
          shell.classList.remove("is-dragging");
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", onUp);
        };
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp, { once: true });
        document.addEventListener("pointercancel", onUp, { once: true });
        event.preventDefault();
        event.stopPropagation();
      });
    }

    shell.querySelectorAll("[data-project-workbench-resize]").forEach(handle => {
      handle.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;
        const edge = handle.dataset.projectWorkbenchResize || "se";
        const startRect = getCurrentProjectWorkbenchRect();
        state.projectWorkbenchWindow = { ...startRect, maximized: false, restore: null };
        const startX = event.clientX;
        const startY = event.clientY;
        shell.classList.add("is-resizing");
        const onMove = moveEvent => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          let left = startRect.left;
          let top = startRect.top;
          let width = startRect.width;
          let height = startRect.height;
          if (edge.includes("e")) width = startRect.width + dx;
          if (edge.includes("s")) height = startRect.height + dy;
          if (edge.includes("w")) { left = startRect.left + dx; width = startRect.width - dx; }
          if (edge.includes("n")) { top = startRect.top + dy; height = startRect.height - dy; }
          const next = normalizeProjectWorkbenchRect({ left, top, width, height, maximized: false, restore: null });
          state.projectWorkbenchWindow = next;
          shell.style.setProperty("left", `${next.left}px`, "important");
          shell.style.setProperty("top", `${next.top}px`, "important");
          shell.style.setProperty("width", `${next.width}px`, "important");
          shell.style.setProperty("height", `${next.height}px`, "important");
        };
        const onUp = () => {
          shell.classList.remove("is-resizing");
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", onUp);
        };
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp, { once: true });
        document.addEventListener("pointercancel", onUp, { once: true });
        event.preventDefault();
        event.stopPropagation();
      });
    });
  }

  function renderProjectInspectorPanel(project) {
    // v18.62e: Project assignment is now a modal workbench, not a narrow side panel.
    if (!els.calendarPanelContent || !project) return;

    const assignedEntries = state.entries
      .filter(entry => entry.project_id === project.id)
      .slice()
      .sort((a, b) => a.employee_name.localeCompare(b.employee_name, "no"));
    const assignedNames = new Set(assignedEntries.map(entry => entry.employee_name));
    const assigned = assignedEntries.length;
    const required = Math.max(Number(project.headcount_required || 0), 0);
    const missingStaffCount = Math.max(required - assigned, 0);
    const periods = getProjectInspectorPeriods(project);
    const projectBounds = getProjectInspectorProjectBounds(project);
    const projectPeriodText = projectBounds.start && projectBounds.end
      ? `${formatDate(projectBounds.start)} – ${formatDate(projectBounds.end)}`
      : (periods.length ? `${periods.length} perioder` : "Ikke satt");
    const projectOwner = project.project_responsible || project.projectResponsible || project.responsible || "Ikke satt";
    const groupOptions = getProjectInspectorFilterOptions()
      .map(option => `<option value="${escapeHtml(option.id)}" ${state.projectInspectorGroup === option.id ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
      .join("");

    // In the workbench, availability is central and should always be visible.
    const filteredEmployees = getProjectInspectorFilteredEmployees(project, assignedNames);
    const availableEmployees = filteredEmployees.filter(employee => employee.availability.label === "Ledig");
    const partialEmployees = filteredEmployees.filter(employee => employee.availability.label === "Delvis ledig");
    const busyEmployees = filteredEmployees.filter(employee => employee.availability.label === "Opptatt" || employee.availability.label === "Ukjent");
    const addCandidate = getProjectInspectorAddCandidate(project);
    const selectedBatchNames = getProjectInspectorSelectedNames(project);
    const addCandidateRole = addCandidate ? getProjectInspectorAddRole(addCandidate) : getProjectInspectorRoleForBatch(project);
    const addRange = getProjectInspectorAddRange(project);

    const renderPeriods = () => {
      if (!periods.length) {
        return `<div class="iz-workbench-empty">Ingen periode satt.</div>`;
      }
      return periods.map((period, index) => `
        <div class="iz-workbench-period-row">
          <span>Periode ${index + 1}</span>
          <strong>${escapeHtml(formatDate(period.start))} – ${escapeHtml(formatDate(period.end))}</strong>
        </div>
      `).join("");
    };

    const renderConflictList = (employee) => {
      const conflicts = employee?.availability?.conflicts || [];
      if (!conflicts.length) return "";
      const rows = conflicts.slice(0, 3).map(conflict => `<div class="iz-workbench-conflict-line">${escapeHtml(getProjectInspectorConflictLabel(conflict))}</div>`).join("");
      const more = conflicts.length > 3 ? `<div class="iz-workbench-conflict-more">+${conflicts.length - 3} flere konflikter</div>` : "";
      return `<div class="iz-workbench-conflicts">${rows}${more}</div>`;
    };

    const renderCandidateCard = (employee, mode) => {
      const isSelected = addCandidate && addCandidate.name === employee.name;
      const isBatchSelected = selectedBatchNames.includes(employee.name);
      const batchMode = !!state.projectInspectorBatchMode;
      const label = employee.availability.label;
      const toneClass = label === "Ledig" ? "is-available" : (label === "Delvis ledig" ? "is-partial" : "is-busy");
      const role = getDefaultRoleForIndex(0);
      const canQuickAdd = label === "Ledig";
      const secondaryText = label === "Opptatt" ? "Overbook" : (label === "Delvis ledig" ? "Velg delperiode" : "Velg periode");
      return `
        <div
          class="iz-workbench-person iz-workbench-person-v2 iz-workbench-person-clean ${toneClass} ${isSelected ? "is-selected" : ""} ${isBatchSelected ? "is-batch-selected" : ""}"
          data-project-available-person-row="${escapeHtml(employee.name)}"
          data-project-inspector-row-role="${escapeHtml(role)}"
        >
          ${batchMode ? `
            <label class="iz-workbench-person-check" title="Velg for samlet tildeling">
              <input type="checkbox" data-project-inspector-batch-select="${escapeHtml(employee.name)}" ${isBatchSelected ? "checked" : ""} />
            </label>
          ` : ""}
          <div class="iz-workbench-person-main">
            <div class="iz-workbench-person-icon">${getEmployeeGroupIconHtml(employee.normalizedGroup, "inline-flex h-5 w-5 items-center justify-center text-cyan-100 shrink-0 opacity-90") || "•"}</div>
            <div class="iz-workbench-person-text">
              <div class="iz-workbench-person-name" title="${escapeHtml(employee.name)}">${escapeHtml(employee.name)}</div>
              <div class="iz-workbench-person-meta" title="${escapeHtml((employee.title || "Tittel ikke satt") + " · " + getProjectStaffingGroupLabel(employee.normalizedGroup))}">${escapeHtml(employee.title || "Tittel ikke satt")} · ${escapeHtml(getProjectStaffingGroupLabel(employee.normalizedGroup))}</div>
              ${renderConflictList(employee)}
            </div>
          </div>
          <div class="iz-workbench-person-actions">
            <span class="iz-workbench-status-pill ${toneClass}">${escapeHtml(window.izomaxTranslateValue?.(label) || label)}</span>
            ${canQuickAdd
              ? `<button type="button" class="iz-workbench-add-btn ${toneClass} iz-workbench-quick-add-main" data-project-inspector-quick-add="${escapeHtml(employee.name)}" data-project-inspector-select-role="${escapeHtml(role)}">+ Legg til</button>`
              : `<button type="button" class="iz-workbench-add-btn ${toneClass}" data-project-inspector-select-employee="${escapeHtml(employee.name)}" data-project-inspector-select-role="${escapeHtml(role)}">${isSelected ? "Valgt" : secondaryText}</button>`}
          </div>
        </div>
      `;
    };

    const renderCandidateColumn = (title, subtitle, employees, mode, options = {}) => {
      const bodyHtml = `
        <div class="iz-workbench-column-body">
          ${employees.length ? employees.slice(0, 40).map(employee => renderCandidateCard(employee, mode)).join("") : `<div class="iz-workbench-empty">Ingen treff.</div>`}
          ${employees.length > 40 ? `<div class="iz-workbench-more">Viser 40 av ${employees.length}. Bruk søk/filter.</div>` : ""}
        </div>
      `;
      const hasSelectedEmployee = !!(addCandidate && employees.some(employee => employee.name === addCandidate.name));
      const shouldOpen = options.open === true || hasSelectedEmployee;
      const headHtml = `
        <div class="iz-workbench-column-head">
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(subtitle)}</p>
          </div>
          <span>${employees.length}</span>
        </div>
      `;
      if (options.collapsible) {
        return `
          <details class="iz-workbench-column iz-workbench-collapsible-column ${mode}" ${shouldOpen ? "open" : ""}>
            <summary class="iz-workbench-column-summary">${headHtml}</summary>
            ${bodyHtml}
          </details>
        `;
      }
      return `
        <section class="iz-workbench-column ${mode} is-open-default">
          ${headHtml}
          ${bodyHtml}
        </section>
      `;
    };

    const renderAddPanelForm = (title, subTitle, confirmText, confirmAttrs = "") => `
      <section id="projectInspectorStableAddBox" data-project-inspector-stable-add-box="1" class="iz-workbench-add-panel iz-workbench-add-panel-active">
        <div class="iz-workbench-add-head">
          <div>
            <div class="iz-workbench-add-title">${escapeHtml(title)}</div>
            <div class="iz-workbench-add-sub">${escapeHtml(subTitle)}</div>
          </div>
          <button id="projectInspectorAddCancelBtn" type="button" class="iz-workbench-secondary-btn">Avbryt</button>
        </div>
        ${addCandidate?.availability?.label === "Opptatt" ? `<div class="iz-workbench-warning is-busy">Denne personen er opptatt i perioden. Ved overbooking blir konflikten synlig i Ansattplan.</div>` : ""}
        ${addCandidate?.availability?.label === "Delvis ledig" ? `<div class="iz-workbench-warning is-partial">Denne personen er delvis ledig. Velg riktig delperiode før du legger til.</div>` : ""}
        <div class="iz-workbench-add-grid iz-workbench-add-grid-v18-62ac">
          <label>
            Rolle
            <select id="projectInspectorAddRoleSelect">${ROLE_OPTIONS.map(role => `<option value="${escapeHtml(role)}" ${role === addCandidateRole ? "selected" : ""}>${escapeHtml(role)}</option>`).join("")}</select>
          </label>
          <div class="iz-workbench-period-choice">
            <label class="iz-workbench-radio-row">
              <input id="projectInspectorWholePeriodRadio" type="radio" name="projectInspectorPeriodMode" value="whole" ${state.projectInspectorAddUseCustomRange ? "" : "checked"} />
              <span><strong>Hele prosjektperioden</strong><small>${escapeHtml(projectBounds.start ? `${formatDate(projectBounds.start)} – ${formatDate(projectBounds.end)}` : "Periode ikke satt")}</small></span>
            </label>
            <label class="iz-workbench-radio-row">
              <input id="projectInspectorCustomPeriodRadio" type="radio" name="projectInspectorPeriodMode" value="custom" ${state.projectInspectorAddUseCustomRange ? "checked" : ""} />
              <span><strong>Delperiode</strong><small>Brukes ved delvis tilgjengelighet eller planlagt split.</small></span>
            </label>
          </div>
          <label>
            Fra
            <input id="projectInspectorCustomStartInput" type="date" value="${escapeHtml(addRange.start || projectBounds.start || "")}" min="${escapeHtml(projectBounds.start || "")}" max="${escapeHtml(projectBounds.end || "")}" ${state.projectInspectorAddUseCustomRange ? "" : "disabled"} />
          </label>
          <label>
            Til
            <input id="projectInspectorCustomEndInput" type="date" value="${escapeHtml(addRange.end || projectBounds.end || "")}" min="${escapeHtml(projectBounds.start || "")}" max="${escapeHtml(projectBounds.end || "")}" ${state.projectInspectorAddUseCustomRange ? "" : "disabled"} />
          </label>
        </div>
        <div class="iz-workbench-add-footer">
          <button id="projectInspectorAddConfirmBtn" ${confirmAttrs} type="button" class="iz-workbench-primary-btn iz-workbench-primary-btn-large">${escapeHtml(confirmText)}</button>
          <span>Velg rolle og periode, trykk deretter på knappen for å legge til.</span>
        </div>
      </section>
    `;

    const selectedAddPanelHtml = addCandidate
      ? renderAddPanelForm(
          `Legg til: ${addCandidate.name}`,
          "Velg rolle og periode før du legger personen til prosjektet.",
          addCandidate.availability?.label === "Opptatt" ? "Overbook og legg til" : "Legg til prosjekt",
          `data-project-inspector-confirm-add="1" data-project-inspector-confirm-employee="${escapeHtml(addCandidate.name)}"`
        )
      : state.projectInspectorBatchMode && selectedBatchNames.length
        ? renderAddPanelForm(
            `Legg til valgte (${selectedBatchNames.length})`,
            selectedBatchNames.slice(0, 3).join(", ") + (selectedBatchNames.length > 3 ? ` +${selectedBatchNames.length - 3} flere` : ""),
            `Legg til ${selectedBatchNames.length} valgt${selectedBatchNames.length > 1 ? "e" : ""}`,
            `data-project-inspector-confirm-batch="1"`
          )
        : `<section class="iz-workbench-add-panel is-empty iz-workbench-add-panel-compact"><strong>Velg ansatte</strong><span>Trykk <b>+ Legg til</b> for rask tildeling. For bytte: fjern tildelt ansatt og legg til ny.</span></section>`;

    const batchToolbarHtml = state.projectInspectorBatchMode
      ? `<div class="iz-workbench-batch-toolbar is-active"><span>${selectedBatchNames.length} valgt</span><button data-project-inspector-toggle-batch="0" type="button" class="iz-workbench-secondary-btn">Avslutt flervalg</button></div>`
      : `<div class="iz-workbench-batch-toolbar"><span>Legg til flere ansatte samtidig ved behov.</span><button data-project-inspector-toggle-batch="1" type="button" class="iz-workbench-secondary-btn">Velg flere</button></div>`;

    const assignedHtml = assignedEntries.length ? assignedEntries.map(entry => `
      <div class="iz-workbench-assigned-row" data-project-assigned-entry-id="${escapeHtml(entry.id)}">
        <div class="iz-workbench-assigned-avatar">${escapeHtml(getInitials(entry.employee_name))}</div>
        <div class="iz-workbench-assigned-text">
          <div>${escapeHtml(entry.employee_name)}</div>
          <span>${escapeHtml(entry.role || "Rolle ikke satt")} · ${escapeHtml(formatDate(entry.start_date))} – ${escapeHtml(formatDate(entry.end_date))}</span>
          ${entry.notes ? `<small>${escapeHtml(entry.notes)}</small>` : ""}
        </div>
        <div class="iz-workbench-assigned-row-actions" aria-label="Handlinger for ${escapeHtml(entry.employee_name)}">
          <button data-project-entry-delete-id="${escapeHtml(entry.id)}" type="button" class="iz-workbench-assigned-row-btn danger">Fjern</button>
        </div>
      </div>
    `).join("") : `<div class="iz-workbench-empty">Ingen tildelte ressurser ennå.</div>`;

    const assignedControlsHtml = "";

    els.calendarPanelContent.innerHTML = `
      <div class="iz-project-workbench-modal" role="dialog" aria-modal="true" aria-label="Bemanning og prosjektkontroll">
        <header class="iz-workbench-header" data-project-workbench-drag-handle="1">
          <div class="iz-workbench-title-block">
            <div class="iz-workbench-eyebrow">Bemanning og prosjektkontroll</div>
            <h2>${escapeHtml(project.name || "Prosjekt")}</h2>
            <div class="iz-workbench-header-meta">
              <span>Prosjekteier: <strong>${escapeHtml(projectOwner)}</strong></span>
              <span>Type: <strong>${escapeHtml(window.izomaxTranslateValue?.(project.category || "Ikke satt") || project.category || "Ikke satt")}</strong></span>
              <span>Status: <strong>${escapeHtml(window.izomaxTranslateValue?.(project.status || "Ikke satt") || project.status || "Ikke satt")}</strong></span>
            </div>
          </div>
          <div class="iz-workbench-header-actions">
            <button data-project-workbench-edit="${escapeHtml(project.id)}" type="button" class="iz-workbench-secondary-btn iz-workbench-edit-btn">Rediger prosjekt</button>
            <button data-project-workbench-reset-window="1" type="button" class="iz-workbench-secondary-btn">Nullstill</button>
            <button data-project-workbench-maximize="1" type="button" class="iz-workbench-secondary-btn">Fullvisning</button>
            <button data-project-workbench-close="1" type="button" class="iz-workbench-close-text-btn" aria-label="Lukk prosjektvindu">Lukk</button>
          </div>
          <button data-project-workbench-close="1" type="button" class="iz-workbench-corner-close" aria-label="Lukk prosjektvindu" title="Lukk">×</button>
        </header>

        <div class="iz-workbench-main">
          <aside class="iz-workbench-summary">
            <section class="iz-workbench-card iz-workbench-projectdata-card">
              <h3>Prosjektdata</h3>
              <div class="iz-workbench-facts">
                <div><span>Periode</span><strong>${escapeHtml(projectPeriodText)}</strong></div>
                <div><span>Bemanningsbehov</span><strong>${required || 0} personer</strong></div>
                <div><span>Tildelt</span><strong>${assigned}${required ? ` / ${required}` : ""}</strong></div>
                <div class="${missingStaffCount ? "is-missing" : "is-ok"}"><span>Mangler</span><strong>${missingStaffCount}</strong></div>
              </div>
            </section>

            <section class="iz-workbench-card iz-workbench-periods-card">
              <div class="iz-workbench-card-head">
                <h3>Periode(r)</h3>
                <button data-project-workbench-edit="${escapeHtml(project.id)}" type="button">Rediger</button>
              </div>
              <div class="iz-workbench-periods">${renderPeriods()}</div>
            </section>

            <section class="iz-workbench-card iz-workbench-assigned-card">
              <h3>Tildelte (${assigned}${required ? `/${required}` : ""})</h3>
              <div class="iz-workbench-assigned-list">${assignedHtml}</div>
              ${assignedControlsHtml}
            </section>
          </aside>

          <main class="iz-workbench-candidates">
            ${selectedAddPanelHtml}
            <div class="iz-workbench-filter-row">
              <input id="projectInspectorSearchInput" type="text" placeholder="Søk navn, gruppe, tittel eller status" value="${escapeHtml(state.projectInspectorSearch || "")}" />
              <select id="projectInspectorGroupFilter">${groupOptions}</select>
            </div>
            ${batchToolbarHtml}
            <div class="iz-workbench-columns">
              ${renderCandidateColumn("Ledig hele perioden", "Beste kandidater for hele oppdraget.", availableEmployees, "available", { open: true })}
              ${renderCandidateColumn("Delvis ledig", "Kan dekke deler av perioden.", partialEmployees, "partial", { collapsible: true })}
              ${renderCandidateColumn("Opptatt / overbook", "Viser konfliktprosjekt og kan overbookes.", busyEmployees, "busy", { collapsible: true })}
            </div>
          </main>
        </div>
        <footer class="iz-workbench-footer">
          <span class="iz-workbench-footer-spacer" aria-hidden="true"></span>
          <button data-project-workbench-close="1" type="button" class="iz-workbench-close-btn">Lukk vindu</button>
        </footer>
      </div>
      <span class="iz-workbench-resize-handle iz-workbench-resize-n" data-project-workbench-resize="n" aria-hidden="true"></span>
      <span class="iz-workbench-resize-handle iz-workbench-resize-e" data-project-workbench-resize="e" aria-hidden="true"></span>
      <span class="iz-workbench-resize-handle iz-workbench-resize-s" data-project-workbench-resize="s" aria-hidden="true"></span>
      <span class="iz-workbench-resize-handle iz-workbench-resize-w" data-project-workbench-resize="w" aria-hidden="true"></span>
      <span class="iz-workbench-resize-handle iz-workbench-resize-ne" data-project-workbench-resize="ne" aria-hidden="true"></span>
      <span class="iz-workbench-resize-handle iz-workbench-resize-nw" data-project-workbench-resize="nw" aria-hidden="true"></span>
      <span class="iz-workbench-resize-handle iz-workbench-resize-se" data-project-workbench-resize="se" aria-hidden="true"></span>
      <span class="iz-workbench-resize-handle iz-workbench-resize-sw" data-project-workbench-resize="sw" aria-hidden="true"></span>
    `;

    projectPanelDebug("after modal innerHTML", {
      confirmButtonExists: !!document.getElementById("projectInspectorAddConfirmBtn"),
      selectButtons: els.calendarPanelContent.querySelectorAll("[data-project-inspector-select-employee]").length,
      availableRows: els.calendarPanelContent.querySelectorAll("[data-project-available-person-row]").length
    });

    const rerenderPanel = (focusSearch = false) => {
      renderProjectInspectorPanel(project);
      if (focusSearch) {
        const input = document.getElementById("projectInspectorSearchInput");
        if (input) {
          input.focus();
          const len = input.value.length;
          input.setSelectionRange(len, len);
        }
      }
    };

    setupProjectWorkbenchWindowControls(project);

    const searchInput = document.getElementById("projectInspectorSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", event => {
        state.projectInspectorSearch = event.target.value || "";
        rerenderPanel(true);
      });
    }
    const groupFilter = document.getElementById("projectInspectorGroupFilter");
    if (groupFilter) {
      groupFilter.addEventListener("change", event => {
        state.projectInspectorGroup = event.target.value || "all";
        rerenderPanel(false);
      });
    }

    els.calendarPanelContent.querySelectorAll("[data-calendar-panel-edit-project], [data-project-workbench-edit]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const projectId = btn.dataset.projectWorkbenchEdit || btn.dataset.calendarPanelEditProject || state.focusProjectId || "";
        openProjectWorkbenchEditModal(projectId);
      });
    });

    const selectProjectInspectorCandidate = (employeeName, suggestedRole = "", options = {}) => {
      if (!employeeName) return;
      if (options.toggle && state.projectInspectorAddCandidateName === employeeName) {
        state.projectInspectorAddCandidateName = "";
        state.projectInspectorAddRole = "";
        state.projectInspectorAddUseCustomRange = false;
        rerenderPanel(false);
        return;
      }
      primeProjectInspectorCandidate(project, employeeName, suggestedRole || getDefaultRoleForIndex(0));
      state.projectInspectorShowAvailable = true;
      rerenderPanel(false);
      requestAnimationFrame(() => {
        const addBox = document.getElementById("projectInspectorStableAddBox");
        if (addBox && typeof addBox.scrollIntoView === "function") {
          addBox.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      });
    };

    els.calendarPanelContent.querySelectorAll("[data-project-available-person-row]").forEach(row => {
      row.addEventListener("click", event => {
        if (event.target?.closest?.("button, input, select, textarea, label")) return;
        selectProjectInspectorCandidate(row.dataset.projectAvailablePersonRow || "", row.dataset.projectInspectorRowRole || getDefaultRoleForIndex(0), { toggle: true });
      });
    });

    els.calendarPanelContent.querySelectorAll("[data-project-inspector-select-employee]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        selectProjectInspectorCandidate(btn.dataset.projectInspectorSelectEmployee || "", btn.dataset.projectInspectorSelectRole || getDefaultRoleForIndex(0), { toggle: true });
      });
    });

    els.calendarPanelContent.querySelectorAll("[data-project-inspector-quick-add]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const employeeName = btn.dataset.projectInspectorQuickAdd || "";
        btn.disabled = true;
        btn.textContent = "Legger til…";
        btn.closest(".iz-workbench-person")?.classList.add("is-pending");
        state.projectInspectorAddUseCustomRange = false;
        state.projectInspectorAddRole = btn.dataset.projectInspectorSelectRole || getDefaultRoleForIndex(0);
        void createProjectInspectorAssignments(project.id, [employeeName], { role: state.projectInspectorAddRole });
      });
    });

    els.calendarPanelContent.querySelectorAll("[data-project-inspector-batch-select]").forEach(input => {
      input.addEventListener("click", event => event.stopPropagation());
      input.addEventListener("change", event => {
        event.stopPropagation();
        toggleProjectInspectorSelectedName(project, input.dataset.projectInspectorBatchSelect || "", input.checked);
        state.projectInspectorAddCandidateName = "";
        rerenderPanel(false);
      });
    });

    els.calendarPanelContent.querySelectorAll("[data-project-inspector-toggle-batch]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        state.projectInspectorBatchMode = btn.dataset.projectInspectorToggleBatch === "1";
        if (!state.projectInspectorBatchMode) state.projectInspectorSelectedNames = [];
        state.projectInspectorAddCandidateName = "";
        rerenderPanel(false);
      });
    });

    document.getElementById("projectInspectorAddCancelBtn")?.addEventListener("click", event => {
      event.preventDefault();
      state.projectInspectorAddCandidateName = "";
      state.projectInspectorSelectedNames = [];
      state.projectInspectorAddRole = "";
      state.projectInspectorAddUseCustomRange = false;
      rerenderPanel(false);
    });
    document.getElementById("projectInspectorAddRoleSelect")?.addEventListener("change", event => {
      state.projectInspectorAddRole = event.target.value || "";
    });
    document.getElementById("projectInspectorWholePeriodRadio")?.addEventListener("change", () => {
      state.projectInspectorAddUseCustomRange = false;
      const bounds = getProjectInspectorProjectBounds(project);
      state.projectInspectorAddCustomStart = bounds.start || "";
      state.projectInspectorAddCustomEnd = bounds.end || "";
      rerenderPanel(false);
    });
    document.getElementById("projectInspectorCustomPeriodRadio")?.addEventListener("change", () => {
      state.projectInspectorAddUseCustomRange = true;
      if (!state.projectInspectorAddCustomStart || !state.projectInspectorAddCustomEnd) {
        const bounds = getProjectInspectorProjectBounds(project);
        state.projectInspectorAddCustomStart = state.projectInspectorAddCustomStart || bounds.start || "";
        state.projectInspectorAddCustomEnd = state.projectInspectorAddCustomEnd || bounds.end || "";
      }
      rerenderPanel(false);
    });
    document.getElementById("projectInspectorCustomStartInput")?.addEventListener("change", event => {
      state.projectInspectorAddCustomStart = event.target.value || "";
    });
    document.getElementById("projectInspectorCustomEndInput")?.addEventListener("change", event => {
      state.projectInspectorAddCustomEnd = event.target.value || "";
    });

    const captureProjectInspectorAddForm = () => {
      const roleSelect = document.getElementById("projectInspectorAddRoleSelect");
      if (roleSelect) state.projectInspectorAddRole = roleSelect.value || state.projectInspectorAddRole || getDefaultRoleForIndex(0);
      const customPeriodRadio = document.getElementById("projectInspectorCustomPeriodRadio");
      const bounds = getProjectInspectorProjectBounds(project);
      const customStart = document.getElementById("projectInspectorCustomStartInput");
      const customEnd = document.getElementById("projectInspectorCustomEndInput");
      if (customPeriodRadio?.checked) {
        state.projectInspectorAddUseCustomRange = true;
        if (customStart) state.projectInspectorAddCustomStart = customStart.value || state.projectInspectorAddCustomStart || bounds.start || "";
        if (customEnd) state.projectInspectorAddCustomEnd = customEnd.value || state.projectInspectorAddCustomEnd || bounds.end || "";
      } else {
        state.projectInspectorAddUseCustomRange = false;
        state.projectInspectorAddCustomStart = bounds.start || project?.planned_start_date || state.projectInspectorAddCustomStart || "";
        state.projectInspectorAddCustomEnd = bounds.end || project?.planned_end_date || state.projectInspectorAddCustomEnd || "";
      }
    };

    els.calendarPanelContent.querySelectorAll("[data-project-inspector-confirm-add]").forEach(confirmBtn => {
      confirmBtn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const employeeName = btn?.dataset?.projectInspectorConfirmEmployee || state.projectInspectorAddCandidateName || "";
        if (employeeName && state.projectInspectorAddCandidateName !== employeeName) {
          primeProjectInspectorCandidate(project, employeeName, state.projectInspectorAddRole || getDefaultRoleForIndex(0));
        }
        captureProjectInspectorAddForm();
        void createProjectInspectorAssignment(project.id);
      });
    });

    els.calendarPanelContent.querySelectorAll("[data-project-inspector-confirm-batch]").forEach(confirmBtn => {
      confirmBtn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        captureProjectInspectorAddForm();
        const names = getProjectInspectorSelectedNames(project);
        void createProjectInspectorAssignments(project.id, names, { role: state.projectInspectorAddRole || getProjectInspectorRoleForBatch(project) });
      });
    });

    els.calendarPanelContent.querySelectorAll("[data-project-entry-edit-id]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openEditModal(btn.dataset.projectEntryEditId);
      });
    });
    els.calendarPanelContent.querySelectorAll("[data-project-entry-delete-id]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        deleteEntryFromProjectCard(btn.dataset.projectEntryDeleteId);
      });
    });
  }

  function renderCalendarPanel() {
    if (!els.calendarPanelCol || !els.calendarPanelHandleBtn || !els.calendarPanelContent) return;

    if (state.calendarMode === "project") {
      const project = state.calendarPanelOpen ? getProjectById(state.focusProjectId || "") : null;
      if (!project) {
        if (els.calendarPanelCol) {
          ["position", "inset", "left", "top", "width", "height", "right", "bottom", "min-width", "min-height", "max-width", "max-height", "transform", "z-index", "display", "pointer-events", "box-sizing", "overflow"].forEach(prop => {
            els.calendarPanelCol.style.removeProperty(prop);
          });
        }
        els.calendarPanelCol.className = "hidden";
        els.calendarPanelContent.className = "hidden min-w-0 flex-1";
        return;
      }
      els.calendarPanelCol.className = "iz-project-inspector-shell iz-project-modal-workbench";
      els.calendarPanelHandleBtn.className = "hidden";
      els.calendarPanelHandleBtn.textContent = "";
      els.calendarPanelContent.className = "iz-project-workbench-container min-w-0";
      if (!state.projectWorkbenchWindow) state.projectWorkbenchWindow = getProjectWorkbenchDefaultRect();
      applyProjectWorkbenchWindowState();
      renderProjectInspectorPanel(project);
      return;
    }

    // v18.31e: Ansattplan skal ikke arve prosjektpanelet.
    // Høyrepanelet skjules helt utenfor Prosjektplan for å unngå tom mørk boks/regresjon.
    if (els.calendarPanelCol) {
      ["position", "inset", "left", "top", "width", "height", "right", "bottom", "min-width", "min-height", "max-width", "max-height", "transform", "z-index", "display", "pointer-events", "box-sizing", "overflow"].forEach(prop => {
        els.calendarPanelCol.style.removeProperty(prop);
      });
    }
    els.calendarPanelCol.className = "hidden";
    els.calendarPanelContent.className = "hidden min-w-0 flex-1";
    els.calendarPanelHandleBtn.className = "hidden";
    return;

    const isDesktop = window.innerWidth >= 1280;

    if (!isDesktop) {
      els.calendarPanelCol.className = "w-full shrink-0 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden transition-all duration-300";
      els.calendarPanelContent.classList.remove("hidden");
      els.calendarPanelHandleBtn.className = "w-12 shrink-0 border-r border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold tracking-wide";
      els.calendarPanelHandleBtn.textContent = "Panel";
      return;
    }

    if (state.calendarPanelOpen) {
      els.calendarPanelCol.className = "xl:w-80 w-full shrink-0 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden transition-all duration-300";
      els.calendarPanelContent.classList.remove("hidden");
      els.calendarPanelHandleBtn.className = "w-11 shrink-0 border-r border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold tracking-wide [writing-mode:vertical-rl] rotate-180";
      els.calendarPanelHandleBtn.textContent = "Panel";
    } else {
      els.calendarPanelCol.className = "xl:w-11 w-full shrink-0 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden transition-all duration-300";
      els.calendarPanelContent.classList.add("hidden");
      els.calendarPanelHandleBtn.className = "w-11 shrink-0 border-r-0 bg-slate-50 text-slate-700 text-xs font-semibold tracking-wide [writing-mode:vertical-rl] rotate-180";
      els.calendarPanelHandleBtn.textContent = "Panel";
    }
  }

  function getRelevantProjectStatuses() {
    return ["Planlagt", "Pågår", "Avventer"];
  }

  function getActiveProjectsForWorkspace() {
    const relevant = new Set(getRelevantProjectStatuses());
    return getVisibleProjects()
      .filter(project => relevant.has(project.status))
      .slice()
      .sort((a, b) => compareProjectDates(a, b));
  }

  function getArchivedProjectsForWorkspace() {
    return getVisibleProjects()
      .filter(project => isClosedProject(project))
      .slice()
      .sort((a, b) => compareProjectDates(a, b));
  }

  function setFocusProject(projectId) {
    const nextProjectId = projectId || "";
    if (state.focusProjectId !== nextProjectId) resetProjectInspectorFilters();
    state.focusProjectId = nextProjectId;
    if (projectId && els.assignProject) {
      els.assignProject.value = projectId;
      syncAssignDatesFromProject({ projectId, rows: [] });
      updateAvailabilityAnalysis();
    }
    renderProjects();
  }

  function ensureFocusProject(activeProjects, archivedProjects) {
    const allProjects = [...activeProjects, ...archivedProjects];
    if (!allProjects.length) {
      state.focusProjectId = "";
      return null;
    }

    let focused = allProjects.find(project => project.id === state.focusProjectId) || null;
    if (!focused) {
      focused = activeProjects[0] || archivedProjects[0] || null;
      state.focusProjectId = focused?.id || "";
    }

    return focused;
  }

  function renderProjectWorkspace(project) {
    if (!els.projectWorkspaceCard || !els.projectWorkspaceEmpty || !els.projectWorkspaceContent) return;

    if (!project) {
      els.projectWorkspaceEmpty.classList.remove("hidden");
      els.projectWorkspaceContent.classList.add("hidden");
      if (els.projectWorkspaceTitle) els.projectWorkspaceTitle.textContent = "Ingen prosjekt valgt";
      if (els.projectWorkspaceMeta) els.projectWorkspaceMeta.innerHTML = "";
      if (els.projectWorkspaceNotes) els.projectWorkspaceNotes.textContent = "";
      if (els.projectWorkspaceAssignments) els.projectWorkspaceAssignments.innerHTML = `<div class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">Velg et prosjekt fra listen for å se detaljer.</div>`;
      if (els.projectWorkspaceActions) els.projectWorkspaceActions.innerHTML = "";
      return;
    }

    const assigned = getProjectAssignedCount(project.id);
    const required = Number(project.headcount_required || 0);
    const staffing = getProjectStaffingLabel(project.id, required);
    const staffingTone = staffing.variant.includes('green')
      ? 'border-green-200 bg-green-50 text-green-800'
      : staffing.variant.includes('amber')
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';
    const projectEntries = state.entries
      .filter(entry => entry.project_id === project.id)
      .slice()
      .sort((a, b) => a.start_date.localeCompare(b.start_date) || a.employee_name.localeCompare(b.employee_name, "no"));
    const periodStatuses = getProjectPeriodStatusItems(project);

    els.projectWorkspaceEmpty.classList.add("hidden");
    els.projectWorkspaceContent.classList.remove("hidden");
    if (els.projectWorkspaceTitle) els.projectWorkspaceTitle.textContent = project.name;
    if (els.projectWorkspaceMeta) {
      els.projectWorkspaceMeta.innerHTML = `
        <div class="flex flex-wrap gap-2">
          <span class="rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[project.status] || "bg-slate-100 border-slate-200 text-slate-700"}">${escapeHtml(project.status)}</span>
          <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">${escapeHtml(project.category || "Feltoppdrag")}</span>
          ${project.project_responsible ? `<span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">Prosjektleder: ${escapeHtml(project.project_responsible)}</span>` : ""}
          ${project.location ? `<span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">Kunde: ${escapeHtml(project.location)}</span>` : ""}
          <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">Bemanningsbehov: ${required}</span>
          ${periodStatuses.length ? `<span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">Flere perioder: ${periodStatuses.length}</span>` : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Planlagt periode</div>
            <div class="mt-2 text-sm text-slate-700 leading-6">${escapeHtml(formatProjectDateRange(project))}</div>
          </div>
          <div class="rounded-[22px] border ${staffingTone} px-4 py-4">
            <div class="text-xs font-semibold uppercase tracking-wide opacity-80">Bemanningsstatus</div>
            <div class="mt-2 text-base font-semibold">${escapeHtml(staffing.text)}</div>
            <div class="mt-1 text-sm opacity-90">${required ? `${assigned}/${required} tildelt` : 'Ingen plasser definert'}</div>
          </div>
          <div class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</div>
            <div class="mt-2 text-base font-semibold text-slate-900">${escapeHtml(project.status)}</div>
            <div class="mt-1 text-sm text-slate-500">${escapeHtml(project.location ? `Kunde: ${project.location}` : 'Kunde ikke satt')}</div>
          </div>
        </div>
        ${periodStatuses.length ? `
          <div>
            <div class="mb-3 text-sm font-medium text-slate-700">Periode-status</div>
            <div class="space-y-3">
              ${periodStatuses.map(item => {
                const badgeClass = item.tone === 'green'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : item.tone === 'amber'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700';
                return `
                  <div class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="text-sm font-semibold text-slate-900">Periode ${item.index + 1} — bemannet ${item.assigned}/${item.required}</div>
                        <div class="mt-1 text-sm text-slate-500">${escapeHtml(formatDate(item.period.start))} – ${escapeHtml(formatDate(item.period.end))}</div>
                      </div>
                      <span class="rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass}">${escapeHtml(item.label)}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      `;
    }
    if (els.projectWorkspaceNotes) {
      els.projectWorkspaceNotes.textContent = project.notes || "Ingen prosjektnotater.";
    }
    if (els.projectWorkspaceAssignments) {
      els.projectWorkspaceAssignments.innerHTML = projectEntries.length
        ? projectEntries.map(entry => `
          <div class="flex items-start justify-between gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
            <div class="flex items-start gap-3 min-w-0">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">${escapeHtml(getInitials(entry.employee_name))}</div>
              <div class="min-w-0">
                <div class="text-sm font-medium text-slate-900 truncate">${escapeHtml(entry.employee_name)}</div>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  ${entry.role ? `<span class="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-700">${escapeHtml(entry.role)}</span>` : ''}
                  <span class="text-slate-500">${escapeHtml(formatDate(entry.start_date))} – ${escapeHtml(formatDate(entry.end_date))}</span>
                </div>
                ${entry.notes ? `<div class="mt-2 text-xs text-slate-500">${escapeHtml(entry.notes)}</div>` : ''}
              </div>
            </div>
            <button data-project-entry-delete-id="${escapeHtml(entry.id)}" class="shrink-0 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50">Fjern</button>
          </div>
        `).join("")
        : `<div class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">Ingen tildelte ressurser på prosjektet ennå.</div>`;
    }
    if (els.projectWorkspaceActions) {
      els.projectWorkspaceActions.innerHTML = `
        <button data-project-workspace-staff-id="${escapeHtml(project.id)}" class="rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium shadow-sm">${window.izomaxTranslateKey?.("staffProject") || "Bemann prosjekt"}</button>
        <button data-project-workspace-edit-id="${escapeHtml(project.id)}" class="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">${window.izomaxTranslateKey?.("editProject") || "Rediger prosjekt"}</button>
      `;
      const staffBtn = els.projectWorkspaceActions.querySelector('[data-project-workspace-staff-id]');
      const editBtn = els.projectWorkspaceActions.querySelector('[data-project-workspace-edit-id]');
      if (staffBtn) staffBtn.addEventListener('click', () => startProjectStaffing(project.id));
      if (editBtn) editBtn.addEventListener('click', () => openProjectModal(project.id));
    }
    els.projectWorkspaceAssignments.querySelectorAll('[data-project-entry-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => deleteEntryFromProjectCard(btn.dataset.projectEntryDeleteId));
    });
  }



  function renderProjectImportInlineCards() {
    if (!els.tabProjectsSection) return;
    const preview = getProjectImportPreviewState();

    els.tabProjectsSection.innerHTML = `
      <div class="xl:col-span-12">
        <div class="rounded-[28px] bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-200 bg-slate-50/80">
            <h2 class="font-semibold text-lg text-slate-900">Prosjektimport</h2>
            <p class="text-sm text-slate-500 mt-1">CSV-preview og arbeidsliste. Ingen data lagres eller importeres ennå.</p>
          </div>

          <div class="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <div class="text-sm font-semibold text-slate-900">1. Last opp fil</div>
              <p class="mt-1 text-xs text-slate-600">Velg CSV-fil fra PC.</p>
              <input id="projectImportInlineFile" type="file" accept=".csv,text/csv" class="mt-3 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
              <div id="projectImportInlineFileStatus" class="mt-2 text-xs text-slate-500">${escapeHtml(preview.statusText || "Ingen fil valgt.")}</div>
              <button id="projectImportInlineClearBtn" type="button" class="mt-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">Nullstill</button>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <div class="text-sm font-semibold text-slate-900">2. Analyse / oppsummering</div>
              <p class="mt-1 text-xs text-slate-600">Statusfordeling etter opplasting.</p>
              <div id="projectImportInlineSummary" class="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-2 text-sm">
                ${renderProjectImportInlineSummaryCards(preview.counts)}
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-sm font-semibold text-slate-900">3. Importstatus</div>
              <p class="mt-1 text-xs text-slate-600">Import/lagring bygges først etter at arbeidslisten er godkjent.</p>
              <button id="projectImportTestImportBtn" type="button" class="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">Importer valgte</button>
              <div class="mt-2 text-xs text-slate-500">Safe import: maks 10 valgte rader. Ingen rader er valgt som standard. Skriver til live database.</div>
              <div id="projectImportTestResult" class="mt-3 text-xs text-slate-600"></div>
            </div>
          </div>

          <div class="border-t border-slate-200 bg-white p-5">
            <div class="mb-4">
              <h3 class="text-base font-semibold text-slate-900">Arbeidsliste før eventuell import</h3>
              <div id="projectImportInlineDetails" class="hidden">${renderProjectImportInlineDetailsHtml(preview.examples, preview.rowCount)}</div>
              <div class="mt-3 flex flex-wrap justify-start gap-2 text-xs">
                ${renderProjectImportWorklistFilters(preview.worklistFilter || "all", preview)}
              </div>
            </div>
            <div class="mb-4 space-y-3">
              ${renderSelectedProjectImportSummaryHtml(preview)}
              ${renderProjectImportLastSummaryHtml(preview)}
            </div>
            <div id="projectImportInlineApprovalList">${renderProjectImportApprovalListHtml(preview)}</div>
          </div>
        </div>
      </div>
    `;

    bindProjectImportInlineControls();
    bindProjectImportApprovalListControls();
    bindProjectImportTestControls();
  }


  function getDefaultProjectImportPreviewState() {
    return {
      fileName: "",
      rowCount: 0,
      counts: { total: 0, readyNew: 0, noChange: 0, dateUpdate: 0, missingOperationDate: 0, missingHeadcount: 0, workshopDateError: 0, notReady: 0 },
      examples: { readyNew: [], noChange: [], dateUpdate: [], missingOperationDate: [], missingHeadcount: [], workshopDateError: [], notReady: [] },
      approvalRows: [],
      worklistRows: [],
      selectedIds: [],
      worklistFilter: "all",
      statusText: "Ingen fil valgt."
    };
  }

  function getProjectImportPreviewState() {
    const current = state.projectImportPreview || {};
    const fallback = getDefaultProjectImportPreviewState();
    return {
      ...fallback,
      ...current,
      counts: { ...fallback.counts, ...(current.counts || {}) },
      examples: { ...fallback.examples, ...(current.examples || {}) },
      approvalRows: Array.isArray(current.approvalRows) ? current.approvalRows : [],
      worklistRows: Array.isArray(current.worklistRows) ? current.worklistRows : [],
      selectedIds: Array.isArray(current.selectedIds) ? current.selectedIds : [],
      importResults: current.importResults && typeof current.importResults === "object" ? current.importResults : {},
      lastImportSummary: current.lastImportSummary || null,
      worklistFilter: current.worklistFilter || "all"
    };
  }

  function resetProjectImportPreviewState() {
    state.projectImportPreview = getDefaultProjectImportPreviewState();
  }

  function renderProjectImportInlineDetailsHtml(examples = {}, rowCount = 0) {
    if (!rowCount) return "Ingen preview kjørt.";
    const labels = [
      ["readyNew", "Ny – klar"],
      ["workshopOnly", "Workshop-only"],
      ["dateUpdate", "Datooppdatering"],
      ["noChange", "Eksisterer – ingen endring"],
      ["missingOperationDate", "Mangler operasjonsdato"],
      ["missingHeadcount", "Mangler ressursbehov"],
      ["workshopDateError", "Workshop datoavvik"],
      ["notReady", "Ikke klar"]
    ];
    const lines = labels
      .filter(([key]) => examples[key]?.length)
      .map(([key, label]) => `${label}: ${examples[key].join(", ")}`);
    return lines.length
      ? lines.map(line => `<div class="mb-1">${escapeHtml(line)}</div>`).join("")
      : "CSV lest, men ingen rader kunne klassifiseres.";
  }

  function getProjectImportStatusLabel(statusKey) {
    const labels = {
      readyNew: "Ny – klar",
      workshopOnly: "Workshop-only",
      dateUpdate: "Eksisterer – datooppdatering",
      noChange: "Eksisterer – ingen endring",
      missingOperationDate: "Mangler operasjonsdato",
      missingHeadcount: "Mangler ressursbehov",
      workshopDateError: "Workshop datoavvik",
      notReady: "Ikke klar"
    };
    return labels[statusKey] || "Ikke klar";
  }

  function getProjectImportStatusBadgeClass(statusKey) {
    const classes = {
      readyNew: "border-green-200 bg-green-50 text-green-700",
      workshopOnly: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dateUpdate: "border-blue-200 bg-blue-50 text-blue-700",
      noChange: "border-slate-200 bg-slate-50 text-slate-700",
      missingOperationDate: "border-amber-200 bg-amber-50 text-amber-800",
      missingHeadcount: "border-amber-200 bg-amber-50 text-amber-800",
      workshopDateError: "border-rose-200 bg-rose-50 text-rose-700",
      notReady: "border-rose-200 bg-rose-50 text-rose-700"
    };
    return classes[statusKey] || classes.notReady;
  }

  function renderProjectImportWorklistFilters(activeFilter = "all", preview = getProjectImportPreviewState()) {
    const rows = Array.isArray(preview.worklistRows) ? preview.worklistRows : [];
    const filterDefs = [
      ["all", "Alle", rows.length],
      ["readyNew", "Klar", rows.filter(row => row.statusKey === "readyNew").length],
      ["workshopOnly", "Workshop-only", rows.filter(row => row.statusKey === "workshopOnly").length],
      ["dateUpdate", "Datooppdatering", rows.filter(row => row.statusKey === "dateUpdate").length],
      ["missingOperationDate", "Mangler dato", rows.filter(row => row.statusKey === "missingOperationDate").length],
      ["missingHeadcount", "Mangler techs", rows.filter(row => row.statusKey === "missingHeadcount").length],
      ["workshopDateError", "WS-feil", rows.filter(row => row.statusKey === "workshopDateError").length],
      ["noChange", "Ingen endring", rows.filter(row => row.statusKey === "noChange").length],
      ["notReady", "Ikke klar", rows.filter(row => row.statusKey === "notReady").length]
    ];

    return filterDefs.map(([key, label, count]) => `
      <button type="button" data-project-import-filter="${escapeHtml(key)}" class="rounded-xl border px-3 py-2 font-semibold ${activeFilter === key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}">
        ${escapeHtml(label)} <span class="opacity-75">${escapeHtml(String(count))}</span>
      </button>
    `).join("");
  }


  function formatProjectImportNorwegianDate(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return raw || "";
    return `${match[3]}.${match[2]}.${match[1].slice(2)}`;
  }

  function parseProjectImportNorwegianDateInput(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";

    const digits = raw.replace(/[^\d]/g, "");

    if (/^\d{6}$/.test(digits)) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = `20${digits.slice(4, 6)}`;
      return isValidProjectImportIsoDate(`${year}-${month}-${day}`) ? `${year}-${month}-${day}` : "";
    }

    if (/^\d{8}$/.test(digits)) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      return isValidProjectImportIsoDate(`${year}-${month}-${day}`) ? `${year}-${month}-${day}` : "";
    }

    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      return isValidProjectImportIsoDate(raw) ? raw : "";
    }

    const dotted = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/);
    if (dotted) {
      const day = dotted[1].padStart(2, "0");
      const month = dotted[2].padStart(2, "0");
      const year = dotted[3].length === 2 ? `20${dotted[3]}` : dotted[3];
      const isoValue = `${year}-${month}-${day}`;
      return isValidProjectImportIsoDate(isoValue) ? isoValue : "";
    }

    return "";
  }

  function isValidProjectImportIsoDate(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;
    const date = new Date(`${raw}T00:00:00`);
    return Number.isFinite(date.getTime())
      && date.getUTCFullYear() === Number(match[1])
      && date.getUTCMonth() + 1 === Number(match[2])
      && date.getUTCDate() === Number(match[3]);
  }


  function isProjectImportFleetRow(row) {
    const name = String(row?.name || "").toLowerCase();
    return name.includes("fleet");
  }

  function getProjectImportActionLabel(row) {
    if (!row) return "Skip";
    if (row.statusKey === "readyNew" || row.statusKey === "workshopOnly") return "Create";
    if (row.statusKey === "dateUpdate") return "Update dates only";
    return "Skip";
  }

  function getProjectImportActionHint(row) {
    if (!row) return "";
    if (row.statusKey === "readyNew") return "nytt feltprosjekt";
    if (row.statusKey === "workshopOnly") return "grønn workshop only";
    if (row.statusKey === "dateUpdate") return "kun datoer, ikke techs";
    if (row.statusKey === "noChange") return "ingen endring";
    return "ikke klar";
  }


  function getProjectImportRowResult(row, preview = getProjectImportPreviewState()) {
    return preview.importResults?.[row?.id || ""] || null;
  }

  function getProjectImportRowResultHtml(row, preview = getProjectImportPreviewState()) {
    const result = getProjectImportRowResult(row, preview);
    if (!result) return "";
    const tone = result.type === "created"
      ? "border-green-200 bg-green-50 text-green-800"
      : result.type === "updated"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : result.type === "error"
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-slate-200 bg-slate-50 text-slate-700";
    return `<div class="mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${tone}">${escapeHtml(result.label || "Behandlet")}</div>`;
  }

  function getSelectedProjectImportSummary(preview = getProjectImportPreviewState()) {
    const selected = new Set(preview.selectedIds || []);
    const rows = (preview.worklistRows || []).filter(row => selected.has(row.id));
    const plan = getProjectImportExecutionPlan(rows);
    return { rows, plan };
  }

  function renderSelectedProjectImportSummaryHtml(preview = getProjectImportPreviewState()) {
    const { rows, plan } = getSelectedProjectImportSummary(preview);
    if (!preview.rowCount) return "";

    if (!rows.length) {
      return `
        <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <div class="font-semibold text-slate-900">Valgt for import: 0</div>
          <div class="mt-1 text-xs">Huk av rader i arbeidslisten før import. Ingen rader velges automatisk.</div>
        </div>
      `;
    }

    const sampleNames = rows.slice(0, 8).map(row => row.name || "Uten navn");
    const moreCount = Math.max(rows.length - sampleNames.length, 0);

    return `
      <div class="rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-4 text-sm text-blue-950">
        <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div class="font-semibold">Valgt for import: ${rows.length}</div>
            <div class="mt-1 text-xs text-blue-900">
              Create: ${plan.createRows.length} · Workshop-only: ${plan.workshopRows.length} · Update dates only: ${plan.updateRows.length} · Skip/ikke klar: ${plan.skippedRows.length}
            </div>
            <div class="mt-3 grid gap-1 text-xs">
              ${sampleNames.map(name => `<div>• ${escapeHtml(name)}</div>`).join("")}
              ${moreCount ? `<div>• +${moreCount} flere valgt</div>` : ""}
            </div>
          </div>
          <div class="shrink-0 rounded-xl border border-blue-200 bg-white/80 px-3 py-2 text-xs font-semibold text-blue-900">
            Maks 10 handlingsbare rader per import
          </div>
        </div>
      </div>
    `;
  }

  function renderProjectImportLastSummaryHtml(preview = getProjectImportPreviewState()) {
    const summary = preview.lastImportSummary;
    if (!summary) return "";
    return `
      <div class="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        <div class="font-semibold">Siste importstatus</div>
        <div class="mt-1 text-xs">
          Opprettet: ${summary.created || 0} · Oppdatert: ${summary.updated || 0} · Hoppet over: ${summary.skipped || 0} · Feil: ${summary.errors || 0}
        </div>
      </div>
    `;
  }

  function renderProjectImportApprovalListHtml(preview = getProjectImportPreviewState()) {
    const worklistRows = Array.isArray(preview.worklistRows) ? preview.worklistRows : [];
    const selectedIds = new Set(preview.selectedIds || []);
    const activeFilter = preview.worklistFilter || "all";

    if (!preview.rowCount) {
      return `<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">Last opp CSV for å se prosjektlisten.</div>`;
    }

    const visibleRows = activeFilter === "all"
      ? worklistRows
      : worklistRows.filter(row => row.statusKey === activeFilter);

    if (!visibleRows.length) {
      return `<div class="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-6 text-sm text-amber-800">Ingen rader i valgt filter.</div>`;
    }

    const selectedCount = worklistRows.filter(row => selectedIds.has(row.id)).length;

    return `
      <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div class="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-sm font-semibold text-slate-900">Arbeidsliste før eventuell import</div>
            <div class="text-xs text-slate-500 mt-1">${selectedCount} av ${worklistRows.length} valgt. Vellykket importerte rader fjernes automatisk fra valgt-listen.</div>
          </div>
          <div class="text-xs text-slate-500">Preview only</div>
        </div>
        <div class="overflow-auto max-h-[640px]">
          <table class="min-w-[1840px] w-full text-xs">
            <thead class="sticky top-0 z-10 bg-slate-100 text-slate-700">
              <tr>
                <th class="px-3 py-2 text-left font-semibold w-[56px]">Velg</th>
                <th class="px-3 py-2 text-left font-semibold w-[170px]">Status</th>
                <th class="px-3 py-2 text-left font-semibold w-[150px]">Handling</th>
                <th class="px-3 py-2 text-left font-semibold min-w-[330px]">Project Name</th>
                <th class="px-3 py-2 text-left font-semibold min-w-[190px]">Project Responsible</th>
                <th class="px-3 py-2 text-left font-semibold w-[150px]">Operation start</th>
                <th class="px-3 py-2 text-left font-semibold w-[150px]">Operation stop</th>
                <th class="px-3 py-2 text-left font-semibold w-[150px]">WS start</th>
                <th class="px-3 py-2 text-left font-semibold w-[150px]">WS stop</th>
                <th class="px-3 py-2 text-left font-semibold w-[125px]">Techs<br><span class="font-normal text-slate-500">nye only</span></th>
                <th class="px-3 py-2 text-left font-semibold min-w-[260px]">Kommentar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${visibleRows.map(row => {
                const checked = selectedIds.has(row.id) ? "checked" : "";
                const rowResult = getProjectImportRowResult(row, preview);
                const disabled = (row.statusKey === "noChange" || rowResult?.type === "created" || rowResult?.type === "updated") ? "disabled" : "";
                const rowTone = rowResult?.type === "created" || rowResult?.type === "updated"
                  ? "bg-green-50/70"
                  : selectedIds.has(row.id) ? "bg-white" : "bg-slate-50/70";
                return `
                  <tr class="${rowTone} hover:bg-slate-50">
                    <td class="px-3 py-2 align-top">
                      <input data-project-import-worklist-checkbox type="checkbox" value="${escapeHtml(row.id)}" ${checked} ${disabled} />
                    </td>
                    <td class="px-3 py-2 align-top">
                      <span class="inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${getProjectImportStatusBadgeClass(row.statusKey)}">${escapeHtml(getProjectImportStatusLabel(row.statusKey))}</span>
                      ${getProjectImportRowResultHtml(row, preview)}
                    </td>
                    <td class="px-3 py-2 align-top">
                      <div class="font-semibold text-slate-900">${escapeHtml(getProjectImportActionLabel(row))}</div>
                      <div class="mt-1 text-[11px] text-slate-500">${escapeHtml(getProjectImportActionHint(row))}</div>
                    </td>
                    <td class="px-3 py-2 align-top">
                      <div class="font-semibold text-slate-900">${escapeHtml(row.name || "-")}</div>
                      ${row.company ? `<div class="mt-1 text-slate-500">${escapeHtml(row.company)}</div>` : ""}
                      ${row.projectCode ? `<div class="mt-1 text-[11px] text-slate-500">Kode: ${escapeHtml(row.projectCode)}${row.matchType === "projectCode" ? " · Matchet på kode" : ""}</div>` : ""}
                    </td>
                    <td class="px-3 py-2 align-top text-slate-700">
                      ${escapeHtml(row.projectResponsible || "-")}
                    </td>
                    <td class="px-3 py-2 align-top">
                      <input data-project-import-edit data-date-field="true" data-field="operationStart" data-row-id="${escapeHtml(row.id)}" type="text" inputmode="numeric" placeholder="DDMMYY" value="${escapeHtml(formatProjectImportNorwegianDate(row.operationStart))}" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-950 placeholder:text-slate-400" />
                    </td>
                    <td class="px-3 py-2 align-top">
                      <input data-project-import-edit data-date-field="true" data-field="operationStop" data-row-id="${escapeHtml(row.id)}" type="text" inputmode="numeric" placeholder="DDMMYY" value="${escapeHtml(formatProjectImportNorwegianDate(row.operationStop))}" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-950 placeholder:text-slate-400" />
                    </td>
                    <td class="px-3 py-2 align-top">
                      <input data-project-import-edit data-date-field="true" data-field="wsStart" data-row-id="${escapeHtml(row.id)}" type="text" inputmode="numeric" placeholder="DDMMYY" value="${escapeHtml(formatProjectImportNorwegianDate(row.wsStart))}" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-950 placeholder:text-slate-400" />
                    </td>
                    <td class="px-3 py-2 align-top">
                      <input data-project-import-edit data-date-field="true" data-field="wsStop" data-row-id="${escapeHtml(row.id)}" type="text" inputmode="numeric" placeholder="DDMMYY" value="${escapeHtml(formatProjectImportNorwegianDate(row.wsStop))}" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-950 placeholder:text-slate-400" />
                    </td>
                    <td class="px-3 py-2 align-top">
                      <input data-project-import-edit data-field="techs" data-row-id="${escapeHtml(row.id)}" type="number" min="0" step="1" value="${escapeHtml(String(row.techs ?? ""))}" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-950" />
                      <div class="mt-1 text-[10px] text-slate-500">${escapeHtml(row.existingProjectId ? "endres ikke ved update" : "brukes ved create")}</div>
                    </td>
                    <td class="px-3 py-2 align-top text-slate-600">${escapeHtml(row.comment || "")}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function bindProjectImportApprovalListControls() {
    const wrap = document.getElementById("projectImportInlineApprovalList");
    const section = els.tabProjectsSection;
    if (!section || section.dataset.boundProjectImportWorklist) return;
    section.dataset.boundProjectImportWorklist = "true";

    section.addEventListener("click", event => {
      const filterBtn = event.target.closest("[data-project-import-filter]");
      if (!filterBtn) return;
      const preview = getProjectImportPreviewState();
      state.projectImportPreview = {
        ...preview,
        worklistFilter: filterBtn.dataset.projectImportFilter || "all"
      };
      renderProjectImportInlineCards();
    });

    section.addEventListener("change", event => {
      const checkbox = event.target.closest("[data-project-import-worklist-checkbox]");
      if (checkbox) {
        const preview = getProjectImportPreviewState();
        const selected = new Set(preview.selectedIds || []);
        if (checkbox.checked) selected.add(checkbox.value);
        else selected.delete(checkbox.value);
        state.projectImportPreview = {
          ...preview,
          selectedIds: Array.from(selected)
        };
        renderProjectImportInlineCards();
        return;
      }

      const editInput = event.target.closest("[data-project-import-edit]");
      if (editInput) {
        const normalizedValue = editInput.dataset.dateField === "true"
          ? parseProjectImportNorwegianDateInput(editInput.value || "")
          : (editInput.value || "");
        updateProjectImportWorklistRow(editInput.dataset.rowId || "", editInput.dataset.field || "", normalizedValue);
        return;
      }
    });
  }

  function updateProjectImportWorklistRow(rowId, field, value) {
    if (!rowId || !field) return;
    const preview = getProjectImportPreviewState();
    const worklistRows = (preview.worklistRows || []).map(row => {
      if (row.id !== rowId) return row;
      return { ...row, [field]: value };
    });

    const recalculated = recalculateProjectImportPreviewFromWorklist(worklistRows, preview);
    state.projectImportPreview = recalculated;
    renderProjectImportInlineCards();
  }

  function recalculateProjectImportPreviewFromWorklist(worklistRows, previousPreview = getProjectImportPreviewState()) {
    const existingMaps = buildProjectImportExistingMaps();
    const counts = { total: worklistRows.length, readyNew: 0, workshopOnly: 0, noChange: 0, dateUpdate: 0, missingOperationDate: 0, missingHeadcount: 0, workshopDateError: 0, notReady: 0 };
    const examples = { readyNew: [], workshopOnly: [], noChange: [], dateUpdate: [], missingOperationDate: [], missingHeadcount: [], workshopDateError: [], notReady: [] };
    const selected = new Set(previousPreview.selectedIds || []);

    const nextRows = worklistRows.map(row => {
      const match = findExistingProjectForImportName(row.name, existingMaps);
      const existing = match.project;
      const statusKey = classifyProjectImportWorklistRow(row, existing);
      const nextRow = {
        ...row,
        existingProjectId: existing?.id || "",
        matchType: match.matchType || "",
        projectCode: match.code || extractProjectImportCode(row.name),
        action: statusKey === "dateUpdate" ? "update" : (statusKey === "readyNew" || statusKey === "workshopOnly") ? "create" : "",
        statusKey,
        comment: getProjectImportWorklistComment(statusKey, existing, match.matchType)
      };
      counts[statusKey] = (counts[statusKey] || 0) + 1;
      if (examples[statusKey] && examples[statusKey].length < 5) {
        examples[statusKey].push(nextRow.name || "Uten navn");
      }
      // Safety: never auto-select rows for live import.
      // User must actively tick rows before import.
      if (statusKey === "noChange") selected.delete(nextRow.id);
      return nextRow;
    });

    return {
      ...previousPreview,
      rowCount: nextRows.length,
      counts,
      examples,
      worklistRows: nextRows,
      approvalRows: nextRows.filter(row => row.statusKey === "readyNew" || row.statusKey === "workshopOnly" || row.statusKey === "dateUpdate"),
      selectedIds: Array.from(selected).filter(id => nextRows.some(row => row.id === id) && !previousPreview.importResults?.[id]),
      importResults: previousPreview.importResults || {},
      lastImportSummary: previousPreview.lastImportSummary || null,
      statusText: previousPreview.statusText || "CSV lest. Ingen data er lagret."
    };
  }

  function classifyProjectImportWorklistRow(row, existing = null) {
    const name = String(row.name || "").trim();
    const operationStart = String(row.operationStart || "").trim();
    const operationStop = String(row.operationStop || "").trim();
    const wsStart = String(row.wsStart || "").trim();
    const wsStop = String(row.wsStop || "").trim();
    const techsRaw = String(row.techs ?? "").trim();
    const techsNumber = techsRaw === "" ? null : Number(techsRaw.replace(",", "."));
    const hasOperationDates = Boolean(operationStart && operationStop);
    const hasWorkshopDates = Boolean(wsStart && wsStop);
    const hasAnyDate = Boolean(operationStart || operationStop || wsStart || wsStop);
    const hasValidTechs = techsRaw !== "" && Number.isFinite(techsNumber);

    if (!name) return "notReady";
    if (!hasAnyDate && !hasValidTechs) return "notReady";
    if ((wsStart || wsStop) && (!wsStart || !wsStop || wsStart > wsStop)) return "workshopDateError";

    if (!hasOperationDates) {
      if (hasWorkshopDates) {
        if (!existing) return "workshopOnly";

        const existingWorkshopEnabled = existing.workshop_enabled !== false && Boolean(existing.workshop_start_date || existing.workshop_end_date);
        const existingWsStart = String(existing.workshop_start_date || "");
        const existingWsStop = String(existing.workshop_end_date || "");
        const workshopChanged = !existingWorkshopEnabled
          || existingWsStart !== String(wsStart || "")
          || existingWsStop !== String(wsStop || "");

        return workshopChanged ? "dateUpdate" : "noChange";
      }
      return "notReady";
    }

    if (operationStart > operationStop) return "notReady";

    if (!existing && !hasValidTechs) {
      return "missingHeadcount";
    }

    if (existing) {
      const operationChanged = String(existing.planned_start_date || "") !== operationStart || String(existing.planned_end_date || "") !== operationStop;
      const existingWorkshopEnabled = existing.workshop_enabled !== false && Boolean(existing.workshop_start_date || existing.workshop_end_date);
      const csvWorkshopEnabled = Boolean(wsStart && wsStop);
      const workshopChanged = existingWorkshopEnabled !== csvWorkshopEnabled
        || String(existing.workshop_start_date || "") !== String(wsStart || "")
        || String(existing.workshop_end_date || "") !== String(wsStop || "");
      return (operationChanged || workshopChanged) ? "dateUpdate" : "noChange";
    }

    return "readyNew";
  }

  function getProjectImportWorklistComment(statusKey, existing = null, matchType = "") {
    const comments = {
      readyNew: "Nytt feltprosjekt. Techs brukes kun ved opprettelse.",
      workshopOnly: "Nytt workshop-only-prosjekt basert på WS start/stop. Ingen rød feltperiode.",
      dateUpdate: "Eksisterende prosjekt. Kun datoer skal kunne oppdateres senere.",
      noChange: "Finnes allerede med samme datoer. Ingen import nødvendig.",
      missingOperationDate: "Mangler Operation start/stop og WS start/stop.",
      missingHeadcount: "Mangler Techs needed for nytt prosjekt.",
      workshopDateError: "Workshopdato mangler eller WS start er etter WS stop.",
      notReady: "Raden er ikke klar for import."
    };
    const base = comments[statusKey] || comments.notReady;
    return matchType === "projectCode" ? `${base} Matchet på prosjektkode.` : base;
  }

  function getProjectImportStatusTone(statusKey) {
    const tones = {
      readyNew: "green",
      dateUpdate: "blue",
      noChange: "slate",
      missingOperationDate: "amber",
      missingHeadcount: "amber",
      workshopDateError: "rose",
      notReady: "rose"
    };
    return tones[statusKey] || "slate";
  }

  function formatImportRangeText(start, end) {
    if (!start && !end) return "-";
    return `${start || "?"} → ${end || "?"}`;
  }

  function buildProjectImportApprovalRow({ rowIndex, name, existing, operationStart, operationStop, wsStart, wsStop, techs, statusKey }) {
    const isUpdate = statusKey === "dateUpdate";
    return {
      id: `${isUpdate ? "update" : "new"}-${rowIndex}-${name}`,
      action: isUpdate ? "update" : "create",
      statusKey,
      statusLabel: isUpdate ? "Eksisterer – datooppdatering" : "Ny – klar",
      name,
      operationText: isUpdate && existing
        ? `${existing.planned_start_date || "?"} / ${existing.planned_end_date || "?"} → ${operationStart || "?"} / ${operationStop || "?"}`
        : formatImportRangeText(operationStart, operationStop),
      workshopText: isUpdate && existing
        ? `${existing.workshop_start_date || "-"} / ${existing.workshop_end_date || "-"} → ${wsStart || "-"} / ${wsStop || "-"}`
        : formatImportRangeText(wsStart, wsStop),
      techs,
      comment: isUpdate ? "Kan senere oppdatere eksisterende prosjekt etter godkjenning." : "Kan senere opprettes som nytt prosjekt."
    };
  }



  function bindProjectImportTestControls() {
    const btn = document.getElementById("projectImportTestImportBtn");
    if (!btn || btn.dataset.boundProjectImportTest) return;
    btn.dataset.boundProjectImportTest = "true";
    btn.addEventListener("click", () => {
      void importSelectedProjectsTestMode();
    });
  }

  function getSelectedProjectImportRows() {
    const preview = getProjectImportPreviewState();
    const selected = new Set(preview.selectedIds || []);
    const rows = Array.isArray(preview.worklistRows) ? preview.worklistRows : [];
    return rows.filter(row => selected.has(row.id));
  }

  function isProjectImportActionable(row) {
    return row?.statusKey === "readyNew" || row?.statusKey === "workshopOnly" || row?.statusKey === "dateUpdate";
  }

  function buildCsvImportNotes(row, modeLabel = "Create") {
    const raw = row?.raw || {};
    const responsible = String(row?.projectResponsible || raw["Project Responsible"] || "").trim();
    return responsible ? `Project Responsible: ${responsible}` : "Project Responsible:";
  }

  
  function buildProjectFromImportRow(row) {
    const isWorkshopOnly = row.statusKey === "workshopOnly";
    const hasWorkshop = Boolean(row.wsStart && row.wsStop);
    const techsNumber = Number(String(row.techs || "0").replace(",", "."));
    const safeTechs = Number.isFinite(techsNumber) ? Math.max(techsNumber, 0) : 0;

    return {
      id: crypto.randomUUID(),
      name: String(row.name || "").trim(),
      category: "Offshore",
      status: isWorkshopOnly ? "Avventer" : "Planlagt",
      planned_start_date: isWorkshopOnly ? null : (row.operationStart || null),
      planned_end_date: isWorkshopOnly ? null : (row.operationStop || null),
      has_multiple_periods: false,
      project_periods_json: [],
      location: row.company || "",
      project_responsible: row.projectResponsible || "",
      headcount_required: isWorkshopOnly ? 0 : safeTechs,
      workshop_enabled: hasWorkshop,
      workshop_start_date: hasWorkshop ? row.wsStart : null,
      workshop_end_date: hasWorkshop ? row.wsStop : null,
      workshop_headcount_required: isWorkshopOnly ? safeTechs : 2,
      notes: buildCsvImportNotes(row, isWorkshopOnly ? "Create workshop-only" : "Create")
    };
  }

  function updateExistingProjectDatesFromImportRow(project, row) {
    if (!project || !row) return null;
    const updated = { ...project };

    if (row.operationStart && row.operationStop) {
      updated.planned_start_date = row.operationStart;
      updated.planned_end_date = row.operationStop;
    }

    const hasWorkshop = Boolean(row.wsStart && row.wsStop);
    updated.workshop_enabled = hasWorkshop;
    updated.workshop_start_date = hasWorkshop ? row.wsStart : null;
    updated.workshop_end_date = hasWorkshop ? row.wsStop : null;

    // Deliberately NOT updating Techs, notes, Project Responsible, Company, Activity, status or assignments.
    return updated;
  }

  function getProjectImportExecutionPlan(rows) {
    const actionableRows = rows.filter(isProjectImportActionable);
    const createRows = actionableRows.filter(row => row.statusKey === "readyNew");
    const workshopRows = actionableRows.filter(row => row.statusKey === "workshopOnly");
    const updateRows = actionableRows.filter(row => row.statusKey === "dateUpdate");
    const skippedRows = rows.filter(row => !isProjectImportActionable(row));

    return {
      actionableRows,
      createRows,
      workshopRows,
      updateRows,
      skippedRows
    };
  }


  function setProjectImportRowResult(rowId, type, label, detail = "") {
    const preview = getProjectImportPreviewState();
    state.projectImportPreview = {
      ...preview,
      importResults: {
        ...(preview.importResults || {}),
        [rowId]: { type, label, detail, at: new Date().toISOString() }
      }
    };
  }

  function clearSuccessfulProjectImportSelections() {
    const preview = getProjectImportPreviewState();
    const successIds = new Set(
      Object.entries(preview.importResults || {})
        .filter(([, result]) => result?.type === "created" || result?.type === "updated")
        .map(([id]) => id)
    );
    if (!successIds.size) return;
    state.projectImportPreview = {
      ...preview,
      selectedIds: (preview.selectedIds || []).filter(id => !successIds.has(id))
    };
  }

  async function importSelectedProjectsTestMode() {
    if (!canEditApp()) {
      alert("Du har ikke tilgang til å importere prosjekter.");
      return;
    }

    const selectedRows = getSelectedProjectImportRows();
    const plan = getProjectImportExecutionPlan(selectedRows);
    const selectedActionableCount = plan.actionableRows.length;

    if (!selectedRows.length) {
      alert("Ingen prosjekter er valgt.");
      return;
    }

    if (!selectedActionableCount) {
      alert("Ingen valgte rader kan importeres. Skip/ikke-klare rader importeres ikke.");
      return;
    }

    if (selectedActionableCount > 10) {
      alert(`Safe import: maks 10 prosjekter per import. Du har valgt ${selectedActionableCount}. Velg færre rader og prøv igjen.`);
      return;
    }

    const createNames = plan.createRows.map(row => row.name).slice(0, 10);
    const workshopNames = plan.workshopRows.map(row => row.name).slice(0, 10);
    const updateNames = plan.updateRows.map(row => row.name).slice(0, 10);

    const confirmText = [
      "LIVE DATABASE – SAFE IMPORT",
      "",
      "Dette vil skrive til den aktive Supabase-databasen som også brukes av main/production.",
      "",
      "Du er i ferd med å:",
      `- opprette ${plan.createRows.length} nye feltprosjekter`,
      `- opprette ${plan.workshopRows.length} workshop-only-prosjekter`,
      `- oppdatere datoer på ${plan.updateRows.length} eksisterende prosjekter`,
      `- ignorere ${plan.skippedRows.length} valgte Skip/ikke-klare rader`,
      "",
      createNames.length ? `Nye feltprosjekter:\\n- ${createNames.join("\\n- ")}` : "",
      workshopNames.length ? `Workshop-only:\\n- ${workshopNames.join("\\n- ")}` : "",
      updateNames.length ? `Datooppdateringer:\\n- ${updateNames.join("\\n- ")}` : "",
      "",
      "Sikkerhetsregler:",
      "- kun hukede rader behandles",
      "- maks 10 handlingsbare rader per import",
      "- nye prosjekter får Project Responsible i notes",
      "- eksisterende prosjekter får kun datoer oppdatert",
      "- Techs, notes, Project Responsible og bemanning overskrives ikke på eksisterende prosjekter",
      "",
      "Fortsette import?"
    ].filter(Boolean).join("\\n");

    if (!confirm(confirmText)) return;

    const result = {
      created: [],
      updated: [],
      skipped: [],
      errors: []
    };

    const existingMaps = buildProjectImportExistingMaps();

    for (const row of plan.actionableRows) {
      const match = findExistingProjectForImportName(row.name, existingMaps);
      const existing = match.project;

      try {
        if (row.statusKey === "readyNew" || row.statusKey === "workshopOnly") {
          if (existing) {
            result.skipped.push(`${row.name}: finnes allerede${match.matchType === "projectCode" ? ` med prosjektkode ${match.code}` : ""}, opprettet ikke duplikat`);
            setProjectImportRowResult(row.id, "skipped", "Hoppet over", "Finnes allerede – opprettet ikke duplikat");
            continue;
          }

          const project = buildProjectFromImportRow(row);
          state.projects.push(project);
          state.projects = normalizeProjects(state.projects);
          state.projects.sort((a, b) => compareProjectDates(a, b));
          rebuildDerivedState();

          const saveResult = await saveRow("planner_projects", project);
          if (!saveResult.ok) {
            state.projects = state.projects.filter(item => item.id !== project.id);
            rebuildDerivedState();
            result.errors.push(`${row.name}: ${saveResult.error?.message || "kunne ikke lagre"}`);
            setProjectImportRowResult(row.id, "error", "Feil", saveResult.error?.message || "Kunne ikke lagre");
            continue;
          }

          const normalizedName = normalizeProjectImportInlineName(project.name);
          if (normalizedName) existingMaps.byName.set(normalizedName, project);
          const projectCode = extractProjectImportCode(project.name);
          if (projectCode) existingMaps.byCode.set(projectCode, project);
          result.created.push(row.name);
          setProjectImportRowResult(row.id, "created", "Opprettet", "Nytt prosjekt opprettet");
          continue;
        }

        if (row.statusKey === "dateUpdate") {
          const target = existing || state.projects.find(project => project.id === row.existingProjectId);
          if (!target) {
            result.skipped.push(`${row.name}: fant ikke eksisterende prosjekt for datooppdatering`);
            setProjectImportRowResult(row.id, "skipped", "Hoppet over", "Fant ikke eksisterende prosjekt");
            continue;
          }

          const updated = updateExistingProjectDatesFromImportRow(target, row);
          if (!updated) {
            result.skipped.push(`${row.name}: kunne ikke bygge datooppdatering`);
            setProjectImportRowResult(row.id, "skipped", "Hoppet over", "Kunne ikke bygge datooppdatering");
            continue;
          }

          const index = state.projects.findIndex(project => project.id === target.id);
          if (index === -1) {
            result.skipped.push(`${row.name}: prosjekt ikke funnet i state`);
            setProjectImportRowResult(row.id, "skipped", "Hoppet over", "Prosjekt ikke funnet i state");
            continue;
          }

          const previous = { ...state.projects[index] };
          state.projects[index] = updated;
          state.projects = normalizeProjects(state.projects);
          state.projects.sort((a, b) => compareProjectDates(a, b));
          rebuildDerivedState();

          const saveResult = await saveRow("planner_projects", updated);
          if (!saveResult.ok) {
            const rollbackIndex = state.projects.findIndex(project => project.id === previous.id);
            if (rollbackIndex >= 0) state.projects[rollbackIndex] = previous;
            state.projects = normalizeProjects(state.projects);
            rebuildDerivedState();
            result.errors.push(`${row.name}: ${saveResult.error?.message || "kunne ikke oppdatere"}`);
            setProjectImportRowResult(row.id, "error", "Feil", saveResult.error?.message || "Kunne ikke oppdatere");
            continue;
          }

          result.updated.push(row.name);
          setProjectImportRowResult(row.id, "updated", "Oppdatert", "Datoer oppdatert");
          continue;
        }

        result.skipped.push(`${row.name}: ikke håndtert status ${row.statusKey}`);
        setProjectImportRowResult(row.id, "skipped", "Hoppet over", `Ikke håndtert status ${row.statusKey}`);
      } catch (error) {
        result.errors.push(`${row.name}: ${error?.message || error}`);
        setProjectImportRowResult(row.id, "error", "Feil", error?.message || String(error));
      }
    }

    for (const row of plan.skippedRows) {
      setProjectImportRowResult(row.id, "skipped", "Hoppet over", "Skip/ikke klar ble ikke importert");
    }

    const latestPreview = getProjectImportPreviewState();
    state.projectImportPreview = {
      ...latestPreview,
      lastImportSummary: {
        created: result.created.length,
        updated: result.updated.length,
        skipped: result.skipped.length + plan.skippedRows.length,
        errors: result.errors.length
      }
    };
    clearSuccessfulProjectImportSelections();

    state.projects = normalizeProjects(state.projects);
    state.projects.sort((a, b) => compareProjectDates(a, b));
    rebuildDerivedState();
    renderAll();

    const resultText = [
      "Import fullført.",
      `Opprettet: ${result.created.length}`,
      `Oppdatert: ${result.updated.length}`,
      `Hoppet over: ${result.skipped.length + plan.skippedRows.length}`,
      `Feil: ${result.errors.length}`
    ].join("\\n");

    const detailText = [
      result.created.length ? `\\nOpprettet:\\n- ${result.created.join("\\n- ")}` : "",
      result.updated.length ? `\\nOppdatert:\\n- ${result.updated.join("\\n- ")}` : "",
      result.skipped.length ? `\\nHoppet over:\\n- ${result.skipped.join("\\n- ")}` : "",
      result.errors.length ? `\\nFeil:\\n- ${result.errors.join("\\n- ")}` : ""
    ].filter(Boolean).join("\\n");

    alert(`${resultText}${detailText}`);

    const resultEl = document.getElementById("projectImportTestResult");
    if (resultEl) {
      resultEl.textContent = `Import fullført: opprettet ${result.created.length}, oppdatert ${result.updated.length}, hoppet over ${result.skipped.length + plan.skippedRows.length}, feil ${result.errors.length}.`;
    }

    renderProjectImportInlineCards();

    void addAudit(`CSV safe import: opprettet ${result.created.length}, oppdatert ${result.updated.length}, hoppet over ${result.skipped.length + plan.skippedRows.length}, feil ${result.errors.length}`);
  }

  function renderProjectImportInlineSummaryCards(counts = {}) {
    const cards = [
      ["Totalt", counts.total || 0],
      ["Ny – klar", counts.readyNew || 0],
      ["Workshop-only", counts.workshopOnly || 0],
      ["Datooppdatering", counts.dateUpdate || 0],
      ["Ingen endring", counts.noChange || 0],
      ["Mangler dato", counts.missingOperationDate || 0],
      ["Mangler techs", counts.missingHeadcount || 0],
      ["WS-feil", counts.workshopDateError || 0],
      ["Ikke klar", counts.notReady || 0]
    ];
    return cards.map(([label, value]) => `
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <div class="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">${escapeHtml(label)}</div>
        <div class="text-lg font-black text-slate-950">${escapeHtml(String(value))}</div>
      </div>
    `).join("");
  }

  function bindProjectImportInlineControls() {
    const input = document.getElementById("projectImportInlineFile");
    const clearBtn = document.getElementById("projectImportInlineClearBtn");

    if (input && !input.dataset.boundProjectImportInline) {
      input.dataset.boundProjectImportInline = "true";
      input.addEventListener("change", event => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        readProjectImportInlineCsv(file);
      });
    }

    if (clearBtn && !clearBtn.dataset.boundProjectImportInlineClear) {
      clearBtn.dataset.boundProjectImportInlineClear = "true";
      clearBtn.addEventListener("click", () => {
        if (input) input.value = "";
        resetProjectImportPreviewState();
        renderProjectImportInlineResult([], "");
      });
    }
  }

  function readProjectImportInlineCsv(file) {
    const status = document.getElementById("projectImportInlineFileStatus");
    state.projectImportPreview = {
      ...getProjectImportPreviewState(),
      fileName: file.name,
      statusText: `Leser ${file.name}...`
    };
    if (status) status.textContent = state.projectImportPreview.statusText;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseProjectImportInlineCsv(String(reader.result || ""));
        renderProjectImportInlineResult(rows, file.name);
      } catch (error) {
        if (status) status.textContent = `Kunne ikke lese CSV: ${error?.message || error}`;
      }
    };
    reader.onerror = () => {
      if (status) status.textContent = "Kunne ikke lese filen.";
    };
    reader.readAsText(file, "utf-8");
  }

  function parseProjectImportInlineCsv(text) {
    const rows = [];
    let current = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        current.push(field);
        field = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
        current.push(field);
        field = "";
        if (current.some(value => String(value || "").trim() !== "")) rows.push(current);
        current = [];
        continue;
      }

      field += char;
    }

    current.push(field);
    if (current.some(value => String(value || "").trim() !== "")) rows.push(current);

    if (!rows.length) return [];

    const headers = rows[0].map(header => String(header || "").replace(/^\uFEFF/, "").trim().replace(/\s+/g, " "));
    return rows.slice(1).map(rawRow => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = String(rawRow[index] || "").trim();
      });
      return obj;
    }).filter(row => Object.values(row).some(value => String(value || "").trim() !== ""));
  }

  function parseProjectImportInlineDate(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const ddmmyyyy = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (ddmmyyyy) {
      return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, "0")}-${ddmmyyyy[1].padStart(2, "0")}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    return "";
  }

  function normalizeProjectImportInlineName(value) {
    return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function extractProjectImportCode(value) {
    const match = String(value || "").toUpperCase().match(/\bIZO[-\s]?(\d{5})\b/);
    return match ? `IZO-${match[1]}` : "";
  }

  function buildProjectImportExistingMaps() {
    const byName = new Map();
    const byCode = new Map();

    state.projects.forEach(project => {
      const normalizedName = normalizeProjectImportInlineName(project.name);
      if (normalizedName) byName.set(normalizedName, project);

      const code = extractProjectImportCode(project.name);
      if (code && !byCode.has(code)) byCode.set(code, project);
    });

    return { byName, byCode };
  }

  function findExistingProjectForImportName(name, maps = buildProjectImportExistingMaps()) {
    const code = extractProjectImportCode(name);
    if (code && maps.byCode.has(code)) {
      return { project: maps.byCode.get(code), matchType: "projectCode", code };
    }

    const normalizedName = normalizeProjectImportInlineName(name);
    if (normalizedName && maps.byName.has(normalizedName)) {
      return { project: maps.byName.get(normalizedName), matchType: "exactName", code: "" };
    }

    return { project: null, matchType: "", code };
  }



  function renderProjectImportInlineResult(rows, fileName = "") {
    const status = document.getElementById("projectImportInlineFileStatus");
    const summary = document.getElementById("projectImportInlineSummary");
    const details = document.getElementById("projectImportInlineDetails");
    const approvalWrap = document.getElementById("projectImportInlineApprovalList");

    if (!rows.length) {
      state.projectImportPreview = getDefaultProjectImportPreviewState();
      if (status) status.textContent = state.projectImportPreview.statusText;
      if (summary) summary.innerHTML = renderProjectImportInlineSummaryCards(state.projectImportPreview.counts);
      if (details) details.innerHTML = renderProjectImportInlineDetailsHtml(state.projectImportPreview.examples, state.projectImportPreview.rowCount);
      if (approvalWrap) approvalWrap.innerHTML = renderProjectImportApprovalListHtml(state.projectImportPreview);
      return;
    }

    const worklistRows = rows.map((row, rowIndex) => {
      const name = row["Project Name"] || row["Project"] || row["Name"] || "";
      const operationStart = parseProjectImportInlineDate(row["Operation start"]);
      const operationStop = parseProjectImportInlineDate(row["Operation stop"]);
      const wsStart = parseProjectImportInlineDate(row["WS start"] || "");
      const wsStop = parseProjectImportInlineDate(row["WS stop"] || "");
      const techs = String(row["Techs needed"] || row["Techs"] || "").trim();
      return {
        id: `csv-${rowIndex}-${name || "uten-navn"}`,
        rowIndex,
        name,
        company: row["Company"] || "",
        projectResponsible: row["Project Responsible"] || row["Project responsible"] || row["Responsible"] || "",
        operationStart,
        operationStop,
        wsStart,
        wsStop,
        techs,
        raw: row,
        existingProjectId: "",
        action: "",
        statusKey: "notReady",
        comment: ""
      };
    });

    const basePreview = {
      ...getProjectImportPreviewState(),
      fileName: fileName || "CSV",
      statusText: `${fileName || "CSV"} lest. ${rows.length} rader funnet. Ingen data er lagret.`,
      worklistFilter: "all",
      selectedIds: []
    };

    state.projectImportPreview = recalculateProjectImportPreviewFromWorklist(worklistRows, basePreview);

    if (status) status.textContent = state.projectImportPreview.statusText;
    if (summary) summary.innerHTML = renderProjectImportInlineSummaryCards(state.projectImportPreview.counts);
    if (details) details.innerHTML = renderProjectImportInlineDetailsHtml(state.projectImportPreview.examples, state.projectImportPreview.rowCount);
    if (approvalWrap) {
      approvalWrap.innerHTML = renderProjectImportApprovalListHtml(state.projectImportPreview);
      bindProjectImportApprovalListControls();
    }
  }


  function renderProjects() {
    renderProjectImportInlineCards();
    return;

    const allActiveProjects = getActiveProjectsForWorkspace();
    const activeProjects = state.projectListFilter === "unstaffed"
      ? allActiveProjects.filter(project => projectNeedsStaffing(project))
      : allActiveProjects;
    const archivedProjects = getArchivedProjectsForWorkspace();
    const focusedProject = ensureFocusProject(activeProjects, archivedProjects);
    const activeDescription = state.projectListFilter === "unstaffed"
      ? "Viser aktive prosjekter som mangler hele eller deler av bemanningen."
      : "Viser kun planlagt, pågår og avventer.";

    const renderProjectRow = (project, archived = false) => {
      const assigned = getProjectAssignedCount(project.id);
      const required = Number(project.headcount_required || 0);
      const staffing = getProjectStaffingLabel(project.id, required);
      const isFocused = project.id === state.focusProjectId;
      const statusClass = STATUS_COLORS[project.status] || "bg-slate-100 border-slate-200 text-slate-700";
      const toneClass = archived
        ? "border-slate-200 bg-slate-50 hover:bg-slate-100"
        : isFocused
          ? "border-blue-300 bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-200/70 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80";
      const staffingBadgeClass = staffing.variant.includes('green')
        ? 'border-green-200 bg-green-50 text-green-700'
        : staffing.variant.includes('amber')
          ? 'border-amber-200 bg-amber-50 text-amber-700'
          : 'border-rose-200 bg-rose-50 text-rose-700';

      return `
        <button type="button" data-project-focus-id="${escapeHtml(project.id)}" class="w-full rounded-[24px] border px-4 py-4 text-left transition ${toneClass}">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-base font-semibold text-slate-900 truncate">${escapeHtml(project.name)}</div>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span class="rounded-full border border-slate-200 bg-white px-2.5 py-1">${escapeHtml(project.category || 'Uten kategori')}</span>
                ${project.location ? `<span class="rounded-full border border-slate-200 bg-white px-2.5 py-1">${escapeHtml(project.location)}</span>` : ''}
              </div>
              <div class="mt-3 text-xs text-slate-500">${escapeHtml(formatProjectDateRange(project))}</div>
            </div>
            <span class="shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}">${escapeHtml(project.status)}</span>
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span class="rounded-full border px-2.5 py-1 font-medium ${staffingBadgeClass}">${escapeHtml(staffing.text)}${required ? ` ${assigned}/${required}` : ''}</span>
            ${project.notes ? `<span class="max-w-[220px] truncate text-slate-500">${escapeHtml(project.notes)}</span>` : ''}
          </div>
        </button>
      `;
    };

    els.projectList.innerHTML = `
      <div class="space-y-6">
        <div>
          <div class="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <div class="font-semibold text-slate-900">Aktive prosjekter</div>
              <div class="text-sm text-slate-500">${escapeHtml(activeDescription)}</div>
            </div>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">${activeProjects.length} aktive</span>
          </div>
          <div class="space-y-3">
            ${activeProjects.length ? activeProjects.map(project => renderProjectRow(project, false)).join("") : `<div class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">Ingen aktive prosjekter.</div>`}
          </div>
        </div>
        <div class="border-t border-slate-200 pt-5">
          <div class="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <div class="font-semibold text-slate-900">Arkiv</div>
              <div class="text-sm text-slate-500">Avsluttede prosjekter holdes utenfor hovedbildet.</div>
            </div>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">${archivedProjects.length} avsluttet</span>
          </div>
          <div class="space-y-3">
            ${archivedProjects.length ? archivedProjects.map(project => renderProjectRow(project, true)).join("") : `<div class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">Ingen arkiverte prosjekter.</div>`}
          </div>
        </div>
      </div>
    `;

    els.projectList.querySelectorAll('[data-project-focus-id]').forEach(btn => {
      btn.addEventListener('click', () => setFocusProject(btn.dataset.projectFocusId));
    });

    renderProjectWorkspace(focusedProject);
  }


  function startProjectStaffing(projectId, preselectEmployeeName = "", preselectRole = "") {
    if (!els.assignProject) return;
    const nextProjectId = projectId || "";
    if (state.focusProjectId !== nextProjectId) resetProjectInspectorFilters();
    state.focusProjectId = nextProjectId;
    setActiveTab("projects");
    els.assignProject.value = projectId;
    if (els.assignNotes) els.assignNotes.value = "";
    const rows = preselectEmployeeName
      ? [{ employee_name: preselectEmployeeName, role: preselectRole || getDefaultRoleForIndex(0) }]
      : [];
    syncAssignDatesFromProject({ projectId, rows });
    updateAvailabilityAnalysis();
    els.assignProject.scrollIntoView({ behavior: "smooth", block: "center" });
    renderProjects();
  }


  async function deleteEntryFromProjectCard(entryId) {
    if (!canEditApp()) return;
    const entry = state.entries.find(item => item.id === entryId);
    if (!entry) {
      alert("Fant ikke tildelingen.");
      return;
    }

    const project = getProjectById(entry.project_id);
    const confirmText = `Fjern tildeling for ${entry.employee_name} fra ${project?.name || "prosjekt"}?`;
    if (!confirm(confirmText)) return;

    // v18.62aj: Hold sletting lokalt som "pending" slik at realtime/poll-refresh
    // ikke kan hente raden tilbake fra Supabase mens delete-kallet fortsatt pågår.
    const pendingDeleteIds = getProjectInspectorPendingDeleteIds();
    pendingDeleteIds.add(entryId);

    const previousEntries = state.entries.slice();
    state.entries = state.entries.filter(item => item.id !== entryId);
    rebuildDerivedState();
    saveAllLocal();

    // Vis endringen umiddelbart i prosjektvinduet. Dette er viktigere enn å vente
    // på tung kalender-/dashboard-rendering og Supabase-latency.
    if (project && state.focusProjectId === project.id) {
      renderProjectInspectorPanel(project);
    } else {
      renderCalendarPanel();
    }

    const result = await deleteRow("planner_entries", entryId);
    if (!result.ok) {
      pendingDeleteIds.delete(entryId);
      state.entries = previousEntries;
      rebuildDerivedState();
      saveAllLocal();
      renderAll();
      alert("Kunne ikke fjerne tildelingen. Prøv igjen.");
      return;
    }

    void addAudit(`Slettet tildeling fra prosjektkort: ${entry.employee_name} → ${displayProjectName(project) || "Ukjent prosjekt"}`);

    // Hold ID-en i pending litt etter vellykket delete for å unngå race fra
    // pågående realtime/poll/visibility-refresh som startet før delete var ferdig.
    window.setTimeout(() => {
      pendingDeleteIds.delete(entryId);
    }, 4000);

    // Oppdater tunge deler etter at brukergrensesnittet allerede har respondert.
    window.setTimeout(() => {
      if (project && state.focusProjectId === project.id) {
        renderProjectInspectorPanel(project);
      }
      renderCalendar();
      renderHomeDashboard();
      updateBadge();
      updateAvailabilityAnalysis();
    }, 0);
  }

  function bindEmployeeAdminFilters() {
    const search = document.getElementById("employeeAdminSearch");
    const groupFilter = document.getElementById("employeeAdminGroupFilter");
    const statusFilter = document.getElementById("employeeAdminStatusFilter");

    if (groupFilter && !groupFilter.dataset.izOptionsReady) {
      groupFilter.innerHTML = `<option value="">Alle grupper</option>` + EMPLOYEE_GROUP_DEFINITIONS.map(group => (
        `<option value="${escapeHtml(group.value)}">${escapeHtml(group.label || group.value)}</option>`
      )).join("");
      groupFilter.dataset.izOptionsReady = "true";
    }

    [search, groupFilter, statusFilter].forEach(control => {
      if (!control || control.dataset.izEmployeeAdminBound) return;
      const eventName = control.tagName === "INPUT" ? "input" : "change";
      control.addEventListener(eventName, () => renderEmployees());
      control.dataset.izEmployeeAdminBound = "true";
    });
  }

  function getEmployeeAdminDuplicateCount() {
    const byName = new Map();
    state.employees.forEach(emp => {
      const key = normalizeComparableText(emp.name || "");
      if (!key) return;
      byName.set(key, (byName.get(key) || 0) + 1);
    });
    return Array.from(byName.values()).filter(count => count > 1).length;
  }

  function updateEmployeeAdminMetrics() {
    const activeCount = state.employees.filter(emp => emp.active !== false).length;
    const inactiveCount = state.employees.filter(emp => emp.active === false).length;
    const missingEmailCount = state.employees.filter(emp => emp.active !== false && !String(emp.email || "").trim()).length;
    const duplicateCount = getEmployeeAdminDuplicateCount();

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };
    setText("employeeAdminActiveCount", activeCount);
    setText("employeeAdminInactiveCount", inactiveCount);
    setText("employeeAdminMissingEmailCount", missingEmailCount);
    setText("employeeAdminDuplicateCount", duplicateCount);
  }

  function getEmployeeAdminInitials(employee) {
    const source = String(employee?.name || employee?.email || "?").trim();
    const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);
    if (!parts.length) return "?";
    return parts.map(part => part[0] || "").join("").toUpperCase();
  }

  function normalizeEmployeeAdminPhone(value) {
    return String(value || "").replace(/\D+/g, "");
  }

  function getEmployeeAdminById(employeeId) {
    if (!employeeId) return null;
    return (state.employees || []).find(emp => String(emp.id || "") === String(employeeId || "")) || null;
  }

  function getEmployeeAdminAccessPanelEmployee() {
    return getEmployeeAdminById(state.employeeAccessPanelEmployeeId || state.employeeAdminSelectedId || "");
  }

  function isAccessUserMatchForEmployee(row, employee) {
    if (!row || !employee) return false;
    const employeeEmail = normalizeComparableText(employee.email || "");
    const employeeName = normalizeComparableText(employee.name || "");
    const rowEmail = normalizeComparableText(row.email || "");
    const rowName = normalizeComparableText(row.full_name || row.name || "");
    return (employeeEmail && rowEmail && employeeEmail === rowEmail)
      || (employeeName && rowName && employeeName === rowName);
  }

  function getAccessUsersForEmployee(employee, rows = state.accessUsers?.rows || []) {
    if (!employee) return rows || [];
    return (rows || []).filter(row => isAccessUserMatchForEmployee(row, employee));
  }

  function getAccessRequestsForEmployee(employee, rows = state.accessRequests?.rows || []) {
    if (!employee) return rows || [];
    const requestIds = new Set(findEmployeeAdminAccessRequests(employee).map(row => row.id));
    return (rows || []).filter(row => requestIds.has(row.id));
  }

  function updateEmployeeAccessPanelHeader(employee = getEmployeeAdminAccessPanelEmployee()) {
    const title = document.getElementById("employeeAccessAdminTitle");
    const subtitle = document.getElementById("employeeAccessAdminSubtitle");
    if (!title && !subtitle) return;
    if (employee) {
      const name = employee.name || "valgt ansatt";
      if (title) title.textContent = `Tilganger: ${name}`;
      if (subtitle) subtitle.textContent = "Viser kun brukertilgang og tilgangssøknader for valgt ansatt.";
    } else {
      if (title) title.textContent = "Tilganger for valgt ansatt";
      if (subtitle) subtitle.textContent = "Velg en ansatt først. Daglig tilgangskontroll skal ikke vise hele brukerlisten.";
    }
  }

  function formatEmployeeAdminEntryRange(start, end) {
    if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
    if (start) return `Fra ${formatDate(start)}`;
    if (end) return `Til ${formatDate(end)}`;
    return "Ingen dato";
  }

  function findEmployeeAdminAccessUser(employee) {
    const emailKey = normalizeComparableText(employee?.email || "");
    if (!emailKey) return null;
    return (state.accessUsers?.rows || []).find(row => normalizeComparableText(row.email || "") === emailKey) || null;
  }

  function findEmployeeAdminAccessRequests(employee) {
    const employeeEmail = normalizeComparableText(employee?.email || "");
    const employeeName = normalizeComparableText(employee?.name || "");
    const employeePhone = normalizeEmployeeAdminPhone(employee?.phone || "");
    return (state.accessRequests?.rows || []).filter(row => {
      const requestEmail = normalizeComparableText(row.email || "");
      const requestName = normalizeComparableText(row.full_name || row.name || "");
      const requestPhone = normalizeEmployeeAdminPhone(row.phone || "");
      return (employeeEmail && requestEmail && employeeEmail === requestEmail)
        || (employeePhone && requestPhone && employeePhone === requestPhone)
        || (employeeName && requestName && employeeName === requestName);
    });
  }

  function getEmployeeAdminAccessInfo(employee) {
    const user = findEmployeeAdminAccessUser(employee);
    if (user) {
      return {
        label: formatRoleLabel(user.role || "employee"),
        state: user.is_active === false ? "inactive" : "active",
        note: user.is_active === false ? "Tilgang deaktivert" : "Aktiv brukertilgang"
      };
    }

    const requests = findEmployeeAdminAccessRequests(employee);
    const pending = requests.find(row => ["pending", "submitted", "approved", "ready"].includes(String(row.status || "").toLowerCase()));
    if (pending) {
      return { label: "Søknad", state: "pending", note: "Tilgangssøknad finnes" };
    }

    return { label: "Ingen tilgang", state: "missing", note: "Finnes i ansattregister" };
  }

  function getEmployeeAdminPrimaryAccessRequest(employee) {
    const rows = findEmployeeAdminAccessRequests(employee);
    if (!rows.length) return null;

    return rows.slice().sort((a, b) => {
      const rank = row => {
        const status = String(row.status || "pending").toLowerCase();
        if (status === "pending") return 0;
        if (status === "approved" && !row.setup_completed_at) return 1;
        if (status === "approved" && row.setup_completed_at) return 2;
        if (status === "rejected") return 3;
        return 4;
      };
      const diff = rank(a) - rank(b);
      if (diff !== 0) return diff;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    })[0] || null;
  }

  function renderEmployeeAdminAccessControl(employee, accessInfo) {
    const accessUser = findEmployeeAdminAccessUser(employee);

    if (accessUser) {
      const isCurrentUser = accessUser.id === state.currentUserId;
      const isActive = accessUser.is_active !== false;
      const targetRole = normalizeRoleValue(accessUser.role);
      const isProtectedSuperadmin = targetRole === "superadmin";
      const canManageTarget = canCurrentUserManageAccessTarget(accessUser);
      const disabled = canManageTarget ? "" : "disabled";
      const disabledReason = isCurrentUser
        ? "Du kan ikke endre egen bruker fra ansattkortet."
        : isProtectedSuperadmin
          ? "Superadmin er låst i vanlig UI."
          : !canManageTarget
            ? "Din rolle kan ikke administrere denne brukeren."
            : "";
      const actionLabel = isActive ? "Deaktiver tilgang" : "Aktiver tilgang";
      const nextAction = isActive ? "deactivate" : "activate";
      const passwordDraft = getAccessUserDraftPassword(String(accessUser.id || ""));

      return `
        <div class="iz-employee-admin-access-card" data-access-user-row-id="${escapeHtml(accessUser.id)}" data-employee-card-access="true">
          <div class="iz-employee-admin-access-head">
            <div class="min-w-0">
              <div class="iz-employee-admin-access-title">Brukertilgang</div>
              <div class="iz-employee-admin-access-sub truncate">${escapeHtml(accessUser.email || employee.email || "Ingen e-post")}</div>
            </div>
            <span class="iz-employee-admin-status ${isActive ? "is-active" : "is-inactive"}">${isActive ? "Aktiv" : "Deaktivert"}</span>
          </div>

          ${disabledReason ? `<div class="iz-employee-admin-notice compact">${escapeHtml(disabledReason)}</div>` : ""}

          <div class="iz-employee-admin-access-grid">
            <label class="iz-employee-admin-control">
              <span>Rolle</span>
              <select data-access-user-role="${escapeHtml(accessUser.id)}" ${disabled || isProtectedSuperadmin ? "disabled" : ""}>
                ${getAccessUserRoleOptions(accessUser.role)}
              </select>
            </label>
            <button type="button" class="iz-employee-admin-btn" data-access-user-action="set-role" data-access-user-id="${escapeHtml(accessUser.id)}" ${disabled || isProtectedSuperadmin ? "disabled" : ""}>Lagre rolle</button>
            <button type="button" class="iz-employee-admin-btn ${isActive ? "danger" : "primary"}" data-access-user-action="toggle-active" data-access-user-id="${escapeHtml(accessUser.id)}" data-access-user-next-action="${escapeHtml(nextAction)}" ${disabled}>${escapeHtml(actionLabel)}</button>
          </div>

          <div class="iz-employee-admin-access-grid password">
            <label class="iz-employee-admin-control">
              <span>Midlertidig passord</span>
              <input data-access-user-password="${escapeHtml(accessUser.id)}" type="text" autocomplete="off" value="${escapeHtml(passwordDraft)}" placeholder="Skriv/generer passord" ${disabled ? "disabled" : ""} />
            </label>
            <button type="button" class="iz-employee-admin-btn" data-access-user-action="generate-password" data-access-user-id="${escapeHtml(accessUser.id)}" ${disabled}>Generer</button>
            <button type="button" class="iz-employee-admin-btn primary" data-access-user-action="set-password" data-access-user-id="${escapeHtml(accessUser.id)}" ${disabled}>Sett passord</button>
          </div>
        </div>
      `;
    }

    const request = getEmployeeAdminPrimaryAccessRequest(employee);
    if (request) {
      const status = String(request.status || "pending").toLowerCase();
      const isPending = status === "pending";
      const isApprovedButOpen = status === "approved" && !request.setup_completed_at;
      const statusLabel = request.setup_completed_at ? "Oppsatt" : formatAccessRequestStatus(status);
      return `
        <div class="iz-employee-admin-access-card request" data-employee-card-request-id="${escapeHtml(request.id)}">
          <div class="iz-employee-admin-access-head">
            <div class="min-w-0">
              <div class="iz-employee-admin-access-title">Tilgangssøknad</div>
              <div class="iz-employee-admin-access-sub truncate">${escapeHtml(request.email || employee.email || "Ingen e-post")} • ${escapeHtml(formatRequestedAccess(request.approved_role || request.requested_access))}</div>
            </div>
            <span class="iz-employee-admin-status ${request.setup_completed_at ? "is-active" : ""}">${escapeHtml(statusLabel)}</span>
          </div>
          <div class="iz-employee-admin-access-meta">Sendt ${escapeHtml(formatAccessRequestDate(request.created_at))}${request.phone ? ` • ${escapeHtml(request.phone)}` : ""}</div>
          <div class="iz-employee-admin-access-actions">
            ${isPending && canApproveAccessRequests() ? `
              <button type="button" class="iz-employee-admin-btn primary" data-employee-card-access-request-action="approved" data-access-request-id="${escapeHtml(request.id)}">Godkjenn</button>
              <button type="button" class="iz-employee-admin-btn danger" data-employee-card-access-request-action="rejected" data-access-request-id="${escapeHtml(request.id)}">Avslå</button>
            ` : ""}
            ${isApprovedButOpen ? `<button type="button" class="iz-employee-admin-btn primary" data-employee-card-open-request="${escapeHtml(request.id)}">Fullfør tilgang</button>` : ""}
            <button type="button" class="iz-employee-admin-btn" data-employee-card-open-request="${escapeHtml(request.id)}">Vis i søknader</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="iz-employee-admin-access-card missing">
        <div class="iz-employee-admin-access-head">
          <div class="min-w-0">
            <div class="iz-employee-admin-access-title">Ingen brukertilgang</div>
            <div class="iz-employee-admin-access-sub">Ansatt finnes i registeret, men har ikke innlogging ennå.</div>
          </div>
          <span class="iz-employee-admin-status is-inactive">Mangler</span>
        </div>
        <div class="iz-employee-admin-notice compact">Når den ansatte søker tilgang, skal søknaden kobles til denne eksisterende ansatte. Ikke opprett ny ansatt hvis personen allerede finnes i registeret.</div>
        <button type="button" class="iz-employee-admin-btn" data-employee-admin-open-admin>Tilganger</button>
      </div>
    `;
  }

  function renderEmployeeAdminDetail(employee) {
    const detail = document.getElementById("employeeAdminDetail");
    if (!detail) return;

    if (!employee) {
      detail.innerHTML = `<div class="iz-employee-admin-empty">Velg en ansatt i listen for å se detaljer.</div>`;
      return;
    }

    const employeeGroup = normalizeEmployeeGroup(employee.employee_group || "");
    const groupLabel = getEmployeeGroupLabel(employeeGroup) || "Ingen gruppe valgt";
    const active = employee.active !== false;
    const title = employee.title || employee.employee_type || "Ikke satt";
    const accessInfo = getEmployeeAdminAccessInfo(employee);
    const accessStatusClass = accessInfo.state === "active" ? "is-active" : accessInfo.state === "inactive" ? "is-inactive" : accessInfo.state === "pending" ? "" : "is-inactive";
    const upcomingEntries = state.entries
      .filter(entry => normalizeComparableText(entry.employee_name || "") === normalizeComparableText(employee.name || ""))
      .filter(entry => !entry.end_date || entry.end_date >= toIsoDate(new Date()))
      .sort((a, b) => String(a.start_date || "").localeCompare(String(b.start_date || "")))
      .slice(0, 3);

    const nextEntriesHtml = upcomingEntries.length
      ? upcomingEntries.map(entry => {
          const project = getProjectById(entry.project_id);
          return `<div class="iz-employee-admin-linkitem">
            <div class="iz-employee-admin-linkico">▦</div>
            <div class="min-w-0">
              <div class="text-sm font-bold text-slate-100 truncate">${escapeHtml(displayProjectName(project) || "Direkte blokk")}</div>
              <div class="text-xs text-slate-400 truncate">${escapeHtml(formatEmployeeAdminEntryRange(entry.start_date, entry.end_date))}${entry.role ? ` • ${escapeHtml(entry.role)}` : ""}</div>
            </div>
            <span class="iz-employee-admin-status ${project?.status === "Fullført" || project?.status === "Pågår" ? "is-active" : ""}">${escapeHtml(project?.status || "Plan")}</span>
          </div>`;
        }).join("")
      : `<div class="iz-employee-admin-notice">Ingen kommende tildelinger funnet for denne ansatte i nåværende registerdata.</div>`;

    detail.innerHTML = `
      <div class="iz-employee-admin-detail-hero">
        <div class="iz-employee-admin-avatar">${escapeHtml(getEmployeeAdminInitials(employee))}</div>
        <div class="min-w-0">
          <div class="iz-employee-admin-detail-name truncate">${escapeHtml(employee.name || "Uten navn")}</div>
          <div class="iz-employee-admin-detail-sub truncate">${escapeHtml(title)} · ${escapeHtml(groupLabel)} · ${active ? "Aktiv" : "Inaktiv"}</div>
        </div>
      </div>

      <div class="iz-employee-admin-fieldgrid">
        <div class="iz-employee-admin-field"><label>Telefon</label><div>${escapeHtml(employee.phone || "Ingen telefon")}</div></div>
        <div class="iz-employee-admin-field"><label>E-post</label><div>${escapeHtml(employee.email || "Ingen e-post")}</div></div>
        <div class="iz-employee-admin-field"><label>Stilling</label><div>${escapeHtml(title)}</div></div>
        <div class="iz-employee-admin-field"><label>Gruppe</label><div>${escapeHtml(groupLabel)}</div></div>
      </div>

      <div class="iz-employee-admin-section-title">Tilgang på ansattkortet</div>
      ${renderEmployeeAdminAccessControl(employee, accessInfo)}

      <div class="iz-employee-admin-section-title">Kommende plan</div>
      ${nextEntriesHtml}

      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="iz-employee-admin-btn primary" data-employee-admin-edit="${escapeHtml(employee.id)}">Rediger ansatt</button>
        <button type="button" class="iz-employee-admin-btn" data-employee-admin-open-calendar="${escapeHtml(employee.name || "")}">Åpne i Ansattplan</button>
        <button type="button" class="iz-employee-admin-btn" data-employee-admin-open-admin>Tilganger</button>
      </div>
    `;

    detail.querySelector("[data-employee-admin-edit]")?.addEventListener("click", event => {
      openEmployeeModal(event.currentTarget.dataset.employeeAdminEdit);
    });
    detail.querySelector("[data-employee-admin-open-calendar]")?.addEventListener("click", event => {
      const employeeName = String(event.currentTarget.dataset.employeeAdminOpenCalendar || "").trim();
      state.search = employeeName.toLowerCase();
      state.selectedEmployeeGroups = [];
      state.employeeFilter = "Alle ansatte";
      state.dashboardEmployeeFilter = "";
      state.dashboardEmployeeFilterLabel = "";
      if (els.searchInput) els.searchInput.value = employeeName;
      if (els.employeeFilter) els.employeeFilter.value = "Alle ansatte";
      renderEmployeeGroupFilterControl();
      openPersonalCalendarView();
    });
    detail.querySelectorAll("[data-access-user-action]").forEach(button => {
      button.addEventListener("click", event => {
        const sourceRow = event.currentTarget.closest("[data-access-user-row-id]");
        const userId = event.currentTarget.dataset.accessUserId || "";
        const action = event.currentTarget.dataset.accessUserAction || "";
        if (!userId || !action) return;
        if (action === "toggle-active") updateAccessUserActive(userId, event.currentTarget.dataset.accessUserNextAction || "");
        else if (action === "set-role") updateAccessUserRole(userId, sourceRow);
        else if (action === "generate-password") generatePasswordForAccessUser(userId, sourceRow);
        else if (action === "set-password") setTemporaryPasswordForAccessUser(userId, sourceRow);
      });
    });

    detail.querySelectorAll("[data-access-user-password]").forEach(input => {
      input.addEventListener("input", event => {
        const userId = event.currentTarget.dataset.accessUserPassword || "";
        setAccessUserDraftPassword(userId, event.currentTarget.value || "");
      });
    });

    detail.querySelectorAll("[data-employee-card-access-request-action]").forEach(button => {
      button.addEventListener("click", async event => {
        const requestId = event.currentTarget.dataset.accessRequestId || "";
        const action = event.currentTarget.dataset.employeeCardAccessRequestAction || "";
        if (!requestId || !action) return;
        await updateAccessRequestStatus(requestId, action);
        renderEmployees();
      });
    });

    detail.querySelectorAll("[data-employee-card-open-request]").forEach(button => {
      button.addEventListener("click", () => openEmployeeAccessPanel(button.dataset.employeeCardOpenRequest || "", employee.id));
    });

    detail.querySelectorAll("[data-employee-admin-open-admin]").forEach(button => {
      button.addEventListener("click", () => openEmployeeAccessPanel("", employee.id));
    });
  }

  function openEmployeeAccessPanel(requestId = "", employeeId = "") {
    const accessPanel = document.getElementById("employeeAccessAdmin");
    const focusEmployeeId = employeeId || state.employeeAdminSelectedId || "";
    state.employeeAccessPanelEmployeeId = focusEmployeeId;
    state.employeeAccessPanelRequestId = requestId || "";
    renderAccessUsers();
    renderAccessRequests();
    if (accessPanel) {
      accessPanel.open = true;
      const target = requestId
        ? accessPanel.querySelector(`[data-access-request-row-id="${CSS.escape(requestId)}"]`)
        : accessPanel;
      (target || accessPanel).scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setActiveTab("admin");
    }
  }

  function renderEmployees() {
    if (!els.employeeList) return;
    bindEmployeeAdminFilters();
    updateEmployeeAdminMetrics();

    const searchText = normalizeComparableText(document.getElementById("employeeAdminSearch")?.value || "");
    const selectedGroup = normalizeEmployeeGroup(document.getElementById("employeeAdminGroupFilter")?.value || "");
    const statusFilter = document.getElementById("employeeAdminStatusFilter")?.value || "active";

    const sortedEmployees = state.employees.slice().sort((a, b) => {
      const groupDiff = getEmployeeGroupSortIndex(a.employee_group) - getEmployeeGroupSortIndex(b.employee_group);
      if (groupDiff !== 0) return groupDiff;
      return (a.name || "").localeCompare(b.name || "", "no");
    }).filter(emp => {
      if (statusFilter === "active" && emp.active === false) return false;
      if (statusFilter === "inactive" && emp.active !== false) return false;

      const employeeGroup = normalizeEmployeeGroup(emp.employee_group || "");
      if (selectedGroup && employeeGroup !== selectedGroup) return false;

      if (!searchText) return true;
      const haystack = normalizeComparableText([
        emp.name,
        emp.email,
        emp.phone,
        emp.title,
        emp.employee_type,
        getEmployeeGroupLabel(employeeGroup),
        emp.employee_group
      ].filter(Boolean).join(" "));
      return haystack.includes(searchText);
    });

    if (!sortedEmployees.some(emp => emp.id === state.employeeAdminSelectedId)) {
      state.employeeAdminSelectedId = sortedEmployees[0]?.id || null;
    }
    const selectedEmployee = sortedEmployees.find(emp => emp.id === state.employeeAdminSelectedId) || null;

    const header = `
      <div class="iz-employee-admin-header-row">
        <div>Ansatt</div>
        <div>Stilling</div>
        <div>Gruppe</div>
        <div>Kontakt</div>
        <div class="text-center">Status</div>
      </div>
    `;

    const rows = sortedEmployees.map(emp => {
      const employeeGroup = normalizeEmployeeGroup(emp.employee_group || "");
      const active = emp.active !== false;
      const selected = emp.id === state.employeeAdminSelectedId;
      const groupLabel = getEmployeeGroupLabel(employeeGroup) || "Ingen gruppe valgt";
      const title = emp.title || emp.employee_type || "Ikke satt";
      const contactEmail = emp.email || "Ingen e-post";
      const contactPhone = emp.phone || "Ingen telefon";
      const accessInfo = getEmployeeAdminAccessInfo(emp);
      return `
        <button data-employee-id="${escapeHtml(emp.id)}" class="iz-employee-admin-row ${selected ? "is-selected" : ""} ${active ? "" : "is-inactive"}">
          <div class="min-w-0">
            <div class="flex items-center gap-2 min-w-0">
              ${getEmployeeGroupIconHtml(employeeGroup, "inline-flex h-5 w-5 items-center justify-center text-slate-300 shrink-0")}
              <div class="iz-employee-admin-name truncate">${escapeHtml(emp.name || "Uten navn")}</div>
            </div>
            <div class="iz-employee-admin-sub truncate">${escapeHtml(accessInfo.label)} · ${escapeHtml(emp.employee_type || "Ingen type")}</div>
          </div>
          <div class="iz-employee-admin-cell truncate ${emp.title ? "" : "iz-employee-admin-muted"}">${escapeHtml(title)}</div>
          <div class="iz-employee-admin-cell min-w-0">
            <span class="iz-employee-admin-pill">${getEmployeeGroupIconHtml(employeeGroup, "inline-flex h-4 w-4 items-center justify-center text-slate-300 shrink-0")}<span class="truncate">${escapeHtml(groupLabel)}</span></span>
          </div>
          <div class="iz-employee-admin-cell min-w-0">
            <div class="truncate ${emp.email ? "" : "iz-employee-admin-muted"}">${escapeHtml(contactEmail)}</div>
            <div class="mt-1 truncate ${emp.phone ? "" : "iz-employee-admin-muted"}">${escapeHtml(contactPhone)}</div>
          </div>
          <div class="iz-employee-admin-cell text-center">
            <span class="iz-employee-admin-status ${active ? "is-active" : "is-inactive"}">${active ? "Aktiv" : "Inaktiv"}</span>
          </div>
        </button>
      `;
    }).join("");

    els.employeeList.innerHTML = header + (rows || `<div class="iz-employee-admin-empty">Ingen ansatte matcher filteret.</div>`);

    els.employeeList.querySelectorAll("[data-employee-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.employeeAdminSelectedId = btn.dataset.employeeId;
        const accessPanel = document.getElementById("employeeAccessAdmin");
        if (accessPanel?.open) {
          state.employeeAccessPanelEmployeeId = state.employeeAdminSelectedId || "";
        }
        renderEmployees();
        if (accessPanel?.open) {
          renderAccessUsers();
          renderAccessRequests();
        }
      });
      btn.addEventListener("dblclick", () => openEmployeeModal(btn.dataset.employeeId));
    });

    renderEmployeeAdminDetail(selectedEmployee);
  }

  function renderKanban() {
    const groups = PROJECT_STATUS_OPTIONS.map(status => ({
      status,
      projects: getVisibleProjects().filter(p => p.status === status)
    }));

    els.kanbanBoard.innerHTML = groups.map(group => `
      <div class="rounded-2xl border border-slate-200 bg-slate-50">
        <div class="p-3 border-b border-slate-200 font-medium">${escapeHtml(group.status)} (${group.projects.length})</div>
        <div class="p-3 space-y-2">
          ${group.projects.length ? group.projects.map(project => `
            <div class="rounded-xl border border-slate-200 ${isClosedProject(project) ? "bg-slate-100" : "bg-white"} p-3">
              <div class="font-medium">${escapeHtml(project.name)}</div>
              <div class="mt-1 text-xs text-slate-500">${escapeHtml(project.category)}${project.location ? ` • ${escapeHtml(project.location)}` : ""}</div>
              <div class="mt-1 text-xs text-slate-600">${escapeHtml(formatProjectDateRange(project))}</div>
              <div class="mt-2 text-xs text-slate-600">${escapeHtml(project.notes || "")}</div>
            </div>
          `).join("") : `<div class="text-sm text-slate-400">Ingen prosjekter</div>`}
        </div>
      </div>
    `).join("");
  }

  function renderNotifications() {
    els.notificationList.innerHTML = state.notificationLog.slice(0, 30).map(row => `
      <div class="rounded-xl border border-slate-200 p-3">
        <div class="font-medium">${escapeHtml(row.type)}</div>
        <div class="text-sm text-slate-600">${escapeHtml(row.recipient)} → ${escapeHtml(row.target || "")}</div>
        <div class="text-xs text-slate-400 mt-1">${escapeHtml(formatDateTime(row.created_at))}</div>
      </div>
    `).join("") || `<div class="text-sm text-slate-500">Ingen varsler.</div>`;
  }

  function renderAudit() {
    els.auditList.innerHTML = state.auditLog.slice(0, 30).map(row => `
      <div class="rounded-xl border border-slate-200 p-3">
        <div class="font-medium">${escapeHtml(row.user_name || "System")}</div>
        <div class="text-sm text-slate-600">${escapeHtml(row.action_text || "")}</div>
        <div class="text-xs text-slate-400 mt-1">${escapeHtml(formatDateTime(row.created_at))}</div>
      </div>
    `).join("") || `<div class="text-sm text-slate-500">Ingen endringer.</div>`;
  }

  function renderSystemStatus() {
    if (!els.systemStatus) return;
    const lines = [
      `<div><span class="font-medium">Lagring:</span> ${state.storageMode === "supabase" ? "Supabase" : "Lokal fallback"}</div>`,
      `<div><span class="font-medium">Kalendervisning:</span> ${state.calendarMode === "project" ? "Prosjektplan" : "Personalplan"}</div>`,
      `<div><span class="font-medium">Aktive ansatte:</span> ${state.employees.filter(e => e.active !== false).length}</div>`,
      `<div><span class="font-medium">Antall prosjekter:</span> ${getVisibleProjects().length}</div>`,
      `<div><span class="font-medium">Antall tildelinger:</span> ${state.entries.length}</div>`
    ];

    if (state.supabaseError) {
      lines.push(`<div class="text-red-600"><span class="font-medium">Feil:</span> ${escapeHtml(state.supabaseError)}</div>`);
    }

    els.systemStatus.innerHTML = lines.join("");
  }

  function getProjectSpotlightProject() {
    if (!state.projectSpotlightId) return null;
    const project = getProjectById(state.projectSpotlightId);
    if (!project || isSystemPersonalProject(project)) {
      state.projectSpotlightId = "";
      return null;
    }
    return project;
  }

  function expandEmployeeGroupsForProject(projectId) {
    const employeeNames = new Set(state.entries
      .filter(entry => entry.project_id === projectId)
      .map(entry => entry.employee_name)
      .filter(Boolean));

    if (!employeeNames.size) return;

    const groupsToOpen = new Set();
    state.employees.forEach(employee => {
      if (!employeeNames.has(employee.name)) return;
      const group = normalizeEmployeeGroup(employee.employee_group || "");
      groupsToOpen.add(group || "__ungrouped__");
    });

    if (!groupsToOpen.size) return;

    state.collapsedEmployeeGroups = (state.collapsedEmployeeGroups || []).filter(key => !groupsToOpen.has(key));
    localStorage.setItem("planner_collapsed_employee_groups_v1", JSON.stringify(state.collapsedEmployeeGroups));
  }

  function setProjectSpotlight(projectId) {
    const project = getProjectById(projectId);
    if (!project || isSystemPersonalProject(project)) return;

    if (state.projectSpotlightId === project.id) {
      state.projectSpotlightId = "";
      renderCalendar();
      return;
    }

    state.projectSpotlightId = project.id;
    expandEmployeeGroupsForProject(project.id);
    renderCalendar();
  }

  function clearProjectSpotlight() {
    if (!state.projectSpotlightId) return;
    state.projectSpotlightId = "";
    renderCalendar();
  }

  function renderProjectSpotlightBar() {
    if (!els.projectSpotlightBar) return;
    const project = getProjectSpotlightProject();
    if (!project || state.calendarMode !== "personal") {
      els.projectSpotlightBar.className = "hidden";
      els.projectSpotlightBar.innerHTML = "";
      return;
    }

    els.projectSpotlightBar.className = "project-spotlight-bar";
    els.projectSpotlightBar.innerHTML = `
      <div class="min-w-0 truncate">Fokus: <strong>${escapeHtml(displayProjectName(project))}</strong></div>
      <button id="clearProjectSpotlightBtn" type="button" class="project-spotlight-clear">Nullstill fokus</button>
    `;

    const clearBtn = document.getElementById("clearProjectSpotlightBtn");
    if (clearBtn) clearBtn.addEventListener("click", clearProjectSpotlight);
  }

  function getEntrySpotlightClass(project) {
    const spotlight = getProjectSpotlightProject();
    if (!spotlight || state.calendarMode !== "personal") return "";
    if (project && project.id === spotlight.id) return " project-spotlight-active";
    return " project-spotlight-muted";
  }

  function getProjectPanelFocusClass(projectId) {
    if (state.calendarMode !== "project" || !state.calendarPanelOpen || !state.focusProjectId) return "";
    return projectId === state.focusProjectId ? " project-panel-focus-active" : " project-panel-focus-muted";
  }

  function renderCalendar() {
    if (!els.calendarWrap) return;
    const range = getCurrentRange();
    els.rangeTitle.innerHTML = getRangeTitle();
    renderHolidayInfo(range);
    renderProjectSpotlightBar();
    renderLegend();
    updateCalendarSearchControls();
    renderCalendarPanel();

    if (state.calendarMode === "project") {
      renderProjectCalendar();
      return;
    }

    if (state.viewMode === "År") {
      renderPersonalYearCalendar();
      return;
    }

    renderPersonalDayCalendar();
  }

  function renderPersonalDayCalendar() {
    const range = getCurrentRange();
    const days = getDaysBetween(range.start, range.end);
    const employees = getFilteredEmployees();
    const employeeGroups = getCalendarEmployeeGroups(employees);

    const dashboardFilterBanner = state.dashboardEmployeeFilter
      ? `<div id="dashboardEmployeeFilterBanner"><div><strong>Dashboard-filter:</strong> ${escapeHtml(state.dashboardEmployeeFilterLabel || "Utvalg")} · viser ${employees.length} ansatte · ${escapeHtml(getDashboardAnalysisPeriodLabel())}</div><button type="button" id="clearDashboardEmployeeFilterBtn">Vis alle ansatte</button></div>`
      : "";

    const stickyWidth = 264;
    const colWidth = Math.max(28, state.viewMode === "Uke" ? 38 : 32);
    const totalWidth = colWidth * days.length;

    let html = dashboardFilterBanner;
    html += `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px; min-width:${stickyWidth + totalWidth}px; position:relative;">`;
    html += renderTodayLineOverlay(days, stickyWidth, colWidth);
    html += `<div class="day-grid border border-slate-200 rounded-2xl overflow-visible" style="grid-template-columns:${stickyWidth}px repeat(${days.length}, ${colWidth}px);">`;
    html += renderTimelineHeaderRows(days, "Ansatt");

    const warnings = [];

    for (const group of employeeGroups) {
      const collapsed = isEmployeeGroupCollapsed(group.key);
      html += `
        <div class="employee-plan-group-header sticky-col border-r border-b border-slate-200 bg-slate-50 px-3 py-2">
          <button type="button" data-employee-group-toggle="${escapeHtml(group.key)}" class="w-full flex items-center justify-between gap-3 text-left text-slate-800">
            <span class="min-w-0 flex items-center gap-2">
              <span class="text-xs text-slate-500">${collapsed ? "▶" : "▼"}</span>
              ${group.iconHtml}
              <span class="font-semibold text-sm truncate">${escapeHtml(group.label)}</span>
              <span class="employee-plan-group-count rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">${group.employees.length}</span>
            </span>
          </button>
        </div>
        <div class="employee-plan-group-fill border-b border-slate-200 bg-slate-50/70" style="grid-column: span ${days.length}; width:${totalWidth}px; min-height:34px;"></div>
      `;

      if (collapsed) continue;

      for (const employee of group.employees) {
        const employeeEntries = getVisibleEntriesForEmployee(employee.name, range.start, range.end);

        html += `
          <div class="employee-plan-name-cell sticky-col border-r border-b border-slate-200 px-3 py-2 ${getEmployeeCalendarCellClass(employee)}">
            <div>${getEmployeeNameTabHtml(employee)}</div>
            ${employee.title ? `<div class="employee-plan-title text-[11px] opacity-80 leading-tight mt-1">${escapeHtml(employee.title)}</div>` : ""}
          </div>
        `;

        html += `<div class="row-overlay border-b border-slate-200 drop-row" data-employee-name="${escapeHtml(employee.name)}" data-range-start="${toIsoDate(range.start)}" data-col-width="${colWidth}" data-total-cols="${days.length}" data-time-unit="day" style="grid-column: span ${days.length}; width:${totalWidth}px;">`;

        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          const nextDay = days[i + 1] || null;
          const monthBoundary = !nextDay || nextDay.getMonth() !== day.getMonth();
          const redDay = isRedDay(day);
          const todayCellStyle = getTodayColumnStyle(day, "cell");
          html += `<div data-drop-slot-index="${i}" data-drop-date="${toIsoDate(day)}" data-today-column="${isTodayDate(day) ? "true" : "false"}" class="day-cell ${redDay ? "red-day" : ""}" style="position:absolute; left:${i * colWidth}px; width:${colWidth}px; border-right:${monthBoundary ? "2px solid #94a3b8" : "1px solid #e2e8f0"}; ${todayCellStyle}"></div>`;
        }

        html += `<div style="position:relative; width:${totalWidth}px; min-height:40px;">`;

        for (const entry of employeeEntries) {
          const project = getProjectById(entry.project_id);
          if (!project) continue;

          const clipped = clipRange(asLocalDate(entry.start_date), asLocalDate(entry.end_date), range.start, range.end);
          const startIndex = diffDays(range.start, clipped.start);
          const spanDays = diffDays(clipped.start, clipped.end) + 1;
          const left = startIndex * colWidth + 2;
          const width = Math.max(spanDays * colWidth - 4, 40);

          html += `
            <div
              class="entry-bar ${getEntryBarClasses(project, entry.role, entry)}${getEntrySpotlightClass(project)}"
              style="left:${left}px; width:${width}px;"
              data-entry-id="${escapeHtml(entry.id)}"
              data-project-id="${escapeHtml(project.id)}"
              data-system-personal="${isSystemPersonalProject(project) ? "true" : "false"}"
              draggable="true"
              title="${escapeHtml(`${employee.name} | ${displayProjectName(project)} | ${entry.role} | ${entry.start_date} - ${entry.end_date}${entry.notes ? ` | ${entry.notes}` : ""}`)}"
            >
              <div class="font-semibold">${escapeHtml(displayProjectName(project))}</div>
              ${isSystemPersonalProject(project) ? "" : `<div class="text-[11px] opacity-90">${escapeHtml(entry.role)}</div>`}
              <div data-resize-handle data-resize-type="entry" data-target-id="${escapeHtml(entry.id)}" title="${window.izomaxTranslateKey?.("resizeEndDate") || "Dra for å endre sluttdato"}" style="position:absolute; top:0; right:0; bottom:0; width:12px; cursor:ew-resize; border-left:1px solid rgba(255,255,255,0.35); background:linear-gradient(to left, rgba(255,255,255,0.35), rgba(255,255,255,0));"></div>
            </div>
          `;

          const overlappingCount = employeeEntries.filter(other =>
            other.id !== entry.id &&
            overlaps(entry.start_date, entry.end_date, other.start_date, other.end_date)
          ).length;

          if (overlappingCount > 0) {
            warnings.push(`${employee.name} har overlappende tildelinger rundt ${entry.start_date}–${entry.end_date}.`);
          }
        }

        html += `</div></div>`;
      }
    }

    html += `</div></div>`;
    els.calendarWrap.innerHTML = html;
    const clearDashboardBtn = document.getElementById("clearDashboardEmployeeFilterBtn");
    if (clearDashboardBtn) clearDashboardBtn.addEventListener("click", clearDashboardEmployeeFilter);
    bindEmployeeGroupCollapseButtons();
    bindEntryClicks();
    bindResizeHandles();
    renderWarnings(uniqueArray(warnings));
  }

  function renderPersonalYearCalendar() {
    const employees = getFilteredEmployees();
    const employeeGroups = getCalendarEmployeeGroups(employees);
    const year = state.startDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    const calendarWrapWidth = Math.max(els.calendarWrap.clientWidth - 8, 900);
    const stickyWidth = 280;
    const usableWidth = Math.max(calendarWrapWidth - stickyWidth, 1000);
    const monthWidth = usableWidth / 12;
    const totalWidth = monthWidth * 12;

    let html = `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px;">`;
    html += `<div class="month-summary-grid border border-slate-200 rounded-2xl overflow-hidden" style="grid-template-columns:${stickyWidth}px repeat(12, ${monthWidth}px);">`;
    html += `<div class="sticky-col z-30 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-semibold">Ansatt</div>`;

    for (const month of months) {
      html += `<div class="border-b border-r border-slate-200 px-2 py-3 text-center text-sm bg-white text-slate-700 font-medium">${escapeHtml(capitalize(monthLong(month)))}</div>`;
    }

    const warnings = [];
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    for (const group of employeeGroups) {
      const collapsed = isEmployeeGroupCollapsed(group.key);
      html += `
        <div class="employee-plan-group-header sticky-col border-r border-b border-slate-200 bg-slate-50 px-3 py-2">
          <button type="button" data-employee-group-toggle="${escapeHtml(group.key)}" class="w-full flex items-center justify-between gap-3 text-left text-slate-800">
            <span class="min-w-0 flex items-center gap-2">
              <span class="text-xs text-slate-500">${collapsed ? "▶" : "▼"}</span>
              ${group.iconHtml}
              <span class="font-semibold text-sm truncate">${escapeHtml(group.label)}</span>
              <span class="employee-plan-group-count rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">${group.employees.length}</span>
            </span>
          </button>
        </div>
        <div class="employee-plan-group-fill border-b border-slate-200 bg-slate-50/70" style="grid-column: span 12; width:${totalWidth}px; min-height:34px;"></div>
      `;

      if (collapsed) continue;

      for (const employee of group.employees) {
        const employeeEntries = getVisibleEntriesForEmployee(employee.name, yearStart, yearEnd);

        html += `
          <div class="employee-plan-name-cell sticky-col border-r border-b border-slate-200 px-3 py-2 ${getEmployeeCalendarCellClass(employee)}">
            <div>${getEmployeeNameTabHtml(employee)}</div>
            ${employee.title ? `<div class="employee-plan-title text-[11px] text-slate-600 leading-tight mt-1">${escapeHtml(employee.title)}</div>` : ""}
          </div>
        `;

        html += `<div class="row-overlay border-b border-slate-200 drop-row" data-employee-name="${escapeHtml(employee.name)}" data-range-start="${toIsoDate(yearStart)}" data-col-width="${monthWidth}" data-total-cols="12" data-time-unit="month" style="grid-column: span 12; width:${totalWidth}px;">`;

        for (let i = 0; i < 12; i++) {
          html += `<div data-drop-slot-index="${i}" data-drop-month-index="${i}" class="month-cell" style="position:absolute; left:${i * monthWidth}px; width:${monthWidth}px;"></div>`;
        }

        html += `<div style="position:relative; width:${totalWidth}px; min-height:56px;">`;

        for (const entry of employeeEntries) {
          const project = getProjectById(entry.project_id);
          if (!project) continue;

          const entryStart = asLocalDate(entry.start_date);
          const entryEnd = asLocalDate(entry.end_date);
          const startMonth = Math.max(0, entryStart.getFullYear() < year ? 0 : entryStart.getMonth());
          const endMonth = Math.min(11, entryEnd.getFullYear() > year ? 11 : entryEnd.getMonth());
          const spanMonths = (endMonth - startMonth) + 1;
          const left = startMonth * monthWidth + 2;
          const width = Math.max(spanMonths * monthWidth - 4, 40);

          html += `
            <div
              class="entry-bar ${getEntryBarClasses(project, entry.role, entry)}${getEntrySpotlightClass(project)}"
              style="left:${left}px; width:${width}px;"
              data-entry-id="${escapeHtml(entry.id)}"
              data-project-id="${escapeHtml(project.id)}"
              data-system-personal="${isSystemPersonalProject(project) ? "true" : "false"}"
              draggable="true"
              title="${escapeHtml(`${employee.name} | ${displayProjectName(project)} | ${entry.role} | ${entry.start_date} - ${entry.end_date}`)}"
            >
              <div class="font-semibold">${escapeHtml(displayProjectName(project))}</div>
              <div class="text-[11px] opacity-90">${escapeHtml(formatYearBarLabel(entry.start_date, entry.end_date))}</div>
              <div data-resize-handle data-resize-type="entry" data-target-id="${escapeHtml(entry.id)}" title="${window.izomaxTranslateKey?.("resizeEndDate") || "Dra for å endre sluttdato"}" style="position:absolute; top:0; right:0; bottom:0; width:12px; cursor:ew-resize; border-left:1px solid rgba(255,255,255,0.35); background:linear-gradient(to left, rgba(255,255,255,0.35), rgba(255,255,255,0));"></div>
            </div>
          `;
        }

        html += `</div></div>`;
      }
    }

    html += `</div></div>`;
    els.calendarWrap.innerHTML = html;
    bindEmployeeGroupCollapseButtons();
    bindEntryClicks();
    bindResizeHandles();
    renderWarnings(uniqueArray(warnings));
  }

  function renderProjectCalendar() {
    const range = getCurrentRange();
    const warnings = [];

    if (state.viewMode === "År") {
      renderProjectYearCalendar(range, warnings);
      return;
    }

    renderProjectDayCalendar(range, warnings);
  }

  function renderProjectDayCalendar(range, warnings) {
    const days = getDaysBetween(range.start, range.end);
    const projects = getProjectCalendarItems().filter(project => projectOverlapsRange(project, range.start, range.end));

    const stickyWidth = 380;
    const colWidth = Math.max(28, state.viewMode === "Uke" ? 38 : 32);
    const totalWidth = colWidth * days.length;

    let html = `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px; min-width:${stickyWidth + totalWidth}px; position:relative;">`;
    html += renderTodayLineOverlay(days, stickyWidth, colWidth);
    html += `<div class="day-grid border border-slate-200 rounded-2xl overflow-visible" style="grid-template-columns:${stickyWidth}px repeat(${days.length}, ${colWidth}px);">`;
    html += renderTimelineHeaderRows(days, window.izomaxTranslateKey?.("projectHeader") || "Prosjekt");

    for (const project of projects) {
      const assigned = getProjectAssignedCount(project.id);
      const required = Number(project.headcount_required || 0);
      const staffing = getProjectStaffingLabel(project.id, required);
      const projectPeriods = filterProjectPeriodsByPhase(project, getProjectTimelinePeriodsWithWorkshop(project));

      html += `
        <button type="button" data-project-list-row-id="${escapeHtml(project.id)}" class="sticky-col project-plan-name-cell border-r border-b border-slate-200 px-3 py-1.5 text-left ${project.id === state.focusProjectId ? "bg-blue-50 ring-2 ring-blue-200" : isClosedProject(project) ? "bg-slate-100" : "bg-white"}${getProjectPanelFocusClass(project.id)}">
          <div class="project-plan-title">${escapeHtml(project.name)}</div>
          <div class="project-plan-meta">
            <span class="${staffing.variant}">${escapeHtml(staffing.text)}${required ? ` (${assigned}/${required})` : ""}</span>
            ${project.location ? `<span class="text-slate-400">·</span><span>${escapeHtml(project.location)}</span>` : ""}
            ${project.has_multiple_periods && getProjectTimelinePeriods(project).length ? `<span class="text-slate-400">·</span><span>${getProjectTimelinePeriods(project).length} feltperioder + workshop</span>` : ""}
          </div>
        </button>
      `;

      html += `<div class="row-overlay border-b border-slate-200 project-workshop-drop-row" data-project-drop-row-id="${escapeHtml(project.id)}" data-range-start="${toIsoDate(range.start)}" data-col-width="${colWidth}" data-total-cols="${days.length}" data-time-unit="day" style="grid-column: span ${days.length}; width:${totalWidth}px;">`;

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const nextDay = days[i + 1] || null;
        const monthBoundary = !nextDay || nextDay.getMonth() !== day.getMonth();
        const redDay = isRedDay(day);
        const todayCellStyle = getTodayColumnStyle(day, "cell");
          html += `<div data-drop-slot-index="${i}" data-drop-date="${toIsoDate(day)}" data-today-column="${isTodayDate(day) ? "true" : "false"}" class="day-cell ${redDay ? "red-day" : ""}" style="position:absolute; left:${i * colWidth}px; width:${colWidth}px; border-right:${monthBoundary ? "2px solid #94a3b8" : "1px solid #e2e8f0"}; ${todayCellStyle}"></div>`;
      }

      html += `<div style="position:relative; width:${totalWidth}px; min-height:52px;">`;

      for (const period of projectPeriods) {
        const clipped = clipRange(asLocalDate(period.start), asLocalDate(period.end), range.start, range.end);
        const startIndex = diffDays(range.start, clipped.start);
        const spanDays = diffDays(clipped.start, clipped.end) + 1;
        const left = startIndex * colWidth + 2;
        const width = Math.max(spanDays * colWidth - 4, 40);
        const periodLabel = period.phase === "workshop"
          ? `${window.izomaxTranslateKey?.("workshopMobilization") || "Workshop / mobilisering"} · ${window.izomaxTranslateKey?.("need") || "behov"} ${period.required || 2}`
          : (project.has_multiple_periods && projectPeriods.filter(item => item.phase !== "workshop").length > 1 ? `${formatDate(period.start)} – ${formatDate(period.end)}` : staffing.text);
        const periodClasses = getProjectPeriodBarClasses(project, period);

        html += `
          <div
            class="entry-bar ${periodClasses} ${(period.phase === "workshop" || (period.phase !== "workshop" && !project.has_multiple_periods)) ? "cursor-move" : ""} ${project.id === state.focusProjectId ? 'ring-2 ring-blue-300 ring-offset-1' : ''}${getProjectPanelFocusClass(project.id)}"
            style="left:${left}px; width:${width}px;"
            data-project-row-id="${escapeHtml(project.id)}"
            data-project-period-phase="${escapeHtml(period.phase || "field")}"
            ${period.phase === "workshop" ? `data-workshop-project-id="${escapeHtml(project.id)}" draggable="true"` : ""}
            ${period.phase !== "workshop" && !project.has_multiple_periods ? `data-field-project-id="${escapeHtml(project.id)}" draggable="true"` : ""}
            title="${escapeHtml(`${project.name} | ${period.phase === "workshop" ? (window.izomaxTranslateKey?.("workshopMobilization") || "Workshop / mobilisering") : (window.izomaxTranslateKey?.("fieldAssignment") || "Feltoppdrag")} | ${formatDate(period.start)} – ${formatDate(period.end)} | ${period.phase === "workshop" ? `${window.izomaxTranslateKey?.("workshopNeed") || "Workshopbehov"} ${period.required || 2}` : staffing.text}`)}"
          >
            <div class="font-semibold">${escapeHtml(project.name)}</div>
            <div class="text-[11px] opacity-90">${escapeHtml(periodLabel)}</div>
            <div
              data-resize-handle
              data-resize-type="${period.phase === "workshop" ? "workshop" : "project"}"
              data-target-id="${escapeHtml(project.id)}"
              title="${period.phase === "workshop" ? (window.izomaxTranslateKey?.("resizeWorkshopEndDate") || "Dra for å endre workshop-sluttdato") : (window.izomaxTranslateKey?.("resizeProjectEndDate") || "Dra for å endre prosjektsluttdato")}"
              style="position:absolute; top:0; right:0; bottom:0; width:14px; cursor:ew-resize; border-left:1px solid rgba(255,255,255,0.42); background:linear-gradient(to left, rgba(255,255,255,0.42), rgba(255,255,255,0));"
            ></div>
          </div>
        `;
      }

      html += `</div></div>`;
    }

    html += `</div></div>`;
    els.calendarWrap.innerHTML = html;

    els.calendarWrap.querySelectorAll("[data-project-row-id]").forEach(el => {
      el.addEventListener("click", () => selectProjectInCalendar(el.dataset.projectRowId));
    });
    els.calendarWrap.querySelectorAll("[data-project-list-row-id]").forEach(el => {
      el.addEventListener("click", () => selectProjectInCalendar(el.dataset.projectListRowId));
    });
    bindWorkshopPhaseDrag();
    bindFieldProjectDrag();
    bindResizeHandles();
    renderWarnings(uniqueArray(warnings));
  }

  function renderProjectYearCalendar(range, warnings) {
    const year = range.start.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    const projects = getProjectCalendarItems().filter(project => projectOverlapsRange(project, range.start, range.end));

    const calendarWrapWidth = Math.max(els.calendarWrap.clientWidth - 8, 900);
    const stickyWidth = 320;
    const usableWidth = Math.max(calendarWrapWidth - stickyWidth, 1000);
    const monthWidth = usableWidth / 12;
    const totalWidth = monthWidth * 12;

    let html = `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px;">`;
    html += `<div class="month-summary-grid border border-slate-200 rounded-2xl overflow-hidden" style="grid-template-columns:${stickyWidth}px repeat(12, ${monthWidth}px);">`;
    html += `<div class="sticky-col z-30 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-semibold">${escapeHtml(window.izomaxTranslateKey?.("projectHeader") || "Prosjekt")}</div>`;

    for (const month of months) {
      html += `<div class="border-b border-r border-slate-200 px-2 py-3 text-center text-sm bg-white text-slate-700 font-medium">${escapeHtml(capitalize(monthLong(month)))}</div>`;
    }

    for (const project of projects) {
      const assigned = getProjectAssignedCount(project.id);
      const required = Number(project.headcount_required || 0);
      const staffing = getProjectStaffingLabel(project.id, required);

      html += `
        <div class="sticky-col project-plan-name-cell border-r border-b border-slate-200 px-3 py-3 ${isClosedProject(project) ? "bg-slate-100" : ""}${getProjectPanelFocusClass(project.id)}">
          <div class="font-medium">${escapeHtml(project.name)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(project.location || "")}</div>
          <div class="text-xs ${staffing.variant} mt-1">${escapeHtml(staffing.text)}${required ? ` (${assigned}/${required})` : ""}</div>
        </div>
      `;

      html += `<div class="row-overlay border-b border-slate-200" data-range-start="${toIsoDate(range.start)}" data-col-width="${monthWidth}" data-total-cols="12" data-time-unit="month" style="grid-column: span 12; width:${totalWidth}px;">`;

      for (let i = 0; i < 12; i++) {
        html += `<div data-drop-slot-index="${i}" data-drop-month-index="${i}" class="month-cell" style="position:absolute; left:${i * monthWidth}px; width:${monthWidth}px;"></div>`;
      }

      html += `<div style="position:relative; width:${totalWidth}px; min-height:56px;">`;

      const yearPeriods = filterProjectPeriodsByPhase(project, getProjectTimelinePeriodsWithWorkshop(project)).filter(period => overlaps(period.start, period.end, new Date(year, 0, 1), new Date(year, 11, 31)));
      for (const period of yearPeriods) {
        const start = asLocalDate(period.start);
        const end = asLocalDate(period.end);
        if (!start || !end) continue;
        const startMonth = Math.max(0, start.getFullYear() < year ? 0 : start.getMonth());
        const endMonth = Math.min(11, end.getFullYear() > year ? 11 : end.getMonth());
        const spanMonths = (endMonth - startMonth) + 1;
        const left = startMonth * monthWidth + 2;
        const width = Math.max(spanMonths * monthWidth - 4, 40);
        const periodLabel = period.phase === "workshop" ? `${window.izomaxTranslateKey?.("workshopMobilization") || "Workshop / mobilisering"} · ${window.izomaxTranslateKey?.("need") || "behov"} ${period.required || 2}` : staffing.text;

        html += `
          <div
            class="entry-bar ${getProjectPeriodBarClasses(project, period)} ${project.id === state.focusProjectId ? 'ring-2 ring-blue-300 ring-offset-1' : ''}${getProjectPanelFocusClass(project.id)}"
            style="left:${left}px; width:${width}px;"
            data-project-row-id="${escapeHtml(project.id)}"
            title="${escapeHtml(`${project.name} | ${period.phase === "workshop" ? (window.izomaxTranslateKey?.("workshopMobilization") || "Workshop / mobilisering") : (window.izomaxTranslateKey?.("fieldAssignment") || "Feltoppdrag")} | ${formatDate(period.start)} – ${formatDate(period.end)} | ${period.phase === "workshop" ? `${window.izomaxTranslateKey?.("workshopNeed") || "Workshopbehov"} ${period.required || 2}` : staffing.text}`)}"
          >
            <div class="font-semibold">${escapeHtml(project.name)}</div>
            <div class="text-[11px] opacity-90">${escapeHtml(periodLabel)}</div>
            ${period.phase !== "workshop" ? `<div data-resize-handle data-resize-type="project" data-target-id="${escapeHtml(project.id)}" title="${window.izomaxTranslateKey?.("resizeEndDate") || "Dra for å endre sluttdato"}" style="position:absolute; top:0; right:0; bottom:0; width:12px; cursor:ew-resize; border-left:1px solid rgba(255,255,255,0.35); background:linear-gradient(to left, rgba(255,255,255,0.35), rgba(255,255,255,0));"></div>` : ""}
          </div>
        `;
      }

      html += `</div></div>`;
    }

    html += `</div></div>`;
    els.calendarWrap.innerHTML = html;

    els.calendarWrap.querySelectorAll("[data-project-row-id]").forEach(el => {
      el.addEventListener("click", () => selectProjectInCalendar(el.dataset.projectRowId));
    });
    els.calendarWrap.querySelectorAll("[data-project-list-row-id]").forEach(el => {
      el.addEventListener("click", () => selectProjectInCalendar(el.dataset.projectListRowId));
    });
    bindResizeHandles();

    renderWarnings(uniqueArray(warnings));
  }

  function renderWarnings(warnings) {
    if (!warnings.length) {
      els.warningBox.classList.add("hidden");
      els.warningBox.innerHTML = "";
      return;
    }

    els.warningBox.classList.remove("hidden");
    els.warningBox.innerHTML = `
      <div class="font-semibold mb-2">Mulige konflikter</div>
      <ul class="list-disc pl-5 space-y-1">
        ${warnings.map(w => `<li>${escapeHtml(w)}</li>`).join("")}
      </ul>
    `;
  }

  function bindEntryClicks() {
    const editable = canEditApp();

    els.calendarWrap.querySelectorAll("[data-entry-id]").forEach(el => {
      if (!editable) {
        el.setAttribute("draggable", "false");
        const projectId = el.dataset.projectId || "";
        const isPersonal = el.dataset.systemPersonal === "true";
        if (projectId && !isPersonal) {
          el.style.cursor = "pointer";
          el.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            setProjectSpotlight(projectId);
          });
        } else {
          el.style.cursor = "default";
        }
        return;
      }

      el.addEventListener("click", event => {
        if (state.justDraggedEntryId === el.dataset.entryId) return;
        if (event.target?.closest?.("[data-resize-handle]")) return;

        const projectId = el.dataset.projectId || "";
        const isPersonal = el.dataset.systemPersonal === "true";
        if (projectId && !isPersonal) {
          event.preventDefault();
          event.stopPropagation();
          setProjectSpotlight(projectId);
          return;
        }

        openEditModal(el.dataset.entryId);
      });

      el.addEventListener("dblclick", event => {
        if (state.justDraggedEntryId === el.dataset.entryId) return;
        event.preventDefault();
        event.stopPropagation();
        openEditModal(el.dataset.entryId);
      });

      el.addEventListener("dragstart", event => {
        state.dragEntryId = el.dataset.entryId;
        const row = el.closest(".row-overlay");
        state.dragAnchor = getDragAnchorFromPointer(el, row, event.clientX);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", el.dataset.entryId);
        requestAnimationFrame(() => {
          el.classList.add("opacity-60");
        });
      });

      el.addEventListener("dragend", () => {
        el.classList.remove("opacity-60");
        state.dragEntryId = null;
        state.dragAnchor = { timeUnit: "day", slotOffset: 0 };
      });
    });

    if (!editable) return;

    els.calendarWrap.querySelectorAll(".drop-row").forEach(row => {
      row.addEventListener("contextmenu", event => {
        openCalendarContextMenuFromEvent(event);
      });

      row.addEventListener("dragover", event => {
        if (!state.dragEntryId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        row.classList.add("ring-2", "ring-sky-300", "ring-inset");
      });

      row.addEventListener("dragleave", () => {
        row.classList.remove("ring-2", "ring-sky-300", "ring-inset");
      });

      row.addEventListener("drop", async event => {
        event.preventDefault();
        row.classList.remove("ring-2", "ring-sky-300", "ring-inset");
        const entryId = event.dataTransfer.getData("text/plain") || state.dragEntryId;
        const targetEmployeeName = row.dataset.employeeName;
        if (!entryId || !targetEmployeeName) return;

        const dropMeta = getDropMetaFromRow(row, event);
        await moveEntryByDrop(entryId, targetEmployeeName, dropMeta);
      });
    });
  }

  function bindWorkshopPhaseDrag() {
    if (!canEditApp()) return;

    els.calendarWrap.querySelectorAll("[data-workshop-project-id]").forEach(el => {
      el.addEventListener("click", event => {
        if (state.dragWorkshopProjectId) return;
      });

      el.addEventListener("dragstart", event => {
        const projectId = el.dataset.workshopProjectId || "";
        if (!projectId) return;
        state.dragWorkshopProjectId = projectId;
        const row = el.closest(".row-overlay");
        state.dragAnchor = getDragAnchorFromPointer(el, row, event.clientX);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/workshop-project-id", projectId);
        event.dataTransfer.setData("text/plain", `workshop:${projectId}`);
        requestAnimationFrame(() => {
          el.classList.add("opacity-60");
        });
      });

      el.addEventListener("dragend", () => {
        el.classList.remove("opacity-60");
        state.dragWorkshopProjectId = null;
        state.dragAnchor = { timeUnit: "day", slotOffset: 0 };
      });
    });

    els.calendarWrap.querySelectorAll("[data-project-drop-row-id]").forEach(row => {
      row.addEventListener("dragover", event => {
        if (!state.dragWorkshopProjectId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        row.classList.add("ring-2", "ring-green-300", "ring-inset");
      });

      row.addEventListener("dragleave", () => {
        row.classList.remove("ring-2", "ring-green-300", "ring-inset");
      });

      row.addEventListener("drop", async event => {
        if (!state.dragWorkshopProjectId) return;
        event.preventDefault();
        row.classList.remove("ring-2", "ring-green-300", "ring-inset");

        const projectId = event.dataTransfer.getData("text/workshop-project-id") || state.dragWorkshopProjectId;
        const targetProjectId = row.dataset.projectDropRowId || "";
        if (!projectId || !targetProjectId || projectId !== targetProjectId) return;

        const dropMeta = getDropMetaFromRow(row, event);
        await moveWorkshopPhaseByDrop(projectId, dropMeta);
      });
    });
  }

  async function moveWorkshopPhaseByDrop(projectId, dropMeta = null) {
    if (!canEditApp()) return;
    const project = getProjectById(projectId);
    if (!project || project.workshop_enabled === false) return;

    const currentStart = project.workshop_start_date;
    const currentEnd = project.workshop_end_date;
    if (!currentStart || !currentEnd) {
      alert("Workshopfasen mangler start/slutt. Rediger prosjektet og lagre workshopdatoer først.");
      return;
    }

    const original = {
      workshop_start_date: currentStart,
      workshop_end_date: currentEnd
    };

    let newStart = null;
    const durationDays = Math.max(0, diffDays(asLocalDate(currentStart), asLocalDate(currentEnd)));

    if (dropMeta?.timeUnit === "day" && dropMeta.rangeStart && Number.isFinite(dropMeta.colIndex)) {
      const pointerBaseDate = dropMeta.dropDate
        ? parseIsoDateLocal(dropMeta.dropDate)
        : addDays(parseIsoDateLocal(dropMeta.rangeStart), dropMeta.colIndex);
      const anchorOffset = Math.max(0, Number(state.dragAnchor?.slotOffset || 0));
      newStart = addDays(pointerBaseDate, -anchorOffset);
    }

    if (!newStart || Number.isNaN(newStart.getTime())) return;

    const newEnd = addDays(newStart, durationDays);
    const newStartIso = toIsoDate(newStart);
    const newEndIso = toIsoDate(newEnd);

    if (newStartIso === currentStart && newEndIso === currentEnd) return;

    project.workshop_start_date = newStartIso;
    project.workshop_end_date = newEndIso;

    rebuildDerivedState();
    saveAllLocal();
    renderAll();

    const result = await saveRow("planner_projects", project);
    if (!result.ok) {
      project.workshop_start_date = original.workshop_start_date;
      project.workshop_end_date = original.workshop_end_date;
      rebuildDerivedState();
      saveAllLocal();
      renderAll();
      alert("Kunne ikke lagre flytting av workshopfasen. Endringen er rullet tilbake.");
      return;
    }

    void addAudit(`Flyttet workshopfase: ${project.name} (${newStartIso} – ${newEndIso})`);
  }

  function bindFieldProjectDrag() {
    if (!canEditApp()) return;

    els.calendarWrap.querySelectorAll("[data-field-project-id]").forEach(el => {
      el.addEventListener("dragstart", event => {
        if (event.target?.closest?.("[data-resize-handle]")) {
          event.preventDefault();
          return;
        }
        const projectId = el.dataset.fieldProjectId || "";
        if (!projectId) return;
        state.dragFieldProjectId = projectId;
        const row = el.closest(".row-overlay");
        state.dragAnchor = getDragAnchorFromPointer(el, row, event.clientX);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/field-project-id", projectId);
        event.dataTransfer.setData("text/plain", `field:${projectId}`);
        requestAnimationFrame(() => {
          el.classList.add("opacity-60");
        });
      });

      el.addEventListener("dragend", () => {
        el.classList.remove("opacity-60");
        state.dragFieldProjectId = null;
        state.dragAnchor = { timeUnit: "day", slotOffset: 0 };
      });
    });

    els.calendarWrap.querySelectorAll("[data-project-drop-row-id]").forEach(row => {
      row.addEventListener("dragover", event => {
        if (!state.dragFieldProjectId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        row.classList.add("ring-2", "ring-red-300", "ring-inset");
      });

      row.addEventListener("dragleave", () => {
        if (!state.dragFieldProjectId) return;
        row.classList.remove("ring-2", "ring-red-300", "ring-inset");
      });

      row.addEventListener("drop", async event => {
        if (!state.dragFieldProjectId) return;
        event.preventDefault();
        row.classList.remove("ring-2", "ring-red-300", "ring-inset");

        const projectId = event.dataTransfer.getData("text/field-project-id") || state.dragFieldProjectId;
        const targetProjectId = row.dataset.projectDropRowId || "";
        if (!projectId || !targetProjectId || projectId !== targetProjectId) return;

        const dropMeta = getDropMetaFromRow(row, event);
        await moveFieldProjectByDrop(projectId, dropMeta);
      });
    });
  }

  async function moveFieldProjectByDrop(projectId, dropMeta = null) {
    if (!canEditApp()) return;
    const project = getProjectById(projectId);
    if (!project) return;

    if (project.has_multiple_periods) {
      alert("Flytting av feltprosjekt støtter foreløpig kun prosjekter med én feltperiode.");
      return;
    }

    const currentStart = project.planned_start_date;
    const currentEnd = project.planned_end_date;
    if (!currentStart || !currentEnd) {
      alert("Feltprosjektet mangler start/slutt. Rediger prosjektet og lagre datoer først.");
      return;
    }

    const original = {
      planned_start_date: currentStart,
      planned_end_date: currentEnd
    };

    let newStart = null;
    const durationDays = Math.max(0, diffDays(asLocalDate(currentStart), asLocalDate(currentEnd)));

    if (dropMeta?.timeUnit === "day" && dropMeta.rangeStart && Number.isFinite(dropMeta.colIndex)) {
      const pointerBaseDate = dropMeta.dropDate
        ? parseIsoDateLocal(dropMeta.dropDate)
        : addDays(parseIsoDateLocal(dropMeta.rangeStart), dropMeta.colIndex);
      const anchorOffset = Math.max(0, Number(state.dragAnchor?.slotOffset || 0));
      newStart = addDays(pointerBaseDate, -anchorOffset);
    }

    if (!newStart || Number.isNaN(newStart.getTime())) return;

    const newEnd = addDays(newStart, durationDays);
    const newStartIso = toIsoDate(newStart);
    const newEndIso = toIsoDate(newEnd);

    if (newStartIso === currentStart && newEndIso === currentEnd) return;

    project.planned_start_date = newStartIso;
    project.planned_end_date = newEndIso;

    rebuildDerivedState();
    saveAllLocal();
    renderAll();

    const result = await saveRow("planner_projects", project);
    if (!result.ok) {
      project.planned_start_date = original.planned_start_date;
      project.planned_end_date = original.planned_end_date;
      rebuildDerivedState();
      saveAllLocal();
      renderAll();
      alert("Kunne ikke lagre flytting av feltprosjektet. Endringen er rullet tilbake.");
      return;
    }

    void addAudit(`Flyttet feltprosjekt: ${project.name} (${newStartIso} – ${newEndIso})`);
  }

  async function moveEntryToEmployee(entryId, targetEmployeeName) {
    return moveEntryByDrop(entryId, targetEmployeeName, null);
  }

  function bindResizeHandles() {
    if (!canEditApp()) return;

    els.calendarWrap.querySelectorAll('[data-resize-handle]').forEach(handle => {
      handle.addEventListener('mousedown', startResizeFromHandle);
      handle.addEventListener('dragstart', event => {
        event.preventDefault();
        event.stopPropagation();
      });
    });
  }

  function startResizeFromHandle(event) {
    event.preventDefault();
    event.stopPropagation();

    const handle = event.currentTarget;
    const type = handle.dataset.resizeType || '';
    const targetId = handle.dataset.targetId || '';
    const bar = handle.closest('.entry-bar');
    const row = handle.closest('.row-overlay');
    if (!type || !targetId || !bar || !row) return;

    const snapshot = getResizeSnapshot(type, targetId);
    if (!snapshot) return;

    state.resize = {
      active: true,
      type,
      targetId,
      row,
      bar,
      originalEndDate: snapshot.originalEndDate,
      previewEndDate: snapshot.originalEndDate,
      originalValueSnapshot: snapshot
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
  }

  function getResizeSnapshot(type, targetId) {
    if (type === 'entry') {
      const entry = state.entries.find(item => item.id === targetId);
      if (!entry) return null;
      return {
        entry,
        originalEndDate: entry.end_date,
        originalStartDate: entry.start_date
      };
    }

    if (type === 'project') {
      const project = state.projects.find(item => item.id === targetId);
      if (!project) return null;
      return {
        project,
        originalEndDate: project.planned_end_date || project.planned_start_date || '',
        originalStartDate: project.planned_start_date || ''
      };
    }

    if (type === 'workshop') {
      const project = state.projects.find(item => item.id === targetId);
      if (!project) return null;
      return {
        project,
        originalEndDate: project.workshop_end_date || project.workshop_start_date || '',
        originalStartDate: project.workshop_start_date || ''
      };
    }

    return null;
  }

  function handleResizePointerMove(event) {
    if (!state.resize.active || !state.resize.row) return;

    const preview = getResizePreviewFromPointer(state.resize, event.clientX);
    if (!preview?.endDate) return;

    state.resize.previewEndDate = preview.endDate;
    applyResizePreview(state.resize, preview);
  }

  function getResizePreviewFromPointer(resizeState, clientX) {
    const row = resizeState.row;
    const rowRect = row.getBoundingClientRect();
    const syntheticEvent = { clientX, clientY: rowRect.top + (rowRect.height / 2) };
    const dropMeta = getDropMetaFromRow(row, syntheticEvent);
    const snapshot = resizeState.originalValueSnapshot;
    if (!dropMeta || !snapshot?.originalStartDate) return null;

    if (dropMeta.timeUnit === 'day') {
      const pointerDate = dropMeta.dropDate
        ? parseIsoDateLocal(dropMeta.dropDate)
        : addDays(parseIsoDateLocal(dropMeta.rangeStart), Number(dropMeta.colIndex || 0));
      const startDate = parseIsoDateLocal(snapshot.originalStartDate);
      if (!pointerDate || !startDate) return null;
      const resolvedEnd = pointerDate < startDate ? startDate : pointerDate;
      return {
        endDate: toIsoDate(resolvedEnd),
        colIndex: dropMeta.colIndex,
        timeUnit: 'day'
      };
    }

    if (dropMeta.timeUnit === 'month') {
      const monthIndex = Number.isFinite(dropMeta.dropMonthIndex) ? dropMeta.dropMonthIndex : Number(dropMeta.colIndex || 0);
      const startDate = parseIsoDateLocal(snapshot.originalStartDate);
      const originalEndDate = parseIsoDateLocal(snapshot.originalEndDate);
      const rangeStart = parseIsoDateLocal(dropMeta.rangeStart);
      if (!startDate || !rangeStart || !originalEndDate) return null;
      const targetMonth = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + monthIndex, 1);
      const clampedDay = Math.min(originalEndDate.getDate(), daysInMonth(targetMonth.getFullYear(), targetMonth.getMonth()));
      targetMonth.setDate(clampedDay);
      const resolvedEnd = targetMonth < startDate ? startDate : targetMonth;
      return {
        endDate: toIsoDate(resolvedEnd),
        colIndex: monthIndex,
        timeUnit: 'month'
      };
    }

    return null;
  }

  function applyResizePreview(resizeState, preview) {
    const snapshot = resizeState.originalValueSnapshot;
    if (!snapshot?.originalStartDate || !resizeState.bar || !resizeState.row) return;

    const row = resizeState.row;
    const totalCols = Number(row.dataset.totalCols || 0);
    const slotWidth = Number(row.dataset.colWidth || 0);
    const timeUnit = row.dataset.timeUnit || 'day';
    if (!totalCols || !slotWidth) return;

    let startIndex = 0;
    let endIndex = 0;

    if (timeUnit === 'day') {
      const rangeStart = parseIsoDateLocal(row.dataset.rangeStart);
      const startDate = parseIsoDateLocal(snapshot.originalStartDate);
      const endDate = parseIsoDateLocal(preview.endDate);
      if (!rangeStart || !startDate || !endDate) return;
      startIndex = clampSlotIndex(diffDays(rangeStart, startDate), totalCols);
      endIndex = clampSlotIndex(diffDays(rangeStart, endDate), totalCols);
    } else {
      const rangeStart = parseIsoDateLocal(row.dataset.rangeStart);
      const startDate = parseIsoDateLocal(snapshot.originalStartDate);
      const endDate = parseIsoDateLocal(preview.endDate);
      if (!rangeStart || !startDate || !endDate) return;
      startIndex = clampSlotIndex((startDate.getFullYear() - rangeStart.getFullYear()) * 12 + (startDate.getMonth() - rangeStart.getMonth()), totalCols);
      endIndex = clampSlotIndex((endDate.getFullYear() - rangeStart.getFullYear()) * 12 + (endDate.getMonth() - rangeStart.getMonth()), totalCols);
    }

    const span = Math.max(1, endIndex - startIndex + 1);
    resizeState.bar.style.width = `${Math.max(span * slotWidth - 4, 40)}px`;
  }

  async function handleResizePointerUp() {
    if (!state.resize.active) return;

    const resizeState = { ...state.resize };
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    state.resize = {
      active: false,
      type: '',
      targetId: '',
      row: null,
      bar: null,
      originalEndDate: '',
      previewEndDate: '',
      originalValueSnapshot: null
    };

    const snapshot = resizeState.originalValueSnapshot;
    const nextEndDate = resizeState.previewEndDate || resizeState.originalEndDate;
    if (!snapshot || !nextEndDate || nextEndDate === resizeState.originalEndDate) {
      renderCalendar();
      return;
    }

if (resizeState.type === 'entry' && snapshot.entry) {
  const entry = snapshot.entry;
  const originalEndDate = entry.end_date;
  entry.end_date = nextEndDate;

  const conflicts = getEntryOverlapConflicts(entry, entry.id);
  if (conflicts.length) {
    entry.end_date = originalEndDate;
    renderAll();
    alert(getEntryConflictSummary(entry, conflicts));
    return;
  }

  rebuildDerivedState();
  renderAll();
  const result = await saveRow('planner_entries', entry);
  if (!result.ok) {
    entry.end_date = originalEndDate;
    rebuildDerivedState();
    renderAll();
    return;
  }
  const project = getProjectById(entry.project_id);
  void addAudit(`Endret sluttdato: ${displayProjectName(project) || 'Ukjent prosjekt'} for ${entry.employee_name} til ${nextEndDate}`);
  return;
}

    if (resizeState.type === 'project' && snapshot.project) {
      const project = snapshot.project;
      const originalEndDate = project.planned_end_date;
      project.planned_end_date = nextEndDate;
      rebuildDerivedState();
      renderAll();
      const result = await saveRow('planner_projects', project);
      if (!result.ok) {
        project.planned_end_date = originalEndDate;
        rebuildDerivedState();
        renderAll();
        return;
      }
      void addAudit(`Endret prosjektsluttdato: ${project.name} til ${nextEndDate}`);
    }

    if (resizeState.type === 'workshop' && snapshot.project) {
      const project = snapshot.project;
      const originalEndDate = project.workshop_end_date;
      project.workshop_end_date = nextEndDate;
      rebuildDerivedState();
      renderAll();
      const result = await saveRow('planner_projects', project);
      if (!result.ok) {
        project.workshop_end_date = originalEndDate;
        rebuildDerivedState();
        renderAll();
        return;
      }
      void addAudit(`Endret workshop-sluttdato: ${project.name} til ${nextEndDate}`);
    }

    flushPendingRemoteRefresh();
  }


async function moveEntryByDrop(entryId, targetEmployeeName, dropMeta = null) {
  if (!canEditApp()) return;
  const entry = state.entries.find(e => e.id === entryId);
  if (!entry) return;

  const previous = {
    employee_name: entry.employee_name,
    start_date: entry.start_date,
    end_date: entry.end_date
  };

  let changed = false;

  if (targetEmployeeName && entry.employee_name !== targetEmployeeName) {
    entry.employee_name = targetEmployeeName;
    changed = true;
  }

  if (dropMeta?.timeUnit === "day" && dropMeta.rangeStart && Number.isFinite(dropMeta.colIndex)) {
    const durationDays = Math.max(0, diffDays(asLocalDate(entry.start_date), asLocalDate(entry.end_date)));
    const adjustedIndex = getAdjustedDropColIndex(dropMeta);
    const pointerBaseDate = dropMeta.dropDate
      ? parseIsoDateLocal(dropMeta.dropDate)
      : addDays(parseIsoDateLocal(dropMeta.rangeStart), dropMeta.colIndex);
    const pointerDate = pointerBaseDate;
    const anchorOffset = Math.max(0, Number(state.dragAnchor?.slotOffset || 0));
    const newStart = addDays(pointerDate, -anchorOffset);
    const fallbackStart = addDays(parseIsoDateLocal(dropMeta.rangeStart), adjustedIndex);
    const resolvedStart = Number.isFinite(newStart?.getTime?.()) ? newStart : fallbackStart;
    const newEnd = addDays(resolvedStart, durationDays);
    const newStartIso = toIsoDate(resolvedStart);
    const newEndIso = toIsoDate(newEnd);
    if (entry.start_date !== newStartIso || entry.end_date !== newEndIso) {
      entry.start_date = newStartIso;
      entry.end_date = newEndIso;
      changed = true;
    }
  }

  if (dropMeta?.timeUnit === "month" && dropMeta.rangeStart && Number.isFinite(dropMeta.colIndex)) {
    const durationDays = Math.max(0, diffDays(asLocalDate(entry.start_date), asLocalDate(entry.end_date)));
    const originalStart = asLocalDate(entry.start_date);
    const targetMonthBase = parseIsoDateLocal(dropMeta.rangeStart);
    const adjustedIndex = getAdjustedDropColIndex(dropMeta);
    const shiftedStart = new Date(targetMonthBase.getFullYear(), targetMonthBase.getMonth() + adjustedIndex, 1);
    const clampedDay = Math.min(originalStart.getDate(), daysInMonth(shiftedStart.getFullYear(), shiftedStart.getMonth()));
    shiftedStart.setDate(clampedDay);
    const shiftedEnd = addDays(shiftedStart, durationDays);
    const newStartIso = toIsoDate(shiftedStart);
    const newEndIso = toIsoDate(shiftedEnd);
    if (entry.start_date !== newStartIso || entry.end_date !== newEndIso) {
      entry.start_date = newStartIso;
      entry.end_date = newEndIso;
      changed = true;
    }
  }

  if (!changed) return;

  const conflicts = getEntryOverlapConflicts(entry, entry.id);
  if (conflicts.length) {
    entry.employee_name = previous.employee_name;
    entry.start_date = previous.start_date;
    entry.end_date = previous.end_date;
    rebuildDerivedState();
    renderStats();
    renderCalendar();
    alert(getEntryConflictSummary(entry, conflicts));
    return;
  }

  rebuildDerivedState();
  renderStats();
  renderCalendar();

  const result = await saveRow("planner_entries", entry);
  if (!result.ok) {
    entry.employee_name = previous.employee_name;
    entry.start_date = previous.start_date;
    entry.end_date = previous.end_date;
    rebuildDerivedState();
    renderStats();
    renderCalendar();
    return;
  }

  state.justDraggedEntryId = entryId;
  setTimeout(() => {
    if (state.justDraggedEntryId === entryId) state.justDraggedEntryId = null;
  }, 250);

  const project = getProjectById(entry.project_id);
  renderProjects();
  renderEmployees();
  renderSystemStatus();
  void addAudit(`Flyttet tildeling: ${displayProjectName(project) || "Ukjent prosjekt"} fra ${previous.employee_name} (${previous.start_date}–${previous.end_date}) til ${entry.employee_name} (${entry.start_date}–${entry.end_date})`);
}

function getDashboardAnalysisRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = addDays(start, 14);
    return { start, end };
  }

  function getDashboardAnalysisPeriodLabel() {
    const range = getDashboardAnalysisRange();
    return `${formatDate(range.start)} – ${formatDate(range.end)}`;
  }

  function getDashboardEmployeeFilterNames() {
    const filterType = state.dashboardEmployeeFilter || "";
    if (!filterType) return null;

    const range = getDashboardAnalysisRange();
    const startKey = makeLocalDateISO(range.start);
    const endKey = makeLocalDateISO(range.end);
    const activeNames = new Set((state.employees || []).filter(emp => emp.active !== false).map(emp => emp.name));
    const names = new Set();
    const personalTypes = new Set(["Ferie", "Syk", "Avspasering", "Kurs", "Travel"]);
    const entriesByName = new Map();

    (state.entries || []).forEach(entry => {
      const employeeName = entry.employee_name || entry.employeeName || "";
      if (!employeeName || !activeNames.has(employeeName)) return;
      const entryStart = entry.start_date || entry.start || "";
      const entryEnd = entry.end_date || entry.end || "";
      if (!entryStart || !entryEnd || entryStart > endKey || entryEnd < startKey) return;
      if (!entriesByName.has(employeeName)) entriesByName.set(employeeName, []);
      entriesByName.get(employeeName).push(entry);
    });

    activeNames.forEach(employeeName => {
      const entries = entriesByName.get(employeeName) || [];
      const away = entries.some(entry => {
        const project = getProjectById(entry.project_id || entry.projectId || "");
        return !!project && isSystemPersonalProject(project) && personalTypes.has(project.category);
      });
      const onProject = entries.some(entry => {
        const project = getProjectById(entry.project_id || entry.projectId || "");
        return !!project && !isSystemPersonalProject(project) && !isCancelledProject(project) && normalizeProjectStatus(project.status) !== "Fullført";
      });

      if (filterType === "on_project" && onProject) names.add(employeeName);
      if (filterType === "away" && away) names.add(employeeName);
      if (filterType === "available" && !onProject && !away) names.add(employeeName);
    });

    return names;
  }

  function getFilteredEmployees() {
    const selectedGroups = state.selectedEmployeeGroups || [];
    const useGroupFilterControl = !!els.groupFilterControl;
    const dashboardNames = getDashboardEmployeeFilterNames();

    return state.employees
      .filter(emp => {
        const isActive = emp.active !== false;
        const matchesLegacyFilter = state.employeeFilter === "Alle ansatte" || emp.name === state.employeeFilter;
        const employeeGroup = normalizeEmployeeGroup(emp.employee_group || "");
        const matchesGroupFilter = !selectedGroups.length || selectedGroups.includes(employeeGroup);
        const matchesSearch = !state.search || emp.name.toLowerCase().includes(state.search);
        const matchesDashboardFilter = !dashboardNames || dashboardNames.has(emp.name);
        const matchesFilter = useGroupFilterControl ? matchesGroupFilter : matchesLegacyFilter;
        return isActive && matchesFilter && matchesSearch && matchesDashboardFilter;
      })
      .sort((a, b) => {
        const groupDiff = getEmployeeGroupSortIndex(a.employee_group) - getEmployeeGroupSortIndex(b.employee_group);
        if (groupDiff !== 0) return groupDiff;
        return a.name.localeCompare(b.name, "no");
      });
  }

  function getCurrentRange() {
    if (state.viewMode === "Uke") {
      const start = startOfWeek(state.startDate);
      return { start, end: addDays(start, 6) };
    }

    if (state.viewMode === "Måned") {
      const start = new Date(state.startDate.getFullYear(), state.startDate.getMonth(), 1);
      const end = new Date(state.startDate.getFullYear(), state.startDate.getMonth() + 6, 0);
      return { start, end };
    }

    return {
      start: new Date(state.startDate.getFullYear(), 0, 1),
      end: new Date(state.startDate.getFullYear(), 11, 31)
    };
  }

  function getRangeTitle() {
    const range = getCurrentRange();
    const viewLabel = state.calendarMode === "project" ? "Prosjektplan" : "Personalplan";

    if (state.viewMode === "Uke") {
      return `${viewLabel} • Uke ${getIsoWeek(range.start)} • ${formatDate(range.start)} – ${formatDate(range.end)}`;
    }

    if (state.viewMode === "Måned") {
      return `${viewLabel} • Tidslinje • ${formatDate(range.start)} – ${formatDate(range.end)}`;
    }

    return `${viewLabel} • ${range.start.getFullYear()}`;
  }

  function shiftPeriod(direction) {
    if (state.viewMode === "Uke") {
      state.startDate = addDays(startOfWeek(state.startDate), direction * 7);
    } else if (state.viewMode === "Måned") {
      state.startDate = new Date(state.startDate.getFullYear(), state.startDate.getMonth() + direction, 1);
    } else {
      state.startDate = new Date(state.startDate.getFullYear() + direction, 0, 1);
    }
    persistUiState();
  }

  function getProjectById(id) {
    return state.derived.projectById.get(id) || null;
  }

  function getProjectAssignedCount(projectId) {
    return state.derived.entryCountByProject.get(projectId) || 0;
  }

  function getProjectRemainingSlots(projectId, required = null) {
    const project = getProjectById(projectId);
    if (project && isCancelledProject(project)) return 0;
    const requiredBase = required !== null ? required : (project?.headcount_required ?? 0);
    const requiredCount = Math.max(Number(requiredBase), 0);
    const assignedCount = getProjectAssignedCount(projectId);
    return Math.max(requiredCount - assignedCount, 0);
  }

  function projectNeedsStaffing(project) {
    if (!project || isClosedProject(project)) return false;
    const requiredCount = Math.max(Number(project?.headcount_required || 0), 0);
    if (!requiredCount) return false;
    return getProjectAssignedCount(project.id) < requiredCount;
  }

  function getProjectStaffingLabel(projectId, required) {
    const project = getProjectById(projectId);
    if (project && isCancelledProject(project)) {
      return { text: window.izomaxTranslateKey?.("cancelled") || "Kansellert", variant: "text-red-700" };
    }

    const assigned = getProjectAssignedCount(projectId);
    const phases = project ? getProjectTimelinePhaseTypes(project) : { isWorkshopOnly: false };
    const requiredCount = Math.max(Number(required || 0), 0);

    if (phases.isWorkshopOnly) {
      return { text: "Workshop-only", variant: "text-green-700" };
    }

    if (requiredCount === 0) {
      return { text: "Ingen feltbemanning", variant: "text-slate-500" };
    }

    if (assigned === 0) {
      return { text: window.izomaxTranslateKey?.("notStaffed") || "Ikke bemannet", variant: "text-red-700" };
    }

    if (assigned < requiredCount) {
      return { text: window.izomaxTranslateKey?.("partlyStaffed") || "Delvis bemannet", variant: "text-amber-700" };
    }

    return { text: window.izomaxTranslateKey?.("staffed") || "Bemannet", variant: "text-green-700" };
  }

  function projectOverlapsRange(project, rangeStart, rangeEnd) {
    const periods = filterProjectPeriodsByPhase(project, getProjectTimelinePeriodsWithWorkshop(project));
    if (!periods.length) return false;
    return periods.some(period => overlaps(period.start, period.end, rangeStart, rangeEnd));
  }

  function compareProjectDates(a, b) {
    const aDate = a.planned_start_date || "9999-12-31";
    const bDate = b.planned_start_date || "9999-12-31";
    if (aDate === bDate) return a.name.localeCompare(b.name, "no");
    return aDate.localeCompare(bDate);
  }

  function formatProjectDateRange(project) {
    const periods = normalizeProjectPeriods(project?.project_periods_json || []);
    if (project?.has_multiple_periods && periods.length) {
      return periods.map(period => `${formatDate(period.start)} – ${formatDate(period.end)}`).join(", ");
    }
    if (!project.planned_start_date && !project.planned_end_date) return window.izomaxTranslateKey?.("noPlannedPeriod") || "Ingen planlagt periode";
    if (project.planned_start_date && project.planned_end_date) {
      return `${formatDate(project.planned_start_date)} – ${formatDate(project.planned_end_date)}`;
    }
    if (project.planned_start_date) return `${window.izomaxTranslateKey?.("from") || "Fra"} ${formatDate(project.planned_start_date)}`;
    return `${window.izomaxTranslateKey?.("to") || "Til"} ${formatDate(project.planned_end_date)}`;
  }

  function formatDateTime(value) {
    if (!value) return "";
    const d = asLocalDate(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    }).format(d);
  }

  function formatDate(value) {
    const d = asLocalDate(value);
    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit", month: "2-digit", year: "numeric"
    }).format(d);
  }

  function formatYearBarLabel(start, end) {
    return `${capitalize(monthShort(asLocalDate(start)))}–${capitalize(monthShort(asLocalDate(end)))}`;
  }


  function startOfCurrentMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseIsoDateLocal(value) {
    if (!value) return null;
    const parts = String(value).split("-").map(Number);
    if (parts.length !== 3 || parts.some(v => !Number.isFinite(v))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function asLocalDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return parseIsoDateLocal(value);
      }

      const parsedFromString = new Date(value);
      return Number.isNaN(parsedFromString.getTime())
        ? null
        : new Date(parsedFromString.getFullYear(), parsedFromString.getMonth(), parsedFromString.getDate());
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? null
      : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function getDaysBetween(start, end) {
    const result = [];
    const current = asLocalDate(start);
    while (current <= end) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  }

  function diffDays(a, b) {
    const one = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const two = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.round((two - one) / 86400000);
  }

  function overlaps(startA, endA, startB, endB) {
    const a1 = asLocalDate(startA);
    const a2 = asLocalDate(endA);
    const b1 = asLocalDate(startB);
    const b2 = asLocalDate(endB);
    return a1 <= b2 && a2 >= b1;
  }

  function clipRange(start, end, rangeStart, rangeEnd) {
    return {
      start: start < rangeStart ? rangeStart : start,
      end: end > rangeEnd ? rangeEnd : end
    };
  }

  function sameDate(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  function weekdayShort(date) {
    return capitalize(new Intl.DateTimeFormat("no-NO", { weekday: "short" }).format(date));
  }

  function monthShort(date) {
    return new Intl.DateTimeFormat("no-NO", { month: "short" }).format(date);
  }

  function monthLong(date) {
    return new Intl.DateTimeFormat("no-NO", { month: "long" }).format(date);
  }

  function getIsoWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }


  function getAdjustedDropColIndex(dropMeta) {
    const totalCols = Number(dropMeta?.totalCols || 0);
    const rawIndex = Number(dropMeta?.colIndex);
    if (!Number.isFinite(rawIndex)) return 0;

    const anchor = state.dragAnchor || { timeUnit: dropMeta?.timeUnit || "day", slotOffset: 0 };
    const sameUnit = anchor.timeUnit === (dropMeta?.timeUnit || "day");
    const anchorOffset = sameUnit ? Number(anchor.slotOffset || 0) : 0;
    const adjusted = rawIndex - anchorOffset;

    if (totalCols > 0) {
      return clampSlotIndex(adjusted, totalCols);
    }
    return Math.max(0, adjusted);
  }

  function getDragAnchorFromPointer(entryEl, row, clientX) {
    const timeUnit = row?.dataset?.timeUnit || "day";
    const totalCols = Number(row?.dataset?.totalCols || 0);
    const barRect = entryEl?.getBoundingClientRect?.();
    const rowRect = row?.getBoundingClientRect?.();

    if (!barRect || !rowRect || !totalCols || !rowRect.width) {
      return { timeUnit, slotOffset: 0 };
    }

    const slotWidth = rowRect.width / totalCols;
    if (!slotWidth) {
      return { timeUnit, slotOffset: 0 };
    }

    const pointerOffsetPx = Math.max(0, Math.min(barRect.width - 1, clientX - barRect.left));
    const spanSlots = Math.max(1, Math.round(barRect.width / slotWidth));
    const slotOffset = Math.max(0, Math.min(spanSlots - 1, Math.floor(pointerOffsetPx / slotWidth)));

    return { timeUnit, slotOffset };
  }

  function getDropMetaFromRow(row, event) {
    const colWidth = Number(row.dataset.colWidth || 0);
    const totalCols = Number(row.dataset.totalCols || 0);
    const timeUnit = row.dataset.timeUnit || "day";
    const rangeStart = row.dataset.rangeStart || null;

    if (!colWidth || !totalCols || !rangeStart) {
      return { timeUnit, rangeStart, totalCols, colIndex: null, dropDate: null, dropMonthIndex: null };
    }

    const slot = getDropSlotFromPointer(row, event.clientX, event.clientY);
    if (slot) {
      const idx = Number(slot.dataset.dropSlotIndex);
      return {
        timeUnit,
        rangeStart,
        totalCols,
        colIndex: Number.isFinite(idx) ? clampSlotIndex(idx, totalCols) : null,
        dropDate: slot.dataset.dropDate || null,
        dropMonthIndex: Number.isFinite(Number(slot.dataset.dropMonthIndex)) ? Number(slot.dataset.dropMonthIndex) : null
      };
    }

    const rect = row.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 1, event.clientX - rect.left));
    const colIndex = Math.max(0, Math.min(totalCols - 1, Math.floor(x / colWidth)));
    const fallbackDate = timeUnit === "day" ? toIsoDate(addDays(parseIsoDateLocal(rangeStart), colIndex)) : null;
    return { timeUnit, rangeStart, totalCols, colIndex, dropDate: fallbackDate, dropMonthIndex: timeUnit === "month" ? colIndex : null };
  }

  function getDropSlotFromPointer(row, clientX, clientY) {
    const slots = Array.from(row.querySelectorAll('[data-drop-slot-index]'));
    if (!slots.length) return null;

    if (typeof document.elementsFromPoint === 'function') {
      const hitElements = document.elementsFromPoint(clientX, clientY);
      for (const el of hitElements) {
        if (!(el instanceof HTMLElement)) continue;
        const slot = el.matches('[data-drop-slot-index]') ? el : el.closest('[data-drop-slot-index]');
        if (slot && row.contains(slot)) return slot;
      }
    }

    for (const slot of slots) {
      const rect = slot.getBoundingClientRect();
      if (clientX >= rect.left && clientX < rect.right && clientY >= rect.top && clientY < rect.bottom) {
        return slot;
      }
    }

    let bestSlot = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const slot of slots) {
      const rect = slot.getBoundingClientRect();
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      const distance = Math.abs(clientX - centerX) + (Math.abs(clientY - centerY) * 0.25);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSlot = slot;
      }
    }

    return bestSlot;
  }

  function getDropSlotIndexFromPointer(row, clientX, clientY, totalCols) {
    const slot = getDropSlotFromPointer(row, clientX, clientY);
    if (!slot) return null;
    const idx = Number(slot.dataset.dropSlotIndex);
    return Number.isFinite(idx) ? clampSlotIndex(idx, totalCols) : null;
  }

  function clampSlotIndex(index, totalCols) {
    return Math.max(0, Math.min(totalCols - 1, index));
  }

  function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function capitalize(value) {
    const str = String(value || "");
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function displayProjectName(project) {
    if (!project) return "";
    return isSystemPersonalProject(project) ? project.category : project.name;
  }

  function getCategoryColorClasses(category) {
    const value = String(category || "").trim();
    switch (value) {
      case "Syk":
        return "bg-red-900 border-red-950 text-white";
      case "Kurs":
        return "bg-slate-300 border-slate-400 text-slate-900";
      case "Ferie":
        return "bg-pink-300 border-pink-400 text-slate-900";
      case "Avspasering":
        return "bg-yellow-300 border-yellow-400 text-slate-900";
      case "Travel":
        return "bg-sky-500 border-sky-600 text-white";
      case "Offshore":
      case "Onshore":
      case "Feltoppdrag":
      default:
        return "bg-red-600 border-red-700 text-white";
    }
  }

  function getLegendDotClasses(category) {
    const value = String(category || "").trim();
    switch (value) {
      case "Workshop / mobilisering":
        return "bg-green-600";
      case "Onshore":
      case "Offshore":
      case "Feltoppdrag":
        return "bg-red-600";
      case "Syk":
        return "bg-red-900";
      case "Kurs":
        return "bg-slate-400";
      case "Ferie":
        return "bg-pink-300";
      case "Avspasering":
        return "bg-yellow-300";
      case "Travel":
        return "bg-sky-500";
      default:
        return "bg-slate-400";
    }
  }

  function getProjectPeriodBarClasses(project, period = null) {
    if (period?.phase === "workshop") {
      return "bg-green-600 border-green-700 text-white";
    }
    return getProjectBarClasses(project);
  }

  function getEntryBarClasses(project, role, entry = null) {
    const categoryClasses = getCategoryColorClasses(project?.category);
    const cancelledClasses = isCancelledProject(project) ? " bg-red-100 border-red-500 text-red-800 line-through decoration-red-600 decoration-2 opacity-80 grayscale" : "";
    const endedClasses = !cancelledClasses && isCompletedProject(project) ? " opacity-70 grayscale" : "";
    const conflictClasses = entry && entryHasVisibleConflict(entry) ? " overlap-conflict border-2 border-red-700 ring-2 ring-red-300" : "";
    return `${cancelledClasses || categoryClasses}${endedClasses}${conflictClasses}`;
  }

  function getProjectBarClasses(project) {
    const categoryClasses = getCategoryColorClasses(project?.category);
    if (isCancelledProject(project)) return "bg-red-100 border-red-500 text-red-800 line-through decoration-red-600 decoration-2 opacity-80 grayscale";
    const endedClasses = isCompletedProject(project) ? " opacity-70 grayscale" : "";
    return `${categoryClasses}${endedClasses}`;
  }

  function debounce(fn, wait = 100) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  function uniqueArray(arr) {
    return [...new Set(arr)];
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();

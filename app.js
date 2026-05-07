(() => {
  // v18.44-approved-request-user-setup-v1-safe
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
    }
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

  // v18.21-ansattplan-today-highlight-safe
  function getTodayColumnStyle(date, mode = "cell") {
    if (!isTodayDate(date)) return "";
    if (mode === "header") {
      return "background:linear-gradient(180deg, rgba(219,234,254,0.98), rgba(239,246,255,0.98)); color:#1d4ed8; box-shadow:inset 2px 0 0 #3b82f6, inset -2px 0 0 #3b82f6; position:relative; z-index:5;";
    }
    return "background:rgba(59,130,246,0.10); box-shadow:inset 2px 0 0 rgba(37,99,235,0.85), inset -2px 0 0 rgba(37,99,235,0.35); z-index:1;";
  }

  function getTodayHeaderBadgeHtml(date) {
    if (!isTodayDate(date)) return "";
    return `<div style="margin:2px auto 0; width:max-content; border-radius:999px; background:#2563eb; color:#ffffff; padding:1px 6px; font-size:9px; font-weight:800; line-height:1.2;">I dag</div>`;
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

    const existingEmployeeCol = employeeSection.firstElementChild;
    if (existingEmployeeCol) {
      existingEmployeeCol.className = "xl:col-span-1";
      const employeeList = existingEmployeeCol.querySelector("#employeeList");
      if (employeeList) {
        employeeList.className = "space-y-2 max-h-[760px] overflow-auto scrollbar-thin";
      }
    }

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
    wrapper.className = "xl:col-span-3";
    wrapper.innerHTML = `
      <div id="personalBlockCard" class="rounded-2xl bg-white border border-slate-200 shadow-sm h-full">
        <div class="p-4 border-b border-slate-200">
          <h2 id="personalBlockTitle" class="font-semibold">Direkte blokk på ansatt</h2>
          <p id="personalBlockDescription" class="text-sm text-slate-500 mt-1">Brukes for kurs, ferie, syk og avspasering direkte på personen, uten å gå via prosjektmodulen.</p>
        </div>
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select id="personalBlockEmployee" class="w-full rounded-2xl border border-slate-300 px-3 py-2"></select>
            <select id="personalBlockType" class="w-full rounded-2xl border border-slate-300 px-3 py-2"></select>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input id="personalBlockStart" type="date" class="rounded-2xl border border-slate-300 px-3 py-2" />
            <input id="personalBlockEnd" type="date" class="rounded-2xl border border-slate-300 px-3 py-2" />
          </div>
          <textarea id="personalBlockNotes" class="w-full rounded-2xl border border-slate-300 px-3 py-2" rows="4" placeholder="Notat"></textarea>
          <button id="personalBlockSaveBtn" class="w-full rounded-2xl bg-slate-900 text-white px-4 py-2">Lagre blokk i kalender</button>
        </div>
      </div>
    `;
    employeeSection.appendChild(wrapper);

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

  function canApproveAccessRequests() {
    return isSuperadmin() || isAdminUser();
  }

  function canManageUserAccess() {
    return isSuperadmin();
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

  function getEmployeePortalProjectTitle(project) {
    const name = displayProjectName(project) || "Neste prosjekt";
    const code = extractProjectCode(name) || String(project?.id || "").slice(0, 8).toUpperCase();
    const cleanName = getProjectNameWithoutCode(name);
    return { code, cleanName, full: `${code}  ${cleanName}`.trim() };
  }

  function getWorkshopText(project) {
    const workshop = getDefaultWorkshopPeriodForProject(project, getProjectTimelinePeriods(project));
    if (workshop?.start && workshop?.end) return `${formatDate(workshop.start)} – ${formatDate(workshop.end)}`;
    if (project?.workshop_start_date && project?.workshop_end_date) return `${formatDate(project.workshop_start_date)} – ${formatDate(project.workshop_end_date)}`;
    return "Ikke satt";
  }

  function getEmployeePortalTeam(projectId, currentEmployeeName) {
    const byName = new Map();
    (state.entries || [])
      .filter(entry => entry?.project_id === projectId && entry.employee_name && entry.employee_name !== currentEmployeeName)
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

  function renderEmployeePortalTimeline(project) {
    const bounds = getProjectDateBounds(project);
    const months = getTimelineMonths(bounds.start, bounds.end);
    const workshop = getDefaultWorkshopPeriodForProject(project, getProjectTimelinePeriods(project));
    const wsStart = workshop?.start || project?.workshop_start_date || bounds.start;
    const wsEnd = workshop?.end || project?.workshop_end_date || wsStart;
    const wsLeft = getTimelinePercent(wsStart, months);
    const wsRight = getTimelinePercent(wsEnd, months);
    const wsWidth = Math.max(wsRight - wsLeft, 3);

    return `
      <section class="iz-emp-card iz-emp-section-card">
        <div class="iz-emp-section-head">
          <div class="iz-emp-section-icon">▣</div>
          <div class="iz-emp-section-title">Prosjektkalender</div>
        </div>
        <div class="iz-emp-timeline" aria-label="Prosjektkalender">
          ${months.map(month => `<div class="iz-emp-month">${escapeHtml(month.label)}</div>`).join("")}
          <div class="iz-emp-timeline-track">
            <div class="iz-emp-line"></div>
            <div class="iz-emp-workshop-line" style="left:${wsLeft}%; width:${wsWidth}%;"></div>
          </div>
        </div>
        <div class="iz-emp-legend"><span><i></i>Prosjektperiode</span><span><i></i>Workshop / feltperiode</span></div>
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

  function renderEmployeePortal() {
    if (!els.employeePortalContent) return;
    const employee = getEmployeePortalEmployee();
    const displayName = employee?.name || getAccountDisplayName();
    const initials = getInitials(displayName);
    if (els.employeePortalTopInitials) els.employeePortalTopInitials.textContent = initials;
    if (els.employeePortalTopName) els.employeePortalTopName.textContent = displayName;

    if (!employee) {
      els.employeePortalContent.innerHTML = `<div class="iz-emp-empty">Fant ikke ansattprofil koblet til ${escapeHtml(state.currentUserEmail || "innlogget bruker")}. Opprett en ansatt med samme e-postadresse, eller koble brukeren til ansattprofilen.</div>`;
      return;
    }

    const assignments = getEmployeePortalAssignments(employee);
    const next = getEmployeePortalNextAssignment(assignments);
    const history = getEmployeePortalHistory(assignments);

    if (!next) {
      els.employeePortalContent.innerHTML = `
        <section class="iz-emp-card iz-emp-project-card">
          <div class="iz-emp-project-icon">⌁</div>
          <div>
            <div class="iz-emp-eyebrow">Min side</div>
            <div class="iz-emp-title">Ingen kommende prosjekter</div>
            <div class="iz-emp-empty">Du har ingen aktive eller kommende prosjekt-tildelinger registrert.</div>
          </div>
        </section>
        ${renderEmployeePortalHistory(history)}
      `;
      return;
    }

    const project = next.project;
    const title = getEmployeePortalProjectTitle(project);
    const bounds = getProjectDateBounds(project);
    const team = getEmployeePortalTeam(project.id, employee.name);
    const periodText = bounds.start && bounds.end ? `${formatDate(bounds.start)} – ${formatDate(bounds.end)}` : `${formatDate(next.start_date)} – ${formatDate(next.end_date)}`;
    const roleText = next.role || employee.title || "Ikke satt";

    els.employeePortalContent.innerHTML = `
      <section class="iz-emp-card iz-emp-project-card">
        <div class="iz-emp-project-icon">♒</div>
        <div>
          <div class="iz-emp-eyebrow">Neste prosjekt</div>
          <div class="iz-emp-title">${escapeHtml(title.full)}</div>
          <div class="iz-emp-meta-row">
            <div class="iz-emp-meta-item"><div class="iz-emp-meta-icon">▣</div><div><div class="iz-emp-meta-label">Periode</div><div class="iz-emp-meta-value">${escapeHtml(periodText)}</div></div></div>
            <div class="iz-emp-meta-item"><div class="iz-emp-meta-icon">♙</div><div><div class="iz-emp-meta-label">Rolle</div><div class="iz-emp-meta-value">${escapeHtml(roleText)}</div></div></div>
            <div class="iz-emp-meta-item"><div class="iz-emp-meta-icon">⌖</div><div><div class="iz-emp-meta-label">Workshop / feltperiode</div><div class="iz-emp-meta-value">${escapeHtml(getWorkshopText(project))}</div></div></div>
          </div>
        </div>
        <button type="button" class="iz-emp-open-project" aria-label="Åpne prosjekt">Åpne prosjekt ›</button>
      </section>
      ${renderEmployeePortalTimeline(project)}
      ${renderEmployeePortalTeam(team)}
      ${renderEmployeePortalHistory(history)}
    `;
  }

  function renderEmployeePortalTeam(team) {
    const items = (team || []).slice(0, 4);
    return `
      <section class="iz-emp-card iz-emp-section-card">
        <div class="iz-emp-section-head"><div class="iz-emp-section-icon">♙</div><div class="iz-emp-section-title">Prosjektteam</div></div>
        ${items.length ? `<div class="iz-emp-team-grid">${items.map(entry => `
          <div class="iz-emp-member">
            <div class="iz-emp-member-avatar">${escapeHtml(getInitials(entry.employee_name))}</div>
            <div class="min-w-0"><div class="iz-emp-member-name">${escapeHtml(entry.employee_name)}</div><div class="iz-emp-member-role">${escapeHtml(entry.role || "Tildelt")}</div></div>
          </div>
        `).join("")}</div>` : `<div class="iz-emp-empty">Ingen andre registrert på prosjektet ennå.</div>`}
      </section>
    `;
  }

  function renderEmployeePortalHistory(history) {
    const rows = (history || []).slice(0, 3);
    return `
      <section class="iz-emp-card iz-emp-history-card">
        <div>
          <div class="iz-emp-section-head"><div class="iz-emp-section-icon">◴</div><div class="iz-emp-section-title">Historikk</div></div>
          ${rows.length ? `<div class="iz-emp-history-list">${rows.map(item => {
            const title = getEmployeePortalProjectTitle(item.project);
            return `<div class="iz-emp-history-row"><div class="iz-emp-history-code">${escapeHtml(title.code)}</div><div class="iz-emp-history-name">${escapeHtml(title.cleanName)}</div><div class="iz-emp-history-date">${escapeHtml(formatDate(item.start_date))} – ${escapeHtml(formatDate(item.end_date))}</div></div>`;
          }).join("")}</div>` : `<div class="iz-emp-empty">Ingen tidligere prosjekter registrert.</div>`}
        </div>
        <button type="button" class="iz-emp-view-all">Vis alle ›</button>
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

    if (!["employee", "reader", "planner", "admin"].includes(requestedAccess)) {
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

    const rows = state.accessRequests.rows || [];
    const pendingCount = rows.filter(row => String(row.status || "pending").toLowerCase() === "pending").length;
    const readyForSetupCount = rows.filter(row => String(row.status || "pending").toLowerCase() === "approved" && !row.setup_completed_at).length;

    if (els.accessApprovalStatus) {
      const loadedText = state.accessRequests.lastLoadedAt ? `Sist hentet ${formatAccessRequestDate(state.accessRequests.lastLoadedAt)}` : "Ikke hentet ennå";
      els.accessApprovalStatus.textContent = state.accessRequests.loading ? "Henter søknader..." : `${pendingCount} ventende • ${readyForSetupCount} klar for oppsett • ${loadedText}`;
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
      els.accessApprovalList.innerHTML = `<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Ingen tilgangssøknader ennå.</div>`;
      return;
    }

    els.accessApprovalList.innerHTML = rows.map(row => {
      const status = String(row.status || "pending").toLowerCase();
      const isPending = status === "pending";
      const isApproved = status === "approved";
      const isSetupCompleted = Boolean(row.setup_completed_at);
      const matchingProfile = findAccessUserProfileByEmail(row.email);
      const canSetup = isApproved && !isSetupCompleted && Boolean(matchingProfile) && canManageUserAccess();
      const setupInfo = renderAccessSetupBlock(row, matchingProfile, canSetup);
      return `
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" data-access-request-row-id="${escapeHtml(row.id)}">
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
          ${setupInfo}
        </div>
      `;
    }).join("");
  }

  function findAccessUserProfileByEmail(email) {
    const normalized = normalizeComparableText(email);
    if (!normalized) return null;
    return (state.accessUsers.rows || []).find(row => normalizeComparableText(row.email) === normalized) || null;
  }

  function getAccessSetupRoleOptions(selectedValue) {
    const selected = String(selectedValue || "").toLowerCase();
    return [
      ["employee", "Ansatt / Min side"],
      ["reader", "Lesetilgang"],
      ["planner", "Planlegger"],
      ["admin", "Admin"]
    ].map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  }

  function getAccessSetupEmployeeOptions(selectedEmployeeId) {
    const selected = String(selectedEmployeeId || "");
    const employees = (state.employees || [])
      .filter(employee => employee?.id && employee.active !== false)
      .slice()
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "no"));

    const options = [`<option value="">Velg ansattprofil</option>`];
    employees.forEach(employee => {
      const label = [employee.name, employee.title, employee.employee_group].filter(Boolean).join(" • ");
      options.push(`<option value="${escapeHtml(employee.id)}" ${String(employee.id) === selected ? "selected" : ""}>${escapeHtml(label || employee.id)}</option>`);
    });
    return options.join("");
  }

  function renderAccessSetupBlock(row, matchingProfile, canSetup) {
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

    if (!matchingProfile) {
      return `
        <div class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <div class="font-semibold">Klar for oppsett, men Auth/profil mangler</div>
          <div class="mt-1">Opprett brukeren først i Supabase Authentication med e-post ${escapeHtml(row.email || "")}. Når profilen finnes i Brukertilganger, kan du sette rolle og koble ansatt her.</div>
        </div>
      `;
    }

    const selectedRole = String(row.approved_role || row.requested_access || "employee").toLowerCase();
    const isEmployeeRole = selectedRole === "employee";
    return `
      <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3" data-access-setup-panel="${escapeHtml(row.id)}">
        <div class="mb-3 text-sm font-semibold text-slate-900">Sett opp tilgang</div>
        <div class="grid gap-3 lg:grid-cols-[220px_minmax(260px,1fr)_auto] lg:items-end">
          <label class="block text-sm text-slate-700">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Endelig rolle</span>
            <select data-access-setup-role="${escapeHtml(row.id)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
              ${getAccessSetupRoleOptions(selectedRole)}
            </select>
          </label>
          <label class="block text-sm text-slate-700">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Koble til ansattprofil</span>
            <select data-access-setup-employee="${escapeHtml(row.id)}" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" ${isEmployeeRole ? "" : "disabled"}>
              ${getAccessSetupEmployeeOptions(row.linked_employee_id)}
            </select>
          </label>
          <button type="button" data-access-action="setup" data-access-request-id="${escapeHtml(row.id)}" class="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40" ${canSetup ? "" : "disabled"}>Lagre tilgang</button>
        </div>
        <div class="mt-2 text-xs text-slate-500">Dette oppretter ikke Auth-bruker. Det oppdaterer eksisterende user_profiles og kobler ansattprofil ved employee-rolle.</div>
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

    if (!["employee", "reader", "planner", "admin"].includes(normalizedRole)) {
      alert("Velg en gyldig rolle.");
      return;
    }

    const profile = findAccessUserProfileByEmail(row.email);
    if (!profile) {
      alert("Fant ikke eksisterende brukerprofil for denne e-posten. Opprett Auth-bruker først i Supabase Authentication, og oppdater Brukertilganger-listen etterpå.");
      return;
    }

    if (profile.id === state.currentUserId) {
      alert("Ikke bruk denne flyten til å endre din egen superadmin-bruker.");
      return;
    }

    if (normalizedRole === "employee" && !employeeId) {
      alert("Velg hvilken ansattprofil brukeren skal kobles til.");
      return;
    }

    const employee = employeeId ? (state.employees || []).find(item => item.id === employeeId) : null;
    const employeeText = employee ? `
Ansattprofil: ${employee.name}` : "";
    const ok = window.confirm(`Vil du sette opp tilgang for ${row.full_name || row.email}?

Rolle: ${formatRequestedAccess(normalizedRole)}${employeeText}

Dette oppdaterer user_profiles og markerer søknaden som ferdig oppsatt. Det oppretter ikke Auth-bruker.`);
    if (!ok) return;

    try {
      const profileUpdate = {
        email: row.email,
        full_name: row.full_name || profile.full_name || null,
        role: normalizedRole,
        is_active: true,
        updated_at: new Date().toISOString(),
        updated_by: state.currentUserId || null
      };

      const { error: profileError } = await supabaseClient
        .from("user_profiles")
        .update(profileUpdate)
        .eq("id", profile.id);
      if (profileError) throw profileError;

      if (normalizedRole === "employee" && employeeId) {
        const { error: employeeError } = await supabaseClient
          .from("planner_employees")
          .update({
            email: row.email,
            updated_at: new Date().toISOString()
          })
          .eq("id", employeeId);
        if (employeeError) throw employeeError;
      }

      const { error: requestError } = await supabaseClient
        .from("access_requests")
        .update({
          setup_completed_at: new Date().toISOString(),
          setup_completed_by: state.currentUserId || null,
          approved_role: normalizedRole,
          linked_employee_id: normalizedRole === "employee" ? employeeId : null,
          review_note: `Tilgang satt opp i access setup v1. Rolle: ${normalizedRole}.`
        })
        .eq("id", requestId)
        .eq("status", "approved");
      if (requestError) throw requestError;

      await fetchFromSupabase();
      await fetchAccessUsers({ silent: true });
      await fetchAccessRequests({ silent: true });
      rebuildDerivedState();
      renderAll();
    } catch (error) {
      alert(`Kunne ikke sette opp tilgang: ${error?.message || "Ukjent feil"}`);
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

  function renderAccessUsers() {
    if (!els.accessUsersList) return;

    const allowed = canManageUserAccess();
    const card = els.accessUsersList.closest(".rounded-2xl");
    if (card) card.style.display = allowed ? "" : "none";
    if (!allowed) return;

    const rows = state.accessUsers.rows || [];
    const activeCount = rows.filter(row => row.is_active !== false).length;
    const inactiveCount = rows.filter(row => row.is_active === false).length;

    if (els.accessUsersStatus) {
      const loadedText = state.accessUsers.lastLoadedAt ? `Sist hentet ${formatAccessRequestDate(state.accessUsers.lastLoadedAt)}` : "Ikke hentet ennå";
      els.accessUsersStatus.textContent = state.accessUsers.loading ? "Henter brukere..." : `${activeCount} aktive • ${inactiveCount} deaktivert • ${loadedText}`;
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
      els.accessUsersList.innerHTML = `<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Ingen brukere funnet.</div>`;
      return;
    }

    els.accessUsersList.innerHTML = rows.map(row => {
      const isCurrentUser = row.id === state.currentUserId;
      const isActive = row.is_active !== false;
      const actionLabel = isActive ? "Deaktiver" : "Aktiver";
      const nextActive = isActive ? "false" : "true";
      const disabled = isCurrentUser ? "disabled" : "";
      const disabledHint = isCurrentUser ? `<div class="text-xs text-slate-400">Du kan ikke deaktivere egen superadmin-bruker.</div>` : "";
      return `
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0 space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <div class="font-semibold text-slate-900">${escapeHtml(row.full_name || row.email || "Uten navn")}</div>
                <span class="rounded-full border px-2.5 py-1 text-xs font-semibold ${getAccessUserStatusBadgeClass(row.is_active)}">${isActive ? "Aktiv" : "Deaktivert"}</span>
                <span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">${escapeHtml(formatRoleLabel(row.role))}</span>
              </div>
              <div class="text-sm text-slate-600">${escapeHtml(row.email || "Ingen e-post")}</div>
              <div class="text-xs text-slate-500">Opprettet ${escapeHtml(formatAccessRequestDate(row.created_at))}${row.updated_at ? ` • Sist endret ${escapeHtml(formatAccessRequestDate(row.updated_at))}` : ""}</div>
              ${disabledHint}
            </div>
            <div class="flex shrink-0 flex-wrap gap-2">
              <button type="button" data-access-user-action="toggle-active" data-access-user-id="${escapeHtml(row.id)}" data-access-user-next-active="${nextActive}" class="rounded-xl ${isActive ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"} px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40" ${disabled}>${actionLabel}</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  async function updateAccessUserActive(userId, nextActiveRaw) {
    if (!canManageUserAccess()) {
      alert("Kun superadmin kan administrere brukertilganger.");
      return;
    }
    if (!userId) return;
    if (userId === state.currentUserId) {
      alert("Du kan ikke deaktivere din egen superadmin-bruker.");
      return;
    }

    const nextActive = String(nextActiveRaw) === "true";
    const user = (state.accessUsers.rows || []).find(row => row.id === userId);
    const name = user?.full_name || user?.email || "denne brukeren";
    const actionText = nextActive ? "aktivere" : "deaktivere";
    const ok = window.confirm(`Vil du ${actionText} tilgangen for ${name}?\n\nDette sletter ikke Auth-brukeren. Det endrer kun user_profiles.is_active.`);
    if (!ok) return;

    try {
      const { error } = await supabaseClient
        .from("user_profiles")
        .update({
          is_active: nextActive,
          updated_at: new Date().toISOString(),
          updated_by: state.currentUserId || null
        })
        .eq("id", userId);

      if (error) throw error;
      await fetchAccessUsers({ silent: true });
    } catch (error) {
      alert(`Kunne ikke oppdatere brukertilgang: ${error?.message || "Ukjent feil"}`);
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

  function getCalendarDropRowFromPointer(event) {
    if (!els.calendarWrap) return null;
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
    // find the visible employee row by Y-position only. The clicked element can be a sticky/name/layout
    // layer even when the pointer is visually over the calendar row.
    const rows = Array.from(els.calendarWrap.querySelectorAll(".drop-row"));
    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      if (event.clientY >= rect.top && event.clientY <= rect.bottom) {
        return row;
      }
    }

    return null;
  }

  function openCalendarContextMenuFromEvent(event) {
    if (state.calendarMode !== "personal" || state.viewMode === "År") return false;
    if (!canEditApp()) return false;
    if (!els.calendarWrap) return false;
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
        <div class="min-w-0 text-sm font-semibold leading-tight truncate">${escapeHtml(employee?.name || "")}</div>
      </div>
    `;
  }

  function bindEvents() {
    window.addEventListener("izomax-language-changed", () => {
      refreshCalendarModeControls();
      renderLegend();
      if (state.activeTab === "calendar") {
        renderCalendarPanel();
        renderCalendar();
      }
      window.izomaxApplyLanguage?.();
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
        else updateAccessRequestStatus(requestId, action);
      });
      els.accessApprovalList.addEventListener("change", event => {
        const select = event.target?.closest?.("[data-access-setup-role]");
        if (!select) return;
        const requestId = select.dataset.accessSetupRole || "";
        const panel = requestId ? els.accessApprovalList.querySelector(`[data-access-setup-panel="${CSS.escape(requestId)}"]`) : null;
        const employeeSelect = panel?.querySelector?.(`[data-access-setup-employee="${CSS.escape(requestId)}"]`);
        if (employeeSelect) employeeSelect.disabled = select.value !== "employee";
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
        const nextActive = button.dataset.accessUserNextActive || "";
        if (userId) updateAccessUserActive(userId, nextActive);
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
    if (!hasMainData) {
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

  async function fetchFromSupabase() {
    if (!state.supabaseReady) return;

    try {
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
      state.entries = entriesRes.data || [];
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
      { key: "calendar", title: "Ansattplan", text: "Planlegg bemanning og kapasitet.", action: "personal" },
      { key: "project", title: "Prosjektplan", text: "Planlegg prosjekter og tildel oppdrag.", action: "project" },
      { key: "warning", title: "Uten bemanning", text: "Se prosjekter som mangler bemanning.", action: "unstaffed" },
      { key: "gear", title: "Prosjektadmin", text: "Administrer prosjekter, faser og oppdrag.", action: "projects" },
      { key: "people", title: "Ansattadmin", text: "Legg til og oppdater ansatte og kompetanse.", action: "employees" }
    ];

    const displayName = String(getAccountDisplayName() || state.currentUser || "Planlegger").trim();
    const firstName = displayName && displayName !== "Ikke innlogget" ? displayName.split(/\s+/)[0] : "Planlegger";

    const shortcutHtml = shortcuts.map(card => `
      <button type="button" data-home-action="${card.action}" class="dash27-white-card dash27-shortcut text-left">
        <div class="flex items-start justify-between gap-4"><span class="dash27-iconbox">${actionIcon(card.key)}</span><span class="text-2xl text-slate-500">→</span></div>
        <div class="mt-4 text-[17px] font-extrabold text-slate-950">${escapeHtml(card.title)}</div>
        <div class="mt-2 text-sm leading-6 text-slate-600">${escapeHtml(card.text)}</div>
      </button>
    `).join("");

    const kpiCards = [
      { label: "På prosjekt", value: totalProjectPeople, icon: "people", color: "#2dd4bf", text: `${overallUtilization}% neste 14 dager`, action: "dash-on-project", actionText: "Vis disse" },
      { label: "Tilgjengelige", value: totalAvailable, icon: "check", color: "#86efac", text: "ikke brukt i perioden", action: "dash-available", actionText: "Vis disse" },
      { label: "Borte / fravær", value: totalUnavailable, icon: "bag", color: "#fb923c", text: "ferie, syk, kurs, travel", action: "dash-away", actionText: "Vis disse" },
      { label: "Uten bemanning", value: unstaffedCount, icon: "warning", color: "#fb7185", text: `${unstaffedCount} prosjekter berørt`, action: "unstaffed", actionText: "Se prosjekter" }
    ].map(card => `
      <button type="button" data-home-action="${card.action}" class="dash27-kpi text-left w-full">
        <span class="dash27-kpi-icon" style="color:${card.color}">${actionIcon(card.icon)}</span>
        <div>
          <div class="text-xs uppercase font-black tracking-[.16em]" style="color:${card.color}">${escapeHtml(card.label)}</div>
          <div class="mt-1 text-4xl font-black text-white">${card.value}</div>
          <div class="mt-1 text-sm dash27-muted">${escapeHtml(card.text)}</div>
          <div class="dash27-kpi-action">${escapeHtml(card.actionText)} <span>→</span></div>
        </div>
        <div class="text-right"><div class="text-green-300 font-black">↑</div><div class="text-xs dash27-muted">periode</div></div>
      </button>
    `).join("");

    const weekDays = Array.from({ length: 5 }, (_, i) => addDays(today, i + 1));
    const capacityDays = Array.from({ length: 14 }, (_, i) => addDays(today, i));

    const GROUP_THRESHOLDS = {
      "Offshore arbeider": { critical: 2, low: 4, note: "Lav ≤4 · Kritisk ≤2" },
      "Onshore arbeider": { critical: 2, low: 4, note: "Lav ≤4 · Kritisk ≤2" },
      "Engineering": { critical: 0, low: 1, note: "Lav 1 · Kritisk 0" },
      "3 parts innleie": { critical: 0, low: 2, note: "Lav ≤2 · Kritisk 0" }
    };

    const getThreshold = (group) => GROUP_THRESHOLDS[group.value] || { critical: 1, low: 3, note: "Lav terskel" };
    const heatLevel = (group, metric) => {
      const threshold = getThreshold(group);
      if (!metric.total) return "ok";
      if (metric.available <= threshold.critical) return "critical";
      if (metric.available <= threshold.low) return "low";
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
        ${GROUPS.map(group => `
          <div>
            <div class="text-sm font-bold text-white">${escapeHtml(group.label)}</div>
            <div class="dash27-threshold-note">${escapeHtml(getThreshold(group).note)}</div>
          </div>
          ${weekDays.map(day => {
            const m = dailyGroupMetric(group, day);
            const level = heatLevel(group, m);
            if (level !== "ok") {
              lowSituations += 1;
              if (lowSituationRows.length < 4) {
                lowSituationRows.push({ group: group.label, day, metric: m, level });
              }
            }
            return `<div class="dash27-heatcell ${heatClass(level)}" title="${escapeHtml(group.label)} ${escapeHtml(day.toLocaleDateString("no-NO"))}: ledig ${m.available}, prosjekt ${m.onProject}, borte ${m.unavailable}">${m.available}<span class="block text-[10px] font-medium">${heatLabel(level)}</span></div>`;
          }).join("")}
        `).join("")}
      </div>
    `;

    const capacityOverviewHtml = `
      <div class="dash27-capacity-scroll">
        <div class="dash27-capacity-table">
          <div></div>
          ${capacityDays.map(day => `<div class="dash27-capacity-head">${escapeHtml(day.toLocaleDateString("no-NO", { weekday: "short" }).replace(".", ""))}<br>${escapeHtml(day.toLocaleDateString("no-NO", { day: "numeric", month: "numeric" }))}</div>`).join("")}
          ${GROUPS.map(group => `
            <div class="dash27-capacity-group">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-2.5 w-2.5 rounded-full" style="background:${group.color}"></span>
                <strong>${escapeHtml(group.label)}</strong>
              </div>
              <div class="dash27-threshold-note">${escapeHtml(getThreshold(group).note)}</div>
            </div>
            ${capacityDays.map(day => {
              const metric = dailyGroupMetric(group, day);
              const level = heatLevel(group, metric);
              return `<div class="dash27-capacity-cell ${heatClass(level)}" title="${escapeHtml(group.label)} ${escapeHtml(day.toLocaleDateString("no-NO"))}: ledig ${metric.available}, på prosjekt ${metric.onProject}, borte ${metric.unavailable}">
                <strong>${metric.available}</strong>
                <span>P:${metric.onProject} · B:${metric.unavailable}</span>
              </div>`;
            }).join("")}
          `).join("")}
        </div>
      </div>
    `;

    const lowSituationSummaryHtml = lowSituationRows.length
      ? `<div class="dash27-why-low">${lowSituationRows.map(item => `<div class="dash27-alert-line"><strong>${escapeHtml(item.group)}</strong> · ${escapeHtml(item.day.toLocaleDateString("no-NO", { weekday: "short", day: "numeric", month: "numeric" }))}: ${item.metric.available} ledig · ${item.metric.onProject} på prosjekt · ${item.metric.unavailable} borte</div>`).join("")}</div>`
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
          <div class="dash27-panel p-5 flex items-center gap-4"><span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-300/20 shrink-0">${actionIcon("sun")}</span><div><div class="text-xl font-extrabold">God morgen, ${escapeHtml(firstName)}!</div><div class="mt-2 text-sm dash27-muted">Her er hvem som er opptatt og tilgjengelig de neste 14 dagene.</div><div class="mt-3 text-xs dash27-muted">Oppdatert ${escapeHtml(today.toLocaleDateString("no-NO"))}</div></div></div>
          <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-5 gap-3">${shortcutHtml}</div>
        </div>
        <div class="dash27-panel overflow-hidden"><div class="px-5 pt-4 text-xl font-extrabold">Operativ status – neste 14 dager</div><div class="grid grid-cols-1 lg:grid-cols-4">${kpiCards}</div></div>
        <div class="grid grid-cols-1 2xl:grid-cols-[1.25fr_.75fr] gap-4">
          <div class="dash27-panel p-5"><div class="flex items-center justify-between gap-3 mb-4"><div class="dash27-card-title">Kapasitet dag for dag – neste 14 dager <span class="dash27-info">i</span></div><div class="text-sm dash27-muted">Ledig kapasitet · P = prosjekt · B = borte</div></div>${capacityOverviewHtml}<div class="mt-3 text-xs dash27-muted">Viser antall ledige per gruppe per dag. Farge følger egne terskler per gruppe, slik at Engineering ikke vurderes likt som Offshore/Onshore.</div></div>
          <div class="dash27-panel p-5"><div class="flex items-center justify-between gap-3 mb-4"><div class="dash27-card-title">Lav kapasitet – neste uke <span class="dash27-info">i</span></div><button type="button" data-home-action="project" class="text-cyan-300 text-sm font-bold">Se detaljer →</button></div>${heatmapHtml}<div class="mt-4 pt-4 border-t border-white/10 text-sm"><span class="text-orange-300 font-bold">⚠</span> Totalt ${lowSituations} lav-kapasitetssituasjoner i kommende uke</div>${lowSituationSummaryHtml}</div>
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

  function getProjectInspectorAvailability(employee, project) {
    const periods = getProjectInspectorPeriods(project);
    if (!periods.length) return { label: "Ukjent", tone: "text-slate-500", rank: 3 };

    let conflictPeriods = 0;
    for (const period of periods) {
      const conflicts = (state.derived.entriesByEmployee.get(employee.name) || [])
        .filter(entry => overlaps(entry.start_date, entry.end_date, period.start, period.end))
        .filter(entry => entry.project_id !== project.id);
      if (conflicts.length) conflictPeriods += 1;
    }

    if (conflictPeriods === 0) return { label: "Ledig", tone: "text-green-700", rank: 1 };
    if (conflictPeriods < periods.length) return { label: "Delvis ledig", tone: "text-amber-700", rank: 2 };
    return { label: "Opptatt", tone: "text-red-700", rank: 3 };
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

  async function createProjectInspectorAssignment(projectId) {
    projectPanelDebug("createProjectInspectorAssignment called", {
      projectId,
      selectedCandidateName: state.projectInspectorAddCandidateName,
      selectedRole: state.projectInspectorAddRole,
      useCustomRange: state.projectInspectorAddUseCustomRange,
      customStart: state.projectInspectorAddCustomStart,
      customEnd: state.projectInspectorAddCustomEnd,
      canEdit: canEditApp()
    });
    if (!canEditApp()) {
      projectPanelDebug("create blocked: canEditApp false");
      return;
    }
    const project = getProjectById(projectId);
    if (!project) {
      projectPanelDebug("create blocked: project not found", { projectId });
      return;
    }

    const assigned = state.entries.filter(entry => entry.project_id === project.id).length;
    const required = Math.max(Number(project.headcount_required || 0), 0);
    if (required > 0 && assigned >= required) {
      projectPanelDebug("create blocked: project fully staffed", { assigned, required });
      alert("Prosjektet er allerede fullbemannet.");
      return;
    }

    const employee = getProjectInspectorAddCandidate(project);
    projectPanelDebug("create candidate resolved", {
      candidateName: state.projectInspectorAddCandidateName,
      found: !!employee,
      employeeName: employee?.name || "",
      availability: employee?.availability?.label || ""
    });
    if (!employee) {
      alert(window.izomaxTranslateKey?.("selectEmployeeFirst") || "Velg en ansatt fra listen først.");
      return;
    }
    if (employee.availability?.label === "Opptatt") {
      projectPanelDebug("create blocked: employee busy", { employee: employee.name });
      alert(window.izomaxTranslateKey?.("isBusy") || "Denne personen er opptatt i prosjektperioden.");
      return;
    }

    const range = getProjectInspectorAddRange(project);
    projectPanelDebug("create range resolved", range);
    if (!range.start || !range.end) {
      alert("Velg en gyldig periode.");
      return;
    }
    if (range.start > range.end) {
      alert("Fra-dato kan ikke være senere enn til-dato.");
      return;
    }
    if (range.bounds.start && range.start < range.bounds.start) {
      alert("Fra-dato må være innenfor prosjektperioden.");
      return;
    }
    if (range.bounds.end && range.end > range.bounds.end) {
      alert("Til-dato må være innenfor prosjektperioden.");
      return;
    }

    const role = getProjectInspectorAddRole(employee);
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
    if (conflicts.length) {
      projectPanelDebug("create blocked: conflicts", { conflictCount: conflicts.length, conflicts });
      alert(getEntryConflictSummary(entry, conflicts));
      return;
    }

    projectPanelDebug("create pushing entry", entry);
    state.entries.push(entry);
    state.projectInspectorAddCandidateName = "";
    state.projectInspectorAddRole = "";
    state.projectInspectorAddUseCustomRange = false;
    state.projectInspectorAddCustomStart = "";
    state.projectInspectorAddCustomEnd = "";
    rebuildDerivedState();
    renderAll();

    const result = await saveRow("planner_entries", entry);
    projectPanelDebug("saveRow result", { ok: result?.ok, error: result?.error?.message || result?.error || null });
    if (!result.ok) {
      state.entries = state.entries.filter(item => item.id !== entry.id);
      rebuildDerivedState();
      renderAll();
      return;
    }

    state.calendarMode = "project";
    state.focusProjectId = project.id;
    state.calendarPanelOpen = true;
    renderAll();
    void addAudit(`La til ${employee.name} på ${project.name} fra prosjektpanelet`);
    void addNotification(employee.name, project.name);
  }

  function renderProjectInspectorPanel(project) {
    // v17.8: Assigned rows render visible Endre and remove buttons directly in this panel.
    if (!els.calendarPanelContent || !project) return;

    const assignedEntries = state.entries
      .filter(entry => entry.project_id === project.id)
      .slice()
      .sort((a, b) => a.employee_name.localeCompare(b.employee_name, "no"));
    const assignedNames = new Set(assignedEntries.map(entry => entry.employee_name));
    const assigned = assignedEntries.length;
    const required = Number(project.headcount_required || 0);
    const isFullyStaffed = required > 0 && assigned >= required;
    const needsStaffing = required > 0 && assigned < required;
    const missingStaffCount = Math.max(required - assigned, 0);
    const shouldShowAvailable = !isFullyStaffed || state.projectInspectorShowAvailable === true;
    const staffing = getProjectStaffingLabel(project.id, required);
    const periods = getProjectInspectorPeriods(project);
    const availabilitySummary = getProjectInspectorAvailabilitySummary(project, assignedNames);
    const filteredEmployees = shouldShowAvailable ? getProjectInspectorFilteredEmployees(project, assignedNames) : [];
    const employees = filteredEmployees.slice(0, 10);
    const groupOptions = getProjectInspectorFilterOptions()
      .map(option => `<option value="${escapeHtml(option.id)}" ${state.projectInspectorGroup === option.id ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
      .join("");
    const staffingTone = staffing.variant.includes("green")
      ? "text-green-700"
      : staffing.variant.includes("amber")
        ? "text-amber-700"
        : "text-red-700";
    const addCandidate = getProjectInspectorAddCandidate(project);
    const addCandidateRole = getProjectInspectorAddRole(addCandidate);
    const projectBounds = getProjectInspectorProjectBounds(project);
    const addRange = getProjectInspectorAddRange(project);
    const showAddFromList = needsStaffing && shouldShowAvailable;
    projectPanelDebug("renderProjectInspectorPanel", {
      projectId: project.id,
      projectName: project.name,
      assigned,
      required,
      needsStaffing,
      shouldShowAvailable,
      selectedCandidateName: state.projectInspectorAddCandidateName,
      addCandidateFound: !!addCandidate,
      addCandidateName: addCandidate?.name || "",
      employeesShown: employees.length,
      filteredEmployees: filteredEmployees.length,
      stableAddBoxShouldRender: !!addCandidate
    });
    const selectedAddPanelHtml = addCandidate ? `
      <div id="projectInspectorStableAddBox" data-project-inspector-stable-add-box="1" data-v1816-add-box-visible="1" style="display:block !important;width:100% !important;box-sizing:border-box !important;border:1px solid rgba(132,204,222,0.38) !important;background:rgba(15,23,42,0.92) !important;color:#f8fbfd !important;border-radius:4px !important;padding:12px !important;margin-top:10px !important;visibility:visible !important;opacity:1 !important;">
        <div style="display:flex !important;align-items:flex-start !important;justify-content:space-between !important;gap:10px !important;margin-bottom:10px !important;">
          <div style="min-width:0 !important;">
            <div style="font-size:13px !important;font-weight:900 !important;line-height:1.25 !important;color:#f8fbfd !important;">${window.izomaxTranslateKey?.("addProject") || "Legg til prosjekt"}: ${escapeHtml(addCandidate.name)}</div>
            <div style="margin-top:4px !important;font-size:11px !important;font-weight:600 !important;color:rgba(232,244,248,0.72) !important;">${window.izomaxTranslateKey?.("addProjectDescription") || "Velg rolle og periode, trykk deretter Legg til prosjekt."}</div>
          </div>
          <span style="display:inline-flex !important;align-items:center !important;justify-content:center !important;border:1px solid rgba(132,204,222,0.28) !important;background:rgba(255,255,255,0.06) !important;color:#f8fbfd !important;border-radius:4px !important;padding:5px 8px !important;font-size:11px !important;font-weight:900 !important;">${escapeHtml(addCandidate.availability?.label || "Valgt")}</span>
        </div>
        <button id="projectInspectorAddConfirmTopBtn" data-project-inspector-confirm-add="1" data-project-inspector-confirm-employee="${escapeHtml(addCandidate.name)}" type="button" style="display:flex !important;align-items:center !important;justify-content:center !important;width:100% !important;box-sizing:border-box !important;border:1px solid rgba(34,197,94,0.45) !important;background:#16a34a !important;color:#ffffff !important;border-radius:4px !important;padding:11px 12px !important;margin:0 0 10px 0 !important;font-size:13px !important;font-weight:950 !important;line-height:1.1 !important;cursor:pointer !important;visibility:visible !important;opacity:1 !important;position:relative !important;z-index:20 !important;">${window.izomaxTranslateKey?.("addProject") || "Legg til prosjekt"}</button>
        <div style="display:grid !important;gap:10px !important;">
          <label style="display:grid !important;gap:5px !important;font-size:11px !important;font-weight:800 !important;text-transform:uppercase !important;letter-spacing:.04em !important;color:rgba(232,244,248,0.76) !important;">
            ${window.izomaxTranslateKey?.("role") || "Rolle"}
            <select id="projectInspectorAddRoleSelect" style="width:100% !important;border:1px solid rgba(132,204,222,0.34) !important;background:#ffffff !important;color:#0f172a !important;border-radius:4px !important;padding:9px !important;font-size:12px !important;">${ROLE_OPTIONS.map(role => `<option value="${escapeHtml(role)}" ${role === addCandidateRole ? "selected" : ""}>${escapeHtml(role)}</option>`).join("")}</select>
          </label>
          <div style="display:grid !important;gap:8px !important;border:1px solid rgba(132,204,222,0.22) !important;background:rgba(255,255,255,0.08) !important;border-radius:4px !important;padding:10px !important;">
            <label style="display:flex !important;align-items:flex-start !important;gap:8px !important;color:#f8fbfd !important;font-size:12px !important;">
              <input id="projectInspectorWholePeriodRadio" type="radio" name="projectInspectorPeriodMode" value="whole" ${state.projectInspectorAddUseCustomRange ? "" : "checked"} style="margin-top:2px !important;" />
              <span><span style="display:block !important;font-weight:800 !important;color:#f8fbfd !important;">Hele prosjektperioden</span><span style="display:block !important;margin-top:2px !important;font-size:11px !important;color:rgba(232,244,248,0.72) !important;">${escapeHtml(projectBounds.start ? `${formatDate(projectBounds.start)} – ${formatDate(projectBounds.end)}` : (window.izomaxTranslateKey?.("periodNotSet") || "Periode ikke satt"))}</span></span>
            </label>
            <label style="display:flex !important;align-items:flex-start !important;gap:8px !important;color:#f8fbfd !important;font-size:12px !important;">
              <input id="projectInspectorCustomPeriodRadio" type="radio" name="projectInspectorPeriodMode" value="custom" ${state.projectInspectorAddUseCustomRange ? "checked" : ""} style="margin-top:2px !important;" />
              <span><span style="display:block !important;font-weight:800 !important;color:#f8fbfd !important;">Egendefinert periode</span><span style="display:block !important;margin-top:2px !important;font-size:11px !important;color:rgba(232,244,248,0.72) !important;">${window.izomaxTranslateKey?.("chooseWithinProjectPeriod") || "Velg fra/til innenfor prosjektperioden."}</span></span>
            </label>
            <div style="display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:8px !important;opacity:${state.projectInspectorAddUseCustomRange ? "1" : "0.62"} !important;">
              <label style="display:grid !important;gap:4px !important;font-size:10px !important;font-weight:800 !important;text-transform:uppercase !important;letter-spacing:.04em !important;color:rgba(232,244,248,0.72) !important;">
                Fra
                <input id="projectInspectorCustomStartInput" type="date" value="${escapeHtml(addRange.start || projectBounds.start || "")}" min="${escapeHtml(projectBounds.start || "")}" max="${escapeHtml(projectBounds.end || "")}" ${state.projectInspectorAddUseCustomRange ? "" : "disabled"} style="width:100% !important;border:1px solid rgba(132,204,222,0.34) !important;background:#ffffff !important;color:#0f172a !important;border-radius:4px !important;padding:8px !important;font-size:12px !important;" />
              </label>
              <label style="display:grid !important;gap:4px !important;font-size:10px !important;font-weight:800 !important;text-transform:uppercase !important;letter-spacing:.04em !important;color:rgba(232,244,248,0.72) !important;">
                Til
                <input id="projectInspectorCustomEndInput" type="date" value="${escapeHtml(addRange.end || projectBounds.end || "")}" min="${escapeHtml(projectBounds.start || "")}" max="${escapeHtml(projectBounds.end || "")}" ${state.projectInspectorAddUseCustomRange ? "" : "disabled"} style="width:100% !important;border:1px solid rgba(132,204,222,0.34) !important;background:#ffffff !important;color:#0f172a !important;border-radius:4px !important;padding:8px !important;font-size:12px !important;" />
              </label>
            </div>
          </div>
          ${addCandidate.availability?.label === "Delvis ledig" ? `<div style="border:1px solid rgba(245,158,11,0.35) !important;background:rgba(245,158,11,0.12) !important;color:#fde68a !important;border-radius:4px !important;padding:8px !important;font-size:11px !important;line-height:1.35 !important;">${window.izomaxTranslateKey?.("partlyAvailableHelp") || "Denne personen er delvis tilgjengelig. Velg riktig delperiode før du legger til."}</div>` : ""}
        </div>
        <div style="display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:8px !important;margin-top:12px !important;">
          <button id="projectInspectorAddCancelBtn" type="button" style="border:1px solid rgba(132,204,222,0.28) !important;background:rgba(255,255,255,0.06) !important;color:#f8fbfd !important;border-radius:4px !important;padding:9px 10px !important;font-size:12px !important;font-weight:800 !important;cursor:pointer !important;">Avbryt</button>
          <button id="projectInspectorAddConfirmBtn" data-project-inspector-confirm-add="1" data-project-inspector-confirm-employee="${escapeHtml(addCandidate.name)}" type="button" style="border:1px solid rgba(34,197,94,0.38) !important;background:rgba(22,163,74,0.92) !important;color:#ffffff !important;border-radius:4px !important;padding:10px 10px !important;font-size:12px !important;font-weight:900 !important;cursor:pointer !important;">${window.izomaxTranslateKey?.("addProject") || "Legg til prosjekt"}</button>
        </div>
      </div>
    ` : "";

    const assignedHtml = `
      <section>
        <div class="mb-2 flex items-center justify-between gap-2">
          <h3 class="font-semibold text-slate-900">${window.izomaxTranslateKey?.("assigned") || "Tildelte"} (${assigned}${required ? `/${required}` : ""})</h3>
          ${isFullyStaffed ? `<button id="projectInspectorChangeCrewHeaderBtn" type="button" class="border border-cyan-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50">${shouldShowAvailable ? (window.izomaxTranslateKey?.("hideAnalysis") || "Skjul analyse") : (window.izomaxTranslateKey?.("changeCrew") || "Endre crew")}</button>` : ""}
        </div>
        <div class="space-y-2">
          ${assignedEntries.length ? assignedEntries.slice(0, 10).map(entry => `
            <div
              class="project-assigned-row"
              data-project-assigned-row="${escapeHtml(entry.id)}"
              style="display:flex !important;align-items:center !important;justify-content:space-between !important;gap:10px !important;width:100% !important;min-height:56px !important;box-sizing:border-box !important;border:1px solid rgba(148, 187, 199, 0.26) !important;background:rgba(255,255,255,0.10) !important;padding:10px 12px !important;border-radius:4px !important;overflow:visible !important;"
            >
              <div style="min-width:0 !important;flex:1 1 auto !important;overflow:hidden !important;">
                <div style="font-size:12px !important;font-weight:700 !important;line-height:1.25 !important;color:#f8fbfd !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;">${escapeHtml(entry.employee_name)}</div>
                <div style="margin-top:4px !important;font-size:11px !important;line-height:1.25 !important;color:rgba(232,244,248,0.78) !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;">${escapeHtml(entry.role || (window.izomaxTranslateKey?.("roleNotSet") || "Rolle ikke satt"))}</div>
              </div>
              <div style="display:flex !important;align-items:center !important;justify-content:flex-end !important;gap:6px !important;flex:0 0 auto !important;visibility:visible !important;opacity:1 !important;">
                <button
                  data-project-entry-edit-id="${escapeHtml(entry.id)}"
                  type="button"
                  class="project-assigned-edit-pencil-btn"
                  style="display:inline-flex !important;align-items:center !important;justify-content:center !important;width:30px !important;height:30px !important;border:1px solid rgba(132,204,222,0.32) !important;background:rgba(255,255,255,0.06) !important;color:rgba(248,251,253,0.82) !important;border-radius:4px !important;font-size:14px !important;font-weight:700 !important;line-height:1 !important;cursor:pointer !important;visibility:visible !important;opacity:1 !important;position:relative !important;z-index:5 !important;"
                  title="${window.izomaxTranslateKey?.("editAssignment") || "Endre tildeling"}"
                  aria-label="${window.izomaxTranslateKey?.("editAssignment") || "Endre tildeling"}"
                >✎</button>
              </div>
            </div>
          `).join("") : `<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">${window.izomaxTranslateKey?.("noAssignedResources") || "Ingen tildelte ressurser."}</div>`}
          ${needsStaffing ? `
            <button
              id="projectInspectorAddStaffBtn"
              type="button"
              class="project-add-staff-slot"
              style="display:flex !important;align-items:center !important;justify-content:center !important;gap:8px !important;width:100% !important;min-height:48px !important;box-sizing:border-box !important;border:1px dashed rgba(132,204,222,0.62) !important;background:rgba(255,255,255,0.08) !important;color:#f8fbfd !important;border-radius:4px !important;font-size:13px !important;font-weight:700 !important;cursor:pointer !important;visibility:visible !important;opacity:1 !important;"
              title="${window.izomaxTranslateKey?.("addEmployee") || "Legg til ansatt"}"
            >
              <span style="font-size:18px !important;line-height:1 !important;">+</span>
              <span>${window.izomaxTranslateKey?.("addEmployee") || "Legg til ansatt"}</span>
              <span style="font-size:11px !important;font-weight:600 !important;color:rgba(232,244,248,0.72) !important;">${window.izomaxTranslateKey?.("selectFromAvailable") || "Velg fra tilgjengelige personer under"} · ${missingStaffCount} ${window.izomaxTranslateKey?.("missing") || "mangler"}</span>
            </button>
          ` : ""}
        </div>
      </section>
    `;

    const availableHtml = shouldShowAvailable ? `<!-- v18.16-add-box-moved-up --><!-- v18.12-dark-available-cards -->
      <section>
        <div class="mb-2 grid grid-cols-3 gap-1 text-[11px]">
          <div class="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-center font-semibold text-green-700"><div>${window.izomaxTranslateKey?.("available") || "Ledig"}</div><div class="text-sm">${availabilitySummary.available}</div></div>
          <div class="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-center font-semibold text-amber-700"><div>${window.izomaxTranslateKey?.("partly") || "Delvis"}</div><div class="text-sm">${availabilitySummary.partial}</div></div>
          <div class="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-center font-semibold text-red-700"><div>${window.izomaxTranslateKey?.("busy") || "Opptatt"}</div><div class="text-sm">${availabilitySummary.busy}</div></div>
        </div>
        <div class="mb-2 grid grid-cols-[1fr_auto] gap-2">
          <input id="projectInspectorSearchInput" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs" placeholder="${window.izomaxTranslateKey?.("searchNameGroupTitleStatus") || "Søk navn, gruppe, tittel eller status"}" value="${escapeHtml(state.projectInspectorSearch || "")}" />
          <select id="projectInspectorGroupFilter" class="rounded-xl border border-slate-300 px-2 py-2 text-xs">${groupOptions}</select>
        </div>
        <div style="display:grid !important;gap:8px !important;background:transparent !important;border:0 !important;overflow:visible !important;">
          <div style="display:grid !important;grid-template-columns:1fr auto !important;align-items:center !important;padding:0 2px 2px 2px !important;font-size:11px !important;font-weight:800 !important;text-transform:uppercase !important;letter-spacing:.04em !important;color:rgba(232,244,248,0.78) !important;">
            <span>${window.izomaxTranslateKey?.("availableOthers") || "Tilgjengelige / øvrige"}</span><span>${window.izomaxTranslateKey?.("status") || "Status"}</span>
          </div>
          ${employees.length ? employees.map(employee => {
            const isSelected = addCandidate && addCandidate.name === employee.name;
            const canAssign = employee.availability.label !== "Opptatt";
            const expandedHtml = "";
            return `
              <div
                class="project-available-person-row-v1811"
                data-project-available-person-row="${escapeHtml(employee.name)}"
                data-project-inspector-row-role="${escapeHtml(getDefaultRoleForIndex(0))}"
                style="display:block !important;width:100% !important;box-sizing:border-box !important;border:1px solid rgba(148,187,199,0.26) !important;background:${isSelected ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.10)'} !important;color:#f8fbfd !important;border-radius:4px !important;visibility:visible !important;opacity:1 !important;overflow:hidden !important;cursor:pointer !important;"
              >
                <div style="display:flex !important;align-items:center !important;justify-content:space-between !important;gap:10px !important;width:100% !important;box-sizing:border-box !important;padding:10px 12px !important;color:#f8fbfd !important;visibility:visible !important;opacity:1 !important;">
                  <div style="display:flex !important;align-items:center !important;gap:9px !important;min-width:0 !important;flex:1 1 auto !important;color:#f8fbfd !important;visibility:visible !important;opacity:1 !important;">
                    ${getEmployeeGroupIconHtml(employee.normalizedGroup, "inline-flex h-5 w-5 items-center justify-center text-cyan-100 shrink-0 opacity-80") || `<span style="display:inline-flex !important;width:20px !important;height:20px !important;align-items:center !important;justify-content:center !important;color:rgba(232,244,248,0.62) !important;flex:0 0 auto !important;">•</span>`}
                    <div style="display:block !important;min-width:0 !important;flex:1 1 auto !important;color:#f8fbfd !important;visibility:visible !important;opacity:1 !important;">
                      <div class="project-available-person-name v1811-visible-name v1812-dark-card-name" style="display:block !important;font-size:13px !important;font-weight:800 !important;line-height:1.2 !important;color:#f8fbfd !important;background:transparent !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;visibility:visible !important;opacity:1 !important;position:relative !important;z-index:2 !important;">${escapeHtml(employee.name)}</div>
                      <div class="project-available-person-title v1811-visible-title v1812-dark-card-title" style="display:block !important;margin-top:3px !important;font-size:11px !important;font-weight:600 !important;line-height:1.2 !important;color:rgba(232,244,248,0.78) !important;background:transparent !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;visibility:visible !important;opacity:1 !important;position:relative !important;z-index:2 !important;">${escapeHtml(employee.title || "Tittel ikke satt")}</div>
                    </div>
                  </div>
                  <div style="display:flex !important;align-items:center !important;justify-content:flex-end !important;gap:8px !important;flex:0 0 auto !important;color:#f8fbfd !important;visibility:visible !important;opacity:1 !important;">
                    <span style="display:inline-flex !important;align-items:center !important;justify-content:center !important;min-width:58px !important;font-size:12px !important;font-weight:850 !important;line-height:1.1 !important;color:${employee.availability.label === 'Ledig' ? '#15803d' : employee.availability.label === 'Delvis ledig' ? '#b45309' : '#b91c1c'} !important;visibility:visible !important;opacity:1 !important;">${escapeHtml(window.izomaxTranslateValue?.(employee.availability.label) || employee.availability.label)}</span>
                    ${canAssign ? `<button
                  data-project-inspector-select-employee="${escapeHtml(employee.name)}"
                  data-project-inspector-select-role="${escapeHtml(getDefaultRoleForIndex(0))}"
                  type="button"
                  style="display:inline-flex !important;align-items:center !important;justify-content:center !important;min-width:34px !important;width:34px !important;height:32px !important;padding:0 !important;border-radius:8px !important;border:1px solid ${isSelected ? '#16a34a' : '#cbd5e1'} !important;background:${isSelected ? '#dcfce7' : '#ffffff'} !important;color:${isSelected ? '#166534' : '#0f172a'} !important;font-size:12px !important;font-weight:700 !important;line-height:1 !important;white-space:nowrap !important;overflow:visible !important;opacity:1 !important;"
                  aria-label="${(isSelected ? (window.izomaxTranslateKey?.('selected') || 'Selected') : (window.izomaxTranslateKey?.('add') || 'Add'))} ${escapeHtml(employee.name)}"
                >${isSelected ? "✓" : "+"}</button>` : `<span style="display:inline-flex !important;align-items:center !important;justify-content:center !important;border:1px solid #e2e8f0 !important;background:#f8fafc !important;color:#64748b !important;border-radius:4px !important;padding:6px 9px !important;font-size:11px !important;font-weight:900 !important;visibility:visible !important;opacity:1 !important;">${window.izomaxTranslateKey?.("busy") || "Opptatt"}</span>`}
                  </div>
                </div>
                <button
                  data-project-inspector-select-employee="${escapeHtml(employee.name)}"
                  data-project-inspector-select-role="${escapeHtml(getDefaultRoleForIndex(0))}"
                  type="button"
                  style="display:flex !important;align-items:center !important;justify-content:center !important;width:calc(100% - 24px) !important;min-height:34px !important;margin:0 12px 10px 12px !important;padding:0 12px !important;border-radius:8px !important;border:1px solid ${isSelected ? '#16a34a' : 'rgba(132,204,222,0.42)'} !important;background:${isSelected ? 'rgba(22,163,74,0.18)' : 'rgba(255,255,255,0.10)'} !important;color:#f8fbfd !important;font-size:12px !important;font-weight:900 !important;letter-spacing:.01em !important;white-space:nowrap !important;overflow:visible !important;visibility:visible !important;opacity:1 !important;cursor:pointer !important;"
                  aria-label="${(isSelected ? (window.izomaxTranslateKey?.('selected') || 'Selected') : (window.izomaxTranslateKey?.('add') || 'Add'))} ${escapeHtml(employee.name)}"
                >${isSelected ? (window.izomaxTranslateKey?.("selected") || "Selected") : (window.izomaxTranslateKey?.("add") || "Add")}</button>
                ${expandedHtml}
              </div>
            `;
          }).join("") : `<div class="px-3 py-4 text-xs text-slate-500">${window.izomaxTranslateKey?.("noAvailableHits") || "Ingen treff i tilgjengelig-listen."}</div>`}
        </div>
        ${filteredEmployees.length > employees.length ? `<div class="mt-2 text-[11px] text-slate-500">Viser ${employees.length} av ${filteredEmployees.length}. ${window.izomaxTranslateKey?.("showingNarrow") || "Bruk søk eller gruppefilter for å snevre inn."}</div>` : ""}
      </section>
    ` : "";

    const fullStaffedCrewActionHtml = isFullyStaffed ? `
      <section>
        <button id="projectInspectorChangeCrewBtn" type="button" class="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          ${shouldShowAvailable ? (window.izomaxTranslateKey?.("hideAvailableOthers") || "Skjul tilgjengelige / øvrige") : (window.izomaxTranslateKey?.("changeCrew") || "Endre crew")}
        </button>
        ${!shouldShowAvailable ? `<div class="mt-2 text-xs text-slate-500">${window.izomaxTranslateKey?.("fullyStaffedHelp") || "Prosjektet er fullt bemannet. Tilgjengelighetsanalyse vises først når du skal endre crew."}</div>` : ""}
      </section>
    ` : "";

    els.calendarPanelContent.innerHTML = `
      <!-- v18.18-period-fallback-confirm-safe v18.17-confirm-button-visible-top v18.16-add-box-visible-under-assigned -->
      <div class="flex h-full flex-col">
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-slate-950">${window.izomaxTranslateKey?.("projectDetails") || "Prosjektdetaljer"}</h2>
            <div class="mt-1 truncate text-sm font-medium text-slate-800">${escapeHtml(project.name)}</div>
            <div class="mt-1 text-xs font-medium ${staffingTone}">${escapeHtml(staffing.text)}${required ? ` (${assigned}/${required})` : ""}</div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button data-calendar-panel-edit-project="${escapeHtml(project.id)}" type="button" class="rounded-xl border border-slate-300 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800">${window.izomaxTranslateKey?.("editProject") || "Rediger prosjekt"}</button>
            <button id="calendarProjectPanelCloseBtn" type="button" class="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">×</button>
          </div>
        </div>

        <div class="min-h-0 flex-1 space-y-4 overflow-auto p-4 text-sm">
          <div style="display:block !important;margin:0 0 14px 0 !important;width:100% !important;">
            <button
              id="projectInspectorEditProjectVisibleBtn"
              data-calendar-panel-edit-project="${escapeHtml(project.id)}"
              type="button"
              style="display:flex !important;align-items:center !important;justify-content:space-between !important;gap:12px !important;width:100% !important;min-height:58px !important;box-sizing:border-box !important;border:1px solid rgba(80,240,199,0.58) !important;background:linear-gradient(180deg, rgba(80,240,199,0.20) 0%, rgba(80,240,199,0.12) 100%) !important;color:#f8fbfd !important;border-radius:6px !important;padding:12px 14px !important;font-size:13px !important;font-weight:900 !important;line-height:1.15 !important;cursor:pointer !important;visibility:visible !important;opacity:1 !important;position:relative !important;z-index:30 !important;text-align:left !important;box-shadow:0 0 0 1px rgba(80,240,199,0.10) inset !important;"
            >
              <span style="display:flex !important;align-items:center !important;gap:12px !important;min-width:0 !important;">
                <span style="display:inline-flex !important;align-items:center !important;justify-content:center !important;width:32px !important;height:32px !important;border-radius:6px !important;background:rgba(255,255,255,0.12) !important;border:1px solid rgba(255,255,255,0.16) !important;font-size:16px !important;font-weight:900 !important;color:#50f0c7 !important;flex:0 0 auto !important;">✎</span>
                <span style="display:block !important;min-width:0 !important;">
                  <span style="display:block !important;font-size:14px !important;font-weight:900 !important;color:#f8fbfd !important;">${window.izomaxTranslateKey?.("editProject") || "Rediger prosjekt"}</span>
                  <span style="display:block !important;margin-top:4px !important;font-size:11px !important;font-weight:650 !important;color:rgba(232,244,248,0.76) !important;">${window.izomaxTranslateKey?.("fieldPeriodWorkshopResources") || "Feltperiode · workshop · ressursbehov"}</span>
                </span>
              </span>
              <span style="display:inline-flex !important;align-items:center !important;justify-content:center !important;color:#50f0c7 !important;font-size:16px !important;font-weight:900 !important;flex:0 0 auto !important;">→</span>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wide text-slate-500">${window.izomaxTranslateKey?.("category") || "Kategori"}</div>
              <div class="mt-1 font-semibold text-slate-900">${escapeHtml(window.izomaxTranslateValue?.(project.category || "Ikke satt") || project.category || "Ikke satt")}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wide text-slate-500">${window.izomaxTranslateKey?.("staffingNeed") || "Bemanningsbehov"}</div>
              <div class="mt-1 font-semibold text-slate-900">${required || 0} ${window.izomaxTranslateKey?.("people") || "personer"}</div>
            </div>
          </div>

          <section>
            <div class="mb-2 flex items-center justify-between gap-2">
              <h3 class="font-semibold text-slate-900">${window.izomaxTranslateKey?.("periods") || "Perioder"}</h3>
              <button data-calendar-panel-edit-project="${escapeHtml(project.id)}" type="button" class="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">${window.izomaxTranslateKey?.("editPeriods") || "Rediger perioder"}</button>
            </div>
            <div class="space-y-2">
              ${periods.length ? periods.map((period, index) => `
                <div class="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <span class="font-medium text-slate-700">${window.izomaxTranslateKey?.("period") || "Periode"} ${index + 1}</span>
                  <span class="text-xs text-slate-500">${escapeHtml(formatDate(period.start))} – ${escapeHtml(formatDate(period.end))}</span>
                </div>
              `).join("") : `<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">${window.izomaxTranslateKey?.("noPeriodSet") || "Ingen periode satt."}</div>`}
            </div>
          </section>

          <section>
            <div class="mb-2 flex items-center justify-between gap-2">
              <h3 class="font-semibold text-slate-900">${window.izomaxTranslateKey?.("staffing") || "Bemanning"}</h3>
              <button data-calendar-panel-staff-project="${escapeHtml(project.id)}" type="button" class="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">${window.izomaxTranslateKey?.("staffProject") || "Bemann prosjekt"}</button>
            </div>
          </section>

          ${assignedHtml}
          ${selectedAddPanelHtml}
          ${fullStaffedCrewActionHtml}
          ${availableHtml}
        </div>

        <div class="grid grid-cols-2 gap-2 border-t border-slate-200 p-4">
          <button data-calendar-panel-edit-project="${escapeHtml(project.id)}" type="button" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">${window.izomaxTranslateKey?.("editProject") || "Rediger prosjekt"}</button>
          <button data-calendar-panel-staff-project="${escapeHtml(project.id)}" type="button" class="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">${window.izomaxTranslateKey?.("staff") || "Bemann"}</button>
        </div>
      </div>
    `;

    projectPanelDebug("after innerHTML", {
      stableAddBoxExists: !!document.getElementById("projectInspectorStableAddBox"),
      confirmButtonExists: !!document.getElementById("projectInspectorAddConfirmBtn"),
      selectButtons: els.calendarPanelContent.querySelectorAll("[data-project-inspector-select-employee]").length,
      availableRows: els.calendarPanelContent.querySelectorAll("[data-project-available-person-row]").length
    });

    const rerenderPanel = (focusSearch = false) => {
      projectPanelDebug("rerenderPanel called", { focusSearch });
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

    const closeBtn = document.getElementById("calendarProjectPanelCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", () => {
      state.calendarPanelOpen = false;
      state.focusProjectId = "";
      resetProjectInspectorFilters();
      renderCalendarPanel();
      renderCalendar();
    });

    const wireChangeCrewButton = (button) => {
      if (!button) return;
      button.addEventListener("click", () => {
        state.projectInspectorShowAvailable = !state.projectInspectorShowAvailable;
        rerenderPanel(false);
      });
    };
    wireChangeCrewButton(document.getElementById("projectInspectorChangeCrewBtn"));
    wireChangeCrewButton(document.getElementById("projectInspectorChangeCrewHeaderBtn"));

    const addStaffBtn = document.getElementById("projectInspectorAddStaffBtn");
    if (addStaffBtn) {
      addStaffBtn.addEventListener("click", () => {
        projectPanelDebug("add staff slot clicked");
        state.projectInspectorShowAvailable = true;
        state.projectInspectorAddCandidateName = "";
        state.projectInspectorAddRole = "";
        state.projectInspectorAddUseCustomRange = false;
        const bounds = getProjectInspectorProjectBounds(project);
        state.projectInspectorAddCustomStart = bounds.start || "";
        state.projectInspectorAddCustomEnd = bounds.end || "";
        rerenderPanel(false);
      });
    }

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

    const visibleEditBtn = document.getElementById("projectInspectorEditProjectVisibleBtn");
    if (visibleEditBtn) {
      visibleEditBtn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openProjectModal(visibleEditBtn.dataset.calendarPanelEditProject);
      });
    }
    els.calendarPanelContent.querySelectorAll("[data-calendar-panel-edit-project]").forEach(btn => {
      if (btn.dataset.boundProjectEdit === "true") return;
      btn.dataset.boundProjectEdit = "true";
      btn.addEventListener("click", () => openProjectModal(btn.dataset.calendarPanelEditProject));
    });
    els.calendarPanelContent.querySelectorAll("[data-calendar-panel-staff-project]").forEach(btn => {
      btn.addEventListener("click", () => startProjectStaffing(btn.dataset.calendarPanelStaffProject));
    });
    const selectProjectInspectorCandidate = (employeeName, suggestedRole = "", options = {}) => {
      projectPanelDebug("selectProjectInspectorCandidate called", {
        employeeName,
        suggestedRole,
        options,
        previousCandidate: state.projectInspectorAddCandidateName
      });
      if (!employeeName) {
        projectPanelDebug("select blocked: empty employeeName");
        return;
      }
      if (options.toggle && state.projectInspectorAddCandidateName === employeeName) {
        projectPanelDebug("select toggled off", { employeeName });
        state.projectInspectorAddCandidateName = "";
        state.projectInspectorAddRole = "";
        state.projectInspectorAddUseCustomRange = false;
        rerenderPanel(false);
        return;
      }
      primeProjectInspectorCandidate(project, employeeName, suggestedRole || getDefaultRoleForIndex(0));
      projectPanelDebug("candidate primed", {
        selectedCandidateName: state.projectInspectorAddCandidateName,
        selectedRole: state.projectInspectorAddRole,
        customStart: state.projectInspectorAddCustomStart,
        customEnd: state.projectInspectorAddCustomEnd
      });
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
        projectPanelDebug("available row clicked", {
          employeeName: row.dataset.projectAvailablePersonRow || "",
          ignoredTarget: !!event.target?.closest?.("button, input, select, textarea, label")
        });
        if (event.target?.closest?.("button, input, select, textarea, label")) return;
        selectProjectInspectorCandidate(row.dataset.projectAvailablePersonRow || "", row.dataset.projectInspectorRowRole || getDefaultRoleForIndex(0), { toggle: true });
      });
    });

    els.calendarPanelContent.querySelectorAll("[data-project-inspector-select-employee]").forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        projectPanelDebug("select button clicked", {
          employeeName: btn.dataset.projectInspectorSelectEmployee || "",
          role: btn.dataset.projectInspectorSelectRole || ""
        });
        selectProjectInspectorCandidate(btn.dataset.projectInspectorSelectEmployee || "", btn.dataset.projectInspectorSelectRole || getDefaultRoleForIndex(0), { toggle: true });
      });
    });

    document.getElementById("projectInspectorAddCancelBtn")?.addEventListener("click", event => {
      event.preventDefault();
      state.projectInspectorAddCandidateName = "";
      state.projectInspectorAddRole = "";
      state.projectInspectorAddUseCustomRange = false;
      rerenderPanel(false);
    });
    document.getElementById("projectInspectorAddRoleSelect")?.addEventListener("change", event => {
      state.projectInspectorAddRole = event.target.value || "";
      projectPanelDebug("role changed", { role: state.projectInspectorAddRole });
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
    const confirmButtons = Array.from(els.calendarPanelContent.querySelectorAll("[data-project-inspector-confirm-add]"));
    projectPanelDebug("wire confirm buttons", { count: confirmButtons.length });
    confirmButtons.forEach(confirmBtn => {
      confirmBtn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        projectPanelDebug("confirm button clicked", {
          stateCandidateBefore: state.projectInspectorAddCandidateName,
          buttonEmployee: event.currentTarget?.dataset?.projectInspectorConfirmEmployee || ""
        });
        const btn = event.currentTarget;
        const employeeName = btn?.dataset?.projectInspectorConfirmEmployee || state.projectInspectorAddCandidateName || "";
        if (employeeName && state.projectInspectorAddCandidateName !== employeeName) {
          primeProjectInspectorCandidate(project, employeeName, state.projectInspectorAddRole || getDefaultRoleForIndex(0));
        }
        const roleSelect = document.getElementById("projectInspectorAddRoleSelect");
        if (roleSelect) state.projectInspectorAddRole = roleSelect.value || state.projectInspectorAddRole || getDefaultRoleForIndex(0);
        const wholePeriodRadio = document.getElementById("projectInspectorWholePeriodRadio");
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
          if (wholePeriodRadio) wholePeriodRadio.checked = true;
        }
        projectPanelDebug("before createProjectInspectorAssignment", {
          candidate: state.projectInspectorAddCandidateName,
          role: state.projectInspectorAddRole,
          useCustomRange: state.projectInspectorAddUseCustomRange,
          customStart: state.projectInspectorAddCustomStart,
          customEnd: state.projectInspectorAddCustomEnd
        });
        void createProjectInspectorAssignment(project.id);
      });
    });
    els.calendarPanelContent.querySelectorAll("[data-project-entry-edit-id]").forEach(btn => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.projectEntryEditId));
    });
    els.calendarPanelContent.querySelectorAll("[data-project-entry-delete-id]").forEach(btn => {
      btn.addEventListener("click", () => deleteEntryFromProjectCard(btn.dataset.projectEntryDeleteId));
    });
  }

  function renderCalendarPanel() {
    if (!els.calendarPanelCol || !els.calendarPanelHandleBtn || !els.calendarPanelContent) return;

    if (state.calendarMode === "project") {
      const project = state.calendarPanelOpen ? getProjectById(state.focusProjectId || "") : null;
      if (!project) {
        els.calendarPanelCol.className = "hidden";
        els.calendarPanelContent.className = "hidden min-w-0 flex-1";
        return;
      }
      els.calendarPanelCol.className = "iz-project-inspector-shell w-full shrink-0 bg-white border border-slate-200 shadow-sm overflow-hidden transition-all duration-300";
      els.calendarPanelHandleBtn.className = "iz-project-panel-tab w-10 shrink-0 border-r border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold tracking-wide [writing-mode:vertical-rl] rotate-180";
      els.calendarPanelHandleBtn.textContent = "Panel";
      els.calendarPanelContent.className = "min-w-0 flex-1";
      renderProjectInspectorPanel(project);
      return;
    }

    // v18.31e: Ansattplan skal ikke arve prosjektpanelet.
    // Høyrepanelet skjules helt utenfor Prosjektplan for å unngå tom mørk boks/regresjon.
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

    state.entries = state.entries.filter(item => item.id !== entryId);
    rebuildDerivedState();
    renderAll();

    const result = await deleteRow("planner_entries", entryId);
    if (!result.ok) {
      state.entries.push(entry);
      rebuildDerivedState();
      renderAll();
      return;
    }

    void addAudit(`Slettet tildeling fra prosjektkort: ${entry.employee_name} → ${displayProjectName(project) || "Ukjent prosjekt"}`);
  }

  function renderEmployees() {
    const sortedEmployees = state.employees.slice().sort((a, b) => {
      const groupDiff = getEmployeeGroupSortIndex(a.employee_group) - getEmployeeGroupSortIndex(b.employee_group);
      if (groupDiff !== 0) return groupDiff;
      return (a.name || "").localeCompare(b.name || "", "no");
    });

    els.employeeList.innerHTML = sortedEmployees.map(emp => {
      const employeeGroup = normalizeEmployeeGroup(emp.employee_group || "");
      const cardClass = getEmployeeGroupCardClass(employeeGroup);
      return `
      <button data-employee-id="${escapeHtml(emp.id)}" class="w-full text-left rounded-xl border-2 p-3 transition ${cardClass}">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            ${getEmployeeGroupIconHtml(employeeGroup, "inline-flex h-5 w-5 items-center justify-center text-slate-600 shrink-0")}
            <div class="font-medium truncate">${escapeHtml(emp.name)}</div>
          </div>
          <span class="text-xs ${emp.active ? "text-green-700" : "text-amber-700"}">${emp.active ? "Aktiv" : "Inaktiv"}</span>
        </div>
        <div class="text-xs text-slate-500 mt-1">${escapeHtml(emp.email || "Ingen e-post")}</div>
        <div class="text-xs text-slate-500">${escapeHtml(emp.phone || "Ingen telefon")}</div>
        <div class="text-xs text-slate-500">${escapeHtml(emp.title || "Ingen stillingstittel")}</div>
        <div class="mt-2 inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-white/80 px-2 py-1 text-xs font-medium text-slate-700">${getEmployeeGroupIconHtml(employeeGroup, "inline-flex h-4 w-4 items-center justify-center text-slate-600 shrink-0")}<span>${escapeHtml(getEmployeeGroupLabel(employeeGroup) || "Ingen gruppe valgt")}</span></div>
      </button>
    `}).join("") || `<div class="text-sm text-slate-500">Ingen ansatte enda.</div>`;

    els.employeeList.querySelectorAll("[data-employee-id]").forEach(btn => {
      btn.addEventListener("click", () => openEmployeeModal(btn.dataset.employeeId));
    });
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

    const stickyWidth = 238;
    const colWidth = Math.max(28, state.viewMode === "Uke" ? 38 : 32);
    const totalWidth = colWidth * days.length;

    let html = dashboardFilterBanner;
    html += `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px; min-width:${stickyWidth + totalWidth}px;">`;
    html += `<div class="day-grid border border-slate-200 rounded-2xl overflow-visible" style="grid-template-columns:${stickyWidth}px repeat(${days.length}, ${colWidth}px);">`;
    html += renderTimelineHeaderRows(days, "Ansatt");

    const warnings = [];

    for (const group of employeeGroups) {
      const collapsed = isEmployeeGroupCollapsed(group.key);
      html += `
        <div class="sticky-col border-r border-b border-slate-200 bg-slate-50 px-3 py-2">
          <button type="button" data-employee-group-toggle="${escapeHtml(group.key)}" class="w-full flex items-center justify-between gap-3 text-left text-slate-800">
            <span class="min-w-0 flex items-center gap-2">
              <span class="text-xs text-slate-500">${collapsed ? "▶" : "▼"}</span>
              ${group.iconHtml}
              <span class="font-semibold text-sm truncate">${escapeHtml(group.label)}</span>
              <span class="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">${group.employees.length}</span>
            </span>
          </button>
        </div>
        <div class="border-b border-slate-200 bg-slate-50/70" style="grid-column: span ${days.length}; width:${totalWidth}px; min-height:36px;"></div>
      `;

      if (collapsed) continue;

      for (const employee of group.employees) {
        const employeeEntries = getVisibleEntriesForEmployee(employee.name, range.start, range.end);

        html += `
          <div class="sticky-col border-r border-b border-slate-200 px-3 py-2 ${getEmployeeCalendarCellClass(employee)}">
            <div>${getEmployeeNameTabHtml(employee)}</div>
            ${employee.title ? `<div class="text-[11px] opacity-80 leading-tight mt-1">${escapeHtml(employee.title)}</div>` : ""}
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
        <div class="sticky-col border-r border-b border-slate-200 bg-slate-50 px-3 py-2">
          <button type="button" data-employee-group-toggle="${escapeHtml(group.key)}" class="w-full flex items-center justify-between gap-3 text-left text-slate-800">
            <span class="min-w-0 flex items-center gap-2">
              <span class="text-xs text-slate-500">${collapsed ? "▶" : "▼"}</span>
              ${group.iconHtml}
              <span class="font-semibold text-sm truncate">${escapeHtml(group.label)}</span>
              <span class="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">${group.employees.length}</span>
            </span>
          </button>
        </div>
        <div class="border-b border-slate-200 bg-slate-50/70" style="grid-column: span 12; width:${totalWidth}px; min-height:36px;"></div>
      `;

      if (collapsed) continue;

      for (const employee of group.employees) {
        const employeeEntries = getVisibleEntriesForEmployee(employee.name, yearStart, yearEnd);

        html += `
          <div class="sticky-col border-r border-b border-slate-200 px-3 py-2 ${getEmployeeCalendarCellClass(employee)}">
            <div>${getEmployeeNameTabHtml(employee)}</div>
            ${employee.title ? `<div class="text-[11px] text-slate-600 leading-tight mt-1">${escapeHtml(employee.title)}</div>` : ""}
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

    let html = `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px; min-width:${stickyWidth + totalWidth}px;">`;
    html += `<div class="day-grid border border-slate-200 rounded-2xl overflow-visible" style="grid-template-columns:${stickyWidth}px repeat(${days.length}, ${colWidth}px);">`;
    html += renderTimelineHeaderRows(days, window.izomaxTranslateKey?.("projectHeader") || "Prosjekt");

    for (const project of projects) {
      const assigned = getProjectAssignedCount(project.id);
      const required = Number(project.headcount_required || 0);
      const staffing = getProjectStaffingLabel(project.id, required);
      const projectPeriods = filterProjectPeriodsByPhase(project, getProjectTimelinePeriodsWithWorkshop(project));

      html += `
        <button type="button" data-project-list-row-id="${escapeHtml(project.id)}" class="sticky-col project-plan-name-cell border-r border-b border-slate-200 px-3 py-1.5 text-left ${project.id === state.focusProjectId ? "bg-blue-50 ring-2 ring-blue-200" : isClosedProject(project) ? "bg-slate-100" : "bg-white"}">
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
            class="entry-bar ${periodClasses} ${(period.phase === "workshop" || (period.phase !== "workshop" && !project.has_multiple_periods)) ? "cursor-move" : ""} ${project.id === state.focusProjectId ? 'ring-2 ring-blue-300 ring-offset-1' : ''}"
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
        <div class="sticky-col border-r border-b border-slate-200 px-3 py-3 ${isClosedProject(project) ? "bg-slate-100" : ""}">
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
            class="entry-bar ${getProjectPeriodBarClasses(project, period)} ${project.id === state.focusProjectId ? 'ring-2 ring-blue-300 ring-offset-1' : ''}"
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

    if (assigned === 0) {
      return { text: window.izomaxTranslateKey?.("notStaffed") || "Ikke bemannet", variant: "text-red-700" };
    }

    if (required > 0 && assigned < required) {
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

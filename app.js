(() => {
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
    projectFilterCategory: "all",
    projectInspectorSearch: "",
    projectInspectorGroup: "all",
    projectInspectorShowAvailable: false,
    projectInspectorAddCandidateName: "",
    projectInspectorAddRole: "",
    projectInspectorAddUseCustomRange: false,
    projectInspectorAddCustomStart: "",
    projectInspectorAddCustomEnd: "",
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
    }
  };

  const els = {};
  const PERSONAL_BLOCK_TYPES = ["Kurs", "Ferie", "Syk", "Avspasering", "Travel"];
  const PROJECT_STATUS_OPTIONS = ["Planlagt", "Pågår", "Avventer", "Fullført", "Kansellert"];
  const PERSONAL_PROJECT_MARKER = "__personal_block_system_project__";
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
      label: "Onshore",
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
      "statsRow", "searchInput", "employeeFilter", "projectFilterControl", "calendarNewProjectBtn", "viewMode", "calendarMode", "personalPlanQuickBtn", "projectPlanQuickBtn", "unstaffedProjectsQuickBtn", "prevBtn", "nextBtn", "todayBtn",
      "calendarWrap", "holidayInfo", "projectSpotlightBar", "warningBox", "legendList", "projectList", "projectWorkspaceCard", "projectWorkspaceEmpty", "projectWorkspaceContent", "projectWorkspaceTitle", "projectWorkspaceMeta", "projectWorkspaceNotes", "projectWorkspaceAssignments", "projectWorkspaceActions", "assignProject", "assignPeriodWrap", "assignPeriod", "assignPeriodHint", "assignPeriodNav", "assignPrevPeriodBtn", "assignNextPeriodBtn", "assignEmployeesWrap", "assignSummary", "assignRole",
      "assignStart", "assignEnd", "assignNotes", "assignBtn", "bulkEmployees", "bulkAddBtn",
      "employeeList", "kanbanBoard", "notificationList", "auditList", "editModal", "closeModalBtn",
      "editProject", "editEmployee", "editRole", "editStart", "editEnd", "editNotes",
      "saveEditBtn", "deleteEditBtn", "storageBadge", "resetDemoBtn", "systemStatus", "rangeTitle",
      "saveStatus", "plannerTabs", "tabCalendarBtn", "tabProjectsBtn", "tabEmployeesBtn", "tabAdminBtn", "tabCalendarSection", "tabProjectsSection", "tabEmployeesSection", "tabAdminSection", "calendarMainCol", "calendarPanelCol", "calendarPanelHandleBtn", "calendarPanelCloseBtn", "calendarPanelContent", "newProjectBtn", "projectModal", "projectModalTitle", "closeProjectModalBtn",
      "projectName", "projectCategory", "projectStatus", "projectPlannedStart", "projectPlannedEnd", "projectHasMultiplePeriods", "projectPeriodsSection", "projectPeriodsList", "addProjectPeriodBtn",
      "projectLocation", "projectHeadcount", "projectNotes", "saveProjectBtn", "deleteProjectBtn",
      "newEmployeeBtn", "employeeModal", "employeeModalTitle", "closeEmployeeModalBtn",
      "employeeName", "employeeEmail", "employeePhone", "employeeTitle", "employeeGroup", "employeeActive", "saveEmployeeBtn", "deleteEmployeeBtn",
      "calendarContextMenu", "contextMenuEmployee", "contextMenuStart", "contextMenuEnd", "contextMenuType", "contextMenuNotes", "contextMenuAddBtn", "contextMenuCloseBtn",
      "accountPanel", "accountUserInfo", "changePasswordBtn", "resetPasswordBtn", "logoutBtn", "loginBtn", "loginModal", "closeLoginModalBtn", "loginEmail", "loginPassword", "loginSubmitBtn", "forgotPasswordBtn"
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
    els.searchInput.setAttribute("name", "planner_search_filter");
    els.searchInput.setAttribute("data-lpignore", "true");
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
      html += `<div class="border-b ${monthBoundary ? 'border-r-2 border-r-slate-400' : 'border-r border-slate-200'} px-1 py-2 text-center text-[10px] ${redDay ? 'bg-red-50 text-red-700' : 'bg-white text-slate-500'}"><div class="font-medium">${escapeHtml(weekdayShort(day))}</div><div>${day.getDate()}</div><div>${escapeHtml(monthShort(day))}</div></div>`;
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
    els.searchInput.setAttribute("name", isProjectMode ? "planner_project_search_filter" : "planner_search_filter");
    if (els.groupFilterControl) els.groupFilterControl.classList.toggle("hidden", isProjectMode);
    if (els.projectFilterControl) els.projectFilterControl.classList.toggle("hidden", !isProjectMode);
    if (els.calendarNewProjectBtn) els.calendarNewProjectBtn.classList.toggle("hidden", !isProjectMode);
  }

  function getProjectFilterOptions() {
    const categories = Array.from(new Set(getVisibleProjects().map(project => project.category).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "no"));
    return [
      { id: "all", name: "Alle prosjekter / kategorier" },
      ...categories.map(category => ({ id: category, name: category }))
    ];
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
        <div id="accountMenuDropdown" class="hidden absolute right-0 top-full mt-2 min-w-[170px] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-[120]">
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
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "xl:col-span-3";
    wrapper.innerHTML = `
      <div id="personalBlockCard" class="rounded-2xl bg-white border border-slate-200 shadow-sm h-full">
        <div class="p-4 border-b border-slate-200">
          <h2 class="font-semibold">Direkte blokk på ansatt</h2>
          <p class="text-sm text-slate-500 mt-1">Brukes for kurs, ferie, syk og avspasering direkte på personen, uten å gå via prosjektmodulen.</p>
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
      state.currentUser = user?.user_metadata?.full_name || user?.email || "Ikke innlogget";
      state.currentRole = "";

      try {
        const { data, error } = await supabaseClient.rpc("get_my_profile");
        if (!error && Array.isArray(data) && data[0]) {
          state.currentRole = normalizeRoleValue(data[0].role || "");
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
    return normalized;
  }

  function isSuperadmin() {
    return normalizeRoleValue(state.currentRole) === "superadmin";
  }

  function isPlanner() {
    const role = normalizeRoleValue(state.currentRole);
    return role === "planner" || role === "admin";
  }

  function isLoggedInUser() {
    return !!state.currentUserEmail;
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
  }

  function bindTabEvents() {
    if (els.tabCalendarBtn) els.tabCalendarBtn.addEventListener("click", () => setActiveTab("calendar"));
    if (els.tabProjectsBtn) els.tabProjectsBtn.addEventListener("click", () => setActiveTab("projects"));
    if (els.tabEmployeesBtn) els.tabEmployeesBtn.addEventListener("click", () => setActiveTab("employees"));
    if (els.tabAdminBtn) els.tabAdminBtn.addEventListener("click", () => setActiveTab("admin"));
  }

  function setActiveTab(tabName) {
    state.activeTab = tabName;
    renderLayoutTabs();
  }

  function renderLayoutTabs() {
    const canPlan = canPlanApp();
    const allowedTabs = canPlan ? ["calendar", "projects", "employees", "admin"] : ["calendar"];

    if (!allowedTabs.includes(state.activeTab)) {
      state.activeTab = "calendar";
    }

    const buttons = {
      calendar: els.tabCalendarBtn,
      projects: els.tabProjectsBtn,
      employees: els.tabEmployeesBtn,
      admin: els.tabAdminBtn
    };

    const sections = {
      calendar: els.tabCalendarSection,
      projects: els.tabProjectsSection,
      employees: els.tabEmployeesSection,
      admin: els.tabAdminSection
    };

    Object.entries(buttons).forEach(([name, btn]) => {
      if (!btn) return;
      const visible = allowedTabs.includes(name);
      btn.style.display = visible ? "" : "none";
      if (state.activeTab === name) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
      btn.className = [
        "rounded-2xl px-4 py-2 text-sm border transition",
        state.activeTab === name
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      ].join(" ");
    });

    Object.entries(sections).forEach(([name, section]) => {
      if (!section) return;
      const active = state.activeTab === name;
      section.style.display = active ? "" : "none";
      section.classList.toggle("hidden", !active);
    });
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
    fillSelect(els.projectCategory, CATEGORY_OPTIONS);
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
    els.searchInput.addEventListener("input", e => {
      state.search = e.target.value.trim().toLowerCase();
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
        state.projectFilterCategory = e.target.value || "all";
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
        if (state.calendarMode === "personal") state.projectListFilter = "all";
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
      els.contextMenuCloseBtn.addEventListener("click", hideCalendarContextMenu);
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

    els.closeModalBtn.addEventListener("click", closeEditModal);
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
        option.textContent = labelKey ? item[labelKey] : item.name;
      } else {
        option.value = item;
        option.textContent = item;
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
      project_periods_json: normalizeProjectPeriods(project?.project_periods_json || [])
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
            ${project.location ? `<span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">${escapeHtml(project.location)}</span>` : ""}
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

  function openPersonalCalendarView() {
    state.calendarMode = "personal";
    state.projectListFilter = "all";
    state.calendarPanelOpen = false;
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
      const categoryMatch = !state.projectFilterCategory || state.projectFilterCategory === "all" || project.category === state.projectFilterCategory;
      const search = String(state.search || "").trim().toLowerCase();
      const searchMatch = !search || [project.name, project.category, project.location, project.status]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(search));
      return categoryMatch && searchMatch;
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

    els.projectModalTitle.textContent = project ? "Rediger prosjekt" : "Nytt prosjekt";
    els.projectName.value = project?.name || "";
    fillSelect(els.projectCategory, CATEGORY_OPTIONS, project?.category || "Offshore");
    fillSelect(els.projectStatus, PROJECT_STATUS_OPTIONS, normalizeProjectStatus(project?.status || "Planlagt"));
    els.projectPlannedStart.value = project?.planned_start_date || "";
    els.projectPlannedEnd.value = project?.planned_end_date || "";
    if (els.projectHasMultiplePeriods) {
      els.projectHasMultiplePeriods.checked = Boolean(project?.has_multiple_periods);
    }
    state.projectModalPeriods = normalizeProjectPeriods(project?.project_periods_json || []);
    els.projectLocation.value = project?.location || "";
    els.projectHeadcount.value = project?.headcount_required ?? "";
    els.projectNotes.value = project?.notes || "";
    els.deleteProjectBtn.style.display = project ? "inline-flex" : "none";
    setProjectMultiplePeriodsUiState();
    renderProjectPeriodsEditor();

    els.projectModal.classList.remove("hidden");
    els.projectModal.classList.add("flex");
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
    const category = els.projectCategory.value;
    const status = normalizeProjectStatus(els.projectStatus.value);
    const singlePlannedStart = els.projectPlannedStart.value;
    const singlePlannedEnd = els.projectPlannedEnd.value;
    const hasMultiplePeriods = Boolean(els.projectHasMultiplePeriods?.checked);
    const location = els.projectLocation.value.trim();
    const headcountRequired = Number(els.projectHeadcount.value || 0);
    const notes = els.projectNotes.value.trim();

    if (!name) {
      alert("Legg inn prosjektnavn.");
      return;
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
      project.headcount_required = headcountRequired;
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
        headcount_required: headcountRequired,
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
    populateDynamicSelects();
    renderStats();
    renderLegend();
    renderCalendarPanel();
    renderProjects();
    renderEmployees();
    renderCalendar();
    renderKanban();
    renderNotifications();
    renderAudit();
    renderSystemStatus();
    updateBadge();
    updateAvailabilityAnalysis();
    applyRoleChrome();
    updateAvailabilityAnalysis();
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
      fillSelect(els.projectFilterControl, getProjectFilterOptions(), state.projectFilterCategory || "all", "name", "id");
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

  function updateProjectQuickControls(projectCount = null, unstaffedCount = null) {
    const totalProjects = projectCount ?? getVisibleProjects().length;
    const missingStaffCount = unstaffedCount ?? getUnstaffedProjectsForCurrentCalendarRange().length;

    if (els.personalPlanQuickBtn) {
      const active = state.calendarMode === "personal";
      els.personalPlanQuickBtn.classList.toggle("is-active", active);
      els.personalPlanQuickBtn.textContent = "Ansattplan";
      els.personalPlanQuickBtn.title = "Vis ansattplan i kalenderen";
    }

    if (els.projectPlanQuickBtn) {
      const active = state.calendarMode === "project" && state.projectListFilter !== "unstaffed";
      els.projectPlanQuickBtn.classList.toggle("is-active", active);
      els.projectPlanQuickBtn.textContent = `Prosjektplan (${totalProjects})`;
      els.projectPlanQuickBtn.title = "Åpne prosjektplan i kalenderen";
    }

    if (els.unstaffedProjectsQuickBtn) {
      const active = state.calendarMode === "project" && state.projectListFilter === "unstaffed";
      els.unstaffedProjectsQuickBtn.classList.toggle("is-active", active);
      els.unstaffedProjectsQuickBtn.innerHTML = `Uten bemanning <span class="quick-count">${escapeHtml(String(missingStaffCount))}</span>`;
      els.unstaffedProjectsQuickBtn.title = "Vis prosjekter som mangler bemanning i prosjektplanen for valgt periode";
    }
  }


  function renderLegend() {
    const projectCategoryHtml = ["Offshore", "Onshore"].map(name => `
      <div class="flex items-center gap-2">
        <span class="inline-block w-4 h-4 rounded ${CATEGORY_COLORS[name] || "bg-slate-400"}"></span>
        <span>${escapeHtml(name)}</span>
      </div>
    `).join("");

    const personalCategoryHtml = getVisiblePersonalBlockTypes().map(name => `
      <div class="flex items-center gap-2">
        <span class="inline-block w-4 h-4 rounded ${CATEGORY_COLORS[name] || "bg-slate-400"}"></span>
        <span>${escapeHtml(name)}</span>
      </div>
    `).join("");

    const statusHtml = Object.keys(STATUS_COLORS).map(name => `
      <div class="flex items-center gap-2">
        <span class="inline-block rounded-full border px-2 py-0.5 ${STATUS_COLORS[name]}">${escapeHtml(name)}</span>
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
    if (state.projectInspectorAddUseCustomRange) {
      return {
        start: String(state.projectInspectorAddCustomStart || "").trim(),
        end: String(state.projectInspectorAddCustomEnd || "").trim(),
        bounds
      };
    }
    return {
      start: bounds.start || "",
      end: bounds.end || "",
      bounds
    };
  }

  async function createProjectInspectorAssignment(projectId) {
    if (!canEditApp()) return;
    const project = getProjectById(projectId);
    if (!project) return;

    const assigned = state.entries.filter(entry => entry.project_id === project.id).length;
    const required = Math.max(Number(project.headcount_required || 0), 0);
    if (required > 0 && assigned >= required) {
      alert("Prosjektet er allerede fullbemannet.");
      return;
    }

    const employee = getProjectInspectorAddCandidate(project);
    if (!employee) {
      alert("Velg en ansatt fra listen først.");
      return;
    }
    if (employee.availability?.label === "Opptatt") {
      alert("Denne personen er opptatt i prosjektperioden.");
      return;
    }

    const range = getProjectInspectorAddRange(project);
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
      alert(getEntryConflictSummary(entry, conflicts));
      return;
    }

    state.entries.push(entry);
    state.projectInspectorAddCandidateName = "";
    state.projectInspectorAddRole = "";
    state.projectInspectorAddUseCustomRange = false;
    state.projectInspectorAddCustomStart = "";
    state.projectInspectorAddCustomEnd = "";
    rebuildDerivedState();
    renderAll();

    const result = await saveRow("planner_entries", entry);
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

    const assignedHtml = `
      <section>
        <div class="mb-2 flex items-center justify-between gap-2">
          <h3 class="font-semibold text-slate-900">Tildelte (${assigned}${required ? `/${required}` : ""})</h3>
          ${isFullyStaffed ? `<button id="projectInspectorChangeCrewHeaderBtn" type="button" class="border border-cyan-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50">${shouldShowAvailable ? "Skjul analyse" : "Endre crew"}</button>` : ""}
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
                <div style="margin-top:4px !important;font-size:11px !important;line-height:1.25 !important;color:rgba(232,244,248,0.78) !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;">${escapeHtml(entry.role || "Rolle ikke satt")}</div>
              </div>
              <div style="display:flex !important;align-items:center !important;justify-content:flex-end !important;gap:6px !important;flex:0 0 auto !important;visibility:visible !important;opacity:1 !important;">
                <button
                  data-project-entry-edit-id="${escapeHtml(entry.id)}"
                  type="button"
                  class="project-assigned-edit-pencil-btn"
                  style="display:inline-flex !important;align-items:center !important;justify-content:center !important;width:30px !important;height:30px !important;border:1px solid rgba(132,204,222,0.32) !important;background:rgba(255,255,255,0.06) !important;color:rgba(248,251,253,0.82) !important;border-radius:4px !important;font-size:14px !important;font-weight:700 !important;line-height:1 !important;cursor:pointer !important;visibility:visible !important;opacity:1 !important;position:relative !important;z-index:5 !important;"
                  title="Endre tildeling"
                  aria-label="Endre tildeling"
                >✎</button>
              </div>
            </div>
          `).join("") : `<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">Ingen tildelte ressurser.</div>`}
          ${needsStaffing ? `
            <button
              id="projectInspectorAddStaffBtn"
              type="button"
              class="project-add-staff-slot"
              style="display:flex !important;align-items:center !important;justify-content:center !important;gap:8px !important;width:100% !important;min-height:48px !important;box-sizing:border-box !important;border:1px dashed rgba(132,204,222,0.62) !important;background:rgba(255,255,255,0.08) !important;color:#f8fbfd !important;border-radius:4px !important;font-size:13px !important;font-weight:700 !important;cursor:pointer !important;visibility:visible !important;opacity:1 !important;"
              title="Legg til ansatt på dette prosjektet"
            >
              <span style="font-size:18px !important;line-height:1 !important;">+</span>
              <span>Legg til ansatt</span>
              <span style="font-size:11px !important;font-weight:600 !important;color:rgba(232,244,248,0.72) !important;">Velg fra tilgjengelige personer under · ${missingStaffCount} mangler</span>
            </button>
          ` : ""}
        </div>
      </section>
    `;

    const availableHtml = shouldShowAvailable ? `
      <section>
        <div class="mb-2 grid grid-cols-3 gap-1 text-[11px]">
          <div class="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-center font-semibold text-green-700"><div>Ledig</div><div class="text-sm">${availabilitySummary.available}</div></div>
          <div class="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-center font-semibold text-amber-700"><div>Delvis</div><div class="text-sm">${availabilitySummary.partial}</div></div>
          <div class="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-center font-semibold text-red-700"><div>Opptatt</div><div class="text-sm">${availabilitySummary.busy}</div></div>
        </div>
        <div class="mb-2 grid grid-cols-[1fr_auto] gap-2">
          <input id="projectInspectorSearchInput" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs" placeholder="Søk navn, gruppe, tittel eller status" value="${escapeHtml(state.projectInspectorSearch || "")}" />
          <select id="projectInspectorGroupFilter" class="rounded-xl border border-slate-300 px-2 py-2 text-xs">${groupOptions}</select>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div class="grid grid-cols-[1fr_auto] border-b border-slate-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span>Tilgjengelige / øvrige</span><span>Status</span>
          </div>
          ${employees.length ? employees.map(employee => {
            const isSelected = addCandidate && addCandidate.name === employee.name;
            const canAssign = employee.availability.label !== "Opptatt";
            const expandedHtml = isSelected ? `
              <div class="border-t border-slate-200 bg-slate-50 px-3 py-3">
                <div class="text-sm font-semibold text-slate-900">Legg til ${escapeHtml(employee.name)}</div>
                <div class="mt-2 grid gap-3">
                  <label class="grid gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Rolle
                    <select id="projectInspectorAddRoleSelect" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">${ROLE_OPTIONS.map(role => `<option value="${escapeHtml(role)}" ${role === addCandidateRole ? "selected" : ""}>${escapeHtml(role)}</option>`).join("")}</select>
                  </label>
                  <div class="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3">
                    <label class="flex items-start gap-2 text-sm text-slate-700">
                      <input id="projectInspectorWholePeriodRadio" type="radio" name="projectInspectorPeriodMode" value="whole" ${state.projectInspectorAddUseCustomRange ? "" : "checked"} class="mt-0.5" />
                      <span><span class="block font-medium text-slate-900">Hele prosjektperioden</span><span class="block text-xs text-slate-500">${escapeHtml(projectBounds.start ? `${formatDate(projectBounds.start)} – ${formatDate(projectBounds.end)}` : "Periode ikke satt")}</span></span>
                    </label>
                    <label class="flex items-start gap-2 text-sm text-slate-700">
                      <input id="projectInspectorCustomPeriodRadio" type="radio" name="projectInspectorPeriodMode" value="custom" ${state.projectInspectorAddUseCustomRange ? "checked" : ""} class="mt-0.5" />
                      <span><span class="block font-medium text-slate-900">Egendefinert periode</span><span class="block text-xs text-slate-500">Velg fra/til innenfor prosjektperioden.</span></span>
                    </label>
                    <div class="grid grid-cols-2 gap-2 ${state.projectInspectorAddUseCustomRange ? "" : "opacity-60"}">
                      <label class="grid gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Fra
                        <input id="projectInspectorCustomStartInput" type="date" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" value="${escapeHtml(addRange.start || projectBounds.start || "")}" min="${escapeHtml(projectBounds.start || "")}" max="${escapeHtml(projectBounds.end || "")}" ${state.projectInspectorAddUseCustomRange ? "" : "disabled"} />
                      </label>
                      <label class="grid gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Til
                        <input id="projectInspectorCustomEndInput" type="date" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" value="${escapeHtml(addRange.end || projectBounds.end || "")}" min="${escapeHtml(projectBounds.start || "")}" max="${escapeHtml(projectBounds.end || "")}" ${state.projectInspectorAddUseCustomRange ? "" : "disabled"} />
                      </label>
                    </div>
                  </div>
                  ${employee.availability.label === "Delvis ledig" ? `<div class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">Denne personen er delvis tilgjengelig. Velg riktig delperiode før du legger til.</div>` : ""}
                  <div class="flex items-center justify-end gap-2">
                    <button id="projectInspectorAddCancelBtn" type="button" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Avbryt</button>
                    <button id="projectInspectorAddConfirmBtn" type="button" class="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700">Legg til prosjekt</button>
                  </div>
                </div>
              </div>
            ` : "";
            return `
              <div class="border-b border-slate-100 last:border-b-0">
                <div style="display:grid !important;grid-template-columns:minmax(0,1fr) auto !important;align-items:center !important;gap:8px !important;padding:10px 12px !important;background:${isSelected ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'} !important;border-bottom:1px solid rgba(148,187,199,0.18) !important;">
                  <button data-project-inspector-select-employee="${escapeHtml(employee.name)}" data-project-inspector-select-role="${escapeHtml(getDefaultRoleForIndex(0))}" type="button" style="display:flex !important;align-items:center !important;gap:8px !important;width:100% !important;min-width:0 !important;text-align:left !important;background:transparent !important;border:0 !important;padding:0 !important;color:#f8fbfd !important;cursor:pointer !important;">
                    ${getEmployeeGroupIconHtml(employee.normalizedGroup, "inline-flex h-5 w-5 items-center justify-center text-slate-500 shrink-0 opacity-90") || `<span style="display:inline-flex;width:20px;height:20px;align-items:center;justify-content:center;color:rgba(232,244,248,0.65);flex:0 0 auto;">•</span>`}
                    <div style="min-width:0 !important;overflow:hidden !important;">
                      <div style="font-size:12px !important;font-weight:750 !important;line-height:1.25 !important;color:#f8fbfd !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;">${escapeHtml(employee.name)}</div>
                      <div style="margin-top:3px !important;font-size:11px !important;line-height:1.25 !important;color:rgba(232,244,248,0.72) !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;">${escapeHtml(employee.title || "Tittel ikke satt")}</div>
                    </div>
                  </button>
                  <div style="display:flex !important;align-items:center !important;justify-content:flex-end !important;gap:8px !important;flex:0 0 auto !important;">
                    <span style="font-size:12px !important;font-weight:750 !important;color:${employee.availability.label === 'Ledig' ? '#22c55e' : employee.availability.label === 'Delvis ledig' ? '#f59e0b' : '#ef4444'} !important;">${escapeHtml(employee.availability.label)}</span>
                    ${canAssign ? `<button data-project-inspector-select-employee="${escapeHtml(employee.name)}" data-project-inspector-select-role="${escapeHtml(getDefaultRoleForIndex(0))}" type="button" style="display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(132,204,222,0.42);background:rgba(255,255,255,0.10);color:#f8fbfd;border-radius:4px;padding:5px 8px;font-size:11px;font-weight:800;cursor:pointer;">${isSelected ? "Valgt" : "Velg"}</button>` : `<span style="display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(148,163,184,0.25);background:rgba(148,163,184,0.12);color:rgba(232,244,248,0.55);border-radius:4px;padding:5px 8px;font-size:11px;font-weight:800;">Opptatt</span>`}
                  </div>
                </div>
                ${expandedHtml}
              </div>
            `;
          }).join("") : `<div class="px-3 py-4 text-xs text-slate-500">Ingen treff i tilgjengelig-listen.</div>`}
        </div>
        ${filteredEmployees.length > employees.length ? `<div class="mt-2 text-[11px] text-slate-500">Viser ${employees.length} av ${filteredEmployees.length}. Bruk søk eller gruppefilter for å snevre inn.</div>` : ""}
      </section>
    ` : "";

    const fullStaffedCrewActionHtml = isFullyStaffed ? `
      <section>
        <button id="projectInspectorChangeCrewBtn" type="button" class="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          ${shouldShowAvailable ? "Skjul tilgjengelige / øvrige" : "Endre crew"}
        </button>
        ${!shouldShowAvailable ? `<div class="mt-2 text-xs text-slate-500">Prosjektet er fullt bemannet. Tilgjengelighetsanalyse vises først når du skal endre crew.</div>` : ""}
      </section>
    ` : "";

    els.calendarPanelContent.innerHTML = `
      <div class="flex h-full flex-col">
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-slate-950">Prosjektdetaljer</h2>
            <div class="mt-1 truncate text-sm font-medium text-slate-800">${escapeHtml(project.name)}</div>
            <div class="mt-1 text-xs font-medium ${staffingTone}">${escapeHtml(staffing.text)}${required ? ` (${assigned}/${required})` : ""}</div>
          </div>
          <button id="calendarProjectPanelCloseBtn" type="button" class="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">×</button>
        </div>

        <div class="min-h-0 flex-1 space-y-4 overflow-auto p-4 text-sm">
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wide text-slate-500">Kategori</div>
              <div class="mt-1 font-semibold text-slate-900">${escapeHtml(project.category || "Ikke satt")}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div class="text-[11px] uppercase tracking-wide text-slate-500">Bemanningsbehov</div>
              <div class="mt-1 font-semibold text-slate-900">${required || 0} personer</div>
            </div>
          </div>

          <section>
            <div class="mb-2 flex items-center justify-between gap-2">
              <h3 class="font-semibold text-slate-900">Perioder</h3>
              <button data-calendar-panel-edit-project="${escapeHtml(project.id)}" type="button" class="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">+ Del opp / legg til periode</button>
            </div>
            <div class="space-y-2">
              ${periods.length ? periods.map((period, index) => `
                <div class="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <span class="font-medium text-slate-700">Periode ${index + 1}</span>
                  <span class="text-xs text-slate-500">${escapeHtml(formatDate(period.start))} – ${escapeHtml(formatDate(period.end))}</span>
                </div>
              `).join("") : `<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">Ingen periode satt.</div>`}
            </div>
          </section>

          <section>
            <div class="mb-2 flex items-center justify-between gap-2">
              <h3 class="font-semibold text-slate-900">Bemanning</h3>
              <button data-calendar-panel-staff-project="${escapeHtml(project.id)}" type="button" class="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">Bemann prosjekt</button>
            </div>
          </section>

          ${assignedHtml}
          ${fullStaffedCrewActionHtml}
          ${availableHtml}
        </div>

        <div class="grid grid-cols-2 gap-2 border-t border-slate-200 p-4">
          <button data-calendar-panel-edit-project="${escapeHtml(project.id)}" type="button" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Rediger prosjekt</button>
          <button data-calendar-panel-staff-project="${escapeHtml(project.id)}" type="button" class="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">Bemann</button>
        </div>
      </div>
    `;

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

    els.calendarPanelContent.querySelectorAll("[data-calendar-panel-edit-project]").forEach(btn => {
      btn.addEventListener("click", () => openProjectModal(btn.dataset.calendarPanelEditProject));
    });
    els.calendarPanelContent.querySelectorAll("[data-calendar-panel-staff-project]").forEach(btn => {
      btn.addEventListener("click", () => startProjectStaffing(btn.dataset.calendarPanelStaffProject));
    });
    els.calendarPanelContent.querySelectorAll("[data-project-inspector-select-employee]").forEach(btn => {
      btn.addEventListener("click", () => {
        const employeeName = btn.dataset.projectInspectorSelectEmployee || "";
        const suggestedRole = btn.dataset.projectInspectorSelectRole || "";
        if (state.projectInspectorAddCandidateName === employeeName) {
          state.projectInspectorAddCandidateName = "";
          state.projectInspectorAddRole = "";
          state.projectInspectorAddUseCustomRange = false;
          rerenderPanel(false);
          return;
        }
        primeProjectInspectorCandidate(project, employeeName, suggestedRole);
        state.projectInspectorShowAvailable = true;
        rerenderPanel(false);
      });
    });
    document.getElementById("projectInspectorAddCancelBtn")?.addEventListener("click", () => {
      state.projectInspectorAddCandidateName = "";
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
    document.getElementById("projectInspectorAddConfirmBtn")?.addEventListener("click", () => {
      void createProjectInspectorAssignment(project.id);
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

    if (els.calendarPanelContent && !els.calendarPanelContent.querySelector('#legendList')) {
      els.calendarPanelContent.innerHTML = `
        <div class="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <h2 class="font-semibold">Farger og status</h2>
        </div>
        <div id="legendList" class="p-4 space-y-2 text-sm"></div>
      `;
      els.legendList = document.getElementById("legendList");
      renderLegend();
    }

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
          <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">${escapeHtml(project.category || "Uten kategori")}</span>
          ${project.location ? `<span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">Lokasjon: ${escapeHtml(project.location)}</span>` : ""}
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
            <div class="mt-1 text-sm text-slate-500">${escapeHtml(project.location || 'Lokasjon ikke satt')}</div>
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
        <button data-project-workspace-staff-id="${escapeHtml(project.id)}" class="rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium shadow-sm">Bemann prosjekt</button>
        <button data-project-workspace-edit-id="${escapeHtml(project.id)}" class="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">Rediger prosjekt</button>
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


  function renderProjects() {
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

    const stickyWidth = 238;
    const colWidth = Math.max(28, state.viewMode === "Uke" ? 38 : 32);
    const totalWidth = colWidth * days.length;

    let html = `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px; min-width:${stickyWidth + totalWidth}px;">`;
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
          html += `<div data-drop-slot-index="${i}" data-drop-date="${toIsoDate(day)}" class="day-cell ${redDay ? "red-day" : ""}" style="position:absolute; left:${i * colWidth}px; width:${colWidth}px; border-right:${monthBoundary ? "2px solid #94a3b8" : "1px solid #e2e8f0"};"></div>`;
        }

        html += `<div style="position:relative; width:${totalWidth}px; min-height:52px;">`;

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
              <div data-resize-handle data-resize-type="entry" data-target-id="${escapeHtml(entry.id)}" title="Dra for å endre sluttdato" style="position:absolute; top:0; right:0; bottom:0; width:12px; cursor:ew-resize; border-left:1px solid rgba(255,255,255,0.35); background:linear-gradient(to left, rgba(255,255,255,0.35), rgba(255,255,255,0));"></div>
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
              <div data-resize-handle data-resize-type="entry" data-target-id="${escapeHtml(entry.id)}" title="Dra for å endre sluttdato" style="position:absolute; top:0; right:0; bottom:0; width:12px; cursor:ew-resize; border-left:1px solid rgba(255,255,255,0.35); background:linear-gradient(to left, rgba(255,255,255,0.35), rgba(255,255,255,0));"></div>
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

    const stickyWidth = 300;
    const colWidth = Math.max(28, state.viewMode === "Uke" ? 38 : 32);
    const totalWidth = colWidth * days.length;

    let html = `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px; min-width:${stickyWidth + totalWidth}px;">`;
    html += `<div class="day-grid border border-slate-200 rounded-2xl overflow-visible" style="grid-template-columns:${stickyWidth}px repeat(${days.length}, ${colWidth}px);">`;
    html += renderTimelineHeaderRows(days, "Prosjekt");

    for (const project of projects) {
      const assigned = getProjectAssignedCount(project.id);
      const required = Number(project.headcount_required || 0);
      const staffing = getProjectStaffingLabel(project.id, required);
      const projectPeriods = getProjectTimelinePeriods(project);

      html += `
        <button type="button" data-project-list-row-id="${escapeHtml(project.id)}" class="sticky-col border-r border-b border-slate-200 px-3 py-2 text-left ${project.id === state.focusProjectId ? "bg-blue-50 ring-2 ring-blue-200" : isClosedProject(project) ? "bg-slate-100" : "bg-white"}">
          <div class="font-medium">${escapeHtml(project.name)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(project.location || "")}</div>
          <div class="text-xs ${staffing.variant} mt-1">${escapeHtml(staffing.text)}${required ? ` (${assigned}/${required})` : ""}</div>
          ${project.has_multiple_periods && projectPeriods.length ? `<div class="text-[11px] text-slate-400 mt-1">${projectPeriods.length} perioder</div>` : ""}
        </button>
      `;

      html += `<div class="row-overlay border-b border-slate-200" data-range-start="${toIsoDate(range.start)}" data-col-width="${colWidth}" data-total-cols="${days.length}" data-time-unit="day" style="grid-column: span ${days.length}; width:${totalWidth}px;">`;

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const nextDay = days[i + 1] || null;
        const monthBoundary = !nextDay || nextDay.getMonth() !== day.getMonth();
        const redDay = isRedDay(day);
        html += `<div data-drop-slot-index="${i}" data-drop-date="${toIsoDate(day)}" class="day-cell ${redDay ? "red-day" : ""}" style="position:absolute; left:${i * colWidth}px; width:${colWidth}px; border-right:${monthBoundary ? "2px solid #94a3b8" : "1px solid #e2e8f0"};"></div>`;
      }

      html += `<div style="position:relative; width:${totalWidth}px; min-height:52px;">`;

      for (const period of projectPeriods) {
        const clipped = clipRange(asLocalDate(period.start), asLocalDate(period.end), range.start, range.end);
        const startIndex = diffDays(range.start, clipped.start);
        const spanDays = diffDays(clipped.start, clipped.end) + 1;
        const left = startIndex * colWidth + 2;
        const width = Math.max(spanDays * colWidth - 4, 40);
        const periodLabel = project.has_multiple_periods && projectPeriods.length > 1 ? `${formatDate(period.start)} – ${formatDate(period.end)}` : staffing.text;

        html += `
          <div
            class="entry-bar ${getProjectBarClasses(project)} ${project.id === state.focusProjectId ? 'ring-2 ring-blue-300 ring-offset-1' : ''}"
            style="left:${left}px; width:${width}px;"
            data-project-row-id="${escapeHtml(project.id)}"
            title="${escapeHtml(`${project.name} | ${formatDate(period.start)} – ${formatDate(period.end)} | ${staffing.text}`)}"
          >
            <div class="font-semibold">${escapeHtml(project.name)}</div>
            <div class="text-[11px] opacity-90">${escapeHtml(periodLabel)}</div>
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
    html += `<div class="sticky-col z-30 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-semibold">Prosjekt</div>`;

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

      if (project.planned_start_date && project.planned_end_date) {
        const start = asLocalDate(project.planned_start_date);
        const end = asLocalDate(project.planned_end_date);
        const startMonth = Math.max(0, start.getFullYear() < year ? 0 : start.getMonth());
        const endMonth = Math.min(11, end.getFullYear() > year ? 11 : end.getMonth());
        const spanMonths = (endMonth - startMonth) + 1;
        const left = startMonth * monthWidth + 2;
        const width = Math.max(spanMonths * monthWidth - 4, 40);

        html += `
          <div
            class="entry-bar ${getProjectBarClasses(project)} ${project.id === state.focusProjectId ? 'ring-2 ring-blue-300 ring-offset-1' : ''}"
            style="left:${left}px; width:${width}px;"
            data-project-row-id="${escapeHtml(project.id)}"
            title="${escapeHtml(`${project.name} | ${formatProjectDateRange(project)} | ${staffing.text}`)}"
          >
            <div class="font-semibold">${escapeHtml(project.name)}</div>
            <div class="text-[11px] opacity-90">${escapeHtml(staffing.text)}</div>
            <div data-resize-handle data-resize-type="project" data-target-id="${escapeHtml(project.id)}" title="Dra for å endre sluttdato" style="position:absolute; top:0; right:0; bottom:0; width:12px; cursor:ew-resize; border-left:1px solid rgba(255,255,255,0.35); background:linear-gradient(to left, rgba(255,255,255,0.35), rgba(255,255,255,0));"></div>
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

function getFilteredEmployees() {
    const selectedGroups = state.selectedEmployeeGroups || [];
    const useGroupFilterControl = !!els.groupFilterControl;

    return state.employees
      .filter(emp => {
        const isActive = emp.active !== false;
        const matchesLegacyFilter = state.employeeFilter === "Alle ansatte" || emp.name === state.employeeFilter;
        const employeeGroup = normalizeEmployeeGroup(emp.employee_group || "");
        const matchesGroupFilter = !selectedGroups.length || selectedGroups.includes(employeeGroup);
        const matchesSearch = !state.search || emp.name.toLowerCase().includes(state.search);
        const matchesFilter = useGroupFilterControl ? matchesGroupFilter : matchesLegacyFilter;
        return isActive && matchesFilter && matchesSearch;
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
      return { text: "Kansellert", variant: "text-red-700" };
    }

    const assigned = getProjectAssignedCount(projectId);

    if (assigned === 0) {
      return { text: "Ikke bemannet", variant: "text-red-700" };
    }

    if (required > 0 && assigned < required) {
      return { text: "Delvis bemannet", variant: "text-amber-700" };
    }

    return { text: "Bemannet", variant: "text-green-700" };
  }

  function projectOverlapsRange(project, rangeStart, rangeEnd) {
    const periods = getProjectTimelinePeriods(project);
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
    if (!project.planned_start_date && !project.planned_end_date) return "Ingen planlagt periode";
    if (project.planned_start_date && project.planned_end_date) {
      return `${formatDate(project.planned_start_date)} – ${formatDate(project.planned_end_date)}`;
    }
    if (project.planned_start_date) return `Fra ${formatDate(project.planned_start_date)}`;
    return `Til ${formatDate(project.planned_end_date)}`;
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

  
function getEntryBarClasses(project, role, entry = null) {
    const categoryClasses = CATEGORY_COLORS[project.category] || "bg-slate-500 border-slate-600 text-white";
    const roleClasses = ROLE_CLASSES[role] || "";
    const cancelledClasses = isCancelledProject(project) ? " bg-red-100 border-red-500 text-red-800 line-through decoration-red-600 decoration-2 opacity-80 grayscale" : "";
    const endedClasses = !cancelledClasses && isCompletedProject(project) ? " opacity-70 grayscale" : "";
    const conflictClasses = entry && entryHasVisibleConflict(entry) ? " overlap-conflict border-2 border-red-700 ring-2 ring-red-300" : "";
    return `${cancelledClasses || categoryClasses} ${roleClasses}${endedClasses}${conflictClasses}`;
  }

  function getProjectBarClasses(project) {
    const categoryClasses = CATEGORY_COLORS[project.category] || "bg-slate-500 border-slate-600 text-white";
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

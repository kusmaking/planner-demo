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
      .filter(employee => employee.active !== false)
      .slice()
      .sort((a, b) => {
        const groupDiff = getEmployeeGroupSortIndex(a.employee_group) - getEmployeeGroupSortIndex(b.employee_group);
        if (groupDiff !== 0) return groupDiff;
        return a.name.localeCompare(b.name, "no");
      });

    const available = [];
    const unavailable = [];

    if (!startDate || !endDate || startDate > endDate) {
      return {
        available,
        unavailable,
        summary: {
          projectName: projectId ? (getProjectById(projectId)?.name || "Valgt prosjekt") : "Ingen prosjekt valgt",
          startDate,
          endDate,
          valid: false
        }
      };
    }

    activeEmployees.forEach(employee => {
      const allEntries = state.derived.entriesByEmployee.get(employee.name) || [];
      const conflicts = allEntries
        .filter(entry => overlaps(entry.start_date, entry.end_date, startDate, endDate))
        .filter(entry => {
          if (projectId && entry.project_id === projectId) return false;
          return true;
        })
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
    });

    return {
      available,
      unavailable,
      summary: {
        projectName: projectId ? (getProjectById(projectId)?.name || "Valgt prosjekt") : "Ingen prosjekt valgt",
        startDate,
        endDate,
        valid: true
      }
    };
  }

  function buildAvailabilityConflict(entry) {
    const project = getProjectById(entry.project_id);
    const isPersonal = isSystemPersonalProject(project);
    const reason = isPersonal ? (project?.category || "Blokk") : `Prosjekt: ${project?.name || "Ukjent prosjekt"}`;
    return {
      entryId: entry.id,
      reason,
      role: entry.role || "",
      startDate: entry.start_date,
      endDate: entry.end_date,
      notes: entry.notes || "",
      isPersonal
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
      els.availabilitySummary.textContent = "Velg prosjekt og gyldig fra/til-dato for å analysere tilgjengelighet.";
      els.availabilityAvailableList.innerHTML = `<div class="text-sm text-slate-500">Ingen analyse kjørt.</div>`;
      els.availabilityUnavailableList.innerHTML = `<div class="text-sm text-slate-500">Ingen analyse kjørt.</div>`;
      if (els.availabilityAvailableCount) els.availabilityAvailableCount.textContent = "";
      if (els.availabilityUnavailableCount) els.availabilityUnavailableCount.textContent = "";
      return;
    }

    els.availabilitySummary.textContent = `${summary.projectName} • ${formatDate(summary.startDate)} – ${formatDate(summary.endDate)} • ${state.availability.available.length} tilgjengelige / ${state.availability.unavailable.length} ikke tilgjengelige`;
    if (els.availabilityAvailableCount) els.availabilityAvailableCount.textContent = `${state.availability.available.length} stk`;
    if (els.availabilityUnavailableCount) els.availabilityUnavailableCount.textContent = `${state.availability.unavailable.length} stk`;

    els.availabilityAvailableList.innerHTML = state.availability.available.length
      ? state.availability.available.map(item => `
        <div class="rounded-xl border border-green-200 bg-green-50 p-3">
          <div class="font-medium text-slate-900">${escapeHtml(item.name)}</div>
          <div class="text-xs text-slate-600 mt-1">${escapeHtml(item.group || "Ingen gruppe")} ${item.title ? `• ${escapeHtml(item.title)}` : ""}</div>
          <div class="text-xs text-green-700 mt-2">Tilgjengelig i valgt periode</div>
        </div>
      `).join("")
      : `<div class="text-sm text-slate-500">Ingen tilgjengelige ansatte i valgt periode.</div>`;

    els.availabilityUnavailableList.innerHTML = state.availability.unavailable.length
      ? state.availability.unavailable.map(item => `
        <div class="rounded-xl border border-red-200 bg-red-50 p-3">
          <div class="font-medium text-slate-900">${escapeHtml(item.name)}</div>
          <div class="text-xs text-slate-600 mt-1">${escapeHtml(item.group || "Ingen gruppe")} ${item.title ? `• ${escapeHtml(item.title)}` : ""}</div>
          <div class="mt-2 space-y-2">
            ${item.conflicts.map(conflict => `
              <div class="rounded-lg border border-red-200 bg-white px-3 py-2">
                <div class="text-xs font-medium text-red-700">${escapeHtml(conflict.reason)}</div>
                <div class="text-xs text-slate-600 mt-1">${escapeHtml(formatDate(conflict.startDate))} – ${escapeHtml(formatDate(conflict.endDate))}</div>
                ${conflict.role && !conflict.isPersonal ? `<div class="text-xs text-slate-500 mt-1">Rolle: ${escapeHtml(conflict.role)}</div>` : ""}
                ${conflict.notes ? `<div class="text-xs text-slate-500 mt-1">${escapeHtml(conflict.notes)}</div>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")
      : `<div class="text-sm text-slate-500">Ingen konflikter i valgt periode.</div>`;
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

    els.viewMode.addEventListener("change", e => {
      state.viewMode = e.target.value;
      persistUiState();
      renderStats();
      renderCalendar();
    });

    els.calendarMode.addEventListener("change", e => {
      state.calendarMode = e.target.value;
      persistUiState();
      renderStats();
      renderCalendar();
    });

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
      syncAssignDatesFromProject();
      updateAvailabilityAnalysis();
    });
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
    window.addEventListener("scroll", hideCalendarContextMenu, true);
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

  // RESTEN AV Locked-v41.8-KODEN ER BEHOLDT SOM BASE.
  // Denne canvas-filen er lagt ut som kopiérbar fallback siden sandbox-lenken ikke åpnet hos brukeren.
})();

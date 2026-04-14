(() => {
  const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const state = {
    employees: [],
    projects: [],
    entries: [],
    auditLog: [],
    notificationLog: [],
    currentUser: "Olis Hansen",
    employeeFilter: "Alle ansatte",
    search: "",
    viewMode: load(STORAGE_KEYS.viewMode, "Uke"),
    calendarMode: load(STORAGE_KEYS.calendarMode, "personal"),
    startDate: new Date(load(STORAGE_KEYS.startDate, "2026-01-05")),
    selectedEntryId: null,
    selectedProjectId: null,
    selectedEmployeeId: null,
    storageMode: "local",
    supabaseReady: false,
    supabaseError: null,
    derived: {
      projectById: new Map(),
      entriesByEmployee: new Map(),
      entryCountByProject: new Map()
    },
    dragEntryId: null,
    justDraggedEntryId: null
  };

  const els = {};
  let saveStatusTimer = null;
  let calendarScrollSyncRaf = null;

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("resize", debounce(() => renderCalendar(), 120));

  async function init() {
    cacheElements();
    setupStaticOptions();
    bindEvents();
    await bootData();
    rebuildDerivedState();
    renderAll();
  }

  function cacheElements() {
    const ids = [
      "statsRow", "searchInput", "employeeFilter", "viewMode", "calendarMode", "prevBtn", "nextBtn", "todayBtn",
      "calendarWrap", "warningBox", "legendList", "projectList", "assignProject", "assignEmployee", "assignRole",
      "assignStart", "assignEnd", "assignNotes", "assignBtn", "bulkEmployees", "bulkAddBtn",
      "employeeList", "kanbanBoard", "notificationList", "auditList", "editModal", "closeModalBtn",
      "editProject", "editEmployee", "editRole", "editStart", "editEnd", "editNotes",
      "saveEditBtn", "deleteEditBtn", "storageBadge", "resetDemoBtn", "systemStatus", "rangeTitle",
      "saveStatus", "newProjectBtn", "projectModal", "projectModalTitle", "closeProjectModalBtn",
      "projectName", "projectCategory", "projectStatus", "projectPlannedStart", "projectPlannedEnd",
      "projectLocation", "projectHeadcount", "projectNotes", "saveProjectBtn", "deleteProjectBtn",
      "newEmployeeBtn", "employeeModal", "employeeModalTitle", "closeEmployeeModalBtn",
      "employeeName", "employeeEmail", "employeePhone", "employeeTitle", "employeeActive", "saveEmployeeBtn", "deleteEmployeeBtn"
    ];

    ids.forEach(id => els[id] = document.getElementById(id));
  }

  function setupStaticOptions() {
    fillSelect(els.projectCategory, CATEGORY_OPTIONS);
    fillSelect(els.projectStatus, STATUS_OPTIONS, "Planlagt");
    fillSelect(els.assignRole, ROLE_OPTIONS, "Supervisor");
    fillSelect(els.editRole, ROLE_OPTIONS, "Supervisor");
  }

  function bindEvents() {
    els.searchInput.addEventListener("input", e => {
      state.search = e.target.value.trim().toLowerCase();
      renderStats();
      renderCalendar();
    });

    els.employeeFilter.addEventListener("change", e => {
      state.employeeFilter = e.target.value;
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
        : startOfWeek(new Date());
      persistUiState();
      renderStats();
      renderCalendar();
    });

    els.assignProject.addEventListener("change", syncAssignDatesFromProject);
    els.assignBtn.addEventListener("click", createEntry);
    els.bulkAddBtn.addEventListener("click", bulkAddEmployees);
    els.resetDemoBtn.addEventListener("click", resetDemo);

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
    return (list || []).map(emp => ({
      ...emp,
      title: emp?.title || ""
    }));
  }

  function normalizeProjects(list) {
    return (list || []).map(project => ({
      ...project,
      category: project?.category === "Project" ? "Offshore" : project?.category,
      status: project?.status === "Fullført" ? "Avsluttet" : project?.status
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

  function saveAllLocal() {
    localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(state.employees));
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects));
    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(state.entries));
    localStorage.setItem(STORAGE_KEYS.auditLog, JSON.stringify(state.auditLog));
    localStorage.setItem(STORAGE_KEYS.notificationLog, JSON.stringify(state.notificationLog));
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

    if (state.supabaseReady) {
      await supabaseClient.from("planner_audit_log").insert(row);
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

    if (state.supabaseReady) {
      await supabaseClient.from("planner_notification_log").insert(row);
    }
  }

  async function seedDemoDataBatch() {
    if (!state.supabaseReady) return;
    await saveRows("planner_employees", state.employees);
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

  function syncAssignDatesFromProject() {
    const project = getProjectById(els.assignProject.value);
    if (!project) return;
    els.assignStart.value = project.planned_start_date || "";
    els.assignEnd.value = project.planned_end_date || "";
  }

  async function createEntry() {
    const projectId = els.assignProject.value;
    const employeeName = els.assignEmployee.value;
    const role = els.assignRole.value;
    let startDate = els.assignStart.value;
    let endDate = els.assignEnd.value;
    const notes = els.assignNotes.value.trim();

    if (!projectId || !employeeName) {
      alert("Fyll ut prosjekt og ansatt.");
      return;
    }

    const project = getProjectById(projectId);
    if (!project) {
      alert("Prosjekt finnes ikke.");
      return;
    }

    if (!startDate) startDate = project.planned_start_date || "";
    if (!endDate) endDate = project.planned_end_date || "";

    if (!startDate || !endDate) {
      alert("Prosjekt eller tildeling mangler start/slutt.");
      return;
    }

    if (startDate > endDate) {
      alert("Startdato kan ikke være etter sluttdato.");
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      project_id: projectId,
      employee_name: employeeName,
      role,
      start_date: startDate,
      end_date: endDate,
      notes
    };

    state.entries.push(entry);
    rebuildDerivedState();
    const result = await saveRow("planner_entries", entry);
    if (!result.ok) {
      state.entries = state.entries.filter(e => e.id !== entry.id);
      rebuildDerivedState();
      renderAll();
      return;
    }

    await addAudit(`La inn tildeling: ${employeeName} → ${project.name}`);
    await addNotification(employeeName, project.name);

    els.assignNotes.value = "";
    renderAll();
  }

  function openEditModal(entryId) {
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
  }

  async function saveEditedEntry() {
    const entry = state.entries.find(e => e.id === state.selectedEntryId);
    if (!entry) return;

    if (els.editStart.value > els.editEnd.value) {
      alert("Startdato kan ikke være etter sluttdato.");
      return;
    }

    entry.project_id = els.editProject.value;
    entry.employee_name = els.editEmployee.value;
    entry.role = els.editRole.value;
    entry.start_date = els.editStart.value;
    entry.end_date = els.editEnd.value;
    entry.notes = els.editNotes.value.trim();
    rebuildDerivedState();

    const result = await saveRow("planner_entries", entry);
    if (!result.ok) return;

    const project = getProjectById(entry.project_id);
    await addAudit(`Redigerte tildeling: ${entry.employee_name} → ${project?.name || "Ukjent prosjekt"}`);
    closeEditModal();
    renderAll();
  }

  async function deleteEditedEntry() {
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
    await addAudit(`Slettet tildeling: ${entry.employee_name} → ${project?.name || "Ukjent prosjekt"}`);
    closeEditModal();
    renderAll();
  }

  function openProjectModal(projectId = null) {
    state.selectedProjectId = projectId;
    const project = state.projects.find(p => p.id === projectId);

    els.projectModalTitle.textContent = project ? "Rediger prosjekt" : "Nytt prosjekt";
    els.projectName.value = project?.name || "";
    fillSelect(els.projectCategory, CATEGORY_OPTIONS, project?.category || "Offshore");
    fillSelect(els.projectStatus, STATUS_OPTIONS, project?.status || "Planlagt");
    els.projectPlannedStart.value = project?.planned_start_date || "";
    els.projectPlannedEnd.value = project?.planned_end_date || "";
    els.projectLocation.value = project?.location || "";
    els.projectHeadcount.value = project?.headcount_required ?? "";
    els.projectNotes.value = project?.notes || "";
    els.deleteProjectBtn.style.display = project ? "inline-flex" : "none";

    els.projectModal.classList.remove("hidden");
    els.projectModal.classList.add("flex");
  }

  function closeProjectModal() {
    state.selectedProjectId = null;
    els.projectModal.classList.add("hidden");
    els.projectModal.classList.remove("flex");
  }

  async function saveProjectFromModal() {
    const name = els.projectName.value.trim();
    const category = els.projectCategory.value;
    const status = els.projectStatus.value;
    const plannedStart = els.projectPlannedStart.value;
    const plannedEnd = els.projectPlannedEnd.value;
    const location = els.projectLocation.value.trim();
    const headcountRequired = Number(els.projectHeadcount.value || 0);
    const notes = els.projectNotes.value.trim();

    if (!name) {
      alert("Legg inn prosjektnavn.");
      return;
    }

    if (plannedStart && plannedEnd && plannedStart > plannedEnd) {
      alert("Planlagt start kan ikke være etter planlagt slutt.");
      return;
    }

    const duplicate = state.projects.find(p =>
      p.name.toLowerCase() === name.toLowerCase() && p.id !== state.selectedProjectId
    );
    if (duplicate) {
      alert("Et prosjekt med dette navnet finnes allerede.");
      return;
    }

    let project = state.projects.find(p => p.id === state.selectedProjectId);

    if (project) {
      project.name = name;
      project.category = category;
      project.status = status;
      project.planned_start_date = plannedStart || null;
      project.planned_end_date = plannedEnd || null;
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

    await addAudit(`${state.selectedProjectId ? "Redigerte" : "Opprettet"} prosjekt: ${name}`);
    closeProjectModal();
    renderAll();
  }

  async function deleteProjectFromModal() {
    const project = state.projects.find(p => p.id === state.selectedProjectId);
    if (!project) return;

    const hasEntries = state.entries.some(e => e.project_id === project.id);
    if (hasEntries) {
      alert("Prosjektet kan ikke slettes før tilhørende tildelinger er fjernet.");
      return;
    }

    if (!confirm("Vil du slette dette prosjektet?")) return;

    state.projects = state.projects.filter(p => p.id !== project.id);
    rebuildDerivedState();
    const result = await deleteRow("planner_projects", project.id);
    if (!result.ok) {
      state.projects.push(project);
      state.projects.sort((a, b) => compareProjectDates(a, b));
      rebuildDerivedState();
      renderAll();
      return;
    }

    await addAudit(`Slettet prosjekt: ${project.name}`);
    closeProjectModal();
    renderAll();
  }

  function openEmployeeModal(employeeId = null) {
    state.selectedEmployeeId = employeeId;
    const employee = state.employees.find(e => e.id === employeeId);

    els.employeeModalTitle.textContent = employee ? "Rediger ansatt" : "Ny ansatt";
    els.employeeName.value = employee?.name || "";
    els.employeeEmail.value = employee?.email || "";
    els.employeePhone.value = employee?.phone || "";
    els.employeeTitle.value = employee?.title || "";
    els.employeeActive.checked = employee?.active ?? true;
    els.deleteEmployeeBtn.style.display = employee ? "inline-flex" : "none";

    els.employeeModal.classList.remove("hidden");
    els.employeeModal.classList.add("flex");
  }

  function closeEmployeeModal() {
    state.selectedEmployeeId = null;
    els.employeeModal.classList.add("hidden");
    els.employeeModal.classList.remove("flex");
  }

  async function saveEmployeeFromModal() {
    const name = els.employeeName.value.trim();
    const email = els.employeeEmail.value.trim();
    const phone = els.employeePhone.value.trim();
    const title = els.employeeTitle.value.trim();
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
        active
      };
      state.employees.push(employee);
    }

    state.employees = normalizeEmployees(state.employees);
    state.employees.sort((a, b) => a.name.localeCompare(b.name, "no"));
    rebuildDerivedState();

    const result = await saveRow("planner_employees", employee);
    if (!result.ok) return;

    await addAudit(`${state.selectedEmployeeId ? "Redigerte" : "Opprettet"} ansatt: ${name}`);
    closeEmployeeModal();
    renderAll();
  }

  async function deleteEmployeeFromModal() {
    const employee = state.employees.find(e => e.id === state.selectedEmployeeId);
    if (!employee) return;

    const hasEntries = state.entries.some(e => e.employee_name === employee.name);
    if (hasEntries) {
      alert("Ansatt kan ikke slettes før tilhørende tildelinger er fjernet. Sett eventuelt ansatt som inaktiv.");
      return;
    }

    if (!confirm("Vil du slette denne ansatte?")) return;

    state.employees = state.employees.filter(e => e.id !== employee.id);
    rebuildDerivedState();
    const result = await deleteRow("planner_employees", employee.id);
    if (!result.ok) {
      state.employees.push(employee);
      state.employees.sort((a, b) => a.name.localeCompare(b.name, "no"));
      rebuildDerivedState();
      renderAll();
      return;
    }

    await addAudit(`Slettet ansatt: ${employee.name}`);
    closeEmployeeModal();
    renderAll();
  }

  async function bulkAddEmployees() {
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
        active: true
      };

      state.employees.push(employee);
      inserted.push(employee);
      count++;
    }

    state.employees.sort((a, b) => a.name.localeCompare(b.name, "no"));
    rebuildDerivedState();

    if (inserted.length) {
      const result = await saveRows("planner_employees", inserted);
      if (!result.ok) {
        state.employees = state.employees.filter(e => !inserted.some(i => i.id === e.id));
        rebuildDerivedState();
        renderAll();
        return;
      }
    }

    await addAudit(`La til ${count} ansatte via masseimport`);
    els.bulkEmployees.value = "";
    renderAll();
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
    renderProjects();
    renderEmployees();
    renderCalendar();
    renderKanban();
    renderNotifications();
    renderAudit();
    renderSystemStatus();
    updateBadge();
  }

  function populateDynamicSelects() {
    const employeeFilterItems = [
      { name: "Alle ansatte", id: "Alle ansatte" },
      ...state.employees.filter(e => e.active !== false).map(e => ({ id: e.name, name: e.name }))
    ];

    fillSelect(els.employeeFilter, employeeFilterItems, state.employeeFilter, "name", "id");
    fillSelect(els.assignEmployee, state.employees.filter(e => e.active !== false), state.employees.find(e => e.active !== false)?.name || "", "name", "name");
    fillSelect(els.editEmployee, state.employees.filter(e => e.active !== false), null, "name", "name");
    fillSelect(els.assignProject, state.projects, state.projects[0]?.id || "", "name", "id");
    fillSelect(els.editProject, state.projects, null, "name", "id");
    fillSelect(els.viewMode, ["Uke", "Måned", "År"], state.viewMode);
    fillSelect(els.calendarMode, [
      { id: "personal", name: "Personalplan" },
      { id: "project", name: "Prosjektplan" }
    ], state.calendarMode, "name", "id");
    syncAssignDatesFromProject();
  }

  function renderStats() {
    const visibleEmployees = getFilteredEmployees();
    const range = getCurrentRange();
    const entriesInRange = state.entries.filter(entry => overlaps(entry.start_date, entry.end_date, range.start, range.end));
    const projectsInRange = state.projects.filter(project => projectOverlapsRange(project, range.start, range.end));
    const unstaffedProjects = state.projects.filter(project => getProjectAssignedCount(project.id) === 0);

    const cards = [
      { label: "Ansatte", value: state.employees.filter(e => e.active !== false).length },
      { label: "Prosjekter", value: state.projects.length },
      { label: "Prosjekter uten bemanning", value: unstaffedProjects.length },
      { label: "Tildelinger i visning", value: entriesInRange.length },
      { label: state.calendarMode === "project" ? "Prosjekter i visning" : "Synlige ansatte", value: state.calendarMode === "project" ? projectsInRange.length : visibleEmployees.length }
    ];

    els.statsRow.innerHTML = cards.map(card => `
      <div class="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
        <div class="text-sm text-slate-500">${escapeHtml(card.label)}</div>
        <div class="text-3xl font-bold mt-2">${escapeHtml(String(card.value))}</div>
      </div>
    `).join("");
  }

  function renderLegend() {
    const categoryHtml = Object.entries(CATEGORY_COLORS).map(([name, classes]) => `
      <div class="flex items-center gap-2">
        <span class="inline-block w-4 h-4 rounded ${classes}"></span>
        <span>${escapeHtml(name)}</span>
      </div>
    `).join("");

    const statusHtml = Object.keys(STATUS_COLORS).map(name => `
      <div class="flex items-center gap-2">
        <span class="inline-block rounded-full border px-2 py-0.5 ${STATUS_COLORS[name]}">${escapeHtml(name)}</span>
      </div>
    `).join("");

    els.legendList.innerHTML = `
      <div>
        <div class="font-medium mb-2">Kategorier</div>
        <div class="space-y-2">${categoryHtml}</div>
      </div>
      <div class="pt-4 border-t border-slate-200">
        <div class="font-medium mb-2">Prosjektstatus</div>
        <div class="space-y-2">${statusHtml}</div>
      </div>
    `;
  }

  function renderProjects() {
    els.projectList.innerHTML = state.projects
      .slice()
      .sort((a, b) => compareProjectDates(a, b))
      .map(project => {
        const assigned = getProjectAssignedCount(project.id);
        const required = Number(project.headcount_required || 0);
        const staffing = getProjectStaffingLabel(project.id, required);
        const projectCardClasses = project.status === "Avsluttet"
          ? "w-full text-left rounded-xl border border-slate-300 p-3 bg-slate-100 hover:bg-slate-200"
          : "w-full text-left rounded-xl border border-slate-200 p-3 bg-slate-50 hover:bg-slate-100";

        return `
          <button data-project-id="${escapeHtml(project.id)}" class="${projectCardClasses}">
            <div class="flex items-center justify-between gap-2">
              <div class="font-medium">${escapeHtml(project.name)}</div>
              <span class="rounded-full border px-2 py-0.5 text-xs ${STATUS_COLORS[project.status] || "bg-slate-100 border-slate-200 text-slate-700"}">${escapeHtml(project.status)}</span>
            </div>
            <div class="text-xs text-slate-500 mt-1">${escapeHtml(project.category)}${project.location ? ` • ${escapeHtml(project.location)}` : ""}</div>
            <div class="text-xs text-slate-600 mt-1">${escapeHtml(formatProjectDateRange(project))}</div>
            <div class="text-xs mt-1 ${staffing.variant}">${escapeHtml(staffing.text)}${required ? ` (${assigned}/${required})` : ""}</div>
            <div class="text-xs text-slate-600 mt-1">${escapeHtml(project.notes || "")}</div>
          </button>
        `;
      }).join("") || `<div class="text-sm text-slate-500">Ingen prosjekter.</div>`;

    els.projectList.querySelectorAll("[data-project-id]").forEach(btn => {
      btn.addEventListener("click", () => openProjectModal(btn.dataset.projectId));
    });
  }

  function renderEmployees() {
    els.employeeList.innerHTML = state.employees.map(emp => `
      <button data-employee-id="${escapeHtml(emp.id)}" class="w-full text-left rounded-xl border border-slate-200 p-3 bg-slate-50 hover:bg-slate-100">
        <div class="flex items-center justify-between gap-2">
          <div class="font-medium">${escapeHtml(emp.name)}</div>
          <span class="text-xs ${emp.active ? "text-green-700" : "text-amber-700"}">${emp.active ? "Aktiv" : "Inaktiv"}</span>
        </div>
        <div class="text-xs text-slate-500 mt-1">${escapeHtml(emp.email || "Ingen e-post")}</div>
        <div class="text-xs text-slate-500">${escapeHtml(emp.phone || "Ingen telefon")}</div>
        <div class="text-xs text-slate-500">${escapeHtml(emp.title || "Ingen stillingstittel")}</div>
      </button>
    `).join("") || `<div class="text-sm text-slate-500">Ingen ansatte enda.</div>`;

    els.employeeList.querySelectorAll("[data-employee-id]").forEach(btn => {
      btn.addEventListener("click", () => openEmployeeModal(btn.dataset.employeeId));
    });
  }

  function renderKanban() {
    const groups = STATUS_OPTIONS.map(status => ({
      status,
      projects: state.projects.filter(p => p.status === status)
    }));

    els.kanbanBoard.innerHTML = groups.map(group => `
      <div class="rounded-2xl border border-slate-200 bg-slate-50">
        <div class="p-3 border-b border-slate-200 font-medium">${escapeHtml(group.status)} (${group.projects.length})</div>
        <div class="p-3 space-y-2">
          ${group.projects.length ? group.projects.map(project => `
            <div class="rounded-xl border border-slate-200 ${project.status === "Avsluttet" ? "bg-slate-100" : "bg-white"} p-3">
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
    const lines = [
      `<div><span class="font-medium">Lagring:</span> ${state.storageMode === "supabase" ? "Supabase" : "Lokal fallback"}</div>`,
      `<div><span class="font-medium">Kalendervisning:</span> ${state.calendarMode === "project" ? "Prosjektplan" : "Personalplan"}</div>`,
      `<div><span class="font-medium">Aktive ansatte:</span> ${state.employees.filter(e => e.active !== false).length}</div>`,
      `<div><span class="font-medium">Antall prosjekter:</span> ${state.projects.length}</div>`,
      `<div><span class="font-medium">Antall tildelinger:</span> ${state.entries.length}</div>`
    ];

    if (state.supabaseError) {
      lines.push(`<div class="text-red-600"><span class="font-medium">Feil:</span> ${escapeHtml(state.supabaseError)}</div>`);
    }

    els.systemStatus.innerHTML = lines.join("");
  }

  function renderCalendar() {
    if (!els.calendarWrap) return;
    els.rangeTitle.innerHTML = getRangeTitle();

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

    const calendarWrapWidth = Math.max(els.calendarWrap.clientWidth - 8, 900);
    const stickyWidth = 280;
    const usableWidth = Math.max(calendarWrapWidth - stickyWidth, state.viewMode === "Uke" ? 980 : 1100);
    const colWidth = usableWidth / days.length;
    const totalWidth = colWidth * days.length;

    let html = `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px;">`;
    html += `<div class="day-grid border border-slate-200 rounded-2xl overflow-hidden" style="grid-template-columns:${stickyWidth}px repeat(${days.length}, ${colWidth}px);">`;
    html += `<div class="sticky-col z-30 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-semibold">Ansatt</div>`;

    for (const day of days) {
      const weekend = isWeekend(day);
      const isTodayFlag = sameDate(day, new Date());
      const weekLabel = state.viewMode === "Uke" ? `<div>Uke ${getIsoWeek(day)}</div>` : "";

      html += `
        <div class="border-b border-r border-slate-200 px-2 py-2 text-center text-xs ${weekend ? "bg-slate-50" : "bg-white"} ${isTodayFlag ? "text-blue-700 font-semibold" : "text-slate-600"}">
          <div class="font-semibold">${weekdayShort(day)}</div>
          ${weekLabel}
          <div class="font-semibold">${day.getDate()}</div>
          <div>${monthShort(day)}</div>
        </div>
      `;
    }

    const warnings = [];

    for (const employee of employees) {
      const employeeEntries = (state.derived.entriesByEmployee.get(employee.name) || [])
        .filter(entry => overlaps(entry.start_date, entry.end_date, range.start, range.end));

      html += `
        <div class="sticky-col border-r border-b border-slate-200 px-3 py-3">
          <div class="font-medium">${escapeHtml(employee.name)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(employee.email || "")}</div>
          <div class="text-xs text-slate-500">${escapeHtml(employee.title || "")}</div>
        </div>
      `;

      html += `<div class="row-overlay border-b border-slate-200 drop-row" data-employee-name="${escapeHtml(employee.name)}" data-range-start="${toIsoDate(range.start)}" data-col-width="${colWidth}" data-total-cols="${days.length}" data-time-unit="day" style="grid-column: span ${days.length}; width:${totalWidth}px;">`;

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const weekend = isWeekend(day);
        const isTodayFlag = sameDate(day, new Date());
        html += `<div class="day-cell ${weekend ? "weekend" : ""} ${isTodayFlag ? "today" : ""}" style="position:absolute; left:${i * colWidth}px; width:${colWidth}px;"></div>`;
      }

      html += `<div style="position:relative; width:${totalWidth}px; min-height:56px;">`;

      for (const entry of employeeEntries) {
        const project = getProjectById(entry.project_id);
        if (!project) continue;

        const clipped = clipRange(new Date(entry.start_date), new Date(entry.end_date), range.start, range.end);
        const startIndex = diffDays(range.start, clipped.start);
        const spanDays = diffDays(clipped.start, clipped.end) + 1;
        const left = startIndex * colWidth + 2;
        const width = Math.max(spanDays * colWidth - 4, 40);

        html += `
          <div
            class="entry-bar ${getEntryBarClasses(project, entry.role)}"
            style="left:${left}px; width:${width}px;"
            data-entry-id="${escapeHtml(entry.id)}"
            draggable="true"
            title="${escapeHtml(`${employee.name} | ${project.name} | ${entry.role} | ${entry.start_date} - ${entry.end_date}${entry.notes ? ` | ${entry.notes}` : ""}`)}"
          >
            <div class="font-semibold">${escapeHtml(project.name)}</div>
            <div class="text-[11px] opacity-90">${escapeHtml(entry.role)}</div>
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

    html += `</div></div>`;
    els.calendarWrap.innerHTML = html;
    bindEntryClicks();
    renderWarnings(uniqueArray(warnings));
  }

  function renderPersonalYearCalendar() {
    const employees = getFilteredEmployees();
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

    for (const employee of employees) {
      const employeeEntries = (state.derived.entriesByEmployee.get(employee.name) || [])
        .filter(entry => overlaps(entry.start_date, entry.end_date, yearStart, yearEnd));

      html += `
        <div class="sticky-col border-r border-b border-slate-200 px-3 py-3">
          <div class="font-medium">${escapeHtml(employee.name)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(employee.email || "")}</div>
          <div class="text-xs text-slate-500">${escapeHtml(employee.title || "")}</div>
        </div>
      `;

      html += `<div class="row-overlay border-b border-slate-200 drop-row" data-employee-name="${escapeHtml(employee.name)}" data-range-start="${toIsoDate(yearStart)}" data-col-width="${monthWidth}" data-total-cols="12" data-time-unit="month" style="grid-column: span 12; width:${totalWidth}px;">`;

      for (let i = 0; i < 12; i++) {
        html += `<div class="month-cell" style="position:absolute; left:${i * monthWidth}px; width:${monthWidth}px;"></div>`;
      }

      html += `<div style="position:relative; width:${totalWidth}px; min-height:56px;">`;

      for (const entry of employeeEntries) {
        const project = getProjectById(entry.project_id);
        if (!project) continue;

        const entryStart = new Date(entry.start_date);
        const entryEnd = new Date(entry.end_date);
        const startMonth = Math.max(0, entryStart.getFullYear() < year ? 0 : entryStart.getMonth());
        const endMonth = Math.min(11, entryEnd.getFullYear() > year ? 11 : entryEnd.getMonth());
        const spanMonths = (endMonth - startMonth) + 1;
        const left = startMonth * monthWidth + 2;
        const width = Math.max(spanMonths * monthWidth - 4, 40);

        html += `
          <div
            class="entry-bar ${getEntryBarClasses(project, entry.role)}"
            style="left:${left}px; width:${width}px;"
            data-entry-id="${escapeHtml(entry.id)}"
            draggable="true"
            title="${escapeHtml(`${employee.name} | ${project.name} | ${entry.role} | ${entry.start_date} - ${entry.end_date}`)}"
          >
            <div class="font-semibold">${escapeHtml(project.name)}</div>
            <div class="text-[11px] opacity-90">${escapeHtml(formatYearBarLabel(entry.start_date, entry.end_date))}</div>
          </div>
        `;
      }

      html += `</div></div>`;
    }

    html += `</div></div>`;
    els.calendarWrap.innerHTML = html;
    bindEntryClicks();
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
    const projects = state.projects.filter(project => projectOverlapsRange(project, range.start, range.end));

    const calendarWrapWidth = Math.max(els.calendarWrap.clientWidth - 8, 900);
    const stickyWidth = 320;
    const usableWidth = Math.max(calendarWrapWidth - stickyWidth, state.viewMode === "Uke" ? 980 : 1100);
    const colWidth = usableWidth / days.length;
    const totalWidth = colWidth * days.length;

    let html = `<div class="calendar-shell" style="width:${stickyWidth + totalWidth}px;">`;
    html += `<div class="day-grid border border-slate-200 rounded-2xl overflow-hidden" style="grid-template-columns:${stickyWidth}px repeat(${days.length}, ${colWidth}px);">`;
    html += `<div class="sticky-col z-30 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-semibold">Prosjekt</div>`;

    for (const day of days) {
      const weekend = isWeekend(day);
      const isTodayFlag = sameDate(day, new Date());
      const weekLabel = state.viewMode === "Uke" ? `<div>Uke ${getIsoWeek(day)}</div>` : "";

      html += `
        <div class="border-b border-r border-slate-200 px-2 py-2 text-center text-xs ${weekend ? "bg-slate-50" : "bg-white"} ${isTodayFlag ? "text-blue-700 font-semibold" : "text-slate-600"}">
          <div class="font-semibold">${weekdayShort(day)}</div>
          ${weekLabel}
          <div class="font-semibold">${day.getDate()}</div>
          <div>${monthShort(day)}</div>
        </div>
      `;
    }

    for (const project of projects) {
      const assigned = getProjectAssignedCount(project.id);
      const required = Number(project.headcount_required || 0);
      const staffing = getProjectStaffingLabel(project.id, required);

      html += `
        <div class="sticky-col border-r border-b border-slate-200 px-3 py-3 ${project.status === "Avsluttet" ? "bg-slate-100" : ""}">
          <div class="font-medium">${escapeHtml(project.name)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(project.location || "")}</div>
          <div class="text-xs ${staffing.variant} mt-1">${escapeHtml(staffing.text)}${required ? ` (${assigned}/${required})` : ""}</div>
        </div>
      `;

      html += `<div class="row-overlay border-b border-slate-200" style="grid-column: span ${days.length}; width:${totalWidth}px;">`;

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const weekend = isWeekend(day);
        const isTodayFlag = sameDate(day, new Date());
        html += `<div class="day-cell ${weekend ? "weekend" : ""} ${isTodayFlag ? "today" : ""}" style="position:absolute; left:${i * colWidth}px; width:${colWidth}px;"></div>`;
      }

      html += `<div style="position:relative; width:${totalWidth}px; min-height:56px;">`;

      if (project.planned_start_date && project.planned_end_date) {
        const clipped = clipRange(new Date(project.planned_start_date), new Date(project.planned_end_date), range.start, range.end);
        const startIndex = diffDays(range.start, clipped.start);
        const spanDays = diffDays(clipped.start, clipped.end) + 1;
        const left = startIndex * colWidth + 2;
        const width = Math.max(spanDays * colWidth - 4, 40);

        html += `
          <div
            class="entry-bar ${getProjectBarClasses(project)}"
            style="left:${left}px; width:${width}px;"
            data-project-row-id="${escapeHtml(project.id)}"
            title="${escapeHtml(`${project.name} | ${formatProjectDateRange(project)} | ${staffing.text}`)}"
          >
            <div class="font-semibold">${escapeHtml(project.name)}</div>
            <div class="text-[11px] opacity-90">${escapeHtml(staffing.text)}</div>
          </div>
        `;
      }

      html += `</div></div>`;
    }

    html += `</div></div>`;
    els.calendarWrap.innerHTML = html;

    els.calendarWrap.querySelectorAll("[data-project-row-id]").forEach(el => {
      el.addEventListener("click", () => openProjectModal(el.dataset.projectRowId));
    });

    renderWarnings(uniqueArray(warnings));
  }

  function renderProjectYearCalendar(range, warnings) {
    const year = range.start.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    const projects = state.projects.filter(project => projectOverlapsRange(project, range.start, range.end));

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
        <div class="sticky-col border-r border-b border-slate-200 px-3 py-3 ${project.status === "Avsluttet" ? "bg-slate-100" : ""}">
          <div class="font-medium">${escapeHtml(project.name)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(project.location || "")}</div>
          <div class="text-xs ${staffing.variant} mt-1">${escapeHtml(staffing.text)}${required ? ` (${assigned}/${required})` : ""}</div>
        </div>
      `;

      html += `<div class="row-overlay border-b border-slate-200" style="grid-column: span 12; width:${totalWidth}px;">`;

      for (let i = 0; i < 12; i++) {
        html += `<div class="month-cell" style="position:absolute; left:${i * monthWidth}px; width:${monthWidth}px;"></div>`;
      }

      html += `<div style="position:relative; width:${totalWidth}px; min-height:56px;">`;

      if (project.planned_start_date && project.planned_end_date) {
        const start = new Date(project.planned_start_date);
        const end = new Date(project.planned_end_date);
        const startMonth = Math.max(0, start.getFullYear() < year ? 0 : start.getMonth());
        const endMonth = Math.min(11, end.getFullYear() > year ? 11 : end.getMonth());
        const spanMonths = (endMonth - startMonth) + 1;
        const left = startMonth * monthWidth + 2;
        const width = Math.max(spanMonths * monthWidth - 4, 40);

        html += `
          <div
            class="entry-bar ${getProjectBarClasses(project)}"
            style="left:${left}px; width:${width}px;"
            data-project-row-id="${escapeHtml(project.id)}"
            title="${escapeHtml(`${project.name} | ${formatProjectDateRange(project)} | ${staffing.text}`)}"
          >
            <div class="font-semibold">${escapeHtml(project.name)}</div>
            <div class="text-[11px] opacity-90">${escapeHtml(staffing.text)}</div>
          </div>
        `;
      }

      html += `</div></div>`;
    }

    html += `</div></div>`;
    els.calendarWrap.innerHTML = html;

    els.calendarWrap.querySelectorAll("[data-project-row-id]").forEach(el => {
      el.addEventListener("click", () => openProjectModal(el.dataset.projectRowId));
    });

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
    els.calendarWrap.querySelectorAll("[data-entry-id]").forEach(el => {
      el.addEventListener("click", () => {
        if (state.justDraggedEntryId === el.dataset.entryId) return;
        openEditModal(el.dataset.entryId);
      });

      el.addEventListener("dragstart", event => {
        state.dragEntryId = el.dataset.entryId;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", el.dataset.entryId);
        requestAnimationFrame(() => {
          el.classList.add("opacity-60");
        });
      });

      el.addEventListener("dragend", () => {
        el.classList.remove("opacity-60");
        state.dragEntryId = null;
      });
    });

    els.calendarWrap.querySelectorAll(".drop-row").forEach(row => {
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

  async function moveEntryByDrop(entryId, targetEmployeeName, dropMeta = null) {
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
      const durationDays = Math.max(0, diffDays(new Date(entry.start_date), new Date(entry.end_date)));
      const newStart = addDays(new Date(dropMeta.rangeStart), dropMeta.colIndex);
      const newEnd = addDays(newStart, durationDays);
      const newStartIso = toIsoDate(newStart);
      const newEndIso = toIsoDate(newEnd);
      if (entry.start_date !== newStartIso || entry.end_date !== newEndIso) {
        entry.start_date = newStartIso;
        entry.end_date = newEndIso;
        changed = true;
      }
    }

    if (dropMeta?.timeUnit === "month" && dropMeta.rangeStart && Number.isFinite(dropMeta.colIndex)) {
      const durationDays = Math.max(0, diffDays(new Date(entry.start_date), new Date(entry.end_date)));
      const originalStart = new Date(entry.start_date);
      const targetMonthBase = new Date(dropMeta.rangeStart);
      const shiftedStart = new Date(targetMonthBase.getFullYear(), targetMonthBase.getMonth() + dropMeta.colIndex, 1);
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
    await addAudit(`Flyttet tildeling: ${project?.name || "Ukjent prosjekt"} fra ${previous.employee_name} (${previous.start_date}–${previous.end_date}) til ${entry.employee_name} (${entry.start_date}–${entry.end_date})`);
    renderProjects();
    renderEmployees();
    renderSystemStatus();
  }

  function getFilteredEmployees() {
    return state.employees.filter(emp => {
      const isActive = emp.active !== false;
      const matchesFilter = state.employeeFilter === "Alle ansatte" || emp.name === state.employeeFilter;
      const matchesSearch = !state.search || emp.name.toLowerCase().includes(state.search);
      return isActive && matchesFilter && matchesSearch;
    });
  }

  function getCurrentRange() {
    if (state.viewMode === "Uke") {
      const start = startOfWeek(state.startDate);
      return { start, end: addDays(start, 6) };
    }

    if (state.viewMode === "Måned") {
      return {
        start: new Date(state.startDate.getFullYear(), state.startDate.getMonth(), 1),
        end: new Date(state.startDate.getFullYear(), state.startDate.getMonth() + 1, 0)
      };
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
      return `${viewLabel} • ${capitalize(monthLong(range.start))} ${range.start.getFullYear()}`;
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

  function getProjectStaffingLabel(projectId, required) {
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
    if (!project.planned_start_date || !project.planned_end_date) return false;
    return overlaps(project.planned_start_date, project.planned_end_date, rangeStart, rangeEnd);
  }

  function compareProjectDates(a, b) {
    const aDate = a.planned_start_date || "9999-12-31";
    const bDate = b.planned_start_date || "9999-12-31";
    if (aDate === bDate) return a.name.localeCompare(b.name, "no");
    return aDate.localeCompare(bDate);
  }

  function formatProjectDateRange(project) {
    if (!project.planned_start_date && !project.planned_end_date) return "Ingen planlagt periode";
    if (project.planned_start_date && project.planned_end_date) {
      return `${formatDate(project.planned_start_date)} – ${formatDate(project.planned_end_date)}`;
    }
    if (project.planned_start_date) return `Fra ${formatDate(project.planned_start_date)}`;
    return `Til ${formatDate(project.planned_end_date)}`;
  }

  function formatDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    }).format(d);
  }

  function formatDate(value) {
    const d = new Date(value);
    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit", month: "2-digit", year: "numeric"
    }).format(d);
  }

  function formatYearBarLabel(start, end) {
    return `${capitalize(monthShort(new Date(start)))}–${capitalize(monthShort(new Date(end)))}`;
  }

  function toIsoDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
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
    const current = new Date(start);
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
    const a1 = new Date(startA);
    const a2 = new Date(endA);
    const b1 = new Date(startB);
    const b2 = new Date(endB);
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

  function getDropMetaFromRow(row, event) {
    const rect = row.getBoundingClientRect();
    const colWidth = Number(row.dataset.colWidth || 0);
    const totalCols = Number(row.dataset.totalCols || 0);
    const timeUnit = row.dataset.timeUnit || "day";
    const rangeStart = row.dataset.rangeStart || null;

    if (!colWidth || !totalCols || !rangeStart) {
      return { timeUnit, rangeStart, colIndex: null };
    }

    const x = Math.max(0, Math.min(rect.width - 1, event.clientX - rect.left));
    const colIndex = Math.max(0, Math.min(totalCols - 1, Math.floor(x / colWidth)));
    return { timeUnit, rangeStart, colIndex };
  }

  function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function capitalize(value) {
    const str = String(value || "");
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getEntryBarClasses(project, role) {
    const categoryClasses = CATEGORY_COLORS[project.category] || "bg-slate-500 border-slate-600 text-white";
    const roleClasses = ROLE_CLASSES[role] || "";
    const endedClasses = project.status === "Avsluttet" ? " opacity-70 grayscale" : "";
    return `${categoryClasses} ${roleClasses}${endedClasses}`;
  }

  function getProjectBarClasses(project) {
    const categoryClasses = CATEGORY_COLORS[project.category] || "bg-slate-500 border-slate-600 text-white";
    const endedClasses = project.status === "Avsluttet" ? " opacity-70 grayscale" : "";
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

(() => {
  const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const state = {
    employees: [],
    projects: [],
    entries: [],
    auditLog: [],
    notificationLog: [],
    currentUser: "Olis Hansen",
    employeeFilter: "Alle ansatte",
    search: "",
    viewMode: load(STORAGE_KEYS.viewMode, "Uke"),
    startDate: new Date(load(STORAGE_KEYS.startDate, "2026-01-05")),
    selectedEntryId: null,
    storageMode: "local",
    supabaseReady: false,
    supabaseError: null
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    setupStaticOptions();
    bindEvents();
    await bootData();
    renderAll();
  }

  function cacheElements() {
    const ids = [
      "statsRow", "searchInput", "employeeFilter", "viewMode", "prevBtn", "nextBtn", "todayBtn",
      "calendarWrap", "warningBox", "legendList", "projectName", "projectCategory", "projectStatus",
      "projectNotes", "createProjectBtn", "assignProject", "assignEmployee", "assignRole",
      "assignStart", "assignEnd", "assignNotes", "assignBtn", "bulkEmployees", "bulkAddBtn",
      "employeeName", "employeeEmail", "employeePhone", "addEmployeeBtn", "employeeList",
      "kanbanBoard", "notificationList", "auditList", "editModal", "closeModalBtn",
      "editProject", "editEmployee", "editRole", "editStart", "editEnd", "editNotes",
      "saveEditBtn", "deleteEditBtn", "storageBadge", "syncNowBtn", "resetDemoBtn",
      "systemStatus"
    ];

    for (const id of ids) {
      els[id] = document.getElementById(id);
    }
  }

  function setupStaticOptions() {
    fillSelect(els.projectCategory, CATEGORY_OPTIONS);
    fillSelect(els.projectStatus, STATUS_OPTIONS, "Planlagt");
    fillSelect(els.assignRole, ROLE_OPTIONS, "Supervisor");
    fillSelect(els.editRole, ROLE_OPTIONS, "Supervisor");
  }

  function fillSelect(selectEl, values, selected = null, labelKey = null, valueKey = null) {
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

      if (selected !== null && option.value === selected) {
        option.selected = true;
      }

      selectEl.appendChild(option);
    });
  }

  function bindEvents() {
    els.searchInput.addEventListener("input", e => {
      state.search = e.target.value.trim().toLowerCase();
      renderCalendar();
      renderStats();
    });

    els.employeeFilter.addEventListener("change", e => {
      state.employeeFilter = e.target.value;
      renderCalendar();
      renderStats();
    });

    els.viewMode.addEventListener("change", e => {
      state.viewMode = e.target.value;
      persistUiState();
      renderCalendar();
    });

    els.prevBtn.addEventListener("click", () => {
      shiftPeriod(-1);
      renderCalendar();
    });

    els.nextBtn.addEventListener("click", () => {
      shiftPeriod(1);
      renderCalendar();
    });

    els.todayBtn.addEventListener("click", () => {
      state.startDate = startOfWeek(new Date());
      persistUiState();
      renderCalendar();
    });

    els.createProjectBtn.addEventListener("click", createProject);
    els.addEmployeeBtn.addEventListener("click", createEmployee);
    els.bulkAddBtn.addEventListener("click", bulkAddEmployees);
    els.assignBtn.addEventListener("click", createEntry);

    els.closeModalBtn.addEventListener("click", closeEditModal);
    els.saveEditBtn.addEventListener("click", saveEditedEntry);
    els.deleteEditBtn.addEventListener("click", deleteEditedEntry);

    els.syncNowBtn.addEventListener("click", async () => {
      await syncFromSupabase();
      renderAll();
    });

    els.resetDemoBtn.addEventListener("click", async () => {
      if (!confirm("Vil du nullstille til demo-data?")) return;
      await resetToDemoData();
      renderAll();
    });

    els.editModal.addEventListener("click", e => {
      if (e.target === els.editModal) closeEditModal();
    });
  }

  async function bootData() {
    const localData = loadAllLocal();

    state.employees = localData.employees;
    state.projects = localData.projects;
    state.entries = localData.entries;
    state.auditLog = localData.auditLog;
    state.notificationLog = localData.notificationLog;

    if (!supabaseClient) {
      state.supabaseReady = false;
      state.supabaseError = "Supabase-biblioteket ble ikke lastet.";
      state.storageMode = "local";
      updateBadge();
      return;
    }

    const ok = await testSupabase();

    if (!ok) {
      state.storageMode = "local";
      updateBadge();
      return;
    }

    await syncFromSupabase(true);
  }

  async function testSupabase() {
    try {
      const { error } = await supabaseClient
        .from("planner_employees")
        .select("id", { count: "exact", head: true });

      if (error) throw error;

      state.supabaseReady = true;
      state.supabaseError = null;
      return true;
    } catch (err) {
      state.supabaseReady = false;
      state.supabaseError = err?.message || "Ukjent feil ved tilkobling til Supabase.";
      return false;
    }
  }

  async function syncFromSupabase(initial = false) {
    if (!state.supabaseReady) return;

    try {
      const [
        employeesRes,
        projectsRes,
        entriesRes,
        auditRes,
        notificationsRes
      ] = await Promise.all([
        supabaseClient.from("planner_employees").select("*").order("name", { ascending: true }),
        supabaseClient.from("planner_projects").select("*").order("name", { ascending: true }),
        supabaseClient.from("planner_entries").select("*").order("start_date", { ascending: true }),
        supabaseClient.from("planner_audit_log").select("*").order("created_at", { ascending: false }).limit(100),
        supabaseClient.from("planner_notification_log").select("*").order("created_at", { ascending: false }).limit(100)
      ]);

      for (const res of [employeesRes, projectsRes, entriesRes, auditRes, notificationsRes]) {
        if (res.error) throw res.error;
      }

      const hasData =
        employeesRes.data.length ||
        projectsRes.data.length ||
        entriesRes.data.length;

      if (!hasData && initial) {
        await seedSupabaseWithCurrentState();
        return await syncFromSupabase(false);
      }

      state.employees = employeesRes.data || [];
      state.projects = projectsRes.data || [];
      state.entries = entriesRes.data || [];
      state.auditLog = auditRes.data || [];
      state.notificationLog = notificationsRes.data || [];

      saveAllLocal();
      state.storageMode = "supabase";
      state.supabaseError = null;
    } catch (err) {
      state.storageMode = "local";
      state.supabaseError = err?.message || "Kunne ikke laste fra Supabase.";
    }

    updateBadge();
  }

  async function seedSupabaseWithCurrentState() {
    await replaceSupabaseTable("planner_employees", state.employees);
    await replaceSupabaseTable("planner_projects", state.projects);
    await replaceSupabaseTable("planner_entries", state.entries);
    await replaceSupabaseTable("planner_audit_log", state.auditLog);
    await replaceSupabaseTable("planner_notification_log", state.notificationLog);
  }

  async function replaceSupabaseTable(table, rows) {
    const { error: deleteError } = await supabaseClient.from(table).delete().neq("id", "__none__");
    if (deleteError) throw deleteError;

    if (rows.length > 0) {
      const { error: insertError } = await supabaseClient.from(table).insert(rows);
      if (insertError) throw insertError;
    }
  }

  async function resetToDemoData() {
    state.employees = structuredClone(DEFAULT_EMPLOYEES);
    state.projects = structuredClone(DEFAULT_PROJECTS);
    state.entries = structuredClone(DEFAULT_ENTRIES);
    state.auditLog = structuredClone(DEFAULT_AUDIT_LOG);
    state.notificationLog = structuredClone(DEFAULT_NOTIFICATION_LOG);
    state.startDate = new Date("2026-01-05");
    state.viewMode = "Uke";
    persistUiState();
    saveAllLocal();

    if (state.supabaseReady) {
      await seedSupabaseWithCurrentState();
      await syncFromSupabase(false);
    } else {
      state.storageMode = "local";
      updateBadge();
    }
  }

  function loadAllLocal() {
    return {
      employees: load(STORAGE_KEYS.employees, structuredClone(DEFAULT_EMPLOYEES)),
      projects: load(STORAGE_KEYS.projects, structuredClone(DEFAULT_PROJECTS)),
      entries: load(STORAGE_KEYS.entries, structuredClone(DEFAULT_ENTRIES)),
      auditLog: load(STORAGE_KEYS.auditLog, structuredClone(DEFAULT_AUDIT_LOG)),
      notificationLog: load(STORAGE_KEYS.notificationLog, structuredClone(DEFAULT_NOTIFICATION_LOG))
    };
  }

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
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
  }

  async function createProject() {
    const name = els.projectName.value.trim();
    const category = els.projectCategory.value;
    const status = els.projectStatus.value;
    const notes = els.projectNotes.value.trim();

    if (!name) {
      alert("Legg inn prosjektnavn.");
      return;
    }

    const project = {
      id: crypto.randomUUID(),
      name,
      category,
      status,
      notes
    };

    state.projects.push(project);
    state.projects.sort((a, b) => a.name.localeCompare(b.name, "no"));
    await persistProjects();
    await addAudit(`Opprettet prosjekt: ${name}`);

    els.projectName.value = "";
    els.projectNotes.value = "";

    renderAll();
  }

  async function createEmployee() {
    const name = els.employeeName.value.trim();
    const email = els.employeeEmail.value.trim();
    const phone = els.employeePhone.value.trim();

    if (!name) {
      alert("Legg inn navn.");
      return;
    }

    if (state.employees.some(e => e.name.toLowerCase() === name.toLowerCase())) {
      alert("Denne ansatte finnes allerede.");
      return;
    }

    const employee = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      active: true
    };

    state.employees.push(employee);
    state.employees.sort((a, b) => a.name.localeCompare(b.name, "no"));
    await persistEmployees();
    await addAudit(`La til ansatt: ${name}`);

    els.employeeName.value = "";
    els.employeeEmail.value = "";
    els.employeePhone.value = "";

    renderAll();
  }

  async function bulkAddEmployees() {
    const rows = els.bulkEmployees.value
      .split("\n")
      .map(v => v.trim())
      .filter(Boolean);

    if (!rows.length) {
      alert("Lim inn minst ett navn.");
      return;
    }

    let count = 0;

    for (const name of rows) {
      const exists = state.employees.some(e => e.name.toLowerCase() === name.toLowerCase());
      if (exists) continue;

      state.employees.push({
        id: crypto.randomUUID(),
        name,
        email: "",
        phone: "",
        active: true
      });
      count++;
    }

    state.employees.sort((a, b) => a.name.localeCompare(b.name, "no"));

    await persistEmployees();
    await addAudit(`La til ${count} ansatte via masseimport`);

    els.bulkEmployees.value = "";
    renderAll();
  }

  async function createEntry() {
    const projectId = els.assignProject.value;
    const employeeName = els.assignEmployee.value;
    const role = els.assignRole.value;
    const startDate = els.assignStart.value;
    const endDate = els.assignEnd.value;
    const notes = els.assignNotes.value.trim();

    if (!projectId || !employeeName || !startDate || !endDate) {
      alert("Fyll ut prosjekt, ansatt og datoer.");
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
    await persistEntries();

    const project = getProjectById(projectId);
    await addAudit(`La inn tildeling: ${employeeName} → ${project?.name || "Ukjent prosjekt"}`);
    await addNotification(employeeName, project?.name || "Ukjent prosjekt");

    els.assignNotes.value = "";
    renderAll();
  }

  function openEditModal(entryId) {
    state.selectedEntryId = entryId;
    const entry = state.entries.find(e => e.id === entryId);
    if (!entry) return;

    fillSelect(els.editProject, state.projects, entry.project_id, "name", "id");
    fillSelect(els.editEmployee, state.employees, entry.employee_name, "name", "name");
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

    await persistEntries();

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
    await persistEntries();

    const project = getProjectById(entry.project_id);
    await addAudit(`Slettet tildeling: ${entry.employee_name} → ${project?.name || "Ukjent prosjekt"}`);

    closeEditModal();
    renderAll();
  }

  async function persistEmployees() {
    saveAllLocal();
    if (!state.supabaseReady) return;

    const { error } = await replaceSingleTable("planner_employees", state.employees);
    if (error) {
      state.storageMode = "local";
      state.supabaseError = error.message;
    } else {
      state.storageMode = "supabase";
      state.supabaseError = null;
    }
    updateBadge();
  }

  async function persistProjects() {
    saveAllLocal();
    if (!state.supabaseReady) return;

    const { error } = await replaceSingleTable("planner_projects", state.projects);
    if (error) {
      state.storageMode = "local";
      state.supabaseError = error.message;
    } else {
      state.storageMode = "supabase";
      state.supabaseError = null;
    }
    updateBadge();
  }

  async function persistEntries() {
    saveAllLocal();
    if (!state.supabaseReady) return;

    const { error } = await replaceSingleTable("planner_entries", state.entries);
    if (error) {
      state.storageMode = "local";
      state.supabaseError = error.message;
    } else {
      state.storageMode = "supabase";
      state.supabaseError = null;
    }
    updateBadge();
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

  async function replaceSingleTable(table, rows) {
    try {
      const { error: deleteError } = await supabaseClient.from(table).delete().neq("id", "__none__");
      if (deleteError) throw deleteError;

      if (rows.length > 0) {
        const { error: insertError } = await supabaseClient.from(table).insert(rows);
        if (insertError) throw insertError;
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  function renderAll() {
    populateDynamicSelects();
    renderStats();
    renderLegend();
    renderEmployees();
    renderCalendar();
    renderKanban();
    renderNotifications();
    renderAudit();
    renderSystemStatus();
    updateBadge();
  }

  function populateDynamicSelects() {
    const employees = [{ name: "Alle ansatte", id: "Alle ansatte" }, ...state.employees.map(e => ({ id: e.name, name: e.name }))];
    fillSelect(els.employeeFilter, employees, state.employeeFilter, "name", "id");
    fillSelect(els.assignEmployee, state.employees, state.employees[0]?.name || "", "name", "name");
    fillSelect(els.editEmployee, state.employees, state.employees[0]?.name || "", "name", "name");
    fillSelect(els.assignProject, state.projects, state.projects[0]?.id || "", "name", "id");
    fillSelect(els.editProject, state.projects, state.projects[0]?.id || "", "name", "id");
    fillSelect(els.viewMode, ["Uke", "Måned"], state.viewMode);
  }

  function renderStats() {
    const visibleEmployees = getFilteredEmployees();
    const currentRange = getCurrentRange();
    const entriesInRange = state.entries.filter(entry => overlaps(entry.start_date, entry.end_date, currentRange.start, currentRange.end));

    const cards = [
      { label: "Ansatte", value: state.employees.length },
      { label: "Prosjekter", value: state.projects.length },
      { label: "Tildelinger i visning", value: entriesInRange.length },
      { label: "Synlige ansatte", value: visibleEmployees.length }
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

  function renderEmployees() {
    const html = state.employees.map(emp => `
      <div class="rounded-xl border border-slate-200 p-3 bg-slate-50">
        <div class="font-medium">${escapeHtml(emp.name)}</div>
        <div class="text-xs text-slate-500 mt-1">${escapeHtml(emp.email || "Ingen e-post")}</div>
        <div class="text-xs text-slate-500">${escapeHtml(emp.phone || "Ingen telefon")}</div>
      </div>
    `).join("");

    els.employeeList.innerHTML = html || `<div class="text-sm text-slate-500">Ingen ansatte enda.</div>`;
  }

  function renderKanban() {
    const groups = STATUS_OPTIONS.map(status => {
      const projects = state.projects.filter(p => p.status === status);
      return { status, projects };
    });

    els.kanbanBoard.innerHTML = groups.map(group => `
      <div class="rounded-2xl border border-slate-200 bg-slate-50">
        <div class="p-3 border-b border-slate-200 font-medium">${escapeHtml(group.status)} (${group.projects.length})</div>
        <div class="p-3 space-y-2">
          ${group.projects.length ? group.projects.map(project => `
            <div class="rounded-xl border border-slate-200 bg-white p-3">
              <div class="font-medium">${escapeHtml(project.name)}</div>
              <div class="mt-1 text-xs text-slate-500">${escapeHtml(project.category)}</div>
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
        <div class="font-medium">${escapeHtml(row.user_name || row.user || "System")}</div>
        <div class="text-sm text-slate-600">${escapeHtml(row.action_text || row.action || "")}</div>
        <div class="text-xs text-slate-400 mt-1">${escapeHtml(formatDateTime(row.created_at || row.timestamp))}</div>
      </div>
    `).join("") || `<div class="text-sm text-slate-500">Ingen endringer.</div>`;
  }

  function renderSystemStatus() {
    const lines = [
      `<div><span class="font-medium">Lagring:</span> ${state.storageMode === "supabase" ? "Supabase" : "Lokal fallback"}</div>`,
      `<div><span class="font-medium">Antall ansatte:</span> ${state.employees.length}</div>`,
      `<div><span class="font-medium">Antall prosjekter:</span> ${state.projects.length}</div>`,
      `<div><span class="font-medium">Antall tildelinger:</span> ${state.entries.length}</div>`
    ];

    if (state.supabaseError) {
      lines.push(`<div class="text-red-600"><span class="font-medium">Supabase-feil:</span> ${escapeHtml(state.supabaseError)}</div>`);
    }

    els.systemStatus.innerHTML = lines.join("");
  }

  function renderCalendar() {
    const range = getCurrentRange();
    const days = getDaysBetween(range.start, range.end);
    const employees = getFilteredEmployees();

    const gridColumns = `260px repeat(${days.length}, minmax(44px, 1fr))`;

    let html = `
      <div class="calendar-grid border border-slate-200 rounded-2xl overflow-hidden" style="grid-template-columns:${gridColumns}">
    `;

    html += `
      <div class="calendar-sticky-col z-30 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-semibold">Ansatt</div>
    `;

    for (const day of days) {
      const weekend = isWeekend(day);
      const isTodayFlag = sameDate(day, new Date());
      html += `
        <div class="border-b border-r border-slate-200 px-2 py-2 text-center text-xs ${weekend ? "bg-slate-50" : "bg-white"} ${isTodayFlag ? "text-blue-700 font-semibold" : "text-slate-600"}">
          <div>${weekdayShort(day)}</div>
          <div class="font-semibold">${day.getDate()}</div>
          <div>${monthShort(day)}</div>
        </div>
      `;
    }

    const warnings = [];

    for (const employee of employees) {
      const employeeEntries = state.entries
        .filter(entry => entry.employee_name === employee.name)
        .filter(entry => overlaps(entry.start_date, entry.end_date, range.start, range.end));

      html += `
        <div class="calendar-sticky-col border-r border-b border-slate-200 px-3 py-3">
          <div class="font-medium">${escapeHtml(employee.name)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(employee.email || "")}</div>
        </div>
      `;

      html += `<div class="entry-row col-span-${days.length}" style="grid-column: span ${days.length};">`;

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const weekend = isWeekend(day);
        const isTodayFlag = sameDate(day, new Date());
        html += `<div class="day-cell ${weekend ? "weekend" : ""} ${isTodayFlag ? "today" : ""}" style="position:absolute; left:${i * 44}px; width:44px;"></div>`;
      }

      const rowWidth = days.length * 44;
      html += `<div style="position:relative; width:${rowWidth}px; min-height:56px;">`;

      for (const entry of employeeEntries) {
        const project = getProjectById(entry.project_id);
        if (!project) continue;

        const clipped = clipRange(new Date(entry.start_date), new Date(entry.end_date), range.start, range.end);
        const startIndex = diffDays(range.start, clipped.start);
        const spanDays = diffDays(clipped.start, clipped.end) + 1;

        const left = startIndex * 44 + 2;
        const width = Math.max(spanDays * 44 - 4, 40);

        html += `
          <div
            class="entry-bar ${CATEGORY_COLORS[project.category] || "bg-slate-500 border-slate-600 text-white"} ${ROLE_CLASSES[entry.role] || ""}"
            style="left:${left}px; width:${width}px;"
            data-entry-id="${escapeHtml(entry.id)}"
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

    html += `</div>`;
    els.calendarWrap.innerHTML = html;

    els.calendarWrap.querySelectorAll("[data-entry-id]").forEach(el => {
      el.addEventListener("click", () => openEditModal(el.dataset.entryId));
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

  function getFilteredEmployees() {
    return state.employees.filter(emp => {
      const matchesFilter = state.employeeFilter === "Alle ansatte" || emp.name === state.employeeFilter;
      const matchesSearch = !state.search || emp.name.toLowerCase().includes(state.search);
      return matchesFilter && matchesSearch && emp.active !== false;
    });
  }

  function getCurrentRange() {
    if (state.viewMode === "Uke") {
      const start = startOfWeek(state.startDate);
      const end = addDays(start, 6);
      return { start, end };
    }

    const start = new Date(state.startDate.getFullYear(), state.startDate.getMonth(), 1);
    const end = new Date(state.startDate.getFullYear(), state.startDate.getMonth() + 1, 0);
    return { start, end };
  }

  function shiftPeriod(direction) {
    if (state.viewMode === "Uke") {
      state.startDate = addDays(startOfWeek(state.startDate), direction * 7);
    } else {
      state.startDate = new Date(state.startDate.getFullYear(), state.startDate.getMonth() + direction, 1);
    }
    persistUiState();
  }

  function getProjectById(id) {
    return state.projects.find(p => p.id === id);
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

  function formatDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);

    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(d);
  }

  function toIsoDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
      .toISOString()
      .slice(0, 10);
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
    return new Intl.DateTimeFormat("no-NO", { weekday: "short" }).format(date);
  }

  function monthShort(date) {
    return new Intl.DateTimeFormat("no-NO", { month: "short" }).format(date);
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

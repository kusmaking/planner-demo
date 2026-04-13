
const supabase = window.supabase.createClient(
  "https://glyftmrkjherfrapbnjx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);


function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const state = {
  employees: load(STORAGE_KEYS.employees, DEFAULT_EMPLOYEES),
  projects: load(STORAGE_KEYS.projects, DEFAULT_PROJECTS),
  entries: load(STORAGE_KEYS.entries, DEFAULT_ENTRIES),
  auditLog: load(STORAGE_KEYS.auditLog, DEFAULT_AUDIT_LOG),
  notificationLog: load(STORAGE_KEYS.notificationLog, DEFAULT_NOTIFICATION_LOG),
  currentUser: "Olis Hansen",
  employeeFilter: "Alle ansatte",
  search: "",
  viewMode: load(STORAGE_KEYS.viewMode, "Uke"),
  startDate: new Date(load(STORAGE_KEYS.startDate, "2026-01-05T00:00:00")),
  selectedEntryId: null
};

function saveAll() {
  localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(state.employees));
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects));
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(state.entries));
  localStorage.setItem(STORAGE_KEYS.auditLog, JSON.stringify(state.auditLog));
  localStorage.setItem(STORAGE_KEYS.notificationLog, JSON.stringify(state.notificationLog));
  localStorage.setItem(STORAGE_KEYS.startDate, JSON.stringify(state.startDate.toISOString()));
  localStorage.setItem(STORAGE_KEYS.viewMode, JSON.stringify(state.viewMode));
}

function nowStamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addAudit(action) {
  state.auditLog.unshift({
    id: Date.now() + Math.random(),
    user: state.currentUser,
    action,
    timestamp: nowStamp()
  });
  saveAll();
}

function addNotification(employeeName, projectName) {
  state.notificationLog.unshift({
    id: Date.now() + 1,
    type: "SMS",
    recipient: employeeName,
    target: projectName,
    timestamp: nowStamp()
  });
  state.notificationLog.unshift({
    id: Date.now() + 2,
    type: "E-post",
    recipient: employeeName,
    target: projectName,
    timestamp: nowStamp()
  });
  saveAll();
}

function formatDate(date) {
  const d = new Date(date);
  const pad = n => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function isoDate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
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

function getNorwegianHolidays(year) {
  const easter = getEasterSunday(year);
  return [
    { date: new Date(year, 0, 1), label: "1. nyttårsdag" },
    { date: addDays(easter, -3), label: "Skjærtorsdag" },
    { date: addDays(easter, -2), label: "Langfredag" },
    { date: addDays(easter, 0), label: "1. påskedag" },
    { date: addDays(easter, 1), label: "2. påskedag" },
    { date: new Date(year, 4, 1), label: "Arbeidernes dag" },
    { date: new Date(year, 4, 14), label: "Kristi himmelfartsdag" },
    { date: new Date(year, 4, 17), label: "Grunnlovsdag" },
    { date: new Date(year, 4, 24), label: "1. pinsedag" },
    { date: addDays(easter, 50), label: "2. pinsedag" },
    { date: new Date(year, 11, 25), label: "1. juledag" },
    { date: new Date(year, 11, 26), label: "2. juledag" }
  ];
}

function getVisibleDays() {
  if (state.viewMode === "Uke") return Array.from({ length: 42 }, (_, i) => addDays(state.startDate, i));
  if (state.viewMode === "Måned") return Array.from({ length: 84 }, (_, i) => addDays(state.startDate, i));
  return Array.from({ length: 365 }, (_, i) => addDays(new Date(2026, 0, 1), i));
}

function overlaps(employee, start, end, ignoreId) {
  const s = new Date(start);
  const e = new Date(end);
  return state.entries.some(entry => {
    if (ignoreId && entry.id === ignoreId) return false;
    if (entry.employee !== employee) return false;
    const es = new Date(entry.start);
    const ee = new Date(entry.end);
    return s <= ee && e >= es;
  });
}

function showWarning(message) {
  const box = document.getElementById("warningBox");
  if (!message) {
    box.classList.add("hidden");
    box.textContent = "";
    return;
  }
  box.classList.remove("hidden");
  box.textContent = message;
}

function filteredEmployees() {
  return state.employees
    .filter(e => e.active)
    .filter(e => state.employeeFilter === "Alle ansatte" || e.name === state.employeeFilter)
    .filter(e => e.name.toLowerCase().includes(state.search.toLowerCase()));
}

function getProject(id) {
  return state.projects.find(p => p.id === id);
}

function renderStats() {
  const items = [
    ["Ansatte i visning", filteredEmployees().length],
    ["Prosjekter", state.projects.length],
    ["Tildelinger", state.entries.length],
    ["Loggede endringer", state.auditLog.length]
  ];
  document.getElementById("statsRow").innerHTML = items.map(([label, value]) => `
    <div class="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <p class="text-sm text-slate-500">${label}</p>
      <p class="text-2xl font-semibold mt-1">${value}</p>
    </div>
  `).join("");
}

function renderHolidayList() {
  const holidays = getNorwegianHolidays(2026);
  document.getElementById("holidayList").innerHTML = holidays.map(h => `
    <div class="flex items-center justify-between rounded-xl border p-2">
      <span>${h.label}</span>
      <span class="text-slate-500">${formatDate(h.date)}</span>
    </div>
  `).join("");
}

function renderLegend() {
  document.getElementById("legendList").innerHTML = Object.keys(CATEGORY_COLORS).map(key => `
    <div class="flex items-center gap-2">
      <span class="inline-block h-4 w-4 rounded-md border ${CATEGORY_COLORS[key]}"></span>
      <span>${key}</span>
    </div>
  `).join("");
}

function renderSelects() {
  const employeeOptions = ['<option>Alle ansatte</option>']
    .concat(state.employees.filter(e => e.active).map(e => `<option>${e.name}</option>`));
  document.getElementById("employeeFilter").innerHTML = employeeOptions.join("");
  document.getElementById("employeeFilter").value = state.employeeFilter;

  const employeeChoices = state.employees.filter(e => e.active).map(e => `<option>${e.name}</option>`).join("");
  document.getElementById("assignEmployee").innerHTML = `<option value="">Velg ansatt</option>${employeeChoices}`;
  document.getElementById("editEmployee").innerHTML = employeeChoices;

  const projectChoices = state.projects.map(p => `<option value="${p.id}">${p.name} • ${p.category}</option>`).join("");
  document.getElementById("assignProject").innerHTML = projectChoices;
  document.getElementById("editProject").innerHTML = projectChoices;

  document.getElementById("projectCategory").innerHTML = Object.keys(CATEGORY_COLORS).map(c => `<option>${c}</option>`).join("");
  document.getElementById("projectStatus").innerHTML = Object.keys(STATUS_COLORS).map(s => `<option>${s}</option>`).join("");
}

function renderEmployeeList() {
  document.getElementById("employeeList").innerHTML = state.employees.map(employee => `
    <div class="rounded-2xl border p-3 text-sm space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div>
          <p class="font-medium">${employee.name}</p>
          <p class="text-xs text-slate-500">${employee.email} • ${employee.phone}</p>
        </div>
        <button data-toggle-employee="${employee.name}" class="rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm">
          ${employee.active ? "Deaktiver" : "Aktiver"}
        </button>
      </div>
    </div>
  `).join("");
}

function renderKanban() {
  const columns = ["Planlagt", "Pågår", "Avventer", "Fullført"];
  document.getElementById("kanbanBoard").innerHTML = columns.map(col => `
    <div class="rounded-2xl bg-slate-50 p-3 space-y-3 min-h-[120px]">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-sm">${col}</h3>
        <span class="rounded-xl border border-slate-300 px-2 py-1 text-xs">${state.projects.filter(p => p.status === col).length}</span>
      </div>
      ${state.projects.filter(p => p.status === col).map(project => `
        <div class="rounded-2xl border bg-white p-3 shadow-sm space-y-2">
          <div class="flex items-start justify-between gap-2">
            <p class="font-medium text-sm leading-snug">${project.name}</p>
            <span class="text-[10px] px-2 py-1 rounded-full border ${STATUS_COLORS[project.status]}">${project.status}</span>
          </div>
          <div><span class="rounded-xl px-2 py-1 text-xs ${CATEGORY_COLORS[project.category]}">${project.category}</span></div>
          <p class="text-xs text-slate-600">${project.notes || "Ingen notat"}</p>
        </div>
      `).join("")}
    </div>
  `).join("");
}

function renderNotifications() {
  document.getElementById("notificationList").innerHTML = state.notificationLog.map(item => `
    <div class="rounded-2xl border p-3 text-sm">
      <p class="font-medium">${item.type} til ${item.recipient}</p>
      <p class="text-slate-700">Prosjekt: ${item.target}</p>
      <p class="text-xs text-slate-500 mt-1">${item.timestamp}</p>
    </div>
  `).join("");
}

function renderAudit() {
  document.getElementById("auditList").innerHTML = state.auditLog.map(log => `
    <div class="rounded-2xl border p-3 text-sm">
      <p class="font-medium">${log.user}</p>
      <p class="text-slate-700">${log.action}</p>
      <p class="text-xs text-slate-500 mt-1">${log.timestamp}</p>
    </div>
  `).join("");
}

function renderCalendar() {
  const holidays = new Map(getNorwegianHolidays(2026).map(h => [isoDate(h.date), h.label]));
  const days = getVisibleDays();
  const employees = filteredEmployees();
  const dayWidth = 40;

  const header = days.map(day => {
    const key = isoDate(day);
    const weekend = isWeekend(day);
    const holiday = holidays.get(key);
    const cls = holiday ? "bg-red-100 text-red-700" : weekend ? "bg-red-50 text-rose-700" : "bg-slate-50 text-slate-600";
    return `<div class="border-b p-1 text-center text-[10px] ${cls}" title="${holiday || ""}">
      <div class="font-semibold">U${getISOWeek(day)}</div>
      <div>${formatDate(day).slice(0,5)}</div>
      <div>${day.toLocaleDateString("nb-NO", { weekday: "short" })}</div>
    </div>`;
  }).join("");

  const rows = employees.map(employee => {
    const cells = days.map(day => {
      const key = isoDate(day);
      const weekend = isWeekend(day);
      const holiday = holidays.get(key);
      const cellBg = holiday ? "bg-red-100" : weekend ? "bg-red-50" : "bg-white";
      return `<div class="border-r border-b min-h-[56px] ${cellBg}"></div>`;
    }).join("");

    const employeeEntries = state.entries
      .filter(entry => entry.employee === employee.name)
      .map(entry => ({ entry, project: getProject(entry.projectId) }))
      .filter(item => item.project)
      .filter(item => new Date(item.entry.end) >= days[0] && new Date(item.entry.start) <= days[days.length - 1]);

    const blocks = employeeEntries.map(({ entry, project }) => {
      const startIdx = Math.max(0, Math.floor((new Date(entry.start) - days[0]) / 86400000));
      const endIdx = Math.min(days.length - 1, Math.floor((new Date(entry.end) - days[0]) / 86400000));
      const span = Math.max(1, endIdx - startIdx + 1);
      const left = startIdx * dayWidth + 2;
      const width = Math.max(36, span * dayWidth - 4);
      const title = `${project.name} (${project.category})\nAnsatt: ${entry.employee}\nRolle: ${entry.role || "Ikke satt"}\nPeriode: ${formatDate(entry.start)} - ${formatDate(entry.end)}${entry.notes ? "\nNotat: " + entry.notes : ""}`;
      return `
        <button
          data-entry-id="${entry.id}"
          title="${title.replace(/"/g, "&quot;")}"
          class="absolute top-1 h-[48px] ${ROLE_CLASSES[entry.role] || ""} rounded-xl border px-2 py-1 text-[10px] leading-tight overflow-hidden text-left ${CATEGORY_COLORS[project.category]}"
          style="left:${left}px;width:${width}px;"
        >
          <div class="font-semibold truncate">${project.name}</div>
          <div class="truncate opacity-90">${entry.role || project.category}</div>
        </button>`;
    }).join("");

    return `
      <div class="sticky left-0 z-20 bg-white border-r border-b border-slate-200 p-3 text-sm font-medium min-h-[56px] flex items-center">${employee.name}</div>
      <div class="relative border-b border-slate-200" style="grid-column: span ${days.length} / span ${days.length}; min-height: 56px;">
        <div class="grid" style="grid-template-columns: repeat(${days.length}, minmax(${dayWidth}px, 1fr));">
          ${cells}
        </div>
        ${blocks}
      </div>
    `;
  }).join("");

  document.getElementById("calendarWrap").innerHTML = `
    <div class="min-w-[2200px]">
      <div class="grid" style="grid-template-columns: 260px repeat(${days.length}, minmax(${dayWidth}px, 1fr));">
        <div class="sticky left-0 z-30 bg-white border-r border-b border-slate-200 p-3 font-semibold">Ansatt</div>
        ${header}
        ${rows}
      </div>
    </div>
  `;

  document.querySelectorAll("[data-entry-id]").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(Number(btn.dataset.entryId)));
  });
}

function openEditModal(entryId) {
  state.selectedEntryId = entryId;
  const entry = state.entries.find(e => e.id === entryId);
  if (!entry) return;
  document.getElementById("editProject").value = String(entry.projectId);
  document.getElementById("editEmployee").value = entry.employee;
  document.getElementById("editRole").value = entry.role || "Supervisor";
  document.getElementById("editStart").value = entry.start;
  document.getElementById("editEnd").value = entry.end;
  document.getElementById("editNotes").value = entry.notes || "";
  document.getElementById("editModal").classList.remove("hidden");
  document.getElementById("editModal").classList.add("flex");
}

function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
  document.getElementById("editModal").classList.remove("flex");
  state.selectedEntryId = null;
}

function createProject() {
  const name = document.getElementById("projectName").value.trim();
  const category = document.getElementById("projectCategory").value;
  const status = document.getElementById("projectStatus").value;
  const notes = document.getElementById("projectNotes").value.trim();
  if (!name) return;
  state.projects.unshift({ id: Date.now(), name, category, status, notes });
  addAudit(`Opprettet prosjekt ${name} i kategori ${category}`);
  document.getElementById("projectName").value = "";
  document.getElementById("projectNotes").value = "";
  renderAll();
}

function assignProject() {
  showWarning("");
  const projectId = Number(document.getElementById("assignProject").value);
  const employee = document.getElementById("assignEmployee").value;
  const role = document.getElementById("assignRole").value;
  const start = document.getElementById("assignStart").value;
  const end = document.getElementById("assignEnd").value;
  const notes = document.getElementById("assignNotes").value.trim();

  if (!projectId || !employee || !start || !end) return;
  if (end < start) {
    showWarning("Sluttdato kan ikke være før startdato.");
    return;
  }
  if (overlaps(employee, start, end)) {
    showWarning(`Overlapp oppdaget for ${employee}. Personen er allerede planlagt i samme periode.`);
    return;
  }

  const projectName = getProject(projectId)?.name || "prosjekt";
  state.entries.unshift({
    id: Date.now(),
    projectId,
    employee,
    role,
    start,
    end,
    notes
  });

  addAudit(`Tildelte ${projectName} til ${employee} fra ${start} til ${end}`);
  addNotification(employee, projectName);
  document.getElementById("assignNotes").value = "";
  renderAll();
}

function addEmployeeSingle() {
  const name = document.getElementById("employeeName").value.trim();
  const email = document.getElementById("employeeEmail").value.trim();
  const phone = document.getElementById("employeePhone").value.trim();
  if (!name) return;
  state.employees.unshift({ name, email, phone, active: true });
  addAudit(`La til ansatt ${name}`);
  document.getElementById("employeeName").value = "";
  document.getElementById("employeeEmail").value = "";
  document.getElementById("employeePhone").value = "";
  renderAll();
}

function bulkAddEmployees() {
  const text = document.getElementById("bulkEmployees").value.trim();
  if (!text) return;
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  lines.forEach(name => {
    state.employees.unshift({
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@firma.no`,
      phone: `+47 9${Math.floor(1000000 + Math.random() * 9000000)}`,
      active: true
    });
  });
  addAudit(`La til ${lines.length} ansatte via bulk import`);
  document.getElementById("bulkEmployees").value = "";
  renderAll();
}

function toggleEmployee(name) {
  const employee = state.employees.find(e => e.name === name);
  if (!employee) return;
  employee.active = !employee.active;
  addAudit(`Endret ansattstatus for ${name}`);
  renderAll();
}

function saveEdit() {
  const entry = state.entries.find(e => e.id === state.selectedEntryId);
  if (!entry) return;

  const projectId = Number(document.getElementById("editProject").value);
  const employee = document.getElementById("editEmployee").value;
  const role = document.getElementById("editRole").value;
  const start = document.getElementById("editStart").value;
  const end = document.getElementById("editEnd").value;
  const notes = document.getElementById("editNotes").value.trim();

  if (end < start) {
    showWarning("Sluttdato kan ikke være før startdato.");
    return;
  }
  if (overlaps(employee, start, end, entry.id)) {
    showWarning(`Overlapp oppdaget for ${employee}.`);
    return;
  }

  entry.projectId = projectId;
  entry.employee = employee;
  entry.role = role;
  entry.start = start;
  entry.end = end;
  entry.notes = notes;

  const projectName = getProject(projectId)?.name || "prosjekt";
  addAudit(`Redigerte tildeling ${projectName} for ${employee}`);
  addNotification(employee, projectName);
  closeEditModal();
  showWarning("");
  renderAll();
}

function deleteEdit() {
  const entry = state.entries.find(e => e.id === state.selectedEntryId);
  if (!entry) return;
  const projectName = getProject(entry.projectId)?.name || "prosjekt";
  state.entries = state.entries.filter(e => e.id !== entry.id);
  addAudit(`Fjernet tildeling ${projectName} fra ${entry.employee}`);
  closeEditModal();
  renderAll();
}

function resetDemo() {
  if (!confirm("Vil du nullstille alle lagrede demoendringer i denne nettleseren?")) return;
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  location.reload();
}

function bindEvents() {
  document.getElementById("searchInput").addEventListener("input", e => {
    state.search = e.target.value;
    renderAll();
  });

  document.getElementById("employeeFilter").addEventListener("change", e => {
    state.employeeFilter = e.target.value;
    renderAll();
  });

  document.getElementById("viewMode").addEventListener("change", e => {
    state.viewMode = e.target.value;
    renderAll();
  });

  document.getElementById("prevBtn").addEventListener("click", () => {
    const step = state.viewMode === "År" ? -365 : state.viewMode === "Måned" ? -28 : -7;
    state.startDate = addDays(state.startDate, step);
    renderAll();
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    const step = state.viewMode === "År" ? 365 : state.viewMode === "Måned" ? 28 : 7;
    state.startDate = addDays(state.startDate, step);
    renderAll();
  });

  document.getElementById("resetBtn").addEventListener("click", resetDemo);
  document.getElementById("createProjectBtn").addEventListener("click", createProject);
  document.getElementById("assignBtn").addEventListener("click", assignProject);
  document.getElementById("addEmployeeBtn").addEventListener("click", addEmployeeSingle);
  document.getElementById("bulkAddBtn").addEventListener("click", bulkAddEmployees);

  document.getElementById("employeeList").addEventListener("click", e => {
    const btn = e.target.closest("[data-toggle-employee]");
    if (!btn) return;
    toggleEmployee(btn.dataset.toggleEmployee);
  });

  document.getElementById("closeModalBtn").addEventListener("click", closeEditModal);
  document.getElementById("saveEditBtn").addEventListener("click", saveEdit);
  document.getElementById("deleteEditBtn").addEventListener("click", deleteEdit);

  document.getElementById("assignStart").value = "2026-01-12";
  document.getElementById("assignEnd").value = "2026-01-23";
}

function renderAll() {
  renderStats();
  renderHolidayList();
  renderLegend();
  renderSelects();
  renderEmployeeList();
  renderKanban();
  renderNotifications();
  renderAudit();
  renderCalendar();
  saveAll();
}

bindEvents();
renderAll();

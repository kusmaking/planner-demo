console.log("[APP] Started");

const CATEGORY_COLORS = {
  Project: "bg-green-500 border-green-600 text-white",
  Travel: "bg-cyan-500 border-cyan-600 text-white",
  Onshore: "bg-indigo-500 border-indigo-600 text-white",
  Kurs: "bg-violet-500 border-violet-600 text-white",
  Ferie: "bg-orange-400 border-orange-500 text-slate-900",
  Syk: "bg-red-600 border-red-600 text-white",
  Avspasering: "bg-amber-700 border-amber-800 text-white"
};

const STORAGE_KEYS = {
  employees: "planner_full_demo_employees_v1",
  entries: "planner_full_demo_entries_v1",
  startDate: "planner_full_demo_start_v1",
  viewMode: "planner_full_demo_view_v1"
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function inferCategory(projectName) {
  const p = (projectName || "").toLowerCase();
  if (p.includes("travel")) return "Travel";
  if (p.includes("onshore")) return "Onshore";
  if (p.includes("kurs") || p.includes("training")) return "Kurs";
  if (p.includes("ferie")) return "Ferie";
  if (p.includes("syk")) return "Syk";
  if (p.includes("avsp")) return "Avspasering";
  return "Project";
}

const defaultEmployees = DATA.employees.map(e => ({
  ...e,
  active: e.active ?? true,
  email: e.email ?? "",
  phone: e.phone ?? ""
}));

const defaultEntries = DATA.entries.map((e, idx) => ({
  id: idx + 1,
  employee: e.employee,
  project: e.project,
  start: e.start,
  end: e.end,
  category: e.category ?? inferCategory(e.project),
  role: e.role ?? "Supervisor",
  notes: e.notes ?? ""
}));

const state = {
  employees: load(STORAGE_KEYS.employees, defaultEmployees),
  entries: load(STORAGE_KEYS.entries, defaultEntries),
  startDate: new Date(load(STORAGE_KEYS.startDate, "2026-01-01T00:00:00")),
  viewMode: load(STORAGE_KEYS.viewMode, "Måned"),
  search: ""
};

function saveAll() {
  save(STORAGE_KEYS.employees, state.employees);
  save(STORAGE_KEYS.entries, state.entries);
  save(STORAGE_KEYS.startDate, state.startDate.toISOString());
  save(STORAGE_KEYS.viewMode, state.viewMode);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function format(date) {
  return date.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

function formatLong(date) {
  return new Date(date).toLocaleDateString("nb-NO");
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

function getVisibleDays() {
  if (state.viewMode === "Uke") return Array.from({ length: 7 }, (_, i) => addDays(state.startDate, i));
  if (state.viewMode === "Måned") return Array.from({ length: 35 }, (_, i) => addDays(state.startDate, i));
  return Array.from({ length: 90 }, (_, i) => addDays(state.startDate, i));
}

function filteredEmployees() {
  return state.employees.filter(e =>
    (e.active ?? true) &&
    e.name.toLowerCase().includes(state.search.toLowerCase())
  );
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
    { date: new Date(year, 4, 17), label: "Grunnlovsdag" },
    { date: new Date(year, 11, 25), label: "1. juledag" },
    { date: new Date(year, 11, 26), label: "2. juledag" }
  ];
}

function showWarning(message) {
  const box = document.getElementById("warningBox");
  if (!box) return;
  if (!message) {
    box.classList.add("hidden");
    box.textContent = "";
    return;
  }
  box.classList.remove("hidden");
  box.textContent = message;
}

function renderStats() {
  const stats = [
    ["Ansatte", filteredEmployees().length],
    ["Tildelinger", state.entries.length],
    ["Prosjekter", new Set(state.entries.map(e => e.project)).size],
    ["Visning", state.viewMode]
  ];

  document.getElementById("statsRow").innerHTML = stats.map(([label, value]) => `
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
      <span class="text-slate-500">${formatLong(h.date)}</span>
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

function renderEmployeeFilter() {
  const select = document.getElementById("employeeFilter");
  select.innerHTML = `<option>Alle ansatte</option>` + state.employees
    .filter(e => e.active ?? true)
    .map(e => `<option>${e.name}</option>`)
    .join("");
}

function renderEmployees() {
  document.getElementById("employeeList").innerHTML = filteredEmployees().map(emp => `
    <div class="rounded-xl border p-3 text-sm">
      <div class="font-medium">${emp.name}</div>
      <div class="text-slate-500 text-xs">${emp.email || ""} ${emp.phone ? "• " + emp.phone : ""}</div>
    </div>
  `).join("");
}

function renderKanban() {
  const groups = ["Project", "Onshore", "Travel", "Kurs", "Ferie", "Syk", "Avspasering"];
  const projectMap = new Map();

  state.entries.forEach(entry => {
    const category = entry.category || inferCategory(entry.project);
    const key = `${entry.project}__${category}`;
    if (!projectMap.has(key)) {
      projectMap.set(key, { project: entry.project, category, people: [] });
    }
    projectMap.get(key).people.push(entry.employee);
  });

  document.getElementById("kanbanBoard").innerHTML = groups.map(group => {
    const items = [...projectMap.values()].filter(p => p.category === group);
    return `
      <div class="rounded-2xl bg-slate-50 p-3 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-sm">${group}</h3>
          <span class="rounded-xl border border-slate-300 px-2 py-1 text-xs">${items.length}</span>
        </div>
        ${items.length ? items.map(item => `
          <div class="rounded-2xl border bg-white p-3 shadow-sm">
            <div class="font-medium text-sm">${item.project}</div>
            <div class="text-xs text-slate-500 mt-1">${item.people.join(", ")}</div>
          </div>
        `).join("") : `<div class="text-xs text-slate-400">Ingen</div>`}
      </div>
    `;
  }).join("");
}

function renderProjectAndEmployeeSelectors() {
  const uniqueProjects = [...new Set(state.entries.map(e => e.project))];
  const assignProject = document.getElementById("assignProject");
  const editProject = document.getElementById("editProject");
  const assignEmployee = document.getElementById("assignEmployee");
  const editEmployee = document.getElementById("editEmployee");
  const projectCategory = document.getElementById("projectCategory");

  assignProject.innerHTML = uniqueProjects.map(p => `<option>${p}</option>`).join("");
  editProject.innerHTML = uniqueProjects.map(p => `<option>${p}</option>`).join("");
  assignEmployee.innerHTML = state.employees.map(e => `<option>${e.name}</option>`).join("");
  editEmployee.innerHTML = state.employees.map(e => `<option>${e.name}</option>`).join("");
  projectCategory.innerHTML = Object.keys(CATEGORY_COLORS).map(c => `<option>${c}</option>`).join("");
}

function renderCalendar() {
  const container = document.getElementById("calendarWrap");
  showWarning("");

  const days = getVisibleDays();
  const employees = filteredEmployees();
  const dayWidth = 42;

  const header = days.map(d => `
    <div class="text-xs text-center border-b p-1 ${isWeekend(d) ? "bg-red-50 text-rose-700" : "bg-slate-50 text-slate-600"}">
      <div class="font-semibold">U${getISOWeek(d)}</div>
      <div>${format(d)}</div>
    </div>
  `).join("");

  const rows = employees.map(emp => {
    const cells = days.map(() => `<div class="border-r border-b h-12 bg-white"></div>`).join("");

    const blocks = state.entries
      .filter(e => e.employee === emp.name)
      .map(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);

        const startIdx = Math.max(0, Math.floor((start - days[0]) / 86400000));
        const endIdx = Math.min(days.length - 1, Math.floor((end - days[0]) / 86400000));
        if (endIdx < 0 || startIdx > days.length - 1) return "";

        const width = Math.max(38, (endIdx - startIdx + 1) * dayWidth - 4);
        const category = e.category || inferCategory(e.project);
        const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Project;

        return `
          <button
            data-entry-id="${e.id}"
            title="${e.project}\nAnsatt: ${e.employee}\nPeriode: ${formatLong(e.start)} - ${formatLong(e.end)}\nRolle: ${e.role || "Supervisor"}"
            class="absolute top-1 h-10 rounded-xl border px-2 py-1 text-left text-[10px] overflow-hidden ${color}"
            style="left:${startIdx * dayWidth + 2}px;width:${width}px;"
          >
            <div class="font-semibold truncate">${e.project}</div>
            <div class="truncate opacity-90">${e.role || "Supervisor"}</div>
          </button>
        `;
      }).join("");

    return `
      <div class="sticky left-0 z-20 bg-white border-r border-b p-3 text-sm font-medium h-12 flex items-center">
        ${emp.name}
      </div>
      <div class="relative" style="grid-column: span ${days.length} / span ${days.length}; min-height:48px;">
        <div class="grid" style="grid-template-columns: repeat(${days.length}, ${dayWidth}px)">
          ${cells}
        </div>
        ${blocks}
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="min-w-[2200px]">
      <div class="grid" style="grid-template-columns: 260px repeat(${days.length}, ${dayWidth}px);">
        <div class="sticky left-0 z-30 bg-white border-r border-b p-3 font-semibold">Ansatt</div>
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
  const entry = state.entries.find(e => e.id === entryId);
  if (!entry) return;

  const nextProject = prompt("Prosjekt:", entry.project);
  if (nextProject === null) return;

  const nextStart = prompt("Startdato (YYYY-MM-DD):", entry.start);
  if (nextStart === null) return;

  const nextEnd = prompt("Sluttdato (YYYY-MM-DD):", entry.end);
  if (nextEnd === null) return;

  if (nextEnd < nextStart) {
    showWarning("Sluttdato kan ikke være før startdato.");
    return;
  }

  entry.project = nextProject;
  entry.start = nextStart;
  entry.end = nextEnd;
  entry.category = inferCategory(nextProject);

  saveAll();
  renderAll();
}

function createProject() {
  const name = document.getElementById("projectName").value.trim();
  if (!name) return;
  state.entries.push({
    id: Date.now(),
    employee: state.employees[0]?.name || "Olis Hansen",
    project: name,
    start: "2026-01-01",
    end: "2026-01-03",
    category: inferCategory(name),
    role: "Supervisor",
    notes: document.getElementById("projectNotes").value.trim()
  });
  saveAll();
  renderAll();
}

function assignProject() {
  const project = document.getElementById("assignProject").value;
  const employee = document.getElementById("assignEmployee").value;
  const start = document.getElementById("assignStart").value;
  const end = document.getElementById("assignEnd").value;
  const role = document.getElementById("assignRole").value;
  const notes = document.getElementById("assignNotes").value.trim();

  if (!project || !employee || !start || !end) return;

  state.entries.push({
    id: Date.now(),
    employee,
    project,
    start,
    end,
    category: inferCategory(project),
    role,
    notes
  });

  saveAll();
  renderAll();
}

function resetDemo() {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  location.reload();
}

function bindEvents() {
  document.getElementById("searchInput").value = state.search;
  document.getElementById("viewMode").value = state.viewMode;

  document.getElementById("searchInput").addEventListener("input", e => {
    state.search = e.target.value;
    renderAll();
  });

  document.getElementById("viewMode").addEventListener("change", e => {
    state.viewMode = e.target.value;
    saveAll();
    renderAll();
  });

  document.getElementById("prevBtn").addEventListener("click", () => {
    const step = state.viewMode === "Uke" ? -7 : state.viewMode === "Måned" ? -35 : -90;
    state.startDate = addDays(state.startDate, step);
    saveAll();
    renderAll();
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    const step = state.viewMode === "Uke" ? 7 : state.viewMode === "Måned" ? 35 : 90;
    state.startDate = addDays(state.startDate, step);
    saveAll();
    renderAll();
  });

  document.getElementById("resetBtn").addEventListener("click", resetDemo);
  document.getElementById("createProjectBtn").addEventListener("click", createProject);
  document.getElementById("assignBtn").addEventListener("click", assignProject);
}

function renderAll() {
  renderStats();
  renderHolidayList();
  renderLegend();
  renderEmployeeFilter();
  renderEmployees();
  renderKanban();
  renderProjectAndEmployeeSelectors();
  renderCalendar();
  bindEvents();
}

renderAll();
console.log("[APP] Done");

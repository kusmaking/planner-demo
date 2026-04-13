console.log("[APP] Started");

const STORAGE_KEYS = {
  employees: "planner_simple_employees_v1",
  entries: "planner_simple_entries_v1",
  startDate: "planner_simple_startDate_v1",
  viewMode: "planner_simple_viewMode_v1",
  panelVisible: "planner_simple_panelVisible_v1"
};

const CATEGORY_COLORS = {
  Project: "bg-green-500 border-green-600 text-white",
  Travel: "bg-cyan-500 border-cyan-600 text-white",
  Onshore: "bg-indigo-500 border-indigo-600 text-white",
  Kurs: "bg-violet-500 border-violet-600 text-white",
  Ferie: "bg-orange-400 border-orange-500 text-slate-900",
  Syk: "bg-red-600 border-red-600 text-white",
  Avspasering: "bg-amber-700 border-amber-800 text-white"
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error("[LOAD ERROR]", key, err);
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
  panelVisible: load(STORAGE_KEYS.panelVisible, true),
  search: "",
  selectedEntryId: null
};

function saveAll() {
  save(STORAGE_KEYS.employees, state.employees);
  save(STORAGE_KEYS.entries, state.entries);
  save(STORAGE_KEYS.startDate, state.startDate.toISOString());
  save(STORAGE_KEYS.viewMode, state.viewMode);
  save(STORAGE_KEYS.panelVisible, state.panelVisible);
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
  return date.toLocaleDateString("nb-NO");
}

function isoDate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
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

function overlapExists(employee, start, end, ignoreId = null) {
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

function buildShell() {
  const root = document.getElementById("calendarWrap");
  if (!root) {
    console.error("[ERROR] calendarWrap not found");
    return false;
  }

  root.innerHTML = `
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" id="statsRow"></div>

      <div class="flex gap-4 items-start">
        <div class="flex-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div class="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div class="flex flex-wrap gap-2 items-center">
              <input id="searchInputInner" class="w-[220px] rounded-2xl border border-slate-300 px-3 py-2" placeholder="Søk ansatt" />
              <select id="viewModeInner" class="rounded-2xl border border-slate-300 px-3 py-2">
                <option value="Uke">Uke</option>
                <option value="Måned">Måned</option>
                <option value="År">År</option>
              </select>
            </div>
            <div class="flex gap-2">
              <button id="prevBtnInner" class="rounded-2xl border border-slate-300 bg-white px-4 py-2">Tilbake</button>
              <button id="nextBtnInner" class="rounded-2xl border border-slate-300 bg-white px-4 py-2">Frem</button>
              <button id="togglePanelBtn" class="rounded-2xl border border-slate-300 bg-white px-4 py-2"></button>
            </div>
          </div>
          <div class="p-4 border-b border-slate-200 text-sm text-slate-500">
            Kalenderen har hovedfokus. Høyrepanelet kan skjules og vises.
          </div>
          <div id="warningBox" class="hidden mx-4 mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700 text-sm"></div>
          <div id="calendarCanvas" class="overflow-auto p-4"></div>
        </div>

        <div id="sidePanel" class="w-[380px] space-y-4">
          <div class="rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div class="p-4 border-b border-slate-200"><h2 class="font-semibold">Kanban – prosjekter</h2></div>
            <div id="kanbanBoard" class="p-4 grid gap-4"></div>
          </div>

          <div class="rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div class="p-4 border-b border-slate-200"><h2 class="font-semibold">Ansatte</h2></div>
            <div id="employeeList" class="p-4 space-y-2 max-h-[260px] overflow-auto"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  return true;
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
    const key = `${entry.project}__${entry.category || inferCategory(entry.project)}`;
    if (!projectMap.has(key)) {
      projectMap.set(key, {
        project: entry.project,
        category: entry.category || inferCategory(entry.project),
        people: []
      });
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

function renderCalendar() {
  const container = document.getElementById("calendarCanvas");
  const warning = document.getElementById("warningBox");
  if (warning) {
    warning.classList.add("hidden");
    warning.textContent = "";
  }

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
    const warning = document.getElementById("warningBox");
    warning.textContent = "Sluttdato kan ikke være før startdato.";
    warning.classList.remove("hidden");
    return;
  }

  if (overlapExists(entry.employee, nextStart, nextEnd, entry.id)) {
    const warning = document.getElementById("warningBox");
    warning.textContent = `Overlapp oppdaget for ${entry.employee}.`;
    warning.classList.remove("hidden");
    return;
  }

  entry.project = nextProject;
  entry.start = nextStart;
  entry.end = nextEnd;
  entry.category = inferCategory(nextProject);

  saveAll();
  renderAll();
}

function renderPanelState() {
  const panel = document.getElementById("sidePanel");
  const btn = document.getElementById("togglePanelBtn");
  if (!panel || !btn) return;

  panel.style.display = state.panelVisible ? "block" : "none";
  btn.textContent = state.panelVisible ? "Skjul sidepanel" : "Vis sidepanel";
}

function bindEvents() {
  document.getElementById("searchInputInner").value = state.search;
  document.getElementById("viewModeInner").value = state.viewMode;

  document.getElementById("searchInputInner").addEventListener("input", e => {
    state.search = e.target.value;
    renderAll();
  });

  document.getElementById("viewModeInner").addEventListener("change", e => {
    state.viewMode = e.target.value;
    saveAll();
    renderAll();
  });

  document.getElementById("prevBtnInner").addEventListener("click", () => {
    const step = state.viewMode === "Uke" ? -7 : state.viewMode === "Måned" ? -35 : -90;
    state.startDate = addDays(state.startDate, step);
    saveAll();
    renderAll();
  });

  document.getElementById("nextBtnInner").addEventListener("click", () => {
    const step = state.viewMode === "Uke" ? 7 : state.viewMode === "Måned" ? 35 : 90;
    state.startDate = addDays(state.startDate, step);
    saveAll();
    renderAll();
  });

  document.getElementById("togglePanelBtn").addEventListener("click", () => {
    state.panelVisible = !state.panelVisible;
    saveAll();
    renderPanelState();
  });

  document.getElementById("resetBtnInner")?.addEventListener("click", () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    location.reload();
  });
}

function renderAll() {
  if (!buildShell()) return;
  renderStats();
  renderEmployees();
  renderKanban();
  renderCalendar();
  renderPanelState();
  bindEvents();
}

renderAll();
console.log("[APP] Done");

const STORAGE_KEYS = {
  employees: "planner_demo_employees_v1",
  projects: "planner_demo_projects_v1",
  entries: "planner_demo_entries_v1",
  auditLog: "planner_demo_audit_v1",
  notificationLog: "planner_demo_notification_v1",
  startDate: "planner_demo_start_v1",
  viewMode: "planner_demo_view_v1"
};

const CATEGORY_COLORS = {
  Project: "bg-green-500 border-green-600 text-white",
  Travel: "bg-cyan-500 border-cyan-600 text-white",
  Onshore: "bg-indigo-500 border-indigo-600 text-white",
  Trainee: "bg-sky-500 border-sky-600 text-white",
  Kurs: "bg-violet-500 border-violet-600 text-white",
  Ferie: "bg-orange-400 border-orange-500 text-slate-900",
  Syk: "bg-red-600 border-red-600 text-white",
  Avspasering: "bg-amber-700 border-amber-800 text-white"
};

const STATUS_COLORS = {
  Planlagt: "bg-blue-100 text-blue-800 border-blue-200",
  "Pågår": "bg-green-100 text-green-800 border-green-200",
  Avventer: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Fullført": "bg-slate-200 text-slate-700 border-slate-300"
};

const ROLE_CLASSES = {
  "Supervisor": "ring-2 ring-yellow-400",
  "Mekaniker 1": "ring-2 ring-blue-400",
  "Mekaniker 2": "ring-2 ring-green-400",
  "Mekaniker 3": "ring-2 ring-purple-400"
};

const DEFAULT_EMPLOYEES = [
  { name: "Olis Hansen", email: "olis@firma.no", phone: "+47 90000001", active: true },
  { name: "Kenneth Vallestad", email: "kenneth@firma.no", phone: "+47 90000002", active: true },
  { name: "Paul Chilver", email: "paul@firma.no", phone: "+47 90000003", active: true },
  { name: "Aliaksandr Skliarenka", email: "aliaksandr@firma.no", phone: "+47 90000004", active: true },
  { name: "Stian Egelandsdal", email: "stian@firma.no", phone: "+47 90000005", active: true },
  { name: "Sean Sarkic", email: "sean@firma.no", phone: "+47 90000006", active: true },
  { name: "Henrik Ueland", email: "henrik@firma.no", phone: "+47 90000007", active: true },
  { name: "Erlend Skryten Johnsen", email: "erlend@firma.no", phone: "+47 90000008", active: true },
  { name: "Fredrik Johansen", email: "fredrik@firma.no", phone: "+47 90000009", active: true },
  { name: "Tor-Marius Sande", email: "tormarius@firma.no", phone: "+47 90000010", active: true },
  { name: "Bjørn Heidar Asmundsson", email: "bjorn.heidar@firma.no", phone: "+47 90000011", active: true },
  { name: "Erling Sekse Bilstad", email: "erling@firma.no", phone: "+47 90000012", active: true },
  { name: "Bjørn Erik Hansen", email: "bjorn.erik@firma.no", phone: "+47 90000013", active: true },
  { name: "Suzanne Sola Hestvik", email: "suzanne@firma.no", phone: "+47 90000014", active: true },
  { name: "Steinar Engtrø", email: "steinar@firma.no", phone: "+47 90000015", active: true },
  { name: "Joar Bergsholm", email: "joar@firma.no", phone: "+47 90000016", active: true },
  { name: "Joachim Fosse", email: "joachim@firma.no", phone: "+47 90000017", active: true },
  { name: "Karl Fredrik Tofte", email: "karl@firma.no", phone: "+47 90000018", active: true },
  { name: "Emil Skaue Nielse", email: "emil@firma.no", phone: "+47 90000019", active: true },
  { name: "Håkon Lea", email: "haakon@firma.no", phone: "+47 90000020", active: true },
  { name: "Bjørnar Rugland - verksted", email: "bjornar.rugland@firma.no", phone: "+47 90000021", active: true },
  { name: "Ihor Kaluhin - verksted", email: "ihor@firma.no", phone: "+47 90000022", active: true },
  { name: "Ivan Vrcic - Lager", email: "ivan@firma.no", phone: "+47 90000023", active: true },
  { name: "Andreas Lende", email: "andreas.lende@firma.no", phone: "+47 90000024", active: true },
  { name: "Aironas Larsen", email: "aironas@firma.no", phone: "+47 90000025", active: true }
];

const DEFAULT_PROJECTS = [
  { id: 1, name: "PBF California", category: "Project", status: "Pågår", notes: "Fra eksisterende plan" },
  { id: 2, name: "IZO-30220 Tyrkia", category: "Project", status: "Pågår", notes: "Fra eksisterende plan" },
  { id: 3, name: "Shell Bukom", category: "Project", status: "Pågår", notes: "Fra eksisterende plan" },
  { id: 4, name: "Kurs Kårstø", category: "Kurs", status: "Planlagt", notes: "Fra eksisterende plan" },
  { id: 5, name: "Ferie", category: "Ferie", status: "Planlagt", notes: "Fravær" },
  { id: 6, name: "Training", category: "Kurs", status: "Planlagt", notes: "Opplæring" },
  { id: 7, name: "Onshore", category: "Onshore", status: "Planlagt", notes: "Fast kapasitet" },
  { id: 8, name: "Travel", category: "Travel", status: "Planlagt", notes: "Reiseblokk" },
  { id: 9, name: "Åsgard A 18CL900", category: "Project", status: "Planlagt", notes: "Planlagt oppdrag" }
];

const DEFAULT_ENTRIES = [
  { id: 1, projectId: 8, employee: "Paul Chilver", role: "Supervisor", start: "2026-01-01", end: "2026-01-07", notes: "Travel" },
  { id: 2, projectId: 6, employee: "Aliaksandr Skliarenka", role: "Mekaniker 1", start: "2026-01-08", end: "2026-01-09", notes: "Training" },
  { id: 3, projectId: 1, employee: "Aliaksandr Skliarenka", role: "Mekaniker 1", start: "2026-01-12", end: "2026-01-23", notes: "PBF California" },
  { id: 4, projectId: 8, employee: "Sean Sarkic", role: "Supervisor", start: "2026-01-01", end: "2026-01-07", notes: "Travel" },
  { id: 5, projectId: 2, employee: "Sean Sarkic", role: "Supervisor", start: "2026-01-13", end: "2026-01-24", notes: "IZO-30220 Tyrkia" },
  { id: 6, projectId: 3, employee: "Henrik Ueland", role: "Mekaniker 2", start: "2026-01-12", end: "2026-01-23", notes: "Shell Bukom" },
  { id: 7, projectId: 2, employee: "Fredrik Johansen", role: "Mekaniker 1", start: "2026-01-13", end: "2026-01-24", notes: "IZO-30220 Tyrkia" },
  { id: 8, projectId: 6, employee: "Tor-Marius Sande", role: "Mekaniker 2", start: "2026-01-08", end: "2026-01-09", notes: "Training" },
  { id: 9, projectId: 1, employee: "Tor-Marius Sande", role: "Mekaniker 2", start: "2026-01-12", end: "2026-01-23", notes: "PBF California" },
  { id: 10, projectId: 4, employee: "Bjørn Heidar Asmundsson", role: "Supervisor", start: "2026-01-12", end: "2026-01-16", notes: "Kurs Kårstø" },
  { id: 11, projectId: 5, employee: "Erling Sekse Bilstad", role: "Supervisor", start: "2026-01-06", end: "2026-01-09", notes: "Ferie" },
  { id: 12, projectId: 7, employee: "Olis Hansen", role: "Supervisor", start: "2026-01-01", end: "2026-03-31", notes: "Admin / planlegging" },
  { id: 13, projectId: 7, employee: "Kenneth Vallestad", role: "Supervisor", start: "2026-01-01", end: "2026-03-31", notes: "Koordinering" },
  { id: 14, projectId: 9, employee: "Steinar Engtrø", role: "Supervisor", start: "2026-03-02", end: "2026-03-13", notes: "Åsgard A" },
  { id: 15, projectId: 9, employee: "Joar Bergsholm", role: "Mekaniker 1", start: "2026-03-02", end: "2026-03-13", notes: "Åsgard A" }
];

const DEFAULT_AUDIT_LOG = [
  { id: 1, user: "Olis Hansen", action: "Importerte ansattliste fra eksisterende plan", timestamp: "13.04.2026 11:12" },
  { id: 2, user: "Olis Hansen", action: "La inn ukenummer og norsk kalenderstruktur", timestamp: "13.04.2026 11:18" },
  { id: 3, user: "Olis Hansen", action: "Aktiverte prosjektpanel med kategorier og Kanban", timestamp: "13.04.2026 11:21" }
];

const DEFAULT_NOTIFICATION_LOG = [
  { id: 1, type: "SMS", recipient: "Aliaksandr Skliarenka", target: "PBF California", timestamp: "13.04.2026 11:36" },
  { id: 2, type: "E-post", recipient: "Aliaksandr Skliarenka", target: "PBF California", timestamp: "13.04.2026 11:36" }
];

// DETTE ER DET APP.JS TRENGER
const DATA = {
  employees: DEFAULT_EMPLOYEES,
  entries: DEFAULT_ENTRIES.map(entry => {
    const project = DEFAULT_PROJECTS.find(p => p.id === entry.projectId);
    return {
      id: entry.id,
      employee: entry.employee,
      project: project ? project.name : "Ukjent prosjekt",
      start: entry.start,
      end: entry.end,
      role: entry.role,
      notes: entry.notes,
      category: project ? project.category : "Project"
    };
  })
};

const SUPABASE_URL = "https://glyftmrkjherfrapbnjx.supabase.co";
const SUPABASE_ANON_KEY = "SETT_INN_DIN_ANON_KEY_HER";

const STORAGE_KEYS = {
  employees: "planner_employees_v31",
  projects: "planner_projects_v31",
  entries: "planner_entries_v31",
  auditLog: "planner_audit_v31",
  notificationLog: "planner_notifications_v31",
  startDate: "planner_start_v31",
  viewMode: "planner_view_v31",
  calendarMode: "planner_calendar_mode_v31"
};

const CATEGORY_COLORS = {
  Project: "bg-green-500 border-green-600 text-white",
  Travel: "bg-cyan-500 border-cyan-600 text-white",
  Onshore: "bg-indigo-500 border-indigo-600 text-white",
  Trainee: "bg-sky-500 border-sky-600 text-white",
  Kurs: "bg-violet-500 border-violet-600 text-white",
  Ferie: "bg-orange-400 border-orange-500 text-slate-900",
  Syk: "bg-red-600 border-red-700 text-white",
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

const ROLE_OPTIONS = ["Supervisor", "Mekaniker 1", "Mekaniker 2", "Mekaniker 3"];
const CATEGORY_OPTIONS = ["Project", "Travel", "Onshore", "Trainee", "Kurs", "Ferie", "Syk", "Avspasering"];
const STATUS_OPTIONS = ["Planlagt", "Pågår", "Avventer", "Fullført"];

const DEFAULT_EMPLOYEES = [
  { id: crypto.randomUUID(), name: "Olis Hansen", email: "olis@firma.no", phone: "+47 90000001", active: true },
  { id: crypto.randomUUID(), name: "Kenneth Vallestad", email: "kenneth@firma.no", phone: "+47 90000002", active: true },
  { id: crypto.randomUUID(), name: "Paul Chilver", email: "paul@firma.no", phone: "+47 90000003", active: true },
  { id: crypto.randomUUID(), name: "Aliaksandr Skliarenka", email: "aliaksandr@firma.no", phone: "+47 90000004", active: true },
  { id: crypto.randomUUID(), name: "Stian Egelandsdal", email: "stian@firma.no", phone: "+47 90000005", active: true },
  { id: crypto.randomUUID(), name: "Sean Sarkic", email: "sean@firma.no", phone: "+47 90000006", active: true },
  { id: crypto.randomUUID(), name: "Henrik Ueland", email: "henrik@firma.no", phone: "+47 90000007", active: true },
  { id: crypto.randomUUID(), name: "Erlend Skryten Johnsen", email: "erlend@firma.no", phone: "+47 90000008", active: true },
  { id: crypto.randomUUID(), name: "Fredrik Johansen", email: "fredrik@firma.no", phone: "+47 90000009", active: true },
  { id: crypto.randomUUID(), name: "Tor-Marius Sande", email: "tormarius@firma.no", phone: "+47 90000010", active: true },
  { id: crypto.randomUUID(), name: "Bjørn Heidar Asmundsson", email: "bjorn.heidar@firma.no", phone: "+47 90000011", active: true },
  { id: crypto.randomUUID(), name: "Erling Sekse Bilstad", email: "erling@firma.no", phone: "+47 90000012", active: true },
  { id: crypto.randomUUID(), name: "Bjørn Erik Hansen", email: "bjorn.erik@firma.no", phone: "+47 90000013", active: true },
  { id: crypto.randomUUID(), name: "Suzanne Sola Hestvik", email: "suzanne@firma.no", phone: "+47 90000014", active: true },
  { id: crypto.randomUUID(), name: "Steinar Engtrø", email: "steinar@firma.no", phone: "+47 90000015", active: true },
  { id: crypto.randomUUID(), name: "Joar Bergsholm", email: "joar@firma.no", phone: "+47 90000016", active: true },
  { id: crypto.randomUUID(), name: "Joachim Fosse", email: "joachim@firma.no", phone: "+47 90000017", active: true },
  { id: crypto.randomUUID(), name: "Karl Fredrik Tofte", email: "karl@firma.no", phone: "+47 90000018", active: true },
  { id: crypto.randomUUID(), name: "Emil Skaue Nielse", email: "emil@firma.no", phone: "+47 90000019", active: true },
  { id: crypto.randomUUID(), name: "Håkon Lea", email: "haakon@firma.no", phone: "+47 90000020", active: true },
  { id: crypto.randomUUID(), name: "Bjørnar Rugland - verksted", email: "bjornar.rugland@firma.no", phone: "+47 90000021", active: true },
  { id: crypto.randomUUID(), name: "Ihor Kaluhin - verksted", email: "ihor@firma.no", phone: "+47 90000022", active: true },
  { id: crypto.randomUUID(), name: "Ivan Vrcic - Lager", email: "ivan@firma.no", phone: "+47 90000023", active: true },
  { id: crypto.randomUUID(), name: "Andreas Lende", email: "andreas.lende@firma.no", phone: "+47 90000024", active: true },
  { id: crypto.randomUUID(), name: "Aironas Larsen", email: "aironas@firma.no", phone: "+47 90000025", active: true }
];

const DEFAULT_PROJECTS = [
  {
    id: crypto.randomUUID(),
    name: "PBF California",
    category: "Project",
    status: "Pågår",
    planned_start_date: "2026-01-10",
    planned_end_date: "2026-01-25",
    location: "Offshore",
    headcount_required: 2,
    notes: "Fra eksisterende plan"
  },
  {
    id: crypto.randomUUID(),
    name: "IZO-30220 Tyrkia",
    category: "Project",
    status: "Pågår",
    planned_start_date: "2026-01-12",
    planned_end_date: "2026-01-26",
    location: "Offshore",
    headcount_required: 2,
    notes: "Fra eksisterende plan"
  },
  {
    id: crypto.randomUUID(),
    name: "Shell Bukom",
    category: "Project",
    status: "Pågår",
    planned_start_date: "2026-01-12",
    planned_end_date: "2026-01-23",
    location: "Offshore",
    headcount_required: 1,
    notes: "Fra eksisterende plan"
  },
  {
    id: crypto.randomUUID(),
    name: "Kurs Kårstø",
    category: "Kurs",
    status: "Planlagt",
    planned_start_date: "2026-01-12",
    planned_end_date: "2026-01-16",
    location: "Onshore",
    headcount_required: 1,
    notes: "Kurs"
  },
  {
    id: crypto.randomUUID(),
    name: "Ferie",
    category: "Ferie",
    status: "Planlagt",
    planned_start_date: "2026-01-06",
    planned_end_date: "2026-01-09",
    location: "",
    headcount_required: 0,
    notes: "Fravær"
  },
  {
    id: crypto.randomUUID(),
    name: "Training",
    category: "Kurs",
    status: "Planlagt",
    planned_start_date: "2026-01-06",
    planned_end_date: "2026-01-07",
    location: "Onshore",
    headcount_required: 1,
    notes: "Opplæring"
  },
  {
    id: crypto.randomUUID(),
    name: "Onshore",
    category: "Onshore",
    status: "Planlagt",
    planned_start_date: "2026-01-01",
    planned_end_date: "2026-03-31",
    location: "Onshore",
    headcount_required: 2,
    notes: "Fast kapasitet"
  },
  {
    id: crypto.randomUUID(),
    name: "Travel",
    category: "Travel",
    status: "Planlagt",
    planned_start_date: "2026-01-01",
    planned_end_date: "2026-01-07",
    location: "",
    headcount_required: 2,
    notes: "Reiseblokk"
  },
  {
    id: crypto.randomUUID(),
    name: "Åsgard A 18CL900",
    category: "Project",
    status: "Planlagt",
    planned_start_date: "2026-03-02",
    planned_end_date: "2026-03-13",
    location: "Offshore",
    headcount_required: 2,
    notes: "Planlagt oppdrag"
  },
  {
    id: crypto.randomUUID(),
    name: "New Platform Upgrade",
    category: "Project",
    status: "Planlagt",
    planned_start_date: "2026-04-06",
    planned_end_date: "2026-04-22",
    location: "Offshore",
    headcount_required: 3,
    notes: "Ikke bemannet ennå"
  }
];

function projectIdByName(name) {
  return DEFAULT_PROJECTS.find(p => p.name === name)?.id || DEFAULT_PROJECTS[0].id;
}

const DEFAULT_ENTRIES = [
  { id: crypto.randomUUID(), project_id: projectIdByName("Travel"), employee_name: "Paul Chilver", role: "Supervisor", start_date: "2026-01-01", end_date: "2026-01-07", notes: "Travel" },
  { id: crypto.randomUUID(), project_id: projectIdByName("Training"), employee_name: "Aliaksandr Skliarenka", role: "Mekaniker 1", start_date: "2026-01-06", end_date: "2026-01-07", notes: "Training" },
  { id: crypto.randomUUID(), project_id: projectIdByName("PBF California"), employee_name: "Aliaksandr Skliarenka", role: "Mekaniker 1", start_date: "2026-01-12", end_date: "2026-01-23", notes: "PBF California" },
  { id: crypto.randomUUID(), project_id: projectIdByName("Travel"), employee_name: "Sean Sarkic", role: "Supervisor", start_date: "2026-01-01", end_date: "2026-01-07", notes: "Travel" },
  { id: crypto.randomUUID(), project_id: projectIdByName("IZO-30220 Tyrkia"), employee_name: "Sean Sarkic", role: "Supervisor", start_date: "2026-01-13", end_date: "2026-01-24", notes: "IZO-30220 Tyrkia" },
  { id: crypto.randomUUID(), project_id: projectIdByName("Shell Bukom"), employee_name: "Henrik Ueland", role: "Mekaniker 2", start_date: "2026-01-12", end_date: "2026-01-23", notes: "Shell Bukom" },
  { id: crypto.randomUUID(), project_id: projectIdByName("Onshore"), employee_name: "Olis Hansen", role: "Supervisor", start_date: "2026-01-01", end_date: "2026-03-31", notes: "Admin / planlegging" },
  { id: crypto.randomUUID(), project_id: projectIdByName("Onshore"), employee_name: "Kenneth Vallestad", role: "Supervisor", start_date: "2026-01-01", end_date: "2026-03-31", notes: "Koordinering" },
  { id: crypto.randomUUID(), project_id: projectIdByName("Kurs Kårstø"), employee_name: "Bjørn Heidar Asmundsson", role: "Supervisor", start_date: "2026-01-12", end_date: "2026-01-16", notes: "Kurs Kårstø" },
  { id: crypto.randomUUID(), project_id: projectIdByName("Ferie"), employee_name: "Erling Sekse Bilstad", role: "Supervisor", start_date: "2026-01-06", end_date: "2026-01-09", notes: "Ferie" },
  { id: crypto.randomUUID(), project_id: projectIdByName("Åsgard A 18CL900"), employee_name: "Steinar Engtrø", role: "Supervisor", start_date: "2026-03-02", end_date: "2026-03-13", notes: "Åsgard A" },
  { id: crypto.randomUUID(), project_id: projectIdByName("Åsgard A 18CL900"), employee_name: "Joar Bergsholm", role: "Mekaniker 1", start_date: "2026-03-02", end_date: "2026-03-13", notes: "Åsgard A" }
];

const DEFAULT_AUDIT_LOG = [
  { id: crypto.randomUUID(), user_name: "Olis Hansen", action_text: "Initialiserte planleggingsverktøy versjon 3.1", created_at: new Date().toISOString() }
];

const DEFAULT_NOTIFICATION_LOG = [];

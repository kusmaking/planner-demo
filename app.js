var supabaseClient = window.__plannerSupabaseClient;

if (!supabaseClient) {
  supabaseClient = window.supabase.createClient(
    "https://glyftmrkjherfrapbnjx.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdseWZ0bXJramhlcmZyYXBibmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTUwMzAsImV4cCI6MjA5MTY3MTAzMH0.6XEGISHw8D_HddO4iglkc9PdNRo-s3y_Ejxy80ALLfE"
  );
  window.__plannerSupabaseClient = supabaseClient;
}

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
  return `${pad(d.getDate())}.${pad(d.getMonth() + 

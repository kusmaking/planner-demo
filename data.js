const CATEGORY_COLORS = {
  Offshore: "green",
};

const STATUS_COLORS = {
  Planlagt: "",
  Avsluttet: "gray"
};

const DEFAULT_PROJECTS = [
  {
    id: crypto.randomUUID(),
    name: "Test Offshore",
    category: "Offshore",
    status: "Planlagt",
    planned_start_date: "2026-01-01",
    planned_end_date: "2026-01-10"
  }
];

const DEFAULT_EMPLOYEES = [
  { id: crypto.randomUUID(), name: "Olis Hansen" }
];

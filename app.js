console.log("[APP] Started");

const state = {
  employees: DATA.employees,
  entries: DATA.entries,
  startDate: new Date(2026, 0, 1)
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function format(date) {
  return date.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

function renderCalendar() {
  console.log("[RENDER] Running");

  const container = document.getElementById("calendarWrap");

  if (!container) {
    console.error("[ERROR] calendarWrap not found");
    return;
  }

  const days = Array.from({ length: 30 }, (_, i) => addDays(state.startDate, i));
  const dayWidth = 40;

  const header = days
    .map(
      d => `<div class="text-xs text-center border p-1 bg-slate-50">${format(d)}</div>`
    )
    .join("");

  const rows = state.employees
    .map(emp => {
      console.log("[EMP]", emp);

      const cells = days
        .map(() => `<div class="border h-10 bg-white"></div>`)
        .join("");

      const blocks = state.entries
        .filter(e => e.employee === emp.name)
        .map(e => {
          const start = new Date(e.start);
          const end = new Date(e.end);

          const startIdx = Math.floor((start - days[0]) / 86400000);
          const endIdx = Math.floor((end - days[0]) / 86400000);

          if (endIdx < 0 || startIdx > days.length - 1) return "";

          const safeStart = Math.max(0, startIdx);
          const safeEnd = Math.min(days.length - 1, endIdx);
          const width = (safeEnd - safeStart + 1) * dayWidth - 4;

          console.log("[BLOCK]", e.project, safeStart, safeEnd);

          return `
            <div
              style="position:absolute; left:${safeStart * dayWidth + 2}px; top:4px; width:${width}px;"
              class="bg-blue-500 text-white text-xs p-1 rounded h-8 overflow-hidden whitespace-nowrap"
              title="${e.project} (${e.start} - ${e.end})"
            >
              ${e.project}
            </div>
          `;
        })
        .join("");

      return `
        <div class="font-medium border p-2 h-10 bg-white sticky left-0 z-10">${emp.name}</div>
        <div class="relative" style="grid-column: span ${days.length} / span ${days.length}; min-height:40px;">
          <div class="grid" style="grid-template-columns: repeat(${days.length}, ${dayWidth}px);">
            ${cells}
          </div>
          ${blocks}
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="overflow-auto">
      <div class="grid" style="grid-template-columns: 200px repeat(${days.length}, ${dayWidth}px); min-width:${200 + days.length * dayWidth}px;">
        <div class="border bg-white"></div>
        ${header}
        ${rows}
      </div>
    </div>
  `;
}

renderCalendar();
console.log("[APP] Done");

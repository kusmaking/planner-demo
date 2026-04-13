console.log("[APP] Started");

const state = {
  employees: DATA.employees,
  entries: DATA.entries,
  startDate: new Date(2026,0,1)
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function format(date) {
  return date.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' });
}

function renderCalendar() {
  console.log("[RENDER] Running");

  const container = document.getElementById("calendarWrap");

  if (!container) {
    console.error("[ERROR] calendarWrap not found");
    return;
  }

  const days = Array.from({ length: 30 }, (_, i) => addDays(state.startDate, i));

  container.innerHTML = `
    <div class="grid" style="grid-template-columns:200px repeat(${days.length},40px)">
      <div></div>
      ${days.map(d => `<div class="text-xs text-center border">${format(d)}</div>`).join('')}

      ${state.employees.map(emp => {
        console.log("[EMP]", emp);

        const blocks = state.entries
          .filter(e => e.employee === emp.name)
          .map(e => {
            const start = new Date(e.start);
            const end = new Date(e.end);

            const startIdx = Math.floor((start - days[0]) / 86400000);
            const endIdx = Math.floor((end - days[0]) / 86400000);

            const width = (endIdx - startIdx + 1) * 40;

            console.log("[BLOCK]", e.project, startIdx, endIdx);

            return `<div style="position:absolute;left:${startIdx * 40}px;top:4px;width:${width}px" class="bg-blue-500 text-white text-xs p-1 rounded overflow-hidden whitespace-nowrap">${e.project}</div>`;
          }).join('');

        return `
          <div class="font-medium border p-2 h-10">${emp.name}</div>
          <div class="relative" style="grid-column: span ${days.length} / span ${days.length}; min-height:40px;">
            <div class="grid" style="grid-template-columns: repeat(${days.length},40px)">
              ${days.map(() => `<div class="border h-10"></div>`).join('')}
            </div>
            ${blocks}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

renderCalendar();
console.log("[APP] Done");

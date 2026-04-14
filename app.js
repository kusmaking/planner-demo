window.onload = () => {
  const proj = document.getElementById("project");
  const emp = document.getElementById("employee");

  store.projects.forEach(p => {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.name;
    proj.appendChild(o);
  });

  store.employees.forEach(e => {
    const o = document.createElement("option");
    o.value = e.name;
    o.textContent = e.name;
    emp.appendChild(o);
  });

  renderCalendar();
};

function assign() {
  const projId = document.getElementById("project").value;
  const emp = document.getElementById("employee").value;

  const p = store.projects.find(x => x.id === projId);

  store.entries.push({
    project_id: projId,
    employee: emp,
    start: p.planned_start_date,
    end: p.planned_end_date
  });

  renderCalendar();
}

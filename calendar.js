function renderCalendar() {
  const el = document.getElementById("calendar");
  el.innerHTML = "";

  store.entries.forEach(e => {
    const p = store.projects.find(x => x.id === e.project_id);

    const div = document.createElement("div");
    div.innerText = `${e.employee} → ${p.name} (${e.start} - ${e.end})`;

    if (p.status === "Avsluttet") {
      div.style.background = "#ccc";
    }

    el.appendChild(div);
  });
}

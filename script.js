const VPD_TABLE = {
  1: { phase: "Keimung", temp: 24, rh: 70, vpd: 0.6 },
  3: { phase: "Wachstum", temp: 26, rh: 65, vpd: 0.9 },
  5: { phase: "Blüte", temp: 25, rh: 60, vpd: 1.1 },
  7: { phase: "Blüte", temp: 24, rh: 55, vpd: 1.3 },
  9: { phase: "Reife", temp: 23, rh: 50, vpd: 1.4 },
  11: { phase: "Ernte", temp: 22, rh: 45, vpd: 1.5 },
};

let profiles = { "1": [], "2": [] };
let currentProfile = "1";

function saveProfiles() {
  localStorage.setItem("pflanzenmanager", JSON.stringify(profiles));
}

function loadProfiles() {
  const data = localStorage.getItem("pflanzenmanager");
  if (data) profiles = JSON.parse(data);
}

function generateWeeks(startDate) {
  let weeks = [];
  if (!startDate) return weeks;
  const today = new Date();
  const start = new Date(startDate);
  const diffWeeks = Math.floor((today - start) / (1000 * 60 * 60 * 24 * 7)) + 1;
  for (let w = 1; w <= 12; w++) {
    let info = VPD_TABLE[w] || { phase: "–", temp: "-", rh: "-", vpd: "-" };
    weeks.push({
      number: w,
      current: w === diffWeeks,
      ...info
    });
  }
  return weeks;
}

function render() {
  document.getElementById("profileSelect").innerHTML = Object.keys(profiles)
    .map(p => `<option value="${p}" ${p === currentProfile ? "selected" : ""}>Profil ${p}</option>`)
    .join("");

  const list = document.getElementById("plantList");
  list.innerHTML = "";

  profiles[currentProfile].forEach((plant, idx) => {
    let plantDiv = document.createElement("div");
    plantDiv.className = "plant";

    let weeksHtml = generateWeeks(plant.start_date).map(w =>
      `<div class="week ${w.current ? "current-week" : ""}">
         <div>Woche ${w.number}</div>
         <div>${w.phase}</div>
         <div>Temp: ${w.temp}°C</div>
         <div>RH: ${w.rh}%</div>
         <div>VPD: ${w.vpd}</div>
       </div>`
    ).join("");

    let logsHtml = (plant.logs || []).map(l =>
      `<li>${l.date} — ${l.action}${l.notes ? ": " + l.notes : ""}</li>`
    ).join("");

    plantDiv.innerHTML = `
      <h2>${plant.name}</h2>
      <div><strong>Sorte:</strong> ${plant.strain || ""}</div>
      <div><strong>Start:</strong> ${plant.start_date || ""}</div>
      <div><strong>Notizen:</strong> ${plant.notes || ""}</div>
      <button onclick="deletePlant(${idx})">Löschen</button>
      <h3>Logs</h3>
      <ul class="log-list">${logsHtml}</ul>
      <div class="form-inline">
        <select id="logAction${idx}">
          <option value="Gegossen">Gegossen</option>
          <option value="Gedüngt">Gedüngt</option>
          <option value="Entlaubt">Entlaubt</option>
          <option value="Sonstiges">Sonstiges</option>
        </select>
        <input type="date" id="logDate${idx}">
        <input type="text" id="logNotes${idx}" placeholder="Notizen">
        <button onclick="addLog(${idx})">Eintragen</button>
      </div>
      <h3>Wochenplan</h3>
      <div style="display:flex; flex-wrap:wrap; gap:5px;">${weeksHtml}</div>
    `;
    list.appendChild(plantDiv);
  });
}

function addPlant() {
  const name = document.getElementById("plantName").value;
  const strain = document.getElementById("plantStrain").value;
  const start = document.getElementById("plantStart").value;
  const notes = document.getElementById("plantNotes").value;

  profiles[currentProfile].push({
    name, strain, start_date: start, notes, logs: []
  });

  saveProfiles();
  render();
}

function deletePlant(idx) {
  profiles[currentProfile].splice(idx, 1);
  saveProfiles();
  render();
}

function addLog(idx) {
  const action = document.getElementById(`logAction${idx}`).value;
  const date = document.getElementById(`logDate${idx}`).value;
  const notes = document.getElementById(`logNotes${idx}`).value;
  profiles[currentProfile][idx].logs.push({ action, date, notes });
  saveProfiles();
  render();
}

function addGlobalLog() {
  const action = document.getElementById("globalAction").value;
  const date = document.getElementById("globalDate").value;
  const notes = document.getElementById("globalNotes").value;
  profiles[currentProfile].forEach(p => {
    p.logs.push({ action, date, notes });
  });
  saveProfiles();
  render();
}

document.getElementById("profileSelect").addEventListener("change", e => {
  currentProfile = e.target.value;
  render();
});

loadProfiles();
render();

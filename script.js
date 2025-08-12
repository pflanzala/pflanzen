const plantsKey = "plantsData";

// Wochenplan Tabelle
const VPD_TABLE = {
  1: { phase: "Keimung", temp: 24, rh: 70, vpd: 0.6 },
  3: { phase: "Wachstum", temp: 26, rh: 65, vpd: 0.9 },
  5: { phase: "Blüte", temp: 25, rh: 60, vpd: 1.1 },
  7: { phase: "Blüte", temp: 24, rh: 55, vpd: 1.3 },
  9: { phase: "Reife", temp: 23, rh: 50, vpd: 1.4 },
  11: { phase: "Ernte", temp: 22, rh: 45, vpd: 1.5 },
};

function loadPlants() {
  return JSON.parse(localStorage.getItem(plantsKey) || "[]");
}

function savePlants(plants) {
  localStorage.setItem(plantsKey, JSON.stringify(plants));
}

function generateWeeks(startDate) {
  const weeks = [];
  const today = new Date();
  const start = new Date(startDate);
  const currentWeek = Math.floor((today - start) / (7 * 24 * 60 * 60 * 1000)) + 1;

  for (let w = 1; w <= 12; w++) {
    const phaseInfo = VPD_TABLE[w] || { phase: "–", temp: "-", rh: "-", vpd: "-" };
    weeks.push({
      number: w,
      phase: phaseInfo.phase,
      temp: phaseInfo.temp,
      rh: phaseInfo.rh,
      vpd: phaseInfo.vpd,
      current: w === currentWeek
    });
  }
  return weeks;
}

function renderPlants() {
  const plants = loadPlants();
  const container = document.getElementById("plantsContainer");
  container.innerHTML = "";

  plants.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "plant";
    div.innerHTML = `
      <h2>${p.name}</h2>
      <p><strong>Sorte:</strong> ${p.strain || "-"}</p>
      <p><strong>Start:</strong> ${p.start_date}</p>
      <p><strong>Notizen:</strong> ${p.notes || "-"}</p>
      <button onclick="deletePlant(${idx})" style="background:red;">Löschen</button>
      <h3>Logs</h3>
      <div class="logs">${p.logs.map(l => `${l.date} — ${l.action}${l.notes ? ": " + l.notes : ""}`).join("<br>")}</div>
      <form onsubmit="addLog(event, ${idx})">
        <select name="action">
          <option value="Gegossen">Gegossen</option>
          <option value="Gedüngt">Gedüngt</option>
          <option value="Entlaubt">Entlaubt</option>
          <option value="Sonstiges">Sonstiges</option>
        </select>
        <input type="date" name="date" required>
        <input type="text" name="notes" placeholder="Notizen">
        <button>Eintragen</button>
      </form>
      <h3>Wochenplan</h3>
      <div class="calendar">
        ${generateWeeks(p.start_date).map(w => `
          <div class="week ${w.current ? 'current' : ''}">
            <div>Woche ${w.number}</div>
            <div>${w.phase}</div>
            <div>Temp: ${w.temp}°C</div>
            <div>RH: ${w.rh}%</div>
            <div>VPD: ${w.vpd}</div>
          </div>
        `).join("")}
      </div>
    `;
    container.appendChild(div);
  });
}

function deletePlant(idx) {
  const plants = loadPlants();
  plants.splice(idx, 1);
  savePlants(plants);
  renderPlants();
}

function addLog(e, idx) {
  e.preventDefault();
  const form = e.target;
  const action = form.action.value;
  const date = form.date.value;
  const notes = form.notes.value;
  const plants = loadPlants();
  plants[idx].logs.push({ action, date, notes });
  savePlants(plants);
  renderPlants();
}

document.getElementById("addPlantForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("plantName").value;
  const strain = document.getElementById("plantStrain").value;
  const start_date = document.getElementById("plantStartDate").value;
  const notes = document.getElementById("plantNotes").value;
  const plants = loadPlants();
  plants.push({ name, strain, start_date, notes, logs: [] });
  savePlants(plants);
  e.target.reset();
  renderPlants();
});

document.getElementById("globalLogForm").addEventListener("submit", e => {
  e.preventDefault();
  const action = document.getElementById("globalAction").value;
  const date = document.getElementById("globalDate").value;
  const notes = document.getElementById("globalNotes").value;
  const plants = loadPlants();
  plants.forEach(p => p.logs.push({ action, date, notes }));
  savePlants(plants);
  renderPlants();
});

// Start
renderPlants();


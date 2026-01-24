let editId = null;

const players = ["Pembe", "Marki", "Schoba"];
let tournaments = JSON.parse(localStorage.getItem("tournaments")) || [];

const playerDiv = document.getElementById("players");
const tournamentName = document.getElementById("tournamentName");
const tournamentDate = document.getElementById("tournamentDate");
const rankingDiv = document.getElementById("ranking");
const tournamentListDiv = document.getElementById("tournamentList");
const winsChartCtx = document.getElementById("winsChart").getContext("2d");
const diffChartCtx = document.getElementById("diffChart").getContext("2d");

players.forEach(p => {
  playerDiv.innerHTML += `
    <div class="card player-card">
      <strong>${p}</strong>
      <div>
        S: <input type="number" id="${p}-s" min="0" value="0">
        N: <input type="number" id="${p}-n" min="0" value="0">
        GL: <input type="number" id="${p}-gl" min="0" value="0">
        VL: <input type="number" id="${p}-vl" min="0" value="0">
      </div>
    </div>
  `;
});

function addTournament() {
  const name = tournamentName.value;
  const date = tournamentDate.value;

  if (!name || !date) { alert("Bitte Turniername und Datum ausfüllen!"); return; }

  const entries = players.map(p => ({
    player: p,
    wins: +document.getElementById(`${p}-s`).value,
    losses: +document.getElementById(`${p}-n`).value,
    gl: +document.getElementById(`${p}-gl`).value,
    vl: +document.getElementById(`${p}-vl`).value
  }));

  tournaments.push({ name, date, entries });
  localStorage.setItem("tournaments", JSON.stringify(tournaments));

  buildRanking();
}

let winsChart, diffChart;

function buildRanking() {
  const stats = {};
  players.forEach(p => stats[p] = { wins: 0, losses: 0, gl: 0, vl: 0 });

  tournaments.forEach(t =>
    t.entries.forEach(e => {
      stats[e.player].wins += e.wins;
      stats[e.player].losses += e.losses;
      stats[e.player].gl += e.gl;
      stats[e.player].vl += e.vl;
    })
  );

  const ranking = Object.entries(stats)
    .map(([player, s]) => ({ player, ...s, diff: s.gl - s.vl }))
    .sort((a,b) => b.wins - a.wins || b.gl - a.gl || b.diff - a.diff);

  renderRanking(ranking);
  renderCharts(ranking);
  renderTournaments();
}

function renderRanking(ranking) {
  rankingDiv.innerHTML = ranking.map((r,i) => `
    <div class="card player-card">
      <span>${["🥇","🥈","🥉"][i] || i+1}. ${r.player}</span>
      <span>S:${r.wins} N:${r.losses} GL:${r.gl} VL:${r.vl} Diff:${r.diff}</span>
    </div>
  `).join("");
}

function renderCharts(ranking) {
  const labels = ranking.map(r => r.player);

  if (winsChart) winsChart.destroy();
  if (diffChart) diffChart.destroy();

  winsChart = new Chart(winsChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: "Siege",
        data: ranking.map(r => r.wins),
        backgroundColor: ranking.map((r,i) => ["#FFD700","#C0C0C0","#CD7F32"][i] || "#4caf50"),
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1000, easing: 'easeOutBounce' },
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, stepSize: 1 } }
    }
  });

  diffChart = new Chart(diffChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: "Diff",
        data: ranking.map(r => r.diff),
        backgroundColor: "#FF9800",
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1000, easing: 'easeOutBounce' },
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderTournaments() {
  if (tournaments.length === 0) {
    tournamentListDiv.innerHTML = "<p>Keine Turniere gespeichert.</p>";
    return;
  }

  tournamentListDiv.innerHTML = tournaments.map((t, idx) => {
    const entriesHtml = t.entries.map(e => {
      const diff = e.gl - e.vl;
      return `<div>${e.player}: S:${e.wins} N:${e.losses} GL:${e.gl} VL:${e.vl} Diff:${diff}</div>`;
    }).join("");
    return `
      <div class="card">
        <strong>${t.name}</strong> (${t.date})
        <button class="delete-btn" onclick="deleteTournament(${idx})">Löschen</button>
        <div>${entriesHtml}</div>
      </div>
    `;
  }).join("");
}

function deleteTournament(index) {
  if (confirm("Willst du dieses Turnier wirklich löschen?")) {
    tournaments.splice(index, 1);
    localStorage.setItem("tournaments", JSON.stringify(tournaments));
    buildRanking();
  }
}

// Direkt beim Laden
buildRanking();


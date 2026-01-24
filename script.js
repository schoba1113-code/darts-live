import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBpIYgzHZbrtjBAHrbVlsqwkuI6weoQD2o",
  authDomain: "darts-turniere-dacfc.firebaseapp.com",
  databaseURL: "https://darts-turniere-dacfc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "darts-turniere-dacfc",
  storageBucket: "darts-turniere-dacfc.appspot.com",
  messagingSenderId: "779378324704",
  appId: "1:779378324704:web:88aaf743660af6c138cc85"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Spieler
const players = ["Pembe","Marki","Schoba"];

// DOM Elemente
const player1Select = document.getElementById("player1");
const player2Select = document.getElementById("player2");
const gameList = document.getElementById("gameList");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const rankingDiv = document.getElementById("ranking");
const tournamentList = document.getElementById("tournamentList");
const yearFilter = document.getElementById("yearFilter");
const monthFilter = document.getElementById("monthFilter");

// Globale Variablen
let allTournaments = {};
let games = [];
let editId = null;

// Charts
let avgBarChart, avgTrendChart, dqBarChart, dqTrendChart, winsChart, diffChart;

// Dropdowns füllen
players.forEach(p=>{
  player1Select.innerHTML += `<option value="${p}">${p}</option>`;
  player2Select.innerHTML += `<option value="${p}">${p}</option>`;
});

// Event Listener
document.getElementById("addGameBtn").addEventListener("click", addGame);
saveBtn.addEventListener("click", saveTournament);
cancelBtn.addEventListener("click", cancelEdit);
applyFilterBtn.addEventListener("click", renderAll);

// ===== Funktionen =====

// Spiel hinzufügen
function addGame(){
  const p1 = player1Select.value;
  const p2 = player2Select.value;
  if(!p1 || !p2 || p1===p2){ alert("Bitte zwei verschiedene Spieler wählen"); return; }

  const gameData = {
    [p1]:{
      s:+document.getElementById("p1-s").value||0,
      n:+document.getElementById("p1-n").value||0,
      gl:+document.getElementById("p1-gl").value||0,
      vl:+document.getElementById("p1-vl").value||0,
      avg:+document.getElementById("p1-avg").value||0,
      dq:+document.getElementById("p1-dq").value||0
    },
    [p2]:{
      s:+document.getElementById("p2-s").value||0,
      n:+document.getElementById("p2-n").value||0,
      gl:+document.getElementById("p2-gl").value||0,
      vl:+document.getElementById("p2-vl").value||0,
      avg:+document.getElementById("p2-avg").value||0,
      dq:+document.getElementById("p2-dq").value||0
    }
  };

  games.push(gameData);

  // Liste aktualisieren
  const li = document.createElement("li");
  li.textContent = `${p1} vs ${p2} hinzugefügt`;
  gameList.appendChild(li);

  // Inputs zurücksetzen
  ["p1","p2"].forEach(p=>{
    ["s","n","gl","vl","avg","dq"].forEach(f=>document.getElementById(`${p}-${f}`).value="");
  });
}

// Turnier speichern
function saveTournament(){
  const tName = document.getElementById("tName").value;
  const tDate = document.getElementById("tDate").value;
  if(!tName || !tDate){ alert("Name & Datum fehlen"); return;}
  if(games.length===0){ alert("Bitte mindestens ein Spiel hinzufügen"); return;}

  // Statistik berechnen
  const stats = {};
  players.forEach(p=>stats[p]={s:0,n:0,gl:0,vl:0,avg:[],dq:[]});

  games.forEach(g=>{
    players.forEach(p=>{
      if(g[p]){
        stats[p].s += g[p].s;
        stats[p].n += g[p].n;
        stats[p].gl += g[p].gl;
        stats[p].vl += g[p].vl;
        stats[p].avg.push(g[p].avg);
        stats[p].dq.push(g[p].dq);
      }
    });
  });

  const finalData = {name:tName,date:tDate,players:{}};

  players.forEach(p=>{
    finalData.players[p] = {
      s: stats[p].s,
      n: stats[p].n,
      gl: stats[p].gl,
      vl: stats[p].vl,
      avg: stats[p].avg.reduce((a,b)=>a+b,0)/stats[p].avg.length,
      dq: stats[p].dq.reduce((a,b)=>a+b,0)/stats[p].dq.length
    };
  });

  if(editId){
    update(ref(db,"tournaments/"+editId),finalData);
    editId=null;
    saveBtn.textContent="Turnier speichern";
    cancelBtn.style.display="none";
  } else {
    push(ref(db,"tournaments"),finalData);
  }

  // Reset
  games=[];
  gameList.innerHTML="";
  document.getElementById("tName").value="";
  document.getElementById("tDate").value="";
}

// Cancel Edit
function cancelEdit(){
  editId=null;
  saveBtn.textContent="Turnier speichern";
  cancelBtn.style.display="none";
  document.getElementById("tName").value="";
  document.getElementById("tDate").value="";
  games=[];
  gameList.innerHTML="";
}

// Turnier löschen
window.deleteTournament = function(id){
  if(!confirm("Turnier wirklich löschen?")) return;
  remove(ref(db,"tournaments/"+id));
};

// Bearbeiten-Funktion
window.editTournament = function(id){
  const tRef = ref(db,"tournaments/"+id);
  onValue(tRef, snap=>{
    const t = snap.val();
    if(!t) return;

    document.getElementById("tName").value = t.name;
    document.getElementById("tDate").value = t.date;

    // Alte Spiele wiederherstellen
    games = [];
    gameList.innerHTML = "";
    // Spielerstatistiken werden als Einzelspiele angenommen
    players.forEach(p=>{
      if(t.players[p]){
        const g = {};
        g[p] = {...t.players[p]};
        games.push(g);
        const li = document.createElement("li");
        li.textContent = `${p} Daten geladen`;
        gameList.appendChild(li);
      }
    });

    editId = id;
    saveBtn.textContent="Update";
    cancelBtn.style.display="inline-block";
  }, {onlyOnce:true});
};

// Firebase Listener
onValue(ref(db,"tournaments"),snap=>{
  allTournaments = snap.val()||{};
  buildYearFilter();
  renderAll();
});

// Filter Funktionen
function buildYearFilter() {
  const years = new Set();
  Object.values(allTournaments).forEach(t=>years.add(t.date.slice(0,4)));
  yearFilter.innerHTML = '<option value="all">Alle Jahre</option>';
  [...years].sort().forEach(y=>yearFilter.innerHTML += `<option value="${y}">${y}</option>`);
  buildMonthFilter();
}

function buildMonthFilter(){
  const selectedYear = yearFilter.value;
  const months = new Set();
  Object.values(allTournaments).forEach(t=>{
    if(selectedYear==="all" || t.date.startsWith(selectedYear)) months.add(t.date.slice(5,7));
  });
  monthFilter.innerHTML='<option value="all">Alle Monate</option>';
  [...months].sort().forEach(m=>{
    const monthName = new Date(0,parseInt(m)-1).toLocaleString('de-DE',{month:'long'});
    monthFilter.innerHTML += `<option value="${m}">${monthName}</option>`;
  });
}

// ===== Rangliste & Charts =====
function renderAll(){
  const year = yearFilter.value;
  const month = monthFilter.value;
  const stats = {};
  const turnierLabels = [];
  players.forEach(p=>stats[p]={s:0,n:0,gl:0,vl:0,avg:[],dq:[],turniere:[]});

  tournamentList.innerHTML="";
  Object.entries(allTournaments).forEach(([id,t])=>{
    if(year!=="all" && !t.date.startsWith(year)) return;
    if(month!=="all" && t.date.slice(5,7)!==month) return;

    const div = document.createElement("div");
    div.className="tournament";
    div.innerHTML=`
      <span>${t.name} (${t.date})</span>
      <button onclick="editTournament('${id}')">Bearbeiten</button>
      <button onclick="deleteTournament('${id}')">Löschen</button>
    `;
    tournamentList.appendChild(div);

    turnierLabels.push(t.name);
    players.forEach(p=>{
      const d = t.players[p];
      stats[p].s += d.s;
      stats[p].n += d.n;
      stats[p].gl += d.gl;
      stats[p].vl += d.vl;
      stats[p].avg.push(d.avg);
      stats[p].dq.push(d.dq);
      stats[p].turniere.push(t.name);
    });
  });

  renderRanking(stats);
  renderCharts(stats, turnierLabels);
}

// Rangliste rendern
function renderRanking(stats){
  rankingDiv.innerHTML="";
  const sortable = players.map(p=>({...stats[p],player:p,diff:stats[p].gl-stats[p].vl}));
  sortable.sort((a,b)=>b.s-a.s||b.gl-a.gl||a.diff-b.diff);

  const highestAVG = Math.max(...players.map(p=>stats[p].avg.reduce((a,b)=>a+b,0)/Math.max(stats[p].avg.length,1)));
  const bestDQ = Math.max(...players.map(p=>stats[p].dq.reduce((a,b)=>a+b,0)/Math.max(stats[p].dq.length,1)));
  const mostWins = Math.max(...players.map(p=>stats[p].s));

  sortable.forEach((r,i)=>{
    const medal = i<3?["🥇","🥈","🥉"][i]:"";
    const badges = [];
    const avgMean = r.avg.reduce((sum,v)=>sum+v,0)/Math.max(r.avg.length,1);
    const dqMean = r.dq.reduce((sum,v)=>sum+v,0)/Math.max(r.dq.length,1);
    if(avgMean === highestAVG) badges.push("🌟");
    if(dqMean === bestDQ) badges.push("⚡");
    if(r.s === mostWins) badges.push("🏆");

    rankingDiv.innerHTML += `
      <div class="rank-row ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">
        <span class="medal">${medal}</span> ${r.player} ${badges.join('')} | S:${r.s} N:${r.n} GL:${r.gl} VL:${r.vl} Diff:${r.diff}
      </div>`;
  });
}

// Charts rendern
function renderCharts(stats, turnierLabels){
  const labels = turnierLabels.map((t,i)=>i+1);

  avgBarChart?.destroy();
  avgTrendChart?.destroy();
  dqBarChart?.destroy();
  dqTrendChart?.destroy();
  winsChart?.destroy();
  diffChart?.destroy();

  avgBarChart = new Chart(document.getElementById("avgBarChart"),{
    type:"bar",
    data:{
      labels,
      datasets: players.map((p,i)=>({label:p+" AVG",data: stats[p].avg,backgroundColor:["#f59e0b","#6b7280","#b87333"][i],borderRadius:5}))
    },
    options:{responsive:true,plugins:{legend:{position:'top'}},scales:{x:{title:{display:true,text:'Spiel'}},y:{title:{display:true,text:'AVG'}}}}
  });

  avgTrendChart = new Chart(document.getElementById("avgTrendChart"),{
    type:"line",
    data:{
      labels,
      datasets: players.map((p,i)=>({label:p+" AVG",data: stats[p].avg,borderColor:["#f59e0b","#6b7280","#b87333"][i],backgroundColor:["#f59e0b","#6b7280","#b87333"][i],tension:0.3,fill:false,pointRadius:5}))
    },
    options:{responsive:true,plugins:{legend:{position:'top'}},scales:{x:{title:{display:true,text:'Spiel'}},y:{title:{display:true,text:'AVG'}}}}
  });

  dqBarChart = new Chart(document.getElementById("dqBarChart"),{
    type:"bar",
    data:{labels,datasets: players.map((p,i)=>({label:p+" DQ %",data: stats[p].dq,backgroundColor:["#fde68a","#e5e7eb","#a97142"][i],borderRadius:5}))},
    options:{responsive:true,plugins:{legend:{position:'top'}},scales:{x:{title:{display:true,text:'Spiel'}},y:{title:{display:true,text:'DQ %'}}}}
  });

  dqTrendChart = new Chart(document.getElementById("dqTrendChart"),{
    type:"line",
    data:{labels,datasets: players.map((p,i)=>({label:p+" DQ %",data: stats[p].dq,borderColor:["#fde68a","#e5e7eb","#a97142"][i],backgroundColor:["#fde68a","#e5e7eb","#a97142"][i],tension:0.3,fill:false,pointRadius:5}))},
    options:{responsive:true,plugins:{legend:{position:'top'}},scales:{x:{title:{display:true,text:'Spiel'}},y:{title:{display:true,text:'DQ %'}}}}
  });

  winsChart = new Chart(document.getElementById("winsChart"),{
    type:"bar",
    data:{labels:players,datasets:[{label:"Siege",data:players.map(p=>stats[p].s),backgroundColor:["#fde68a","#e5e7eb","#a97142"],borderRadius:8}]},
    options:{responsive:true,plugins:{tooltip:{callbacks:{label:(ctx)=>`Siege: ${ctx.raw}`}}},legend:{display:false},scales:{y:{beginAtZero:true,title:{display:true,text:'Siege'}}}}
  });

  diffChart = new Chart(document.getElementById("diffChart"),{
    type:"bar",
    data:{labels:players,datasets:[{label:"Differenz (GL-VL)",data:players.map(p=>stats[p].gl-stats[p].vl),backgroundColor:["#fcd34d","#d1d5db","#b87333"],borderRadius:8}]},
    options:{responsive:true,plugins:{tooltip:{callbacks:{label:(ctx)=>`Diff: ${ctx.raw}`}}},legend:{display:false},scales:{y:{beginAtZero:true,title:{display:true,text:'Differenz'}}}}
  });
}

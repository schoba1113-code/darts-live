<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>🎯 Darts Rangliste</title>

  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link rel="stylesheet" href="style.css">

  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

<div class="app">

  <header>
    <h1>🎯 Darts Rangliste</h1>
  </header>

  <!-- TURNIER ERFASSEN -->
  <section class="card">
    <h2>Turnier erfassen</h2>

    <div class="form-row">
      <input
        id="tName"
        type="text"
        placeholder="Turniername"
        aria-label="Turniername"
      >

      <input
        id="tDate"
        type="date"
        aria-label="Turnierdatum"
      >
    </div>

    <div id="gameForm">
      <h3>Spiel hinzufügen</h3>

      <div class="form-row">
        <select id="player1">
          <option value="">Spieler 1</option>
        </select>

        <select id="player2">
          <option value="">Spieler 2</option>
        </select>
      </div>

      <div class="player-row">
        <strong>Spieler 1</strong>
        <input id="p1-s" placeholder="S">
        <input id="p1-n" placeholder="N">
        <input id="p1-gl" placeholder="GL">
        <input id="p1-vl" placeholder="VL">
        <input id="p1-avg" placeholder="AVG">
        <input id="p1-dq" placeholder="DQ %">
      </div>

      <div class="player-row">
        <strong>Spieler 2</strong>
        <input id="p2-s" placeholder="S">
        <input id="p2-n" placeholder="N">
        <input id="p2-gl" placeholder="GL">
        <input id="p2-vl" placeholder="VL">
        <input id="p2-avg" placeholder="AVG">
        <input id="p2-dq" placeholder="DQ %">
      </div>

      <button class="primary" id="addGameBtn">
        ➕ Spiel hinzufügen
      </button>

      <ul id="gameList"></ul>
    </div>

    <div class="button-row">
      <button class="primary" id="saveBtn">
        💾 Turnier speichern
      </button>

      <button class="secondary" id="cancelBtn" style="display:none;">
        ✖ Abbrechen
      </button>
    </div>
  </section>

  <!-- FILTER -->
  <section class="card">
    <h2>Zeitraum wählen</h2>

    <div class="form-row">
      <select id="yearFilter"></select>
      <select id="monthFilter"></select>
      <button id="applyFilterBtn">Anwenden</button>
    </div>
  </section>

  <!-- RANGLISTE -->
  <section class="card">
    <h2>Gesamtrangliste</h2>
    <div id="ranking"></div>
  </section>

  <!-- TURNIERE -->
  <section class="card">
    <h2>Gespeicherte Turniere</h2>
    <div id="tournamentList"></div>
  </section>

  <!-- STATISTIKEN -->
  <section class="card">
    <h2>AVG Statistik</h2>
    <canvas id="avgBarChart"></canvas>
  </section>

  <section class="card">
    <h2>AVG Trend</h2>
    <canvas id="avgTrendChart"></canvas>
  </section>

  <section class="card">
    <h2>DQ Statistik</h2>
    <canvas id="dqBarChart"></canvas>
  </section>

  <section class="card">
    <h2>DQ Trend</h2>
    <canvas id="dqTrendChart"></canvas>
  </section>

  <section class="card">
    <h2>Siege</h2>
    <canvas id="winsChart"></canvas>
  </section>

  <section class="card">
    <h2>Differenz (GL − VL)</h2>
    <canvas id="diffChart"></canvas>
  </section>

</div>

<!-- DEIN KOMPLETTER JAVASCRIPT CODE -->
<script type="module" src="script.js"></script>

</body>
</html>

/* --------------------------------------------------------
   STILI GENERALI E RESET
-------------------------------------------------------- */
* { 
  margin: 0; 
  padding: 0; 
  box-sizing: border-box; 
}

body {
  font-family: 'Segoe UI', Roboto, Arial, sans-serif;
  background: #121212;
  color: #e5e5e5;
  padding: 20px;
}

header {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  background: #1f1f1f;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 2px solid #0057b8;
  z-index: 1000;
}

header img { height: 40px; }
header h1 { font-size: 20px; font-weight: 700; }

/* --------------------------------------------------------
   MENU DI NAVIGAZIONE
-------------------------------------------------------- */
#menu {
  margin-top: 80px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

#menu button {
  background: #0057b8;
  color: white;
  border: none;
  padding: 10px 18px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  width: auto; /* Sovrascrive il button generico delle pagine */
}

#menu button:hover { 
  background: #003f82; 
  transform: translateY(-2px); 
}

/* --------------------------------------------------------
   STRUTTURA PAGINE E COMPONENTI DI INPUT
-------------------------------------------------------- */
.page {
  background: #1f1f1f;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.4);
  max-width: 600px;
  margin: 20px auto;
}

.page h2 { 
  margin-bottom: 15px; 
  font-size: 22px; 
  color: #4da3ff; 
}

/* Allarga le pagine dei monitor per far spazio alle tabelle */
#pageMonitorIn, #pageMonitorOut {
  max-width: 90%;
}

input {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 2px solid #333;
  background: #2a2a2a;
  color: #e5e5e5;
  border-radius: 6px;
}

button {
  background: #0057b8;
  color: white;
  border: none;
  padding: 10px;
  width: 100%;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  font-weight: 600;
  transition: background 0.2s ease;
}

button:hover { 
  background: #003f82; 
}

video, canvas {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #000;
}

/* --------------------------------------------------------
   TABELLE (MONITOR)
-------------------------------------------------------- */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
}

.table th, .table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #333;
  font-size: 14px;
}

.table th {
  background: #252525;
  color: #4da3ff;
  font-weight: 600;
}

.table tbody tr:hover {
  background: #222;
}

.table button {
  width: auto;
  padding: 5px 10px;
  margin: 0;
  font-size: 12px;
}

/* --------------------------------------------------------
   GRIGLIA PARK MAP (ZONE E CELLE)
-------------------------------------------------------- */
#pagePark {
  max-width: 95%;
}

#parkGrid h3 {
  margin: 25px 0 10px 0;
  padding-left: 10px;
  font-size: 16px;
  text-transform: uppercase;
  font-weight: bold;
}

.parkRow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.parkCell {
  background: #2a2a2a;
  color: #a0a0a0;
  border: 1px solid #444;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  min-width: 95px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: help;
}

/* --- Indicatori delle sezioni del parcheggio --- */
.title-buca { color: #4da3ff; border-left: 4px solid #0057b8; }
.title-parkA { color: #4eff4d; border-left: 4px solid #00b806; }
.title-parkB { color: #ffad4d; border-left: 4px solid #b86200; }
.title-parkC { color: #d14dff; border-left: 4px solid #7d00b8; }
.title-attesaC { color: #c49a6c; border-left: 4px solid #6e4a21; }
.title-parkY2 { color: #ff4d4d; border-left: 4px solid #b80000; }

/* --- Stili di occupazione dinamici gestiti via JS --- */
.parkCell.occupato {
  color: #ffffff !important;
  border-color: #ffffff !important;
  box-shadow: 0 0 8px rgba(255,255,255,0.2);
  font-weight: bold;
}

/* Varianti colore per celle occupate */
.parkCell.occupato.buca-full { background: #0057b8 !important; }
.parkCell.occupato.parkA-full { background: #00b806 !important; }
.parkCell.occupato.parkB-full { background: #b86200 !important; }
.parkCell.occupato.parkC-full { background: #7d00b8 !important; }
.parkCell.occupato.attesaC-full { background: #6e4a21 !important; }
.parkCell.occupato.parkY2-full { background: #b80000 !important; }

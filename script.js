/* ------------------------------
   CAMBIO PAGINE
------------------------------ */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
}

// Avvio sulla schermata di Inbound
showPage("pageInbound");

/* ------------------------------
   CONFIGURAZIONE FIREBASE
------------------------------ */
firebase.initializeApp({
  apiKey: "AIzaSyA0fRxfAzL4QVwK4T4Qi1MoQXkyfUBVOIY",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebasedatabase.app",
  projectId: "gestione-camion",
  storageBucket: "gestione-camion.firebasestorage.app",
  messagingSenderId: "6255743448",
  appId: "1:6255743448:web:6d5b6b9c2f125f61ee22ad",
  measurementId: "G-QVFVZDLKNX"
});

const db = firebase.database();

/* ------------------------------
   CAMERA POSTERIORE
------------------------------ */
async function startRearCamera(videoElement) {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === "videoinput");

    let rearCamera = videoDevices.find(d =>
      d.label.toLowerCase().includes("back") ||
      d.label.toLowerCase().includes("rear")
    );

    let constraints;
    if (rearCamera) {
      constraints = { video: { deviceId: rearCamera.deviceId } };
    } else {
      constraints = { video: { facingMode: "environment" } };
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;

  } catch (err) {
    console.error("Errore attivazione fotocamera:", err);
  }
}

// Inizializza i flussi video per le due schermate
startRearCamera(video);
startRearCamera(videoOut);

/* ------------------------------
   CATTURA FOTO (CANVAS)
------------------------------ */
snap.onclick = () => {
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
};

snapOut.onclick = () => {
  canvasOut.getContext("2d").drawImage(videoOut, 0, 0, canvasOut.width, canvasOut.height);
};

/* ------------------------------
   VALIDAZIONE DESTINAZIONE AGGIORNATA
------------------------------ */
function validaDestinazione(dest) {
  dest = dest.trim().toUpperCase();

  // Verifica se l'ID esiste fisicamente nella nuova mappa parcheggi del DOM
  const cellTarget = document.getElementById("cell-" + dest);
  if (cellTarget) {
    return { tipo: "PARK", valore: dest };
  }

  // Verifica se la destinazione è una Baia di carico standard (valore numerico 1-199)
  const num = parseInt(dest);
  if (!isNaN(num) && num >= 1 && num <= 199) {
    return { tipo: "BAIA", valore: dest.padStart(2, "0") };
  }

  return null;
}

/* ------------------------------
   RESET CAMPI INPUT
------------------------------ */
function resetInbound() {
  targa.value = "";
  vettore.value = "";
  quantita.value = "";
  linea.value = "";
  destinazione.value = "";
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function resetOutbound() {
  targaOut.value = "";
  canvasOut.getContext("2d").clearRect(0, 0, canvasOut.width, canvasOut.height);
}

/* ------------------------------
   POPUP NOTIFICA
------------------------------ */
function popupRegistrato() {
  alert("REGISTRATO CON SUCCESSO");
}

/* ------------------------------
   MOSTRA FOTO IN POPUP BROWSER
------------------------------ */
function mostraFoto(base64Data) {
  if (!base64Data || base64Data.length < 100) {
    alert("Foto non disponibile o non acquisita.");
    return;
  }
  const win = window.open();
  win.document.write(`<img src="${base64Data}" style="max-width:100%; border-radius:8px;" alt="Foto Mezzo">`);
}

/* ------------------------------
   CANCELLAZIONE RECORD DEFINITIVA
------------------------------ */
function cancella(id) {
  if (!confirm("Sei sicuro di voler eliminare definitivamente questo record?")) return;
  db.ref("camion/" + id).remove();
}

/* ------------------------------
   LOGICA REGISTRAZIONE INBOUND
------------------------------ */
registraInbound.onclick = () => {
  const targaVal = targa.value.trim().toUpperCase();
  const vettoreVal = vettore.value.trim();
  const quantitaVal = quantita.value.trim();
  const lineaVal = linea.value.trim();
  const destInput = destinazione.value.trim();

  if (!targaVal) return alert("Inserisci la targa!");

  const valid = validaDestinazione(destInput);
  if (!valid) return alert("Destinazione NON valida!");

  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();

    // Controllo se la destinazione selezionata ha già un mezzo presente
    let occupato = false;
    if (data) {
      Object.entries(data).forEach(([id, c]) => {
        if (c.destinazione === valid.valore && !c.uscita) {
          occupato = true;
        }
      });
    }

    if (occupato) {
      alert("Destinazione già occupata! Libera lo spazio prima di registrare un altro mezzo.");
      return;
    }

    // Se la stessa targa entrava già senza essere uscita, rimuovi il vecchio record sporco
    if (data) {
      Object.entries(data).forEach(([id, c]) => {
        if (c.targa.toUpperCase() === targaVal && !c.uscita) {
          db.ref("camion/" + id).remove();
        }
      });
    }

    const nuovo = {
      targa: targaVal,
      vettore: vettoreVal,
      quantita: quantitaVal,
      linea: lineaVal,
      destinazione: valid.valore,
      tipo: valid.tipo,
      ingresso: new Date().toLocaleString(),
      uscita: null,
      fotoIn: canvas.toDataURL(),
      fotoOut: ""
    };

    db.ref("camion").push(nuovo);

    popupRegistrato();
    resetInbound();
  });
};

/* ------------------------------
   LOGICA REGISTRAZIONE OUTBOUND
------------------------------ */
registraOutbound.onclick = () => {
  const targaOutVal = targaOut.value.trim().toUpperCase();
  if (!targaOutVal) return alert("Inserisci la targa in uscita!");

  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) return alert("Nessun mezzo presente all'interno del sito.");

    const id = Object.keys(data).find(key =>
      data[key].targa.toUpperCase() === targaOutVal && !data[key].uscita
    );

    if (!id) return alert("Targa non trovata all'interno del sito!");

    db.ref("camion/" + id).update({
      uscita: new Date().toLocaleString(),
      fotoOut: canvasOut.toDataURL()
    });

    popupRegistrato();
    resetOutbound();
  });
};

/* ------------------------------
   TRATTORISTI: MODIFICA DESTINAZIONE INTERNA
------------------------------ */
btnModificaDest.onclick = () => {
  const inputTarga = trattTarga.value.trim().toUpperCase();
  const inputDest = trattDest.value.trim().toUpperCase();

  if (!inputTarga && !inputDest) {
    alert("Inserisci TARGA oppure DESTINAZIONE attuale.");
    return;
  }

  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) return alert("Nessun camion presente in sito.");

    let trovatoId = null;

    if (inputTarga) {
      Object.entries(data).forEach(([id, c]) => {
        if (!c.uscita && c.targa.toUpperCase() === inputTarga) {
          trovatoId = id;
        }
      });
    }

    if (!trovatoId && inputDest) {
      Object.entries(data).forEach(([id, c]) => {
        if (!c.uscita && c.destinazione.toUpperCase() === inputDest) {
          trovatoId = id;
        }
      });
    }

    if (!trovatoId) {
      alert("Nessun camion trovato con i dettagli inseriti.");
      return;
    }

    const nuovaDest = nuovaDestinazione.value.trim().toUpperCase();
    if (!nuovaDest) return alert("Inserisci la NUOVA DESTINAZIONE.");

    const valid = validaDestinazione(nuovaDest);
    if (!valid) return alert("Nuova destinazione NON valida!");

    // Controlla se lo spazio di destinazione finale è libero
    let occupato = false;
    Object.values(data).forEach(c => {
      if (!c.uscita && c.destinazione === valid.valore) {
        occupato = true;
      }
    });

    if (occupato) return alert("La nuova destinazione selezionata è già occupata!");

    db.ref("camion/" + trovatoId).update({
      destinazione: valid.valore,
      tipo: valid.tipo
    });

    trattTarga.value = "";
    trattDest.value = "";
    nuovaDestinazione.value = "";

    alert("SPOSTAMENTO REGISTRATO");
  });
};

/* ------------------------------
   ASCOLTO SINCRONO REALTIME (TABELLE + AGGIORNAMENTO PARK)
------------------------------ */
db.ref("camion").on("value", snapshot => {
  const data = snapshot.val();
  
  const monitorIn = document.getElementById("monitorIn");
  const monitorOut = document.getElementById("monitorOut");
  
  monitorIn.innerHTML = "";
  monitorOut.innerHTML = "";

  // Reset visivo totale delle classi delle celle del parcheggio
  document.querySelectorAll(".parkCell").forEach(cell => {
    cell.className = "parkCell"; // Pulisce tutte le classi aggiuntive di occupazione
    cell.title = "Libero";
  });

  if (!data) return;

  // Mostra i record dal più recente invertendo la lista
  const recordOrdinati = Object.entries(data).reverse();

  recordOrdinati.forEach(([id, c]) => {
    if (!c.uscita) {
      // 1. Popola Monitor IN SITO
      const rowIn = `<tr>
        <td><b>${c.destinazione}</b></td>
        <td>${c.tipo}</td>
        <td>${c.targa}</td>
        <td>${c.linea || "-"}</td>
        <td>${c.ingresso}</td>
        <td><button onclick="mostraFoto('${c.fotoIn}')"><i class="fa-solid fa-image"></i></button></td>
        <td><button style="background:#cc0000;" onclick="cancella('${id}')"><i class="fa-solid fa-trash"></i></button></td>
      </tr>`;
      monitorIn.innerHTML += rowIn;

      // 2. Colora la cella del parcheggio in base alla zona di appartenenza
      const cellaElement = document.getElementById("cell-" + c.destinazione);
      if (cellaElement) {
        cellaElement.classList.add("occupato");

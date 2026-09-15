/* ------------------------------
   CAMBIO PAGINE
------------------------------ */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
}

showPage("pageInbound");

/* ------------------------------
   FIREBASE
------------------------------ */
firebase.initializeApp({
  apiKey: "AIzaSyA0fRxfAzL4QVwK4T4Qi1MoQXkyfUBVOIY",
  authDomain: "gestione-camion.firebaseapp.com",
  databaseURL: "https://gestione-camion-default-rtdb.europe-west1.firebasedatabase.app",
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
    console.error("Errore fotocamera:", err);
  }
}

startRearCamera(video);
startRearCamera(videoOut);

/* ------------------------------
   FOTO
------------------------------ */
snap.onclick = () => {
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
};

snapOut.onclick = () => {
  canvasOut.getContext("2d").drawImage(videoOut, 0, 0, canvasOut.width, canvasOut.height);
};

/* ------------------------------
   DESTINAZIONE
------------------------------ */
function validaDestinazione(dest) {
  dest = dest.trim().toUpperCase();

  const num = parseInt(dest);
  if (!isNaN(num) && num >= 1 && num <= 199) {
    return { tipo: "BAIA", valore: dest.padStart(2, "0") };
  }

  if (dest.startsWith("TRA")) {
    return { tipo: "PARK", valore: dest };
  }

  if (/^[A-Z]/.test(dest)) {
    return { tipo: "PARK", valore: dest };
  }

  return null;
}

/* ------------------------------
   RESET
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
   POPUP
------------------------------ */
function popupRegistrato() {
  alert("REGISTRATO");
}

/* ------------------------------
   CANCELLA
------------------------------ */
function cancella(id) {
  if (!confirm("Sei sicuro?")) return;
  db.ref("camion/" + id).remove();
}

/* ------------------------------
   INBOUND
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

    let occupato = false;
    if (data) {
      Object.entries(data).forEach(([id, c]) => {
        if (c.destinazione === valid.valore && !c.uscita) {
          occupato = true;
        }
      });
    }

    if (occupato) {
      alert("Destinazione già occupata! Libera la baia/park prima di registrare un altro mezzo.");
      return;
    }

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
      fotoOut: null
    };

    db.ref("camion").push(nuovo);

    popupRegistrato();
    resetInbound();
  });
};

/* ------------------------------
   OUTBOUND
------------------------------ */
registraOutbound.onclick = () => {
  const targaOutVal = targaOut.value.trim().toUpperCase();

  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const id = Object.keys(data).find(key =>
      data[key].targa.toUpperCase() === targaOutVal && !data[key].uscita
    );

    if (!id) return alert("Targa non trovata!");

    db.ref("camion/" + id).update({
      uscita: new Date().toLocaleString(),
      fotoOut: canvasOut.toDataURL()
    });

    popupRegistrato();
    resetOutbound();
  });
};

/* ------------------------------
   TRATTORISTI: modifica destinazione
------------------------------ */
btnModificaDest.onclick = () => {
  const inputTarga = trattTarga.value.trim().toUpperCase();
  const inputDest = trattDest.value.trim().toUpperCase();

  if (!inputTarga && !inputDest) {
    alert("Inserisci TARGA oppure DESTINAZIONE.");
    return;
  }

  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) {
      alert("Nessun camion in sito.");
      return;
    }

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
      alert("Nessun camion trovato con i dati inseriti.");
      return;
    }

    const nuovaDest = nuovaDestinazione.value.trim().toUpperCase();
    if (!nuovaDest) {
      alert("Inserisci la NUOVA DESTINAZIONE.");
      return;
    }

    const valid = validaDestinazione(nuovaDest);
    if (!valid) {
      alert("Nuova destinazione NON valida!");
      return;
    }

    let occupato = false;
    Object.values(data).forEach(c => {
      if (!c.uscita && c.destinazione === valid.valore) {
        occupato = true;
      }
    });

    if (occupato) {
      alert("La nuova destinazione è già occupata!");
      return;
    }

    db.ref("camion/" + trovatoId).update({
      destinazione: valid.valore,
      tipo: valid.tipo
    });

    trattTarga.value = "";
    trattDest.value = "";
    nuovaDestinazione.value = "";

    alert("REGISTRATO");
    aggiornaPark();
  });
};

/* ------------------------------
   EXPORT EXCEL (XLSX)
------------------------------ */
function exportExcel(dataArray, filename) {
  const worksheet = XLSX.utils.aoa_to_sheet(dataArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dati");
  XLSX.writeFile(workbook, filename + ".xlsx");
}

function exportInExcel() {
  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    let rows = [["Destinazione","Tipo","Targa","Linea","Ingresso"]];
    Object.values(data).forEach(c => {
      if (!c.uscita) {
        rows.push([c.destinazione, c.tipo, c.targa, c.linea || "", c.ingresso]);
      }
    });

    exportExcel(rows, "IN_SITO");
  });
}

function exportOutExcel() {
  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    let rows = [["Destinazione","Tipo","Targa","Linea","Ingresso","Uscita"]];
    Object.values(data).forEach(c => {
      if (c.uscita) {
        rows.push([c.destinazione, c.tipo, c.targa, c.linea || "", c.ingresso, c.uscita]);
      }
    });

    exportExcel(rows, "USCITI");
  });
}

/* ------------------------------
   PARK: colori verde/rosso
------------------------------ */
function aggiornaPark() {
  document.querySelectorAll(".parkCell").forEach(cell => {
    cell.style.background = "green";
  });

  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    Object.values(data).forEach(c => {
      if (!c.uscita) {
        const id = "cell-" + c.destinazione;
        const cell = document.getElementById(id);
        if (cell) cell.style.background = "red";
      }
    });
  });
}

setInterval(aggiornaPark, 3000);

/* ------------------------------
   MONITOR
------------------------------ */
db.ref("camion").on("value", snapshot => {
  monitorIn.innerHTML = "";
  monitorOut.innerHTML = "";

  const data = snapshot.val();
  if (!data) return;

  Object.entries(data).forEach(([id, c]) => {
    if (!c.uscita) {
      monitorIn.innerHTML += `
        <tr>
          <td>${c.destinazione}</td>
          <td>${c.tipo}</td>
          <td>${c.targa}</td>
          <td>${c.linea || ""}</td>
          <td>${c.ingresso}</td>
          <td><img src="${c.fotoIn}" width="80"></td>
          <td><i class="fa-solid fa-xmark deleteBtn" onclick="cancella('${id}')"></i></td>
        </tr>`;
    } else {
      monitorOut.innerHTML += `
        <tr>
          <td>${c.destinazione}</td>
          <td>${c.tipo}</td>
          <td>${c.targa}</td>
          <td>${c.linea || ""}</td>
          <td>${c.ingresso}</td>
          <td>${c.uscita}</td>
          <td><img src="${c.fotoOut}" width="80"></td>
          <td><i class="fa-solid fa-xmark deleteBtn" onclick="cancella('${id}')"></i></td>
        </tr>`;
    }
  });

  aggiornaPark();
});

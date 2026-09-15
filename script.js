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
  const destInput = destinazione.value.trim();

  if (!targaVal) return alert("Inserisci la targa!");

  const valid = validaDestinazione(destInput);
  if (!valid) return alert("Destinazione NON valida!");

  /* Cancella vecchia registrazione della stessa targa */
  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([id, c]) => {
        if (c.targa.toUpperCase() === targaVal && !c.uscita) {
          db.ref("camion/" + id).remove();
        }
      });
    }
  });

  const nuovo = {
    targa: targaVal,
    vettore: vettoreVal,
    quantita: quantitaVal,
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
   EXPORT CSV
------------------------------ */
function exportCSV(rows, filename) {
  let csv = rows.map(r => r.join(",")).join("\n");
  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

function exportIn() {
  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    let rows = [["Destinazione","Tipo","Targa","Ingresso"]];
    Object.values(data).forEach(c => {
      if (!c.uscita) {
        rows.push([c.destinazione, c.tipo, c.targa, c.ingresso]);
      }
    });

    exportCSV(rows, "IN_SITO.csv");
  });
}

function exportOut() {
  db.ref("camion").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    let rows = [["Destinazione","Tipo","Targa","Ingresso","Uscita"]];
    Object.values(data).forEach(c => {
      if (c.uscita) {
        rows.push([c.destinazione, c.tipo, c.targa, c.ingresso, c.uscita]);
      }
    });

    exportCSV(rows, "USCITI.csv");
  });
}

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
          <td>${c.ingresso}</td>
          <td>${c.uscita}</td>
          <td><img src="${c.fotoOut}" width="80"></td>
          <td><i class="fa-solid fa-xmark deleteBtn" onclick="cancella('${id}')"></i></td>
        </tr>`;
    }
  });
});

/* ------------------------------
   FUNZIONE showPage
------------------------------ */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
}

/* ------------------------------
   MOSTRA SUBITO INBOUND
------------------------------ */
showPage("pageInbound");

/* ------------------------------
   FIREBASE IMPORT
------------------------------ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove }
  from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

/* ------------------------------
   FIREBASE CONFIG
------------------------------ */
const firebaseConfig = {
  apiKey: "AIzaSyA0fRxfAzL4QVwK4T4Qi1MoQXkyfUBVOIY",
  authDomain: "gestione-camion.firebaseapp.com",
  databaseURL: "https://gestione-camion-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gestione-camion",
  storageBucket: "gestione-camion.firebasestorage.app",
  messagingSenderId: "6255743448",
  appId: "1:6255743448:web:6d5b6b9c2f125f61ee22ad",
  measurementId: "G-QVFVZDLKNX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ------------------------------
   WEBCAM
------------------------------ */
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => videoOut.srcObject = stream);

snap.onclick = () => {
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
};

snapOut.onclick = () => {
  canvasOut.getContext("2d").drawImage(videoOut, 0, 0, canvasOut.width, canvasOut.height);
};

/* ------------------------------
   DESTINAZIONE AUTOMATICA
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
   RESET FORM
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
   CANCELLAZIONE
------------------------------ */
function cancella(id) {
  if (!confirm("Sei sicuro di voler cancellare?")) return;
  remove(ref(db, "camion/" + id));
}

/* ------------------------------
   INBOUND
------------------------------ */
registraInbound.onclick = () => {
  const targaVal = targa.value.trim();
  const vettoreVal = vettore.value.trim();
  const quantitaVal = quantita.value.trim();
  const destInput = destinazione.value.trim();

  if (!targaVal) return alert("Inserisci la targa!");

  const valid = validaDestinazione(destInput);
  if (!valid) return alert("Destinazione NON valida!");

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

  const newRef = push(ref(db, "camion"));
  set(newRef, nuovo);

  popupRegistrato();
  resetInbound();
};

/* ------------------------------
   OUTBOUND
------------------------------ */
registraOutbound.onclick = () => {
  const targaOutVal = targaOut.value.trim();

  onValue(ref(db, "camion"), snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const id = Object.keys(data).find(key => data[key].targa === targaOutVal && !data[key].uscita);
    if (!id) return alert("Targa non trovata!");

    set(ref(db, "camion/" + id + "/uscita"), new Date().toLocaleString());
    set(ref(db, "camion/" + id + "/fotoOut"), canvasOut.toDataURL());

    popupRegistrato();
    resetOutbound();
  }, { onlyOnce: true });
};

/* ------------------------------
   MONITOR REALTIME
------------------------------ */
onValue(ref(db, "camion"), snapshot => {
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
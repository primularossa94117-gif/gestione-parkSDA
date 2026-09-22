/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "TUO_API_KEY",
    authDomain: "gestione-camion.firebaseapp.com",
    databaseURL: "https://gestione-camion-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "gestione-camion",
    storageBucket: "gestione-camion.firebasestorage.app",
    messagingSenderId: "TUO_MESSAGING_SENDER_ID",
    appId: "TUO_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();


/* =========================================================
   STATO
========================================================= */

let camionData = {};
let selectedParkId = null;


/* =========================================================
   PARCHEGGI
========================================================= */

const parkGroups = [

    {
        nome: "BUCA",
        parcheggi: [
            "BUCA1",
            "BUCA2",
            "BUCA3",
            "BUCA4",
            "BUCA5",
            "BUCA6",
            "BUCA7",
            "BUCA8",
            "BUCA9",
            "BUCA10",

            "BUCA157",
            "BUCA156",
            "BUCA155",
            "BUCA154",
            "BUCA153",
            "BUCA152",
            "BUCA151",
            "BUCA150",
            "BUCA149",
            "BUCA148"
        ]
    },

    {
        nome: "PARK A",
        parcheggi: [
            "A01",
            "A02",
            "A03",
            "A04",
            "A05",
            "A06",
            "A07",
            "A08",
            "A09",
            "A10",
            "A11",
            "A12",
            "A13",
            "A14",
            "A15",
            "A16",

            "TRA12-13",
            "TRA18-19-1",
            "TRA18-19-2"
        ]
    },

    {
        nome: "PARK B",
        parcheggi: [
            "INIZIOPARKB1",
            "INIZIOPARKB2",

            "B01",
            "B02",
            "B03",
            "B04",
            "B05",
            "B06",
            "B07",
            "B08",
            "B09",

            "B010",
            "B011",
            "B012",
            "B013",
            "B014",
            "B015",
            "B016"
        ]
    },

    {
        nome: "PARK C",
        parcheggi: [
            "C01",
            "C02",
            "C03",
            "C04",
            "C05",
            "C06",
            "C07",
            "C08",
            "C09",
            "C10",
            "C11",

            "C13",
            "C14",
            "C15",
            "C16",
            "C17",

            "C19",
            "C21",
            "C22",

            "C24",
            "C25",
            "C26",

            "C29",
            "C30",
            "C31",
            "C32",
            "C33",
            "C34",
            "C35"
        ]
    },

    {
        nome: "ATTESA PARK C",
        parcheggi: [
            "C31ATTESA",
            "C32ATTESA",
            "C33ATTESA",
            "C34ATTESA",
            "C35ATTESA",
            "C36ATTESA"
        ]
    },

    {
        nome: "PARK Y2",
        parcheggi: [
            "Y2-1",
            "Y2-2",
            "Y2-3",
            "Y2-4",
            "Y2-5",
            "Y2-6",
            "Y2-7",
            "Y2-8",
            "Y2-9",
            "Y2-10",
            "Y2-11",
            "Y2-12",
            "Y2-13",
            "Y2-14",
            "Y2-15",
            "Y2-16",
            "Y2-17",
            "Y2-18",
            "Y2-19",
            "Y2-20",

            "Y2-133-134",
            "Y2-139-140",
            "Y2-018-019-1",
            "Y2-018-019-2",
            "Y2-TRA12-13",
            "Y2-FRONTEC30",
            "Y2-FRONTECOMP1",
            "Y2-FRONTECOMP2",
            "Y2-FRONTECOMP3",
            "Y2-TRA132-133",
            "Y2-TRA128-129",
            "Y2-TRA123-124",
            "Y2-TRA152-152"
        ]
    }

];


const parcheggi = parkGroups.flatMap(
    gruppo => gruppo.parcheggi
);


/* =========================================================
   CAMBIO PAGINA
========================================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.style.display = "none";
        });


    document
        .querySelectorAll(".menuBtn")
        .forEach(button => {
            button.classList.remove("active");
        });


    const page = document.getElementById(pageId);

    if (page) {
        page.style.display = "block";
    }


    const buttons = document.querySelectorAll(".menuBtn");

    buttons.forEach(button => {

        const onclick = button.getAttribute("onclick") || "";

        if (onclick.includes(pageId)) {
            button.classList.add("active");
        }

    });


    if (pageId === "pageDashboard") {
        aggiornaDashboard();
    }


    if (pageId === "pagePark") {
        aggiornaPark();
    }


    if (
        pageId === "pageInSito" ||
        pageId === "pageUsciti"
    ) {
        aggiornaMonitor();
    }

}


/* =========================================================
   CREA PARK
========================================================= */

function creaPark() {

    const container = document.getElementById("parkGrid");

    if (!container) return;

    container.innerHTML = "";


    parkGroups.forEach(gruppo => {

        const section = document.createElement("div");

        section.className = "parkSection";


        const title = document.createElement("div");

        title.className = "parkGroupTitle";

        title.textContent = gruppo.nome;


        const row = document.createElement("div");

        row.className = "parkRow";


        gruppo.parcheggi.forEach(location => {

            const cell = document.createElement("div");

            cell.className = "parkCell";

            cell.id =
                "cell-" +
                location.replace(/[^a-zA-Z0-9_-]/g, "_");

            cell.textContent = location;

            cell.onclick = () =>
                apriDettaglioPark(location);


            row.appendChild(cell);

        });


        section.appendChild(title);

        section.appendChild(row);

        container.appendChild(section);

    });

}


/* =========================================================
   SELECT DESTINAZIONI
========================================================= */

function popolaSelectDestinazioni() {

    const selects = [
        document.getElementById("destinazione"),
        document.getElementById("nuovaDestinazione")
    ];


    selects.forEach(select => {

        if (!select) return;


        const valoreAttuale = select.value;


        select.innerHTML = "";


        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            select.id === "destinazione"
                ? "Seleziona parcheggio..."
                : "Seleziona nuova destinazione...";


        select.appendChild(defaultOption);


        parkGroups.forEach(gruppo => {

            const optgroup =
                document.createElement("optgroup");

            optgroup.label = gruppo.nome;


            gruppo.parcheggi.forEach(park => {

                const option =
                    document.createElement("option");

                option.value = park;

                option.textContent = park;


                const camion =
                    trovaCamionPark(park);


                if (
                    select.id === "destinazione" &&
                    camion
                ) {

                    option.disabled = true;

                    option.textContent =
                        `${park} — OCCUPATO`;

                }


                optgroup.appendChild(option);

            });


            select.appendChild(optgroup);

        });


        if (
            valoreAttuale &&
            [...select.options].some(
                option => option.value === valoreAttuale
            )
        ) {
            select.value = valoreAttuale;
        }

    });

}


/* =========================================================
   TROVA CAMION PARK
========================================================= */

function trovaCamionPark(location) {

    for (const id in camionData) {

        const camion = camionData[id];

        if (
            camion &&
            !camion.uscita &&
            camion.destinazione === location
        ) {

            return {
                id,
                ...camion
            };

        }

    }

    return null;
}


/* =========================================================
   AGGIORNA PARK
========================================================= */

function aggiornaPark() {

    parcheggi.forEach(location => {

        const id =
            "cell-" +
            location.replace(/[^a-zA-Z0-9_-]/g, "_");


        const cell =
            document.getElementById(id);


        if (!cell) return;


        cell.classList.remove("occupato");

        cell.title = "Libero";


        const camion =
            trovaCamionPark(location);


        if (camion) {

            cell.classList.add("occupato");

            cell.title =
                `Occupato - ${camion.targa || ""}`;

        }

    });


    popolaSelectDestinazioni();

}


/* =========================================================
   VALIDAZIONE DESTINAZIONE
========================================================= */

function validaDestinazione(dest) {

    if (!dest) return null;


    if (parcheggi.includes(dest)) {

        return {
            tipo: "PARK",
            valore: dest
        };

    }


    const numero =
        parseInt(dest, 10);


    if (
        !isNaN(numero) &&
        numero >= 1 &&
        numero <= 199
    ) {

        return {
            tipo: "BAIA",
            valore: String(numero).padStart(2, "0")
        };

    }


    return null;

}


/* =========================================================
   CAMERA
========================================================= */

async function startRearCamera(video) {

    if (!video) return;


    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },
                audio: false
            });


        video.srcObject = stream;

    } catch (error) {

        console.error(
            "Errore fotocamera:",
            error
        );

        alert(
            "Impossibile accedere alla fotocamera."
        );

    }

}


/* =========================================================
   SCATTO FOTO INBOUND
========================================================= */

function scattaFoto(videoId, canvasId) {

    const video =
        document.getElementById(videoId);

    const canvas =
        document.getElementById(canvasId);


    if (!video || !canvas) return null;


    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        alert(
            "La fotocamera non è ancora pronta."
        );

        return null;

    }


    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;


    const ctx =
        canvas.getContext("2d");


    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    canvas.style.display = "block";


    return canvas.toDataURL(
        "image/jpeg",
        0.8
    );

}


/* =========================================================
   INBOUND
========================================================= */

async function registraInbound() {

    const targa =
        document
            .getElementById("targa")
            .value
            .trim()
            .toUpperCase();


    const vettore =
        document
            .getElementById("vettore")
            .value
            .trim();


    const quantita =
        document
            .getElementById("quantita")
            .value
            .trim();


    const linea =
        document
            .getElementById("linea")
            .value
            .trim();


    const attesa =
        document
            .getElementById("attesa")
            .value;


    const destinazione =
        document
            .getElementById("destinazione")
            .value;


    if (!targa) {

        alert("Inserisci la targa.");

        return;

    }


    if (!destinazione) {

        alert(
            "Seleziona una destinazione."
        );

        return;

    }


    const destinazioneValida =
        validaDestinazione(destinazione);


    if (!destinazioneValida) {

        alert(
            "Destinazione non valida."
        );

        return;

    }


    const occupato =
        trovaCamionPark(
            destinazione
        );


    if (occupato) {

        alert(
            `Il parcheggio ${destinazione} è già occupato.`
        );

        aggiornaPark();

        return;

    }


    const foto =
        scattaFoto(
            "video",
            "canvas"
        );


    let existingId = null;


    for (const id in camionData) {

        const camion = camionData[id];


        if (
            camion &&
            !camion.uscita &&
            String(camion.targa).toUpperCase() === targa
        ) {

            existingId = id;

            break;

        }

    }


    const ingresso =
        formatDataItaliana(
            new Date()
        );


    const record = {

        targa,

        vettore,

        quantita,

        linea,

        attesa,

        destinazione:
            destinazioneValida.valore,

        tipo:
            destinazioneValida.tipo,

        ingresso,

        uscita: null,

        fotoIn:
            foto || null,

        fotoOut: null

    };


    try {

        if (existingId) {

            await db
                .ref("camion/" + existingId)
                .update(record);

        } else {

            await db
                .ref("camion")
                .push(record);

        }


        alert(
            "Inbound registrato correttamente."
        );


        resetInbound();


        aggiornaPark();

        aggiornaDashboard();

        aggiornaMonitor();

    } catch (error) {

        console.error(error);

        alert(
            "Errore durante la registrazione dell'inbound."
        );

    }

}


/* =========================================================
   RESET INBOUND
========================================================= */

function resetInbound() {

    [
        "targa",
        "vettore",
        "quantita",
        "linea"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });


    const destinazione =
        document.getElementById("destinazione");

    if (destinazione) {
        destinazione.value = "";
    }


    const canvas =
        document.getElementById("canvas");


    if (canvas) {

        canvas.style.display = "none";

        const ctx =
            canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }

}


/* =========================================================
   OUTBOUND
========================================================= */

async function registraOutbound() {

    const targa =
        document
            .getElementById("targaOut")
            .value
            .trim()
            .toUpperCase();


    if (!targa) {

        alert(
            "Inserisci la targa."
        );

        return;

    }


    let idTrovato = null;


    for (const id in camionData) {

        const camion = camionData[id];


        if (
            camion &&
            !camion.uscita &&
            String(camion.targa).toUpperCase() === targa
        ) {

            idTrovato = id;

            break;

        }

    }


    if (!idTrovato) {

        alert(
            "Mezzo non trovato tra quelli presenti in sito."
        );

        return;

    }


    const foto =
        scattaFoto(
            "videoOut",
            "canvasOut"
        );


    try {

        await db
            .ref("camion/" + idTrovato)
            .update({

                uscita:
                    formatDataItaliana(
                        new Date()
                    ),

                fotoOut:
                    foto || null

            });


        alert(
            "Outbound registrato correttamente."
        );


        resetOutbound();

        aggiornaMonitor();

        aggiornaDashboard();

        aggiornaPark();

    } catch (error) {

        console.error(error);

        alert(
            "Errore durante la registrazione dell'outbound."
        );

    }

}


/* =========================================================
   RESET OUTBOUND
========================================================= */

function resetOutbound() {

    const targa =
        document.getElementById("targaOut");

    if (targa) {
        targa.value = "";
    }


    const ricerca =
        document.getElementById("ricercaOutbound");

    if (ricerca) {
        ricerca.value = "";
    }


    const risultato =
        document.getElementById("risultatoOutbound");

    if (risultato) {
        risultato.innerHTML = "";
    }


    const canvas =
        document.getElementById("canvasOut");


    if (canvas) {

        canvas.style.display = "none";

        const ctx =
            canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }

}


/* =========================================================
   CERCA OUTBOUND
========================================================= */

function cercaOutbound() {

    const testo =
        document
            .getElementById("ricercaOutbound")
            .value
            .trim()
            .toUpperCase();


    const risultato =
        document.getElementById(
            "risultatoOutbound"
        );


    if (!testo) {

        risultato.innerHTML = "";

        return;

    }


    const trovati = [];


    for (const id in camionData) {

        const camion = camionData[id];


        if (
            camion &&
            !camion.uscita &&
            String(camion.targa)
                .toUpperCase()
                .includes(testo)
        ) {

            trovati.push({
                id,
                ...camion
            });

        }

    }


    if (!trovati.length) {

        risultato.innerHTML = `
            <div class="emptyState">
                <i class="fa-solid fa-circle-exclamation"></i>
                Nessun mezzo trovato.
            </div>
        `;

        return;

    }


    risultato.innerHTML =
        trovati.map(camion => `

            <div class="outboundResult">

                <strong>
                    ${escapeHtml(camion.targa || "")}
                </strong>

                <div style="margin-top:6px;color:#aaa;">
                    ${escapeHtml(camion.vettore || "")}
                    -
                    ${escapeHtml(camion.destinazione || "")}
                </div>

            </div>

        `).join("");


    document
        .getElementById("targaOut")
        .value = trovati[0].targa || "";

}


/* =========================================================
   MODIFICA DESTINAZIONE
========================================================= */

async function modificaDestinazione() {

    const targa =
        document
            .getElementById("trattTarga")
            .value
            .trim()
            .toUpperCase();


    const destinazione =
        document
            .getElementById("nuovaDestinazione")
            .value;


    if (!targa) {

        alert(
            "Inserisci la targa."
        );

        return;

    }


    if (!destinazione) {

        alert(
            "Seleziona la nuova destinazione."
        );

        return;

    }


    const destinazioneValida =
        validaDestinazione(destinazione);


    if (!destinazioneValida) {

        alert(
            "Destinazione non valida."
        );

        return;

    }


    let idTrovato = null;


    for (const id in camionData) {

        const camion = camionData[id];


        if (
            camion &&
            !camion.uscita &&
            String(camion.targa).toUpperCase() === targa
        ) {

            idTrovato = id;

            break;

        }

    }


    if (!idTrovato) {

        alert(
            "Mezzo non trovato."
        );

        return;

    }


    const occupato =
        trovaCamionPark(
            destinazione
        );


    if (
        occupato &&
        occupato.id !== idTrovato
    ) {

        alert(
            `Il parcheggio ${destinazione} è già occupato.`
        );

        return;

    }


    try {

        await db
            .ref(
                "camion/" + idTrovato
            )
            .update({

                destinazione:
                    destinazioneValida.valore,

                tipo:
                    destinazioneValida.tipo

            });


        alert(
            "Destinazione modificata correttamente."
        );


        document
            .getElementById("nuovaDestinazione")
            .value = "";


        aggiornaPark();

        aggiornaMonitor();

        aggiornaDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "Errore durante lo spostamento."
        );

    }

}


/* =========================================================
   MONITOR
========================================================= */

function aggiornaMonitor() {

    const tbodyIn =
        document.getElementById("monitorIn");

    const tbodyOut =
        document.getElementById("monitorOut");


    if (tbodyIn) {

        const ricerca =
            (
                document
                    .getElementById("ricercaInSito")
                    ?.value || ""
            )
            .trim()
            .toLowerCase();


        const filtroAttesa =
            document
                .getElementById("filtroAttesa")
                ?.value || "";


        const righe = [];


        for (const id in camionData) {

            const camion = camionData[id];


            if (!camion || camion.uscita) {
                continue;
            }


            const testo =
                [
                    camion.targa,
                    camion.vettore,
                    camion.destinazione,
                    camion.linea,
                    camion.tipo
                ]
                .join(" ")
                .toLowerCase();


            if (
                ricerca &&
                !testo.includes(ricerca)
            ) {
                continue;
            }


            if (
                filtroAttesa &&
                camion.attesa !== filtroAttesa
            ) {
                continue;
            }


            righe.push(
                creaRigaMonitorIn(
                    id,
                    camion
                )
            );

        }


        tbodyIn.innerHTML =
            righe.length
                ? righe.join("")
                : `
                    <tr>
                        <td colspan="11">
                            <div class="emptyState">
                                Nessun mezzo presente.
                            </div>
                        </td>
                    </tr>
                `;

    }


    if (tbodyOut) {

        const ricerca =
            (
                document
                    .getElementById("ricercaUsciti")
                    ?.value || ""
            )
            .trim()
            .toLowerCase();


        const righe = [];


        for (const id in camionData) {

            const camion = camionData[id];


            if (!camion || !camion.uscita) {
                continue;
            }


            const testo =
                [
                    camion.targa,
                    camion.vettore,
                    camion.destinazione,
                    camion.linea,
                    camion.tipo
                ]
                .join(" ")
                .toLowerCase();


            if (
                ricerca &&
                !testo.includes(ricerca)
            ) {
                continue;
            }


            righe.push(
                creaRigaMonitorOut(
                    id,
                    camion
                )
            );

        }


        tbodyOut.innerHTML =
            righe.length
                ? righe.join("")
                : `
                    <tr>
                        <td colspan="11">
                            <div class="emptyState">
                                Nessun mezzo uscito.
                            </div>
                        </td>
                    </tr>
                `;

    }

}


/* =========================================================
   RIGA MONITOR IN
========================================================= */

function creaRigaMonitorIn(id, camion) {

    const permanenza =
        calcolaPermanenza(
            camion.ingresso
        );


    const foto =
        camion.fotoIn
            ? `
                <img
                    src="${camion.fotoIn}"
                    alt="Foto IN"
                >
            `
            : "-";


    const badgeTipo =
        camion.tipo === "PARK"
            ? `<span class="badge badgePark">PARK ${escapeHtml(camion.destinazione || "")}</span>`
            : `<span class="badge badgeBaia">BAIA ${escapeHtml(camion.destinazione || "")}</span>`;


    return `
        <tr>

            <td>
                ${badgeTipo}
            </td>

            <td>
                ${escapeHtml(camion.attesa || "")}
            </td>

            <td>
                ${escapeHtml(camion.tipo || "")}
            </td>

            <td>
                <strong>
                    ${escapeHtml(camion.targa || "")}
                </strong>
            </td>

            <td>
                ${escapeHtml(camion.vettore || "")}
            </td>

            <td>
                ${escapeHtml(camion.quantita || "")}
            </td>

            <td>
                ${escapeHtml(camion.linea || "")}
            </td>

            <td>
                ${escapeHtml(camion.ingresso || "")}
            </td>

            <td class="${permanenza.classe}">
                ${permanenza.testo}
            </td>

            <td>
                ${foto}
            </td>

            <td>

                <button
                    type="button"
                    class="secondaryBtn"
                    style="width:auto;min-width:100px;"
                    onclick="apriSpostamento('${id}')"
                >
                    <i class="fa-solid fa-arrows-up-down-left-right"></i>
                    Sposta
                </button>

            </td>

        </tr>
    `;

}


/* =========================================================
   RIGA MONITOR OUT
========================================================= */

function creaRigaMonitorOut(id, camion) {

    const foto =
        camion.fotoOut
            ? `
                <img
                    src="${camion.fotoOut}"
                    alt="Foto OUT"
                >
            `
            : "-";


    const badgeTipo =
        camion.tipo === "PARK"
            ? `<span class="badge badgePark">PARK ${escapeHtml(camion.destinazione || "")}</span>`
            : `<span class="badge badgeBaia">BAIA ${escapeHtml(camion.destinazione || "")}</span>`;


    return `
        <tr>

            <td>
                ${badgeTipo}
            </td>

            <td>
                ${escapeHtml(camion.attesa || "")}
            </td>

            <td>
                ${escapeHtml(camion.tipo || "")}
            </td>

            <td>
                <strong>
                    ${escapeHtml(camion.targa || "")}
                </strong>
            </td>

            <td>
                ${escapeHtml(camion.vettore || "")}
            </td>

            <td>
                ${escapeHtml(camion.quantita || "")}
            </td>

            <td>
                ${escapeHtml(camion.linea || "")}
            </td>

            <td>
                ${escapeHtml(camion.ingresso || "")}
            </td>

            <td>
                ${escapeHtml(camion.uscita || "")}
            </td>

            <td>
                ${foto}
            </td>

            <td>

                <button
                    type="button"
                    class="secondaryBtn"
                    style="width:auto;min-width:90px;"
                    onclick="cancella('${id}')"
                >
                    <i class="fa-solid fa-trash"></i>
                    Elimina
                </button>

            </td>

        </tr>
    `;

}


/* =========================================================
   PERMANENZA
========================================================= */

function calcolaPermanenza(ingresso) {

    const data =
        parseDataItaliana(ingresso);


    if (!data) {

        return {
            testo: "-",
            classe: ""
        };

    }


    const minuti =
        Math.max(
            0,
            Math.floor(
                (
                    new Date() - data
                ) / 60000
            )
        );


    const ore =
        Math.floor(
            minuti / 60
        );


    const min =
        minuti % 60;


    let testo;


    if (ore > 0) {

        testo =
            `${ore}h ${min}m`;

    } else {

        testo =
            `${min} min`;

    }


    let classe =
        "permanenzaNormal";


    if (minuti >= 120) {

        classe =
            "permanenzaLong";

    } else if (minuti >= 60) {

        classe =
            "permanenzaMedium";

    }


    return {
        testo,
        classe
    };

}


/* =========================================================
   PARSE DATA
========================================================= */

function parseDataItaliana(value) {

    if (!value) return null;


    const match =
        String(value).match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?$/
        );


    if (!match) return null;


    const giorno =
        parseInt(match[1], 10);


    const mese =
        parseInt(match[2], 10) - 1;


    const anno =
        parseInt(match[3], 10);


    const ora =
        parseInt(match[4], 10);


    const minuti =
        parseInt(match[5], 10);


    const secondi =
        parseInt(match[6] || "0", 10);


    return new Date(
        anno,
        mese,
        giorno,
        ora,
        minuti,
        secondi
    );

}


/* =========================================================
   FORMAT DATA
========================================================= */

function formatDataItaliana(date) {

    const giorno =
        String(
            date.getDate()
        ).padStart(2, "0");


    const mese =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const anno =
        date.getFullYear();


    const ore =
        String(
            date.getHours()
        ).padStart(2, "0");


    const minuti =
        String(
            date.getMinutes()
        ).padStart(2, "0");


    const secondi =
        String(
            date.getSeconds()
        ).padStart(2, "0");


    return `${giorno}/${mese}/${anno}, ${ore}:${minuti}:${secondi}`;

}


/* =========================================================
   DASHBOARD
========================================================= */

function aggiornaDashboard() {

    let inSito = 0;

    let usciti = 0;

    let occupati = 0;


    const camionAttivi = [];


    for (const id in camionData) {

        const camion = camionData[id];


        if (!camion) continue;


        if (camion.uscita) {

            usciti++;

        } else {

            inSito++;

            camionAttivi.push({
                id,
                ...camion
            });

        }

    }


    parcheggi.forEach(location => {

        if (
            trovaCamionPark(location)
        ) {
            occupati++;
        }

    });


    const liberi =
        Math.max(
            0,
            parcheggi.length - occupati
        );


    const inSitoElement =
        document.getElementById(
            "dashInSito"
        );


    const occupatiElement =
        document.getElementById(
            "dashParkOccupati"
        );


    const liberiElement =
        document.getElementById(
            "dashParkLiberi"
        );


    const uscitiElement =
        document.getElementById(
            "dashUsciti"
        );


    if (inSitoElement)
        inSitoElement.textContent =
            inSito;


    if (occupatiElement)
        occupatiElement.textContent =
            occupati;


    if (liberiElement)
        liberiElement.textContent =
            liberi;


    if (uscitiElement)
        uscitiElement.textContent =
            usciti;


    const list =
        document.getElementById(
            "dashboardTruckList"
        );


    if (!list) return;


    if (!camionAttivi.length) {

        list.innerHTML = `
            <div class="emptyState">
                <i class="fa-solid fa-truck"></i>
                Nessun mezzo attualmente in sito.
            </div>
        `;

        return;

    }


    list.innerHTML =
        camionAttivi.map(camion => `

            <div class="dashboardTruck">

                <strong>
                    ${escapeHtml(camion.targa || "")}
                </strong>

                <div style="margin-top:8px;color:#aaa;">
                    ${escapeHtml(camion.vettore || "")}
                </div>

                <div style="margin-top:5px;">
                    <span class="badge badgePark">
                        ${escapeHtml(camion.destinazione || "N/D")}
                    </span>
                </div>

                <div style="margin-top:8px;color:#888;font-size:12px;">
                    Ingresso:
                    ${escapeHtml(camion.ingresso || "")}
                </div>

            </div>

        `).join("");

}


/* =========================================================
   DETTAGLIO PARK
========================================================= */

function apriDettaglioPark(location) {

    const overlay =
        document.getElementById(
            "parkPopupOverlay"
        );


    const title =
        document.getElementById(
            "popupParkTitle"
        );


    const content =
        document.getElementById(
            "popupParkContent"
        );


    const moveButton =
        document.getElementById(
            "popupMoveButton"
        );


    if (!overlay) return;


    title.textContent =
        `Parcheggio ${location}`;


    const camion =
        trovaCamionPark(location);


    selectedParkId =
        camion ? camion.id : null;


    if (!camion) {

        content.innerHTML = `

            <div class="emptyState">

                <i class="fa-solid fa-square-parking"></i>

                <strong>
                    PARCHEGGIO LIBERO
                </strong>

                <p style="margin-top:8px;">
                    ${escapeHtml(location)}
                </p>

            </div>

        `;


        if (moveButton) {

            moveButton.style.display =
                "none";

        }

    } else {

        content.innerHTML = `

            <div>

                <div style="
                    display:grid;
                    grid-template-columns:120px 1fr;
                    gap:12px;
                    margin-bottom:12px;
                ">

                    <strong>Targa</strong>

                    <span>
                        ${escapeHtml(camion.targa || "")}
                    </span>

                    <strong>Vettore</strong>

                    <span>
                        ${escapeHtml(camion.vettore || "")}
                    </span>

                    <strong>Destinazione</strong>

                    <span>
                        ${escapeHtml(camion.destinazione || "")}
                    </span>

                    <strong>Attesa</strong>

                    <span>
                        ${escapeHtml(camion.attesa || "")}
                    </span>

                    <strong>Ingresso</strong>

                    <span>
                        ${escapeHtml(camion.ingresso || "")}
                    </span>

                </div>

            </div>

        `;


        if (moveButton) {

            moveButton.style.display =
                "flex";

        }

    }


    overlay.style.display =
        "flex";

}


/* =========================================================
   SPOSTA DA POPUP
========================================================= */

async function spostaDaPopup() {

    if (!selectedParkId) return;


    const camion =
        camionData[selectedParkId];


    if (!camion) {

        alert(
            "Mezzo non trovato."
        );

        return;

    }


    const nuovaDestinazione =
        prompt(
            "Inserisci la nuova destinazione:"
        );


    if (
        nuovaDestinazione === null
    ) {
        return;
    }


    const destinazione =
        nuovaDestinazione
            .trim()
            .toUpperCase();


    const valida =
        validaDestinazione(
            destinazione
        );


    if (!valida) {

        alert(
            "Destinazione non valida."
        );

        return;

    }


    const occupato =
        trovaCamionPark(
            destinazione
        );


    if (
        occupato &&
        occupato.id !== selectedParkId
    ) {

        alert(
            `Il parcheggio ${destinazione} è occupato.`
        );

        return;

    }


    try {

        await db
            .ref(
                "camion/" + selectedParkId
            )
            .update({

                destinazione:
                    valida.valore,

                tipo:
                    valida.tipo

            });


        alert(
            "Mezzo spostato correttamente."
        );


        chiudiPopup();


        aggiornaPark();

        aggiornaMonitor();

        aggiornaDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "Errore durante lo spostamento."
        );

    }

}


/* =========================================================
   SPOSTAMENTO DA MONITOR
========================================================= */

async function apriSpostamento(id) {

    const camion =
        camionData[id];


    if (!camion) {

        alert(
            "Mezzo non trovato."
        );

        return;

    }


    const nuovaDestinazione =
        prompt(
            `Nuova destinazione per ${camion.targa}:`
        );


    if (
        nuovaDestinazione === null
    ) {
        return;
    }


    const destinazione =
        nuovaDestinazione
            .trim()
            .toUpperCase();


    const valida =
        validaDestinazione(
            destinazione
        );


    if (!valida) {

        alert(
            "Destinazione non valida."
        );

        return;

    }


    const occupato =
        trovaCamionPark(
            destinazione
        );


    if (
        occupato &&
        occupato.id !== id
    ) {

        alert(
            `Il parcheggio ${destinazione} è già occupato.`
        );

        return;

    }


    try {

        await db
            .ref("camion/" + id)
            .update({

                destinazione:
                    valida.valore,

                tipo:
                    valida.tipo

            });


        alert(
            "Destinazione modificata."
        );


        aggiornaPark();

        aggiornaMonitor();

        aggiornaDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "Errore durante la modifica."
        );

    }

}


/* =========================================================
   CHIUDI POPUP
========================================================= */

function chiudiPopup() {

    const overlay =
        document.getElementById(
            "parkPopupOverlay"
        );


    if (overlay) {

        overlay.style.display =
            "none";

    }


    selectedParkId = null;

}


/* =========================================================
   CANCELLA
========================================================= */

async function cancella(id) {

    if (
        !confirm(
            "Vuoi eliminare questo record?"
        )
    ) {
        return;
    }


    try {

        await db
            .ref("camion/" + id)
            .remove();


        alert(
            "Record eliminato."
        );


        aggiornaMonitor();

        aggiornaDashboard();

        aggiornaPark();

    } catch (error) {

        console.error(error);

        alert(
            "Errore durante l'eliminazione."
        );

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   EXPORT IN EXCEL
========================================================= */

function exportInExcel() {

    const dati = [];


    for (const id in camionData) {

        const camion = camionData[id];


        if (
            !camion ||
            camion.uscita
        ) {
            continue;
        }


        dati.push({

            PK:
                camion.destinazione || "",

            Attesa:
                camion.attesa || "",

            Tipo:
                camion.tipo || "",

            Targa:
                camion.targa || "",

            Vettore:
                camion.vettore || "",

            Quantita:
                camion.quantita || "",

            Linea:
                camion.linea || "",

            Ingresso:
                camion.ingresso || "",

            Permanenza:
                calcolaPermanenza(
                    camion.ingresso
                ).testo

        });

    }


    if (!dati.length) {

        alert(
            "Non ci sono dati da esportare."
        );

        return;

    }


    const worksheet =
        XLSX.utils.json_to_sheet(
            dati
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "In Sito"
    );


    XLSX.writeFile(
        workbook,
        "In_Sito.xlsx"
    );

}


/* =========================================================
   EXPORT OUT EXCEL
========================================================= */

function exportOutExcel() {

    const dati = [];


    for (const id in camionData) {

        const camion = camionData[id];


        if (
            !camion ||
            !camion.uscita
        ) {
            continue;
        }


        dati.push({

            PK:
                camion.destinazione || "",

            Attesa:
                camion.attesa || "",

            Tipo:
                camion.tipo || "",

            Targa:
                camion.targa || "",

            Vettore:
                camion.vettore || "",

            Quantita:
                camion.quantita || "",

            Linea:
                camion.linea || "",

            Ingresso:
                camion.ingresso || "",

            Uscita:
                camion.uscita || ""

        });

    }


    if (!dati.length) {

        alert(
            "Non ci sono dati da esportare."
        );

        return;

    }


    const worksheet =
        XLSX.utils.json_to_sheet(
            dati
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Usciti"
    );


    XLSX.writeFile(
        workbook,
        "Usciti.xlsx"
    );

}


/* =========================================================
   EVENTI
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* PARK */

        creaPark();

        popolaSelectDestinazioni();


        /* PAGINA INIZIALE */

        showPage(
            "pageDashboard"
        );


        /* INBOUND */

        const registraInboundBtn =
            document.getElementById(
                "registraInbound"
            );


        if (registraInboundBtn) {

            registraInboundBtn.addEventListener(
                "click",
                registraInbound
            );

        }


        /* OUTBOUND */

        const registraOutboundBtn =
            document.getElementById(
                "registraOutbound"
            );


        if (registraOutboundBtn) {

            registraOutboundBtn.addEventListener(
                "click",
                registraOutbound
            );

        }


        /* TRATTORISTI */

        const modificaDestBtn =
            document.getElementById(
                "btnModificaDest"
            );


        if (modificaDestBtn) {

            modificaDestBtn.addEventListener(
                "click",
                modificaDestinazione
            );

        }


        /* RICERCA OUTBOUND */

        const ricercaOutbound =
            document.getElementById(
                "ricercaOutbound"
            );


        if (ricercaOutbound) {

            ricercaOutbound.addEventListener(
                "input",
                cercaOutbound
            );

        }


        /* RICERCA IN SITO */

        const ricercaInSito =
            document.getElementById(
                "ricercaInSito"
            );


        if (ricercaInSito) {

            ricercaInSito.addEventListener(
                "input",
                aggiornaMonitor
            );

        }


        /* FILTRO ATTESA */

        const filtroAttesa =
            document.getElementById(
                "filtroAttesa"
            );


        if (filtroAttesa) {

            filtroAttesa.addEventListener(
                "change",
                aggiornaMonitor
            );

        }


        /* RICERCA USCITI */

        const ricercaUsciti =
            document.getElementById(
                "ricercaUsciti"
            );


        if (ricercaUsciti) {

            ricercaUsciti.addEventListener(
                "input",
                aggiornaMonitor
            );

        }


        /* CAMERA INBOUND */

        const video =
            document.getElementById(
                "video"
            );


        if (video) {

            startRearCamera(video);

        }


        const snap =
            document.getElementById(
                "snap"
            );


        if (snap) {

            snap.addEventListener(
                "click",
                () => {

                    scattaFoto(
                        "video",
                        "canvas"
                    );

                }
            );

        }


        /* CAMERA OUTBOUND */

        const videoOut =
            document.getElementById(
                "videoOut"
            );


        if (videoOut) {

            startRearCamera(videoOut);

        }


        const snapOut =
            document.getElementById(
                "snapOut"
            );


        if (snapOut) {

            snapOut.addEventListener(
                "click",
                () => {

                    scattaFoto(
                        "videoOut",
                        "canvasOut"
                    );

                }
            );

        }


        /* POPUP */

        const popupClose =
            document.getElementById(
                "popupCloseButton"
            );


        if (popupClose) {

            popupClose.addEventListener(
                "click",
                chiudiPopup
            );

        }


        const popupCloseBottom =
            document.getElementById(
                "popupCloseButtonBottom"
            );


        if (popupCloseBottom) {

            popupCloseBottom.addEventListener(
                "click",
                chiudiPopup
            );

        }


        const popupMove =
            document.getElementById(
                "popupMoveButton"
            );


        if (popupMove) {

            popupMove.addEventListener(
                "click",
                spostaDaPopup
            );

        }


        const popupOverlay =
            document.getElementById(
                "parkPopupOverlay"
            );


        if (popupOverlay) {

            popupOverlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        popupOverlay
                    ) {

                        chiudiPopup();

                    }

                }
            );

        }


        /* FIREBASE */

        db.ref("camion")
            .on(
                "value",
                snapshot => {

                    camionData =
                        snapshot.val() || {};


                    aggiornaPark();

                    aggiornaMonitor();

                    aggiornaDashboard();

                }
            );


        /* AGGIORNAMENTO PERIODICO */

        setInterval(
            () => {

                aggiornaMonitor();

                aggiornaDashboard();

            },
            30000
        );

    }
);
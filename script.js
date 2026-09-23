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
   VARIABILI
   ========================================================= */

let camionData = {};

let selectedParkId = null;

let selectedMezzoId = null;

let fotoInbound = null;

let fotoOutbound = null;

let streamInbound = null;

let streamOutbound = null;



/* =========================================================
   PARCHEGGI
   ========================================================= */

const parkGroups = [

    {
        nome: "BUCA",
        parcheggi: [
            "BUCA1","BUCA2","BUCA3","BUCA4","BUCA5",
            "BUCA6","BUCA7","BUCA8","BUCA9","BUCA10",
            "BUCA11","BUCA12","BUCA13","BUCA14","BUCA15",
            "BUCA16","BUCA17","BUCA18","BUCA19","BUCA20",
            "BUCA21","BUCA22","BUCA23","BUCA24","BUCA25",
            "BUCA26","BUCA27","BUCA28","BUCA29","BUCA30",
            "BUCA31","BUCA32","BUCA33","BUCA34","BUCA35",
            "BUCA36","BUCA37","BUCA38","BUCA39","BUCA40",
            "BUCA41","BUCA42","BUCA43","BUCA44","BUCA45",
            "BUCA46","BUCA47","BUCA48","BUCA49","BUCA50",

            "BUCA101","BUCA102","BUCA103","BUCA104","BUCA105",
            "BUCA106","BUCA107","BUCA108","BUCA109","BUCA110",
            "BUCA111","BUCA112","BUCA113","BUCA114","BUCA115",
            "BUCA116","BUCA117","BUCA118","BUCA119","BUCA120",
            "BUCA121","BUCA122","BUCA123","BUCA124","BUCA125",
            "BUCA126","BUCA127","BUCA128","BUCA129","BUCA130",
            "BUCA131","BUCA132","BUCA133","BUCA134","BUCA135",
            "BUCA136","BUCA137","BUCA138","BUCA139","BUCA140",
            "BUCA141","BUCA142","BUCA143","BUCA144","BUCA145",
            "BUCA146","BUCA147","BUCA148","BUCA149","BUCA150",
            "BUCA151","BUCA152","BUCA153","BUCA154","BUCA155",
            "BUCA156","BUCA157"
        ]
    },

    {
        nome: "PARK A",
        parcheggi: [
            "A01","A02","A03","A04","A05","A06","A07","A08",
            "A09","A10","A11","A12","A13","A14","A15","A16",
            "TRA12-13","TRA18-19-1","TRA18-19-2"
        ]
    },

    {
        nome: "PARK B",
        parcheggi: [
            "INIZIOPARKB1","INIZIOPARKB2",
            "B01","B02","B03","B04","B05","B06","B07","B08","B09",
            "B010","B011","B012","B013","B014","B015","B016"
        ]
    },

    {
        nome: "PARK C",
        parcheggi: [
            "C01","C02","C03","C04","C05","C06","C07","C08","C09","C10","C11",
            "C13","C14","C15","C16","C17",
            "C19","C21","C22",
            "C24","C25","C26",
            "C29","C30","C31","C32","C33","C34","C35"
        ]
    },

    {
        nome: "ATTESA PARK C",
        parcheggi: [
            "C31ATTESA","C32ATTESA","C33ATTESA",
            "C34ATTESA","C35ATTESA","C36ATTESA"
        ]
    },

    {
        nome: "PARK Y2",
        parcheggi: [
            "Y2-1","Y2-2","Y2-3","Y2-4","Y2-5","Y2-6","Y2-7","Y2-8","Y2-9","Y2-10",
            "Y2-11","Y2-12","Y2-13","Y2-14","Y2-15","Y2-16","Y2-17","Y2-18","Y2-19","Y2-20",
            "Y2-133-134","Y2-139-140","Y2-018-019-1","Y2-018-019-2",
            "Y2-TRA12-13","Y2-FRONTEC30","Y2-FRONTECOMP1","Y2-FRONTECOMP2","Y2-FRONTECOMP3",
            "Y2-TRA132-133","Y2-TRA128-129","Y2-TRA123-124","Y2-TRA152-152"
        ]
    }

];



/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const operatore = document.getElementById("operatore");

    if (operatore) {

        operatore.value =
            localStorage.getItem("park_operatore") || "";

        operatore.addEventListener("input", () => {

            localStorage.setItem(
                "park_operatore",
                operatore.value.trim()
            );

        });

    }


    creaPark();

    popolaSelectDestinazioni();

    setupEventi();

    aggiornaDashboard();

    aggiornaMonitor();

});



/* =========================================================
   EVENTI
   ========================================================= */

function setupEventi() {

    const ricercaGlobale =
        document.getElementById("ricercaGlobale");

    if (ricercaGlobale) {

        ricercaGlobale.addEventListener(
            "input",
            ricercaGlobaleHandler
        );

    }


    const ricercaOutbound =
        document.getElementById("ricercaOutbound");

    if (ricercaOutbound) {

        ricercaOutbound.addEventListener(
            "input",
            cercaOutbound
        );

    }


    const ricercaInSito =
        document.getElementById("ricercaInSito");

    if (ricercaInSito) {

        ricercaInSito.addEventListener(
            "input",
            aggiornaMonitor
        );

    }


    const filtroAttesa =
        document.getElementById("filtroAttesa");

    if (filtroAttesa) {

        filtroAttesa.addEventListener(
            "change",
            aggiornaMonitor
        );

    }


    const ricercaUsciti =
        document.getElementById("ricercaUsciti");

    if (ricercaUsciti) {

        ricercaUsciti.addEventListener(
            "input",
            aggiornaMonitor
        );

    }


    const ricercaMovimenti =
        document.getElementById("ricercaMovimenti");

    if (ricercaMovimenti) {

        ricercaMovimenti.addEventListener(
            "input",
            aggiornaMovimenti
        );

    }


    const trattTarga =
        document.getElementById("trattTarga");

    if (trattTarga) {

        trattTarga.addEventListener(
            "input",
            aggiornaInfoTrattorista
        );

    }


    document.addEventListener(
        "keydown",
        e => {

            if (e.key === "Escape") {

                chiudiPopup();

                chiudiMezzoPopup();

            }

        }
    );

}



/* =========================================================
   NAVIGAZIONE
   ========================================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const page =
        document.getElementById(pageId);

    if (page) {

        page.classList.add("active");

    }


    document
        .querySelectorAll("nav button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageId
            );

        });


    if (pageId === "dashboard") {

        aggiornaDashboard();

    }


    if (pageId === "park") {

        aggiornaPark();

    }


    if (pageId === "inSito" || pageId === "usciti") {

        aggiornaMonitor();

    }


    if (pageId === "movimenti") {

        aggiornaMovimenti();

    }


    if (pageId === "statistiche") {

        aggiornaStatistiche();

    }

}



/* =========================================================
   CREA PARK
   ========================================================= */

function creaPark() {

    const container =
        document.getElementById("parkGrid");

    if (!container) return;

    container.innerHTML = "";


    parkGroups.forEach(group => {

        const section =
            document.createElement("div");

        section.className = "parkSection";


        if (group.nome === "BUCA") {

            section.classList.add("bucaSection");

        }


        const title =
            document.createElement("h3");

        title.textContent = group.nome;


        const stats =
            document.createElement("div");

        stats.className = "parkStats";

        stats.id =
            "parkStats-" +
            sanitizeId(group.nome);


        const grid =
            document.createElement("div");

        grid.className = "parkGrid";


        group.parcheggi.forEach(location => {

            const cell =
                document.createElement("div");

            cell.className = "parkCell";

            cell.id =
                "cell-" +
                sanitizeId(location);

            cell.textContent = location;

            cell.title = "Libero";


            cell.addEventListener(
                "click",
                () => apriDettaglioPark(location)
            );


            grid.appendChild(cell);

        });


        section.appendChild(title);

        section.appendChild(stats);

        section.appendChild(grid);

        container.appendChild(section);

    });

}



/* =========================================================
   SANITIZE
   ========================================================= */

function sanitizeId(value) {

    return String(value)
        .replace(/[^a-zA-Z0-9]/g, "_");

}



/* =========================================================
   POPOLA SELECT
   ========================================================= */

function popolaSelectDestinazioni() {

    const selects = [

        document.getElementById("destinazione"),

        document.getElementById("nuovaDestinazione")

    ];


    selects.forEach(select => {

        if (!select) return;


        const valoreAttuale =
            select.value;


        select.innerHTML = "";


        const first =
            document.createElement("option");

        first.value = "";

        first.textContent =
            "-- Seleziona destinazione --";

        select.appendChild(first);


        parkGroups.forEach(group => {

            const optgroup =
                document.createElement("optgroup");

            optgroup.label =
                group.nome;


            group.parcheggi.forEach(location => {

                const option =
                    document.createElement("option");

                option.value =
                    location;


                const camion =
                    trovaCamionPark(location);


                if (camion) {

                    option.disabled = true;

                    option.textContent =
                        `${location} — OCCUPATO`;

                } else {

                    option.textContent =
                        `${location} — LIBERO`;

                }


                optgroup.appendChild(option);

            });


            select.appendChild(optgroup);

        });


        if (
            valoreAttuale &&
            Array.from(select.options)
                .some(o => o.value === valoreAttuale && !o.disabled)
        ) {

            select.value = valoreAttuale;

        }

    });

}



/* =========================================================
   TROVA CAMION NEL PARK
   ========================================================= */

function trovaCamionPark(location) {

    return Object.values(camionData)
        .find(camion => {

            if (!camion) return false;

            if (camion.uscita) return false;

            return camion.destinazione === location;

        }) || null;

}



/* =========================================================
   VALIDAZIONE DESTINAZIONE
   ========================================================= */

function validaDestinazione(dest) {

    if (!dest) return null;


    const parkValido =
        parkGroups.some(group =>
            group.parcheggi.includes(dest)
        );


    if (parkValido) {

        return {
            tipo: "PARK",
            valore: dest
        };

    }


    if (/^\d+$/.test(dest)) {

        const numero =
            Number(dest);

        if (numero >= 1 && numero <= 199) {

            return {
                tipo: "BAIA",
                valore: dest
            };

        }

    }


    return null;

}



/* =========================================================
   AGGIORNA PARK
   ========================================================= */

function aggiornaPark() {

    document
        .querySelectorAll(".parkCell")
        .forEach(cell => {

            cell.classList.remove("occupato");

            cell.classList.remove("oltre24");

            cell.title = "Libero";

        });


    parkGroups.forEach(group => {

        let occupati = 0;

        group.parcheggi.forEach(location => {

            const cell =
                document.getElementById(
                    "cell-" +
                    sanitizeId(location)
                );


            if (!cell) return;


            const camion =
                trovaCamionPark(location);


            if (camion) {

                occupati++;


                cell.classList.add("occupato");

                cell.title =
                    `Occupato - ${camion.targa || ""}`;


                const ingresso =
                    parseDateTime(
                        camion.ingresso
                    );


                if (ingresso) {

                    const tempo =
                        Date.now() -
                        ingresso.getTime();


                    const ventiquattroOre =
                        24 * 60 * 60 * 1000;


                    if (tempo >= ventiquattroOre) {

                        cell.classList.add("oltre24");

                        cell.title =
                            `OLTRE 24 ORE - ${camion.targa || ""}`;

                    }

                }

            }

        });


        const stats =
            document.getElementById(
                "parkStats-" +
                sanitizeId(group.nome)
            );


        if (stats) {

            const totale =
                group.parcheggi.length;

            const liberi =
                totale - occupati;


            stats.innerHTML = `
                <span>
                    Totale:
                    <strong>${totale}</strong>
                </span>

                <span class="parkFreeNumber">
                    Liberi:
                    <strong>${liberi}</strong>
                </span>

                <span class="parkOccupiedNumber">
                    Occupati:
                    <strong>${occupati}</strong>
                </span>
            `;

        }

    });


    popolaSelectDestinazioni();

    aggiornaDashboardParkSummary();

}



/* =========================================================
   DATE
   ========================================================= */

function parseDateTime(value) {

    if (!value) return null;


    if (value instanceof Date) {

        return value;

    }


    const str =
        String(value).trim();


    const match =
        str.match(
            /^(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})(?::(\d{2}))?$/
        );


    if (match) {

        return new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1]),
            Number(match[4]),
            Number(match[5]),
            Number(match[6] || 0)
        );

    }


    const parsed =
        new Date(str);


    return isNaN(parsed.getTime())
        ? null
        : parsed;

}



function formatDateTime(date) {

    if (!date) return "";


    const d =
        date instanceof Date
            ? date
            : new Date(date);


    if (isNaN(d.getTime())) return "";


    return (
        String(d.getDate()).padStart(2,"0")
        + "/" +
        String(d.getMonth()+1).padStart(2,"0")
        + "/" +
        d.getFullYear()
        + ", " +
        String(d.getHours()).padStart(2,"0")
        + ":" +
        String(d.getMinutes()).padStart(2,"0")
        + ":" +
        String(d.getSeconds()).padStart(2,"0")
    );

}



/* =========================================================
   PERMANENZA
   ========================================================= */

function calcolaPermanenza(ingresso) {

    const dataIngresso =
        parseDateTime(ingresso);


    if (!dataIngresso) {

        return {
            testo: "",
            classe: ""
        };

    }


    const minuti =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    dataIngresso.getTime()
                ) / 60000
            )
        );


    const giorni =
        Math.floor(minuti / 1440);


    const ore =
        Math.floor(
            (minuti % 1440) / 60
        );


    const min =
        minuti % 60;


    let testo = "";


    if (giorni > 0) {

        testo += `${giorni}g `;

    }


    testo +=
        `${ore}h ${String(min).padStart(2,"0")}m`;


    let classe =
        "permanenzaNormal";


    if (minuti >= 1440) {

        classe =
            "permanenzaLong";

    } else if (minuti >= 480) {

        classe =
            "permanenzaLong";

    } else if (minuti >= 240) {

        classe =
            "permanenzaMedium";

    }


    return {
        testo,
        classe,
        minuti
    };

}



/* =========================================================
   OPERATORE
   ========================================================= */

function getOperatore() {

    const element =
        document.getElementById("operatore");


    const valore =
        element
            ? element.value.trim()
            : "";


    return valore || "Operatore non specificato";

}



/* =========================================================
   FOTO
   ========================================================= */

function avviaCameraInbound() {

    startRearCamera(
        "video",
        stream => {

            streamInbound = stream;

        }
    );

}



function avviaCameraOutbound() {

    startRearCamera(
        "videoOut",
        stream => {

            streamOutbound = stream;

        }
    );

}



async function startRearCamera(videoId, callback) {

    try {

        const video =
            document.getElementById(videoId);


        if (!video) return;


        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },

                audio: false

            });


        video.srcObject =
            stream;


        callback(stream);

    } catch (error) {

        alert(
            "Impossibile accedere alla fotocamera."
        );

        console.error(error);

    }

}



function scattaFoto(tipo) {

    const video =
        tipo === "inbound"
            ? document.getElementById("video")
            : document.getElementById("videoOut");


    const canvas =
        tipo === "inbound"
            ? document.getElementById("canvas")
            : document.getElementById("canvasOut");


    if (!video || !video.videoWidth) {

        alert(
            "Avvia prima la fotocamera."
        );

        return;

    }


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    const ctx =
        canvas.getContext("2d");


    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    const foto =
        canvas.toDataURL(
            "image/jpeg",
            0.75
        );


    if (tipo === "inbound") {

        fotoInbound = foto;

        const preview =
            document.getElementById(
                "previewInbound"
            );


        if (preview) {

            preview.innerHTML =
                `<img class="previewPhoto" src="${foto}">`;

        }

    } else {

        fotoOutbound = foto;

        const preview =
            document.getElementById(
                "previewOutbound"
            );


        if (preview) {

            preview.innerHTML =
                `<img class="previewPhoto" src="${foto}">`;

        }

    }

}



/* =========================================================
   INBOUND
   ========================================================= */

function registraInbound() {

    const targa =
        document.getElementById("targa")
            .value.trim()
            .toUpperCase();


    const vettore =
        document.getElementById("vettore")
            .value.trim();


    const quantita =
        document.getElementById("quantita")
            .value.trim();


    const linea =
        document.getElementById("linea")
            .value.trim();


    const attesaElement =
        document.getElementById("attesa");


    const attesa =
        attesaElement
            ? attesaElement.value.trim()
            : "";


    const destinazione =
        document.getElementById("destinazione")
            .value;


    if (!targa) {

        alert("Inserisci la targa.");

        return;

    }


    if (!destinazione) {

        alert("Seleziona una destinazione.");

        return;

    }


    const destinazioneValida =
        validaDestinazione(destinazione);


    if (!destinazioneValida) {

        alert("Destinazione non valida.");

        return;

    }


    if (
        destinazioneValida.tipo === "PARK" &&
        trovaCamionPark(destinazioneValida.valore)
    ) {

        alert(
            "Il parcheggio selezionato è già occupato."
        );

        aggiornaPark();

        return;

    }


    const ingresso =
        formatDateTime(new Date());


    const nuovoId =
        db.ref("camion").push().key;


    const nuovoCamion = {

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
            fotoInbound || null,

        fotoOut: null,

        operatoreIngresso:
            getOperatore(),

        operatoreUscita: null,

        ingressoPark:
            destinazioneValida.tipo === "PARK"
                ? ingresso
                : null

    };


    db.ref(
        "camion/" + nuovoId
    )
    .set(nuovoCamion)
    .then(() => {

        registraMovimento(
            nuovoId,
            "",
            destinazioneValida.valore,
            getOperatore(),
            targa
        );


        alert(
            `Inbound registrato per ${targa}.`
        );


        resetInbound();

        showPage("inSito");

    })
    .catch(error => {

        console.error(error);

        alert(
            "Errore durante la registrazione dell'inbound."
        );

    });

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

        const el =
            document.getElementById(id);

        if (el) el.value = "";

    });


    const attesa =
        document.getElementById("attesa");


    if (attesa) {

        attesa.value = "";

    }


    const destinazione =
        document.getElementById("destinazione");


    if (destinazione) {

        destinazione.value = "";

    }


    fotoInbound = null;


    const preview =
        document.getElementById(
            "previewInbound"
        );


    if (preview) {

        preview.innerHTML = "";

    }

}



/* =========================================================
   OUTBOUND
   ========================================================= */

function cercaOutbound() {

    const ricerca =
        document.getElementById(
            "ricercaOutbound"
        )
        .value
        .trim()
        .toUpperCase();


    const container =
        document.getElementById(
            "risultatoOutbound"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!ricerca) return;


    const risultati =
        Object.entries(camionData)
            .filter(([id, camion]) => {

                if (!camion || camion.uscita)
                    return false;


                return String(
                    camion.targa || ""
                )
                .toUpperCase()
                .includes(ricerca);

            });


    if (!risultati.length) {

        container.innerHTML =
            `<div class="emptyMessage">
                Nessun mezzo trovato.
            </div>`;

        return;

    }


    risultati.forEach(([id, camion]) => {

        const div =
            document.createElement("div");

        div.className =
            "globalResult";


        div.innerHTML = `

            <div class="globalResultMain">

                <span class="globalResultPlate">
                    ${escapeHtml(camion.targa || "")}
                </span>

                <span class="globalResultPark">
                    ${escapeHtml(camion.destinazione || "")}
                </span>

            </div>

            <div class="globalResultDetails">

                ${escapeHtml(camion.vettore || "")}
                ·
                ${escapeHtml(camion.linea || "")}

            </div>

        `;


        div.onclick = () => {

            document.getElementById(
                "targaOut"
            ).value =
                camion.targa || "";


            document.getElementById(
                "targaOut"
            ).dataset.id =
                id;

        };


        container.appendChild(div);

    });

}



/* =========================================================
   REGISTRA OUTBOUND
   ========================================================= */

function registraOutbound() {

    const targaInput =
        document.getElementById("targaOut");


    const id =
        targaInput
            ? targaInput.dataset.id
            : "";


    const targa =
        targaInput
            ? targaInput.value.trim().toUpperCase()
            : "";


    if (!id || !targa) {

        alert(
            "Seleziona prima un mezzo."
        );

        return;

    }


    const camion =
        camionData[id];


    if (!camion) {

        alert("Mezzo non trovato.");

        return;

    }


    if (camion.uscita) {

        alert(
            "Questo mezzo risulta già uscito."
        );

        return;

    }


    const uscita =
        formatDateTime(new Date());


    db.ref(
        "camion/" + id
    )
    .update({

        uscita,

        fotoOut:
            fotoOutbound || null,

        operatoreUscita:
            getOperatore()

    })
    .then(() => {

        registraMovimento(
            id,
            camion.destinazione || "",
            "USCITO",
            getOperatore(),
            camion.targa || ""
        );


        alert(
            `Outbound registrato per ${targa}.`
        );


        targaInput.value = "";

        delete targaInput.dataset.id;

        document.getElementById(
            "ricercaOutbound"
        ).value = "";


        document.getElementById(
            "risultatoOutbound"
        ).innerHTML = "";


        fotoOutbound = null;


        const preview =
            document.getElementById(
                "previewOutbound"
            );


        if (preview) {

            preview.innerHTML = "";

        }


        showPage("usciti");

    })
    .catch(error => {

        console.error(error);

        alert(
            "Errore durante l'outbound."
        );

    });

}



/* =========================================================
   RICERCA GLOBALE
   ========================================================= */

function ricercaGlobaleHandler() {

    const input =
        document.getElementById(
            "ricercaGlobale"
        );


    const container =
        document.getElementById(
            "risultatoRicercaGlobale"
        );


    if (!input || !container) return;


    const ricerca =
        input.value
            .trim()
            .toUpperCase();


    container.innerHTML = "";


    if (ricerca.length < 2) {

        container.classList.remove("visible");

        return;

    }


    const risultati =
        Object.entries(camionData)
            .filter(([id, camion]) => {

                if (!camion) return false;


                const testo = [

                    camion.targa,
                    camion.vettore,
                    camion.destinazione,
                    camion.linea,
                    camion.attesa

                ]
                .join(" ")
                .toUpperCase();


                return testo.includes(ricerca);

            })
            .slice(0, 20);


    if (!risultati.length) {

        container.innerHTML =
            `<div class="emptyMessage">
                Nessun risultato.
            </div>`;

        container.classList.add("visible");

        return;

    }


    risultati.forEach(([id, camion]) => {

        const div =
            document.createElement("div");

        div.className =
            "globalResult";


        const permanenza =
            calcolaPermanenza(
                camion.ingresso
            );


        div.innerHTML = `

            <div class="globalResultMain">

                <span class="globalResultPlate">
                    ${escapeHtml(camion.targa || "")}
                </span>

                <span class="globalResultPark">
                    ${escapeHtml(camion.destinazione || "")}
                </span>

            </div>

            <div class="globalResultDetails">

                Vettore:
                ${escapeHtml(camion.vettore || "")}

                ·

                Linea:
                ${escapeHtml(camion.linea || "")}

                ·

                Permanenza:
                ${escapeHtml(permanenza.testo)}

            </div>

        `;


        div.onclick = () => {

            apriSchedaMezzo(id);

            container.classList.remove(
                "visible"
            );

        };


        container.appendChild(div);

    });


    container.classList.add("visible");

}



/* =========================================================
   SCHEDA MEZZO
   ========================================================= */

function apriSchedaMezzo(id) {

    const camion =
        camionData[id];


    if (!camion) return;


    selectedMezzoId = id;


    const overlay =
        document.getElementById(
            "mezzoPopupOverlay"
        );


    const title =
        document.getElementById(
            "mezzoPopupTitle"
        );


    const content =
        document.getElementById(
            "mezzoPopupContent"
        );


    if (!overlay || !title || !content)
        return;


    title.textContent =
        `Mezzo ${camion.targa || ""}`;


    const permanenza =
        calcolaPermanenza(
            camion.ingresso
        );


    content.innerHTML = `

        <div class="popupRow">
            <strong>Targa</strong>
            <span>${escapeHtml(camion.targa || "")}</span>
        </div>

        <div class="popupRow">
            <strong>Vettore</strong>
            <span>${escapeHtml(camion.vettore || "")}</span>
        </div>

        <div class="popupRow">
            <strong>Quantità</strong>
            <span>${escapeHtml(camion.quantita || "")}</span>
        </div>

        <div class="popupRow">
            <strong>Linea</strong>
            <span>${escapeHtml(camion.linea || "")}</span>
        </div>

        <div class="popupRow">
            <strong>Attesa</strong>
            <span>${escapeHtml(camion.attesa || "")}</span>
        </div>

        <div class="popupRow">
            <strong>Destinazione</strong>
            <span>${escapeHtml(camion.destinazione || "")}</span>
        </div>

        <div class="popupRow">
            <strong>Ingresso</strong>
            <span>${escapeHtml(camion.ingresso || "")}</span>
        </div>

        <div class="popupRow">
            <strong>Permanenza</strong>
            <span class="${permanenza.classe}">
                ${escapeHtml(permanenza.testo)}
            </span>
        </div>

        <div class="popupRow">
            <strong>Operatore ingresso</strong>
            <span>
                ${escapeHtml(camion.operatoreIngresso || "")}
            </span>
        </div>

        ${
            camion.fotoIn
                ? `
                    <div>
                        <strong>Foto ingresso</strong>
                        <img
                            class="popupPhoto"
                            src="${camion.fotoIn}"
                            onclick="apriFoto('${camion.fotoIn}')"
                        >
                    </div>
                `
                : ""
        }

        ${
            camion.fotoOut
                ? `
                    <div>
                        <strong>Foto uscita</strong>
                        <img
                            class="popupPhoto"
                            src="${camion.fotoOut}"
                            onclick="apriFoto('${camion.fotoOut}')"
                        >
                    </div>
                `
                : ""
        }

    `;


    overlay.classList.add("active");

}



/* =========================================================
   FOTO GRANDE
   ========================================================= */

function apriFoto(url) {

    if (!url) return;


    const win =
        window.open("", "_blank");


    if (!win) return;


    win.document.write(`
        <html>
        <head>
            <title>Foto mezzo</title>

            <style>
                body {
                    margin:0;
                    background:#000;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    min-height:100vh;
                }

                img {
                    max-width:100%;
                    max-height:100vh;
                    object-fit:contain;
                }
            </style>

        </head>

        <body>

            <img src="${url}">

        </body>
        </html>
    `);

}



/* =========================================================
   CHIUDI SCHEDA
   ========================================================= */

function chiudiMezzoPopup() {

    const overlay =
        document.getElementById(
            "mezzoPopupOverlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }

}



/* =========================================================
   PARK POPUP
   ========================================================= */

function apriDettaglioPark(location) {

    selectedParkId = location;


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


    const camion =
        trovaCamionPark(location);


    title.textContent =
        location;


    if (!camion) {

        content.innerHTML = `

            <div class="emptyMessage">

                <i class="fa-solid fa-square-parking"></i>

                <h3>PARCHEGGIO LIBERO</h3>

                <p>
                    Il parcheggio
                    <strong>${escapeHtml(location)}</strong>
                    è disponibile.
                </p>

            </div>

        `;


        moveButton.style.display =
            "none";


    } else {

        const permanenza =
            calcolaPermanenza(
                camion.ingresso
            );


        content.innerHTML = `

            <div class="popupRow">
                <strong>Targa</strong>
                <span>${escapeHtml(camion.targa || "")}</span>
            </div>

            <div class="popupRow">
                <strong>Vettore</strong>
                <span>${escapeHtml(camion.vettore || "")}</span>
            </div>

            <div class="popupRow">
                <strong>Quantità</strong>
                <span>${escapeHtml(camion.quantita || "")}</span>
            </div>

            <div class="popupRow">
                <strong>Linea</strong>
                <span>${escapeHtml(camion.linea || "")}</span>
            </div>

            <div class="popupRow">
                <strong>Destinazione</strong>
                <span>${escapeHtml(camion.destinazione || "")}</span>
            </div>

            <div class="popupRow">
                <strong>Attesa</strong>
                <span>${escapeHtml(camion.attesa || "")}</span>
            </div>

            <div class="popupRow">
                <strong>Ingresso</strong>
                <span>${escapeHtml(camion.ingresso || "")}</span>
            </div>

            <div class="popupRow">
                <strong>Permanenza</strong>
                <span class="${permanenza.classe}">
                    ${escapeHtml(permanenza.testo)}
                </span>
            </div>

            ${
                camion.fotoIn
                    ? `
                        <div>
                            <strong>Foto ingresso</strong>

                            <img
                                class="popupPhoto"
                                src="${camion.fotoIn}"
                                onclick="apriFoto('${camion.fotoIn}')"
                            >
                        </div>
                    `
                    : ""
            }

        `;


        moveButton.style.display =
            "block";

    }


    overlay.classList.add(
        "active"
    );

}



/* =========================================================
   CHIUDI PARK POPUP
   ========================================================= */

function chiudiPopup() {

    const overlay =
        document.getElementById(
            "parkPopupOverlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }

}



/* =========================================================
   SPOSTAMENTO DA POPUP
   ========================================================= */

function spostaDaPopup() {

    const camion =
        trovaCamionPark(
            selectedParkId
        );


    if (!camion) return;


    const id =
        Object.keys(camionData)
            .find(
                key =>
                    camionData[key] === camion
            );


    if (!id) return;


    selectedMezzoId = id;


    chiudiPopup();


    apriSpostamentoDaScheda();

}



/* =========================================================
   SPOSTAMENTO DA SCHEDA
   ========================================================= */

function apriSpostamentoDaScheda() {

    if (!selectedMezzoId) return;


    const camion =
        camionData[
            selectedMezzoId
        ];


    if (!camion) return;


    showPage("trattoristi");


    const targa =
        document.getElementById(
            "trattTarga"
        );


    if (targa) {

        targa.value =
            camion.targa || "";

    }


    aggiornaInfoTrattorista();


    const select =
        document.getElementById(
            "nuovaDestinazione"
        );


    if (select) {

        select.focus();

    }

}



/* =========================================================
   TRATTORISTA
   ========================================================= */

function aggiornaInfoTrattorista() {

    const targa =
        document.getElementById(
            "trattTarga"
        )
        .value
        .trim()
        .toUpperCase();


    const container =
        document.getElementById(
            "trattoristaInfo"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!targa) return;


    const result =
        Object.entries(camionData)
            .find(([id, camion]) => {

                return camion &&
                    !camion.uscita &&
                    String(camion.targa || "")
                        .toUpperCase() === targa;

            });


    if (!result) {

        container.innerHTML =
            `<div class="emptyMessage">
                Mezzo non trovato.
            </div>`;

        return;

    }


    const [id, camion] =
        result;


    selectedMezzoId = id;


    container.innerHTML = `

        <div class="popupRow">

            <strong>
                Destinazione attuale
            </strong>

            <span>
                ${escapeHtml(
                    camion.destinazione || ""
                )}
            </span>

        </div>

    `;


    popolaSelectDestinazioni();

}



/* =========================================================
   MODIFICA DESTINAZIONE
   ========================================================= */

function modificaDestinazioneTrattorista() {

    const targa =
        document.getElementById(
            "trattTarga"
        )
        .value
        .trim()
        .toUpperCase();


    const destinazione =
        document.getElementById(
            "nuovaDestinazione"
        )
        .value;


    if (!targa) {

        alert(
            "Inserisci la targa."
        );

        return;

    }


    if (!destinazione) {

        alert(
            "Seleziona una nuova destinazione."
        );

        return;

    }


    const risultato =
        Object.entries(camionData)
            .find(([id, camion]) => {

                return camion &&
                    !camion.uscita &&
                    String(camion.targa || "")
                        .toUpperCase() === targa;

            });


    if (!risultato) {

        alert(
            "Mezzo non trovato."
        );

        return;

    }


    const [id, camion] =
        risultato;


    if (
        destinazione !== camion.destinazione &&
        trovaCamionPark(destinazione)
    ) {

        alert(
            "Il parcheggio selezionato è occupato."
        );

        aggiornaPark();

        return;

    }


    const vecchiaDestinazione =
        camion.destinazione || "";


    const updates = {

        destinazione,

        tipo: "PARK",

        operatoreUltimoSpostamento:
            getOperatore()

    };


    if (
        !camion.ingressoPark
        ||
        camion.tipo !== "PARK"
    ) {

        updates.ingressoPark =
            formatDateTime(new Date());

    }


    db.ref(
        "camion/" + id
    )
    .update(updates)
    .then(() => {

        registraMovimento(
            id,
            vecchiaDestinazione,
            destinazione,
            getOperatore(),
            camion.targa || ""
        );


        alert(
            `Mezzo ${targa} spostato da ${vecchiaDestinazione || "—"} a ${destinazione}.`
        );


        document.getElementById(
            "nuovaDestinazione"
        ).value = "";


        aggiornaInfoTrattorista();

    })
    .catch(error => {

        console.error(error);

        alert(
            "Errore durante lo spostamento."
        );

    });

}



/* =========================================================
   STORICO MOVIMENTI
   ========================================================= */

function registraMovimento(
    camionId,
    da,
    a,
    operatore,
    targa
) {

    const movimento = {

        camionId,

        targa,

        da: da || "",

        a: a || "",

        operatore:

            operatore ||
            "Operatore non specificato",

        dataOra:
            formatDateTime(new Date())

    };


    return db
        .ref("movimenti")
        .push(movimento);

}



/* =========================================================
   MONITOR
   ========================================================= */

function aggiornaMonitor() {

    aggiornaMonitorIn();

    aggiornaMonitorOut();

}



/* =========================================================
   MONITOR IN
   ========================================================= */

function aggiornaMonitorIn() {

    const tbody =
        document.getElementById(
            "monitorIn"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const ricerca =
        (
            document.getElementById(
                "ricercaInSito"
            )?.value || ""
        )
        .trim()
        .toUpperCase();


    const filtro =
        document.getElementById(
            "filtroAttesa"
        )?.value || "";


    Object.entries(camionData)
        .filter(([id, camion]) => {

            if (!camion || camion.uscita)
                return false;


            if (
                filtro &&
                (camion.attesa || "") !== filtro
            ) {

                return false;

            }


            const testo = [

                camion.targa,
                camion.vettore,
                camion.destinazione,
                camion.linea,
                camion.attesa

            ]
            .join(" ")
            .toUpperCase();


            return !ricerca ||
                testo.includes(ricerca);

        })
        .sort((a,b) => {

            const da =
                parseDateTime(
                    a[1].ingresso
                )?.getTime() || 0;


            const dbb =
                parseDateTime(
                    b[1].ingresso
                )?.getTime() || 0;


            return da - dbb;

        })
        .forEach(([id, camion]) => {

            const tr =
                document.createElement("tr");


            const permanenza =
                calcolaPermanenza(
                    camion.ingresso
                );


            const foto =
                camion.fotoIn
                    ? `
                        <img
                            class="fotoThumb"
                            src="${camion.fotoIn}"
                            onclick="apriFoto('${camion.fotoIn}')"
                        >
                    `
                    : "—";


            tr.innerHTML = `

                <td>
                    ${escapeHtml(
                        camion.destinazione || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.attesa || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.tipo || ""
                    )}
                </td>

                <td
                    class="clickablePlate"
                    onclick="apriSchedaMezzo('${id}')"
                >
                    ${escapeHtml(
                        camion.targa || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.vettore || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.quantita || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.linea || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.ingresso || ""
                    )}
                </td>

                <td class="${permanenza.classe}">
                    ${escapeHtml(
                        permanenza.testo
                    )}
                </td>

                <td>
                    ${foto}
                </td>

                <td>

                    <button
                        class="btn btnSmall btnBlue"
                        onclick="apriSpostamentoRapido('${id}')"
                    >
                        Sposta
                    </button>

                    <button
                        class="btn btnSmall"
                        onclick="apriSchedaMezzo('${id}')"
                    >
                        Scheda
                    </button>

                </td>

            `;


            tbody.appendChild(tr);

        });

}



/* =========================================================
   MONITOR OUT
   ========================================================= */

function aggiornaMonitorOut() {

    const tbody =
        document.getElementById(
            "monitorOut"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const ricerca =
        (
            document.getElementById(
                "ricercaUsciti"
            )?.value || ""
        )
        .trim()
        .toUpperCase();


    Object.entries(camionData)
        .filter(([id, camion]) => {

            if (!camion || !camion.uscita)
                return false;


            const testo = [

                camion.targa,
                camion.vettore,
                camion.destinazione,
                camion.linea,
                camion.attesa

            ]
            .join(" ")
            .toUpperCase();


            return !ricerca ||
                testo.includes(ricerca);

        })
        .sort((a,b) => {

            const da =
                parseDateTime(
                    a[1].uscita
                )?.getTime() || 0;


            const dbb =
                parseDateTime(
                    b[1].uscita
                )?.getTime() || 0;


            return dbb - da;

        })
        .forEach(([id, camion]) => {

            const tr =
                document.createElement("tr");


            const foto =
                camion.fotoOut
                    ? `
                        <img
                            class="fotoThumb"
                            src="${camion.fotoOut}"
                            onclick="apriFoto('${camion.fotoOut}')"
                        >
                    `
                    : "—";


            tr.innerHTML = `

                <td>
                    ${escapeHtml(
                        camion.destinazione || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.attesa || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.tipo || ""
                    )}
                </td>

                <td
                    class="clickablePlate"
                    onclick="apriSchedaMezzo('${id}')"
                >
                    ${escapeHtml(
                        camion.targa || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.vettore || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.quantita || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.linea || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.ingresso || ""
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        camion.uscita || ""
                    )}
                </td>

                <td>
                    ${foto}
                </td>

                <td>

                    <button
                        class="btn btnSmall"
                        onclick="apriSchedaMezzo('${id}')"
                    >
                        Scheda
                    </button>

                </td>

            `;


            tbody.appendChild(tr);

        });

}



/* =========================================================
   SPOSTAMENTO RAPIDO
   ========================================================= */

function apriSpostamentoRapido(id) {

    selectedMezzoId = id;

    apriSpostamentoDaScheda();

}



/* =========================================================
   DASHBOARD
   ========================================================= */

function aggiornaDashboard() {

    aggiornaDashboardCards();

    aggiornaDashboardAlerts();

    aggiornaDashboardParkSummary();

    aggiornaDashboardTruckList();

}



/* =========================================================
   DASHBOARD CARDS
   ========================================================= */

function aggiornaDashboardCards() {

    const mezzi =
        Object.values(camionData)
            .filter(c => c && !c.uscita);


    const usciti =
        Object.values(camionData)
            .filter(c => c && c.uscita);


    let occupati = 0;

    parkGroups.forEach(group => {

        group.parcheggi.forEach(location => {

            if (trovaCamionPark(location)) {

                occupati++;

            }

        });

    });


    const totalePark =
        parkGroups.reduce(
            (sum, group) =>
                sum + group.parcheggi.length,
            0
        );


    const oltre8 =
        mezzi.filter(c => {

            const p =
                calcolaPermanenza(c.ingresso);

            return p.minuti >= 480;

        }).length;


    const oltre24 =
        mezzi.filter(c => {

            const p =
                calcolaPermanenza(c.ingresso);

            return p.minuti >= 1440;

        }).length;


    const ingressiOggi =
        mezzi.filter(c =>
            isToday(
                parseDateTime(c.ingresso)
            )
        ).length
        +
        usciti.filter(c =>
            isToday(
                parseDateTime(c.ingresso)
            )
        ).length;


    const usciteOggi =
        usciti.filter(c =>
            isToday(
                parseDateTime(c.uscita)
            )
        ).length;


    setText(
        "dashInSito",
        mezzi.length
    );


    setText(
        "dashParkOccupati",
        occupati
    );


    setText(
        "dashParkLiberi",
        totalePark - occupati
    );


    setText(
        "dashUsciti",
        usciti.length
    );


    setText(
        "dashOltre8",
        oltre8
    );


    setText(
        "dashOltre24",
        oltre24
    );


    setText(
        "dashIngressiOggi",
        ingressiOggi
    );


    setText(
        "dashUsciteOggi",
        usciteOggi
    );

}



/* =========================================================
   ALERT DASHBOARD
   ========================================================= */

function aggiornaDashboardAlerts() {

    const container =
        document.getElementById(
            "dashboardAlerts"
        );


    if (!container) return;


    container.innerHTML = "";


    const mezzi =
        Object.entries(camionData)
            .filter(([id, camion]) =>
                camion && !camion.uscita
            );


    const alerts = [];


    mezzi.forEach(([id, camion]) => {

        const permanenza =
            calcolaPermanenza(
                camion.ingresso
            );


        if (permanenza.minuti >= 480) {

            alerts.push({
                id,
                camion,
                permanenza
            });

        }

    });


    alerts.sort(
        (a,b) =>
            b.permanenza.minuti -
            a.permanenza.minuti
    );


    if (!alerts.length) {

        container.innerHTML =
            `<div class="emptyMessage">
                Nessun mezzo da controllare.
            </div>`;

        return;

    }


    alerts.forEach(item => {

        const div =
            document.createElement("div");


        div.className =
            "alertItem " +
            (
                item.permanenza.minuti >= 1440
                    ? "over24"
                    : "over8"
            );


        div.innerHTML = `

            <div>

                <div class="alertPlate">
                    ${escapeHtml(
                        item.camion.targa || ""
                    )}
                </div>

                <div class="alertTime">

                    Park:
                    ${escapeHtml(
                        item.camion.destinazione || ""
                    )}

                    ·

                    ${escapeHtml(
                        item.permanenza.testo
                    )}

                </div>

            </div>

            <strong>

                ${
                    item.permanenza.minuti >= 1440
                        ? "OLTRE 24 ORE"
                        : "OLTRE 8 ORE"
                }

            </strong>

        `;


        div.onclick = () =>
            apriSchedaMezzo(item.id);


        container.appendChild(div);

    });

}



/* =========================================================
   DASHBOARD PARK
   ========================================================= */

function aggiornaDashboardParkSummary() {

    const container =
        document.getElementById(
            "dashboardParkSummary"
        );


    if (!container) return;


    container.innerHTML = "";


    parkGroups.forEach(group => {

        const totale =
            group.parcheggi.length;


        let occupati = 0;


        group.parcheggi.forEach(
            location => {

                if (
                    trovaCamionPark(location)
                ) {

                    occupati++;

                }

            }
        );


        const liberi =
            totale - occupati;


        const percentuale =
            totale
                ? Math.round(
                    occupati /
                    totale *
                    100
                )
                : 0;


        const card =
            document.createElement("div");


        card.className =
            "parkSummaryCard";


        card.innerHTML = `

            <div class="parkSummaryName">
                ${escapeHtml(group.nome)}
            </div>

            <div class="parkSummaryNumbers">

                <span class="parkFreeNumber">
                    ${liberi} liberi
                </span>

                <span class="parkOccupiedNumber">
                    ${occupati} occupati
                </span>

            </div>

            <div class="parkStatusBar">

                <div
                    class="parkStatusFill ${
                        percentuale >= 100
                            ? "full"
                            : percentuale >= 80
                                ? "medium"
                                : ""
                    }"
                    style="width:${percentuale}%"
                ></div>

            </div>

        `;


        card.onclick = () => {

            showPage("park");

            setTimeout(() => {

                const section =
                    Array.from(
                        document.querySelectorAll(
                            ".parkSection"
                        )
                    ).find(section =>
                        section.querySelector("h3")
                            ?.textContent ===
                        group.nome
                    );


                if (section) {

                    section.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }, 50);

        };


        container.appendChild(card);

    });

}



/* =========================================================
   DASHBOARD TRUCK
   ========================================================= */

function aggiornaDashboardTruckList() {

    const container =
        document.getElementById(
            "dashboardTruckList"
        );


    if (!container) return;


    container.innerHTML = "";


    const mezzi =
        Object.entries(camionData)
            .filter(([id, camion]) =>
                camion && !camion.uscita
            )
            .sort((a,b) => {

                const da =
                    parseDateTime(
                        a[1].ingresso
                    )?.getTime() || 0;


                const dbb =
                    parseDateTime(
                        b[1].ingresso
                    )?.getTime() || 0;


                return dbb - da;

            })
            .slice(0, 10);


    if (!mezzi.length) {

        container.innerHTML =
            `<div class="emptyMessage">
                Nessun mezzo presente.
            </div>`;

        return;

    }


    mezzi.forEach(([id, camion]) => {

        const div =
            document.createElement("div");


        div.className =
            "dashboardTruck";


        const permanenza =
            calcolaPermanenza(
                camion.ingresso
            );


        div.innerHTML = `

            <div
                class="clickablePlate"
            >
                ${escapeHtml(
                    camion.targa || ""
                )}
            </div>

            <div>
                ${escapeHtml(
                    camion.destinazione || ""
                )}
            </div>

            <div>
                ${escapeHtml(
                    camion.vettore || ""
                )}
            </div>

            <div class="${permanenza.classe}">
                ${escapeHtml(
                    permanenza.testo
                )}
            </div>

        `;


        div.onclick = () =>
            apriSchedaMezzo(id);


        container.appendChild(div);

    });

}



/* =========================================================
   MOVIMENTI
   ========================================================= */

function aggiornaMovimenti() {

    const tbody =
        document.getElementById(
            "monitorMovimenti"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    const ricerca =
        (
            document.getElementById(
                "ricercaMovimenti"
            )?.value || ""
        )
        .trim()
        .toUpperCase();


    db.ref("movimenti")
        .once("value")
        .then(snapshot => {

            const movimenti =
                snapshot.val() || {};


            Object.entries(movimenti)
                .map(([id, movimento]) =>
                    ({id, ...movimento})
                )
                .filter(movimento => {

                    const testo = [

                        movimento.targa,
                        movimento.da,
                        movimento.a,
                        movimento.operatore

                    ]
                    .join(" ")
                    .toUpperCase();


                    return !ricerca ||
                        testo.includes(ricerca);

                })
                .sort((a,b) => {

                    const da =
                        parseDateTime(
                            a.dataOra
                        )?.getTime() || 0;


                    const dbb =
                        parseDateTime(
                            b.dataOra
                        )?.getTime() || 0;


                    return dbb - da;

                })
                .forEach(movimento => {

                    const tr =
                        document.createElement("tr");


                    tr.innerHTML = `

                        <td>
                            ${escapeHtml(
                                movimento.dataOra || ""
                            )}
                        </td>

                        <td class="clickablePlate">
                            ${escapeHtml(
                                movimento.targa || ""
                            )}
                        </td>

                        <td class="moveFrom">
                            ${escapeHtml(
                                movimento.da || "—"
                            )}
                        </td>

                        <td class="moveTo">
                            ${escapeHtml(
                                movimento.a || ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                movimento.operatore || ""
                            )}
                        </td>

                    `;


                    tr.children[1].onclick = () => {

                        const found =
                            Object.entries(
                                camionData
                            ).find(
                                ([id, camion]) =>
                                    camion &&
                                    camion.targa ===
                                    movimento.targa
                            );


                        if (found) {

                            apriSchedaMezzo(
                                found[0]
                            );

                        }

                    };


                    tbody.appendChild(tr);

                });

        });

}



/* =========================================================
   STATISTICHE
   ========================================================= */

function aggiornaStatistiche() {

    const tutti =
        Object.values(camionData)
            .filter(Boolean);


    const presenti =
        tutti.filter(c => !c.uscita);


    const usciti =
        tutti.filter(c => c.uscita);


    const ingressiOggi =
        tutti.filter(c =>
            isToday(
                parseDateTime(c.ingresso)
            )
        ).length;


    const usciteOggi =
        usciti.filter(c =>
            isToday(
                parseDateTime(c.uscita)
            )
        ).length;


    const permanenze =
        presenti
            .map(c =>
                calcolaPermanenza(
                    c.ingresso
                ).minuti
            )
            .filter(v => Number.isFinite(v));


    const oltre8 =
        permanenze.filter(
            v => v >= 480
        ).length;


    const oltre24 =
        permanenze.filter(
            v => v >= 1440
        ).length;


    const media =
        permanenze.length
            ? Math.round(
                permanenze.reduce(
                    (a,b) => a + b,
                    0
                ) /
                permanenze.length
            )
            : 0;


    const massima =
        permanenze.length
            ? Math.max(...permanenze)
            : 0;


    setText(
        "statIngressi",
        ingressiOggi
    );


    setText(
        "statUscite",
        usciteOggi
    );


    setText(
        "statPresenti",
        presenti.length
    );


    setText(
        "statOltre8",
        oltre8
    );


    setText(
        "statOltre24",
        oltre24
    );


    aggiornaStatisticheMovimenti();

    setText(
        "statMedia",
        minutiInTesto(media)
    );


    setText(
        "statMassima",
        minutiInTesto(massima)
    );


    aggiornaStatistichePark();

}



/* =========================================================
   STATISTICHE MOVIMENTI
   ========================================================= */

function aggiornaStatisticheMovimenti() {

    const element =
        document.getElementById(
            "statSpostamenti"
        );


    if (!element) return;


    db.ref("movimenti")
        .once("value")
        .then(snapshot => {

            const movimenti =
                Object.values(
                    snapshot.val() || {}
                );


            const oggi =
                movimenti.filter(m =>
                    isToday(
                        parseDateTime(
                            m.dataOra
                        )
                    )
                ).length;


            element.textContent =
                oggi;

        });

}



/* =========================================================
   STATISTICHE PARK
   ========================================================= */

function aggiornaStatistichePark() {

    const container =
        document.getElementById(
            "statPark"
        );


    if (!container) return;


    container.innerHTML = "";


    parkGroups.forEach(group => {

        const totale =
            group.parcheggi.length;


        let occupati = 0;


        group.parcheggi.forEach(
            location => {

                if (
                    trovaCamionPark(location)
                ) {

                    occupati++;

                }

            }
        );


        const percentuale =
            totale
                ? Math.round(
                    occupati /
                    totale *
                    100
                )
                : 0;


        const row =
            document.createElement("div");


        row.className =
            "statParkRow";


        row.innerHTML = `

            <div class="statParkHeader">

                <strong>
                    ${escapeHtml(group.nome)}
                </strong>

                <span>
                    ${occupati}/${totale}
                    (${percentuale}%)
                </span>

            </div>

            <div class="parkStatusBar">

                <div
                    class="parkStatusFill ${
                        percentuale >= 100
                            ? "full"
                            : percentuale >= 80
                                ? "medium"
                                : ""
                    }"
                    style="width:${percentuale}%"
                ></div>

            </div>

        `;


        container.appendChild(row);

    });

}



/* =========================================================
   UTILITÀ
   ========================================================= */

function setText(id, value) {

    const el =
        document.getElementById(id);


    if (el) {

        el.textContent =
            value;

    }

}



function isToday(date) {

    if (!date) return false;


    const now =
        new Date();


    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );

}



function minutiInTesto(minuti) {

    const giorni =
        Math.floor(minuti / 1440);


    const ore =
        Math.floor(
            (minuti % 1440) / 60
        );


    const min =
        minuti % 60;


    if (giorni > 0) {

        return `${giorni}g ${ore}h ${String(min).padStart(2,"0")}m`;

    }


    return `${ore}h ${String(min).padStart(2,"0")}m`;

}



/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}



/* =========================================================
   FIREBASE LISTENER
   ========================================================= */

db.ref("camion").on(
    "value",
    snapshot => {

        camionData =
            snapshot.val() || {};


        aggiornaPark();

        aggiornaMonitor();

        aggiornaDashboard();

        aggiornaStatistiche();

    }
);



/* =========================================================
   AGGIORNAMENTO AUTOMATICO
   ========================================================= */

setInterval(() => {

    aggiornaPark();

    aggiornaMonitor();

    aggiornaDashboard();

    aggiornaStatistiche();

}, 30000);
// ═══════════════════════════════════════════
//  BUDGET TRACKER — Google Apps Script v3
//  Tutto via GET per evitare problemi CORS
// ═══════════════════════════════════════════

const SHEET_NAME = "Spese";
const SHEET_META = "Meta";

function getOrCreateSheet(name) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
        sheet = ss.insertSheet(name);
        if (name === SHEET_NAME) {
            sheet.appendRow(["ID", "Data", "Categoria", "Descrizione", "Importo", "Mese", "Anno"]);
            sheet.getRange(1, 1, 1, 7)
                .setFontWeight("bold")
                .setBackground("#1a1a2e")
                .setFontColor("#E07A5F");
            sheet.setColumnWidth(1, 140);
            sheet.setColumnWidth(4, 200);
        }
        if (name === SHEET_META) {
            sheet.appendRow(["Chiave", "Valore"]);
        }
    }
    return sheet;
}

// Tutto via GET — niente CORS
function doGet(e) {
    try {
        const action = e.parameter.action;

        if (action === "load") {
            return loadAll();
        }

        if (action === "sync") {
            const raw = e.parameter.data || "{}";
            const data = JSON.parse(decodeURIComponent(raw));
            return syncAll(data.spese || [], data.budgets || {});
        }

        return respond({ ok: false, error: "Azione non riconosciuta: " + action });
    } catch (err) {
        return respond({ ok: false, error: err.message });
    }
}

// POST mantenuto per compatibilità
function doPost(e) {
    try {
        const raw = e.postData ? e.postData.contents : "{}";
        const data = JSON.parse(raw);
        if (data.action === "sync") return syncAll(data.spese || [], data.budgets || {});
        return respond({ ok: false, error: "Azione non riconosciuta" });
    } catch (err) {
        return respond({ ok: false, error: err.message });
    }
}

function syncAll(spese, budgets) {
    const sheet = getOrCreateSheet(SHEET_NAME);
    const meta = getOrCreateSheet(SHEET_META);

    // Pulisci e riscrivi
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);

    if (spese && spese.length > 0) {
        const rows = spese.map(s => [
            String(s.id), s.data, s.categoria,
            s.descrizione, Number(s.importo), Number(s.mese), Number(s.anno)
        ]);
        sheet.getRange(2, 1, rows.length, 7).setValues(rows);
    }

    // Salva budgets e timestamp
    const metaLast = meta.getLastRow();
    if (metaLast > 1) meta.deleteRows(2, metaLast - 1);
    meta.appendRow(["budgets", JSON.stringify(budgets || {})]);
    meta.appendRow(["last_sync", new Date().toLocaleString("it-IT")]);

    return respond({ ok: true, saved: spese ? spese.length : 0 });
}

function loadAll() {
    const sheet = getOrCreateSheet(SHEET_NAME);
    const meta = getOrCreateSheet(SHEET_META);

    const spese = [];
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        const rows = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
        rows.forEach(r => {
            if (r[0]) spese.push({
                id: String(r[0]),
                data: r[1],
                categoria: r[2],
                descrizione: r[3],
                importo: Number(r[4]),
                mese: Number(r[5]),
                anno: Number(r[6])
            });
        });
    }

    let budgets = {};
    const metaLast = meta.getLastRow();
    if (metaLast > 1) {
        const metaRows = meta.getRange(2, 1, metaLast - 1, 2).getValues();
        metaRows.forEach(r => {
            if (r[0] === "budgets") {
                try { budgets = JSON.parse(r[1] || "{}"); } catch (e) { }
            }
        });
    }

    return respond({ ok: true, spese, budgets });
}

function respond(obj) {
    return ContentService
        .createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}
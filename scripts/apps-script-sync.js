/**
 * QAQC DASHBOARD -> GOOGLE SHEETS LIVE SYNC CONNECTOR
 * Handles GET (fetch all tabs in Google Spreadsheet) & POST (add/update rows)
 * Auto-detects header row regardless of how many title/header banner rows are added at the top!
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    const result = [];

    // Kata kunci untuk mengesan baris header walaupun ada tajuk di atas
    const keywords = [
      "reference", "ref no", "ref.", "ref",
      "title", "request for work", "description", "inspection", "subject", "item",
      "location", "area", "block", "zone",
      "date", "tarikh", "cast",
      "status", "result", "keputusan",
      "acc", "submission", "no."
    ];

    sheets.forEach(sheet => {
      const sheetName = sheet.getName().trim();
      // Abaikan helaian tersembunyi atau helaian kosong
      if (sheet.isSheetHidden && sheet.isSheetHidden()) return;

      const data = sheet.getDataRange().getValues();
      if (data.length < 2) return;

      // 1. Cari baris header secara dinamik dalam 20 baris pertama
      let headerRowIndex = -1;
      let maxScore = 0;

      for (let r = 0; r < Math.min(20, data.length); r++) {
        const rowVals = data[r].map(c => String(c || "").trim().toLowerCase());
        const rowStr = rowVals.join(" ");
        let score = 0;
        for (const kw of keywords) {
          if (rowStr.includes(kw)) score++;
        }
        // Syarat: mesti ada sekurang-kurangnya 2 padanan kata kunci utama
        if (score > maxScore && score >= 2) {
          maxScore = score;
          headerRowIndex = r;
        }
      }

      // Jika tiada padanan kuat, cuba cari baris pertama yang mengandungi 'ref' atau 'title' atau 'status'
      if (headerRowIndex === -1) {
        for (let r = 0; r < Math.min(20, data.length); r++) {
          const rowStr = data[r].map(c => String(c || "").trim().toLowerCase()).join(" ");
          if (rowStr.includes("ref") || rowStr.includes("title") || rowStr.includes("status")) {
            headerRowIndex = r;
            break;
          }
        }
      }

      if (headerRowIndex === -1) headerRowIndex = 0;

      const headers = data[headerRowIndex].map(h => String(h || "").trim().toLowerCase());

      // 2. Padankan lajur berdasarkan nama header
      let refIdx = headers.findIndex(h => h.includes("reference") || h.includes("ref no") || h.includes("ref.") || h.includes("rfwi no"));
      if (refIdx === -1) refIdx = headers.findIndex(h => h === "ref" || h.includes("submittal") || h.includes("mos no"));

      let titleIdx = headers.findIndex(h => h.includes("title") || h.includes("request for work") || h.includes("description") || h.includes("subject") || h.includes("item desc"));
      if (titleIdx === -1) titleIdx = headers.findIndex(h => h.includes("item") || h.includes("testing") || h.includes("activity") || h.includes("details"));

      let dateIdx = headers.findIndex(h => h.includes("date inspection") || h.includes("date cast") || h.includes("target date") || h.includes("date") || h.includes("tarikh"));
      let locIdx = headers.findIndex(h => h.includes("location") || h.includes("lokasi") || h.includes("area") || h.includes("block") || h.includes("zone"));
      let statusIdx = headers.findIndex(h => h.includes("status acc") || h.includes("status") || h.includes("result") || h.includes("keputusan"));
      let accIdx = headers.findIndex(h => h.includes("acc submission") || h.includes("acc ref") || h.includes("acc"));

      // Jika refIdx masih tiada, guna lajur B (indeks 1) atau A (indeks 0)
      if (refIdx === -1 && headers.length > 1) {
        refIdx = 1;
      }
      if (titleIdx === -1 && headers.length > 2) {
        titleIdx = 2;
      }

      // 3. Baca baris rekod bermula selepas baris header
      for (let r = headerRowIndex + 1; r < data.length; r++) {
        const row = data[r];
        const refNo = refIdx !== -1 ? String(row[refIdx] || "").trim() : "";
        const title = titleIdx !== -1 ? String(row[titleIdx] || "").trim() : "";

        // Abaikan baris kosong
        if (!refNo && !title) continue;

        // Abaikan baris rumusan seperti "Total", "Subtotal", dsb.
        const refLower = refNo.toLowerCase();
        const titleLower = title.toLowerCase();
        if (refLower.includes("total") || titleLower.includes("total") || refLower.includes("revision date") || refLower.includes("package:")) continue;

        // Ekstrak dan format tarikh
        let recordDate = "";
        if (dateIdx !== -1 && row[dateIdx] !== undefined && row[dateIdx] !== null && row[dateIdx] !== "") {
          const rawD = row[dateIdx];
          if (rawD instanceof Date && !isNaN(rawD.getTime())) {
            recordDate = Utilities.formatDate(rawD, "Asia/Kuala_Lumpur", "yyyy-MM-dd");
          } else if (typeof rawD === "number") {
            // Excel / Sheets numeric date serial
            const d = new Date((rawD - (25567 + 2)) * 86400 * 1000);
            if (!isNaN(d.getTime())) {
              recordDate = Utilities.formatDate(d, "Asia/Kuala_Lumpur", "yyyy-MM-dd");
            } else {
              recordDate = String(rawD).trim();
            }
          } else {
            const str = String(rawD).trim();
            const parsed = new Date(str);
            if (!isNaN(parsed.getTime())) {
              recordDate = Utilities.formatDate(parsed, "Asia/Kuala_Lumpur", "yyyy-MM-dd");
            } else {
              recordDate = str;
            }
          }
        }

        const rawStatus = statusIdx !== -1 ? String(row[statusIdx] || "").trim() : "";
        const status = rawStatus || "Pending";
        const location = locIdx !== -1 ? String(row[locIdx] || "").trim() : "";
        const accRef = accIdx !== -1 ? String(row[accIdx] || "").trim() : "";

        result.push({
          id: `gs-${sheetName}-${r + 1}`,
          sheetName: sheetName,
          subcategory: sheetName,
          sourceRow: r + 1,
          refNo: refNo || `REF-${sheetName}-${r + 1}`,
          title: title || refNo,
          recordDate: recordDate,
          location: location,
          status: status,
          accRef: accRef
        });
      }
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      total: result.length,
      records: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : "";
    if (!raw) throw new Error("No payload provided");
    const payload = JSON.parse(raw);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = payload.sheetName || payload.subcategory;
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      const all = ss.getSheets();
      sheet = all.find(s => s.getName().trim().toLowerCase() === String(sheetName).trim().toLowerCase());
    }

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["No", "Reference Number", "Title / Description", "Date Inspection", "Location", "Status ACC", "ACC Ref"]);
    }

    if (payload.action === "update" && payload.sourceRow) {
      const row = Number(payload.sourceRow);
      const data = sheet.getDataRange().getValues();
      const headers = data[0].map(h => String(h || "").toLowerCase());
      const statusIdx = headers.findIndex(h => h.includes("status") || h.includes("result"));
      if (statusIdx !== -1 && payload.status) {
        sheet.getRange(row, statusIdx + 1).setValue(payload.status);
      }
    } else {
      const nextNo = sheet.getLastRow();
      sheet.appendRow([
        nextNo,
        payload.refNo || "",
        payload.title || "",
        payload.recordDate || Utilities.formatDate(new Date(), "Asia/Kuala_Lumpur", "yyyy-MM-dd"),
        payload.location || "",
        payload.status || "Pending",
        payload.accRef || ""
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Synced with Google Sheet successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

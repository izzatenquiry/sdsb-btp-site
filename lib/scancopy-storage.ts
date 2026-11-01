// ==============================================================================
// SDSB BTP QAQC - Scancopy Document Storage Engine (IndexedDB + Fast Cache)
// Handles attaching, uploading, storing, and previewing closed sign-off PDFs
// ==============================================================================

export type ScancopyMeta = {
  refNo: string;
  recordId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type ScancopyRecord = ScancopyMeta & {
  dataUrl: string; // base64 data url or blob url
};

const DB_NAME = "BTP_QAQC_SCANCOPIES_DB";
const DB_VERSION = 1;
const STORE_NAME = "scancopies";
const META_INDEX_KEY = "btp_scancopy_meta_index_v1";

// In-memory synchronous fast cache for table row indicators
let metaCache: Record<string, ScancopyMeta> = {};

export function normalizeRefKey(refNo: string): string {
  return String(refNo || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

// Synchronous check if a refNo has an uploaded scancopy
export function hasScancopySync(refNo: string): boolean {
  if (!refNo) return false;
  const key = normalizeRefKey(refNo);
  if (metaCache[key]) return true;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(META_INDEX_KEY);
      if (stored) {
        metaCache = JSON.parse(stored);
        return Boolean(metaCache[key]);
      }
    } catch {
      /* ignore */
    }
  }
  return false;
}

export function getScancopyMetaSync(refNo: string): ScancopyMeta | null {
  if (!refNo) return null;
  const key = normalizeRefKey(refNo);
  if (metaCache[key]) return metaCache[key];

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(META_INDEX_KEY);
      if (stored) {
        metaCache = JSON.parse(stored);
        return metaCache[key] || null;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function updateMetaIndex(meta: ScancopyMeta) {
  const key = normalizeRefKey(meta.refNo);
  metaCache[key] = meta;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(META_INDEX_KEY, JSON.stringify(metaCache));
    } catch {
      /* ignore */
    }
  }
}

function removeMetaIndex(refNo: string) {
  const key = normalizeRefKey(refNo);
  delete metaCache[key];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(META_INDEX_KEY, JSON.stringify(metaCache));
    } catch {
      /* ignore */
    }
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "refNo" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save an uploaded Scancopy PDF to IndexedDB
 */
export async function saveScancopyDocument(
  refNo: string,
  recordId: string,
  file: File | Blob,
  fileName: string,
  uploadedBy: string = "Nur Damia"
): Promise<ScancopyRecord> {
  const key = normalizeRefKey(refNo);

  // Convert File / Blob to Data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const record: ScancopyRecord = {
    refNo: key,
    recordId,
    fileName,
    fileSize: file.size,
    fileType: file.type || "application/pdf",
    uploadedAt: new Date().toLocaleString("en-MY", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    uploadedBy,
    dataUrl,
  };

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  updateMetaIndex({
    refNo: key,
    recordId,
    fileName,
    fileSize: file.size,
    fileType: file.type || "application/pdf",
    uploadedAt: record.uploadedAt,
    uploadedBy,
  });

  return record;
}

/**
 * Retrieve a Scancopy PDF record from IndexedDB
 */
export async function getScancopyDocument(refNo: string): Promise<ScancopyRecord | null> {
  const key = normalizeRefKey(refNo);
  try {
    const db = await openDb();
    return await new Promise<ScancopyRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to get scancopy from IndexedDB:", err);
    return null;
  }
}

/**
 * Delete a Scancopy PDF record
 */
export async function deleteScancopyDocument(refNo: string): Promise<void> {
  const key = normalizeRefKey(refNo);
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to delete scancopy from IndexedDB:", err);
  }
  removeMetaIndex(refNo);
}

/**
 * Initialize sample demo scancopy for Closed records if empty
 */
export function initializeSampleScancopyIfEmpty() {
  if (typeof window === "undefined") return;
  const sampleRef = "BTP-A/SDSB/MBW/C&S/0001";
  const key = normalizeRefKey(sampleRef);

  if (!hasScancopySync(key)) {
    // Generate a clean dummy sign-off PDF sample dataUrl for instant testing
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Signed Scancopy - ${sampleRef}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 20px; font-weight: bold; color: #0f766e; }
          .stamp { border: 2px dashed #059669; padding: 12px; border-radius: 8px; background: #ecfdf5; display: inline-block; margin-top: 20px; }
          .badge { background: #0f766e; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">SHENGDING CONSTRUCTION SDN BHD (SDSB)</div>
          <p>BANTING TECHNOLOGY PARK · VERIFIED CLOSED SCANCOPY</p>
        </div>
        <p><strong>Document Ref No:</strong> ${sampleRef}</p>
        <p><strong>Inspection Scope:</strong> Precast Pile Driving & Pile Cap Reinforcement Sign-off</p>
        <p><strong>Status:</strong> <span class="badge">CLOSED / PASSED WITH NO OBJECTION</span></p>
        <div class="stamp">
          <p style="margin:0; font-weight:bold; color:#047857;">VERIFIED & CLOSED BY CONSULTANT RESIDENT ENGINEER</p>
          <p style="margin:5px 0 0 0; font-size:12px;">Signed by: Ir. Dr. K. Nathan · Date: 28 Oct 2026</p>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([sampleHtml], { type: "text/html" });
    const reader = new FileReader();
    reader.onload = () => {
      saveScancopyDocument(
        sampleRef,
        "sample-record-01",
        blob,
        "Signed_Signoff_BTP-MBW-0001.pdf",
        "Nur Damia"
      ).catch(() => {});
    };
    reader.readAsDataURL(blob);
  }
}

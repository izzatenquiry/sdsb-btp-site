"use client";

import { useEffect, useRef, useState } from "react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_BODY_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_SUBTITLE_CLASS,
  MODAL_TITLE_CLASS,
} from "./CenteredModal";
import {
  FileText,
  Save,
  Share2,
  Printer,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Calendar,
  CloudSun,
  MapPin,
  Truck,
  Users,
  HardHat,
  ShieldAlert,
  ClipboardList,
  Sparkles,
  Camera,
  Link as LinkIcon,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import {
  buildDsrWhatsAppText,
  DsrPhoto,
  DsrRecord,
  getDsrRecords,
  nextDsrRefNo,
  saveDsrRecord,
} from "@/lib/daily-reports";

/**
 * Compresses and resizes image on client-side before storing or transmitting.
 * Ensures compatibility across mobile phones (capturing 12-48MP photos) and PC.
 */
async function compressImageFile(file: File, maxDim = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return resolve("");
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(result);
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

type Props = {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  editDsrId?: string | null;
  userName?: string;
  onSaved?: (dsr: DsrRecord) => void;
  onPrintDsr?: (dsr: DsrRecord) => void;
};

const BTP_ZONES = [
  "Zone 1 · Block A Substructure & Ground Beams",
  "Zone 1 · Block B Foundation & Piling",
  "Zone 1 · Block C Superstructure",
  "Zone 2 · RC Retaining Wall & Slope Protection",
  "Zone 2 · Main Detention Pond & Culverts",
  "Zone 3 · Infrastructure & Main Access Road",
  "Zone 3 · Electrical Substation & Drainage",
  "Central Batching & QAQC Laboratory Area",
];

const PRESET_PLANT = [
  "Concrete Boom Pump (1 unit)",
  "Transit Mixers (4 units)",
  "Excavator 20T (2 units)",
  "Vibratory Roller 10T (1 unit)",
  "Mobile Crane 25T (1 unit)",
  "Air Compressor & Breakers (3 sets)",
  "Poker Vibrators (4 units)",
  "Total Station & Automatic Level (1 set)",
];

const PRESET_MANPOWER = [
  "Site Agent (1)",
  "QAQC Lead Engineer (1)",
  "Safety Supervisor (1)",
  "Licensed Surveyor (2)",
  "Bar Benders & Steelfixers (6)",
  "Carpenters & Falsework Crew (6)",
  "Concreting Crew (8)",
  "General Construction Workers (10)",
];

export function DarSiteFormModal({
  open,
  onClose,
  initialDate,
  editDsrId,
  userName = "NUR DAMIA BT SHAFEE",
  onSaved,
  onPrintDsr,
}: Props) {
  const [refNo, setRefNo] = useState("");
  const [date, setDate] = useState(initialDate || new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<DsrRecord["shift"]>("Day Shift (08:00 - 17:00)");
  const [weatherAm, setWeatherAm] = useState<DsrRecord["weatherAm"]>("Sunny");
  const [weatherPm, setWeatherPm] = useState<DsrRecord["weatherPm"]>("Cloudy");
  const [location, setLocation] = useState("Banting Technology Park (BTP)");
  const [subLocation, setSubLocation] = useState(BTP_ZONES[0]);
  const [descriptionOfWorks, setDescriptionOfWorks] = useState("");
  const [plant, setPlant] = useState("");
  const [manpower, setManpower] = useState("");
  const [activities, setActivities] = useState("");
  const [materials, setMaterials] = useState("");
  const [qaqcNotes, setQaqcNotes] = useState("");
  const [hsseNotes, setHsseNotes] = useState("Daily morning toolbox meeting conducted at 07:45 AM. Mandatory PPE compliance inspected.");
  const [constraints, setConstraints] = useState("None. Site works proceeded as planned.");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  const [remarks, setRemarks] = useState("");
  const [photos, setPhotos] = useState<DsrPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [inputCaption, setInputCaption] = useState("");
  const [preparedBy, setPreparedBy] = useState(userName);
  const [verifiedBy, setVerifiedBy] = useState("");
  const [status, setStatus] = useState<DsrRecord["status"]>("SUBMITTED");

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [waCopied, setWaCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editDsrId) {
      const records = getDsrRecords();
      const existing = records.find((d) => d.id === editDsrId || d.refNo === editDsrId);
      if (existing) {
        setRefNo(existing.refNo);
        setDate(existing.date);
        setShift(existing.shift);
        setWeatherAm(existing.weatherAm);
        setWeatherPm(existing.weatherPm);
        setLocation(existing.location);
        setSubLocation(existing.subLocation);
        setDescriptionOfWorks(existing.descriptionOfWorks);
        setPlant(existing.plant);
        setManpower(existing.manpower);
        setActivities(existing.activities);
        setMaterials(existing.materials);
        setQaqcNotes(existing.qaqcNotes);
        setHsseNotes(existing.hsseNotes);
        setConstraints(existing.constraints);
        setTomorrowPlan(existing.tomorrowPlan);
        setRemarks(existing.remarks);
        setPhotos(existing.photos || []);
        setPreparedBy(existing.preparedBy || userName);
        setVerifiedBy(existing.verifiedBy === "Ir. Ahmad Fauzi (RE)" ? "" : (existing.verifiedBy || ""));
        setStatus(existing.status);
        return;
      }
    }

    // New DSR setup
    setRefNo(nextDsrRefNo());
    if (initialDate) setDate(initialDate);
    setPreparedBy(userName);
    setVerifiedBy("");
  }, [open, editDsrId, initialDate, userName]);

  function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);

    const record: DsrRecord = {
      id: editDsrId || `dsr-${Date.now()}`,
      refNo: refNo.trim() || nextDsrRefNo(),
      date,
      shift,
      weatherAm,
      weatherPm,
      location,
      subLocation,
      descriptionOfWorks: descriptionOfWorks.trim(),
      plant: plant.trim(),
      manpower: manpower.trim(),
      activities: activities.trim(),
      materials: materials.trim(),
      qaqcNotes: qaqcNotes.trim(),
      hsseNotes: hsseNotes.trim(),
      constraints: constraints.trim(),
      tomorrowPlan: tomorrowPlan.trim(),
      remarks: remarks.trim(),
      photos,
      preparedBy,
      verifiedBy,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveDsrRecord(record);

    setTimeout(() => {
      setSaving(false);
      setSuccessToast("DSR successfully saved & synchronized!");
      if (onSaved) onSaved(record);
      setTimeout(() => {
        setSuccessToast("");
        onClose();
      }, 1200);
    }, 250);
  }

  function handleShareWhatsApp() {
    const record: DsrRecord = {
      id: editDsrId || `dsr-${Date.now()}`,
      refNo,
      date,
      shift,
      weatherAm,
      weatherPm,
      location,
      subLocation,
      descriptionOfWorks,
      plant,
      manpower,
      activities,
      materials,
      qaqcNotes,
      hsseNotes,
      constraints,
      tomorrowPlan,
      remarks,
      photos,
      preparedBy,
      verifiedBy,
      status,
      createdAt: "",
      updatedAt: "",
    };
    const text = buildDsrWhatsAppText(record);
    navigator.clipboard.writeText(text);
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 3000);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function processImageFiles(files: FileList | File[]) {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) return;
    setPhotoUploading(true);
    try {
      const newItems: DsrPhoto[] = [];
      const timestamp = new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
      const zoneTag = subLocation.split("·")[0]?.trim() || "Site Zone";
      for (const file of valid) {
        const dataUrl = await compressImageFile(file);
        if (dataUrl) {
          const rawName = file.name ? file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Site inspection photo";
          newItems.push({
            id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url: dataUrl,
            caption: rawName,
            timestamp,
            zone: zoneTag,
          });
        }
      }
      setPhotos((prev) => [...prev, ...newItems]);
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  }

  function handleFilesFromInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      void processImageFiles(e.target.files);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void processImageFiles(e.dataTransfer.files);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    if (!e.clipboardData.items) return;
    const items = Array.from(e.clipboardData.items);
    const imageFiles: File[] = [];
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      void processImageFiles(imageFiles);
    }
  }

  function handleAddUrlPhoto() {
    if (!inputUrl.trim()) return;
    const newPhoto: DsrPhoto = {
      id: `p-${Date.now()}`,
      url: inputUrl.trim(),
      caption: inputCaption.trim() || "Site progress photo",
      timestamp: new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }),
      zone: subLocation.split("·")[0]?.trim() || "Site Zone",
    };
    setPhotos((prev) => [...prev, newPhoto]);
    setInputUrl("");
    setInputCaption("");
    setUrlModalOpen(false);
  }

  function handleUpdatePhotoCaption(id: string, newCaption: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption: newCaption } : p)));
  }

  function handleRemovePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  function appendPlant(item: string) {
    if (!plant.trim()) setPlant(item);
    else if (!plant.includes(item)) setPlant(`${plant}, ${item}`);
  }

  function appendManpower(item: string) {
    if (!manpower.trim()) setManpower(item);
    else if (!manpower.includes(item)) setManpower(`${manpower}, ${item}`);
  }

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="dsr-form-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />

      {/* Header */}
      <div className={MODAL_HEADER_CLASS}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl bg-accent text-white font-black text-base sm:text-lg shadow-md shrink-0">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="dsr-form-title" className="text-sm sm:text-base font-bold text-ink tracking-tight">
              Daily Site Report (DSR)
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/25 whitespace-nowrap">
                {refNo}
              </span>
              <span className="text-[10px] text-muted truncate hidden sm:inline">
                SHENGDING CONSTRUCTION SDN BHD (SDSB) · BTP QAQC Control
              </span>
            </div>
            <p className="text-[10px] text-muted truncate sm:hidden mt-0.5">
              SHENGDING CONSTRUCTION SDN BHD (SDSB)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={MODAL_CLOSE_CLASS}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Body / Form */}
      <form onSubmit={handleSave} className={`${MODAL_BODY_CLASS} p-4 sm:p-5 space-y-4`}>
        {successToast && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Section 1: Basic Site Metadata */}
        <div className="rounded-xl border border-line bg-paper/40 p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-1.5">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              General Parameters & Site Conditions
            </span>
            <span className="text-[10px] text-muted">Mandatory QAQC Document</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Report Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Shift Schedule
              </label>
              <select
                value={shift}
                onChange={(e: any) => setShift(e.target.value)}
                className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
              >
                <option value="Day Shift (08:00 - 17:00)">Day Shift (08:00 - 17:00)</option>
                <option value="Night Shift (20:00 - 05:00)">Night Shift (20:00 - 05:00)</option>
                <option value="Extended Shift">Extended Shift</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Weather (Morning AM)
              </label>
              <select
                value={weatherAm}
                onChange={(e: any) => setWeatherAm(e.target.value)}
                className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
              >
                <option value="Sunny">☀️ Sunny</option>
                <option value="Cloudy">⛅ Cloudy</option>
                <option value="Light Rain">🌦️ Light Rain</option>
                <option value="Heavy Rain">⛈️ Heavy Rain</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Weather (Afternoon PM)
              </label>
              <select
                value={weatherPm}
                onChange={(e: any) => setWeatherPm(e.target.value)}
                className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
              >
                <option value="Sunny">☀️ Sunny</option>
                <option value="Cloudy">⛅ Cloudy</option>
                <option value="Light Rain">🌦️ Light Rain</option>
                <option value="Heavy Rain">⛈️ Heavy Rain</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-ink mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-ink mb-1">
                Zone / Sub-Location <span className="text-red-500">*</span>
              </label>
              <select
                value={subLocation}
                onChange={(e) => setSubLocation(e.target.value)}
                className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink font-semibold outline-none focus:border-accent"
              >
                {BTP_ZONES.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Works & Activities */}
        <div className="rounded-xl border border-line bg-paper/40 p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-1.5">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5 text-teal-600" />
              Description of Works & Site Activities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Description of Works <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={descriptionOfWorks}
                onChange={(e) => setDescriptionOfWorks(e.target.value)}
                placeholder="e.g. Concreting of ground beams GB1 to GB6 with Ready-Mix G35..."
                className="w-full rounded-lg border border-line bg-field p-2 text-xs text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Detailed Activities Log
              </label>
              <textarea
                rows={3}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="1. Pre-pour inspection passed.&#10;2. Concreting started at 09:30 AM...&#10;3. Cube testing conducted."
                className="w-full rounded-lg border border-line bg-field p-2 text-xs text-ink outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Plant & Manpower */}
        <div className="rounded-xl border border-line bg-paper/40 p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-1.5">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-amber-600" />
              Machine / Plant & Manpower Log
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-ink">
                  Plant & Machinery Deployed
                </label>
                <span className="text-[10px] text-muted">Tap to append:</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {PRESET_PLANT.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => appendPlant(p)}
                    className="text-[9px] bg-paper px-1.5 py-0.5 rounded border border-line hover:border-accent"
                  >
                    + {p.split(" ")[0]}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={plant}
                onChange={(e) => setPlant(e.target.value)}
                placeholder="e.g. Concrete Boom Pump (1), Transit Mixers (5), Poker Vibrators (3)..."
                className="w-full rounded-lg border border-line bg-field p-2 text-xs text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-ink">
                  Manpower Headcount
                </label>
                <span className="text-[10px] text-muted">Tap to append:</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {PRESET_MANPOWER.slice(0, 4).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => appendManpower(m)}
                    className="text-[9px] bg-paper px-1.5 py-0.5 rounded border border-line hover:border-accent"
                  >
                    + {m.split(" ")[0]}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={manpower}
                onChange={(e) => setManpower(e.target.value)}
                placeholder="e.g. Site Agent (1), QAQC Lead (1), Concreting Crew (8), General Workers (6)..."
                className="w-full rounded-lg border border-line bg-field p-2 text-xs text-ink outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 4: QAQC Notes, Materials & HSSE */}
        <div className="rounded-xl border border-line bg-paper/40 p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-1.5">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <HardHat className="h-3.5 w-3.5 text-emerald-600" />
              Materials, QAQC Quality Compliance & HSSE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Materials Delivered / Used
              </label>
              <textarea
                rows={2}
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="e.g. Ready Mix G35 (54 m³), Y20 Rebar (4.5t)..."
                className="w-full rounded-lg border border-line bg-field p-2 text-xs text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                QAQC Notes (RFWI / Cube / Tests)
              </label>
              <textarea
                rows={2}
                value={qaqcNotes}
                onChange={(e) => setQaqcNotes(e.target.value)}
                placeholder="e.g. RFWI-A-CS-0042 passed. Slump 125mm. 6 cubes sampled."
                className="w-full rounded-lg border border-line bg-field p-2 text-xs text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                HSSE & Safety Notes
              </label>
              <textarea
                rows={2}
                value={hsseNotes}
                onChange={(e) => setHsseNotes(e.target.value)}
                placeholder="e.g. Morning toolbox talk conducted. Mandatory PPE compliance."
                className="w-full rounded-lg border border-line bg-field p-2 text-xs text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Constraints / Weather / Issues
              </label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. Rain delay 30 mins; tarpaulin protection deployed."
                className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Tomorrow / Next Shift Plan
              </label>
              <input
                type="text"
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                placeholder="e.g. Formwork stripping, water curing, rebar tying for Block B."
                className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Progress Photos (Mobile Camera & PC File Upload) */}
        <div className="rounded-xl border border-line bg-paper/40 p-3.5 space-y-3">
          {/* Hidden inputs for Camera (Phone) and File Picker (PC / Phone) */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFilesFromInput}
          />
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFilesFromInput}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-2">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-indigo-600" />
              Site Progress Photos & Evidence ({photos.length})
            </span>
            <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:items-center">
              {/* Phone Camera button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer text-center whitespace-nowrap"
                title="Capture photo directly using mobile camera"
              >
                <Camera className="h-3.5 w-3.5 shrink-0" />
                <span>Camera</span>
              </button>

              {/* PC / Gallery File Picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-1 rounded-md bg-accent px-2 py-1.5 text-[11px] font-bold text-white hover:bg-accent-bright transition cursor-pointer shadow-xs text-center whitespace-nowrap"
                title="Select photos from computer or device gallery"
              >
                <Upload className="h-3.5 w-3.5 shrink-0" />
                <span>+ Add Photos</span>
              </button>

              {/* Quick URL Toggle */}
              <button
                type="button"
                onClick={() => setUrlModalOpen((v) => !v)}
                className="inline-flex items-center justify-center gap-1 rounded-md border border-line bg-paper px-2 py-1.5 text-[11px] font-semibold text-muted hover:text-ink transition cursor-pointer text-center whitespace-nowrap"
                title="Add photo via web URL link"
              >
                <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                <span>URL</span>
              </button>
            </div>
          </div>

          {/* Image Compression & Uploading Indicator */}
          {photoUploading && (
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-accent/30 bg-accent/10 text-xs font-semibold text-accent animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing & optimizing image size for mobile & desktop...</span>
            </div>
          )}

          {/* URL Input Box (if opened) */}
          {urlModalOpen && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink flex items-center gap-1">
                  <LinkIcon className="h-3.5 w-3.5 text-accent" />
                  Add Photo via Web URL
                </span>
                <button
                  type="button"
                  onClick={() => setUrlModalOpen(false)}
                  className="text-muted hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://... (Site image URL)"
                  className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
                />
                <input
                  type="text"
                  value={inputCaption}
                  onChange={(e) => setInputCaption(e.target.value)}
                  placeholder="Site photo caption (e.g. Rebar inspection Grid A)"
                  className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setUrlModalOpen(false)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddUrlPhoto}
                  disabled={!inputUrl.trim()}
                  className="px-3 py-1 rounded-md bg-accent text-white text-xs font-bold disabled:opacity-50 hover:bg-accent-bright"
                >
                  + Add Photo
                </button>
              </div>
            </div>
          )}

          {/* Dropzone & Photo Gallery Grid */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onPaste={handlePaste}
            className={`transition rounded-xl ${
              isDragOver ? "ring-2 ring-accent bg-accent/10" : ""
            }`}
          >
            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 py-6 px-4 rounded-xl border-2 border-dashed border-line bg-paper/60 hover:bg-paper/80 transition text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent shadow-xs">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-ink">
                    No site progress photos attached yet
                  </p>
                  <p className="text-[11px] text-muted max-w-sm">
                    Drag & drop images here, paste screenshot (Ctrl+V), or use the buttons below to open camera or file gallery.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Open Site Camera (Mobile)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold text-white hover:bg-accent-bright transition cursor-pointer shadow-xs"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Select Photo from File / Gallery</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="group relative flex flex-col rounded-xl border border-line bg-paper overflow-hidden shadow-xs hover:shadow-md transition"
                  >
                    <div className="relative h-32 w-full bg-slate-900/10 overflow-hidden">
                      <img
                        src={p.url}
                        alt={p.caption}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-black/75 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {p.zone} · {p.timestamp}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(p.id)}
                        className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white text-xs opacity-90 sm:opacity-0 group-hover:opacity-100 transition cursor-pointer shadow hover:bg-red-700"
                        title="Delete Photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="p-2 space-y-1 bg-paper">
                      <label className="block text-[9px] font-bold text-muted uppercase tracking-wider">
                        Photo Caption
                      </label>
                      <input
                        type="text"
                        value={p.caption}
                        onChange={(e) => handleUpdatePhotoCaption(p.id, e.target.value)}
                        placeholder="Enter photo description..."
                        className="w-full rounded border border-line/70 bg-field px-2 py-1 text-[11px] text-ink outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                ))}

                {/* Add More Tile */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line bg-paper/30 hover:bg-accent/5 hover:border-accent/40 p-4 transition text-muted hover:text-accent cursor-pointer min-h-[140px]"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-accent">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold">+ Add More Photos</span>
                  <span className="text-[10px] text-muted">File / Camera</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 6: Governance Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-line bg-paper/30 p-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-ink mb-1">
              Prepared By (SDSB QAQC)
            </label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink mb-1">
              Verified By (Consultant RE)
            </label>
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              placeholder="Consultant RE / Resident Engineer"
              className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink mb-1">
              DSR Status
            </label>
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink font-bold"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>

        {/* Footer Actions - Strictly Sebaris */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-line w-full shrink-0">
          {/* 1. Share */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-1 sm:px-2.5 py-2 text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer text-center whitespace-nowrap"
            title="Share formatted Daily Site Report to WhatsApp"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{waCopied ? "Copied!" : "Share"}</span>
          </button>

          {/* 2. Print/PDF */}
          {onPrintDsr && (
            <button
              type="button"
              onClick={() => {
                const record: DsrRecord = {
                  id: editDsrId || `dsr-${Date.now()}`,
                  refNo,
                  date,
                  shift,
                  weatherAm,
                  weatherPm,
                  location,
                  subLocation,
                  descriptionOfWorks,
                  plant,
                  manpower,
                  activities,
                  materials,
                  qaqcNotes,
                  hsseNotes,
                  constraints,
                  tomorrowPlan,
                  remarks,
                  photos,
                  preparedBy,
                  verifiedBy,
                  status,
                  createdAt: "",
                  updatedAt: "",
                };
                onPrintDsr(record);
              }}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-line bg-paper px-1 sm:px-2.5 py-2 text-[11px] sm:text-xs font-bold text-ink hover:border-accent hover:text-accent transition cursor-pointer text-center whitespace-nowrap shadow-2xs"
              title="Print / View PDF Document"
            >
              <Printer className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate">Print/PDF</span>
            </button>
          )}

          {/* 3. Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-line bg-paper px-1 sm:px-2.5 py-2 text-[11px] sm:text-xs font-semibold text-muted hover:text-ink transition cursor-pointer text-center whitespace-nowrap shadow-2xs"
          >
            Cancel
          </button>

          {/* 4. Save DSR */}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-accent px-1 sm:px-2.5 py-2 text-[11px] sm:text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer text-center whitespace-nowrap"
          >
            <Save className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{saving ? "Saving..." : "Save DSR"}</span>
          </button>
        </div>
      </form>
    </CenteredModal>
  );
}

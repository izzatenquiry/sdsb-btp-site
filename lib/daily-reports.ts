"use client";

export type DsrPhoto = {
  id: string;
  url: string;
  caption: string;
  timestamp?: string;
  zone?: string;
};

export type DsrRecord = {
  id: string;
  refNo: string;
  date: string; // YYYY-MM-DD
  shift: "Day Shift (08:00 - 17:00)" | "Night Shift (20:00 - 05:00)" | "Extended Shift";
  weatherAm: "Sunny" | "Cloudy" | "Light Rain" | "Heavy Rain";
  weatherPm: "Sunny" | "Cloudy" | "Light Rain" | "Heavy Rain";
  location: string;
  subLocation: string;
  descriptionOfWorks: string;
  plant: string;
  manpower: string;
  activities: string;
  materials: string;
  qaqcNotes: string;
  hsseNotes: string;
  constraints: string;
  tomorrowPlan: string;
  remarks: string;
  photos: DsrPhoto[];
  preparedBy: string;
  verifiedBy: string;
  status: "DRAFT" | "SUBMITTED" | "VERIFIED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
};

export type StaffDailyReportItem = {
  id?: string | null;
  reportDate: string; // YYYY-MM-DD
  workDescription: string;
  updatedAt?: string | null;
  leave?: {
    code: "AL" | "MC" | "EL" | "HL";
    label: string;
    status: string;
  } | null;
  dsr?: {
    id: string;
    refNo: string;
    dateIssued: string;
    descriptionOfWorks: string;
    activities: string;
    location?: string;
  } | null;
};

export type WeeklyReportSummary = {
  id: string;
  reportTitle: string;
  weekRange: string;
  startDate: string;
  endDate: string;
  totalDsrs: number;
  weatherSummary: string;
  plantSummary: string;
  manpowerSummary: string;
  keyActivities: string[];
  qaqcInspectionsCleared: number;
  hsseHighlights: string;
  compiledBy: string;
  compiledAt: string;
};

export type MonthlyReportSummary = {
  id: string;
  reportTitle: string;
  monthYear: string;
  totalDaysLogged: number;
  totalDsrs: number;
  executiveSummary: string;
  majorMilestones: string[];
  qaqcBreakdown: {
    rfwiTotal: number;
    rfwiPassed: number;
    cubeTests: number;
    ncrsIssued: number;
    ncrsClosed: number;
  };
  compiledBy: string;
  compiledAt: string;
};

// Initial seed DSR records for SDSB Banting Technology Park
const SEED_DSRS: DsrRecord[] = [
  {
    id: "dsr-20261028-01",
    refNo: "SDSB-BTP-DSR-26-OCT-0022",
    date: "2026-10-28",
    shift: "Day Shift (08:00 - 17:00)",
    weatherAm: "Sunny",
    weatherPm: "Cloudy",
    location: "Banting Technology Park (BTP)",
    subLocation: "Zone 1 · Block A Substructure",
    descriptionOfWorks:
      "Concreting of ground beams GB1 to GB6 with Ready-Mix G35. Slump test conducted at 125mm. 6 nos test cubes sampled.",
    plant: "Concrete Boom Pump (1 unit), Transit Mixers (5 nos), Backhoe (1 unit), Poker Vibrator (3 units)",
    manpower:
      "Site Agent (1), QAQC Engineer (1), Safety Supervisor (1), Concreting Crew (8), Bar Benders (4), General Workers (6)",
    activities:
      "1. Pre-pour joint inspection with RE (RFWI-A-CS-0042) passed.\n2. Concrete pouring started at 09:30 AM and completed at 02:45 PM.\n3. Formwork bracing checked continuously.",
    materials: "Ready Mix Concrete Grade 35 (54 m³), Curing compound (2 drums)",
    qaqcNotes:
      "RFWI-A-CS-0042 Approved. Slump within 100-150mm specification. Cube samples labeled A-GB-01 to 06.",
    hsseNotes: "Toolbox meeting conducted at 07:45 AM. Mandatory boots, hardhats, and eye protection for concrete crew.",
    constraints: "Short drizzle from 03:00 PM to 03:20 PM; work protected under tarpaulin sheeting.",
    tomorrowPlan: "Striking formwork sides after 24 hrs, apply continuous water curing, start rebar fixing for Block B.",
    remarks: "Good progress achieved. No safety near-misses.",
    photos: [
      {
        id: "p1",
        url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
        caption: "Concreting in progress at Block A Ground Beam GB1-6 with Boom Pump",
        timestamp: "2026-10-28 10:15 AM",
        zone: "Zone 1 · Block A",
      },
      {
        id: "p2",
        url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        caption: "Slump test and cube sampling verification with Consultant RE",
        timestamp: "2026-10-28 11:30 AM",
        zone: "Zone 1 · Testing Bench",
      },
    ],
    preparedBy: "NUR DAMIA BT SHAFEE",
    verifiedBy: "",
    status: "VERIFIED",
    createdAt: "2026-10-28 17:15:00",
    updatedAt: "2026-10-28 18:00:00",
  },
  {
    id: "dsr-20261029-01",
    refNo: "SDSB-BTP-DSR-26-OCT-0023",
    date: "2026-10-29",
    shift: "Day Shift (08:00 - 17:00)",
    weatherAm: "Sunny",
    weatherPm: "Sunny",
    location: "Banting Technology Park (BTP)",
    subLocation: "Zone 2 · RC Retaining Wall RW-03",
    descriptionOfWorks:
      "Rebar fixing, starter bars alignment, and formwork erection for Retaining Wall RW-03 (Stem wall, Height 3.5m, Chainage CH 120 - CH 180).",
    plant: "Mobile Crane 25T (1 unit), Bar Bender Machine (1 unit), Bar Cutter (1 unit), Scaffolding Sets (14 bays)",
    manpower:
      "Site Engineer (1), QAQC Lead (1), Surveyor (2), Bar Benders (6), Formwork Carpenters (6), General Workers (4)",
    activities:
      "1. Surveyor verified wall alignment and founding levels.\n2. Y20 main rebar tying according to drawing SDSB-BTP-STR-RW-102.\n3. Concrete cover spacers 50mm installed at 1.0m c/c grid.",
    materials: "High tensile deformed rebar Y20 & Y16 (6.8 tonnes), Tie wire (5 rolls), 50mm concrete spacers (300 pcs)",
    qaqcNotes:
      "RFWI submitted for wall steel reinforcement inspection tomorrow 10:00 AM with PMC QAQC lead.",
    hsseNotes: "Working at height permits issued. Full body harnesses inspected for carpenters on 3.5m scaffold platforms.",
    constraints: "None. Weather hot and dry throughout the day.",
    tomorrowPlan: "Joint inspection RFWI-B-CS-0043, close wall external formwork panels, arrange concrete pump.",
    remarks: "Formwork alignment plumbness within ±5mm tolerance.",
    photos: [
      {
        id: "p3",
        url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
        caption: "Erection of wall rebar and heavy duty formwork falsework at RW-03",
        timestamp: "2026-10-29 02:40 PM",
        zone: "Zone 2 · Retaining Wall",
      },
    ],
    preparedBy: "NUR DAMIA BT SHAFEE",
    verifiedBy: "Quality Inspector (PMC)",
    status: "VERIFIED",
    createdAt: "2026-10-29 17:30:00",
    updatedAt: "2026-10-29 17:45:00",
  },
  {
    id: "dsr-20261030-01",
    refNo: "SDSB-BTP-DSR-26-OCT-0024",
    date: "2026-10-30",
    shift: "Day Shift (08:00 - 17:00)",
    weatherAm: "Cloudy",
    weatherPm: "Light Rain",
    location: "Banting Technology Park (BTP)",
    subLocation: "Zone 3 · Infrastructure & Access Road",
    descriptionOfWorks:
      "Subgrade trimming, compaction, and laying of 150mm Crusher Run roadbase for main access road CH 000 to CH 250.",
    plant: "Vibratory Roller 10T (1 unit), Motor Grader (1 unit), Water Bowser (1 unit), Tipper Trucks (4 units)",
    manpower:
      "Site Supervisor (1), QAQC Tech (1), Plant Operators (4), Surveyors (2), General Workers (5)",
    activities:
      "1. Field Density Test (FDT) performed by approved independent soil laboratory on subgrade.\n2. Laying and grading of crusher run aggregate.\n3. Rolling to achieve minimum 95% MDD.",
    materials: "Crusher Run Grade A (120 tonnes delivered from local quarry)",
    qaqcNotes:
      "FDT tests 5 nos taken: all achieved >95% relative compaction. Moisture content optimal at 8.2%.",
    hsseNotes: "Traffic marshall deployed at site entrance junction with main highway. Speed limit 15km/h enforced.",
    constraints: "Afternoon rain at 03:45 PM; roadbase rolled and sealed before stoppage.",
    tomorrowPlan: "Finish chainage CH 250 to CH 350, prepare for prime coat application next week.",
    remarks: "Roadbase cross-falls inspected at 2.5% camber.",
    photos: [
      {
        id: "p4",
        url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
        caption: "Crusher run compaction and level check on access road corridor",
        timestamp: "2026-10-30 11:10 AM",
        zone: "Zone 3 · Access Road",
      },
    ],
    preparedBy: "NUR DAMIA BT SHAFEE",
    verifiedBy: "",
    status: "VERIFIED",
    createdAt: "2026-10-30 16:50:00",
    updatedAt: "2026-10-30 17:10:00",
  },
  {
    id: "dsr-20261031-01",
    refNo: "SDSB-BTP-DSR-26-OCT-0025",
    date: "2026-10-31",
    shift: "Day Shift (08:00 - 17:00)",
    weatherAm: "Sunny",
    weatherPm: "Sunny",
    location: "Banting Technology Park (BTP)",
    subLocation: "Zone 1 · Block B Foundation",
    descriptionOfWorks:
      "Pile head hacking, debonding foam application, and blinding concrete casting for Pad Footings PF1-PF8.",
    plant: "Air Compressor & Breakers (4 nos), Mini Excavator 0.3m³ (1 unit), Mixer (1 unit)",
    manpower: "Site Agent (1), QAQC Lead (1), Breaker Operators (4), Concrete Workers (4), General Workers (4)",
    activities:
      "1. Cut-off levels of 32 nos precast RC spun piles surveyed and trimmed.\n2. Pile rebar projection 600mm straightened and cleaned of laitance.\n3. Lean concrete blinding 50mm Grade 15 laid.",
    materials: "Grade 15 Blinding Concrete (8 m³), Debonding foam tape (6 rolls)",
    qaqcNotes:
      "PDA pile test certificates reviewed. Pile cut-off levels within ±15mm tolerance as per specifications.",
    hsseNotes: "Hearing protection and safety goggles strictly used during pneumatic breaker operations.",
    constraints: "None. All works completed on schedule.",
    tomorrowPlan: "Lay plastic damp-proof membrane and start rebar prefabricated cages for PF1-PF8.",
    remarks: "Good housekeeping maintained around foundation trenches.",
    photos: [
      {
        id: "p5",
        url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
        caption: "Finished pile heads and blinding concrete at Block B footings",
        timestamp: "2026-10-31 03:15 PM",
        zone: "Zone 1 · Block B",
      },
    ],
    preparedBy: "NUR DAMIA BT SHAFEE",
    verifiedBy: "",
    status: "VERIFIED",
    createdAt: "2026-10-31 17:00:00",
    updatedAt: "2026-10-31 17:20:00",
  },
];

// Helper: Seed daily activity entries for the calendar
function generateSeedDailyActivities(): Record<string, StaffDailyReportItem> {
  const map: Record<string, StaffDailyReportItem> = {};

  // Attach DSR entries
  for (const dsr of SEED_DSRS) {
    map[dsr.date] = {
      id: `act-${dsr.date}`,
      reportDate: dsr.date,
      workDescription: dsr.descriptionOfWorks,
      updatedAt: dsr.updatedAt,
      dsr: {
        id: dsr.id,
        refNo: dsr.refNo,
        dateIssued: dsr.date,
        descriptionOfWorks: dsr.descriptionOfWorks,
        activities: dsr.activities,
        location: dsr.subLocation,
      },
    };
  }

  // Prepopulate typical October & November activities
  const defaultEntries: Array<{ date: string; desc: string; leave?: any }> = [
    {
      date: "2026-10-20",
      desc: "Office QAQC documentation review for BTP RFWI registers and weekly summary verification.",
    },
    {
      date: "2026-10-21",
      desc: "Site inspection at Block A Ground Slab rebar fixing and spacer block verification.",
    },
    {
      date: "2026-10-22",
      desc: "Witnessed 7-day and 28-day Concrete Cube Crushing Test at accredited laboratory (Pass rate 100%).",
    },
    {
      date: "2026-10-23",
      desc: "Attended Technical Coordination Meeting with Consultant C&S and PMC Lead.",
    },
    {
      date: "2026-10-24", // Saturday (Working Day)
      desc: "Site inspection at Block A ground beam formwork and reinforcement check. Continuous curing.",
    },
    {
      date: "2026-10-25", // Sunday (Off Day)
      desc: "Sunday / Off",
    },
    {
      date: "2026-10-26",
      desc: "Site walk with Client Representative on environmental drainage and silt trap maintenance.",
    },
    {
      date: "2026-10-27",
      desc: "Received ready-mix concrete batching tickets, verified delivery orders and Mill Certificates.",
    },
    {
      date: "2026-11-01",
      desc: "Monthly QAQC internal audit & register reconciliation. Verified 22 active register sheets.",
    },
  ];

  for (const e of defaultEntries) {
    if (!map[e.date]) {
      map[e.date] = {
        id: `act-${e.date}`,
        reportDate: e.date,
        workDescription: e.desc,
        updatedAt: "2026-10-31 18:00:00",
        leave: e.leave || null,
      };
    }
  }

  return map;
}

const STORAGE_KEY_DSRS = "sdsb_btp_dsr_records_v1";
const STORAGE_KEY_ACTIVITIES = "sdsb_btp_daily_activities_v1";

export function getDsrRecords(): DsrRecord[] {
  if (typeof window === "undefined") return SEED_DSRS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DSRS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DSRS, JSON.stringify(SEED_DSRS));
      return SEED_DSRS;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_DSRS;
    return list.map((d: DsrRecord) => ({
      ...d,
      verifiedBy: d.verifiedBy === "Ir. Ahmad Fauzi (RE)" ? "" : (d.verifiedBy || ""),
    }));
  } catch {
    return SEED_DSRS;
  }
}

export function saveDsrRecord(record: DsrRecord): DsrRecord {
  const current = getDsrRecords();
  const index = current.findIndex((d) => d.id === record.id || d.refNo === record.refNo);
  let updated: DsrRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updated = [
      {
        ...record,
        id: record.id || `dsr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...current,
    ];
  }
  try {
    localStorage.setItem(STORAGE_KEY_DSRS, JSON.stringify(updated));
    // Also sync into daily activities calendar
    saveStaffDailyReport(record.date, record.descriptionOfWorks, {
      id: record.id,
      refNo: record.refNo,
      dateIssued: record.date,
      descriptionOfWorks: record.descriptionOfWorks,
      activities: record.activities,
      location: record.subLocation,
    });
  } catch {
    /* ignore */
  }
  return record;
}

export function deleteDsrRecord(id: string): void {
  const current = getDsrRecords();
  const filtered = current.filter((d) => d.id !== id && d.refNo !== id);
  try {
    localStorage.setItem(STORAGE_KEY_DSRS, JSON.stringify(filtered));
  } catch {
    /* ignore */
  }
}

export function getStaffDailyReports(): Record<string, StaffDailyReportItem> {
  if (typeof window === "undefined") return generateSeedDailyActivities();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (!raw) {
      const seed = generateSeedDailyActivities();
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : generateSeedDailyActivities();
  } catch {
    return generateSeedDailyActivities();
  }
}

export function saveStaffDailyReport(
  dateIso: string,
  workDescription: string,
  dsrSummary?: StaffDailyReportItem["dsr"]
): StaffDailyReportItem {
  const current = getStaffDailyReports();
  const existing = current[dateIso];
  const item: StaffDailyReportItem = {
    id: existing?.id || `act-${dateIso}`,
    reportDate: dateIso,
    workDescription,
    updatedAt: new Date().toISOString(),
    leave: existing?.leave || null,
    dsr: dsrSummary || existing?.dsr || null,
  };

  const updated = {
    ...current,
    [dateIso]: item,
  };

  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(updated));
  } catch {
    /* ignore */
  }

  return item;
}

export function deleteStaffDailyReport(dateIso: string): void {
  const current = getStaffDailyReports();
  const copy = { ...current };
  delete copy[dateIso];
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(copy));
  } catch {
    /* ignore */
  }
}

export function nextDsrRefNo(): string {
  const current = getDsrRecords();
  const year = new Date().getFullYear().toString().slice(-2);
  const monthNames = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  const month = monthNames[new Date().getMonth()];
  const count = current.length + 1;
  const seq = String(count).padStart(4, "0");
  return `SDSB-BTP-DSR-${year}-${month}-${seq}`;
}

export function buildDsrWhatsAppText(dsr: DsrRecord): string {
  const parts: string[] = [
    `*SDSB · DAILY SITE REPORT (DSR)*`,
    `*Ref No:* ${dsr.refNo}`,
    `*Date:* ${dsr.date} (${dsr.shift})`,
    `*Project:* ${dsr.location}`,
    `*Location:* ${dsr.subLocation}`,
    `*Weather:* AM: ${dsr.weatherAm} | PM: ${dsr.weatherPm}`,
    ``,
    `*Description of Works:*`,
    `${dsr.descriptionOfWorks}`,
    ``,
    `*Machine / Plant:*`,
    `${dsr.plant}`,
    ``,
    `*Manpower:*`,
    `${dsr.manpower}`,
    ``,
    `*Site Activities:*`,
    `${dsr.activities}`,
    ``,
    `*QAQC Inspections & Observations:*`,
    `${dsr.qaqcNotes}`,
    ``,
    `*HSSE Notes:*`,
    `${dsr.hsseNotes}`,
    ``,
    `*Tomorrow Plan:*`,
    `${dsr.tomorrowPlan}`,
    ``,
    `_Prepared by: ${dsr.preparedBy} (SDSB Document Controller & QAQC Admin)_`,
  ];

  return parts.join("\n");
}

"use client";

import { useEffect, useState } from "react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_TITLE_CLASS,
  MODAL_SUBTITLE_CLASS,
} from "./CenteredModal";
import {
  Crown,
  ShieldCheck,
  FolderCheck,
  HardHat,
  Compass,
  Mail,
  Phone,
  Copy,
  Check,
  Edit3,
  Network,
  ListFilter,
  Plus,
  Trash2,
  Building2,
  Layers,
  Sparkles,
  Search,
  User,
} from "lucide-react";
import { getSavedStaffProfile, normalizeKey } from "@/lib/auth";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  discipline?: string;
  packageOrBlock?: string;
  level: "pm" | "manager" | "dc" | "engineer" | "support" | "supervisor";
  position: string;
  email: string;
  phone: string;
  status?: string;
  isLeader?: boolean;
};

export const INITIAL_ORG_MEMBERS: TeamMember[] = [
  // 1. Top Level - Project Manager
  {
    id: "sdsb-pm",
    name: "Ha Jin Bao",
    role: "Project Manager",
    level: "pm",
    packageOrBlock: "BTP HQ Project Lead",
    position: "Project Manager / Director",
    phone: "+6010 – 310 2505",
    email: "ha.jinbao@sdsb.com.my",
    status: "Active",
  },
  // 2. Second Level - QAQC Manager
  {
    id: "sdsb-qaqc-mgr",
    name: "Aiman",
    role: "QAQC Manager",
    level: "manager",
    packageOrBlock: "Head of QAQC Department",
    position: "QAQC Department Head",
    phone: "+6013 646 0532",
    email: "aiman.qaqc@sdsb.com.my",
    status: "Active",
  },
  // 3. Direct Right Under Aiman - QAQC DC Damia
  {
    id: "lead-damia",
    name: "Nur Damia",
    role: "QAQC DC",
    discipline: "DOCUMENT & AUDIT",
    level: "dc",
    packageOrBlock: "Direct to QAQC Manager",
    position: "Lead Document Controller & QAQC Admin",
    phone: "+60 12-345 6789",
    email: "damia@banting-datapark.com",
    status: "ETA 2/11/2026",
    isLeader: true,
  },

  // 4. Package EW/RC WALL
  {
    id: "sdsb-eng-farah-ew",
    name: "Farah Dayana",
    role: "QAQC Engineer",
    discipline: "EW & RC WALL",
    level: "engineer",
    packageOrBlock: "EW/RC WALL",
    position: "Earthwork & Retaining Wall Quality",
    phone: "011-3313 9305",
    email: "farah.dayana@sdsb.com.my",
    status: "Active",
  },

  // 5. Package BLOCK A (ARCH)
  {
    id: "sdsb-eng-faez-a",
    name: "Faez",
    role: "QAQC Engineer",
    discipline: "ARCH",
    level: "engineer",
    packageOrBlock: "BLOCK A",
    position: "Architectural Quality & Finishes",
    phone: "016-3277653",
    email: "faez.arch@sdsb.com.my",
    status: "Active",
  },
  // 6. Package BLOCK A (C&S)
  {
    id: "sdsb-eng-hafiy-a",
    name: "Hafiy",
    role: "QAQC Engineer",
    discipline: "C&S",
    level: "engineer",
    packageOrBlock: "BLOCK A",
    position: "Civil & Structural Quality",
    phone: "011-2887 8481",
    email: "hafiy.cns@sdsb.com.my",
    status: "Active",
  },

  // 7. Package BLOCK B (C&S)
  {
    id: "sdsb-eng-farah-b",
    name: "Farah Dayana",
    role: "QAQC Engineer",
    discipline: "C&S",
    level: "engineer",
    packageOrBlock: "BLOCK B",
    position: "Civil & Structural Quality",
    phone: "+011-3313 9305",
    email: "farah.dayana@sdsb.com.my",
    status: "Active",
  },
  // 8. Package BLOCK B (ARCH)
  {
    id: "sdsb-eng-amira-b",
    name: "Nur Amira",
    role: "QAQC Engineer",
    discipline: "ARCH",
    level: "engineer",
    packageOrBlock: "BLOCK B",
    position: "Architectural Quality",
    phone: "ETA 2/11/2026",
    email: "nur.amira@sdsb.com.my",
    status: "ETA 2/11/2026",
  },

  // 9. Package BLOCK F (C&S)
  {
    id: "sdsb-eng-faez-f",
    name: "Faez",
    role: "QAQC Engineer",
    discipline: "C&S",
    level: "engineer",
    packageOrBlock: "BLOCK F",
    position: "Civil & Structural Quality",
    phone: "016-3277653",
    email: "faez.cns@sdsb.com.my",
    status: "Active",
  },

  // 10. Operations Support - Zhou (Assistant QAQC Engineer under Engineers)
  {
    id: "sdsb-ass-zhou",
    name: "Zhou",
    role: "Assistant QAQC Engineer",
    discipline: "Ass QAQC Eng",
    level: "support",
    packageOrBlock: "Site & Technical Support",
    position: "Assistant QAQC Engineer",
    phone: "6014-396 7582",
    email: "zhou.qaqc@sdsb.com.my",
    status: "Active",
  },

  // 11. QAQC Supervisor - Still Hiring (General)
  {
    id: "sdsb-sup-hiring-1",
    name: "Still Hiring",
    role: "QAQC Supervisor",
    discipline: "General / Site",
    level: "supervisor",
    packageOrBlock: "Site Inspection",
    position: "Field Surveillance",
    phone: "TBC",
    email: "",
    status: "Still Hiring (TBC)",
  },
  // 12. QAQC Supervisor - Cai Meng
  {
    id: "sdsb-sup-caimeng",
    name: "Cai Meng",
    role: "QAQC Supervisor",
    discipline: "Site Testing",
    level: "supervisor",
    packageOrBlock: "Substructure & Roadbase",
    position: "Field Testing & Inspection",
    phone: "011-2629 3156",
    email: "caimeng@sdsb.com.my",
    status: "Active",
  },
  // 13. QAQC Supervisor - Ikhwan (C&S)
  {
    id: "sdsb-sup-ikhwan",
    name: "Ikhwan",
    role: "QAQC Supervisor",
    discipline: "C&S",
    level: "supervisor",
    packageOrBlock: "C&S Works",
    position: "Concreting & Rebar Surveillance",
    phone: "013-2548526",
    email: "ikhwan.cns@sdsb.com.my",
    status: "Active",
  },
  // 14. QAQC Supervisor - Still Hiring (ARC)
  {
    id: "sdsb-sup-hiring-2",
    name: "Still Hiring",
    role: "QAQC Supervisor",
    discipline: "ARC",
    level: "supervisor",
    packageOrBlock: "Architectural",
    position: "Finishing & Architectural Surveillance",
    phone: "TBC",
    email: "",
    status: "ARC Still Hiring (TBC)",
  },
];

const STORAGE_KEY = "sdsb_btp_org_chart_members_v5";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function TeamModal({ open, onClose }: Props) {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_ORG_MEMBERS);
  const [viewMode, setViewMode] = useState<"chart" | "list">("chart");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Staff Details Modal state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // Add new staff form state
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("QAQC Engineer");
  const [newDiscipline, setNewDiscipline] = useState("C&S");
  const [newPackage, setNewPackage] = useState("BLOCK A");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Toast notification
  const [toastMsg, setToastMsg] = useState("");

  function applyProfileOverrides(list: TeamMember[]): TeamMember[] {
    return list.map((m) => {
      const key = normalizeKey(m.id.replace("sdsb-", "").replace("lead-", "") || m.name);
      const saved = getSavedStaffProfile(key);
      if (saved && typeof saved.name === "string" && saved.name.trim()) {
        return {
          ...m,
          name: saved.name.trim(),
          role: (typeof saved.role === "string" && saved.role.trim()) || m.role,
          email: (typeof saved.email === "string" && saved.email.trim()) || m.email,
          phone: (typeof saved.phone === "string" && saved.phone.trim()) || m.phone,
        };
      }
      return m;
    });
  }

  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          setMembers(applyProfileOverrides(parsed));
          return;
        }
      }
    } catch {
      /* ignore */
    }
    const initialWithOverrides = applyProfileOverrides(INITIAL_ORG_MEMBERS);
    setMembers(initialWithOverrides);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialWithOverrides));
    } catch {
      /* ignore */
    }
  }, [open]);

  function saveMembers(list: TeamMember[]) {
    setMembers(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }

  function handleSelectStaff(member: TeamMember) {
    setEditingMember(member);
    setEditName(member.name || "");
    setEditRole(member.role || "");
    setEditEmail(member.email || "");
    setEditPhone(member.phone || "");
    setEditStatus(member.status || "Active");
  }

  function handleSaveStaffDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember) return;

    const finalName = editName.trim() || editingMember.name;
    const finalRole = editRole.trim() || editingMember.role;

    const updated = members.map((m) =>
      m.id === editingMember.id
        ? {
            ...m,
            name: finalName,
            role: finalRole,
            email: editEmail.trim(),
            phone: editPhone.trim() || m.phone,
            status: editStatus.trim() || m.status,
          }
        : m
    );

    saveMembers(updated);

    // Sync to user profile storage
    const key = normalizeKey(editingMember.id.replace("sdsb-", "").replace("lead-", "") || editingMember.name);
    try {
      const profStored = localStorage.getItem(`btp_user_profile_${key}`);
      const prof = profStored ? JSON.parse(profStored) : {};
      prof.name = finalName;
      prof.email = editEmail.trim() || prof.email;
      prof.phone = editPhone.trim() || prof.phone;
      localStorage.setItem(`btp_user_profile_${key}`, JSON.stringify(prof));
      if (key === "damia") {
        localStorage.setItem("damia_user_profile", JSON.stringify(prof));
      }

      // Also sync btp_qaqc_user if this member is currently logged in
      const currentUserStored = localStorage.getItem("btp_qaqc_user");
      if (currentUserStored) {
        const cur = JSON.parse(currentUserStored);
        const curKey = normalizeKey(cur.email || cur.name || "");
        if (curKey === key) {
          cur.name = finalName;
          cur.email = editEmail.trim() || cur.email;
          localStorage.setItem("btp_qaqc_user", JSON.stringify(cur));
        }
      }
    } catch {
      /* ignore */
    }

    setToastMsg(`Details for ${finalName} updated successfully!`);
    setTimeout(() => setToastMsg(""), 3000);
    setEditingMember(null);
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStaff: TeamMember = {
      id: `staff-${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      discipline: newDiscipline,
      packageOrBlock: newPackage,
      level: "engineer",
      position: `${newRole} (${newDiscipline})`,
      phone: newPhone.trim() || "—",
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, ".")}@sdsb.com.my`,
      status: "Active",
    };

    saveMembers([...members, newStaff]);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setAddingNew(false);
    setToastMsg(`New staff member ${newStaff.name} added successfully!`);
    setTimeout(() => setToastMsg(""), 3000);
  }

  function handleRemoveMember(id: string) {
    if (id === "lead-damia" || id === "sdsb-pm" || id === "sdsb-qaqc-mgr") return;
    saveMembers(members.filter((m) => m.id !== id));
  }

  function handleCopyAllEmails() {
    const emails = members
      .map((m) => m.email)
      .filter((em) => em && em.includes("@") && !em.includes("TBC"))
      .join(", ");

    if (emails) {
      navigator.clipboard.writeText(emails);
      setToastMsg("All staff emails copied to clipboard!");
      setTimeout(() => setToastMsg(""), 3000);
    }
  }

  // Find individual members for tree layout
  const pm = members.find((m) => m.id === "sdsb-pm") || members[0];
  const qaqcMgr = members.find((m) => m.id === "sdsb-qaqc-mgr") || members[1];
  const damia = members.find((m) => m.id === "lead-damia") || members[2];
  const farahEw = members.find((m) => m.id === "sdsb-eng-farah-ew") || members[3];
  const faezA = members.find((m) => m.id === "sdsb-eng-faez-a") || members[4];
  const hafiyA = members.find((m) => m.id === "sdsb-eng-hafiy-a") || members[5];
  const farahB = members.find((m) => m.id === "sdsb-eng-farah-b") || members[6];
  const amiraB = members.find((m) => m.id === "sdsb-eng-amira-b") || members[7];
  const faezF = members.find((m) => m.id === "sdsb-eng-faez-f") || members[8];
  const zhou = members.find((m) => m.id === "sdsb-ass-zhou") || members[9];
  const sup1 = members.find((m) => m.id === "sdsb-sup-hiring-1") || members[10];
  const caiMeng = members.find((m) => m.id === "sdsb-sup-caimeng") || members[11];
  const ikhwan = members.find((m) => m.id === "sdsb-sup-ikhwan") || members[12];
  const sup2 = members.find((m) => m.id === "sdsb-sup-hiring-2") || members[13];

  const filteredMembers = searchQuery.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.discipline || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.packageOrBlock || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members;

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="team-modal-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />

      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-paper/60 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-accent to-teal-500 text-white font-bold shadow-xs">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="team-modal-title" className="text-sm font-extrabold text-ink">
                SDSB QA/QC Organisation Chart
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[10.5px] text-muted">
              Banting Technology Park · Site Quality Management Structure & Staff Directory
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-paper/80 border border-line rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold transition cursor-pointer ${
                viewMode === "chart"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-field"
              }`}
            >
              <Network className="h-3 w-3" />
              <span>Org Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted hover:text-ink hover:bg-field"
              }`}
            >
              <ListFilter className="h-3 w-3" />
              <span>Directory ({members.length})</span>
            </button>
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
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-bold text-white shadow-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="h-3 w-3" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Modal Body (Fitted View Without Scrolling) */}
      <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-y-hidden overflow-x-auto bg-slate-100/90 dark:bg-slate-900 p-2 sm:p-2.5 select-none flex flex-col justify-center items-center">
        {viewMode === "chart" ? (
          /* ================= SLEEK & FITTED ORG CHART WITH CLEAN ORTHOGONAL BUSES ================= */
          <div className="min-w-[800px] max-w-[820px] mx-auto flex flex-col items-center justify-center my-auto">
            {/* Chart Banner */}
            <div className="flex items-center justify-center gap-2 mb-1 shrink-0">
              <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[9.5px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                SDSB QA/QC Hierarchy
              </span>
            </div>

            {/* TIER 1: Project Manager (Ha Jin Bao) */}
            <div className="flex flex-col items-center shrink-0">
              <ModernOrgCard
                member={pm}
                theme="executive"
                icon={<Crown className="h-3.5 w-3.5 text-amber-500" />}
                onSelect={() => handleSelectStaff(pm)}
              />
            </div>

            {/* Line down from PM to Aiman */}
            <svg width="800" height="20" viewBox="0 0 800 20" className="w-[800px] h-5 block text-slate-400 dark:text-slate-500 shrink-0">
              <line x1="400" y1="0" x2="400" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>

            {/* TIER 2: QAQC Manager (Aiman) on Center & Damia (QAQC DC) Stepped Down to Right */}
            <div className="relative flex items-start justify-center w-full max-w-[800px] shrink-0">
              {/* Left spacer to balance Damia and keep Aiman centered at x=400 */}
              <div className="w-[220px] hidden md:block pointer-events-none" />

              {/* Center: Aiman Card */}
              <div className="flex flex-col items-center shrink-0">
                <ModernOrgCard
                  member={qaqcMgr}
                  theme="manager"
                  icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}
                  badgeText="QAQC Head"
                  onSelect={() => handleSelectStaff(qaqcMgr)}
                />
              </div>

              {/* Right: Damia Card (Visibly Stepped Down & to the Right, Bukan Sebaris!) */}
              <div className="flex items-start ml-4 mt-7 shrink-0">
                {/* Clean stepped orthogonal connector */}
                <svg width="34" height="34" viewBox="0 0 34 34" className="shrink-0 text-teal-600 dark:text-teal-400 mt-2">
                  <path
                    d="M 0 6 H 16 V 28 H 34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="flex flex-col items-start pl-1">
                  <span className="text-[7.5px] font-black uppercase tracking-tight text-teal-700 dark:text-teal-300 bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.2 rounded-full mb-1 flex items-center gap-1 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                    Direct Report · QAQC DC
                  </span>
                  <ModernOrgCard
                    member={damia}
                    theme="dc"
                    icon={<FolderCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />}
                    badgeText="Lead DC"
                    onSelect={() => handleSelectStaff(damia)}
                  />
                </div>
              </div>
            </div>

            {/* Clean Orthogonal Distribution Bus from Aiman (400) to 4 Packages (100, 300, 500, 700) */}
            <svg width="800" height="22" viewBox="0 0 800 22" className="w-[800px] h-5.5 block text-slate-400 dark:text-slate-500 shrink-0">
              <line x1="400" y1="0" x2="400" y2="11" stroke="currentColor" strokeWidth="2" />
              <line x1="100" y1="11" x2="700" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="100" y1="11" x2="100" y2="22" stroke="currentColor" strokeWidth="2" />
              <line x1="300" y1="11" x2="300" y2="22" stroke="currentColor" strokeWidth="2" />
              <line x1="500" y1="11" x2="500" y2="22" stroke="currentColor" strokeWidth="2" />
              <line x1="700" y1="11" x2="700" y2="22" stroke="currentColor" strokeWidth="2" />
            </svg>

            {/* TIER 3: 4 SITE PACKAGES (Zero Overflow, Zero Bertindih) */}
            <div className="grid grid-cols-4 gap-3 w-full max-w-[800px] items-stretch shrink-0">
              {/* 1. EW / RC WALL */}
              <div className="flex justify-center">
                <PackageCard
                  packageTitle="EW / RC WALL"
                  color="purple"
                  engineers={[farahEw]}
                  onSelectStaff={handleSelectStaff}
                />
              </div>

              {/* 2. BLOCK A */}
              <div className="flex justify-center">
                <PackageCard
                  packageTitle="BLOCK A"
                  color="sky"
                  engineers={[faezA, hafiyA]}
                  onSelectStaff={handleSelectStaff}
                />
              </div>

              {/* 3. BLOCK B */}
              <div className="flex justify-center">
                <PackageCard
                  packageTitle="BLOCK B"
                  color="indigo"
                  engineers={[farahB, amiraB]}
                  onSelectStaff={handleSelectStaff}
                />
              </div>

              {/* 4. BLOCK F */}
              <div className="flex justify-center">
                <PackageCard
                  packageTitle="BLOCK F"
                  color="amber"
                  engineers={[faezF]}
                  onSelectStaff={handleSelectStaff}
                />
              </div>
            </div>

            {/* Clean Orthogonal Collection Bus from 4 Packages (100, 300, 500, 700) down to Zhou (400) */}
            <svg width="800" height="22" viewBox="0 0 800 22" className="w-[800px] h-5.5 block text-slate-400 dark:text-slate-500 shrink-0">
              <line x1="100" y1="0" x2="100" y2="11" stroke="currentColor" strokeWidth="2" />
              <line x1="300" y1="0" x2="300" y2="11" stroke="currentColor" strokeWidth="2" />
              <line x1="500" y1="0" x2="500" y2="11" stroke="currentColor" strokeWidth="2" />
              <line x1="700" y1="0" x2="700" y2="11" stroke="currentColor" strokeWidth="2" />
              <line x1="100" y1="11" x2="700" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="400" y1="11" x2="400" y2="22" stroke="currentColor" strokeWidth="2" />
            </svg>

            {/* TIER 4: ZHOU (Assistant QAQC Engineer below Engineers as requested) */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[7.5px] font-black uppercase tracking-wider text-muted bg-paper/80 border border-line px-1.5 py-0.2 rounded">
                  Ass QAQC Eng · Technical Site Support
                </span>
              </div>
              <ModernOrgCard
                member={zhou}
                theme="support"
                icon={<Compass className="h-3.5 w-3.5 text-sky-500" />}
                badgeText="Assistant Engineer"
                onSelect={() => handleSelectStaff(zhou)}
              />
            </div>

            {/* Clean Orthogonal Distribution Bus from Zhou (400) to 4 Site Supervisors (100, 300, 500, 700) */}
            <svg width="800" height="22" viewBox="0 0 800 22" className="w-[800px] h-5.5 block text-slate-400 dark:text-slate-500 shrink-0">
              <line x1="400" y1="0" x2="400" y2="11" stroke="currentColor" strokeWidth="2" />
              <line x1="100" y1="11" x2="700" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="100" y1="11" x2="100" y2="22" stroke="currentColor" strokeWidth="2" />
              <line x1="300" y1="11" x2="300" y2="22" stroke="currentColor" strokeWidth="2" />
              <line x1="500" y1="11" x2="500" y2="22" stroke="currentColor" strokeWidth="2" />
              <line x1="700" y1="11" x2="700" y2="22" stroke="currentColor" strokeWidth="2" />
            </svg>

            {/* TIER 5: SITE SUPERVISORS */}
            <div className="grid grid-cols-4 gap-3 w-full max-w-[800px] pt-0 shrink-0">
              {/* Supervisor 1: General */}
              <div className="flex justify-center">
                <ModernOrgCard
                  member={sup1}
                  theme="supervisor"
                  icon={<HardHat className="h-3 w-3 text-slate-400" />}
                  onSelect={() => handleSelectStaff(sup1)}
                  fullWidth
                />
              </div>

              {/* Supervisor 2: Cai Meng */}
              <div className="flex justify-center">
                <ModernOrgCard
                  member={caiMeng}
                  theme="supervisor"
                  icon={<HardHat className="h-3 w-3 text-emerald-500" />}
                  onSelect={() => handleSelectStaff(caiMeng)}
                  fullWidth
                />
              </div>

              {/* Supervisor 3: Ikhwan */}
              <div className="flex justify-center">
                <ModernOrgCard
                  member={ikhwan}
                  theme="supervisor"
                  icon={<HardHat className="h-3 w-3 text-blue-500" />}
                  onSelect={() => handleSelectStaff(ikhwan)}
                  fullWidth
                />
              </div>

              {/* Supervisor 4: ARC Still Hiring */}
              <div className="flex justify-center">
                <ModernOrgCard
                  member={sup2}
                  theme="supervisor"
                  icon={<HardHat className="h-3 w-3 text-slate-400" />}
                  onSelect={() => handleSelectStaff(sup2)}
                  fullWidth
                />
              </div>
            </div>
          </div>
        ) : (
          /* ================= DIRECTORY LIST VIEW ================= */
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-2">
              <div>
                <h4 className="text-sm font-extrabold text-ink">SDSB Project Team Directory</h4>
                <p className="text-xs text-muted">Manage staff contacts, corporate emails, and package assignments</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3 w-3 text-muted" />
                  <input
                    type="text"
                    placeholder="Search name, role, package..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-lg border border-line bg-paper pl-7 pr-3 py-1 text-xs text-ink outline-none focus:border-accent w-44"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setAddingNew(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:brightness-110 cursor-pointer transition"
                >
                  <Plus className="h-3 w-3" />
                  <span>+ Add Staff</span>
                </button>
              </div>
            </div>

            {/* Add Staff Inline Form */}
            {addingNew && (
              <form
                onSubmit={handleAddMember}
                className="rounded-xl border border-accent/40 bg-paper p-3 space-y-2.5 text-xs animate-in fade-in"
              >
                <div className="font-bold text-ink flex items-center justify-between">
                  <span>Register New Team Member</span>
                  <button
                    type="button"
                    onClick={() => setAddingNew(false)}
                    className="text-muted hover:text-ink text-[11px]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="block">
                    <span className="text-[10px] font-bold text-muted uppercase">Full Name *</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mohd Daniel"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full rounded border border-line bg-field px-2.5 py-1 text-xs text-ink mt-0.5"
                      autoFocus
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-bold text-muted uppercase">Role / Position</span>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full rounded border border-line bg-field px-2 py-1 text-xs text-ink mt-0.5"
                    >
                      <option value="QAQC Engineer">QAQC Engineer</option>
                      <option value="QAQC Supervisor">QAQC Supervisor</option>
                      <option value="QAQC Manager">QAQC Manager</option>
                      <option value="QAQC DC">QAQC DC / Admin</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-bold text-muted uppercase">Discipline</span>
                    <select
                      value={newDiscipline}
                      onChange={(e) => setNewDiscipline(e.target.value)}
                      className="w-full rounded border border-line bg-field px-2 py-1 text-xs text-ink mt-0.5"
                    >
                      <option value="C&S">Civil & Structural (C&S)</option>
                      <option value="ARCH">Architectural (ARCH)</option>
                      <option value="MEP">MEP Infrastructure</option>
                      <option value="DOCUMENT">Documentation & ISO</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-bold text-muted uppercase">Package / Block</span>
                    <input
                      type="text"
                      placeholder="e.g. BLOCK A, BLOCK B"
                      value={newPackage}
                      onChange={(e) => setNewPackage(e.target.value)}
                      className="w-full rounded border border-line bg-field px-2.5 py-1 text-xs text-ink mt-0.5"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-bold text-muted uppercase">Phone Number</span>
                    <input
                      type="text"
                      placeholder="+60 12-..."
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full rounded border border-line bg-field px-2.5 py-1 text-xs text-ink mt-0.5"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-bold text-muted uppercase">Official Email</span>
                    <input
                      type="email"
                      placeholder="name@sdsb.com.my"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full rounded border border-line bg-field px-2.5 py-1 text-xs text-ink mt-0.5"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAddingNew(false)}
                    className="rounded border border-line bg-field px-3 py-1 text-xs font-semibold text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-accent px-3 py-1 text-xs font-semibold text-white shadow"
                  >
                    Save Staff
                  </button>
                </div>
              </form>
            )}

            {/* Members Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredMembers.map((m) => {
                const hasEmail = Boolean(m.email && m.email.includes("@"));
                const initials = m.name
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectStaff(m)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2.5 shadow-2xs group ${
                      m.id === "lead-damia"
                        ? "border-teal-500/40 bg-teal-500/5 hover:border-teal-500 hover:bg-teal-500/10"
                        : "border-line bg-paper/60 hover:bg-paper hover:border-accent/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Monogram Badge */}
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-xs ${
                          m.id === "lead-damia"
                            ? "bg-teal-600 text-white"
                            : m.level === "pm"
                            ? "bg-amber-500 text-white"
                            : m.level === "manager"
                            ? "bg-emerald-600 text-white"
                            : "bg-paper-elevated text-ink border border-line"
                        }`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs font-bold text-ink truncate group-hover:text-accent transition">
                            {m.name}
                          </strong>
                          {m.isLeader && (
                            <span className="rounded-full bg-teal-500/15 border border-teal-500/25 px-1.5 py-0.2 text-[8.5px] font-bold text-teal-700 dark:text-teal-300">
                              Direct DC
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-muted truncate">
                          {m.role} {m.discipline ? `· ${m.discipline}` : ""}{" "}
                          {m.packageOrBlock ? `(${m.packageOrBlock})` : ""}
                        </p>
                        <div className="flex items-center gap-2.5 text-[9.5px] text-muted mt-0.5">
                          {hasEmail ? (
                            <span className="text-accent font-semibold flex items-center gap-1 truncate">
                              <Mail className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate">{m.email}</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.2 rounded">
                              + Add Email
                            </span>
                          )}
                          {m.phone && m.phone !== "TBC" && (
                            <span className="flex items-center gap-1 shrink-0">
                              <Phone className="h-2.5 w-2.5" />
                              {m.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStaff(m);
                        }}
                        className="p-1 rounded-lg text-muted hover:text-accent hover:bg-field transition"
                        title="Edit email / details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      {!m.isLeader && m.id !== "sdsb-pm" && m.id !== "sdsb-qaqc-mgr" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(m.id);
                          }}
                          className="p-1 rounded-lg text-muted hover:text-red-500 hover:bg-field transition"
                          title="Remove staff"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= EDIT / ADD EMAIL DIALOG ================= */}
      {editingMember && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-line bg-paper-elevated p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white font-extrabold text-sm shadow-sm shrink-0">
                  {(editName.trim() || editingMember.name)
                    .split(" ")
                    .filter(Boolean)
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink">
                    {editName.trim() || editingMember.name}
                  </h3>
                  <p className="text-xs text-muted">
                    {editingMember.role} {editingMember.discipline ? `(${editingMember.discipline})` : ""}{" "}
                    {editingMember.packageOrBlock ? `· ${editingMember.packageOrBlock}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-muted hover:text-ink text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaffDetails} className="space-y-3">
              {/* Staff Name / Display Name */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Staff Name / Display Name <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Damia (NUR DAMIA BT SHAFEE)"
                    className="w-full rounded-lg border border-line bg-field pl-8 pr-3 py-1.5 text-xs font-semibold text-ink outline-none focus:border-accent"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-muted mt-0.5">
                  Directly editable name shown on the Org Chart and Staff Directory
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Official Corporate Email <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="e.g. name@sdsb.com.my"
                    className="w-full rounded-lg border border-line bg-field pl-8 pr-3 py-1.5 text-xs font-semibold text-ink outline-none focus:border-accent"
                  />
                </div>

                {/* Quick 1-click email suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-muted font-medium">Quick suggestions:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const clean = (editName || editingMember.name).split(" ")[0].toLowerCase();
                      setEditEmail(`${clean}@sdsb.com.my`);
                    }}
                    className="text-[10px] font-mono rounded bg-field border border-line px-1.5 py-0.5 text-accent hover:border-accent cursor-pointer transition"
                  >
                    @{(editName || editingMember.name).split(" ")[0].toLowerCase()}@sdsb.com.my
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const clean = (editName || editingMember.name).split(" ")[0].toLowerCase();
                      setEditEmail(`${clean}@banting-datapark.com`);
                    }}
                    className="text-[10px] font-mono rounded bg-field border border-line px-1.5 py-0.5 text-accent hover:border-accent cursor-pointer transition"
                  >
                    @banting-datapark.com
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Contact / Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+60 12-..."
                    className="w-full rounded-lg border border-line bg-field pl-8 pr-3 py-1.5 text-xs text-ink outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Assignment Status
                </label>
                <input
                  type="text"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  placeholder="Active / ETA 2/11/2026 / Still Hiring"
                  className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="rounded-lg border border-line px-3 py-1 text-xs font-semibold text-ink hover:bg-field cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-3.5 py-1 text-xs font-semibold text-white shadow-sm hover:brightness-110 cursor-pointer transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CenteredModal>
  );
}

/* ================= COMPACT & MODERN ORG CARD SUB-COMPONENTS ================= */

function ModernPackagePill({
  title,
  color,
}: {
  title: string;
  color: "purple" | "sky" | "indigo" | "amber";
}) {
  const colorMap = {
    purple: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
    indigo: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  };

  return (
    <div
      className={`w-full max-w-[150px] rounded-md border px-2 py-0.5 text-center font-black text-[9.5px] uppercase tracking-wider shadow-2xs ${colorMap[color]}`}
    >
      {title}
    </div>
  );
}

function PackageCard({
  packageTitle,
  color,
  engineers,
  onSelectStaff,
}: {
  packageTitle: string;
  color: "purple" | "sky" | "indigo" | "amber";
  engineers: TeamMember[];
  onSelectStaff: (m: TeamMember) => void;
}) {
  const borderMap = {
    purple: "border-purple-300 dark:border-purple-700/70",
    sky: "border-sky-300 dark:border-sky-700/70",
    indigo: "border-indigo-300 dark:border-indigo-700/70",
    amber: "border-amber-300 dark:border-amber-700/70",
  };

  const titleBadgeMap = {
    purple: "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border-purple-200 dark:border-purple-800",
    sky: "bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-200 border-sky-200 dark:border-sky-800",
    indigo: "bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800",
    amber: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  };

  return (
    <div
      className={`w-full max-w-[185px] rounded-xl border bg-white dark:bg-slate-800 shadow-xs transition hover:shadow-md p-2 flex flex-col ${borderMap[color]}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-line/60 pb-1.5 mb-1.5 px-0.5">
        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${titleBadgeMap[color]}`}>
          {packageTitle}
        </span>
        <span
          className="text-[8px] font-bold px-1.5 py-0.2 rounded border bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-line"
        >
          {engineers.length > 1 ? `${engineers.length} Engineers` : "QAQC Eng"}
        </span>
      </div>

      {/* Engineer rows */}
      <div className="space-y-1.5">
        {engineers.map((eng, idx) => {
          const hasEmail = Boolean(eng.email && eng.email.includes("@"));
          return (
            <div
              key={eng.id}
              onClick={() => onSelectStaff(eng)}
              className="group rounded-lg p-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer select-none text-ink border border-transparent hover:border-line/60"
              title={`Click to edit email for ${eng.name}`}
            >
              {idx > 0 && <div className="border-t border-line/50 mb-1.5" />}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 min-w-0">
                  <HardHat className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-accent transition">
                    {eng.name}
                  </span>
                </div>
                {eng.discipline && (
                  <span className="rounded bg-slate-100 dark:bg-slate-700/70 px-1 py-0.2 text-[7.5px] font-bold text-slate-600 dark:text-slate-300 border border-line shrink-0">
                    {eng.discipline}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 mt-1 text-[9px]">
                <span className="text-slate-500 dark:text-slate-400 font-mono truncate">{eng.phone}</span>
                {hasEmail ? (
                  <span className="text-teal-700 dark:text-teal-300 font-mono truncate max-w-[90px] flex items-center gap-0.5 font-semibold">
                    <Mail className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{eng.email.split("@")[0]}</span>
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-[8px] flex items-center gap-0.5">
                    <Plus className="h-2.5 w-2.5" />
                    <span>Email</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModernOrgCard({
  member,
  theme,
  icon,
  badgeText,
  compact,
  fullWidth,
  onSelect,
}: {
  member: TeamMember;
  theme: "executive" | "manager" | "dc" | "engineer" | "support" | "supervisor";
  icon: React.ReactNode;
  badgeText?: string;
  compact?: boolean;
  fullWidth?: boolean;
  onSelect: () => void;
}) {
  const hasEmail = Boolean(member.email && member.email.includes("@"));

  const themeStyles = {
    executive:
      "border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-800 shadow-xs hover:border-amber-500 hover:shadow-md",
    manager:
      "border-emerald-500 dark:border-emerald-400 bg-white dark:bg-slate-800 shadow-xs hover:border-emerald-400 hover:shadow-md",
    dc:
      "border-teal-500 dark:border-teal-400 bg-white dark:bg-slate-800 ring-2 ring-teal-500/20 shadow-xs hover:border-teal-400 hover:shadow-md",
    engineer:
      "border-line bg-white dark:bg-slate-800 shadow-xs hover:border-accent hover:shadow-md",
    support:
      "border-sky-400 dark:border-sky-500 bg-white dark:bg-slate-800 shadow-xs hover:border-sky-300 hover:shadow-md",
    supervisor:
      "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs hover:border-accent hover:shadow-md",
  };

  const widthClass = fullWidth
    ? "w-full max-w-[185px]"
    : compact
    ? "w-[150px]"
    : "w-[175px]";

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl border p-2 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer select-none text-ink ${widthClass} ${themeStyles[theme]}`}
      title={`Click to edit contact for ${member.name}`}
    >
      {/* Top Header Row with Icon & Badge */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-slate-100 dark:bg-slate-700 border border-line shrink-0">
            {icon}
          </span>
          <span className="text-[8.5px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300 truncate">
            {member.role}
          </span>
        </div>

        {badgeText ? (
          <span className="rounded bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.2 text-[8px] font-bold text-teal-700 dark:text-teal-300 shrink-0">
            {badgeText}
          </span>
        ) : member.discipline ? (
          <span className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 text-[8px] font-bold text-slate-600 dark:text-slate-300 border border-line shrink-0">
            {member.discipline}
          </span>
        ) : null}
      </div>

      {/* Name and Phone */}
      <div className="mb-1.5 leading-tight">
        <h4 className="text-[11px] font-black tracking-tight text-slate-900 dark:text-slate-100 truncate group-hover:text-accent transition">
          {member.name}
        </h4>
        <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
          <Phone className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{member.phone}</span>
        </div>
      </div>

      {/* Email Action Pill */}
      <div className="pt-1.5 border-t border-line/60">
        {hasEmail ? (
          <div
            className="flex items-center justify-between rounded bg-slate-50 dark:bg-slate-900 border border-line px-1.5 py-0.5 text-[9px] font-semibold transition"
            title={member.email}
          >
            <span className="flex items-center gap-1 text-teal-700 dark:text-teal-300 truncate">
              <Mail className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate font-mono">{member.email.split("@")[0]}</span>
            </span>
            <Edit3 className="h-2.5 w-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0 ml-0.5" />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-0.5 rounded border border-dashed border-amber-500/50 bg-amber-500/10 px-1 py-0.5 text-[8.5px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition">
            <Plus className="h-2.5 w-2.5" />
            <span>+ Email</span>
          </div>
        )}
      </div>
    </div>
  );
}

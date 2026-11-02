"use client";

import { useEffect, useState } from "react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MEDIUM_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_BODY_CLASS,
  MODAL_BTN_CANCEL_CLASS,
  MODAL_BTN_PRIMARY_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_SUBTITLE_CLASS,
  MODAL_TITLE_CLASS,
} from "./CenteredModal";
import {
  ShieldCheck,
  UserCheck,
  Mail,
  Phone,
  Building,
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Stamp,
  PenTool,
  Save,
  Check,
  User,
  CreditCard,
  FileCheck2,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";
import { changeUserPassword, DEFAULT_PASSWORD, getUserPassword, normalizeKey, STAFF_REGISTRY } from "@/lib/auth";
import { StaffDailyReportModal } from "./StaffDailyReportModal";
import { DarSiteFormModal } from "./DarSiteFormModal";
import { CompileSiteReportModal } from "./CompileSiteReportModal";
import { DsrReportPrintViewerModal } from "./DsrReportPrintViewerModal";
import {
  DsrRecord,
  getDsrRecords,
  getStaffDailyReports,
} from "@/lib/daily-reports";

export type UserProfile = {
  name: string;
  role: string;
  position: string;
  email: string;
  phone: string;
  company: string;
  icNumber: string;
  cidbExp: string;
  isAdmin: boolean;
  signatureActive?: boolean;
  chopActive?: boolean;
};

export const DEFAULT_PROFILE: UserProfile = {
  name: "Nur Damia",
  role: "QAQC DC",
  position: "QAQC DC",
  email: "damia.sdsbbtp@gmail.com",
  phone: "+60 12-345 6789",
  company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
  icNumber: "960814-10-5432",
  cidbExp: "14 Oct 2027 (Valid)",
  isAdmin: true,
  signatureActive: true,
  chopActive: true,
};

type Props = {
  open: boolean;
  onClose: () => void;
  currentUser?: { name: string; email: string; role?: string };
  onSave?: (profile: UserProfile) => void;
};

export function ProfileModal({ open, onClose, currentUser, onSave }: Props) {
  const userKey = normalizeKey(currentUser?.name || currentUser?.email || "damia");
  const staffData = STAFF_REGISTRY[userKey] || STAFF_REGISTRY.damia;

  const [profile, setProfile] = useState<UserProfile>(() => {
    return {
      ...DEFAULT_PROFILE,
      name: currentUser?.name || staffData.name,
      email: currentUser?.email || staffData.email,
      role: currentUser?.role || staffData.role,
      position: staffData.position || DEFAULT_PROFILE.position,
      phone: staffData.phone || DEFAULT_PROFILE.phone,
      company: staffData.company || DEFAULT_PROFILE.company,
      icNumber: staffData.icNumber || DEFAULT_PROFILE.icNumber,
      cidbExp: staffData.cidbExp || DEFAULT_PROFILE.cidbExp,
    };
  });

  // Profile Form Fields
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [position, setPosition] = useState(profile.position);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [company, setCompany] = useState(profile.company);
  const [icNumber, setIcNumber] = useState(profile.icNumber);
  const [cidbExp, setCidbExp] = useState(profile.cidbExp);
  const [profileSavedMsg, setProfileSavedMsg] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Signatures & Chop toggles
  const [signatureActive, setSignatureActive] = useState(true);
  const [chopActive, setChopActive] = useState(true);

  // Change Password State
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  // DSR & Daily Report Sub-modals
  const [dsrCalendarOpen, setDsrCalendarOpen] = useState(false);
  const [dsrFormOpen, setDsrFormOpen] = useState(false);
  const [editingDsrId, setEditingDsrId] = useState<string | null>(null);
  const [initialDsrDate, setInitialDsrDate] = useState<string | undefined>(undefined);
  const [compileModalOpen, setCompileModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<"dsr" | "monthly-personal" | "compiled-report">("dsr");
  const [printDsrRecord, setPrintDsrRecord] = useState<DsrRecord | null>(null);
  const [compiledReportData, setCompiledReportData] = useState<any | null>(null);
  const [monthlyPrintData, setMonthlyPrintData] = useState<any | null>(null);

  // Live Metrics
  const [dsrCount, setDsrCount] = useState(4);
  const [loggedDaysCount, setLoggedDaysCount] = useState(9);

  useEffect(() => {
    if (open) {
      const dsrs = getDsrRecords();
      setDsrCount(dsrs.length);
      const acts = getStaffDailyReports();
      const count = Object.values(acts).filter((a) => a.workDescription?.trim()).length;
      setLoggedDaysCount(count);
    }
  }, [open, dsrCalendarOpen, dsrFormOpen]);

  useEffect(() => {
    const key = normalizeKey(currentUser?.name || currentUser?.email || "damia");
    const staff = STAFF_REGISTRY[key] || STAFF_REGISTRY.damia;

    try {
      const stored =
        localStorage.getItem(`btp_user_profile_${key}`) ||
        (key === "damia" ? localStorage.getItem("damia_user_profile") : null);

      if (stored) {
        const parsed = JSON.parse(stored);
        let correctedCompany = parsed.company || staff.company || DEFAULT_PROFILE.company;
        if (correctedCompany.includes("SHENDING")) {
          correctedCompany = correctedCompany.replace("SHENDING", "SHENGDING");
        }
        const effectiveName =
          (parsed.name && typeof parsed.name === "string" && parsed.name.trim()) ||
          (currentUser?.name && typeof currentUser.name === "string" && currentUser.name.trim()) ||
          staff.name;

        const loaded: UserProfile = {
          ...DEFAULT_PROFILE,
          ...staff,
          ...parsed,
          name: effectiveName,
          company: correctedCompany,
          role: parsed.role || currentUser?.role || staff.role,
          email: parsed.email || currentUser?.email || staff.email,
          position: parsed.position || staff.position || staff.role,
          phone: parsed.phone || staff.phone,
          icNumber: parsed.icNumber || staff.icNumber || DEFAULT_PROFILE.icNumber,
          cidbExp: parsed.cidbExp || staff.cidbExp || DEFAULT_PROFILE.cidbExp,
        };

        setProfile(loaded);
        setName(loaded.name);
        setRole(loaded.role);
        setPosition(loaded.position);
        setEmail(loaded.email);
        setPhone(loaded.phone);
        setCompany(loaded.company);
        setIcNumber(loaded.icNumber);
        setCidbExp(loaded.cidbExp);
        setSignatureActive(parsed.signatureActive !== false);
        setChopActive(parsed.chopActive !== false);
      } else {
        const initial: UserProfile = {
          ...DEFAULT_PROFILE,
          name: currentUser?.name || staff.name,
          email: currentUser?.email || staff.email,
          role: currentUser?.role || staff.role,
          position: staff.position || staff.role,
          phone: staff.phone || DEFAULT_PROFILE.phone,
          company: staff.company || DEFAULT_PROFILE.company,
          icNumber: staff.icNumber || DEFAULT_PROFILE.icNumber,
          cidbExp: staff.cidbExp || DEFAULT_PROFILE.cidbExp,
        };
        setProfile(initial);
        setName(initial.name);
        setRole(initial.role);
        setPosition(initial.position);
        setEmail(initial.email);
        setPhone(initial.phone);
        setCompany(initial.company);
        setIcNumber(initial.icNumber);
        setCidbExp(initial.cidbExp);
      }
    } catch {
      /* ignore */
    }
  }, [currentUser, open]);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSavedMsg("");

    const updated: UserProfile = {
      ...profile,
      name: name.trim() || profile.name,
      role: role.trim() || profile.role,
      position: position.trim() || profile.position,
      email: email.trim() || profile.email,
      phone: phone.trim() || profile.phone,
      company: company.trim() || profile.company,
      icNumber: icNumber.trim() || profile.icNumber,
      cidbExp: cidbExp.trim() || profile.cidbExp,
      signatureActive,
      chopActive,
    };

    setProfile(updated);
    try {
      const key = normalizeKey(currentUser?.name || currentUser?.email || "damia");
      localStorage.setItem(`btp_user_profile_${key}`, JSON.stringify(updated));
      if (key === "damia") {
        localStorage.setItem("damia_user_profile", JSON.stringify(updated));
      }
      localStorage.setItem(
        "btp_qaqc_user",
        JSON.stringify({
          name: updated.name,
          email: updated.email,
          role: updated.role,
        })
      );

      // Sync updated name into TeamModal storage if exists
      try {
        const teamStored = localStorage.getItem("sdsb_btp_org_chart_members_v4");
        if (teamStored) {
          const teamList = JSON.parse(teamStored);
          if (Array.isArray(teamList)) {
            const synced = teamList.map((m: any) => {
              const mKey = normalizeKey(m.id?.replace("sdsb-", "").replace("lead-", "") || m.name);
              if (mKey === key) {
                return {
                  ...m,
                  name: updated.name,
                  email: updated.email || m.email,
                  phone: updated.phone || m.phone,
                };
              }
              return m;
            });
            localStorage.setItem("sdsb_btp_org_chart_members_v4", JSON.stringify(synced));
          }
        }
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    }

    setTimeout(() => {
      setProfileSaving(false);
      setProfileSavedMsg("Profile information saved successfully!");
      if (onSave) onSave(updated);
      setTimeout(() => setProfileSavedMsg(""), 3000);
    }, 300);
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!currentPassword) {
      setPwdError("Please enter your current password.");
      return;
    }

    setPwdSaving(true);
    try {
      const res = changeUserPassword(
        profile.name,
        currentPassword,
        newPassword,
        confirmPassword
      );
      setPwdSaving(false);
      setPwdSuccess(res.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPwdSuccess("");
        setPasswordOpen(false);
      }, 2500);
    } catch (err: any) {
      setPwdSaving(false);
      setPwdError(err.message || "Failed to update password");
    }
  }

  return (
    <>
      <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="profile-modal-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />

      {/* Modal Header */}
      <div className={MODAL_HEADER_CLASS}>
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-white font-extrabold text-lg shadow-md">
            {name
              ? name
                  .trim()
                  .split(/\s+/)
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "ND"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="profile-modal-title" className={MODAL_TITLE_CLASS}>
                {name || profile.name}
              </h3>
              <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-500/30">
                Staff Profile
              </span>
            </div>
            <p className={MODAL_SUBTITLE_CLASS}>
              {role || profile.role} · {company || profile.company}
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

      {/* Modal Body */}
      <div className={MODAL_BODY_CLASS}>
        <div className="space-y-4">
          {/* Role & Access Banner */}
          <div className="rounded-xl border border-teal-500/25 bg-teal-500/10 p-3.5 dark:bg-teal-950/30">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-ink font-bold block">
                  Staff Control & Account Administration
                </strong>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                  Manage your personal staff details, contact information, project role, security password, and digital signature status for <strong>SDSB · Banting Technology Park (BTP)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Daily Site Report (DSR) & Personal Activity Hub */}
          <div className="rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-paper-elevated to-indigo-500/10 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white shadow-sm shrink-0">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                      Daily Site Report (DSR) & Activity Hub
                    </h4>
                    <p className="text-[11px] text-muted">
                      Personal site activity diary · Official DSR generation · Weekly & Monthly PDF compilation
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400 border border-line">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <strong>{loggedDaysCount} Days</strong> Logged
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2.5 py-0.5 font-semibold text-indigo-600 dark:text-indigo-400 border border-line">
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <strong>{dsrCount} DSR</strong> Reports Active
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2.5 py-0.5 font-semibold text-teal-600 dark:text-teal-400 border border-line">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    November 2026 Active
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setDsrCalendarOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition cursor-pointer"
                  title="Open Personal Activity Calendar"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>Personal Calendar & Log</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingDsrId(null);
                    setInitialDsrDate(new Date().toISOString().slice(0, 10));
                    setDsrFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 transition cursor-pointer"
                  title="Create New Daily Site Report"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Create DSR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompileModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-2 text-xs font-bold text-ink hover:border-accent hover:text-accent transition cursor-pointer"
                  title="Compile Weekly or Monthly Report"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Compile Reports</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Editable Staff Information (7 cols) */}
            <form onSubmit={handleSaveProfile} className="lg:col-span-7 space-y-4 rounded-xl border border-line bg-paper/30 p-4">
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-accent" />
                  Staff Identification & Information
                </span>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Editable
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">
                    Staff Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-lg border border-line bg-field px-2.5 py-1.5 focus-within:border-accent">
                    <User className="h-3.5 w-3.5 text-muted mr-1.5 shrink-0" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. NUR DAMIA BT SHAFEE"
                      className="w-full bg-transparent text-xs text-ink font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">
                    Project Role / Title <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-lg border border-line bg-field px-2.5 py-1.5 focus-within:border-accent">
                    <Briefcase className="h-3.5 w-3.5 text-muted mr-1.5 shrink-0" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      placeholder="e.g. QAQC DC"
                      className="w-full bg-transparent text-xs text-ink font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">
                    IC / NRIC Number
                  </label>
                  <div className="flex items-center rounded-lg border border-line bg-field px-2.5 py-1.5 focus-within:border-accent">
                    <CreditCard className="h-3.5 w-3.5 text-muted mr-1.5 shrink-0" />
                    <input
                      type="text"
                      value={icNumber}
                      onChange={(e) => setIcNumber(e.target.value)}
                      placeholder="e.g. 960814-10-5432"
                      className="w-full bg-transparent font-mono text-xs text-ink outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">
                    CIDB Green Card Status / Expiry
                  </label>
                  <div className="flex items-center rounded-lg border border-line bg-field px-2.5 py-1.5 focus-within:border-accent">
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-500 mr-1.5 shrink-0" />
                    <input
                      type="text"
                      value={cidbExp}
                      onChange={(e) => setCidbExp(e.target.value)}
                      placeholder="e.g. 14 Oct 2027 (Valid)"
                      className="w-full bg-transparent text-xs text-emerald-600 dark:text-emerald-400 font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">
                    Official Work Email <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-lg border border-line bg-field px-2.5 py-1.5 focus-within:border-accent">
                    <Mail className="h-3.5 w-3.5 text-muted mr-1.5 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="damia.sdsbbtp@gmail.com"
                      className="w-full bg-transparent text-xs text-ink outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1">
                    Contact / Telephone Number
                  </label>
                  <div className="flex items-center rounded-lg border border-line bg-field px-2.5 py-1.5 focus-within:border-accent">
                    <Phone className="h-3.5 w-3.5 text-muted mr-1.5 shrink-0" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+60 12-345 6789"
                      className="w-full bg-transparent font-mono text-xs text-ink outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-ink mb-1">
                    Company / Organisation
                  </label>
                  <div className="flex items-center rounded-lg border border-line bg-field px-2.5 py-1.5 focus-within:border-accent">
                    <Building className="h-3.5 w-3.5 text-muted mr-1.5 shrink-0" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="SHENGDING CONSTRUCTION SDN BHD (SDSB)"
                      className="w-full bg-transparent text-xs text-ink font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-ink mb-1">
                    Job Description / System Function
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="System Administrator & Lead Document Controller"
                    className="w-full rounded-lg border border-line bg-field px-3 py-1.5 text-xs text-ink outline-none focus:border-accent"
                  />
                </div>
              </div>

              {profileSavedMsg && (
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{profileSavedMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end pt-1">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{profileSaving ? "Saving..." : "Save Profile Details"}</span>
                </button>
              </div>
            </form>

            {/* Right Column: Security, Password & E-Sign / Chop (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Security & Password Card */}
              <div className="rounded-xl border border-line bg-paper-elevated p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                        Security & Password
                      </h4>
                      <p className="text-[10px] text-muted">
                        Default: <code className="font-bold text-teal-600 dark:text-teal-400">ChangeMe123!</code>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordOpen((v) => !v);
                      setPwdError("");
                      setPwdSuccess("");
                    }}
                    className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink hover:bg-field cursor-pointer transition"
                  >
                    {passwordOpen ? "Hide" : "Change Password"}
                  </button>
                </div>

                {passwordOpen && (
                  <form onSubmit={handlePasswordChange} className="mt-3.5 space-y-2.5 border-t border-line pt-3">
                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Current Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Current password (default: ChangeMe123!)"
                        className="w-full rounded-lg border border-line bg-field px-3 py-1.5 text-xs text-ink placeholder:text-muted outline-none focus:border-accent"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        New Password (min 6)
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="New password"
                        className="w-full rounded-lg border border-line bg-field px-3 py-1.5 text-xs text-ink placeholder:text-muted outline-none focus:border-accent"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        className="w-full rounded-lg border border-line bg-field px-3 py-1.5 text-xs text-ink placeholder:text-muted outline-none focus:border-accent"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="flex items-center gap-1.5 text-[11px] text-muted hover:text-ink cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        <span>{showPassword ? "Hide" : "Show"}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={pwdSaving}
                        className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-teal-500 disabled:opacity-50 cursor-pointer"
                      >
                        {pwdSaving ? "Updating..." : "Update Password"}
                      </button>
                    </div>

                    {pwdError && (
                      <div className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-400 mt-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{pwdError}</span>
                      </div>
                    )}

                    {pwdSuccess && (
                      <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-xs text-emerald-700 dark:text-emerald-300 mt-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{pwdSuccess}</span>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Digital E-Sign & Official Stamp (Chop) */}
              <div className="rounded-xl border border-line bg-paper/30 p-4">
                <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Stamp className="h-4 w-4 text-accent" />
                  Digital Signatures & Company Chop
                </span>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setSignatureActive((v) => !v)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      signatureActive
                        ? "border-teal-500 bg-teal-500/10 shadow-xs"
                        : "border-line bg-field/60 opacity-60"
                    }`}
                  >
                    <PenTool className="h-5 w-5 text-teal-600 dark:text-teal-400 mb-1" />
                    <span className="font-bold text-ink">E-Signature</span>
                    <span className={`text-[10px] font-semibold mt-0.5 ${signatureActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}`}>
                      {signatureActive ? "● Configured & Active" : "○ Inactive"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChopActive((v) => !v)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      chopActive
                        ? "border-teal-500 bg-teal-500/10 shadow-xs"
                        : "border-line bg-field/60 opacity-60"
                    }`}
                  >
                    <Stamp className="h-5 w-5 text-teal-600 dark:text-teal-400 mb-1" />
                    <span className="font-bold text-ink">SDSB QAQC Chop</span>
                    <span className={`text-[10px] font-semibold mt-0.5 ${chopActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}`}>
                      {chopActive ? "● Official Stamp Active" : "○ Inactive"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="border-t border-line bg-paper/50 px-6 py-3 flex items-center justify-between">
        <span className="text-xs text-muted">
          Staff Account: <strong className="text-ink font-semibold">{name}</strong> ({role})
        </span>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-accent px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          Done
        </button>
      </div>
    </CenteredModal>

    {/* Sub-modals for DSR */}
    <StaffDailyReportModal
      open={dsrCalendarOpen}
      onClose={() => setDsrCalendarOpen(false)}
      userName={name || profile.name}
      userRole={role || profile.role}
      onOpenCreateDsr={(date) => {
        setInitialDsrDate(date);
        setEditingDsrId(null);
        setDsrFormOpen(true);
      }}
      onOpenViewDsr={(dsrId) => {
        setEditingDsrId(dsrId);
        setDsrFormOpen(true);
      }}
      onOpenCompile={() => {
        setDsrCalendarOpen(false);
        setCompileModalOpen(true);
      }}
      onPrintMonthlyReport={(year, month) => {
        const acts = getStaffDailyReports();
        setMonthlyPrintData({
          year,
          month,
          userName: name || profile.name,
          userRole: role || profile.role,
          activities: acts,
        });
        setPrintMode("monthly-personal");
        setPrintModalOpen(true);
      }}
    />

    <DarSiteFormModal
      open={dsrFormOpen}
      onClose={() => setDsrFormOpen(false)}
      initialDate={initialDsrDate}
      editDsrId={editingDsrId}
      userName={name || profile.name}
      onSaved={() => {
        const dsrs = getDsrRecords();
        setDsrCount(dsrs.length);
      }}
      onPrintDsr={(record) => {
        setPrintDsrRecord(record);
        setPrintMode("dsr");
        setPrintModalOpen(true);
      }}
    />

    <CompileSiteReportModal
      open={compileModalOpen}
      onClose={() => setCompileModalOpen(false)}
      userName={name || profile.name}
      onCompileReport={(report) => {
        setCompiledReportData(report);
        setPrintMode("compiled-report");
        setPrintModalOpen(true);
      }}
    />

    <DsrReportPrintViewerModal
      open={printModalOpen}
      onClose={() => setPrintModalOpen(false)}
      mode={printMode}
      dsr={printDsrRecord}
      monthlyData={monthlyPrintData}
      compiledReport={compiledReportData}
    />
  </>
  );
}

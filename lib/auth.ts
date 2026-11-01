"use client";

export const DEFAULT_PASSWORD = "ChangeMe123!";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  company: string;
  position?: string;
  discipline?: string;
  badge?: string;
  avatar?: string;
  icNumber?: string;
  cidbExp?: string;
  isAdmin?: boolean;
};

export const STAFF_REGISTRY: Record<string, StaffUser> = {
  damia: {
    id: "usr-damia",
    name: "Nur Damia",
    email: "damia.sdsbbtp@gmail.com",
    role: "Document Controller & QAQC Admin",
    position: "Lead Document Controller & QAQC Admin",
    discipline: "DOCUMENT & AUDIT",
    phone: "+60 12-345 6789",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "Lead DC / Admin",
    avatar: "ND",
    icNumber: "960814-10-5432",
    cidbExp: "14 Oct 2027",
    isAdmin: true,
  },
  aiman: {
    id: "usr-aiman",
    name: "Aiman",
    email: "aiman.qaqc@sdsb.com.my",
    role: "QAQC Manager",
    position: "QAQC Department Head",
    discipline: "ALL PACKAGES & QUALITY GOVERNANCE",
    phone: "+6013 646 0532",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "QAQC Head",
    avatar: "AM",
    icNumber: "880520-10-5111",
    cidbExp: "31 Dec 2028",
    isAdmin: true,
  },
  jinbao: {
    id: "usr-jinbao",
    name: "Ha Jin Bao",
    email: "ha.jinbao@sdsb.com.my",
    role: "Project Manager",
    position: "Project Manager / Director",
    discipline: "BTP HQ PROJECT LEAD",
    phone: "+6010 – 310 2505",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "Project Lead",
    avatar: "JB",
    icNumber: "850212-14-5999",
    cidbExp: "31 Dec 2029",
    isAdmin: true,
  },
  farah: {
    id: "usr-farah",
    name: "Farah Dayana",
    email: "farah.dayana@sdsb.com.my",
    role: "QAQC Engineer",
    position: "QAQC Engineer (EW / RC Wall & Block B C&S)",
    discipline: "EW & RC WALL / BLOCK B",
    phone: "011-3313 9305",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "QAQC Eng",
    avatar: "FD",
    icNumber: "931011-10-5432",
    cidbExp: "18 Jun 2027",
    isAdmin: false,
  },
  faez: {
    id: "usr-faez",
    name: "Faez",
    email: "faez.arch@sdsb.com.my",
    role: "QAQC Engineer",
    position: "QAQC Engineer (Block A Arch & Block F C&S)",
    discipline: "BLOCK A (ARCH) / BLOCK F (C&S)",
    phone: "016-3277653",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "QAQC Eng",
    avatar: "FZ",
    icNumber: "920418-10-6123",
    cidbExp: "25 Sep 2027",
    isAdmin: false,
  },
  hafiy: {
    id: "usr-hafiy",
    name: "Hafiy",
    email: "hafiy.cns@sdsb.com.my",
    role: "QAQC Engineer",
    position: "QAQC Engineer (Block A C&S)",
    discipline: "BLOCK A (C&S)",
    phone: "011-2887 8481",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "QAQC Eng",
    avatar: "HF",
    icNumber: "940722-10-5888",
    cidbExp: "12 Nov 2027",
    isAdmin: false,
  },
  amira: {
    id: "usr-amira",
    name: "Nur Amira",
    email: "nur.amira@sdsb.com.my",
    role: "QAQC Engineer",
    position: "QAQC Engineer (Block B Arch)",
    discipline: "BLOCK B (ARCH)",
    phone: "011-2345 6789",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "QAQC Eng",
    avatar: "NA",
    icNumber: "951130-10-5222",
    cidbExp: "02 Nov 2028",
    isAdmin: false,
  },
  zhou: {
    id: "usr-zhou",
    name: "Zhou",
    email: "zhou.qaqc@sdsb.com.my",
    role: "Assistant QAQC Engineer",
    position: "Assistant QAQC Engineer (Technical & Site Support)",
    discipline: "SITE & TECHNICAL SUPPORT",
    phone: "6014-396 7582",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "Assistant Engineer",
    avatar: "ZH",
    icNumber: "970314-10-7777",
    cidbExp: "15 Aug 2027",
    isAdmin: false,
  },
  caimeng: {
    id: "usr-caimeng",
    name: "Cai Meng",
    email: "caimeng@sdsb.com.my",
    role: "QAQC Supervisor",
    position: "Field Testing & Inspection Supervisor",
    discipline: "SITE TESTING & SUBSTRUCTURE",
    phone: "011-2629 3156",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "Field Supervisor",
    avatar: "CM",
    icNumber: "910909-10-3333",
    cidbExp: "20 May 2027",
    isAdmin: false,
  },
  ikhwan: {
    id: "usr-ikhwan",
    name: "Ikhwan",
    email: "ikhwan.cns@sdsb.com.my",
    role: "QAQC Supervisor",
    position: "Concreting & Rebar Surveillance Supervisor",
    discipline: "C&S CONCRETING & REBAR",
    phone: "013-2548526",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "Field Supervisor",
    avatar: "IK",
    icNumber: "930612-10-4444",
    cidbExp: "14 Jul 2027",
    isAdmin: false,
  },
};

export function normalizeKey(usernameOrEmail: string): string {
  const clean = usernameOrEmail.trim().toLowerCase();
  if (clean.includes("damia")) return "damia";
  if (clean.includes("aiman")) return "aiman";
  if (clean.includes("jinbao") || clean.includes("jin bao") || clean.includes("ha jin bao") || clean === "pm") return "jinbao";
  if (clean.includes("farah") || clean.includes("dayana")) return "farah";
  if (clean.includes("faez")) return "faez";
  if (clean.includes("hafiy")) return "hafiy";
  if (clean.includes("amira") || clean.includes("nur amira")) return "amira";
  if (clean.includes("zhou")) return "zhou";
  if (clean.includes("cai") || clean.includes("meng") || clean.includes("caimeng")) return "caimeng";
  if (clean.includes("ikhwan")) return "ikhwan";

  const rawKey = clean.split("@")[0].replace(/[^a-z0-9]/g, "");
  return rawKey;
}

export function getUserPassword(usernameOrEmail: string): string {
  if (typeof window === "undefined") return DEFAULT_PASSWORD;
  const key = normalizeKey(usernameOrEmail);
  const stored = localStorage.getItem(`btp_pwd_${key}`);
  return stored || DEFAULT_PASSWORD;
}

export function getSavedStaffProfile(keyOrName: string): Partial<StaffUser> | null {
  if (typeof window === "undefined") return null;
  try {
    const key = normalizeKey(keyOrName);
    const stored =
      localStorage.getItem(`btp_user_profile_${key}`) ||
      (key === "damia" ? localStorage.getItem("damia_user_profile") : null);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getResolvedStaffUser(keyOrName: string): StaffUser {
  const key = normalizeKey(keyOrName);
  const base: StaffUser = STAFF_REGISTRY[key] || {
    id: `usr-${key}`,
    name: key.toUpperCase(),
    email: `${key}@sdsb.com.my`,
    role: "QAQC Project Officer",
    position: "QAQC Site Team",
    discipline: "GENERAL",
    phone: "+60 12-000 0000",
    company: "SHENGDING CONSTRUCTION SDN BHD (SDSB)",
    badge: "QAQC Team",
    avatar: key.slice(0, 2).toUpperCase(),
    icNumber: "900101-10-0000",
    cidbExp: "Valid",
    isAdmin: false,
  };

  const saved = getSavedStaffProfile(key);
  if (saved && typeof saved.name === "string" && saved.name.trim()) {
    return {
      ...base,
      ...saved,
      name: saved.name.trim(),
      role: (typeof saved.role === "string" && saved.role.trim()) || base.role,
      email: (typeof saved.email === "string" && saved.email.trim()) || base.email,
      phone: (typeof saved.phone === "string" && saved.phone.trim()) || base.phone,
    };
  }

  return base;
}

export function getStaffAccountsList(): Array<StaffUser & { key: string }> {
  return Object.entries(STAFF_REGISTRY).map(([key]) => {
    const resolved = getResolvedStaffUser(key);
    return {
      key,
      ...resolved,
    };
  });
}

export function verifyLogin(usernameOrEmail: string, passwordAttempt: string): StaffUser {
  const cleanInput = usernameOrEmail.trim().toLowerCase();
  const key = normalizeKey(cleanInput);
  const correctPassword = getUserPassword(key);

  if (passwordAttempt !== correctPassword) {
    throw new Error(
      `Incorrect password. Default password for all staff is '${DEFAULT_PASSWORD}'`
    );
  }

  return getResolvedStaffUser(cleanInput);
}

export function changeUserPassword(
  usernameOrEmail: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): { success: boolean; message: string } {
  const key = normalizeKey(usernameOrEmail);
  const existingPassword = getUserPassword(key);

  if (currentPassword !== existingPassword) {
    throw new Error("Current password does not match.");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirmation password do not match.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(`btp_pwd_${key}`, newPassword);
  }

  return { success: true, message: "Password updated successfully!" };
}

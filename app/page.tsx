"use client";

import { useEffect, useState } from "react";
import { HomePage } from "@/components/HomePage";
import { Dashboard } from "@/app/dashboard";
import { getSavedStaffProfile, normalizeKey } from "@/lib/auth";

type QAQCUser = {
  name: string;
  email: string;
  role?: string;
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<QAQCUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user session was previously remembered
    try {
      const stored = localStorage.getItem("btp_qaqc_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) {
          const key = normalizeKey(parsed.email || parsed.name || "damia");
          const savedProfile = getSavedStaffProfile(key);
          if (savedProfile?.name && typeof savedProfile.name === "string" && savedProfile.name.trim()) {
            parsed.name = savedProfile.name.trim();
          }
          if (savedProfile?.role && typeof savedProfile.role === "string" && savedProfile.role.trim()) {
            parsed.role = savedProfile.role.trim();
          } else if (key === "damia") {
            parsed.role = "QAQC DC";
          }
          if (key === "damia" && (!parsed.role || parsed.role.includes("Document Controller & QAQC Admin"))) {
            parsed.role = "QAQC DC";
          }
          setCurrentUser(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  function handleLogin(user: QAQCUser) {
    setCurrentUser(user);
    try {
      localStorage.setItem("btp_qaqc_user", JSON.stringify(user));
    } catch {
      // ignore
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    try {
      localStorage.removeItem("btp_qaqc_user");
    } catch {
      // ignore
    }
  }

  // Avoid flash before hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0b1220] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
          <p className="text-xs font-semibold tracking-wider uppercase text-teal-400">
            BTP QAQC Control Centre
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <HomePage onLoginSuccess={handleLogin} />;
  }

  return <Dashboard user={currentUser} onLogout={handleLogout} />;
}

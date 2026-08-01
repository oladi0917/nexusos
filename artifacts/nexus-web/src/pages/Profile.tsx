import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api, type UserProfile } from "../lib/api";
import { getInitials } from "../lib/utils";

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
}

function SettingRow({ icon, label, subtitle, onClick, danger }: SettingRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl mb-1.5 transition-opacity hover:opacity-80 ${
        danger ? "border-red/20" : ""
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          danger ? "bg-red/10" : "bg-gold-light"
        }`}
      >
        <span className={danger ? "text-red" : "text-gold"}>{icon}</span>
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-semibold ${danger ? "text-red" : "text-fg"}`}>
          {label}
        </p>
        {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>
      {!danger && <ChevronRight size={16} className="text-muted" />}
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    api.get<UserProfile>("/users/profile").then(setProfile).catch(() => {});
  }, []);

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user
    ? `${user.firstName} ${user.lastName}`
    : "User";

  const initials = getInitials(fullName);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Layout title="Profile">
      <div className="px-5 pb-6">
        {/* Avatar card */}
        <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 mt-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-fg font-bold text-base truncate">{fullName}</p>
            <p className="text-muted text-sm truncate">
              {profile?.email ?? user?.email ?? ""}
            </p>
            {(profile?.phone ?? user?.phone) && (
              <p className="text-muted text-xs">
                {profile?.phone ?? user?.phone}
              </p>
            )}
          </div>
        </div>

        {/* Settings */}
        <p className="text-muted text-xs font-semibold tracking-widest uppercase mb-3">
          Settings
        </p>
        <SettingRow
          icon={<Shield size={18} />}
          label="Security"
          subtitle="PIN, biometrics &amp; 2FA"
        />
        <SettingRow
          icon={<Bell size={18} />}
          label="Notifications"
          subtitle="Manage push notifications"
        />
        <SettingRow
          icon={<HelpCircle size={18} />}
          label="Help &amp; Support"
          subtitle="FAQs, contact us"
        />
        <SettingRow
          icon={<Info size={18} />}
          label="About Nexus"
          subtitle="Version 1.0.0"
        />

        <p className="text-muted text-xs font-semibold tracking-widest uppercase mb-3 mt-6">
          Account Actions
        </p>
        <SettingRow
          icon={<LogOut size={18} />}
          label="Sign Out"
          onClick={handleLogout}
          danger
        />

        <p className="text-center text-muted text-xs mt-10">
          Nexus · Connected Finance. Simplified.
        </p>
      </div>
    </Layout>
  );
}

import React from "react";

interface NexusLogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  showWordmark?: boolean;
}

const SIZES = {
  xs: { icon: 20, text: "text-base", gap: "gap-1.5" },
  sm: { icon: 28, text: "text-xl", gap: "gap-2" },
  md: { icon: 40, text: "text-2xl", gap: "gap-2.5" },
  lg: { icon: 56, text: "text-3xl", gap: "gap-3" },
};

export function NexusLogo({ size = "md", showWordmark = false }: NexusLogoProps) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center ${s.gap}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="10" fill="#C9A84C" fillOpacity="0.15" />
        <path
          d="M10 30L20 10L30 30"
          stroke="#C9A84C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 24H27"
          stroke="#C9A84C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="3" fill="#C9A84C" />
      </svg>
      {showWordmark && (
        <span
          className={`${s.text} font-bold tracking-tight`}
          style={{ color: "#F5F5F5" }}
        >
          Nexus
        </span>
      )}
    </div>
  );
}

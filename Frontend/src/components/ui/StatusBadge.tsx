"use client";

import React from "react";

export type BadgeStatus = "success" | "warning" | "error";

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  className?: string;
}

export default function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const config = {
    success: {
      bg: "bg-brand-success/10 border-brand-success/20",
      text: "text-brand-success",
      dot: "bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse",
    },
    warning: {
      bg: "bg-brand-warning/10 border-brand-warning/20",
      text: "text-brand-warning",
      dot: "bg-brand-warning shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse",
    },
    error: {
      bg: "bg-brand-error/10 border-brand-error/20",
      text: "text-brand-error",
      dot: "bg-brand-error shadow-[0_0_8px_rgba(248,113,113,0.5)] animate-pulse",
    },
  };

  const current = config[status] || config.success;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold tracking-wide backdrop-blur-sm transition-all duration-300 ${current.bg} ${current.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{label}</span>
    </div>
  );
}

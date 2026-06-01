"use client";

import React from "react";
import StatusBadge, { BadgeStatus } from "./StatusBadge";

export type Priority = "Alta" | "Media" | "Baja";

interface IncidentCardProps {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  statusLabel: string;
  status: BadgeStatus;
  timeLabel: string;
  reporterName: string;
  reporterAvatar?: string;
  onClick?: () => void;
}

export default function IncidentCard({
  id,
  title,
  category,
  priority,
  statusLabel,
  status,
  timeLabel,
  reporterName,
  reporterAvatar,
  onClick,
}: IncidentCardProps) {
  const priorityColors = {
    Alta: "text-red-400 bg-red-400/10 border-red-400/20",
    Media: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Baja: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  const priorityColor = priorityColors[priority] || priorityColors.Baja;

  return (
    <div
      onClick={onClick}
      className="group relative p-5 rounded-2xl border border-brand-surface-bright/20 bg-brand-surface-container/60 hover:bg-brand-surface-bright/15 hover:border-brand-primary/30 transition-all duration-300 backdrop-blur-md cursor-pointer shadow-md select-none"
    >
      <div className="flex items-start justify-between mb-3">
        {/* Category & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              #{id}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              • {category}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-white transition-colors duration-200">
            {title}
          </h3>
        </div>

        {/* Priority Badge */}
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase border ${priorityColor}`}
        >
          {priority}
        </span>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-brand-surface-bright/10">
        {/* Status Badge */}
        <StatusBadge status={status} label={statusLabel} />

        {/* Reporter info and Time elapsed */}
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-slate-400 font-medium">
            {timeLabel}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-brand-surface-bright flex items-center justify-center border border-brand-surface-bright/40">
              {reporterAvatar ? (
                <img
                  src={reporterAvatar}
                  alt={reporterName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <span className="text-[11px] text-slate-300 font-bold max-w-[80px] truncate">
              {reporterName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

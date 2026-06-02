"use client";

import React from "react";
import StatusBadge, { BadgeStatus } from "./StatusBadge";

interface DashboardActionCardProps {
  category: string;
  title: string;
  badgeLabel: string;
  badgeStatus: BadgeStatus;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  dateInfo?: {
    date: string;
    time: string;
  };
}

export default function DashboardActionCard({
  category,
  title,
  badgeLabel,
  badgeStatus,
  description,
  icon,
  onClick,
  dateInfo,
}: DashboardActionCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative p-5 rounded-2xl border border-brand-surface-bright/20 bg-brand-surface-container/60 hover:bg-brand-surface-bright/15 hover:border-brand-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 backdrop-blur-md cursor-pointer select-none`}
    >
      {/* Glow gradient border reflection */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-primary/0 via-brand-primary/0 to-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        {/* Category & Status */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {category}
          </span>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-slate-950 group-hover:dark:text-white transition-colors duration-200">
            {title}
          </h3>
        </div>

        {/* Badge & Icon container */}
        <div className="flex items-center gap-3">
          <StatusBadge status={badgeStatus} label={badgeLabel} />
          {icon && (
            <div className="p-2 rounded-xl bg-brand-surface-bright/10 border border-brand-surface-bright/15 text-slate-500 dark:text-slate-400 group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-all duration-300">
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Optional Description */}
      {description && (
        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors duration-200">
          {description}
        </p>
      )}

      {/* Optional Date Information for Reservation cards */}
      {dateInfo && (
        <div className="mt-4 pt-4 border-t border-brand-surface-bright/10 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{dateInfo.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{dateInfo.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}

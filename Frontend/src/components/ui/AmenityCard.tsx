"use client";

import React from "react";
import StatusBadge, { BadgeStatus } from "./StatusBadge";

interface AmenityCardProps {
  title: string;
  imageUrl: string;
  statusLabel: string;
  status: BadgeStatus;
  capacity: number;
  description: string;
  onBookClick?: () => void;
}

export default function AmenityCard({
  title,
  imageUrl,
  statusLabel,
  status,
  capacity,
  description,
  onBookClick,
}: AmenityCardProps) {
  return (
    <div className="group relative w-full h-[360px] rounded-2xl overflow-hidden border border-brand-surface-bright/20 bg-brand-surface-container shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)] hover:border-brand-primary/30">
      {/* Background Image with Zoom effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />

      {/* Tonal Layering Overlay (Premium Gradient) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-[#051424]/45 to-black/40 transition-opacity duration-300" />

      {/* Top Floating Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <StatusBadge status={status} label={statusLabel} />
      </div>

      {/* Card Content (Bottom anchored) */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-10 space-y-3">
        <div className="space-y-1">
          {/* Capacity Info */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-brand-primary uppercase">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Capacidad: {capacity} Pers.</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-extrabold text-white tracking-wide group-hover:text-brand-primary transition-colors duration-300">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Integrated Action Button */}
        <button
          onClick={onBookClick}
          className="w-full relative flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-brand-primary hover:text-white border border-white/20 hover:border-brand-primary text-slate-100 text-xs font-semibold tracking-wide uppercase transition-all duration-300 active:scale-[0.98] cursor-pointer focus:outline-none"
        >
          <span>Reservar Espacio</span>
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

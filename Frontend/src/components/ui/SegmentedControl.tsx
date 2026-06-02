"use client";

import React from "react";

interface SegmentedControlProps {
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({
  options,
  selectedValue,
  onChange,
  className = "",
}: SegmentedControlProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-xl bg-brand-surface-container border border-brand-surface-bright/20 backdrop-blur-md ${className}`}
    >
      {options.map((option) => {
        const isActive = selectedValue === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
              isActive
                ? "bg-brand-primary text-white shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-brand-surface-bright/20"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

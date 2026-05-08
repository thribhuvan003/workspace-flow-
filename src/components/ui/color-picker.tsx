"use client";

import { cn, WORKSPACE_COLORS } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {WORKSPACE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
            "hover:scale-110 hover:shadow-lg",
            value === color && "ring-2 ring-white/40 ring-offset-2 ring-offset-[#111118]"
          )}
          style={{ background: color }}
        >
          {value === color && <Check className="w-4 h-4 text-white" />}
        </button>
      ))}
    </div>
  );
}

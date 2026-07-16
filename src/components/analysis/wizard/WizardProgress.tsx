"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardProgress({ steps, currentStep, onStepClick }: WizardProgressProps) {
  return (
    <div className="relative">
      {/* Track */}
      <div className="absolute top-3.5 left-0 right-0 h-px bg-[#1a1a1a] mx-4">
        <motion.div
          className="h-full bg-[#F0B429]"
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="relative flex justify-between">
        {steps.map((label, i) => {
          const isCompleted = i < currentStep;
          const isCurrent   = i === currentStep;
          const isPast      = i <= currentStep;

          return (
            <button
              key={label}
              type="button"
              onClick={() => isPast && onStepClick?.(i)}
              disabled={!isPast}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-bold transition-all z-10 relative border",
                  isCompleted
                    ? "bg-[#F0B429] border-[#F0B429] text-[#080808]"
                    : isCurrent
                    ? "bg-card border-[#F0B429] text-[#F0B429]"
                    : "bg-card border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
              </div>
              <span className={cn(
                "text-[10px] font-mono uppercase tracking-widest hidden sm:block transition-colors",
                isCurrent   ? "text-foreground"
                : isCompleted ? "text-muted-foreground"
                : "text-[#2a2622]"
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step3Schema, Step3Data } from "@/lib/validations/analysis";
import { AnalysisFormData, PATTERN_TYPES } from "@/types/analysis";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WizardNav } from "./WizardNav";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Step3Props {
  data: AnalysisFormData;
  onNext: (data: Partial<AnalysisFormData>) => void;
  onBack: () => void;
}

const TRENDS = [
  { value: "bullish",       label: "Bullish",       icon: TrendingUp,   color: "#00D4AA", activeBg: "rgba(0,212,170,0.1)",   activeBorder: "#00D4AA" },
  { value: "bearish",       label: "Bearish",       icon: TrendingDown, color: "#FF4D6A", activeBg: "rgba(255,77,106,0.1)",  activeBorder: "#FF4D6A" },
  { value: "consolidation", label: "Consolidation", icon: Minus,        color: "#FF8C42", activeBg: "rgba(255,140,66,0.1)",  activeBorder: "#FF8C42" },
] as const;

const CONFIDENCE_LEVELS = [
  { value: "high",   label: "High",   color: "#00D4AA" },
  { value: "medium", label: "Medium", color: "#FF8C42" },
  { value: "low",    label: "Low",    color: "#FF4D6A" },
] as const;

export function Step3TechnicalPattern({ data, onNext, onBack }: Step3Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      technicalPattern: data.technicalPattern,
    },
  });

  const trend = watch("technicalPattern.trend");
  const confidence = watch("technicalPattern.confidenceLevel");

  function onSubmit(values: Step3Data) {
    onNext({ technicalPattern: values.technicalPattern });
  }

  const labelCls = "block text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1.5";
  const errCls   = "text-[#FF4D6A] text-xs mt-1 font-mono";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Trend */}
      <div>
        <label className={labelCls}>Overall Trend *</label>
        <div className="grid grid-cols-3 gap-3 mt-1.5">
          {TRENDS.map((t) => {
            const isActive = trend === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue("technicalPattern.trend", t.value, { shouldValidate: true })}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all font-mono text-xs font-bold uppercase tracking-widest",
                  isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
                )}
                style={isActive ? {
                  borderColor: t.activeBorder,
                  backgroundColor: t.activeBg,
                  color: t.color,
                } : {
                  borderColor: "#2a2622",
                  backgroundColor: "#111111",
                  color: "#4A4640",
                }}
              >
                <t.icon className="w-5 h-5" />
                {t.label}
              </button>
            );
          })}
        </div>
        {errors.technicalPattern?.trend && <p className={errCls}>{errors.technicalPattern.trend.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Pattern Type *</label>
          <Select value={watch("technicalPattern.patternType")} onValueChange={(v) => setValue("technicalPattern.patternType", v ?? "", { shouldValidate: true })}>
            <SelectTrigger className="bg-accent border-border text-muted-foreground h-10 rounded-lg font-mono text-sm">
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent className="bg-accent border-border max-h-72">
              {PATTERN_TYPES.map((p) => (
                <SelectItem key={p} value={p} className="text-muted-foreground font-mono text-xs">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.technicalPattern?.patternType && <p className={errCls}>{errors.technicalPattern.patternType.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Confidence Level *</label>
          <div className="flex gap-2 mt-1.5">
            {CONFIDENCE_LEVELS.map((c) => {
              const isActive = confidence === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setValue("technicalPattern.confidenceLevel", c.value, { shouldValidate: true })}
                  className={cn(
                    "flex-1 h-10 rounded-lg border font-mono text-xs font-bold uppercase tracking-widest transition-all",
                    isActive ? "border-current bg-opacity-10" : "border-border bg-accent text-muted-foreground"
                  )}
                  style={isActive ? { color: c.color, borderColor: c.color, backgroundColor: `${c.color}15` } : {}}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Pattern Notes</label>
        <Textarea
          placeholder="Describe the pattern characteristics, key levels, or observations..."
          rows={4}
          className="bg-accent border-border text-foreground placeholder:text-muted-foreground/40 focus:border-[#F0B429]/50 resize-none font-mono text-sm rounded-lg"
          {...register("technicalPattern.notes")}
        />
      </div>

      <WizardNav showBack onBack={onBack} />
    </form>
  );
}

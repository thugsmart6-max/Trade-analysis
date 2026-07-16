"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step4Schema, Step4Data } from "@/lib/validations/analysis";
import { AnalysisFormData, TIMEFRAME_LABELS } from "@/types/analysis";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WizardNav } from "./WizardNav";

interface Step4Props {
  data: AnalysisFormData;
  onNext: (data: Partial<AnalysisFormData>) => void;
  onBack: () => void;
}

const TIMEFRAMES = ["5m", "30m", "1h", "1d"] as const;
const INDICATORS = [
  { key: "sma20" as const,  label: "SMA 20",  description: "Simple Moving Average (20)"  },
  { key: "sma50" as const,  label: "SMA 50",  description: "Simple Moving Average (50)"  },
  { key: "sma100" as const, label: "SMA 100", description: "Simple Moving Average (100)" },
  { key: "sma200" as const, label: "SMA 200", description: "Simple Moving Average (200)" },
  { key: "rsi" as const,    label: "RSI",     description: "Relative Strength Index (0-100)" },
];

export function Step4Indicators({ data, onNext, onBack }: Step4Props) {
  const [activeTab, setActiveTab] = useState("5m");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step4Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step4Schema) as any,
    defaultValues: { indicators: data.indicators as Step4Data["indicators"] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(values: any) {
    onNext({ indicators: values.indicators });
  }

  const labelCls = "block text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1.5";
  const inputCls = "bg-card border-border text-foreground placeholder:text-muted-foreground/40 focus:border-[#F0B429]/50 h-9 font-mono text-sm rounded-lg";
  const errCls   = "text-[#FF4D6A] text-[10px] mt-1 font-mono";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
        All fields optional — fill in what you have for each timeframe.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border w-full rounded-lg p-0.5">
          {TIMEFRAMES.map((tf) => (
            <TabsTrigger
              key={tf}
              value={tf}
              className="flex-1 font-mono text-xs uppercase tracking-widest text-muted-foreground data-[state=active]:bg-[#F0B429] data-[state=active]:text-[#080808] data-[state=active]:font-bold rounded-md"
            >
              {TIMEFRAME_LABELS[tf]}
            </TabsTrigger>
          ))}
        </TabsList>

        {TIMEFRAMES.map((tf) => (
          <TabsContent key={tf} value={tf} className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {INDICATORS.map((ind) => (
                <div key={ind.key}>
                  <label className={labelCls}>{ind.label}</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={ind.key === "rsi" ? "0–100" : "—"}
                    className={inputCls}
                    {...register(`indicators.${tf}.${ind.key}`)}
                  />
                  {errors.indicators?.[tf]?.[ind.key] && (
                    <p className={errCls}>{errors.indicators[tf]?.[ind.key]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <WizardNav showBack onBack={onBack} />
    </form>
  );
}

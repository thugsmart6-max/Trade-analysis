"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema, Step2Data } from "@/lib/validations/analysis";
import { AnalysisFormData } from "@/types/analysis";
import { Input } from "@/components/ui/input";
import { WizardNav } from "./WizardNav";

interface Step2Props {
  data: AnalysisFormData;
  onNext: (data: Partial<AnalysisFormData>) => void;
  onBack: () => void;
}

const fields = [
  { name: "currentPrice" as const, label: "Current Price *", required: true },
  { name: "prevOpen" as const, label: "Previous Day Open" },
  { name: "prevClose" as const, label: "Previous Day Close" },
  { name: "prevHigh" as const, label: "Previous Day High" },
  { name: "prevLow" as const, label: "Previous Day Low" },
  { name: "allTimeHigh" as const, label: "All Time High (ATH)" },
  { name: "yearHigh" as const, label: "52-Week High" },
  { name: "yearLow" as const, label: "52-Week Low" },
];

export function Step2PriceInfo({ data, onNext, onBack }: Step2Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<Step2Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step2Schema) as any,
    defaultValues: {
      priceInfo: data.priceInfo as Step2Data["priceInfo"],
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(values: any) {
    onNext({ priceInfo: values.priceInfo });
  }

  const labelCls = "block text-[#8A8076] font-mono text-[10px] uppercase tracking-widest mb-1.5";
  const inputCls = "bg-[#111111] border-[#2a2622] text-[#F5F0E8] placeholder:text-[#2a2622] focus:border-[#F0B429]/50 h-10 font-mono text-sm rounded-lg pl-7";
  const errCls   = "text-[#FF4D6A] text-xs mt-1 font-mono";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {fields.map((field) => (
          <div key={field.name}>
            <label className={labelCls}>{field.label}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4640] text-sm font-mono">₹</span>
              <Input type="number" step="0.01" placeholder="0.00" className={inputCls} {...register(`priceInfo.${field.name}`)} />
            </div>
            {errors.priceInfo?.[field.name] && (
              <p className={errCls}>{errors.priceInfo[field.name]?.message}</p>
            )}
          </div>
        ))}
      </div>
      <WizardNav showBack onBack={onBack} />
    </form>
  );
}

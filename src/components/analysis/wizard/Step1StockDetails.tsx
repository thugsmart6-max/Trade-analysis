"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, Step1Data } from "@/lib/validations/analysis";
import { AnalysisFormData, SECTORS } from "@/types/analysis";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardNav } from "./WizardNav";

interface Step1Props {
  data: AnalysisFormData;
  onNext: (data: Partial<AnalysisFormData>) => void;
}

export function Step1StockDetails({ data, onNext }: Step1Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema) as any,
    defaultValues: {
      nseSymbol: data.nseSymbol,
      sector: data.sector,
      analysisDate: data.analysisDate,
      analysisTime: data.analysisTime,
    },
  });

  function onSubmit(values: Step1Data) {
    onNext(values);
  }

  const inputCls = "bg-accent border-border text-foreground placeholder:text-muted-foreground/40 focus:border-[#F0B429]/50 h-10 font-mono text-sm rounded-lg";
  const labelCls = "block text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1.5";
  const errCls   = "text-[#FF4D6A] text-xs mt-1 font-mono";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>NSE Symbol *</label>
          <Input
            placeholder="e.g. RELIANCE"
            className={`${inputCls} uppercase`}
            {...register("nseSymbol")}
            onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register("nseSymbol").onChange(e); }}
          />
          {errors.nseSymbol && <p className={errCls}>{errors.nseSymbol.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Sector *</label>
          <Select value={watch("sector")} onValueChange={(v) => setValue("sector", v ?? "", { shouldValidate: true })}>
            <SelectTrigger className="bg-accent border-border text-muted-foreground h-10 rounded-lg font-mono text-sm">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent className="bg-accent border-border max-h-64">
              {SECTORS.map((s) => (
                <SelectItem key={s} value={s} className="text-muted-foreground font-mono text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sector && <p className={errCls}>{errors.sector.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Analysis Date *</label>
          <Input type="date" className={inputCls} {...register("analysisDate")} />
          {errors.analysisDate && <p className={errCls}>{errors.analysisDate.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Analysis Time *</label>
          <Input type="time" className={inputCls} {...register("analysisTime")} />
          {errors.analysisTime && <p className={errCls}>{errors.analysisTime.message}</p>}
        </div>
      </div>

      <WizardNav showBack={false} />
    </form>
  );
}

"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step5Schema, Step5Data } from "@/lib/validations/analysis";
import { AnalysisFormData } from "@/types/analysis";
import { Input } from "@/components/ui/input";
import { WizardNav } from "./WizardNav";
import { calculateRiskReward } from "@/lib/utils";
import { Target, Shield, TrendingUp } from "lucide-react";

interface Step5Props {
  data: AnalysisFormData;
  onNext: (data: Partial<AnalysisFormData>) => void;
  onBack: () => void;
}

export function Step5TradeRecommendation({ data, onNext, onBack }: Step5Props) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step5Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step5Schema) as any,
    defaultValues: {
      tradeRecommendation: data.tradeRecommendation as Step5Data["tradeRecommendation"],
    },
  });

  const values = useWatch({ control, name: "tradeRecommendation" });

  // Auto-calculate risk/reward
  useEffect(() => {
    const buy = Number(values?.buyZone);
    const t1 = Number(values?.target1);
    const sl = Number(values?.stopLoss);
    if (buy > 0 && t1 > 0 && sl > 0) {
      const rr = calculateRiskReward(buy, t1, sl);
      setValue("tradeRecommendation.riskRewardRatio", rr);
    }
  }, [values?.buyZone, values?.target1, values?.stopLoss, setValue]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(values: any) {
    onNext({ tradeRecommendation: values.tradeRecommendation });
  }

  const rr = Number(values?.riskRewardRatio || 0);

  const labelCls = "block text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-1.5";
  const inputCls = "bg-accent border-border text-foreground placeholder:text-muted-foreground/40 focus:border-[#F0B429]/50 h-10 font-mono text-sm rounded-lg pl-7";
  const errCls   = "text-[#FF4D6A] text-xs mt-1 font-mono";

  const rrColor = rr >= 2 ? "#00D4AA" : rr >= 1 ? "#FF8C42" : "#FF4D6A";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>
            <span className="text-[#F0B429]">●</span> Buy Zone *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">₹</span>
            <Input type="number" step="0.01" placeholder="Entry price" className={inputCls} {...register("tradeRecommendation.buyZone")} />
          </div>
          {errors.tradeRecommendation?.buyZone && <p className={errCls}>{errors.tradeRecommendation.buyZone.message}</p>}
        </div>

        <div>
          <label className={labelCls}>
            <Shield className="inline w-3 h-3 mr-1 text-[#FF4D6A]" />Stop Loss *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">₹</span>
            <Input type="number" step="0.01" placeholder="Stop loss level" className={inputCls} {...register("tradeRecommendation.stopLoss")} />
          </div>
          {errors.tradeRecommendation?.stopLoss && <p className={errCls}>{errors.tradeRecommendation.stopLoss.message}</p>}
        </div>

        {[
          { name: "target1" as const, label: "Target 1 *" },
          { name: "target2" as const, label: "Target 2" },
          { name: "target3" as const, label: "Target 3" },
        ].map((t) => (
          <div key={t.name}>
            <label className={labelCls}>
              <Target className="inline w-3 h-3 mr-1 text-[#00D4AA]" />{t.label}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">₹</span>
              <Input type="number" step="0.01" placeholder="Target price" className={inputCls} {...register(`tradeRecommendation.${t.name}`)} />
            </div>
            {errors.tradeRecommendation?.[t.name] && <p className={errCls}>{errors.tradeRecommendation[t.name]?.message}</p>}
          </div>
        ))}

        <div>
          <label className={labelCls}>
            <TrendingUp className="inline w-3 h-3 mr-1" />Risk:Reward
            <span className="ml-1 text-[#2a2622]">(auto)</span>
          </label>
          <div
            className="h-10 rounded-lg border flex items-center px-4 font-mono font-bold text-xl"
            style={{ backgroundColor: `${rrColor}10`, borderColor: `${rrColor}30`, color: rrColor }}
          >
            {rr > 0 ? `1 : ${rr.toFixed(2)}` : "—"}
          </div>
        </div>
      </div>

      <WizardNav showBack onBack={onBack} />
    </form>
  );
}

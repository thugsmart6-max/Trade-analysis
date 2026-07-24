import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStockResearch extends Document {
  /** Folder-style key, e.g. "TCS" or "Infosys" */
  companyKey: string;
  /** DD-MM-YYYY */
  researchDateKey: string;
  /** Calendar date of the save (local midnight stored as Date) */
  researchDate: Date;
  /** e.g. "TCS/23-07-2026" */
  path: string;
  symbol: string;
  exchange: "NS" | "BO";
  name: string;
  sector: string;
  industry: string;
  lastFetched: Date;
  overview: Record<string, unknown>;
  technical: Record<string, unknown>;
  fundamental: Record<string, unknown>;
  historical: Array<{
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  aiInsights: Array<{
    text: string;
    model: string;
    generatedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const StockResearchSchema = new Schema<IStockResearch>(
  {
    companyKey:      { type: String, required: true },
    researchDateKey: { type: String, required: true },
    researchDate:    { type: Date,   required: true },
    path:            { type: String, required: true },
    symbol:          { type: String, required: true },
    exchange:        { type: String, enum: ["NS", "BO"], default: "NS" },
    name:            { type: String, default: "" },
    sector:          { type: String, default: "" },
    industry:        { type: String, default: "" },
    lastFetched:     { type: Date,   default: null },
    overview:        { type: Schema.Types.Mixed, default: {} },
    technical:       { type: Schema.Types.Mixed, default: {} },
    fundamental:     { type: Schema.Types.Mixed, default: {} },
    historical:  [
      {
        date:   { type: Date   },
        open:   { type: Number },
        high:   { type: Number },
        low:    { type: Number },
        close:  { type: Number },
        volume: { type: Number },
        _id: false,
      },
    ],
    aiInsights: [
      {
        text:        { type: String },
        model:       { type: String },
        generatedAt: { type: Date   },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

// One saved research per company per calendar day
StockResearchSchema.index({ companyKey: 1, researchDateKey: 1 }, { unique: true });
StockResearchSchema.index({ symbol: 1, researchDateKey: 1 });
StockResearchSchema.index({ path: 1 }, { unique: true });

const StockResearch: Model<IStockResearch> =
  mongoose.models.StockResearch ||
  mongoose.model<IStockResearch>("StockResearch", StockResearchSchema);

export default StockResearch;

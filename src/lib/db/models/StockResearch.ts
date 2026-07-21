import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStockResearch extends Document {
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
    symbol:      { type: String, required: true },
    exchange:    { type: String, enum: ["NS", "BO"], default: "NS" },
    name:        { type: String, default: "" },
    sector:      { type: String, default: "" },
    industry:    { type: String, default: "" },
    lastFetched: { type: Date,   default: null },
    overview:    { type: Schema.Types.Mixed, default: {} },
    technical:   { type: Schema.Types.Mixed, default: {} },
    fundamental: { type: Schema.Types.Mixed, default: {} },
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

StockResearchSchema.index({ symbol: 1, exchange: 1 }, { unique: true });

const StockResearch: Model<IStockResearch> =
  mongoose.models.StockResearch ||
  mongoose.model<IStockResearch>("StockResearch", StockResearchSchema);

export default StockResearch;

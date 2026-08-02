import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IStockMovement extends Document {
  product: Types.ObjectId;
  type: "entry" | "exit";
  quantity: number;
  previousStock: number;
  newStock: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type StockMovementType = "entry" | "exit";

const StockMovementSchema = new Schema<IStockMovement>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["entry", "exit"],
      required: [true, "Type is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be greater than zero"],
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note must be at most 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

const StockMovement: Model<IStockMovement> =
  mongoose.models.StockMovement ||
  mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);

export default StockMovement;

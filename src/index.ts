import mongoose from "mongoose";
import { z } from "zod";

const ItemSchema = z.object({
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

type Item = z.infer<typeof ItemSchema>;

const MongooseItemSchema = new mongoose.Schema<Item>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const ItemModel = mongoose.model<Item>("Item", MongooseItemSchema);

export { Item, ItemModel, ItemSchema };

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import StockMovement from "@/models/StockMovement";
import { stockMovementSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product");

    const filter: Record<string, unknown> = {};
    if (productId) {
      if (!mongoose.isValidObjectId(productId)) {
        return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
      }
      filter.product = productId;
    }

    await connectToDatabase();

    const movements = await StockMovement.find(filter)
      .populate("product", "name sku")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(movements);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = stockMovementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productId, type, quantity, note } = parsed.data;

    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.archived) {
      return NextResponse.json(
        { error: "Cannot record a movement on an archived product" },
        { status: 409 }
      );
    }

    const previousStock = product.quantity;

    if (type === "exit" && quantity > previousStock) {
      return NextResponse.json(
        {
          error: `Insufficient stock: ${quantity} requested but only ${previousStock} available`,
        },
        { status: 400 }
      );
    }

    const newStock =
      type === "entry" ? previousStock + quantity : previousStock - quantity;

    product.quantity = newStock;
    await product.save();

    const movement = await StockMovement.create({
      product: productId,
      type,
      quantity,
      previousStock,
      newStock,
      note: note || undefined,
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create movement" },
      { status: 500 }
    );
  }
}

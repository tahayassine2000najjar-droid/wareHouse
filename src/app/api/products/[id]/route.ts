import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { productSchema } from "@/lib/validations";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(id)
      .populate("category", "name description")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await request.json();

    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { categoryId, ...productData } = parsed.data;
    const updateData: Record<string, unknown> = { ...productData };
    if (categoryId) {
      updateData.category = categoryId;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name description")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: "A product with this SKU already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

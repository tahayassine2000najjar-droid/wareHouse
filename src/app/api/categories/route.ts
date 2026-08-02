import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import { categorySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const archived = searchParams.get("archived");
    const filter =
      archived === "true"
        ? { archived: true }
        : archived === "all"
          ? {}
          : { archived: false };

    await connectToDatabase();
    const categories = await Category.find(filter).sort({ name: 1 }).lean();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const category = await Category.create(parsed.data);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

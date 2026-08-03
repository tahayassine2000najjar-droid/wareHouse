import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = registerSchema.omit({ confirmPassword: true }).safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError =
        Object.values(errors)[0]?.[0] || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: result.data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    await User.create({
      name: result.data.name,
      email: result.data.email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

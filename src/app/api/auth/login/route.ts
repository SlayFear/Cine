import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { ADMIN_COOKIE_NAME, signAdminToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos invalidos" }, { status: 400 });
  }

  await connectDB();

  const admin = await Admin.findOne({ email: parsed.data.email.toLowerCase() });
  const passwordOk = admin ? await bcrypt.compare(parsed.data.password, admin.passwordHash) : false;

  if (!admin || !passwordOk) {
    return NextResponse.json({ ok: false, error: "Correo o contrasena incorrectos" }, { status: 401 });
  }

  const token = await signAdminToken({ sub: admin._id.toString(), email: admin.email });

  const response = NextResponse.json({ ok: true, email: admin.email });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}

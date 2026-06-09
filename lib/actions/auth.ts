"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(80).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  tradingFocus: z.enum(["forex", "crypto", "stocks", "mixed"]).default("forex"),
});

export type SignupResult = { ok: true } | { ok: false; error: string };

export async function registerUser(formData: FormData): Promise<SignupResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
    tradingFocus: formData.get("tradingFocus") ?? "forex",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const { name, email, password, tradingFocus } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      name: name || null,
      hashedPassword,
      tradingFocus,
    },
  });

  return { ok: true };
}

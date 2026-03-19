"use server";

import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "auth_token";
const SALT = "wwa-journal-salt-v1";

function hashPassword(password: string): string {
  return createHmac("sha256", SALT).update(password).digest("hex");
}

function createToken(password: string): string {
  const hash = hashPassword(password);
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", hash).update(timestamp).digest("hex");
  return `${hash}.${timestamp}.${signature}`;
}

function verifyToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [hash, timestamp, signature] = parts;
  const expectedSignature = createHmac("sha256", hash)
    .update(timestamp)
    .digest("hex");

  if (signature !== expectedSignature) return false;

  // Token valid for 30 days
  const tokenAge = Date.now() - parseInt(timestamp);
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return tokenAge < thirtyDays;
}

export async function login(password: string): Promise<boolean> {
  const envPassword = process.env.AUTH_PASSWORD;
  if (!envPassword) {
    console.error("AUTH_PASSWORD not set in environment");
    return false;
  }

  if (password !== envPassword) {
    return false;
  }

  const token = createToken(password);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  if (!token) return false;

  return verifyToken(token.value);
}

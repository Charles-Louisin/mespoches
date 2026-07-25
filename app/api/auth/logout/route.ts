import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/server/session-cookies';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}

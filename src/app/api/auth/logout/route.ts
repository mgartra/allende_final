// src/app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
    const response = NextResponse.redirect(new URL('/', req.url));
    clearSession(response);
    return response;
}
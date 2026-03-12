// app/api/analytics/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getAnalyticsData } from '@/lib/data/analytics';
import { getUserFromSession } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
    const user = await getUserFromSession(request);

    if (!user || !(user.type === 'root' || (user.type === 'user' && user.userType === 'librarian'))) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const data = await getAnalyticsData();
    return NextResponse.json(data);
}
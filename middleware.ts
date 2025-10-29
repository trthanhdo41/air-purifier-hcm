import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware temporarily disabled - auth check handled in page level
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};


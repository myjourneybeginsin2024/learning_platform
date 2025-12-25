import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // For public routes, always allow access
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // For protected routes, allow the request to proceed to the client
  // where the actual authentication check will happen via ProtectedRoute component
  return NextResponse.next();
}

// Helper function to check if the route is public
function isPublicRoute(pathname: string): boolean {
  // Public routes are '/', '/login', '/register', and their sub-routes
  return ['/', '/login', '/register', '/auth/callback'].some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
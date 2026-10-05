import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Simple JWT decoder for Edge Runtime
function parseJwt(token: string) {
  try {
    // JWT has 3 parts: header, payload, signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/, '/');
    // atob is available in Edge Runtime
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
 
const publicRoutes = ['/login', '/signup', '/']
 
export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = path.startsWith('/dashboard')
  const isPublicRoute = publicRoutes.includes(path)
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // Validate the token if it exists
  let isValidToken = false;
  if (token) {
    const payload = parseJwt(token);
    if (payload && payload.exp) {
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp > currentTime) {
        isValidToken = true;
      }
    } else if (payload && !payload.exp) {
      // If it's a valid JWT but has no exp, consider it valid but warn
      isValidToken = true;
    }
  }

  // Redirect to / if the user is trying to access a protected route without a valid token
  if (isProtectedRoute && !isValidToken) {
    const response = NextResponse.redirect(new URL('/', request.nextUrl));
    // Clear the malformed/expired token
    if (token) {
      response.cookies.delete('token');
    }
    return response;
  }
 
  // Redirect to /dashboard if the user is authenticated and on a public auth route
  if (isPublicRoute && isValidToken && !path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
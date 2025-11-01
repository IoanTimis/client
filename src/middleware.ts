import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasAuthCookie = Boolean(
      req.cookies.get('accessToken')?.value ||
      req.cookies.get('refreshToken')?.value ||
      req.cookies.get('auth')?.value ||
      req.cookies.get('session')?.value
  );
  console.log('Middleware invoked for:', pathname);
  console.log('Auth cookies present:', hasAuthCookie);
  // console.log('Cookies:', req.cookies);

  console.log(req.cookies.get('accessToken')?.value);
  console.log(req.cookies.get('accessToken'));
  console.log(req.cookies.get('refreshToken')?.value);
  console.log(req.cookies.get('refreshToken'));
  console.log(req.cookies.getAll());

  // Protect /user/* routes
  if (pathname.startsWith('/user')) {
    if (!hasAuthCookie) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      // Preserve intended destination
      const nextPath = pathname + (req.nextUrl.search || '');
      url.searchParams.set('next', nextPath);
      return NextResponse.redirect(url);
    }
  }

  // Enforce vendor role for dashboard routes
  if (pathname.startsWith('/user/dashboard')) {
    try {
      const refresh = req.cookies.get('refreshToken')?.value;
      if (!refresh) {
        const url = req.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
      const { payload } = await jwtVerify(refresh, secret);
      const role = (payload as any)?.role;
      if (role !== 'vendor') {
        const url = req.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    } catch (e) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Prevent logged-in users from visiting /auth/*
  if (pathname.startsWith('/auth')) {
    if (hasAuthCookie) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Protect /admin/* and enforce admin role
  if (pathname.startsWith('/admin')) {
    // If not logged in at all, send to login and preserve intended destination
    if (!hasAuthCookie) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      const nextPath = pathname + (req.nextUrl.search || '');
      url.searchParams.set('next', nextPath);
      return NextResponse.redirect(url);
    }

    try {
      const refresh = req.cookies.get('refreshToken')?.value;
      if (!refresh) {
        const url = req.nextUrl.clone();
        url.pathname = '/403';
        return NextResponse.redirect(url);
      }

      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
      const { payload } = await jwtVerify(refresh, secret);
      const role = (payload as any)?.role;

      if (role !== 'admin') {
        const url = req.nextUrl.clone();
        url.pathname = '/403';
        return NextResponse.redirect(url);
      }
    } catch (e) {
      const url = req.nextUrl.clone();
      url.pathname = '/403';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Limit to relevant routes.
export const config = {
  matcher: [
    '/user/:path*',
    '/auth/:path*',
    '/admin/:path*',
  ],
};

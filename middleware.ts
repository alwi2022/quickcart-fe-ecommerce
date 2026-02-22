// middleware.js
import { NextResponse } from 'next/server';

const PROTECTED = ['/checkout', '/profile', '/my-orders', '/wishlist', '/cart', '/seller'];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  // Jangan guard /login atau /register
  const needsAuth = PROTECTED.some(p => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get('gt_auth')?.value;
  if (!token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/checkout/:path*', '/profile/:path*', '/my-orders/:path*', '/wishlist/:path*', '/cart/:path*', '/seller/:path*'],
};

import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if we are on a country page
    if (pathname.startsWith('/country/')) {
        // 1. Convert to lowercase
        // 2. Replace spaces (%20) with hyphens
        // 3. Remove multiple hyphens
        const cleanPath = pathname
            .toLowerCase()
            .replace(/%20/g, '-')
            .replace(/\s/g, '-')
            .replace(/-+/g, '-');

        // If the path has changed, redirect to the clean version
        if (pathname !== cleanPath) {
            const url = request.nextUrl.clone();
            url.pathname = cleanPath;
            return NextResponse.redirect(url, 301);
        }
    }

    return NextResponse.next();
}

// Only run middleware on country routes
export const config = {
    matcher: '/country/:path*',
};

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Role } from './lib/enums'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {

    const cookie = request.cookies.get('token')?.value
    const role = request.cookies.get('role')?.value

    const url = request.nextUrl.pathname

    const isSignedIn = (cookie && role) ? true : false

    // if user is not signed in and tries to access any other page, redirect to home page
    if (!isSignedIn && url !== '/') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // if user is signed in and tries to access home page, redirect to dashboard
    if (isSignedIn && url === '/') {
        if (role === Role.EMPLOYEE) {
            return NextResponse.redirect(new URL('/attendance', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If an employee tries to access dashboard, redirect to attendance
    if (isSignedIn && url.startsWith('/dashboard') && role === Role.EMPLOYEE) {
        return NextResponse.redirect(new URL('/attendance', request.url))
    }

    // If an admin tries to access attendance, redirect to dashboard
    if (isSignedIn && url.startsWith('/attendance') && role !== Role.EMPLOYEE) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
}


export const config = {
    matcher: [
        /*
          Example:
          - '/dashboard' matches exactly /dashboard
          - '/dashboard/:path*' matches /dashboard and all sub-paths like /dashboard/settings
        */
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ],
}



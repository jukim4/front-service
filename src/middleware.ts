import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // console.log('middleware 동작함');

    const token = request.cookies.get('token')?.value; // cookie에 저장된 토큰
    const path = request.nextUrl.pathname;

    const isProtected = 
        path.startsWith('/portfolio') ||
        path.startsWith('/investments') ||
        path.startsWith('/mypage');

    if (isProtected && !token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 로그인 성공 시 /login, /signup 접근 제한
    if (token && (path === '/login' || path === '/signup')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

        
    return NextResponse.next();
}

export const config = {
    matcher: ['/portfolio/:path*', '/investments/:path*', '/mypage/:path*', '/login', '/signup'],
}
import NextAuth from 'next-auth'
export {default} from "next-auth/middleware"

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.png|presentation).*)'],
}
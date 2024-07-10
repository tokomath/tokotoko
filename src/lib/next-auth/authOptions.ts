import CredentialsProvider from 'next-auth/providers/credentials'
import {randomUUID, randomBytes} from 'crypto'
import axios from "axios";
import {prisma} from "@/app/api/prisma_client";

export const authOptions = {
  providers: [
    // ユーザ用認証
    CredentialsProvider({
      id: 'user',
      name: 'User',
      credentials: {
        username: {label: 'Username', type: 'text', placeholder: 'jsmith'},
        password: {label: 'Password', type: 'password'}
      },
      async authorize(credentials: any) {
        const user = await prisma.student.findUnique({where: {name: credentials.username}})
        if (user && credentials.password === user.pass) {
          return {id: user.id.toString(), name: user.name}
        } else {
          return null
        }
      },
    }),
  ],

  /* callbacks */
  callbacks: {
    authorized({auth, request: {nextUrl}} : any) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
  },

  /* secret */
  secret: process.env.NEXTAUTH_SECRET,

  /* jwt */
  jwt: {
    maxAge: 3 * 24 * 60 * 60,       // 3 days 
  },

  /* session */
  session: {
    maxAge: 30 * 24 * 60 * 60,      // 30 days
    updateAge: 24 * 60 * 60,        // 24 hours
    generateSessionToken: () => {
      return randomUUID?.() ?? randomBytes(32).toString("hex")
    }
  },
}

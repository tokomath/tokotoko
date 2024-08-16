import CredentialsProvider from 'next-auth/providers/credentials'
import { randomUUID, randomBytes } from 'crypto'
import { prisma } from "@/app/api/prisma_client"
import { signIn } from 'next-auth/react';

export const authOptions = {
  providers: [
    // ユーザ用認証
    CredentialsProvider({
      id: 'user',
      name: 'User',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      // @ts-ignore TODO
      async authorize(credentials: any) {
        const user = await prisma.user.findUnique({ where: { name: credentials.username } })
        if (user && credentials.password === user.pass) {
          return { id: user.id, name: user.name, role: user.role }
        } else {
          return null
        }
      },
    }),
  ],

  /* callbacks */
  callbacks: {
    /*
    async session(session, user) {
      session.user = user;
      return session;
    },

    async jwt(token: any) {
      console.log(token)
      return token;
    }
    */
  },

  /* secret */
  secret: process.env.NEXTAUTH_SECRET,

  /* jwt */
  jwt: {
    maxAge: 3 * 24 * 60 * 60,       // 3 days 
  },

  pages: {
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
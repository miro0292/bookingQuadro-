import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '../../../lib/prisma'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Propietario',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contrasena', type: 'password' }
      },
      async authorize(credentials) {
        const email = (credentials?.email || '').toLowerCase().trim()
        const password = credentials?.password || ''

        const ownerEmail = (process.env.OWNER_EMAIL || 'host@quadro.local').toLowerCase()
        const ownerPassword = process.env.OWNER_PASSWORD || 'host123'
        if (email !== ownerEmail || password !== ownerPassword) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || user.role !== 'host') return null

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || ''
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') return true

      const email = (user?.email || '').toLowerCase().trim()
      if (!email) return false

      await prisma.user.upsert({
        where: { email },
        update: {
          name: user?.name || undefined,
          image: user?.image || undefined
        },
        create: {
          email,
          name: user?.name || 'Guest User',
          image: user?.image || null,
          role: 'guest'
        }
      })

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || token.role || 'guest'
        token.userId = user.id || token.userId
      }

      if ((!token.role || !token.userId) && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: String(token.email).toLowerCase() } })
        if (dbUser) {
          token.role = dbUser.role
          token.userId = String(dbUser.id)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role || 'guest'
        session.user.id = token.userId ? String(token.userId) : undefined
      }
      return session
    }
  }
}

export default NextAuth(authOptions)

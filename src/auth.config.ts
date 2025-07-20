import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

// Extend the User type to include backendToken
declare module 'next-auth' {
  interface User {
    backendToken?: string | undefined
    isAdmin?: boolean
    id: string
    name?: string
    email?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      httpOptions: { timeout: 30000 }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
      
        const body = { email: credentials.email, password: credentials.password }; // send only these
      
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/backend-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      
        const data = await res.json();
        console.log("AUTH: login response", data);
      
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Login failed');
        }
      
        // make sure data.token exists
        if (!data.token) {
          console.error("AUTH: backend returned no token!");
        }
      
        return {
          id: data.user.id,
          name: data.user.username || data.user.email,
          email: data.user.email,
          isAdmin: data.user.isAdmin,
          backendToken: data.token,   // <-- captured here
        };
      
      },
    }),
  ],
  pages: {
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.name }),
          })
          const data = await res.json()
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Google authentication failed')
          }
          // Attach custom fields to user object for jwt callback
          user.id = data.user.id
          user.isAdmin = data.user.isAdmin
          user.name = data.user.name
          user.email = data.user.email
          user.backendToken = data.token
          return true
        } catch (error) {
          console.error('google sign in error', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? ''
        token.isAdmin = user.isAdmin
        token.name = user.name
        token.email = user.email
        token.backendToken = user.backendToken ?? "" // <-- include token
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.isAdmin = token.isAdmin
        session.user.name = token.name
        session.user.email = token.email
        session.user.backendToken = token.backendToken // <-- include token
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge:30*24*60*60,
    updateAge:24*60*60
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}
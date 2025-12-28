import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Call your Backend API
          const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          // Extract user and token
          const user = res.data.user;
          const token = res.data.token;

          // If login success, return user object with token merged in
          if (user && token) {
            // Because of our d.ts file, TS knows 'accessToken' is allowed on User
            return { ...user, accessToken: token };
          }
          return null;
        } catch (error) {
          console.error("Login Failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // 1. Save backend token into NextAuth JWT (cookie)
    // We explicitly type the arguments using the imported types
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.name = user.name || "";
        token.email = user.email || "";
      }
      return token;
    },
    // 2. Make token available to the React frontend (useSession / useAxiosAuth)
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", 
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
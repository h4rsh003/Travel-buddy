import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const handler = NextAuth({
  providers: [
    // 1. Email/Password Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Call your Backend API
          const res = await axios.post("http://localhost:5000/api/auth/login", {
            email: credentials?.email,
            password: credentials?.password,
          });

          const user = res.data.user;
          const token = res.data.token;

          // If login success, return user object with token
          if (user && token) {
            return { ...user, accessToken: token };
          }
          return null;
        } catch (error) {
          console.error("Login Failed:", error);
          return null;
        }
      },
    }),
    // Google Provider will go here later...
  ],
  callbacks: {
    // Save backend token into NextAuth token
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },
    // Make token available to the React frontend
    async session({ session, token }: any) {
      session.user = {
        ...session.user,
        accessToken: token.accessToken as string,
        id: token.id as number,
      } as any;
      return session;
    },
  },
  pages: {
    signIn: "/login", // Redirect here if auth fails
  },
  secret: process.env.NEXTAUTH_SECRET, // Mandatory for security
});

export { handler as GET, handler as POST };
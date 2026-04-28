import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findJuryAccountByEmail, verifyPasswordHash } from "@/features/jury/server/auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      email: string;
      juryApplicationId?: string;
      expertiseAreas: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    juryApplicationId?: string;
    expertiseAreas: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    juryApplicationId?: string;
    expertiseAreas?: string[];
  }
}

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    "beauty-web-dev-jury-auth-secret",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/jury/login",
  },
  providers: [
    CredentialsProvider({
      name: "Jury Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const account = await findJuryAccountByEmail(email);

        if (!account) {
          return null;
        }

        const isValid = await verifyPasswordHash(password, account.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: account.id,
          email: account.email,
          juryApplicationId: account.juryApplicationId ?? undefined,
          expertiseAreas: account.juryApplication?.expertiseAreas ?? [],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.juryApplicationId = user.juryApplicationId;
        token.expertiseAreas = user.expertiseAreas;
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.id || !token.email) {
        return session;
      }

      session.user = {
        ...session.user,
        id: token.id,
        email: token.email,
        juryApplicationId: token.juryApplicationId,
        expertiseAreas: token.expertiseAreas ?? [],
      };

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return `${baseUrl}/`;
    },
  },
};

export const authHandler = NextAuth(authOptions);

export function getAppSession() {
  return getServerSession(authOptions);
}

import type { DataScope } from "@prisma/client";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findAccountForPublicAuth } from "@/features/account/server/accounts";
import { normalizeAccountEmail, verifyPasswordHash } from "@/features/account/server/password";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      accountId: string;
      email: string;
      role: "APPLICANT" | "JURY";
      dataScope: DataScope;
      applicantProfileId?: string;
      juryProfileId?: string;
    };
  }

  interface User {
    id: string;
    accountId: string;
    email: string;
    role: "APPLICANT" | "JURY";
    dataScope: DataScope;
    applicantProfileId?: string;
    juryProfileId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId?: string;
    email?: string;
    role?: "APPLICANT" | "JURY";
    dataScope?: DataScope;
    applicantProfileId?: string;
    juryProfileId?: string;
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
    signIn: "/account/login",
  },
  providers: [
    CredentialsProvider({
      name: "IBPA Account",
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
        const email = normalizeAccountEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const account = await findAccountForPublicAuth(email);

        if (
          !account ||
          account.deletedAt ||
          account.status === "DISABLED" ||
          !account.passwordHash
        ) {
          return null;
        }

        const isValid = await verifyPasswordHash(password, account.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: account.id,
          accountId: account.id,
          email: account.email,
          role: account.role,
          dataScope: account.dataScope,
          applicantProfileId: account.applicantProfile?.id,
          juryProfileId: account.juryProfile?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accountId = user.accountId;
        token.email = user.email;
        token.role = user.role;
        token.dataScope = user.dataScope;
        token.applicantProfileId = user.applicantProfileId;
        token.juryProfileId = user.juryProfileId;
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.accountId || !token.email || !token.role) {
        return session;
      }

      session.user = {
        ...session.user,
        accountId: token.accountId,
        email: token.email,
        role: token.role,
        dataScope: token.dataScope ?? "PRODUCTION",
        applicantProfileId: token.applicantProfileId,
        juryProfileId: token.juryProfileId,
      };

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === `${baseUrl}/account` || url === "/account") {
        return `${baseUrl}/account`;
      }

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

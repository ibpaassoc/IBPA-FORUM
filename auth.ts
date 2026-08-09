import type { DataScope } from "@prisma/client";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  findAccountForPublicAuth,
  findAccountForSessionRoleSwitch,
} from "@/features/account/server/accounts";
import { normalizeAccountEmail, verifyPasswordHash } from "@/features/account/server/password";
import { parsePublicAccountRole, toAccountRole } from "@/features/auth/lib/role";

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

const useSecureSessionCookie = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  // The database cutover introduced a production NEXTAUTH_SECRET. Sessions
  // minted before that change cannot be decrypted, and Server Components cannot
  // reliably forward NextAuth's cleanup cookie. Use a versioned cookie name so
  // stale tokens are ignored instead of logging JWT_SESSION_ERROR on every page.
  cookies: {
    sessionToken: {
      name: `${useSecureSessionCookie ? "__Secure-" : ""}ibpa.session-token.v2`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureSessionCookie,
      },
    },
  },
  pages: {
    signIn: "/login",
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
        role: {
          label: "Account type",
          type: "text",
        },
      },
      async authorize(credentials) {
        const email = normalizeAccountEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const account = await findAccountForPublicAuth(
          email,
          toAccountRole(parsePublicAccountRole(String(credentials?.role ?? ""))),
        );

        if (
          !account ||
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
    CredentialsProvider({
      id: "account-switch",
      name: "Account switch",
      credentials: {
        role: {
          label: "Account type",
          type: "text",
        },
      },
      async authorize(credentials) {
        const session = await getServerSession(authOptions);
        const accountId = session?.user?.accountId;

        if (!accountId) {
          return null;
        }

        const account = await findAccountForSessionRoleSwitch({
          accountId,
          targetRole: toAccountRole(parsePublicAccountRole(String(credentials?.role ?? ""))),
        });

        if (!account) {
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

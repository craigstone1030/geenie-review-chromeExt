/* eslint-disable @typescript-eslint/no-explicit-any */
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import type { Subscription, UserRole } from "@prisma/client";
import { createTransport } from "nodemailer";

export const emailServer = {
  server: {
    host: env.EMAIL_SERVER_HOST,
    port: parseInt(env.EMAIL_SERVER_PORT),
    auth: {
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
  },
  from: process.env.EMAIL_FROM,
} as const;

type ModifiedUser = {
  id: string;
  role: UserRole;
  createdAt: string;
  subscriptionId: string | null;
  sentEnterprise: boolean;
  subscription?: Subscription | null;
  allowed: boolean | "Expired";
  sentEmail: boolean;
};
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: ModifiedUser & DefaultSession["user"];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface User extends Omit<ModifiedUser, "paid" | "expired"> {}
}

export const verifyFree = (
  id?: string | null,
  _createdAt?: string,
  admin?: boolean
) => {
  if (!admin && !id) {
    if (_createdAt) {
      const createdAt = new Date(_createdAt);
      const now = new Date();
      const diff = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      if (diffDays > 7) {
        return "Expired";
      }
      return false;
    }
  }
  return admin ? true : !!id;
};

const getFullName = (str: string): { first: string; last: string } => {
  if (str.includes(" ")) {
    const [first, last] = str.split(" ");
    return { first, last } as any;
  }
  const [first, last] = str.match(/([A-Z]?[^A-Z]*)/g) ?? [];
  return { first, last } as any;
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role =
          user.role === "ADMIN"
            ? "ADMIN"
            : user.email?.endsWith("@deqa.io") ||
              user.email?.endsWith("@geenie.ai")
            ? "ADMIN"
            : "USER";
        session.user.createdAt = user.createdAt;
        session.user.subscriptionId = user.subscriptionId;
        session.user.sentEnterprise = user.sentEnterprise;
        session.user.subscription = user.subscription ?? null;
        session.user.allowed = verifyFree(
          user.subscriptionId,
          user.createdAt,
          user.role === "ADMIN"
        );
        session.user.sentEmail = user.sentEmail;
        const lastLogin = new Date();
        const data = user.sentEmail
          ? {
              lastLogin,
            }
          : {
              sentEmail: true,
              lastLogin,
            };
        if (!user.sentEmail) {
          const { first, last } = getFullName(user.name ?? "");
          const transport = createTransport(emailServer.server);
          await transport.sendMail({
            subject: "User has requested to join Geenie Reviewsify",
            text: `App: reviews.geenie.ai
First name: ${first}
Last name: ${last}
Email: ${user.email ?? "N/A"}`,
            to: "info@geenie.ai",
            from: emailServer.from,
          });
        }
        await prisma.user.update({
          where: { id: user.id },
          data,
        });
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider(emailServer),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "database",
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    updateAge: 24 * 60 * 60, // 24 hours
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session && (session.user.createdAt as string | Date) instanceof Date) {
    return {
      ...session,
      user: {
        ...session.user,
        createdAt: (session.user.createdAt as unknown as Date).toISOString(),
      },
    };
  }
  return session;
};

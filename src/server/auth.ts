import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "~/server/db";
import { env } from "~/env.mjs";
import type { GlobalRole, MemberRole } from "@prisma/client";
import loginSchema from "~/schemas/login";
import { TRPCError } from "@trpc/server";
import { verify } from "argon2";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      orgId?: string;
      role: GlobalRole;
      memberRole?: MemberRole;
    } & DefaultSession["user"];
  }

  interface User {
    orgId?: string;
    role: GlobalRole;
    memberRole?: MemberRole;
  }
}

declare module "next-auth/jwt" {
  interface DefaultJWT {
    id: string;
    orgId?: string;
    role: GlobalRole;
    memberRole?: MemberRole;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.orgId = user.orgId;
        token.role = user.role;
        token.memberRole = user.memberRole;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
      }

      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    newUser: "/dashboard/setup",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "timetable@pro.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const creds = await loginSchema.parseAsync(credentials);

        const user = await prisma.user.findFirst({
          where: { email: creds.email },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `User not found`,
          });
        }

        const isValidPassword = await verify(user.password, creds.password);

        if (!isValidPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid password",
          });
        }

        return {
          id: user.id,
          email: user.email,
          orgId: user.organizationId ?? undefined,
          role: user.globalRole,
          memberRole: user.memberRole ?? undefined,
        };
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

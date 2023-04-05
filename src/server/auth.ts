import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "~/server/db";
import { env } from "~/env.mjs";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { GlobalRole } from "@prisma/client";

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
      role: GlobalRole;
      // ...other properties
    } & DefaultSession["user"];
  }

  interface User {
    role: GlobalRole;
    // ...other properties
  }
}

declare module "next-auth/jwt" {
  interface DefaultJWT {
    id: string;
    role: GlobalRole;
    idToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {

      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      return token;
    },
    session({ session, token, user }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/test",
    error: "/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const user = await prisma.user.findFirst({
          where: { id: "1" },
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          role: user.globalRole,
          email: user.email,
          username: user.username,
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

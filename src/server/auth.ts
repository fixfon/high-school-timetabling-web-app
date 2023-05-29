import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions } from "next-auth";
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
  interface User {
    name: string;
    surname: string;
    image?: string;
    orgId?: string;
    role: GlobalRole;
    memberRole?: MemberRole;
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface DefaultJWT {
    id: string;
    surname: string;
    image?: string;
    orgId?: string;
    role: GlobalRole;
    memberRole?: MemberRole;
  }
}

type JwtSession = {
  user: {
    name: string;
    surname: string;
    image?: string;
  };
};

export const authOptions: NextAuthOptions = {
  callbacks: {
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    jwt({ token, user, trigger, session }) {
      const updateSess = session as JwtSession;
      if (trigger === "update" && updateSess?.user) {
        token.name = updateSess?.user.name;
        token.surname = updateSess?.user.surname;
        token.image = updateSess?.user.image;
      } else if (user) {
        token.id = user.id;
        token.name = user.name;
        token.surname = user.surname;
        token.image = user.image;
        token.orgId = user.orgId;
        token.role = user.role;
        token.memberRole = user.memberRole;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name ?? "";
        session.user.surname = token.surname;
        session.user.image = token.image;
        session.user.orgId = token.orgId;
        session.user.role = token.role;
        session.user.memberRole = token.memberRole;
      }

      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
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
          name: user.name,
          surname: user.surname,
          image: user.image ?? undefined,
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

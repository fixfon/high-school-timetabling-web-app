import registerSchema from "~/schemas/register";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { hash } from "argon2";

export const registerRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        email,
        password,
        confirmPassword,
        name,
        surname,
        organization,
        phone,
      } = input;

      const checkUser = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (checkUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      if (password !== confirmPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Passwords do not match",
        });
      }

      const hashedPassword = await hash(password);

      const user = await ctx.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          surname,
          globalRole: "ORGMEMBER",
          memberRole: "MANAGER",
          Organization: {
            create: {
              name: organization,
              contact: phone,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      return {
        status: "ok",
        email: user.email,
        password: password,
      };
    }),
});

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import userSchema from "~/schemas/user";
import { hash } from "argon2";

export const organizationRouter = createTRPCRouter({
  getOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const organizationRes = await ctx.prisma.organization.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        OrganizationManager: true,
      },
    });

    if (!organizationRes) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find organizations",
      });
    }

    return {
      organizations: organizationRes,
    };
  }),

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const userRes = await ctx.prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        OrganizationManager: true,
        OrganizationMember: true,
        Teacher: true,
      },
    });

    if (!userRes) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find users",
      });
    }

    return {
      users: userRes,
    };
  }),

  updateOrganization: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        phone: z.string().length(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { role, memberRole } = ctx.session.user;
      const { organizationId, name, description, phone } = input;

      if (role !== "SUPERADMIN" || memberRole !== "MANAGER") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const organizationRes = await ctx.prisma.organization.update({
        where: {
          id: organizationId,
        },
        data: {
          name: name || undefined,
          description: description || undefined,
          contact: phone || undefined,
        },
      });

      console.log("updatedOrg", organizationRes);

      if (!organizationRes) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not update organization",
        });
      }

      return {
        success: true,
      };
    }),

  updateUser: protectedProcedure
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {
      const { role } = ctx.session.user;

      if (role !== "SUPERADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const { id, email, password, name, surname } = input;

      const foundUser = await ctx.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!foundUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not find user",
        });
      }

      let hashedPassword = undefined;

      if (password) hashedPassword = await hash(password);

      const userRes = await ctx.prisma.user.update({
        where: {
          id,
        },
        data: {
          email: email || undefined,
          password: hashedPassword || undefined,
          name: name || undefined,
          surname: surname || undefined,
        },
      });

      return {
        success: true,
      };
    }),

  deleteOrganization: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { role, memberRole } = ctx.session.user;
      const { organizationId } = input;

      if (role === "ORGMEMBER" && memberRole === "TEACHER") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const organizationRes = await ctx.prisma.organization.delete({
        where: {
          id: organizationId,
        },
      });

      if (!organizationRes) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not delete organization",
        });
      }

      return {
        success: true,
      };
    }),

  deleteUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { role } = ctx.session.user;

      if (role !== "SUPERADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const { userId } = input;

      // check if user is a manager of an organization and delete the organization?
      const userRes = await ctx.prisma.user.delete({
        where: {
          id: userId,
        },
      });

      if (!userRes) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not delete user",
        });
      }

      return {
        success: true,
      };
    }),
});

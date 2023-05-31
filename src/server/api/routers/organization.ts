import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import userSchema from "~/schemas/user";
import { hash } from "argon2";
import organizationSchema from "~/schemas/organization";
import calculateOrgClassHours from "~/utils/calculate-org-class-hours";

export const organizationRouter = createTRPCRouter({
  getOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const organizationRes = await ctx.prisma.organization.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        OrganizationManager: true,
        OrganizationClassHour: true,
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

  getOrganization: protectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx.session.user;

    if (!orgId) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "You must be a member of an organization to view it",
      });
    }

    const organizationRes = await ctx.prisma.organization.findFirst({
      where: {
        id: orgId,
      },
      include: {
        OrganizationClassHour: true,
      },
    });

    if (!organizationRes) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find the organization",
      });
    }

    return {
      organization: organizationRes,
    };
  }),

  getOrganizationClassHours: protectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx.session.user;

    if (!orgId) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "You must be a member of an organization to view it",
      });
    }

    const orgClassHour = await ctx.prisma.organizationClassHour.findFirst({
      where: {
        organizationId: orgId,
      },
    });

    if (!orgClassHour) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find the organization class hours",
      });
    }

    const orgDailyHourMap = calculateOrgClassHours({
      startHour: orgClassHour.startHour,
      breakTime: orgClassHour.breakMinute,
      lunchTime: orgClassHour.lunchMinute,
    });

    return {
      orgDailyHourMap,
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

  getUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = input;

      const userRes = await ctx.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userRes) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not find user",
        });
      }

      return {
        user: userRes,
      };
    }),

  updateOrganization: protectedProcedure
    .input(organizationSchema)
    .mutation(async ({ ctx, input }) => {
      const { role, memberRole } = ctx.session.user;
      const {
        id: organizationId,
        name,
        contact,
        description,
        startHour,
        breakMinute,
        lunchMinute,
      } = input;

      if (role !== "SUPERADMIN" && memberRole !== "MANAGER") {
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
          contact: contact || undefined,
          OrganizationClassHour: {
            upsert: {
              update: {
                startHour: startHour || undefined,
                breakMinute: breakMinute || undefined,
                lunchMinute: lunchMinute || undefined,
              },
              create: {
                startHour: startHour || "09:00",
                breakMinute: breakMinute || 10,
                lunchMinute: lunchMinute || 40,
              },
            },
          },
        },
      });

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
      const { role, id: sessionUserId } = ctx.session.user;

      const { id, email, password, name, surname, imageUrl } = input;

      if (sessionUserId !== id && role !== "SUPERADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

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

      const updatedUser = await ctx.prisma.user.update({
        where: {
          id,
        },
        data: {
          email: email || undefined,
          password: hashedPassword || undefined,
          name: name || undefined,
          surname: surname || undefined,
          image: imageUrl !== undefined ? imageUrl : undefined,
        },
      });

      return {
        updatedUser: updatedUser,
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

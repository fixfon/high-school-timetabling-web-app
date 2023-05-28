import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

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

  editOrganization: protectedProcedure
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
});

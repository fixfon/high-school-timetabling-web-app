import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import departmentSchema from "~/schemas/department";

export const departmentRouter = createTRPCRouter({
  getDepartments: protectedProcedure.query(async ({ ctx }) => {
    const departmentRes = await ctx.prisma.department.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!departmentRes) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find departments",
      });
    }

    return {
      departments: departmentRes,
    };
  }),

  createDepartment: protectedProcedure
    .input(departmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { role } = ctx.session.user;

      if (role !== "SUPERADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const { name } = input;

      const departmentRes = await ctx.prisma.department.create({
        data: {
          name: name,
        },
      });

      if (!departmentRes) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create department",
        });
      }

      return {
        department: departmentRes,
      };
    }),

  deleteDepartment: protectedProcedure
    .input(
      z.object({
        departmentId: z.string(),
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

      const { departmentId } = input;

      const departmentRes = await ctx.prisma.department.delete({
        where: {
          id: departmentId,
        },
      });

      if (!departmentRes) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not delete department",
        });
      }

      return {
        success: true,
      };
    }),
});

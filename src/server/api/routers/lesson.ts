import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import lessonSchema from "~/schemas/lesson";
import { z } from "zod";

export const lessonRouter = createTRPCRouter({
  getLessons: protectedProcedure.query(async ({ ctx }) => {
    const lessonRes = await ctx.prisma.lesson.findMany({
      include: {
        department: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!lessonRes) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find lessons",
      });
    }

    return {
      lessons: lessonRes,
    };
  }),

  createLesson: protectedProcedure
    .input(lessonSchema)
    .mutation(async ({ ctx, input }) => {
      const { role } = ctx.session.user;

      if (role !== "SUPERADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete lessons",
        });
      }

      const foundDepartment = await ctx.prisma.department.findUnique({
        where: {
          id: input.departmentId,
        },
      });

      if (!foundDepartment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Department does not exist",
        });
      }

      const { name, code, type, departmentId, description } = input;

      await ctx.prisma.lesson
        .create({
          data: {
            name,
            code: code || "",
            type,
            description: description || undefined,
            departmentId,
          },
        })
        .catch(() => {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Error creating lesson",
          });
        });

      return {
        success: true,
      };
    }),

  deleteLesson: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { lessonId } = input;
      const { role } = ctx.session.user;

      if (role !== "SUPERADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete lessons",
        });
      }

      return await ctx.prisma.lesson.delete({
        where: {
          id: lessonId,
        },
      });
    }),
});

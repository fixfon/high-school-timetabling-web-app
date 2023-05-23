import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type Branch, ClassLevel } from "@prisma/client";
import classroomSchema from "~/schemas/classroom";
import { TRPCError } from "@trpc/server";

export const classroomRouter = createTRPCRouter({
  getClassrooms: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.session.user.orgId;

    if (!orgId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    const classrooms = await ctx.prisma.classroom.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        ClassroomLesson: {
          include: {
            Lesson: true,
          },
        },
        Teacher: true,
      },
    });

    return {
      classrooms: classrooms,
    };
  }),

  getClassroom: protectedProcedure
    .input(
      z.object({
        classroomId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      // const classrooms = await ctx.prisma.classRoom.findMany({
      //   where: {
      //     organizationId: "1",
      //   },
      // });

      return {
        success: true,
      };
    }),

  createClassroom: protectedProcedure
    .input(classroomSchema)
    .mutation(async ({ input, ctx }) => {
      const { classLevel, code, branch, advisorTeacherId, lessons } = input;
      const organizationId = ctx.session.user.orgId;

      if (!organizationId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      // check existing class level and code match on this organization
      const foundClassroom = await ctx.prisma.classroom.findFirst({
        where: {
          organizationId,
          classLevel,
          code,
        },
      });

      if (!!foundClassroom) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Classroom already exists",
        });
      }

      // check if the advisor teacher is assigned to another class
      if (advisorTeacherId && advisorTeacherId !== "") {
        const foundTeacher = await ctx.prisma.teacher.findFirst({
          where: {
            organizationId,
            id: advisorTeacherId,
          },
        });

        if (!foundTeacher) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Advisor teacher not found",
          });
        }

        const foundAdvisor = await ctx.prisma.classroom.findFirst({
          where: {
            organizationId,
            advisorTeacherId,
          },
        });

        if (!!foundAdvisor) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Advisor teacher already assigned to another class",
          });
        }
      }

      // check if the class level is L11 or L12, then branch must be selected
      if (
        (classLevel === ClassLevel.L11 || classLevel === ClassLevel.L12) &&
        (!branch || branch === "")
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Branch must be selected",
        });
      }

      // filter lessons that has non empty lessonId and weeklyHour > 0
      const filteredLessons = lessons.filter(
        (lesson) => lesson.lessonId !== "" && lesson.weeklyHour > 0
      );

      if (filteredLessons.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lessons must be selected",
        });
      }

      // check if the total weeklyHour of the lesson array do not allow to exceed 40
      const totalWeeklyHour = filteredLessons.reduce(
        (acc, lesson) => acc + lesson.weeklyHour,
        0
      );

      if (totalWeeklyHour > 40) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Total weekly hour must not exceed 40",
        });
      }

      await ctx.prisma.classroom.create({
        data: {
          classLevel,
          code,
          branch:
            classLevel === ClassLevel.L11 || classLevel === ClassLevel.L12
              ? (branch as Branch) || undefined
              : undefined,
          advisorTeacherId: advisorTeacherId || undefined,
          organizationId,
          ClassroomLesson: {
            createMany: {
              data: filteredLessons.map((lesson) => ({
                lessonId: lesson.lessonId,
                weeklyHour: lesson.weeklyHour,
                organizationId,
              })),
            },
          },
        },
      });

      return {
        success: true,
      };
    }),

  updateClassroom: protectedProcedure
    .input(classroomSchema)
    .mutation(({ input, ctx }) => {
      // const { name, classLevel } = input;

      // await ctx.prisma.classRoom.create({
      //   data: {
      //     name,
      //     classLevel,
      //     organizationId,
      //   },
      // });

      return {
        success: true,
      };
    }),

  deleteClassroom: protectedProcedure
    .input(
      z.object({
        classroomId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return {
        success: true,
      };
    }),
});

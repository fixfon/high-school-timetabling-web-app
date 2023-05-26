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
      const orgId = ctx.session.user.orgId;

      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const { classroomId } = input;

      return ctx.prisma.classroom.findFirst({
        where: {
          id: classroomId,
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
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.session.user.orgId;

      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const { id, classLevel, code, branch, advisorTeacherId, lessons } = input;

      const foundClassroom = await ctx.prisma.classroom.findFirst({
        where: {
          id,
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

      if (!foundClassroom) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Classroom not found",
        });
      }

      // check if the classLevel or code is changed
      // and validate them that there is already no other classroom with the same classLevel and code
      if (
        classLevel !== foundClassroom.classLevel ||
        code !== foundClassroom.code
      ) {
        const foundClassroomWithSameClassLevelAndCode =
          await ctx.prisma.classroom.findFirst({
            where: {
              id: {
                not: id,
              },
              organizationId: orgId,
              classLevel,
              code,
            },
          });

        if (!!foundClassroomWithSameClassLevelAndCode) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Classroom already exists",
          });
        }

        // check if the class level is L11 or L12, then branch must be selected
        if (
          (classLevel === ClassLevel.L11 || classLevel === ClassLevel.L12) &&
          (!branch || branch === "" || branch === "none")
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Branch must be selected",
          });
        }

        //update the classroom
        await ctx.prisma.classroom.update({
          where: {
            id,
          },
          data: {
            classLevel,
            code,
          },
        });
      }

      if (branch !== foundClassroom.branch) {
        if (branch && branch !== "" && branch !== "none") {
          await ctx.prisma.classroom.update({
            where: {
              id,
            },
            data: {
              branch:
                classLevel === ClassLevel.L11 || classLevel === ClassLevel.L12
                  ? (branch as Branch) || null
                  : null,
            },
          });
        } else {
          await ctx.prisma.classroom.update({
            where: {
              id,
            },
            data: {
              branch: null,
            },
          });
        }
      }

      if (advisorTeacherId !== foundClassroom.advisorTeacherId) {
        // check if the advisor teacher is assigned to another class
        if (advisorTeacherId && advisorTeacherId !== "") {
          const foundTeacher = await ctx.prisma.teacher.findFirst({
            where: {
              organizationId: orgId,
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
              id: {
                not: id,
              },
              organizationId: orgId,
              advisorTeacherId,
            },
          });

          if (!!foundAdvisor) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Advisor teacher already assigned to another class",
            });
          }

          await ctx.prisma.classroom.update({
            where: {
              id,
            },
            data: {
              advisorTeacherId: {
                set: advisorTeacherId || null,
              },
            },
          });
        } else {
          await ctx.prisma.classroom.update({
            where: {
              id,
            },
            data: {
              advisorTeacherId: {
                set: null,
              },
            },
          });
        }
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

      // check if the lessons are changed
      // if changed, delete the old lessons and create the new ones
      const deleteClassroomLessonList = foundClassroom.ClassroomLesson.filter(
        (classroomLesson) =>
          !filteredLessons.some(
            (lesson) => lesson.lessonId === classroomLesson.lessonId
          )
      );

      const createClassroomLessonList = filteredLessons.filter(
        (lesson) =>
          !foundClassroom.ClassroomLesson.some(
            (classroomLesson) => classroomLesson.lessonId === lesson.lessonId
          )
      );

      const updateClassroomLessonList = filteredLessons.filter((lesson) =>
        foundClassroom.ClassroomLesson.some(
          (classroomLesson) =>
            classroomLesson.lessonId === lesson.lessonId &&
            classroomLesson.weeklyHour !== lesson.weeklyHour
        )
      );

      if (deleteClassroomLessonList.length > 0) {
        await ctx.prisma.classroomLesson.deleteMany({
          where: {
            id: {
              in: deleteClassroomLessonList.map(
                (classroomLesson) => classroomLesson.id
              ),
            },
          },
        });
      }

      if (createClassroomLessonList.length > 0) {
        const clId = foundClassroom.id;
        await ctx.prisma.classroomLesson.createMany({
          data: createClassroomLessonList.map((lesson) => ({
            classroomId: clId,
            lessonId: lesson.lessonId,
            weeklyHour: lesson.weeklyHour,
            organizationId: orgId,
          })),
        });
      }

      if (updateClassroomLessonList.length > 0) {
        await Promise.all(
          updateClassroomLessonList.map((lesson) =>
            ctx.prisma.classroomLesson.update({
              where: {
                classroomId_lessonId_organizationId: {
                  lessonId: lesson.lessonId,
                  classroomId: foundClassroom.id,
                  organizationId: orgId,
                },
              },
              data: {
                weeklyHour: lesson.weeklyHour,
              },
            })
          )
        );
      }

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
      const orgId = ctx.session.user.orgId;

      if (!orgId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const { classroomId } = input;

      return ctx.prisma.classroom.delete({
        where: {
          id: classroomId,
        },
        include: {
          ClassroomLesson: true,
        },
      });
    }),
});

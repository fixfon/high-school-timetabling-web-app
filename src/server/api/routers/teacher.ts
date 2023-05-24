import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { hash, verify } from "argon2";
import { TRPCError } from "@trpc/server";
import teacherSchema from "~/schemas/teacher";
import { type Teacher } from "@prisma/client";

export const teacherRouter = createTRPCRouter({
  getTeachers: protectedProcedure.query(async ({ ctx }) => {
    const teachers = await ctx.prisma.teacher.findMany({
      where: {
        organizationId: ctx.session.user.orgId,
      },
      include: {
        Department: true,
        TeacherWorkPreferance: true,
        TeacherLesson: {
          include: {
            Lesson: true,
          },
        },
        User: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      teachers,
    };
  }),

  getTeacher: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { teacherId } = input;

      const foundTeacher = await ctx.prisma.teacher.findFirst({
        where: {
          id: teacherId,
        },
        include: {
          TeacherWorkPreferance: true,
          Department: true,
          User: true,
          TeacherLesson: {
            include: {
              Lesson: true,
            },
          },
        },
      });

      return {
        foundTeacher,
      };
    }),

  createTeacher: protectedProcedure
    .input(teacherSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        surname,
        departmentId,
        description,
        createUser,
        email,
        password,
        timePreferences,
        lessonIds,
      } = input;

      const { orgId } = ctx.session.user;
      if (!orgId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Organization not found",
        });
      }

      let teacher: Teacher;

      // check existing user logic
      if (createUser && email && password) {
        const foundUser = await ctx.prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (foundUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email already exists",
          });
        }

        const hashedPassword = await hash(password);

        teacher = await ctx.prisma.teacher.create({
          data: {
            organizationId: orgId,
            name,
            surname,
            description,
            departmentId,
          },
        });

        await ctx.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            surname,
            memberRole: "TEACHER",
            organizationId: orgId,
            Teacher: {
              connect: {
                id: teacher.id,
              },
            },
          },
        });
      } else {
        teacher = await ctx.prisma.teacher.create({
          data: {
            organizationId: orgId,
            name,
            surname,
            description,
            departmentId,
          },
        });
      }

      if (timePreferences) {
        for (const days of timePreferences) {
          await ctx.prisma.teacherWorkPreferance.create({
            data: {
              organizationId: orgId,
              teacherId: teacher.id,
              workingDay: days.day,
              workingHour: [...days.classHour],
            },
          });
        }
      }

      // put lesson logic here
      if (lessonIds) {
        for (const lessonId of lessonIds) {
          await ctx.prisma.teacherLesson.create({
            data: {
              organizationId: orgId,
              teacherId: teacher.id,
              lessonId,
            },
          });
        }
      }

      return {
        success: true,
      };
    }),

  updateTeacher: protectedProcedure
    .input(teacherSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        name,
        surname,
        departmentId,
        description,
        email,
        password,
        timePreferences,
        lessonIds,
      } = input;

      const { orgId } = ctx.session.user;
      if (!orgId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Organization not found",
        });
      }

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Teacher id is required",
        });
      }

      let foundTeacher = await ctx.prisma.teacher.findUnique({
        where: {
          id,
        },
        include: {
          User: true,
          TeacherWorkPreferance: true,
          TeacherLesson: true,
        },
      });

      if (!foundTeacher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Teacher not found",
        });
      }

      if (foundTeacher.name !== name) {
        await ctx.prisma.teacher.update({
          where: {
            id,
          },
          data: {
            name,
          },
        });
        if (foundTeacher.User) {
          await ctx.prisma.user.update({
            where: {
              id: foundTeacher.User.id,
            },
            data: {
              name,
            },
          });
        }
      }

      if (foundTeacher.surname !== surname) {
        await ctx.prisma.teacher.update({
          where: {
            id,
          },
          data: {
            surname,
          },
        });

        if (foundTeacher.User) {
          await ctx.prisma.user.update({
            where: {
              id: foundTeacher.User.id,
            },
            data: {
              surname,
            },
          });
        }
      }

      if (foundTeacher.departmentId !== departmentId) {
        await ctx.prisma.teacher.update({
          where: {
            id,
          },
          data: {
            departmentId,
          },
        });
      }

      if (foundTeacher.description !== description) {
        await ctx.prisma.teacher.update({
          where: {
            id,
          },
          data: {
            description,
          },
        });
      }

      if (timePreferences) {
        for (const day of foundTeacher.TeacherWorkPreferance) {
          const inputDay = timePreferences.find(
            (inputDay) => inputDay.day === day.workingDay
          );

          if (!inputDay) continue;

          // find differences between inputDay.classHour array and day.workingHour array
          const toBeDeleted = day.workingHour.filter(
            (hour) => !inputDay.classHour.includes(hour)
          );

          const toBeAdded = inputDay.classHour.filter(
            (hour) => !day.workingHour.includes(hour)
          );

          if (toBeDeleted.length > 0 || toBeAdded.length > 0) {
            // update workinghour array without deleting the day record
            await ctx.prisma.teacherWorkPreferance.update({
              where: {
                id: day.id,
              },
              data: {
                workingHour: {
                  set: inputDay.classHour,
                },
              },
            });
          }
        }
      }

      if (lessonIds) {
        const addedLessons = lessonIds.filter(
          (lessonId) =>
            !foundTeacher?.TeacherLesson.find(
              (teacherLesson) => teacherLesson.lessonId === lessonId
            )
        );

        const deletedLessons = foundTeacher.TeacherLesson.filter(
          (teacherLesson) => !lessonIds.includes(teacherLesson.lessonId)
        );

        if (addedLessons.length > 0) {
          for (const lessonId of addedLessons) {
            await ctx.prisma.teacherLesson.create({
              data: {
                organizationId: orgId,
                teacherId: foundTeacher.id,
                lessonId,
              },
            });
          }
        }

        if (deletedLessons.length > 0) {
          for (const teacherLesson of deletedLessons) {
            await ctx.prisma.teacherLesson.delete({
              where: {
                id: teacherLesson.id,
              },
            });
          }
        }
      }

      // delete user account
      if (foundTeacher.userId && (!email || email === "")) {
        // delete user account but not teacher record
        foundTeacher = await ctx.prisma.teacher.update({
          where: {
            id,
          },
          data: {
            User: {
              delete: true,
            },
          },
          include: {
            TeacherLesson: true,
            TeacherWorkPreferance: true,
            User: true,
          },
        });
      }

      // create user account
      if (!foundTeacher.userId && email && password) {
        const foundUser = await ctx.prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (foundUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email already exists",
          });
        }

        const hashedPassword = await hash(password);

        await ctx.prisma.teacher.update({
          where: {
            id,
          },
          data: {
            User: {
              create: {
                email,
                password: hashedPassword,
                name,
                surname,
                memberRole: "TEACHER",
                organizationId: orgId,
              },
            },
          },
        });
      }

      // update user password
      if (
        foundTeacher.userId &&
        foundTeacher.User?.password &&
        password &&
        password !== ""
      ) {
        const verifyExistingPassword = await verify(
          foundTeacher.User?.password,
          password
        );

        if (!verifyExistingPassword) {
          const hashedPassword = await hash(password);

          await ctx.prisma.user.update({
            where: {
              id: foundTeacher.userId,
            },
            data: {
              password: hashedPassword,
            },
          });
        }
      }

      // update user account
      if (
        foundTeacher.userId &&
        foundTeacher.User?.email !== email &&
        email !== ""
      ) {
        const foundUser = await ctx.prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (foundUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email already exists",
          });
        }

        await ctx.prisma.user.update({
          where: {
            id: foundTeacher.userId,
          },
          data: {
            email,
          },
        });
      }

      return {
        success: true,
      };
    }),

  deleteTeacher: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { teacherId } = input;

      const foundTeacher = await ctx.prisma.teacher.findUnique({
        where: {
          id: teacherId,
        },
      });

      if (!foundTeacher) {
        return new TRPCError({
          code: "NOT_FOUND",
          message: "Teacher not found",
        });
      }

      if (foundTeacher.userId) {
        await ctx.prisma.user.delete({
          where: {
            id: foundTeacher.userId,
          },
        });
      }

      await ctx.prisma.teacher.delete({
        where: {
          id: teacherId,
        },
      });

      return {
        success: true,
      };
    }),
});

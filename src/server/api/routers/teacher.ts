import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { hash } from "argon2";
import { TRPCError } from "@trpc/server";
import teacherSchema from "~/schemas/teacher";
import { type Teacher } from "@prisma/client";

export const teacherRouter = createTRPCRouter({
  getTeachers: protectedProcedure.query(async ({ ctx }) => {
    const teachers = await ctx.prisma.teacher.findMany({
      where: {
        organizationId: ctx.session.user.orgId,
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
          User: true,
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
        department,
        description,
        createUser,
        email,
        password,
        timePreferences,
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
            department,
            description,
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
            department,
            description,
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

      return {
        success: true,
      };
    }),

  updateTeacher: protectedProcedure
    .input(teacherSchema)
    .mutation(({ input, ctx }) => {
      const {
        name,
        surname,
        department,
        description,
        createUser,
        email,
        password,
        timePreferences,
      } = input;

      const { orgId } = ctx.session.user;
      if (!orgId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Organization not found",
        });
      }

      // put lesson logic here

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

      return {
        success: true,
      };
    }),
});

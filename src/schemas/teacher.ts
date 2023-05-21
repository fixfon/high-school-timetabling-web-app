import { z } from "zod";
import { ClassHour, Day } from "@prisma/client";

const teacherTimePreferencesSchema = z.object({
  day: z.nativeEnum(Day),
  classHour: z.array(z.nativeEnum(ClassHour)),
});

const teacherSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3).max(30),
  surname: z.string().min(3).max(30),
  description: z.string().max(240).optional(),
  departmentId: z.string(),
  createUser: z.boolean().optional().default(false),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6).max(20).optional().or(z.literal("")),
  lessonIds: z.array(z.string()),
  timePreferences: z.array(teacherTimePreferencesSchema).optional(),
});

export type TeacherInput = z.infer<typeof teacherSchema>;

export default teacherSchema;

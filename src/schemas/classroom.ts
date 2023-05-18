import { Branch, ClassLevel } from "@prisma/client";
import { z } from "zod";

const classroomSchema = z.object({
  // select A-Z
  code: z
    .string()
    .min(1)
    .max(1)
    .regex(/^[A-Z]$/),
  classLevel: z.nativeEnum(ClassLevel),
  branch: z.nativeEnum(Branch).optional(),
  advisorTeacherId: z.string().optional(),
  lessonIds: z.array(z.string()).optional(),
});

export type ClassroomInput = z.infer<typeof classroomSchema>;

export default classroomSchema;

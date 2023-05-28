import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(1).max(100),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

export default departmentSchema;

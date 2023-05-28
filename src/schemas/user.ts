import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(30),
  surname: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().max(20).optional(),
});

export type UserInput = z.infer<typeof userSchema>;

export default userSchema;

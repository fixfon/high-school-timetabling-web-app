import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(20),
});

export type LoginInput = z.infer<typeof loginSchema>;

export default loginSchema;

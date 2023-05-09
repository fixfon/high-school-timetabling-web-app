import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(3).max(30),
    surname: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6).max(20),
    confirmPassword: z.string().min(6).max(20),
    organization: z.string().min(3).max(60),
    phone: z.string().length(10),
    marketing: z.boolean().optional().default(false),
    terms: z.boolean().refine((data) => data === true, {
      message: "You must accept the terms and conditions",
      path: ["terms"],
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export default registerSchema;

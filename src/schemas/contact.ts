import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  surname: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(10),
  message: z.string().min(10).max(1000),
});

export type ContactInput = z.infer<typeof contactSchema>;

export default contactSchema;

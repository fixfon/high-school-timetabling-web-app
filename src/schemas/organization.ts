import { z } from "zod";

const organizationSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(30),
  contact: z.string().length(10),
  description: z.string().max(1000),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;

export default organizationSchema;

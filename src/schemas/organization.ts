import { z } from "zod";

const organizationSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(30),
  contact: z.string().length(10),
  description: z.string().max(1000),
  startHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  breakMinute: z.number().min(0).max(60),
  lunchMinute: z.number().min(0).max(60),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;

export default organizationSchema;

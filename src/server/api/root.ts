import { createTRPCRouter } from "~/server/api/trpc";
import { dashboardRouter } from "~/server/api/routers/dashboard";
import { registerRouter } from "./routers/register";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  register: registerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

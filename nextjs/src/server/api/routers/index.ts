import { createTRPCRouter } from "~/server/api/trpc";
import admin from "./admin";
import email from "./email";
import info from "./info";
import questions from "./questions";
import subscriptions from "./subscriptions";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  info,
  questions,
  subscriptions,
  email,
  admin,
});

// export type definition of API
export type AppRouter = typeof appRouter;

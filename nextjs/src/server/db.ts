import { PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      // "query",
      env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// import { Kysely } from "kysely";
// import { PlanetScaleDialect } from "kysely-planetscale";
// import type { AuthDatabase } from "./auth/kyselyadapter";

// interface Database extends AuthDatabase {
//   Search: Search;
// }
// export const db = new Kysely<Database>({
//   dialect: new PlanetScaleDialect({
//     host: "aws.connect.psdb.cloud",
//     username: "335gvxkggt994y22p5go",
//     password: "pscale_pw_hLsUKH5qsgW0WuTkJnGTIvsx2jhEPhDJPiLbkO75HE9",
//   }),
// });

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import type { Generated } from "kysely";

// interface User {
//   id: Generated<string>;
//   name: string | null;
//   email: string | null;
//   emailVerified: Date | null;
//   image: string | null;
// }

// interface Account {
//   id: Generated<string>;
//   userId: string;
//   type: string;
//   provider: string;
//   providerAccountId: string;
//   refresh_token: string | null;
//   access_token: string | null;
//   expires_at: number | null;
//   token_type: string | null;
//   scope: string | null;
//   id_token: string | null;
//   session_state: string | null;
//   oauth_token_secret: string | null;
//   oauth_token: string | null;
// }

// interface Session {
//   id: Generated<string>;
//   userId: string;
//   sessionToken: string;
//   expires: Date;
// }

// interface VerificationToken {
//   identifier: string;
//   token: string;
//   expires: Date;
// }

// export interface AuthDatabase {
//   User: User;
//   Account: Account;
//   Session: Session;
//   VerificationToken: VerificationToken;
// }

// import type { Kysely, RawBuilder } from "kysely";
// import type { Adapter, AdapterSession, AdapterUser } from "next-auth/adapters";

// export function KyselyAdapter(
//   db: Kysely<AuthDatabase>,
//   opts: {
//     generateId: () => string | RawBuilder<any>;
//   }
// ): Adapter {
//   return {
//     async createUser(data) {
//       return await db
//         .insertInto("User")
//         .values({ id: opts.generateId(), ...data })
//         .returningAll()
//         .castTo<AdapterUser>()
//         .executeTakeFirstOrThrow();
//     },
//     async getUser(id) {
//       const user = await db
//         .selectFrom("User")
//         .selectAll()
//         .where("id", "=", id)
//         .castTo<AdapterUser>()
//         .executeTakeFirst();
//       if (!user) {
//         return null;
//       }
//       return user;
//     },
//     async getUserByEmail(email) {
//       const user = await db
//         .selectFrom("User")
//         .selectAll()
//         .where("email", "=", email)
//         .castTo<AdapterUser>()
//         .executeTakeFirst();
//       if (!user) {
//         return null;
//       }
//       return user;
//     },
//     async getUserByAccount(account) {
//       const result = await db
//         .selectFrom("Account")
//         .innerJoin("User", "Account.userId", "User.id")
//         .selectAll()
//         .where("providerAccountId", "=", account.providerAccountId)
//         .executeTakeFirst();
//       if (!result) {
//         return null;
//       }
//       const { emailVerified, userId, name, email, image } = result;
//       return {
//         id: userId,
//         emailVerified: emailVerified
//           ? new Date(emailVerified.toString())
//           : null,
//         name,
//         email,
//         image,
//       } as any;
//     },
//     async updateUser(user) {
//       if (!user.id) {
//         throw new Error("User id is required");
//       }
//       return await db
//         .updateTable("User")
//         .where("id", "=", user.id)
//         .set(user)
//         .returningAll()
//         .castTo<AdapterUser>()
//         .executeTakeFirstOrThrow();
//     },
//     async deleteUser(userId) {
//       return await db
//         .deleteFrom("User")
//         .where("id", "=", userId)
//         .returningAll()
//         .castTo<AdapterUser>()
//         .executeTakeFirstOrThrow();
//     },
//     async linkAccount(account) {
//       return (await db
//         .insertInto("Account")
//         .values({ ...account, id: opts.generateId() })
//         .returningAll()
//         .castTo<Account>()
//         .executeTakeFirstOrThrow()) as any;
//     },
//     async unlinkAccount(account) {
//       return (await db
//         .deleteFrom("Account")
//         .where("providerAccountId", "=", account.providerAccountId)
//         .returningAll()
//         .castTo<Account>()
//         .executeTakeFirstOrThrow()) as any;
//     },
//     async createSession(session) {
//       return await db
//         .insertInto("Session")
//         .values({ ...session, id: opts.generateId() })
//         .returningAll()
//         .castTo<AdapterSession>()
//         .executeTakeFirstOrThrow();
//     },
//     async getSessionAndUser(sessionTokenInput) {
//       const query = await db
//         .selectFrom("Session")
//         .innerJoin("User", "Session.userId", "User.id")
//         .selectAll()
//         .where("Session.sessionToken", "=", sessionTokenInput)
//         .executeTakeFirst();
//       if (!query) {
//         return null;
//       }
//       const {
//         email,
//         emailVerified,
//         expires,
//         id,
//         image,
//         name,
//         sessionToken,
//         userId,
//       } = query;
//       return {
//         session: {
//           id,
//           sessionToken,
//           userId,
//           expires: new Date(expires.toString()),
//         },
//         user: {
//           id: userId,
//           emailVerified: emailVerified
//             ? new Date(emailVerified.toString())
//             : null,
//           name,
//           email,
//           image,
//         },
//       } as any;
//     },
//     async updateSession(session) {
//       return await db
//         .updateTable("Session")
//         .where("sessionToken", "=", session.sessionToken)
//         .set(session)
//         .returningAll()
//         .castTo<AdapterSession>()
//         .executeTakeFirstOrThrow();
//     },
//     async deleteSession(sessionToken) {
//       return await db
//         .deleteFrom("Session")
//         .where("sessionToken", "=", sessionToken)
//         .returningAll()
//         .castTo<AdapterSession>()
//         .executeTakeFirstOrThrow();
//     },
//     async createVerificationToken(verificationToken) {
//       return await db
//         .insertInto("VerificationToken")
//         .values({ ...verificationToken })
//         .returningAll()
//         .castTo<VerificationToken>()
//         .executeTakeFirstOrThrow();
//     },
//     async useVerificationToken(params) {
//       const result = await db
//         .deleteFrom("VerificationToken")
//         .where("identifier", "=", params.identifier)
//         .where("token", "=", params.token)
//         .returningAll()
//         .castTo<VerificationToken>()
//         .executeTakeFirst();
//       if (!result) {
//         return null;
//       }
//       return result;
//     },
//   };
// }

export {};

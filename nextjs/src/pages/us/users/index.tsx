import type { inferProcedureOutput } from "@trpc/server";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Spinner } from "~/components";
import type { AppRouter } from "~/server/api/routers";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (session?.user.role !== "ADMIN") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};

const possibleOrderBy = ["createdAt", "paying", "count", "lastLogin"] as const;

const Users: NextPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [seekForRole, setSeekForRole] = useState<
    "ALL" | "ADMIN" | "USER" | "DEQA"
  >("ALL");
  const [orderBy, setOrderBy] = useState<(typeof possibleOrderBy)[number]>(
    possibleOrderBy[0]
  );
  const [name, setName] = useState("");
  const users = api.admin.getUsers.useQuery(
    {
      currentPage,
      seekForRole,
      orderBy,
      name,
    },
    {
      keepPreviousData: true,
    }
  );
  const summedData = api.admin.getSumData.useQuery();
  return (
    <>
      <Head>
        <title>Reviewsify - Users</title>
      </Head>
      <main className="flex flex-col items-center gap-2 p-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-solid border-white p-2.5">
            <div className="flex flex-col items-center gap-2">
              <span className="text-white">
                Total Users: {summedData.data?.finalUserCount ?? "Loading"}
              </span>
              <span className="text-white">
                Total Paying Users:{" "}
                {summedData.data?.payinguserCount ?? "Loading"}
              </span>
              <span className="text-white">
                Total Free Trial Users:{" "}
                {summedData.data?.freeUserCount ?? "Loading"}
              </span>
              <span className="text-white">
                Total Report Counts: {summedData.data?.searchCount ?? "Loading"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <label className="text-white" htmlFor="name">
              Name
            </label>
            <input
              className="rounded-lg bg-gray-500 p-2.5 text-white focus:outline-none"
              type="search"
              id="name"
              placeholder="E.g Or"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-center gap-4 rounded-lg bg-gray-400 p-2.5">
            <div className="flex flex-col items-center gap-1">
              <span className="text-white">Page</span>
              <div className="flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  className="rounded-lg bg-gray-500 p-2.5 text-white"
                  onClick={() =>
                    setCurrentPage((prev) => (prev === 1 ? prev : prev - 1))
                  }
                >
                  Previous
                </button>
                <span className="text-white">{currentPage}</span>
                <button
                  className="rounded-lg bg-gray-500 p-2.5 text-white"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white">By Role</span>
              <select
                className="rounded-lg bg-gray-500 p-2.5 text-white focus:outline-none"
                value={seekForRole}
                onChange={(e) => {
                  setSeekForRole(e.target.value as typeof seekForRole);
                }}
              >
                <option value="ALL">All</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                <option value="DEQA">DEQA</option>
              </select>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white">Order By</span>
              <select
                className="rounded-lg bg-gray-500 p-2.5 text-white focus:outline-none"
                value={orderBy}
                onChange={(e) => {
                  setOrderBy(e.target.value as typeof orderBy);
                }}
              >
                {possibleOrderBy.map((orderBy) => {
                  return (
                    <option key={orderBy} value={orderBy}>
                      {orderBy}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {users.isLoading ? (
          <Spinner />
        ) : (
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-white">Name</th>
                <th className="px-4 py-2 text-white">Email</th>
                <th className="px-4 py-2 text-white">Role</th>
                <th className="px-4 py-2 text-white">Created At</th>
                <th className="px-4 py-2 text-white">Last Login</th>
                <th className="px-4 py-2 text-white">Status</th>
                <th className="px-4 py-2 text-white">Paying</th>
                <th className="px-4 py-2 text-white">Count</th>
              </tr>
            </thead>
            <tbody>
              {users.data?.map((user) => {
                return <InnerUserContent key={user.id} user={user} />;
              })}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
};

export default Users;

export const InnerUserContent: React.FC<{
  user: inferProcedureOutput<AppRouter["admin"]["getUsers"]>[number];
}> = ({ user }) => {
  return (
    <tr className="group">
      <td className="border px-4 py-2 font-bold text-white group-hover:bg-red-500">
        <Link href={`/us/users/${user.id}`}>{user.name}</Link>
      </td>
      <td className="border px-4 py-2 font-bold text-white group-hover:bg-green-500">
        {user.email}
      </td>
      <td className="border px-4 py-2 font-bold text-white group-hover:bg-purple-500">
        {user.role}
      </td>
      <td className="border px-4 py-2 font-bold text-white group-hover:bg-orange-500">
        {user.createdAt.toLocaleString()}
      </td>
      <td className="border px-4 py-2 font-bold text-white group-hover:bg-yellow-300">
        {user.lastLogin?.toLocaleString() ?? "N/A"}
      </td>
      <td className="border px-4 py-2 font-bold text-white group-hover:bg-red-300">
        {user.paying && user.paying !== "0"
          ? "Paying"
          : user.freeTrialExpired
          ? "Free Trial Expired"
          : "Free Trial"}
      </td>
      <td className="border px-4 py-2 font-bold text-white group-hover:bg-green-400">
        {user.paying && user.paying !== "0" ? `$${user.paying}` : "N/A"}
      </td>
      <td className="border px-4 py-2 font-bold text-white group-hover:bg-purple-300">
        {user.reportsCount}
      </td>
    </tr>
  );
};

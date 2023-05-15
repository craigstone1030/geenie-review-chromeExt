/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { Spinner } from "~/components";
import { Report } from "~/pages";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import { InnerUserContent } from ".";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

const User = () => {
  const { id } = useRouter().query;
  const user = api.admin.getUser.useQuery(id as string);
  return (
    <>
      <Head>
        <title>Reviewsify - User</title>
      </Head>
      <main className="flex flex-col items-center gap-2">
        {user.isLoading ? (
          <Spinner />
        ) : user.data ? (
          <>
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
                <InnerUserContent user={user.data} />
              </tbody>
            </table>
            <span className="text-2xl text-white">User Reports</span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {user.data.searches.map((search) => {
                return (
                  <Report
                    href={`/reports/${search.search.id}`}
                    key={search.search.id}
                    {...search.search}
                    reviews={search.search.ratingCount}
                    img={
                      search.search.img ??
                      `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=GB&ASIN=${search.search.asin}&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=SL250`
                    }
                  />
                );
              })}
            </div>
            <span className="text-2xl text-white">User Searches</span>
            <Chart
              options={{
                chart: {
                  id: "basic-bar",
                },
                xaxis: {
                  categories: user.data.sortedSearches.map(
                    (search) => search[0]
                  ),
                },
              }}
              series={[
                {
                  name: "Searches",
                  data: user.data.sortedSearches.map((search) => search[1]),
                },
              ]}
              type="bar"
              width="500"
              height={320}
            />
          </>
        ) : null}
      </main>
    </>
  );
};

export default User;

import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Spinner } from "~/components";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (!session) {
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

const Subscription: NextPage = () => {
  const { id } = useRouter().query;
  const getPayment = api.subscriptions.getPaymentInfo.useQuery({
    checkoutSessionId: id as string,
  });
  return (
    <>
      <Head>
        <title>Reviewsify - Subscription</title>
      </Head>
      <main className="mt-12 flex flex-col items-center justify-center gap-7">
        {getPayment.isLoading ? (
          <Spinner />
        ) : getPayment.data?.success ? (
          <>
            <h1 className="text-2xl font-bold text-white">
              Thank you for your purchase!
            </h1>
            <p className="max-w-[40rem] text-lg font-bold text-white">
              You can now receive 5 detailed reports every day analyzing Amazon
              product reviews Thank you for choosing our review analysis system.
            </p>
            <Link
              href="/"
              className="flex items-center justify-center rounded-lg bg-blue p-2.5 text-lg font-bold text-white "
            >
              Go back to the home page
            </Link>
          </>
        ) : null}
      </main>
    </>
  );
};

export default Subscription;

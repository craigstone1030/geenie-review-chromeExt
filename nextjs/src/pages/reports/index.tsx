/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { toast } from "react-hot-toast";
// import { useState } from "react";
import { Spinner } from "~/components";
import ProductPage from "~/components/ProductPage";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import { useActualModal, useModal } from "~/utils/modalCtx";
import { Report } from "..";

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

const Reports: NextPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const reports = api.info.getAllReports.useQuery(currentPage);
  const [newAsin, setNewAsin] = useState("");
  const setEmailModal = useModal();
  const setShouldActuallyDisplay = useActualModal();

  const getInfo = api.info.fetch.useMutation({
    onMutate: () => {
      setEmailModal(true);
      setShouldActuallyDisplay(false);
    },
    onError(error) {
      if (error.message.includes("You have to be logged in to do that")) {
        setEmailModal(true);
        setShouldActuallyDisplay(true);
      } else if (!error.message.includes("You have reached your"))
        toast.error(error.message);
    },
  });
  return (
    <>
      <Head>
        <title>Reviewsify - Reports</title>
      </Head>
      <main className="my-4 flex w-full flex-col items-center gap-2">
        {getInfo.data ? (
          // <ProductPage
          //   asin={newAsin}
          //   setAsin={setNewAsin}
          //   ProductData={{
          //     title: getInfo.data.title as string,
          //     starts: getInfo.data.stars as number,
          //     reviewsCount: getInfo.data.reviewsCount as number,
          //     ratingCount: getInfo.data.ratingCount as number,
          //     img: getInfo.data.img as string,
          //     version: getInfo.data.version,
          //   }}
          //   ServerData={getInfo.data.chatResponse as string}
          //   GraphData={getInfo.data.txtResponse as string}
          //   reSearch={(_newAsin) => {
          //     setNewAsin(_newAsin);
          //     getInfo.mutate({
          //       asin: newAsin,
          //     });
          //   }}
          // />
          null
        ) : (
          <>
            <div className="my-3 flex w-full items-center justify-center gap-3">
              <input
                type="text"
                placeholder="Enter ASIN"
                value={newAsin}
                onChange={(e) => setNewAsin(e.target.value)}
                className="w-5/6 rounded-xl border border-solid border-white bg-inherit p-2.5 text-white text-opacity-50 focus:outline-none"
              />
              <button
                onClick={() => getInfo.mutate({ asin: newAsin })}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue p-2 text-lg font-bold text-white"
              >
                Run Report {getInfo.isLoading ? <Spinner sm /> : null}
              </button>
            </div>

            {reports.isLoading ? (
              <Spinner />
            ) : (
              <>
                <ul className="flex w-full flex-wrap items-center justify-center gap-4">
                  {reports.data?.map((report) => {
                    return (
                      <Report
                        href={`/reports/${report.search.id}`}
                        key={report.id}
                        {...report.search}
                        reviews={report.search.ratingCount}
                        // count={report.count}
                        img={
                          report.search.img ??
                          `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=GB&ASIN=${report.search.asin}&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=SL250`
                        }
                      />
                    );
                  })}
                </ul>
                <div className="fixed bottom-24 left-2/4 z-[9995] flex w-full -translate-x-2/4 items-center justify-center gap-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => (prev === 1 ? prev : prev - 1))
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue p-2 text-lg font-bold text-white"
                  >
                    Previous
                  </button>
                  <span className="text-white text-opacity-50">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue p-2 px-7 text-lg font-bold text-white"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default Reports;

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Spinner } from "~/components";
import ProductPage from "~/components/ProductPage";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import { onlyAllowedIds } from "~/utils/examples";
import { useActualModal, useModal } from "~/utils/modalCtx";
import ChatAIModal from "../../components/ChatAIModal/ChatAIModal";
import { IconRobot } from "~/components/ChatAIModal/Icon";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const id =
    (Array.isArray(ctx.query.id) ? ctx.query.id[0] : ctx.query.id) ?? "";
  if (!session && !onlyAllowedIds.includes(id)) {
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
const Report: NextPage = () => {
  const router = useRouter();
  const { id, spinner } = router.query;
  const report = api.info.getReport.useQuery(id as string);
  const [newAsin, setNewAsin] = useState("");
  const [chatAIModal, setChatAIModal] = useState(false);
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
    onSuccess(data) {
      if (data.id) {
        router.replace(`/reports/${data.id}?spinner=off`, undefined, {
          shallow: true,
        });
      }
    },
  });
  return (
    <>
      <Head>
        <title>Reviewsify - Report</title>
      </Head>
      <main className="my-6 flex flex-col items-center gap-2">
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
        
        {chatAIModal ? (
        <ChatAIModal asin={getInfo.data ? newAsin : report.data?.asin ?? ""} setChatAIModal={setChatAIModal} />
        ) : null}

        {report.isLoading && spinner !== "off" ? <Spinner /> : null}
        {report.data || getInfo.data ? (
          // <ProductPage
          //   asin={getInfo.data ? newAsin : report.data?.asin ?? ""}
          //   ProductData={
          //     getInfo.data
          //       ? {
          //           title: getInfo.data.title,
          //           starts: getInfo.data.stars,
          //           reviewsCount: getInfo.data.reviewsCount,
          //           ratingCount: getInfo.data.ratingCount,
          //           img: getInfo.data.img,
          //           version: getInfo.data.version,
          //         }
          //       : ({ ...report.data, starts: report.data?.stars } as any)
          //   }
          //   ServerData={
          //     getInfo.data
          //       ? getInfo.data.chatResponse
          //       : (report.data?.chatResponse as any)
          //   }
          //   GraphData={
          //     getInfo.data
          //       ? getInfo.data.txtResponse
          //       : (report.data?.response as any)
          //   }
          // />
          null
        ) : null}

        <button
            onClick={() => setChatAIModal(true) }
            className="absolute bottom-[30px] right-[30px] bg-blue text-white p-2 rounded hover:bg-blue-800"
          >
            <IconRobot />
        </button>
      </main>
    </>
  );
};

export default Report;
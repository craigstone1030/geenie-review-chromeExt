/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { NavBar, Pros, WhyShouldUse } from "~/components";
import { api } from "~/utils/api";
import type { UseTRPCMutationResult } from "@trpc/react-query/shared";
import { getServerAuthSession } from "~/server/auth";
import ProductPage from "~/components/ProductPage";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Examples } from "~/utils/examples";
import { useActualModal, useModal } from "~/utils/modalCtx";
import { useRouter } from "next/router";
import { SearchVersion } from "@prisma/client";
import axios from "axios";
import { List } from "postcss/lib/list";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: {
      session,
    },
  };
};

const proFeat = `Unlimited Reports || Amazon Review Analysis || Amazon Reviews Export || Competitive Analysis || Audience Research || Features Requests || Sentiment Analysis`;

const ProModal: React.FC<{
  setProOpened: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setProOpened }) => {
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (!closing) return;
    const timeout = setTimeout(() => {
      setProOpened(false);
    }, 250);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);
  return (
    <>
      <button
        className="fixed top-0 left-0 z-[9998] h-full w-full cursor-default bg-black bg-opacity-50"
        onClick={() => setClosing(true)}
      />
      <div
        className={`fixed left-2/4 top-2/4 flex -translate-x-2/4 -translate-y-2/4 flex-col items-center gap-2 rounded-smd bg-[#2B2939] ${closing ? "animate-slide-out" : "animate-slide-in"
          } z-[9999] h-[516px] w-[460px] p-3`}
      >
        <svg
          width="74"
          height="74"
          viewBox="0 0 74 74"
          fill="none"
          className="mt-3"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M30.1839 42.8834L50.2915 22.93C50.9163 22.31 51.7115 22 52.6771 22C53.6428 22 54.438 22.31 55.0628 22.93C55.6876 23.55 56 24.3392 56 25.2974C56 26.2556 55.6876 27.0447 55.0628 27.6647L32.5695 49.9854C31.8879 50.6618 31.0927 51 30.1839 51C29.275 51 28.4798 50.6618 27.7982 49.9854L18.9372 41.1924C18.3124 40.5724 18 39.7833 18 38.8251C18 37.8669 18.3124 37.0777 18.9372 36.4577C19.562 35.8377 20.3572 35.5277 21.3229 35.5277C22.2885 35.5277 23.0837 35.8377 23.7085 36.4577L30.1839 42.8834Z"
            fill="#FFA41C"
          />
          <circle cx="37" cy="37" r="35" stroke="#FFA41C" stroke-width="4" />
        </svg>
        <h1 className="text-2xl font-bold text-white">Payment received!</h1>
        <span className="text-center text-white">Boost Amazon sales with</span>
        <ul className="my-4 flex flex-col items-center gap-2">
          {proFeat.split("||").map((feat, idx) => {
            return (
              <li key={idx} className="flex w-full items-center gap-4">
                <svg
                  width="16"
                  height="13"
                  viewBox="0 0 16 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.33307 9.13324L13.1997 1.26657C13.4442 1.02212 13.7553 0.899902 14.1331 0.899902C14.5109 0.899902 14.822 1.02212 15.0664 1.26657C15.3109 1.51101 15.4331 1.82212 15.4331 2.1999C15.4331 2.57768 15.3109 2.88879 15.0664 3.13324L6.26641 11.9332C5.99974 12.1999 5.68863 12.3332 5.33307 12.3332C4.97752 12.3332 4.66641 12.1999 4.39974 11.9332L0.933072 8.46657C0.688628 8.22213 0.566406 7.91101 0.566406 7.53324C0.566406 7.15546 0.688628 6.84435 0.933072 6.5999C1.17752 6.35546 1.48863 6.23324 1.86641 6.23324C2.24418 6.23324 2.5553 6.35546 2.79974 6.5999L5.33307 9.13324Z"
                    fill="#29FC09"
                  />
                </svg>
                <span className="text-white">{feat}</span>
              </li>
            );
          })}
        </ul>
        <button
          className="rounded-md bg-[#FFA41C] px-12 py-2 text-xl font-bold text-white"
          onClick={() => setClosing(true)}
        >
          Go
        </button>
      </div>
    </>
  );
};
const Home: NextPage = () => {
  const { pro } = useRouter().query;
  const [asin, setAsin] = useState("");
  const [browserUrl, setBrowserUrl] = useState("");
  const [proOpened, setProOpened] = useState(true);
  const setEmailModal = useModal();
  const setShouldActuallyDisplay = useActualModal();
  const [opened, setOpened] = useState(true);
  const [isLoading ,setLoading] = useState(true);
  const [pdInfoArrived ,setPDinfoArrived] = useState(false);
  const [openAIResponse, setOpenAIResponse] = useState([]);
  const [pdInfos, setPdInfos] = useState({} as any);

  // const getInfo = api.info.fetch.useMutation({
  //   onMutate: () => {
  //     // setEmailModal(true);
  //     // setShouldActuallyDisplay(false);
  //   },
  //   onError(error) {
  //     if (error.message.includes("You have to be logged in to do that")) {
  //       // setEmailModal(true);
  //       // setShouldActuallyDisplay(true);
  //     } else if (!error.message.includes("You have reached your"))
  //       toast.error(error.message);
  //   },
  // });

  // var version : SearchVersion;
  
  const getInfo = {
    // bAsinLoaded: false,
    // bDataLoading: false,
    // isLoading: true,
    data: {
      asin: "B0996C241M",
      title: "Solar Power Bank,Solar Charger,42800mAh Power Bank,Portable Charger,External Battery Pack 5V3.1A Qc 3.0 Fast Charging Built-in Super Bright Flashlight (Orange)",
      stars: 4.3,
      response: "[\"[{\\\"date\\\": \\\"05.2023\\\", \\\"positive\\\": 8, \\\"negative\\\": 9, \\\"neutral\\\": 7}, {\\\"date\\\": \\\"04.2023\\\", \\\"positive\\\": 54, \\\"negative\\\": 13, \\\"neutral\\\": 22}, {\\\"date\\\": \\\"03.2023\\\", \\\"positive\\\": 62, \\\"negative\\\": 21, \\\"neutral\\\": 22}, {\\\"date\\\": \\\"02.2023\\\", \\\"positive\\\": 48, \\\"negative\\\": 15, \\\"neutral\\\": 24}, {\\\"date\\\": \\\"01.2023\\\", \\\"positive\\\": 52, \\\"negative\\\": 13, \\\"neutral\\\": 20}, {\\\"date\\\": \\\"12.2022\\\", \\\"positive\\\": 51, \\\"negative\\\": 9, \\\"neutral\\\": 24}, {\\\"date\\\": \\\"11.2022\\\", \\\"positive\\\": 67, \\\"negative\\\": 9, \\\"neutral\\\": 21}, {\\\"date\\\": \\\"10.2022\\\", \\\"positive\\\": 68, \\\"negative\\\": 8, \\\"neutral\\\": 33}, {\\\"info\\\": \\\"total\\\", \\\"positive\\\": 410, \\\"negative\\\": 97, \\\"neutral\\\": 173}, {\\\"info\\\": \\\"total_percentages\\\", \\\"positive\\\": 60.29, \\\"negative\\\": 14.26, \\\"neutral\\\": 25.44}]\"]",
      chatResponse: "||&>1\nOverall, customers appreciate the solar charging function of the Solar Power Bank but find it slow and not practical for daily use. The capacity is impressive, but the build quality and functionality leave something to be desired. The provided USB cable is also very short.\n\nCompared to other competitors, this power bank stands out for its solar charging feature and large capacity. However, there are areas for improvement in terms of speed and overall functionality.\n\n||&>2\nThe most frequently mentioned negative keywords and phrases in customer reviews include:\n\n- Slow solar charging (hit rate: 50%)\n- Not practical for daily use (hit rate: 30%)\n- Short USB cable (hit rate: 20%)\n- Build quality issues (hit rate: 15%)\n- Functionality issues (hit rate: 10%)\n\nOne customer writes, \"The solar charging is painfully slow, so it's not a practical option if you need to charge your device quickly.\" Another complains about the short USB cable, saying \"the cable that comes with it is so short that you have to keep your phone right next to the power bank while it charges.\"\n\n||&>3\nThe most frequently mentioned positive keywords and phrases in customer reviews include:\n\n- Impressive capacity (hit rate: 40%)\n- Solar charging feature appreciated (hit rate: 30%)\n- Super bright flashlight is useful (hit rate: 25%)\n- Portable design convenient for travel (hit rate: 20%)\n- Fast charging when using USB port (hit rate: 15%)\n\nOne customer praises the capacity of the power bank, stating that \"it can fully charge my phone multiple times before needing a recharge itself.\" Another appreciates the solar charging feature, saying \"it's great knowing I have a backup option in case I'm out of outlets or on a camping trip.\"",
      ratingCount: 8359,
      reviewsCount: 2073,
      img: "https://m.media-amazon.com/images/I/411AdD6NPGL._AC_US60_SCLZZZZZZZ__.jpg",
      version: "versionOne",
      summed: "appreciate the solar charging function, but it is slow and not very practical for daily use. The provided USB cable is also very short. Overall, while the capacity is impressive, the build quality and functionality leave something to be desired.",
      txtResponse: "[\"[{\\\"date\\\": \\\"05.2023\\\", \\\"positive\\\": 8, \\\"negative\\\": 9, \\\"neutral\\\": 7}, {\\\"date\\\": \\\"04.2023\\\", \\\"positive\\\": 54, \\\"negative\\\": 13, \\\"neutral\\\": 22}, {\\\"date\\\": \\\"03.2023\\\", \\\"positive\\\": 62, \\\"negative\\\": 21, \\\"neutral\\\": 22}, {\\\"date\\\": \\\"02.2023\\\", \\\"positive\\\": 48, \\\"negative\\\": 15, \\\"neutral\\\": 24}, {\\\"date\\\": \\\"01.2023\\\", \\\"positive\\\": 52, \\\"negative\\\": 13, \\\"neutral\\\": 20}, {\\\"date\\\": \\\"12.2022\\\", \\\"positive\\\": 51, \\\"negative\\\": 9, \\\"neutral\\\": 24}, {\\\"date\\\": \\\"11.2022\\\", \\\"positive\\\": 67, \\\"negative\\\": 9, \\\"neutral\\\": 21}, {\\\"date\\\": \\\"10.2022\\\", \\\"positive\\\": 68, \\\"negative\\\": 8, \\\"neutral\\\": 33}, {\\\"info\\\": \\\"total\\\", \\\"positive\\\": 410, \\\"negative\\\": 97, \\\"neutral\\\": 173}, {\\\"info\\\": \\\"total_percentages\\\", \\\"positive\\\": 60.29, \\\"negative\\\": 14.26, \\\"neutral\\\": 25.44}]\"]", "id": "clhg9454h0007l70fhrm1x6cv",
      titles: ["📊 Overall Insights Summary", "👎 Top Negative Keywords and Phrases", "👍 Top Positive Keywords and Phrases"],
      isLatest: false,
      // openAIResponse: []
    },
    // pdInfoArrived: false
  }

  useEffect(() => {
    window.parent.postMessage({from:'nextjs', type:'ping'}, "*")

    window.addEventListener('message', (event)=> {
      if(event.data.from === 'content' && event.data.type === 'pong') {
        setAsin(event.data.asin)
        setBrowserUrl(event.data.browserUrl)
        setLoading(true)

        window.parent.postMessage({from:'nextjs', type:'getProductInfo'}, "*")
      }
      if(event.data.from === 'content' && event.data.type === 'pdInfoArrvied') {
        // getInfo.data.openAIResponse = event.data.answers;
        debugger

        // setOpenAIResponse(event.data.answers)
        setPdInfos(event.data.pdInfos)
        setLoading(false)
        setPDinfoArrived(true)
        
        // alert('product information arrived');
        // alert(JSON.stringify(event.data.pdInfos))

        window.parent.postMessage({from:'nextjs', type:'getInitialAnswer'}, "*")
      }
      if(event.data.from === 'content' && event.data.type === 'initialAnswerArrived') {
        // getInfo.data.openAIResponse = event.data.answers;
        debugger

        setOpenAIResponse(event.data.answers)
        
        // alert('common answer arrived');
      }      
    });

  }, []);

  // useEffect(() => {
  //   if( asin == '' || browserUrl == '' ) return;

  //   // axios.post('http://geenieai.com:8001/api/ext_chat', {
  //   //     asin: asin,
  //   //     prompt: "Hello",
  //   //     url: browserUrl,
  //   // })
  //   // .then(res => {
  //   //   console.log('res', res.data);
  //   //   setLoading(false)
  //   //   setPDinfoArrived(true)
  //   // })
  //   // .catch(err => {
  //   //   console.log('error in request', err);
  //   // });

  // }, [asin, browserUrl]);

  // alert(JSON.stringify(getInfo.data.openAIResponse))

  return (
    <>
      <Head>
        <title>GeenieAI - Reviews</title>
      </Head>
      <main className="flex w-full flex-col items-center gap-2">
        {/* {getInfo.bAsinLoaded === false ? (<ProgBar dataType="ASIN" pdInfoArrived={getInfo.bAsinLoaded} />) : null} */}

        {/* {getInfo.bAsinLoaded === true && getInfo.bDataLoading === true ? (<ProgBar dataType="PRODUCT" pdInfoArrived={!!getInfo.data} />) : null} */}

        {/* {getInfo.bAsinLoaded === true && getInfo.bDataLoading === false && getInfo?.data ? ( */}
        
        {isLoading === true ? (<ProgBar dataType="PRODUCT" pdInfoArrived={pdInfoArrived} />) : null}

        {isLoading === false && getInfo?.data ? (
          <ProductPage
            asin={asin}
            setAsin={setAsin}
            ProductData={{
              title: pdInfos?.title as string,
              starts: parseFloat(pdInfos?.stars as string),
              reviewsCount: parseInt(pdInfos?.reviews as string),
              ratingCount:  parseInt(pdInfos?.rating as string),
              img: pdInfos?.img as string,
              version: getInfo.data.version as any,
            }}
            ServerData={getInfo.data.chatResponse}
            GraphData={getInfo.data.txtResponse}
            ImproveData={openAIResponse as any}
            reSearch={(newAsin) => {
              // setAsin(newAsin);
              // getInfo.mutate({
              //   asin: newAsin,
              // });
            }}
            />
        ) : null}
      </main>
    </>
  );
};

export default Home;

const RealExamples: React.FC = () => {
  return (
    <div className="ml-6 mt-12 flex flex-col items-center gap-16">
      <h1 className="text-3xl font-bold text-white">
        Try these latest reports:
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-8">
        {Examples.slice(0, 3).map((example, i) => {
          return (
            <Report
              key={i}
              i={i}
              {...example}
              href={`/reports/${example.id}`}
            />
          );
        })}
      </div>
    </div>
  );
};

const ProgBar: React.FC<{
  dataType: string;
  pdInfoArrived: boolean;
}> = ({ dataType, pdInfoArrived }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let delay = 1000;
    if( dataType == 'PRODUCT' ) {
      delay = 1000;
    } else if( dataType == 'ASIN' ) {
      delay = 200;
    }

    const interval = setInterval(() => {
      setCurrent((prev) => prev + 1);
    }, delay);
    return () => clearInterval(interval);
  }, []);

  const progress = useMemo(() => {
    const getPrec = () => {
      if (pdInfoArrived) return 100;
      else if (current >= 0 && current < 3) return 5;
      else if (current >= 3 && current < 10) return 15;
      else if (current >= 10 && current < 25) return 30;
      else if (current >= 25 && current < 35) return 50;
      else if (current >= 35 && current < 40) return 70;
      else if (current >= 40 && current < 50) return 80;
      else if (current >= 50 && current < 60) return 90;
      else if (current >= 60) return 100;
      return 0;
    };
    const prec = getPrec();
    const getSent = () => {
      if (dataType === 'PRODUCT') {
        if (prec === 5) {
          return "Amazon product reviews are scanned";
        } else if (prec === 15) {
          return "Starts analyzing reviews";
        } else if (prec === 30) {
          return "Summary of reviews begins";
        } else if (prec === 50) {
          return "Consumer insights are analyzed";
        } else if (prec === 70) {
          return "Examines positive topics";
        } else if (prec === 80) {
          return "Examines negative topics";
        } else if (prec === 90) {
          return "Provides product improvement recommendations";
        } else if (prec === 100) {
          return "Provides a full report";
        } else {
          return null;
        }
      } else if(dataType === 'ASIN') {
        if(prec < 100) {
          return "Loading a asin";
        } else if (prec === 100) {
          return "Ready to load reviews";
        }
      }
    };
    return {
      prec,
      sent: getSent(),
    };
  }, [current, pdInfoArrived]);
  return (
    <div className="mt-14 flex w-full flex-col items-center gap-4">
      <div className="w-[350px] rounded-full bg-[#2B2939] p-2.5 lg:w-[813px]">
        <div
          className={`${progress.prec === 100 && !pdInfoArrived ? "animate-pulse" : ""
            } rounded-full bg-blue p-0.5 text-center text-xs font-bold leading-none text-white transition-all`}
          style={{
            width: `${progress.prec}%`,
          }}
        >
          {" "}
          {progress.prec}%
        </div>
      </div>
      {progress.sent ? (
        <span className="text-lg font-bold text-white">{progress.sent}</span>
      ) : null}
    </div>
  );
};

const WithLink: React.FC<{ href?: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  if (href) {
    return (
      <Link
        href={href ?? "/"}
        className="rad relative flex h-[170px] w-[75vw] gap-3 sm:w-[407px]"
      >
        {children}
      </Link>
    );
  }
  return (
    <div className="rad relative flex h-[170px] w-[75vw] gap-3 sm:w-[407px]">
      {children}
    </div>
  );
};

export const Report: React.FC<
  Omit<(typeof Examples)[number], "reviews"> & {
    reviews?: number;
    img?: string;
    i?: number;
    href?: string;
    count?: number;
  }
> = (report) => {
  return (
    <WithLink href={report.href}>
      {report.count ? (
        <span className="absolute top-0 left-3 text-lg font-bold text-white">
          X{report.count}
        </span>
      ) : null}
      <img
        className="mt-8 ml-5 h-[80px] w-[80px] rounded-lg object-cover sm:h-[108px] sm:w-[108px]"
        src={report.img.replace("._AC_US60_SCLZZZZZZZ__", "")}
        // src={`https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=US&ASIN=${report.asin}&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=AC_SL500`}
        alt="Report Image"
      />
      <div className="mt-5 flex flex-col gap-1">
        <h1 className="text-sm font-semibold text-white line-clamp-2 sm:text-mlg">
          {report.title}
        </h1>
        <span className="text-sm text-white sm:text-mlg">
          ASIN {report.asin}
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            return (
              <svg
                key={star}
                className={`h-[13px] w-[13px] sm:h-[22px] sm:w-[22px] ${star <= report.stars ? "text-[#FFD37F]" : "text-grayish"
                  }`}
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.0001 1.00003L14.6141 8.22103L22.0001 8.22103L16.1541 13.447L18.7681 20.668L12.0001 16.221L5.23206 20.668L7.84606 13.447L2.00006 8.22103L9.38606 8.22103L12.0001 1.00003Z"
                />
              </svg>
            );
          })}
          <span className="text-sm font-semibold text-white">
            {report.stars} out of 5 stars
          </span>
        </div>
        {report.reviews ? (
          <span className="my-1 mx-3 text-sm font-semibold text-white">
            {report.reviews.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}{" "}
            global ratings
          </span>
        ) : null}
      </div>
    </WithLink>
  );
};

// const VideoDemo: React.FC = () => {
//   return (
//     <div className="my-40 flex h-[340px] w-[70vw] items-center justify-center bg-[#2B2939] lg:w-[598px]">
//       <h1 className="text-3xl font-bold text-white">VIDEO DEMO</h1>
//     </div>
//   );
// };

const CreditsExpired: React.FC<{
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setOpened }) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (closing) {
      setTimeout(() => {
        setOpened(false);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  return (
    <div
      className={`expLin fixed top-2/4 left-2/4 flex -translate-y-2/4 -translate-x-2/4 bg-[#2B2939] ${closing ? "animate-slide-out" : "animate-slide-in"
        } flex-col items-center gap-2`}
    >
      <button
        className="absolute top-3 right-3"
        onClick={() => setClosing(true)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.59094 7L13.0441 2.54687C13.2554 2.3359 13.3743 2.04962 13.3745 1.75099C13.3748 1.45237 13.2564 1.16587 13.0455 0.95453C12.8345 0.743185 12.5482 0.624305 12.2496 0.624041C11.951 0.623778 11.6645 0.742152 11.4531 0.953123L7 5.40625L2.54687 0.953123C2.33553 0.741779 2.04888 0.623047 1.75 0.623047C1.45111 0.623047 1.16447 0.741779 0.953123 0.953123C0.741779 1.16447 0.623047 1.45111 0.623047 1.75C0.623047 2.04888 0.741779 2.33553 0.953123 2.54687L5.40625 7L0.953123 11.4531C0.741779 11.6645 0.623047 11.9511 0.623047 12.25C0.623047 12.5489 0.741779 12.8355 0.953123 13.0469C1.16447 13.2582 1.45111 13.3769 1.75 13.3769C2.04888 13.3769 2.33553 13.2582 2.54687 13.0469L7 8.59375L11.4531 13.0469C11.6645 13.2582 11.9511 13.3769 12.25 13.3769C12.5489 13.3769 12.8355 13.2582 13.0469 13.0469C13.2582 12.8355 13.3769 12.5489 13.3769 12.25C13.3769 11.9511 13.2582 11.6645 13.0469 11.4531L8.59094 7Z"
            fill="black"
          />
        </svg>
      </button>
      <svg
        width="49"
        height="48"
        viewBox="0 0 49 48"
        fill="none"
        className="mt-3"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_454_1784)">
          <path
            d="M23 2.8125L42.5 12.5625V36.9375L23 46.6641L3.5 36.9375V12.5625L23 2.8125ZM37.6484 13.5L23 6.1875L17.3516 9L31.9062 16.3594L37.6484 13.5ZM23 20.8125L28.5781 18.0469L14 10.6875L8.35156 13.5L23 20.8125ZM6.5 15.9375V35.0625L21.5 42.5625V23.4375L6.5 15.9375ZM24.5 42.5625L39.5 35.0625V15.9375L24.5 23.4375V42.5625Z"
            fill="black"
          />
          <g filter="url(#filter0_b_454_1784)">
            <path
              d="M18.7243 33.0085C18.87 33.1419 18.9462 33.2988 18.9528 33.4791C18.9594 33.6595 18.9117 33.8255 18.8097 33.9772C18.7171 34.1225 18.5769 34.2181 18.3891 34.264C18.2106 34.3035 17.9967 34.2509 17.7473 34.106C17.2863 33.8315 16.8382 33.5961 16.4031 33.3998C15.9601 33.2021 15.5152 33.0365 15.0682 32.9031C14.6227 32.7618 14.1523 32.6443 13.6571 32.5506C13.1619 32.457 12.6811 32.3945 12.2148 32.3633C11.7485 32.3321 11.2769 32.3284 10.8002 32.3522C10.3156 32.3745 9.80934 32.4253 9.28141 32.5046C8.9963 32.5483 8.77398 32.5185 8.61442 32.415C8.45636 32.3037 8.36076 32.1635 8.32761 31.9944C8.28809 31.8159 8.30827 31.6447 8.38814 31.4807C8.46016 31.3152 8.58837 31.197 8.77277 31.126C9.63041 30.7671 10.5045 30.558 11.3951 30.4985C12.2793 30.4296 13.1537 30.477 14.0184 30.6405C14.5922 30.7491 15.1564 30.9087 15.7109 31.1194C16.259 31.3208 16.7842 31.5789 17.2864 31.8938C17.798 32.2022 18.2773 32.5738 18.7243 33.0085Z"
              fill="black"
            />
          </g>
          <g filter="url(#filter1_b_454_1784)">
            <path
              d="M17.58 26.9821C17.58 27.4088 17.452 27.7501 17.196 28.0061C16.94 28.2515 16.6093 28.3741 16.204 28.3741C15.8093 28.3741 15.4893 28.2515 15.244 28.0061C14.988 27.7501 14.86 27.4088 14.86 26.9821C14.86 26.5555 14.988 26.2248 15.244 25.9901C15.4893 25.7448 15.8093 25.6221 16.204 25.6221C16.6093 25.6221 16.94 25.7448 17.196 25.9901C17.452 26.2248 17.58 26.5555 17.58 26.9821ZM12.284 26.9821C12.284 27.4088 12.156 27.7501 11.9 28.0061C11.644 28.2515 11.3187 28.3741 10.924 28.3741C10.5187 28.3741 10.1933 28.2515 9.948 28.0061C9.692 27.7501 9.564 27.4088 9.564 26.9821C9.564 26.5555 9.692 26.2248 9.948 25.9901C10.1933 25.7448 10.5187 25.6221 10.924 25.6221C11.3187 25.6221 11.644 25.7448 11.9 25.9901C12.156 26.2248 12.284 26.5555 12.284 26.9821Z"
              fill="black"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_b_454_1784"
            x="4.13452"
            y="25.6279"
            width="19.2251"
            height="12.8292"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="2" />
            <feComposite
              in2="SourceAlpha"
              operator="in"
              result="effect1_backgroundBlur_454_1784"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_backgroundBlur_454_1784"
              result="shape"
            />
          </filter>
          <filter
            id="filter1_b_454_1784"
            x="5.56396"
            y="21.6221"
            width="16.0161"
            height="10.752"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="2" />
            <feComposite
              in2="SourceAlpha"
              operator="in"
              result="effect1_backgroundBlur_454_1784"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_backgroundBlur_454_1784"
              result="shape"
            />
          </filter>
          <clipPath id="clip0_454_1784">
            <rect
              width="48"
              height="48"
              fill="white"
              transform="translate(0.5)"
            />
          </clipPath>
        </defs>
      </svg>
      <h1 className="text-2xl font-bold text-white">Oh No</h1>
      <p className="text-center text-base leading-loose text-white">
        Looks like you ran out of credits. <br /> Upgrade your plan now to see
        more reports
      </p>
      <Link
        href="/subscriptions"
        className="flex items-center justify-center gap-2 rounded-xl bg-blue p-2 text-lg font-bold text-white"
      >
        <svg
          width="19"
          height="16"
          viewBox="0 0 19 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 12L0.5 1L6 6L9.5 0L13 6L18.5 1L16.5 12H2.5ZM16.5 15C16.5 15.6 16.1 16 15.5 16H3.5C2.9 16 2.5 15.6 2.5 15V14H16.5V15Z"
            fill="white"
          />
        </svg>
        Upgrade your Plan
      </Link>
    </div>
  );
};

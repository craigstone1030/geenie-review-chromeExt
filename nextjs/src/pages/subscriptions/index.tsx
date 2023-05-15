/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Subscription } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import { type Stripe, loadStripe } from "@stripe/stripe-js";
import { toast } from "react-hot-toast";
import { Pros, Spinner } from "~/components";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

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

const Subscriptions: NextPage = () => {
  const subs = api.subscriptions.getAll.useQuery();
  const stripeClient = useStripeClient();
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Reviewsify - Subscriptions</title>
      </Head>
      <main className="mt-3 flex flex-col items-center gap-2">
        <h1 className="my-8 text-3xl font-bold text-white">
          Choose a subscription plan
        </h1>
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {subs.isLoading
            ? new Array(3).fill(null).map((_, i) => {
                return <Skeleton i={i} key={i} />;
              })
            : subs.data?.map((sub, i) => {
                return (
                  <Subscription
                    session={session as unknown as Session}
                    stripeClient={stripeClient}
                    key={sub.id}
                    i={i}
                    {...sub}
                  />
                );
              })}
        </ul>
        <Pros />
      </main>
    </>
  );
};

export default Subscriptions;

const Subscription: React.FC<
  { i: number; stripeClient: Stripe | null; session: Session } & Subscription
> = ({
  i,
  isPopular,
  description,
  title,
  price,
  stripeClient,
  id,
  session,
}) => {
  const createPayment = api.subscriptions.createPayment.useMutation({
    onError: (err) => toast.error(err.message),
    onSuccess:
      title === "Enterprise"
        ? () => toast.success("Request submitted")
        : undefined,
  });
  const onButtonClick = useCallback(async () => {
    const sessionId = await createPayment.mutateAsync({
      sub: id,
    });
    if (!sessionId) {
      // todo: handle
      throw new Error("No session id");
    }
    // if (sessionId === null) {
    //   props.setDisplayModal(true);
    //   return;
    // }
    stripeClient?.redirectToCheckout({
      sessionId,
    });
  }, [stripeClient, id, createPayment]);
  return (
    <div
      className={`shadowStuff relative ${
        i === 1 ? "h-[650px]" : "h-[623px]"
      } flex w-[319px] flex-col items-center gap-4 rounded-[16px] bg-gray-300 text-center`}
    >
      {isPopular ? <MostPopular /> : null}
      <div
        style={{
          borderRadius: "16px 16px 0px 0px",
          background:
            i === 1
              ? "linear-gradient(180deg, #F0F43C -51.96%, #FA7B47 99.73%)"
              : undefined,
        }}
        className="flex h-[90px] w-full items-center justify-center bg-[#F9A400] text-center text-3xl font-bold text-white"
      >
        <span className="mt-4">{title}</span>
      </div>
      {title === "Enterprise" ? (
        <span className="mx-2 mt-auto text-[16px] leading-[32px] text-blackish">
          {description}
        </span>
      ) : price || title === "Free" ? (
        <>
          {" "}
          <span className="mt-2 flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-[#333333]">
              ${price ?? 0}
            </span>
            <span className="text-lg font-semibold text-[#969696]">/ mo</span>
          </span>
          <div className={`${i === 1 ? "mt-[80px]" : "mt-24"} w-full`}>
            <div className="h-[1px] w-full rounded-lg bg-[#81818180] opacity-50" />
            {description.split(" || ").map((desc, i) => {
              return (
                <div className="flex flex-col items-center gap-1" key={i}>
                  <div className="h-[1px] w-full rounded-lg bg-[#81818180] opacity-50" />
                  <span className="mx-2 text-[16px] leading-[32px] text-blackish">
                    {desc}
                  </span>
                  <div className="h-[1px] w-full rounded-lg bg-[#81818180] opacity-50" />
                </div>
              );
            })}
          </div>
        </>
      ) : null}
      <button
        disabled={
          title === "Free" ||
          session.user.subscriptionId === id ||
          (title === "Enterprise" && session.user.sentEnterprise)
        }
        onClick={() => {
          void onButtonClick().catch(console.error);
        }}
        className={`mt-auto mb-3 rounded-lg ${
          title === "Free" ||
          session.user.subscriptionId === id ||
          (title === "Enterprise" && session.user.sentEnterprise)
            ? "bg-[#C5C5C5]"
            : "bg-[#FFA41C]"
        } ${
          title === "Pro"
            ? createPayment.isLoading
              ? "px-5 text-sm"
              : "px-3 text-lg"
            : "px-8 text-lg"
        } flex h-[50px] items-center justify-center gap-1  font-bold text-white`}
      >
        {title === "Enterprise"
          ? session.user.sentEnterprise
            ? "Applied"
            : "Contact Sales"
          : title === "Free"
          ? "Start for free"
          : session.user.subscriptionId === id
          ? "Current one"
          : "Upgrade Now"}{" "}
        {createPayment.isLoading ? <Spinner sm /> : null}
      </button>
    </div>
  );
};

const Skeleton: React.FC<{ i: number }> = ({ i }) => {
  return (
    <li
      className={`shadowStuff relative ${
        i === 1 ? "h-[650px]" : "h-[623px]"
      } flex w-[319px] flex-col items-center gap-4 rounded-[16px] bg-white text-center`}
    >
      <div
        style={{
          borderRadius: "16px 16px 0px 0px",
          background:
            i === 1
              ? "linear-gradient(180deg, #F0F43C -51.96%, #FA7B47 99.73%)"
              : undefined,
        }}
        className="flex h-[90px] w-full items-center justify-center bg-[#F9A400] text-center text-3xl font-bold text-white"
      >
        <span className="h-6 w-56 animate-pulse rounded-lg bg-gray-200" />
      </div>
      <ul className="my-auto flex flex-col items-center justify-center gap-2">
        {new Array(8).fill(null).map((_, i) => {
          return (
            <li
              key={i}
              className="h-6 w-56 animate-pulse rounded-lg bg-gray-200"
            />
          );
        })}
      </ul>
    </li>
  );
};

const MostPopular: React.FC = () => {
  return (
    <div className="absolute left-2/4 top-0 -translate-x-2/4">
      <svg
        width="138"
        height="37"
        viewBox="0 0 138 37"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_373_1854)">
          <rect
            x="4"
            y="-19"
            width="130"
            height="48"
            rx="16"
            fill="#FA7B47"
            shapeRendering="crispEdges"
          />
          <path
            d="M15.6603 18V6.8H17.3723L22.2683 14.976H21.3723L26.1883 6.8H27.9003L27.9163 18H25.9483L25.9323 9.888H26.3483L22.2523 16.72H21.3243L17.1643 9.888H17.6443V18H15.6603ZM34.5895 18.112C33.7148 18.112 32.9362 17.9253 32.2535 17.552C31.5708 17.168 31.0322 16.6453 30.6375 15.984C30.2428 15.3227 30.0455 14.5707 30.0455 13.728C30.0455 12.8747 30.2428 12.1227 30.6375 11.472C31.0322 10.8107 31.5708 10.2933 32.2535 9.92C32.9362 9.54667 33.7148 9.36 34.5895 9.36C35.4748 9.36 36.2588 9.54667 36.9415 9.92C37.6348 10.2933 38.1735 10.8053 38.5575 11.456C38.9522 12.1067 39.1495 12.864 39.1495 13.728C39.1495 14.5707 38.9522 15.3227 38.5575 15.984C38.1735 16.6453 37.6348 17.168 36.9415 17.552C36.2588 17.9253 35.4748 18.112 34.5895 18.112ZM34.5895 16.4C35.0802 16.4 35.5175 16.2933 35.9015 16.08C36.2855 15.8667 36.5842 15.5573 36.7975 15.152C37.0215 14.7467 37.1335 14.272 37.1335 13.728C37.1335 13.1733 37.0215 12.6987 36.7975 12.304C36.5842 11.8987 36.2855 11.5893 35.9015 11.376C35.5175 11.1627 35.0855 11.056 34.6055 11.056C34.1148 11.056 33.6775 11.1627 33.2935 11.376C32.9202 11.5893 32.6215 11.8987 32.3975 12.304C32.1735 12.6987 32.0615 13.1733 32.0615 13.728C32.0615 14.272 32.1735 14.7467 32.3975 15.152C32.6215 15.5573 32.9202 15.8667 33.2935 16.08C33.6775 16.2933 34.1095 16.4 34.5895 16.4ZM43.702 18.112C42.9873 18.112 42.2993 18.0213 41.638 17.84C40.9873 17.648 40.47 17.4187 40.086 17.152L40.854 15.632C41.238 15.8773 41.6967 16.08 42.23 16.24C42.7633 16.4 43.2967 16.48 43.83 16.48C44.4593 16.48 44.9127 16.3947 45.19 16.224C45.478 16.0533 45.622 15.824 45.622 15.536C45.622 15.3013 45.526 15.1253 45.334 15.008C45.142 14.88 44.8913 14.784 44.582 14.72C44.2727 14.656 43.926 14.5973 43.542 14.544C43.1687 14.4907 42.79 14.4213 42.406 14.336C42.0327 14.24 41.6913 14.1067 41.382 13.936C41.0727 13.7547 40.822 13.5147 40.63 13.216C40.438 12.9173 40.342 12.5227 40.342 12.032C40.342 11.488 40.4967 11.0187 40.806 10.624C41.1153 10.2187 41.5473 9.90933 42.102 9.696C42.6673 9.472 43.334 9.36 44.102 9.36C44.678 9.36 45.2593 9.424 45.846 9.552C46.4327 9.68 46.918 9.86133 47.302 10.096L46.534 11.616C46.1287 11.3707 45.718 11.2053 45.302 11.12C44.8967 11.024 44.4913 10.976 44.086 10.976C43.478 10.976 43.0247 11.0667 42.726 11.248C42.438 11.4293 42.294 11.6587 42.294 11.936C42.294 12.192 42.39 12.384 42.582 12.512C42.774 12.64 43.0247 12.7413 43.334 12.816C43.6433 12.8907 43.9847 12.9547 44.358 13.008C44.742 13.0507 45.1207 13.12 45.494 13.216C45.8673 13.312 46.2087 13.4453 46.518 13.616C46.838 13.776 47.094 14.0053 47.286 14.304C47.478 14.6027 47.574 14.992 47.574 15.472C47.574 16.0053 47.414 16.4693 47.094 16.864C46.7847 17.2587 46.342 17.568 45.766 17.792C45.19 18.0053 44.502 18.112 43.702 18.112ZM52.5124 18.112C51.5737 18.112 50.8484 17.872 50.3364 17.392C49.8244 16.9013 49.5684 16.1813 49.5684 15.232V7.568H51.5684V15.184C51.5684 15.5893 51.6697 15.904 51.8724 16.128C52.0857 16.352 52.379 16.464 52.7524 16.464C53.2004 16.464 53.5737 16.3467 53.8724 16.112L54.4324 17.536C54.1977 17.728 53.9097 17.872 53.5684 17.968C53.227 18.064 52.875 18.112 52.5124 18.112ZM48.1604 11.12V9.52H53.8564V11.12H48.1604ZM60.6915 18V6.8H65.2995C66.2915 6.8 67.1395 6.96 67.8435 7.28C68.5582 7.6 69.1075 8.05867 69.4915 8.656C69.8755 9.25333 70.0675 9.96267 70.0675 10.784C70.0675 11.6053 69.8755 12.3147 69.4915 12.912C69.1075 13.5093 68.5582 13.968 67.8435 14.288C67.1395 14.608 66.2915 14.768 65.2995 14.768H61.8435L62.7715 13.792V18H60.6915ZM62.7715 14.016L61.8435 13.008H65.2035C66.1208 13.008 66.8088 12.816 67.2675 12.432C67.7368 12.0373 67.9715 11.488 67.9715 10.784C67.9715 10.0693 67.7368 9.52 67.2675 9.136C66.8088 8.752 66.1208 8.56 65.2035 8.56H61.8435L62.7715 7.536V14.016ZM75.7614 18.112C74.8867 18.112 74.108 17.9253 73.4254 17.552C72.7427 17.168 72.204 16.6453 71.8094 15.984C71.4147 15.3227 71.2174 14.5707 71.2174 13.728C71.2174 12.8747 71.4147 12.1227 71.8094 11.472C72.204 10.8107 72.7427 10.2933 73.4254 9.92C74.108 9.54667 74.8867 9.36 75.7614 9.36C76.6467 9.36 77.4307 9.54667 78.1134 9.92C78.8067 10.2933 79.3454 10.8053 79.7294 11.456C80.124 12.1067 80.3214 12.864 80.3214 13.728C80.3214 14.5707 80.124 15.3227 79.7294 15.984C79.3454 16.6453 78.8067 17.168 78.1134 17.552C77.4307 17.9253 76.6467 18.112 75.7614 18.112ZM75.7614 16.4C76.252 16.4 76.6894 16.2933 77.0734 16.08C77.4574 15.8667 77.756 15.5573 77.9694 15.152C78.1934 14.7467 78.3054 14.272 78.3054 13.728C78.3054 13.1733 78.1934 12.6987 77.9694 12.304C77.756 11.8987 77.4574 11.5893 77.0734 11.376C76.6894 11.1627 76.2574 11.056 75.7774 11.056C75.2867 11.056 74.8494 11.1627 74.4654 11.376C74.092 11.5893 73.7934 11.8987 73.5694 12.304C73.3454 12.6987 73.2334 13.1733 73.2334 13.728C73.2334 14.272 73.3454 14.7467 73.5694 15.152C73.7934 15.5573 74.092 15.8667 74.4654 16.08C74.8494 16.2933 75.2814 16.4 75.7614 16.4ZM86.9699 18.112C86.2765 18.112 85.6419 17.952 85.0659 17.632C84.5005 17.312 84.0472 16.832 83.7059 16.192C83.3752 15.5413 83.2099 14.72 83.2099 13.728C83.2099 12.7253 83.3699 11.904 83.6899 11.264C84.0205 10.624 84.4685 10.1493 85.0339 9.84C85.5992 9.52 86.2445 9.36 86.9699 9.36C87.8125 9.36 88.5539 9.54133 89.1939 9.904C89.8445 10.2667 90.3565 10.7733 90.7299 11.424C91.1139 12.0747 91.3059 12.8427 91.3059 13.728C91.3059 14.6133 91.1139 15.3867 90.7299 16.048C90.3565 16.6987 89.8445 17.2053 89.1939 17.568C88.5539 17.9307 87.8125 18.112 86.9699 18.112ZM82.2339 21.104V9.456H84.1379V11.472L84.0739 13.744L84.2339 16.016V21.104H82.2339ZM86.7459 16.4C87.2259 16.4 87.6525 16.2933 88.0259 16.08C88.4099 15.8667 88.7139 15.5573 88.9379 15.152C89.1619 14.7467 89.2739 14.272 89.2739 13.728C89.2739 13.1733 89.1619 12.6987 88.9379 12.304C88.7139 11.8987 88.4099 11.5893 88.0259 11.376C87.6525 11.1627 87.2259 11.056 86.7459 11.056C86.2659 11.056 85.8339 11.1627 85.4499 11.376C85.0659 11.5893 84.7619 11.8987 84.5379 12.304C84.3139 12.6987 84.2019 13.1733 84.2019 13.728C84.2019 14.272 84.3139 14.7467 84.5379 15.152C84.7619 15.5573 85.0659 15.8667 85.4499 16.08C85.8339 16.2933 86.2659 16.4 86.7459 16.4ZM96.8186 18.112C96.0933 18.112 95.4533 17.9787 94.8986 17.712C94.344 17.4347 93.912 17.0187 93.6026 16.464C93.2933 15.8987 93.1386 15.1893 93.1386 14.336V9.456H95.1386V14.064C95.1386 14.832 95.3093 15.408 95.6506 15.792C96.0026 16.1653 96.4986 16.352 97.1386 16.352C97.608 16.352 98.0133 16.256 98.3546 16.064C98.7066 15.872 98.9786 15.584 99.1706 15.2C99.3733 14.816 99.4746 14.3413 99.4746 13.776V9.456H101.475V18H99.5706V15.696L99.9066 16.4C99.6186 16.9547 99.1973 17.3813 98.6426 17.68C98.088 17.968 97.48 18.112 96.8186 18.112ZM104.093 18V6.128H106.093V18H104.093ZM113.982 18V16.272L113.87 15.904V12.88C113.87 12.2933 113.694 11.84 113.342 11.52C112.99 11.1893 112.457 11.024 111.742 11.024C111.262 11.024 110.788 11.0987 110.318 11.248C109.86 11.3973 109.47 11.6053 109.15 11.872L108.366 10.416C108.825 10.064 109.369 9.80267 109.998 9.632C110.638 9.45067 111.3 9.36 111.982 9.36C113.22 9.36 114.174 9.65867 114.846 10.256C115.529 10.8427 115.87 11.7547 115.87 12.992V18H113.982ZM111.294 18.112C110.654 18.112 110.094 18.0053 109.614 17.792C109.134 17.568 108.761 17.264 108.494 16.88C108.238 16.4853 108.11 16.0427 108.11 15.552C108.11 15.072 108.222 14.64 108.446 14.256C108.681 13.872 109.06 13.568 109.582 13.344C110.105 13.12 110.798 13.008 111.662 13.008H114.142V14.336H111.806C111.124 14.336 110.665 14.448 110.43 14.672C110.196 14.8853 110.078 15.152 110.078 15.472C110.078 15.8347 110.222 16.1227 110.51 16.336C110.798 16.5493 111.198 16.656 111.71 16.656C112.201 16.656 112.638 16.544 113.022 16.32C113.417 16.096 113.7 15.7653 113.87 15.328L114.206 16.528C114.014 17.0293 113.668 17.4187 113.166 17.696C112.676 17.9733 112.052 18.112 111.294 18.112ZM118.437 18V9.456H120.341V11.808L120.117 11.12C120.373 10.544 120.773 10.1067 121.317 9.808C121.872 9.50933 122.56 9.36 123.381 9.36V11.264C123.296 11.2427 123.216 11.232 123.141 11.232C123.066 11.2213 122.992 11.216 122.917 11.216C122.16 11.216 121.557 11.44 121.109 11.888C120.661 12.3253 120.437 12.9813 120.437 13.856V18H118.437Z"
            fill="black"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_373_1854"
            x="0"
            y="-19"
            width="138"
            height="56"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_373_1854"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_373_1854"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

const useStripeClient = () => {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    void loadStripe(process.env["NEXT_PUBLIC_STRIPE_PUBLIC_KEY"] as string)
      .then(setStripe)
      .catch(console.error);
  }, []);

  return stripe;
};

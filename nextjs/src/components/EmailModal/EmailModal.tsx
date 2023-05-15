/* eslint-disable @next/next/no-img-element */
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const EmailModal: React.FC<{
  setEmailModal: React.Dispatch<React.SetStateAction<boolean | "simple">>;
  isSimple?: boolean;
}> = ({ setEmailModal, isSimple }) => {
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (closing) {
      const timer = setTimeout(() => {
        setClosing(false);
        setEmailModal(false);
      }, 250);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  return (
    <>
      <button
        className="fixed top-0 left-0 z-[9998] h-full w-full cursor-default bg-black bg-opacity-50"
        onClick={() => setClosing(true)}
      />
      <div
        className={`rounded-xl bg-[#FFFFFF] ${
          closing ? "animate-slide-out" : "animate-slide-in"
        } fixed top-2/4 left-2/4 z-[9999] flex h-[346px] w-[807px] max-w-4xl	 -translate-y-2/4 -translate-x-2/4 items-center justify-between p-3`}
      >
        <button
          onClick={() => setClosing(true)}
          className="absolute right-3 top-3"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="#0F1111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="#0F1111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="mt-5 ml-6 flex-col items-center gap-2 self-start">
          <div className="flex items-center gap-2">
            <h1 className="  text-3xl font-bold text-[#0F1111]">
              {isSimple ? "Hey there" : "Ready to see your results?"}
            </h1>
          </div>
          <p className="text-lg font-normal leading-[37px] text-[#000000]">
            Login using your gmail to get a free analysis <br />
          </p>
          <button
            onClick={() => void signIn("google", { callbackUrl: "/" })}
            className=" my-4 mt-5 flex items-center  gap-2 self-start rounded-lg bg-[#2B2939] p-3 text-lg font-bold text-white"
          >
            <img
              alt="Google Logo"
              src="https://raw.githubusercontent.com/nextauthjs/next-auth/main/docs/static/img/providers/google.svg"
              className="h-6 w-6 object-cover"
            />
            Login using Google
          </button>
          <p className="pt-5 text-sm font-normal leading-tight text-[#000000]">
            We use Google to authenticate you and <br />
            {"we'll"} never share your data with anyone else.
          </p>
        </div>
        <Image
          alt="graphs"
          className="mx-auto pl-3 drop-shadow-2xl"
          src="/graphs.png"
          width={350}
          height={350}
        />
      </div>
    </>
  );
};

export default EmailModal;
